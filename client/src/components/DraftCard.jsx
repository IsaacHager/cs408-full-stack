import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

function DraftCard({ draft }) {
    const [assignment, setAssignment] = useState(null);
    const { user } = useUser();
    const useButton = false;

    const parentTasks = draft?.todos?.filter(t => (t.parentId === null || !t.parentId));
    const completedTasks = parentTasks?.filter(t => t.isCompleted).length || 0;
    const progress = Math.trunc((completedTasks * 100) / parentTasks.length);
    const nextTask = parentTasks?.find(t => !t.isCompleted);

    useEffect(() => {
        if (!user?.id || !draft?.canvasCourseId || !draft?.canvasAssignmentId) {
            return;
        }

        const fetchCanvasData = async () => {
            try {
                const assignmentResponse = await fetch(`/api/canvas/assignments/${draft.canvasCourseId}/${draft.canvasAssignmentId}?userId=${user?.id}`);

                const assignmentData = await assignmentResponse.json();

                if (!assignmentResponse.ok) {
                    throw new Error(assignmentData.error || 'Failed to fetch assignment');
                }

                setAssignment(assignmentData);
            } catch (error) {
                console.error('Error loading Canvas data:', error);
            }
        };

        fetchCanvasData();
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
                    <span>{progress}%</span>
                    <div className="w-full bg-slate-700 h-2.5 overflow-hidden">
                        <div
                            className="bg-blue-600 h-2.5 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                <div className="justify-end text-right">
                    <span>{assignment?.points_possible} pts</span>
                </div>
                <div className="col-span-3">
                    <h1 className="text-2xl font-semibold p-2">
                        {draft.title} - {assignment?.name}  <span className="-mb-1.5 inline-block max-w-[40%] truncate">( {assignment?.course_code}</span> )
                    </h1>
                </div>
                <div className="text-right">
                    {nextTask &&
                        <h2 className="text-lg">
                            Next Task: <span className="font-semibold">{nextTask.task}</span>
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
