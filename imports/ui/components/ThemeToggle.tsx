import React from 'react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

/**
 * ThemeToggle Component
 * 
 * Toggle button đẹp mắt để chuyển đổi giữa Light và Dark mode
 * 
 * Features:
 * - Icon mặt trời (☀️) cho light mode
 * - Icon mặt trăng (🌙) cho dark mode
 * - Smooth animation khi chuyển đổi
 * - Responsive và accessible
 * - Tooltip để hướng dẫn user
 * 
 * @param {boolean} isDarkMode - Current dark mode state
 * @param {Function} onToggle - Callback khi click toggle
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="relative group p-2 rounded-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Background với gradient */}
      <div
        className={`absolute inset-0 rounded-lg transition-all duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg shadow-purple-500/50'
            : 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/50'
        }`}
      />

      {/* Icon container */}
      <div className="relative flex items-center justify-center w-10 h-10">
        {/* Sun icon - hiện khi dark mode (để switch sang light) */}
        <div
          className={`absolute transition-all duration-500 ${
            isDarkMode
              ? 'opacity-0 rotate-180 scale-0'
              : 'opacity-100 rotate-0 scale-100'
          }`}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Moon icon - hiện khi light mode (để switch sang dark) */}
        <div
          className={`absolute transition-all duration-500 ${
            isDarkMode
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-180 scale-0'
          }`}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      </div>

      {/* Tooltip (optional - hiện khi hover) */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-1 whitespace-nowrap shadow-lg">
          {isDarkMode ? 'Light mode' : 'Dark mode'}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
        </div>
      </div>
    </button>
  );
};

