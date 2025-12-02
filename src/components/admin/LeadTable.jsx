import { motion } from "framer-motion";
import { FaEye, FaEdit, FaSave, FaTimes, FaTrash, FaFilePdf } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";

function LeadTable({ filter, setFilter, setSelectedLead }) {
  const lobOptions = [
    "Private Car-OD",
    "Private Car-SOD",
    "Private Car-Comprehensive",
    "Private Car-TP",
    "Taxi-Comprehensive",
    "Taxi-TP",
    "Commerical Vehicle-Comprehensive",
    "Commerical Vehicle-TP",
    "E-Rikshaw-TP",
    "E-Rikshaw-Comprehensive",
    "Two-Wheeler-TP",
    "My home",
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
    "Treditional Plan",
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

  // === STATE ===
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]); // Real users from backend
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    mobileNo: "",
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
    policyPdf: null, // File object for new upload
  });

  const [selectedUsers, setSelectedUsers] = useState([]); // For form
  const [showFormDropdown, setShowFormDropdown] = useState(false);
  const [showLeadDropdowns, setShowLeadDropdowns] = useState({}); // Object for each lead
  const [showCustomAgency, setShowCustomAgency] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    mobileNo: "",
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
    policyPdf: null, // Current PDF object
    newPolicyPdf: null, // New file object for update
  });
  const [editSelectedUsers, setEditSelectedUsers] = useState([]);
  const [showEditCustomAgency, setShowEditCustomAgency] = useState(false);
  const [showEditFormDropdown, setShowEditFormDropdown] = useState(false);

  const formDropdownRef = useRef(null);
  const editFormDropdownRef = useRef(null);
  const leadDropdownRefs = useRef({}); // Map of refs for each lead
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  // === FETCH DATA ===
  useEffect(() => {
    fetchLeads();
    fetchAllUsers();
  }, []);

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

  // === CLICK OUTSIDE FOR DROPDOWNS ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Form dropdown
      if (formDropdownRef.current && !formDropdownRef.current.contains(event.target)) {
        setShowFormDropdown(false);
      }
      // Edit form dropdown
      if (editFormDropdownRef.current && !editFormDropdownRef.current.contains(event.target)) {
        setShowEditFormDropdown(false);
      }
      // Lead dropdowns
      Object.entries(leadDropdownRefs.current).forEach(([leadId, ref]) => {
        if (ref && !ref.contains(event.target)) {
          setShowLeadDropdowns(prev => ({ ...prev, [leadId]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === HELPERS ===
  const normalizeAssignedTo = (assignedTo) => {
    if (Array.isArray(assignedTo)) return assignedTo.map(id => typeof id === 'object' ? id._id : id);
    if (!assignedTo) return [];
    return [typeof assignedTo === 'object' ? assignedTo._id : assignedTo];
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

  const getLeadPayoutPercent = (lead) => lead.payout || 0;
  const getLeadNetPremium = (lead) => lead.netPremium || 0;
  const getLeadGSTPercent = (lead) => lead.gst || 0;
  const getLeadAdditionalPayout = (lead) => lead.additionalPayout || 0;

  const leadPayoutValue = (lead) =>
    computePayoutValue(getLeadNetPremium(lead), getLeadPayoutPercent(lead));
  const leadGrossPremium = (lead) =>
    lead.grossPremium ||
    computeGrossPremium(getLeadNetPremium(lead), getLeadGSTPercent(lead));
  const leadTotalPayment = (lead) =>
    lead.totalPayment ||
    computeTotalPayment(leadPayoutValue(lead), getLeadAdditionalPayout(lead));

  const formatNumber = (value) => (value ? value.toLocaleString() : "0");

  // === EDIT MODAL HELPERS ===
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
      policyPdf: lead.policyPdf || null, // Ensure null if missing
      newPolicyPdf: null, // Reset new file
    });
    setEditSelectedUsers(assignedTo);
    setShowEditCustomAgency(lead.agency === "OTHERS");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditLead(null);
    setEditData({
      name: "",
      email: "",
      mobileNo: "",
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
    });
    setEditSelectedUsers([]);
    setShowEditCustomAgency(false);
    setShowEditFormDropdown(false);
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
    formData.append('name', editData.name);
    formData.append('email', editData.email);
    formData.append('mobileNo', editData.mobileNo);
    formData.append('source', editData.source);
    formData.append('reference', editData.reference);
    formData.append('status', editData.status);
    formData.append('openStatus', editData.openStatus);
    formData.append('policyNumber', editData.policyNumber);
    formData.append('lob', finalLOB);
    formData.append('sumInsured', editData.sumInsured);
    formData.append('endorsement', editData.endorsement);
    formData.append('payout', editData.payoutPercent);
    formData.append('payoutValue', payoutValue);
    formData.append('netPremium', editData.netPremium);
    formData.append('gst', editData.gstPercent);
    formData.append('grossPremium', grossPremium);
    formData.append('additionalPayout', editData.additionalPayout);
    formData.append('totalPayment', totalPayment);
    formData.append('payoutStatus', editData.payoutStatus);
    formData.append('policyStartDate', editData.policyStartDate);
    formData.append('policyExpiryDate', editData.policyExpiryDate);
    formData.append('insurer', editData.insurer);
    formData.append('remarks', editData.remarks);
    formData.append('agency', finalAgency);
    editSelectedUsers.forEach(userId => formData.append('assignedTo', userId));

    if (editData.newPolicyPdf) {
      console.log('Uploading new PDF in edit:', editData.newPolicyPdf.name); // Debug log
      formData.append('policyPdf', editData.newPolicyPdf);
    }

    try {
      const res = await fetch(`${API_BASE}/api/leads/${editLead}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const updatedLead = await res.json();
        setLeads((prev) => prev.map((l) => (l._id === editLead ? updatedLead : l)));
        closeEditModal();
      } else {
        const errorData = await res.json();
        alert(`Failed to update lead: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating lead: " + err.message);
    }
  };

  // === ASSIGN LEAD ===
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
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    } else if (isEditForm) {
      setEditSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    } else {
      const lead = leads.find((l) => l._id === leadId);
      const current = normalizeAssignedTo(lead.assignedTo);
      const updated = current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId];
      assignLead(leadId, updated);
    }
  };

  // === DELETE LEAD ===
  const deleteLead = async (leadId) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/leads/${leadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // === ADD LEAD ===
  const handleAddLead = async (e) => {
    e.preventDefault();

    const payoutValue = computePayoutValue(newLead.netPremium, newLead.payoutPercent);
    const grossPremium = computeGrossPremium(newLead.netPremium, newLead.gstPercent);
    const totalPayment = computeTotalPayment(payoutValue, newLead.additionalPayout);

    const finalLOB = newLead.lobOption === "Other Insurance" ? newLead.lobCustom || "" : newLead.lobOption;
    const finalAgency = newLead.agency === "OTHERS" ? newLead.customAgency || "" : newLead.agency;

    const formData = new FormData();
    formData.append('name', newLead.name);
    formData.append('email', newLead.email);
    formData.append('mobileNo', newLead.mobileNo);
    formData.append('source', newLead.source);
    formData.append('reference', newLead.reference);
    formData.append('status', newLead.status);
    formData.append('openStatus', newLead.openStatus);
    formData.append('policyNumber', newLead.policyNumber);
    formData.append('lob', finalLOB);
    formData.append('sumInsured', newLead.sumInsured);
    formData.append('endorsement', newLead.endorsement);
    formData.append('payout', newLead.payoutPercent);
    formData.append('payoutValue', payoutValue);
    formData.append('netPremium', newLead.netPremium);
    formData.append('gst', newLead.gstPercent);
    formData.append('grossPremium', grossPremium);
    formData.append('additionalPayout', newLead.additionalPayout);
    formData.append('totalPayment', totalPayment);
    formData.append('payoutStatus', newLead.payoutStatus);
    formData.append('policyStartDate', newLead.policyStartDate);
    formData.append('policyExpiryDate', newLead.policyExpiryDate);
    formData.append('insurer', newLead.insurer);
    formData.append('remarks', newLead.remarks);
    formData.append('agency', finalAgency);
    selectedUsers.forEach(userId => formData.append('assignedTo', userId));

    if (newLead.policyPdf) {
      console.log('Uploading PDF:', newLead.policyPdf.name); // Debug log
      formData.append('policyPdf', newLead.policyPdf);
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const savedLead = await res.json();
        setLeads((prev) => [savedLead, ...prev]);
        resetForm();
      } else {
        const errorData = await res.json();
        alert(`Failed to save lead: ${errorData.error || 'Unknown error'}`);
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
    });
    setSelectedUsers([]);
    setShowLeadForm(false);
    setShowCustomAgency(false);
    setShowFormDropdown(false);
  };

  // === EXCEL UPLOAD ===
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/leads/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        fetchLeads();
        alert(`${result.count} leads uploaded successfully!`);
      } else {
        const error = await res.json();
        alert("Upload failed: " + (error.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Filtered leads
  const filteredLeads = leads.filter((lead) => filter === "All" || lead.status === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="flex gap-4">
          <button
            onClick={() => setShowLeadForm(!showLeadForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
          >
            {showLeadForm ? "Cancel" : "Add New Lead"}
          </button>
          <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer">
            Upload Excel
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
        <div className="w-full sm:w-auto">
          <select
            className="w-full sm:w-48 p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-all"
            value={filter || "All"}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Leads</option>
            <option value="Open">Open</option>
            <option value="Policy Issued">Policy Issued</option>
            <option value="Closed Without Issuance">
              Closed Without Issuance
            </option>
          </select>
        </div>
      </motion.div>

      {/* Lead Form */}
      {showLeadForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden"
        >
          <form
            onSubmit={handleAddLead}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newLead.name}
                onChange={(e) =>
                  setNewLead({ ...newLead, name: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Mobile No
              </label>
              <input
                type="text"
                value={newLead.mobileNo}
                onChange={(e) =>
                  setNewLead({ ...newLead, mobileNo: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={newLead.email}
                onChange={(e) =>
                  setNewLead({ ...newLead, email: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Source
              </label>
              <input
                type="text"
                value={newLead.source}
                onChange={(e) =>
                  setNewLead({ ...newLead, source: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Reference
              </label>
              <input
                type="text"
                value={newLead.reference}
                onChange={(e) =>
                  setNewLead({ ...newLead, reference: e.target.value })
                }
                placeholder="e.g. Facebook, Agent Name, Walk-in"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={newLead.status}
                onChange={(e) =>
                  setNewLead({ ...newLead, status: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="Open">Open</option>
                <option value="Policy Issued">Policy Issued</option>
                <option value="Closed Without Issuance">
                  Closed Without Issuance
                </option>
              </select>
            </div>

            {newLead.status === "Open" && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Next Step
                </label>
                <select
                  value={newLead.openStatus}
                  onChange={(e) =>
                    setNewLead({ ...newLead, openStatus: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="Closed">Closed</option>
                  <option value="Policy Issued">Policy Issued</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Policy Number
              </label>
              <input
                type="text"
                value={newLead.policyNumber}
                onChange={(e) =>
                  setNewLead({ ...newLead, policyNumber: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">LOB</label>
              <select
                value={newLead.lobOption}
                onChange={(e) =>
                  setNewLead({
                    ...newLead,
                    lobOption: e.target.value,
                    lobCustom: "",
                  })
                }
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
                  onChange={(e) =>
                    setNewLead({ ...newLead, lobCustom: e.target.value })
                  }
                  className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Agency
              </label>
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
                  onChange={(e) =>
                    setNewLead({ ...newLead, customAgency: e.target.value })
                  }
                  className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Sum Insured
              </label>
              <input
                type="number"
                value={newLead.sumInsured}
                onChange={(e) =>
                  setNewLead({
                    ...newLead,
                    sumInsured: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Endorsement
              </label>
              <input
                type="text"
                value={newLead.endorsement}
                onChange={(e) =>
                  setNewLead({ ...newLead, endorsement: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Net Premium
              </label>
              <input
                type="number"
                value={newLead.netPremium}
                onChange={(e) =>
                  setNewLead({
                    ...newLead,
                    netPremium: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">GST %</label>
              <select
                value={newLead.gstPercent}
                onChange={(e) =>
                  setNewLead({
                    ...newLead,
                    gstPercent: parseFloat(e.target.value) || 0,
                  })
                }
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
              <label className="text-sm font-medium text-gray-700">
                Gross Premium
              </label>
              <input
                type="text"
                readOnly
                value={formatCurrency(
                  computeGrossPremium(newLead.netPremium, newLead.gstPercent)
                )}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Payout (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={newLead.payoutPercent}
                  onChange={(e) =>
                    setNewLead({
                      ...newLead,
                      payoutPercent: clampPercent(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newLead.payoutPercent}
                  onChange={(e) =>
                    setNewLead({
                      ...newLead,
                      payoutPercent: clampPercent(e.target.value),
                    })
                  }
                  className="w-20 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Payout (calc)
              </label>
              <input
                type="text"
                readOnly
                value={formatCurrency(
                  computePayoutValue(newLead.netPremium, newLead.payoutPercent)
                )}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Additional Payout
              </label>
              <input
                type="number"
                value={newLead.additionalPayout}
                onChange={(e) =>
                  setNewLead({
                    ...newLead,
                    additionalPayout: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Total Payment
              </label>
              <input
                type="text"
                readOnly
                value={formatCurrency(
                  computeTotalPayment(
                    computePayoutValue(
                      newLead.netPremium,
                      newLead.payoutPercent
                    ),
                    newLead.additionalPayout
                  )
                )}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Payout Status
              </label>
              <select
                value={newLead.payoutStatus}
                onChange={(e) =>
                  setNewLead({ ...newLead, payoutStatus: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select --</option>
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Policy Start
              </label>
              <input
                type="date"
                value={newLead.policyStartDate}
                onChange={(e) =>
                  setNewLead({ ...newLead, policyStartDate: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Policy Expiry
              </label>
              <input
                type="date"
                value={newLead.policyExpiryDate}
                onChange={(e) =>
                  setNewLead({ ...newLead, policyExpiryDate: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Insurer
              </label>
              <select
                value={newLead.insurer}
                onChange={(e) =>
                  setNewLead({ ...newLead, insurer: e.target.value })
                }
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

            {/* Policy Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Upload</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  setNewLead({ ...newLead, policyPdf: e.target.files[0] })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {newLead.policyPdf && (
                <p className="text-sm text-gray-500 mt-1">{newLead.policyPdf.name}</p>
              )}
            </div>

            {/* ASSIGN TO - MULTI SELECT FOR FORM */}
            <div className="relative" ref={formDropdownRef}>
              <label className="text-sm font-medium text-gray-700">
                Assign To
              </label>
              <button
                type="button"
                onClick={() =>
                  setShowFormDropdown(!showFormDropdown)
                }
                className="w-full p-2 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50"
              >
                {selectedUsers.length > 0
                  ? selectedUsers.map(getUserName).join(", ")
                  : "-- Select Users --"}
              </button>
              {showFormDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="p-3 text-gray-500">Loading users...</div>
                  ) : (
                    users.map((user) => (
                      <label
                        key={user._id}
                        className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() =>
                            toggleUserSelection(null, user._id, true)
                          }
                          className="mr-3"
                        />
                        <span className="text-sm">
                          {user.username || user.name || user.email}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              <label className="text-sm font-medium text-gray-700">
                Remarks
              </label>
              <textarea
                value={newLead.remarks}
                onChange={(e) =>
                  setNewLead({ ...newLead, remarks: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="3"
              ></textarea>
            </div>

            <div className="lg:col-span-3">
              <button
                type="submit"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium"
              >
                Submit
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full"
          >
            <h2 className="text-xl font-bold mb-4">Edit Lead</h2>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mobile No</label>
                <input
                  type="text"
                  value={editData.mobileNo}
                  onChange={(e) => setEditData({ ...editData, mobileNo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
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
                <input
                  type="text"
                  value={editData.source}
                  onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
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
                  <option value="Open">Open</option>
                  <option value="Policy Issued">Policy Issued</option>
                  <option value="Closed Without Issuance">Closed Without Issuance</option>
                </select>
              </div>
              {editData.status === "Open" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Next Step</label>
                  <select
                    value={editData.openStatus}
                    onChange={(e) => setEditData({ ...editData, openStatus: e.target.value })}
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
                  value={editData.policyNumber}
                  onChange={(e) => setEditData({ ...editData, policyNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">LOB</label>
                <select
                  value={editData.lobOption}
                  onChange={(e) => {
                    setEditData({
                      ...editData,
                      lobOption: e.target.value,
                      lobCustom: "",
                    });
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
                <label className="text-sm font-medium text-gray-700">Endorsement</label>
                <input
                  type="text"
                  value={editData.endorsement}
                  onChange={(e) => setEditData({ ...editData, endorsement: e.target.value })}
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
                <label className="text-sm font-medium text-gray-700">Gross Premium</label>
                <input
                  type="text"
                  readOnly
                  value={formatCurrency(computeGrossPremium(editData.netPremium, editData.gstPercent))}
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
                <label className="text-sm font-medium text-gray-700">Payout (calc)</label>
                <input
                  type="text"
                  readOnly
                  value={formatCurrency(computePayoutValue(editData.netPremium, editData.payoutPercent))}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                />
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
                <label className="text-sm font-medium text-gray-700">Total Payment</label>
                <input
                  type="text"
                  readOnly
                  value={formatCurrency(computeTotalPayment(computePayoutValue(editData.netPremium, editData.payoutPercent), editData.additionalPayout))}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Payout Status</label>
                <select
                  value={editData.payoutStatus}
                  onChange={(e) => setEditData({ ...editData, payoutStatus: e.target.value })}
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

              {/* Policy Upload in Edit */}
              <div>
                <label className="text-sm font-medium text-gray-700">Policy Upload</label>
                {editData.policyPdf?.url && (
                  <div className="mb-2">
                    <a
                      href={editData.policyPdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm flex items-center gap-1"
                    >
                      <FaFilePdf className="h-4 w-4" />
                      Current PDF
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setEditData({ ...editData, newPolicyPdf: e.target.files[0] })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {editData.newPolicyPdf && (
                  <p className="text-sm text-gray-500 mt-1">{editData.newPolicyPdf.name}</p>
                )}
              </div>

              <div className="relative" ref={editFormDropdownRef}>
                <label className="text-sm font-medium text-gray-700">Assign To</label>
                <button
                  type="button"
                  onClick={() => setShowEditFormDropdown(!showEditFormDropdown)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50"
                >
                  {editSelectedUsers.length > 0
                    ? editSelectedUsers.map(getUserName).join(", ")
                    : "-- Select Users --"}
                </button>
                {showEditFormDropdown && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {users.length === 0 ? (
                      <div className="p-3 text-gray-500">Loading users...</div>
                    ) : (
                      users.map((user) => (
                        <label
                          key={user._id}
                          className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={editSelectedUsers.includes(user._id)}
                            onChange={() => toggleUserSelection(null, user._id, false, true)}
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
                  value={editData.remarks}
                  onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows="3"
                ></textarea>
              </div>
              <div className="lg:col-span-3 flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Update Lead
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full table-auto min-w-full">
            <thead>
              <tr className="bg-gray-100 text-left text-xs">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Policy #</th>
                <th className="p-3">LOB</th>
                <th className="p-3">Agency</th>
                <th className="p-3">Sum Ins</th>
                <th className="p-3">Net Prem</th>
                <th className="p-3">GST %</th>
                <th className="p-3">Gross Prem</th>
                <th className="p-3">Payout %</th>
                <th className="p-3">Payout Val</th>
                <th className="p-3">Add Pay</th>
                <th className="p-3">Total Pay</th>
                <th className="p-3">Pay Status</th>
                <th className="p-3">Insurer</th>
                <th className="p-3">Policy PDF</th>
                <th className="p-3">Source</th>
                <th className="p-3">Reference</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const assignedTo = normalizeAssignedTo(lead.assignedTo);
                const currentShowDropdown = showLeadDropdowns[lead._id] || false;

                return (
                  <motion.tr
                    key={lead._id}
                    className="border-b hover:bg-gray-50 text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="p-3">{lead.name}</td>
                    <td className="p-3">{lead.email}</td>
                    <td className="p-3">{lead.mobileNo}</td>
                    <td className="p-3">{lead.policyNumber}</td>
                    <td className="p-3">{lead.lob}</td>
                    <td className="p-3">{lead.agency}</td>
                    <td className="p-3">{formatNumber(lead.sumInsured)}</td>
                    <td className="p-3">{formatCurrency(getLeadNetPremium(lead))}</td>
                    <td className="p-3">{getLeadGSTPercent(lead)}%</td>
                    <td className="p-3">{formatCurrency(leadGrossPremium(lead))}</td>
                    <td className="p-3">{getLeadPayoutPercent(lead)}%</td>
                    <td className="p-3">{formatCurrency(leadPayoutValue(lead))}</td>
                    <td className="p-3">{formatCurrency(getLeadAdditionalPayout(lead))}</td>
                    <td className="p-3">{formatCurrency(leadTotalPayment(lead))}</td>
                    <td className="p-3">{lead.payoutStatus || "Pending"}</td>
                    <td className="p-3">{lead.insurer}</td>
                    <td className="p-3">
                      {lead.policyPdf?.url ? (
                        <a
                          href={lead.policyPdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1 text-xs"
                        >
                          <FaFilePdf className="h-4 w-4" />
                          View PDF
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">{lead.source}</td>
                    <td className="p-3">{lead.reference || "-"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          lead.status === "Open"
                            ? "bg-yellow-100 text-yellow-800"
                            : lead.status === "Policy Issued"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {assignedTo
                        .map(getUserName)
                        .join(", ") || "Unassigned"}
                    </td>
                    <td className="p-3 flex gap-2 items-center">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <FaEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(lead)}
                        className="text-blue-600 hover:text-blue-800"
                      >
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
                              <label
                                key={user._id}
                                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer text-xs"
                              >
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
                      <button
                        onClick={() => deleteLead(lead._id)}
                        className="text-red-600 hover:text-red-800"
                      >
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
          {filteredLeads.map((lead) => {
            const assignedTo = normalizeAssignedTo(lead.assignedTo);
            const currentShowDropdown = showLeadDropdowns[lead._id] || false;

            return (
              <div
                key={lead._id}
                className="border rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {lead.name}</div>
                  <div><strong>Mobile:</strong> {lead.mobileNo}</div>
                  <div><strong>Email:</strong> {lead.email}</div>
                  <div><strong>Policy #:</strong> {lead.policyNumber}</div>
                  <div><strong>LOB:</strong> {lead.lob}</div>
                  <div><strong>Agency:</strong> {lead.agency}</div>
                  <div><strong>Net Prem:</strong> {formatCurrency(getLeadNetPremium(lead))}</div>
                  <div><strong>Gross:</strong> {formatCurrency(leadGrossPremium(lead))}</div>
                  <div><strong>Payout:</strong> {getLeadPayoutPercent(lead)}% → {formatCurrency(leadPayoutValue(lead))}</div>
                  <div><strong>Total Pay:</strong> {formatCurrency(leadTotalPayment(lead))}</div>
                  <div><strong>Policy PDF:</strong> {lead.policyPdf?.url ? (
                    <a href={lead.policyPdf.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 flex items-center gap-1">
                      <FaFilePdf className="h-4 w-4" /> View
                    </a>
                  ) : "-" }</div>
                  <div><strong>Source:</strong> {lead.source}</div>
                  <div><strong>Reference:</strong> {lead.reference || "-"}</div>
                  <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${lead.status === "Open" ? "bg-yellow-100 text-yellow-800" : lead.status === "Policy Issued" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{lead.status}</span></div>
                  <div><strong>Assigned:</strong> {assignedTo.map(getUserName).join(", ") || "Unassigned"}</div>
                  <div className="pt-2 flex gap-3">
                    <button onClick={() => setSelectedLead(lead)} className="text-indigo-600">
                      <FaEye className="h-5 w-5" />
                    </button>
                    <button onClick={() => openEditModal(lead)} className="text-blue-600">
                      <FaEdit className="h-5 w-5" />
                    </button>
                    <div className="relative" ref={(el) => (leadDropdownRefs.current[lead._id] = el)}>
                      <button
                        onClick={() => setShowLeadDropdowns((prev) => ({ ...prev, [lead._id]: !currentShowDropdown }))}
                        className="text-xs px-3 py-1 border rounded bg-white"
                      >
                        Assign
                      </button>
                      {currentShowDropdown && (
                        <div className="absolute z-50 mt-2 w-full bg-white border rounded p-2 max-h-40 overflow-y-auto">
                          {users.map((user) => (
                            <label key={user._id} className="flex items-center gap-2 text-xs block py-1">
                              <input
                                type="checkbox"
                                checked={assignedTo.includes(user._id)}
                                onChange={() => toggleUserSelection(lead._id, user._id)}
                              />
                              {getUserName(user._id)}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => deleteLead(lead._id)} className="text-red-600">
                      <FaTrash className="h-5 w-5" />
                    </button>
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