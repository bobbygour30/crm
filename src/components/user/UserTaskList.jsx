import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';

function UserTaskList({ tasks, newTask, setNewTask, handleAddTask }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6 md:mb-8 tracking-tight">
        Tasks
      </h1>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4">Add New Task</h2>
        <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
            <input
              type="time"
              value={newTask.dueTime || ''}
              onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Info</label>
            <textarea
              placeholder="Additional task information"
              value={newTask.info || ''}
              onChange={(e) => setNewTask({ ...newTask, info: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
              rows="4"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-start">
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              <FaPlus className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" /> Add Task
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4">Your Tasks</h2>
        <ul className="space-y-3">
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start text-sm sm:text-base hover:bg-gray-50 rounded-lg"
            >
              <div className="space-y-1">
                <p className="font-semibold text-gray-800">{task.title}</p>
                <p className="text-sm text-gray-600">Due: {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}</p>
                {task.info && <p className="text-sm text-gray-600">Info: {task.info}</p>}
              </div>
              <p
                className={`text-sm font-medium px-3 py-1 rounded-full mt-2 sm:mt-0 ${
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