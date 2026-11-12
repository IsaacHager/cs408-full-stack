import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { extractCanvasResources } from '../../../utils/htmlParsing.js';
import parse, { domToReact } from 'html-react-parser';
import ToDoBar from '../components/ToDoBar';
import FileBrowseButton from '../components/FileBrowseButton';
import XButton from '../components/XButton';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';

function Draft() {
    const { user } = useUser();
    const { draftId } = useParams();
    const [draft, setDraft] = useState();
    const [assignment, setAssignment] = useState();
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState([]);
    const [links, setLinks] = useState([]);
    const [refreshDraft, setRefreshDraft] = useState(0);
    const [fileUploading, setFileUploading] = useState(false);

    const options = {
        replace: (domNode) => {
            // Intercept <a> tags coming from Canvas
            if (domNode.name === 'a' && domNode.attribs) {
                const { href, title, class: className } = domNode.attribs;
                const isFile = domNode.attribs['data-api-returntype'] === 'File';

                return (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        {domToReact(domNode.children)}
                    </a>
                );
            }
        },
    };



    async function uploadFile(file) {
        if (!file || !draft?._id || !user?.id) return;

        setFileUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        const userId = user?.id;

        try {
            const response = await fetch(`/api/draft/${draft._id}/files?userId=${userId}`, {
                method: 'PUT',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setRefreshDraft(prev => prev + 1);
            setFileUploading(false);

        } catch (error) {
            console.error('Error updating draft:', error);
        }
    }

    async function handleDeleteFile(fileId) {
        if (!draft?._id || !user?.id) return;

        try {
            setFileUploading(true);
            const response = await fetch(
                `/api/draft/${draft._id}/files/${fileId}?userId=${user.id}`,
                { method: 'DELETE' }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete file');
            }

            setRefreshDraft(prev => prev + 1);
            setFileUploading(false);

        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    useEffect(() => {
        if (!user?.id || !draftId) return;

        const fetchDrafts = async () => {
            try {
                const response = await fetch(`/api/draft/${draftId}?userId=${user?.id}`);

                const data = await response.json();

                setDraft(data);
            } catch (error) {
                console.error('Error loading drafts:', error);
            }
        };

        fetchDrafts();
    }, [draftId, refreshDraft]);

    useEffect(() => {
        if (!user?.id || !draft?.canvasCourseId || !draft?.canvasAssignmentId) return;

        const fetchCanvasData = async () => {
            try {
                const assignmentResponse = await fetch(`/api/canvas/assignments/${draft.canvasCourseId}/${draft.canvasAssignmentId}?userId=${user?.id}`);

                const assignmentData = await assignmentResponse.json();

                if (!assignmentResponse.ok) {
                    throw new Error(assignmentData.error || 'Failed to fetch assignment');
                }

                setAssignment(assignmentData);

                const { cleanDescription, files, links } = extractCanvasResources(assignmentData.description || 'No Description');

                setDescription(cleanDescription);
                setFiles(files);
                setLinks(links);
            } catch (error) {
                console.error('Error loading Canvas data:', error);
            }
        };

        fetchCanvasData();
    }, [draft?.canvasCourseId, draft?.canvasAssignmentId]);

    return (
        <div className="flex flex-col self-start w-full p-8 gap-y-4">
            <div className="flex flex-row justify-between w-full items-center">
                <h1 className="text-left text-6xl font-semibold underline">
                    {draft?.title}
                </h1>
                <span className="text-left text-xl">
                    {assignment?.name} - {assignment?.course_code}
                </span>
            </div>
            <div className="flex flex-row gap-x-2">
                <main className="w-full flex flex-col">
                    <p className="tab-8 whitespace-pre p-2">
                        Due: {new Date(assignment?.due_at).toLocaleDateString()} &#9;Points: {assignment?.points_possible}
                    </p>
                    <div className="border-2 border-dashed border-slate-600 p-2 bg-slate-200/50 h-full">
                        {description ? parse(description, options) : <p>Loading assignment...</p>}
                    </div>
                </main>
                <ToDoBar
                    draftId={draftId}
                    todos={draft?.todos}
                    setRefreshDraft={setRefreshDraft}
                />
            </div>
            <div className="w-full p-5 border border-2 border-slate-600 bg-slate-600 text-white flex flex-wrap items-center gap-x-2 gap-y-2 text-lg">
                <span>
                    Attached Resources:
                </span>

                {files.length === 0 && links.length === 0 ? (
                    <span className="text-zinc-300 italic text-base">
                        None
                    </span>
                ) : (
                    [...files, ...links].map((item, index, array) => (
                        <span key={item.id || index} className="inline-flex items-center gap-2">
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 font-medium hover:underline"
                            >
                                {item.label}
                            </a>
                            {index < array.length - 1 && (
                                <span className="text-zinc-300 font-normal">
                                    ;
                                </span>
                            )}
                        </span>
                    ))
                )}
            </div>
            <div className="w-full p-5 border border-2 border-slate-600 bg-slate-600 text-white">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-lg">
                    <span>
                        Draft Resources:
                    </span>

                    {draft?.files.length === 0 ? (
                        <span className="text-zinc-300 italic text-base">
                            None
                        </span>
                    ) : (
                        draft?.files.map((item, index, array) => (
                            <span key={item.fileId || index} className="inline-flex items-center gap-2">
                                <a
                                    href={`/api/draft/${draft?._id}/files/${item.fileId}`}
                                    download={item.fileName || true}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 font-medium hover:underline"
                                >
                                    {item.fileName}
                                </a>
                                <XButton onClick={() => handleDeleteFile(item.fileId)} />
                                {index < array.length - 1 && (
                                    <span className="text-zinc-300 font-normal">
                                        ;
                                    </span>
                                )}
                            </span>
                        ))
                    )}

                    {fileUploading &&
                        <LoadingSpinner />
                    }
                </div>
                <FileBrowseButton
                    onFileSelect={uploadFile}
                />
            </div>
        </div>
    );
}

export default Draft;