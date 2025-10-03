import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import ActivityTimeline from '../admin/ActivityTimeline';

function UserDashboard({ leads, activities, user }) {
  const userLeads = leads.filter((lead) => lead.assignedTo === user.id);
  const leadSourceData = {
    labels: ['Website', 'Social Media', 'Referral', 'Email'],
    datasets: [
      {
        label: 'Your Leads by Source',
        data: [
          userLeads.filter((lead) => lead.source === 'Website').length,
          userLeads.filter((lead) => lead.source === 'Social Media').length,
          userLeads.filter((lead) => lead.source === 'Referral').length,
          userLeads.filter((lead) => lead.source === 'Email').length,
        ],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722'],
        borderColor: ['#388E3C', '#1976D2', '#FFA000', '#D81B60'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6 mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 tracking-tight">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-l-4 border-green-500"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Your Leads</h2>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{userLeads.length}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-l-4 border-blue-500"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Active Deals</h2>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">
            {userLeads.filter((l) => l.status !== 'Closed').length}
          </p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Tasks Due</h2>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600">3</p>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Your Leads by Source</h2>
          <div className="w-full h-64 sm:h-80 md:h-96">
            <Bar
              data={leadSourceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
              }}
            />
          </div>
        </div>
        <ActivityTimeline
          activities={activities.filter((activity) =>
            userLeads.some((lead) => lead.id === activity.leadId)
          )}
          leads={userLeads}
        />
      </div>
    </div>
  );
}

export default UserDashboard;