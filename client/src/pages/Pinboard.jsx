import { DockviewReact, themeLight } from 'dockview-react';
import { useCallback, useRef, useState, useMemo } from 'react';
import 'dockview-react/dist/styles/dockview.css';
import '../App.css';
import XButton from '../components/XButton';

function ExampleComponent() {

    return (
        <div className="p-4">
            Hello World
        </div>
    )
}

const components = {
    basic: ExampleComponent
}

const TOP_SNAP_ZONE_PX = 32;
const GRID_SIZE = 20;
const MAX_PANELS = 8;
const snap = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const LAYOUT_STORAGE_KEY = 'pinboard_dockview_layout';
const MINIMIZED_STORAGE_KEY = 'pinboard_minimized_meta';

function Pinboard() {
    const containerRef = useRef(null);
    const apiRef = useRef(null);
    const draggedPanelRef = useRef(null);
    const [minimizedWindows, setMinimizedWindows] = useState([]);

    const updateMinimizedWindows = useCallback((updater) => {
        setMinimizedWindows((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            const meta = next.map(({ groupId, wasDocked }) => ({
                groupId,
                wasDocked,
            }));
            localStorage.setItem(MINIMIZED_STORAGE_KEY, JSON.stringify(meta));
            return next;
        });
    }, []);

    const WindowControls = useMemo(() => {
        return function Controls({ api }) {
            const closeWindow = (e) => {
                e.stopPropagation();
                api.close();
            };

            const minimizeWindow = (e) => {
                e.stopPropagation();

                const dockApi = apiRef.current;
                if (!dockApi) return;

                const group = dockApi.getGroup(api.id);
                if (!group) return;

                const wasDocked = api.location.type === 'grid';
                if (wasDocked) {
                    dockApi.addFloatingGroup(group, {
                        position: { left: 40, top: 40 },
                        width: 320,
                        height: 300,
                    });
                }

                const floatingWrapper = group.element.closest('.dv-resize-container') || group.element;
                floatingWrapper.style.display = 'none';

                updateMinimizedWindows((prev) => [
                    ...prev,
                    {
                        groupId: group.id,
                        group,
                        title: group.activePanel?.title || 'Window',
                        wasDocked,
                    },
                ]);
            };

            return (
                <div className="flex flex-row gap-x-2 items-center pl-2 pr-2 text-lg h-full">
                    <button
                        type="button"
                        onClick={minimizeWindow}
                        title="Minimize Window"
                        className="px-1.5 hover:bg-gray-200 rounded leading-none select-none"
                    >
                        -
                    </button>
                    <XButton tag="Close Window" onClick={closeWindow} />
                </div>
            )
        }
    }, [updateMinimizedWindows]);

    const onReady = useCallback((event) => {
        const api = event.api;
        apiRef.current = api;

        const rawLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);

        if (rawLayout) {
            try {
                api.fromJSON(JSON.parse(rawLayout));

                const rawMin = localStorage.getItem(MINIMIZED_STORAGE_KEY);
                if (rawMin) {
                    const minMeta = JSON.parse(rawMin);
                    requestAnimationFrame(() => {
                        const rehydratedMinimized = [];

                        minMeta.forEach(({ groupId, wasDocked }) => {
                            const group = api.groups.find((g) => g.id === groupId);
                            if (group) {
                                const floatingWrapper =
                                    group.element.closest('.dv-resize-container') || group.element;
                                floatingWrapper.style.display = 'none';

                                rehydratedMinimized.push({
                                    groupId: group.id,
                                    group,
                                    title: group.activePanel?.title || 'Window',
                                    wasDocked,
                                });
                            }
                        });

                        setMinimizedWindows(rehydratedMinimized);
                    });
                }
            } catch (err) {
                console.warn('Invalid saved layout, falling back to defaults:', err);
                localStorage.removeItem(LAYOUT_STORAGE_KEY);
                localStorage.removeItem(MINIMIZED_STORAGE_KEY);
            }
        }

        api.onWillShowOverlay((overlayEvent) => {
            const rect = containerRef.current?.getBoundingClientRect();
            const pointerY = overlayEvent.nativeEvent.clientY - (rect?.top ?? 0);
            const isAtTopEdge = pointerY <= TOP_SNAP_ZONE_PX;

            const targetGroup = overlayEvent.group;
            const isFloatingTarget = targetGroup?.api.location.type === 'floating';
            const isGridTarget = !targetGroup || targetGroup.api.location.type === 'grid';

            if (isAtTopEdge && isGridTarget) {
                if (!targetGroup || overlayEvent.position === 'center') {
                    return;
                }
            }

            if (isFloatingTarget && overlayEvent.position === 'center') {
                return;
            }

            overlayEvent.preventDefault();
        });

        api.onWillDragPanel((dragEvent) => {
            draggedPanelRef.current = dragEvent.panel;
        });

        api.onWillDrop(() => {
            draggedPanelRef.current = null;
        });

        api.onDidMovePanel(() => {
            draggedPanelRef.current = null;
        });

        api.onDidLayoutChange(() => {
            try {
                const serialized = api.toJSON();
                localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(serialized));
            } catch (err) {
                console.error('Failed to save Dockview layout:', err);
            }
        })
    }, [updateMinimizedWindows]);

    const handleDragEnd = (e) => {

        setTimeout(() => {
            const panel = draggedPanelRef.current;
            draggedPanelRef.current = null;

            if (!panel || !apiRef.current || (e.clientX === 0 && e.clientY === 0)) {
                return;
            }

            const rect = containerRef.current?.getBoundingClientRect();
            const left = snap(Math.max(0, e.clientX - (rect?.left ?? 0) - 16));
            const top = snap(Math.max(0, e.clientY - (rect?.top ?? 0) - 16));

            const isFromGrid = panel.group?.api.location.type === 'grid';
            const isFromMultiTab = (panel.group?.panels.length ?? 0) > 1;

            if (isFromGrid || isFromMultiTab) {
                apiRef.current.addFloatingGroup(panel, {
                    position: { left, top },
                    width: snap(320),
                    height: snap(300),
                });
            } else if (panel.group?.api.location.type === 'floating') {
                apiRef.current.addFloatingGroup(panel, {
                    position: { left, top },
                    width: snap(panel.group.width),
                    height: snap(panel.group.height),
                });
            }
        }, 0);
    };

    const handleDragCancel = () => {
        draggedPanelRef.current = null;
    };

    const handleMinimizeRestore = useCallback((item) => {
        const dockApi = apiRef.current;
        const { group, wasDocked } = item;
        if (!dockApi || !group) return;

        const floatingWrapper = group.element.closest('.dv-resize-container') || group.element;
        floatingWrapper.style.display = '';

        if (wasDocked) {
            const existingDockedGroup = dockApi.groups.find(
                (g) => g.api.location.type === 'grid'
            );

            if (!existingDockedGroup) {
                group.api.moveTo({ position: 'center' });
            }
        }

        updateMinimizedWindows((prev) =>
            prev.filter((win) => win.groupId !== item.groupId)
        );

        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(dockApi.toJSON()));
    }, [updateMinimizedWindows]);

    const handleCloseMinimized = useCallback((win, e) => {
        e.stopPropagation();
        win.group.api.close();
        updateMinimizedWindows((prev) =>
            prev.filter((item) => item.groupId !== win.groupId)
        );
    }, [updateMinimizedWindows]);

    const handleAddPanel = useCallback(() => {
        const api = apiRef.current;
    if (!api || api.panels.length >= MAX_PANELS) return;

        const id = `panel-${Date.now()}`;

        api.addPanel({
            id,
            component: 'basic',
            title: `Panel ${api.panels.length + 1}`,
            floating: {
                position: { left: 60, top: 60 },
                width: 320,
                height: 300,
            },
        });
    }, []);

    return (
        <div
            ref={containerRef}
            onPointerUpCapture={handleDragEnd}
            onPointerCancel={handleDragCancel}
            className="h-full w-full p-2 relative z-0 flex flex-col"
        >
            <div className="z-0 w-full h-full relative">
                <DockviewReact
                    theme={themeLight}
                    onReady={onReady}
                    components={components}
                    floatingGroupDragHandle="tabbar"
                    disableTabsOverflowList={true}
                    dndStrategy="pointer"
                    floatingGroupBounds="boundedWithinViewport"
                    transformFloatingGroupDrag={({ proposed }) => ({
                        top: snap(proposed.top),
                        left: snap(proposed.left),
                    })}
                    rightHeaderActionsComponent={WindowControls}
                />
            </div>
            <button
                type="button"
                onClick={handleAddPanel}
                title="Add New Panel"
                style={{ zIndex: 9999 }}
                className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-slate-600 hover:bg-slate-500 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all cursor-pointer"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
            </button>
            {minimizedWindows.length > 0 && (
                <div className=" absolute bottom-0 left-24 right-4 h-10 shrink-0 flex flex-row items-center pt-2 -space-x-2">
                    {minimizedWindows.map((win) => (
                        <div
                            key={win.groupId}
                            className="pointer-events-auto min-w-0 filter drop-shadow-[0_-1px_2px_rgba(0,0,0,0.12)] transition-transform hover:scale-110 hover:z-10"
                        >
                            <div
                                onClick={() => handleMinimizeRestore(win)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') handleMinimizeRestore(win);
                                }}
                                style={{
                                    clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 100%, 0% 100%)',
                                }}
                                className="bg-slate-300 pt-[1px] px-[1px] cursor-pointer select-none"
                            >
                                <div
                                    style={{
                                        clipPath: 'polygon(9.5px 0%, calc(100% - 9.5px) 0%, 100% 100%, 0% 100%)',
                                    }}
                                    className="group flex items-center gap-3 px-5 py-1.5 text-xs font-medium bg-gray-100 hover:bg-white text-gray-700 transition-colors"
                                >
                                    <span className="truncate max-w-[140px]">{win.title}</span>

                                    <XButton
                                        tag="Close Window"
                                        onClick={(e) => handleCloseMinimized(win, e)}
                                        className="hover:!bg-slate-100"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Pinboard;