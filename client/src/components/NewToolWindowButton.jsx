import { useState, useEffect } from 'react';

function NewToolWindowButton({ handleAddPanel, draft }) {
    const [menu, setMenu] = useState(false);
    const draftLinked = !!draft;

    const component = 'file';
    const pdfParams = {
        fileUrl: '/api/draft/6aebcf0c08716c0d22b67b25/files/6afe33ab7f954be16f8ff862',
        fileType: 'pdf',
        fileName: 'CS361Hw3',
        onSaveText: () => { }
    };
    const pdfTitle = `PDF Viewer: ${pdfParams.fileName}`;
    const pngParams = {
        fileUrl: '/api/draft/6aebcf0c08716c0d22b67b25/files/6afe33597f954be16f8ff853',
        fileType: 'png',
        fileName: 'Screenshot 2026-10-07 154853',
        onSaveText: () => { }
    };
    const pngTitle = `Image Viewer: ${pngParams.fileName}`;
    const mdParams = {
        fileUrl: '/api/draft/6aebcf0c08716c0d22b67b25/files/6afe3b59190945d5a4cf4fc5',
        fileType: 'md',
        fileName: 'Markdown',
        onSaveText: () => { }
    };
    const mdTitle = `Text Viewer: ${mdParams.fileName}`;
    const txtParams = {
        fileUrl: '/api/draft/6aebcf0c08716c0d22b67b25/files/6afe3cab190945d5a4cf5018',
        fileType: 'txt',
        fileName: 'Text',
        onSaveText: () => { }
    };
    const txtTitle = `Text Viewer: ${txtParams.fileName}`;
    const htmlParams = {
        fileUrl: '/api/draft/6aebcf0c08716c0d22b67b25/files/6afe33af7f954be16f8ff86d',
        fileType: 'html',
        fileName: 'file-preview-demo',
        onSaveText: () => { }
    };
    const htmlTitle = `HTML Viewer: ${htmlParams.fileName}`;

    return (
        <div className="z-10 absolute bottom-4 left-4 flex flex-row gap-2 items-end">
            <button
                type="button"
                onClick={() => setMenu(prev => !prev)}
                title="Add New Panel"
                className="w-12 h-12 rounded-full bg-slate-600 hover:bg-slate-500 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all cursor-pointer"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
            </button>
            {menu &&
                <ul className="bg-slate-600 text-white w-32">
                    <li>
                        <button className="hover:bg-slate-500 text-sm p-2 w-full" onClick={() => handleAddPanel('basic', {}, 'Basic Panel')}>
                            Basic Window
                        </button>
                    </li>
                    <li>
                        <button className="hover:bg-slate-500 text-sm p-2 w-full" onClick={() => handleAddPanel(component, pdfParams, pdfTitle)}>
                            Example PDF
                        </button>
                    </li>
                    <li>
                        <button className="hover:bg-slate-500 text-sm p-2 w-full" onClick={() => handleAddPanel(component, pngParams, pngTitle)}>
                            Example PNG
                        </button>
                    </li>
                    <li>
                        <button className="hover:bg-slate-500 text-sm p-2 w-full" onClick={() => handleAddPanel(component, mdParams, mdTitle)}>
                            Example MD
                        </button>
                    </li>
                    <li>
                        <button className="hover:bg-slate-500 text-sm p-2 w-full" onClick={() => handleAddPanel(component, txtParams, txtTitle)}>
                            Example TXT
                        </button>
                    </li>
                    <li>
                        <button className="hover:bg-slate-500 text-sm p-2 w-full" onClick={() => handleAddPanel(component, htmlParams, htmlTitle)}>
                            Example HTML
                        </button>
                    </li>
                    <li>
                        <button className="hover:bg-slate-500 text-sm p-2 w-full" onClick={() => {}}>
                            Different Draft
                        </button>
                    </li>
                    {!draftLinked &&
                        <li>
                            <button className="hover:bg-slate-500 text-sm p-2 w-full" onClick={() => {}}>
                                Link Draft
                            </button>
                        </li>
                    }
                </ul>
            }
        </div>
    )
}

export default NewToolWindowButton;
