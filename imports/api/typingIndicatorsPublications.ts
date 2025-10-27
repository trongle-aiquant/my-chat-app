import { Meteor } from 'meteor/meteor';
import { TypingIndicatorsCollection } from './typingIndicators';

Meteor.publish('typingIndicators', function (conversationId?: string) {
  // Auto-cleanup old typing indicators (older than 5 seconds)
  const fiveSecondsAgo = new Date(Date.now() - 5000);
  
  Meteor.defer(() => {
    TypingIndicatorsCollection.removeAsync({
      updatedAt: { $lt: fiveSecondsAgo },
    });
  });

  const filter = conversationId ? { conversationId } : {};
  return TypingIndicatorsCollection.find(filter);
});

