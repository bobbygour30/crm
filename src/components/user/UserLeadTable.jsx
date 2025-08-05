import { motion } from 'framer-motion';
import { FaEye } from 'react-icons/fa';
import LeadModal from '../admin/LeadModal';

function UserLeadTable({ leads, filter, setFilter, setSelectedLead, selectedLead }) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 tracking-tight">
        Leads
      </h1>
      <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
        <div className="w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700 mb-1 block sm:hidden">Filter Leads</label>
          <select
            className="w-full sm:w-48 p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Leads</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-4 font-medium text-gray-700">Name</th>
                <th className="p-4 font-medium text-gray-700">Email</th>
                <th className="p-4 font-medium text-gray-700">Source</th>
                <th className="p-4 font-medium text-gray-700">Status</th>
                <th className="p-4 font-medium text-gray-700">Score</th>
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
                    <td className="p-4">{lead.name}</td>
                    <td className="p-4">{lead.email}</td>
                    <td className="p-4">{lead.source}</td>
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
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4">{lead.score}</td>
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
                  <div>
                    <span className="font-medium text-gray-700">Name:</span> {lead.name}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span> {lead.email}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Source:</span> {lead.source}
                  </div>
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
                      {lead.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Score:</span> {lead.score}
                  </div>
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedLead(lead)}
                      className="text-indigo-600 hover:text-indigo-800 p-2"
                    >
                      <FaEye className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
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