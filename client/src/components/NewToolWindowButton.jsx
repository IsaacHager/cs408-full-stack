import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { PANEL_TYPES } from '../structures/panelRegistry';

const EDITABLE_TYPES = ['txt', 'md'];

function NewToolWindowButton({ handleAddPanel, draft }) {
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const [drafts, setDrafts] = useState([]);
    const [selectedDraftId, setSelectedDraftId] = useState(draft?._id || '');

    useEffect(() => {
        if (draft?._id) setSelectedDraftId(draft._id);
    }, [draft]);

    useEffect(() => {
        if (!open || draft || !user?.id) return;

        fetch(`/api/draft?userId=${user.id}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((resData) => {
                const list = Array.isArray(resData) ? resData : resData.data || [];
                setDrafts(list);
                if (list.length && !selectedDraftId) {
                    setSelectedDraftId(list[0]._id);
                }
            })
            .catch((err) => console.error('Failed to load drafts:', err));
    }, [open, draft, user?.id, selectedDraftId]);

    const activeDraft = draft || drafts.find((d) => d._id === selectedDraftId);

    const launch = (component, params, title) => {
        handleAddPanel(component, params, title);
        setOpen(false);
    };

    const openFile = (file, mode = 'preview') => {
        const ext = file.fileName.split('.').pop().toLowerCase();
        const isEdit = mode === 'edit';

        launch(
            isEdit ? PANEL_TYPES.EDITOR : PANEL_TYPES.FILE,
            {
                draftId: activeDraft._id,
                fileId: file.fileId,
                fileUrl: `/api/draft/${activeDraft._id}/files/${file.fileId}`,
                fileType: ext,
                fileName: file.fileName,
                startEditing: isEdit,
            },
            `${isEdit ? 'Edit' : 'Preview'}: ${file.fileName}`
        );
    };

    return (
        <>
            {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}

            <div className="z-20 absolute bottom-4 left-4 flex flex-col items-start gap-2">
                {open && (
                    <div className="w-72 bg-slate-800 text-slate-100 rounded-xl shadow-xl border border-slate-700 p-3 space-y-3 text-sm">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                Tools
                            </p>
                            <button
                                type="button"
                                onClick={() => launch(PANEL_TYPES.CALCULATOR, {}, 'Calculator')}
                                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-700 transition-colors"
                            >
                                Calculator
                            </button>
                        </div>

                        <div className="border-t border-slate-700 pt-2.5 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Draft
                                </span>
                                {!draft && (
                                    <select
                                        value={selectedDraftId}
                                        onChange={(e) => setSelectedDraftId(e.target.value)}
                                        className="bg-slate-700 text-xs px-2 py-1 max-w-[175px] truncate focus:outline-none"
                                    >
                                        {drafts.map((d) => (
                                            <option key={d._id} value={d._id}>
                                                {d.title || d.name || 'Untitled Draft'}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {activeDraft ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            launch(
                                                PANEL_TYPES.TODO,
                                                { draftId: activeDraft._id },
                                                `Todo: ${activeDraft.title || activeDraft.name || 'Draft'}`
                                            )
                                        }
                                        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-700 transition-colors"
                                    >
                                        Todo List
                                    </button>

                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {activeDraft.files?.length > 0 ? (
                                            activeDraft.files.map((file) => {
                                                const ext = file.fileName.split('.').pop().toLowerCase();
                                                const isEditable = EDITABLE_TYPES.includes(ext);

                                                return (
                                                    <div
                                                        key={file.fileId}
                                                        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 hover:bg-slate-700/60 transition-colors"
                                                    >
                                                        <span
                                                            onClick={() => openFile(file, 'preview')}
                                                            title={file.fileName}
                                                            className="truncate cursor-pointer flex-1"
                                                        >
                                                            {file.fileName}
                                                        </span>

                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => openFile(file, 'preview')}
                                                                className="text-[10px] px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                                                            >
                                                                Preview
                                                            </button>
                                                            {isEditable && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openFile(file, 'edit')}
                                                                    className="text-[10px] px-1.5 py-0.5 bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                                                                >
                                                                    Edit
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-slate-400 px-2.5 py-1">
                                                No files in this draft
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-xs text-slate-400 px-1">No drafts found</p>
                            )}
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    title="Add New Panel"
                    className="w-12 h-12 rounded-full bg-slate-600 hover:bg-slate-500 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all cursor-pointer"
                >
                    <svg
                        className={`w-6 h-6 transition-transform ${open ? 'rotate-45' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </>
    );
}

export default NewToolWindowButton;
