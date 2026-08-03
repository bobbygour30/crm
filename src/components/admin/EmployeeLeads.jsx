// src/components/EmployeeLeads.jsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaEye,
  FaEdit,
  FaTimes,
  FaTrash,
  FaDownload,
  FaSearch,
  FaUpload,
  FaFilter,
  FaFileExcel,
  FaBell,
  FaHeartbeat,
  FaCar,
  FaMobileAlt,
  FaUser,
  FaUsers,
  FaCalendarAlt,
  FaLink,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFilePdf,
  FaFileImage,
  FaUserPlus,
  FaUsers as FaFloater,
  FaChild,
  FaUserMd,
  FaIdCard,
  FaFileAlt,
  FaArrowUp,
  FaCheck,
  FaPlus,
  FaMinus,
  FaDollarSign,
  FaShieldAlt,
  FaHeart,
  FaLungs,
  FaBrain,
  FaTint,
  FaSpinner,
  FaExclamationCircle,
  FaSave,
  FaPhone,
} from "react-icons/fa";
import * as XLSX from "xlsx";

function EmployeeLeads() {
  // ============================================================
  // CONSTANTS - Same as LeadTable
  // ============================================================
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

  const SOURCE_OPTIONS = [
    "Employee",
    "Channel Partner",
    "Direct Client",
    "Social Media",
    "Store",
    "Other",
  ];

  const GENDER_OPTIONS = ["Male", "Female", "Other"];
  
  const STATUS_OPTIONS = [
    "Open",
    "Quotation Generated",
    "Payment Link Generated",
    "Payment Done",
    "Policy Issued",
  ];

  const POLICY_TYPE_OPTIONS = ["Individual", "Floater"];
  
  const QUALIFICATION_OPTIONS = [
    "10th", "12th", "Graduate", "Post Graduate", "Professional", "Other"
  ];
  
  const OCCUPATION_OPTIONS = [
    "Salaried", "Business", "Professional", "Student", "Retired", "Housewife", "Other"
  ];
  
  const RELATIONSHIP_OPTIONS = [
    "Spouse", "Son", "Daughter", "Father", "Mother", "Sibling", "Other"
  ];
  
  const YES_NO_OPTIONS = ["Yes", "No"];
  
  const NCB_OPTIONS = ["0%", "20%", "25%", "35%", "45%", "50%"];
  
  const VEHICLE_TYPE_OPTIONS = [
    "Two Wheeler",
    "Private Car",
    "Taxi",
    "School Bus",
    "e-Rickshaw",
    "Auto Rickshaw",
    "Truck",
    "Tractor",
    "Commercial Vehicle"
  ];

  const FUEL_TYPE_OPTIONS = [
    "Petrol",
    "Diesel",
    "CNG",
    "LPG",
    "Electric",
    "Hybrid",
    "Ethanol",
    "Bio-Diesel"
  ];
  
  const PREVIOUS_INSURANCE_STATUS_OPTIONS = ["Active", "Expired", "New"];
  
  const INSURANCE_TYPE_OPTIONS = [
    "Bundle Package (1 Yr OD + 1 Yr TP)",
    "Bundle Package (1 Yr OD + 3 Yr TP)",
    "Bundle Package (1 Yr OD + 5 Yr TP)",
    "Comprehensive (OD+TP)",
    "SAOD (On Damage)",
    "TP (Third Party)"
  ];
  
  const DEVICE_TYPE_OPTIONS = ["Mobile", "Tablet", "Laptop", "Other"];

  const INSURER_OPTIONS = [
    "Bajaj Allianz General Insurance Co Ltd",
    "Tata Aig General Insurance Co Ltd",
    "HDFC Ergo General Insurance Co Ltd",
    "ICICI Lombard General Insurance Co Ltd",
    "Digit General Insurance Co Ltd",
    "Reliance General Insurance Co Ltd",
    "SBI General Insurance Co Ltd",
    "Future General General Insurance Co Ltd",
    "Magma HDI General Insurance Co Ltd",
    "Royal Sundram General Insurance Co Ltd",
    "Kotak Mahindra General Insurance Co Ltd",
    "Liberty General Insurance Co Ltd",
    "Shriram General Insurance Co Ltd",
    "United India General Insurance Co Ltd",
    "Oriental General Insurance Co Ltd",
    "National General Insurance Co Ltd",
    "New India General Insurance Co Ltd",
    "Chola MS General Insurance Co Ltd",
    "Universal Sompo General Insurance Co Ltd",
    "Iffco Tokio General Insurance Co Ltd",
    "ICICI Prudential Life Insurance",
    "TATA AIA Life Insurance",
    "HDFC Life Insurance",
    "Reliance Nippon Life Insurance",
    "Axis Max Life Insurance",
    "Niva Bupa Health Insurance",
    "Care Health Insurance",
    "Star Health Insurance",
    "Aditya Birla Health Insurance",
    "Bajaj Allianz Life Insurance",
  ];

  const MANUFACTURER_OPTIONS = [
    "Maruti Suzuki",
    "Hyundai",
    "Tata Motors",
    "Mahindra",
    "Honda",
    "Toyota",
    "Ford",
    "Volkswagen",
    "Renault",
    "Nissan",
    "Skoda",
    "Kia",
    "MG Motor",
    "Jeep",
    "Mercedes-Benz",
    "BMW",
    "Audi",
    "Volvo",
    "Land Rover",
    "Jaguar",
    "Porsche",
    "Lamborghini",
    "Ferrari",
    "Maserati",
    "Bentley",
    "Rolls-Royce",
    "Aston Martin",
    "McLaren",
    "Bugatti",
    "Koegnigsegg"
  ];

  const POLICY_TENURE_OPTIONS = ["1 Year", "2 Years", "3 Years"];
  
  const PAYMENT_TERM_OPTIONS = [
    "Monthly",
    "Quarterly",
    "Half Quarterly",
    "Half Yearly",
    "Yearly"
  ];

  const SUM_INSURED_OPTIONS = [
    "3 Lakh",
    "4 Lakh",
    "5 Lakh",
    "7.5 Lakh",
    "10 Lakh",
    "15 Lakh",
    "20 Lakh",
    "25 Lakh",
    "30 Lakh",
    "35 Lakh",
    "40 Lakh",
    "45 Lakh",
    "50 Lakh",
    "75 Lakh",
    "1 Crore",
    "2 Crore",
    "3 Crore",
    "4 Crore",
    "5 Crore"
  ];

  const RIDER_OPTIONS = [
    "Insta Shield",
    "Fetal Flourish",
    "NRInsure",
    "Loss of Income (Any Illness excluding Infection)",
    "Major Illness and Accident Multiplier",
    "International Cover-Emergency Care"
  ];

  const PREVIOUS_POLICY_CASE_OPTIONS = ["Renew Case", "Portability Case", "Fresh Case"];
  const EXPERIENCE_YEARS_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

  const ADD_ON_OPTIONS = [
    "Zero Depreciation",
    "Engine Protection",
    "Return to Invoice",
    "Key Replacement",
    "Consumables Cover",
    "Daily Allowance",
    "Hospital Cash Benefit",
    "Personal Accident Cover",
    "Legal Liability to Driver",
    "Loss of Personal Belongings",
    "Emergency Assistance & Towing",
    "No Claim Bonus Protection",
    "Electrical/Electronic Items Cover",
    "Hydraulic System Cover",
    "CNG/LPG Kit Cover",
    "Driver Assistant Cover",
    "Road Side Assistance",
    "Garage Cover",
    "Medical Expenses Cover"
  ];

  // ============================================================
  // VALIDATION HELPERS
  // ============================================================
  const toUpperCase = (value) => value ? value.toUpperCase() : value;
  const validateMobile = (mobile) => /^[0-9]{10}$/.test(mobile);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateAadhaar = (aadhaar) => /^[0-9]{12}$/.test(aadhaar);
  const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  const validatePIN = (pin) => /^[0-9]{6}$/.test(pin);

  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getODDueDateRestrictions = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 90);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 60);
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  };

  // ============================================================
  // STATE
  // ============================================================
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [validationPopup, setValidationPopup] = useState({ show: false, errors: [] });
  
  // Edit form states - Same as LeadTable
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    gender: "",
    source: "",
    remarks: "",
    lob: "",
    pinCode: "",
    state: "",
    city: "",
    sourceDependentValue: "",
    policyTenure: "",
    paymentTerm: "",
    sumInsured: "",
  });

  const [healthDetails, setHealthDetails] = useState({
    policyType: "",
    numberOfAdults: 0,
    numberOfChildren: 0,
    familyIncome: "",
    height: "",
    weight: "",
    qualification: "",
    occupation: "",
    nomineeName: "",
    nomineeDOB: "",
    nomineeRelationship: "",
    aadhaarNumber: "",
    aadhaarFile: null,
    panNumber: "",
    panFile: null,
    hasPreviousPolicy: "",
    previousPolicyCase: "",
    experienceYears: "",
    proposerDOB: "",
    renewalDetails: {
      insurerName: "",
      policyNumber: "",
      policyDueDate: "",
      uploadPolicy: null,
    },
    portabilityDetails: [],
    medicalRemarks: "",
    members: [],
    proposerIsMember: "",
    seniorOneDOB: "",
  });

  const [motorDetails, setMotorDetails] = useState({
    vehicleType: "",
    previousInsuranceStatus: "",
    manufacturer: "",
    model: "",
    fuelType: "",
    rtoCode: "",
    chesisNo: "",
    yearOfManufacturing: "",
    monthOfManufacturing: "",
    idvAsPerInvoice: "",
    insuranceType: "",
    odDueDate: "",
    tpDueDate: "",
    policyNo: "",
    previousInsurerName: "",
    idvAsPerPYP: "",
    saodOdDueDate: "",
    saodTpDueDate: "",
    saodPolicyNo: "",
    saodPreviousInsurerName: "",
    saodIdvAsPerPYP: "",
    tpInsuranceDueDate: "",
    registrationNumber: "",
    autoRtoCode: "",
    claimTaken: "",
    ncb: "",
    addOnRequired: "",
    selectedAddOns: [],
    pypFile: null,
    rcFrontFile: null,
    rcBackFile: null,
    chesisPhoto: null,
    invoiceCopy: null,
  });

  const [electronicDetails, setElectronicDetails] = useState({
    deviceType: "",
    otherDeviceType: "",
    dateOfPurchase: "",
    purchaseValue: "",
    aadhaarNumber: "",
    aadhaarFile: null,
    panNumber: "",
    panFile: null,
    imeiNumber: "",
    imeiImage: null,
    devicePhotos: [],
    purchaseInvoice: null,
  });

  const [showHealthSection, setShowHealthSection] = useState(false);
  const [showMotorSection, setShowMotorSection] = useState(false);
  const [showElectronicSection, setShowElectronicSection] = useState(false);
  const [showFloaterMembers, setShowFloaterMembers] = useState(false);
  const [showSeniorOneDOB, setShowSeniorOneDOB] = useState(false);
  const [showPreviousPolicyPopup, setShowPreviousPolicyPopup] = useState(false);
  const [showPortabilityFields, setShowPortabilityFields] = useState(false);
  const [showRenewalFields, setShowRenewalFields] = useState(false);
  const [showFreshCaseFields, setShowFreshCaseFields] = useState(false);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [sourceDependentField, setSourceDependentField] = useState("");
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [pinFetchError, setPinFetchError] = useState("");
  
  // Filter states
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchPolicy, setSearchPolicy] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchLOB, setSearchLOB] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [filter, setFilter] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  
  const filterDropdownRef = useRef(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    fetchLeads();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (formData.pinCode && validatePIN(formData.pinCode)) {
      fetchCityState(formData.pinCode);
    } else if (formData.pinCode && formData.pinCode.length > 0 && formData.pinCode.length < 6) {
      setPinFetchError("Enter 6 digits");
    } else {
      if (!formData.pinCode || formData.pinCode.length === 0) {
        setFormData(prev => ({ ...prev, state: "", city: "" }));
        setPinFetchError("");
      }
    }
  }, [formData.pinCode]);

  useEffect(() => {
    detectLOB(formData.lob);
  }, [formData.lob]);

  useEffect(() => {
    switch (formData.source) {
      case "Employee":
        setSourceDependentField("Employee Name");
        break;
      case "Channel Partner":
        setSourceDependentField("Channel Partner Name");
        break;
      case "Store":
        setSourceDependentField("Store Name");
        break;
      case "Social Media":
        setSourceDependentField("Social Media Source");
        break;
      case "Other":
        setSourceDependentField("Other Static List");
        break;
      default:
        setSourceDependentField("");
    }
  }, [formData.source]);

  useEffect(() => {
    setShowSeniorOneDOB(healthDetails.policyType === "Floater");
  }, [healthDetails.policyType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ============================================================
  // API CALLS
  // ============================================================
  const fetchLeads = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/user-leads`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
        setError(null);
      } else if (res.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else {
        try {
          const errorData = await res.json();
          setError(errorData.error || errorData.message || "Failed to fetch leads");
        } catch (parseError) {
          setError(`Server error: ${res.status} ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const employeesOnly = data.filter(user => 
          user.userType === 'Employee' || user.role === 'Employee'
        );
        setEmployees(employeesOnly);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchCityState = async (pinCode) => {
    setIsFetchingPin(true);
    setPinFetchError("");
    
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
      const data = await response.json();
      
      if (data && data[0]?.Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          state: postOffice.State || "",
          city: postOffice.District || postOffice.Name || "",
        }));
        setPinFetchError("");
      } else {
        setFormData(prev => ({ ...prev, state: "", city: "" }));
        setPinFetchError("Invalid PIN code");
      }
    } catch (error) {
      console.error("Error fetching city/state:", error);
      setFormData(prev => ({ ...prev, state: "", city: "" }));
      setPinFetchError("Could not fetch location");
    } finally {
      setIsFetchingPin(false);
    }
  };

  // ============================================================
  // LOB DETECTION
  // ============================================================
  const detectLOB = (lob) => {
    if (!lob) {
      setShowHealthSection(false);
      setShowMotorSection(false);
      setShowElectronicSection(false);
      return;
    }

    const isHealth = lob.toLowerCase().includes("health") || 
                     lob === "Mediclaim Health Insurance" || 
                     lob === "Group Health Insurance";
    const isMotor = lob.toLowerCase().includes("motor") || 
                    lob.includes("Car") || 
                    lob.includes("Two-Wheeler") || 
                    lob.includes("Taxi") ||
                    lob.includes("Commercial Vehicle") ||
                    lob.includes("E-Rikshaw") ||
                    lob.includes("School Bus") ||
                    lob.includes("Truck") ||
                    lob.includes("Tractor") ||
                    lob.includes("Auto Rickshaw") ||
                    lob === "Private Car-OD" ||
                    lob === "Private Car-SOD" ||
                    lob === "Private Car-Comprehensive" ||
                    lob === "Private Car-TP" ||
                    lob === "Taxi-Comprehensive" ||
                    lob === "Taxi-TP" ||
                    lob === "Commercial Vehicle-Comprehensive" ||
                    lob === "Commercial Vehicle-TP" ||
                    lob === "E-Rikshaw-TP" ||
                    lob === "E-Rikshaw-Comprehensive" ||
                    lob === "Two-Wheeler-TP";
    const isElectronic = lob.toLowerCase().includes("mobile") || 
                         lob.toLowerCase().includes("electronic") || 
                         lob.toLowerCase().includes("equipment") ||
                         lob.toLowerCase().includes("tablet") ||
                         lob.toLowerCase().includes("laptop");

    setShowHealthSection(isHealth);
    setShowMotorSection(isMotor);
    setShowElectronicSection(isElectronic);
  };

  // ============================================================
  // FLOATER MEMBERS
  // ============================================================
  const generateFloaterMembers = () => {
    let adults = parseInt(healthDetails.numberOfAdults) || 0;
    let children = parseInt(healthDetails.numberOfChildren) || 0;
    
    const members = [];
    
    if (healthDetails.proposerIsMember === "Yes") {
      members.push({
        id: `proposer`,
        type: 'proposer',
        name: formData.name || '',
        dob: healthDetails.proposerDOB || '',
        monthlyIncome: healthDetails.familyIncome || '',
        height: healthDetails.height || '',
        weight: healthDetails.weight || '',
        qualification: healthDetails.qualification || '',
        occupation: healthDetails.occupation || '',
        relationship: 'Self',
        aadhaarNumber: healthDetails.aadhaarNumber || '',
        aadhaarFile: null,
        epicFile: null,
        birthCertificate: null,
        ped: '',
        treatmentHistory: '',
        medicalRemarks: '',
        wantRider: '',
        selectedRider: '',
        riderDetails: {
          instaShield: '',
          asthma: '',
          diabetes: '',
          hypertension: '',
          hyperlipidaemia: '',
        },
        fetalFlourish: '',
        nrInsure: '',
        lossOfIncome: '',
        majorIllness: '',
        internationalCover: '',
      });
      
      const remainingAdults = adults > 1 ? adults - 1 : 0;
      for (let i = 1; i <= remainingAdults; i++) {
        members.push({
          id: `adult-${i}`,
          type: 'adult',
          name: '',
          dob: '',
          monthlyIncome: '',
          height: '',
          weight: '',
          qualification: '',
          occupation: '',
          relationship: '',
          aadhaarNumber: '',
          aadhaarFile: null,
          epicFile: null,
          birthCertificate: null,
          ped: '',
          treatmentHistory: '',
          medicalRemarks: '',
          wantRider: '',
          selectedRider: '',
          riderDetails: {
            instaShield: '',
            asthma: '',
            diabetes: '',
            hypertension: '',
            hyperlipidaemia: '',
          },
          fetalFlourish: '',
          nrInsure: '',
          lossOfIncome: '',
          majorIllness: '',
          internationalCover: '',
        });
      }
    } else {
      for (let i = 1; i <= adults; i++) {
        members.push({
          id: `adult-${i}`,
          type: 'adult',
          name: '',
          dob: '',
          monthlyIncome: '',
          height: '',
          weight: '',
          qualification: '',
          occupation: '',
          relationship: '',
          aadhaarNumber: '',
          aadhaarFile: null,
          epicFile: null,
          birthCertificate: null,
          ped: '',
          treatmentHistory: '',
          medicalRemarks: '',
          wantRider: '',
          selectedRider: '',
          riderDetails: {
            instaShield: '',
            asthma: '',
            diabetes: '',
            hypertension: '',
            hyperlipidaemia: '',
          },
          fetalFlourish: '',
          nrInsure: '',
          lossOfIncome: '',
          majorIllness: '',
          internationalCover: '',
        });
      }
    }
    
    for (let i = 1; i <= children; i++) {
      members.push({
        id: `child-${i}`,
        type: 'child',
        name: '',
        dob: '',
        monthlyIncome: '',
        height: '',
        weight: '',
        qualification: '',
        occupation: '',
        relationship: '',
        aadhaarNumber: '',
        aadhaarFile: null,
        epicFile: null,
        birthCertificate: null,
        ped: '',
        treatmentHistory: '',
        medicalRemarks: '',
        wantRider: '',
        selectedRider: '',
        riderDetails: {
          instaShield: '',
          asthma: '',
          diabetes: '',
          hypertension: '',
          hyperlipidaemia: '',
        },
        fetalFlourish: '',
        nrInsure: '',
        lossOfIncome: '',
        majorIllness: '',
        internationalCover: '',
      });
    }
    
    setHealthDetails(prev => ({ ...prev, members }));
  };

  // ============================================================
  // PREVIOUS POLICY HANDLERS
  // ============================================================
  const handlePreviousPolicyChange = (value) => {
    setHealthDetails(prev => ({ ...prev, hasPreviousPolicy: value }));
    if (value === "Yes") {
      setShowPreviousPolicyPopup(true);
    } else {
      setShowPreviousPolicyPopup(false);
      setHealthDetails(prev => ({ 
        ...prev, 
        previousPolicyCase: "",
        experienceYears: "",
        renewalDetails: { insurerName: "", policyNumber: "", policyDueDate: "", uploadPolicy: null },
        portabilityDetails: []
      }));
      setShowRenewalFields(false);
      setShowPortabilityFields(false);
      setShowFreshCaseFields(false);
    }
  };

  const handlePreviousPolicyCase = (value) => {
    setHealthDetails(prev => ({ ...prev, previousPolicyCase: value }));
    setShowRenewalFields(false);
    setShowPortabilityFields(false);
    setShowFreshCaseFields(false);
    
    if (value === "Renew Case") {
      setShowRenewalFields(true);
    } else if (value === "Portability Case") {
      setShowPortabilityFields(true);
    } else if (value === "Fresh Case") {
      setShowFreshCaseFields(true);
    }
  };

  const handleExperienceYears = (value) => {
    const years = parseInt(value) || 0;
    setHealthDetails(prev => ({ ...prev, experienceYears: value }));
    
    const details = [];
    for (let i = 1; i <= years; i++) {
      details.push({
        id: i,
        insurerName: "",
        policyNumber: "",
        policyActiveFrom: "",
        policyTillDate: "",
        sumAssured: "",
        noClaimBonus: "",
        ipdClaimTaken: "",
        uploadPYP: null,
      });
    }
    setHealthDetails(prev => ({ ...prev, portabilityDetails: details }));
  };

  const handlePortabilityDetailChange = (index, field, value) => {
    const newDetails = [...healthDetails.portabilityDetails];
    newDetails[index][field] = value;
    setHealthDetails(prev => ({ ...prev, portabilityDetails: newDetails }));
  };

  const handleRenewalDetailChange = (field, value) => {
    setHealthDetails(prev => ({
      ...prev,
      renewalDetails: { ...prev.renewalDetails, [field]: value }
    }));
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const safeNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (val) => {
    return val ? Number(val).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0.00";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return "Unknown";
    const employeeIdStr = typeof employeeId === 'object' ? employeeId._id : employeeId;
    const employee = employees.find(e => e._id === employeeIdStr);
    return employee ? employee.fullName || employee.username || employee.name || employee.email : "Unknown";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-yellow-100 text-yellow-800";
      case "Quotation Generated": return "bg-blue-100 text-blue-800";
      case "Payment Link Generated": return "bg-purple-100 text-purple-800";
      case "Payment Done": return "bg-green-100 text-green-800";
      case "Policy Issued": return "bg-emerald-100 text-emerald-800";
      case "Closed Without Issuance": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Open": return <FaClock className="text-yellow-500" />;
      case "Quotation Generated": return <FaFileAlt className="text-blue-500" />;
      case "Payment Link Generated": return <FaMoneyBillWave className="text-purple-500" />;
      case "Payment Done": return <FaCheckCircle className="text-green-500" />;
      case "Policy Issued": return <FaCheckCircle className="text-emerald-500" />;
      case "Closed Without Issuance": return <FaExclamationTriangle className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  // ============================================================
  // VALIDATE ALL FIELDS - Same as LeadTable
  // ============================================================
  const validateAllFields = () => {
    const errors = {};
    const errorList = [];
    
    // Basic validation
    if (!formData.name) {
      errors.name = "Name is required";
      errorList.push({ field: "name", message: "Name is required" });
    }
    if (!formData.mobileNo) {
      errors.mobileNo = "Mobile number is required";
      errorList.push({ field: "mobileNo", message: "Mobile number is required" });
    }
    if (formData.mobileNo && !validateMobile(formData.mobileNo)) {
      errors.mobileNo = "Enter valid 10-digit mobile number";
      errorList.push({ field: "mobileNo", message: "Enter valid 10-digit mobile number" });
    }
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = "Invalid email format";
      errorList.push({ field: "email", message: "Invalid email format" });
    }
    if (formData.pinCode && !validatePIN(formData.pinCode)) {
      errors.pinCode = "Enter valid 6-digit PIN code";
      errorList.push({ field: "pinCode", message: "Enter valid 6-digit PIN code" });
    }
    if (!formData.lob) {
      errors.lob = "LOB is required";
      errorList.push({ field: "lob", message: "LOB is required" });
    }
    
    // Health validation
    if (showHealthSection) {
      if (!healthDetails.policyType) {
        errors.policyType = "Policy Type is required";
        errorList.push({ field: "policyType", message: "Policy Type is required" });
      }
      
      if (healthDetails.policyType === "Individual") {
        if (!healthDetails.nomineeName) {
          errors.nomineeName = "Nominee Name is required for Individual policy";
          errorList.push({ field: "nomineeName", message: "Nominee Name is required for Individual policy" });
        }
        if (!healthDetails.nomineeDOB) {
          errors.nomineeDOB = "Nominee DOB is required for Individual policy";
          errorList.push({ field: "nomineeDOB", message: "Nominee DOB is required for Individual policy" });
        }
        if (!healthDetails.nomineeRelationship) {
          errors.nomineeRelationship = "Nominee Relationship is required for Individual policy";
          errorList.push({ field: "nomineeRelationship", message: "Nominee Relationship is required for Individual policy" });
        }
      }
      
      if (healthDetails.policyType === "Floater") {
        if (!healthDetails.numberOfAdults || healthDetails.numberOfAdults <= 0) {
          errors.numberOfAdults = "Number of Adults is required for Floater policy";
          errorList.push({ field: "numberOfAdults", message: "Number of Adults is required for Floater policy" });
        }
        if (!healthDetails.proposerIsMember) {
          errors.proposerIsMember = "Proposer is a Member within the Plan is required";
          errorList.push({ field: "proposerIsMember", message: "Proposer is a Member within the Plan is required" });
        }
      }
      
      if (healthDetails.aadhaarNumber && !validateAadhaar(healthDetails.aadhaarNumber)) {
        errors.aadhaar = "Aadhaar must be exactly 12 digits";
        errorList.push({ field: "aadhaarNumber", message: "Aadhaar must be exactly 12 digits" });
      }
      
      if (healthDetails.panNumber && !validatePAN(healthDetails.panNumber)) {
        errors.pan = "PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)";
        errorList.push({ field: "panNumber", message: "PAN format: ABCDE1234F" });
      }
      
      if (healthDetails.hasPreviousPolicy === "Yes") {
        if (!healthDetails.previousPolicyCase) {
          errors.previousPolicyCase = "Previous Policy Case is required";
          errorList.push({ field: "previousPolicyCase", message: "Previous Policy Case is required" });
        }
        
        if (healthDetails.previousPolicyCase === "Portability Case") {
          if (!healthDetails.experienceYears || healthDetails.experienceYears <= 0) {
            errors.experienceYears = "Experience years are required for Portability Case";
            errorList.push({ field: "experienceYears", message: "Experience years are required for Portability Case" });
          }
          healthDetails.portabilityDetails.forEach((detail, idx) => {
            if (!detail.insurerName) {
              errors[`portabilityInsurer_${idx}`] = `Insurer Name is required for Policy ${idx + 1}`;
              errorList.push({ field: `portabilityInsurer_${idx}`, message: `Insurer Name is required for Policy ${idx + 1}` });
            }
            if (!detail.policyNumber) {
              errors[`portabilityPolicy_${idx}`] = `Policy Number is required for Policy ${idx + 1}`;
              errorList.push({ field: `portabilityPolicy_${idx}`, message: `Policy Number is required for Policy ${idx + 1}` });
            }
            if (!detail.policyActiveFrom) {
              errors[`portabilityActive_${idx}`] = `Policy Active From is required for Policy ${idx + 1}`;
              errorList.push({ field: `portabilityActive_${idx}`, message: `Policy Active From is required for Policy ${idx + 1}` });
            }
            if (!detail.policyTillDate) {
              errors[`portabilityTill_${idx}`] = `Policy Till Date is required for Policy ${idx + 1}`;
              errorList.push({ field: `portabilityTill_${idx}`, message: `Policy Till Date is required for Policy ${idx + 1}` });
            }
            if (!detail.sumAssured) {
              errors[`portabilitySum_${idx}`] = `SUM ASSURED is required for Policy ${idx + 1}`;
              errorList.push({ field: `portabilitySum_${idx}`, message: `SUM ASSURED is required for Policy ${idx + 1}` });
            }
            if (!detail.uploadPYP) {
              errors[`portabilityUpload_${idx}`] = `Upload PYP is mandatory for Policy ${idx + 1}`;
              errorList.push({ field: `portabilityUpload_${idx}`, message: `Upload PYP is mandatory for Policy ${idx + 1}` });
            }
          });
        }
        
        if (healthDetails.previousPolicyCase === "Renew Case") {
          if (!healthDetails.renewalDetails?.insurerName) {
            errors.renewalInsurer = "Insurer Name is required for Renew Case";
            errorList.push({ field: "renewalInsurer", message: "Insurer Name is required for Renew Case" });
          }
          if (!healthDetails.renewalDetails?.policyNumber) {
            errors.renewalPolicy = "Policy Number is required for Renew Case";
            errorList.push({ field: "renewalPolicy", message: "Policy Number is required for Renew Case" });
          }
          if (!healthDetails.renewalDetails?.policyDueDate) {
            errors.renewalDueDate = "Policy Due Date is required for Renew Case";
            errorList.push({ field: "renewalDueDate", message: "Policy Due Date is required for Renew Case" });
          }
        }
      }
    }
    
    // Motor validation
    if (showMotorSection) {
      if (!motorDetails.vehicleType) {
        errors.vehicleType = "Vehicle type is required";
        errorList.push({ field: "vehicleType", message: "Vehicle type is required" });
      }
      
      if (!motorDetails.previousInsuranceStatus) {
        errors.previousInsuranceStatus = "Previous Insurance Status is required";
        errorList.push({ field: "previousInsuranceStatus", message: "Previous Insurance Status is required" });
      }
      
      const isNewVehicle = motorDetails.previousInsuranceStatus === "New";
      if (!isNewVehicle && !motorDetails.registrationNumber) {
        errors.registration = "Registration number is required";
        errorList.push({ field: "registrationNumber", message: "Registration number is required" });
      }
      
      if (!motorDetails.insuranceType) {
        errors.insuranceType = "Insurance type is required";
        errorList.push({ field: "insuranceType", message: "Insurance type is required" });
      }
      
      if (motorDetails.previousInsuranceStatus === "New") {
        if (!motorDetails.manufacturer) {
          errors.manufacturer = "Manufacturer is required for New Vehicle";
          errorList.push({ field: "manufacturer", message: "Manufacturer is required for New Vehicle" });
        }
        if (!motorDetails.model) {
          errors.model = "Model is required for New Vehicle";
          errorList.push({ field: "model", message: "Model is required for New Vehicle" });
        }
        if (!motorDetails.fuelType) {
          errors.fuelType = "Fuel Type is required for New Vehicle";
          errorList.push({ field: "fuelType", message: "Fuel Type is required for New Vehicle" });
        }
        if (!motorDetails.rtoCode) {
          errors.rtoCode = "RTO Code is required for New Vehicle";
          errorList.push({ field: "rtoCode", message: "RTO Code is required for New Vehicle" });
        }
        if (!motorDetails.chesisNo) {
          errors.chesisNo = "Chesis No. is required for New Vehicle";
          errorList.push({ field: "chesisNo", message: "Chesis No. is required for New Vehicle" });
        }
        if (!motorDetails.yearOfManufacturing) {
          errors.yearOfManufacturing = "Year of Manufacturing is required for New Vehicle";
          errorList.push({ field: "yearOfManufacturing", message: "Year of Manufacturing is required for New Vehicle" });
        }
        if (!motorDetails.monthOfManufacturing) {
          errors.monthOfManufacturing = "Month of Manufacturing is required for New Vehicle";
          errorList.push({ field: "monthOfManufacturing", message: "Month of Manufacturing is required for New Vehicle" });
        }
        if (!motorDetails.idvAsPerInvoice) {
          errors.idvAsPerInvoice = "IDV (As per Invoice) is required for New Vehicle";
          errorList.push({ field: "idvAsPerInvoice", message: "IDV (As per Invoice) is required for New Vehicle" });
        }
        if (!motorDetails.invoiceCopy) {
          errors.invoiceCopy = "Invoice Copy is required for New Vehicle";
          errorList.push({ field: "invoiceCopy", message: "Invoice Copy is required for New Vehicle" });
        }
      }
      
      if (motorDetails.previousInsuranceStatus === "Active") {
        if (motorDetails.insuranceType === "Comprehensive (OD+TP)" || motorDetails.insuranceType === "SAOD (On Damage)") {
          if (!motorDetails.odDueDate) {
            errors.odDueDate = "OD Due Date is required for Active Policy";
            errorList.push({ field: "odDueDate", message: "OD Due Date is required for Active Policy" });
          }
          if (!motorDetails.tpDueDate) {
            errors.tpDueDate = "TP Due Date is required for Active Policy";
            errorList.push({ field: "tpDueDate", message: "TP Due Date is required for Active Policy" });
          }
        }
        
        if (!motorDetails.policyNo) {
          errors.policyNo = "Policy No. is required for Active Policy";
          errorList.push({ field: "policyNo", message: "Policy No. is required for Active Policy" });
        }
        if (!motorDetails.previousInsurerName) {
          errors.previousInsurerName = "Previous Insurer Name is required for Active Policy";
          errorList.push({ field: "previousInsurerName", message: "Previous Insurer Name is required for Active Policy" });
        }
        if (!motorDetails.idvAsPerPYP) {
          errors.idvAsPerPYP = "IDV (As per PYP) is required for Active Policy";
          errorList.push({ field: "idvAsPerPYP", message: "IDV (As per PYP) is required for Active Policy" });
        }
        
        if (!motorDetails.claimTaken) {
          errors.claimTaken = "Claim Taken is required for Active Policy";
          errorList.push({ field: "claimTaken", message: "Claim Taken is required for Active Policy" });
        }
        if (motorDetails.claimTaken === "No" && !motorDetails.ncb) {
          errors.ncb = "NCB selection is required when Claim Taken is No";
          errorList.push({ field: "ncb", message: "NCB selection is required when Claim Taken is No" });
        }
        
        if (motorDetails.insuranceType === "SAOD (On Damage)") {
          if (!motorDetails.saodOdDueDate) {
            errors.saodOdDueDate = "OD Due Date is required for SAOD";
            errorList.push({ field: "saodOdDueDate", message: "OD Due Date is required for SAOD" });
          }
          if (!motorDetails.saodTpDueDate) {
            errors.saodTpDueDate = "TP Due Date is required for SAOD";
            errorList.push({ field: "saodTpDueDate", message: "TP Due Date is required for SAOD" });
          }
          if (!motorDetails.saodPolicyNo) {
            errors.saodPolicyNo = "Previous Policy No. is required for SAOD";
            errorList.push({ field: "saodPolicyNo", message: "Previous Policy No. is required for SAOD" });
          }
          if (!motorDetails.saodPreviousInsurerName) {
            errors.saodPreviousInsurerName = "Previous Insurer Name is required for SAOD";
            errorList.push({ field: "saodPreviousInsurerName", message: "Previous Insurer Name is required for SAOD" });
          }
          if (!motorDetails.saodIdvAsPerPYP) {
            errors.saodIdvAsPerPYP = "IDV (As per PYP) is required for SAOD";
            errorList.push({ field: "saodIdvAsPerPYP", message: "IDV (As per PYP) is required for SAOD" });
          }
        }
      }
      
      if (motorDetails.insuranceType === "TP (Third Party)") {
        if (!motorDetails.tpInsuranceDueDate) {
          errors.tpInsuranceDueDate = "TP Due Date is required for TP Insurance";
          errorList.push({ field: "tpInsuranceDueDate", message: "TP Due Date is required for TP Insurance" });
        }
      }
      
      if (motorDetails.insuranceType !== "TP (Third Party)") {
        if (!motorDetails.addOnRequired) {
          errors.addOnRequired = "Add-On selection is required";
          errorList.push({ field: "addOnRequired", message: "Add-On selection is required" });
        }
        if (motorDetails.addOnRequired === "Yes" && (!motorDetails.selectedAddOns || motorDetails.selectedAddOns.length === 0)) {
          errors.selectedAddOns = "Please select at least one Add-On";
          errorList.push({ field: "selectedAddOns", message: "Please select at least one Add-On" });
        }
      }
      
      if (motorDetails.previousInsuranceStatus === "Active") {
        if (!motorDetails.pypFile) {
          errors.pypFile = "Upload PYP is required for Active Policy";
          errorList.push({ field: "pypFile", message: "Upload PYP is required for Active Policy" });
        }
      }
      
      if (motorDetails.previousInsuranceStatus !== "New") {
        if (!motorDetails.rcFrontFile) {
          errors.rcFrontFile = "RC Front Upload is required";
          errorList.push({ field: "rcFrontFile", message: "RC Front Upload is required" });
        }
        if (!motorDetails.rcBackFile) {
          errors.rcBackFile = "RC Back Upload is required";
          errorList.push({ field: "rcBackFile", message: "RC Back Upload is required" });
        }
      }
      
      if (motorDetails.previousInsuranceStatus === "New") {
        if (!motorDetails.invoiceCopy) {
          errors.invoiceCopy = "Invoice Copy is required for New Vehicle";
          errorList.push({ field: "invoiceCopy", message: "Invoice Copy is required for New Vehicle" });
        }
      }
    }
    
    // Electronic validation
    if (showElectronicSection) {
      if (!electronicDetails.deviceType) {
        errors.deviceType = "Device type is required";
        errorList.push({ field: "deviceType", message: "Device type is required" });
      }
      if (!electronicDetails.dateOfPurchase) {
        errors.dateOfPurchase = "Date of Purchase is required";
        errorList.push({ field: "dateOfPurchase", message: "Date of Purchase is required" });
      }
      if (!electronicDetails.purchaseValue) {
        errors.purchaseValue = "Purchase Value is required";
        errorList.push({ field: "purchaseValue", message: "Purchase Value is required" });
      }
      if (electronicDetails.aadhaarNumber && !validateAadhaar(electronicDetails.aadhaarNumber)) {
        errors.electronicAadhaar = "Aadhaar must be exactly 12 digits";
        errorList.push({ field: "electronicAadhaar", message: "Aadhaar must be exactly 12 digits" });
      }
      if (electronicDetails.panNumber && !validatePAN(electronicDetails.panNumber)) {
        errors.electronicPan = "PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)";
        errorList.push({ field: "electronicPan", message: "PAN format: ABCDE1234F" });
      }
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

  // ============================================================
  // CRUD OPERATIONS
  // ============================================================
  
  // Open Edit Modal - Same as LeadTable
  const handleEdit = (lead) => {
    setEditLead(lead);
    
    setFormData({
      name: lead.name || "",
      email: lead.email || "",
      mobileNo: lead.mobileNo || "",
      gender: lead.gender || "",
      source: lead.source || "",
      remarks: lead.remarks || "",
      lob: lead.lob || "",
      pinCode: lead.pinCode || "",
      state: lead.state || "",
      city: lead.city || "",
      sourceDependentValue: lead.sourceDependentValue || "",
      policyTenure: lead.policyTenure || "",
      paymentTerm: lead.paymentTerm || "",
      sumInsured: lead.sumInsured || "",
    });
    
    if (lead.healthDetails) {
      setHealthDetails({
        ...lead.healthDetails,
        aadhaarFile: null,
        panFile: null,
        previousPolicyFile: null,
        members: lead.healthDetails.members || [],
      });
      if (lead.healthDetails.policyType === "Floater") {
        setShowFloaterMembers(true);
        setShowSeniorOneDOB(true);
      }
      if (lead.healthDetails.hasPreviousPolicy === "Yes") {
        setShowPreviousPolicyPopup(true);
        if (lead.healthDetails.previousPolicyCase === "Renew Case") {
          setShowRenewalFields(true);
        } else if (lead.healthDetails.previousPolicyCase === "Portability Case") {
          setShowPortabilityFields(true);
        } else if (lead.healthDetails.previousPolicyCase === "Fresh Case") {
          setShowFreshCaseFields(true);
        }
      }
    }
    
    if (lead.motorDetails) {
      setMotorDetails(lead.motorDetails);
    }
    
    if (lead.electronicDetails) {
      setElectronicDetails(lead.electronicDetails);
    }
    
    detectLOB(lead.lob);
    setShowEditModal(true);
  };

  // Update Lead - Same as LeadTable (without workflow)
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const submitData = new FormData();
    
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("mobileNo", formData.mobileNo);
    submitData.append("gender", formData.gender);
    submitData.append("source", formData.source);
    submitData.append("remarks", formData.remarks);
    submitData.append("lob", formData.lob);
    submitData.append("pinCode", formData.pinCode);
    submitData.append("state", formData.state);
    submitData.append("city", formData.city);
    submitData.append("sourceDependentValue", formData.sourceDependentValue);
    submitData.append("policyTenure", formData.policyTenure);
    submitData.append("paymentTerm", formData.paymentTerm);
    submitData.append("sumInsured", formData.sumInsured);
    
    // Preserve existing status
    submitData.append("status", editLead?.status || "Open");
    
    if (showHealthSection) {
      const hasHealthData = healthDetails.policyType || 
                            healthDetails.hasPreviousPolicy === "Yes" ||
                            healthDetails.proposerDOB ||
                            healthDetails.nomineeName;

      if (hasHealthData) {
        const healthData = { ...healthDetails };
        healthData.proposerName = formData.name;

        delete healthData.aadhaarFile;
        delete healthData.panFile;
        if (healthData.renewalDetails) {
          delete healthData.renewalDetails.uploadPolicy;
        }
        if (healthData.portabilityDetails) {
          healthData.portabilityDetails = healthData.portabilityDetails.map(
            ({ uploadPYP, ...rest }) => rest
          );
        }
        if (healthData.members) {
          healthData.members = healthData.members.map(
            ({ aadhaarFile, epicFile, birthCertificate, ...rest }) => {
              const member = { ...rest };
              if (!member.wantRider) delete member.wantRider;
              if (!member.selectedRider) delete member.selectedRider;
              if (member.riderDetails) {
                const rd = { ...member.riderDetails };
                ['asthma', 'diabetes', 'hypertension', 'hyperlipidaemia'].forEach((k) => {
                  if (!rd[k]) delete rd[k];
                });
                member.riderDetails = rd;
              }
              return member;
            }
          );
        }

        if (!healthData.policyType) delete healthData.policyType;
        if (!healthData.hasPreviousPolicy) delete healthData.hasPreviousPolicy;
        if (!healthData.proposerDOB) delete healthData.proposerDOB;
        if (!healthData.nomineeName) delete healthData.nomineeName;
        if (!healthData.aadhaarNumber) delete healthData.aadhaarNumber;
        if (!healthData.panNumber) delete healthData.panNumber;
        if (!healthData.proposerIsMember) delete healthData.proposerIsMember;
        if (!healthData.previousPolicyCase) delete healthData.previousPolicyCase;
        if (!healthData.numberOfAdults) delete healthData.numberOfAdults;
        if (!healthData.numberOfChildren) delete healthData.numberOfChildren;

        if (Object.keys(healthData).length > 0) {
          submitData.append("healthDetails", JSON.stringify(healthData));
        }
      }
    }

    if (showMotorSection) {
      const hasMotorData = motorDetails.vehicleType || 
                           motorDetails.previousInsuranceStatus ||
                           motorDetails.registrationNumber ||
                           motorDetails.insuranceType;
      
      if (hasMotorData) {
        const motorData = { ...motorDetails };
        
        if (!motorData.vehicleType) delete motorData.vehicleType;
        if (!motorData.previousInsuranceStatus) delete motorData.previousInsuranceStatus;
        if (!motorData.registrationNumber) delete motorData.registrationNumber;
        if (!motorData.insuranceType) delete motorData.insuranceType;
        if (!motorData.claimTaken) delete motorData.claimTaken;
        if (!motorData.addOnRequired) delete motorData.addOnRequired;
        
        if (Object.keys(motorData).length > 0) {
          submitData.append("motorDetails", JSON.stringify(motorData));
        }
      }
      
      if (motorDetails.pypFile) {
        submitData.append("pypFile", motorDetails.pypFile);
      }
      if (motorDetails.rcFrontFile) {
        submitData.append("rcFrontFile", motorDetails.rcFrontFile);
      }
      if (motorDetails.rcBackFile) {
        submitData.append("rcBackFile", motorDetails.rcBackFile);
      }
      if (motorDetails.chesisPhoto) {
        submitData.append("chesisPhoto", motorDetails.chesisPhoto);
      }
      if (motorDetails.invoiceCopy) {
        submitData.append("invoiceCopy", motorDetails.invoiceCopy);
      }
    }

    if (showElectronicSection) {
      const hasElectronicData = electronicDetails.deviceType || 
                                electronicDetails.dateOfPurchase || 
                                electronicDetails.purchaseValue;
      
      if (hasElectronicData) {
        const electronicData = { ...electronicDetails };
        
        delete electronicData.aadhaarFile;
        delete electronicData.panFile;
        
        if (!electronicData.deviceType) delete electronicData.deviceType;
        if (!electronicData.dateOfPurchase) delete electronicData.dateOfPurchase;
        if (!electronicData.purchaseValue) delete electronicData.purchaseValue;
        
        if (Object.keys(electronicData).length > 0) {
          submitData.append("electronicDetails", JSON.stringify(electronicData));
        }
      }
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please login again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/user-leads/${editLead._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (res.ok) {
        const updatedLead = await res.json();
        setLeads((prev) => prev.map((l) => l._id === updatedLead._id ? updatedLead : l));
        setShowEditModal(false);
        setEditLead(null);
        setSuccessMessage("Lead updated successfully!");
      } else {
        const errorData = await res.json();
        setError(errorData.error || errorData.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Lead
  const handleDelete = async (leadId) => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please login again.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/user-leads/${leadId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setLeads(leads.filter(l => l._id !== leadId));
        setSuccessMessage("Lead deleted successfully!");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to delete lead");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    }
  };

  // ============================================================
  // FILTERS
  // ============================================================
  const filteredLeads = leads.filter((lead) => {
    let matchesGlobal = true;
    if (globalSearch.trim()) {
      const searchTerm = globalSearch.toLowerCase().trim();
      matchesGlobal = 
        (lead.policyNumber && lead.policyNumber.toLowerCase().includes(searchTerm)) ||
        (lead.leadCode && lead.leadCode.toLowerCase().includes(searchTerm)) ||
        (lead.mobileNo && lead.mobileNo.includes(searchTerm)) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
        (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
        (lead.lob && lead.lob.toLowerCase().includes(searchTerm));
    }
    
    const matchesStatus = filter === "All" || lead.status === filter;
    const matchesEmployee = !searchEmployee || getEmployeeName(lead.employeeId).toLowerCase().includes(searchEmployee.toLowerCase());
    const matchesName = !searchName || (lead.name && lead.name.toLowerCase().includes(searchName.toLowerCase()));
    const matchesPolicy = !searchPolicy || (lead.policyNumber && lead.policyNumber.toLowerCase().includes(searchPolicy.toLowerCase()));
    const matchesLOB = !searchLOB || (lead.lob && lead.lob.toLowerCase().includes(searchLOB.toLowerCase()));
    const matchesSearchStatus = !searchStatus || (lead.status && lead.status.toLowerCase().includes(searchStatus.toLowerCase()));
    
    let matchesFromDate = true;
    let matchesToDate = true;
    
    if (fromDate && lead.createdAt) {
      const leadDate = new Date(lead.createdAt);
      const filterDate = new Date(fromDate);
      filterDate.setHours(0, 0, 0, 0);
      matchesFromDate = leadDate >= filterDate;
    }
    
    if (toDate && lead.createdAt) {
      const leadDate = new Date(lead.createdAt);
      const filterDate = new Date(toDate);
      filterDate.setHours(23, 59, 59, 999);
      matchesToDate = leadDate <= filterDate;
    }
    
    return matchesGlobal && matchesStatus && matchesEmployee && matchesName && matchesPolicy && 
           matchesLOB && matchesSearchStatus && matchesFromDate && matchesToDate;
  });

  // ============================================================
  // EXPORT FUNCTIONS
  // ============================================================
  const downloadExcel = () => {
    if (filteredLeads.length === 0) {
      setError("No leads to download.");
      return;
    }
    
    const excelData = filteredLeads.map((lead) => ({
      "Employee": getEmployeeName(lead.employeeId),
      "Lead Code": lead.leadCode || "",
      "Customer Name": lead.name || "",
      "Mobile": lead.mobileNo || "",
      "Email": lead.email || "",
      "Policy Number": lead.policyNumber || "",
      "LOB": lead.lob || "",
      "Agency": lead.agency || "",
      "Sum Insured": lead.sumInsured || 0,
      "Net Premium": lead.netPremium || 0,
      "GST %": lead.gst || 0,
      "Gross Premium": lead.grossPremium || 0,
      "Payout %": lead.payout || 0,
      "Payout Value": lead.payoutValue || 0,
      "Additional Payout": lead.additionalPayout || 0,
      "Total Payment": lead.totalPayment || 0,
      "Payout Status": lead.payoutStatus || "Pending",
      "Policy Start Date": lead.policyStartDate ? new Date(lead.policyStartDate).toLocaleDateString() : "",
      "Policy Expiry Date": lead.policyExpiryDate ? new Date(lead.policyExpiryDate).toLocaleDateString() : "",
      "Insurer": lead.insurer || "",
      "Status": lead.status || "",
      "Created At": lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "",
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Leads");
    XLSX.writeFile(wb, `employee_leads_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const clearFilters = () => {
    setGlobalSearch('');
    setSearchEmployee('');
    setSearchName('');
    setSearchPolicy('');
    setFromDate('');
    setToDate('');
    setSearchLOB('');
    setSearchStatus('');
    setFilter('All');
  };

  // ============================================================
  // RENDER FUNCTIONS - Same as LeadTable (Health, Motor, Electronic)
  // ============================================================
  
  // Render Add-On Modal
  const renderAddOnModal = () => {
    if (!showAddOnModal) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto"
        onClick={() => setShowAddOnModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-2xl max-h-[90vh] overflow-y-auto w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaShieldAlt className="text-indigo-600" /> Select Add-Ons
            </h2>
            <button onClick={() => setShowAddOnModal(false)} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">Select the add-ons you want to include in the policy:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADD_ON_OPTIONS.map((addOn) => (
                <label key={addOn} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={motorDetails.selectedAddOns?.includes(addOn) || false}
                    onChange={(e) => {
                      const current = motorDetails.selectedAddOns || [];
                      let updated;
                      if (e.target.checked) {
                        updated = [...current, addOn];
                      } else {
                        updated = current.filter(item => item !== addOn);
                      }
                      setMotorDetails(prev => ({ ...prev, selectedAddOns: updated }));
                    }}
                    className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{addOn}</span>
                    <p className="text-xs text-gray-500">Additional coverage for your policy</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowAddOnModal(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowAddOnModal(false)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <FaCheck /> Confirm Add-Ons
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
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

  // Render Previous Policy Popup
  const renderPreviousPolicyPopup = () => {
    if (!showPreviousPolicyPopup) return null;
    
    const maxDate = getMaxDate();

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto"
        onClick={() => setShowPreviousPolicyPopup(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaFileAlt className="text-indigo-600" /> Previous Policy Details
            </h2>
            <button onClick={() => setShowPreviousPolicyPopup(false)} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Select Case Type</label>
              <select
                data-field="previousPolicyCase"
                value={healthDetails.previousPolicyCase}
                onChange={(e) => handlePreviousPolicyCase(e.target.value)}
                className={`w-full p-2 border rounded-lg ${validationErrors.previousPolicyCase ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select</option>
                {PREVIOUS_POLICY_CASE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {validationErrors.previousPolicyCase && <p className="text-red-500 text-xs mt-1">{validationErrors.previousPolicyCase}</p>}
            </div>

            {showFreshCaseFields && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-700 text-sm">✓ Fresh Case selected - No previous policy details required.</p>
              </div>
            )}

            {showPortabilityFields && (
              <div>
                <div>
                  <label className="text-sm font-medium text-gray-700">How many years Experience/Old the Policy?</label>
                  <select
                    data-field="experienceYears"
                    value={healthDetails.experienceYears}
                    onChange={(e) => handleExperienceYears(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${validationErrors.experienceYears ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select</option>
                    {EXPERIENCE_YEARS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {validationErrors.experienceYears && <p className="text-red-500 text-xs mt-1">{validationErrors.experienceYears}</p>}
                </div>

                {healthDetails.portabilityDetails.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <h4 className="font-semibold text-indigo-600">Policy Details</h4>
                    {healthDetails.portabilityDetails.map((detail, index) => (
                      <div key={detail.id} className="border rounded-lg p-4 bg-gray-50">
                        <h5 className="font-medium text-gray-700 mb-3">Policy {index + 1}</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-700">Previous Insurer Name</label>
                            <input
                              type="text"
                              value={detail.insurerName}
                              onChange={(e) => handlePortabilityDetailChange(index, 'insurerName', e.target.value)}
                              className={`w-full p-2 border rounded-lg text-sm ${validationErrors[`portabilityInsurer_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {validationErrors[`portabilityInsurer_${index}`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`portabilityInsurer_${index}`]}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">PY Policy Number</label>
                            <input
                              type="text"
                              value={detail.policyNumber}
                              onChange={(e) => handlePortabilityDetailChange(index, 'policyNumber', e.target.value)}
                              className={`w-full p-2 border rounded-lg text-sm ${validationErrors[`portabilityPolicy_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {validationErrors[`portabilityPolicy_${index}`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`portabilityPolicy_${index}`]}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Policy Active From</label>
                            <input
                              type="date"
                              max={maxDate}
                              value={detail.policyActiveFrom}
                              onChange={(e) => {
                                const selected = new Date(e.target.value);
                                const today = new Date();
                                if (selected > today) {
                                  alert("Date cannot be in the future");
                                  return;
                                }
                                handlePortabilityDetailChange(index, 'policyActiveFrom', e.target.value);
                              }}
                              className={`w-full p-2 border rounded-lg text-sm ${validationErrors[`portabilityActive_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {validationErrors[`portabilityActive_${index}`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`portabilityActive_${index}`]}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Policy Till Date</label>
                            <input
                              type="date"
                              max={maxDate}
                              value={detail.policyTillDate}
                              onChange={(e) => {
                                const selected = new Date(e.target.value);
                                const today = new Date();
                                if (selected > today) {
                                  alert("Date cannot be in the future");
                                  return;
                                }
                                handlePortabilityDetailChange(index, 'policyTillDate', e.target.value);
                              }}
                              className={`w-full p-2 border rounded-lg text-sm ${validationErrors[`portabilityTill_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {validationErrors[`portabilityTill_${index}`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`portabilityTill_${index}`]}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">SUM ASSURED</label>
                            <select
                              value={detail.sumAssured}
                              onChange={(e) => handlePortabilityDetailChange(index, 'sumAssured', e.target.value)}
                              className={`w-full p-2 border rounded-lg text-sm ${validationErrors[`portabilitySum_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                            >
                              <option value="">Select</option>
                              {SUM_INSURED_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {validationErrors[`portabilitySum_${index}`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`portabilitySum_${index}`]}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Any CB (No Claim Bonus)</label>
                            <input
                              type="text"
                              value={detail.noClaimBonus}
                              onChange={(e) => handlePortabilityDetailChange(index, 'noClaimBonus', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="e.g., 20%"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Any IPD Claim taken during the period</label>
                            <select
                              value={detail.ipdClaimTaken}
                              onChange={(e) => handlePortabilityDetailChange(index, 'ipdClaimTaken', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="">Select</option>
                              {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Upload PYP (Mandatory)</label>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handlePortabilityDetailChange(index, 'uploadPYP', e.target.files[0])}
                              className={`w-full p-2 border rounded-lg text-sm ${validationErrors[`portabilityUpload_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {detail.uploadPYP && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
                            {validationErrors[`portabilityUpload_${index}`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`portabilityUpload_${index}`]}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showRenewalFields && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-indigo-600 mb-3">Renewal Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Insurer Name</label>
                    <input
                      data-field="renewalInsurer"
                      type="text"
                      value={healthDetails.renewalDetails.insurerName}
                      onChange={(e) => handleRenewalDetailChange('insurerName', e.target.value)}
                      className={`w-full p-2 border rounded-lg text-sm ${validationErrors.renewalInsurer ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {validationErrors.renewalInsurer && <p className="text-red-500 text-xs mt-1">{validationErrors.renewalInsurer}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Policy No</label>
                    <input
                      data-field="renewalPolicy"
                      type="text"
                      value={healthDetails.renewalDetails.policyNumber}
                      onChange={(e) => handleRenewalDetailChange('policyNumber', e.target.value)}
                      className={`w-full p-2 border rounded-lg text-sm ${validationErrors.renewalPolicy ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {validationErrors.renewalPolicy && <p className="text-red-500 text-xs mt-1">{validationErrors.renewalPolicy}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Policy Due Date</label>
                    <input
                      data-field="renewalDueDate"
                      type="date"
                      value={healthDetails.renewalDetails.policyDueDate}
                      onChange={(e) => {
                        const selected = new Date(e.target.value);
                        const today = new Date();
                        const thirtyDaysBefore = new Date();
                        thirtyDaysBefore.setDate(today.getDate() - 30);
                        const sixtyDaysAfter = new Date();
                        sixtyDaysAfter.setDate(today.getDate() + 60);
                        
                        if (selected >= thirtyDaysBefore && selected <= sixtyDaysAfter) {
                          handleRenewalDetailChange('policyDueDate', e.target.value);
                        } else {
                          alert("Due date must be within 30 days before or 60 days after current date");
                        }
                      }}
                      className={`w-full p-2 border rounded-lg text-sm ${validationErrors.renewalDueDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {validationErrors.renewalDueDate && <p className="text-red-500 text-xs mt-1">{validationErrors.renewalDueDate}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Upload Policy (Not Mandatory)</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleRenewalDetailChange('uploadPolicy', e.target.files[0])}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-end mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowPreviousPolicyPopup(false);
                  if (!healthDetails.previousPolicyCase) {
                    setHealthDetails(prev => ({ ...prev, hasPreviousPolicy: "" }));
                  }
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowPreviousPolicyPopup(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save & Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Render Health Form
  const renderHealthForm = () => {
    const handleMemberRiderChange = (index, field, value) => {
      const newMembers = [...healthDetails.members];
      newMembers[index][field] = value;
      setHealthDetails(prev => ({ ...prev, members: newMembers }));
    };

    const handleMemberRiderDetailChange = (index, field, value) => {
      const newMembers = [...healthDetails.members];
      newMembers[index].riderDetails[field] = value;
      setHealthDetails(prev => ({ ...prev, members: newMembers }));
    };

    const maxDate = getMaxDate();

    return (
      <div className="border-t-2 border-indigo-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaHeartbeat /> Health Insurance Details
        </h3>

        <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Active Previous Policy?</label>
              <select
                value={healthDetails.hasPreviousPolicy}
                onChange={(e) => handlePreviousPolicyChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Select</option>
                {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {healthDetails.hasPreviousPolicy === "Yes" && !showPreviousPolicyPopup && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setShowPreviousPolicyPopup(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 w-full md:w-auto"
                >
                  <FaEdit /> Manage Previous Policy Details
                </button>
                {healthDetails.previousPolicyCase && (
                  <span className="ml-2 text-sm text-green-600 font-medium">✓ {healthDetails.previousPolicyCase} configured</span>
                )}
              </div>
            )}
          </div>
          {healthDetails.hasPreviousPolicy === "Yes" && healthDetails.previousPolicyCase && (
            <div className="mt-2 text-sm text-gray-600">
              Selected Case: <span className="font-medium text-indigo-600">{healthDetails.previousPolicyCase}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Policy Type</label>
            <select
              data-field="policyType"
              value={healthDetails.policyType}
              onChange={(e) => {
                setHealthDetails(prev => ({ ...prev, policyType: e.target.value }));
                setShowFloaterMembers(e.target.value === "Floater");
                setShowSeniorOneDOB(e.target.value === "Floater");
                if (e.target.value === "Floater") generateFloaterMembers();
              }}
              className={`w-full p-2 border rounded-lg ${validationErrors.policyType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select</option>
              {POLICY_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.policyType && <p className="text-red-500 text-xs mt-1">{validationErrors.policyType}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Policy Tenure</label>
            <select
              value={formData.policyTenure}
              onChange={(e) => setFormData({ ...formData, policyTenure: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              {POLICY_TENURE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Paying Term</label>
            <select
              value={formData.paymentTerm}
              onChange={(e) => setFormData({ ...formData, paymentTerm: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              {PAYMENT_TERM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Sum Insured</label>
            <select
              value={formData.sumInsured}
              onChange={(e) => setFormData({ ...formData, sumInsured: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              {SUM_INSURED_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {healthDetails.policyType === "Floater" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Number of Adults</label>
                <input
                  data-field="numberOfAdults"
                  type="number"
                  min="0"
                  value={healthDetails.numberOfAdults}
                  onChange={(e) => {
                    setHealthDetails(prev => ({ ...prev, numberOfAdults: e.target.value }));
                    generateFloaterMembers();
                  }}
                  className={`w-full p-2 border rounded-lg ${validationErrors.numberOfAdults ? 'border-red-500' : 'border-gray-300'}`}
                />
                {validationErrors.numberOfAdults && <p className="text-red-500 text-xs mt-1">{validationErrors.numberOfAdults}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Number of Children</label>
                <input
                  type="number"
                  min="0"
                  value={healthDetails.numberOfChildren}
                  onChange={(e) => {
                    setHealthDetails(prev => ({ ...prev, numberOfChildren: e.target.value }));
                    generateFloaterMembers();
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </>
          )}

          {showSeniorOneDOB && (
            <div>
              <label className="text-sm font-medium text-gray-700">DOB of Senior One</label>
              <input
                data-field="seniorOneDOB"
                type="date"
                max={maxDate}
                value={healthDetails.seniorOneDOB}
                onChange={(e) => {
                  const selected = new Date(e.target.value);
                  const today = new Date();
                  if (selected > today) {
                    alert("DOB cannot be in the future");
                    return;
                  }
                  setHealthDetails(prev => ({ ...prev, seniorOneDOB: e.target.value }));
                }}
                className={`w-full p-2 border rounded-lg ${validationErrors.seniorDOB ? 'border-red-500' : 'border-gray-300'}`}
              />
              {validationErrors.seniorDOB && <p className="text-red-500 text-xs mt-1">{validationErrors.seniorDOB}</p>}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Proposer Name</label>
            <input
              type="text"
              value={formData.name}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Proposer DOB</label>
            <input
              data-field="proposerDOB"
              type="date"
              max={maxDate}
              value={healthDetails.proposerDOB}
              onChange={(e) => {
                const selected = new Date(e.target.value);
                const today = new Date();
                if (selected > today) {
                  alert("DOB cannot be in the future");
                  return;
                }
                setHealthDetails(prev => ({ ...prev, proposerDOB: e.target.value }));
              }}
              className={`w-full p-2 border rounded-lg ${validationErrors.proposerDOB ? 'border-red-500' : 'border-gray-300'}`}
            />
            {validationErrors.proposerDOB && <p className="text-red-500 text-xs mt-1">{validationErrors.proposerDOB}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Family Income</label>
            <input
              type="number"
              value={healthDetails.familyIncome}
              onChange={(e) => setHealthDetails(prev => ({ ...prev, familyIncome: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Height (ft/in)</label>
            <input
              type="text"
              value={healthDetails.height}
              onChange={(e) => setHealthDetails(prev => ({ ...prev, height: e.target.value }))}
              placeholder="e.g., 5'8\"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              value={healthDetails.weight}
              onChange={(e) => setHealthDetails(prev => ({ ...prev, weight: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Qualification</label>
            <select
              value={healthDetails.qualification}
              onChange={(e) => setHealthDetails(prev => ({ ...prev, qualification: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              {QUALIFICATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Occupation</label>
            <select
              value={healthDetails.occupation}
              onChange={(e) => setHealthDetails(prev => ({ ...prev, occupation: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              {OCCUPATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {healthDetails.policyType === "Floater" && (
            <div>
              <label className="text-sm font-medium text-gray-700">Proposer is a Member within the Plan</label>
              <select
                data-field="proposerIsMember"
                value={healthDetails.proposerIsMember}
                onChange={(e) => {
                  setHealthDetails(prev => ({ ...prev, proposerIsMember: e.target.value }));
                  generateFloaterMembers();
                }}
                className={`w-full p-2 border rounded-lg ${validationErrors.proposerIsMember ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select</option>
                {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {validationErrors.proposerIsMember && <p className="text-red-500 text-xs mt-1">{validationErrors.proposerIsMember}</p>}
            </div>
          )}

          {healthDetails.policyType === "Individual" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Nominee Name</label>
                <input
                  data-field="nomineeName"
                  type="text"
                  value={healthDetails.nomineeName}
                  onChange={(e) => setHealthDetails(prev => ({ ...prev, nomineeName: toUpperCase(e.target.value) }))}
                  className={`w-full p-2 border rounded-lg uppercase ${validationErrors.nomineeName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {validationErrors.nomineeName && <p className="text-red-500 text-xs mt-1">{validationErrors.nomineeName}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nominee DOB</label>
                <input
                  data-field="nomineeDOB"
                  type="date"
                  max={maxDate}
                  value={healthDetails.nomineeDOB}
                  onChange={(e) => {
                    const selected = new Date(e.target.value);
                    const today = new Date();
                    if (selected > today) {
                      alert("DOB cannot be in the future");
                      return;
                    }
                    setHealthDetails(prev => ({ ...prev, nomineeDOB: e.target.value }));
                  }}
                  className={`w-full p-2 border rounded-lg ${validationErrors.nomineeDOB ? 'border-red-500' : 'border-gray-300'}`}
                />
                {validationErrors.nomineeDOB && <p className="text-red-500 text-xs mt-1">{validationErrors.nomineeDOB}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Relationship</label>
                <select
                  data-field="nomineeRelationship"
                  value={healthDetails.nomineeRelationship}
                  onChange={(e) => setHealthDetails(prev => ({ ...prev, nomineeRelationship: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.nomineeRelationship ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select</option>
                  {RELATIONSHIP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {validationErrors.nomineeRelationship && <p className="text-red-500 text-xs mt-1">{validationErrors.nomineeRelationship}</p>}
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
            <input
              data-field="aadhaarNumber"
              type="text"
              value={healthDetails.aadhaarNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 12) setHealthDetails(prev => ({ ...prev, aadhaarNumber: val }));
              }}
              maxLength="12"
              className={`w-full p-2 border rounded-lg ${validationErrors.aadhaar ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter 12 digits only"
            />
            {healthDetails.aadhaarNumber && healthDetails.aadhaarNumber.length > 0 && !validateAadhaar(healthDetails.aadhaarNumber) && (
              <p className="text-red-500 text-xs mt-1">Enter exactly 12 digits</p>
            )}
            {validationErrors.aadhaar && <p className="text-red-500 text-xs mt-1">{validationErrors.aadhaar}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload Aadhaar</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setHealthDetails(prev => ({ ...prev, aadhaarFile: e.target.files[0] }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">PAN Number</label>
            <input
              data-field="panNumber"
              type="text"
              value={healthDetails.panNumber}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                if (val.length <= 10) setHealthDetails(prev => ({ ...prev, panNumber: val }));
              }}
              maxLength="10"
              className={`w-full p-2 border rounded-lg uppercase ${validationErrors.pan ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="ABCDE1234F"
            />
            {healthDetails.panNumber && healthDetails.panNumber.length > 0 && !validatePAN(healthDetails.panNumber) && (
              <p className="text-red-500 text-xs mt-1">Format: ABCDE1234F (5 letters, 4 digits, 1 letter)</p>
            )}
            {validationErrors.pan && <p className="text-red-500 text-xs mt-1">{validationErrors.pan}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload PAN</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setHealthDetails(prev => ({ ...prev, panFile: e.target.files[0] }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">Medical Remarks</label>
            <textarea
              value={healthDetails.medicalRemarks}
              onChange={(e) => setHealthDetails(prev => ({ ...prev, medicalRemarks: e.target.value }))}
              placeholder="Pre-existing diseases, treatment history, other medical remarks"
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows="3"
            />
          </div>
        </div>

        {showFloaterMembers && healthDetails.members.length > 0 && (
          <div className="mt-4 border-t-2 border-indigo-200 pt-4">
            <h4 className="text-md font-semibold text-indigo-600 mb-4 flex items-center gap-2">
              <FaFloater /> Floater Members
            </h4>
            {healthDetails.members.map((member, index) => (
              <div key={member.id} className="border rounded-lg p-4 mb-4 bg-gray-50">
                <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  {member.type === 'proposer' ? <FaUserMd className="text-indigo-600" /> : 
                   member.type === 'adult' ? <FaUser /> : <FaChild />}
                  {member.type === 'proposer' ? 'Proposer' : 
                   member.type === 'adult' ? `Adult ${Math.floor(index + 1)}` : 
                   `Child ${index - (parseInt(healthDetails.numberOfAdults) || 0) + 1}`}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => {
                        const newMembers = [...healthDetails.members];
                        newMembers[index].name = toUpperCase(e.target.value);
                        setHealthDetails(prev => ({ ...prev, members: newMembers }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg uppercase text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">DOB</label>
                    <input
                      type="date"
                      max={maxDate}
                      value={member.dob}
                      onChange={(e) => {
                        const selected = new Date(e.target.value);
                        const today = new Date();
                        if (selected > today) {
                          alert("DOB cannot be in the future");
                          return;
                        }
                        const newMembers = [...healthDetails.members];
                        newMembers[index].dob = e.target.value;
                        setHealthDetails(prev => ({ ...prev, members: newMembers }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Monthly Income</label>
                    <input
                      type="number"
                      value={member.monthlyIncome}
                      onChange={(e) => {
                        const newMembers = [...healthDetails.members];
                        newMembers[index].monthlyIncome = e.target.value;
                        setHealthDetails(prev => ({ ...prev, members: newMembers }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Height</label>
                    <input
                      type="text"
                      value={member.height}
                      onChange={(e) => {
                        const newMembers = [...healthDetails.members];
                        newMembers[index].height = e.target.value;
                        setHealthDetails(prev => ({ ...prev, members: newMembers }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Weight</label>
                    <input
                      type="number"
                      value={member.weight}
                      onChange={(e) => {
                        const newMembers = [...healthDetails.members];
                        newMembers[index].weight = e.target.value;
                        setHealthDetails(prev => ({ ...prev, members: newMembers }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Qualification</label>
                    <select
                      value={member.qualification}
                      onChange={(e) => {
                        const newMembers = [...healthDetails.members];
                        newMembers[index].qualification = e.target.value;
                        setHealthDetails(prev => ({ ...prev, members: newMembers }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select</option>
                      {QUALIFICATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Occupation</label>
                    <select
                      value={member.occupation}
                      onChange={(e) => {
                        const newMembers = [...healthDetails.members];
                        newMembers[index].occupation = e.target.value;
                        setHealthDetails(prev => ({ ...prev, members: newMembers }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select</option>
                      {OCCUPATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Relationship</label>
                    <select
                      value={member.relationship}
                      onChange={(e) => {
                        const newMembers = [...healthDetails.members];
                        newMembers[index].relationship = e.target.value;
                        setHealthDetails(prev => ({ ...prev, members: newMembers }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select</option>
                      {RELATIONSHIP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Aadhaar</label>
                    <input
                      type="text"
                      value={member.aadhaarNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 12) {
                          const newMembers = [...healthDetails.members];
                          newMembers[index].aadhaarNumber = val;
                          setHealthDetails(prev => ({ ...prev, members: newMembers }));
                        }
                      }}
                      maxLength="12"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Upload Document</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg"
                      onChange={(e) => {
                        const newMembers = [...healthDetails.members];
                        newMembers[index].aadhaarFile = e.target.files[0];
                        setHealthDetails(prev => ({ ...prev, members: newMembers }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700">Do You want to Add Rider?</label>
                    <select
                      value={member.wantRider}
                      onChange={(e) => {
                        const newMembers = [...healthDetails.members];
                        newMembers[index].wantRider = e.target.value;
                        if (e.target.value === "No") {
                          newMembers[index].selectedRider = '';
                          newMembers[index].riderDetails = {
                            instaShield: '',
                            asthma: '',
                            diabetes: '',
                            hypertension: '',
                            hyperlipidaemia: '',
                          };
                        }
                        setHealthDetails(prev => ({ ...prev, members: newMembers }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select</option>
                      {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  {member.wantRider === "Yes" && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Select Rider</label>
                        <select
                          value={member.selectedRider}
                          onChange={(e) => handleMemberRiderChange(index, 'selectedRider', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Select</option>
                          {RIDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      {member.selectedRider === "Insta Shield" && (
                        <div className="lg:col-span-3 border-t pt-2 mt-2 border-gray-200">
                          <h6 className="text-xs font-semibold text-gray-600 mb-2">Insta Shield Details</h6>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs font-medium text-gray-700">For Asthma</label>
                              <select
                                value={member.riderDetails?.asthma || ''}
                                onChange={(e) => handleMemberRiderDetailChange(index, 'asthma', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              >
                                <option value="">Select</option>
                                {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Diabetes</label>
                              <select
                                value={member.riderDetails?.diabetes || ''}
                                onChange={(e) => handleMemberRiderDetailChange(index, 'diabetes', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              >
                                <option value="">Select</option>
                                {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Hypertension (Blood Pressure)</label>
                              <select
                                value={member.riderDetails?.hypertension || ''}
                                onChange={(e) => handleMemberRiderDetailChange(index, 'hypertension', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              >
                                <option value="">Select</option>
                                {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Hyperlipidaemia</label>
                              <select
                                value={member.riderDetails?.hyperlipidaemia || ''}
                                onChange={(e) => handleMemberRiderDetailChange(index, 'hyperlipidaemia', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              >
                                <option value="">Select</option>
                                {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {member.selectedRider === "Fetal Flourish" && (
                        <div>
                          <label className="text-xs font-medium text-gray-700">Fetal Flourish</label>
                          <input
                            type="text"
                            value={member.fetalFlourish || ''}
                            onChange={(e) => {
                              const newMembers = [...healthDetails.members];
                              newMembers[index].fetalFlourish = e.target.value;
                              setHealthDetails(prev => ({ ...prev, members: newMembers }));
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Enter details"
                          />
                        </div>
                      )}

                      {member.selectedRider === "NRInsure" && (
                        <div>
                          <label className="text-xs font-medium text-gray-700">NRInsure</label>
                          <input
                            type="text"
                            value={member.nrInsure || ''}
                            onChange={(e) => {
                              const newMembers = [...healthDetails.members];
                              newMembers[index].nrInsure = e.target.value;
                              setHealthDetails(prev => ({ ...prev, members: newMembers }));
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Enter details"
                          />
                        </div>
                      )}

                      {member.selectedRider === "Loss of Income (Any Illness excluding Infection)" && (
                        <div>
                          <label className="text-xs font-medium text-gray-700">Loss of Income</label>
                          <input
                            type="text"
                            value={member.lossOfIncome || ''}
                            onChange={(e) => {
                              const newMembers = [...healthDetails.members];
                              newMembers[index].lossOfIncome = e.target.value;
                              setHealthDetails(prev => ({ ...prev, members: newMembers }));
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Enter details"
                          />
                        </div>
                      )}

                      {member.selectedRider === "Major Illness and Accident Multiplier" && (
                        <div>
                          <label className="text-xs font-medium text-gray-700">Major Illness and Accident Multiplier</label>
                          <input
                            type="text"
                            value={member.majorIllness || ''}
                            onChange={(e) => {
                              const newMembers = [...healthDetails.members];
                              newMembers[index].majorIllness = e.target.value;
                              setHealthDetails(prev => ({ ...prev, members: newMembers }));
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Enter details"
                          />
                        </div>
                      )}

                      {member.selectedRider === "International Cover-Emergency Care" && (
                        <div>
                          <label className="text-xs font-medium text-gray-700">International Cover</label>
                          <input
                            type="text"
                            value={member.internationalCover || ''}
                            onChange={(e) => {
                              const newMembers = [...healthDetails.members];
                              newMembers[index].internationalCover = e.target.value;
                              setHealthDetails(prev => ({ ...prev, members: newMembers }));
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Enter details"
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="lg:col-span-3">
                    <label className="text-xs font-medium text-gray-700">Remarks (PED/Treatment)</label>
                    <textarea
                      value={member.medicalRemarks}
                      onChange={(e) => {
                        const newMembers = [...healthDetails.members];
                        newMembers[index].medicalRemarks = e.target.value;
                        setHealthDetails(prev => ({ ...prev, members: newMembers }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Motor Form
  const renderMotorForm = () => {
    const maxDate = getMaxDate();
    const odRestrictions = getODDueDateRestrictions();
    
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let i = 0; i <= 20; i++) {
      yearOptions.push(currentYear - i);
    }
    
    const monthOptions = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const isBundlePackage = motorDetails.insuranceType?.startsWith("Bundle Package");
    const isComprehensiveOrSAOD = 
      motorDetails.insuranceType === "Comprehensive (OD+TP)" || 
      motorDetails.insuranceType === "SAOD (On Damage)";
    const isTP = motorDetails.insuranceType === "TP (Third Party)";
    const showActiveFields = motorDetails.previousInsuranceStatus === "Active";
    const showNewVehicleFields = motorDetails.previousInsuranceStatus === "New";
    const showSAODFields = motorDetails.insuranceType === "SAOD (On Damage)";
    const showTPFields = motorDetails.insuranceType === "TP (Third Party)";

    return (
      <div className="border-t-2 border-indigo-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaCar /> Motor Insurance Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Vehicle Type <span className="text-red-500">*</span></label>
            <select
              data-field="vehicleType"
              value={motorDetails.vehicleType}
              onChange={(e) => setMotorDetails(prev => ({ ...prev, vehicleType: e.target.value }))}
              className={`w-full p-2 border rounded-lg ${validationErrors.vehicleType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Vehicle Type</option>
              {VEHICLE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.vehicleType && <p className="text-red-500 text-xs mt-1">{validationErrors.vehicleType}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Previous Insurance Status <span className="text-red-500">*</span></label>
            <select
              data-field="previousInsuranceStatus"
              value={motorDetails.previousInsuranceStatus}
              onChange={(e) => setMotorDetails(prev => ({ ...prev, previousInsuranceStatus: e.target.value }))}
              className={`w-full p-2 border rounded-lg ${validationErrors.previousInsuranceStatus ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Status</option>
              {PREVIOUS_INSURANCE_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.previousInsuranceStatus && <p className="text-red-500 text-xs mt-1">{validationErrors.previousInsuranceStatus}</p>}
          </div>

          {!showNewVehicleFields && (
            <div>
              <label className="text-sm font-medium text-gray-700">Registration No. <span className="text-red-500">*</span></label>
              <input
                data-field="registrationNumber"
                type="text"
                value={motorDetails.registrationNumber}
                onChange={(e) => setMotorDetails(prev => ({ ...prev, registrationNumber: e.target.value.toUpperCase() }))}
                className={`w-full p-2 border rounded-lg uppercase ${validationErrors.registration ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., BR01AB1234"
              />
              {validationErrors.registration && <p className="text-red-500 text-xs mt-1">{validationErrors.registration}</p>}
            </div>
          )}

          {!showNewVehicleFields && motorDetails.autoRtoCode && (
            <div>
              <label className="text-sm font-medium text-gray-700">RTO Code (Auto-fetched)</label>
              <input
                type="text"
                value={motorDetails.autoRtoCode}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 uppercase"
              />
            </div>
          )}

          <div className={showNewVehicleFields ? "lg:col-span-3" : ""}>
            <label className="text-sm font-medium text-gray-700">Insurance Type <span className="text-red-500">*</span></label>
            <select
              data-field="insuranceType"
              value={motorDetails.insuranceType}
              onChange={(e) => {
                const selectedType = e.target.value;
                setMotorDetails(prev => ({ 
                  ...prev, 
                  insuranceType: selectedType,
                  odDueDate: "",
                  tpDueDate: "",
                  saodOdDueDate: "",
                  saodTpDueDate: "",
                  saodPolicyNo: "",
                  saodPreviousInsurerName: "",
                  saodIdvAsPerPYP: "",
                }));
              }}
              className={`w-full p-2 border rounded-lg ${validationErrors.insuranceType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Insurance Type</option>
              {INSURANCE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.insuranceType && <p className="text-red-500 text-xs mt-1">{validationErrors.insuranceType}</p>}
            
            {isBundlePackage && (
              <p className="text-xs text-blue-600 mt-1">
                Bundle Package selected - {motorDetails.insuranceType}
              </p>
            )}
          </div>
        </div>

        {showNewVehicleFields && (
          <div className="mt-4 border-t border-blue-200 pt-4">
            <h4 className="text-md font-semibold text-blue-600 mb-3 flex items-center gap-2">
              <FaCar /> New Vehicle Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Manufacturer <span className="text-red-500">*</span></label>
                <select
                  data-field="manufacturer"
                  value={motorDetails.manufacturer}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, manufacturer: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.manufacturer ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Manufacturer</option>
                  {MANUFACTURER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {validationErrors.manufacturer && <p className="text-red-500 text-xs mt-1">{validationErrors.manufacturer}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Model <span className="text-red-500">*</span></label>
                <input
                  data-field="model"
                  type="text"
                  value={motorDetails.model}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, model: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.model ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter model name"
                />
                {validationErrors.model && <p className="text-red-500 text-xs mt-1">{validationErrors.model}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Fuel Type <span className="text-red-500">*</span></label>
                <select
                  data-field="fuelType"
                  value={motorDetails.fuelType}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, fuelType: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.fuelType ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Fuel Type</option>
                  {FUEL_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {validationErrors.fuelType && <p className="text-red-500 text-xs mt-1">{validationErrors.fuelType}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">RTO Code <span className="text-red-500">*</span></label>
                <input
                  data-field="rtoCode"
                  type="text"
                  value={motorDetails.rtoCode}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, rtoCode: e.target.value.toUpperCase() }))}
                  className={`w-full p-2 border rounded-lg uppercase ${validationErrors.rtoCode ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., BR01"
                />
                {validationErrors.rtoCode && <p className="text-red-500 text-xs mt-1">{validationErrors.rtoCode}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Chesis No. <span className="text-red-500">*</span></label>
                <input
                  data-field="chesisNo"
                  type="text"
                  value={motorDetails.chesisNo}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, chesisNo: e.target.value.toUpperCase() }))}
                  className={`w-full p-2 border rounded-lg uppercase ${validationErrors.chesisNo ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter chassis number"
                />
                {validationErrors.chesisNo && <p className="text-red-500 text-xs mt-1">{validationErrors.chesisNo}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Year of Manufacturing <span className="text-red-500">*</span></label>
                <select
                  data-field="yearOfManufacturing"
                  value={motorDetails.yearOfManufacturing}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, yearOfManufacturing: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.yearOfManufacturing ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Year</option>
                  {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                {validationErrors.yearOfManufacturing && <p className="text-red-500 text-xs mt-1">{validationErrors.yearOfManufacturing}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Month of Manufacturing <span className="text-red-500">*</span></label>
                <select
                  data-field="monthOfManufacturing"
                  value={motorDetails.monthOfManufacturing}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, monthOfManufacturing: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.monthOfManufacturing ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Month</option>
                  {monthOptions.map(month => <option key={month} value={month}>{month}</option>)}
                </select>
                {validationErrors.monthOfManufacturing && <p className="text-red-500 text-xs mt-1">{validationErrors.monthOfManufacturing}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">IDV (As per Invoice) <span className="text-red-500">*</span></label>
                <input
                  data-field="idvAsPerInvoice"
                  type="number"
                  value={motorDetails.idvAsPerInvoice}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, idvAsPerInvoice: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.idvAsPerInvoice ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter IDV amount"
                />
                {validationErrors.idvAsPerInvoice && <p className="text-red-500 text-xs mt-1">{validationErrors.idvAsPerInvoice}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Invoice Copy <span className="text-red-500">*</span></label>
                <input
                  data-field="invoiceCopy"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, invoiceCopy: e.target.files[0] }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.invoiceCopy ? 'border-red-500' : 'border-gray-300'}`}
                />
                {motorDetails.invoiceCopy && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
                {validationErrors.invoiceCopy && <p className="text-red-500 text-xs mt-1">{validationErrors.invoiceCopy}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Upload Chesis No. Photo (Not Mandatory)</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, chesisPhoto: e.target.files[0] }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {motorDetails.chesisPhoto && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
              </div>
            </div>
          </div>
        )}

        {showActiveFields && (
          <div className="mt-4 border-t border-green-200 pt-4">
            <h4 className="text-md font-semibold text-green-600 mb-3 flex items-center gap-2">
              <FaShieldAlt /> Active Policy Details
            </h4>
            
            {isComprehensiveOrSAOD && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">OD Due Date <span className="text-red-500">*</span></label>
                  <input
                    data-field="odDueDate"
                    type="date"
                    min={odRestrictions.min}
                    max={odRestrictions.max}
                    value={motorDetails.odDueDate}
                    onChange={(e) => {
                      const selected = new Date(e.target.value);
                      const minDate = new Date(odRestrictions.min);
                      const maxDate = new Date(odRestrictions.max);
                      if (selected >= minDate && selected <= maxDate) {
                        setMotorDetails(prev => ({ ...prev, odDueDate: e.target.value }));
                      } else {
                        alert("OD Due Date must be within 90 days before or 60 days after today");
                      }
                    }}
                    className={`w-full p-2 border rounded-lg ${validationErrors.odDueDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Range: 90 days before to 60 days after today</p>
                  {validationErrors.odDueDate && <p className="text-red-500 text-xs mt-1">{validationErrors.odDueDate}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">TP Due Date <span className="text-red-500">*</span></label>
                  <input
                    data-field="tpDueDate"
                    type="date"
                    value={motorDetails.tpDueDate}
                    onChange={(e) => setMotorDetails(prev => ({ ...prev, tpDueDate: e.target.value }))}
                    className={`w-full p-2 border rounded-lg ${validationErrors.tpDueDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {validationErrors.tpDueDate && <p className="text-red-500 text-xs mt-1">{validationErrors.tpDueDate}</p>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Policy No. <span className="text-red-500">*</span></label>
                <input
                  data-field="policyNo"
                  type="text"
                  value={motorDetails.policyNo}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, policyNo: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.policyNo ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter policy number"
                />
                {validationErrors.policyNo && <p className="text-red-500 text-xs mt-1">{validationErrors.policyNo}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Previous Insurer Name <span className="text-red-500">*</span></label>
                <select
                  data-field="previousInsurerName"
                  value={motorDetails.previousInsurerName}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, previousInsurerName: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.previousInsurerName ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Insurer</option>
                  {INSURER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {validationErrors.previousInsurerName && <p className="text-red-500 text-xs mt-1">{validationErrors.previousInsurerName}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">IDV (As per PYP) <span className="text-red-500">*</span></label>
                <input
                  data-field="idvAsPerPYP"
                  type="number"
                  value={motorDetails.idvAsPerPYP}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, idvAsPerPYP: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.idvAsPerPYP ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter IDV amount"
                />
                {validationErrors.idvAsPerPYP && <p className="text-red-500 text-xs mt-1">{validationErrors.idvAsPerPYP}</p>}
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Claim & NCB Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Claim Taken? <span className="text-red-500">*</span></label>
                  <select
                    data-field="claimTaken"
                    value={motorDetails.claimTaken}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMotorDetails(prev => ({ 
                        ...prev, 
                        claimTaken: value,
                        ncb: value === "Yes" ? "0%" : prev.ncb
                      }));
                    }}
                    className={`w-full p-2 border rounded-lg ${validationErrors.claimTaken ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select</option>
                    {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {validationErrors.claimTaken && <p className="text-red-500 text-xs mt-1">{validationErrors.claimTaken}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">NCB</label>
                  {motorDetails.claimTaken === "Yes" ? (
                    <div>
                      <input
                        type="text"
                        value="0%"
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-red-600 font-semibold"
                      />
                      <p className="text-xs text-red-500 mt-1">Auto-set to 0% as Claim Taken is Yes</p>
                    </div>
                  ) : (
                    <select
                      data-field="ncb"
                      value={motorDetails.ncb}
                      onChange={(e) => setMotorDetails(prev => ({ ...prev, ncb: e.target.value }))}
                      className={`w-full p-2 border rounded-lg ${validationErrors.ncb ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={motorDetails.claimTaken === ""}
                    >
                      <option value="">{motorDetails.claimTaken === "" ? "Select Claim Taken first" : "Select NCB"}</option>
                      {NCB_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  {validationErrors.ncb && <p className="text-red-500 text-xs mt-1">{validationErrors.ncb}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {showSAODFields && showActiveFields && (
          <div className="mt-4 border-t border-purple-200 pt-4">
            <h5 className="text-sm font-semibold text-purple-600 mb-3">SAOD (On Damage) Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">OD Due Date <span className="text-red-500">*</span></label>
                <input
                  data-field="saodOdDueDate"
                  type="date"
                  min={odRestrictions.min}
                  max={odRestrictions.max}
                  value={motorDetails.saodOdDueDate}
                  onChange={(e) => {
                    const selected = new Date(e.target.value);
                    const minDate = new Date(odRestrictions.min);
                    const maxDate = new Date(odRestrictions.max);
                    if (selected >= minDate && selected <= maxDate) {
                      setMotorDetails(prev => ({ ...prev, saodOdDueDate: e.target.value }));
                    } else {
                      alert("OD Due Date must be within 90 days before or 60 days after today");
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Range: 90 days before to 60 days after today</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">TP Due Date <span className="text-red-500">*</span></label>
                <input
                  data-field="saodTpDueDate"
                  type="date"
                  value={motorDetails.saodTpDueDate}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, saodTpDueDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Previous Policy No. <span className="text-red-500">*</span></label>
                <input
                  data-field="saodPolicyNo"
                  type="text"
                  value={motorDetails.saodPolicyNo}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, saodPolicyNo: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Previous Insurer Name <span className="text-red-500">*</span></label>
                <select
                  data-field="saodPreviousInsurerName"
                  value={motorDetails.saodPreviousInsurerName}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, saodPreviousInsurerName: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Insurer</option>
                  {INSURER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">IDV (As per PYP) <span className="text-red-500">*</span></label>
                <input
                  data-field="saodIdvAsPerPYP"
                  type="number"
                  value={motorDetails.saodIdvAsPerPYP}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, saodIdvAsPerPYP: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter IDV amount"
                />
              </div>
            </div>
          </div>
        )}

        {showTPFields && (
          <div className="mt-4 border-t border-orange-200 pt-4">
            <h5 className="text-sm font-semibold text-orange-600 mb-3">TP (Third Party) Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">TP Due Date <span className="text-red-500">*</span></label>
                <input
                  data-field="tpInsuranceDueDate"
                  type="date"
                  value={motorDetails.tpInsuranceDueDate}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, tpInsuranceDueDate: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.tpInsuranceDueDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {validationErrors.tpInsuranceDueDate && <p className="text-red-500 text-xs mt-1">{validationErrors.tpInsuranceDueDate}</p>}
              </div>
            </div>
          </div>
        )}

        {!isTP && (
          <div className="mt-4 border-t border-pink-200 pt-4">
            <h5 className="text-sm font-semibold text-pink-600 mb-3 flex items-center gap-2">
              <FaShieldAlt /> Add-On
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Add-On Required? <span className="text-red-500">*</span></label>
                <select
                  data-field="addOnRequired"
                  value={motorDetails.addOnRequired}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMotorDetails(prev => ({ 
                      ...prev, 
                      addOnRequired: value,
                      selectedAddOns: value === "No" ? [] : prev.selectedAddOns
                    }));
                    if (value === "Yes") {
                      setShowAddOnModal(true);
                    }
                  }}
                  className={`w-full p-2 border rounded-lg ${validationErrors.addOnRequired ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select</option>
                  {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {validationErrors.addOnRequired && <p className="text-red-500 text-xs mt-1">{validationErrors.addOnRequired}</p>}
              </div>

              {motorDetails.addOnRequired === "Yes" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Selected Add-Ons</label>
                  <div className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[40px]">
                    {motorDetails.selectedAddOns && motorDetails.selectedAddOns.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {motorDetails.selectedAddOns.map((addOn, idx) => (
                          <span key={idx} className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs">
                            {addOn}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No add-ons selected</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddOnModal(true)}
                    className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <FaEdit className="h-3 w-3" /> Manage Add-Ons
                  </button>
                  {validationErrors.selectedAddOns && <p className="text-red-500 text-xs mt-1">{validationErrors.selectedAddOns}</p>}
                </div>
              )}
              
              {motorDetails.addOnRequired === "No" && (
                <div className="flex items-center text-gray-500 text-sm">
                  <FaCheck className="text-green-500 mr-2" /> No add-ons selected
                </div>
              )}
            </div>
          </div>
        )}

        {isTP && (
          <div className="mt-4 border-t border-orange-200 pt-4">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 text-orange-700">
                <FaShieldAlt />
                <span className="font-medium">Add-On:</span>
                <span className="font-bold">No</span>
                <span className="text-sm text-orange-600">(Auto-set for TP Insurance)</span>
              </div>
              <input type="hidden" value="No" />
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-gray-200 pt-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Upload Documents</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Upload PYP 
                {motorDetails.previousInsuranceStatus === "Active" && <span className="text-red-500">*</span>}
              </label>
              <input
                data-field="pypFile"
                type="file"
                accept=".pdf"
                onChange={(e) => setMotorDetails(prev => ({ ...prev, pypFile: e.target.files[0] }))}
                className={`w-full p-2 border rounded-lg ${validationErrors.pypFile ? 'border-red-500' : 'border-gray-300'}`}
              />
              {motorDetails.pypFile && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
              {validationErrors.pypFile && <p className="text-red-500 text-xs mt-1">{validationErrors.pypFile}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                RC Front Upload
                {motorDetails.previousInsuranceStatus !== "New" && <span className="text-red-500">*</span>}
              </label>
              <input
                data-field="rcFrontFile"
                type="file"
                accept=".pdf,.jpg,.jpeg"
                onChange={(e) => setMotorDetails(prev => ({ ...prev, rcFrontFile: e.target.files[0] }))}
                className={`w-full p-2 border rounded-lg ${validationErrors.rcFrontFile ? 'border-red-500' : 'border-gray-300'}`}
              />
              {motorDetails.rcFrontFile && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
              {validationErrors.rcFrontFile && <p className="text-red-500 text-xs mt-1">{validationErrors.rcFrontFile}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                RC Back Upload
                {motorDetails.previousInsuranceStatus !== "New" && <span className="text-red-500">*</span>}
              </label>
              <input
                data-field="rcBackFile"
                type="file"
                accept=".pdf,.jpg,.jpeg"
                onChange={(e) => setMotorDetails(prev => ({ ...prev, rcBackFile: e.target.files[0] }))}
                className={`w-full p-2 border rounded-lg ${validationErrors.rcBackFile ? 'border-red-500' : 'border-gray-300'}`}
              />
              {motorDetails.rcBackFile && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
              {validationErrors.rcBackFile && <p className="text-red-500 text-xs mt-1">{validationErrors.rcBackFile}</p>}
            </div>
          </div>
        </div>

        {renderAddOnModal()}
      </div>
    );
  };

  // Render Electronic Form
  const renderElectronicForm = () => {
    const isDeviceOlderThan15Days = () => {
      if (!electronicDetails.dateOfPurchase) return false;
      const purchaseDate = new Date(electronicDetails.dateOfPurchase);
      const today = new Date();
      const diffDays = Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24));
      return diffDays > 15;
    };

    const maxDate = getMaxDate();

    return (
      <div className="border-t-2 border-indigo-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaMobileAlt /> Mobile/Electronic Equipment Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Device Type</label>
            <select
              data-field="deviceType"
              value={electronicDetails.deviceType}
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, deviceType: e.target.value }))}
              className={`w-full p-2 border rounded-lg ${validationErrors.deviceType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select</option>
              {DEVICE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.deviceType && <p className="text-red-500 text-xs mt-1">{validationErrors.deviceType}</p>}
          </div>

          {electronicDetails.deviceType === "Other" && (
            <div>
              <label className="text-sm font-medium text-gray-700">Specify Device Type</label>
              <input
                type="text"
                value={electronicDetails.otherDeviceType}
                onChange={(e) => setElectronicDetails(prev => ({ ...prev, otherDeviceType: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Date of Purchase</label>
            <input
              data-field="dateOfPurchase"
              type="date"
              max={maxDate}
              value={electronicDetails.dateOfPurchase}
              onChange={(e) => {
                const selected = new Date(e.target.value);
                const today = new Date();
                if (selected > today) {
                  alert("Date cannot be in the future");
                  return;
                }
                setElectronicDetails(prev => ({ ...prev, dateOfPurchase: e.target.value }));
              }}
              className={`w-full p-2 border rounded-lg ${validationErrors.dateOfPurchase ? 'border-red-500' : 'border-gray-300'}`}
            />
            {validationErrors.dateOfPurchase && <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfPurchase}</p>}
            {isDeviceOlderThan15Days() && (
              <p className="text-orange-500 text-xs mt-1">⚠️ Device is older than 15 days</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Purchase Value (incl. Tax)</label>
            <input
              data-field="purchaseValue"
              type="number"
              value={electronicDetails.purchaseValue}
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, purchaseValue: e.target.value }))}
              className={`w-full p-2 border rounded-lg ${validationErrors.purchaseValue ? 'border-red-500' : 'border-gray-300'}`}
            />
            {validationErrors.purchaseValue && <p className="text-red-500 text-xs mt-1">{validationErrors.purchaseValue}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
            <input
              data-field="electronicAadhaar"
              type="text"
              value={electronicDetails.aadhaarNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 12) setElectronicDetails(prev => ({ ...prev, aadhaarNumber: val }));
              }}
              maxLength="12"
              className={`w-full p-2 border rounded-lg ${validationErrors.electronicAadhaar ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter 12 digits only"
            />
            {electronicDetails.aadhaarNumber && electronicDetails.aadhaarNumber.length > 0 && !validateAadhaar(electronicDetails.aadhaarNumber) && (
              <p className="text-red-500 text-xs mt-1">Enter exactly 12 digits</p>
            )}
            {validationErrors.electronicAadhaar && <p className="text-red-500 text-xs mt-1">{validationErrors.electronicAadhaar}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload Aadhaar</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, aadhaarFile: e.target.files[0] }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">PAN Number</label>
            <input
              data-field="electronicPan"
              type="text"
              value={electronicDetails.panNumber}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                if (val.length <= 10) setElectronicDetails(prev => ({ ...prev, panNumber: val }));
              }}
              maxLength="10"
              className={`w-full p-2 border rounded-lg uppercase ${validationErrors.electronicPan ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="ABCDE1234F"
            />
            {electronicDetails.panNumber && electronicDetails.panNumber.length > 0 && !validatePAN(electronicDetails.panNumber) && (
              <p className="text-red-500 text-xs mt-1">Format: ABCDE1234F (5 letters, 4 digits, 1 letter)</p>
            )}
            {validationErrors.electronicPan && <p className="text-red-500 text-xs mt-1">{validationErrors.electronicPan}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload PAN</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, panFile: e.target.files[0] }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">IMEI Number</label>
            <input
              type="text"
              value={electronicDetails.imeiNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 15) setElectronicDetails(prev => ({ ...prev, imeiNumber: val }));
              }}
              maxLength="15"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {isDeviceOlderThan15Days() && (
              <p className="text-red-500 text-xs mt-1">IMEI required for devices older than 15 days</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload IMEI Image</label>
            <input
              type="file"
              accept=".jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, imeiImage: e.target.files[0] }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">
              Device Photos (3-4 photos from different angles showing IMEI)
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg"
              multiple
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, devicePhotos: Array.from(e.target.files) }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {electronicDetails.devicePhotos.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">{electronicDetails.devicePhotos.length} photos selected</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload Purchase Invoice</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, purchaseInvoice: e.target.files[0] }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER EDIT MODAL - Full like LeadTable
  // ============================================================
  const renderEditModal = () => {
    const hasErrors = Object.keys(validationErrors).length > 0;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={() => setShowEditModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-6xl max-h-[90vh] overflow-y-auto w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaEdit className="text-indigo-600" /> Edit Lead
            </h2>
            <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {hasErrors && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <FaExclamationCircle className="text-red-500 h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">Please fix the following errors:</p>
                  <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                    {Object.entries(validationErrors).map(([key, error]) => (
                      <li key={key}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg mb-4">
              <div><span className="font-medium">Lead Code:</span> {editLead?.leadCode}</div>
              <div><span className="font-medium">Created:</span> {editLead?.createdAt ? new Date(editLead.createdAt).toLocaleDateString() : "-"}</div>
              <div><span className="font-medium">Current Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  editLead?.status === "Open" ? "bg-yellow-100 text-yellow-800" :
                  editLead?.status === "Policy Issued" ? "bg-emerald-100 text-emerald-800" :
                  "bg-blue-100 text-blue-800"
                }`}>{editLead?.status}</span>
              </div>
              <div><span className="font-medium">LOB:</span> {editLead?.lob}</div>
            </div>

            <h3 className="text-md font-semibold text-gray-700 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: toUpperCase(e.target.value) })}
                  className={`w-full p-2 border rounded-lg uppercase ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
                <input
                  name="mobileNo"
                  type="text"
                  value={formData.mobileNo}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) setFormData({ ...formData, mobileNo: val });
                  }}
                  maxLength="10"
                  className={`w-full p-2 border rounded-lg ${validationErrors.mobileNo ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {validationErrors.mobileNo && <p className="text-red-500 text-xs mt-1">{validationErrors.mobileNo}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email ID</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full p-2 border rounded-lg ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Pin/Zip Code</label>
                <div className="relative">
                  <input
                    name="pinCode"
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 6) {
                        setFormData(prev => ({ ...prev, pinCode: val }));
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
                <label className="text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {SOURCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {sourceDependentField && (
                <div>
                  <label className="text-sm font-medium text-gray-700">{sourceDependentField}</label>
                  {formData.source === "Employee" ? (
                    <select
                      value={formData.sourceDependentValue}
                      onChange={(e) => setFormData({ ...formData, sourceDependentValue: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp.fullName || emp.username}>
                          {emp.fullName || emp.username} {emp.employeeId ? `(${emp.employeeId})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.sourceDependentValue}
                      onChange={(e) => setFormData({ ...formData, sourceDependentValue: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder={`Enter ${sourceDependentField}`}
                    />
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Policy Tenure</label>
                <select
                  value={formData.policyTenure}
                  onChange={(e) => setFormData({ ...formData, policyTenure: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {POLICY_TENURE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Payment Term</label>
                <select
                  value={formData.paymentTerm}
                  onChange={(e) => setFormData({ ...formData, paymentTerm: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {PAYMENT_TERM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Sum Insured</label>
                <select
                  value={formData.sumInsured}
                  onChange={(e) => setFormData({ ...formData, sumInsured: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {SUM_INSURED_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows="2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">LOB <span className="text-red-500">*</span></label>
                <select
                  name="lob"
                  value={formData.lob}
                  onChange={(e) => {
                    setFormData({ ...formData, lob: e.target.value });
                    detectLOB(e.target.value);
                  }}
                  className={`w-full p-2 border rounded-lg ${validationErrors.lob ? 'border-red-500' : 'border-gray-300'}`}
                  required
                >
                  <option value="">-- Select LOB --</option>
                  {LOB_OPTIONS.map(lob => <option key={lob} value={lob}>{lob}</option>)}
                </select>
                {validationErrors.lob && <p className="text-red-500 text-xs mt-1">{validationErrors.lob}</p>}
              </div>
            </div>

            {showHealthSection && renderHealthForm()}
            {showMotorSection && renderMotorForm()}
            {showElectronicSection && renderElectronicForm()}

            {renderPreviousPolicyPopup()}
            {renderValidationPopup()}

            <div className="flex gap-4 justify-end mt-6 pt-4 border-t">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? "Updating..." : <><FaSave /> Update Lead</>}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  // ============================================================
  // RENDER LEAD DETAILS
  // ============================================================
  const renderLeadDetails = () => {
    if (!selectedLead) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={() => setSelectedLead(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-xl font-bold">Lead Details</h2>
            <button onClick={() => setSelectedLead(null)} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><span className="font-medium">Lead Code:</span> {selectedLead.leadCode}</div>
            <div><span className="font-medium">Name:</span> {selectedLead.name}</div>
            <div><span className="font-medium">Mobile:</span> {selectedLead.mobileNo}</div>
            <div><span className="font-medium">Email:</span> {selectedLead.email || "-"}</div>
            <div><span className="font-medium">Gender:</span> {selectedLead.gender || "-"}</div>
            <div><span className="font-medium">Source:</span> {selectedLead.source || "-"}</div>
            <div><span className="font-medium">Source Value:</span> {selectedLead.sourceDependentValue || "-"}</div>
            <div><span className="font-medium">PIN Code:</span> {selectedLead.pinCode || "-"}</div>
            <div><span className="font-medium">State:</span> {selectedLead.state || "-"}</div>
            <div><span className="font-medium">City:</span> {selectedLead.city || "-"}</div>
            <div><span className="font-medium">LOB:</span> {selectedLead.lob || "-"}</div>
            <div><span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                selectedLead.status === "Open" ? "bg-yellow-100 text-yellow-800" :
                selectedLead.status === "Policy Issued" ? "bg-emerald-100 text-emerald-800" :
                "bg-blue-100 text-blue-800"
              }`}>{selectedLead.status}</span>
            </div>
            <div><span className="font-medium">Policy Number:</span> {selectedLead.policyNumber || "-"}</div>
            <div><span className="font-medium">Policy Tenure:</span> {selectedLead.policyTenure || "-"}</div>
            <div><span className="font-medium">Payment Term:</span> {selectedLead.paymentTerm || "-"}</div>
            <div><span className="font-medium">Sum Insured:</span> {selectedLead.sumInsured || "-"}</div>
            <div><span className="font-medium">Insurer:</span> {selectedLead.insurer || "-"}</div>
            <div><span className="font-medium">Policy Start:</span> {selectedLead.policyStartDate || "-"}</div>
            <div><span className="font-medium">Policy Expiry:</span> {selectedLead.policyExpiryDate || "-"}</div>
            <div className="sm:col-span-2">
              <span className="font-medium">Remarks:</span> {selectedLead.remarks || "-"}
            </div>
            {selectedLead.healthDetails && (
              <div className="sm:col-span-2 border-t pt-2 mt-2">
                <h4 className="font-semibold text-indigo-600">Health Insurance Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-sm">
                  <div>Policy Type: {selectedLead.healthDetails.policyType || "-"}</div>
                  <div>Proposer: {selectedLead.healthDetails.proposerName || selectedLead.name || "-"}</div>
                  <div>DOB: {selectedLead.healthDetails.proposerDOB || "-"}</div>
                  <div>Family Income: {selectedLead.healthDetails.familyIncome || "-"}</div>
                  <div>Senior One DOB: {selectedLead.healthDetails.seniorOneDOB || "-"}</div>
                  <div>Proposer is Member: {selectedLead.healthDetails.proposerIsMember || "-"}</div>
                  <div>Previous Policy: {selectedLead.healthDetails.hasPreviousPolicy || "-"}</div>
                  {selectedLead.healthDetails.previousPolicyCase && (
                    <div>Previous Case: {selectedLead.healthDetails.previousPolicyCase}</div>
                  )}
                  <div>Members: {selectedLead.healthDetails.members?.length || 0}</div>
                </div>
              </div>
            )}
            {selectedLead.motorDetails && (
              <div className="sm:col-span-2 border-t pt-2 mt-2">
                <h4 className="font-semibold text-indigo-600">Motor Insurance Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-sm">
                  <div>Vehicle Type: {selectedLead.motorDetails.vehicleType || "-"}</div>
                  <div>Registration: {selectedLead.motorDetails.registrationNumber || "-"}</div>
                  <div>Previous Status: {selectedLead.motorDetails.previousInsuranceStatus || "-"}</div>
                  <div>Insurance Type: {selectedLead.motorDetails.insuranceType || "-"}</div>
                  <div>NCB: {selectedLead.motorDetails.ncb || "-"}</div>
                  <div>Claim Taken: {selectedLead.motorDetails.claimTaken || "-"}</div>
                  {selectedLead.motorDetails.manufacturer && <div>Manufacturer: {selectedLead.motorDetails.manufacturer}</div>}
                  {selectedLead.motorDetails.model && <div>Model: {selectedLead.motorDetails.model}</div>}
                  {selectedLead.motorDetails.chesisNo && <div>Chesis No.: {selectedLead.motorDetails.chesisNo}</div>}
                  {selectedLead.motorDetails.yearOfManufacturing && <div>Year: {selectedLead.motorDetails.yearOfManufacturing}</div>}
                  {selectedLead.motorDetails.monthOfManufacturing && <div>Month: {selectedLead.motorDetails.monthOfManufacturing}</div>}
                  {selectedLead.motorDetails.selectedAddOns && selectedLead.motorDetails.selectedAddOns.length > 0 && (
                    <div className="sm:col-span-2">Add-Ons: {selectedLead.motorDetails.selectedAddOns.join(", ")}</div>
                  )}
                </div>
              </div>
            )}
            {selectedLead.electronicDetails && (
              <div className="sm:col-span-2 border-t pt-2 mt-2">
                <h4 className="font-semibold text-indigo-600">Electronic Equipment Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-sm">
                  <div>Device: {selectedLead.electronicDetails.deviceType || "-"}</div>
                  <div>Purchase Date: {selectedLead.electronicDetails.dateOfPurchase || "-"}</div>
                  <div>IMEI: {selectedLead.electronicDetails.imeiNumber || "-"}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <button onClick={() => setSelectedLead(null)} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ============================================================
  // RENDER STATUS BADGE
  // ============================================================
  const renderStatusBadge = (status) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status)}`}>
        {getStatusIcon(status)}
        {status || "Unknown"}
      </span>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-indigo-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading employee leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="">
        {/* Header - NO Add Lead Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Employee Leads</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage all leads created by employees</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0 flex-wrap">
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaFileExcel /> Export Excel
            </button>
            <button
              onClick={fetchLeads}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <FaSpinner className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-700">
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-700">
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}

        {/* Search & Filter Section */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-6">
          {/* Universal Search */}
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Universal Search: Policy Number, Lead Code, Mobile, Email, Name, LOB..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
              />
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <FaFilter /> Advanced Filters
                {(searchEmployee || searchName || searchPolicy || searchLOB || searchStatus || fromDate || toDate || filter !== "All") && " (Active)"}
              </button>

              {filterDropdownOpen && (
                <div className="absolute z-50 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-h-96 overflow-y-auto">
                  <h4 className="font-medium text-gray-800 mb-3">Advanced Filters</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Employee</label>
                      <input
                        type="text"
                        placeholder="Search by employee..."
                        value={searchEmployee}
                        onChange={(e) => setSearchEmployee(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Customer Name</label>
                      <input
                        type="text"
                        placeholder="Search by customer name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Policy Number</label>
                      <input
                        type="text"
                        placeholder="Search by policy number..."
                        value={searchPolicy}
                        onChange={(e) => setSearchPolicy(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">LOB</label>
                      <input
                        type="text"
                        placeholder="Search by LOB..."
                        value={searchLOB}
                        onChange={(e) => setSearchLOB(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <input
                        type="text"
                        placeholder="Search by status..."
                        value={searchStatus}
                        onChange={(e) => setSearchStatus(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date Range</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="flex-1 p-2 border rounded-lg text-sm"
                          placeholder="From"
                        />
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="flex-1 p-2 border rounded-lg text-sm"
                          placeholder="To"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="flex-1 p-2 border rounded-lg text-sm"
                      >
                        <option value="All">All Status</option>
                        <option value="Open">Open</option>
                        <option value="Quotation Generated">Quotation Generated</option>
                        <option value="Payment Link Generated">Payment Link Generated</option>
                        <option value="Payment Done">Payment Done</option>
                        <option value="Policy Issued">Policy Issued</option>
                        <option value="Closed Without Issuance">Closed Without Issuance</option>
                      </select>
                      <button
                        onClick={clearFilters}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <span className="text-sm text-gray-500 ml-auto">
              Showing {filteredLeads.length} of {leads.length} leads
              {globalSearch && ` | Search: "${globalSearch}"`}
            </span>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredLeads.length} of {leads.length} leads
              {globalSearch && ` | Search: "${globalSearch}"`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Employee</th>
                  <th className="p-4 text-left">Lead Code</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Mobile</th>
                  <th className="p-4 text-left">Policy #</th>
                  <th className="p-4 text-left">LOB</th>
                  <th className="p-4 text-left">Source</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      {leads.length === 0 ? (
                        <div>
                          <FaFileAlt className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p>No leads found</p>
                          <p className="text-sm">No leads have been created yet.</p>
                        </div>
                      ) : (
                        <div>
                          <FaSearch className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p>No leads match your filters</p>
                          <button onClick={clearFilters} className="text-indigo-600 hover:text-indigo-800">
                            Clear filters
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400" />
                          {getEmployeeName(lead.employeeId)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {lead.leadCode || "-"}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{lead.name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-400 text-xs" />
                          {lead.mobileNo}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {lead.policyNumber || "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          {lead.lob || "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                          {lead.source || "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        {renderStatusBadge(lead.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedLead(lead)} 
                            className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 hover:bg-indigo-50 rounded"
                            title="View Details"
                          >
                            <FaEye size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(lead)} 
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
                            title="Edit Lead"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(lead._id)} 
                            className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                            title="Delete Lead"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Lead Modal */}
        {selectedLead && renderLeadDetails()}

        {/* Edit Modal */}
        {showEditModal && renderEditModal()}
      </div>
    </div>
  );
}

export default EmployeeLeads;