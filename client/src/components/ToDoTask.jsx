function ToDoTask({ task, allTasks, toggleCollapse, collapsedTasks, handleToggleTask, handleEditTask, handleDeleteTask }) {
    const isCollapsed = Boolean(collapsedTasks[task._id]);
    const subtasks = allTasks?.filter((t) => t.parentId && String(t.parentId) === String(task._id));
    const hasSubtasks = subtasks.length > 0;

    const getTaskTotalTime = (task, allTasks) => {
        const children = allTasks.filter(
            (t) => t.parentId && String(t.parentId) === String(task._id)
        );

        if (children.length === 0) {
            return Number(task.timeMinutes) || 0;
        }

        return children.reduce(
            (sum, child) => sum + getTaskTotalTime(child, allTasks),
            task.timeMinutes
        );
    };

    const taskTotaltime = getTaskTotalTime(task, allTasks);

    return (
        <li className="flex flex-col text-sm text-slate-800 hover:bg-slate-200/50 transition-colors">
            <div className="flex flex-row justify-between items-center p-3">
                <div className="flex flex-row items-center">
                    {hasSubtasks && (
                        <button
                            type="button"
                            onClick={() => toggleCollapse(task._id)}
                            className="p-1 text-slate-600 hover:text-slate-900 transition-transform -ml-2"
                        >
                            <svg
                                className={`w-4 h-4 transition-transform duration-150 ${isCollapsed ? '-rotate-90' : 'rotate-0'
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                    )}
                    <div className="flex items-center space-x-3 truncate">
                        <input
                            type="checkbox"
                            checked={task.isCompleted || false}
                            onChange={(e) => handleToggleTask(task._id, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <button className="font-medium text-slate-800 truncate" onClick={() => handleEditTask(task)}>
                            {task.task || 'Untitled File'}
                        </button>
                        {taskTotaltime > 0 &&
                            <p className="text-xs text-slate-600">
                                {String(taskTotaltime)} mins
                            </p>
                        }
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                    title="Remove file"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            {hasSubtasks && !isCollapsed && (
                <ul className="pl-3 divide-y divide-slate-300 bg-slate-400">
                    {subtasks.map((subtask, subIndex) => (
                        <div
                            key={subtask._id || subIndex}
                            className="bg-slate-200"
                        >
                            <ToDoTask
                                task={subtask}
                                allTasks={allTasks}
                                toggleCollapse={toggleCollapse}
                                collapsedTasks={collapsedTasks}
                                handleToggleTask={handleToggleTask}
                                handleEditTask={handleEditTask}
                                handleDeleteTask={handleDeleteTask}
                            />
                        </div>
                    ))}
                </ul>
            )}
        </li>
    )
}

export default ToDoTask