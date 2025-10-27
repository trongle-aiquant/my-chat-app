import { Button } from 'flowbite-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">Welcome to Meteor Chat App</h1>
        <p className="text-xl text-gray-600 mb-8">
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Advanced Chat Features</h3>
            <ul className="text-left text-gray-600 space-y-2">
              <li>✨ Real-time messaging</li>
              <li>😊 Reactions & Emojis</li>
              <li>↩️ Reply to messages</li>
              <li>📎 File attachments</li>
              <li>👀 Seen status</li>
              <li>⌨️ Typing indicators</li>
              <li>🔍 Message search</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Todo Management</h3>
            <ul className="text-left text-gray-600 space-y-2">
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
