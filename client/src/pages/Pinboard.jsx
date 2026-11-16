import { DockviewReact, themeLight, themeNordSpaced } from 'dockview-react';
import { useCallback, useRef } from 'react';
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

function WindowControls({ api }) {

    const closeWindow = (e) => {
        e.stopPropagation();
        api.close();
    }

    return (
        <div className="flex flex-row gap-x-2 items-center pl-2 pr-2 text-lg h-full">
            <button>-</button>
            <XButton tag="Close Window" onClick={closeWindow} />
        </div>
    )
}

const components = {
    basic: ExampleComponent
}

const TOP_SNAP_ZONE_PX = 32;
const GRID_SIZE = 20;
const snap = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

function Pinboard() {
    const containerRef = useRef(null);
    const apiRef = useRef(null);
    const draggedPanelRef = useRef(null);

    const onReady = useCallback((event) => {
        const api = event.api;
        apiRef.current = api;

        api.addPanel({
            id: "a-1",
            component: "basic",
            title: "Basic",
            floating: { position: { left: 40, top: 40 }, width: 320, height: 300 },
        });

        api.addPanel({
            id: "a-2",
            component: "basic",
            title: "Basic 2",
            floating: { position: { left: 380, top: 40 }, width: 320, height: 300 },
        });

        api.addPanel({
            id: "a-3",
            component: "basic",
            title: "Basic 3",
            floating: { position: { left: 720, top: 40 }, width: 320, height: 300 },
        });

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
    }, []);

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

    return (
        <div
            ref={containerRef}
            onPointerUpCapture={handleDragEnd}
            onPointerCancel={handleDragCancel}
            className="h-full w-full p-2 relative z-0"
        >
            <DockviewReact
                theme={themeLight}
                onReady={onReady}
                components={components}
                floatingGroupDragHandle="tabbar"
                disableTabsOverflowList={true}
                dndStrategy="pointer"
                floatingGroupBounds="boundedWithinViewport" transformFloatingGroupDrag={({ proposed }) => ({
                    top: snap(proposed.top),
                    left: snap(proposed.left),
                })}
                rightHeaderActionsComponent={WindowControls}
            />
        </div>
    )
}

export default Pinboard;