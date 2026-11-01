import { useEffect, useState } from 'react';
import '../App.css';

function Home() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/main')
      .then(res => res.json())
      .then(data => setMessage(data.text))
      .catch(err => console.error('Failed to fetch:', err));
  }, []);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-3xl w-11/12 max-w-[320px] min-w-0 md:max-w-md md:min-w-[250px] shadow-2xl text-center p-4 md:p-8 shrink-0">
        <p className="text-3xl md:text-6xl text-slate-300 font-medium break-words">
            {message}
        </p>
    </div>
  );
}

export default Home;