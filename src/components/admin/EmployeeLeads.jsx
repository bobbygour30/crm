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
import PersonalAccidentForm, { emptyPA, hydratePA, validatePA, appendPA } from "../lob/PersonalAccidentForm";
import TravelInsuranceForm, { emptyTravel, hydrateTravel, validateTravel, appendTravel } from "../lob/TravelInsuranceForm";
import {
  OTHER_MANUFACTURER,
  getManufacturerOptions,
  isManufacturerValidForType,
  getDisplayManufacturer,
  isMotorLob,
  emptyMotorDetails,
  getMotorPremiumParts,
  computeMotorPayout,
  validateMotorPayout,
  isAdminUser,
} from "../lob/motorInsurance";

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

  const PAYMENT_STATUS_OPTIONS = [
    "Quote Under Discussion",
    "URL Shared",
    "Payment Done",
    "e-Mandate Status Pending",
    "e-Mandate Status Done",
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
    "Self", "Spouse", "Son", "Daughter", "Father", "Mother", "Sibling", "Other"
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

  // ============================================================
  // #4: EXPANDED INSURER LIST (Corrected typo: SHAMPOO -> SOMPO)
  // ============================================================
  const INSURER_OPTIONS = [
    "TATA AIG GENERAL INSURANCE CO LTD",
    "BAJAJ GENERAL INSURANCE LTD",
    "HDFC ERGO GENERAL INSURANCE CO LTD",
    "INDUSIND GENERAL INSURANCE CO LTD",
    "Generali Central Insurance Co Ltd",
    "DIGIT GENERAL INSURANCE CO LTD",
    "KOTAK GENERAL INSURANCE CO LTD",
    "CHOLA GENERAL INSURANCE CO LTD",
    "SHRIRAM GENERAL INSURANCE CO LTD",
    "MAGMA GENERAL INSURANCE CO LTD",
    "ROYAL SUNDARAM GENERAL INSURANCE CO LTD",
    "SBI GENERAL INSURANCE CO LTD",
    "NATIONAL GENERAL INSURANCE LTD",
    "UNITED INDIA GENERAL INSURANCE CO LTD",
    "The New India Assurance Co. Ltd.",
    "The Oriental Insurance Co. Ltd",
    "IFFCO TOKIO GENERAL INSURANCE LTD",
    "LIBERTY GENERAL INSURANCE CO LTD",
    "UNIVERSAL SOMPO GENERAL INSURANCE LTD",
    "Navi General Insurance Ltd",
    "Raheja QBE General Insurance Co. Ltd",
    "Acko General Insurance Ltd",
    "Zuno General Insurance Ltd",
    "Kshema General Insurance Ltd",
    "ICICI LOMBARD GENERAL INSURANCE LTD",
    "Niva Bupa Health Insurance Co Ltd",
    "Care Health Insurance Co Ltd",
    "Aditya Birla Health Insurance Co Ltd",
    "Star Health and Allied Insurance",
    "Indusind Nippon Life Insurance Co Ltd",
    "Bharti Axa Life Insurance",
    "Tata AIA Life Insurance",
  ];

  // NOTE: Manufacturer lists now live in ../lob/motorInsurance.js
  // (Two Wheeler / Four Wheeler lists + "Other")

  const POLICY_TENURE_OPTIONS = ["1 Year", "2 Years", "3 Years"];
  
  const PAYMENT_TERM_OPTIONS = [
  "One Time",
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

  // ============================================================
  // EMPTY STATE FACTORIES
  // ============================================================
  const emptyHealthDetails = () => ({
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

  const emptyElectronicDetails = () => ({
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

  const emptyWorkflowDetails = (status = "Open") => ({
    status,
    quoteNumber: "",
    selectedInsurers: [],
    insurerQuotes: [],
    paymentStatus: "",
    paymentUrl: "",
    utrNumber: "",
    paymentSnapshot: null,
    policyNumber: "",
    policyIssuedOn: "",
    policyStartDate: "",
    policyExpiryDate: "",
    policyCopy: null,
    remarks: "",
  });

  // ============================================================
  // EMI / PAYOUT CALCULATION HELPERS
  // ============================================================
  const EMI_PER_YEAR = {
    "Monthly": 12,
    "Quarterly": 4,
    "Half Quarterly": 6,
    "Half Yearly": 2,
    "Yearly": 1,
  };

  const getTenureYears = (tenure) => {
    if (!tenure) return 1;
    const match = String(tenure).match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  };

  const computeTotalEmiCount = (paymentMode, policyTenure) => {
    if (!paymentMode || paymentMode === "Yearly") return 0;
    const perYear = EMI_PER_YEAR[paymentMode] || 1;
    const years = getTenureYears(policyTenure);
    return perYear * years;
  };

  // Recalculates every derived field on a single insurer quote object.
  // TDS is fixed at 2% per requirement #11.
  // motorCtx = { isMotor, insuranceType } -> Motor uses the OD/TP split payout.
  const recalcInsurerQuote = (quote, policyTenure, motorCtx = {}) => {
  const q = { ...quote };

  const netPremium = safeNumber(q.netPremium);
  const gst = safeNumber(q.gst) || 18;
  q.grossPremium = netPremium + (netPremium * gst / 100);

  // "Yearly" and "One Time" are single-payment modes, not EMI
  const isEMIMode = !!q.paymentMode && q.paymentMode !== "Yearly" && q.paymentMode !== "One Time";

  const emiNet = safeNumber(q.emiNetPremium);
  const emiGst = safeNumber(q.emiGst) || 18;
  q.emiGrossPremium = emiNet + (emiNet * emiGst / 100);

  q.totalEmiCount = isEMIMode ? computeTotalEmiCount(q.paymentMode, policyTenure) : 0;

  // Clamp received count to the valid range; force 0 outside EMI mode
  let receivedCount = safeNumber(q.emiReceivedCount);
  if (q.totalEmiCount > 0 && receivedCount > q.totalEmiCount) {
    receivedCount = q.totalEmiCount;
  }
  if (!isEMIMode) receivedCount = 0;
  q.emiReceivedCount = receivedCount;
  q.grossPremiumReceived = isEMIMode ? q.emiGrossPremium * receivedCount : 0;

  const finalDiscount = safeNumber(q.finalDiscount);
  q.payableAmount = q.grossPremium - finalDiscount;

  // ---- MOTOR Payout (Admin only): OD / TP split ----
  if (motorCtx.isMotor) {
    const m = computeMotorPayout({
      insuranceType: motorCtx.insuranceType,
      odPremium: q.odPremium,
      tpPremium: q.tpPremium,
      odPayoutPercent: q.odPayoutSlab,
      tpPayoutPercent: q.tpPayoutSlab,
      gstReturnSlabPercent: q.gstReturnSlabOnEMI,
      tdsPercent: 2, // TDS fixed at 2%
      deduction: finalDiscount,
    });
    q.odPayoutAmount = m.odPayoutAmount;
    q.tpPayoutAmount = m.tpPayoutAmount;
    q.totalPayoutReceivable = m.totalPayoutToReceive;
    q.payoutOnEMI = 0;
    q.gstReturnAmount = m.gstReturnAmount;
    q.tdsAmount = m.tdsAmount;
    q.arshyanPayout = m.arshyanPayout;
    q.isEMIMode = false;
    q.isMotorPayout = true;
    return q;
  }

  // ---- Payout (Admin only) - non-motor ----
  const payoutSlab = safeNumber(q.payoutSlab);
  q.totalPayoutReceivable = netPremium * payoutSlab / 100;
  q.payoutOnEMI = isEMIMode ? (emiNet * payoutSlab / 100) : 0;

  const gstReturnSlab = safeNumber(q.gstReturnSlabOnEMI);

  // Basis for GST Return / TDS / Arshyan Payout:
  // One Time (or Yearly) -> Total PayOut Receivable
  // EMI mode              -> PayOut on EMI * EMIs Received
  const receivedInsurerPayout = isEMIMode
    ? q.payoutOnEMI * receivedCount
    : q.totalPayoutReceivable;

  q.gstReturnAmount = receivedInsurerPayout * gstReturnSlab / 100;
  q.tdsAmount = receivedInsurerPayout * 2 / 100; // TDS fixed at 2%

  // Arshyan Payout = Insurer Payout Received + GST Return - TDS 2% - Discount
  q.arshyanPayout = receivedInsurerPayout + q.gstReturnAmount - q.tdsAmount - finalDiscount;

  q.isEMIMode = isEMIMode;
  q.isMotorPayout = false;

  return q;
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

  const [healthDetails, setHealthDetails] = useState(emptyHealthDetails());
  const [motorDetails, setMotorDetails] = useState(emptyMotorDetails());
  const [electronicDetails, setElectronicDetails] = useState(emptyElectronicDetails());

  // ============================================================
  // PERSONAL ACCIDENT & TRAVEL STATE
  // ============================================================
  const [paDetails, setPaDetails] = useState(emptyPA());
  const [travelDetails, setTravelDetails] = useState(emptyTravel());
  const [showPASection, setShowPASection] = useState(false);
  const [showTravelSection, setShowTravelSection] = useState(false);

  // Workflow Details State
  const [workflowDetails, setWorkflowDetails] = useState(emptyWorkflowDetails());

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
  const [showInsurerQuotes, setShowInsurerQuotes] = useState(false);
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

  // Motor context used by every payout recalculation
  const getMotorCtx = (lob = formData.lob, insuranceType = motorDetails.insuranceType) => ({
    isMotor: isMotorLob(lob),
    insuranceType,
  });

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

  // Auto-fetch RTO from Registration Number (only for non-New vehicles)
  useEffect(() => {
    const isNewVehicle = motorDetails.previousInsuranceStatus === "New";
    if (!isNewVehicle && motorDetails.registrationNumber && motorDetails.registrationNumber.length >= 4) {
      const reg = motorDetails.registrationNumber.toUpperCase();
      const rtoMatch = reg.match(/^([A-Z]{2}[0-9]+)/);
      if (rtoMatch && rtoMatch[1] !== motorDetails.autoRtoCode) {
        setMotorDetails(prev => ({ ...prev, autoRtoCode: rtoMatch[1] }));
      }
    }
  }, [motorDetails.registrationNumber, motorDetails.previousInsuranceStatus]);

  // Motor: when Insurance Type changes (OD/TP parts change), refresh quote payouts
  useEffect(() => {
    if (!showMotorSection) return;
    setWorkflowDetails(prev => {
      if (!prev.insurerQuotes || prev.insurerQuotes.length === 0) return prev;
      return {
        ...prev,
        insurerQuotes: prev.insurerQuotes.map(q =>
          q ? recalcInsurerQuote(q, formData.policyTenure, { isMotor: true, insuranceType: motorDetails.insuranceType }) : q
        ),
      };
    });
  }, [motorDetails.insuranceType, showMotorSection]);

  // ============================================================
  // #6a: AUTO-CALCULATE POLICY EXPIRY DATE FROM START DATE + TENURE
  // ============================================================
  useEffect(() => {
    if (workflowDetails.policyStartDate) {
      const start = new Date(workflowDetails.policyStartDate);
      if (!isNaN(start.getTime())) {
        const years = getTenureYears(formData.policyTenure); // already defaults to 1 internally
        const expiry = new Date(start);
        expiry.setFullYear(expiry.getFullYear() + years);
        expiry.setDate(expiry.getDate() - 1); // policy runs up to the day before renewal
        const expiryStr = expiry.toISOString().split("T")[0];
        setWorkflowDetails(prev =>
          prev.policyExpiryDate !== expiryStr ? { ...prev, policyExpiryDate: expiryStr } : prev
        );
      }
    }
  }, [workflowDetails.policyStartDate, formData.policyTenure]);

  // ============================================================
  // SYNC proposer's top-level Aadhaar/PAN/name into the "Self" member row
  // ============================================================
  useEffect(() => {
    if (healthDetails.proposerIsMember !== "Yes") return;

    setHealthDetails(prev => {
      const idx = (prev.members || []).findIndex(m => m.type === 'proposer');
      if (idx === -1) return prev;

      const m = prev.members[idx];
      const patch = {
        name: formData.name || '',
        aadhaarNumber: prev.aadhaarNumber || '',
        aadhaarFile: prev.aadhaarFile || null,
        panNumber: prev.panNumber || '',
        panFile: prev.panFile || null,
      };

      const changed = Object.keys(patch).some(k => m[k] !== patch[k]);
      if (!changed) return prev;

      const members = [...prev.members];
      members[idx] = { ...m, ...patch };
      return { ...prev, members };
    });
  }, [
    formData.name,
    healthDetails.proposerIsMember,
    healthDetails.aadhaarNumber,
    healthDetails.aadhaarFile,
    healthDetails.panNumber,
    healthDetails.panFile,
    healthDetails.members?.length,
  ]);

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
        setEmployees(data);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // ============================================================
  // DATE FORMATTING HELPER
  // ============================================================
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    try {
      if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
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
      setShowPASection(false);
      setShowTravelSection(false);
      return;
    }

    const isHealth = lob.toLowerCase().includes("health") || 
                     lob === "Mediclaim Health Insurance" || 
                     lob === "Group Health Insurance";
    const isMotor = isMotorLob(lob);
    const isElectronic = lob.toLowerCase().includes("mobile") || 
                         lob.toLowerCase().includes("electronic") || 
                         lob.toLowerCase().includes("equipment") ||
                         lob.toLowerCase().includes("tablet") ||
                         lob.toLowerCase().includes("laptop");

    setShowHealthSection(isHealth);
    setShowMotorSection(isMotor);
    setShowElectronicSection(isElectronic);
    setShowPASection(lob === "PERSONAL ACCIDENT");
    setShowTravelSection(lob === "Travel Insurance");
  };

  // ============================================================
  // #1: FLOATER MEMBERS (Fixed stale state bug — accepts overrides)
  // ============================================================
  const buildEmptyMember = (id, type) => ({
    id,
    type,
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
    panNumber: '',
    panFile: null,
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

  const generateFloaterMembers = (adultsOverride, childrenOverride, proposerOverride) => {
    let adults = parseInt(adultsOverride ?? healthDetails.numberOfAdults) || 0;
    let children = parseInt(childrenOverride ?? healthDetails.numberOfChildren) || 0;
    const proposerIsMember = proposerOverride ?? healthDetails.proposerIsMember;
    
    const members = [];
    
    if (proposerIsMember === "Yes") {
      members.push({
        ...buildEmptyMember('proposer', 'proposer'),
        name: formData.name || '',
        dob: healthDetails.proposerDOB || '',
        monthlyIncome: healthDetails.familyIncome || '',
        height: healthDetails.height || '',
        weight: healthDetails.weight || '',
        qualification: healthDetails.qualification || '',
        occupation: healthDetails.occupation || '',
        relationship: 'Self',
        aadhaarNumber: healthDetails.aadhaarNumber || '',
        // FIX: carry over the already-uploaded Aadhaar/PAN instead of hardcoding null
        aadhaarFile: healthDetails.aadhaarFile || null,
        panNumber: healthDetails.panNumber || '',
        panFile: healthDetails.panFile || null,
      });
      
      const remainingAdults = adults > 1 ? adults - 1 : 0;
      for (let i = 1; i <= remainingAdults; i++) {
        members.push(buildEmptyMember(`adult-${i}`, 'adult'));
      }
    } else {
      for (let i = 1; i <= adults; i++) {
        members.push(buildEmptyMember(`adult-${i}`, 'adult'));
      }
    }
    
    for (let i = 1; i <= children; i++) {
      members.push(buildEmptyMember(`child-${i}`, 'child'));
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
  // DISPLAY HELPERS
  // ============================================================
  const getEmployeeName = (employeeId) => {
    if (!employeeId) return "Unknown";

    if (typeof employeeId === "object") {
      return (
        employeeId.fullName ||
        employeeId.organizationName ||
        employeeId.username ||
        employeeId.name ||
        employeeId.email ||
        "Unknown"
      );
    }

    const employee = employees.find((e) => e._id === employeeId);
    return employee
      ? employee.fullName ||
          employee.organizationName ||
          employee.username ||
          employee.name ||
          employee.email ||
          "Unknown"
      : "Unknown";
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

  // Payout block is visible to Admin once the lead is (or is being marked) Policy Issued
  const isPayoutVisible = () =>
    isAdminUser() &&
    (editLead?.status === "Policy Issued" || workflowDetails.status === "Policy Issued");

  // Motor payout cross-validation for one quote
  const getQuoteMotorValidation = (quote, idx) => {
    const insurerName = quote?.insurerName || workflowDetails.selectedInsurers?.[idx] || `Quote ${idx + 1}`;
    return validateMotorPayout(
      {
        insuranceType: motorDetails.insuranceType,
        netPremium: quote?.netPremium,
        odPremium: quote?.odPremium,
        tpPremium: quote?.tpPremium,
        odPayoutPercent: quote?.odPayoutSlab,
        tpPayoutPercent: quote?.tpPayoutSlab,
        gstReturnSlabPercent: quote?.gstReturnSlabOnEMI,
        tdsPercent: 2,
        deduction: quote?.finalDiscount,
      },
      { fieldPrefix: `quote${idx}_`, labelPrefix: insurerName }
    );
  };

  // ============================================================
  // VALIDATE ALL FIELDS
  // ============================================================
  const validateAllFields = () => {
    const errors = {};
    const errorList = [];
    const push = (key, field, message) => {
      errors[key] = message;
      errorList.push({ field, message });
    };
    
    // Basic validation
    if (!formData.name) push("name", "name", "Name is required");
    if (!formData.mobileNo) push("mobileNo", "mobileNo", "Mobile number is required");
    if (formData.mobileNo && !validateMobile(formData.mobileNo)) push("mobileNo", "mobileNo", "Enter valid 10-digit mobile number");
    if (formData.email && !validateEmail(formData.email)) push("email", "email", "Invalid email format");
    if (formData.pinCode && !validatePIN(formData.pinCode)) push("pinCode", "pinCode", "Enter valid 6-digit PIN code");
    if (!formData.lob) push("lob", "lob", "LOB is required");
    
    // Health validation
    if (showHealthSection) {
      if (!healthDetails.policyType) push("policyType", "policyType", "Policy Type is required");
      
      if (healthDetails.policyType === "Individual") {
        if (!healthDetails.nomineeName) push("nomineeName", "nomineeName", "Nominee Name is required for Individual policy");
        if (!healthDetails.nomineeDOB) push("nomineeDOB", "nomineeDOB", "Nominee DOB is required for Individual policy");
        if (!healthDetails.nomineeRelationship) push("nomineeRelationship", "nomineeRelationship", "Nominee Relationship is required for Individual policy");
      }
      
      if (healthDetails.policyType === "Floater") {
        if (!healthDetails.numberOfAdults || healthDetails.numberOfAdults <= 0) push("numberOfAdults", "numberOfAdults", "Number of Adults is required for Floater policy");
        if (!healthDetails.proposerIsMember) push("proposerIsMember", "proposerIsMember", "Proposer is a Member within the Plan is required");
      }
      
      if (healthDetails.aadhaarNumber && !validateAadhaar(healthDetails.aadhaarNumber)) {
        push("aadhaar", "aadhaarNumber", "Aadhaar must be exactly 12 digits");
      }
      
      if (healthDetails.panNumber && !validatePAN(healthDetails.panNumber)) {
        errors.pan = "PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)";
        errorList.push({ field: "panNumber", message: "PAN format: ABCDE1234F" });
      }
      
      if (healthDetails.hasPreviousPolicy === "Yes") {
        if (!healthDetails.previousPolicyCase) push("previousPolicyCase", "previousPolicyCase", "Previous Policy Case is required");
        
        if (healthDetails.previousPolicyCase === "Portability Case") {
          if (!healthDetails.experienceYears || healthDetails.experienceYears <= 0) {
            push("experienceYears", "experienceYears", "Experience years are required for Portability Case");
          }
          healthDetails.portabilityDetails.forEach((detail, idx) => {
            if (!detail.insurerName) push(`portabilityInsurer_${idx}`, `portabilityInsurer_${idx}`, `Insurer Name is required for Policy ${idx + 1}`);
            if (!detail.policyNumber) push(`portabilityPolicy_${idx}`, `portabilityPolicy_${idx}`, `Policy Number is required for Policy ${idx + 1}`);
            if (!detail.policyActiveFrom) push(`portabilityActive_${idx}`, `portabilityActive_${idx}`, `Policy Active From is required for Policy ${idx + 1}`);
            if (!detail.policyTillDate) push(`portabilityTill_${idx}`, `portabilityTill_${idx}`, `Policy Till Date is required for Policy ${idx + 1}`);
            if (!detail.sumAssured) push(`portabilitySum_${idx}`, `portabilitySum_${idx}`, `SUM ASSURED is required for Policy ${idx + 1}`);
            if (!detail.uploadPYP) push(`portabilityUpload_${idx}`, `portabilityUpload_${idx}`, `Upload PYP is mandatory for Policy ${idx + 1}`);
          });
        }
        
        if (healthDetails.previousPolicyCase === "Renew Case") {
          if (!healthDetails.renewalDetails?.insurerName) push("renewalInsurer", "renewalInsurer", "Insurer Name is required for Renew Case");
          if (!healthDetails.renewalDetails?.policyNumber) push("renewalPolicy", "renewalPolicy", "Policy Number is required for Renew Case");
          if (!healthDetails.renewalDetails?.policyDueDate) push("renewalDueDate", "renewalDueDate", "Policy Due Date is required for Renew Case");
        }
      }
    }
    
    // Motor validation
    if (showMotorSection) {
      if (!motorDetails.vehicleType) push("vehicleType", "vehicleType", "Vehicle type is required");
      if (!motorDetails.previousInsuranceStatus) push("previousInsuranceStatus", "previousInsuranceStatus", "Previous Insurance Status is required");
      
      const isNewVehicle = motorDetails.previousInsuranceStatus === "New";
      if (!isNewVehicle && !motorDetails.registrationNumber) push("registration", "registrationNumber", "Registration number is required");
      if (!motorDetails.insuranceType) push("insuranceType", "insuranceType", "Insurance type is required");
      
      if (motorDetails.previousInsuranceStatus === "New") {
        if (!motorDetails.manufacturer) push("manufacturer", "manufacturer", "Manufacturer is required for New Vehicle");
        // "Other" manufacturer -> manual company name is mandatory
        if (motorDetails.manufacturer === OTHER_MANUFACTURER && !motorDetails.otherManufacturer?.trim()) {
          push("otherManufacturer", "otherManufacturer", "Enter the Manufacturer Name (Other selected)");
        }
        if (!motorDetails.model) push("model", "model", "Model is required for New Vehicle");
        if (!motorDetails.fuelType) push("fuelType", "fuelType", "Fuel Type is required for New Vehicle");
        if (!motorDetails.rtoCode) push("rtoCode", "rtoCode", "RTO Code is required for New Vehicle");
        if (!motorDetails.chesisNo) push("chesisNo", "chesisNo", "Chesis No. is required for New Vehicle");
        if (!motorDetails.yearOfManufacturing) push("yearOfManufacturing", "yearOfManufacturing", "Year of Manufacturing is required for New Vehicle");
        if (!motorDetails.monthOfManufacturing) push("monthOfManufacturing", "monthOfManufacturing", "Month of Manufacturing is required for New Vehicle");
        if (!motorDetails.idvAsPerInvoice) push("idvAsPerInvoice", "idvAsPerInvoice", "IDV (As per Invoice) is required for New Vehicle");
        if (!motorDetails.invoiceCopy) push("invoiceCopy", "invoiceCopy", "Invoice Copy is required for New Vehicle");
      }
      
      if (motorDetails.previousInsuranceStatus === "Active") {
        if (motorDetails.insuranceType === "Comprehensive (OD+TP)" || motorDetails.insuranceType === "SAOD (On Damage)") {
          if (!motorDetails.odDueDate) push("odDueDate", "odDueDate", "OD Due Date is required for Active Policy");
          if (!motorDetails.tpDueDate) push("tpDueDate", "tpDueDate", "TP Due Date is required for Active Policy");
        }
        
        if (!motorDetails.policyNo) push("policyNo", "policyNo", "Policy No. is required for Active Policy");
        if (!motorDetails.previousInsurerName) push("previousInsurerName", "previousInsurerName", "Previous Insurer Name is required for Active Policy");
        if (!motorDetails.idvAsPerPYP) push("idvAsPerPYP", "idvAsPerPYP", "IDV (As per PYP) is required for Active Policy");
        
        if (!motorDetails.claimTaken) push("claimTaken", "claimTaken", "Claim Taken is required for Active Policy");
        if (motorDetails.claimTaken === "No" && !motorDetails.ncb) push("ncb", "ncb", "NCB selection is required when Claim Taken is No");
        
        if (motorDetails.insuranceType === "SAOD (On Damage)") {
          if (!motorDetails.saodOdDueDate) push("saodOdDueDate", "saodOdDueDate", "OD Due Date is required for SAOD");
          if (!motorDetails.saodTpDueDate) push("saodTpDueDate", "saodTpDueDate", "TP Due Date is required for SAOD");
          if (!motorDetails.saodPolicyNo) push("saodPolicyNo", "saodPolicyNo", "Previous Policy No. is required for SAOD");
          if (!motorDetails.saodPreviousInsurerName) push("saodPreviousInsurerName", "saodPreviousInsurerName", "Previous Insurer Name is required for SAOD");
          if (!motorDetails.saodIdvAsPerPYP) push("saodIdvAsPerPYP", "saodIdvAsPerPYP", "IDV (As per PYP) is required for SAOD");
        }
      }
      
      if (motorDetails.insuranceType === "TP (Third Party)") {
        if (!motorDetails.tpInsuranceDueDate) push("tpInsuranceDueDate", "tpInsuranceDueDate", "TP Due Date is required for TP Insurance");
      }
      
      if (motorDetails.insuranceType !== "TP (Third Party)") {
        if (!motorDetails.addOnRequired) push("addOnRequired", "addOnRequired", "Add-On selection is required");
        if (motorDetails.addOnRequired === "Yes" && (!motorDetails.selectedAddOns || motorDetails.selectedAddOns.length === 0)) {
          push("selectedAddOns", "selectedAddOns", "Please select at least one Add-On");
        }
      }
      
      if (motorDetails.previousInsuranceStatus === "Active") {
        if (!motorDetails.pypFile) push("pypFile", "pypFile", "Upload PYP is required for Active Policy");
      }
      
      if (motorDetails.previousInsuranceStatus !== "New") {
        if (!motorDetails.rcFrontFile) push("rcFrontFile", "rcFrontFile", "RC Front Upload is required");
        if (!motorDetails.rcBackFile) push("rcBackFile", "rcBackFile", "RC Back Upload is required");
      }

      // ============================================
      // MOTOR PAYOUT CROSS-VALIDATION (per insurer quote, Admin)
      // ============================================
      if (isPayoutVisible()) {
        (workflowDetails.selectedInsurers || []).forEach((insurer, idx) => {
          const quote = workflowDetails.insurerQuotes?.[idx];
          if (!quote) return;
          const { errors: qErrors } = getQuoteMotorValidation(quote, idx);
          qErrors.forEach(({ field, message }) => push(field, field, message));
        });
      }
    }
    
    // Electronic validation
    if (showElectronicSection) {
      if (!electronicDetails.deviceType) push("deviceType", "deviceType", "Device type is required");
      if (!electronicDetails.dateOfPurchase) push("dateOfPurchase", "dateOfPurchase", "Date of Purchase is required");
      if (!electronicDetails.purchaseValue) push("purchaseValue", "purchaseValue", "Purchase Value is required");
      if (electronicDetails.aadhaarNumber && !validateAadhaar(electronicDetails.aadhaarNumber)) {
        push("electronicAadhaar", "electronicAadhaar", "Aadhaar must be exactly 12 digits");
      }
      if (electronicDetails.panNumber && !validatePAN(electronicDetails.panNumber)) {
        errors.electronicPan = "PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)";
        errorList.push({ field: "electronicPan", message: "PAN format: ABCDE1234F" });
      }
    }

    // ============================================
    // PERSONAL ACCIDENT & TRAVEL VALIDATION
    // ============================================
    if (showPASection) {
      validatePA(paDetails).forEach(({ field, message }) => push(field, field, message));
    }
    if (showTravelSection) {
      validateTravel(travelDetails).forEach(({ field, message }) => push(field, field, message));
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
  
  // Generic field-updater for insurer quotes
  const updateInsurerQuote = (idx, field, value) => {
    const updatedQuotes = [...(workflowDetails.insurerQuotes || [])];
    if (!updatedQuotes[idx]) {
      updatedQuotes[idx] = { insurerName: workflowDetails.selectedInsurers[idx] };
    }
    updatedQuotes[idx] = { ...updatedQuotes[idx], [field]: value };
    updatedQuotes[idx] = recalcInsurerQuote(updatedQuotes[idx], formData.policyTenure, getMotorCtx());
    setWorkflowDetails(prev => ({ ...prev, insurerQuotes: updatedQuotes }));
  };

  const updateInsurerQuoteFile = (idx, field, file) => {
    const updatedQuotes = [...(workflowDetails.insurerQuotes || [])];
    if (!updatedQuotes[idx]) {
      updatedQuotes[idx] = { insurerName: workflowDetails.selectedInsurers[idx] };
    }
    updatedQuotes[idx] = { ...updatedQuotes[idx], [field]: file };
    setWorkflowDetails(prev => ({ ...prev, insurerQuotes: updatedQuotes }));
  };
  
  // Open Edit Modal - WITH workflow details
  const handleEdit = (lead) => {
    setEditLead(lead);
    setValidationErrors({});
    
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

    // Reset popup visibility flags before hydrating (prevents carry-over from previous lead)
    setShowFloaterMembers(false);
    setShowPreviousPolicyPopup(false);
    setShowRenewalFields(false);
    setShowPortabilityFields(false);
    setShowFreshCaseFields(false);
    
    // Health Details
    if (lead.healthDetails) {
      setHealthDetails({
        ...emptyHealthDetails(),
        ...lead.healthDetails,
        aadhaarFile: lead.healthDetails.aadhaarFile || null,
        panFile: lead.healthDetails.panFile || null,
        previousPolicyFile: null,
        nomineeDOB: formatDateForInput(lead.healthDetails.nomineeDOB),
        proposerDOB: formatDateForInput(lead.healthDetails.proposerDOB),
        seniorOneDOB: formatDateForInput(lead.healthDetails.seniorOneDOB),
        renewalDetails: {
          ...(lead.healthDetails.renewalDetails || {}),
          policyDueDate: formatDateForInput(lead.healthDetails.renewalDetails?.policyDueDate),
          uploadPolicy: lead.healthDetails.renewalDetails?.uploadPolicy || null,
        },
        portabilityDetails: (lead.healthDetails.portabilityDetails || []).map((p) => ({
          ...p,
          policyActiveFrom: formatDateForInput(p.policyActiveFrom),
          policyTillDate: formatDateForInput(p.policyTillDate),
          uploadPYP: p.uploadPYP || null,
        })),
        members: (lead.healthDetails.members || []).map((m) => ({
          ...m,
          dob: formatDateForInput(m.dob),
          // FIX: fall back to top-level Aadhaar/PAN for the proposer row so
          // "View current file" links actually show for old saved leads too
          aadhaarFile: m.type === 'proposer' ? (m.aadhaarFile || lead.healthDetails.aadhaarFile || null) : (m.aadhaarFile || null),
          aadhaarNumber: m.type === 'proposer' ? (m.aadhaarNumber || lead.healthDetails.aadhaarNumber || '') : (m.aadhaarNumber || ''),
          panNumber: m.type === 'proposer' ? (m.panNumber || lead.healthDetails.panNumber || '') : (m.panNumber || ''),
          panFile: m.type === 'proposer' ? (m.panFile || lead.healthDetails.panFile || null) : (m.panFile || null),
        })),
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
    } else {
      setHealthDetails(emptyHealthDetails());
    }
    
    // Motor Details
    if (lead.motorDetails) {
      setMotorDetails({
        ...emptyMotorDetails(),
        ...lead.motorDetails,
        otherManufacturer: lead.motorDetails.otherManufacturer || "",
        odDueDate: formatDateForInput(lead.motorDetails.odDueDate),
        tpDueDate: formatDateForInput(lead.motorDetails.tpDueDate),
        saodOdDueDate: formatDateForInput(lead.motorDetails.saodOdDueDate),
        saodTpDueDate: formatDateForInput(lead.motorDetails.saodTpDueDate),
        tpInsuranceDueDate: formatDateForInput(lead.motorDetails.tpInsuranceDueDate),
        pypFile: lead.motorDetails.pypFile || null,
        rcFrontFile: lead.motorDetails.rcFrontFile || null,
        rcBackFile: lead.motorDetails.rcBackFile || null,
        chesisPhoto: lead.motorDetails.chesisPhoto || null,
        invoiceCopy: lead.motorDetails.invoiceCopy || null,
      });
    } else {
      setMotorDetails(emptyMotorDetails());
    }
    
    // Electronic Details
    if (lead.electronicDetails) {
      setElectronicDetails({
        ...emptyElectronicDetails(),
        ...lead.electronicDetails,
        dateOfPurchase: formatDateForInput(lead.electronicDetails.dateOfPurchase),
        aadhaarFile: lead.electronicDetails.aadhaarFile || null,
        panFile: lead.electronicDetails.panFile || null,
        imeiImage: lead.electronicDetails.imeiImage || null,
        purchaseInvoice: lead.electronicDetails.purchaseInvoice || null,
        devicePhotos: lead.electronicDetails.devicePhotos || [],
      });
    } else {
      setElectronicDetails(emptyElectronicDetails());
    }

    // ============================================
    // HYDRATE PERSONAL ACCIDENT & TRAVEL
    // ============================================
    setPaDetails(hydratePA(lead.paDetails));
    setTravelDetails(hydrateTravel(lead.travelDetails));

    // Workflow Details - recalc on load (motor-aware)
    const loadedTenure = lead.policyTenure || formData.policyTenure;
    const loadedMotorCtx = getMotorCtx(lead.lob, lead.motorDetails?.insuranceType || "");
    if (lead.workflowDetails) {
      setWorkflowDetails({
        status: lead.workflowDetails.status || lead.status || "Open",
        quoteNumber: lead.workflowDetails.quoteNumber || "",
        selectedInsurers: lead.workflowDetails.selectedInsurers || [],
        // FIX: recalc every quote on load so derived fields (gross, EMI count,
        // payout figures) stay correct even if tenure/mode changed since save
        insurerQuotes: (lead.workflowDetails.insurerQuotes || []).map((q) =>
          recalcInsurerQuote({ ...q }, loadedTenure, loadedMotorCtx)
        ),
        paymentStatus: lead.workflowDetails.paymentStatus || "",
        paymentUrl: lead.workflowDetails.paymentUrl || "",
        utrNumber: lead.workflowDetails.utrNumber || "",
        paymentSnapshot: lead.workflowDetails.paymentSnapshot || null,
        policyNumber: lead.workflowDetails.policyNumber || "",
        policyIssuedOn: formatDateForInput(lead.workflowDetails.policyIssuedOn),
        policyStartDate: formatDateForInput(lead.workflowDetails.policyStartDate),
        policyExpiryDate: formatDateForInput(lead.workflowDetails.policyExpiryDate),
        policyCopy: lead.workflowDetails.policyCopy || null,
        remarks: lead.workflowDetails.workflowRemarks || lead.remarks || "",
      });
    } else {
      setWorkflowDetails(emptyWorkflowDetails(lead.status || "Open"));
    }
    
    // Check if status is Quotation Generated to show insurer quotes
    const currentStatus = lead.workflowDetails?.status || lead.status || "Open";
    setShowInsurerQuotes(currentStatus === "Quotation Generated");
    
    detectLOB(lead.lob);
    setShowEditModal(true);
  };

  // ============================================================
  // #4a: UPDATE LEAD - with frontend guard for Policy Issued payment
  // ============================================================
const handleUpdate = async (e) => {
  e.preventDefault();
  
  if (!validateAllFields()) {
    return;
  }

  // Frontend guard - Policy Issued requires payment confirmation
  const isPaymentConfirmed = !!(
    workflowDetails.paymentUrl ||
    workflowDetails.utrNumber ||
    ["Payment Done", "e-Mandate Status Done", "Policy Issued"].includes(workflowDetails.paymentStatus)
  );

  if (workflowDetails.status === "Policy Issued" && !isPaymentConfirmed) {
    setValidationPopup({
      show: true,
      errors: [{
        field: "general",
        message: "Set Payment Status to 'Payment Done' (with UTR Number) or share a Payment URL before marking status as Policy Issued."
      }]
    });
    return;
  }
  
  setIsSubmitting(true);
  setError(null);

  const submitData = new FormData();
  
  // Basic fields
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
  submitData.append("status", workflowDetails.status || editLead?.status || "Open");
  
  // Health Details
  if (showHealthSection) {
    const hasHealthData = healthDetails.policyType || 
                          healthDetails.hasPreviousPolicy === "Yes" ||
                          healthDetails.proposerDOB ||
                          healthDetails.nomineeName;

    if (hasHealthData) {
      const healthData = { ...healthDetails };
      healthData.proposerName = formData.name;

      // Strip File objects
      if (healthData.aadhaarFile instanceof File) delete healthData.aadhaarFile;
      if (healthData.panFile instanceof File) delete healthData.panFile;
      // Clone renewalDetails first so we never mutate React state
      if (healthData.renewalDetails) {
        healthData.renewalDetails = { ...healthData.renewalDetails };
        if (healthData.renewalDetails.uploadPolicy instanceof File) {
          delete healthData.renewalDetails.uploadPolicy;
        }
      }
      if (healthData.portabilityDetails) {
        healthData.portabilityDetails = healthData.portabilityDetails.map((detail) => {
          const clean = { ...detail };
          if (clean.uploadPYP instanceof File) delete clean.uploadPYP;
          return clean;
        });
      }
      // #1d: Strip member-level File objects (aadhaar, pan, epic, birthCert)
      if (healthData.members) {
        healthData.members = healthData.members.map((member) => {
          const clean = { ...member };
          if (clean.aadhaarFile instanceof File) delete clean.aadhaarFile;
          if (clean.panFile instanceof File) delete clean.panFile;
          if (clean.epicFile instanceof File) delete clean.epicFile;
          if (clean.birthCertificate instanceof File) delete clean.birthCertificate;
          return clean;
        });
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

  // Motor Details
  if (showMotorSection) {
    const hasMotorData = motorDetails.vehicleType || 
                         motorDetails.previousInsuranceStatus ||
                         motorDetails.registrationNumber ||
                         motorDetails.insuranceType;
    
    if (hasMotorData) {
      const motorData = { ...motorDetails };
      
      ["pypFile", "rcFrontFile", "rcBackFile", "chesisPhoto", "invoiceCopy"].forEach((f) => {
        if (motorData[f] instanceof File) delete motorData[f];
      });
      // Only keep the manual manufacturer name when "Other" is selected
      if (motorData.manufacturer !== OTHER_MANUFACTURER) delete motorData.otherManufacturer;
      
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
    
    // Motor file uploads
    if (motorDetails.pypFile instanceof File) {
      submitData.append("pypFile", motorDetails.pypFile);
    }
    if (motorDetails.rcFrontFile instanceof File) {
      submitData.append("rcFrontFile", motorDetails.rcFrontFile);
    }
    if (motorDetails.rcBackFile instanceof File) {
      submitData.append("rcBackFile", motorDetails.rcBackFile);
    }
    if (motorDetails.chesisPhoto instanceof File) {
      submitData.append("chesisPhoto", motorDetails.chesisPhoto);
    }
    if (motorDetails.invoiceCopy instanceof File) {
      submitData.append("invoiceCopy", motorDetails.invoiceCopy);
    }
  }

  // Electronic Details
  if (showElectronicSection) {
    const hasElectronicData = electronicDetails.deviceType || 
                              electronicDetails.dateOfPurchase || 
                              electronicDetails.purchaseValue;
    
    if (hasElectronicData) {
      const electronicData = { ...electronicDetails };
      
      if (electronicData.aadhaarFile instanceof File) delete electronicData.aadhaarFile;
      if (electronicData.panFile instanceof File) delete electronicData.panFile;
      if (electronicData.imeiImage instanceof File) delete electronicData.imeiImage;
      if (electronicData.purchaseInvoice instanceof File) delete electronicData.purchaseInvoice;
      if (electronicData.devicePhotos) {
        electronicData.devicePhotos = electronicData.devicePhotos.filter(
          (p) => typeof p === "string"
        );
      }
      
      if (!electronicData.deviceType) delete electronicData.deviceType;
      if (!electronicData.dateOfPurchase) delete electronicData.dateOfPurchase;
      if (!electronicData.purchaseValue) delete electronicData.purchaseValue;
      
      if (Object.keys(electronicData).length > 0) {
        submitData.append("electronicDetails", JSON.stringify(electronicData));
      }
    }
    
    // Electronic file uploads
    if (electronicDetails.aadhaarFile instanceof File) {
      submitData.append("electronicAadhaarFile", electronicDetails.aadhaarFile);
    }
    if (electronicDetails.panFile instanceof File) {
      submitData.append("electronicPanFile", electronicDetails.panFile);
    }
    if (electronicDetails.imeiImage instanceof File) {
      submitData.append("imeiImage", electronicDetails.imeiImage);
    }
    if (electronicDetails.purchaseInvoice instanceof File) {
      submitData.append("purchaseInvoice", electronicDetails.purchaseInvoice);
    }
    (electronicDetails.devicePhotos || []).forEach((photo, idx) => {
      if (photo instanceof File) {
        submitData.append(`devicePhoto_${idx}`, photo);
      }
    });
  }

  // ============================================
  // PERSONAL ACCIDENT & TRAVEL APPEND
  // ============================================
  if (showPASection) appendPA(submitData, paDetails);
  if (showTravelSection) appendTravel(submitData, travelDetails);

  // Health file uploads
  if (healthDetails.aadhaarFile instanceof File) {
    submitData.append("healthAadhaarFile", healthDetails.aadhaarFile);
  }
  if (healthDetails.panFile instanceof File) {
    submitData.append("healthPanFile", healthDetails.panFile);
  }
  if (healthDetails.renewalDetails?.uploadPolicy instanceof File) {
    submitData.append("renewalPolicyFile", healthDetails.renewalDetails.uploadPolicy);
  }
  (healthDetails.portabilityDetails || []).forEach((detail, idx) => {
    if (detail.uploadPYP instanceof File) {
      submitData.append(`portabilityPYP_${idx}`, detail.uploadPYP);
    }
  });
  // #1d: Member file uploads (Aadhaar, PAN, EPIC, Birth Cert)
  (healthDetails.members || []).forEach((member, idx) => {
    if (member.aadhaarFile instanceof File) {
      submitData.append(`memberAadhaar_${idx}`, member.aadhaarFile);
    }
    if (member.panFile instanceof File) {
      submitData.append(`memberPan_${idx}`, member.panFile);
    }
    if (member.epicFile instanceof File) {
      submitData.append(`memberEpic_${idx}`, member.epicFile);
    }
    if (member.birthCertificate instanceof File) {
      submitData.append(`memberBirthCert_${idx}`, member.birthCertificate);
    }
  });

  // ===== WORKFLOW DETAILS =====
  // Clean workflow data - strip empty enum fields and File objects
  const cleanWorkflow = { ...workflowDetails };
  
  // Strip empty strings for enum fields
  if (!cleanWorkflow.paymentStatus || cleanWorkflow.paymentStatus === "") {
    delete cleanWorkflow.paymentStatus;
  }
  
  // Remove File objects
  if (cleanWorkflow.paymentSnapshot instanceof File) delete cleanWorkflow.paymentSnapshot;
  if (cleanWorkflow.policyCopy instanceof File) delete cleanWorkflow.policyCopy;
  
  // Recalculate every quote one last time (motor-aware), strip File objects (upload separately)
  if (cleanWorkflow.insurerQuotes && Array.isArray(cleanWorkflow.insurerQuotes)) {
    const motorCtx = getMotorCtx();
    cleanWorkflow.insurerQuotes = cleanWorkflow.insurerQuotes.map((quote, idx) => {
      if (!quote) return quote;
      const fileToUpload = quote.quoteUpload instanceof File ? quote.quoteUpload : null;
      const cleanQuote = recalcInsurerQuote({ ...quote }, formData.policyTenure, motorCtx);
      if (fileToUpload) {
        submitData.append(`insurerQuoteFile_${idx}`, fileToUpload);
        delete cleanQuote.quoteUpload; // keep existing URL string if present, else drop
      }
      return cleanQuote;
    });
  }
  
  // Format dates for workflow
  if (cleanWorkflow.policyIssuedOn) {
    cleanWorkflow.policyIssuedOn = formatDateForInput(cleanWorkflow.policyIssuedOn);
  }
  if (cleanWorkflow.policyStartDate) {
    cleanWorkflow.policyStartDate = formatDateForInput(cleanWorkflow.policyStartDate);
  }
  if (cleanWorkflow.policyExpiryDate) {
    cleanWorkflow.policyExpiryDate = formatDateForInput(cleanWorkflow.policyExpiryDate);
  }
  
  submitData.append("workflowDetails", JSON.stringify(cleanWorkflow));

  // Workflow file uploads
  if (workflowDetails.paymentSnapshot instanceof File) {
    submitData.append("paymentSnapshot", workflowDetails.paymentSnapshot);
  }
  if (workflowDetails.policyCopy instanceof File) {
    submitData.append("policyCopy", workflowDetails.policyCopy);
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
      // Show validation errors if any
      if (errorData.errors && Array.isArray(errorData.errors)) {
        setValidationPopup({
          show: true,
          errors: errorData.errors.map(err => ({ field: "general", message: err }))
        });
      }
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
      "Vehicle Manufacturer": getDisplayManufacturer(lead.motorDetails),
      "Vehicle Model": lead.motorDetails?.model || "",
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
  // RENDER FUNCTIONS
  // ============================================================
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
              onClick={() => {
                setShowAddOnModal(false);
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <FaCheck /> Confirm Add-Ons
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };


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
                          {/* #3: Portability Insurer Name - Dropdown */}
                          <div>
                            <label className="text-xs font-medium text-gray-700">Previous Insurer Name</label>
                            <select
                              value={detail.insurerName}
                              onChange={(e) => handlePortabilityDetailChange(index, 'insurerName', e.target.value)}
                              className={`w-full p-2 border rounded-lg text-sm ${validationErrors[`portabilityInsurer_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                            >
                              <option value="">Select Insurer</option>
                              {INSURER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
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
                            <label className="text-xs font-medium text-gray-700">End of Policy Date (Policy Till Date)</label>
                            <input
                              type="date"
                              value={detail.policyTillDate}
                              onChange={(e) => {
                                const selected = new Date(e.target.value);
                                const today = new Date();
                                const sixtyDaysBefore = new Date();
                                sixtyDaysBefore.setDate(today.getDate() - 60);
                                const sixtyDaysAfter = new Date();
                                sixtyDaysAfter.setDate(today.getDate() + 60);

                                if (selected < sixtyDaysBefore || selected > sixtyDaysAfter) {
                                  alert("End of Policy Date must be within 60 days before or 60 days after today");
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
                          {/* #5: Portability NCB - Manual ₹ entry */}
                          <div>
                            <label className="text-xs font-medium text-gray-700">No Claim Bonus (₹, if any)</label>
                            <input
                              type="number"
                              min="0"
                              value={detail.noClaimBonus}
                              onChange={(e) => handlePortabilityDetailChange(index, 'noClaimBonus', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="Enter amount in ₹"
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
                            {typeof detail.uploadPYP === "string" && detail.uploadPYP && (
                              <div className="mb-1">
                                <a
                                  href={detail.uploadPYP}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-indigo-600 underline"
                                >
                                  View current PYP file
                                </a>
                              </div>
                            )}
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handlePortabilityDetailChange(index, 'uploadPYP', e.target.files[0])}
                              className={`w-full p-2 border rounded-lg text-sm ${validationErrors[`portabilityUpload_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {detail.uploadPYP && typeof detail.uploadPYP !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
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
                  {/* #3: Renewal Insurer Name - Dropdown */}
                  <div>
                    <label className="text-xs font-medium text-gray-700">Insurer Name</label>
                    <select
                      data-field="renewalInsurer"
                      value={healthDetails.renewalDetails.insurerName}
                      onChange={(e) => handleRenewalDetailChange('insurerName', e.target.value)}
                      className={`w-full p-2 border rounded-lg text-sm ${validationErrors.renewalInsurer ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select Insurer</option>
                      {INSURER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
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
                  {/* #6a: Renewal Policy Due Date - ±60 days */}
                  <div>
                    <label className="text-xs font-medium text-gray-700">Policy Due Date</label>
                    <input
                      data-field="renewalDueDate"
                      type="date"
                      value={healthDetails.renewalDetails.policyDueDate}
                      onChange={(e) => {
                        const selected = new Date(e.target.value);
                        const today = new Date();
                        const sixtyDaysBefore = new Date();
                        sixtyDaysBefore.setDate(today.getDate() - 60);
                        const sixtyDaysAfter = new Date();
                        sixtyDaysAfter.setDate(today.getDate() + 60);

                        if (selected >= sixtyDaysBefore && selected <= sixtyDaysAfter) {
                          handleRenewalDetailChange('policyDueDate', e.target.value);
                        } else {
                          alert("Due date must be within 60 days before or 60 days after current date");
                        }
                      }}
                      className={`w-full p-2 border rounded-lg text-sm ${validationErrors.renewalDueDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {validationErrors.renewalDueDate && <p className="text-red-500 text-xs mt-1">{validationErrors.renewalDueDate}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Upload Policy (Not Mandatory)</label>
                    {typeof healthDetails.renewalDetails.uploadPolicy === "string" && healthDetails.renewalDetails.uploadPolicy && (
                      <div className="mb-1">
                        <a
                          href={healthDetails.renewalDetails.uploadPolicy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 underline"
                        >
                          View current policy file
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleRenewalDetailChange('uploadPolicy', e.target.files[0])}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                    {healthDetails.renewalDetails.uploadPolicy && typeof healthDetails.renewalDetails.uploadPolicy !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
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
                onClick={() => {
                  setShowPreviousPolicyPopup(false);
                }}
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

    const updateMemberField = (index, field, value) => {
      const newMembers = [...healthDetails.members];
      newMembers[index][field] = value;
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
                <label className="text-sm font-medium text-gray-700">Total Adults (including Proposer)</label>
                <input
                  data-field="numberOfAdults"
                  type="number"
                  min="0"
                  value={healthDetails.numberOfAdults}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHealthDetails(prev => ({ ...prev, numberOfAdults: val }));
                    // #1: Pass fresh value directly to avoid stale state
                    generateFloaterMembers(val, healthDetails.numberOfChildren, healthDetails.proposerIsMember);
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
                    const val = e.target.value;
                    setHealthDetails(prev => ({ ...prev, numberOfChildren: val }));
                    // #1: Pass fresh value directly to avoid stale state
                    generateFloaterMembers(healthDetails.numberOfAdults, val, healthDetails.proposerIsMember);
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
              placeholder={`e.g., 5'8"`}
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
              <label className="text-sm font-medium text-gray-700">Proposer is a Member within the Plan? <span className="text-red-500">*</span></label>
              <select
                data-field="proposerIsMember"
                value={healthDetails.proposerIsMember}
                onChange={(e) => {
                  const val = e.target.value;
                  setHealthDetails(prev => ({ ...prev, proposerIsMember: val }));
                  // #1: Pass fresh value directly to avoid stale state
                  generateFloaterMembers(healthDetails.numberOfAdults, healthDetails.numberOfChildren, val);
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
                <label className="text-sm font-medium text-gray-700">Nominee Name <span className="text-red-500">*</span></label>
                <input
                  data-field="nomineeName"
                  type="text"
                  value={healthDetails.nomineeName}
                  onChange={(e) => setHealthDetails(prev => ({ ...prev, nomineeName: toUpperCase(e.target.value) }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.nomineeName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {validationErrors.nomineeName && <p className="text-red-500 text-xs mt-1">{validationErrors.nomineeName}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nominee DOB <span className="text-red-500">*</span></label>
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
                <label className="text-sm font-medium text-gray-700">Nominee Relationship <span className="text-red-500">*</span></label>
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
            {validationErrors.aadhaar && <p className="text-red-500 text-xs mt-1">{validationErrors.aadhaar}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload Aadhaar</label>
            {typeof healthDetails.aadhaarFile === "string" && healthDetails.aadhaarFile && (
              <div className="mb-1">
                <a
                  href={healthDetails.aadhaarFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 underline"
                >
                  View current Aadhaar file
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setHealthDetails(prev => ({ ...prev, aadhaarFile: e.target.files[0] || prev.aadhaarFile }))}
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
            {validationErrors.pan && <p className="text-red-500 text-xs mt-1">{validationErrors.pan}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload PAN</label>
            {typeof healthDetails.panFile === "string" && healthDetails.panFile && (
              <div className="mb-1">
                <a
                  href={healthDetails.panFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 underline"
                >
                  View current PAN file
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setHealthDetails(prev => ({ ...prev, panFile: e.target.files[0] || prev.panFile }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {healthDetails.panFile instanceof File && <p className="text-xs text-green-500 mt-1">✓ New file selected</p>}
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

        {/* Floater Members Section - shows correct Adult count based on Proposer Is Member */}
        {showFloaterMembers && healthDetails.members && healthDetails.members.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-md font-semibold text-indigo-600 mb-3 flex items-center gap-2">
              <FaUsers /> Family Members ({healthDetails.members.length})
              {healthDetails.proposerIsMember === "Yes" && (
                <span className="text-xs font-normal text-green-600 ml-2">
                  (Proposer included as Self + remaining adults)
                </span>
              )}
            </h4>
            {healthDetails.members.map((member, index) => (
              <div key={member.id || index} className="border rounded-lg p-4 mb-4 bg-gray-50">
                <h5 className="font-medium text-gray-700 mb-3 capitalize">
                  {member.type === 'proposer' ? 'Proposer (Self)' : member.type === 'adult' ? `Adult ${index + (healthDetails.proposerIsMember === "Yes" ? 0 : 1)}` : `Child ${index - (healthDetails.members.filter(m => m.type !== 'child').length) + 1}`}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={member.name || ''}
                      onChange={(e) => updateMemberField(index, 'name', toUpperCase(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      readOnly={member.type === 'proposer'}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">DOB</label>
                    <input
                      type="date"
                      max={maxDate}
                      value={member.dob || ''}
                      onChange={(e) => updateMemberField(index, 'dob', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Monthly Income</label>
                    <input
                      type="number"
                      value={member.monthlyIncome || ''}
                      onChange={(e) => updateMemberField(index, 'monthlyIncome', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Relationship</label>
                    <select
                      value={member.relationship || ''}
                      onChange={(e) => updateMemberField(index, 'relationship', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      disabled={member.type === 'proposer'}
                    >
                      <option value="">Select</option>
                      {RELATIONSHIP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Height</label>
                    <input
                      type="text"
                      value={member.height || ''}
                      onChange={(e) => updateMemberField(index, 'height', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Weight</label>
                    <input
                      type="number"
                      value={member.weight || ''}
                      onChange={(e) => updateMemberField(index, 'weight', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Qualification</label>
                    <select
                      value={member.qualification || ''}
                      onChange={(e) => updateMemberField(index, 'qualification', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select</option>
                      {QUALIFICATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Occupation</label>
                    <select
                      value={member.occupation || ''}
                      onChange={(e) => updateMemberField(index, 'occupation', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select</option>
                      {OCCUPATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  {/* Aadhaar Number (all members) */}
                  <div>
                    <label className="text-xs font-medium text-gray-700">Aadhaar Number</label>
                    <input
                      type="text"
                      value={member.aadhaarNumber || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length > 12) return;
                        const newMembers = [...healthDetails.members];
                        newMembers[index].aadhaarNumber = val;
                        setHealthDetails(prev => ({
                          ...prev,
                          members: newMembers,
                          // keep top-level proposer Aadhaar in sync
                          ...(member.type === 'proposer' ? { aadhaarNumber: val } : {}),
                        }));
                      }}
                      maxLength="12"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="12 digits"
                    />
                  </div>

                  {/* Upload Aadhaar (all members, not mandatory) */}
                  <div>
                    <label className="text-xs font-medium text-gray-700">Upload Aadhaar (Not Mandatory)</label>
                    {typeof member.aadhaarFile === "string" && member.aadhaarFile && (
                      <div className="mb-1">
                        <a
                          href={member.aadhaarFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 underline"
                        >
                          View current Aadhaar file
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const newMembers = [...healthDetails.members];
                        newMembers[index].aadhaarFile = file;
                        setHealthDetails(prev => ({
                          ...prev,
                          members: newMembers,
                          ...(member.type === 'proposer' ? { aadhaarFile: file } : {}),
                        }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                    {member.aadhaarFile instanceof File && (
                      <p className="text-xs text-green-500 mt-1">✓ New file selected</p>
                    )}
                  </div>

                  {/* #1c: Proposer PAN fields in Family Members */}
                  {member.type === 'proposer' && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-gray-700">PAN Number</label>
                        <input
                          type="text"
                          value={member.panNumber || ''}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            if (val.length > 10) return;
                            const newMembers = [...healthDetails.members];
                            newMembers[index].panNumber = val;
                            setHealthDetails(prev => ({ ...prev, members: newMembers, panNumber: val }));
                          }}
                          maxLength="10"
                          className="w-full p-2 border border-gray-300 rounded-lg uppercase text-sm"
                          placeholder="ABCDE1234F"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Upload PAN</label>
                        {typeof member.panFile === "string" && member.panFile && (
                          <div className="mb-1">
                            <a href={member.panFile} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline">
                              View current PAN file
                            </a>
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const newMembers = [...healthDetails.members];
                            newMembers[index].panFile = file;
                            setHealthDetails(prev => ({ ...prev, members: newMembers, panFile: file }));
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        />
                        {member.panFile instanceof File && <p className="text-xs text-green-500 mt-1">✓ New file selected</p>}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-700">Want Rider?</label>
                    <select
                      value={member.wantRider || ''}
                      onChange={(e) => {
                        const newMembers = [...healthDetails.members];
                        newMembers[index].wantRider = e.target.value;
                        if (e.target.value === "No") {
                          newMembers[index].selectedRider = '';
                          newMembers[index].riderDetails = { instaShield: '', asthma: '', diabetes: '', hypertension: '', hyperlipidaemia: '' };
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
                          value={member.selectedRider || ''}
                          onChange={(e) => handleMemberRiderChange(index, 'selectedRider', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Select</option>
                          {RIDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      {member.selectedRider === "Insta Shield" && (
                        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {[
                            ["asthma", "Asthma"],
                            ["diabetes", "Diabetes"],
                            ["hypertension", "Hypertension (Blood Pressure)"],
                            ["hyperlipidaemia", "Hyperlipidaemia"],
                          ].map(([key, label]) => (
                            <div key={key}>
                              <label className="text-xs font-medium text-gray-700">{label}</label>
                              <select
                                value={member.riderDetails?.[key] || ''}
                                onChange={(e) => handleMemberRiderDetailChange(index, key, e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              >
                                <option value="">Select</option>
                                {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}

                      {[
                        ["Fetal Flourish", "fetalFlourish", "Fetal Flourish"],
                        ["NRInsure", "nrInsure", "NRInsure"],
                        ["Loss of Income (Any Illness excluding Infection)", "lossOfIncome", "Loss of Income"],
                        ["Major Illness and Accident Multiplier", "majorIllness", "Major Illness and Accident Multiplier"],
                        ["International Cover-Emergency Care", "internationalCover", "International Cover"],
                      ].map(([riderName, key, label]) => (
                        member.selectedRider === riderName && (
                          <div key={key}>
                            <label className="text-xs font-medium text-gray-700">{label}</label>
                            <input
                              type="text"
                              value={member[key] || ''}
                              onChange={(e) => updateMemberField(index, key, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="Enter details"
                            />
                          </div>
                        )
                      ))}
                    </>
                  )}

                  <div className="lg:col-span-3">
                    <label className="text-xs font-medium text-gray-700">Remarks (PED/Treatment)</label>
                    <textarea
                      value={member.medicalRemarks || ''}
                      onChange={(e) => updateMemberField(index, 'medicalRemarks', e.target.value)}
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

  // ============================================================
  // RENDER: MOTOR FORM - UPDATED with manufacturer lists + Other
  // ============================================================
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

    // Manufacturer dropdown depends on Vehicle Type
    const manufacturerInfo = getManufacturerOptions(motorDetails.vehicleType, motorDetails.manufacturer);
    const isOtherManufacturer = motorDetails.manufacturer === OTHER_MANUFACTURER;

    return (
      <div className="border-t-2 border-indigo-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaCar /> Motor Insurance Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Vehicle Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">Vehicle Type <span className="text-red-500">*</span></label>
            <select
              data-field="vehicleType"
              value={motorDetails.vehicleType}
              onChange={(e) => {
                const vehicleType = e.target.value;
                setMotorDetails(prev => {
                  // Clear the manufacturer if it doesn't belong to the new vehicle type's list
                  const keep = isManufacturerValidForType(vehicleType, prev.manufacturer);
                  return {
                    ...prev,
                    vehicleType,
                    manufacturer: keep ? prev.manufacturer : "",
                    otherManufacturer: keep ? prev.otherManufacturer : "",
                  };
                });
              }}
              className={`w-full p-2 border rounded-lg ${validationErrors.vehicleType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Vehicle Type</option>
              {VEHICLE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.vehicleType && <p className="text-red-500 text-xs mt-1">{validationErrors.vehicleType}</p>}
          </div>

          {/* Previous Insurance Status */}
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

          {/* Registration Number - Only for non-New vehicles */}
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

          {/* Auto-fetched RTO Code - Only for non-New vehicles */}
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

          {/* Insurance Type */}
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
          {/* Sum Insured - Manual entry for Motor Insurance */}
<div>
  <label className="text-sm font-medium text-gray-700">Sum Insured (IDV) — Manual Entry</label>
  <input
    type="text"
    value={formData.sumInsured}
    onChange={(e) => setFormData(prev => ({ ...prev, sumInsured: e.target.value }))}
    className="w-full p-2 border border-gray-300 rounded-lg"
    placeholder="Enter Sum Insured manually (e.g., 5,50,000)"
  />
</div>
        </div>

        {/* New Vehicle Details Section */}
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
                  disabled={!motorDetails.vehicleType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMotorDetails(prev => ({
                      ...prev,
                      manufacturer: value,
                      otherManufacturer: value === OTHER_MANUFACTURER ? prev.otherManufacturer : "",
                    }));
                  }}
                  className={`w-full p-2 border rounded-lg ${validationErrors.manufacturer ? 'border-red-500' : 'border-gray-300'} ${!motorDetails.vehicleType ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">{motorDetails.vehicleType ? "Select Manufacturer" : "Select Vehicle Type first"}</option>
                  {manufacturerInfo.legacyValue && (
                    <option value={manufacturerInfo.legacyValue}>{manufacturerInfo.legacyValue} (saved earlier)</option>
                  )}
                  {manufacturerInfo.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {motorDetails.vehicleType && (
                  <p className="text-xs text-gray-500 mt-1">
                    {manufacturerInfo.count} manufacturers for {motorDetails.vehicleType}. Not listed? Choose "Other".
                  </p>
                )}
                {validationErrors.manufacturer && <p className="text-red-500 text-xs mt-1">{validationErrors.manufacturer}</p>}
              </div>

              {/* Manual manufacturer name when "Other" is selected */}
              {isOtherManufacturer && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Manufacturer Name (Manual) <span className="text-red-500">*</span></label>
                  <input
                    data-field="otherManufacturer"
                    type="text"
                    value={motorDetails.otherManufacturer || ""}
                    onChange={(e) => setMotorDetails(prev => ({ ...prev, otherManufacturer: e.target.value }))}
                    className={`w-full p-2 border rounded-lg ${validationErrors.otherManufacturer ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter manufacturer / company name"
                  />
                  {validationErrors.otherManufacturer && <p className="text-red-500 text-xs mt-1">{validationErrors.otherManufacturer}</p>}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isOtherManufacturer ? "Model Name (Manual)" : "Model"} <span className="text-red-500">*</span>
                </label>
                <input
                  data-field="model"
                  type="text"
                  value={motorDetails.model}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, model: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.model ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder={isOtherManufacturer ? "Enter model name manually" : "Enter model name"}
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
                {typeof motorDetails.invoiceCopy === "string" && motorDetails.invoiceCopy && (
                  <div className="mb-1">
                    <a
                      href={motorDetails.invoiceCopy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 underline"
                    >
                      View current Invoice file
                    </a>
                  </div>
                )}
                <input
                  data-field="invoiceCopy"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, invoiceCopy: e.target.files[0] || prev.invoiceCopy }))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.invoiceCopy ? 'border-red-500' : 'border-gray-300'}`}
                />
                {motorDetails.invoiceCopy && typeof motorDetails.invoiceCopy !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
                {validationErrors.invoiceCopy && <p className="text-red-500 text-xs mt-1">{validationErrors.invoiceCopy}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Upload Chesis No. Photo (Not Mandatory)</label>
                {typeof motorDetails.chesisPhoto === "string" && motorDetails.chesisPhoto && (
                  <div className="mb-1">
                    <a
                      href={motorDetails.chesisPhoto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 underline"
                    >
                      View current Chesis photo
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, chesisPhoto: e.target.files[0] || prev.chesisPhoto }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {motorDetails.chesisPhoto && typeof motorDetails.chesisPhoto !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
              </div>
            </div>
          </div>
        )}

        {/* Active Policy Fields */}
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

        {/* SAOD Specific Fields */}
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

        {/* TP Insurance Fields */}
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

        {/* Add-On Section - For all types except TP */}
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

        {/* TP Insurance - Add-On automatically set to No */}
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

       {/* Uploads Section - Updated for all statuses */}
<div className="mt-4 border-t border-gray-200 pt-4">
  <h5 className="text-sm font-semibold text-gray-700 mb-3">Upload Documents</h5>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    
    {/* PYP Upload - Show for ALL statuses (Active, Expired, New) */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Upload PYP 
        {motorDetails.previousInsuranceStatus === "Active" && <span className="text-red-500">*</span>}
      </label>
      {typeof motorDetails.pypFile === "string" && motorDetails.pypFile && (
        <div className="mb-1">
          <a
            href={motorDetails.pypFile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 underline"
          >
            View current PYP file
          </a>
        </div>
      )}
      <input
        data-field="pypFile"
        type="file"
        accept=".pdf"
        onChange={(e) => setMotorDetails(prev => ({ ...prev, pypFile: e.target.files[0] || prev.pypFile }))}
        className={`w-full p-2 border rounded-lg ${validationErrors.pypFile ? 'border-red-500' : 'border-gray-300'}`}
      />
      {motorDetails.pypFile && typeof motorDetails.pypFile !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
      {validationErrors.pypFile && <p className="text-red-500 text-xs mt-1">{validationErrors.pypFile}</p>}
    </div>

    {/* RC Front Upload - Show for ALL statuses */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        RC Front Upload
        {motorDetails.previousInsuranceStatus !== "New" && <span className="text-red-500">*</span>}
      </label>
      {typeof motorDetails.rcFrontFile === "string" && motorDetails.rcFrontFile && (
        <div className="mb-1">
          <a
            href={motorDetails.rcFrontFile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 underline"
          >
            View current RC Front file
          </a>
        </div>
      )}
      <input
        data-field="rcFrontFile"
        type="file"
        accept=".pdf,.jpg,.jpeg"
        onChange={(e) => setMotorDetails(prev => ({ ...prev, rcFrontFile: e.target.files[0] || prev.rcFrontFile }))}
        className={`w-full p-2 border rounded-lg ${validationErrors.rcFrontFile ? 'border-red-500' : 'border-gray-300'}`}
      />
      {motorDetails.rcFrontFile && typeof motorDetails.rcFrontFile !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
      {validationErrors.rcFrontFile && <p className="text-red-500 text-xs mt-1">{validationErrors.rcFrontFile}</p>}
    </div>

    {/* RC Back Upload - Show for ALL statuses */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        RC Back Upload
        {motorDetails.previousInsuranceStatus !== "New" && <span className="text-red-500">*</span>}
      </label>
      {typeof motorDetails.rcBackFile === "string" && motorDetails.rcBackFile && (
        <div className="mb-1">
          <a
            href={motorDetails.rcBackFile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 underline"
          >
            View current RC Back file
          </a>
        </div>
      )}
      <input
        data-field="rcBackFile"
        type="file"
        accept=".pdf,.jpg,.jpeg"
        onChange={(e) => setMotorDetails(prev => ({ ...prev, rcBackFile: e.target.files[0] || prev.rcBackFile }))}
        className={`w-full p-2 border rounded-lg ${validationErrors.rcBackFile ? 'border-red-500' : 'border-gray-300'}`}
      />
      {motorDetails.rcBackFile && typeof motorDetails.rcBackFile !== "string" && <p className="text-xs text-green-500 mt-1">✓ File selected</p>}
      {validationErrors.rcBackFile && <p className="text-red-500 text-xs mt-1">{validationErrors.rcBackFile}</p>}
    </div>
  </div>
</div>

        {/* Add-On Modal */}
        {renderAddOnModal()}
      </div>
    );
  };

  // ============================================================
  // RENDER: ELECTRONIC FORM
  // ============================================================
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
            {typeof electronicDetails.aadhaarFile === "string" && electronicDetails.aadhaarFile && (
              <div className="mb-1">
                <a
                  href={electronicDetails.aadhaarFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 underline"
                >
                  View current Aadhaar file
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, aadhaarFile: e.target.files[0] || prev.aadhaarFile }))}
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
            {typeof electronicDetails.panFile === "string" && electronicDetails.panFile && (
              <div className="mb-1">
                <a
                  href={electronicDetails.panFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 underline"
                >
                  View current PAN file
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, panFile: e.target.files[0] || prev.panFile }))}
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
            {typeof electronicDetails.imeiImage === "string" && electronicDetails.imeiImage && (
              <div className="mb-1">
                <a
                  href={electronicDetails.imeiImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 underline"
                >
                  View current IMEI image
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, imeiImage: e.target.files[0] || prev.imeiImage }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">
              Device Photos (3-4 photos from different angles showing IMEI)
            </label>
            {electronicDetails.devicePhotos && electronicDetails.devicePhotos.length > 0 && (
              <div className="mb-1 flex flex-wrap gap-2">
                {electronicDetails.devicePhotos.map((photo, idx) => {
                  if (typeof photo === "string" && photo) {
                    return (
                      <a
                        key={idx}
                        href={photo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 underline"
                      >
                        View current photo {idx + 1}
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            )}
            <input
              type="file"
              accept=".jpg,.jpeg"
              multiple
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, devicePhotos: Array.from(e.target.files) }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {electronicDetails.devicePhotos && electronicDetails.devicePhotos.some(f => typeof f !== "string") && (
              <p className="text-sm text-gray-500 mt-1">{electronicDetails.devicePhotos.filter(f => typeof f !== "string").length} new photos selected</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload Purchase Invoice</label>
            {typeof electronicDetails.purchaseInvoice === "string" && electronicDetails.purchaseInvoice && (
              <div className="mb-1">
                <a
                  href={electronicDetails.purchaseInvoice}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 underline"
                >
                  View current invoice
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, purchaseInvoice: e.target.files[0] || prev.purchaseInvoice }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER: MOTOR PAYOUT for one insurer quote (Admin Only)
  // ============================================================
  const renderQuoteMotorPayout = (quote, idx) => {
    const { hasOD, hasTP } = getMotorPremiumParts(motorDetails.insuranceType);
    const { errors: qErrors, warnings: qWarnings } = getQuoteMotorValidation(quote, idx);
    const errFor = (suffix) => qErrors.find(e => e.field === `quote${idx}_${suffix}`)?.message?.replace(/^[^:]+:\s/, "");
    const net = safeNumber(quote.netPremium);
    const od = hasOD ? safeNumber(quote.odPremium) : 0;
    const tp = hasTP ? safeNumber(quote.tpPremium) : 0;
    const splitTotal = od + tp;
    const splitMatches = net > 0 && Math.abs(splitTotal - net) <= 1;
    const inputCls = (suffix) =>
      `w-full p-1 border rounded text-sm ${errFor(suffix) ? 'border-red-500' : 'border-gray-300'}`;

    return (
      <div className="mt-3 border-t pt-2 bg-amber-50 -mx-3 px-3 pb-2 rounded-b-lg">
        <h6 className="text-xs font-semibold text-amber-700 mb-1">Payout — Motor (Admin Only)</h6>
        <p className="text-[11px] text-gray-500 mb-2">
          {motorDetails.insuranceType || "Insurance Type not selected"} · PayOut on {hasOD && hasTP ? "OD + TP separately" : hasOD ? "OD only" : "TP only"}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hasOD && (
            <div>
              <label className="text-xs font-medium text-gray-700">OD Premium (Net) <span className="text-red-500">*</span></label>
              <input
                data-field={`quote${idx}_OdPremium`}
                type="number"
                min="0"
                className={inputCls("OdPremium")}
                value={quote.odPremium ?? ''}
                onChange={(e) => updateInsurerQuote(idx, 'odPremium', e.target.value)}
              />
              {errFor("OdPremium") && <p className="text-red-500 text-[10px] mt-0.5">{errFor("OdPremium")}</p>}
            </div>
          )}
          {hasTP && (
            <div>
              <label className="text-xs font-medium text-gray-700">TP Premium (Net) <span className="text-red-500">*</span></label>
              <input
                data-field={`quote${idx}_TpPremium`}
                type="number"
                min="0"
                className={inputCls("TpPremium")}
                value={quote.tpPremium ?? ''}
                onChange={(e) => updateInsurerQuote(idx, 'tpPremium', e.target.value)}
              />
              {errFor("TpPremium") && <p className="text-red-500 text-[10px] mt-0.5">{errFor("TpPremium")}</p>}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-700">{hasOD && hasTP ? "OD + TP" : "Premium Used"} vs Net Premium</label>
            <input
              type="text"
              readOnly
              className={`w-full p-1 border rounded bg-gray-100 text-sm font-medium ${
                splitTotal <= 0 ? 'text-gray-600' : splitMatches ? 'text-green-700 border-green-400' : 'text-red-600 border-red-400'
              }`}
              value={`${formatCurrency(splitTotal)} / ${formatCurrency(net)}`}
            />
            {splitTotal > 0 && (
              <p className={`text-[10px] mt-0.5 ${splitMatches ? 'text-green-600' : 'text-red-500'}`}>
                {splitMatches ? "✓ Matches Net Premium" : `Difference: ₹${(splitTotal - net).toFixed(2)}`}
              </p>
            )}
            {errFor("NetPremium") && <p className="text-red-500 text-[10px] mt-0.5">{errFor("NetPremium")}</p>}
          </div>

          {hasOD && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-700">OD Payout Slab (%) <span className="text-red-500">*</span></label>
                <input
                  data-field={`quote${idx}_OdPayoutPercent`}
                  type="number"
                  min="0"
                  max="100"
                  className={inputCls("OdPayoutPercent")}
                  value={quote.odPayoutSlab ?? ''}
                  onChange={(e) => updateInsurerQuote(idx, 'odPayoutSlab', e.target.value)}
                />
                {errFor("OdPayoutPercent") && <p className="text-red-500 text-[10px] mt-0.5">{errFor("OdPayoutPercent")}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">OD PayOut Amount (auto)</label>
                <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm" value={formatCurrency(quote.odPayoutAmount)} />
              </div>
            </>
          )}
          {hasTP && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-700">TP Payout Slab (%) <span className="text-red-500">*</span></label>
                <input
                  data-field={`quote${idx}_TpPayoutPercent`}
                  type="number"
                  min="0"
                  max="100"
                  className={inputCls("TpPayoutPercent")}
                  value={quote.tpPayoutSlab ?? ''}
                  onChange={(e) => updateInsurerQuote(idx, 'tpPayoutSlab', e.target.value)}
                />
                {errFor("TpPayoutPercent") && <p className="text-red-500 text-[10px] mt-0.5">{errFor("TpPayoutPercent")}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">TP PayOut Amount (auto)</label>
                <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm" value={formatCurrency(quote.tpPayoutAmount)} />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-medium text-gray-700">Total PayOut Receivable (auto)</label>
            <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm font-medium" value={formatCurrency(quote.totalPayoutReceivable)} />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">GST Return Slab (%)</label>
            <input
              data-field={`quote${idx}_GstReturn`}
              type="number"
              className={inputCls("GstReturn")}
              value={quote.gstReturnSlabOnEMI ?? ''}
              onChange={(e) => updateInsurerQuote(idx, 'gstReturnSlabOnEMI', e.target.value)}
            />
            {errFor("GstReturn") && <p className="text-red-500 text-[10px] mt-0.5">{errFor("GstReturn")}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">GST Return Amount (auto)</label>
            <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm font-medium text-emerald-700" value={formatCurrency(quote.gstReturnAmount)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">TDS Amount @ 2% (auto)</label>
            <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm font-medium text-red-600" value={formatCurrency(quote.tdsAmount)} />
            <p className="text-[10px] text-gray-500 mt-0.5">= Total PayOut Receivable × 2%</p>
          </div>

          {qWarnings.length > 0 && (
            <div className="lg:col-span-3 bg-yellow-50 border border-yellow-300 rounded p-2 space-y-0.5">
              {qWarnings.map((w, i) => (
                <p key={i} className="text-[11px] text-yellow-800">⚠ {w.replace(/^[^:]+:\s/, "")}</p>
              ))}
            </div>
          )}

          <div className="lg:col-span-3">
            <label className="text-xs font-medium text-gray-700">
              Arshyan Payout (auto: OD PayOut + TP PayOut + GST Return − TDS 2% − Discount)
            </label>
            <input type="text" readOnly className="w-full p-1 border rounded bg-amber-100 text-sm font-semibold"
              value={formatCurrency(quote.arshyanPayout)} />
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER WORKFLOW FORM (Admin Only)
  // ============================================================
  const renderWorkflowForm = () => {
    // Lock only when the lead was ALREADY saved as Policy Issued,
    // not the instant the dropdown changes (that hid the policy fields)
    const isPolicyIssued = editLead?.status === "Policy Issued";
    const showPayout = isPayoutVisible();
    // Quotes stay locked after issue - unless the lead was issued without any quote,
    // otherwise the payout (which needs the quote's Net Premium) could never be entered.
    const savedHadQuotes = (editLead?.workflowDetails?.selectedInsurers?.length || 0) > 0;
    const quoteLocked = isPolicyIssued && savedHadQuotes;

    // #5: Payment Mode EMI restriction by LOB
    const isEMIEligibleLOB = formData.lob && (
      formData.lob.toLowerCase().includes("health") ||
      formData.lob.toLowerCase().includes("term") ||
      formData.lob === "Mediclaim Health Insurance" ||
      formData.lob === "Group Health Insurance" ||
      formData.lob === "Terms Insurance"
    );
    const paymentModeOptionsForLOB = isEMIEligibleLOB ? PAYMENT_TERM_OPTIONS : ["One Time"];

    // FIX: keep quotes (and the payout inside them) visible after "Quotation Generated".
    // Previously this block disappeared at "Policy Issued", so the payout was never reachable.
    const showQuotesBlock =
      workflowDetails.status === "Quotation Generated" ||
      showInsurerQuotes ||
      (workflowDetails.selectedInsurers?.length || 0) > 0 ||
      showPayout;
    
    return (
      <div className="border-t-2 border-indigo-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaEdit /> Workflow Management (Admin Only)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={workflowDetails.status}
              onChange={(e) => {
                setWorkflowDetails(prev => ({ ...prev, status: e.target.value }));
                setShowInsurerQuotes(e.target.value === "Quotation Generated");
              }}
              className={`w-full p-2 border rounded-lg ${isPolicyIssued ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
              disabled={isPolicyIssued}
            >
              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {isPolicyIssued && <p className="text-xs text-gray-500 mt-1">Status is locked when Policy Issued</p>}
          </div>

          {showQuotesBlock && (
            <>
              <div className="lg:col-span-3">
                <label className="text-sm font-medium text-gray-700">Select Insurers for Quote</label>
                {/* #2: Show all insurers instead of slicing to 10, bumped max-h to 64 */}
                <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 border p-2 rounded-lg max-h-64 overflow-y-auto ${quoteLocked ? 'bg-gray-100' : ''}`}>
                  {INSURER_OPTIONS.map(ins => (
                    <label key={ins} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={workflowDetails.selectedInsurers?.includes(ins) || false}
                        onChange={(e) => {
                          if (quoteLocked) return;
                          const current = workflowDetails.selectedInsurers || [];
                          let updated;
                          if (e.target.checked) {
                            updated = [...current, ins];
                          } else {
                            updated = current.filter(i => i !== ins);
                          }
                          setWorkflowDetails(prev => ({ ...prev, selectedInsurers: updated }));
                        }}
                        className={`rounded text-indigo-600 ${quoteLocked ? 'cursor-not-allowed' : ''}`}
                        disabled={quoteLocked}
                      />
                      {ins}
                    </label>
                  ))}
                </div>
                {quoteLocked && <p className="text-xs text-gray-500 mt-1">Insurer selection is locked when Policy Issued</p>}
              </div>
              {workflowDetails.selectedInsurers?.length > 0 && (
                <div className="lg:col-span-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Insurer-wise Quotes</h5>
                  {workflowDetails.selectedInsurers.map((insurer, idx) => {
                    const quote = workflowDetails.insurerQuotes?.[idx] || {};
                    const showEmiFields = quote.paymentMode && quote.paymentMode !== "Yearly" && quote.paymentMode !== "One Time";

                    return (
                      <div key={idx} className="border rounded-lg p-3 mb-3 bg-gray-50">
                        <h6 className="font-medium text-indigo-600">{insurer}</h6>

                        {/* ---- Quote No. + Upload + View ---- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                          <div>
                            <label className="text-xs font-medium text-gray-700">Quote No. <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              className={`w-full p-1 border rounded text-sm ${quoteLocked ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                              disabled={quoteLocked}
                              placeholder="Enter quote number"
                              value={quote.quoteNumber || ''}
                              onChange={(e) => !quoteLocked && updateInsurerQuote(idx, 'quoteNumber', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Upload Quote</label>
                            {typeof quote.quoteUpload === "string" && quote.quoteUpload && (
                              <div className="mb-1">
                                <a href={quote.quoteUpload} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline">
                                  View current quote file
                                </a>
                              </div>
                            )}
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg"
                              className={`w-full p-1 border rounded text-sm ${quoteLocked ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                              disabled={quoteLocked}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && !quoteLocked) updateInsurerQuoteFile(idx, 'quoteUpload', file);
                              }}
                            />
                            {quote.quoteUpload instanceof File && (
                              <p className="text-xs text-green-500 mt-1">✓ New file selected</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Payment Mode</label>
                            {/* #5: Payment Mode options restricted by LOB */}
                            <select
                              className={`w-full p-1 border rounded text-sm ${quoteLocked ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                              disabled={quoteLocked}
                              value={quote.paymentMode || (isEMIEligibleLOB ? '' : 'One Time')}
                              onChange={(e) => !quoteLocked && updateInsurerQuote(idx, 'paymentMode', e.target.value)}
                            >
                              <option value="">Select</option>
                              {paymentModeOptionsForLOB.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* ---- Full/Annual Premium: Net -> GST -> Gross ---- */}
                        <div className="mt-3 border-t pt-2">
                          <h6 className="text-xs font-semibold text-gray-600 mb-2">Full Policy Premium</h6>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700">Net Premium</label>
                              <input
                                type="number"
                                className={`w-full p-1 border rounded text-sm ${quoteLocked ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                disabled={quoteLocked}
                                value={quote.netPremium || ''}
                                onChange={(e) => !quoteLocked && updateInsurerQuote(idx, 'netPremium', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">GST %</label>
                              <input
                                type="number"
                                className={`w-full p-1 border rounded text-sm ${quoteLocked ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                disabled={quoteLocked}
                                value={quote.gst ?? 18}
                                onChange={(e) => !quoteLocked && updateInsurerQuote(idx, 'gst', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Gross Premium (auto)</label>
                              <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm"
                                value={formatCurrency(quote.grossPremium)} />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Final Discount</label>
                              <input
                                type="number"
                                className={`w-full p-1 border rounded text-sm ${quoteLocked ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                disabled={quoteLocked}
                                value={quote.finalDiscount || ''}
                                onChange={(e) => !quoteLocked && updateInsurerQuote(idx, 'finalDiscount', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Payable Amount (auto)</label>
                              <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm"
                                value={formatCurrency(quote.payableAmount)} />
                            </div>
                          </div>
                        </div>

                        {/* ---- EMI Premium (only if not Yearly / One Time) ---- */}
                        {showEmiFields && (
                          <div className="mt-3 border-t pt-2">
                            <h6 className="text-xs font-semibold text-gray-600 mb-2">
                              Premium per EMI ({quote.paymentMode})
                            </h6>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700">EMI Net Premium</label>
                                <input
                                  type="number"
                                  className={`w-full p-1 border rounded text-sm ${quoteLocked ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                  disabled={quoteLocked}
                                  value={quote.emiNetPremium || ''}
                                  onChange={(e) => !quoteLocked && updateInsurerQuote(idx, 'emiNetPremium', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700">EMI GST %</label>
                                <input
                                  type="number"
                                  className={`w-full p-1 border rounded text-sm ${quoteLocked ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                  disabled={quoteLocked}
                                  value={quote.emiGst ?? 18}
                                  onChange={(e) => !quoteLocked && updateInsurerQuote(idx, 'emiGst', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700">EMI Gross Premium (auto)</label>
                                <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm"
                                  value={formatCurrency(quote.emiGrossPremium)} />
                              </div>

                              {/* Auto EMI-count dropdown, e.g. Monthly + 3 Years = 1..36 */}
                              <div>
                                <label className="text-xs font-medium text-gray-700">EMI Received Count</label>
                                <select
                                  className={`w-full p-1 border rounded text-sm ${quoteLocked ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                  disabled={quoteLocked}
                                  value={quote.emiReceivedCount || 0}
                                  onChange={(e) => !quoteLocked && updateInsurerQuote(idx, 'emiReceivedCount', e.target.value)}
                                >
                                  {Array.from({ length: (quote.totalEmiCount || 0) + 1 }, (_, i) => i).map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                  ))}
                                </select>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  Total EMIs for this policy: {quote.totalEmiCount || 0}
                                </p>
                              </div>
                              <div className="lg:col-span-2">
                                <label className="text-xs font-medium text-gray-700">Gross Premium Received (auto)</label>
                                <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm font-medium"
                                  value={formatCurrency(quote.grossPremiumReceived)} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ---- Payout Section (Admin Only, once Policy Issued) ---- */}
                        {showPayout && showMotorSection && renderQuoteMotorPayout(quote, idx)}

                        {showPayout && !showMotorSection && (
                          <div className="mt-3 border-t pt-2 bg-amber-50 -mx-3 px-3 pb-2 rounded-b-lg">
                            <h6 className="text-xs font-semibold text-amber-700 mb-2">Payout (Admin Only)</h6>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700">Payout Slab (%)</label>
                                <input
                                  type="number"
                                  className="w-full p-1 border border-gray-300 rounded text-sm"
                                  value={quote.payoutSlab || ''}
                                  onChange={(e) => updateInsurerQuote(idx, 'payoutSlab', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700">Total PayOut Receivable (auto)</label>
                                <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm"
                                  value={formatCurrency(quote.totalPayoutReceivable)} />
                              </div>

                              {/* Only show PayOut on EMI when the quote's payment mode is actually EMI-based */}
                              {quote.isEMIMode && (
                                <div>
                                  <label className="text-xs font-medium text-gray-700">PayOut on EMI (auto)</label>
                                  <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm"
                                    value={formatCurrency(quote.payoutOnEMI)} />
                                </div>
                              )}

                              <div>
                                <label className="text-xs font-medium text-gray-700">GST Return Slab (%)</label>
                                <input
                                  type="number"
                                  className="w-full p-1 border border-gray-300 rounded text-sm"
                                  value={quote.gstReturnSlabOnEMI || ''}
                                  onChange={(e) => updateInsurerQuote(idx, 'gstReturnSlabOnEMI', e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-700">GST Return Amount (auto)</label>
                                <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm font-medium text-emerald-700"
                                  value={formatCurrency(quote.gstReturnAmount)} />
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-700">TDS Amount @ 2% (auto)</label>
                                <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm font-medium text-red-600"
                                  value={formatCurrency(quote.tdsAmount)} />
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  {quote.isEMIMode
                                    ? "= PayOut on EMI × EMIs Received × 2%"
                                    : "= Total PayOut Receivable × 2%"}
                                </p>
                              </div>

                              <div className="lg:col-span-3">
                                <label className="text-xs font-medium text-gray-700">
                                  Arshyan Payout (auto: Insurer Payout Received + GST Return − TDS 2% − Discount)
                                </label>
                                <input type="text" readOnly className="w-full p-1 border rounded bg-amber-100 text-sm font-semibold"
                                  value={formatCurrency(quote.arshyanPayout)} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Payout lives inside each insurer quote - explain when it can't be shown */}
          {isAdminUser() && (!showPayout || !(workflowDetails.selectedInsurers?.length > 0)) && (
            <div className="lg:col-span-3 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 flex items-start gap-2">
              <FaMoneyBillWave className="mt-0.5 text-amber-600 flex-shrink-0" />
              <span>
                <span className="font-medium text-amber-700">Payout{showMotorSection ? " — Motor" : ""} (Admin Only): </span>
                {!showPayout ? (
                  <>
                    opens when Status is <span className="font-medium">Policy Issued</span>. Current status:{" "}
                    <span className="font-medium">{workflowDetails.status || "Open"}</span>.
                  </>
                ) : (
                  <>add at least one insurer quote above. Payout is entered inside the quote the policy was issued with.</>
                )}
              </span>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Payment Status</label>
            {/* #3: Auto-sync main Status from Payment Status */}
            <select
              value={workflowDetails.paymentStatus}
              onChange={(e) => {
                const val = e.target.value;
                const statusOrder = ["Open", "Quotation Generated", "Payment Link Generated", "Payment Done", "Policy Issued"];
                const paymentToStatus = {
                  "URL Shared": "Payment Link Generated",
                  "Payment Done": "Payment Done",
                  "e-Mandate Status Done": "Payment Done",
                  "Policy Issued": "Policy Issued",
                };
                const target = paymentToStatus[val];

                setWorkflowDetails(prev => {
                  const curIdx = statusOrder.indexOf(prev.status);
                  const nextIdx = target ? statusOrder.indexOf(target) : -1;
                  return {
                    ...prev,
                    paymentStatus: val,
                    status: nextIdx > curIdx ? target : prev.status, // never move backwards
                  };
                });
              }}
              className={`w-full p-2 border rounded-lg ${isPolicyIssued ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
              disabled={isPolicyIssued}
            >
              <option value="">Select</option>
              {PAYMENT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {isPolicyIssued && <p className="text-xs text-gray-500 mt-1">Payment status is locked when Policy Issued</p>}
          </div>

          {workflowDetails.paymentStatus === "URL Shared" && (
            <div className="lg:col-span-3">
              <label className="text-sm font-medium text-gray-700">Payment URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={workflowDetails.paymentUrl}
                  onChange={(e) => setWorkflowDetails(prev => ({ ...prev, paymentUrl: e.target.value }))}
                  className={`flex-1 p-2 border rounded-lg ${isPolicyIssued ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                  disabled={isPolicyIssued}
                  placeholder="https://payment.link/..."
                />
                {workflowDetails.paymentUrl && !isPolicyIssued && (
                  <a href={workflowDetails.paymentUrl} target="_blank" rel="noopener noreferrer" 
                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <FaLink /> Open
                  </a>
                )}
              </div>
              {isPolicyIssued && <p className="text-xs text-gray-500 mt-1">Payment URL is locked when Policy Issued</p>}
            </div>
          )}

          {(workflowDetails.paymentStatus === "Payment Done" || workflowDetails.paymentStatus === "Policy Issued") && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">UTR Number</label>
                <input
                  type="text"
                  value={workflowDetails.utrNumber}
                  onChange={(e) => setWorkflowDetails(prev => ({ ...prev, utrNumber: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${isPolicyIssued ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                  disabled={isPolicyIssued}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Upload Payment Snapshot</label>
                {typeof workflowDetails.paymentSnapshot === "string" && workflowDetails.paymentSnapshot && (
                  <div className="mb-1">
                    <a href={workflowDetails.paymentSnapshot} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline">
                      View current snapshot
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setWorkflowDetails(prev => ({ ...prev, paymentSnapshot: file }));
                  }}
                  className={`w-full p-2 border rounded-lg ${isPolicyIssued ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                  disabled={isPolicyIssued}
                />
                {workflowDetails.paymentSnapshot instanceof File && <p className="text-xs text-green-500 mt-1">✓ New file selected</p>}
              </div>
            </>
          )}

          {(workflowDetails.paymentStatus === "Policy Issued" || workflowDetails.status === "Policy Issued") && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Policy Number</label>
                <input
                  type="text"
                  value={workflowDetails.policyNumber}
                  onChange={(e) => setWorkflowDetails(prev => ({ ...prev, policyNumber: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${isPolicyIssued ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                  disabled={isPolicyIssued}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Policy Issued On</label>
                <input
                  type="date"
                  value={workflowDetails.policyIssuedOn}
                  onChange={(e) => setWorkflowDetails(prev => ({ ...prev, policyIssuedOn: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${isPolicyIssued ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                  disabled={isPolicyIssued}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Policy Start Date</label>
                <input
                  type="date"
                  value={workflowDetails.policyStartDate}
                  onChange={(e) => {
                    const selected = new Date(e.target.value);
                    const pypDue = motorDetails.odDueDate || motorDetails.tpDueDate;
                    if (pypDue && selected < new Date(pypDue)) {
                      alert("Policy Start Date cannot be earlier than the Previous Policy (PYP) Due Date");
                      return;
                    }
                    setWorkflowDetails(prev => ({ ...prev, policyStartDate: e.target.value }));
                  }}
                  min={motorDetails.odDueDate || motorDetails.tpDueDate || undefined}
                  className={`w-full p-2 border rounded-lg ${isPolicyIssued ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                  disabled={isPolicyIssued}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Policy Expiry Date (auto)</label>
                <input
                  type="date"
                  value={workflowDetails.policyExpiryDate}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-calculated from Start Date + Tenure</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Upload Policy Copy</label>
                {typeof workflowDetails.policyCopy === "string" && workflowDetails.policyCopy && (
                  <div className="mb-1">
                    <a href={workflowDetails.policyCopy} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline">
                      View current policy copy
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setWorkflowDetails(prev => ({ ...prev, policyCopy: file }));
                  }}
                  className={`w-full p-2 border rounded-lg ${isPolicyIssued ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                  disabled={isPolicyIssued}
                />
                {workflowDetails.policyCopy instanceof File && <p className="text-xs text-green-500 mt-1">✓ New file selected</p>}
              </div>
            </>
          )}

          <div className="lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              value={workflowDetails.remarks}
              onChange={(e) => setWorkflowDetails(prev => ({ ...prev, remarks: e.target.value }))}
              className={`w-full p-2 border rounded-lg ${isPolicyIssued ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
              rows="3"
              disabled={isPolicyIssued}
            />
            {isPolicyIssued && <p className="text-xs text-gray-500 mt-1">Remarks are locked when Policy Issued</p>}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER EDIT MODAL - Full like LeadTable WITH workflow
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
              <FaEdit className="text-indigo-600" /> Edit Lead - Full Details
              <span className="text-sm font-normal text-gray-500 ml-2">(Admin Only)</span>
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

              {/* Motor uses a manual IDV in the Motor section, so hide the lakh-dropdown here for motor */}
              {!showMotorSection && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Sum Insured</label>
                  <select
                    value={formData.sumInsured}
                    onChange={(e) => setFormData({ ...formData, sumInsured: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    {formData.sumInsured && !SUM_INSURED_OPTIONS.includes(formData.sumInsured) && (
                      <option value={formData.sumInsured}>{formData.sumInsured}</option>
                    )}
                    {SUM_INSURED_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}

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

            {showPASection && (
              <PersonalAccidentForm
                details={paDetails}
                setDetails={setPaDetails}
                errors={validationErrors}
                insurerOptions={INSURER_OPTIONS}
              />
            )}
            {showTravelSection && (
              <TravelInsuranceForm
                details={travelDetails}
                setDetails={setTravelDetails}
                errors={validationErrors}
                lead={formData}
              />
            )}

            {/* Workflow Management Section */}
            {renderWorkflowForm()}

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
                  {selectedLead.motorDetails.manufacturer && <div>Manufacturer: {getDisplayManufacturer(selectedLead.motorDetails)}</div>}
                  {selectedLead.motorDetails.model && <div>Model: {selectedLead.motorDetails.model}</div>}
                  {selectedLead.motorDetails.fuelType && <div>Fuel Type: {selectedLead.motorDetails.fuelType}</div>}
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
            {selectedLead.paDetails && (
              <div className="sm:col-span-2 border-t pt-2 mt-2">
                <h4 className="font-semibold text-indigo-600">Personal Accident Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-sm">
                  <div>Insurer: {selectedLead.paDetails.insurerName || "-"}</div>
                  <div>Plan: {selectedLead.paDetails.planType || "-"}</div>
                </div>
              </div>
            )}
            {selectedLead.travelDetails && (
              <div className="sm:col-span-2 border-t pt-2 mt-2">
                <h4 className="font-semibold text-indigo-600">Travel Insurance Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-sm">
                  <div>Insurer: {selectedLead.travelDetails.insurerName || "-"}</div>
                  <div>Destination: {selectedLead.travelDetails.destination || "-"}</div>
                </div>
              </div>
            )}
            {/* Workflow Details in View Modal */}
            {selectedLead.workflowDetails && (
              <div className="sm:col-span-2 border-t pt-2 mt-2">
                <h4 className="font-semibold text-indigo-600">Workflow Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-sm">
                  <div>Status: {selectedLead.workflowDetails.status || "-"}</div>
                  <div>Quote Number: {selectedLead.workflowDetails.quoteNumber || "-"}</div>
                  <div>Payment Status: {selectedLead.workflowDetails.paymentStatus || "-"}</div>
                  <div>UTR Number: {selectedLead.workflowDetails.utrNumber || "-"}</div>
                  {selectedLead.workflowDetails.insurerQuotes?.length > 0 && (
                    <div className="sm:col-span-2">
                      <span className="font-medium">Insurer Quotes:</span>
                      <ul className="list-disc list-inside mt-1">
                        {selectedLead.workflowDetails.insurerQuotes.map((q, i) => (
                          <li key={i}>
                            {q.insurerName} - Net ₹{formatCurrency(q.netPremium)} / Gross ₹{formatCurrency(q.grossPremium)}
                            {q.isMotorPayout && (
                              <span className="text-xs text-gray-500">
                                {" "}(OD ₹{formatCurrency(q.odPremium)} @ {q.odPayoutSlab || 0}% · TP ₹{formatCurrency(q.tpPremium)} @ {q.tpPayoutSlab || 0}% · Arshyan ₹{formatCurrency(q.arshyanPayout)})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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