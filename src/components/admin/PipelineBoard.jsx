import { motion } from 'framer-motion';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

function SortableLead({ lead, users }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignedUser = users && Array.isArray(users) ? users.find((user) => user.id === lead.assignedTo) : null;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
      className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 cursor-grab text-sm sm:text-base hover:shadow-md transition-shadow"
    >
      <p className="font-semibold text-gray-800">{lead.name}</p>
      <p className="text-sm text-gray-600">{lead.email}</p>
      <p className="text-xs text-gray-500">{lead.source}</p>
      {assignedUser && (
        <p className="text-xs text-indigo-600 mt-1">Assigned to: {assignedUser.name}</p>
      )}
    </motion.div>
  );
}

function CampaignCard({ campaign }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-4 mb-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center">
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{campaign.name}</h3>
          <p className="text-sm text-gray-600">Created: {campaign.createdAt}</p>
          <p className="text-sm text-gray-600">Managed by: {campaign.manager}</p>
          <p className="text-sm text-gray-600">Pipeline: {campaign.pipeline}</p>
          <p className="text-sm text-gray-600">Lead Distribution: {campaign.leadDistribution}</p>
          <p className="text-sm text-gray-600">Priority: {campaign.priority}</p>
          <p className="text-sm text-gray-600">Lead Duplicacy: {campaign.leadDuplicacy}</p>
          <p className="text-sm text-gray-600">If Duplicate Found: {campaign.ifDuplicateFound}</p>
          <a href="#" className="text-sm text-indigo-600 hover:underline">Learn More</a>
        </div>
      </div>
    </motion.div>
  );
}

function PipelineBoard({ pipeline, users, campaigns = [], setCampaigns }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    pipeline: 'Database',
    manager: '',
    agents: [],
    leadDistribution: 'On Demand',
    additionalSettings: '',
    priority: 'Medium',
    leadDuplicacy: 'Within This Campaign',
    ifDuplicateFound: 'Ignore Duplicate',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgentChange = (e) => {
    const selectedAgents = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, agents: selectedAgents }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCampaign = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      createdAt: new Date().toLocaleString(),
    };
    setCampaigns((prev) => [...prev, newCampaign]);
    setFormData({
      name: '',
      pipeline: 'Database',
      manager: '',
      agents: [],
      leadDistribution: 'On Demand',
      additionalSettings: '',
      priority: 'Medium',
      leadDuplicacy: 'Within This Campaign',
      ifDuplicateFound: 'Ignore Duplicate',
    });
    setShowForm(false);
  };

  // Fallback if pipeline is undefined or null
  if (!pipeline || typeof pipeline !== 'object') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-600"
      >
        No pipeline data available.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Campaigns</h1>

      {/* Campaign Creation Form */}
      <div className="mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Create New Campaign'}
        </button>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Campaign</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Campaign Abhishek Sep 13, 15:02"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Pipeline</label>
                <select
                  name="pipeline"
                  value={formData.pipeline}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Database">Database</option>
                  <option value="CRM">CRM</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Who will be managing this campaign?</label>
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Manager</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Agents</label>
                <select
                  name="agents"
                  multiple
                  value={formData.agents}
                  onChange={handleAgentChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Lead Distribution</label>
                <select
                  name="leadDistribution"
                  value={formData.leadDistribution}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="On Demand">On Demand</option>
                  <option value="Equal">Equal</option>
                  <option value="Conditional">Conditional</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  {formData.leadDistribution === 'On Demand' && 'Leads stay unassigned until a user assigns it to themself or clicks Start Calling, then the system assigns ten leads at a time.'}
                  {formData.leadDistribution === 'Equal' && 'Distributes leads equally among all agents in the campaign, ensuring fair allocation.'}
                  {formData.leadDistribution === 'Conditional' && 'Assigns leads based on set conditions, ensuring the right leads go to the right agents.'}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Additional Settings</label>
                <textarea
                  name="additionalSettings"
                  value={formData.additionalSettings}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="4"
                  placeholder="Enter additional settings"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Lead Duplicacy</label>
                <select
                  name="leadDuplicacy"
                  value={formData.leadDuplicacy}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Within This Campaign">Within This Campaign</option>
                  <option value="Across All Campaigns">Across All Campaigns</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">If Duplicate Found</label>
                <select
                  name="ifDuplicateFound"
                  value={formData.ifDuplicateFound}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Ignore Duplicate">Ignore Duplicate</option>
                  <option value="Update Existing">Update Existing</option>
                  <option value="Notify Agent">Notify Agent</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create
              </button>
            </form>
          </motion.div>
        )}
      </div>

      {/* Campaign List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaigns</h2>
        {campaigns.length === 0 ? (
          <p className="text-gray-600 text-center">No campaigns available.</p>
        ) : (
          campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))
        )}
      </div>

      {/* Pipeline Board */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Pipeline Board</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Object.keys(pipeline).map((stage) => (
          <SortableContext
            key={stage}
            id={stage}
            items={pipeline[stage].map((lead) => lead.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="bg-gray-50 p-4 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{stage}</h2>
              {pipeline[stage].map((lead) => (
                <SortableLead key={lead.id} lead={lead} users={users} />
              ))}
            </div>
          </SortableContext>
        ))}
      </div>
    </motion.div>
  );
}

export default PipelineBoard;