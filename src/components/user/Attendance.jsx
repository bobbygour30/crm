import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaCheckCircle, FaClock } from 'react-icons/fa';
import axios from 'axios';

function Attendance() {
  const token = localStorage.getItem('token');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [newLeave, setNewLeave] = useState({ 
    startDate: '', 
    endDate: '', 
    reasonType: '', 
    remarks: '', 
    customReason: '' 
  });
  const [showCustomReason, setShowCustomReason] = useState(false);

  useEffect(() => {
    fetchAttendance();
    fetchLeaves();
  }, []);

  const reasonOptions = [
    { value: 'Sick Leave', label: 'Sick Leave' },
    { value: 'Casual Leave', label: 'Casual Leave' },
    { value: 'Half Day', label: 'Half Day' },
    { value: 'Forget to Punch', label: 'Forget to Punch' },
    { value: 'Others', label: 'Others' }
  ];

  const handleReasonTypeChange = (e) => {
    const value = e.target.value;
    setNewLeave({ ...newLeave, reasonType: value });
    setShowCustomReason(value === 'Others');
    if (value !== 'Others') {
      setNewLeave(prev => ({ ...prev, customReason: '' }));
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/my-attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceRecords(res.data);
    } catch (err) {
      console.error('Fetch attendance error:', err);
      alert('Error fetching attendance records.');
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/my-leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(res.data);
    } catch (err) {
      console.error('Fetch leaves error:', err);
      alert('Error fetching leave requests.');
    }
  };

  const handleMarkAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (!attendanceRecords.some((record) => record.date === today)) {
      try {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/attendance`, {
          date: today,
          status: 'Present',
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAttendance();
        alert(`Attendance marked for ${today}. Notification sent to manager and admin.`);
      } catch (err) {
        console.error('Mark attendance error:', err);
        alert('Error marking attendance.');
      }
    } else {
      alert('Attendance already marked for today.');
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (newLeave.startDate && newLeave.endDate && newLeave.reasonType && newLeave.remarks) {
      let notes = newLeave.remarks;
      if (newLeave.reasonType === 'Others' && newLeave.customReason) {
        notes = `${newLeave.customReason} - ${newLeave.remarks}`;
      } else {
        notes = `${newLeave.reasonType} - ${newLeave.remarks}`;
      }
      try {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/leaves`, {
          title: newLeave.reasonType,
          from: newLeave.startDate,
          to: newLeave.endDate,
          notes: notes,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchLeaves();
        setNewLeave({ startDate: '', endDate: '', reasonType: '', remarks: '', customReason: '' });
        setShowCustomReason(false);
        alert('Leave request submitted. Notification sent to manager and admin.');
      } catch (err) {
        console.error('Apply leave error:', err);
        alert('Error applying for leave.');
      }
    } else {
      alert('Please fill all required fields.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mt-20 mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6 md:mb-8 tracking-tight">
        Attendance
      </h1>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4">Mark Attendance</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMarkAttendance}
          className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
        >
          <FaCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" /> Mark Today's Attendance
        </motion.button>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4">Apply for Leave</h2>
        <form onSubmit={handleApplyLeave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={newLeave.startDate}
              onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={newLeave.endDate}
              onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
              required
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason Type</label>
            <select
              value={newLeave.reasonType}
              onChange={handleReasonTypeChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
              required
            >
              <option value="">Select Reason Type</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {showCustomReason && (
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Reason (for Others)</label>
              <input
                type="text"
                placeholder="Enter custom reason"
                value={newLeave.customReason}
                onChange={(e) => setNewLeave({ ...newLeave, customReason: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                required
              />
            </div>
          )}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks *</label>
            <textarea
              placeholder="Enter remarks (mandatory)"
              value={newLeave.remarks}
              onChange={(e) => setNewLeave({ ...newLeave, remarks: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
              rows={3}
              required
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex justify-start">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              <FaPlus className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" /> Apply for Leave
            </motion.button>
          </div>
        </form>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4">Attendance Records</h2>
        <ul className="space-y-3">
          {attendanceRecords.map((record) => (
            <motion.li
              key={record._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm sm:text-base hover:bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-semibold text-gray-800">Date: {formatDate(record.date)}</p>
                <p className="text-sm text-gray-600">Status: {record.status}</p>
              </div>
              <FaCheckCircle className="text-green-600 h-4 w-4 sm:h-5 sm:w-5 mt-2 sm:mt-0" />
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4">Leave Requests</h2>
        <ul className="space-y-3">
          {leaveRequests.map((leave) => (
            <motion.li
              key={leave._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm sm:text-base hover:bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-semibold text-gray-800">From: {formatDate(leave.from)} To: {formatDate(leave.to)}</p>
                <p className="text-sm text-gray-600">Reason: {leave.notes}</p>
                <p className="text-sm text-gray-600">Applied: {formatDate(leave.createdAt)}</p>
              </div>
              <p
                className={`text-sm font-medium px-2 sm:px-3 py-1 rounded-full mt-2 sm:mt-0 ${
                  leave.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-600'
                    : leave.status === 'Approved'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {leave.status}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default Attendance;