import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

function FilePreview({ params }) {
    const [textContent, setTextContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [renderMarkdown, setRenderMarkdown] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const { fileUrl, fileType, fileName, onSaveText } = params;

    useEffect(() => {
        if (fileType === 'txt' || fileType === 'md') {
            async function fetchData() {
                setIsLoading(true);
                try {
                    const response = await fetch(fileUrl);
                    const data = await response.text();

                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to fetch file');
                    }

                    setTextContent(data);
                } catch (err) {
                    console.error('Failed to load text:', err);
                }
                setIsLoading(false);
            }
            fetchData();
        }
    }, [fileUrl, fileType]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (['png', 'jpg', 'jpeg'].includes(fileType)) {
        return (
            <div className="flex justify-center">
                <img src={fileUrl} alt={fileName} className="max-w-full h-auto" />
            </div>
        );
    }

    if (fileType === 'pdf') {
        return (
            <iframe
                src={`${fileUrl}#toolbar=0`}
                title={fileName}
                className="w-full h-[600px] border-none"
            />
        );
    }

    if (fileType === 'txt' || fileType === 'md') {
        return (
            <div className="border border-slate-200 rounded-lg overflow-scroll bg-white h-full">
                <div className="flex justify-end gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                    {fileType === 'md' && !isEditing && (
                        <button
                            onClick={() => setRenderMarkdown(!renderMarkdown)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
                        >
                            {renderMarkdown ? 'View Raw' : 'View Rendered'}
                        </button>
                    )}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
                    >
                        {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                    {isEditing && (
                        <button
                            onClick={() => {
                                if (onSaveText) onSaveText(textContent);
                                setIsEditing(false);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-600 rounded hover:bg-slate-700"
                        >
                            Save
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        rows={20}
                        className="w-full p-6 font-mono text-sm focus:outline-none"
                    />
                ) : fileType === 'md' && renderMarkdown ? (
                    <div className="p-6 prose max-w-none">
                        <Markdown>{textContent}</Markdown>
                    </div>
                ) : (
                    <pre className="p-6 font-mono text-sm whitespace-pre-wrap">{textContent}</pre>
                )}
            </div>
        );
    }

    return <p className="text-slate-500">Unsupported file format.</p>;
}

export default FilePreview;
