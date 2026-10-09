import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/main')
      .then(res => res.json())
      .then(data => setMessage(data.text))
      .catch(err => console.error('Failed to fetch:', err));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-500">
      <div className="bg-slate-800 border border-slate-700 rounded-4xl max-w-md w-full shadow-2xl text-center p-8">
        <p className="text-6xl text-slate-300 font-medium">
          {message}
        </p>
      </div>
    </main>
  );
}

export default App;