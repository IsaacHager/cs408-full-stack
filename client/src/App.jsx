import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './Layout';
import Home from './Home';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/main')
      .then(res => res.json())
      .then(data => setMessage(data.text))
      .catch(err => console.error('Failed to fetch:', err));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* <Route path="/drafts" element={<Drafts />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;