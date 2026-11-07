import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Signup() {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const signup = (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const username = data.get('username');
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');

    if (!username || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_\-]+$/;
    if (!usernameRegex.test(username)) {
      setErrorMessage('Username cannot contain spaces or special characters. Only letters, numbers, underscores (_), and hyphens (-) are allowed.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 409) {
            throw new Error('Username already exists. Please choose a different username.');
          }
          throw new Error(`Signup failed with status: ${response.status}`);
        }
      })
      .then((data) => {
        setErrorMessage('');
        navigate('/login');
      })
      .catch((error) => {
        console.error('Error during signup:', error);
        setErrorMessage(error.message);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center dotted-grid p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 text-center shadow-2xl border border-slate-700">
        <h1 className="text-4xl font-medium text-white tracking-tight mb-7">
          Canvas<strong>Desk</strong>
        </h1>

        {errorMessage && (
          <div className="text-rose-400 text-sm mb-4">{errorMessage}</div>
        )}

        <form className="mb-6" onSubmit={signup}>
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
          <label className="block text-sm font-semibold text-slate-300 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
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
            Sign Up
          </button>
        </form>

        <div>
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;