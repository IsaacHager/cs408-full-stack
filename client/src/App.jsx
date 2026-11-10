import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext.jsx';
import './App.css';
import Layout from './pages/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Profile from './pages/Profile.jsx'
import Courses from './pages/Courses.jsx';
import Search from './pages/Search.jsx';
import Testing from './pages/Testing.jsx'
import AllDrafts from './pages/AllDrafts.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx';
import GuardedRoute from './components/GuardedRoute.jsx'

function App() {
  const { loading: userLoading, isAuthenticated } = useUser();
  
  if (userLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Login />} />
          </>
        ) : (
        <Route path="/" element={<GuardedRoute><Layout /></GuardedRoute>}>
          <Route index element={<GuardedRoute><Home /></GuardedRoute>} />
          <Route path="/profile" element={<GuardedRoute><Profile /></GuardedRoute>} />
          <Route path="/search" element={<GuardedRoute><Search /></GuardedRoute>} />
          <Route path="/all-drafts" element={<GuardedRoute><AllDrafts /></GuardedRoute>} />
          <Route path="/courses" element={<GuardedRoute><Courses /></GuardedRoute>} />
          <Route path="/testing" element={<GuardedRoute><Testing /></GuardedRoute>} />
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/signup" element={<Navigate to="/" />} />
        </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;