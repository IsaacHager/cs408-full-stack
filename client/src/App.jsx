import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/main')
      .then(res => res.json())
      .then(data => setMessage(data.text))
      .catch(err => console.error('Failed to fetch:', err));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-500 w-max min-w-full">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-slate-800 border border-slate-700 rounded-4xl max-w-md min-w-[250px] shadow-2xl text-center p-8 shrink-0">
          <p className="text-6xl text-slate-300 font-medium">
            {message}
          </p>
        </div>
      </div>
    </main>
  );
}

export default App;