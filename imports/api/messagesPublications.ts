import { Meteor } from 'meteor/meteor';
import { MessagesCollection } from './messages';

Meteor.publish('messages', function () {
  // Publish all messages, sorted by creation date
  // In a real app, you might want to limit this or add pagination
  return MessagesCollection.find({}, {
    sort: { createdAt: 1 },
    limit: 100, // Limit to last 100 messages
  });
});

