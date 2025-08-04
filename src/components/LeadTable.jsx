import { motion } from 'framer-motion';
import { FaEye } from 'react-icons/fa';

function LeadTable({ leads, filter, setFilter, setSelectedLead }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-4 gap-2">
        <select
          className="p-2 xs:p-3 border rounded w-full xs:w-40 sm:w-48 text-xs xs:text-sm sm:text-base"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full table-auto min-w-[200px]">
          <thead>
            <tr className="bg-gray-100 text-left text-xs xs:text-sm sm:text-base">
              <th className="p-2 xs:p-3 sm:p-4">Name</th>
              <th className="p-2 xs:p-3 sm:p-4 hidden xs:table-cell">Email</th>
              <th className="p-2 xs:p-3 sm:p-4 hidden xs:table-cell">Source</th>
              <th className="p-2 xs:p-3 sm:p-4">Status</th>
              <th className="p-2 xs:p-3 sm:p-4">Score</th>
              <th className="p-2 xs:p-3 sm:p-4">Actions</th>
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
                  className="border-b hover:bg-gray-50 text-xs xs:text-sm sm:text-base"
                >
                  <td className="p-2 xs:p-3 sm:p-4">{lead.name}</td>
                  <td className="p-2 xs:p-3 sm:p-4 hidden xs:table-cell">{lead.email}</td>
                  <td className="p-2 xs:p-3 sm:p-4 hidden xs:table-cell">{lead.source}</td>
                  <td className="p-2 xs:p-3 sm:p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs xs:text-sm ${
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
                  <td className="p-2 xs:p-3 sm:p-4">{lead.score}</td>
                  <td className="p-2 xs:p-3 sm:p-4 flex space-x-2">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <FaEye className="h-4 w-4 xs:h-5 xs:w-5" />
                    </button>
                    <button className="bg-green-600 text-white px-3 py-1 xs:px-4 xs:py-2 rounded hover:bg-green-700 transition text-xs xs:text-sm">
                      Assign
                    </button>
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default LeadTable;