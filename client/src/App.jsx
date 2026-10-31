import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from './context/UserContext.jsx';
import './App.css';
import Layout from './pages/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx'
import Courses from './pages/Courses.jsx';
import Search from './pages/Search.jsx';

function App() {
  const { isAuthenticated, isLoading: auth0Loading } = useAuth0();
  const { loading: userLoading, hasCanvasToken, hasSkippedCanvas } = useUser();

  if (!isAuthenticated) {
    return <Login />;
  }
  
  if (auth0Loading || userLoading) {
    return <div className="loading-spinner">Loading application...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/courses" element={<Courses />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;