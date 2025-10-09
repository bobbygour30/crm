// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminAttendance from '../components/AdminAttendance';

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch users error:', err);
        setError('Failed to fetch users. Please try again.');
        setLoading(false);
      }
    };
    if (token) {
      fetchUsers();
    } else {
      setError('No authentication token found. Please log in.');
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
        Admin Dashboard
      </h1>
      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && <AdminAttendance users={users} />}
    </div>
  );
}

export default Admin;