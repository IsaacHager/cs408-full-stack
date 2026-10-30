import './App.css';
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from 'react-router-dom';

function Login() {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect: login,
    logout: auth0Logout,
    user,
  } = useAuth0();

  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-200">
        <p className="text-lg animate-pulse">Loading Canvas<strong>Desk</strong>...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center dotted-grid p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 text-center shadow-2xl border border-slate-700">
        <h1 className="text-4xl font-medium text-white tracking-tight mb-7">
          Canvas<strong>Desk</strong>
        </h1>

        {/* <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Flavor Text if needed
        </p> */}

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-left">
            Error: {error.message}
          </div>
        )}

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">
              Signed in as <span className="font-semibold text-indigo-400">{user?.email}</span>
            </p>
            <button
              onClick={logout}
              className="w-full py-3 px-4 bg-slate-700 hover:bg-rose-500 text-white font-semibold rounded-xl transition"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => login()}
              className="w-full py-3 px-4 bg-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition"
            >
              Log In
            </button>

            <button
              onClick={signup}
              className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl transition border border-slate-600"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;