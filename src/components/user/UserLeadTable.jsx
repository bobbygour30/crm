import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye } from 'react-icons/fa';
import LeadModal from '../admin/LeadModal';

function UserLeadTable({ initialLeads, filter, setFilter, setSelectedLead, selectedLead }) {
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
    });
  };

  return (
    <div className="space-y-6 mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Leads</h1>

      {/* Create Lead Form */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Lead</h2>
        <form onSubmit={handleAddLead} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={newLead.name}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg text-sm"
            required
          />
          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={newLead.mobile}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg text-sm"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email ID"
            value={newLead.email}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg text-sm"
            required
          />
          <input
            type="text"
            name="policyNumber"
            placeholder="Policy Number"
            value={newLead.policyNumber}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="number"
            name="netPremium"
            placeholder="Net Premium"
            value={newLead.netPremium}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="number"
            name="grossPremium"
            placeholder="Gross Premium"
            value={newLead.grossPremium}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            name="source"
            placeholder="Source"
            value={newLead.source}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg text-sm"
          />
          <select
            name="status"
            value={newLead.status}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg text-sm"
          >
            <option value="Pending">Pending</option>
            <option value="Issued">Issued</option>
            <option value="Lost">Lost</option>
          </select>
          <button
            type="submit"
            className="sm:col-span-2 lg:col-span-3 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Add Lead
          </button>
        </form>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4">Customer Name</th>
              <th className="p-4">Mobile</th>
              <th className="p-4">Email</th>
              <th className="p-4">Policy Number</th>
              <th className="p-4">Net Premium</th>
              <th className="p-4">Gross Premium</th>
              <th className="p-4">Source</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
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
                  <td className="p-4">{lead.policyNumber}</td>
                  <td className="p-4">{lead.netPremium}</td>
                  <td className="p-4">{lead.grossPremium}</td>
                  <td className="p-4">{lead.source}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full ${
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
      </div>

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
