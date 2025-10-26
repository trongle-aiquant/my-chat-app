import React, { useState } from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { TasksCollection } from '../../api/tasks';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';

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
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Todo List ({pendingCount} pending)</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Hide completed</span>
        </label>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <TaskForm />

        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
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
