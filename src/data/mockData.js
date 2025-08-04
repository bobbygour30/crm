export const leads = [
  { id: '1', name: 'John Doe', email: 'john@example.com', source: 'Website', status: 'New', score: 80, company: 'Acme Corp', phone: '123-456-7890' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', source: 'Social Media', status: 'Contacted', score: 65, company: 'Tech Solutions', phone: '234-567-8901' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', source: 'Referral', status: 'Qualified', score: 90, company: 'Global Inc', phone: '345-678-9012' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', source: 'Email', status: 'Closed', score: 95, company: 'Innovate Ltd', phone: '456-789-0123' },
];

export const tasks = [
  { id: '1', title: 'Follow up with John Doe', dueDate: '2025-08-06', priority: 'High' },
  { id: '2', title: 'Schedule demo with Jane', dueDate: '2025-08-07', priority: 'Medium' },
];

export const users = [
  { id: '1', name: 'Admin User', role: 'Admin', email: 'admin@example.com' },
  { id: '2', name: 'Sales Rep', role: 'User', email: 'sales@example.com' },
];

export const activities = [
  { id: '1', leadId: '1', action: 'Email sent', timestamp: '2025-08-04 10:00 AM', details: 'Sent welcome email' },
  { id: '2', leadId: '1', action: 'Call scheduled', timestamp: '2025-08-04 11:30 AM', details: 'Scheduled for product demo' },
  { id: '3', leadId: '2', action: 'Meeting held', timestamp: '2025-08-03 14:00 PM', details: 'Discussed pricing' },
];

export const leadTrends = [
  { month: 'Jan', leads: 50 },
  { month: 'Feb', leads: 70 },
  { month: 'Mar', leads: 90 },
  { month: 'Apr', leads: 60 },
  { month: 'May', leads: 80 },
  { month: 'Jun', leads: 100 },
];