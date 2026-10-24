// src/components/EmployeeLeads.jsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaEye, FaEdit, FaTimes, FaTrash, FaSearch, FaFilter, FaFileExcel, FaUser, FaPhone, FaSpinner,
  FaCheckCircle, FaExclamationTriangle, FaClock, FaFileAlt, FaMoneyBillWave,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import LeadCaseForm from "../lob/LeadCaseForm";
import useLeadCase from "../lob/useLeadCase";
import { getDisplayManufacturer } from "../lob/motorInsurance";
import { getStage, inferStage, getAcceptedQuote, collectDocuments, fmt, CASE_STATUS_LIST, STAGES, statusBadgeClass } from "../lob/caseWorkflow";

const statusClass = statusBadgeClass; // shared colours (incl. motor inspection statuses)

const statusIcon = (status) => {
  if (status === "Policy Issued" || status === "Payment Done") return <FaCheckCircle />;
  if (status === "Payment Link Generated") return <FaMoneyBillWave />;
  if (status === "Quotation Generated" || status === "Quote Requested") return <FaFileAlt />;
  if (status === "Closed Without Issuance") return <FaExclamationTriangle />;
  return <FaClock />;
};

function EmployeeLeads() {
  const c = useLeadCase({ quoteFilePrefix: "insurerQuoteFile_" });

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

  const [globalSearch, setGlobalSearch] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPolicy, setSearchPolicy] = useState("");
  const [searchLOB, setSearchLOB] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filter, setFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const filterDropdownRef = useRef(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  // ============================================================
  // DATA
  // ============================================================
  const fetchLeads = async () => {
    if (!localStorage.getItem("token")) {
      setError("No authentication token found. Please login again.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/user-leads`, { headers: authHeaders() });
      if (res.ok) {
        setLeads(await res.json());
        setError(null);
      } else if (res.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || data.message || `Server error: ${res.status}`);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/users`, { headers: authHeaders() });
      if (res.ok) setEmployees(await res.json());
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;
    const t = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(t);
  }, [successMessage]);

  useEffect(() => {
    if (!error) return undefined;
    const t = setTimeout(() => setError(null), 6000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    const onClick = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) setFilterDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================
  const getEmployeeName = (employeeId) => {
    if (!employeeId) return "Unknown";
    const e = typeof employeeId === "object" ? employeeId : employees.find((x) => x._id === employeeId);
    return e ? e.fullName || e.organizationName || e.username || e.name || e.email || "Unknown" : "Unknown";
  };

  const sourceEmployees = employees.filter((u) => u.userType === "Employee" || u.role === "Employee");
  const sourcePartners = employees.filter((u) => u.userType === "Channel Partner" || u.role === "Channel Partner");

  // ============================================================
  // EDIT (staged)
  // ============================================================
  const handleEdit = (lead) => {
    setEditLead(lead);
    c.hydrate(lead);
    setShowEditModal(true);
  };

  const serverErrors = (data) =>
    data?.errors
      ? data.errors.map((m) => ({ field: "general", message: typeof m === "string" ? m : JSON.stringify(m) }))
      : [{ field: "general", message: data?.error || data?.message || "Update failed" }];

  const submitUpdate = async (stage, keepOpen) => {
    if (!editLead?._id) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/user-leads/${editLead._id}`, { method: "PUT", headers: authHeaders(), body: c.buildFormData(stage) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        c.showErrors(serverErrors(data));
        return;
      }
      setLeads((prev) => prev.map((l) => (l._id === data._id ? data : l)));
      if (keepOpen) {
        setEditLead(data);
        c.hydrate(data);
        setSuccessMessage(`Moved to ${getStage(stage).label}.`);
      } else {
        setShowEditModal(false);
        setEditLead(null);
        setSuccessMessage("Lead updated successfully!");
      }
    } catch (err) {
      console.error("Update error:", err);
      c.showErrors([{ field: "general", message: "Network error. Please try again." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => {
    if (!c.validateForSave()) return;
    submitUpdate(c.caseStage, false);
  };

  const handleAdvance = () => {
    if (!c.validateForAdvance()) return;
    submitUpdate(c.nextStage, true);
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/user-leads/${leadId}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l._id !== leadId));
        setSuccessMessage("Lead deleted successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to delete lead");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Network error. Please try again.");
    }
  };

  // ============================================================
  // FILTERS
  // ============================================================
  const filteredLeads = leads.filter((lead) => {
    const q = globalSearch.toLowerCase().trim();
    const matchesGlobal = !q || [lead.policyNumber, lead.leadCode, lead.email, lead.name, lead.lob]
      .some((v) => v && String(v).toLowerCase().includes(q)) || (lead.mobileNo && lead.mobileNo.includes(q));
    const created = lead.createdAt ? new Date(lead.createdAt) : null;
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
    return (
      matchesGlobal &&
      (filter === "All" || lead.status === filter) &&
      (stageFilter === "All" || inferStage(lead) === stageFilter) &&
      (!searchEmployee || getEmployeeName(lead.employeeId).toLowerCase().includes(searchEmployee.toLowerCase())) &&
      (!searchName || (lead.name || "").toLowerCase().includes(searchName.toLowerCase())) &&
      (!searchPolicy || (lead.policyNumber || "").toLowerCase().includes(searchPolicy.toLowerCase())) &&
      (!searchLOB || (lead.lob || "").toLowerCase().includes(searchLOB.toLowerCase())) &&
      (!from || (created && created >= from)) &&
      (!to || (created && created <= to))
    );
  });

  const filtersActive = !!(searchEmployee || searchName || searchPolicy || searchLOB || fromDate || toDate || filter !== "All" || stageFilter !== "All");
  const clearFilters = () => {
    setGlobalSearch(""); setSearchEmployee(""); setSearchName(""); setSearchPolicy(""); setSearchLOB("");
    setFromDate(""); setToDate(""); setFilter("All"); setStageFilter("All");
  };

  // ============================================================
  // EXPORT
  // ============================================================
  const downloadExcel = () => {
    if (!filteredLeads.length) {
      setError("No leads to download.");
      return;
    }
    const rows = filteredLeads.map((l) => {
      const wf = l.workflowDetails || {};
      const accepted = getAcceptedQuote(wf);
      return {
        Employee: getEmployeeName(l.employeeId), "Lead Code": l.leadCode || "", "Customer Name": l.name || "",
        Mobile: l.mobileNo || "", Email: l.email || "", LOB: l.lob || "", Stage: getStage(inferStage(l)).label, Status: l.status || "",
        "Paying Term": l.paymentTerm || "", "Sum Insured": l.sumInsured || "",
        "Accepted Insurer": accepted?.insurerName || "", "Quote Net Premium": accepted?.netPremium || "",
        "Final Net Premium": wf.finalNetPremium || "", "Gross Premium": wf.finalGrossPremium || "",
        "Policy Number": l.policyNumber || wf.policyNumber || "",
        "Policy Start Date": l.policyStartDate ? new Date(l.policyStartDate).toLocaleDateString() : "",
        "Policy Expiry Date": l.policyExpiryDate ? new Date(l.policyExpiryDate).toLocaleDateString() : "",
        "EMIs Received": wf.emiReceivedCount || "", "EMI Total": wf.emiTotalCount || "",
        "Cashback Total": l.cashbackDetails?.totalPayout ?? "", "Cashback Status": l.cashbackDetails?.status || "",
        "Grand Total PayOut": l.payoutDetails?.grandTotalPayout ?? "", "Arshyan Profit": l.payoutDetails?.arshyanProfit ?? "",
        "Motor Policy Type": l.motorDetails?.policyType || "", "Vehicle Type": l.motorDetails?.vehicleType || "",
        "Registration / RTO": l.motorDetails?.registrationNumber || l.motorDetails?.rtoCode || "",
        "Vehicle Manufacturer": getDisplayManufacturer(l.motorDetails),
        "Device (Make & Model)": l.electronicDetails?.makeModel || "", "IMEI / Serial": l.electronicDetails?.imeiNumber || "", "Product": l.workflowDetails?.product || "", "Vehicle Model": l.motorDetails?.model || "",
        "Created At": l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Leads");
    XLSX.writeFile(wb, `employee_leads_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // ============================================================
  // RENDER: EDIT MODAL
  // ============================================================
  const renderEditModal = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowEditModal(false)}>
      <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-6xl max-h-[92vh] overflow-y-auto w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-3 sticky top-0 bg-white z-20 pb-3 border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><FaEdit className="text-indigo-600" /> {editLead?.leadCode} — {editLead?.name}</h2>
            <p className="text-xs text-gray-500 mt-1">
              By {getEmployeeName(editLead?.employeeId)} · {editLead?.lob} ·{" "}
              <span className={`px-2 py-0.5 rounded-full ${statusClass(editLead?.status)}`}>{editLead?.status}</span>
            </p>
          </div>
          <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close"><FaTimes className="h-5 w-5" /></button>
        </div>
        {successMessage && <div className="mb-3 p-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2"><FaCheckCircle /> {successMessage}</div>}
        <LeadCaseForm
          c={c} mode="edit" employees={sourceEmployees} channelPartners={sourcePartners}
          isSubmitting={isSubmitting} onCancel={() => setShowEditModal(false)} onSave={handleSave} onAdvance={handleAdvance}
        />
      </motion.div>
    </motion.div>
  );

  // ============================================================
  // RENDER: DETAILS
  // ============================================================
  const renderLeadDetails = () => {
    if (!selectedLead) return null;
    const l = selectedLead;
    const wf = l.workflowDetails || {};
    const accepted = getAcceptedQuote(wf);
    const docs = collectDocuments(l);
    const item = (label, value) => <div><span className="font-medium">{label}:</span> {value || value === 0 ? value : "-"}</div>;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedLead(null)}>
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-xl font-bold">Lead Details</h2>
            <button onClick={() => setSelectedLead(null)} className="text-gray-500 hover:text-gray-700"><FaTimes className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {item("Employee", getEmployeeName(l.employeeId))}
            {item("Lead Code", l.leadCode)}
            {item("Stage", getStage(inferStage(l)).label)}
            <div><span className="font-medium">Status:</span> <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${statusClass(l.status)}`}>{l.status}</span></div>
            {item("Name", l.name)}
            {item("Mobile", l.mobileNo)}
            {item("Email", l.email)}
            {item("LOB", l.lob)}
            {item("Policy Tenure / Paying Term", [l.policyTenure, l.paymentTerm].filter(Boolean).join(" / "))}
            {item("Sum Insured", l.sumInsured)}
            {l.motorDetails && item("Vehicle", [l.motorDetails.policyType, l.motorDetails.vehicleType, getDisplayManufacturer(l.motorDetails), l.motorDetails.model, l.motorDetails.registrationNumber || l.motorDetails.rtoCode].filter(Boolean).join(" · "))}
            {l.electronicDetails && item("Device", [l.electronicDetails.deviceType, l.electronicDetails.makeModel, l.electronicDetails.imeiNumber && `IMEI/Serial ${l.electronicDetails.imeiNumber}`, l.workflowDetails?.product].filter(Boolean).join(" · "))}
            {l.healthDetails && item("Health", [l.healthDetails.policyType, l.healthDetails.proposerName, `${l.healthDetails.members?.length || 0} member(s)`].filter(Boolean).join(" · "))}
            {item("Insurers Requested", (wf.selectedInsurers || []).join(", "))}
            {item("Accepted Quote", accepted ? `${accepted.insurerName} — ₹${fmt(accepted.netPremium)} net` : "")}
            {item("Payment Status", wf.paymentStatus)}
            {item("Policy Number", l.policyNumber || wf.policyNumber)}
            {wf.emiTotalCount ? item("EMIs", `${wf.emiReceivedCount || 0} / ${wf.emiTotalCount}${wf.emiRenewalAlert ? " (Renewal Alert)" : ""}`) : null}
            {l.cashbackDetails && item("Cashback", `₹${fmt(l.cashbackDetails.totalPayout)} to ${l.cashbackDetails.payoutTo || "Customer"} (${l.cashbackDetails.status || "Pending"})`)}
            {l.payoutDetails?.arshyanProfit !== undefined && item("Arshyan Profit", `₹${fmt(l.payoutDetails.arshyanProfit)}`)}
            <div className="sm:col-span-2">{item("Remarks", l.remarks)}</div>
          </div>
          <div className="mt-4 border-t pt-3">
            <h4 className="font-semibold text-indigo-600 mb-2">Documents ({docs.length})</h4>
            {docs.length ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                {docs.map((d, i) => <li key={i}><a className="text-indigo-600 hover:underline" href={d.url} target="_blank" rel="noopener noreferrer">{d.group}: {d.label}</a></li>)}
              </ul>
            ) : <p className="text-sm text-gray-500">No documents uploaded yet.</p>}
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t gap-3">
            <button onClick={() => { const x = selectedLead; setSelectedLead(null); handleEdit(x); }} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"><FaEdit /> Open Case</button>
            <button onClick={() => setSelectedLead(null)} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Close</button>
          </div>
        </motion.div>
      </motion.div>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Employee Leads</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all leads created by employees</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0 flex-wrap">
          <button onClick={downloadExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><FaFileExcel /> Export Excel</button>
          <button onClick={fetchLeads} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"><FaSpinner className="h-4 w-4" /> Refresh</button>
        </div>
      </div>

      {successMessage && !showEditModal && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
          <FaCheckCircle className="text-green-500" /> <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto"><FaTimes /></button>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500" /> <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><FaTimes /></button>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-6">
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search: Policy Number, Lead Code, Mobile, Email, Name, LOB..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative" ref={filterDropdownRef}>
            <button onClick={() => setFilterDropdownOpen(!filterDropdownOpen)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <FaFilter /> Advanced Filters{filtersActive && " (Active)"}
            </button>
            {filterDropdownOpen && (
              <div className="absolute z-40 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-h-96 overflow-y-auto space-y-3">
                {[["Employee", searchEmployee, setSearchEmployee], ["Customer Name", searchName, setSearchName], ["Policy Number", searchPolicy, setSearchPolicy], ["LOB", searchLOB, setSearchLOB]].map(([label, value, set]) => (
                  <div key={label}>
                    <label className="text-sm font-medium text-gray-700">{label}</label>
                    <input type="text" value={value} onChange={(e) => set(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium text-gray-700">Stage</label>
                  <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                    <option value="All">All Stages</option>
                    {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created Between</label>
                  <div className="flex gap-2">
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" />
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="All">All Status</option>
            {CASE_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(filtersActive || globalSearch) && <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800">Clear filters</button>}
          <span className="text-sm text-gray-500 ml-auto">Showing {filteredLeads.length} of {leads.length} leads</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Employee</th><th className="p-4 text-left">Lead Code</th><th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Mobile</th><th className="p-4 text-left">LOB</th><th className="p-4 text-left">Stage</th>
                <th className="p-4 text-left">Status</th><th className="p-4 text-left">Policy #</th><th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    <FaSearch className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>{leads.length === 0 ? "No leads have been created yet." : "No leads match your filters"}</p>
                    {leads.length > 0 && <button onClick={clearFilters} className="text-indigo-600 hover:text-indigo-800">Clear filters</button>}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="border-b hover:bg-gray-50">
                    <td className="p-4"><div className="flex items-center gap-2"><FaUser className="text-gray-400" />{getEmployeeName(lead.employeeId)}</div></td>
                    <td className="p-4"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{lead.leadCode || "-"}</span></td>
                    <td className="p-4 font-medium">{lead.name}</td>
                    <td className="p-4"><div className="flex items-center gap-2"><FaPhone className="text-gray-400 text-xs" />{lead.mobileNo}</div></td>
                    <td className="p-4"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{lead.lob || "-"}</span></td>
                    <td className="p-4 text-xs">{getStage(inferStage(lead)).label}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${statusClass(lead.status)}`}>{statusIcon(lead.status)} {lead.status || "Unknown"}</span>
                    </td>
                    <td className="p-4"><span className="font-mono text-xs">{lead.policyNumber || "-"}</span></td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedLead(lead)} className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded" title="View details"><FaEye size={18} /></button>
                        <button onClick={() => handleEdit(lead)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded" title="Open case"><FaEdit size={18} /></button>
                        <button onClick={() => handleDelete(lead._id)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded" title="Delete lead"><FaTrash size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && renderLeadDetails()}
      {showEditModal && editLead && renderEditModal()}
    </div>
  );
}

export default EmployeeLeads;