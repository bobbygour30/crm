import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaUser } from 'react-icons/fa';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    dueTime: '',
    priority: 'Medium',
    info: '',
    assignedTo: '',
  });
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  // Inside useEffect in TaskList.jsx

useEffect(() => {
  if (!token) {
    window.location.href = '/login';
    return;
  }

  const loadData = async () => {
    setIsLoading(true);
    
    // 1. Try to load Users (Don't crash if this fails)
    try {
      const usersRes = await fetch(`${API_BASE}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      } else {
        console.warn("Could not load users list (likely permission issue)");
      }
    } catch (err) {
      console.error("User load error (non-critical):", err);
    }

    // 2. Try to load Tasks (This is critical)
    try {
      const tasksRes = await fetch(`${API_BASE}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data); // Update state
      } else {
        const errorData = await tasksRes.json();
        console.error('Task fetch failed:', errorData);
        throw new Error('Failed to load tasks');
      }
    } catch (err) {
      console.error('Load task error:', err);
      // Only redirect to login if it's specifically a 401 (Unauthorized)
      // otherwise, just show 0 tasks or an error message
      if(err.message.includes('401')) {
         localStorage.removeItem('token');
         window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, [token]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.dueDate) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        const task = await res.json();
        setTasks((prev) => [task, ...prev]);
        setNewTask({ title: '', dueDate: '', dueTime: '', priority: 'Medium', info: '', assignedTo: '' });
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create task');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-2xl">Loading tasks...</div>;
  }

  return (
    <motion.div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* Create Task Form */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10">
        <h2 className="text-4xl font-bold text-gray-800 mb-10 flex items-center gap-4">
          <FaPlus className="text-indigo-600 text-5xl" />
          Create New Task
        </h2>

        <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <label className="block text-lg font-bold text-gray-700 mb-3">Task Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition text-lg"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-3 flex items-center gap-3">
              <FaUser className="text-indigo-600" /> Assign To
            </label>
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 text-lg"
            >
              <option value="">Auto-assign to me</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || u.username} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-3">Due Date</label>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-3">Time (Optional)</label>
            <input
              type="time"
              value={newTask.dueTime}
              onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 text-lg"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-3">Priority</label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 text-lg"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <label className="block text-lg font-bold text-gray-700 mb-3">Notes</label>
            <textarea
              value={newTask.info}
              onChange={(e) => setNewTask({ ...newTask, info: e.target.value })}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 text-lg"
              rows="4"
              placeholder="Any additional details..."
            />
          </div>

          <div className="lg:col-span-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xl py-5 px-12 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl flex items-center gap-4 disabled:opacity-70"
            >
              <FaPlus className="text-2xl" />
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>

      {/* All Tasks List */}
      <div className="bg-white rounded-3xl shadow-2xl p-10 border">
        <h2 className="text-4xl font-bold text-gray-800 mb-10">
          All Tasks ({tasks.length})
        </h2>

        {tasks.length === 0 ? (
          <p className="text-center text-2xl text-gray-500 py-20">No tasks yet. Create one!</p>
        ) : (
          <div className="space-y-8">
            {tasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-3xl border shadow-lg hover:shadow-2xl transition"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">{task.title}</h3>
                    <div className="space-y-3 text-gray-700">
                      <p className="text-lg">
                        <strong>Assigned to:</strong>{' '}
                        <span className="font-bold text-indigo-700">
                          {task.assignedTo?.name || task.assignedTo?.username || 'Me'}
                        </span>
                      </p>
                      <p className="text-lg">
                        <strong>Due:</strong> {formatDate(task.dueDate)}
                        {task.dueTime && ` at ${task.dueTime}`}
                      </p>
                      {task.info && (
                        <p className="italic text-gray-600 bg-white p-4 rounded-xl mt-4">
                          "{task.info}"
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-8 py-4 rounded-full text-xl font-bold shadow-lg text-white ${
                      task.priority === 'High'
                        ? 'bg-red-600'
                        : task.priority === 'Medium'
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default TaskList;