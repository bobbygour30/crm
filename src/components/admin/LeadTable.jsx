import { motion } from 'framer-motion';
import { FaEye } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

function LeadTable({ leads = [], filter, setFilter, setSelectedLead, users = [], onAssignLead, onAddLead }) {
  const lobOptions = [
    'Private Car-OD',
    'Private Car-SOD',
    'Private Car-Comprehensive',
    'Private Car-TP',
    'Taxi-Comprehensive',
    'Taxi-TP',
    'Commerical Vehicle-Comprehensive',
    'Commerical Vehicle-TP',
    'E-Rikshaw-TP',
    'E-Rikshaw-Comprehensive',
    'Two-Wheeler-TP',
    'My home',
    'Mediclaim Health Insurance',
    'Bharat Sookshma Udyam Suraksha',
    'Bharat Laghu Udyam Suraksha',
    'Bharat Grih Raksha',
    'Burglary',
    'MARINE-OPEN',
    'MARINE-SPECIFIC',
    'MARINE-STOP',
    'PERSONAL ACCIDENT',
    'Employee Compensation',
    'Group Health Insurance',
    'Terms Insurance',
    'Ulip Plan',
    'Treditional Plan',
    'Travel Insurance',
    'New Vehicle Insurance',
    'New Two Wheeler Insurance',
    'Other Insurance'
  ];
   const insurerOptions = [
    'Bajaj Allianz Gengeral Insurance Co Ltd',
    'Tata Aig General Insurance Co Ltd',
    'HDFC Ergo General Insurance Co Ltd',
    'ICICI Lombard General Insurance Co Ltd',
    'Digit General Insurance Co Ltd',
    'Reliance General Insurance Co Ltd',
    'SBI General Insurance Co Ltd',
    'Future General General Insurance Co Ltd',
    'Magma HDI General Insurance Co Ltd',
    'Royal Sundram Genetal Insurance Co Ltd',
    'kotak Mahinrda General Insurance Co Ltd',
    'Liberty General Insurance Co Ltd',
    'Shriram General Insurance Co Ltd',
    'United India General Insurance Co Ltd',
    'Oriental General Insurance Co Ltd',
    'National General Insurance Co Ltd',
    'New India General Insurance Co Ltd',
    'Chola MS General Insurance Co Ltd',
    'Universal Sompo General Insurance Co Ltd',
    'Iffco tokio General Insurance Co Ltd',
    'ICICI Prudential Life Insurance',
    'TATA AIA Life Insurance',
    'HDFC  Life Insurance',
    'Reliance Nippon Life Insurance',
    'Axis Max Life Insurance',
    'Niva Bupa Health Insurance',
    'Care Health Insurance',
    'Star Health Insurance',
    'Aditya Birla Health Insurance',
    'Bajaj Allianz Life Insurance',
  ];

  const gstOptions = [0, 5, 12, 18];
  const assignOptions = ['Sales Manager', 'Self', 'Admin', 'User'];

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    source: '',
    status: 'New',
    openStatus: '',
    policyNumber: '',
    lobOption: '',
    lobCustom: '',
    sumInsured: 0,
    endorsement: '',
    payoutPercent: 0,
    payoutStatus: '',
    cashBack: 0,
    netPremium: 0,
    gstPercent: 0,
    policyStartDate: '',
    policyExpiryDate: '',
    mobileNo: '',
    insurer: '',
    remarks: '',
    assignedTo: [],
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizeAssignedTo = (assignedTo) => {
    if (Array.isArray(assignedTo)) return assignedTo;
    if (!assignedTo) return [];
    return [assignedTo];
  };

  const clampPercent = (val) => {
    let n = parseFloat(val);
    if (Number.isNaN(n)) return 0;
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    return Math.round(n);
  };

  const formatCurrency = (value) => {
    const v = parseFloat(value) || 0;
    return v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  const computeTotalPayout = (payoutValue, gstPercent) => {
    const gstAmt = computeGSTAmount(payoutValue, gstPercent);
    return payoutValue + gstAmt;
  };

  // Called when user submits the form
  const handleAddLead = (e) => {
    e.preventDefault();

    const payoutValue = computePayoutValue(newLead.netPremium, newLead.payoutPercent);
    const totalPayout = computeTotalPayout(payoutValue, newLead.gstPercent);

    const finalLOB = newLead.lobOption === 'Other Insurance' ? (newLead.lobCustom || '') : newLead.lobOption;

    const finalLead = {
      ...newLead,
      lob: finalLOB,
      payout: newLead.payoutPercent, // keep old field name compatibility (percentage)
      payoutValue,
      gst: newLead.gstPercent,
      totalPayout,
      assignedTo: selectedUsers
    };

    // remove helper keys
    delete finalLead.lobOption;
    delete finalLead.lobCustom;

    if (typeof onAddLead === 'function') {
      onAddLead(finalLead);
    }

    // reset
    setNewLead({
      name: '',
      email: '',
      source: '',
      status: 'New',
      openStatus: '',
      policyNumber: '',
      lobOption: '',
      lobCustom: '',
      sumInsured: "",
      endorsement: '',
      payoutPercent: "",
      payoutStatus: '',
      cashBack: "",
      netPremium: "",
      gstPercent: "",
      policyStartDate: '',
      policyExpiryDate: '',
      mobileNo: '',
      insurer: '',
      remarks: '',
      assignedTo: []
    });
    setSelectedUsers([]);
    setShowLeadForm(false);
  };

  // Excel upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newLeads = jsonData.map((row) => {
          const netPremium = parseFloat(row['Net Premium']) || parseFloat(row['netPremium']) || 0;
          // prefer an explicit payout percent column, otherwise fall back to 'Payout'
          const payoutPercent = parseFloat(row['Payout Percent'] ?? row['Payout']) || 0;
          const gstPercent = parseFloat(row['GST'] ?? row['GST Percent']) || 0;
          const payoutValue = computePayoutValue(netPremium, payoutPercent);
          const totalPayout = computeTotalPayout(payoutValue, gstPercent);

          return {
            name: row['Insured Name'] || '',
            email: row['Email ID'] || '',
            source: row['Reference'] || '',
            status: row['Status'] || 'New',
            policyNumber: row['Policy Number'] || '',
            lob: row['LOB'] || '',
            sumInsured: parseFloat(row['Sum Insured']) || 0,
            endorsement: row['Endorsement'] || '',
            payoutStatus: row['Payout Status'] || '',
            payout: payoutPercent,
            payoutValue,
            netPremium,
            cashBack: parseFloat(row['Cash Back']) || 0,
            gst: gstPercent,
            totalPayout,
            policyStartDate: '',
            policyExpiryDate: '',
            mobileNo: String(row['Mobile No'] || ''),
            insurer: row['Insurer'] || '',
            remarks: row['Remarks'] || '',
            assignedTo: []
          };
        });

        if (typeof onAddLead === 'function') {
          newLeads.forEach((lead) => onAddLead(lead));
        }
      } catch (error) {
        console.error('Error processing Excel file:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return typeof value === 'number' ? value.toLocaleString() : '0';
  };

  const toggleUserSelection = (leadId, userId) => {
    const currentAssigned = normalizeAssignedTo(
      leads.find((lead) => lead.id === leadId)?.assignedTo || []
    );
    const updatedAssigned = currentAssigned.includes(userId)
      ? currentAssigned.filter((id) => id !== userId)
      : [...currentAssigned, userId];
    if (typeof onAssignLead === 'function') {
      onAssignLead(leadId, updatedAssigned);
    }
  };

  // helpers for table display when older data may not have new fields
  const getLeadPayoutPercent = (lead) => {
    if (lead.payoutPercent !== undefined) return lead.payoutPercent;
    if (lead.payout !== undefined) return lead.payout; // older field
    return 0;
  };

  const getLeadNetPremium = (lead) => {
    return parseFloat(lead.netPremium || lead.netpremium || lead.NetPremium || 0) || 0;
  };

  const getLeadGSTPercent = (lead) => {
    if (lead.gstPercent !== undefined) return lead.gstPercent;
    if (lead.gst !== undefined) return lead.gst; // older field
    return 0;
  };

  const leadPayoutValue = (lead) => computePayoutValue(getLeadNetPremium(lead), getLeadPayoutPercent(lead));
  const leadTotalPayout = (lead) => computeTotalPayout(leadPayoutValue(lead), getLeadGSTPercent(lead));

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
            {showLeadForm ? 'Cancel' : 'Add New Lead'}
          </button>
          <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer">
            Upload Excel
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        <div className="w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700 mb-1 block sm:hidden">
            Filter Leads
          </label>
          <select
            className="w-full sm:w-48 p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-all"
            value={filter || 'All'}
            onChange={(e) => setFilter && setFilter(e.target.value)}
          >
            <option value="All">All Leads</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </motion.div>

      {/* Lead Creation Form */}
      {showLeadForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6"
        >
          <form onSubmit={handleAddLead} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Basic Fields */}
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mobile No</label>
              <input
                type="text"
                value={newLead.mobileNo}
                onChange={(e) => setNewLead({ ...newLead, mobileNo: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Source</label>
              <input
                type="text"
                value={newLead.source}
                onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Status Field */}
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={newLead.status}
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="Policy Issued">Policy Issued</option>
                <option value="Closed Without Issuance">Closed Without Issuance</option>
                <option value="Open">Open</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
              </select>
            </div>

            {/* Conditional Next Step */}
            {newLead.status === 'Open' && (
              <div>
                <label className="text-sm font-medium text-gray-700">Next Step</label>
                <select
                  value={newLead.openStatus}
                  onChange={(e) => setNewLead({ ...newLead, openStatus: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Option</option>
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

            {/* LOB select  + Other option */}
            <div>
              <label className="text-sm font-medium text-gray-700">LOB </label>
              <select
                value={newLead.lobOption}
                onChange={(e) => setNewLead({ ...newLead, lobOption: e.target.value, lobCustom: '' })}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">-- Select LOB --</option>
                {lobOptions.map((lob) => (
                  <option key={lob} value={lob}>{lob}</option>
                ))}
              </select>
              {newLead.lobOption === 'Other Insurance' && (
                <input
                  type="text"
                  placeholder="Enter LOB manually"
                  value={newLead.lobCustom}
                  onChange={(e) => setNewLead({ ...newLead, lobCustom: e.target.value })}
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

            {/* Net Premium */}
            <div>
              <label className="text-sm font-medium text-gray-700">Net Premium</label>
              <input
                type="number"
                value={newLead.netPremium}
                onChange={(e) => setNewLead({ ...newLead, netPremium: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Payout controls: percentage -> payout value (calculated) -> gst -> total payout */}
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
              <label className="text-sm font-medium text-gray-700">Payout Value (calculated)</label>
              <input
                type="text"
                readOnly
                value={formatCurrency(computePayoutValue(newLead.netPremium, newLead.payoutPercent))}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">GST %</label>
              <select
                value={newLead.gstPercent}
                onChange={(e) => setNewLead({ ...newLead, gstPercent: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                {gstOptions.map(g => (
                  <option key={g} value={g}>{g}%</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Total Payout (Payout + GST)</label>
              <input
                type="text"
                readOnly
                value={formatCurrency(computeTotalPayout(computePayoutValue(newLead.netPremium, newLead.payoutPercent), newLead.gstPercent))}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Payout Status</label>
              <select
                value={newLead.payoutStatus}
                onChange={(e) => setNewLead({ ...newLead, payoutStatus: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">-- Select Payout Status --</option>
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Cash Back</label>
              <input
                type="number"
                value={newLead.cashBack}
                onChange={(e) => setNewLead({ ...newLead, cashBack: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Policy Start Date</label>
              <input
                type="date"
                value={newLead.policyStartDate}
                onChange={(e) => setNewLead({ ...newLead, policyStartDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Policy Expiry Date</label>
              <input
                type="date"
                value={newLead.policyExpiryDate}
                onChange={(e) => setNewLead({ ...newLead, policyExpiryDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Insurance Company Dropdown */}
            <div>
              <label className="text-sm font-medium text-gray-700">Insurance Company</label>
              <select
                value={newLead.insurer}
                onChange={(e) => setNewLead({ ...newLead, insurer: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">-- Select Insurance Company --</option>
                {insurerOptions.map((ins, idx) => (
                  <option key={idx} value={ins}>
                    {ins}
                  </option>
                ))}
              </select>
            </div>

            {/* Assign To */}
            <div>
              <label className="text-sm font-medium text-gray-700">Assign To</label>
              <select
                value={selectedUsers}
                onChange={(e) => setSelectedUsers([e.target.value])}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">-- Select Assign To --</option>
                {assignOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                value={newLead.remarks}
                onChange={(e) => setNewLead({ ...newLead, remarks: e.target.value })}
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

      {/* Lead Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-4 font-medium text-gray-700">Name</th>
                <th className="p-4 font-medium text-gray-700">Email</th>
                <th className="p-4 font-medium text-gray-700">Mobile No</th>
                <th className="p-4 font-medium text-gray-700">Policy Number</th>
                <th className="p-4 font-medium text-gray-700">LOB</th>
                <th className="p-4 font-medium text-gray-700">Sum Insured</th>
                <th className="p-4 font-medium text-gray-700">Payout %</th>
                <th className="p-4 font-medium text-gray-700">Payout Value</th>
                <th className="p-4 font-medium text-gray-700">GST %</th>
                <th className="p-4 font-medium text-gray-700">Total Payout</th>
                <th className="p-4 font-medium text-gray-700">Payout Status</th>
                <th className="p-4 font-medium text-gray-700">Total Premium</th>
                <th className="p-4 font-medium text-gray-700">Insurer</th>
                <th className="p-4 font-medium text-gray-700">Source</th>
                <th className="p-4 font-medium text-gray-700">Status</th>
                <th className="p-4 font-medium text-gray-700">Assigned To</th>
                <th className="p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads
                .filter((lead) => filter === 'All' || lead.status === filter)
                .map((lead) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="border-b hover:bg-gray-50 text-sm"
                  >
                    <td className="p-4">{lead.name || ''}</td>
                    <td className="p-4">{lead.email || ''}</td>
                    <td className="p-4">{lead.mobileNo || ''}</td>
                    <td className="p-4">{lead.policyNumber || ''}</td>
                    <td className="p-4">{lead.lob || ''}</td>
                    <td className="p-4">{formatNumber(lead.sumInsured)}</td>
                    <td className="p-4">{getLeadPayoutPercent(lead)}%</td>
                    <td className="p-4">{formatCurrency(leadPayoutValue(lead))}</td>
                    <td className="p-4">{getLeadGSTPercent(lead)}%</td>
                    <td className="p-4">{formatCurrency(leadTotalPayout(lead))}</td>
                    <td className="p-4">{lead.payoutStatus || ''}</td>
                    <td className="p-4">{formatNumber(lead.totalPremium)}</td>
                    <td className="p-4">{lead.insurer || ''}</td>
                    <td className="p-4">{lead.source || ''}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          lead.status === 'New'
                            ? 'bg-blue-100 text-blue-800'
                            : lead.status === 'Contacted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : lead.status === 'Qualified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {lead.status || 'New'}
                      </span>
                    </td>
                    <td className="p-4">
                      {normalizeAssignedTo(lead.assignedTo).length
                        ? normalizeAssignedTo(lead.assignedTo)
                            .map(userId => users.find(user => user.id === userId)?.name || 'Unknown')
                            .join(', ')
                        : 'Unassigned'}
                    </td>
                    <td className="p-4 flex space-x-2 relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedLead && setSelectedLead(lead)}
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                      >
                        <FaEye className="h-5 w-5" />
                      </motion.button>
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdown(showDropdown === lead.id ? null : lead.id)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-gray-50 hover:bg-gray-100"
                        >
                          {normalizeAssignedTo(lead.assignedTo).length
                            ? normalizeAssignedTo(lead.assignedTo)
                                .map(userId => users.find(user => user.id === userId)?.name || 'Unknown')
                                .join(', ')
                            : 'Assign'}
                        </button>
                        {showDropdown === lead.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute z-50 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          >
                            {users.map(user => (
                              <label
                                key={user.id}
                                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={normalizeAssignedTo(lead.assignedTo).includes(user.id)}
                                  onChange={() => toggleUserSelection(lead.id, user.id)}
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
        <div className="block sm:hidden space-y-4 p-4">
          {leads
            .filter((lead) => filter === 'All' || lead.status === filter)
            .map((lead) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 shadow-sm"
              >
                <div className="space-y-2">
                  <div><span className="font-medium text-gray-700">Name:</span> {lead.name || ''}</div>
                  <div><span className="font-medium text-gray-700">Email:</span> {lead.email || ''}</div>
                  <div><span className="font-medium text-gray-700">Mobile No:</span> {lead.mobileNo || ''}</div>
                  <div><span className="font-medium text-gray-700">Policy Number:</span> {lead.policyNumber || ''}</div>
                  <div><span className="font-medium text-gray-700">LOB:</span> {lead.lob || ''}</div>
                  <div><span className="font-medium text-gray-700">Sum Insured:</span> {formatNumber(lead.sumInsured)}</div>
                  <div><span className="font-medium text-gray-700">Payout %:</span> {getLeadPayoutPercent(lead)}%</div>
                  <div><span className="font-medium text-gray-700">Payout Value:</span> {formatCurrency(leadPayoutValue(lead))}</div>
                  <div><span className="font-medium text-gray-700">GST %:</span> {getLeadGSTPercent(lead)}%</div>
                  <div><span className="font-medium text-gray-700">Total Payout:</span> {formatCurrency(leadTotalPayout(lead))}</div>
                  <div><span className="font-medium text-gray-700">Payout Status:</span> {lead.payoutStatus || ''}</div>
                  <div><span className="font-medium text-gray-700">Total Premium:</span> {formatNumber(lead.totalPremium)}</div>
                  <div><span className="font-medium text-gray-700">Insurer:</span> {lead.insurer || ''}</div>
                  <div><span className="font-medium text-gray-700">Source:</span> {lead.source || ''}</div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-xs ${
                        lead.status === 'New'
                          ? 'bg-blue-100 text-blue-800'
                          : lead.status === 'Contacted'
                          ? 'bg-yellow-100 text-yellow-800'
                          : lead.status === 'Qualified'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {lead.status || 'New'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Assigned To:</span>{' '}
                    {normalizeAssignedTo(lead.assignedTo).length
                      ? normalizeAssignedTo(lead.assignedTo)
                          .map(userId => users.find(user => user.id === userId)?.name || 'Unknown')
                          .join(', ')
                      : 'Unassigned'}
                  </div>
                  <div className="flex flex-col space-y-2 pt-2 relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedLead && setSelectedLead(lead)}
                      className="text-indigo-600 hover:text-indigo-800 p-2 self-start"
                    >
                      <FaEye className="h-5 w-5" />
                    </motion.button>
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === lead.id ? null : lead.id)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 hover:bg-gray-100 text-left"
                      >
                        {normalizeAssignedTo(lead.assignedTo).length
                          ? normalizeAssignedTo(lead.assignedTo)
                              .map(userId => users.find(user => user.id === userId)?.name || 'Unknown')
                              .join(', ')
                          : 'Assign'}
                      </button>
                      {showDropdown === lead.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          {users.map(user => (
                            <label
                              key={user.id}
                              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={normalizeAssignedTo(lead.assignedTo).includes(user.id)}
                                onChange={() => toggleUserSelection(lead.id, user.id)}
                                className="mr-2"
                              />
                              {user.name}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </motion.div>
  );
}

export default LeadTable;