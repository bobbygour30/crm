import { motion } from 'framer-motion';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { useState } from 'react';

function UserManagement({ users, setUsers }) {
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'User' });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.name && newUser.email) {
      setUsers([...users, { id: `${users.length + 1}`, ...newUser }]);
      setNewUser({ name: '', email: '', role: 'User' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100"
    >
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">User Management</h2>
      <div className="mb-8 bg-gray-50 p-4 rounded-xl">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Add New User</h3>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          <button
            type="submit"
            className="btn-primary col-span-1 sm:col-span-3 sm:w-32 flex items-center justify-center bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add User
          </button>
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto min-w-[200px]">
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
                    className="text-indigo-600 hover:text-indigo-800 p-1"
                  >
                    <FaPencilAlt className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <FaTrash className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default UserManagement;