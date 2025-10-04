import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp'; // Import SignUp component
import AdminApp from './components/admin/AdminApp';
import UserApp from './components/user/UserApp';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const auth = localStorage.getItem('isAuthenticated');
    return auth === 'true';
  });
  
  const [isAdmin, setIsAdmin] = useState(() => {
    const admin = localStorage.getItem('isAdmin');
    return admin === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    localStorage.setItem('isAdmin', isAdmin.toString());
  }, [isAuthenticated, isAdmin]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token'); 
    localStorage.removeItem('username');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={isAdmin ? '/admin' : '/'} />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to={isAdmin ? '/admin' : '/'} />
            ) : (
              <SignUp setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} />
            )
          }
        />
        <Route
          path="/admin/*"
          element={
            isAuthenticated && isAdmin ? (
              <AdminApp handleLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/*"
          element={
            isAuthenticated && !isAdmin ? (
              <UserApp handleLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;