import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';

function UserTaskList({ tasks, newTask, setNewTask, handleAddTask }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 tracking-tight">
        Tasks
      </h1>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Add New Task</h2>
        <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
            required
          />
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
            required
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button
            type="submit"
            className="col-span-1 sm:col-span-3 sm:w-32 flex items-center justify-center bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaPlus className="h-5 w-5 inline mr-2" /> Add Task
          </button>
        </form>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Your Tasks</h2>
        <ul className="space-y-3">
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm sm:text-base hover:bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-semibold text-gray-800">{task.title}</p>
                <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
              </div>
              <p
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  task.priority === 'High'
                    ? 'bg-red-100 text-red-600'
                    : task.priority === 'Medium'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-green-100 text-green-600'
                }`}
              >
                {task.priority}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UserTaskList;