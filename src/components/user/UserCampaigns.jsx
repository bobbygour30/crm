import { motion } from 'framer-motion';
import { useState } from 'react';

function UserCampaigns({ campaigns, user }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter campaigns based on search term and user assignment
  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (campaign.manager === user.name || campaign.agents.includes(user.name))
  );

  // Mock lead counts for demonstration (replace with actual data logic as needed)
  const getLeadCounts = (campaign) => ({
    assigned: Math.floor(Math.random() * 50), // Placeholder for assigned leads
    unassigned: Math.floor(Math.random() * 20), // Placeholder for unassigned leads
    open: Math.floor(Math.random() * 30), // Placeholder for open leads
    inProgress: Math.floor(Math.random() * 15), // Placeholder for in-progress leads
    closed: Math.floor(Math.random() * 25), // Placeholder for closed leads
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-50 min-h-screen mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Assigned Campaigns</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search Campaign"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
        />
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Leads</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unassigned Leads</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Leads</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress Leads</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closed Leads</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-600">No campaigns assigned.</td>
              </tr>
            ) : (
              filteredCampaigns.map((campaign, index) => {
                const leadCounts = getLeadCounts(campaign);
                return (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{leadCounts.assigned}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{leadCounts.unassigned}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{leadCounts.open}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{leadCounts.inProgress}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{leadCounts.closed}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default UserCampaigns;