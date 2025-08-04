import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';

function TaskList({ tasks, newTask, setNewTask, handleAddTask }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Add New Task</h2>
        <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="p-2 border rounded w-full"
            required
          />
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="p-2 border rounded w-full"
            required
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            className="p-2 border rounded w-full"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button type="submit" className="btn-primary col-span-1 sm:col-span-3 sm:w-32">
            <FaPlus className="h-5 w-5 inline mr-2" /> Add Task
          </button>
        </form>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Tasks</h2>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm sm:text-base"
            >
              <div>
                <p className="font-semibold text-gray-800">{task.title}</p>
                <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
              </div>
              <p className={`text-sm font-medium ${task.priority === 'High' ? 'text-red-600' : task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                {task.priority}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default TaskList;