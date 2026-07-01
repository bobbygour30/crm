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
} from "react-icons/fa";
import { useState, useRef, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";

function InsuranceLeadManagement() {
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

  // Health Insurance
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

  const filterDropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

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
    // Show Senior One DOB when Floater is selected
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
  // PIN CODE AUTO-FETCH
  // ============================================================
  const fetchCityState = async (pinCode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
      const data = await response.json();
      if (data[0]?.Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          state: postOffice.State,
          city: postOffice.District,
        }));
      }
    } catch (error) {
      console.error("Error fetching city/state:", error);
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
  // FLOATER MEMBERS
  // ============================================================
  const generateFloaterMembers = () => {
    let adults = parseInt(healthDetails.numberOfAdults) || 0;
    let children = parseInt(healthDetails.numberOfChildren) || 0;
    
    // If Proposer is a Member, then 2+1 = 3 members total
    if (healthDetails.proposerIsMember === "Yes") {
      // Keep the counts as entered by user (2 adults, 1 child)
      // But ensure the proposer is included as the first adult
    }
    
    const members = [];
    
    // If Proposer is a Member, first member is the Proposer
    if (healthDetails.proposerIsMember === "Yes") {
      members.push({
        id: `proposer`,
        type: 'proposer',
        name: healthDetails.proposerName || '',
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
      for (let i = 1; i < adults; i++) {
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
  // FILTER LEADS
  // ============================================================
  const filterLeads = () => {
    let filtered = [...leads];
    
    // Universal Search
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
    
    // Source Filters
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
        
        // Validate data
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
  // CREATE LEAD
  // ============================================================
  const handleCreateLead = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate
    if (!validateMobile(formData.mobileNo)) {
      alert("Please enter a valid 10-digit mobile number");
      setIsSubmitting(false);
      return;
    }

    if (formData.name !== formData.name.toUpperCase()) {
      alert("Name must be in UPPERCASE");
      setIsSubmitting(false);
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      alert("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    if (formData.pinCode && !validatePIN(formData.pinCode)) {
      alert("Please enter a valid 6-digit PIN code");
      setIsSubmitting(false);
      return;
    }

    const leadCode = generateLeadCode(leads);
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
    submitData.append("leadCode", leadCode);
    submitData.append("sourceDependentValue", formData.sourceDependentValue);
    submitData.append("status", "Open");
    submitData.append("policyTenure", formData.policyTenure);
    submitData.append("paymentTerm", formData.paymentTerm);
    submitData.append("sumInsured", formData.sumInsured);

    // Health details
    if (showHealthSection) {
      submitData.append("healthDetails", JSON.stringify(healthDetails));
    }

    // Motor details
    if (showMotorSection) {
      submitData.append("motorDetails", JSON.stringify(motorDetails));
    }

    // Electronic details
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
        alert(`Failed to create lead: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Create error:", err);
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // UPDATE LEAD (Workflow)
  // ============================================================
  const handleUpdateLead = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append("status", workflowDetails.status);
    submitData.append("workflowDetails", JSON.stringify(workflowDetails));

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
        alert(`Failed to update lead: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // DELETE LEAD
  // ============================================================
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
  // OPEN EDIT MODAL
  // ============================================================
  const openEditModal = (lead) => {
    setEditLead(lead);
    setWorkflowDetails({
      status: lead.status || "Open",
      quoteNumber: lead.quoteNumber || "",
      selectedInsurers: lead.selectedInsurers || [],
      insurerQuotes: lead.insurerQuotes || [],
      paymentStatus: lead.paymentStatus || "",
      paymentUrl: lead.paymentUrl || "",
      utrNumber: lead.utrNumber || "",
      paymentSnapshot: lead.paymentSnapshot || null,
      policyNumber: lead.policyNumber || "",
      policyIssuedOn: lead.policyIssuedOn || "",
      policyStartDate: lead.policyStartDate || "",
      policyExpiryDate: lead.policyExpiryDate || "",
      policyCopy: lead.policyCopy || null,
      remarks: lead.remarks || "",
    });
    setShowInsurerQuotes(lead.status === "Quotation Generated");
    setShowEditModal(true);
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
  // RENDER: HEALTH FORM
  // ============================================================
  const renderHealthForm = () => {
    // Handle member rider changes
    const handleMemberRiderChange = (index, field, value) => {
      const newMembers = [...healthDetails.members];
      newMembers[index][field] = value;
      
      // If selecting Insta Shield, show dependent dropdowns
      if (field === 'selectedRider' && value === 'Insta Shield') {
        // Keep the rider details section visible
      }
      
      setHealthDetails(prev => ({ ...prev, members: newMembers }));
    };

    const handleMemberRiderDetailChange = (index, field, value) => {
      const newMembers = [...healthDetails.members];
      newMembers[index].riderDetails[field] = value;
      setHealthDetails(prev => ({ ...prev, members: newMembers }));
    };

    return (
      <div className="border-t-2 border-indigo-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaHeartbeat /> Health Insurance Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Policy Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">Policy Type</label>
            <select
              value={healthDetails.policyType}
              onChange={(e) => {
                setHealthDetails(prev => ({ ...prev, policyType: e.target.value }));
                setShowFloaterMembers(e.target.value === "Floater");
                setShowSeniorOneDOB(e.target.value === "Floater");
                if (e.target.value === "Floater") generateFloaterMembers();
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              {POLICY_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Policy Tenure */}
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

          {/* Payment Term */}
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

          {/* Sum Insured */}
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
                  type="number"
                  min="0"
                  value={healthDetails.numberOfAdults}
                  onChange={(e) => {
                    setHealthDetails(prev => ({ ...prev, numberOfAdults: e.target.value }));
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
                    setHealthDetails(prev => ({ ...prev, numberOfChildren: e.target.value }));
                    generateFloaterMembers();
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </>
          )}

          {/* Senior One DOB - Only for Floater */}
          {showSeniorOneDOB && (
            <div>
              <label className="text-sm font-medium text-gray-700">DOB of Senior One</label>
              <input
                type="date"
                value={healthDetails.seniorOneDOB}
                onChange={(e) => setHealthDetails(prev => ({ ...prev, seniorOneDOB: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {/* Proposer Details */}
          <div>
            <label className="text-sm font-medium text-gray-700">Proposer Name</label>
            <input
              type="text"
              value={healthDetails.proposerName}
              onChange={(e) => setHealthDetails(prev => ({ ...prev, proposerName: toUpperCase(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded-lg uppercase"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">DOB</label>
            <input
              type="date"
              value={healthDetails.proposerDOB}
              onChange={(e) => setHealthDetails(prev => ({ ...prev, proposerDOB: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
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

          {/* Proposer is a Member within the Plan - Only for Floater */}
          {healthDetails.policyType === "Floater" && (
            <div>
              <label className="text-sm font-medium text-gray-700">Proposer is a Member within the Plan</label>
              <select
                value={healthDetails.proposerIsMember}
                onChange={(e) => {
                  setHealthDetails(prev => ({ ...prev, proposerIsMember: e.target.value }));
                  generateFloaterMembers();
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          )}

          {/* Nominee Details - Individual Only */}
          {healthDetails.policyType === "Individual" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Nominee Name</label>
                <input
                  type="text"
                  value={healthDetails.nomineeName}
                  onChange={(e) => setHealthDetails(prev => ({ ...prev, nomineeName: toUpperCase(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-lg uppercase"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nominee DOB</label>
                <input
                  type="date"
                  value={healthDetails.nomineeDOB}
                  onChange={(e) => setHealthDetails(prev => ({ ...prev, nomineeDOB: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Relationship</label>
                <select
                  value={healthDetails.nomineeRelationship}
                  onChange={(e) => setHealthDetails(prev => ({ ...prev, nomineeRelationship: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  {RELATIONSHIP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Aadhaar */}
          <div>
            <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
            <input
              type="text"
              value={healthDetails.aadhaarNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 12) setHealthDetails(prev => ({ ...prev, aadhaarNumber: val }));
              }}
              maxLength="12"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {healthDetails.aadhaarNumber && !validateAadhaar(healthDetails.aadhaarNumber) && (
              <p className="text-red-500 text-xs mt-1">Enter 12 digits</p>
            )}
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

          {/* PAN */}
          <div>
            <label className="text-sm font-medium text-gray-700">PAN Number</label>
            <input
              type="text"
              value={healthDetails.panNumber}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                if (val.length <= 10) setHealthDetails(prev => ({ ...prev, panNumber: val }));
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
              onChange={(e) => setHealthDetails(prev => ({ ...prev, panFile: e.target.files[0] }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Previous Year Policy */}
          <div>
            <label className="text-sm font-medium text-gray-700">Active Previous Policy?</label>
            <select
              value={healthDetails.hasPreviousPolicy}
              onChange={(e) => setHealthDetails(prev => ({ ...prev, hasPreviousPolicy: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              {YES_NO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {healthDetails.hasPreviousPolicy === "Yes" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Previous Insurer</label>
                <input
                  type="text"
                  value={healthDetails.previousInsurer}
                  onChange={(e) => setHealthDetails(prev => ({ ...prev, previousInsurer: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Policy Number</label>
                <input
                  type="text"
                  value={healthDetails.previousPolicyNumber}
                  onChange={(e) => setHealthDetails(prev => ({ ...prev, previousPolicyNumber: e.target.value }))}
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
                      setHealthDetails(prev => ({ ...prev, previousPolicyDueDate: e.target.value }));
                    } else {
                      alert("Due date must be Today or Tomorrow only");
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Upload PYP</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setHealthDetails(prev => ({ ...prev, previousPolicyFile: e.target.files[0] }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </>
          )}

          {/* Medical Remarks */}
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

                      {/* Insta Shield dependent dropdowns */}
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

                      {/* Other Rider fields */}
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
            onChange={(e) => setMotorDetails(prev => ({ ...prev, vehicleType: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {VEHICLE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Insurance Type</label>
          <select
            value={motorDetails.insuranceType}
            onChange={(e) => setMotorDetails(prev => ({ ...prev, insuranceType: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            {INSURANCE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Registration Number</label>
          <input
            type="text"
            value={motorDetails.registrationNumber}
            onChange={(e) => setMotorDetails(prev => ({ ...prev, registrationNumber: e.target.value.toUpperCase() }))}
            className="w-full p-2 border border-gray-300 rounded-lg uppercase"
          />
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

    return (
      <div className="border-t-2 border-indigo-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaMobileAlt /> Mobile/Electronic Equipment Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Device Type</label>
            <select
              value={electronicDetails.deviceType}
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, deviceType: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              {DEVICE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
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
              type="date"
              value={electronicDetails.dateOfPurchase}
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, dateOfPurchase: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {isDeviceOlderThan15Days() && (
              <p className="text-orange-500 text-xs mt-1">⚠️ Device is older than 15 days</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Purchase Value (incl. Tax)</label>
            <input
              type="number"
              value={electronicDetails.purchaseValue}
              onChange={(e) => setElectronicDetails(prev => ({ ...prev, purchaseValue: e.target.value }))}
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
                if (val.length <= 12) setElectronicDetails(prev => ({ ...prev, aadhaarNumber: val }));
              }}
              maxLength="12"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {electronicDetails.aadhaarNumber && !validateAadhaar(electronicDetails.aadhaarNumber) && (
              <p className="text-red-500 text-xs mt-1">Enter 12 digits</p>
            )}
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
              type="text"
              value={electronicDetails.panNumber}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                if (val.length <= 10) setElectronicDetails(prev => ({ ...prev, panNumber: val }));
              }}
              maxLength="10"
              className="w-full p-2 border border-gray-300 rounded-lg uppercase"
            />
            {electronicDetails.panNumber && !validatePAN(electronicDetails.panNumber) && (
              <p className="text-red-500 text-xs mt-1">Format: ABCDE1234F</p>
            )}
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
  const renderLeadFormModal = () => (
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

        <form onSubmit={handleCreateLead}>
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: toUpperCase(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg uppercase"
                required
                placeholder="Enter name in UPPERCASE"
              />
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
                type="text"
                value={formData.mobileNo}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({ ...formData, mobileNo: val });
                }}
                maxLength="10"
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
              {formData.mobileNo && !validateMobile(formData.mobileNo) && (
                <p className="text-red-500 text-xs mt-1">Enter 10 digits</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email ID</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {formData.email && !validateEmail(formData.email) && (
                <p className="text-red-500 text-xs mt-1">Invalid email format</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Pin/Zip Code</label>
              <input
                type="text"
                value={formData.pinCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 6) setFormData({ ...formData, pinCode: val });
                }}
                maxLength="6"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {formData.pinCode && !validatePIN(formData.pinCode) && (
                <p className="text-red-500 text-xs mt-1">Enter 6 digits</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">State</label>
              <input type="text" value={formData.state} readOnly className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">City</label>
              <input type="text" value={formData.city} readOnly className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" />
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
                value={formData.lob}
                onChange={(e) => setFormData({ ...formData, lob: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">-- Select LOB --</option>
                {LOB_OPTIONS.map(lob => <option key={lob} value={lob}>{lob}</option>)}
              </select>
            </div>
          </div>

          {/* LOB Specific Sections */}
          {showHealthSection && renderHealthForm()}
          {showMotorSection && renderMotorForm()}
          {showElectronicSection && renderElectronicForm()}

          {/* Actions */}
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

  // ============================================================
  // RENDER: EDIT MODAL
  // ============================================================
  const renderEditModal = () => (
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
            <FaEdit className="text-indigo-600" /> Update Lead Workflow
            <span className="text-sm font-normal text-gray-500 ml-2">(Admin Only)</span>
          </h2>
          <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleUpdateLead}>
          {/* Lead Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg mb-4">
            <div><span className="font-medium">Lead Code:</span> {editLead?.leadCode}</div>
            <div><span className="font-medium">Name:</span> {editLead?.name}</div>
            <div><span className="font-medium">Mobile:</span> {editLead?.mobileNo}</div>
            <div><span className="font-medium">LOB:</span> {editLead?.lob}</div>
          </div>

          {/* Workflow Form */}
          {renderWorkflowForm()}

          {/* Actions */}
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
                  <div>Proposer: {selectedLead.healthDetails.proposerName || "-"}</div>
                  <div>DOB: {selectedLead.healthDetails.proposerDOB || "-"}</div>
                  <div>Family Income: {selectedLead.healthDetails.familyIncome || "-"}</div>
                  <div>Senior One DOB: {selectedLead.healthDetails.seniorOneDOB || "-"}</div>
                  <div>Proposer is Member: {selectedLead.healthDetails.proposerIsMember || "-"}</div>
                </div>
                {selectedLead.healthDetails.members && selectedLead.healthDetails.members.length > 0 && (
                  <div className="mt-2">
                    <h5 className="font-medium text-sm">Members: {selectedLead.healthDetails.members.length}</h5>
                  </div>
                )}
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
      {/* Upload Status */}
      {uploadStatus.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${uploadStatus.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {uploadStatus.type === "success" ? "✓ " : "✗ "}{uploadStatus.message}
        </motion.div>
      )}

      {/* Renewal Alerts */}
      {renderRenewalAlerts()}

      {/* Controls */}
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

      {/* Search and Filters */}
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

      {/* Leads Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredLeads.length} of {leads.length} leads
            {globalSearch && ` | Search: "${globalSearch}"`}
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
                    <button onClick={() => deleteLead(lead._id)} className="text-red-600 hover:text-red-800">
                      <FaTrash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
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
                  <button onClick={() => deleteLead(lead._id)} className="text-red-600"><FaTrash className="h-5 w-5" /></button>
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

      {/* Modals */}
      {showLeadForm && renderLeadFormModal()}
      {showEditModal && renderEditModal()}
      {selectedLead && renderLeadDetails()}
    </div>
  );
}

export default InsuranceLeadManagement;