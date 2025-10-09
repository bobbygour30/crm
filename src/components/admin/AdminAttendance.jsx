// src/components/AdminAttendance.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';

function AdminAttendance({ users }) {
  const token = localStorage.getItem('token');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({ userId: '', date: '', status: 'Present' });

  useEffect(() => {
    // Debug: Log users prop to verify its content
    console.log('Users prop:', users);
    fetchAttendance();
    fetchLeaves();
  }, [users]); // Add users as a dependency to refetch if it changes

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceRecords(res.data);
      // Debug: Log attendance records
      console.log('Attendance records:', res.data);
    } catch (err) {
      console.error('Fetch attendance error:', err);
      alert('Error fetching attendance records.');
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(res.data);
      // Debug: Log leave requests
      console.log('Leave requests:', res.data);
    } catch (err) {
      console.error('Fetch leaves error:', err);
      alert('Error fetching leave requests.');
    }
  };

  const handleLeaveAction = async (leaveId, action) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/leaves/${leaveId}`, {
        status: action,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeaves(); // Refetch to update state
      alert(`Leave request ${action.toLowerCase()}.`);
    } catch (err) {
      console.error('Update leave error:', err);
      alert('Error updating leave request.');
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    const { userId, date, status } = attendanceForm;
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/attendance`, {
        user: userId,
        date,
        status,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAttendance();
      setShowMarkAttendanceModal(false);
      setAttendanceForm({ userId: '', date: '', status: 'Present' });
      alert('Attendance marked successfully.');
    } catch (err) {
      console.error('Mark attendance error:', err);
      alert('Error marking attendance.');
    }
  };

  const getUserName = (userId) => {
    if (!userId) return 'All'; // Handle leaves for all users
    const user = users.find((u) => u._id === userId);
    if (!user) {
      console.warn(`User not found for ID: ${userId}`);
      return 'Unknown';
    }
    return user.username || user.email || 'Unknown';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6 md:mb-8 tracking-tight">
        Attendance Management
      </h1>
      <div className="flex justify-end mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMarkAttendanceModal(true)}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
        >
          Mark Attendance
        </motion.button>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4">Attendance Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left font-semibold text-gray-700">User</th>
                <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                <th className="p-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <motion.tr
                  key={record._id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-3">{getUserName(record.user?._id)}</td>
                  <td className="p-3">{formatDate(record.date)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                        record.status === 'Present'
                          ? 'bg-green-100 text-green-600'
                          : record.status === 'Absent'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4">Leave Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left font-semibold text-gray-700">User</th>
                <th className="p-3 text-left font-semibold text-gray-700">Start Date</th>
                <th className="p-3 text-left font-semibold text-gray-700">End Date</th>
                <th className="p-3 text-left font-semibold text-gray-700">Reason</th>
                <th className="p-3 text-left font-semibold text-gray-700">Applied Date</th>
                <th className="p-3 text-left font-semibold text-gray-700">Status</th>
                <th className="p-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((leave) => (
                <motion.tr
                  key={leave._id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-3">{getUserName(leave.user?._id) || 'All'}</td>
                  <td className="p-3">{formatDate(leave.from)}</td>
                  <td className="p-3">{formatDate(leave.to)}</td>
                  <td className="p-3">{leave.notes || leave.reason}</td>
                  <td className="p-3">{formatDate(leave.createdAt)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                        leave.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-600'
                          : leave.status === 'Approved'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="p-3 flex space-x-2">
                    {leave.status === 'Pending' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleLeaveAction(leave._id, 'Approved')}
                          className="flex items-center justify-center bg-green-600 text-white py-1 px-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                        >
                          <FaCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleLeaveAction(leave._id, 'Rejected')}
                          className="flex items-center justify-center bg-red-600 text-white py-1 px-2 rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm"
                        >
                          <FaTimes className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Reject
                        </motion.button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <select
                  value={attendanceForm.userId}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, userId: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.username || u.email || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={attendanceForm.date}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={attendanceForm.status}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowMarkAttendanceModal(false)} className="px-4 py-2 border rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminAttendance;

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}