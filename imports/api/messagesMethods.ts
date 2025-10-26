import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { MessagesCollection } from './messages';

Meteor.methods({
  async 'messages.insert'(text: string, username: string) {
    // Validation
    check(text, String);
    check(username, String);

    if (!text || text.trim().length === 0) {
      throw new Meteor.Error('invalid-text', 'Message text cannot be empty');
    }

    if (!username || username.trim().length === 0) {
      throw new Meteor.Error('invalid-username', 'Username cannot be empty');
    }

    // Insert message
    return await MessagesCollection.insertAsync({
      text: text.trim(),
      username: username.trim(),
      createdAt: new Date(),
    });
  },

  async 'messages.remove'(messageId: string) {
    check(messageId, String);
    
    return await MessagesCollection.removeAsync(messageId);
  },
});

