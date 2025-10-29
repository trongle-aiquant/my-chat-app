import { Meteor } from 'meteor/meteor';
import { TasksCollection } from './tasks';

Meteor.publish('tasks', function () {
  // Authentication check
  if (!this.userId) {
    return this.ready();
  }

  return TasksCollection.find(
    {},
    {
      sort: { createdAt: -1 },
    }
  );
});
