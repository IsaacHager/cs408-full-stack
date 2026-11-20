import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

function FilePreview({ params }) {
    const [textContent, setTextContent] = useState('');
    const [renderMarkdown, setRenderMarkdown] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const { fileUrl, fileType, fileName } = params;

    useEffect(() => {
        if (fileType !== 'txt' && fileType !== 'md') return;

        async function fetchData() {
            setIsLoading(true);
            try {
                const response = await fetch(fileUrl);
                const data = await response.text();
                if (!response.ok) throw new Error(data.error || 'Failed to fetch file');
                setTextContent(data);
            } catch (err) {
                console.error('Failed to load text:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [fileUrl, fileType]);

    if (isLoading) return <LoadingSpinner />;

    if (['png', 'jpg', 'jpeg'].includes(fileType)) {
        return (
            <div className="flex justify-center p-4">
                <img src={fileUrl} alt={fileName} className="max-w-full h-auto" />
            </div>
        );
    }

    if (fileType === 'pdf') {
        return (
            <iframe
                src={`${fileUrl}#toolbar=0`}
                title={fileName}
                className="w-full h-full min-h-[500px] border-none"
            />
        );
    }

    if (fileType === 'txt' || fileType === 'md') {
        return (
            <div className="border border-slate-200 rounded-lg overflow-auto bg-white h-full flex flex-col">
                {fileType === 'md' && (
                    <div className="flex justify-end px-4 py-2 bg-slate-50 border-b border-slate-200">
                        <button
                            type="button"
                            onClick={() => setRenderMarkdown((prev) => !prev)}
                            className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
                        >
                            {renderMarkdown ? 'View Raw' : 'View Rendered'}
                        </button>
                    </div>
                )}

                {fileType === 'md' && renderMarkdown ? (
                    <div className="p-6 prose max-w-none">
                        <Markdown>{textContent}</Markdown>
                    </div>
                ) : (
                    <pre className="p-6 font-mono text-sm whitespace-pre-wrap">{textContent}</pre>
                )}
            </div>
        );
    }

    return <p className="p-4 text-slate-500">Unsupported file format.</p>;
}

export default FilePreview;