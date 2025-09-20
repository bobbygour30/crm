import { motion } from 'framer-motion';
import { FaEye } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

function LeadTable({ leads = [], filter, setFilter, setSelectedLead, users = [], onAssignLead, onAddLead }) {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    source: '',
    status: 'New',
    score: 0,
    policyNumber: '',
    lob: '',
    sumInsured: 0,
    endorsement: '',
    payoutStatus: '',
    payout: 0,
    cashBack: 0,
    netPremium: 0,
    gst: 0,
    totalPremium: 0,
    policyStartDate: '',
    policyExpiryDate: '',
    mobileNo: '',
    insurer: '',
    remarks: '',
    assignedTo: []
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Normalize assignedTo to always be an array
  const normalizeAssignedTo = (assignedTo) => {
    if (Array.isArray(assignedTo)) return assignedTo;
    if (assignedTo === null || assignedTo === undefined) return [];
    return [assignedTo];
  };

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

  // Handle manual lead creation
  const handleAddLead = (e) => {
    e.preventDefault();
    if (typeof onAddLead === 'function') {
      onAddLead({ ...newLead, assignedTo: selectedUsers });
    } else {
      console.warn('onAddLead is not a function. Manual lead creation skipped.');
    }
    setNewLead({
      name: '',
      email: '',
      source: '',
      status: 'New',
      score: 0,
      policyNumber: '',
      lob: '',
      sumInsured: 0,
      endorsement: '',
      payoutStatus: '',
      payout: 0,
      cashBack: 0,
      netPremium: 0,
      gst: 0,
      totalPremium: 0,
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

  // Handle Excel file upload
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
        
        // Map Excel data to lead format
        const newLeads = jsonData.map(row => {
          let assignedTo = [];
          if (row.Agent) {
            const usernames = row.Agent.split(',').map(name => name.trim());
            assignedTo = usernames
              .map(name => users.find(user => user.name.toLowerCase() === name.toLowerCase())?.id)
              .filter(id => id !== undefined);
          }
          // Helper function to parse numbers safely
          const parseNumber = (value) => {
            const parsed = parseFloat(value);
            return isNaN(parsed) || value === null || value === undefined ? 0 : parsed;
          };
          return {
            name: row['Insured Name'] || '',
            email: row['Email ID'] || '',
            source: row['Reference'] || '',
            status: row['Status'] || 'New',
            score: parseNumber(row['Payout']),
            policyNumber: row['Policy Number'] || '',
            lob: row['LOB'] || '',
            sumInsured: parseNumber(row['Sum Insured']),
            endorsement: row['Endorsement'] || '',
            payoutStatus: row['Payout Status'] || '',
            payout: parseNumber(row['Payout']),
            cashBack: parseNumber(row['Cash Back']),
            netPremium: parseNumber(row['Net Premium']),
            gst: parseNumber(row['GST']),
            totalPremium: parseNumber(row['Total Premium']),
            policyStartDate: row['Policy Start date'] ? new Date((row['Policy Start date'] - 25569) * 86400 * 1000).toISOString().split('T')[0] : '',
            policyExpiryDate: row['Policy Expiry Date'] ? new Date((row['Policy Expiry Date'] - 25569) * 86400 * 1000).toISOString().split('T')[0] : '',
            mobileNo: row['Mobile No'] ? String(row['Mobile No']) : '',
            insurer: row['Insurer'] || '',
            remarks: row['Remarks'] || '',
            assignedTo
          };
        });
        
        if (typeof onAddLead === 'function') {
          newLeads.forEach(lead => onAddLead(lead));
        } else {
          console.warn('onAddLead is not a function. Excel data not processed.');
        }
      } catch (error) {
        console.error('Error processing Excel file:', error);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Helper function to format numbers safely
  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return typeof value === 'number' ? value.toLocaleString() : '0';
  };

  // Handle multiple user assignment
  const handleMultiAssign = (leadId, selectedUserIds) => {
    if (typeof onAssignLead === 'function') {
      onAssignLead(leadId, selectedUserIds);
      setShowDropdown(null);
    } else {
      console.warn('onAssignLead is not a function. Assignment skipped.');
    }
  };

  // Toggle user selection in dropdown
  const toggleUserSelection = (leadId, userId) => {
    const currentAssigned = normalizeAssignedTo(
      leads.find(lead => lead.id === leadId)?.assignedTo || []
    );
    const updatedAssigned = currentAssigned.includes(userId)
      ? currentAssigned.filter(id => id !== userId)
      : [...currentAssigned, userId];
    handleMultiAssign(leadId, updatedAssigned);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Lead Creation and Upload Controls */}
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
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
        <div className="w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700 mb-1 block sm:hidden">Filter Leads</label>
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
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={newLead.status}
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Score</label>
              <input
                type="number"
                value={newLead.score}
                onChange={(e) => setNewLead({ ...newLead, score: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
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
              <input
                type="text"
                value={newLead.lob}
                onChange={(e) => setNewLead({ ...newLead, lob: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
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
              <label className="text-sm font-medium text-gray-700">Payout Status</label>
              <input
                type="text"
                value={newLead.payoutStatus}
                onChange={(e) => setNewLead({ ...newLead, payoutStatus: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Payout</label>
              <input
                type="number"
                value={newLead.payout}
                onChange={(e) => setNewLead({ ...newLead, payout: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
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
              <label className="text-sm font-medium text-gray-700">Net Premium</label>
              <input
                type="number"
                value={newLead.netPremium}
                onChange={(e) => setNewLead({ ...newLead, netPremium: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">GST</label>
              <input
                type="number"
                value={newLead.gst}
                onChange={(e) => setNewLead({ ...newLead, gst: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Total Premium</label>
              <input
                type="number"
                value={newLead.totalPremium}
                onChange={(e) => setNewLead({ ...newLead, totalPremium: parseFloat(e.target.value) || 0 })}
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
              <label className="text-sm font-medium text-gray-700">Insurer</label>
              <input
                type="text"
                value={newLead.insurer}
                onChange={(e) => setNewLead({ ...newLead, insurer: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Remarks</label>
              <input
                type="text"
                value={newLead.remarks}
                onChange={(e) => setNewLead({ ...newLead, remarks: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">Assign To</label>
              <div
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
                onClick={() => setShowDropdown(showDropdown === 'new' ? null : 'new')}
              >
                {selectedUsers.length > 0
                  ? selectedUsers
                      .map(userId => users.find(user => user.id === userId)?.name || 'Unknown')
                      .join(', ')
                  : 'Select Users'}
              </div>
              {showDropdown === 'new' && (
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
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => {
                          setSelectedUsers(prev =>
                            prev.includes(user.id)
                              ? prev.filter(id => id !== user.id)
                              : [...prev, user.id]
                          );
                        }}
                        className="mr-2"
                      />
                      {user.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
              >
                Create Lead
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
                <th className="p-4 font-medium text-gray-700">Payout Status</th>
                <th className="p-4 font-medium text-gray-700">Payout</th>
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
                    <td className="p-4">{lead.payoutStatus || ''}</td>
                    <td className="p-4">{formatNumber(lead.payout)}</td>
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
                  <div><span className="font-medium text-gray-700">Payout Status:</span> {lead.payoutStatus || ''}</div>
                  <div><span className="font-medium text-gray-700">Payout:</span> {formatNumber(lead.payout)}</div>
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