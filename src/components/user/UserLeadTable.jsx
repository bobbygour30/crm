// components/user/UserLeadTable.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEye, FaPlus, FaTimes } from "react-icons/fa";

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

function UserLeadTable() {
  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [newLead, setNewLead] = useState({
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
    sumInsured: "",
    endorsement: "",
    netPremium: "",
    gst: 18,
    payout: "",
    additionalPayout: "",
    payoutStatus: "Pending",
    policyStartDate: "",
    policyExpiryDate: "",
    insurer: "",
    remarks: "",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/user-leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    }
  };

  const calculate = () => {
    const net = parseFloat(newLead.netPremium) || 0;
    const gstRate = parseFloat(newLead.gst) || 18;
    const payoutPct = parseFloat(newLead.payout) || 0;
    const addPay = parseFloat(newLead.additionalPayout) || 0;

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

  const { gross, payoutVal, total } = calculate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const finalLob =
      newLead.lob === "Other Insurance" ? newLead.customLob : newLead.lob;
    const finalAgency =
      newLead.agency === "OTHERS" ? newLead.customAgency : newLead.agency;

    const payload = {
      ...newLead,
      lob: finalLob || newLead.lob,
      agency: finalAgency || newLead.agency,
    };

    try {
      const res = await fetch(`${API_BASE}/api/user-leads`, {
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
        setNewLead({
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
      }
    } catch (err) {
      alert("Failed to save lead");
    }
  };

  const formatCurrency = (val) => {
    return val
      ? Number(val).toLocaleString("en-IN", { maximumFractionDigits: 2 })
      : "0.00";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Leads</h1>
          <div className="flex gap-3 mt-4 md:mt-0">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="All">All Leads</option>
              <option value="Open">Open</option>
              <option value="Policy Issued">Policy Issued</option>
              <option value="Closed Without Issuance">Closed</option>
            </select>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {showForm ? <FaTimes /> : <FaPlus />}
              {showForm ? "Cancel" : "Add Lead"}
            </button>
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
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {/* Basic Information */}
              <input
                placeholder="Customer Name *"
                required
                value={newLead.name}
                onChange={(e) =>
                  setNewLead({ ...newLead, name: e.target.value })
                }
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Mobile No *"
                required
                value={newLead.mobileNo}
                onChange={(e) =>
                  setNewLead({ ...newLead, mobileNo: e.target.value })
                }
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Email"
                value={newLead.email}
                onChange={(e) =>
                  setNewLead({ ...newLead, email: e.target.value })
                }
                className="p-3 border rounded-lg"
              />

              {/* Source & Reference */}
              <input
                placeholder="Source"
                value={newLead.source}
                onChange={(e) =>
                  setNewLead({ ...newLead, source: e.target.value })
                }
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Reference"
                value={newLead.reference}
                onChange={(e) =>
                  setNewLead({ ...newLead, reference: e.target.value })
                }
                className="p-3 border rounded-lg"
              />
              <input
                placeholder="Policy Number"
                value={newLead.policyNumber}
                onChange={(e) =>
                  setNewLead({ ...newLead, policyNumber: e.target.value })
                }
                className="p-3 border rounded-lg"
              />

              {/* LOB & Agency */}
              <div>
                <select
                  value={newLead.lob}
                  onChange={(e) =>
                    setNewLead({
                      ...newLead,
                      lob: e.target.value,
                      customLob:
                        e.target.value === "Other Insurance"
                          ? newLead.customLob
                          : "",
                    })
                  }
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">-- Select LOB --</option>
                  {lobOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {newLead.lob === "Other Insurance" && (
                  <input
                    placeholder="Custom LOB"
                    value={newLead.customLob}
                    onChange={(e) =>
                      setNewLead({ ...newLead, customLob: e.target.value })
                    }
                    className="mt-2 w-full p-3 border rounded-lg"
                  />
                )}
              </div>

              <div>
                <select
                  value={newLead.agency}
                  onChange={(e) =>
                    setNewLead({ ...newLead, agency: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">-- Select Agency --</option>
                  {agencyOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                {newLead.agency === "OTHERS" && (
                  <input
                    placeholder="Custom Agency"
                    value={newLead.customAgency}
                    onChange={(e) =>
                      setNewLead({ ...newLead, customAgency: e.target.value })
                    }
                    className="mt-2 w-full p-3 border rounded-lg"
                  />
                )}
              </div>

              <select
                value={newLead.insurer}
                onChange={(e) =>
                  setNewLead({ ...newLead, insurer: e.target.value })
                }
                className="p-3 border rounded-lg"
              >
                <option value="">-- Select Insurer --</option>
                {insurerOptions.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>

              {/* Sum Insured */}
              <input
                type="number"
                placeholder="Sum Insured"
                value={newLead.sumInsured}
                onChange={(e) =>
                  setNewLead({ ...newLead, sumInsured: parseFloat(e.target.value) || 0 })
                }
                className="p-3 border rounded-lg"
              />

              {/* Endorsement */}
              <input
                placeholder="Endorsement"
                value={newLead.endorsement}
                onChange={(e) =>
                  setNewLead({ ...newLead, endorsement: e.target.value })
                }
                className="p-3 border rounded-lg"
              />

              {/* Policy Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Start Date</label>
                <input
                  type="date"
                  value={newLead.policyStartDate}
                  onChange={(e) =>
                    setNewLead({ ...newLead, policyStartDate: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Expiry Date</label>
                <input
                  type="date"
                  value={newLead.policyExpiryDate}
                  onChange={(e) =>
                    setNewLead({ ...newLead, policyExpiryDate: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              {/* Premium Fields */}
              <input
                type="number"
                placeholder="Net Premium"
                value={newLead.netPremium}
                onChange={(e) =>
                  setNewLead({ ...newLead, netPremium: parseFloat(e.target.value) || 0 })
                }
                className="p-3 border rounded-lg"
              />
              
              <select
                value={newLead.gst}
                onChange={(e) =>
                  setNewLead({ ...newLead, gst: parseFloat(e.target.value) })
                }
                className="p-3 border rounded-lg"
              >
                {gstOptions.map((g) => (
                  <option key={g} value={g}>GST {g}%</option>
                ))}
              </select>
              
              <input
                readOnly
                value={formatCurrency(gross)}
                placeholder="Gross Premium"
                className="p-3 border rounded-lg bg-gray-100"
              />

              {/* Payout Fields */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newLead.payout}
                  onChange={(e) =>
                    setNewLead({ ...newLead, payout: parseFloat(e.target.value) })
                  }
                  className="flex-1"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newLead.payout}
                  onChange={(e) =>
                    setNewLead({ ...newLead, payout: parseFloat(e.target.value) })
                  }
                  className="w-20 p-2 border rounded"
                />
                <span>%</span>
              </div>

              <input
                readOnly
                value={formatCurrency(payoutVal)}
                placeholder="Payout Value"
                className="p-3 border rounded-lg bg-gray-100"
              />
              
              <input
                type="number"
                placeholder="Additional Payout"
                value={newLead.additionalPayout}
                onChange={(e) =>
                  setNewLead({ ...newLead, additionalPayout: parseFloat(e.target.value) || 0 })
                }
                className="p-3 border rounded-lg"
              />

              <input
                readOnly
                value={formatCurrency(total)}
                placeholder="Total Payment"
                className="p-3 border rounded-lg bg-green-50 font-semibold text-green-700"
              />

              {/* Status Fields */}
              <select
                value={newLead.payoutStatus}
                onChange={(e) =>
                  setNewLead({ ...newLead, payoutStatus: e.target.value })
                }
                className="p-3 border rounded-lg"
              >
                <option value="Pending">Payout Status: Pending</option>
                <option value="Received">Payout Status: Received</option>
              </select>

              <select
                value={newLead.status}
                onChange={(e) =>
                  setNewLead({ ...newLead, status: e.target.value })
                }
                className="p-3 border rounded-lg"
              >
                <option value="Open">Status: Open</option>
                <option value="Policy Issued">Status: Policy Issued</option>
                <option value="Closed Without Issuance">Status: Closed</option>
              </select>

              {/* Remarks */}
              <textarea
                placeholder="Remarks"
                value={newLead.remarks}
                onChange={(e) =>
                  setNewLead({ ...newLead, remarks: e.target.value })
                }
                rows="2"
                className="p-3 border rounded-lg"
              />

              <button
                type="submit"
                className="md:col-span-2 lg:col-span-3 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
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
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Mobile</th>
                  <th className="p-4 text-left">LOB</th>
                  <th className="p-4 text-left">Sum Insured</th>
                  <th className="p-4 text-left">Net</th>
                  <th className="p-4 text-left">GST</th>
                  <th className="p-4 text-left">Gross</th>
                  <th className="p-4 text-left">Payout %</th>
                  <th className="p-4 text-left">Total Pay</th>
                  <th className="p-4 text-left">Start Date</th>
                  <th className="p-4 text-left">Expiry Date</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads
                  .filter((l) => filter === "All" || l.status === filter)
                  .map((lead) => (
                    <tr key={lead._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{lead.name}</td>
                      <td className="p-4">{lead.mobileNo}</td>
                      <td className="p-4">{lead.lob}</td>
                      <td className="p-4">{formatCurrency(lead.sumInsured)}</td>
                      <td className="p-4">{formatCurrency(lead.netPremium)}</td>
                      <td className="p-4">{lead.gst}%</td>
                      <td className="p-4">{formatCurrency(lead.grossPremium)}</td>
                      <td className="p-4">{lead.payout}%</td>
                      <td className="p-4 font-semibold text-green-600">
                        {formatCurrency(lead.totalPayment)}
                      </td>
                      <td className="p-4">{formatDate(lead.policyStartDate)}</td>
                      <td className="p-4">{formatDate(lead.policyExpiryDate)}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <FaEye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  <div><strong>Name:</strong> {selectedLead.name}</div>
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
      </div>
    </div>
  );
}

export default UserLeadTable;