import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TypingIndicatorsCollection } from './typingIndicators';

Meteor.methods({
  'typingIndicators.set': async function (username: string, conversationId?: string) {
    check(username, String);

    if (!username || username.trim().length === 0) {
      throw new Meteor.Error('invalid-username', 'Username cannot be empty');
    }

    // Remove old typing indicator for this user
    await TypingIndicatorsCollection.removeAsync({ username });

    // Insert new typing indicator
    return await TypingIndicatorsCollection.insertAsync({
      username: username.trim(),
      conversationId,
      updatedAt: new Date(),
    });
  },

  'typingIndicators.clear': async function (username: string) {
    check(username, String);

    return await TypingIndicatorsCollection.removeAsync({ username });
  },
});
