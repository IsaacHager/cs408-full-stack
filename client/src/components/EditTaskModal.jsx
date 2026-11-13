import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

export default function EditTaskModal({ task, draftId, parentId, isOpen, onClose }) {
    const { user } = useUser();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [taskName, setTaskName] = useState(task?.task || '');
    const [timeMinutes, setTimeMinutes] = useState(task?.timeMinutes || 0);
    const [isCompleted, setIsCompleted] = useState(task?.isCompleted || false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const taskId = task?._id;
    const insert = !taskId;
    
    async function handleCloseModal() {
        setIsModalOpen(false);
        onClose();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        if (insert && taskName === '') {
            throw new Error("Task description cannot be empty");
        }

        try {
            let res;
            if (insert) {
                res = await fetch(`/api/draft/${draftId}/todos?userId=${user?.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        task: taskName,
                        timeMinutes,
                        parentId,
                    }),
                });
            } else {
                res = await fetch(`/api/draft/${draftId}/todos/${taskId}?userId=${user?.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        task: taskName,
                        timeMinutes,
                        parentId,
                        isCompleted,
                    }),
                });
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to add task.');
            }

            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setTaskName(task?.task || '');
            setTimeMinutes(task?.timeMinutes || 0);
            setIsCompleted(Boolean(task?.isCompleted));
            setError(null);
        }
    }, [task, isOpen]);

    if (!isOpen || !draftId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-800 border border-slate-700 p-6 shadow-2xl relative text-slate-100">

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold tracking-tight">{taskId ? 'Edit' : 'New'} Task</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-lg font-bold p-1 transition"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            placeholder="e.g. Make outline"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Estimated Time Required (minutes)
                        </label>
                        <input
                            type="text"
                            value={timeMinutes}
                            onChange={(e) => setTimeMinutes(e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500"
                        />
                    </div>

                    {taskId &&
                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={(e) => setIsCompleted(e.target.checked)}
                                className="bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500"
                            />
                            <label className="text-sm font-semibold text-slate-300 mb-1">
                                Complete
                            </label>
                        </div>
                    }

                    {!insert &&
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="tactile-button !w-[200px]"
                        >
                            Add Subtask
                        </button>
                    }

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 gb-slate-600 disabled:opacity-50 text-white font-semibold text-xs transition"
                        >
                            {submitting ? 'Saving...' : 'Confirm'}
                        </button>
                    </div>
                </form>
            </div>
            <EditTaskModal
                task={null}
                draftId={draftId}
                parentId={taskId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}