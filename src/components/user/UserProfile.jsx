import { useState } from 'react';
import { motion } from 'framer-motion';

function UserProfile({ user }) {
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId || '',
    address: user.address || '',
    company: user.company || '',
    designation: user.designation || '',
    managerName: user.managerName || '',
    dateOfJoining: user.dateOfJoining || '',
    image: user.image || '',
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  return (
    <div className="space-y-6 mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 tracking-tight">
        Profile
      </h1>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Edit Profile</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            {profile.image && (
              <img
                src={profile.image}
                alt="Profile"
                className="mt-2 w-24 h-24 rounded-full object-cover"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              type="text"
              value={profile.employeeId}
              onChange={(e) => setProfile({ ...profile, employeeId: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={profile.role}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <input
              type="text"
              value={profile.designation}
              onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
            <input
              type="text"
              value={profile.managerName}
              onChange={(e) => setProfile({ ...profile, managerName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
            <input
              type="date"
              value={profile.dateOfJoining}
              onChange={(e) => setProfile({ ...profile, dateOfJoining: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Update Profile
          </motion.button>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;