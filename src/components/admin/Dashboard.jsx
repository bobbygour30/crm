import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ActivityTimeline from './ActivityTimeline';
import Analytics from './Analytics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ leads, activities, users }) {
  const [pipeline, setPipeline] = useState({
    New: leads.filter((lead) => lead.status === 'New'),
    Contacted: leads.filter((lead) => lead.status === 'Contacted'),
    Qualified: leads.filter((lead) => lead.status === 'Qualified'),
    Closed: leads.filter((lead) => lead.status === 'Closed'),
  });

  const leadSourceData = {
    labels: ['Website', 'Social Media', 'Referral', 'Email'],
    datasets: [
      {
        label: 'Leads by Source',
        data: [
          leads.filter((lead) => lead.source === 'Website').length,
          leads.filter((lead) => lead.source === 'Social Media').length,
          leads.filter((lead) => lead.source === 'Referral').length,
          leads.filter((lead) => lead.source === 'Email').length,
        ],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722'],
        borderColor: ['#388E3C', '#1976D2', '#FFA000', '#D81B60'],
        borderWidth: 1,
      },
    ],
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const sourceColumnId = active.data.current.sortable.containerId;
    const destinationColumnId = over.id;

    if (sourceColumnId !== destinationColumnId) {
      const sourceColumn = [...pipeline[sourceColumnId]];
      const destinationColumn = [...pipeline[destinationColumnId]];
      const [movedLead] = sourceColumn.splice(active.data.current.sortable.index, 1);
      movedLead.status = destinationColumnId;
      destinationColumn.push(movedLead);

      setPipeline({
        ...pipeline,
        [sourceColumnId]: sourceColumn,
        [destinationColumnId]: destinationColumn,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-l-4 border-green-500"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Total Leads</h2>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{leads.length}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-l-4 border-blue-500"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Conversion Rate</h2>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">70%</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Active Deals</h2>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
            {leads.filter((l) => l.status !== 'Closed').length}
          </p>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Leads by Source</h2>
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
        <ActivityTimeline activities={activities} leads={leads} />
      </div>
      <Analytics leads={leads} />
    </motion.div>
  );
}

export default Dashboard;