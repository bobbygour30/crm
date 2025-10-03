import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaCheckCircle, FaClock } from 'react-icons/fa';

function Attendance({ user }) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [newLeave, setNewLeave] = useState({ startDate: '', endDate: '', reason: '' });

  const handleMarkAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    if (!attendanceRecords.some((record) => record.date === today)) {
      setAttendanceRecords([...attendanceRecords, { id: `${attendanceRecords.length + 1}`, date: today, status: 'Present' }]);
      alert(`Attendance marked for ${today}. Notification sent to manager and admin.`);
    } else {
      alert('Attendance already marked for today.');
    }
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (newLeave.startDate && newLeave.endDate && newLeave.reason) {
      setLeaveRequests([...leaveRequests, { 
        id: `${leaveRequests.length + 1}`, 
        ...newLeave, 
        status: 'Pending',
        appliedDate: new Date().toISOString().split('T')[0]
      }]);
      setNewLeave({ startDate: '', endDate: '', reason: '' });
      alert('Leave request submitted. Notification sent to manager and admin.');
    } else {
      alert('Please fill all leave request fields.');
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input
              type="text"
              placeholder="Reason for leave"
              value={newLeave.reason}
              onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
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
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm sm:text-base hover:bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-semibold text-gray-800">Date: {record.date}</p>
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
              key={leave.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm sm:text-base hover:bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-semibold text-gray-800">From: {leave.startDate} To: {leave.endDate}</p>
                <p className="text-sm text-gray-600">Reason: {leave.reason}</p>
                <p className="text-sm text-gray-600">Applied: {leave.appliedDate}</p>
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

export default Attendance;