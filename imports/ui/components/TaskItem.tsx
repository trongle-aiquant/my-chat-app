import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Task } from '../../api/tasks';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const handleToggle = async () => {
    await Meteor.callAsync('tasks.setChecked', task._id, !task.isChecked);
  };

  const handleDelete = async () => {
    await Meteor.callAsync('tasks.remove', task._id);
  };

  return (
    <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <input
        type="checkbox"
        checked={task.isChecked}
        onChange={handleToggle}
        className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
      />
      <span className={`flex-1 ${task.isChecked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
        {task.text}
      </span>
      <button
        onClick={handleDelete}
        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
      >
        Delete
      </button>
    </li>
  );
};

