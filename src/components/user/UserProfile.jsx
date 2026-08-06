import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTrash, FaSpinner, FaEye, FaEyeSlash, FaUser, FaBuilding, 
  FaGraduationCap, FaIdCard, FaMapMarkerAlt, FaBriefcase, 
  FaPhone, FaEnvelope, FaCalendarAlt, FaUniversity, 
  FaFileImage, FaFilePdf, FaCheck 
} from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

function UserProfile({ user: initialUser }) {
  const [profile, setProfile] = useState({
    // Basic Info
    fullName: '',
    username: '',
    email: '',
    role: '',
    userType: '',
    employeeId: '',
    generatedCode: '',
    mobile: '',
    mobileNumber: '',
    image: '',
    
    // Personal Information
    fathersName: '',
    mothersName: '',
    dateOfBirth: '',
    qualification: '',
    otherQualification: '',
    aadhaarNumber: '',
    aadhaarFile: '',
    panNumber: '',
    panFile: '',
    
    // Address
    pinCode: '',
    state: '',
    city: '',
    village: '',
    block: '',
    
    // Contact
    alternateMobile: '',
    personalEmail: '',
    emergencyContact: '',
    
    // Bank Details
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankBranch: '',
    cancelCheck: '',
    
    // Employee fields
    officialEmail: '',
    department: '',
    designation: '',
    dateOfJoining: '',
    
    // Channel Partner fields
    organizationName: '',
    gstNumber: '',
    contactPersonName: '',
    contactMobile: '',
    contactEmail: '',
    address: '',
    interestedLobs: [],
    
    // Legacy fields
    gst: '',
    pan: '',
    storeName: '',
    ownerName: '',
    assignedSalesperson: '',
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view profile');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      
      if (data && !data.msg) {
        setProfile({
          // Basic Info
          fullName: data.fullName || data.name || '',
          username: data.username || '',
          email: data.email || '',
          role: data.role || '',
          userType: data.userType || data.role || 'Employee',
          employeeId: data.employeeId || '',
          generatedCode: data.generatedCode || '',
          mobile: data.mobile || data.mobileNumber || '',
          mobileNumber: data.mobileNumber || '',
          image: data.image || '',
          
          // Personal Information
          fathersName: data.fathersName || '',
          mothersName: data.mothersName || '',
          dateOfBirth: data.dateOfBirth || '',
          qualification: data.qualification || '',
          otherQualification: data.otherQualification || '',
          aadhaarNumber: data.aadhaarNumber || '',
          aadhaarFile: data.aadhaarFile || '',
          panNumber: data.panNumber || '',
          panFile: data.panFile || '',
          
          // Address
          pinCode: data.pinCode || '',
          state: data.state || '',
          city: data.city || '',
          village: data.village || '',
          block: data.block || '',
          
          // Contact
          alternateMobile: data.alternateMobile || '',
          personalEmail: data.personalEmail || '',
          emergencyContact: data.emergencyContact || '',
          
          // Bank Details
          bankName: data.bankName || '',
          bankAccountNumber: data.bankAccountNumber || '',
          ifscCode: data.ifscCode || '',
          bankBranch: data.bankBranch || '',
          cancelCheck: data.cancelCheck || '',
          
          // Employee fields
          officialEmail: data.officialEmail || '',
          department: data.department || '',
          designation: data.designation || '',
          dateOfJoining: data.dateOfJoining || '',
          
          // Channel Partner fields
          organizationName: data.organizationName || '',
          gstNumber: data.gstNumber || '',
          contactPersonName: data.contactPersonName || '',
          contactMobile: data.contactMobile || '',
          contactEmail: data.contactEmail || '',
          address: data.address || '',
          interestedLobs: data.interestedLobs || [],
          
          // Legacy fields
          gst: data.gst || '',
          pan: data.pan || '',
          storeName: data.storeName || '',
          ownerName: data.ownerName || '',
          assignedSalesperson: data.assignedSalesperson || '',
        });
      } else {
        setError(data.msg || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError('Failed to fetch profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setProfile({ ...profile, image: '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      
      // Append all profile fields
      Object.keys(profile).forEach(key => {
        if (profile[key] !== undefined && profile[key] !== null && key !== '_id') {
          if (Array.isArray(profile[key])) {
            formData.append(key, JSON.stringify(profile[key]));
          } else {
            formData.append(key, profile[key]);
          }
        }
      });
      
      // Append image if changed
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      // FIXED: Check response structure properly
      if (data.success) {
        // Update profile with the returned data
        if (data.profile) {
          setProfile(prev => ({
            ...prev,
            ...data.profile,
          }));
        }
        setImageFile(null);
        setImagePreview('');
        setSuccess(data.message || 'Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || data.msg || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setUpdatingPassword(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      // FIXED: Check response structure
      if (data.success) {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setSuccess(data.message || 'Password updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || data.msg || 'Failed to update password');
      }
    } catch (err) {
      console.error('Change password error:', err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleRemoveProfileImage = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/auth/image`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // FIXED: Check response structure
      if (data.success) {
        setProfile({ ...profile, image: '' });
        setImageFile(null);
        setImagePreview('');
        setSuccess(data.message || 'Profile image removed successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || data.msg || 'Failed to remove profile image');
      }
    } catch (err) {
      console.error('Remove image error:', err);
      setError(err.message || 'Failed to remove profile image');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  const isEmployee = profile.userType === 'Employee' || profile.role === 'Employee';
  const isChannelPartner = profile.userType === 'Channel Partner' || profile.role === 'External Vendor';

  return (
    <div className="space-y-6 mt-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Profile
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Change Password
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4" encType="multipart/form-data">
          {/* User Type Badge */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isEmployee ? "bg-blue-100 text-blue-800" :
              isChannelPartner ? "bg-orange-100 text-orange-800" :
              "bg-purple-100 text-purple-800"
            }`}>
              {profile.userType || profile.role || 'User'}
            </span>
            {profile.employeeId && (
              <span className="ml-3 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                ID: {profile.employeeId}
              </span>
            )}
            {profile.generatedCode && (
              <span className="ml-3 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Code: {profile.generatedCode}
              </span>
            )}
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
            <div className="relative w-full border-2 border-gray-300 border-dashed rounded-lg p-3 hover:border-indigo-500 transition-colors">
              <div className="text-center">
                {(imagePreview || profile.image) ? (
                  <div className="flex items-center justify-center space-x-4">
                    <img
                      src={imagePreview || profile.image}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                      {profile.image && !imageFile && (
                        <button
                          type="button"
                          onClick={handleRemoveProfileImage}
                          className="text-red-600 hover:text-red-800"
                          title="Remove from server"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">Upload profile image</p>
                    <p className="text-xs text-gray-500 mt-1">JPEG, PNG (max 2MB)</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaUser className="text-indigo-600" /> Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  value={profile.mobileNumber || profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                <input
                  type="text"
                  value={profile.fathersName}
                  onChange={(e) => setProfile({ ...profile, fathersName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                <input
                  type="text"
                  value={profile.mothersName}
                  onChange={(e) => setProfile({ ...profile, mothersName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Educational Qualification */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaGraduationCap className="text-indigo-600" /> Educational Qualification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Qualification</label>
                <input
                  type="text"
                  value={profile.qualification}
                  onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {profile.otherQualification && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Other Qualification</label>
                  <input
                    type="text"
                    value={profile.otherQualification}
                    onChange={(e) => setProfile({ ...profile, otherQualification: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* KYC Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaIdCard className="text-indigo-600" /> KYC Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                <input
                  type="text"
                  value={profile.aadhaarNumber}
                  onChange={(e) => setProfile({ ...profile, aadhaarNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                <input
                  type="text"
                  value={profile.panNumber}
                  onChange={(e) => setProfile({ ...profile, panNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="text-indigo-600" /> Address Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                <input
                  type="text"
                  value={profile.pinCode}
                  onChange={(e) => setProfile({ ...profile, pinCode: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Village</label>
                <input
                  type="text"
                  value={profile.village}
                  onChange={(e) => setProfile({ ...profile, village: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Block</label>
                <input
                  type="text"
                  value={profile.block}
                  onChange={(e) => setProfile({ ...profile, block: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaPhone className="text-indigo-600" /> Contact Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Alternate Mobile</label>
                <input
                  type="text"
                  value={profile.alternateMobile}
                  onChange={(e) => setProfile({ ...profile, alternateMobile: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Personal Email</label>
                <input
                  type="email"
                  value={profile.personalEmail}
                  onChange={(e) => setProfile({ ...profile, personalEmail: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                <input
                  type="text"
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaUniversity className="text-indigo-600" /> Bank Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  value={profile.bankName}
                  onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  value={profile.bankAccountNumber}
                  onChange={(e) => setProfile({ ...profile, bankAccountNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                <input
                  type="text"
                  value={profile.ifscCode}
                  onChange={(e) => setProfile({ ...profile, ifscCode: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Branch</label>
                <input
                  type="text"
                  value={profile.bankBranch}
                  onChange={(e) => setProfile({ ...profile, bankBranch: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Employee Only Fields */}
          {isEmployee && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaBriefcase className="text-indigo-600" /> Employment Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  <input
                    type="text"
                    value={profile.designation}
                    onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Official Email</label>
                  <input
                    type="email"
                    value={profile.officialEmail}
                    onChange={(e) => setProfile({ ...profile, officialEmail: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
                  <input
                    type="date"
                    value={profile.dateOfJoining}
                    onChange={(e) => setProfile({ ...profile, dateOfJoining: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Channel Partner Only Fields */}
          {isChannelPartner && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaBuilding className="text-indigo-600" /> Organization Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                    <input
                      type="text"
                      value={profile.organizationName}
                      onChange={(e) => setProfile({ ...profile, organizationName: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GST Number</label>
                    <input
                      type="text"
                      value={profile.gstNumber}
                      onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <input
                      type="text"
                      value={profile.contactPersonName}
                      onChange={(e) => setProfile({ ...profile, contactPersonName: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Mobile</label>
                    <input
                      type="text"
                      value={profile.contactMobile}
                      onChange={(e) => setProfile({ ...profile, contactMobile: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <input
                      type="email"
                      value={profile.contactEmail}
                      onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      rows="2"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Interested LOBs */}
              {profile.interestedLobs && profile.interestedLobs.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaFileImage className="text-indigo-600" /> Interested LOBs
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interestedLobs.map((lob, index) => (
                      <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        {lob}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Cancel Check (Bank Passbook) */}
          {profile.cancelCheck && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaFileImage className="text-indigo-600" /> Cancel Check
              </h4>
              <div className="flex items-center gap-3">
                <a
                  href={profile.cancelCheck}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline"
                >
                  View Cancel Check
                </a>
                {profile.cancelCheck.endsWith('.pdf') ? (
                  <FaFilePdf className="text-red-500 h-5 w-5" />
                ) : (
                  <FaFileImage className="text-green-500 h-5 w-5" />
                )}
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={updating}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <FaSpinner className="animate-spin" />
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </motion.button>
        </form>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setError('');
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {updatingPassword ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;