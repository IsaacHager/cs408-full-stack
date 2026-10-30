import './App.css';
import { useAuth0 } from '@auth0/auth0-react';

function Profile() {
    const { user, logout: auth0Logout } = useAuth0();

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
                        className="w-full py-3 px-4 bg-slate-700 hover:bg-rose-500 text-white font-semibold rounded-xl transition"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile;