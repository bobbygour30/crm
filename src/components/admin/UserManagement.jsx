// src/components/UserManagement.jsx
import { motion } from "framer-motion";
import { FaPencilAlt, FaTrash, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
    designation: "",
    role: "Employee",
    gst: "",
    pan: "",
    storeName: "",
    ownerName: "",
    cancelCheck: null,
    gstCertificate: null,
    assignedSalesperson: "",
  });
  const [editUser, setEditUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in as admin.");
        return;
      }
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error:", err);
      alert(err.response?.data?.msg || "Error fetching users.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role.toLowerCase() === 'admin') {
          setIsAdmin(true);
          fetchUsers();
        } else {
          alert("You are not authorized to access this page. Please log in as an admin.");
        }
      } catch (err) {
        console.error("Token decode error:", err);
        alert("Invalid token. Please log in again.");
      }
    } else {
      alert("Please log in as admin.");
    }
  }, []);

  if (!isAdmin) {
    return <div>Access Denied: Admin privileges required.</div>;
  }

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.mobile || !newUser.password) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    Object.keys(newUser).forEach((key) => {
      if (newUser[key] !== null && newUser[key] !== undefined) {
        formData.append(key, newUser[key]);
      }
    });

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchUsers();
      setNewUser({
        username: "",
        email: "",
        mobile: "",
        password: "",
        designation: "",
        role: "Employee",
        gst: "",
        pan: "",
        storeName: "",
        ownerName: "",
        cancelCheck: null,
        gstCertificate: null,
        assignedSalesperson: "",
      });
    } catch (err) {
      console.error("Add user error:", err);
      alert(err.response?.data?.msg || "Error adding user.");
    }
  };

  const handleEditUser = (user) => {
    setEditUser({
      ...user,
      username: user.username,
      password: "",
      cancelCheck: null,
      gstCertificate: null,
    });
    setIsModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(editUser).forEach((key) => {
      if (editUser[key] !== null && editUser[key] !== undefined && key !== "_id") {
        formData.append(key, editUser[key]);
      }
    });

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/auth/users/${editUser._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchUsers();
      setIsModalOpen(false);
      setEditUser(null);
    } catch (err) {
      console.error("Update user error:", err);
      alert(err.response?.data?.msg || "Error updating user.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
      } catch (err) {
        console.error("Delete user error:", err);
        alert(err.response?.data?.msg || "Error deleting user.");
      }
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
      <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>

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
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
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
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              required
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
            onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
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
          {newUser.role === "External Vendor" && (
            <>
              <input
                type="text"
                placeholder="GST"
                value={newUser.gst}
                onChange={(e) => setNewUser({ ...newUser, gst: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="PAN Card"
                value={newUser.pan}
                onChange={(e) => setNewUser({ ...newUser, pan: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Store/Outlet Name"
                value={newUser.storeName}
                onChange={(e) => setNewUser({ ...newUser, storeName: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Owner Name"
                value={newUser.ownerName}
                onChange={(e) => setNewUser({ ...newUser, ownerName: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cancel Check
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewUser({ ...newUser, cancelCheck: e.target.files[0] })}
                  className="p-3 border rounded-lg w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Certificate
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewUser({ ...newUser, gstCertificate: e.target.files[0] })}
                  className="p-3 border rounded-lg w-full"
                />
              </div>
              <input
                type="text"
                placeholder="Assign to Salesperson"
                value={newUser.assignedSalesperson}
                onChange={(e) => setNewUser({ ...newUser, assignedSalesperson: e.target.value })}
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

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
        {users.length === 0 ? (
          <p className="text-center py-4">No users available.</p>
        ) : (
          <table className="w-full table-auto min-w-[600px]">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 font-medium">Username</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Employee ID</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">{user.username}</td>
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
                      onClick={() => handleDeleteUser(user._id)}
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

      {isModalOpen && editUser && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit User</h3>
              <motion.button onClick={closeModal}>
                <FaTimes />
              </motion.button>
            </div>
            <form onSubmit={handleUpdateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Username"
                value={editUser.username || ""}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={editUser.email || ""}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Mobile Number"
                value={editUser.mobile || ""}
                onChange={(e) => setEditUser({ ...editUser, mobile: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password (optional)"
                  value={editUser.password || ""}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  className="w-full p-3 border rounded-lg"
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
                value={editUser.designation || ""}
                onChange={(e) => setEditUser({ ...editUser, designation: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <select
                value={editUser.role || "Employee"}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                className="p-3 border rounded-lg"
              >
                <option value="Employee">Employee</option>
                <option value="External Vendor">External Vendor</option>
                <option value="Admin">Admin</option>
              </select>
              {editUser.role === "External Vendor" && (
                <>
                  <input
                    type="text"
                    placeholder="GST"
                    value={editUser.gst || ""}
                    onChange={(e) => setEditUser({ ...editUser, gst: e.target.value })}
                    className="p-3 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="PAN Card"
                    value={editUser.pan || ""}
                    onChange={(e) => setEditUser({ ...editUser, pan: e.target.value })}
                    className="p-3 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Store/Outlet Name"
                    value={editUser.storeName || ""}
                    onChange={(e) => setEditUser({ ...editUser, storeName: e.target.value })}
                    className="p-3 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Owner Name"
                    value={editUser.ownerName || ""}
                    onChange={(e) => setEditUser({ ...editUser, ownerName: e.target.value })}
                    className="p-3 border rounded-lg"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cancel Check (re-upload to change)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setEditUser({ ...editUser, cancelCheck: e.target.files[0] })}
                      className="p-3 border rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST Certificate (re-upload to change)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setEditUser({ ...editUser, gstCertificate: e.target.files[0] })}
                      className="p-3 border rounded-lg w-full"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Assign to Salesperson"
                    value={editUser.assignedSalesperson || ""}
                    onChange={(e) => setEditUser({ ...editUser, assignedSalesperson: e.target.value })}
                    className="p-3 border rounded-lg"
                  />
                </>
              )}
              <div className="sm:col-span-2 flex justify-end space-x-2">
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