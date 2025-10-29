import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
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

            {/* Navigation + Theme Toggle */}
            <div className="flex items-center gap-4">
              <nav className="flex gap-4">
                <Link
                  to="/chat"
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    isActive('/chat')
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  💬 Chat
                </Link>
                <Link
                  to="/todos"
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    isActive('/todos')
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  ✅ Todos
                </Link>
              </nav>

              {/* Theme Toggle Button */}
              <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
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
