import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Attachment, MessagesCollection, Reaction, ReplyTo } from './messages';

Meteor.methods({
  'messages.insert': async function (
    text: string,
    username: string,
    replyTo?: ReplyTo,
    attachments?: Attachment[]
  ) {
    // Validation
    check(text, String);
    check(username, String);
    check(replyTo, Match.OneOf(undefined, null, Object));
    check(attachments, Match.OneOf(undefined, null, [Object]));

    if (!text || text.trim().length === 0) {
      throw new Meteor.Error('invalid-text', 'Message text cannot be empty');
    }

    if (!username || username.trim().length === 0) {
      throw new Meteor.Error('invalid-username', 'Username cannot be empty');
    }

    // Clean up empty arrays/undefined values
    const cleanedAttachments = attachments && attachments.length > 0 ? attachments : undefined;
    const cleanedReplyTo = replyTo || undefined;

    // Insert message
    return await MessagesCollection.insertAsync({
      text: text.trim(),
      username: username.trim(),
      createdAt: new Date(),
      replyTo: cleanedReplyTo,
      attachments: cleanedAttachments,
      reactions: [],
      seenBy: [],
    });
  },

  'messages.remove': async function (messageId: string) {
    check(messageId, String);

    return await MessagesCollection.removeAsync(messageId);
  },

  'messages.addReaction': async function (messageId: string, emoji: string, username: string) {
    check(messageId, String);
    check(emoji, String);
    check(username, String);

    const message = await MessagesCollection.findOneAsync(messageId);
    if (!message) {
      throw new Meteor.Error('not-found', 'Message not found');
    }

    const reactions = message.reactions || [];

    // Check if user already reacted with this emoji
    const existingReaction = reactions.find((r) => r.username === username && r.emoji === emoji);

    if (existingReaction) {
      // Remove reaction if already exists (toggle)
      return await MessagesCollection.updateAsync(messageId, {
        $pull: { reactions: { username, emoji } as any },
      });
    } else {
      // Add new reaction
      const newReaction: Reaction = {
        emoji,
        username,
        createdAt: new Date(),
      };

      return await MessagesCollection.updateAsync(messageId, {
        $push: { reactions: newReaction as any },
      });
    }
  },

  'messages.markAsSeen': async function (messageId: string, username: string) {
    check(messageId, String);
    check(username, String);

    // Validation: username không được rỗng
    if (!username || username.trim().length === 0) {
      throw new Meteor.Error('invalid-username', 'Username cannot be empty');
    }

    const message = await MessagesCollection.findOneAsync(messageId);
    if (!message) {
      throw new Meteor.Error('not-found', 'Message not found');
    }

    const seenBy = message.seenBy || [];

    // Check if already marked as seen by this user
    const alreadySeen = seenBy.find((s) => s.username === username);
    if (alreadySeen) {
      // Đã seen rồi, không cần update
      if (Meteor.isDevelopment) {
        console.log(`Message ${messageId} already seen by ${username}`);
      }
      return; // Already seen
    }

    // Update message với seenBy mới
    const result = await MessagesCollection.updateAsync(messageId, {
      $push: {
        seenBy: {
          username: username.trim(),
          seenAt: new Date(),
        } as any,
      },
    });

    if (Meteor.isDevelopment) {
      console.log(`✓ Message ${messageId} marked as seen by ${username}`);
    }

    return result;
  },
});
