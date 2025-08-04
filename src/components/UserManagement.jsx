import { motion } from 'framer-motion';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

function UserManagement({ users }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-3 xs:p-4 sm:p-6 rounded-xl shadow-md"
    >
      <h2 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-800 mb-3 xs:mb-4 sm:mb-6">
        User Management
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto min-w-[200px]">
          <thead>
            <tr className="bg-gray-100 text-left text-xs xs:text-sm sm:text-base">
              <th className="p-2 xs:p-3 sm:p-4">Name</th>
              <th className="p-2 xs:p-3 sm:p-4 hidden xs:table-cell">Role</th>
              <th className="p-2 xs:p-3 sm:p-4 hidden xs:table-cell">Email</th>
              <th className="p-2 xs:p-3 sm:p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b hover:bg-gray-50 text-xs xs:text-sm sm:text-base"
              >
                <td className="p-2 xs:p-3 sm:p-4">{user.name}</td>
                <td className="p-2 xs:p-3 sm:p-4 hidden xs:table-cell">{user.role}</td>
                <td className="p-2 xs:p-3 sm:p-4 hidden xs:table-cell">{user.email}</td>
                <td className="p-2 xs:p-3 sm:p-4 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 p-1">
                    <FaPencilAlt className="h-4 w-4 xs:h-5 xs:w-5" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 p-1">
                    <FaTrash className="h-4 w-4 xs:h-5 xs:w-5" />
                  </button>
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