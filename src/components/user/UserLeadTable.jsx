// components/user/UserLeadTable.jsx
// ============================================================
// EMPLOYEE panel — the employee's own leads.
// Uses the same staged form as the Admin pages (LeadTable / EmployeeLeads),
// in "employee" mode: only the modules an employee works on are shown
// (Lead, Quote, Policy Issuance). Admin modules (Quote Workflow, Payment,
// EMI Dues, Cashback, Arshyan Profit) are replaced by a read-only Case Status card.
//
// Data goes to /api/user-leads -> employeeLeadController -> EmployeeLead model,
// i.e. exactly what Admin sees on the "Employee Leads" page.
// ============================================================
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaEye, FaEdit, FaTimes, FaTrash, FaLock, FaDownload, FaSearch, FaUpload, FaFilter, FaFileExcel, FaBell,
  FaClock, FaExclamationTriangle, FaUserPlus, FaCheckCircle,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import LeadCaseForm from "../../components/lob/LeadCaseForm";
<<<<<<< HEAD
import Pagination, { usePagination } from "../lob/Pagination";
=======
>>>>>>> e8d159dd0da9b49765fade1f41ca54b3120eaf93
import { prepareUpload, uploadErrorMessage } from "../lob/uploadUtils";
import useLeadCase from "../../components/lob/useLeadCase";
import { getDisplayManufacturer } from "../../components/lob/motorInsurance";
import {
  validateMobile, getStage, inferStage, getAcceptedQuote, collectDocuments, computeQuote, fmt,
  CASE_STATUS_LIST, IDX, stageIndex, statusBadgeClass,
} from "../../components/lob/caseWorkflow";

// Employees may delete a lead only before it is submitted (the server enforces the same rule)
const canEmployeeDelete = (lead) => inferStage(lead) === "Lead";

// Employees see their own names for steps Admin handles (internal steps like "Cashback" / "Arshyan Profit" stay hidden)
const employeeStageLabel = (lead) => {
  const key = inferStage(lead);
  if (lead.status === "Policy Issued" && stageIndex(key) > IDX.Payment) return "Policy Issued";
  if (key === "QuoteWorkflow") return "Quotes";
  if (key === "Payment") return "Payment & Issuance";
  if (stageIndex(key) > IDX.Payment) return "With Admin";
  return getStage(key).label;
};

// Who has the next action on this case
const nextActor = (lead) => {
  const key = inferStage(lead);
  // after the employee's final submission (leaving Payment) the case is with Admin
  if (stageIndex(key) > IDX.Payment) {
    if (lead.status === "Policy Issued") return { label: "Issued", cls: "text-emerald-700" };
    if (lead.status === "Rejected") return { label: "Rejected", cls: "text-red-600" };
    return { label: "With Admin", cls: "text-gray-500" };
  }
  if (lead.status === "Rejected") return { label: "Rejected", cls: "text-red-600" };
  // Quotes: the employee reviews / accepts once Admin has added premiums
  if (key === "QuoteWorkflow") {
    const ready = (lead.workflowDetails?.insurerQuotes || []).some((q) => q.netPremium);
    return ready ? { label: "Your action", cls: "text-indigo-700 font-medium" } : { label: "With Admin", cls: "text-gray-500" };
  }
  return getStage(key).access === "admin" ? { label: "With Admin", cls: "text-gray-500" } : { label: "Your action", cls: "text-indigo-700 font-medium" };
};
// after the employee's final submission the case is view-only for them
// employees work up to and including the Payment module (payment / policy status)
const canEmployeeEdit = (lead) => nextActor(lead).label === "Your action" && stageIndex(inferStage(lead)) <= IDX.Payment;

function UserLeadTable() {
  const c = useLeadCase({ quoteFilePrefix: "insurerQuoteFile_", role: "employee" });

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
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  // ============================================================
  // DATA
  // ============================================================
  const fetchUsers = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      // employee-safe endpoint (names only) for the "Source By" dropdowns
      const res = await fetch(`${API_BASE}/api/auth/users/dropdown`, { headers: authHeaders() });
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
      const res = await fetch(`${API_BASE}/api/user-leads`, { headers: authHeaders() });
      if (res.ok) setLeads(await res.json());
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
    const onClick = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) setFilterDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ============================================================
  // FILTERS + RENEWAL ALERTS
  // ============================================================
  useEffect(() => {
    let list = [...leads];
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase().trim();
      list = list.filter((l) =>
        [l.policyNumber, l.leadCode, l.email, l.name, l.lob, l.workflowDetails?.policyNumber]
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
    if (statusFilter === "Your action") list = list.filter((l) => nextActor(l).label === "Your action");
    else if (statusFilter !== "All") list = list.filter((l) => l.status === statusFilter);
    setFilteredLeads(list);
  }, [leads, globalSearch, sourceFilters, statusFilter]);

  // pagination: back to page 1 when the search / filters change (not when a lead is edited)
  const pager = usePagination(filteredLeads, { resetKeys: [globalSearch, JSON.stringify(sourceFilters), statusFilter] });

  useEffect(() => {
    const today = new Date();
    const alerts = [];
    leads.forEach((lead) => {
      const expiry = lead.policyExpiryDate || lead.workflowDetails?.policyExpiryDate;
      if (!expiry) return;
      const daysLeft = Math.ceil((new Date(expiry) - today) / 86400000);
      if (daysLeft > 30) return;
      const priority = daysLeft <= 0 ? "Expired" : daysLeft <= 7 ? "Urgent" : daysLeft <= 15 ? "Priority" : "Normal";
      alerts.push({ leadId: lead._id, customerName: lead.name, policyNumber: lead.policyNumber || lead.workflowDetails?.policyNumber, daysLeft, priority });
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
  // Only the columns the server actually reads for a bulk upload (leads start at the Lead module)
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      name: "JOHN DOE", email: "john.doe@example.com", mobileNo: "9876543210", gender: "Male",
      source: "Direct Client", sourceDependentValue: "", remarks: "Discussed health cover for family",
      lob: "Health Insurance", pinCode: "110001", state: "Delhi", city: "New Delhi",
      policyTenure: "1 Year", paymentTerm: "Yearly", sumInsured: "10 Lakh",
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
      const wf = l.workflowDetails || {};
      const accepted = getAcceptedQuote(wf);
      return {
        "Lead Code": l.leadCode || "", Name: l.name || "", Email: l.email || "", "Mobile No": l.mobileNo || "",
        Source: l.source || "", LOB: l.lob || "", Stage: employeeStageLabel(l), Status: l.status || "",
        "Next Action": nextActor(l).label, "Policy Tenure": l.policyTenure || "", "Paying Term": l.paymentTerm || "",
        "Sum Insured": l.sumInsured || "", "Accepted Insurer": accepted?.insurerName || "",
        "Gross Premium": accepted ? computeQuote(accepted).grossPremium : "",
        "Policy Number": l.policyNumber || wf.policyNumber || "",
        "Policy Start Date": l.policyStartDate ? new Date(l.policyStartDate).toLocaleDateString() : "",
        "Policy Expiry Date": l.policyExpiryDate ? new Date(l.policyExpiryDate).toLocaleDateString() : "",
        "Motor Policy Type": l.motorDetails?.policyType || "", "Vehicle Type": l.motorDetails?.vehicleType || "",
        "Registration / RTO": l.motorDetails?.registrationNumber || l.motorDetails?.rtoCode || "",
        "Vehicle Manufacturer": getDisplayManufacturer(l.motorDetails),
        "Device (Make & Model)": l.electronicDetails?.makeModel || "", "IMEI / Serial": l.electronicDetails?.imeiNumber || "", "Product": l.workflowDetails?.product || "", "Vehicle Model": l.motorDetails?.model || "",
        Remarks: l.remarks || "", "Created At": l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MyLeads");
    XLSX.writeFile(wb, `my_leads_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const done = (message, type) => {
      setUploadStatus({ show: true, message, type });
      setIsUploading(false);
      e.target.value = "";
      setTimeout(() => setUploadStatus({ show: false, message: "", type: "" }), 6000);
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
          if (!row.lob) errors.push(`Row ${i + 2}: LOB is required`);
        });
        if (errors.length) return done(errors.join("\n"), "error");
        const body = new FormData();
        body.append("file", file);
        const res = await fetch(`${API_BASE}/api/user-leads/upload`, { method: "POST", headers: authHeaders(), body });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          fetchLeads();
          return done(`${data.count || 0} leads uploaded successfully!`, "success");
        }
        const detail = Array.isArray(data.errors)
          ? data.errors.map((x) => `Row ${x.row}: ${(x.errors || [x.error]).join(", ")}`).join("\n")
          : data.error || data.message || "Unknown error";
        return done(`Upload failed:\n${detail}`, "error");
      } catch (err) {
        return done("Error processing file: " + err.message, "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ============================================================
  // CREATE / UPDATE (staged — employee modules only)
  // ============================================================
  const serverErrors = (data) =>
    data?.errors
      ? data.errors.map((m) => ({ field: "general", message: typeof m === "string" ? m : JSON.stringify(m) }))
      : [{ field: "general", message: data?.error || data?.message || "Request failed" }];

  const submitCreate = async (stage) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/user-leads`, { method: "POST", headers: authHeaders(), body: await prepareUpload(c.buildFormData(stage)) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        c.showErrors(serverErrors(data));
        return;
      }
      setLeads((prev) => [data, ...prev]);
      setShowLeadForm(false);
      c.reset();
      setFlash(stage === "QuoteWorkflow" ? "Lead created — quotes requested from Admin." : "Lead saved.");
    } catch (err) {
      c.showErrors([{ field: "general", message: uploadErrorMessage(err) }]);
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
    if (c.caseStage === "Lead") c.goToStage("Quote"); // open the Quote module in the same form
    else submitCreate(c.nextStage);                    // Quote -> request quotes from Admin
  };

  const submitUpdate = async (stage, keepOpen) => {
    if (!editLead?._id) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/user-leads/${editLead._id}`, { method: "PUT", headers: authHeaders(), body: await prepareUpload(c.buildFormData(stage)) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        c.showErrors(serverErrors(data));
        return;
      }
      setLeads((prev) => prev.map((l) => (l._id === data._id ? data : l)));
      if (keepOpen) {
        setEditLead(data);
        c.hydrate(data);
        setFlash(stage === "Payment" ? "Payment URL requested from Admin." : `Moved to ${getStage(stage).label}.`);
      } else {
        setShowEditModal(false);
        setEditLead(null);
        setFlash("Lead updated.");
      }
    } catch (err) {
      c.showErrors([{ field: "general", message: uploadErrorMessage(err) }]);
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

  const handleDelete = async (lead) => {
    if (!canEmployeeDelete(lead)) return;
    if (!window.confirm(`Delete lead ${lead.leadCode || lead.name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/user-leads/${lead._id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l._id !== lead._id));
        setFlash("Lead deleted.");
      } else {
        alert(data.error || "Failed to delete lead");
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  };

  const openCreate = () => {
    c.reset();
    setShowLeadForm(true);
  };

  const openEdit = (lead) => {
    setEditLead(lead);
    c.hydrate(lead);
    setShowEditModal(true);
  };

  // ============================================================
  // RENDER: RENEWAL ALERTS
  // ============================================================
  const renderRenewalAlerts = () => {
    if (!renewalAlerts.length) return null;
    const color = { Expired: "bg-red-100 border-red-500 text-red-800", Urgent: "bg-orange-100 border-orange-500 text-orange-800", Priority: "bg-yellow-100 border-yellow-500 text-yellow-800", Normal: "bg-blue-100 border-blue-500 text-blue-800" };
    const icon = { Expired: <FaExclamationTriangle className="text-red-500" />, Urgent: <FaClock className="text-orange-500" />, Priority: <FaClock className="text-yellow-500" />, Normal: <FaBell className="text-blue-500" /> };
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaBell className="text-indigo-600 h-5 w-5" />
          <h3 className="text-lg font-semibold text-gray-800">Renewal Alerts</h3>
          <span className="ml-auto bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">{renewalAlerts.length} pending</span>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {renewalAlerts.sort((a, b) => a.daysLeft - b.daysLeft).map((a) => (
            <div key={a.leadId} className={`border-l-4 p-3 rounded-r-lg flex items-start justify-between ${color[a.priority]}`}>
              <div>
                <p className="font-medium">{a.customerName}</p>
                <p className="text-sm">Policy: {a.policyNumber || "-"}</p>
                <p className="text-sm">{a.daysLeft <= 0 ? `Expired ${Math.abs(a.daysLeft)} days ago` : `Due in ${a.daysLeft} days`}</p>
              </div>
              {icon[a.priority]}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER: MODALS
  // ============================================================
  const renderCaseModal = ({ title, subtitle, mode, onClose, onSave, onAdvance }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-6xl max-h-[92vh] overflow-y-auto w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-3 sticky top-0 bg-white z-20 pb-3 border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">{title}</h2>
            {subtitle}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close"><FaTimes className="h-5 w-5" /></button>
        </div>
        {flash && <div className="mb-3 p-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2"><FaCheckCircle /> {flash}</div>}
        <LeadCaseForm
          c={c} mode={mode} audience="employee" employees={employees} channelPartners={channelPartners}
          isSubmitting={isSubmitting} onCancel={onClose} onSave={onSave} onAdvance={onAdvance}
          recordUrl={mode === "edit" && editLead ? `${API_BASE}/api/user-leads/${editLead._id}` : null}
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
    const actor = nextActor(l);
    const item = (label, value) => <div><span className="font-medium">{label}:</span> {value || value === 0 ? value : "-"}</div>;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedLead(null)}>
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-xl font-bold">Lead Details</h2>
            <button onClick={() => setSelectedLead(null)} className="text-gray-500 hover:text-gray-700"><FaTimes className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {item("Lead Code", l.leadCode)}
            {item("Stage", employeeStageLabel(l))}
            <div><span className="font-medium">Status:</span> <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${statusBadgeClass(l.status)}`}>{l.status}</span></div>
            <div><span className="font-medium">Next action:</span> <span className={actor.cls}>{actor.label}</span></div>
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
            {item("Accepted Quote", accepted ? `${accepted.insurerName} — ₹${fmt(computeQuote(accepted).grossPremium)} gross` : "")}
            {item("Payment Status", wf.paymentStatus)}
            {item("Policy Number", l.policyNumber || wf.policyNumber)}
            {item("Policy Period", [l.policyStartDate && new Date(l.policyStartDate).toLocaleDateString(), l.policyExpiryDate && new Date(l.policyExpiryDate).toLocaleDateString()].filter(Boolean).join(" → "))}
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
            <button onClick={() => { const x = selectedLead; setSelectedLead(null); openEdit(x); }} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              {canEmployeeEdit(selectedLead) ? <><FaEdit /> Open Case</> : <><FaEye /> View Case</>}
            </button>
            <button onClick={() => setSelectedLead(null)} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Close</button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  const myActionCount = leads.filter((l) => nextActor(l).label === "Your action").length;

  return (
    <div className="space-y-4 p-4 mt-10">
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
        {myActionCount > 0 && (
          <button onClick={() => setStatusFilter("Your action")} className="text-sm px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100">
            {myActionCount} lead{myActionCount === 1 ? "" : "s"} need your action
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
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
              <FaFilter /> Source Filters{Object.values(sourceFilters).some(Boolean) && " (Active)"}
            </button>
            {filterDropdownOpen && (
              <div className="absolute z-40 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-2">
                {[["employees", "Employees"], ["stores", "Stores"], ["channelPartners", "Channel Partners"], ["socialMedia", "Social Media"], ["directSource", "Direct Source"]].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sourceFilters[key]} onChange={() => toggleSourceFilter(key)} className="rounded text-indigo-600" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="All">All Status</option>
            <option value="Your action">Needs my action</option>
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
                <th className="p-3">Stage</th><th className="p-3">Status</th><th className="p-3">Next Action</th><th className="p-3">Policy #</th><th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pager.pageItems.map((lead) => {
                const actor = nextActor(lead);
                return (
                  <tr key={lead._id} className="border-b hover:bg-gray-50 text-xs">
                    <td className="p-3 font-mono text-indigo-600">{lead.leadCode || "N/A"}</td>
                    <td className="p-3 font-medium">{lead.name}</td>
                    <td className="p-3">{lead.mobileNo}</td>
                    <td className="p-3">{lead.lob || "-"}</td>
                    <td className="p-3">{employeeStageLabel(lead)}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${statusBadgeClass(lead.status)}`}>{lead.status}</span></td>
                    <td className={`p-3 ${actor.cls}`}>{actor.label}</td>
                    <td className="p-3">{lead.policyNumber || "-"}</td>
                    <td className="p-3">
                      <div className="flex gap-2 items-center">
                        <button onClick={() => setSelectedLead(lead)} className="text-indigo-600 hover:text-indigo-800" title="View"><FaEye className="h-5 w-5" /></button>
                        {canEmployeeEdit(lead) ? (
                          <button onClick={() => openEdit(lead)} className="text-blue-600 hover:text-blue-800" title="Open case"><FaEdit className="h-5 w-5" /></button>
                        ) : (
                          <button onClick={() => openEdit(lead)} className="text-gray-500 hover:text-gray-700" title="View case"><FaLock className="h-4 w-4" /></button>
                        )}
                        {canEmployeeDelete(lead) && (
                          <button onClick={() => handleDelete(lead)} className="text-red-600 hover:text-red-800" title="Delete"><FaTrash className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="block lg:hidden p-4 space-y-4">
          {pager.pageItems.map((lead) => {
            const actor = nextActor(lead);
            return (
              <div key={lead._id} className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-1 text-sm">
                <div><strong>Lead Code:</strong> <span className="font-mono text-indigo-600">{lead.leadCode || "N/A"}</span></div>
                <div><strong>Name:</strong> {lead.name}</div>
                <div><strong>Mobile:</strong> {lead.mobileNo}</div>
                <div><strong>LOB:</strong> {lead.lob || "-"}</div>
                <div><strong>Stage:</strong> {employeeStageLabel(lead)}</div>
                <div><strong>Status:</strong> <span className={`ml-1 px-2 py-0.5 rounded text-xs ${statusBadgeClass(lead.status)}`}>{lead.status}</span></div>
                <div><strong>Next:</strong> <span className={actor.cls}>{actor.label}</span></div>
                <div className="pt-2 flex gap-3">
                  <button onClick={() => setSelectedLead(lead)} className="text-indigo-600"><FaEye className="h-5 w-5" /></button>
                  <button onClick={() => openEdit(lead)} className={canEmployeeEdit(lead) ? "text-blue-600" : "text-gray-500"} title={canEmployeeEdit(lead) ? "Open case" : "View case"}>
                    {canEmployeeEdit(lead) ? <FaEdit className="h-5 w-5" /> : <FaLock className="h-4 w-4" />}
                  </button>
                  {canEmployeeDelete(lead) && <button onClick={() => handleDelete(lead)} className="text-red-600"><FaTrash className="h-4 w-4" /></button>}
                </div>
              </div>
            );
          })}
        </div>

        <Pagination p={pager} />

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
            {editLead.lob} · <span className={`px-2 py-0.5 rounded-full ${statusBadgeClass(editLead.status)}`}>{editLead.status}</span> ·{" "}
            <span className={nextActor(editLead).cls}>{nextActor(editLead).label}</span>
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

export default UserLeadTable;