import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TasksCollection } from './tasks';

Meteor.methods({
  'tasks.insert': async function (text: string) {
    // Authentication check
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to create tasks');
    }

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

  'tasks.remove': async function (taskId: string) {
    // Authentication check
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to delete tasks');
    }

    check(taskId, String);
    return await TasksCollection.removeAsync(taskId);
  },

  'tasks.setChecked': async function (taskId: string, isChecked: boolean) {
    // Authentication check
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update tasks');
    }

    check(taskId, String);
    check(isChecked, Boolean);

    return await TasksCollection.updateAsync(taskId, {
      $set: { isChecked },
    });
  },
});
