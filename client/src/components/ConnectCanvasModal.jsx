import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function ConnectCanvasModal({ isOpen, onClose }) {
    const { markCanvasConnected, refreshProfile, user } = useUser();

    const [canvasDomain, setCanvasDomain] = useState('canvas.instructure.com');
    const [canvasToken, setCanvasToken] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/canvas/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    canvasDomain,
                    canvasToken,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to connect Canvas token.');
            }

            markCanvasConnected(canvasDomain);
            if (refreshProfile) refreshProfile();

            setCanvasToken('');
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-800 border border-slate-700 p-6 shadow-2xl relative text-slate-100">

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold tracking-tight">Connect Canvas Account</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-lg font-bold p-1 transition"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                    Enter your institution's Canvas domain and a Personal Access Token generated under your Canvas Account Settings.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1">
                            Canvas Domain
                        </label>
                        <input
                            type="text"
                            required
                            value={canvasDomain}
                            onChange={(e) => setCanvasDomain(e.target.value)}
                            placeholder="e.g. canvas.instructure.com"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1">
                            Personal Access Token
                        </label>
                        <input
                            type="password"
                            required
                            value={canvasToken}
                            onChange={(e) => setCanvasToken(e.target.value)}
                            placeholder="Paste token here"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-500/80 disabled:opacity-50 text-white font-semibold text-xs transition"
                        >
                            {submitting ? 'Verifying...' : 'Connect Token'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}