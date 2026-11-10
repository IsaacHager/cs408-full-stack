import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

function DraftCard({ draft }) {
    const [assignment, setAssignment] = useState(null);
    const [progress, setProgress] = useState(0);
    const { user } = useUser();
    const useButton = false;

    useEffect(() => {
        if (!user?.id || !draft?.canvasCourseId || !draft?.canvasAssignmentId) {
            return;
        }

        const fetchCanvasData = async () => {
            try {
                const response = await fetch(`/api/canvas/assignments/${draft.canvasCourseId}/${draft.canvasAssignmentId}?userId=${user?.id}`);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch assignments');
                }

                setAssignment(data);
            } catch (error) {
                console.error('Error loading Canvas data:', error);
            }
        };

        fetchCanvasData();
    }, []);

    useEffect(() => {
        const computeProgress = async () => {
            let completed = 0;

            draft.todos.forEach((todo) => {
                if (todo.isCompleted) {
                    completed++;
                }
            });

            const progress = (completed > 0) ? (completed / draft.todos.length) * 100 : 0;

            setProgress(progress);
        };

        computeProgress();
    }, []);

    return (
        <div className="w-[95%] text-white flex flex-row gap-1">
            <div className="flex-1 bg-slate-600 p-4 grid grid-cols-4 items-center">
                <div>
                    {assignment?.due_at &&
                        <span>Due {new Date(assignment.due_at).toLocaleDateString()}</span>
                    }
                </div>
                <div className="flex gap-x-2 items-center justify-end col-span-2">
                    {draft.status !== 'graded' &&
                        <>
                            <span>{progress}%</span>
                            <div className="w-full bg-slate-700 h-2.5 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-2.5 transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </>
                    }
                </div>
                <div className="justify-end text-right">
                    <span>{draft.status === 'graded' && <span>{draft.grade} / </span>} {draft.points} pts</span>
                </div>
                <div className="col-span-3">
                    <h1 className="text-2xl font-semibold p-2">
                        {draft.title} - {assignment?.name} ( {assignment?.course_code } )
                    </h1>
                </div>
                <div className="text-right">
                    {draft.todos.next &&
                        <h2 className="text-lg">
                            Next Task: <span className="font-semibold">{draft.todos.next}</span>
                        </h2>
                    }
                    {draft.rubric &&
                        <h2 className="text-lg">
                            <u>Rubric Available</u>
                        </h2>
                    }
                </div>
            </div>
            {useButton &&
                <div className="bg-slate-600 w-[5%] flex items-center justify-center">
                    <button>
                        Button
                    </button>
                </div>
            }
        </div>
    );
}

export default DraftCard;
