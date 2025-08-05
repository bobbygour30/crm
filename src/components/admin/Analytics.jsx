import { motion } from 'framer-motion';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { leadTrends } from '../../data/mockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

function Analytics({ leads }) {
  const leadSourceData = {
    labels: ['Website', 'Social Media', 'Referral', 'Email'],
    datasets: [
      {
        label: 'Leads by Source',
        data: [150, 100, 75, 50],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722'],
        borderColor: ['#388E3C', '#1976D2', '#FFA000', '#D81B60'],
        borderWidth: 1,
      },
    ],
  };

  const conversionData = {
    labels: ['Converted', 'Lost'],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ['#4CAF50', '#F44336'],
      },
    ],
  };

  const leadTrendData = {
    labels: leadTrends.map((t) => t.month),
    datasets: [
      {
        label: 'Leads Over Time',
        data: leadTrends.map((t) => t.leads),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
    >
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Lead Conversion</h2>
        <div className="w-full h-64 sm:h-80 md:h-96">
          <Pie
            data={conversionData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
            }}
          />
        </div>
      </div>
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
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Lead Trends</h2>
        <div className="w-full h-64 sm:h-80 md:h-96">
          <Line
            data={leadTrendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default Analytics;