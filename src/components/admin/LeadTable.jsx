import { motion } from "framer-motion";
import { FaEye } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

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
  const assignOptions = ["Sales Manager", "Self", "Admin", "User"];

  // === STATE ===
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    source: "",
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
    mobileNo: "",
    insurer: "",
    remarks: "",
    assignedTo: [],
    agency: "",
    customAgency: "",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showCustomAgency, setShowCustomAgency] = useState(false);
  const dropdownRef = useRef(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  // === FETCH DATA ===
  useEffect(() => {
    fetchLeads();
    fetchUsers();
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

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
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

  // === CLICK OUTSIDE DROPDOWN ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === HELPERS ===
  const normalizeAssignedTo = (assignedTo) => {
    if (Array.isArray(assignedTo)) return assignedTo;
    if (!assignedTo) return [];
    return [assignedTo];
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

  // === ADD LEAD ===
  const handleAddLead = async (e) => {
    e.preventDefault();

    const payoutValue = computePayoutValue(
      newLead.netPremium,
      newLead.payoutPercent
    );
    const grossPremium = computeGrossPremium(
      newLead.netPremium,
      newLead.gstPercent
    );
    const totalPayment = computeTotalPayment(
      payoutValue,
      newLead.additionalPayout
    );

    const finalLOB =
      newLead.lobOption === "Other Insurance"
        ? newLead.lobCustom || ""
        : newLead.lobOption;
    const finalAgency =
      newLead.agency === "OTHERS" ? newLead.customAgency || "" : newLead.agency;

    const finalLead = {
      ...newLead,
      lob: finalLOB,
      agency: finalAgency,
      payout: newLead.payoutPercent,
      payoutValue,
      grossPremium,
      gst: newLead.gstPercent,
      totalPayment,
      assignedTo: selectedUsers,
    };

    delete finalLead.lobOption;
    delete finalLead.lobCustom;
    delete finalLead.customAgency;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalLead),
      });

      if (res.ok) {
        const savedLead = await res.json();
        setLeads((prev) => [savedLead, ...prev]);
        resetForm();
      } else {
        alert("Failed to save lead");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const resetForm = () => {
    setNewLead({
      name: "",
      email: "",
      source: "",
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
      mobileNo: "",
      insurer: "",
      remarks: "",
      assignedTo: [],
      agency: "",
      customAgency: "",
    });
    setSelectedUsers([]);
    setShowLeadForm(false);
    setShowCustomAgency(false);
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
        fetchLeads(); // Refresh
        alert(`${result.count} leads uploaded!`);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // === ASSIGN LEAD ===
  const assignLead = async (leadId, assignedTo) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE}/api/leads/${leadId}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignedTo }),
      });
      fetchLeads();
    } catch (err) {
      console.error("Assign error:", err);
    }
  };

  const toggleUserSelection = (leadId, userId) => {
    const lead = leads.find((l) => l._id === leadId);
    const current = normalizeAssignedTo(lead.assignedTo);
    const updated = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];
    assignLead(leadId, updated);
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
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6"
        >
          <form
            onSubmit={handleAddLead}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* All form fields (same as before) */}
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
                required
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
                Status
              </label>
              <select
                value={newLead.status}
                onChange={(e) =>
                  setNewLead({ ...newLead, status: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="Policy Issued">Policy Issued</option>
                <option value="Closed Without Issuance">
                  Closed Without Issuance
                </option>
                <option value="Open">Open</option>
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
                  placeholder="Enter LOB"
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
                  placeholder="Enter Agency"
                  value={newLead.customAgency}
                  onChange={(e) =>
                    setNewLead({ ...newLead, customAgency: e.target.value })
                  }
                  className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
                  required
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
                type=" Abdullah"
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
            <div>
              <label className="text-sm font-medium text-gray-700">
                Assign To
              </label>
              <select
                value={selectedUsers[0] || ""}
                onChange={(e) => setSelectedUsers([e.target.value])}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select --</option>
                {assignOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Remarks
              </label>
              <textarea
                value={newLead.remarks}
                onChange={(e) =>
                  setNewLead({ ...newLead, remarks: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="2"
              ></textarea>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
              >
                Submit
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-4 font-medium text-gray-700">Name</th>
                <th className="p-4 font-medium text-gray-700">Email</th>
                <th className="p-4 font-medium text-gray-700">Mobile No</th>
                <th className="p-4 font-medium text-gray-700">Policy #</th>
                <th className="p-4 font-medium text-gray-700">LOB</th>
                <th className="p-4 font-medium text-gray-700">Agency</th>
                <th className="p-4 font-medium text-gray-700">Sum Insured</th>
                <th className="p-4 font-medium text-gray-700">Net Prem</th>
                <th className="p-4 font-medium text-gray-700">GST %</th>
                <th className="p-4 font-medium text-gray-700">Gross Prem</th>
                <th className="p-4 font-medium text-gray-700">Payout %</th>
                <th className="p-4 font-medium text-gray cech-700">
                  Payout Val
                </th>
                <th className="p-4 font-medium text-gray-700">Add Payout</th>
                <th className="p-4 font-medium text-gray-700">Total Pay</th>
                <th className="p-4 font-medium text-gray-700">Pay Status</th>
                <th className="p-4 font-medium text-gray-700">Insurer</th>
                <th className="p-4 font-medium text-gray-700">Source</th>
                <th className="p-4 font-medium text-gray-700">Status</th>
                <th className="p-4 font-medium text-gray-700">Assigned To</th>
                <th className="p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads
                .filter((lead) => filter === "All" || lead.status === filter)
                .map((lead) => (
                  <motion.tr
                    key={lead._id}
                    className="border-b hover:bg-gray-50 text-sm"
                  >
                    <td className="p-4">{lead.name}</td>
                    <td className="p-4">{lead.email}</td>
                    <td className="p-4">{lead.mobileNo}</td>
                    <td className="p-4">{lead.policyNumber}</td>
                    <td className="p-4">{lead.lob}</td>
                    <td className="p-4">{lead.agency}</td>
                    <td className="p-4">{formatNumber(lead.sumInsured)}</td>
                    <td className="p-4">
                      {formatCurrency(getLeadNetPremium(lead))}
                    </td>
                    <td className="p-4">{getLeadGSTPercent(lead)}%</td>
                    <td className="p-4">
                      {formatCurrency(leadGrossPremium(lead))}
                    </td>
                    <td className="p-4">{getLeadPayoutPercent(lead)}%</td>
                    <td className="p-4">
                      {formatCurrency(leadPayoutValue(lead))}
                    </td>
                    <td className="p-4">
                      {formatCurrency(getLeadAdditionalPayout(lead))}
                    </td>
                    <td className="p-4">
                      {formatCurrency(leadTotalPayment(lead))}
                    </td>
                    <td className="p-4">{lead.payoutStatus}</td>
                    <td className="p-4">{lead.insurer}</td>
                    <td className="p-4">{lead.source}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
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
                    <td className="p-4">
                      {normalizeAssignedTo(lead.assignedTo)
                        .map(
                          (id) =>
                            users.find((u) => u._id === id)?.name || "Unknown"
                        )
                        .join(", ") || "Unassigned"}
                    </td>
                    <td className="p-4 flex space-x-2 relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedLead(lead)}
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                      >
                        <FaEye className="h-5 w-5" />
                      </motion.button>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={() =>
                            setShowDropdown(
                              showDropdown === lead._id ? null : lead._id
                            )
                          }
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-gray-50 hover:bg-gray-100"
                        >
                          {normalizeAssignedTo(lead.assignedTo).length
                            ? normalizeAssignedTo(lead.assignedTo)
                                .map(
                                  (id) =>
                                    users.find((u) => u._id === id)?.name ||
                                    "Unknown"
                                )
                                .join(", ")
                            : "Assign"}
                        </button>
                        {showDropdown === lead._id && (
                          <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {users.map((user) => (
                              <label
                                key={user._id}
                                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={normalizeAssignedTo(
                                    lead.assignedTo
                                  ).includes(user._id)}
                                  onChange={() =>
                                    toggleUserSelection(lead._id, user._id)
                                  }
                                  className="mr-2"
                                />
                                {user.name}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden p-4 space-y-4">
          {leads
            .filter((lead) => filter === "All" || lead.status === filter)
            .map((lead) => (
              <motion.div
                key={lead._id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 shadow-sm"
              >
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Name:</strong> {lead.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {lead.email}
                  </div>
                  <div>
                    <strong>Mobile:</strong> {lead.mobileNo}
                  </div>
                  <div>
                    <strong>Policy #:</strong> {lead.policyNumber}
                  </div>
                  <div>
                    <strong>LOB:</strong> {lead.lob}
                  </div>
                  <div>
                    <strong>Agency:</strong> {lead.agency}
                  </div>
                  <div>
                    <strong>Net Prem:</strong>{" "}
                    {formatCurrency(getLeadNetPremium(lead))}
                  </div>
                  <div>
                    <strong>Gross Prem:</strong>{" "}
                    {formatCurrency(leadGrossPremium(lead))}
                  </div>
                  <div>
                    <strong>Payout:</strong> {getLeadPayoutPercent(lead)}% →{" "}
                    {formatCurrency(leadPayoutValue(lead))}
                  </div>
                  <div>
                    <strong>Total Pay:</strong>{" "}
                    {formatCurrency(leadTotalPayment(lead))}
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        lead.status === "Open"
                          ? "bg-yellow-100"
                          : lead.status === "Policy Issued"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                  <div>
                    <strong>Assigned:</strong>{" "}
                    {normalizeAssignedTo(lead.assignedTo)
                      .map(
                        (id) =>
                          users.find((u) => u._id === id)?.name || "Unknown"
                      )
                      .join(", ") || "Unassigned"}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="text-indigo-600"
                    >
                      <FaEye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setShowDropdown(
                          showDropdown === lead._id ? null : lead._id
                        )
                      }
                      className="px-3 py-1 border rounded text-xs bg-gray-100"
                    >
                      Assign
                    </button>
                  </div>
                  {showDropdown === lead._id && (
                    <div className="mt-2 border rounded bg-white p-2">
                      {users.map((user) => (
                        <label
                          key={user._id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={normalizeAssignedTo(
                              lead.assignedTo
                            ).includes(user._id)}
                            onChange={() =>
                              toggleUserSelection(lead._id, user._id)
                            }
                          />
                          {user.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </motion.div>
  );
}

export default LeadTable;
