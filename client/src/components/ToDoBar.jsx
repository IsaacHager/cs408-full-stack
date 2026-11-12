import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import ToDoTask from './ToDoTask';
import EditTaskModal from './EditTaskModal';

function ToDoBar({ draftId, todos, setRefreshDraft }) {
    const [collapsedTasks, setCollapsedTasks] = useState({});
    const [editTask, setEditTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useUser();

    async function handleCloseModal() {
        setIsModalOpen(false);
        setRefreshDraft(prev => prev + 1);
        setEditTask(null);
    }

    const toggleCollapse = (taskId) => {
        setCollapsedTasks((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    };

    async function handleToggleTask(taskId, isCompleted) {
        if (!draftId || !user?.id) return;

        try {
            const response = await fetch(
                `/api/draft/${draftId}/todos/${taskId}?userId=${user.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isCompleted }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update task status');
            }

            setRefreshDraft(prev => prev + 1);

        } catch (error) {
            console.error('Error toggling task:', error);
        }
    }

    async function handleDeleteTask(taskId) {
        if (!draftId || !user?.id) return;

        try {
            const getAllDescendantIds = (id) => {
                const directChildren = (todos || []).filter(
                    (t) => t.parentId && String(t.parentId) === String(id)
                );
                return [
                    id,
                    ...directChildren.flatMap((child) => getAllDescendantIds(child._id)),
                ];
            };

            const idsToDelete = getAllDescendantIds(taskId);

            const deletePromises = idsToDelete.map(async (id) => {
                const response = await fetch(
                    `/api/draft/${draftId}/todos/${id}?userId=${user.id}`,
                    { method: 'DELETE' }
                );

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || `Failed to delete task ${id}`);
                }
            });

            await Promise.all(deletePromises);

            setRefreshDraft(prev => prev + 1);

        } catch (error) {
            console.error('Error recursively deleting task: ', error);
        }
    }

    async function handleEditTask(taskId) {
        setEditTask(taskId);
        setIsModalOpen(true);
    }

    const parentTasks = todos?.filter((t) => !t.parentId);

    return (
        <aside className="bg-slate-400 border-2 border-slate-600 p-2 w-[35%]">
            ToDo: {todos?.length || 0} Task{todos?.length === 1 ? '' : 's' || 's'}
            <ul className="divide-y divide-slate-300 bg-slate-200">
                {parentTasks?.map((task, index) => (
                    <ToDoTask
                        key={task._id || index}
                        task={task}
                        allTasks={todos}
                        toggleCollapse={toggleCollapse}
                        collapsedTasks={collapsedTasks}
                        handleToggleTask={handleToggleTask}
                        handleEditTask={handleEditTask}
                        handleDeleteTask={handleDeleteTask}
                    />
                ))}
            </ul>

            <EditTaskModal
                task={editTask}
                draftId={draftId}
                parentId={null}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </aside>
    )
}

export default ToDoBar;