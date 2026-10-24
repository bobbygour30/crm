// src/components/LeadTable.jsx
import { motion } from "framer-motion";
import {
  FaEye, FaEdit, FaTimes, FaDownload, FaSearch, FaUpload, FaFilter, FaFileExcel, FaBell, FaClock,
  FaExclamationTriangle, FaUserPlus, FaCheckCircle,
} from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import LeadCaseForm from "../lob/LeadCaseForm";
import useLeadCase from "../lob/useLeadCase";
import { getDisplayManufacturer } from "../lob/motorInsurance";
import {
  validateMobile, getStage, inferStage, getAcceptedQuote, collectDocuments, fmt, CASE_STATUS_LIST, statusBadgeClass,
} from "../lob/caseWorkflow";

// one colour map for all lead pages (includes the motor inspection statuses)
export const statusClass = statusBadgeClass;

const toSafeLead = (lead) => ({
  ...lead,
  _id: typeof lead._id === "string" ? lead._id : lead._id?.toString ? lead._id.toString() : String(lead._id || ""),
});

function LeadTable() {
  const c = useLeadCase({ quoteFilePrefix: "quoteFile_" });

  // ============================================================
  // STATE
  // ============================================================
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilters, setSourceFilters] = useState({
    employees: false, stores: false, channelPartners: false, socialMedia: false, directSource: false,
  });
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ show: false, message: "", type: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [renewalAlerts, setRenewalAlerts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flash, setFlash] = useState("");
  const [employees, setEmployees] = useState([]);
  const [channelPartners, setChannelPartners] = useState([]);

  const filterDropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  // ============================================================
  // DATA
  // ============================================================
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  const fetchUsers = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/users`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setEmployees(data.filter((u) => u.userType === "Employee" || u.role === "Employee"));
      setChannelPartners(data.filter((u) => u.userType === "Channel Partner" || u.role === "Channel Partner"));
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const fetchLeads = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await fetch(`${API_BASE}/api/leads`, { headers: authHeaders() });
      if (res.ok) {
        const data = (await res.json()).map(toSafeLead);
        setLeads(data);
      }
    } catch (err) {
      console.error("Fetch leads error:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(""), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) setFilterDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================
  // FILTERS + RENEWAL ALERTS
  // ============================================================
  useEffect(() => {
    let list = [...leads];
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase().trim();
      list = list.filter((l) =>
        [l.policyNumber, l.leadCode, l.email, l.name, l.workflowDetails?.policyNumber,
          ...(l.workflowDetails?.insurerQuotes || []).map((x) => x.quoteNumber)]
          .some((v) => v && String(v).toLowerCase().includes(q)) || (l.mobileNo && l.mobileNo.includes(q))
      );
    }
    const active = [];
    if (sourceFilters.employees) active.push("Employee");
    if (sourceFilters.stores) active.push("Store");
    if (sourceFilters.channelPartners) active.push("Channel Partner");
    if (sourceFilters.socialMedia) active.push("Social Media");
    if (sourceFilters.directSource) active.push("Direct Client");
    if (active.length) list = list.filter((l) => active.includes(l.source));
    if (statusFilter !== "All") list = list.filter((l) => l.status === statusFilter);
    setFilteredLeads(list);
  }, [leads, globalSearch, sourceFilters, statusFilter]);

  useEffect(() => {
    const today = new Date();
    const alerts = [];
    leads.forEach((lead) => {
      const expiry = lead.policyExpiryDate || lead.workflowDetails?.policyExpiryDate;
      if (!expiry) return;
      const daysLeft = Math.ceil((new Date(expiry) - today) / 86400000);
      if (daysLeft > 30) return;
      const priority = daysLeft <= 0 ? "Expired" : daysLeft <= 7 ? "Urgent" : daysLeft <= 15 ? "Priority" : "Normal";
      alerts.push({ leadId: lead._id, customerName: lead.name, policyNumber: lead.policyNumber || lead.workflowDetails?.policyNumber, expiryDate: expiry, daysLeft, priority });
    });
    setRenewalAlerts(alerts);
  }, [leads]);

  const toggleSourceFilter = (key) => setSourceFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  const clearFilters = () => {
    setGlobalSearch("");
    setStatusFilter("All");
    setSourceFilters({ employees: false, stores: false, channelPartners: false, socialMedia: false, directSource: false });
  };

  // ============================================================
  // BULK UPLOAD / EXPORT
  // ============================================================
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      name: "JOHN DOE", email: "john@example.com", mobileNo: "9876543210", gender: "Male", source: "Employee",
      remarks: "Customer remarks", lob: "Health Insurance", policyTenure: "1 Year", paymentTerm: "Yearly", sumInsured: "10 Lakh",
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LeadTemplate");
    XLSX.writeFile(wb, "lead_upload_template.xlsx");
  };

  const downloadExcel = () => {
    if (!filteredLeads.length) {
      alert("No leads data to export!");
      return;
    }
    const rows = filteredLeads.map((l) => {
      const accepted = getAcceptedQuote(l.workflowDetails || {});
      return {
        "Lead Code": l.leadCode || "", Name: l.name || "", Email: l.email || "", "Mobile No": l.mobileNo || "",
        Gender: l.gender || "", Source: l.source || "", Stage: getStage(inferStage(l)).label, Status: l.status || "",
        LOB: l.lob || "", "Policy Tenure": l.policyTenure || "", "Paying Term": l.paymentTerm || "", "Sum Insured": l.sumInsured || "",
        "PIN Code": l.pinCode || "", State: l.state || "", City: l.city || "",
        "Accepted Insurer": accepted?.insurerName || "", "Quote Net Premium": accepted?.netPremium || "",
        "Final Net Premium": l.workflowDetails?.finalNetPremium || "", "Policy Number": l.policyNumber || l.workflowDetails?.policyNumber || "",
        "Policy Start Date": l.policyStartDate ? new Date(l.policyStartDate).toLocaleDateString() : "",
        "Policy Expiry Date": l.policyExpiryDate ? new Date(l.policyExpiryDate).toLocaleDateString() : "",
        "EMIs Received": l.workflowDetails?.emiReceivedCount || "", "Next EMI Due": l.workflowDetails?.nextDueDate ? new Date(l.workflowDetails.nextDueDate).toLocaleDateString() : "",
        "Cashback Total": l.cashbackDetails?.totalPayout ?? "", "Arshyan Profit": l.payoutDetails?.arshyanProfit ?? "",
        "Motor Policy Type": l.motorDetails?.policyType || "", "Vehicle Type": l.motorDetails?.vehicleType || "",
        "Registration / RTO": l.motorDetails?.registrationNumber || l.motorDetails?.rtoCode || "",
        "Vehicle Manufacturer": getDisplayManufacturer(l.motorDetails),
        "Device (Make & Model)": l.electronicDetails?.makeModel || "", "IMEI / Serial": l.electronicDetails?.imeiNumber || "", "Product": l.workflowDetails?.product || "", "Vehicle Model": l.motorDetails?.model || "",
        Remarks: l.remarks || "", "Created At": l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LeadsData");
    XLSX.writeFile(wb, `leads_export_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const done = (message, type) => {
      setUploadStatus({ show: true, message, type });
      setIsUploading(false);
      e.target.value = "";
      setTimeout(() => setUploadStatus({ show: false, message: "", type: "" }), 5000);
    };
    if (!file.name.match(/\.(xlsx|xls)$/)) return done("Incorrect format! Please upload only .xlsx or .xls files.", "error");
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const wb = XLSX.read(new Uint8Array(event.target.result), { type: "array" });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!rows.length) return done("The uploaded file contains no data.", "error");
        const errors = [];
        rows.forEach((row, i) => {
          if (!row.name || !row.mobileNo) errors.push(`Row ${i + 2}: Missing name or mobile number`);
          if (row.mobileNo && !validateMobile(row.mobileNo.toString())) errors.push(`Row ${i + 2}: Invalid mobile number`);
        });
        if (errors.length) return done(errors.join("\n"), "error");
        const body = new FormData();
        body.append("file", file);
        const res = await fetch(`${API_BASE}/api/leads/upload`, { method: "POST", headers: authHeaders(), body });
        if (res.ok) {
          const result = await res.json();
          fetchLeads();
          return done(`${result.count || result.leads?.length || 0} leads uploaded successfully!`, "success");
        }
        const error = await res.json().catch(() => ({}));
        return done("Upload failed: " + (error.error || error.message || "Unknown error"), "error");
      } catch (err) {
        return done("Error processing file: " + err.message, "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ============================================================
  // CREATE / UPDATE (staged)
  // ============================================================
  const serverErrors = (data) =>
    data?.errors
      ? data.errors.map((m) => ({ field: "general", message: typeof m === "string" ? m : JSON.stringify(m) }))
      : [{ field: "general", message: data?.error || data?.message || "Request failed" }];

  const submitCreate = async (stage) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/leads`, { method: "POST", headers: authHeaders(), body: c.buildFormData(stage) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        c.showErrors(serverErrors(data));
        return;
      }
      setLeads((prev) => [toSafeLead(data), ...prev]);
      setShowLeadForm(false);
      c.reset();
      setFlash(stage === "QuoteWorkflow" ? "Lead created and quotes requested." : "Lead saved.");
    } catch (err) {
      c.showErrors([{ field: "general", message: "Error: " + err.message }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSave = () => {
    if (!c.validateForSave()) return;
    submitCreate(c.caseStage);
  };

  const handleCreateAdvance = () => {
    if (!c.validateForAdvance()) return;
    // Lead -> open the Quote module in the same form; Quote -> create & request quotes
    if (c.caseStage === "Lead") c.goToStage("Quote");
    else submitCreate(c.nextStage);
  };

  const submitUpdate = async (stage, keepOpen) => {
    if (!editLead?._id) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${editLead._id}`, { method: "PUT", headers: authHeaders(), body: c.buildFormData(stage) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        c.showErrors(serverErrors(data));
        return;
      }
      const updated = toSafeLead(data);
      setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
      if (keepOpen) {
        // stay in the case so the next module opens straight away
        setEditLead(updated);
        c.hydrate(updated);
        setFlash(`Moved to ${getStage(stage).label}.`);
      } else {
        setShowEditModal(false);
        setEditLead(null);
        setFlash("Lead updated.");
      }
    } catch (err) {
      c.showErrors([{ field: "general", message: "Error: " + err.message }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSave = () => {
    if (!c.validateForSave()) return;
    submitUpdate(c.caseStage, false);
  };

  const handleEditAdvance = () => {
    if (!c.validateForAdvance()) return;
    submitUpdate(c.nextStage, true);
  };

  const openCreate = () => {
    c.reset();
    setShowLeadForm(true);
  };

  const openEditModal = (lead) => {
    const safe = toSafeLead(lead);
    setEditLead(safe);
    c.hydrate(safe);
    setShowEditModal(true);
  };

  // ============================================================
  // RENEWAL ALERTS
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

    const renderAlertGroup = (list, title, titleClass, dueText) => (
      list.length > 0 && (
        <div className="space-y-2">
          <h4 className={`text-sm font-medium ${titleClass}`}>{title}</h4>
          {list.map((alert, idx) => (
            <div key={idx} className={`border-l-4 p-3 rounded-r-lg ${getPriorityColor(alert.priority)}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{alert.customerName}</p>
                  <p className="text-sm">Policy: {alert.policyNumber}</p>
                  <p className="text-sm">{dueText(alert)}</p>
                </div>
                {getIcon(alert.priority)}
              </div>
            </div>
          ))}
        </div>
      )
    );

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
          {renderAlertGroup(groupedAlerts.expired, "⚠️ Expired Policies", "text-red-600", (a) => `Expired ${Math.abs(a.daysLeft)} days ago`)}
          {renderAlertGroup(groupedAlerts.urgent, "🔴 Urgent (Due in 7 days)", "text-orange-600", (a) => `Due in ${a.daysLeft} days`)}
          {renderAlertGroup(groupedAlerts.priority, "🟡 Priority (Due in 15 days)", "text-yellow-600", (a) => `Due in ${a.daysLeft} days`)}
          {renderAlertGroup(groupedAlerts.normal, "🔵 Upcoming (Due in 30 days)", "text-blue-600", (a) => `Due in ${a.daysLeft} days`)}
        </div>
      </motion.div>
    );
  };


  // ============================================================
  // MODALS
  // ============================================================
  const renderCaseModal = ({ title, subtitle, mode, onClose, onSave, onAdvance }) => (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-6xl max-h-[92vh] overflow-y-auto w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-3 sticky top-0 bg-white z-20 pb-3 border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">{title}</h2>
            {subtitle}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close"><FaTimes className="h-5 w-5" /></button>
        </div>
        {flash && <div className="mb-3 p-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2"><FaCheckCircle /> {flash}</div>}
        <LeadCaseForm
          c={c} mode={mode} employees={employees} channelPartners={channelPartners}
          isSubmitting={isSubmitting} onCancel={onClose} onSave={onSave} onAdvance={onAdvance}
        />
      </motion.div>
    </motion.div>
  );

  const renderLeadDetails = () => {
    if (!selectedLead) return null;
    const l = selectedLead;
    const wf = l.workflowDetails || {};
    const accepted = getAcceptedQuote(wf);
    const docs = collectDocuments(l);
    const item = (label, value) => (
      <div><span className="font-medium">{label}:</span> {value || value === 0 ? value : "-"}</div>
    );
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedLead(null)}>
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-xl font-bold">Lead Details</h2>
            <button onClick={() => setSelectedLead(null)} className="text-gray-500 hover:text-gray-700"><FaTimes className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {item("Lead Code", l.leadCode)}
            {item("Stage", getStage(inferStage(l)).label)}
            <div><span className="font-medium">Status:</span> <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${statusClass(l.status)}`}>{l.status}</span></div>
            {item("Name", l.name)}
            {item("Mobile", l.mobileNo)}
            {item("Email", l.email)}
            {item("Source", [l.source, l.sourceDependentValue].filter(Boolean).join(" — "))}
            {item("City / State", [l.city, l.state].filter(Boolean).join(", "))}
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
            {item("Policy Period", [l.policyStartDate && new Date(l.policyStartDate).toLocaleDateString(), l.policyExpiryDate && new Date(l.policyExpiryDate).toLocaleDateString()].filter(Boolean).join(" → "))}
            {wf.emiTotalCount ? item("EMIs", `${wf.emiReceivedCount || 0} / ${wf.emiTotalCount}${wf.emiRenewalAlert ? " (Renewal Alert)" : wf.nextDueDate ? ` · next due ${new Date(wf.nextDueDate).toLocaleDateString()}` : ""}`) : null}
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
            <button onClick={() => { const l2 = selectedLead; setSelectedLead(null); openEditModal(l2); }} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"><FaEdit /> Open Case</button>
            <button onClick={() => setSelectedLead(null)} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Close</button>
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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-lg whitespace-pre-line ${uploadStatus.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {uploadStatus.type === "success" ? "✓ " : "✗ "}{uploadStatus.message}
        </motion.div>
      )}
      {flash && !showEditModal && !showLeadForm && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2"><FaCheckCircle /> {flash}</div>
      )}

      {renderRenewalAlerts()}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-wrap">
          <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"><FaUserPlus /> Add New Lead</button>
          <button onClick={downloadTemplate} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"><FaDownload /> Download Template</button>
          <button onClick={downloadExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"><FaFileExcel /> Export Excel</button>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2">
            <FaUpload className="h-4 w-4" /> {isUploading ? "Uploading..." : "Upload Excel"}
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" ref={fileInputRef} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search: Policy Number, Lead Code, Mobile, Email, Name, Quote Number..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative" ref={filterDropdownRef}>
            <button onClick={() => setFilterDropdownOpen(!filterDropdownOpen)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <FaFilter /> Source Filters{Object.values(sourceFilters).some(Boolean) && " (Active)"}
            </button>
            {filterDropdownOpen && (
              <div className="absolute z-40 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                <div className="space-y-2">
                  {[["employees", "Employees"], ["stores", "Stores"], ["channelPartners", "Channel Partners"], ["socialMedia", "Social Media"], ["directSource", "Direct Source"]].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={sourceFilters[key]} onChange={() => toggleSourceFilter(key)} className="rounded text-indigo-600" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="All">All Status</option>
            {CASE_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(globalSearch || statusFilter !== "All" || Object.values(sourceFilters).some(Boolean)) && (
            <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800">Clear filters</button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <p className="text-sm text-gray-600">Showing {filteredLeads.length} of {leads.length} leads{globalSearch && ` | Search: "${globalSearch}"`}</p>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full table-auto min-w-full">
            <thead>
              <tr className="bg-gray-100 text-left text-xs">
                <th className="p-3">Lead Code</th><th className="p-3">Name</th><th className="p-3">Mobile</th><th className="p-3">LOB</th>
                <th className="p-3">Source</th><th className="p-3">Stage</th><th className="p-3">Status</th><th className="p-3">Policy #</th>
                <th className="p-3">Sum Insured</th><th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead._id} className="border-b hover:bg-gray-50 text-xs">
                  <td className="p-3 font-mono text-indigo-600">{lead.leadCode || "N/A"}</td>
                  <td className="p-3 font-medium">{lead.name}</td>
                  <td className="p-3">{lead.mobileNo}</td>
                  <td className="p-3">{lead.lob || "-"}</td>
                  <td className="p-3">{lead.source || "-"}</td>
                  <td className="p-3">{getStage(inferStage(lead)).label}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${statusClass(lead.status)}`}>{lead.status}</span></td>
                  <td className="p-3">{lead.policyNumber || "-"}</td>
                  <td className="p-3">{lead.sumInsured || "-"}</td>
                  <td className="p-3">
                    <div className="flex gap-2 items-center">
                      <button onClick={() => setSelectedLead(lead)} className="text-indigo-600 hover:text-indigo-800" title="View"><FaEye className="h-5 w-5" /></button>
                      <button onClick={() => openEditModal(lead)} className="text-blue-600 hover:text-blue-800" title="Open case"><FaEdit className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="block lg:hidden p-4 space-y-4">
          {filteredLeads.map((lead) => (
            <div key={lead._id} className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-1 text-sm">
              <div><strong>Lead Code:</strong> <span className="font-mono text-indigo-600">{lead.leadCode || "N/A"}</span></div>
              <div><strong>Name:</strong> {lead.name}</div>
              <div><strong>Mobile:</strong> {lead.mobileNo}</div>
              <div><strong>LOB:</strong> {lead.lob || "-"}</div>
              <div><strong>Stage:</strong> {getStage(inferStage(lead)).label}</div>
              <div><strong>Status:</strong> <span className={`ml-1 px-2 py-0.5 rounded text-xs ${statusClass(lead.status)}`}>{lead.status}</span></div>
              <div className="pt-2 flex gap-3">
                <button onClick={() => setSelectedLead(lead)} className="text-indigo-600"><FaEye className="h-5 w-5" /></button>
                <button onClick={() => openEditModal(lead)} className="text-blue-600"><FaEdit className="h-5 w-5" /></button>
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

      {showLeadForm && renderCaseModal({
        title: <><FaUserPlus className="text-indigo-600" /> Add New Lead</>,
        subtitle: <p className="text-xs text-gray-500 mt-1">Fill the Lead, then use “Request for Quote” to open the Quote module.</p>,
        mode: "create",
        onClose: () => setShowLeadForm(false),
        onSave: handleCreateSave,
        onAdvance: handleCreateAdvance,
      })}

      {showEditModal && editLead && renderCaseModal({
        title: <><FaEdit className="text-indigo-600" /> {editLead.leadCode} — {editLead.name}</>,
        subtitle: (
          <p className="text-xs text-gray-500 mt-1">
            {editLead.lob} · Created {editLead.createdAt ? new Date(editLead.createdAt).toLocaleDateString() : "-"} ·{" "}
            <span className={`px-2 py-0.5 rounded-full ${statusClass(editLead.status)}`}>{editLead.status}</span>
          </p>
        ),
        mode: "edit",
        onClose: () => { setShowEditModal(false); setEditLead(null); },
        onSave: handleEditSave,
        onAdvance: handleEditAdvance,
      })}

      {selectedLead && renderLeadDetails()}
    </div>
  );
}

export default LeadTable;