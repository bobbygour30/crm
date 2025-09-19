export const leads = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    source: 'Website',
    status: 'New',
    score: 80,
    company: 'Acme Corp',
    phone: '123-456-7890',
    assignedTo: [], // Changed from null to []
    campaignId: 'camp1'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    source: 'Social Media',
    status: 'Contacted',
    score: 65,
    company: 'Tech Solutions',
    phone: '234-567-8901',
    assignedTo: ['2', '3'], // Changed to array and added multiple users for demo
    campaignId: 'camp1'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    source: 'Referral',
    status: 'Qualified',
    score: 90,
    company: 'Global Inc',
    phone: '345-678-9012',
    assignedTo: [], // Changed from null to []
    campaignId: 'camp2'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    source: 'Email',
    status: 'Closed',
    score: 95,
    company: 'Innovate Ltd',
    phone: '456-789-0123',
    assignedTo: ['1'], // Changed from '1' to ['1']
    campaignId: 'camp2'
  },
  {
    id: '5',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    source: 'Website',
    status: 'New',
    score: 75,
    company: 'Future Tech',
    phone: '567-890-1234',
    assignedTo: [], // Changed from null to []
    campaignId: 'camp1'
  },
];

export const tasks = [
  { id: '1', title: 'Follow up with John Doe', dueDate: '2025-08-06', priority: 'High' },
  { id: '2', title: 'Schedule demo with Jane', dueDate: '2025-08-07', priority: 'Medium' },
  { id: '3', title: 'Prepare proposal for Bob', dueDate: '2025-08-08', priority: 'High' },
];

export const users = [
  { id: '1', name: 'Admin User', role: 'Admin', email: 'admin@example.com' },
  { id: '2', name: 'Sales Rep', role: 'User', email: 'sales@example.com' },
  { id: '3', name: 'Marketing Lead', role: 'User', email: 'marketing@example.com' },
];

export const activities = [
  { id: '1', leadId: '1', action: 'Email sent', timestamp: '2025-08-04 10:00 AM', details: 'Sent welcome email' },
  { id: '2', leadId: '1', action: 'Call scheduled', timestamp: '2025-08-04 11:30 AM', details: 'Scheduled for product demo' },
  { id: '3', leadId: '2', action: 'Meeting held', timestamp: '2025-08-03 14:00 PM', details: 'Discussed pricing' },
  { id: '4', leadId: '3', action: 'Proposal sent', timestamp: '2025-08-02 09:00 AM', details: 'Sent detailed proposal' },
];

export const leadTrends = [
  { month: 'Jan', leads: 50 },
  { month: 'Feb', leads: 70 },
  { month: 'Mar', leads: 90 },
  { month: 'Apr', leads: 60 },
  { month: 'May', leads: 80 },
  { month: 'Jun', leads: 100 },
  { month: 'Jul', leads: 120 },
];

export const campaigns = [
  {
    id: 'camp1',
    name: 'Campaign Admin Sep 13, 15:02',
    pipeline: 'Database',
    manager: 'Admin User', // Matches users.name
    agents: ['Sales Rep', 'Marketing Lead'], // Matches users.name
    leadDistribution: 'On Demand',
    additionalSettings: '',
    priority: 'Medium',
    leadDuplicacy: 'Within This Campaign',
    ifDuplicateFound: 'Ignore Duplicate',
    createdAt: 'Sep 13, 2025, 15:02',
  },
  {
    id: 'camp2',
    name: 'Marketing Blitz Q3',
    pipeline: 'CRM',
    manager: 'Admin User', // Matches users.name
    agents: ['Sales Rep'], // Matches users.name
    leadDistribution: 'Equal',
    additionalSettings: 'Target high-value clients',
    priority: 'High',
    leadDuplicacy: 'Across All Campaigns',
    ifDuplicateFound: 'Notify Agent',
    createdAt: 'Sep 12, 2025, 10:30',
  },
];