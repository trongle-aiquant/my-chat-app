import { Button, Dropdown } from 'flowbite-react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import React from 'react';
<<<<<<< HEAD
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import { ThemeToggle } from './ThemeToggle';
=======
import { Link, useLocation, useNavigate } from 'react-router-dom';
>>>>>>> 07919d91d6c860a932aa08ec3b5fc59439363906

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
<<<<<<< HEAD
  const { isDarkMode, toggleDarkMode } = useDarkMode();
=======
  const navigate = useNavigate();

  // Get current user
  const currentUser = useTracker(() => Meteor.user());
  const isLoggedIn = !!currentUser;
>>>>>>> 07919d91d6c860a932aa08ec3b5fc59439363906

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    Meteor.logout((error) => {
      if (error) {
        console.error('Logout error:', error);
      } else {
        navigate('/auth');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 transition-colors duration-300">
                💬 Meteor Chat & Todo
              </h1>
            </Link>

<<<<<<< HEAD
            {/* Navigation + Theme Toggle */}
            <div className="flex items-center gap-4">
=======
            <div className="flex items-center gap-4">
              {/* Navigation */}
>>>>>>> 07919d91d6c860a932aa08ec3b5fc59439363906
              <nav className="flex gap-4">
                <Link
                  to="/chat"
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    isActive('/chat')
                      ? 'bg-blue-500 text-white shadow-lg'
<<<<<<< HEAD
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600'
=======
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
>>>>>>> 07919d91d6c860a932aa08ec3b5fc59439363906
                  }`}
                >
                  💬 Chat
                </Link>
                <Link
                  to="/todos"
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    isActive('/todos')
                      ? 'bg-green-500 text-white shadow-lg'
<<<<<<< HEAD
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600'
=======
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
>>>>>>> 07919d91d6c860a932aa08ec3b5fc59439363906
                  }`}
                >
                  ✅ Todos
                </Link>
              </nav>

<<<<<<< HEAD
              {/* Theme Toggle Button */}
              <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
=======
              {/* User Menu */}
              {isLoggedIn ? (
                <Dropdown
                  label=""
                  dismissOnClick={true}
                  renderTrigger={() => (
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {currentUser.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="font-semibold text-gray-800">{currentUser.username}</span>
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                >
                  <Dropdown.Header>
                    <span className="block text-sm font-semibold">{currentUser.username}</span>
                    <span className="block truncate text-sm text-gray-500">
                      {currentUser.emails?.[0]?.address || 'No email'}
                    </span>
                  </Dropdown.Header>
                  <Dropdown.Item onClick={() => navigate('/chat')}>💬 Chat</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate('/todos')}>✅ Todos</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <span className="text-red-600 font-semibold">🚪 Logout</span>
                  </Dropdown.Item>
                </Dropdown>
              ) : (
                <Button color="blue" onClick={() => navigate('/auth')}>
                  🔐 Login
                </Button>
              )}
>>>>>>> 07919d91d6c860a932aa08ec3b5fc59439363906
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
