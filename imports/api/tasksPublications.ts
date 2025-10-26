import { Meteor } from 'meteor/meteor';
import { TasksCollection } from './tasks';

Meteor.publish('tasks', function () {
  return TasksCollection.find({}, {
    sort: { createdAt: -1 },
  });
});

