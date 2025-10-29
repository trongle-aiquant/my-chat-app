import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';

export const TaskForm: React.FC = () => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Please enter a task');
      return;
    }

    try {
      await Meteor.callAsync('tasks.insert', text);
      setText('');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a new task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 transition-colors duration-300"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Add
        </button>
      </div>
      {error && <div className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</div>}
    </form>
  );
};
