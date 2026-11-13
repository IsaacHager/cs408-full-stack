import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Link } from "react-router-dom";

function DraftCard({ draft }) {
    const [assignment, setAssignment] = useState(null);
    const { user } = useUser();
    const useButton = false;

    const progress = getProgress(draft?.todos);
    const progressPercent = Math.trunc(progress.percent);
    const segments = progress.segments;
    const nextTask = progress.nextTask;
    const rawMinutes = progress.timeLeft;
    const hoursLeft = Math.floor(rawMinutes / 60);
    const minsLeft = rawMinutes % 60;

    function getProgress(items) {
        if (items.length === 0) return { percent: 0, segments: [], nextTask: null, timeLeft: 0 };

        const itemMap = new Map(items.map((item) => [String(item._id), item]));
        const memo = new Map();

        function isComplete(item, visited = new Set()) {
            if (!item) return false;
            const id = String(item._id);
            if (memo.has(id)) return memo.get(id);
            if (visited.has(id)) return false;

            visited.add(id);

            const result =
                Boolean(item.isCompleted) ||
                (item.parentId != null && isComplete(itemMap.get(String(item.parentId)), visited));

            memo.set(id, result);
            return result;
        }

        let completedItems = 0;
        for (const item of items) {
            if (isComplete(item)) completedItems++;
        }

        function findNextTask(items) {
            const falseItems = items.filter((item) => !isComplete(item));

            const parentsWithFalseChildren = new Set(
                falseItems.map((item) => String(item.parentId))
            );

            return falseItems.find((item) => !parentsWithFalseChildren.has(String(item._id))) ?? null;
        }

        let nextTask = findNextTask(items);

        const timedItems = items.filter((item) => item.timeMinutes > 0);
        const untimedItems = items.filter((item) => !(item.timeMinutes > 0));

        const timedShare = (timedItems.length / items.length) * 100;
        const untimedShare = (untimedItems.length / items.length) * 100;
        const totalMinutes = timedItems.reduce((sum, item) => sum + item.timeMinutes, 0);

        const toTimedSegment = (item, completed) => ({
            id: String(item._id),
            task: item.task,
            widthPercent: totalMinutes > 0 ? (item.timeMinutes / totalMinutes) * timedShare : 0,
            fillPercent: completed ? 100 : 0,
        });

        const completedTimed = timedItems
            .filter((item) => isComplete(item))
            .map((item) => toTimedSegment(item, true));

        const uncompletedTimed = timedItems
            .filter((item) => !isComplete(item))
            .map((item) => toTimedSegment(item, false));

        const untimedSegment = [];
        if (untimedItems.length > 0) {
            const completedUntimedCount = untimedItems.filter((item) => isComplete(item)).length;
            untimedSegment.push({
                id: "untimed-group",
                task: `${untimedItems.length} untimed task(s)`,
                widthPercent: untimedShare,
                fillPercent: (completedUntimedCount / untimedItems.length) * 100,
            });
        }

        const segments = [...completedTimed, ...untimedSegment, ...uncompletedTimed];
        const timeLeft = items.reduce((total, item) => (!isComplete(item) ? total + (item.timeMinutes || 0) : total), 0);

        return {
            percent: (completedItems / items.length) * 100,
            segments,
            nextTask,
            timeLeft,
        };
    }

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
            <div className="flex-1 bg-slate-600 p-4 grid grid-cols-6 items-center">
                <div>
                    <span>{assignment?.due_at ? `Due ${new Date(assignment.due_at).toLocaleDateString()}` : `No Due Date`}</span>
                </div>
                <div className="flex flex-1 gap-x-2 items-center col-span-4">
                    <span className="text-right shrink-0 tabular-nums">{progressPercent}%</span>
                    <div className="flex flex-1 bg-slate-600 h-2.5 gap-1 overflow-hidden">
                        {segments.map((seg) => (
                            <div
                                key={seg.id}
                                title={seg.task}
                                className="h-full bg-slate-700 overflow-hidden"
                                style={{ width: `${seg.widthPercent}%` }}
                            >
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                                    style={{ width: `${seg.fillPercent}%` }}
                                />
                            </div>
                        ))}
                    </div>
                    <span className="text-right shrink-0 whitespace-nowrap tabular-nums text-sm">
                        {rawMinutes > 0 ? `~${hoursLeft}h ${minsLeft}m left` : ""}
                    </span>
                </div>
                <div className="justify-end text-right">
                    <span>{assignment?.points_possible} pts</span>
                </div>
                <div className="col-span-5">
                    <Link to={`/draft/${draft._id}`} className="block hover:text-blue-400 transition-colors" >
                        <h1 className="text-2xl font-semibold p-2">
                            {draft.title} - {assignment?.name}  <span className="-mb-1.5 inline-block max-w-[40%] truncate">( {assignment?.course_code}</span> )
                        </h1>
                    </Link>
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
