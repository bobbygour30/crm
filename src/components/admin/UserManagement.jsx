import { motion } from "framer-motion";
import { FaPencilAlt, FaTrash, FaTimes, FaUpload } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

function UserManagement({ users, setUsers }) {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    mobile: "",
    employeeId: "",
    password: "",
    designation: "",
    role: "Employee",
    gst: "",
    pan: "",
    storeName: "",
    ownerName: "",
    kycFiles: [],
    assignedSalesperson: "",
  });

  const [editUser, setEditUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-generate employee code
  const generateEmployeeCode = () => {
    return "EMP" + Math.floor(1000 + Math.random() * 9000);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.mobile) {
      alert("Please fill in all required fields.");
      return;
    }

    const userToAdd = {
      id: `${users.length + 1}`,
      ...newUser,
      employeeId: generateEmployeeCode(),
    };
    setUsers([...users, userToAdd]);

    // Reset form
    setNewUser({
      name: "",
      email: "",
      mobile: "",
      employeeId: "",
      password: "",
      designation: "",
      role: "Employee",
      gst: "",
      pan: "",
      storeName: "",
      ownerName: "",
      kycFiles: [],
      assignedSalesperson: "",
    });
  };

  const handleEditUser = (user) => {
    setEditUser({ ...user });
    setIsModalOpen(true);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    setUsers(users.map((u) => (u.id === editUser.id ? { ...editUser } : u)));
    setIsModalOpen(false);
    setEditUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  const handleFileUpload = (e) => {
    setNewUser({ ...newUser, kycFiles: [...e.target.files] });
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
      <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>

      {/* Add User Form */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
        <h3 className="text-xl font-medium text-gray-800 mb-4">
          Add New User / Vendor
        </h3>
        <form
          onSubmit={handleAddUser}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="p-3 border rounded-lg"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="p-3 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Mobile Number"
            value={newUser.mobile}
            onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
            className="p-3 border rounded-lg"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <input
            type="text"
            placeholder="Designation"
            value={newUser.designation}
            onChange={(e) =>
              setNewUser({ ...newUser, designation: e.target.value })
            }
            className="p-3 border rounded-lg"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="p-3 border rounded-lg"
          >
            <option value="Employee">Employee</option>
            <option value="External Vendor">External Vendor</option>
            <option value="Admin">Admin</option>
          </select>

          {/* Vendor Fields */}
          {/* Vendor Fields */}
          {newUser.role === "External Vendor" && (
            <>
              <input
                type="text"
                placeholder="GST"
                value={newUser.gst}
                onChange={(e) =>
                  setNewUser({ ...newUser, gst: e.target.value })
                }
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="PAN Card"
                value={newUser.pan}
                onChange={(e) =>
                  setNewUser({ ...newUser, pan: e.target.value })
                }
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Store/Outlet Name"
                value={newUser.storeName}
                onChange={(e) =>
                  setNewUser({ ...newUser, storeName: e.target.value })
                }
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Owner Name"
                value={newUser.ownerName}
                onChange={(e) =>
                  setNewUser({ ...newUser, ownerName: e.target.value })
                }
                className="p-3 border rounded-lg"
              />

              {/* Separate document uploads */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cancel Check
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewUser({ ...newUser, cancelCheck: e.target.files[0] })
                  }
                  className="p-3 border rounded-lg w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Certificate
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      gstCertificate: e.target.files[0],
                    })
                  }
                  className="p-3 border rounded-lg w-full"
                />
              </div>

              <input
                type="text"
                placeholder="Assign to Salesperson"
                value={newUser.assignedSalesperson}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    assignedSalesperson: e.target.value,
                  })
                }
                className="p-3 border rounded-lg"
              />
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="sm:col-span-2 bg-indigo-600 text-white py-2 px-4 rounded-lg"
          >
            Add User
          </motion.button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
        {users.length === 0 ? (
          <p className="text-center py-4">No users available.</p>
        ) : (
          <table className="w-full table-auto min-w-[600px]">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Employee ID</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.employeeId}</td>
                  <td className="p-3 flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                    >
                      <FaPencilAlt />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <FaTrash />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editUser && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit User</h3>
              <motion.button onClick={closeModal}>
                <FaTimes />
              </motion.button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <input
                type="text"
                value={editUser.name || ""}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="email"
                value={editUser.email || ""}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
                className="p-3 border rounded-lg w-full"
              />
              <select
                value={editUser.role || "Employee"}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: e.target.value })
                }
                className="p-3 border rounded-lg w-full"
              >
                <option value="Employee">Employee</option>
                <option value="External Vendor">External Vendor</option>
                <option value="Admin">Admin</option>
              </select>
              <div className="flex justify-end space-x-2">
                <motion.button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
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
