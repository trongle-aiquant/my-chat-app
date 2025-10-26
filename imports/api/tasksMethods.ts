import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TasksCollection } from './tasks';

Meteor.methods({
  async 'tasks.insert'(text: string) {
    check(text, String);

    if (!text || text.trim().length === 0) {
      throw new Meteor.Error('invalid-text', 'Task text cannot be empty');
    }

    return await TasksCollection.insertAsync({
      text: text.trim(),
      isChecked: false,
      createdAt: new Date(),
    });
  },

  async 'tasks.remove'(taskId: string) {
    check(taskId, String);
    return await TasksCollection.removeAsync(taskId);
  },

  async 'tasks.setChecked'(taskId: string, isChecked: boolean) {
    check(taskId, String);
    check(isChecked, Boolean);

    return await TasksCollection.updateAsync(taskId, {
      $set: { isChecked },
    });
  },
});

