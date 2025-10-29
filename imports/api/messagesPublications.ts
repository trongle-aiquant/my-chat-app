import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { MessagesCollection } from './messages';

// Publish user data (username only) for all users
Meteor.publish('users', function () {
  // Authentication check
  if (!this.userId) {
    return this.ready();
  }

  // Publish all users but only username field
  return Meteor.users.find(
    {},
    {
      fields: {
        username: 1,
      },
    }
  );
});

// Old publication - kept for backward compatibility
Meteor.publish('messages', function () {
  // Authentication check
  if (!this.userId) {
    // Return empty cursor for unauthenticated users
    return this.ready();
  }

  // Publish all messages with ALL fields (including seenBy)
  // Sorted by creation date, limit 100 most recent messages
  // NOTE: This publication will be deprecated, use 'messages.paginated' instead
  return MessagesCollection.find(
    {},
    {
      sort: { createdAt: 1 },
      limit: 100, // Limit to last 100 messages
    }
  );
});

/**
 * CURSOR-BASED PAGINATION PUBLICATION
 *
 * Why is cursor-based pagination better than offset-based (skip/limit)?
 *
 * 1. PERFORMANCE:
 *    - Offset-based: MongoDB must scan through N documents to skip, O(N) complexity
 *    - Cursor-based: Uses index directly, O(log N) complexity
 *    - With 10,000 messages, skip(9000) is very slow, but cursor query remains fast
 *
 * 2. CONSISTENCY:
 *    - Offset-based: When new messages arrive, offset shifts → duplicate/missing items
 *    - Cursor-based: Uses _id/createdAt as anchor → not affected by inserts
 *
 * 3. REALTIME:
 *    - Cursor-based is perfect for chat because messages are constantly added
 *    - No duplicates when loading more while new messages arrive
 *
 * @param {string|null} cursor - _id of the last loaded message (null = load newest)
 * @param {number} limit - Number of messages to load (default: 30)
 * @param {string|null} conversationId - ID of conversation (null = all)
 */
Meteor.publish(
  'messages.paginated',
  function (
    cursor: string | null = null,
    limit: number = 30,
    conversationId: string | null = null
  ) {
    // Authentication check
    if (!this.userId) {
      // Return empty cursor for unauthenticated users
      return this.ready();
    }

    // Validation
    check(cursor, Match.OneOf(String, null));
    check(limit, Number);
    check(conversationId, Match.OneOf(String, null));

    // Limit to prevent abuse
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    // Build query
    const query: any = {};

    // Filter by conversation if provided
    if (conversationId) {
      query.conversationId = conversationId;
    }

    // Cursor-based filtering
    // If cursor exists, only get messages OLDER than that cursor (for loading more when scrolling up)
    if (cursor) {
      const cursorMessage = MessagesCollection.findOne(cursor);
      if (cursorMessage) {
        // Get messages with createdAt < cursor.createdAt
        // Or if createdAt is equal, get _id < cursor._id (to handle edge case)
        query.$or = [
          { createdAt: { $lt: cursorMessage.createdAt } },
          {
            createdAt: cursorMessage.createdAt,
            _id: { $lt: cursor },
          },
        ];
      }
    }

    // Query with DESC sort to get newest messages first
    // Client will reverse to display in correct order
    return MessagesCollection.find(query, {
      sort: { createdAt: -1, _id: -1 }, // Sort DESC to get newest
      limit: safeLimit,
    });
  }
);
