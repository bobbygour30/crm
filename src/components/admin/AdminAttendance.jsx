import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes } from 'react-icons/fa';

// Mock data for attendance and leave requests
const mockAttendanceData = [
  { id: '1', userId: '1', date: '2025-08-01', status: 'Present' },
  { id: '2', userId: '2', date: '2025-08-01', status: 'Present' },
  { id: '3', userId: '1', date: '2025-08-02', status: 'Absent' },
];
const mockLeaveRequests = [
  { id: '1', userId: '1', startDate: '2025-08-05', endDate: '2025-08-07', reason: 'Personal', status: 'Pending', appliedDate: '2025-08-01' },
  { id: '2', userId: '2', startDate: '2025-08-10', endDate: '2025-08-12', reason: 'Medical', status: 'Pending', appliedDate: '2025-08-02' },
];

function AdminAttendance({ users }) {
  const [attendanceRecords, setAttendanceRecords] = useState(mockAttendanceData);
  const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests);

  const handleLeaveAction = (leaveId, action) => {
    setLeaveRequests(leaveRequests.map((leave) =>
      leave.id === leaveId ? { ...leave, status: action } : leave
    ));
    alert(`Leave request ${action.toLowerCase()} for leave ID ${leaveId}.`);
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6 md:mb-8 tracking-tight">
        Attendance Management
      </h1>
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
                  key={record.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-3">{getUserName(record.userId)}</td>
                  <td className="p-3">{record.date}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                        record.status === 'Present'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
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
                  key={leave.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-3">{getUserName(leave.userId)}</td>
                    <td className="p-3">{leave.startDate}</td>
                    <td className="p-3">{leave.endDate}</td>
                    <td className="p-3">{leave.reason}</td>
                    <td className="p-3">{leave.appliedDate}</td>
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
                            onClick={() => handleLeaveAction(leave.id, 'Approved')}
                            className="flex items-center justify-center bg-green-600 text-white py-1 px-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                          >
                            <FaCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLeaveAction(leave.id, 'Rejected')}
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
      </div>
    );
  }
  
  export default AdminAttendance;