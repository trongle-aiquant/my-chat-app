import { Button, Dropdown } from 'flowbite-react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current user
  const currentUser = useTracker(() => Meteor.user());
  const isLoggedIn = !!currentUser;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-800">💬 Meteor Chat & Todo</h1>
            </Link>

            <div className="flex items-center gap-4">
              {/* Navigation */}
              <nav className="flex gap-4">
                <Link
                  to="/chat"
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    isActive('/chat')
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  💬 Chat
                </Link>
                <Link
                  to="/todos"
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    isActive('/todos')
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✅ Todos
                </Link>
              </nav>

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
