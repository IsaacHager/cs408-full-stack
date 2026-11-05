import '../App.css';
import { useUser } from '../context/UserContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

function Login() {
  const [errorMessage, setErrorMessage] = useState('');
  const { loginUser } = useUser();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);
    const username = data.get('username');
    const password = data.get('password');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      loginUser({
        name: username,
        id: data.id,
        hasCanvasToken: data.hasCanvasToken,
        canvasDomain: data.canvasDomain,
      });

      setErrorMessage('');
      navigate('/');

    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Invalid username or password. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center dotted-grid p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 text-center shadow-2xl border border-slate-700">
        <h1 className="text-4xl font-medium text-white tracking-tight mb-7">
          Canvas<strong>Desk</strong>
        </h1>

        <div>
          <p className="error-message text-xs text-slate-400 visibility-hidden">

          </p>
        </div>

        {errorMessage && (
          <div className="text-rose-400 text-sm mb-4">{errorMessage}</div>
        )}

        <form className="mb-6" onSubmit={handleLogin}>
          <label className="block text-sm font-semibold text-slate-300 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mb-4"
            minLength={3}
            maxLength={20}
            title="Username cannot contain spaces or special characters. Only letters, numbers, underscores (_), and hyphens (-) are allowed."
            pattern="[a-zA-Z0-9_\-]+"
            required
          />
          <label className="block text-sm font-semibold text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mb-4"
            minLength={6}
            maxLength={50}
            title="Password must be between 6 and 50 characters."
            required
          />
          <button
            type="submit"
            className="w-full py-3 px-4 bg-slate-700 hover:bg-indigo-600 text-white font-semibold rounded-xl transition mb-4"
          >
            Log In
          </button>
        </form>

        <div>
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;