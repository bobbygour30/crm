import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

function LeadModal({ lead, setSelectedLead, activities }) {
  const leadActivities = activities.filter((activity) => activity.leadId === lead.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="modal-content"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Lead Details</h2>
          <button onClick={() => setSelectedLead(null)} className="text-gray-600 hover:text-gray-800">
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Name</label>
            <input
              type="text"
              value={lead.name}
              className="w-full p-2 border rounded mt-1"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={lead.email}
              className="w-full p-2 border rounded mt-1"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Company</label>
            <input
              type="text"
              value={lead.company}
              className="w-full p-2 border rounded mt-1"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Phone</label>
            <input
              type="text"
              value={lead.phone}
              className="w-full p-2 border rounded mt-1"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Source</label>
            <input
              type="text"
              value={lead.source}
              className="w-full p-2 border rounded mt-1"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <input
              type="text"
              value={lead.status}
              className="w-full p-2 border rounded mt-1"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Score</label>
            <input
              type="number"
              value={lead.score}
              className="w-full p-2 border rounded mt-1"
              readOnly
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Activity History</h3>
            <ul className="mt-2 space-y-2">
              {leadActivities.map((activity) => (
                <li key={activity.id} className="text-sm text-gray-600">
                  <span className="font-medium">{activity.action}</span> - {activity.timestamp} ({activity.details})
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={() => setSelectedLead(null)} className="btn-secondary">Close</button>
          <button className="btn-primary">Save Changes</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LeadModal;