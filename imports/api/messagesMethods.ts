import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Attachment, MessagesCollection, Reaction, ReplyTo } from './messages';

Meteor.methods({
  'messages.insert': async function (
    text: string,
    username?: string, // Optional for backward compatibility
    replyTo?: ReplyTo,
    attachments?: Attachment[]
  ) {
    // Authentication check
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to send messages');
    }

    // Validation
    check(text, String);
    check(username, Match.OneOf(undefined, null, String));
    check(replyTo, Match.OneOf(undefined, null, Object));
    check(attachments, Match.OneOf(undefined, null, [Object]));

    if (!text || text.trim().length === 0) {
      throw new Meteor.Error('invalid-text', 'Message text cannot be empty');
    }

    // Get user information
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user) {
      throw new Meteor.Error('user-not-found', 'User not found');
    }

    // Use authenticated user's username, fallback to provided username for backward compatibility
    const messageUsername = user.username || username || 'Anonymous';

    // Clean up empty arrays/undefined values
    const cleanedAttachments = attachments && attachments.length > 0 ? attachments : undefined;
    const cleanedReplyTo = replyTo || undefined;

    // Insert message with userId
    return await MessagesCollection.insertAsync({
      text: text.trim(),
      username: messageUsername,
      userId: this.userId,
      createdAt: new Date(),
      replyTo: cleanedReplyTo,
      attachments: cleanedAttachments,
      reactions: [],
      seenBy: [],
    });
  },

  /**
   * DELETE MESSAGE
   *
   * Only allows deleting your own messages
   *
   * @param {string} messageId - ID of the message to delete
   * @param {string} username - Username (optional, for backward compatibility)
   */
  'messages.remove': async function (messageId: string, username?: string) {
    // Authentication check
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to delete messages');
    }

    check(messageId, String);
    check(username, Match.OneOf(undefined, null, String));

    // Find message
    const message = await MessagesCollection.findOneAsync(messageId);
    if (!message) {
      throw new Meteor.Error('not-found', 'Message not found');
    }

    // Permission check: Only allow deleting your own messages
    // Check by userId first (for authenticated users), fallback to username for backward compatibility
    if (message.userId && message.userId !== this.userId) {
      throw new Meteor.Error('unauthorized', 'You can only delete your own messages');
    } else if (!message.userId && username && message.username !== username) {
      // Backward compatibility: check username if no userId
      throw new Meteor.Error('unauthorized', 'You can only delete your own messages');
    }

    // Delete message
    const result = await MessagesCollection.removeAsync(messageId);

    if (Meteor.isDevelopment) {
      const user = await Meteor.users.findOneAsync(this.userId);
      console.log(`✓ Message ${messageId} deleted by ${user?.username || 'user'}`);
    }

    return result;
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

  'messages.markAsSeen': async function (messageId: string, username?: string) {
    // Authentication check
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to mark messages as seen');
    }

    check(messageId, String);
    check(username, Match.OneOf(undefined, null, String));

    // Get user information
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user) {
      throw new Meteor.Error('user-not-found', 'User not found');
    }

    const currentUsername = user.username || username || 'Anonymous';

    const message = await MessagesCollection.findOneAsync(messageId);
    if (!message) {
      throw new Meteor.Error('not-found', 'Message not found');
    }

    const seenBy = message.seenBy || [];

    // Check if already marked as seen by this user (check by userId)
    const alreadySeen = seenBy.find(
      (s) => s.userId === this.userId || s.username === currentUsername
    );
    if (alreadySeen) {
      // Already seen, no need to update
      if (Meteor.isDevelopment) {
        console.log(`Message ${messageId} already seen by ${currentUsername}`);
      }
      return; // Already seen
    }

    // Update message with new seenBy entry
    const result = await MessagesCollection.updateAsync(messageId, {
      $push: {
        seenBy: {
          username: currentUsername,
          userId: this.userId,
          seenAt: new Date(),
        } as any,
      },
    });

    if (Meteor.isDevelopment) {
      console.log(`✓ Message ${messageId} marked as seen by ${currentUsername}`);
    }

    return result;
  },

  /**
   * EDIT MESSAGE
   *
   * Allows users to edit their own messages within 15 minutes
   *
   * @param {string} messageId - ID of the message to edit
   * @param {string} newText - New message content
   * @param {string} username - Username (optional, for backward compatibility)
   */
  'messages.update': async function (messageId: string, newText: string, username?: string) {
    // Authentication check
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to edit messages');
    }

    check(messageId, String);
    check(newText, String);
    check(username, Match.OneOf(undefined, null, String));

    // Validation
    if (!newText || newText.trim().length === 0) {
      throw new Meteor.Error('invalid-text', 'Message text cannot be empty');
    }

    // Find message
    const message = await MessagesCollection.findOneAsync(messageId);
    if (!message) {
      throw new Meteor.Error('not-found', 'Message not found');
    }

    // Permission check: Only allow editing your own messages
    // Check by userId first (for authenticated users), fallback to username for backward compatibility
    if (message.userId && message.userId !== this.userId) {
      throw new Meteor.Error('unauthorized', 'You can only edit your own messages');
    } else if (!message.userId && username && message.username !== username) {
      // Backward compatibility: check username if no userId
      throw new Meteor.Error('unauthorized', 'You can only edit your own messages');
    }

    // Time check: Only allow editing within 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      throw new Meteor.Error(
        'time-expired',
        'You can only edit messages within 15 minutes of sending'
      );
    }

    // Update message
    const result = await MessagesCollection.updateAsync(messageId, {
      $set: {
        text: newText.trim(),
        isEdited: true,
        editedAt: new Date(),
      },
    });

    if (Meteor.isDevelopment) {
      const user = await Meteor.users.findOneAsync(this.userId);
      console.log(`✓ Message ${messageId} edited by ${user?.username || 'user'}`);
    }

    return result;
  },

  'messages.pin': async function (messageId: string, username: string, conversationId?: string) {
    check(messageId, String);
    check(username, String);

    // Validation
    if (!username || username.trim().length === 0) {
      throw new Meteor.Error('invalid-username', 'Username cannot be empty');
    }

    // Check if message exists
    const message = await MessagesCollection.findOneAsync(messageId);
    if (!message) {
      throw new Meteor.Error('not-found', 'Message not found');
    }

    // Check if already pinned
    if (message.isPinned) {
      throw new Meteor.Error('already-pinned', 'Message is already pinned');
    }

    // Count current pinned messages (max 5)
    const pinnedCount = await MessagesCollection.find({
      isPinned: true,
      conversationId: conversationId || { $exists: false },
    }).countAsync();

    if (pinnedCount >= 5) {
      throw new Meteor.Error('max-pins-reached', 'Maximum 5 pinned messages allowed');
    }

    // Pin the message
    return await MessagesCollection.updateAsync(messageId, {
      $set: {
        isPinned: true,
        pinnedAt: new Date(),
        pinnedBy: username.trim(),
      },
    });
  },

  'messages.unpin': async function (messageId: string) {
    check(messageId, String);

    // Check if message exists
    const message = await MessagesCollection.findOneAsync(messageId);
    if (!message) {
      throw new Meteor.Error('not-found', 'Message not found');
    }

    // Unpin the message
    return await MessagesCollection.updateAsync(messageId, {
      $set: {
        isPinned: false,
      },
      $unset: {
        pinnedAt: '',
        pinnedBy: '',
      },
    });
  },
});
