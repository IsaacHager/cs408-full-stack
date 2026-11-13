import { useState } from 'react';
import { useUser } from '../context/UserContext';
import ConnectCanvasModal from '../components/ConnectCanvasModal';
import '../App.css';

function Profile() {
    const { hasCanvasToken, user, logoutUser } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="w-full max-w-[50%] min-w-[500px] bg-slate-800 p-8 text-left border border-slate-700">
            <div className="p-6 mx-auto text-slate-100">
                <h1 className="text-2xl font-bold mb-4">User Profile</h1>

                <div className="flex flex-row justify-between gap-4">
                    <div className="bg-slate-800 p-4 border border-slate-700 mb-6 text-left flex-1">
                        <p className="text-md text-slate-300">Username: <span className="font-medium text-white">{user?.name}</span></p>
                        {/* <p className="text-md text-slate-300">Canvas Domain: <span className="font-medium text-white">{user?.canvasDomain || 'Not Set'}</span></p> */}
                    </div>

                    <button
                        onClick={logoutUser}
                        className="py-3 px-4 bg-slate-700 hover:bg-rose-500 text-white font-semibold rounded-xl transition mb-8"
                    >
                        Logout
                    </button>
                </div>

                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4">Canvas Integration Status</p>
                    <div className="flex items-center justify-between gap-4 mt-1 mb-4">
                        <div className="flex items-center gap-2">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${hasCanvasToken ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                            />
                            <span className="text-md font-medium">
                                {hasCanvasToken
                                    ? `Connected`
                                    : 'Not Connected'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-xl text-md transition"
                        >
                            {hasCanvasToken ? 'Edit Canvas Token' : 'Connect Canvas Account'}
                        </button>
                    </div>
                    <span className="text-md text-slate-400">
                        ({user?.canvasDomain || 'Canvas'})
                    </span>
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