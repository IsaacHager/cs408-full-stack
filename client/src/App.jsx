import { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/main')
      .then(res => res.json())
      .then(data => setMessage(data.text))
      .catch(err => console.error('Failed to fetch:', err));
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col relative w-full dotted-grid">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-11/12 max-w-[320px] min-w-0 md:max-w-md md:min-w-[250px] shadow-2xl text-center p-4 md:p-8 shrink-0">
            <p className="text-3xl md:text-6xl text-slate-300 font-medium break-words">
              {message}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;