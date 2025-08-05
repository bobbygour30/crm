import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminApp from './components/admin/AdminApp';
import UserApp from './components/user/UserApp';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} />}
        />
        <Route
          path="/admin/*"
          element={isAuthenticated && isAdmin ? <AdminApp /> : <Navigate to="/login" />}
        />
        <Route
          path="/*"
          element={isAuthenticated ? <UserApp /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;