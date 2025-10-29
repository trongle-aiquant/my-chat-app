import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import React, { useState } from 'react';
import { TasksCollection } from '../../api/tasks';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';

export const TodoList: React.FC = () => {
  const isLoading = useSubscribe('tasks');
  const [hideCompleted, setHideCompleted] = useState(false);

  const tasks = useFind(() => {
    const filter = hideCompleted ? { isChecked: false } : {};
    return TasksCollection.find(filter, { sort: { createdAt: -1 } });
  }, [hideCompleted]);

  const pendingCount = useFind(() => TasksCollection.find({ isChecked: false })).length;

  if (isLoading()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 transition-colors duration-300">
          Todo List ({pendingCount} pending)
        </h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600 dark:text-slate-300">Hide completed</span>
        </label>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 transition-colors duration-300">
        <TaskForm />

        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-slate-400 py-8">
            {hideCompleted ? 'All tasks completed! 🎉' : 'No tasks yet. Add one above! ✨'}
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <TaskItem key={task._id} task={task} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
