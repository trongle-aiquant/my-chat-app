import { Button } from 'flowbite-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useDarkMode } from '../hooks/useDarkMode';

export const Home: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 transition-colors duration-300">
      {/* Theme Toggle - Fixed position ở góc trên phải */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-slate-100 mb-4 transition-colors duration-300">
          Welcome to Meteor Chat App
        </h1>
        <p className="text-xl text-gray-600 dark:text-slate-300 mb-8 transition-colors duration-300">
          Real-time collaboration powered by Meteor.js, React, and Flowbite UI
        </p>

        <div className="flex gap-6 justify-center mb-12">
          <Link to="/chat">
            <Button size="xl" color="blue" className="px-8 py-4">
              <span className="text-lg">💬 Start Chatting</span>
            </Button>
          </Link>
          <Link to="/todos">
            <Button size="xl" color="success" className="px-8 py-4">
              <span className="text-lg">✅ Manage Todos</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2 transition-colors duration-300">
              Advanced Chat Features
            </h3>
            <ul className="text-left text-gray-600 dark:text-slate-300 space-y-2 transition-colors duration-300">
              <li>✨ Real-time messaging</li>
              <li>😊 Reactions & Emojis</li>
              <li>↩️ Reply to messages</li>
              <li>📎 File attachments</li>
              <li>👀 Seen status</li>
              <li>⌨️ Typing indicators</li>
              <li>🔍 Message search</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2 transition-colors duration-300">
              Todo Management
            </h3>
            <ul className="text-left text-gray-600 dark:text-slate-300 space-y-2 transition-colors duration-300">
              <li>📝 Create & manage tasks</li>
              <li>✓ Mark as complete</li>
              <li>🔄 Real-time sync</li>
              <li>🎯 Filter options</li>
              <li>📊 Progress tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
