import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';
import { useUser } from '../context/UserContext';

function FileEditor({ params }) {
    const { user } = useUser();
    const [textContent, setTextContent] = useState('');
    const [savedContent, setSavedContent] = useState('');
    const [previewMd, setPreviewMd] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState('');

    const { fileUrl, fileType, fileName } = params;
    const isDirty = textContent !== savedContent;

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const response = await fetch(fileUrl);
                const data = await response.text();
                if (!response.ok) throw new Error(data.error || 'Failed to fetch file');
                setTextContent(data);
                setSavedContent(data);
            } catch (err) {
                console.error('Failed to load file:', err);
                setStatus('Failed to load');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [fileUrl]);

    const handleSave = async () => {
        setIsSaving(true);
        setStatus('');
        try {
            const mimeType = fileType === 'md' ? 'text/markdown' : 'text/plain';
            const blob = new Blob([textContent], { type: mimeType });
            const formData = new FormData();
            formData.append('file', blob, fileName);

            const uploadUrl = user?.id ? `${fileUrl}?userId=${user.id}` : fileUrl;
            const response = await fetch(uploadUrl, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to save file');
            }

            setSavedContent(textContent);
            setStatus('Saved');
            setTimeout(() => setStatus(''), 2000);
        } catch (err) {
            console.error('Save failed:', err);
            setStatus('Save failed');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="border border-slate-200 rounded-lg bg-white h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200">
                <span className="text-xs text-slate-500">
                    {status || (isDirty ? 'Unsaved changes' : 'Up to date')}
                </span>

                <div className="flex items-center gap-2">
                    {fileType === 'md' && (
                        <button
                            type="button"
                            onClick={() => setPreviewMd((prev) => !prev)}
                            className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
                        >
                            {previewMd ? 'Edit' : 'Preview'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !isDirty}
                        className="px-3 py-1 text-xs font-medium text-white bg-slate-600 rounded hover:bg-slate-700 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {fileType === 'md' && previewMd ? (
                <div className="p-6 prose max-w-none overflow-auto flex-1">
                    <Markdown>{textContent}</Markdown>
                </div>
            ) : (
                <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full flex-1 p-6 font-mono text-sm resize-none focus:outline-none"
                />
            )}
        </div>
    );
}

export default FileEditor;