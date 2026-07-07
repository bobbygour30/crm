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
} from "react-icons/fa";
import { useState, useRef, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";

function LeadTable() {
  // ============================================================
  // CONSTANTS
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
    "Self", "Spouse", "Child", "Parent", "Sibling", "Other"
  ];
  
  const YES_NO_OPTIONS = ["Yes", "No"];
  
  const NCB_OPTIONS = ["0%", "20%", "25%", "35%", "45%", "50%"];
  
  const VEHICLE_TYPE_OPTIONS = [
    "Two Wheeler", "Private Car", "Taxi", "Commercial Vehicle"
  ];
  
  const INSURANCE_TYPE_OPTIONS = ["Comprehensive", "TP", "SAOD"];
  
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

  // ============================================================
  // VALIDATION HELPERS
  // ============================================================
  const toUpperCase = (value) => value ? value.toUpperCase() : value;
  const validateMobile = (mobile) => /^[0-9]{10}$/.test(mobile);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateAadhaar = (aadhaar) => /^[0-9]{12}$/.test(aadhaar);
  const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  const validatePIN = (pin) => /^[0-9]{6}$/.test(pin);

  const generateLeadCode = (leads) => {
    const lastLead = leads[0];
    let lastNumber = 0;
    if (lastLead && lastLead.leadCode) {
      const match = lastLead.leadCode.match(/LEAD-(\d+)/);
      if (match) lastNumber = parseInt(match[1]);
    }
    const newNumber = lastNumber + 1;
    return `LEAD-${String(newNumber).padStart(5, "0")}`;
  };

  // Get date restrictions - Today only (no future dates)
  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // ============================================================
  // STATE
  // ============================================================
  const [leads, setLeads] = useState([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [sourceFilters, setSourceFilters] = useState({
    employees: false,
    stores: false,
    channelPartners: false,
    socialMedia: false,
    directSource: false,
  });
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ show: false, message: "", type: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [renewalAlerts, setRenewalAlerts] = useState([]);
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [pinFetchError, setPinFetchError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [validationPopup, setValidationPopup] = useState({ show: false, errors: [] });

  // Form States
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

  // Health Insurance - Updated with Previous Policy Cases
  const [healthDetails, setHealthDetails] = useState({
    policyType: "",
    numberOfAdults: 0,
    numberOfChildren: 0,
    // Proposer Details - using main form data (no duplication)
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

  // Motor Insurance
  const [motorDetails, setMotorDetails] = useState({
    vehicleType: "",
    insuranceType: "",
    registrationNumber: "",
    rtoCode: "",
    previousPolicyStatus: "",
    previousInsurer: "",
    pypDueDate: "",
    idvAsPerPYP: "",
    claimTaken: "",
    ncb: "",
    addOnRequired: "",
    quoteRequired: "",
    pypFile: null,
    rcFrontFile: null,
    rcBackFile: null,
  });

  // Electronic Insurance
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

  // Workflow (for edit modal)
  const [workflowDetails, setWorkflowDetails] = useState({
    status: "Open",
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

  // UI States
  const [showHealthSection, setShowHealthSection] = useState(false);
  const [showMotorSection, setShowMotorSection] = useState(false);
  const [showElectronicSection, setShowElectronicSection] = useState(false);
  const [showFloaterMembers, setShowFloaterMembers] = useState(false);
  const [showInsurerQuotes, setShowInsurerQuotes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceDependentField, setSourceDependentField] = useState("");
  const [showSeniorOneDOB, setShowSeniorOneDOB] = useState(false);
  const [showPreviousPolicyPopup, setShowPreviousPolicyPopup] = useState(false);
  const [showPortabilityFields, setShowPortabilityFields] = useState(false);
  const [showRenewalFields, setShowRenewalFields] = useState(false);
  const [showFreshCaseFields, setShowFreshCaseFields] = useState(false);

  const filterDropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL;
  const errorRefs = useRef({});

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, globalSearch, sourceFilters]);

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
    checkRenewalAlerts();
  }, [leads]);

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

  // ============================================================
  // API CALLS
  // ============================================================
  const fetchLeads = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
        setFilteredLeads(data);
      }
    } catch (err) {
      console.error("Fetch leads error:", err);
    }
  };

  // ============================================================
  // PIN CODE AUTO-FETCH
  // ============================================================
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
  // RENEWAL ALERTS
  // ============================================================
  const checkRenewalAlerts = () => {
    const today = new Date();
    const alerts = [];
    
    leads.forEach(lead => {
      if (lead.policyExpiryDate) {
        const expiryDate = new Date(lead.policyExpiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          let priority = "Normal";
          if (daysUntilExpiry <= 7) priority = "Urgent";
          else if (daysUntilExpiry <= 15) priority = "Priority";
          
          alerts.push({
            leadId: lead._id,
            customerName: lead.name,
            policyNumber: lead.policyNumber,
            expiryDate: lead.policyExpiryDate,
            daysLeft: daysUntilExpiry,
            priority,
          });
        } else if (daysUntilExpiry <= 0) {
          alerts.push({
            leadId: lead._id,
            customerName: lead.name,
            policyNumber: lead.policyNumber,
            expiryDate: lead.policyExpiryDate,
            daysLeft: daysUntilExpiry,
            priority: "Expired",
          });
        }
      }
    });
    
    setRenewalAlerts(alerts);
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
                    lob.includes("E-Rikshaw");
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
  // FLOATER MEMBERS - Auto adjust when Proposer is Member
  // ============================================================
  const generateFloaterMembers = () => {
    let adults = parseInt(healthDetails.numberOfAdults) || 0;
    let children = parseInt(healthDetails.numberOfChildren) || 0;
    
    const members = [];
    
    // If Proposer is a Member, first member is the Proposer
    if (healthDetails.proposerIsMember === "Yes") {
      // Proposer is automatically the first adult
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
      
      // Add remaining adults (excluding proposer)
      // If proposer is a member, we need adults-1 more adults
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
      // All adults (proposer is separate)
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
    
    // Add children
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
  // PREVIOUS POLICY HANDLERS - Updated with Fresh Case
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
  // FILTER LEADS
  // ============================================================
  const filterLeads = () => {
    let filtered = [...leads];
    
    if (globalSearch.trim()) {
      const searchTerm = globalSearch.toLowerCase().trim();
      filtered = filtered.filter(
        (lead) =>
          (lead.policyNumber && lead.policyNumber.toLowerCase().includes(searchTerm)) ||
          (lead.leadCode && lead.leadCode.toLowerCase().includes(searchTerm)) ||
          (lead.mobileNo && lead.mobileNo.includes(searchTerm)) ||
          (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
          (lead.quoteNumber && lead.quoteNumber && lead.quoteNumber.toLowerCase().includes(searchTerm))
      );
    }
    
    const activeSourceFilters = [];
    if (sourceFilters.employees) activeSourceFilters.push("Employee");
    if (sourceFilters.stores) activeSourceFilters.push("Store");
    if (sourceFilters.channelPartners) activeSourceFilters.push("Channel Partner");
    if (sourceFilters.socialMedia) activeSourceFilters.push("Social Media");
    if (sourceFilters.directSource) activeSourceFilters.push("Direct Client");
    
    if (activeSourceFilters.length > 0) {
      filtered = filtered.filter((lead) => activeSourceFilters.includes(lead.source));
    }
    
    setFilteredLeads(filtered);
  };

  // ============================================================
  // BULK UPLOAD
  // ============================================================
  const downloadTemplate = () => {
    const templateData = [{
      name: "JOHN DOE",
      email: "john@example.com",
      mobileNo: "9876543210",
      gender: "Male",
      source: "Employee",
      remarks: "Customer remarks",
      lob: "Health Insurance",
      policyTenure: "1 Year",
      paymentTerm: "Yearly",
      sumInsured: "10 Lakh",
    }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LeadTemplate");
    XLSX.writeFile(wb, "lead_upload_template.xlsx");
  };

  const downloadExcel = () => {
    if (filteredLeads.length === 0) {
      alert("No leads data to export!");
      return;
    }
    const exportData = filteredLeads.map((lead) => ({
      "Lead Code": lead.leadCode || "",
      Name: lead.name || "",
      Email: lead.email || "",
      "Mobile No": lead.mobileNo || "",
      Gender: lead.gender || "",
      Source: lead.source || "",
      Status: lead.status || "",
      "Policy Number": lead.policyNumber || "",
      LOB: lead.lob || "",
      "Policy Tenure": lead.policyTenure || "",
      "Payment Term": lead.paymentTerm || "",
      "Sum Insured": lead.sumInsured || "",
      "PIN Code": lead.pinCode || "",
      State: lead.state || "",
      City: lead.city || "",
      Insurer: lead.insurer || "",
      Remarks: lead.remarks || "",
      "Policy Start Date": lead.policyStartDate || "",
      "Policy Expiry Date": lead.policyExpiryDate || "",
      "Created At": lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LeadsData");
    XLSX.writeFile(wb, `leads_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setUploadStatus({
        show: true,
        message: "Incorrect format! Please upload only .xlsx or .xls files.",
        type: "error",
      });
      setTimeout(() => setUploadStatus({ show: false, message: "", type: "" }), 5000);
      e.target.value = "";
      return;
    }
    
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          setUploadStatus({ show: true, message: "The uploaded file contains no data.", type: "error" });
          setIsUploading(false);
          e.target.value = "";
          return;
        }
        
        const errors = [];
        jsonData.forEach((row, index) => {
          if (!row.name || !row.mobileNo) {
            errors.push(`Row ${index + 2}: Missing name or mobile number`);
          }
          if (row.mobileNo && !validateMobile(row.mobileNo.toString())) {
            errors.push(`Row ${index + 2}: Invalid mobile number`);
          }
        });
        
        if (errors.length > 0) {
          setUploadStatus({ show: true, message: errors.join("\n"), type: "error" });
          setIsUploading(false);
          e.target.value = "";
          return;
        }
        
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/leads/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        
        if (res.ok) {
          const result = await res.json();
          fetchLeads();
          setUploadStatus({
            show: true,
            message: `${result.count || result.leads?.length || 0} leads uploaded successfully!`,
            type: "success",
          });
        } else {
          const error = await res.json();
          setUploadStatus({
            show: true,
            message: "Upload failed: " + (error.error || "Unknown error"),
            type: "error",
          });
        }
      } catch (err) {
        setUploadStatus({ show: true, message: "Error processing file: " + err.message, type: "error" });
      } finally {
        setIsUploading(false);
        e.target.value = "";
        setTimeout(() => setUploadStatus({ show: false, message: "", type: "" }), 5000);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ============================================================
  // VALIDATE ALL FIELDS BEFORE SUBMIT
  // ============================================================
  const validateAllFields = (isEdit = false) => {
    const errors = {};
    const errorList = [];
    
    // Basic validation - Mandatory as per BRD
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
    
    // Health validation - Mandatory as per BRD
    if (showHealthSection) {
      // Policy Type is mandatory
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
      
      // Aadhaar validation - 12 digits only
      if (healthDetails.aadhaarNumber && !validateAadhaar(healthDetails.aadhaarNumber)) {
        errors.aadhaar = "Aadhaar must be exactly 12 digits";
        errorList.push({ field: "aadhaarNumber", message: "Aadhaar must be exactly 12 digits" });
      }
      
      // PAN validation - Format: ABCDE1234F
      if (healthDetails.panNumber && !validatePAN(healthDetails.panNumber)) {
        errors.pan = "PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)";
        errorList.push({ field: "panNumber", message: "PAN format: ABCDE1234F" });
      }
      
      // DOB validation - No future dates
      if (healthDetails.seniorOneDOB) {
        const dob = new Date(healthDetails.seniorOneDOB);
        const today = new Date();
        if (dob > today) {
          errors.seniorDOB = "DOB cannot be in the future";
          errorList.push({ field: "seniorOneDOB", message: "DOB cannot be in the future" });
        }
      }
      if (healthDetails.proposerDOB) {
        const dob = new Date(healthDetails.proposerDOB);
        const today = new Date();
        if (dob > today) {
          errors.proposerDOB = "DOB cannot be in the future";
          errorList.push({ field: "proposerDOB", message: "DOB cannot be in the future" });
        }
      }
      if (healthDetails.nomineeDOB) {
        const dob = new Date(healthDetails.nomineeDOB);
        const today = new Date();
        if (dob > today) {
          errors.nomineeDOB = "DOB cannot be in the future";
          errorList.push({ field: "nomineeDOB", message: "DOB cannot be in the future" });
        }
      }
      
      // Previous Policy validation
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
      if (!motorDetails.registrationNumber) {
        errors.registration = "Registration number is required";
        errorList.push({ field: "registrationNumber", message: "Registration number is required" });
      }
      if (!motorDetails.insuranceType) {
        errors.insuranceType = "Insurance type is required";
        errorList.push({ field: "insuranceType", message: "Insurance type is required" });
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

  // ============================================================
  // SCROLL TO ERROR FIELD
  // ============================================================
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
  // CREATE LEAD
  // ============================================================
  const handleCreateLead = async (e) => {
    e.preventDefault();
    
    if (!validateAllFields(false)) {
      return;
    }
    
    setIsSubmitting(true);

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
    submitData.append("status", "Open");
    submitData.append("policyTenure", formData.policyTenure);
    submitData.append("paymentTerm", formData.paymentTerm);
    submitData.append("sumInsured", formData.sumInsured);
    
    if (showHealthSection) {
      const healthData = { ...healthDetails };
      healthData.proposerName = formData.name;
      if (healthData.members) {
        healthData.members = healthData.members.map(member => ({
          ...member,
          riderDetails: member.riderDetails || {
            instaShield: '',
            asthma: '',
            diabetes: '',
            hypertension: '',
            hyperlipidaemia: '',
          }
        }));
      }
      submitData.append("healthDetails", JSON.stringify(healthData));
    }

    if (showMotorSection) {
      submitData.append("motorDetails", JSON.stringify(motorDetails));
    }

    if (showElectronicSection) {
      submitData.append("electronicDetails", JSON.stringify(electronicDetails));
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (res.ok) {
        const savedLead = await res.json();
        setLeads((prev) => [savedLead, ...prev]);
        resetForm();
        setShowLeadForm(false);
        alert("Lead created successfully!");
      } else {
        const error = await res.json();
        const errorMsg = error.error || error.message || "Unknown error";
        setValidationPopup({
          show: true,
          errors: [{ field: "general", message: errorMsg }]
        });
      }
    } catch (err) {
      console.error("Create error:", err);
      setValidationPopup({
        show: true,
        errors: [{ field: "general", message: "Error: " + err.message }]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // UPDATE LEAD
  // ============================================================
  const handleUpdateLead = async (e) => {
    e.preventDefault();
    
    if (!validateAllFields(true)) {
      return;
    }
    
    setIsSubmitting(true);

    const submitData = new FormData();
    
    submitData.append("name", editLead?.name || formData.name);
    submitData.append("email", editLead?.email || formData.email);
    submitData.append("mobileNo", editLead?.mobileNo || formData.mobileNo);
    submitData.append("gender", editLead?.gender || formData.gender);
    submitData.append("source", editLead?.source || formData.source);
    submitData.append("remarks", editLead?.remarks || formData.remarks);
    submitData.append("lob", editLead?.lob || formData.lob);
    submitData.append("pinCode", editLead?.pinCode || formData.pinCode);
    submitData.append("state", editLead?.state || formData.state);
    submitData.append("city", editLead?.city || formData.city);
    submitData.append("sourceDependentValue", editLead?.sourceDependentValue || formData.sourceDependentValue);
    submitData.append("policyTenure", editLead?.policyTenure || formData.policyTenure);
    submitData.append("paymentTerm", editLead?.paymentTerm || formData.paymentTerm);
    submitData.append("sumInsured", editLead?.sumInsured || formData.sumInsured);
    
    submitData.append("status", workflowDetails.status);
    submitData.append("workflowDetails", JSON.stringify(workflowDetails));
    
    if (showHealthSection) {
      const healthData = { ...healthDetails };
      healthData.proposerName = formData.name;
      if (healthData.members) {
        healthData.members = healthData.members.map(member => ({
          ...member,
          riderDetails: member.riderDetails || {
            instaShield: '',
            asthma: '',
            diabetes: '',
            hypertension: '',
            hyperlipidaemia: '',
          }
        }));
      }
      submitData.append("healthDetails", JSON.stringify(healthData));
    }

    if (showMotorSection) {
      submitData.append("motorDetails", JSON.stringify(motorDetails));
    }

    if (showElectronicSection) {
      submitData.append("electronicDetails", JSON.stringify(electronicDetails));
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/leads/${editLead._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (res.ok) {
        const updatedLead = await res.json();
        setLeads((prev) => prev.map((l) => l._id === updatedLead._id ? updatedLead : l));
        setShowEditModal(false);
        setEditLead(null);
        alert("Lead updated successfully!");
      } else {
        const error = await res.json();
        setValidationPopup({
          show: true,
          errors: [{ field: "general", message: error.error || error.message || "Update failed" }]
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      setValidationPopup({
        show: true,
        errors: [{ field: "general", message: "Error: " + err.message }]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================
  const openEditModal = (lead) => {
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
    
    setWorkflowDetails({
      status: lead.status || lead.workflowDetails?.status || "Open",
      quoteNumber: lead.quoteNumber || lead.workflowDetails?.quoteNumber || "",
      selectedInsurers: lead.selectedInsurers || lead.workflowDetails?.selectedInsurers || [],
      insurerQuotes: lead.insurerQuotes || lead.workflowDetails?.insurerQuotes || [],
      paymentStatus: lead.paymentStatus || lead.workflowDetails?.paymentStatus || "",
      paymentUrl: lead.paymentUrl || lead.workflowDetails?.paymentUrl || "",
      utrNumber: lead.utrNumber || lead.workflowDetails?.utrNumber || "",
      paymentSnapshot: lead.paymentSnapshot || lead.workflowDetails?.paymentSnapshot || null,
      policyNumber: lead.policyNumber || lead.workflowDetails?.policyNumber || "",
      policyIssuedOn: lead.policyIssuedOn || lead.workflowDetails?.policyIssuedOn || "",
      policyStartDate: lead.policyStartDate || lead.workflowDetails?.policyStartDate || "",
      policyExpiryDate: lead.policyExpiryDate || lead.workflowDetails?.policyExpiryDate || "",
      policyCopy: lead.policyCopy || lead.workflowDetails?.policyCopy || null,
      remarks: lead.remarks || lead.workflowDetails?.workflowRemarks || "",
    });
    
    setShowInsurerQuotes(lead.status === "Quotation Generated" || lead.workflowDetails?.status === "Quotation Generated");
    setShowEditModal(true);
  };

  // ============================================================
  // FORM RESET
  // ============================================================
  const resetForm = () => {
    setFormData({
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
    setHealthDetails({
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
    setMotorDetails({
      vehicleType: "",
      insuranceType: "",
      registrationNumber: "",
      rtoCode: "",
      previousPolicyStatus: "",
      previousInsurer: "",
      pypDueDate: "",
      idvAsPerPYP: "",
      claimTaken: "",
      ncb: "",
      addOnRequired: "",
      quoteRequired: "",
      pypFile: null,
      rcFrontFile: null,
      rcBackFile: null,
    });
    setElectronicDetails({
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
    setShowHealthSection(false);
    setShowMotorSection(false);
    setShowElectronicSection(false);
    setShowFloaterMembers(false);
    setShowSeniorOneDOB(false);
    setShowPreviousPolicyPopup(false);
    setShowPortabilityFields(false);
    setShowRenewalFields(false);
    setShowFreshCaseFields(false);
    setPinFetchError("");
    setIsFetchingPin(false);
    setValidationErrors({});
    setValidationPopup({ show: false, errors: [] });
  };

  // ============================================================
  // TOGGLE FILTERS
  // ============================================================
  const toggleSourceFilter = (key) => {
    setSourceFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearFilters = () => {
    setGlobalSearch("");
    setSourceFilters({
      employees: false,
      stores: false,
      channelPartners: false,
      socialMedia: false,
      directSource: false,
    });
  };

  // ============================================================
  // RENDER: RENEWAL ALERTS
  // ============================================================
  const renderRenewalAlerts = () => {
    if (renewalAlerts.length === 0) return null;

    const groupedAlerts = {
      expired: renewalAlerts.filter(a => a.priority === "Expired"),
      urgent: renewalAlerts.filter(a => a.priority === "Urgent"),
      priority: renewalAlerts.filter(a => a.priority === "Priority"),
      normal: renewalAlerts.filter(a => a.priority === "Normal"),
    };

    const getPriorityColor = (priority) => {
      switch (priority) {
        case "Expired": return "bg-red-100 border-red-500 text-red-800";
        case "Urgent": return "bg-orange-100 border-orange-500 text-orange-800";
        case "Priority": return "bg-yellow-100 border-yellow-500 text-yellow-800";
        default: return "bg-blue-100 border-blue-500 text-blue-800";
      }
    };

    const getIcon = (priority) => {
      switch (priority) {
        case "Expired": return <FaExclamationTriangle className="text-red-500" />;
        case "Urgent": return <FaClock className="text-orange-500" />;
        case "Priority": return <FaClock className="text-yellow-500" />;
        default: return <FaBell className="text-blue-500" />;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <FaBell className="text-indigo-600 h-5 w-5" />
          <h3 className="text-lg font-semibold text-gray-800">Renewal Alerts</h3>
          <span className="ml-auto bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
            {renewalAlerts.length} pending
          </span>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {groupedAlerts.expired.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600">⚠️ Expired Policies</h4>
              {groupedAlerts.expired.map((alert, idx) => (
                <div key={idx} className={`border-l-4 p-3 rounded-r-lg ${getPriorityColor(alert.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{alert.customerName}</p>
                      <p className="text-sm">Policy: {alert.policyNumber}</p>
                      <p className="text-sm">Expired {Math.abs(alert.daysLeft)} days ago</p>
                    </div>
                    {getIcon(alert.priority)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {groupedAlerts.urgent.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-orange-600">🔴 Urgent (Due in 7 days)</h4>
              {groupedAlerts.urgent.map((alert, idx) => (
                <div key={idx} className={`border-l-4 p-3 rounded-r-lg ${getPriorityColor(alert.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{alert.customerName}</p>
                      <p className="text-sm">Policy: {alert.policyNumber}</p>
                      <p className="text-sm">Due in {alert.daysLeft} days</p>
                    </div>
                    {getIcon(alert.priority)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {groupedAlerts.priority.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-yellow-600">🟡 Priority (Due in 15 days)</h4>
              {groupedAlerts.priority.map((alert, idx) => (
                <div key={idx} className={`border-l-4 p-3 rounded-r-lg ${getPriorityColor(alert.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{alert.customerName}</p>
                      <p className="text-sm">Policy: {alert.policyNumber}</p>
                      <p className="text-sm">Due in {alert.daysLeft} days</p>
                    </div>
                    {getIcon(alert.priority)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {groupedAlerts.normal.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-600">🔵 Upcoming (Due in 30 days)</h4>
              {groupedAlerts.normal.map((alert, idx) => (
                <div key={idx} className={`border-l-4 p-3 rounded-r-lg ${getPriorityColor(alert.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{alert.customerName}</p>
                      <p className="text-sm">Policy: {alert.policyNumber}</p>
                      <p className="text-sm">Due in {alert.daysLeft} days</p>
                    </div>
                    {getIcon(alert.priority)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // ============================================================
  // RENDER: VALIDATION POPUP
  // ============================================================
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

  // ============================================================
  // RENDER: PREVIOUS POLICY POPUP
  // ============================================================
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

            {/* Fresh Case */}
            {showFreshCaseFields && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-700 text-sm">✓ Fresh Case selected - No previous policy details required.</p>
              </div>
            )}

            {/* Portability Case */}
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

            {/* Renewal Case */}
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

  // ============================================================
  // RENDER: HEALTH FORM - UPDATED with Active Previous Policy at top
  // ============================================================
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

        {/* ACTIVE PREVIOUS POLICY - NOW AT THE TOP */}
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

          {/* Proposer Details - Using Name from main form, no duplication */}
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

          {/* Aadhaar - 12 digits only */}
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

          {/* PAN - Format: ABCDE1234F */}
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

        {/* Floater Members */}
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
                  
                  {/* Rider Section */}
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

  // ============================================================
  // RENDER: MOTOR FORM
  // ============================================================
  const renderMotorForm = () => {
    const maxDate = getMaxDate();

    return (
      <div className="border-t-2 border-indigo-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaCar /> Motor Insurance Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
            <select
              data-field="vehicleType"
              value={motorDetails.vehicleType}
              onChange={(e) => setMotorDetails(prev => ({ ...prev, vehicleType: e.target.value }))}
              className={`w-full p-2 border rounded-lg ${validationErrors.vehicleType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select</option>
              {VEHICLE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.vehicleType && <p className="text-red-500 text-xs mt-1">{validationErrors.vehicleType}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Insurance Type</label>
            <select
              data-field="insuranceType"
              value={motorDetails.insuranceType}
              onChange={(e) => setMotorDetails(prev => ({ ...prev, insuranceType: e.target.value }))}
              className={`w-full p-2 border rounded-lg ${validationErrors.insuranceType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select</option>
              {INSURANCE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {validationErrors.insuranceType && <p className="text-red-500 text-xs mt-1">{validationErrors.insuranceType}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Registration Number</label>
            <input
              data-field="registrationNumber"
              type="text"
              value={motorDetails.registrationNumber}
              onChange={(e) => setMotorDetails(prev => ({ ...prev, registrationNumber: e.target.value.toUpperCase() }))}
              className={`w-full p-2 border rounded-lg uppercase ${validationErrors.registration ? 'border-red-500' : 'border-gray-300'}`}
            />
            {validationErrors.registration && <p className="text-red-500 text-xs mt-1">{validationErrors.registration}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">RTO Code</label>
            <input
              type="text"
              value={motorDetails.rtoCode}
              onChange={(e) => setMotorDetails(prev => ({ ...prev, rtoCode: e.target.value.toUpperCase() }))}
              placeholder="e.g., BR01"
              className="w-full p-2 border border-gray-300 rounded-lg uppercase"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Previous Policy Status</label>
            <select
              value={motorDetails.previousPolicyStatus}
              onChange={(e) => setMotorDetails(prev => ({ ...prev, previousPolicyStatus: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {motorDetails.previousPolicyStatus === "Active" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Previous Insurer</label>
                <select
                  value={motorDetails.previousInsurer}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, previousInsurer: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {INSURER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">PYP Due Date</label>
                <input
                  type="date"
                  max={maxDate}
                  value={motorDetails.pypDueDate}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, pypDueDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">IDV as per PYP</label>
                <input
                  type="number"
                  value={motorDetails.idvAsPerPYP}
                  onChange={(e) => setMotorDetails(prev => ({ ...prev, idvAsPerPYP: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Claim Taken?</label>
                <select
                  value={motorDetails.claimTaken}
                  onChange={(e) => {
                    setMotorDetails(prev => ({ ...prev, claimTaken: e.target.value }));
                    if (e.target.value === "Yes") {
                      setMotorDetails(prev => ({ ...prev, ncb: "NIL" }));
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              {motorDetails.claimTaken === "No" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">NCB</label>
                  <select
                    value={motorDetails.ncb}
                    onChange={(e) => setMotorDetails(prev => ({ ...prev, ncb: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    {NCB_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}
              {motorDetails.claimTaken === "Yes" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">NCB</label>
                  <input type="text" value="NIL" disabled className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100" />
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Add-On Required?</label>
            <select
              value={motorDetails.addOnRequired}
              onChange={(e) => setMotorDetails(prev => ({ ...prev, addOnRequired: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Quote Required?</label>
            <select
              value={motorDetails.quoteRequired}
              onChange={(e) => setMotorDetails(prev => ({ ...prev, quoteRequired: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Upload PYP</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setMotorDetails(prev => ({ ...prev, pypFile: e.target.files[0] }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">RC Front</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setMotorDetails(prev => ({ ...prev, rcFrontFile: e.target.files[0] }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">RC Back</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => setMotorDetails(prev => ({ ...prev, rcBackFile: e.target.files[0] }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
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
  // RENDER: WORKFLOW FORM (Edit Modal)
  // ============================================================
  const renderWorkflowForm = () => (
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
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {(workflowDetails.status === "Quotation Generated" || showInsurerQuotes) && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Quote Number</label>
              <input
                type="text"
                value={workflowDetails.quoteNumber}
                onChange={(e) => setWorkflowDetails(prev => ({ ...prev, quoteNumber: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="lg:col-span-3">
              <label className="text-sm font-medium text-gray-700">Select Insurers for Quote</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border p-2 rounded-lg max-h-40 overflow-y-auto">
                {INSURER_OPTIONS.slice(0, 10).map(ins => (
                  <label key={ins} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={workflowDetails.selectedInsurers?.includes(ins) || false}
                      onChange={(e) => {
                        const current = workflowDetails.selectedInsurers || [];
                        let updated;
                        if (e.target.checked) {
                          updated = [...current, ins];
                        } else {
                          updated = current.filter(i => i !== ins);
                        }
                        setWorkflowDetails(prev => ({ ...prev, selectedInsurers: updated }));
                      }}
                    />
                    {ins}
                  </label>
                ))}
              </div>
            </div>
            {workflowDetails.selectedInsurers?.length > 0 && (
              <div className="lg:col-span-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Insurer-wise Quotes</h5>
                {workflowDetails.selectedInsurers.map((insurer, idx) => (
                  <div key={idx} className="border rounded-lg p-3 mb-3 bg-gray-50">
                    <h6 className="font-medium text-indigo-600">{insurer}</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Upload Quote</label>
                        <input type="file" accept=".pdf,.jpg,.jpeg" className="w-full p-1 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Premium Amount</label>
                        <input type="number" className="w-full p-1 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Payment Mode</label>
                        <select className="w-full p-1 border rounded text-sm">
                          <option value="">Select</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Half Quarterly">Half Quarterly</option>
                          <option value="Half Yearly">Half Yearly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Final Discount</label>
                        <input type="number" className="w-full p-1 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Payable Amount</label>
                        <input type="text" readOnly className="w-full p-1 border rounded bg-gray-100 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">Payment Status</label>
          <select
            value={workflowDetails.paymentStatus}
            onChange={(e) => setWorkflowDetails(prev => ({ ...prev, paymentStatus: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {PAYMENT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {workflowDetails.paymentStatus === "URL Shared" && (
          <div className="lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">Payment URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={workflowDetails.paymentUrl}
                onChange={(e) => setWorkflowDetails(prev => ({ ...prev, paymentUrl: e.target.value }))}
                className="flex-1 p-2 border border-gray-300 rounded-lg"
                placeholder="https://payment.link/..."
              />
              {workflowDetails.paymentUrl && (
                <a href={workflowDetails.paymentUrl} target="_blank" rel="noopener noreferrer" 
                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <FaLink /> Open
                </a>
              )}
            </div>
          </div>
        )}

        {workflowDetails.paymentStatus === "Payment Done" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">UTR Number</label>
              <input
                type="text"
                value={workflowDetails.utrNumber}
                onChange={(e) => setWorkflowDetails(prev => ({ ...prev, utrNumber: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Upload Payment Snapshot</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg"
                onChange={(e) => setWorkflowDetails(prev => ({ ...prev, paymentSnapshot: e.target.files[0] }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}

        {workflowDetails.paymentStatus === "Policy Issued" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Number</label>
              <input
                type="text"
                value={workflowDetails.policyNumber}
                onChange={(e) => setWorkflowDetails(prev => ({ ...prev, policyNumber: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Issued On</label>
              <input
                type="date"
                value={workflowDetails.policyIssuedOn}
                onChange={(e) => setWorkflowDetails(prev => ({ ...prev, policyIssuedOn: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Start Date</label>
              <input
                type="date"
                value={workflowDetails.policyStartDate}
                onChange={(e) => setWorkflowDetails(prev => ({ ...prev, policyStartDate: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Expiry Date</label>
              <input
                type="date"
                value={workflowDetails.policyExpiryDate}
                onChange={(e) => setWorkflowDetails(prev => ({ ...prev, policyExpiryDate: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Upload Policy Copy</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setWorkflowDetails(prev => ({ ...prev, policyCopy: e.target.files[0] }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}

        <div className="lg:col-span-3">
          <label className="text-sm font-medium text-gray-700">Remarks</label>
          <textarea
            value={workflowDetails.remarks}
            onChange={(e) => setWorkflowDetails(prev => ({ ...prev, remarks: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: LEAD FORM MODAL
  // ============================================================
  const renderLeadFormModal = () => {
    const hasErrors = Object.keys(validationErrors).length > 0;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={() => setShowLeadForm(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-6xl max-h-[90vh] overflow-y-auto w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaUserPlus className="text-indigo-600" /> Add New Lead
            </h2>
            <button onClick={() => setShowLeadForm(false)} className="text-gray-500 hover:text-gray-700">
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

          <form onSubmit={handleCreateLead}>
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
                  placeholder="Enter name in UPPERCASE"
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
                {formData.mobileNo && !validateMobile(formData.mobileNo) && (
                  <p className="text-red-500 text-xs mt-1">Enter 10 digits</p>
                )}
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
                {formData.email && !validateEmail(formData.email) && (
                  <p className="text-red-500 text-xs mt-1">Invalid email format</p>
                )}
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
                {formData.pinCode && !validatePIN(formData.pinCode) && formData.pinCode.length === 6 && (
                  <p className="text-red-500 text-xs mt-1">{pinFetchError || "Invalid PIN code"}</p>
                )}
                {formData.pinCode && validatePIN(formData.pinCode) && formData.state && (
                  <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                    <FaCheck className="h-3 w-3" /> {formData.city}, {formData.state}
                  </p>
                )}
                {formData.pinCode && validatePIN(formData.pinCode) && !formData.state && !isFetchingPin && (
                  <p className="text-yellow-500 text-xs mt-1">Fetching location...</p>
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
                  placeholder="Auto-fetched from PIN"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="Auto-fetched from PIN"
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
                  <input
                    type="text"
                    value={formData.sourceDependentValue}
                    onChange={(e) => setFormData({ ...formData, sourceDependentValue: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div className="lg:col-span-3">
                <label className="text-sm font-medium text-gray-700">Discussed with Customer Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows="2"
                  placeholder="Enter customer remarks..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">LOB <span className="text-red-500">*</span></label>
                <select
                  name="lob"
                  value={formData.lob}
                  onChange={(e) => setFormData({ ...formData, lob: e.target.value })}
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
              <button type="button" onClick={() => setShowLeadForm(false)} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? "Creating..." : <><FaCheck /> Create Lead</>}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  // ============================================================
  // RENDER: EDIT MODAL
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

          <form onSubmit={handleUpdateLead}>
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
                  <input
                    type="text"
                    value={formData.sourceDependentValue}
                    onChange={(e) => setFormData({ ...formData, sourceDependentValue: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
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
  // RENDER: LEAD DETAILS VIEW
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
                  <div>RTO: {selectedLead.motorDetails.rtoCode || "-"}</div>
                  <div>NCB: {selectedLead.motorDetails.ncb || "-"}</div>
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
  // MAIN RENDER
  // ============================================================
  return (
    <div className="space-y-4 p-4">
      {uploadStatus.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${uploadStatus.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {uploadStatus.type === "success" ? "✓ " : "✗ "}{uploadStatus.message}
        </motion.div>
      )}

      {renderRenewalAlerts()}

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => setShowLeadForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <FaUserPlus /> Add New Lead
          </button>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2"
          >
            <FaDownload /> Download Template
          </button>
          <button
            onClick={downloadExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <FaFileExcel /> Export Excel
          </button>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-2">
            <FaUpload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Excel"}
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" ref={fileInputRef} disabled={isUploading} />
          </label>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Universal Search: Policy Number, Lead Code, Mobile, Email, Quote Number..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
            />
          </div>
        </div>

        <div className="relative" ref={filterDropdownRef}>
          <button
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <FaFilter /> Advanced Filters
            {Object.values(sourceFilters).some(v => v) && " (Active)"}
          </button>

          {filterDropdownOpen && (
            <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Filter by Source</h4>
              <div className="space-y-2">
                {[
                  { key: "employees", label: "Employees" },
                  { key: "stores", label: "Stores" },
                  { key: "channelPartners", label: "Channel Partners" },
                  { key: "socialMedia", label: "Social Media" },
                  { key: "directSource", label: "Direct Source" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sourceFilters[key]}
                      onChange={() => toggleSourceFilter(key)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
              {Object.values(sourceFilters).some(v => v) && (
                <button onClick={clearFilters} className="mt-4 text-xs text-red-600 hover:text-red-800 w-full text-center">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredLeads.length} of {leads.length} leads
            {globalSearch && ` | Search: "${globalSearch}"`}
          </p>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full table-auto min-w-full">
            <thead>
              <tr className="bg-gray-100 text-left text-xs">
                <th className="p-3">Lead Code</th>
                <th className="p-3">Name</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Email</th>
                <th className="p-3">Policy #</th>
                <th className="p-3">LOB</th>
                <th className="p-3">Source</th>
                <th className="p-3">Status</th>
                <th className="p-3">Tenure</th>
                <th className="p-3">Sum Insured</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead._id} className="border-b hover:bg-gray-50 text-xs">
                  <td className="p-3 font-mono text-indigo-600">{lead.leadCode || "N/A"}</td>
                  <td className="p-3 font-medium">{lead.name}</td>
                  <td className="p-3">{lead.mobileNo}</td>
                  <td className="p-3">{lead.email || "-"}</td>
                  <td className="p-3">{lead.policyNumber || "-"}</td>
                  <td className="p-3">{lead.lob || "-"}</td>
                  <td className="p-3">{lead.source || "-"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      lead.status === "Open" ? "bg-yellow-100 text-yellow-800" :
                      lead.status === "Quotation Generated" ? "bg-blue-100 text-blue-800" :
                      lead.status === "Payment Link Generated" ? "bg-purple-100 text-purple-800" :
                      lead.status === "Payment Done" ? "bg-green-100 text-green-800" :
                      lead.status === "Policy Issued" ? "bg-emerald-100 text-emerald-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-3">{lead.policyTenure || "-"}</td>
                  <td className="p-3">{lead.sumInsured || "-"}</td>
                  <td className="p-3 flex gap-2 items-center">
                    <button onClick={() => setSelectedLead(lead)} className="text-indigo-600 hover:text-indigo-800">
                      <FaEye className="h-5 w-5" />
                    </button>
                    <button onClick={() => openEditModal(lead)} className="text-blue-600 hover:text-blue-800">
                      <FaEdit className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="block lg:hidden p-4 space-y-4">
          {filteredLeads.map((lead) => (
            <div key={lead._id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
              <div className="space-y-2 text-sm">
                <div><strong>Lead Code:</strong> <span className="font-mono text-indigo-600">{lead.leadCode || "N/A"}</span></div>
                <div><strong>Name:</strong> {lead.name}</div>
                <div><strong>Mobile:</strong> {lead.mobileNo}</div>
                <div><strong>Email:</strong> {lead.email || "-"}</div>
                <div><strong>Policy #:</strong> {lead.policyNumber || "-"}</div>
                <div><strong>LOB:</strong> {lead.lob || "-"}</div>
                <div><strong>Source:</strong> {lead.source || "-"}</div>
                <div><strong>Tenure:</strong> {lead.policyTenure || "-"}</div>
                <div><strong>Sum Insured:</strong> {lead.sumInsured || "-"}</div>
                <div><strong>Status:</strong> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    lead.status === "Open" ? "bg-yellow-100 text-yellow-800" :
                    lead.status === "Policy Issued" ? "bg-emerald-100 text-emerald-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>{lead.status}</span>
                </div>
                <div className="pt-2 flex gap-3">
                  <button onClick={() => setSelectedLead(lead)} className="text-indigo-600"><FaEye className="h-5 w-5" /></button>
                  <button onClick={() => openEditModal(lead)} className="text-blue-600"><FaEdit className="h-5 w-5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FaSearch className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>No leads found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {showLeadForm && renderLeadFormModal()}
      {showEditModal && renderEditModal()}
      {selectedLead && renderLeadDetails()}
    </div>
  );
}

export default LeadTable;