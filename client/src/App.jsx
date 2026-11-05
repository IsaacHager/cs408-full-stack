import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useUser } from './context/UserContext.jsx';
import './App.css';
import Layout from './pages/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Profile from './pages/Profile.jsx'
import Courses from './pages/Courses.jsx';
import Search from './pages/Search.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

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
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/courses" element={<Courses />} />
        </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;