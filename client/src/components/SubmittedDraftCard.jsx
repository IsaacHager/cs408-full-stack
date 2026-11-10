import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

function SubmittedDraftCard({ draft }) {
    const [submission, setSubmission] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const { user } = useUser();
    const useButton = false;

    useEffect(() => {
        if (!user?.id || !draft?.canvasCourseId || !draft?.canvasAssignmentId) {
            return;
        }

        const fetchCanvasData = async () => {
            try {
                const assignmentPromise = fetch(`/api/canvas/assignments/${draft.canvasCourseId}/${draft.canvasAssignmentId}?userId=${user.id}`);
                const submissionPromise = fetch(`/api/canvas/assignments/${draft.canvasCourseId}/${draft.canvasAssignmentId}/submissions?userId=${user.id}`);

                const [assignmentResponse, submissionResponse] = await Promise.all([
                    assignmentPromise,
                    submissionPromise
                ]);

                const [assignmentData, submissionData] = await Promise.all([
                    assignmentResponse.json(),
                    submissionResponse.json()
                ]);

                if (!submissionResponse.ok) {
                    throw new Error(submissionData.error || 'Failed to fetch submissions');
                }

                setSubmission(submissionData);

                if (!assignmentResponse.ok) {
                    throw new Error(assignmentData.error || 'Failed to fetch assignment');
                }

                setAssignment(assignmentData);

            } catch (error) {
                console.error('Error loading Canvas data:', error);
            }
        };

        fetchCanvasData();
    }, [user?.id, draft?.canvasCourseId, draft?.canvasAssignmentId]);

    return (
        <div className="w-[95%] text-white flex flex-row gap-1">
            <div className="flex-1 bg-slate-600 p-4 grid grid-cols-4 items-center">
                <div className="justify-end text-right col-span-4">
                    <span>{submission?.score} / {assignment?.points_possible} pts</span>
                </div>
                <div className="col-span-3">
                    <h1 className="text-2xl font-semibold p-2">
                        {draft.title} - {assignment?.name}  <span className="-mb-1.5 inline-block max-w-[40%] truncate">( {submission?.course_code}</span> )
                    </h1>
                </div>
                <div className="text-right">
                    {submission?.rubric &&
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

export default SubmittedDraftCard;
