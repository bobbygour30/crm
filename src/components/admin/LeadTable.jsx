import { motion } from "framer-motion";
import {
  FaEye,
  FaEdit,
  FaSave,
  FaTimes,
  FaTrash,
  FaFilePdf,
  FaDownload,
  FaCalendarAlt,
  FaSearch,
  FaUpload,
  FaFilter,
  FaFileExcel,
  FaUser,
  FaUsers,
  FaCar,
  FaMobileAlt,
  FaHeartbeat,
  FaFileAlt,
  FaLink,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaBell,
} from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

function LeadTable({ filter, setFilter, setSelectedLead }) {
  // ========== CONSTANTS ==========
  const lobOptions = [
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

  const insurerOptions = [
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

  const agencyOptions = [
    "EKRAMUL HAQUE",
    "ARSHYAN INSURANCE",
    "RUHI",
    "NARGISH TARANNUM",
    "NEHA KHATOON",
    "MOINA KHATOON",
    "SHARMEEN KHATOON",
    "NEYAZ AHMED",
    "PIYUSH KUMAR",
    "DEEPAK KUMAR",
    "OTHERS",
  ];

  const gstOptions = [0, 5, 12, 18];
  
  const sourceOptions = [
    "Employee",
    "Channel Partner",
    "Direct Client",
    "Social Media",
    "Store",
    "Other",
  ];

  const genderOptions = ["Male", "Female", "Other"];
  const statusOptions = ["Open", "Quotation Generated", "Payment Link Generated", "Payment Done", "Policy Issued"];
  const paymentStatusOptions = ["Quote Under Discussion", "URL Shared", "Payment Done", "e-Mandate Status Pending", "e-Mandate Status Done", "Policy Issued"];
  const policyTypeOptions = ["Individual", "Floater"];
  const qualificationOptions = ["10th", "12th", "Graduate", "Post Graduate", "Professional", "Other"];
  const occupationOptions = ["Salaried", "Business", "Professional", "Student", "Retired", "Housewife", "Other"];
  const relationshipOptions = ["Self", "Spouse", "Child", "Parent", "Sibling", "Other"];
  const yesNoOptions = ["Yes", "No"];
  const ncbOptions = ["0%", "20%", "25%", "35%", "45%", "50%"];
  const vehicleTypeOptions = [
    "Two Wheeler",
    "Private Car",
    "Taxi",
    "Commercial Vehicle",
  ];
  const insuranceTypeOptions = ["Comprehensive", "TP", "SAOD"];
  const previousPolicyStatusOptions = ["Active", "Expired"];
  const deviceTypeOptions = ["Mobile", "Tablet", "Laptop", "Other"];

  // ========== STATE ==========
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showLeadDropdowns, setShowLeadDropdowns] = useState({});
  const [showCustomAgency, setShowCustomAgency] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFormDropdown, setShowFormDropdown] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [sourceFilters, setSourceFilters] = useState({
    employees: false,
    stores: false,
    channelPartners: false,
    socialMedia: false,
    directSource: false,
  });
  const [activeFilters, setActiveFilters] = useState([]);
  const [filteredLeadsData, setFilteredLeadsData] = useState([]);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ show: false, message: "", type: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [editSelectedUsers, setEditSelectedUsers] = useState([]);
  const [showEditCustomAgency, setShowEditCustomAgency] = useState(false);
  const [showEditFormDropdown, setShowEditFormDropdown] = useState(false);
  
  // Health Insurance Specific States
  const [healthDetails, setHealthDetails] = useState({
    policyType: "",
    numberOfAdults: 0,
    numberOfChildren: 0,
    proposerName: "",
    proposerDOB: "",
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
    previousInsurer: "",
    previousPolicyNumber: "",
    previousPolicyDueDate: "",
    previousPolicyFile: null,
    medicalRemarks: "",
    members: [],
  });

  // Motor Insurance Specific States
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
    selectedInsurers: [],
    pypFile: null,
    rcFrontFile: null,
    rcBackFile: null,
  });

  // Mobile/Electronic Insurance Specific States
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

  // Workflow Management States
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

  // Edit Modal States
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    gender: "",
    source: "",
    reference: "",
    status: "Open",
    openStatus: "",
    policyNumber: "",
    lobOption: "",
    lobCustom: "",
    sumInsured: 0,
    endorsement: "",
    payoutPercent: 0,
    payoutStatus: "",
    additionalPayout: 0,
    netPremium: 0,
    gstPercent: 0,
    policyStartDate: "",
    policyExpiryDate: "",
    insurer: "",
    remarks: "",
    assignedTo: [],
    agency: "",
    customAgency: "",
    policyPdf: null,
    newPolicyPdf: null,
    imageUrl: "",
    healthDetails: {},
    motorDetails: {},
    electronicDetails: {},
    workflowDetails: {},
  });

  // Lead Form States
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    mobileNo: "",
    gender: "",
    source: "",
    reference: "",
    status: "Open",
    openStatus: "",
    policyNumber: "",
    lobOption: "",
    lobCustom: "",
    sumInsured: 0,
    endorsement: "",
    payoutPercent: 0,
    payoutStatus: "",
    additionalPayout: 0,
    netPremium: 0,
    gstPercent: 0,
    policyStartDate: "",
    policyExpiryDate: "",
    insurer: "",
    remarks: "",
    assignedTo: [],
    agency: "",
    customAgency: "",
    policyPdf: null,
    imageUrl: "",
    healthDetails: {},
    motorDetails: {},
    electronicDetails: {},
  });

  const [formStep, setFormStep] = useState(1);
  const [showHealthSection, setShowHealthSection] = useState(false);
  const [showMotorSection, setShowMotorSection] = useState(false);
  const [showElectronicSection, setShowElectronicSection] = useState(false);
  const [showFloaterMembers, setShowFloaterMembers] = useState(false);
  const [showWorkflowSection, setShowWorkflowSection] = useState(false);
  const [showInsurerQuotes, setShowInsurerQuotes] = useState(false);

  const formDropdownRef = useRef(null);
  const editFormDropdownRef = useRef(null);
  const leadDropdownRefs = useRef({});
  const fileInputRef = useRef(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  // ========== REFS ==========
  const filterDropdownRef = useRef(null);

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchLeads();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    let filtered = [...leads];
    if (globalSearch.trim()) {
      const searchTerm = globalSearch.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          (lead.policyNumber && lead.policyNumber.toLowerCase().includes(searchTerm)) ||
          (lead.leadCode && lead.leadCode.toLowerCase().includes(searchTerm)) ||
          (lead.mobileNo && lead.mobileNo.includes(searchTerm)) ||
          (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
          (lead.quoteNumber && lead.quoteNumber.toLowerCase().includes(searchTerm))
      );
    }
    const sourceFiltersActive = [];
    if (sourceFilters.employees) sourceFiltersActive.push("Employee");
    if (sourceFilters.stores) sourceFiltersActive.push("Store");
    if (sourceFilters.channelPartners) sourceFiltersActive.push("Channel Partner");
    if (sourceFilters.socialMedia) sourceFiltersActive.push("Social Media");
    if (sourceFilters.directSource) sourceFiltersActive.push("Direct Source");
    if (sourceFiltersActive.length > 0) {
      filtered = filtered.filter((lead) => sourceFiltersActive.includes(lead.source));
    }
    setFilteredLeadsData(filtered);
  }, [leads, globalSearch, sourceFilters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formDropdownRef.current && !formDropdownRef.current.contains(event.target)) {
        setShowFormDropdown(false);
      }
      if (editFormDropdownRef.current && !editFormDropdownRef.current.contains(event.target)) {
        setShowEditFormDropdown(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
      Object.entries(leadDropdownRefs.current).forEach(([leadId, ref]) => {
        if (ref && !ref.contains(event.target)) {
          setShowLeadDropdowns((prev) => ({ ...prev, [leadId]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ========== API CALLS ==========
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
        setFilteredLeadsData(data);
      }
    } catch (err) {
      console.error("Fetch leads error:", err);
    }
  };

  const fetchAllUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  // ========== HELPERS ==========
  const generateLeadCode = () => {
    const lastLead = leads[0];
    let lastNumber = 0;
    if (lastLead && lastLead.leadCode) {
      const match = lastLead.leadCode.match(/LEAD-(\d+)/);
      if (match) lastNumber = parseInt(match[1]);
    }
    const newNumber = lastNumber + 1;
    return `LEAD-${String(newNumber).padStart(5, "0")}`;
  };

  const normalizeAssignedTo = (assignedTo) => {
    if (Array.isArray(assignedTo)) return assignedTo.map((id) => (typeof id === "object" ? id._id : id));
    if (!assignedTo) return [];
    return [typeof assignedTo === "object" ? assignedTo._id : assignedTo];
  };

  const clampPercent = (val) => {
    let n = parseFloat(val);
    if (isNaN(n)) return 0;
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    return Math.round(n);
  };

  const formatCurrency = (value) => {
    const v = parseFloat(value) || 0;
    return v.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const computePayoutValue = (netPremium, payoutPercent) => {
    const net = parseFloat(netPremium) || 0;
    const pct = parseFloat(payoutPercent) || 0;
    return (net * pct) / 100;
  };

  const computeGSTAmount = (amount, gstPercent) => {
    const a = parseFloat(amount) || 0;
    const g = parseFloat(gstPercent) || 0;
    return (a * g) / 100;
  };

  const computeGrossPremium = (netPremium, gstPercent) => {
    const net = parseFloat(netPremium) || 0;
    const gstAmt = computeGSTAmount(net, gstPercent);
    return net + gstAmt;
  };

  const computeTotalPayment = (payoutValue, additionalPayout) => {
    const payout = parseFloat(payoutValue) || 0;
    const additional = parseFloat(additionalPayout) || 0;
    return payout + additional;
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.username || user.name || "Unknown" : "Unknown";
  };

  const toUpperCase = (value) => {
    return value ? value.toUpperCase() : value;
  };

  const validateMobile = (mobile) => {
    return /^[0-9]{10}$/.test(mobile);
  };

  const validateAadhaar = (aadhaar) => {
    return /^[0-9]{12}$/.test(aadhaar);
  };

  const validatePAN = (pan) => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  };

  const validatePIN = (pin) => {
    return /^[0-9]{6}$/.test(pin);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ========== BULK UPLOAD ==========
  const downloadTemplate = () => {
    const templateData = [{
      name: "JOHN DOE",
      email: "john@example.com",
      mobileNo: "9876543210",
      gender: "Male",
      source: "Employee",
      reference: "Referral",
      status: "Open",
      policyNumber: "POL123456",
      lob: "Health Insurance",
      sumInsured: 500000,
      netPremium: 15000,
      gst: 18,
      payout: 10,
      additionalPayout: 500,
      insurer: "Bajaj Allianz General Insurance Co Ltd",
      agency: "EKRAMUL HAQUE",
      policyStartDate: "2025-01-01",
      policyExpiryDate: "2026-01-01",
      remarks: "Test lead",
    }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LeadTemplate");
    XLSX.writeFile(wb, "lead_upload_template.xlsx");
  };

  const downloadExcel = () => {
    if (filteredLeadsData.length === 0) {
      alert("No leads data to export!");
      return;
    }
    const exportData = filteredLeadsData.map((lead) => ({
      "Lead Code": lead.leadCode || "",
      Name: lead.name || "",
      Email: lead.email || "",
      "Mobile No": lead.mobileNo || "",
      Gender: lead.gender || "",
      Source: lead.source || "",
      Reference: lead.reference || "",
      Status: lead.status || "",
      "Policy Number": lead.policyNumber || "",
      LOB: lead.lob || "",
      "Sum Insured": lead.sumInsured || 0,
      "Net Premium": lead.netPremium || 0,
      "GST %": lead.gst || 0,
      "Gross Premium": lead.grossPremium || 0,
      "Payout %": lead.payout || 0,
      "Payout Value": lead.payoutValue || 0,
      "Additional Payout": lead.additionalPayout || 0,
      "Total Payment": lead.totalPayment || 0,
      "Payout Status": lead.payoutStatus || "",
      "Policy Start Date": lead.policyStartDate || "",
      "Policy Expiry Date": lead.policyExpiryDate || "",
      Insurer: lead.insurer || "",
      Agency: lead.agency || "",
      Remarks: lead.remarks || "",
      "Assigned To": Array.isArray(lead.assignedTo) ? lead.assignedTo.map(id => getUserName(id)).join(", ") : "",
      "Created At": lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const colWidths = [];
    const headers = Object.keys(exportData[0]);
    headers.forEach((header, index) => {
      let maxWidth = header.length;
      exportData.forEach((row) => {
        const value = String(row[header] || "");
        maxWidth = Math.max(maxWidth, value.length);
      });
      colWidths[index] = { wch: Math.min(Math.max(maxWidth + 2, 12), 50) };
    });
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LeadsData");
    XLSX.writeFile(wb, `leads_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const validateExcelData = (data) => {
    const errors = [];
    const requiredFields = ["name", "mobileNo"];
    const seenMobiles = new Set();
    const seenEmails = new Set();
    data.forEach((row, index) => {
      const rowErrors = [];
      requiredFields.forEach((field) => {
        if (!row[field] || row[field].toString().trim() === "") {
          rowErrors.push(`Missing ${field}`);
        }
      });
      if (row.mobileNo) {
        if (!validateMobile(row.mobileNo.toString())) {
          rowErrors.push("Invalid mobile number (10 digits required)");
        }
        if (seenMobiles.has(row.mobileNo)) {
          rowErrors.push(`Duplicate mobile number: ${row.mobileNo}`);
        }
        seenMobiles.add(row.mobileNo);
      }
      if (row.email) {
        if (!validateEmail(row.email)) {
          rowErrors.push("Invalid email format");
        }
        if (seenEmails.has(row.email)) {
          rowErrors.push(`Duplicate email: ${row.email}`);
        }
        seenEmails.add(row.email);
      }
      if (rowErrors.length > 0) {
        errors.push({ row: index + 2, errors: rowErrors });
      }
    });
    return errors;
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
        const validationErrors = validateExcelData(jsonData);
        if (validationErrors.length > 0) {
          let errorMessage = "Validation Errors:\n";
          validationErrors.forEach((err) => {
            errorMessage += `Row ${err.row}: ${err.errors.join(", ")}\n`;
          });
          setUploadStatus({ show: true, message: errorMessage, type: "error" });
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

  // ========== LOB DETECTION ==========
  const detectLOB = (lob) => {
    if (!lob) return;
    const isHealth = lob.toLowerCase().includes("health") || lob === "Mediclaim Health Insurance" || lob === "Group Health Insurance";
    const isMotor = lob.toLowerCase().includes("motor") || 
                    lob.includes("Car") || 
                    lob.includes("Two-Wheeler") || 
                    lob.includes("Taxi") || 
                    lob.includes("Commercial Vehicle") ||
                    lob.includes("E-Rikshaw");
    const isElectronic = lob.toLowerCase().includes("mobile") || 
                         lob.toLowerCase().includes("electronic") || 
                         lob.toLowerCase().includes("equipment");
    
    setShowHealthSection(isHealth);
    setShowMotorSection(isMotor);
    setShowElectronicSection(isElectronic);
    
    if (isHealth) {
      setFormStep(2);
    } else if (isMotor) {
      setFormStep(3);
    } else if (isElectronic) {
      setFormStep(4);
    }
  };

  // ========== HEALTH INSURANCE HANDLERS ==========
  const handleHealthChange = (field, value) => {
    setHealthDetails(prev => ({ ...prev, [field]: value }));
    if (field === "policyType" && value === "Floater") {
      setShowFloaterMembers(true);
    } else if (field === "policyType" && value === "Individual") {
      setShowFloaterMembers(false);
    }
  };

  const generateFloaterMembers = () => {
    const adults = parseInt(healthDetails.numberOfAdults) || 0;
    const children = parseInt(healthDetails.numberOfChildren) || 0;
    const members = [];
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
      });
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
      });
    }
    setHealthDetails(prev => ({ ...prev, members }));
  };

  // ========== MOTOR INSURANCE HANDLERS ==========
  const handleMotorChange = (field, value) => {
    setMotorDetails(prev => ({ ...prev, [field]: value }));
    if (field === "claimTaken" && value === "No") {
      // Show NCB dropdown
    } else if (field === "claimTaken" && value === "Yes") {
      setMotorDetails(prev => ({ ...prev, ncb: "NIL" }));
    }
  };

  // ========== ELECTRONIC INSURANCE HANDLERS ==========
  const handleElectronicChange = (field, value) => {
    setElectronicDetails(prev => ({ ...prev, [field]: value }));
  };

  // ========== WORKFLOW HANDLERS ==========
  const handleWorkflowChange = (field, value) => {
    setWorkflowDetails(prev => ({ ...prev, [field]: value }));
    if (field === "status") {
      if (value === "Quotation Generated") {
        setShowInsurerQuotes(true);
      } else {
        setShowInsurerQuotes(false);
      }
    }
    if (field === "paymentStatus") {
      if (value === "URL Shared") {
        // Show URL field
      } else if (value === "Payment Done") {
        // Show UTR and snapshot fields
      } else if (value === "Policy Issued") {
        // Show policy details fields
      }
    }
  };

  // ========== LEAD CRUD OPERATIONS ==========
  const handleAddLead = async (e) => {
    e.preventDefault();
    // Validate mobile
    if (!validateMobile(newLead.mobileNo)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    
    // Validate name is uppercase
    if (newLead.name !== newLead.name.toUpperCase()) {
      alert("Name must be in UPPERCASE");
      return;
    }

    const leadCode = generateLeadCode();
    const payoutValue = computePayoutValue(newLead.netPremium, newLead.payoutPercent);
    const grossPremium = computeGrossPremium(newLead.netPremium, newLead.gstPercent);
    const totalPayment = computeTotalPayment(payoutValue, newLead.additionalPayout);
    const finalLOB = newLead.lobOption === "Other Insurance" ? newLead.lobCustom || "" : newLead.lobOption;
    const finalAgency = newLead.agency === "OTHERS" ? newLead.customAgency || "" : newLead.agency;
    
    const formData = new FormData();
    formData.append("name", newLead.name);
    formData.append("email", newLead.email);
    formData.append("mobileNo", newLead.mobileNo);
    formData.append("gender", newLead.gender);
    formData.append("source", newLead.source);
    formData.append("reference", newLead.reference);
    formData.append("status", newLead.status);
    formData.append("openStatus", newLead.openStatus);
    formData.append("policyNumber", newLead.policyNumber);
    formData.append("lob", finalLOB);
    formData.append("sumInsured", newLead.sumInsured);
    formData.append("endorsement", newLead.endorsement);
    formData.append("payout", newLead.payoutPercent);
    formData.append("payoutValue", payoutValue);
    formData.append("netPremium", newLead.netPremium);
    formData.append("gst", newLead.gstPercent);
    formData.append("grossPremium", grossPremium);
    formData.append("additionalPayout", newLead.additionalPayout);
    formData.append("totalPayment", totalPayment);
    formData.append("payoutStatus", newLead.payoutStatus);
    formData.append("policyStartDate", newLead.policyStartDate);
    formData.append("policyExpiryDate", newLead.policyExpiryDate);
    formData.append("insurer", newLead.insurer);
    formData.append("remarks", newLead.remarks);
    formData.append("agency", finalAgency);
    formData.append("imageUrl", newLead.imageUrl);
    formData.append("leadCode", leadCode);
    
    // Health Insurance Details
    if (showHealthSection) {
      formData.append("healthDetails", JSON.stringify(healthDetails));
    }
    // Motor Insurance Details
    if (showMotorSection) {
      formData.append("motorDetails", JSON.stringify(motorDetails));
    }
    // Electronic Insurance Details
    if (showElectronicSection) {
      formData.append("electronicDetails", JSON.stringify(electronicDetails));
    }
    
    selectedUsers.forEach((userId) => formData.append("assignedTo", userId));
    if (newLead.policyPdf) {
      formData.append("policyPdf", newLead.policyPdf);
    }
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const savedLead = await res.json();
        setLeads((prev) => [savedLead, ...prev]);
        resetForm();
        setShowLeadForm(false);
        alert("Lead created successfully!");
      } else {
        const errorData = await res.json();
        alert(`Failed to save lead: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Create error:", err);
      alert("Error: " + err.message);
    }
  };

  const resetForm = () => {
    setNewLead({
      name: "",
      email: "",
      mobileNo: "",
      gender: "",
      source: "",
      reference: "",
      status: "Open",
      openStatus: "",
      policyNumber: "",
      lobOption: "",
      lobCustom: "",
      sumInsured: 0,
      endorsement: "",
      payoutPercent: 0,
      payoutStatus: "",
      additionalPayout: 0,
      netPremium: 0,
      gstPercent: 0,
      policyStartDate: "",
      policyExpiryDate: "",
      insurer: "",
      remarks: "",
      assignedTo: [],
      agency: "",
      customAgency: "",
      policyPdf: null,
      imageUrl: "",
      healthDetails: {},
      motorDetails: {},
      electronicDetails: {},
    });
    setSelectedUsers([]);
    setShowCustomAgency(false);
    setShowFormDropdown(false);
    setHealthDetails({
      policyType: "",
      numberOfAdults: 0,
      numberOfChildren: 0,
      proposerName: "",
      proposerDOB: "",
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
      previousInsurer: "",
      previousPolicyNumber: "",
      previousPolicyDueDate: "",
      previousPolicyFile: null,
      medicalRemarks: "",
      members: [],
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
      selectedInsurers: [],
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
    setFormStep(1);
  };

  const deleteLead = async (leadId) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/leads/${leadId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l._id !== leadId));
      } else {
        alert("Failed to delete lead");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting lead");
    }
  };

  const assignLead = async (leadId, assignedTo) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/leads/${leadId}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignedTo }),
      });
      if (res.ok) {
        const updatedLead = await res.json();
        setLeads((prev) => prev.map((l) => (l._id === leadId ? updatedLead : l)));
      }
    } catch (err) {
      console.error("Assign error:", err);
    }
  };

  const toggleUserSelection = (leadId, userId, isForm = false, isEditForm = false) => {
    if (isForm) {
      setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    } else if (isEditForm) {
      setEditSelectedUsers((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    } else {
      const lead = leads.find((l) => l._id === leadId);
      const current = normalizeAssignedTo(lead.assignedTo);
      const updated = current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId];
      assignLead(leadId, updated);
    }
  };

  // ========== EDIT MODAL ==========
  const openEditModal = (lead) => {
    const assignedTo = normalizeAssignedTo(lead.assignedTo);
    setEditLead(lead._id);
    setEditData({
      ...lead,
      payoutPercent: lead.payout || 0,
      gstPercent: lead.gst || 0,
      lobOption: lead.lob === "Other Insurance" ? "Other Insurance" : lead.lob,
      lobCustom: lead.lob === "Other Insurance" ? lead.lob : "",
      agency: lead.agency === "OTHERS" ? "OTHERS" : lead.agency,
      customAgency: lead.agency === "OTHERS" ? lead.agency : "",
      policyPdf: lead.policyPdf || null,
      newPolicyPdf: null,
      imageUrl: lead.imageUrl || "",
      healthDetails: lead.healthDetails || {},
      motorDetails: lead.motorDetails || {},
      electronicDetails: lead.electronicDetails || {},
      workflowDetails: lead.workflowDetails || {},
    });
    setEditSelectedUsers(assignedTo);
    setShowEditCustomAgency(lead.agency === "OTHERS");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditLead(null);
  };

  const saveEdit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const finalLOB = editData.lobOption === "Other Insurance" ? editData.lobCustom || "" : editData.lobOption || editData.lob;
    const finalAgency = editData.agency === "OTHERS" ? editData.customAgency || "" : editData.agency || editData.agency;
    const payoutValue = computePayoutValue(editData.netPremium, editData.payoutPercent);
    const grossPremium = computeGrossPremium(editData.netPremium, editData.gstPercent);
    const totalPayment = computeTotalPayment(payoutValue, editData.additionalPayout);
    
    const formData = new FormData();
    formData.append("name", editData.name);
    formData.append("email", editData.email);
    formData.append("mobileNo", editData.mobileNo);
    formData.append("gender", editData.gender);
    formData.append("source", editData.source);
    formData.append("reference", editData.reference);
    formData.append("status", editData.status);
    formData.append("openStatus", editData.openStatus);
    formData.append("policyNumber", editData.policyNumber);
    formData.append("lob", finalLOB);
    formData.append("sumInsured", editData.sumInsured);
    formData.append("endorsement", editData.endorsement);
    formData.append("payout", editData.payoutPercent);
    formData.append("payoutValue", payoutValue);
    formData.append("netPremium", editData.netPremium);
    formData.append("gst", editData.gstPercent);
    formData.append("grossPremium", grossPremium);
    formData.append("additionalPayout", editData.additionalPayout);
    formData.append("totalPayment", totalPayment);
    formData.append("payoutStatus", editData.payoutStatus);
    formData.append("policyStartDate", editData.policyStartDate);
    formData.append("policyExpiryDate", editData.policyExpiryDate);
    formData.append("insurer", editData.insurer);
    formData.append("remarks", editData.remarks);
    formData.append("agency", finalAgency);
    formData.append("imageUrl", editData.imageUrl);
    formData.append("healthDetails", JSON.stringify(editData.healthDetails || {}));
    formData.append("motorDetails", JSON.stringify(editData.motorDetails || {}));
    formData.append("electronicDetails", JSON.stringify(editData.electronicDetails || {}));
    formData.append("workflowDetails", JSON.stringify(editData.workflowDetails || {}));
    editSelectedUsers.forEach((userId) => formData.append("assignedTo", userId));
    if (editData.newPolicyPdf) {
      formData.append("policyPdf", editData.newPolicyPdf);
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/leads/${editLead}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const updatedLead = await res.json();
        setLeads((prev) => prev.map((l) => (l._id === editLead ? updatedLead : l)));
        closeEditModal();
        alert("Lead updated successfully!");
      } else {
        const errorData = await res.json();
        alert(`Failed to update lead: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating lead: " + err.message);
    }
  };

  // ========== FILTERS ==========
  const clearFilters = () => {
    setGlobalSearch("");
    setSourceFilters({
      employees: false,
      stores: false,
      channelPartners: false,
      socialMedia: false,
      directSource: false,
    });
    setActiveFilters([]);
  };

  const toggleSourceFilter = (key) => {
    setSourceFilters((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      const active = [];
      if (newState.employees) active.push("Employees");
      if (newState.stores) active.push("Stores");
      if (newState.channelPartners) active.push("Channel Partners");
      if (newState.socialMedia) active.push("Social Media");
      if (newState.directSource) active.push("Direct Source");
      setActiveFilters(active);
      return newState;
    });
  };

  // ========== RENDER HEALTH FORM ==========
  const renderHealthForm = () => (
    <div className="border-t-2 border-indigo-200 pt-4 mt-4">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
        <FaHeartbeat /> Health Insurance Details
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Policy Type</label>
          <select
            value={healthDetails.policyType}
            onChange={(e) => handleHealthChange("policyType", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {policyTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        {healthDetails.policyType === "Floater" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Number of Adults</label>
              <input
                type="number"
                min="0"
                value={healthDetails.numberOfAdults}
                onChange={(e) => {
                  handleHealthChange("numberOfAdults", e.target.value);
                  generateFloaterMembers();
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Number of Children</label>
              <input
                type="number"
                min="0"
                value={healthDetails.numberOfChildren}
                onChange={(e) => {
                  handleHealthChange("numberOfChildren", e.target.value);
                  generateFloaterMembers();
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}
        
        <div>
          <label className="text-sm font-medium text-gray-700">Proposer Name</label>
          <input
            type="text"
            value={healthDetails.proposerName}
            onChange={(e) => handleHealthChange("proposerName", toUpperCase(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg uppercase"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            value={healthDetails.proposerDOB}
            onChange={(e) => handleHealthChange("proposerDOB", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Family Income</label>
          <input
            type="number"
            value={healthDetails.familyIncome}
            onChange={(e) => handleHealthChange("familyIncome", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Height (ft/in)</label>
          <input
            type="text"
            value={healthDetails.height}
            onChange={(e) => handleHealthChange("height", e.target.value)}
            placeholder="e.g., 5'8\"
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
          <input
            type="number"
            value={healthDetails.weight}
            onChange={(e) => handleHealthChange("weight", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Qualification</label>
          <select
            value={healthDetails.qualification}
            onChange={(e) => handleHealthChange("qualification", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {qualificationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Occupation</label>
          <select
            value={healthDetails.occupation}
            onChange={(e) => handleHealthChange("occupation", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {occupationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {healthDetails.policyType === "Individual" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Nominee Name</label>
              <input
                type="text"
                value={healthDetails.nomineeName}
                onChange={(e) => handleHealthChange("nomineeName", toUpperCase(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg uppercase"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Nominee DOB</label>
              <input
                type="date"
                value={healthDetails.nomineeDOB}
                onChange={(e) => handleHealthChange("nomineeDOB", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Relationship</label>
              <select
                value={healthDetails.nomineeRelationship}
                onChange={(e) => handleHealthChange("nomineeRelationship", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {relationshipOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </>
        )}
        
        <div>
          <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
          <input
            type="text"
            value={healthDetails.aadhaarNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 12) handleHealthChange("aadhaarNumber", val);
            }}
            maxLength="12"
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          {healthDetails.aadhaarNumber && !validateAadhaar(healthDetails.aadhaarNumber) && (
            <p className="text-red-500 text-xs mt-1">Please enter 12 digits</p>
          )}
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Upload Aadhaar</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg"
            onChange={(e) => handleHealthChange("aadhaarFile", e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">PAN Number</label>
          <input
            type="text"
            value={healthDetails.panNumber}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              if (val.length <= 10) handleHealthChange("panNumber", val);
            }}
            maxLength="10"
            className="w-full p-2 border border-gray-300 rounded-lg uppercase"
          />
          {healthDetails.panNumber && !validatePAN(healthDetails.panNumber) && (
            <p className="text-red-500 text-xs mt-1">Format: ABCDE1234F</p>
          )}
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Upload PAN</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg"
            onChange={(e) => handleHealthChange("panFile", e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Previous Policy Active?</label>
          <select
            value={healthDetails.hasPreviousPolicy}
            onChange={(e) => handleHealthChange("hasPreviousPolicy", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {yesNoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        {healthDetails.hasPreviousPolicy === "Yes" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Previous Insurer</label>
              <input
                type="text"
                value={healthDetails.previousInsurer}
                onChange={(e) => handleHealthChange("previousInsurer", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Previous Policy Number</label>
              <input
                type="text"
                value={healthDetails.previousPolicyNumber}
                onChange={(e) => handleHealthChange("previousPolicyNumber", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Due Date</label>
              <input
                type="date"
                value={healthDetails.previousPolicyDueDate}
                onChange={(e) => {
                  const selected = new Date(e.target.value);
                  const today = new Date();
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  if (selected.toDateString() === today.toDateString() || 
                      selected.toDateString() === tomorrow.toDateString()) {
                    handleHealthChange("previousPolicyDueDate", e.target.value);
                  } else {
                    alert("Due date must be Today or Tomorrow only");
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Upload Previous Policy</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleHealthChange("previousPolicyFile", e.target.files[0])}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}
        
        <div className="lg:col-span-3">
          <label className="text-sm font-medium text-gray-700">Medical Remarks</label>
          <textarea
            value={healthDetails.medicalRemarks}
            onChange={(e) => handleHealthChange("medicalRemarks", e.target.value)}
            placeholder="Pre-existing diseases, treatment history, etc."
            className="w-full p-2 border border-gray-300 rounded-lg"
            rows="3"
          ></textarea>
        </div>
      </div>

      {/* Floater Members Section */}
      {showFloaterMembers && healthDetails.members.length > 0 && (
        <div className="mt-4 border-t-2 border-indigo-200 pt-4">
          <h4 className="text-md font-semibold text-indigo-600 mb-4">Floater Members</h4>
          {healthDetails.members.map((member, index) => (
            <div key={member.id} className="border rounded-lg p-4 mb-4 bg-gray-50">
              <h5 className="font-medium text-gray-700 mb-3">
                {member.type === 'adult' ? `Adult ${Math.floor(index + 1)}` : `Child ${index - (parseInt(healthDetails.numberOfAdults) || 0)}`}
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
                    value={member.dob}
                    onChange={(e) => {
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
                    {qualificationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                    {occupationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Relationship with Proposer</label>
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
                    {relationshipOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                  ></textarea>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ========== RENDER MOTOR FORM ==========
  const renderMotorForm = () => (
    <div className="border-t-2 border-indigo-200 pt-4 mt-4">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
        <FaCar /> Motor Insurance Details
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
          <select
            value={motorDetails.vehicleType}
            onChange={(e) => handleMotorChange("vehicleType", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {vehicleTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Insurance Type</label>
          <select
            value={motorDetails.insuranceType}
            onChange={(e) => handleMotorChange("insuranceType", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {insuranceTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Registration Number</label>
          <input
            type="text"
            value={motorDetails.registrationNumber}
            onChange={(e) => handleMotorChange("registrationNumber", e.target.value.toUpperCase())}
            className="w-full p-2 border border-gray-300 rounded-lg uppercase"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">RTO Code</label>
          <input
            type="text"
            value={motorDetails.rtoCode}
            onChange={(e) => handleMotorChange("rtoCode", e.target.value.toUpperCase())}
            placeholder="e.g., BR01"
            className="w-full p-2 border border-gray-300 rounded-lg uppercase"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Previous Policy Status</label>
          <select
            value={motorDetails.previousPolicyStatus}
            onChange={(e) => handleMotorChange("previousPolicyStatus", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {previousPolicyStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        {motorDetails.previousPolicyStatus === "Active" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Previous Insurer</label>
              <select
                value={motorDetails.previousInsurer}
                onChange={(e) => handleMotorChange("previousInsurer", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {insurerOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">PYP Due Date</label>
              <input
                type="date"
                value={motorDetails.pypDueDate}
                onChange={(e) => handleMotorChange("pypDueDate", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">IDV as per PYP</label>
              <input
                type="number"
                value={motorDetails.idvAsPerPYP}
                onChange={(e) => handleMotorChange("idvAsPerPYP", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Claim Taken?</label>
              <select
                value={motorDetails.claimTaken}
                onChange={(e) => handleMotorChange("claimTaken", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {yesNoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            
            {motorDetails.claimTaken === "No" && (
              <div>
                <label className="text-sm font-medium text-gray-700">NCB</label>
                <select
                  value={motorDetails.ncb}
                  onChange={(e) => handleMotorChange("ncb", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {ncbOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            )}
            {motorDetails.claimTaken === "Yes" && (
              <div>
                <label className="text-sm font-medium text-gray-700">NCB</label>
                <input
                  type="text"
                  value="NIL"
                  disabled
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            )}
          </>
        )}
        
        <div>
          <label className="text-sm font-medium text-gray-700">Add-On Required?</label>
          <select
            value={motorDetails.addOnRequired}
            onChange={(e) => handleMotorChange("addOnRequired", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {yesNoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Quote Required?</label>
          <select
            value={motorDetails.quoteRequired}
            onChange={(e) => handleMotorChange("quoteRequired", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {yesNoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        {motorDetails.quoteRequired === "Yes" && (
          <div className="lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">Select Insurers for Quote</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border p-2 rounded-lg">
              {insurerOptions.slice(0, 10).map(ins => (
                <label key={ins} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={motorDetails.selectedInsurers.includes(ins)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleMotorChange("selectedInsurers", [...motorDetails.selectedInsurers, ins]);
                      } else {
                        handleMotorChange("selectedInsurers", motorDetails.selectedInsurers.filter(i => i !== ins));
                      }
                    }}
                  />
                  {ins}
                </label>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <label className="text-sm font-medium text-gray-700">Upload PYP</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleMotorChange("pypFile", e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">RC Front</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg"
            onChange={(e) => handleMotorChange("rcFrontFile", e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">RC Back</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg"
            onChange={(e) => handleMotorChange("rcBackFile", e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );

  // ========== RENDER ELECTRONIC FORM ==========
  const renderElectronicForm = () => (
    <div className="border-t-2 border-indigo-200 pt-4 mt-4">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
        <FaMobileAlt /> Mobile/Electronic Equipment Details
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Device Type</label>
          <select
            value={electronicDetails.deviceType}
            onChange={(e) => handleElectronicChange("deviceType", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {deviceTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        {electronicDetails.deviceType === "Other" && (
          <div>
            <label className="text-sm font-medium text-gray-700">Specify Device Type</label>
            <input
              type="text"
              value={electronicDetails.otherDeviceType}
              onChange={(e) => handleElectronicChange("otherDeviceType", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        )}
        
        <div>
          <label className="text-sm font-medium text-gray-700">Date of Purchase</label>
          <input
            type="date"
            value={electronicDetails.dateOfPurchase}
            onChange={(e) => handleElectronicChange("dateOfPurchase", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Purchase Value (incl. Tax)</label>
          <input
            type="number"
            value={electronicDetails.purchaseValue}
            onChange={(e) => handleElectronicChange("purchaseValue", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
          <input
            type="text"
            value={electronicDetails.aadhaarNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 12) handleElectronicChange("aadhaarNumber", val);
            }}
            maxLength="12"
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Upload Aadhaar</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg"
            onChange={(e) => handleElectronicChange("aadhaarFile", e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">PAN Number</label>
          <input
            type="text"
            value={electronicDetails.panNumber}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              if (val.length <= 10) handleElectronicChange("panNumber", val);
            }}
            maxLength="10"
            className="w-full p-2 border border-gray-300 rounded-lg uppercase"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Upload PAN</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg"
            onChange={(e) => handleElectronicChange("panFile", e.target.files[0])}
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
              if (val.length <= 15) handleElectronicChange("imeiNumber", val);
            }}
            maxLength="15"
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          {electronicDetails.dateOfPurchase && (() => {
            const purchaseDate = new Date(electronicDetails.dateOfPurchase);
            const today = new Date();
            const diffDays = Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24));
            if (diffDays > 15) {
              return <p className="text-orange-500 text-xs mt-1">⚠️ Device is older than 15 days</p>;
            }
          })()}
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Upload IMEI Image</label>
          <input
            type="file"
            accept=".jpg,.jpeg"
            onChange={(e) => handleElectronicChange("imeiImage", e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div className="lg:col-span-3">
          <label className="text-sm font-medium text-gray-700">Device Photos (with IMEI visible)</label>
          <input
            type="file"
            accept=".jpg,.jpeg"
            multiple
            onChange={(e) => handleElectronicChange("devicePhotos", Array.from(e.target.files))}
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
            onChange={(e) => handleElectronicChange("purchaseInvoice", e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );

  // ========== RENDER WORKFLOW FORM (for Edit Modal) ==========
  const renderWorkflowForm = () => (
    <div className="border-t-2 border-indigo-200 pt-4 mt-4">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
        <FaEdit /> Workflow Management
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={editData.workflowDetails?.status || editData.status}
            onChange={(e) => {
              const val = e.target.value;
              setEditData(prev => ({
                ...prev,
                workflowDetails: { ...prev.workflowDetails, status: val }
              }));
              if (val === "Quotation Generated") {
                setShowInsurerQuotes(true);
              } else {
                setShowInsurerQuotes(false);
              }
            }}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        {(editData.workflowDetails?.status === "Quotation Generated" || showInsurerQuotes) && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Quote Number</label>
              <input
                type="text"
                value={editData.workflowDetails?.quoteNumber || ""}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  workflowDetails: { ...prev.workflowDetails, quoteNumber: e.target.value }
                }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="lg:col-span-3">
              <label className="text-sm font-medium text-gray-700">Select Insurers for Quote</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border p-2 rounded-lg">
                {insurerOptions.slice(0, 10).map(ins => (
                  <label key={ins} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editData.workflowDetails?.selectedInsurers?.includes(ins) || false}
                      onChange={(e) => {
                        const current = editData.workflowDetails?.selectedInsurers || [];
                        let updated;
                        if (e.target.checked) {
                          updated = [...current, ins];
                        } else {
                          updated = current.filter(i => i !== ins);
                        }
                        setEditData(prev => ({
                          ...prev,
                          workflowDetails: { ...prev.workflowDetails, selectedInsurers: updated }
                        }));
                      }}
                    />
                    {ins}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
        
        <div>
          <label className="text-sm font-medium text-gray-700">Payment Status</label>
          <select
            value={editData.workflowDetails?.paymentStatus || ""}
            onChange={(e) => setEditData(prev => ({
              ...prev,
              workflowDetails: { ...prev.workflowDetails, paymentStatus: e.target.value }
            }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {paymentStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        {editData.workflowDetails?.paymentStatus === "URL Shared" && (
          <div className="lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">Payment URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={editData.workflowDetails?.paymentUrl || ""}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  workflowDetails: { ...prev.workflowDetails, paymentUrl: e.target.value }
                }))}
                className="flex-1 p-2 border border-gray-300 rounded-lg"
                placeholder="https://payment.link/..."
              />
              {editData.workflowDetails?.paymentUrl && (
                <a
                  href={editData.workflowDetails.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaLink /> Open
                </a>
              )}
            </div>
          </div>
        )}
        
        {editData.workflowDetails?.paymentStatus === "Payment Done" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">UTR Number</label>
              <input
                type="text"
                value={editData.workflowDetails?.utrNumber || ""}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  workflowDetails: { ...prev.workflowDetails, utrNumber: e.target.value }
                }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Upload Payment Snapshot</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg"
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  workflowDetails: { ...prev.workflowDetails, paymentSnapshot: e.target.files[0] }
                }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}
        
        {editData.workflowDetails?.paymentStatus === "Policy Issued" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Number</label>
              <input
                type="text"
                value={editData.workflowDetails?.policyNumber || ""}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  workflowDetails: { ...prev.workflowDetails, policyNumber: e.target.value }
                }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Issued On</label>
              <input
                type="date"
                value={editData.workflowDetails?.policyIssuedOn || ""}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  workflowDetails: { ...prev.workflowDetails, policyIssuedOn: e.target.value }
                }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Start Date</label>
              <input
                type="date"
                value={editData.workflowDetails?.policyStartDate || ""}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  workflowDetails: { ...prev.workflowDetails, policyStartDate: e.target.value }
                }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Expiry Date</label>
              <input
                type="date"
                value={editData.workflowDetails?.policyExpiryDate || ""}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  workflowDetails: { ...prev.workflowDetails, policyExpiryDate: e.target.value }
                }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Upload Policy Copy</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  workflowDetails: { ...prev.workflowDetails, policyCopy: e.target.files[0] }
                }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}
        
        <div className="lg:col-span-3">
          <label className="text-sm font-medium text-gray-700">Remarks</label>
          <textarea
            value={editData.workflowDetails?.remarks || ""}
            onChange={(e) => setEditData(prev => ({
              ...prev,
              workflowDetails: { ...prev.workflowDetails, remarks: e.target.value }
            }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>
  );

  // ========== RENDER LEAD FORM ==========
  const renderLeadForm = () => (
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
          <h2 className="text-xl font-bold">Add New Lead</h2>
          <button onClick={() => setShowLeadForm(false)} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleAddLead}>
          {/* Step 1: Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: toUpperCase(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg uppercase"
                required
                placeholder="Enter name in UPPERCASE"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select
                value={newLead.gender}
                onChange={(e) => setNewLead({ ...newLead, gender: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Mobile No *</label>
              <input
                type="text"
                value={newLead.mobileNo}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setNewLead({ ...newLead, mobileNo: val });
                }}
                maxLength="10"
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
              {newLead.mobileNo && !validateMobile(newLead.mobileNo) && (
                <p className="text-red-500 text-xs mt-1">Enter 10 digits</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Source</label>
              <select
                value={newLead.source}
                onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Reference</label>
              <input
                type="text"
                value={newLead.reference}
                onChange={(e) => setNewLead({ ...newLead, reference: e.target.value })}
                placeholder="e.g., Facebook, Agent Name, Walk-in"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={newLead.status}
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="Open">Open</option>
                <option value="Policy Issued">Policy Issued</option>
                <option value="Closed Without Issuance">Closed Without Issuance</option>
              </select>
            </div>
            
            {newLead.status === "Open" && (
              <div>
                <label className="text-sm font-medium text-gray-700">Next Step</label>
                <select
                  value={newLead.openStatus}
                  onChange={(e) => setNewLead({ ...newLead, openStatus: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="Closed">Closed</option>
                  <option value="Policy Issued">Policy Issued</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Number</label>
              <input
                type="text"
                value={newLead.policyNumber}
                onChange={(e) => setNewLead({ ...newLead, policyNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">LOB</label>
              <select
                value={newLead.lobOption}
                onChange={(e) => {
                  setNewLead({ ...newLead, lobOption: e.target.value, lobCustom: "" });
                  detectLOB(e.target.value);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select LOB --</option>
                {lobOptions.map((lob) => (
                  <option key={lob} value={lob}>
                    {lob}
                  </option>
                ))}
              </select>
              {newLead.lobOption === "Other Insurance" && (
                <input
                  type="text"
                  placeholder="Enter Custom LOB"
                  value={newLead.lobCustom}
                  onChange={(e) => setNewLead({ ...newLead, lobCustom: e.target.value })}
                  className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
                />
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Agency</label>
              <select
                value={newLead.agency}
                onChange={(e) => {
                  setNewLead({ ...newLead, agency: e.target.value });
                  setShowCustomAgency(e.target.value === "OTHERS");
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select Agency --</option>
                {agencyOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {showCustomAgency && (
                <input
                  type="text"
                  placeholder="Enter Custom Agency"
                  value={newLead.customAgency}
                  onChange={(e) => setNewLead({ ...newLead, customAgency: e.target.value })}
                  className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
                />
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Sum Insured</label>
              <input
                type="number"
                value={newLead.sumInsured}
                onChange={(e) => setNewLead({ ...newLead, sumInsured: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Endorsement</label>
              <input
                type="text"
                value={newLead.endorsement}
                onChange={(e) => setNewLead({ ...newLead, endorsement: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Net Premium</label>
              <input
                type="number"
                value={newLead.netPremium}
                onChange={(e) => setNewLead({ ...newLead, netPremium: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">GST %</label>
              <select
                value={newLead.gstPercent}
                onChange={(e) => setNewLead({ ...newLead, gstPercent: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {gstOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}%
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Gross Premium</label>
              <input
                type="text"
                readOnly
                value={formatCurrency(computeGrossPremium(newLead.netPremium, newLead.gstPercent))}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Payout (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={newLead.payoutPercent}
                  onChange={(e) => setNewLead({ ...newLead, payoutPercent: clampPercent(e.target.value) })}
                  className="w-full"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newLead.payoutPercent}
                  onChange={(e) => setNewLead({ ...newLead, payoutPercent: clampPercent(e.target.value) })}
                  className="w-20 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Payout (calc)</label>
              <input
                type="text"
                readOnly
                value={formatCurrency(computePayoutValue(newLead.netPremium, newLead.payoutPercent))}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Additional Payout</label>
              <input
                type="number"
                value={newLead.additionalPayout}
                onChange={(e) => setNewLead({ ...newLead, additionalPayout: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Total Payment</label>
              <input
                type="text"
                readOnly
                value={formatCurrency(
                  computeTotalPayment(
                    computePayoutValue(newLead.netPremium, newLead.payoutPercent),
                    newLead.additionalPayout
                  )
                )}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Payout Status</label>
              <select
                value={newLead.payoutStatus}
                onChange={(e) => setNewLead({ ...newLead, payoutStatus: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select --</option>
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Start</label>
              <input
                type="date"
                value={newLead.policyStartDate}
                onChange={(e) => setNewLead({ ...newLead, policyStartDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Expiry</label>
              <input
                type="date"
                value={newLead.policyExpiryDate}
                onChange={(e) => setNewLead({ ...newLead, policyExpiryDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Insurer</label>
              <select
                value={newLead.insurer}
                onChange={(e) => setNewLead({ ...newLead, insurer: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select --</option>
                {insurerOptions.map((ins) => (
                  <option key={ins} value={ins}>
                    {ins}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Upload</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setNewLead({ ...newLead, policyPdf: e.target.files[0] })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {newLead.policyPdf && <p className="text-sm text-gray-500 mt-1">{newLead.policyPdf.name}</p>}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                value={newLead.imageUrl}
                onChange={(e) => setNewLead({ ...newLead, imageUrl: e.target.value })}
                placeholder="Enter image URL"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div className="relative" ref={formDropdownRef}>
              <label className="text-sm font-medium text-gray-700">Assign To</label>
              <button
                type="button"
                onClick={() => setShowFormDropdown(!showFormDropdown)}
                className="w-full p-2 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50"
              >
                {selectedUsers.length > 0 ? selectedUsers.map(getUserName).join(", ") : "-- Select Users --"}
              </button>
              {showFormDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="p-3 text-gray-500">Loading users...</div>
                  ) : (
                    users.map((user) => (
                      <label key={user._id} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(null, user._id, true)}
                          className="mr-3"
                        />
                        <span className="text-sm">{user.username || user.name || user.email}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <div className="lg:col-span-3">
              <label className="text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                value={newLead.remarks}
                onChange={(e) => setNewLead({ ...newLead, remarks: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Customer remarks, discussion notes, etc."
              ></textarea>
            </div>
          </div>

          {/* LOB Specific Sections */}
          {showHealthSection && renderHealthForm()}
          {showMotorSection && renderMotorForm()}
          {showElectronicSection && renderElectronicForm()}

          {/* Form Actions */}
          <div className="lg:col-span-3 flex gap-4 justify-end mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowLeadForm(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Create Lead
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  // ========== RENDER EDIT MODAL ==========
  const renderEditModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-6xl max-h-[90vh] overflow-y-auto w-full"
      >
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
          <h2 className="text-xl font-bold">Edit Lead</h2>
          <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <form>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: toUpperCase(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg uppercase"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select
                value={editData.gender || ""}
                onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mobile No</label>
              <input
                type="text"
                value={editData.mobileNo}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setEditData({ ...editData, mobileNo: val });
                }}
                maxLength="10"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Source</label>
              <select
                value={editData.source || ""}
                onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Reference</label>
              <input
                type="text"
                value={editData.reference}
                onChange={(e) => setEditData({ ...editData, reference: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Number</label>
              <input
                type="text"
                value={editData.policyNumber}
                onChange={(e) => setEditData({ ...editData, policyNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">LOB</label>
              <select
                value={editData.lobOption}
                onChange={(e) => setEditData({ ...editData, lobOption: e.target.value, lobCustom: "" })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select LOB --</option>
                {lobOptions.map((lob) => (
                  <option key={lob} value={lob}>
                    {lob}
                  </option>
                ))}
              </select>
              {editData.lobOption === "Other Insurance" && (
                <input
                  type="text"
                  placeholder="Enter Custom LOB"
                  value={editData.lobCustom}
                  onChange={(e) => setEditData({ ...editData, lobCustom: e.target.value })}
                  className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
                />
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Agency</label>
              <select
                value={editData.agency}
                onChange={(e) => {
                  setEditData({ ...editData, agency: e.target.value });
                  setShowEditCustomAgency(e.target.value === "OTHERS");
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select Agency --</option>
                {agencyOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {showEditCustomAgency && (
                <input
                  type="text"
                  placeholder="Enter Custom Agency"
                  value={editData.customAgency}
                  onChange={(e) => setEditData({ ...editData, customAgency: e.target.value })}
                  className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
                />
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Sum Insured</label>
              <input
                type="number"
                value={editData.sumInsured}
                onChange={(e) => setEditData({ ...editData, sumInsured: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Net Premium</label>
              <input
                type="number"
                value={editData.netPremium}
                onChange={(e) => setEditData({ ...editData, netPremium: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">GST %</label>
              <select
                value={editData.gstPercent}
                onChange={(e) => setEditData({ ...editData, gstPercent: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {gstOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}%
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Payout (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editData.payoutPercent}
                  onChange={(e) => setEditData({ ...editData, payoutPercent: clampPercent(e.target.value) })}
                  className="w-full"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editData.payoutPercent}
                  onChange={(e) => setEditData({ ...editData, payoutPercent: clampPercent(e.target.value) })}
                  className="w-20 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Additional Payout</label>
              <input
                type="number"
                value={editData.additionalPayout}
                onChange={(e) => setEditData({ ...editData, additionalPayout: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Start</label>
              <input
                type="date"
                value={editData.policyStartDate}
                onChange={(e) => setEditData({ ...editData, policyStartDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Expiry</label>
              <input
                type="date"
                value={editData.policyExpiryDate}
                onChange={(e) => setEditData({ ...editData, policyExpiryDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Insurer</label>
              <select
                value={editData.insurer}
                onChange={(e) => setEditData({ ...editData, insurer: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select --</option>
                {insurerOptions.map((ins) => (
                  <option key={ins} value={ins}>
                    {ins}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Upload</label>
              {editData.policyPdf?.url && (
                <div className="mb-2">
                  <a href={editData.policyPdf.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm flex items-center gap-1">
                    <FaFilePdf className="h-4 w-4" /> Current PDF
                  </a>
                </div>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setEditData({ ...editData, newPolicyPdf: e.target.files[0] })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                value={editData.imageUrl}
                onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="relative" ref={editFormDropdownRef}>
              <label className="text-sm font-medium text-gray-700">Assign To</label>
              <button
                type="button"
                onClick={() => setShowEditFormDropdown(!showEditFormDropdown)}
                className="w-full p-2 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50"
              >
                {editSelectedUsers.length > 0 ? editSelectedUsers.map(getUserName).join(", ") : "-- Select Users --"}
              </button>
              {showEditFormDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {users.map((user) => (
                    <label key={user._id} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editSelectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(null, user._id, false, true)}
                        className="mr-3"
                      />
                      <span className="text-sm">{user.username || user.name || user.email}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="lg:col-span-3">
              <label className="text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                value={editData.remarks}
                onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="3"
              ></textarea>
            </div>
          </div>

          {/* Workflow Section */}
          {renderWorkflowForm()}

          <div className="lg:col-span-3 flex gap-4 justify-end mt-6 pt-4 border-t">
            <button type="button" onClick={closeEditModal} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
              Cancel
            </button>
            <button type="button" onClick={saveEdit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Update Lead
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  // ========== MAIN RENDER ==========
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
      {/* Upload Status */}
      {uploadStatus.show && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-lg ${uploadStatus.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {uploadStatus.type === "success" ? "✓ " : "✗ "}{uploadStatus.message}
        </motion.div>
      )}

      {/* Controls */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-wrap">
          <button onClick={() => setShowLeadForm(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
            + Add New Lead
          </button>
          <button onClick={downloadTemplate} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2">
            <FaDownload className="h-4 w-4" /> Download Template
          </button>
          <button onClick={downloadExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2">
            <FaFileExcel className="h-4 w-4" /> Download Excel
          </button>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-2">
            <FaUpload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Excel"}
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" ref={fileInputRef} disabled={isUploading} />
          </label>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-4">
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
          <button onClick={() => setFilterDropdownOpen(!filterDropdownOpen)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2">
            <FaFilter className="h-4 w-4" /> Advanced Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
          {filterDropdownOpen && (
            <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Filter by Source</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sourceFilters.employees} onChange={() => toggleSourceFilter("employees")} className="rounded text-indigo-600" />
                  <span className="text-sm">Employees</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sourceFilters.stores} onChange={() => toggleSourceFilter("stores")} className="rounded text-indigo-600" />
                  <span className="text-sm">Stores</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sourceFilters.channelPartners} onChange={() => toggleSourceFilter("channelPartners")} className="rounded text-indigo-600" />
                  <span className="text-sm">Channel Partners</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sourceFilters.socialMedia} onChange={() => toggleSourceFilter("socialMedia")} className="rounded text-indigo-600" />
                  <span className="text-sm">Social Media</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sourceFilters.directSource} onChange={() => toggleSourceFilter("directSource")} className="rounded text-indigo-600" />
                  <span className="text-sm">Direct Source</span>
                </label>
              </div>
              {activeFilters.length > 0 && (
                <button onClick={clearFilters} className="mt-4 text-xs text-red-600 hover:text-red-800 w-full text-center">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeFilters.map((filter) => (
              <span key={filter} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs flex items-center gap-1">
                {filter}
                <button onClick={() => toggleSourceFilter(filter.toLowerCase().replace(" ", ""))}>
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Lead Form Modal */}
      {showLeadForm && renderLeadForm()}

      {/* Edit Modal */}
      {showEditModal && renderEditModal()}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <p className="text-sm text-gray-600">
            Showing {filteredLeadsData.length} of {leads.length} leads
            {globalSearch && ` | Search: "${globalSearch}"`}
            {activeFilters.length > 0 && ` | Source: ${activeFilters.join(", ")}`}
          </p>
        </div>

        {/* Desktop Table */}
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
                <th className="p-3">Assigned To</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeadsData.map((lead) => {
                const assignedTo = normalizeAssignedTo(lead.assignedTo);
                const currentShowDropdown = showLeadDropdowns[lead._id] || false;
                return (
                  <motion.tr key={lead._id} className="border-b hover:bg-gray-50 text-xs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                    <td className="p-3">{assignedTo.map(getUserName).join(", ") || "Unassigned"}</td>
                    <td className="p-3 flex gap-2 items-center">
                      <button onClick={() => setSelectedLead(lead)} className="text-indigo-600 hover:text-indigo-800">
                        <FaEye className="h-5 w-5" />
                      </button>
                      <button onClick={() => openEditModal(lead)} className="text-blue-600 hover:text-blue-800">
                        <FaEdit className="h-5 w-5" />
                      </button>
                      <div className="relative" ref={(el) => (leadDropdownRefs.current[lead._id] = el)}>
                        <button
                          onClick={() => setShowLeadDropdowns((prev) => ({ ...prev, [lead._id]: !currentShowDropdown }))}
                          className="px-3 py-1 text-xs border rounded bg-gray-50 hover:bg-gray-100"
                        >
                          Assign
                        </button>
                        {currentShowDropdown && (
                          <div className="absolute z-50 mt-1 w-56 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {users.map((user) => (
                              <label key={user._id} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  checked={assignedTo.includes(user._id)}
                                  onChange={() => toggleUserSelection(lead._id, user._id)}
                                  className="mr-2"
                                />
                                {getUserName(user._id)}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => deleteLead(lead._id)} className="text-red-600 hover:text-red-800">
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden p-4 space-y-4">
          {filteredLeadsData.map((lead) => {
            const assignedTo = normalizeAssignedTo(lead.assignedTo);
            const currentShowDropdown = showLeadDropdowns[lead._id] || false;
            return (
              <div key={lead._id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                <div className="space-y-2 text-sm">
                  <div><strong>Lead Code:</strong> <span className="font-mono text-indigo-600">{lead.leadCode || "N/A"}</span></div>
                  <div><strong>Name:</strong> {lead.name}</div>
                  <div><strong>Mobile:</strong> {lead.mobileNo}</div>
                  <div><strong>Email:</strong> {lead.email || "-"}</div>
                  <div><strong>Policy #:</strong> {lead.policyNumber || "-"}</div>
                  <div><strong>LOB:</strong> {lead.lob || "-"}</div>
                  <div><strong>Source:</strong> {lead.source || "-"}</div>
                  <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${
                    lead.status === "Open" ? "bg-yellow-100 text-yellow-800" :
                    lead.status === "Quotation Generated" ? "bg-blue-100 text-blue-800" :
                    lead.status === "Payment Link Generated" ? "bg-purple-100 text-purple-800" :
                    lead.status === "Payment Done" ? "bg-green-100 text-green-800" :
                    lead.status === "Policy Issued" ? "bg-emerald-100 text-emerald-800" :
                    "bg-red-100 text-red-800"
                  }`}>{lead.status}</span></div>
                  <div><strong>Assigned:</strong> {assignedTo.map(getUserName).join(", ") || "Unassigned"}</div>
                  <div className="pt-2 flex gap-3">
                    <button onClick={() => setSelectedLead(lead)} className="text-indigo-600"><FaEye className="h-5 w-5" /></button>
                    <button onClick={() => openEditModal(lead)} className="text-blue-600"><FaEdit className="h-5 w-5" /></button>
                    <div className="relative" ref={(el) => (leadDropdownRefs.current[lead._id] = el)}>
                      <button onClick={() => setShowLeadDropdowns((prev) => ({ ...prev, [lead._id]: !currentShowDropdown }))} className="text-xs px-3 py-1 border rounded bg-white">Assign</button>
                      {currentShowDropdown && (
                        <div className="absolute z-50 mt-2 w-full bg-white border rounded p-2 max-h-40 overflow-y-auto">
                          {users.map((user) => (
                            <label key={user._id} className="flex items-center gap-2 text-xs block py-1">
                              <input type="checkbox" checked={assignedTo.includes(user._id)} onChange={() => toggleUserSelection(lead._id, user._id)} />
                              {getUserName(user._id)}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => deleteLead(lead._id)} className="text-red-600"><FaTrash className="h-5 w-5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default LeadTable;