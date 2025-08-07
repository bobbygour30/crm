import { motion } from 'framer-motion';
import { FaPencilAlt, FaTrash, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

function UserManagement({ users, setUsers }) {
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'User' });
  const [editUser, setEditUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.name && newUser.email) {
      setUsers([...users, { id: `${users.length + 1}`, ...newUser }]);
      setNewUser({ name: '', email: '', role: 'User' });
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const handleEditUser = (user) => {
    setEditUser({ ...user });
    setIsModalOpen(true);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (editUser?.name && editUser?.email) {
      setUsers(users.map((u) => (u.id === editUser.id ? { ...editUser } : u)));
      setIsModalOpen(false);
      setEditUser(null);
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditUser(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-6">User Management</h2>
      <div className="mb-8 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-4">Add New User</h3>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="sm:col-span-3 flex justify-start">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              Add User
            </motion.button>
          </div>
        </form>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
        {users.length === 0 ? (
          <p className="text-center text-gray-600 py-4 text-sm sm:text-base">No users available.</p>
        ) : (
          <table className="w-full table-auto min-w-[600px]">
            <thead>
              <tr className="bg-gray-100 text-left text-xs sm:text-sm">
                <th className="p-3 sm:p-4 font-medium text-gray-700">Name</th>
                <th className="p-3 sm:p-4 font-medium text-gray-700 hidden sm:table-cell">Role</th>
                <th className="p-3 sm:p-4 font-medium text-gray-700 hidden sm:table-cell">Email</th>
                <th className="p-3 sm:p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-b hover:bg-gray-50 text-xs sm:text-sm"
                >
                  <td className="p-3 sm:p-4">{user.name}</td>
                  <td className="p-3 sm:p-4 hidden sm:table-cell">{user.role}</td>
                  <td className="p-3 sm:p-4 hidden sm:table-cell">{user.email}</td>
                  <td className="p-3 sm:p-4 flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                    >
                      <FaPencilAlt className="h-4 w-4 sm:h-5 sm:w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <FaTrash className="h-4 w-4 sm:h-5 sm:w-5" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit User Modal */}
      {isModalOpen && editUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Edit User</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes className="h-5 w-5" />
              </motion.button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editUser.name || ''}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editUser.email || ''}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editUser.role || 'User'}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 text-sm sm:text-base"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                  Save
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default UserManagement;