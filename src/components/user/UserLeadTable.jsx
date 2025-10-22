import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye } from 'react-icons/fa';
import LeadModal from '../admin/LeadModal';

function UserLeadTable({ initialLeads, filter, setFilter, setSelectedLead, selectedLead }) {
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
    'HDFC Life Insurance',
    'Reliance Nippon Life Insurance',
    'Axis Max Life Insurance',
    'Niva Bupa Health Insurance',
    'Care Health Insurance',
    'Star Health Insurance',
    'Aditya Birla Health Insurance',
    'Bajaj Allianz Life Insurance',
  ];

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

  const [leads, setLeads] = useState(initialLeads || []);
  const [newLead, setNewLead] = useState({
    name: '',
    mobile: '',
    email: '',
    policyNumber: '',
    netPremium: '',
    grossPremium: '',
    source: '',
    status: 'Pending',
    policyIssueDate: '',
    policyExpiryDate: '',
    companyName: '',
    product: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLead({ ...newLead, [name]: value });
  };

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.mobile || !newLead.email) return;

    const lead = {
      ...newLead,
      id: Date.now(),
      netPremium: parseFloat(newLead.netPremium) || 0,
      grossPremium: parseFloat(newLead.grossPremium) || 0,
    };
    setLeads([lead, ...leads]);
    setNewLead({
      name: '',
      mobile: '',
      email: '',
      policyNumber: '',
      netPremium: '',
      grossPremium: '',
      source: '',
      status: 'Pending',
      policyIssueDate: '',
      policyExpiryDate: '',
      companyName: '',
      product: '',
    });
  };

  return (
    <div className="space-y-6 mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Leads</h1>

      {/* Create Lead Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Lead</h2>
        <form onSubmit={handleAddLead} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Customer Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter customer name"
              value={newLead.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mobile Number *</label>
            <input
              type="text"
              name="mobile"
              placeholder="Enter mobile number"
              value={newLead.mobile}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email ID *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email ID"
              value={newLead.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Policy Number</label>
            <input
              type="text"
              name="policyNumber"
              placeholder="Enter policy number"
              value={newLead.policyNumber}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" title="Date the policy was issued">Policy Issue Date</label>
            <input
              type="date"
              name="policyIssueDate"
              placeholder="Select issue date"
              value={newLead.policyIssueDate}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" title="Date the policy expires">Policy Expiry Date</label>
            <input
              type="date"
              name="policyExpiryDate"
              placeholder="Select expiry date"
              value={newLead.policyExpiryDate}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Product</label>
            <select
              name="product"
              value={newLead.product}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">-- Select Product --</option>
              {lobOptions.map((lob) => (
                <option key={lob} value={lob}>{lob}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Company Name</label>
            <select
              name="companyName"
              value={newLead.companyName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">-- Select Company --</option>
              {insurerOptions.map((insurer) => (
                <option key={insurer} value={insurer}>{insurer}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Net Premium</label>
            <input
              type="number"
              name="netPremium"
              placeholder="Enter net premium"
              value={newLead.netPremium}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Gross Premium</label>
            <input
              type="number"
              name="grossPremium"
              placeholder="Enter gross premium"
              value={newLead.grossPremium}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Source</label>
            <input
              type="text"
              name="source"
              placeholder="Enter source"
              value={newLead.source}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={newLead.status}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="Pending">Pending</option>
              <option value="Issued">Issued</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition focus:ring-2 focus:ring-indigo-500"
            >
              Add Lead
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Leads Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-x-auto"
      >
        <table className="w-full table-auto text-sm min-w-[1100px]">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4 font-medium text-gray-700">Customer Name</th>
              <th className="p-4 font-medium text-gray-700">Mobile</th>
              <th className="p-4 font-medium text-gray-700">Email</th>
              <th className="p-4 font-medium text-gray-700">Policy Number</th>
              <th className="p-4 font-medium text-gray-700" title="Date the policy was issued">Policy Issue Date</th>
              <th className="p-4 font-medium text-gray-700" title="Date the policy expires">Policy Expiry Date</th>
              <th className="p-4 font-medium text-gray-700">Product</th>
              <th className="p-4 font-medium text-gray-700">Company Name</th>
              <th className="p-4 font-medium text-gray-700">Net Premium</th>
              <th className="p-4 font-medium text-gray-700">Gross Premium</th>
              <th className="p-4 font-medium text-gray-700">Source</th>
              <th className="p-4 font-medium text-gray-700">Status</th>
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
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4">{lead.name}</td>
                  <td className="p-4">{lead.mobile}</td>
                  <td className="p-4">{lead.email}</td>
                  <td className="p-4">{lead.policyNumber || ''}</td>
                  <td className="p-4">{lead.policyIssueDate || ''}</td>
                  <td className="p-4">{lead.policyExpiryDate || ''}</td>
                  <td className="p-4">{lead.product || ''}</td>
                  <td className="p-4">{lead.companyName || ''}</td>
                  <td className="p-4">{lead.netPremium}</td>
                  <td className="p-4">{lead.grossPremium}</td>
                  <td className="p-4">{lead.source || ''}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : lead.status === 'Issued'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedLead(lead)}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                    >
                      <FaEye className="h-5 w-5" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </motion.div>

      {/* Lead Modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          setSelectedLead={setSelectedLead}
          activities={[]}
          users={[]}
          onAssignLead={() => {}}
        />
      )}
    </div>
  );
}

export default UserLeadTable;