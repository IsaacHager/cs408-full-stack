import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../context/UserContext';
import ConnectCanvasModal from '../components/ConnectCanvasModal';
import '../App.css';

function Profile() {
    const { user, logout: auth0Logout } = useAuth0();
    const { hasCanvasToken, userData } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLogout = () =>
        auth0Logout({ logoutParams: { returnTo: window.location.origin } });

    return (
        <div className="flex min-h-screen items-center justify-center dotted-grid p-4 -mt-18">
            <div className="w-full max-w-md bg-slate-800 p-8 text-center shadow-2xl border border-slate-700">

                <div className="p-6 max-w-2xl mx-auto text-slate-100">
                    <h1 className="text-2xl font-bold mb-4">User Profile</h1>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 text-left">
                        <p className="text-sm text-slate-300">Email: <span className="font-medium text-white">{user?.email}</span></p>
                        <p className="text-sm text-slate-300">Username: <span className="font-medium text-white">{user?.nickname}</span></p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full py-3 px-4 bg-slate-700 hover:bg-rose-500 text-white font-semibold rounded-xl transition mb-8"
                    >
                        Log Out
                    </button>

                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4">Canvas Integration Status</p>
                        <div className="flex items-center justify-between gap-4 mt-1 mb-4">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${hasCanvasToken ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`}
                                />
                                <span className="text-sm font-medium">
                                    {hasCanvasToken
                                        ? `Connected (${userData?.canvasDomain || 'Canvas'})`
                                        : 'Not Connected'}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-slate-500 hover:bg-slate-400 text-white font-semibold text-xs rounded-xl transition"
                            >
                                {hasCanvasToken ? 'Update Canvas Token' : 'Connect Canvas Account'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ConnectCanvasModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default Profile;