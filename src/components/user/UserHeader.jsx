import { FaBars } from 'react-icons/fa';

function UserHeader({ setIsSidebarOpen, user }) {
  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 rounded-full hover:bg-gray-100"
        >
          <FaBars className="h-6 w-6 text-gray-800" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lead CRM</h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm sm:text-base font-medium text-gray-700">{user.name}</span>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm">
          {user.name.charAt(0)}
        </div>
      </div>
    </header>
  );
}

export default UserHeader;