import { motion } from "framer-motion";
import {
  FaPencilAlt,
  FaTrash,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaBuilding,
  FaGraduationCap,
  FaIdCard,
  FaMapMarkerAlt,
  FaBriefcase,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaCheck,
  FaSpinner,
  FaUserPlus,
  FaStore,
  FaHandshake,
  FaUsers,
  FaUserTie,
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaExclamationCircle,
  FaUniversity,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [pinFetchError, setPinFetchError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [validationPopup, setValidationPopup] = useState({ show: false, errors: [] });

  // Department and Designation options
  const DEPARTMENT_OPTIONS = [
    "Sales",
    "Marketing",
    "Operations",
    "IT",
    "HR",
    "Finance",
    "Customer Service",
    "Claims",
    "Underwriting",
    "Legal",
    "Compliance",
    "Risk Management",
    "Product Development",
    "Business Development",
    "Other"
  ];

  const DESIGNATION_OPTIONS = {
    "Sales": ["Sales Executive", "Senior Sales Executive", "Sales Manager", "Regional Sales Manager", "Sales Director"],
    "Marketing": ["Marketing Executive", "Digital Marketing Specialist", "Marketing Manager", "Brand Manager"],
    "Operations": ["Operations Executive", "Operations Manager", "Senior Operations Manager", "VP Operations"],
    "IT": ["IT Executive", "Software Developer", "IT Manager", "System Administrator", "CTO"],
    "HR": ["HR Executive", "HR Manager", "Senior HR Manager", "HR Director"],
    "Finance": ["Finance Executive", "Accountant", "Finance Manager", "CFO"],
    "Customer Service": ["Customer Service Executive", "Team Lead", "Customer Service Manager"],
    "Claims": ["Claims Executive", "Claims Manager", "Senior Claims Manager"],
    "Underwriting": ["Underwriter", "Senior Underwriter", "Underwriting Manager"],
    "Legal": ["Legal Executive", "Legal Manager", "Legal Head"],
    "Compliance": ["Compliance Executive", "Compliance Manager", "Compliance Head"],
    "Risk Management": ["Risk Analyst", "Risk Manager", "Senior Risk Manager"],
    "Product Development": ["Product Executive", "Product Manager", "Senior Product Manager"],
    "Business Development": ["BD Executive", "BD Manager", "BD Director"],
    "Other": ["Other"]
  };

  // Qualification options
  const QUALIFICATION_OPTIONS = [
    "Matriculation",
    "Intermediate",
    "Under Graduate",
    "Post Graduate",
    "Others"
  ];

  // LOB options for vendors
  const LOB_OPTIONS = [
    "Health Insurance",
    "Motor Insurance",
    "Mobile/Electronic Equipment Insurance",
    "Private Car-OD",
    "Private Car-SOD",
    "Private Car-Comprehensive",
    "Private Car-TP",
    "Taxi-Comprehensive",
    "Taxi-TP",
    "Commercial Vehicle-Comprehensive",
    "Commercial Vehicle-TP",
    "E-Rikshaw-TP",
    "E-Rikshaw-Comprehensive",
    "Two-Wheeler-TP",
    "My Home",
    "Mediclaim Health Insurance",
    "Bharat Sookshma Udyam Suraksha",
    "Bharat Laghu Udyam Suraksha",
    "Bharat Grih Raksha",
    "Burglary",
    "MARINE-OPEN",
    "MARINE-SPECIFIC",
    "MARINE-STOP",
    "PERSONAL ACCIDENT",
    "Employee Compensation",
    "Group Health Insurance",
    "Terms Insurance",
    "Ulip Plan",
    "Traditional Plan",
    "Travel Insurance",
    "New Vehicle Insurance",
    "New Two Wheeler Insurance",
    "Other Insurance",
  ];

  // User Types
  const USER_TYPES = ["Employee", "Channel Partner", "Admin"];

  // New User State
  const [newUser, setNewUser] = useState({
    userType: "Employee",
    fullName: "",
    fathersName: "",
    mothersName: "",
    dateOfBirth: "",
    qualification: "",
    otherQualification: "",
    aadhaarNumber: "",
    aadhaarFile: null,
    panNumber: "",
    panFile: null,
    tenthMarksheet: null,
    twelfthMarksheet: null,
    ugMarksheet: null,
    pgMarksheet: null,
    pinCode: "",
    state: "",
    city: "",
    village: "",
    block: "",
    department: "",
    designation: "",
    mobileNumber: "",
    alternateMobile: "",
    personalEmail: "",
    officialEmail: "",
    emergencyContact: "",
    dateOfJoining: "",
    employeeId: "",
    bankName: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankBranch: "",
    organizationName: "",
    gstNumber: "",
    contactPersonName: "",
    contactMobile: "",
    contactEmail: "",
    address: "",
    interestedLobs: [],
    generatedCode: "",
    cancelCheck: null,
    password: "",
    username: "",
    email: "",
    mobile: "",
    role: "Employee",
    gst: "",
    pan: "",
    storeName: "",
    ownerName: "",
    gstCertificate: null,
    aadharCard: null,
    assignedSalesperson: "",
  });

  const [editUserState, setEditUserState] = useState({
    userType: "Employee",
    fullName: "",
    fathersName: "",
    mothersName: "",
    dateOfBirth: "",
    qualification: "",
    otherQualification: "",
    aadhaarNumber: "",
    aadhaarFile: null,
    panNumber: "",
    panFile: null,
    tenthMarksheet: null,
    twelfthMarksheet: null,
    ugMarksheet: null,
    pgMarksheet: null,
    pinCode: "",
    state: "",
    city: "",
    village: "",
    block: "",
    department: "",
    designation: "",
    mobileNumber: "",
    alternateMobile: "",
    personalEmail: "",
    officialEmail: "",
    emergencyContact: "",
    dateOfJoining: "",
    employeeId: "",
    bankName: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankBranch: "",
    organizationName: "",
    gstNumber: "",
    contactPersonName: "",
    contactMobile: "",
    contactEmail: "",
    address: "",
    interestedLobs: [],
    generatedCode: "",
    cancelCheck: null,
    password: "",
    username: "",
    email: "",
    mobile: "",
    role: "Employee",
    gst: "",
    pan: "",
    storeName: "",
    ownerName: "",
    gstCertificate: null,
    aadharCard: null,
    assignedSalesperson: "",
    _id: "",
  });

  // Helper Functions
  const validateAadhaar = (aadhaar) => /^[0-9]{12}$/.test(aadhaar);
  const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  const validatePIN = (pin) => /^[0-9]{6}$/.test(pin);
  const validateMobile = (mobile) => /^[0-9]{10}$/.test(mobile);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateIFSC = (ifsc) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  const validateBankAccount = (acc) => /^[0-9]{9,18}$/.test(acc);

  const generateEmployeeId = (users) => {
    let maxNumber = 0;
    users.forEach(user => {
      if (user.employeeId && user.employeeId.startsWith('ARS')) {
        const num = parseInt(user.employeeId.replace('ARS', ''));
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    const newNumber = maxNumber + 1;
    return `ARS${String(newNumber).padStart(4, '0')}`;
  };

  const generateChannelPartnerCode = (users) => {
    const prefix = 'CP';
    let maxNumber = 0;
    users.forEach(user => {
      if (user.generatedCode && user.generatedCode.startsWith(prefix)) {
        const num = parseInt(user.generatedCode.replace(prefix, ''));
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    const newNumber = maxNumber + 1;
    return `${prefix}${String(newNumber).padStart(4, '0')}`;
  };

  const fetchCityState = async (pinCode) => {
    setIsFetchingPin(true);
    setPinFetchError("");
    
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
      const data = await response.json();
      
      if (data && data[0]?.Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setNewUser(prev => ({
          ...prev,
          state: postOffice.State || "",
          city: postOffice.District || postOffice.Name || "",
        }));
        setPinFetchError("");
      } else {
        setNewUser(prev => ({ ...prev, state: "", city: "" }));
        setPinFetchError("Invalid PIN code");
      }
    } catch (error) {
      console.error("Error fetching city/state:", error);
      setNewUser(prev => ({ ...prev, state: "", city: "" }));
      setPinFetchError("Could not fetch location");
    } finally {
      setIsFetchingPin(false);
    }
  };

  const fetchEditCityState = async (pinCode) => {
    setIsFetchingPin(true);
    setPinFetchError("");
    
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
      const data = await response.json();
      
      if (data && data[0]?.Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setEditUserState(prev => ({
          ...prev,
          state: postOffice.State || "",
          city: postOffice.District || postOffice.Name || "",
        }));
        setPinFetchError("");
      } else {
        setEditUserState(prev => ({ ...prev, state: "", city: "" }));
        setPinFetchError("Invalid PIN code");
      }
    } catch (error) {
      console.error("Error fetching city/state:", error);
      setEditUserState(prev => ({ ...prev, state: "", city: "" }));
      setPinFetchError("Could not fetch location");
    } finally {
      setIsFetchingPin(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in as admin.");
        return;
      }
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
        if (decoded.role.toLowerCase() === "admin") {
          setIsAdmin(true);
          fetchUsers();
        } else {
          alert(
            "You are not authorized to access this page. Please log in as an admin."
          );
        }
      } catch (err) {
        console.error("Token decode error:", err);
        alert("Invalid token. Please log in again.");
      }
    } else {
      alert("Please log in as admin.");
    }
  }, []);

  // Auto-generate codes when user type changes
  useEffect(() => {
    if (newUser.userType === "Employee" && !newUser.employeeId) {
      const id = generateEmployeeId(users);
      setNewUser(prev => ({ ...prev, employeeId: id }));
    } else if (newUser.userType === "Channel Partner" && !newUser.generatedCode) {
      const code = generateChannelPartnerCode(users);
      setNewUser(prev => ({ ...prev, generatedCode: code }));
    }
  }, [newUser.userType, users]);

  // Auto-fetch state/city when PIN changes
  useEffect(() => {
    if (newUser.pinCode && validatePIN(newUser.pinCode)) {
      fetchCityState(newUser.pinCode);
    } else if (newUser.pinCode && newUser.pinCode.length > 0 && newUser.pinCode.length < 6) {
      setPinFetchError("Enter 6 digits");
    } else {
      if (!newUser.pinCode || newUser.pinCode.length === 0) {
        setNewUser(prev => ({ ...prev, state: "", city: "" }));
        setPinFetchError("");
      }
    }
  }, [newUser.pinCode]);

  useEffect(() => {
    if (editUserState.pinCode && validatePIN(editUserState.pinCode)) {
      fetchEditCityState(editUserState.pinCode);
    } else if (editUserState.pinCode && editUserState.pinCode.length > 0 && editUserState.pinCode.length < 6) {
      setPinFetchError("Enter 6 digits");
    } else {
      if (!editUserState.pinCode || editUserState.pinCode.length === 0) {
        setEditUserState(prev => ({ ...prev, state: "", city: "" }));
        setPinFetchError("");
      }
    }
  }, [editUserState.pinCode]);

  // ============================================
  // FIXED: handleUserTypeChange - Clear stale fields
  // ============================================
  const handleUserTypeChange = (type, isEdit = false) => {
    if (isEdit) {
      setEditUserState(prev => ({ 
        ...prev, 
        userType: type,
        employeeId: "",
        generatedCode: ""
      }));
    } else {
      // Clear all stale fields first
      setNewUser(prev => ({ 
        ...prev, 
        userType: type, 
        employeeId: "", 
        generatedCode: "" 
      }));
      
      // Then set the appropriate code for the selected type
      if (type === "Employee") {
        const id = generateEmployeeId(users);
        setNewUser(prev => ({ ...prev, employeeId: id }));
      } else if (type === "Channel Partner") {
        const code = generateChannelPartnerCode(users);
        setNewUser(prev => ({ ...prev, generatedCode: code }));
      }
    }
  };

  const handleLOBChange = (lob, isEdit = false) => {
    if (isEdit) {
      const current = editUserState.interestedLobs || [];
      const updated = current.includes(lob) 
        ? current.filter(item => item !== lob)
        : [...current, lob];
      setEditUserState(prev => ({ ...prev, interestedLobs: updated }));
    } else {
      const current = newUser.interestedLobs || [];
      const updated = current.includes(lob) 
        ? current.filter(item => item !== lob)
        : [...current, lob];
      setNewUser(prev => ({ ...prev, interestedLobs: updated }));
    }
  };

  const handleSelectAllLOBs = (isEdit = false) => {
    if (isEdit) {
      setEditUserState(prev => ({ ...prev, interestedLobs: [...LOB_OPTIONS] }));
    } else {
      setNewUser(prev => ({ ...prev, interestedLobs: [...LOB_OPTIONS] }));
    }
  };

  const handleClearAllLOBs = (isEdit = false) => {
    if (isEdit) {
      setEditUserState(prev => ({ ...prev, interestedLobs: [] }));
    } else {
      setNewUser(prev => ({ ...prev, interestedLobs: [] }));
    }
  };

  const validateAllFields = (userData, isEdit = false) => {
    const errors = {};
    const errorList = [];

    const isEmployee = userData.userType === "Employee";
    const isChannelPartner = userData.userType === "Channel Partner";

    // Common validations for Employee & Channel Partner
    if (isEmployee || isChannelPartner) {
      // Personal Information
      if (!userData.fullName) {
        errors.fullName = "Full Name is required";
        errorList.push({ field: "fullName", message: "Full Name is required" });
      }
      if (!userData.fathersName) {
        errors.fathersName = "Father's Name is required";
        errorList.push({ field: "fathersName", message: "Father's Name is required" });
      }
      if (!userData.mothersName) {
        errors.mothersName = "Mother's Name is required";
        errorList.push({ field: "mothersName", message: "Mother's Name is required" });
      }
      if (!userData.dateOfBirth) {
        errors.dateOfBirth = "Date of Birth is required";
        errorList.push({ field: "dateOfBirth", message: "Date of Birth is required" });
      }

      // Educational Qualification
      if (!userData.qualification) {
        errors.qualification = "Qualification is required";
        errorList.push({ field: "qualification", message: "Qualification is required" });
      }
      if (userData.qualification === "Others" && !userData.otherQualification) {
        errors.otherQualification = "Please specify your qualification";
        errorList.push({ field: "otherQualification", message: "Please specify your qualification" });
      }

      // Aadhaar
      if (userData.aadhaarNumber && !validateAadhaar(userData.aadhaarNumber)) {
        errors.aadhaarNumber = "Aadhaar must be exactly 12 digits";
        errorList.push({ field: "aadhaarNumber", message: "Aadhaar must be exactly 12 digits" });
      }

      // PAN
      if (userData.panNumber && !validatePAN(userData.panNumber)) {
        errors.panNumber = "PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)";
        errorList.push({ field: "panNumber", message: "PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)" });
      }

      // Address
      if (!userData.pinCode) {
        errors.pinCode = "PIN Code is required";
        errorList.push({ field: "pinCode", message: "PIN Code is required" });
      }
      if (userData.pinCode && !validatePIN(userData.pinCode)) {
        errors.pinCode = "Enter valid 6-digit PIN code";
        errorList.push({ field: "pinCode", message: "Enter valid 6-digit PIN code" });
      }
      if (!userData.village) {
        errors.village = "Village is required";
        errorList.push({ field: "village", message: "Village is required" });
      }
      if (!userData.block) {
        errors.block = "Block is required";
        errorList.push({ field: "block", message: "Block is required" });
      }

      // Contact Details
      if (!userData.mobileNumber) {
        errors.mobileNumber = "Mobile Number is required";
        errorList.push({ field: "mobileNumber", message: "Mobile Number is required" });
      }
      if (userData.mobileNumber && !validateMobile(userData.mobileNumber)) {
        errors.mobileNumber = "Enter valid 10-digit mobile number";
        errorList.push({ field: "mobileNumber", message: "Enter valid 10-digit mobile number" });
      }
      if (userData.personalEmail && !validateEmail(userData.personalEmail)) {
        errors.personalEmail = "Invalid email format";
        errorList.push({ field: "personalEmail", message: "Invalid email format" });
      }

      // Bank Details - Required for both Employee and Channel Partner
      if (!userData.bankName) {
        errors.bankName = "Bank Name is required";
        errorList.push({ field: "bankName", message: "Bank Name is required" });
      }
      if (!userData.bankAccountNumber) {
        errors.bankAccountNumber = "Bank Account Number is required";
        errorList.push({ field: "bankAccountNumber", message: "Bank Account Number is required" });
      }
      if (userData.bankAccountNumber && !validateBankAccount(userData.bankAccountNumber)) {
        errors.bankAccountNumber = "Enter valid bank account number (9-18 digits)";
        errorList.push({ field: "bankAccountNumber", message: "Enter valid bank account number (9-18 digits)" });
      }
      if (!userData.ifscCode) {
        errors.ifscCode = "IFSC Code is required";
        errorList.push({ field: "ifscCode", message: "IFSC Code is required" });
      }
      if (userData.ifscCode && !validateIFSC(userData.ifscCode)) {
        errors.ifscCode = "Invalid IFSC Code format (e.g., SBIN0001234)";
        errorList.push({ field: "ifscCode", message: "Invalid IFSC Code format (e.g., SBIN0001234)" });
      }
      if (!userData.bankBranch) {
        errors.bankBranch = "Bank Branch is required";
        errorList.push({ field: "bankBranch", message: "Bank Branch is required" });
      }

      // Cancel Check - Required for both Employee and Channel Partner (New users only)
      if (!isEdit && !userData.cancelCheck) {
        errors.cancelCheck = "Cancel Check image/PDF is required";
        errorList.push({ field: "cancelCheck", message: "Cancel Check image/PDF is required" });
      }
    }

    // Employee-only validations
    if (isEmployee) {
      // Official Details
      if (!userData.department) {
        errors.department = "Department is required";
        errorList.push({ field: "department", message: "Department is required" });
      }
      if (!userData.designation) {
        errors.designation = "Designation is required";
        errorList.push({ field: "designation", message: "Designation is required" });
      }

      // Official Email (Employee only)
      if (userData.officialEmail && !validateEmail(userData.officialEmail)) {
        errors.officialEmail = "Invalid email format";
        errorList.push({ field: "officialEmail", message: "Invalid email format" });
      }

      // Employment Details
      if (!userData.dateOfJoining) {
        errors.dateOfJoining = "Date of Joining is required";
        errorList.push({ field: "dateOfJoining", message: "Date of Joining is required" });
      }
    }

    // Channel Partner validations
    if (isChannelPartner) {
      if (!userData.organizationName) {
        errors.organizationName = "Organization Name is required";
        errorList.push({ field: "organizationName", message: "Organization Name is required" });
      }
      if (!userData.contactPersonName) {
        errors.contactPersonName = "Contact Person Name is required";
        errorList.push({ field: "contactPersonName", message: "Contact Person Name is required" });
      }
      if (!userData.contactMobile) {
        errors.contactMobile = "Mobile Number is required";
        errorList.push({ field: "contactMobile", message: "Mobile Number is required" });
      }
      if (userData.contactMobile && !validateMobile(userData.contactMobile)) {
        errors.contactMobile = "Enter valid 10-digit mobile number";
        errorList.push({ field: "contactMobile", message: "Enter valid 10-digit mobile number" });
      }
      if (userData.contactEmail && !validateEmail(userData.contactEmail)) {
        errors.contactEmail = "Invalid email format";
        errorList.push({ field: "contactEmail", message: "Invalid email format" });
      }
      if (!userData.address) {
        errors.address = "Address is required";
        errorList.push({ field: "address", message: "Address is required" });
      }
    }

    // Password for new user
    if (!isEdit && !userData.password) {
      errors.password = "Password is required";
      errorList.push({ field: "password", message: "Password is required" });
    }

    setValidationErrors(errors);
    
    if (errorList.length > 0) {
      setValidationPopup({ show: true, errors: errorList });
      return false;
    }
    
    return true;
  };

  const scrollToError = (fieldName) => {
    setValidationPopup({ show: false, errors: [] });
    
    let element = document.querySelector(`[name="${fieldName}"]`);
    if (!element) {
      element = document.querySelector(`[data-field="${fieldName}"]`);
    }
    if (!element) {
      element = document.getElementById(fieldName);
    }
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
      element.style.borderColor = '#ef4444';
      element.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.3)';
      setTimeout(() => {
        element.style.borderColor = '';
        element.style.boxShadow = '';
      }, 3000);
    }
  };

  // ============================================
  // FIXED: Handle Add User - Clear stale fields
  // ============================================
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!validateAllFields(newUser, false)) {
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    
    // Process all fields properly
    Object.keys(newUser).forEach((key) => {
      if (newUser[key] !== null && newUser[key] !== undefined && key !== '') {
        // Handle file fields
        if (key === 'aadhaarFile' || key === 'panFile' || 
            key === 'tenthMarksheet' || key === 'twelfthMarksheet' ||
            key === 'ugMarksheet' || key === 'pgMarksheet' ||
            key === 'cancelCheck' || key === 'gstCertificate' || 
            key === 'aadharCard') {
          if (newUser[key] instanceof File) {
            formData.append(key, newUser[key]);
          }
          // If it's a string URL (existing file), skip it
        } else if (key === 'interestedLobs') {
          // Convert array to JSON string
          if (Array.isArray(newUser[key])) {
            formData.append(key, JSON.stringify(newUser[key]));
          }
        } else {
          // Convert all values to string to avoid issues
          const value = newUser[key] !== null && newUser[key] !== undefined ? String(newUser[key]) : '';
          formData.append(key, value);
        }
      }
    });

    // Add role for backward compatibility
    formData.append('role', newUser.userType);
    formData.append('username', newUser.userType === 'Employee' ? newUser.fullName : newUser.organizationName);
    formData.append('email', newUser.userType === 'Employee' ? newUser.officialEmail || newUser.personalEmail : newUser.contactEmail);
    formData.append('mobile', newUser.userType === 'Employee' ? newUser.mobileNumber : newUser.contactMobile);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log('User added successfully:', response.data);
      fetchUsers();
      resetNewUserForm();
      alert("User added successfully!");
    } catch (err) {
      console.error("Add user error:", err);
      
      // Show detailed error message
      let errorMsg = "Error adding user.";
      if (err.response) {
        if (err.response.data.errors) {
          errorMsg = err.response.data.errors.join('\n');
        } else if (err.response.data.msg) {
          errorMsg = err.response.data.msg;
        }
      }
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // FIXED: resetNewUserForm - Clear all fields properly
  // ============================================
  const resetNewUserForm = () => {
    setNewUser({
      userType: "Employee",
      fullName: "",
      fathersName: "",
      mothersName: "",
      dateOfBirth: "",
      qualification: "",
      otherQualification: "",
      aadhaarNumber: "",
      aadhaarFile: null,
      panNumber: "",
      panFile: null,
      tenthMarksheet: null,
      twelfthMarksheet: null,
      ugMarksheet: null,
      pgMarksheet: null,
      pinCode: "",
      state: "",
      city: "",
      village: "",
      block: "",
      department: "",
      designation: "",
      mobileNumber: "",
      alternateMobile: "",
      personalEmail: "",
      officialEmail: "",
      emergencyContact: "",
      dateOfJoining: "",
      employeeId: generateEmployeeId(users),
      bankName: "",
      bankAccountNumber: "",
      ifscCode: "",
      bankBranch: "",
      organizationName: "",
      gstNumber: "",
      contactPersonName: "",
      contactMobile: "",
      contactEmail: "",
      address: "",
      interestedLobs: [],
      generatedCode: "",
      cancelCheck: null,
      password: "",
      username: "",
      email: "",
      mobile: "",
      role: "Employee",
      gst: "",
      pan: "",
      storeName: "",
      ownerName: "",
      gstCertificate: null,
      aadharCard: null,
      assignedSalesperson: "",
    });
    setValidationErrors({});
    setValidationPopup({ show: false, errors: [] });
  };

  const handleEditUser = (user) => {
    setEditUserState({
      _id: user._id,
      userType: user.userType || user.role || "Employee",
      fullName: user.fullName || user.username || "",
      fathersName: user.fathersName || "",
      mothersName: user.mothersName || "",
      dateOfBirth: user.dateOfBirth || "",
      qualification: user.qualification || "",
      otherQualification: user.otherQualification || "",
      aadhaarNumber: user.aadhaarNumber || "",
      aadhaarFile: null,
      panNumber: user.panNumber || "",
      panFile: null,
      tenthMarksheet: null,
      twelfthMarksheet: null,
      ugMarksheet: null,
      pgMarksheet: null,
      pinCode: user.pinCode || "",
      state: user.state || "",
      city: user.city || "",
      village: user.village || "",
      block: user.block || "",
      department: user.department || "",
      designation: user.designation || "",
      mobileNumber: user.mobileNumber || "",
      alternateMobile: user.alternateMobile || "",
      personalEmail: user.personalEmail || "",
      officialEmail: user.officialEmail || "",
      emergencyContact: user.emergencyContact || "",
      dateOfJoining: user.dateOfJoining || "",
      employeeId: user.employeeId || "",
      bankName: user.bankName || "",
      bankAccountNumber: user.bankAccountNumber || "",
      ifscCode: user.ifscCode || "",
      bankBranch: user.bankBranch || "",
      organizationName: user.organizationName || user.storeName || "",
      gstNumber: user.gstNumber || user.gst || "",
      contactPersonName: user.contactPersonName || user.ownerName || "",
      contactMobile: user.contactMobile || user.mobile || "",
      contactEmail: user.contactEmail || user.email || "",
      address: user.address || "",
      interestedLobs: user.interestedLobs || [],
      generatedCode: user.generatedCode || "",
      cancelCheck: null,
      password: "",
      username: user.username || "",
      email: user.email || "",
      mobile: user.mobile || "",
      role: user.role || "Employee",
      gst: user.gst || "",
      pan: user.pan || "",
      storeName: user.storeName || "",
      ownerName: user.ownerName || "",
      gstCertificate: null,
      aadharCard: null,
      assignedSalesperson: user.assignedSalesperson || "",
    });
    setIsModalOpen(true);
  };

  // FIXED: Handle Update User with better error handling
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!validateAllFields(editUserState, true)) {
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    
    // Process all fields properly
    Object.keys(editUserState).forEach((key) => {
      if (editUserState[key] !== null && editUserState[key] !== undefined && key !== "_id") {
        // Handle file fields
        if (key === 'aadhaarFile' || key === 'panFile' || 
            key === 'tenthMarksheet' || key === 'twelfthMarksheet' ||
            key === 'ugMarksheet' || key === 'pgMarksheet' ||
            key === 'cancelCheck' || key === 'gstCertificate' || 
            key === 'aadharCard') {
          if (editUserState[key] instanceof File) {
            formData.append(key, editUserState[key]);
          }
          // If it's a string URL (existing file), skip it
        } else if (key === 'interestedLobs') {
          if (Array.isArray(editUserState[key])) {
            formData.append(key, JSON.stringify(editUserState[key]));
          }
        } else {
          const value = editUserState[key] !== null && editUserState[key] !== undefined ? String(editUserState[key]) : '';
          formData.append(key, value);
        }
      }
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/users/${editUserState._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log('User updated successfully:', response.data);
      fetchUsers();
      setIsModalOpen(false);
      closeModal();
      alert("User updated successfully!");
    } catch (err) {
      console.error("Update user error:", err);
      let errorMsg = "Error updating user.";
      if (err.response) {
        if (err.response.data.errors) {
          errorMsg = err.response.data.errors.join('\n');
        } else if (err.response.data.msg) {
          errorMsg = err.response.data.msg;
        }
      }
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchUsers();
        alert("User deleted successfully!");
      } catch (err) {
        console.error("Delete user error:", err);
        alert(err.response?.data?.msg || "Error deleting user.");
      }
    }
  };

  // ============================================
  // FIXED: closeModal - Clear all fields properly
  // ============================================
  const closeModal = () => {
    setIsModalOpen(false);
    setEditUserState({
      _id: "",
      userType: "Employee",
      fullName: "",
      fathersName: "",
      mothersName: "",
      dateOfBirth: "",
      qualification: "",
      otherQualification: "",
      aadhaarNumber: "",
      aadhaarFile: null,
      panNumber: "",
      panFile: null,
      tenthMarksheet: null,
      twelfthMarksheet: null,
      ugMarksheet: null,
      pgMarksheet: null,
      pinCode: "",
      state: "",
      city: "",
      village: "",
      block: "",
      department: "",
      designation: "",
      mobileNumber: "",
      alternateMobile: "",
      personalEmail: "",
      officialEmail: "",
      emergencyContact: "",
      dateOfJoining: "",
      employeeId: "",
      bankName: "",
      bankAccountNumber: "",
      ifscCode: "",
      bankBranch: "",
      organizationName: "",
      gstNumber: "",
      contactPersonName: "",
      contactMobile: "",
      contactEmail: "",
      address: "",
      interestedLobs: [],
      generatedCode: "",
      cancelCheck: null,
      password: "",
      username: "",
      email: "",
      mobile: "",
      role: "Employee",
      gst: "",
      pan: "",
      storeName: "",
      ownerName: "",
      gstCertificate: null,
      aadharCard: null,
      assignedSalesperson: "",
    });
    setValidationErrors({});
    setValidationPopup({ show: false, errors: [] });
  };

  // Render Validation Popup
  const renderValidationPopup = () => {
    if (!validationPopup.show) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4"
        onClick={() => setValidationPopup({ show: false, errors: [] })}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-full">
              <FaExclamationCircle className="text-red-600 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Validation Errors</h3>
              <p className="text-sm text-gray-500">Please fix the following issues:</p>
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {validationPopup.errors.map((error, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200"
              >
                <span className="text-sm text-red-700">{error.message}</span>
                {error.field !== "general" && (
                  <button
                    onClick={() => scrollToError(error.field)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"
                  >
                    Go to Field
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-4 pt-4 border-t">
            <button
              onClick={() => setValidationPopup({ show: false, errors: [] })}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Render Employee Form
  const renderEmployeeForm = (formData, setFormData, isEdit = false) => {
    const getQualificationFiles = () => {
      const qual = formData.qualification;
      const files = [];
      if (qual === "Matriculation" || qual === "Intermediate" || qual === "Under Graduate" || qual === "Post Graduate") {
        files.push({ key: "tenthMarksheet", label: "10th Marksheet" });
      }
      if (qual === "Intermediate" || qual === "Under Graduate" || qual === "Post Graduate") {
        files.push({ key: "twelfthMarksheet", label: "12th Marksheet" });
      }
      if (qual === "Under Graduate" || qual === "Post Graduate") {
        files.push({ key: "ugMarksheet", label: "UG Marksheet" });
      }
      if (qual === "Post Graduate") {
        files.push({ key: "pgMarksheet", label: "PG Marksheet" });
      }
      return files;
    };

    return (
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaUser className="text-indigo-600" /> Personal Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter full name"
              />
              {validationErrors.fullName && <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Father's Name <span className="text-red-500">*</span></label>
              <input
                name="fathersName"
                type="text"
                value={formData.fathersName}
                onChange={(e) => setFormData({ ...formData, fathersName: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.fathersName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter father's name"
              />
              {validationErrors.fathersName && <p className="text-red-500 text-xs mt-1">{validationErrors.fathersName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mother's Name <span className="text-red-500">*</span></label>
              <input
                name="mothersName"
                type="text"
                value={formData.mothersName}
                onChange={(e) => setFormData({ ...formData, mothersName: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.mothersName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter mother's name"
              />
              {validationErrors.mothersName && <p className="text-red-500 text-xs mt-1">{validationErrors.mothersName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
              <input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className={`w-full p-2 border rounded-lg ${validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                max={new Date().toISOString().split('T')[0]}
              />
              {validationErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfBirth}</p>}
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
              <label className="text-sm font-medium text-gray-700">Qualification <span className="text-red-500">*</span></label>
              <select
                name="qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value, otherQualification: "" })}
                className={`w-full p-2 border rounded-lg ${validationErrors.qualification ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Qualification</option>
                {QUALIFICATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {validationErrors.qualification && <p className="text-red-500 text-xs mt-1">{validationErrors.qualification}</p>}
            </div>
            {formData.qualification === "Others" && (
              <div>
                <label className="text-sm font-medium text-gray-700">Specify Qualification <span className="text-red-500">*</span></label>
                <input
                  name="otherQualification"
                  type="text"
                  value={formData.otherQualification}
                  onChange={(e) => setFormData({ ...formData, otherQualification: e.target.value })}
                  className={`w-full p-2 border rounded-lg ${validationErrors.otherQualification ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Specify your qualification"
                />
                {validationErrors.otherQualification && <p className="text-red-500 text-xs mt-1">{validationErrors.otherQualification}</p>}
              </div>
            )}
          </div>

          {/* Educational Documents Upload - Dynamic */}
          {formData.qualification && formData.qualification !== "Others" && (
            <div className="mt-3">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Upload Educational Documents</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getQualificationFiles().map((file) => (
                  <div key={file.key}>
                    <label className="text-xs font-medium text-gray-600">{file.label}</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({ ...formData, [file.key]: e.target.files[0] })}
                      className="w-full p-1 border border-gray-300 rounded-lg text-sm"
                    />
                    {formData[file.key] && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KYC & Document Upload */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaIdCard className="text-indigo-600" /> KYC & Document Upload
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
              <input
                name="aadhaarNumber"
                type="text"
                value={formData.aadhaarNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 12) setFormData({ ...formData, aadhaarNumber: val });
                }}
                maxLength="12"
                className={`w-full p-2 border rounded-lg ${validationErrors.aadhaarNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter 12 digits only"
              />
              {formData.aadhaarNumber && formData.aadhaarNumber.length > 0 && !validateAadhaar(formData.aadhaarNumber) && (
                <p className="text-red-500 text-xs mt-1">Enter exactly 12 digits</p>
              )}
              {validationErrors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.aadhaarNumber}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Upload Aadhaar</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({ ...formData, aadhaarFile: e.target.files[0] })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {formData.aadhaarFile && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">PAN Number</label>
              <input
                name="panNumber"
                type="text"
                value={formData.panNumber}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (val.length <= 10) setFormData({ ...formData, panNumber: val });
                }}
                maxLength="10"
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.panNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="ABCDE1234F"
              />
              {formData.panNumber && formData.panNumber.length > 0 && !validatePAN(formData.panNumber) && (
                <p className="text-red-500 text-xs mt-1">Format: ABCDE1234F (5 letters, 4 digits, 1 letter)</p>
              )}
              {validationErrors.panNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.panNumber}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Upload PAN</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({ ...formData, panFile: e.target.files[0] })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {formData.panFile && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
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
              <label className="text-sm font-medium text-gray-700">PIN/ZIP Code <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  name="pinCode"
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) {
                      setFormData({ ...formData, pinCode: val });
                      if (val.length < 6) {
                        setFormData(prev => ({ ...prev, state: "", city: "" }));
                      }
                    }
                  }}
                  maxLength="6"
                  className={`w-full p-2 border rounded-lg pr-10 ${validationErrors.pinCode ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter 6 digit PIN code"
                />
                {isFetchingPin && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-indigo-500 h-5 w-5" />
                  </div>
                )}
              </div>
              {formData.pinCode && !validatePIN(formData.pinCode) && formData.pinCode.length === 6 && (
                <p className="text-red-500 text-xs mt-1">{pinFetchError || "Invalid PIN code"}</p>
              )}
              {formData.pinCode && validatePIN(formData.pinCode) && formData.state && (
                <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                  <FaCheck className="h-3 w-3" /> {formData.city}, {formData.state}
                </p>
              )}
              {validationErrors.pinCode && <p className="text-red-500 text-xs mt-1">{validationErrors.pinCode}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                value={formData.state}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">City/District</label>
              <input
                type="text"
                value={formData.city}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Village <span className="text-red-500">*</span></label>
              <input
                name="village"
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.village ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter village name"
              />
              {validationErrors.village && <p className="text-red-500 text-xs mt-1">{validationErrors.village}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Block <span className="text-red-500">*</span></label>
              <input
                name="block"
                type="text"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.block ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter block name"
              />
              {validationErrors.block && <p className="text-red-500 text-xs mt-1">{validationErrors.block}</p>}
            </div>
          </div>
        </div>

        {/* Official Details - Employee ONLY */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaBriefcase className="text-indigo-600" /> Official Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
              <select
                name="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value, designation: "" })}
                className={`w-full p-2 border rounded-lg ${validationErrors.department ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Department</option>
                {DEPARTMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {validationErrors.department && <p className="text-red-500 text-xs mt-1">{validationErrors.department}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Designation <span className="text-red-500">*</span></label>
              <select
                name="designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className={`w-full p-2 border rounded-lg ${validationErrors.designation ? 'border-red-500' : 'border-gray-300'}`}
                disabled={!formData.department}
              >
                <option value="">{formData.department ? "Select Designation" : "Select Department first"}</option>
                {formData.department && DESIGNATION_OPTIONS[formData.department]?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {validationErrors.designation && <p className="text-red-500 text-xs mt-1">{validationErrors.designation}</p>}
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
              <label className="text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
              <input
                name="mobileNumber"
                type="text"
                value={formData.mobileNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({ ...formData, mobileNumber: val });
                }}
                maxLength="10"
                className={`w-full p-2 border rounded-lg ${validationErrors.mobileNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter 10 digit mobile number"
              />
              {validationErrors.mobileNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.mobileNumber}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Alternate Mobile Number</label>
              <input
                name="alternateMobile"
                type="text"
                value={formData.alternateMobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({ ...formData, alternateMobile: val });
                }}
                maxLength="10"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter alternate mobile number"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Personal Email ID</label>
              <input
                name="personalEmail"
                type="email"
                value={formData.personalEmail}
                onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                className={`w-full p-2 border rounded-lg ${validationErrors.personalEmail ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter personal email"
              />
              {validationErrors.personalEmail && <p className="text-red-500 text-xs mt-1">{validationErrors.personalEmail}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Official Email ID</label>
              <input
                name="officialEmail"
                type="email"
                value={formData.officialEmail}
                onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                className={`w-full p-2 border rounded-lg ${validationErrors.officialEmail ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter official email"
              />
              {validationErrors.officialEmail && <p className="text-red-500 text-xs mt-1">{validationErrors.officialEmail}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Emergency Contact Number</label>
              <input
                name="emergencyContact"
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({ ...formData, emergencyContact: val });
                }}
                maxLength="10"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter emergency contact"
              />
            </div>
          </div>
        </div>

        {/* Employment Details - Employee ONLY */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaCalendarAlt className="text-indigo-600" /> Employment Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Date of Joining <span className="text-red-500">*</span></label>
              <input
                name="dateOfJoining"
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                className={`w-full p-2 border rounded-lg ${validationErrors.dateOfJoining ? 'border-red-500' : 'border-gray-300'}`}
                max={new Date().toISOString().split('T')[0]}
              />
              {validationErrors.dateOfJoining && <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfJoining}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Employee ID (Auto Generated)</label>
              <input
                type="text"
                value={formData.employeeId}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 font-mono text-indigo-600 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Bank Details - Employee */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaUniversity className="text-indigo-600" /> Bank Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Bank Name <span className="text-red-500">*</span></label>
              <input
                name="bankName"
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.bankName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter bank name"
              />
              {validationErrors.bankName && <p className="text-red-500 text-xs mt-1">{validationErrors.bankName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Bank Account Number <span className="text-red-500">*</span></label>
              <input
                name="bankAccountNumber"
                type="text"
                value={formData.bankAccountNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 18) setFormData({ ...formData, bankAccountNumber: val });
                }}
                maxLength="18"
                className={`w-full p-2 border rounded-lg ${validationErrors.bankAccountNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter account number"
              />
              {validationErrors.bankAccountNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.bankAccountNumber}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">IFSC Code <span className="text-red-500">*</span></label>
              <input
                name="ifscCode"
                type="text"
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.ifscCode ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., SBIN0001234"
              />
              {validationErrors.ifscCode && <p className="text-red-500 text-xs mt-1">{validationErrors.ifscCode}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Bank Branch <span className="text-red-500">*</span></label>
              <input
                name="bankBranch"
                type="text"
                value={formData.bankBranch}
                onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.bankBranch ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter branch name"
              />
              {validationErrors.bankBranch && <p className="text-red-500 text-xs mt-1">{validationErrors.bankBranch}</p>}
            </div>
          </div>
        </div>

        {/* Cancel Check - Employee */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaFileImage className="text-indigo-600" /> Cancel Check (Bank Passbook)
          </h4>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Upload Cancel Check <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">(Accepts PDF, JPG, JPEG, PNG, GIF)</span>
            </label>
            <input
              name="cancelCheck"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={(e) => setFormData({ ...formData, cancelCheck: e.target.files[0] })}
              className={`w-full p-2 border rounded-lg ${validationErrors.cancelCheck ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formData.cancelCheck && (
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <FaCheck className="h-3 w-3" /> 
                {formData.cancelCheck.name} ({(formData.cancelCheck.size / 1024).toFixed(2)} KB)
              </p>
            )}
            {validationErrors.cancelCheck && <p className="text-red-500 text-xs mt-1">{validationErrors.cancelCheck}</p>}
          </div>
        </div>
      </div>
    );
  };

  // Render Channel Partner Form
  const renderChannelPartnerForm = (formData, setFormData, isEdit = false) => {
    return (
      <div className="space-y-6">
        {/* Personal Information - Same as Employee */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaUser className="text-indigo-600" /> Personal Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter full name"
              />
              {validationErrors.fullName && <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Father's Name <span className="text-red-500">*</span></label>
              <input
                name="fathersName"
                type="text"
                value={formData.fathersName}
                onChange={(e) => setFormData({ ...formData, fathersName: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.fathersName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter father's name"
              />
              {validationErrors.fathersName && <p className="text-red-500 text-xs mt-1">{validationErrors.fathersName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mother's Name <span className="text-red-500">*</span></label>
              <input
                name="mothersName"
                type="text"
                value={formData.mothersName}
                onChange={(e) => setFormData({ ...formData, mothersName: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.mothersName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter mother's name"
              />
              {validationErrors.mothersName && <p className="text-red-500 text-xs mt-1">{validationErrors.mothersName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
              <input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className={`w-full p-2 border rounded-lg ${validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                max={new Date().toISOString().split('T')[0]}
              />
              {validationErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfBirth}</p>}
            </div>
          </div>
        </div>

        {/* Educational Qualification - Same as Employee */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaGraduationCap className="text-indigo-600" /> Educational Qualification
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Qualification <span className="text-red-500">*</span></label>
              <select
                name="qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value, otherQualification: "" })}
                className={`w-full p-2 border rounded-lg ${validationErrors.qualification ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Qualification</option>
                {QUALIFICATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {validationErrors.qualification && <p className="text-red-500 text-xs mt-1">{validationErrors.qualification}</p>}
            </div>
            {formData.qualification === "Others" && (
              <div>
                <label className="text-sm font-medium text-gray-700">Specify Qualification <span className="text-red-500">*</span></label>
                <input
                  name="otherQualification"
                  type="text"
                  value={formData.otherQualification}
                  onChange={(e) => setFormData({ ...formData, otherQualification: e.target.value })}
                  className={`w-full p-2 border rounded-lg ${validationErrors.otherQualification ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Specify your qualification"
                />
                {validationErrors.otherQualification && <p className="text-red-500 text-xs mt-1">{validationErrors.otherQualification}</p>}
              </div>
            )}
          </div>

          {/* Educational Documents Upload - Dynamic */}
          {formData.qualification && formData.qualification !== "Others" && (
            <div className="mt-3">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Upload Educational Documents</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(() => {
                  const qual = formData.qualification;
                  const files = [];
                  if (qual === "Matriculation" || qual === "Intermediate" || qual === "Under Graduate" || qual === "Post Graduate") {
                    files.push({ key: "tenthMarksheet", label: "10th Marksheet" });
                  }
                  if (qual === "Intermediate" || qual === "Under Graduate" || qual === "Post Graduate") {
                    files.push({ key: "twelfthMarksheet", label: "12th Marksheet" });
                  }
                  if (qual === "Under Graduate" || qual === "Post Graduate") {
                    files.push({ key: "ugMarksheet", label: "UG Marksheet" });
                  }
                  if (qual === "Post Graduate") {
                    files.push({ key: "pgMarksheet", label: "PG Marksheet" });
                  }
                  return files.map((file) => (
                    <div key={file.key}>
                      <label className="text-xs font-medium text-gray-600">{file.label}</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFormData({ ...formData, [file.key]: e.target.files[0] })}
                        className="w-full p-1 border border-gray-300 rounded-lg text-sm"
                      />
                      {formData[file.key] && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        {/* KYC & Document Upload - Same as Employee */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaIdCard className="text-indigo-600" /> KYC & Document Upload
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
              <input
                name="aadhaarNumber"
                type="text"
                value={formData.aadhaarNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 12) setFormData({ ...formData, aadhaarNumber: val });
                }}
                maxLength="12"
                className={`w-full p-2 border rounded-lg ${validationErrors.aadhaarNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter 12 digits only"
              />
              {formData.aadhaarNumber && formData.aadhaarNumber.length > 0 && !validateAadhaar(formData.aadhaarNumber) && (
                <p className="text-red-500 text-xs mt-1">Enter exactly 12 digits</p>
              )}
              {validationErrors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.aadhaarNumber}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Upload Aadhaar</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({ ...formData, aadhaarFile: e.target.files[0] })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {formData.aadhaarFile && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">PAN Number</label>
              <input
                name="panNumber"
                type="text"
                value={formData.panNumber}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (val.length <= 10) setFormData({ ...formData, panNumber: val });
                }}
                maxLength="10"
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.panNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="ABCDE1234F"
              />
              {formData.panNumber && formData.panNumber.length > 0 && !validatePAN(formData.panNumber) && (
                <p className="text-red-500 text-xs mt-1">Format: ABCDE1234F (5 letters, 4 digits, 1 letter)</p>
              )}
              {validationErrors.panNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.panNumber}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Upload PAN</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({ ...formData, panFile: e.target.files[0] })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {formData.panFile && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
            </div>
          </div>
        </div>

        {/* Address Details - Same as Employee */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaMapMarkerAlt className="text-indigo-600" /> Address Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">PIN/ZIP Code <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  name="pinCode"
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) {
                      setFormData({ ...formData, pinCode: val });
                      if (val.length < 6) {
                        setFormData(prev => ({ ...prev, state: "", city: "" }));
                      }
                    }
                  }}
                  maxLength="6"
                  className={`w-full p-2 border rounded-lg pr-10 ${validationErrors.pinCode ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter 6 digit PIN code"
                />
                {isFetchingPin && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-indigo-500 h-5 w-5" />
                  </div>
                )}
              </div>
              {formData.pinCode && !validatePIN(formData.pinCode) && formData.pinCode.length === 6 && (
                <p className="text-red-500 text-xs mt-1">{pinFetchError || "Invalid PIN code"}</p>
              )}
              {formData.pinCode && validatePIN(formData.pinCode) && formData.state && (
                <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                  <FaCheck className="h-3 w-3" /> {formData.city}, {formData.state}
                </p>
              )}
              {validationErrors.pinCode && <p className="text-red-500 text-xs mt-1">{validationErrors.pinCode}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                value={formData.state}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">City/District</label>
              <input
                type="text"
                value={formData.city}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Village <span className="text-red-500">*</span></label>
              <input
                name="village"
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.village ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter village name"
              />
              {validationErrors.village && <p className="text-red-500 text-xs mt-1">{validationErrors.village}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Block <span className="text-red-500">*</span></label>
              <input
                name="block"
                type="text"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.block ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter block name"
              />
              {validationErrors.block && <p className="text-red-500 text-xs mt-1">{validationErrors.block}</p>}
            </div>
          </div>
        </div>

        {/* Organization Details - Channel Partner ONLY */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaBuilding className="text-indigo-600" /> Organization Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Organization Name <span className="text-red-500">*</span></label>
              <input
                name="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.organizationName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter organization name"
              />
              {validationErrors.organizationName && <p className="text-red-500 text-xs mt-1">{validationErrors.organizationName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">GST Number (Optional)</label>
              <input
                name="gstNumber"
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className="w-full p-2 border border-gray-300 rounded-lg uppercase"
                placeholder="Enter GST number"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Contact Person Name <span className="text-red-500">*</span></label>
              <input
                name="contactPersonName"
                type="text"
                value={formData.contactPersonName}
                onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.contactPersonName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter contact person name"
              />
              {validationErrors.contactPersonName && <p className="text-red-500 text-xs mt-1">{validationErrors.contactPersonName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
              <input
                name="contactMobile"
                type="text"
                value={formData.contactMobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({ ...formData, contactMobile: val });
                }}
                maxLength="10"
                className={`w-full p-2 border rounded-lg ${validationErrors.contactMobile ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter 10 digit mobile number"
              />
              {validationErrors.contactMobile && <p className="text-red-500 text-xs mt-1">{validationErrors.contactMobile}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email ID</label>
              <input
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className={`w-full p-2 border rounded-lg ${validationErrors.contactEmail ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter email address"
              />
              {validationErrors.contactEmail && <p className="text-red-500 text-xs mt-1">{validationErrors.contactEmail}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
              <textarea
                name="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full p-2 border rounded-lg ${validationErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                rows="2"
                placeholder="Enter full address"
              />
              {validationErrors.address && <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>}
            </div>
          </div>
        </div>

        {/* Contact Details - Channel Partner */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaPhone className="text-indigo-600" /> Contact Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
              <input
                name="mobileNumber"
                type="text"
                value={formData.mobileNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({ ...formData, mobileNumber: val });
                }}
                maxLength="10"
                className={`w-full p-2 border rounded-lg ${validationErrors.mobileNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter 10 digit mobile number"
              />
              {validationErrors.mobileNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.mobileNumber}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Alternate Mobile Number</label>
              <input
                name="alternateMobile"
                type="text"
                value={formData.alternateMobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({ ...formData, alternateMobile: val });
                }}
                maxLength="10"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter alternate mobile number"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Personal Email ID</label>
              <input
                name="personalEmail"
                type="email"
                value={formData.personalEmail}
                onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                className={`w-full p-2 border rounded-lg ${validationErrors.personalEmail ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter personal email"
              />
              {validationErrors.personalEmail && <p className="text-red-500 text-xs mt-1">{validationErrors.personalEmail}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Emergency Contact Number</label>
              <input
                name="emergencyContact"
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({ ...formData, emergencyContact: val });
                }}
                maxLength="10"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter emergency contact"
              />
            </div>
          </div>
        </div>

        {/* Bank Details - Channel Partner */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaUniversity className="text-indigo-600" /> Bank Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Bank Name <span className="text-red-500">*</span></label>
              <input
                name="bankName"
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.bankName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter bank name"
              />
              {validationErrors.bankName && <p className="text-red-500 text-xs mt-1">{validationErrors.bankName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Bank Account Number <span className="text-red-500">*</span></label>
              <input
                name="bankAccountNumber"
                type="text"
                value={formData.bankAccountNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 18) setFormData({ ...formData, bankAccountNumber: val });
                }}
                maxLength="18"
                className={`w-full p-2 border rounded-lg ${validationErrors.bankAccountNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter account number"
              />
              {validationErrors.bankAccountNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.bankAccountNumber}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">IFSC Code <span className="text-red-500">*</span></label>
              <input
                name="ifscCode"
                type="text"
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.ifscCode ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., SBIN0001234"
              />
              {validationErrors.ifscCode && <p className="text-red-500 text-xs mt-1">{validationErrors.ifscCode}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Bank Branch <span className="text-red-500">*</span></label>
              <input
                name="bankBranch"
                type="text"
                value={formData.bankBranch}
                onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value.toUpperCase() })}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.bankBranch ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter branch name"
              />
              {validationErrors.bankBranch && <p className="text-red-500 text-xs mt-1">{validationErrors.bankBranch}</p>}
            </div>
          </div>
        </div>

        {/* Cancel Check - Channel Partner */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaFileImage className="text-indigo-600" /> Cancel Check (Bank Passbook)
          </h4>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Upload Cancel Check <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">(Accepts PDF, JPG, JPEG, PNG, GIF)</span>
            </label>
            <input
              name="cancelCheck"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={(e) => setFormData({ ...formData, cancelCheck: e.target.files[0] })}
              className={`w-full p-2 border rounded-lg ${validationErrors.cancelCheck ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formData.cancelCheck && (
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <FaCheck className="h-3 w-3" /> 
                {formData.cancelCheck.name} ({(formData.cancelCheck.size / 1024).toFixed(2)} KB)
              </p>
            )}
            {validationErrors.cancelCheck && <p className="text-red-500 text-xs mt-1">{validationErrors.cancelCheck}</p>}
          </div>
        </div>

        {/* Interested LOB Selection - Channel Partner ONLY */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaFileAlt className="text-indigo-600" /> Interested LOB Selection
          </h4>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => handleSelectAllLOBs(isEdit)}
              className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => handleClearAllLOBs(isEdit)}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
            {LOB_OPTIONS.map((lob) => (
              <label key={lob} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.interestedLobs?.includes(lob) || false}
                  onChange={() => handleLOBChange(lob, isEdit)}
                  className="rounded text-indigo-600"
                />
                <span className="truncate">{lob}</span>
              </label>
            ))}
          </div>
          {formData.interestedLobs && formData.interestedLobs.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">Selected: {formData.interestedLobs.length} LOB(s)</p>
          )}
        </div>

        {/* Auto Generated Code - Channel Partner ONLY - Editable */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Channel Partner Code 
                <span className="text-xs text-gray-500 ml-2">(Auto-generated, editable)</span>
              </label>
              <input
                type="text"
                value={formData.generatedCode}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setFormData({ ...formData, generatedCode: val });
                }}
                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-indigo-600 font-semibold"
                placeholder="CP0001"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can edit this code manually. Must be unique.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Add/Edit Form
  const renderUserForm = (formData, setFormData, isEdit = false) => {
    const isEmployee = formData.userType === "Employee";
    const isChannelPartner = formData.userType === "Channel Partner";

    return (
      <div className="space-y-4">
        {/* User Type Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="text-sm font-medium text-gray-700">User Type <span className="text-red-500">*</span></label>
          <select
            value={formData.userType}
            onChange={(e) => handleUserTypeChange(e.target.value, isEdit)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {USER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        {/* Employee Form */}
        {isEmployee && renderEmployeeForm(formData, setFormData, isEdit)}

        {/* Channel Partner Form */}
        {isChannelPartner && renderChannelPartnerForm(formData, setFormData, isEdit)}

        {/* Password - Common for all */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaUserPlus className="text-indigo-600" /> Account Credentials
          </h4>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={isEdit ? "New Password (optional)" : "Password *"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full p-2 border rounded-lg ${validationErrors.password ? 'border-red-500' : 'border-gray-300'}`}
              required={!isEdit}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
        </div>
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaExclamationCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">Access Denied</h3>
          <p className="text-gray-500">Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
        <div className="text-sm text-gray-500">
          Total Users: {users.length}
        </div>
      </div>

      {/* Add New User Form */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center gap-2">
          <FaUserPlus className="text-indigo-600" /> Add New User
        </h3>
        <form onSubmit={handleAddUser}>
          {renderUserForm(newUser, setNewUser, false)}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Adding User...
              </>
            ) : (
              <>
                <FaUserPlus />
                Add User
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
        {users.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No users available.</p>
        ) : (
          <table className="w-full table-auto min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 font-medium">User/Org Name</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Contact</th>
                <th className="p-3 font-medium">Code/ID</th>
                <th className="p-3 font-medium">Department</th>
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
                  <td className="p-3 font-medium">
                    {user.userType === "Employee" ? user.fullName || user.username : user.organizationName || user.storeName}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.userType === "Admin" ? "bg-purple-100 text-purple-800" :
                      user.userType === "Employee" ? "bg-blue-100 text-blue-800" :
                      user.userType === "Channel Partner" ? "bg-orange-100 text-orange-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {user.userType || user.role}
                    </span>
                  </td>
                  <td className="p-3">{user.mobile || user.contactMobile || user.mobileNumber}</td>
                  <td className="p-3 font-mono text-indigo-600 text-sm">
                    {user.employeeId || user.generatedCode || "-"}
                  </td>
                  <td className="p-3">{user.department || "-"}</td>
                  <td className="p-3 flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      title="Edit User"
                    >
                      <FaPencilAlt />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete User"
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
      {isModalOpen && editUserState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FaPencilAlt className="text-indigo-600" /> Edit User
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({editUserState.userType || editUserState.role})
                </span>
              </h3>
              <motion.button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <FaTimes className="h-5 w-5" />
              </motion.button>
            </div>

            <form onSubmit={handleUpdateUser}>
              {renderUserForm(editUserState, setEditUserState, true)}
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <motion.button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Validation Popup */}
      {renderValidationPopup()}
    </motion.div>
  );
}

export default UserManagement;