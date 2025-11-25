import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

function UserTaskList() {
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: "",
    dueTime: "",
    priority: "Medium",
    info: "",
  });

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchUserTasks();
  }, []);

  const fetchUserTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/user-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUserTasks(data);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Login required");

    try {
      const res = await fetch(`${API_BASE}/api/user-tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        const savedTask = await res.json();
        setUserTasks([savedTask, ...userTasks]);
        setNewTask({
          title: "",
          dueDate: "",
          dueTime: "",
          priority: "Medium",
          info: "",
        });
        toast.success("Task added!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add task");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tasks</h1>

      {/* Add Task Form */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h2 className="text-xl font-semibold mb-6">Add New Task</h2>
        <form
          onSubmit={handleAddTask}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="Enter title"
              required
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              required
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={newTask.dueTime}
              onChange={(e) =>
                setNewTask({ ...newTask, dueTime: e.target.value })
              }
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({ ...newTask, priority: e.target.value })
              }
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              placeholder="Additional info..."
              value={newTask.info}
              onChange={(e) => setNewTask({ ...newTask, info: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="3"
            />
          </div>

          <div className="lg:col-span-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
            >
              <FaPlus /> Add Task
            </button>
          </div>
        </form>
      </div>

      {/* Task List */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h2 className="text-xl font-semibold mb-6">
          Your Tasks ({userTasks.length})
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading your tasks...</p>
        ) : userTasks.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No tasks yet. Create one!
          </p>
        ) : (
          <ul className="space-y-4">
            {userTasks.map((task) => (
              <motion.li
                key={task._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-gray-50 rounded-xl border hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{task.title}</h3>
                    <p className="text-sm text-gray-600">
                      Due: {formatDate(task.dueDate)}{" "}
                      {task.dueTime && `at ${task.dueTime}`}
                    </p>
                    {task.info && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        "{task.info}"
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-bold ${
                      task.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default UserTaskList;
