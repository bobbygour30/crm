import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

function LeadModal({ lead, setSelectedLead, activities, users, onAssignLead }) {
  const leadActivities = activities.filter((activity) => activity.leadId === lead.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-0"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg mx-2 sm:mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Lead Details</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedLead(null)}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Name</label>
            <input
              type="text"
              value={lead.name}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Email</label>
            <input
              type="email"
              value={lead.email}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Company</label>
            <input
              type="text"
              value={lead.company}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Phone</label>
            <input
              type="text"
              value={lead.phone}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Source</label>
            <input
              type="text"
              value={lead.source}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Status</label>
            <input
              type="text"
              value={lead.status}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Score</label>
            <input
              type="number"
              value={lead.score}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Assigned To</label>
            <select
              value={lead.assignedTo || ''}
              onChange={(e) => onAssignLead(lead.id, e.target.value || null)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="">Unassign</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Activity History</h3>
            <ul className="space-y-3">
              {leadActivities.length > 0 ? (
                leadActivities.map((activity) => (
                  <li
                    key={activity.id}
                    className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg shadow-sm"
                  >
                    <span className="font-medium">{activity.action}</span> - {activity.timestamp} (
                    {activity.details})
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">No activities found.</li>
              )}
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedLead(null)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            Close
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LeadModal;