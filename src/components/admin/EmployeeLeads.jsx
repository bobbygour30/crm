// src/components/EmployeeLeads.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEdit, FaTrash, FaPlus, FaTimes, FaTimesCircle, FaSearch, FaCalendarAlt, FaDownload } from "react-icons/fa";
import * as XLSX from 'xlsx';

const lobOptions = [
  "Private Car-OD",
  "Private Car-SOD",
  "Private Car-Comprehensive",
  "Private Car-TP",
  "Taxi-Comprehensive",
  "Taxi-TP",
  "Commerical Vehicle-Comprehensive",
  "Commerical Vehicle-TP",
  "Two-Wheeler-TP",
  "My home",
  "Mediclaim Health Insurance",
  "Travel Insurance",
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

function EmployeeLeads() {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchPolicy, setSearchPolicy] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [newLead, setNewLead] = useState({
    employeeId: "",
    name: "",
    email: "",
    mobileNo: "",
    source: "",
    reference: "",
    status: "Open",
    policyNumber: "",
    lob: "",
    customLob: "",
    agency: "",
    customAgency: "",
    sumInsured: 0,
    endorsement: "",
    netPremium: 0,
    gst: 18,
    payout: 0,
    additionalPayout: 0,
    payoutStatus: "Pending",
    policyStartDate: "",
    policyExpiryDate: "",
    insurer: "",
    remarks: "",
  });

  useEffect(() => {
    fetchLeads();
    fetchEmployees();
  }, []);

  // Fetch leads from employee-leads endpoint (admin view of all employee leads)
  const fetchLeads = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found");
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching employee leads from /api/employee-leads...");
      // Fetch from employee-leads endpoint (admin can see all employee leads)
      const res = await fetch(`${API_BASE}/api/employee-leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Leads data received:", data);
        setLeads(data);
      } else {
        const error = await res.json();
        console.error("Error response:", error);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
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
        // Filter only employees
        const employeesOnly = data.filter(user => user.role === 'Employee');
        setEmployees(employeesOnly);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const calculate = (netPremium, gst, payout, additionalPayout) => {
    const net = parseFloat(netPremium) || 0;
    const gstRate = parseFloat(gst) || 18;
    const payoutPct = parseFloat(payout) || 0;
    const addPay = parseFloat(additionalPayout) || 0;

    const gstAmt = net * (gstRate / 100);
    const gross = net + gstAmt;
    const payoutVal = net * (payoutPct / 100);
    const total = payoutVal + addPay;

    return {
      gross: gross.toFixed(2),
      payoutVal: payoutVal.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const finalLob = newLead.lob === "Other Insurance" ? newLead.customLob : newLead.lob;
    const finalAgency = newLead.agency === "OTHERS" ? newLead.customAgency : newLead.agency;
    const { gross, payoutVal, total } = calculate(newLead.netPremium, newLead.gst, newLead.payout, newLead.additionalPayout);

    const payload = {
      employeeId: newLead.employeeId,
      name: newLead.name,
      email: newLead.email,
      mobileNo: newLead.mobileNo,
      source: newLead.source,
      reference: newLead.reference,
      policyNumber: newLead.policyNumber,
      lob: finalLob || newLead.lob,
      agency: finalAgency || newLead.agency,
      sumInsured: parseFloat(newLead.sumInsured) || 0,
      endorsement: newLead.endorsement,
      netPremium: parseFloat(newLead.netPremium) || 0,
      gst: parseFloat(newLead.gst) || 18,
      grossPremium: parseFloat(gross),
      payout: parseFloat(newLead.payout) || 0,
      payoutValue: parseFloat(payoutVal),
      additionalPayout: parseFloat(newLead.additionalPayout) || 0,
      totalPayment: parseFloat(total),
      payoutStatus: newLead.payoutStatus,
      status: newLead.status,
      policyStartDate: newLead.policyStartDate,
      policyExpiryDate: newLead.policyExpiryDate,
      insurer: newLead.insurer,
      remarks: newLead.remarks,
    };

    try {
      const res = await fetch(`${API_BASE}/api/employee-leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        setLeads([saved, ...leads]);
        setShowForm(false);
        resetForm();
        alert("Lead created successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save lead");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to save lead");
    }
  };

  const resetForm = () => {
    setNewLead({
      employeeId: "",
      name: "",
      email: "",
      mobileNo: "",
      source: "",
      reference: "",
      status: "Open",
      policyNumber: "",
      lob: "",
      customLob: "",
      agency: "",
      customAgency: "",
      sumInsured: 0,
      endorsement: "",
      netPremium: 0,
      gst: 18,
      payout: 0,
      additionalPayout: 0,
      payoutStatus: "Pending",
      policyStartDate: "",
      policyExpiryDate: "",
      insurer: "",
      remarks: "",
    });
  };

  const handleEdit = (lead) => {
    setEditLead({
      ...lead,
      customLob: lead.lob === "Other Insurance" ? lead.lob : "",
      customAgency: lead.agency === "OTHERS" ? lead.agency : "",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const finalLob = editLead.lob === "Other Insurance" ? editLead.customLob : editLead.lob;
    const finalAgency = editLead.agency === "OTHERS" ? editLead.customAgency : editLead.agency;
    const { gross, payoutVal, total } = calculate(editLead.netPremium, editLead.gst, editLead.payout, editLead.additionalPayout);

    const payload = {
      employeeId: editLead.employeeId?._id || editLead.employeeId,
      name: editLead.name,
      email: editLead.email,
      mobileNo: editLead.mobileNo,
      source: editLead.source,
      reference: editLead.reference,
      policyNumber: editLead.policyNumber,
      lob: finalLob || editLead.lob,
      agency: finalAgency || editLead.agency,
      sumInsured: parseFloat(editLead.sumInsured) || 0,
      endorsement: editLead.endorsement,
      netPremium: parseFloat(editLead.netPremium) || 0,
      gst: parseFloat(editLead.gst) || 18,
      grossPremium: parseFloat(gross),
      payout: parseFloat(editLead.payout) || 0,
      payoutValue: parseFloat(payoutVal),
      additionalPayout: parseFloat(editLead.additionalPayout) || 0,
      totalPayment: parseFloat(total),
      payoutStatus: editLead.payoutStatus,
      status: editLead.status,
      policyStartDate: editLead.policyStartDate,
      policyExpiryDate: editLead.policyExpiryDate,
      insurer: editLead.insurer,
      remarks: editLead.remarks,
    };

    try {
      const res = await fetch(`${API_BASE}/api/employee-leads/${editLead._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setLeads(leads.map(l => l._id === updated._id ? updated : l));
        setShowEditModal(false);
        setEditLead(null);
        alert("Lead updated successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update lead");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to update lead");
    }
  };

  const handleDelete = async (leadId) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/employee-leads/${leadId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setLeads(leads.filter(l => l._id !== leadId));
        alert("Lead deleted successfully!");
      } else {
        alert("Failed to delete lead");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error deleting lead");
    }
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
    return employee ? employee.username || employee.name || employee.email : "Unknown";
  };

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = filter === "All" || lead.status === filter;
    const matchesEmployee = !searchEmployee || getEmployeeName(lead.employeeId).toLowerCase().includes(searchEmployee.toLowerCase());
    const matchesName = !searchName || (lead.name && lead.name.toLowerCase().includes(searchName.toLowerCase()));
    const matchesPolicy = !searchPolicy || (lead.policyNumber && lead.policyNumber.toLowerCase().includes(searchPolicy.toLowerCase()));
    
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
    
    return matchesStatus && matchesEmployee && matchesName && matchesPolicy && matchesFromDate && matchesToDate;
  });

  const downloadExcel = () => {
    if (filteredLeads.length === 0) {
      alert("No leads to download.");
      return;
    }
    
    const excelData = filteredLeads.map((lead) => ({
      "Employee": getEmployeeName(lead.employeeId),
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
    setSearchEmployee('');
    setSearchName('');
    setSearchPolicy('');
    setFromDate('');
    setToDate('');
    setFilter('All');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 mt-20">
        <div className="text-center py-8">Loading employee leads...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Employee Leads</h1>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FaDownload /> Export Excel
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {showForm ? <FaTimes /> : <FaPlus />}
              {showForm ? "Cancel" : "Add Lead"}
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by policy number..."
                value={searchPolicy}
                onChange={(e) => setSearchPolicy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="Policy Issued">Policy Issued</option>
              <option value="Closed Without Issuance">Closed</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-2 items-center">
              <FaCalendarAlt className="text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="flex-1 p-2 border rounded-lg"
                placeholder="From Date"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="flex-1 p-2 border rounded-lg"
                placeholder="To Date"
              />
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
            >
              <FaTimesCircle /> Clear Filters
            </button>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
        </div>

        {/* Add Lead Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg mb-8 border"
          >
            <h2 className="text-xl font-semibold mb-6">Create New Lead</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <select
                required
                value={newLead.employeeId}
                onChange={(e) => setNewLead({ ...newLead, employeeId: e.target.value })}
                className="p-3 border rounded-lg"
              >
                <option value="">Select Employee *</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.username || emp.name}</option>
                ))}
              </select>
              <input
                placeholder="Customer Name *"
                required
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Mobile No *"
                required
                value={newLead.mobileNo}
                onChange={(e) => setNewLead({ ...newLead, mobileNo: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Source"
                value={newLead.source}
                onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Reference"
                value={newLead.reference}
                onChange={(e) => setNewLead({ ...newLead, reference: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Policy Number"
                value={newLead.policyNumber}
                onChange={(e) => setNewLead({ ...newLead, policyNumber: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <div>
                <select
                  value={newLead.lob}
                  onChange={(e) => setNewLead({ ...newLead, lob: e.target.value, customLob: e.target.value === "Other Insurance" ? newLead.customLob : "" })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">-- Select LOB --</option>
                  {lobOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                {newLead.lob === "Other Insurance" && (
                  <input
                    placeholder="Custom LOB"
                    value={newLead.customLob}
                    onChange={(e) => setNewLead({ ...newLead, customLob: e.target.value })}
                    className="mt-2 w-full p-3 border rounded-lg"
                  />
                )}
              </div>
              <div>
                <select
                  value={newLead.agency}
                  onChange={(e) => setNewLead({ ...newLead, agency: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">-- Select Agency --</option>
                  {agencyOptions.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                {newLead.agency === "OTHERS" && (
                  <input
                    placeholder="Custom Agency"
                    value={newLead.customAgency}
                    onChange={(e) => setNewLead({ ...newLead, customAgency: e.target.value })}
                    className="mt-2 w-full p-3 border rounded-lg"
                  />
                )}
              </div>
              <select
                value={newLead.insurer}
                onChange={(e) => setNewLead({ ...newLead, insurer: e.target.value })}
                className="p-3 border rounded-lg"
              >
                <option value="">-- Select Insurer --</option>
                {insurerOptions.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Sum Insured"
                value={newLead.sumInsured}
                onChange={(e) => setNewLead({ ...newLead, sumInsured: parseFloat(e.target.value) || 0 })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Endorsement"
                value={newLead.endorsement}
                onChange={(e) => setNewLead({ ...newLead, endorsement: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Start Date</label>
                <input
                  type="date"
                  value={newLead.policyStartDate}
                  onChange={(e) => setNewLead({ ...newLead, policyStartDate: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Expiry Date</label>
                <input
                  type="date"
                  value={newLead.policyExpiryDate}
                  onChange={(e) => setNewLead({ ...newLead, policyExpiryDate: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <input
                type="number"
                placeholder="Net Premium"
                value={newLead.netPremium}
                onChange={(e) => setNewLead({ ...newLead, netPremium: parseFloat(e.target.value) || 0 })}
                className="p-3 border rounded-lg"
              />
              <select
                value={newLead.gst}
                onChange={(e) => setNewLead({ ...newLead, gst: parseFloat(e.target.value) })}
                className="p-3 border rounded-lg"
              >
                {gstOptions.map((g) => (
                  <option key={g} value={g}>GST {g}%</option>
                ))}
              </select>
              <input
                readOnly
                value={formatCurrency(calculate(newLead.netPremium, newLead.gst, newLead.payout, newLead.additionalPayout).gross)}
                placeholder="Gross Premium"
                className="p-3 border rounded-lg bg-gray-100"
              />
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newLead.payout}
                  onChange={(e) => setNewLead({ ...newLead, payout: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newLead.payout}
                  onChange={(e) => setNewLead({ ...newLead, payout: parseFloat(e.target.value) })}
                  className="w-20 p-2 border rounded"
                />
                <span>%</span>
              </div>
              <input
                readOnly
                value={formatCurrency(calculate(newLead.netPremium, newLead.gst, newLead.payout, newLead.additionalPayout).payoutVal)}
                placeholder="Payout Value"
                className="p-3 border rounded-lg bg-gray-100"
              />
              <input
                type="number"
                placeholder="Additional Payout"
                value={newLead.additionalPayout}
                onChange={(e) => setNewLead({ ...newLead, additionalPayout: parseFloat(e.target.value) || 0 })}
                className="p-3 border rounded-lg"
              />
              <input
                readOnly
                value={formatCurrency(calculate(newLead.netPremium, newLead.gst, newLead.payout, newLead.additionalPayout).total)}
                placeholder="Total Payment"
                className="p-3 border rounded-lg bg-green-50 font-semibold text-green-700"
              />
              <select
                value={newLead.payoutStatus}
                onChange={(e) => setNewLead({ ...newLead, payoutStatus: e.target.value })}
                className="p-3 border rounded-lg"
              >
                <option value="Pending">Payout Status: Pending</option>
                <option value="Received">Payout Status: Received</option>
              </select>
              <select
                value={newLead.status}
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                className="p-3 border rounded-lg"
              >
                <option value="Open">Status: Open</option>
                <option value="Policy Issued">Status: Policy Issued</option>
                <option value="Closed Without Issuance">Status: Closed</option>
              </select>
              <textarea
                placeholder="Remarks"
                value={newLead.remarks}
                onChange={(e) => setNewLead({ ...newLead, remarks: e.target.value })}
                rows="2"
                className="p-3 border rounded-lg"
              />
              <button type="submit" className="md:col-span-2 lg:col-span-3 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Save Lead
              </button>
            </form>
          </motion.div>
        )}

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Employee</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Mobile</th>
                  <th className="p-4 text-left">Policy #</th>
                  <th className="p-4 text-left">LOB</th>
                  <th className="p-4 text-left">Net</th>
                  <th className="p-4 text-left">Gross</th>
                  <th className="p-4 text-left">Payout %</th>
                  <th className="p-4 text-left">Total Pay</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-8 text-gray-500">
                      No leads found. Click "Add Lead" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{getEmployeeName(lead.employeeId)}</td>
                      <td className="p-4 font-medium">{lead.name}</td>
                      <td className="p-4">{lead.mobileNo}</td>
                      <td className="p-4">{lead.policyNumber || "-"}</td>
                      <td className="p-4">{lead.lob || "-"}</td>
                      <td className="p-4">{formatCurrency(lead.netPremium)}</td>
                      <td className="p-4">{formatCurrency(lead.grossPremium)}</td>
                      <td className="p-4">{lead.payout}%</td>
                      <td className="p-4 font-semibold text-green-600">{formatCurrency(lead.totalPayment)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          lead.status === "Open" ? "bg-yellow-100 text-yellow-800" :
                          lead.status === "Policy Issued" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedLead(lead)} className="text-indigo-600 hover:text-indigo-800">
                            <FaEye size={18} />
                          </button>
                          <button onClick={() => handleEdit(lead)} className="text-blue-600 hover:text-blue-800">
                            <FaEdit size={18} />
                          </button>
                          <button onClick={() => handleDelete(lead._id)} className="text-red-600 hover:text-red-800">
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
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Lead Details</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Employee:</strong> {getEmployeeName(selectedLead.employeeId || selectedLead.user)}</div>
                <div><strong>Customer Name:</strong> {selectedLead.name}</div>
                <div><strong>Mobile:</strong> {selectedLead.mobileNo}</div>
                <div><strong>Email:</strong> {selectedLead.email || "-"}</div>
                <div><strong>Source:</strong> {selectedLead.source || "-"}</div>
                <div><strong>Reference:</strong> {selectedLead.reference || "-"}</div>
                <div><strong>Policy Number:</strong> {selectedLead.policyNumber || "-"}</div>
                <div><strong>LOB:</strong> {selectedLead.lob}</div>
                <div><strong>Agency:</strong> {selectedLead.agency}</div>
                <div><strong>Insurer:</strong> {selectedLead.insurer}</div>
                <div><strong>Sum Insured:</strong> {formatCurrency(selectedLead.sumInsured)}</div>
                <div><strong>Endorsement:</strong> {selectedLead.endorsement || "-"}</div>
                <div><strong>Policy Start:</strong> {formatDate(selectedLead.policyStartDate)}</div>
                <div><strong>Policy Expiry:</strong> {formatDate(selectedLead.policyExpiryDate)}</div>
                <div><strong>Net Premium:</strong> {formatCurrency(selectedLead.netPremium)}</div>
                <div><strong>GST %:</strong> {selectedLead.gst}%</div>
                <div><strong>Gross Premium:</strong> {formatCurrency(selectedLead.grossPremium)}</div>
                <div><strong>Payout %:</strong> {selectedLead.payout}%</div>
                <div><strong>Payout Value:</strong> {formatCurrency(selectedLead.payoutValue)}</div>
                <div><strong>Additional Payout:</strong> {formatCurrency(selectedLead.additionalPayout)}</div>
                <div><strong>Total Payment:</strong> <span className="text-green-600 font-bold">{formatCurrency(selectedLead.totalPayment)}</span></div>
                <div><strong>Payout Status:</strong> {selectedLead.payoutStatus}</div>
                <div><strong>Status:</strong> {selectedLead.status}</div>
                <div><strong>Created At:</strong> {formatDate(selectedLead.createdAt)}</div>
              </div>
              <div>
                <strong>Remarks:</strong>
                <p className="mt-1 text-gray-600">{selectedLead.remarks || "-"}</p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Edit Lead</h2>
              <button
                onClick={() => { setShowEditModal(false); setEditLead(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <select
                required
                value={editLead.employeeId?._id || editLead.employeeId || editLead.user?._id || editLead.user || ""}
                onChange={(e) => setEditLead({ ...editLead, employeeId: e.target.value, user: e.target.value })}
                className="p-3 border rounded-lg"
              >
                <option value="">Select Employee *</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.username || emp.name}</option>
                ))}
              </select>
              <input
                placeholder="Customer Name *"
                required
                value={editLead.name || ""}
                onChange={(e) => setEditLead({ ...editLead, name: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Mobile No *"
                required
                value={editLead.mobileNo || ""}
                onChange={(e) => setEditLead({ ...editLead, mobileNo: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Email"
                value={editLead.email || ""}
                onChange={(e) => setEditLead({ ...editLead, email: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Source"
                value={editLead.source || ""}
                onChange={(e) => setEditLead({ ...editLead, source: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Reference"
                value={editLead.reference || ""}
                onChange={(e) => setEditLead({ ...editLead, reference: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Policy Number"
                value={editLead.policyNumber || ""}
                onChange={(e) => setEditLead({ ...editLead, policyNumber: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <div>
                <select
                  value={editLead.lob || ""}
                  onChange={(e) => setEditLead({ ...editLead, lob: e.target.value, customLob: e.target.value === "Other Insurance" ? editLead.customLob : "" })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">-- Select LOB --</option>
                  {lobOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                {editLead.lob === "Other Insurance" && (
                  <input
                    placeholder="Custom LOB"
                    value={editLead.customLob || ""}
                    onChange={(e) => setEditLead({ ...editLead, customLob: e.target.value })}
                    className="mt-2 w-full p-3 border rounded-lg"
                  />
                )}
              </div>
              <div>
                <select
                  value={editLead.agency || ""}
                  onChange={(e) => setEditLead({ ...editLead, agency: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">-- Select Agency --</option>
                  {agencyOptions.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                {editLead.agency === "OTHERS" && (
                  <input
                    placeholder="Custom Agency"
                    value={editLead.customAgency || ""}
                    onChange={(e) => setEditLead({ ...editLead, customAgency: e.target.value })}
                    className="mt-2 w-full p-3 border rounded-lg"
                  />
                )}
              </div>
              <select
                value={editLead.insurer || ""}
                onChange={(e) => setEditLead({ ...editLead, insurer: e.target.value })}
                className="p-3 border rounded-lg"
              >
                <option value="">-- Select Insurer --</option>
                {insurerOptions.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Sum Insured"
                value={editLead.sumInsured || 0}
                onChange={(e) => setEditLead({ ...editLead, sumInsured: parseFloat(e.target.value) || 0 })}
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Endorsement"
                value={editLead.endorsement || ""}
                onChange={(e) => setEditLead({ ...editLead, endorsement: e.target.value })}
                className="p-3 border rounded-lg"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Start Date</label>
                <input
                  type="date"
                  value={editLead.policyStartDate ? editLead.policyStartDate.split('T')[0] : ""}
                  onChange={(e) => setEditLead({ ...editLead, policyStartDate: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Expiry Date</label>
                <input
                  type="date"
                  value={editLead.policyExpiryDate ? editLead.policyExpiryDate.split('T')[0] : ""}
                  onChange={(e) => setEditLead({ ...editLead, policyExpiryDate: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <input
                type="number"
                placeholder="Net Premium"
                value={editLead.netPremium || 0}
                onChange={(e) => setEditLead({ ...editLead, netPremium: parseFloat(e.target.value) || 0 })}
                className="p-3 border rounded-lg"
              />
              <select
                value={editLead.gst || 18}
                onChange={(e) => setEditLead({ ...editLead, gst: parseFloat(e.target.value) })}
                className="p-3 border rounded-lg"
              >
                {gstOptions.map((g) => (
                  <option key={g} value={g}>GST {g}%</option>
                ))}
              </select>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editLead.payout || 0}
                  onChange={(e) => setEditLead({ ...editLead, payout: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editLead.payout || 0}
                  onChange={(e) => setEditLead({ ...editLead, payout: parseFloat(e.target.value) })}
                  className="w-20 p-2 border rounded"
                />
                <span>%</span>
              </div>
              <input
                type="number"
                placeholder="Additional Payout"
                value={editLead.additionalPayout || 0}
                onChange={(e) => setEditLead({ ...editLead, additionalPayout: parseFloat(e.target.value) || 0 })}
                className="p-3 border rounded-lg"
              />
              <select
                value={editLead.payoutStatus || "Pending"}
                onChange={(e) => setEditLead({ ...editLead, payoutStatus: e.target.value })}
                className="p-3 border rounded-lg"
              >
                <option value="Pending">Payout Status: Pending</option>
                <option value="Received">Payout Status: Received</option>
              </select>
              <select
                value={editLead.status || "Open"}
                onChange={(e) => setEditLead({ ...editLead, status: e.target.value })}
                className="p-3 border rounded-lg"
              >
                <option value="Open">Status: Open</option>
                <option value="Policy Issued">Status: Policy Issued</option>
                <option value="Closed Without Issuance">Status: Closed</option>
              </select>
              <textarea
                placeholder="Remarks"
                value={editLead.remarks || ""}
                onChange={(e) => setEditLead({ ...editLead, remarks: e.target.value })}
                rows="2"
                className="p-3 border rounded-lg"
              />
              <div className="md:col-span-2 lg:col-span-3 flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditLead(null); }}
                  className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Update Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default EmployeeLeads;