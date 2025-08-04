import { motion } from 'framer-motion';

function ActivityTimeline({ activities, leads }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-4 sm:p-6 rounded-xl shadow-md"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
      <div className="space-y-4">
        {activities.map((activity) => {
          const lead = leads.find((l) => l.id === activity.leadId);
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start space-x-4"
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-semibold text-gray-800">
                  {lead ? `${lead.name} - ${activity.action}` : activity.action}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">{activity.timestamp}</p>
                <p className="text-xs sm:text-sm text-gray-500">{activity.details}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default ActivityTimeline;