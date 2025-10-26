import React, { useState } from 'react';
import { Chat } from './components/Chat';
import { TodoList } from './components/TodoList';

export const App = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'todo'>('chat');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Meteor Chat & Todo App
          </h1>
          <p className="text-gray-600">
            Real-time collaboration powered by Meteor.js
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            💬 Chat Room
          </button>
          <button
            onClick={() => setActiveTab('todo')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'todo'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ✅ Todo List
          </button>
        </div>

        {/* Content */}
        <div className="transition-all duration-300">
          {activeTab === 'chat' ? <Chat /> : <TodoList />}
        </div>
      </div>
    </div>
  );
};
