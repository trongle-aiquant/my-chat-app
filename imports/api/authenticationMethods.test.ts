import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { MessagesCollection } from './messages';

if (Meteor.isServer) {
  describe('Authentication Integration Tests', function () {
    let testUserId: string;
    let testUsername: string;

    beforeEach(async function () {
      // Clear messages collection before each test
      await MessagesCollection.removeAsync({});

      // Create a test user
      testUsername = `testuser_${Date.now()}`;
      testUserId = await Accounts.createUserAsync({
        username: testUsername,
        password: 'testpassword123',
      });
    });

    afterEach(async function () {
      // Clean up test user
      if (testUserId) {
        await Meteor.users.removeAsync(testUserId);
      }
    });

    describe('User Creation', function () {
      it('should create a user with username and password', async function () {
        const user = await Meteor.users.findOneAsync(testUserId);
        assert.isNotNull(user);
        assert.equal(user?.username, testUsername);
      });

      it('should not allow duplicate usernames', async function () {
        try {
          await Accounts.createUserAsync({
            username: testUsername,
            password: 'anotherpassword',
          });
          assert.fail('Should have thrown an error for duplicate username');
        } catch (error: any) {
          assert.include(error.message.toLowerCase(), 'username already exists');
        }
      });
    });

    describe('messages.insert with Authentication', function () {
      it('should insert a message with authenticated user', async function () {
        // Simulate authenticated context
        const context = { userId: testUserId };
        const insertMethod = Meteor.server.method_handlers['messages.insert'];

        const messageId = await insertMethod.call(context, 'Test message', undefined, null, null);

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.isNotNull(message);
        assert.equal(message?.text, 'Test message');
        assert.equal(message?.userId, testUserId);
        assert.equal(message?.username, testUsername);
      });

      it('should throw error when not authenticated', async function () {
        const context = { userId: null };
        const insertMethod = Meteor.server.method_handlers['messages.insert'];

        try {
          await insertMethod.call(context, 'Test message', undefined, null, null);
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'not-authorized');
        }
      });

      it('should use authenticated users username automatically', async function () {
        const context = { userId: testUserId };
        const insertMethod = Meteor.server.method_handlers['messages.insert'];

        const messageId = await insertMethod.call(context, 'Auto username test', undefined, null, null);

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.equal(message?.username, testUsername);
      });
    });

    describe('messages.update with Authentication', function () {
      it('should allow user to edit their own message', async function () {
        // Create a message as the test user
        const context = { userId: testUserId };
        const insertMethod = Meteor.server.method_handlers['messages.insert'];
        const updateMethod = Meteor.server.method_handlers['messages.update'];

        const messageId = await insertMethod.call(context, 'Original text', undefined, null, null);

        // Edit the message
        await updateMethod.call(context, messageId, 'Updated text');

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.equal(message?.text, 'Updated text');
        assert.isTrue(message?.isEdited);
      });

      it('should not allow user to edit someone elses message', async function () {
        // Create another user
        const otherUserId = await Accounts.createUserAsync({
          username: 'otheruser',
          password: 'password123',
        });

        try {
          // Create message as test user
          const context1 = { userId: testUserId };
          const insertMethod = Meteor.server.method_handlers['messages.insert'];
          const messageId = await insertMethod.call(context1, 'Original text', undefined, null, null);

          // Try to edit as other user
          const context2 = { userId: otherUserId };
          const updateMethod = Meteor.server.method_handlers['messages.update'];
          await updateMethod.call(context2, messageId, 'Hacked text');

          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'unauthorized');
        } finally {
          await Meteor.users.removeAsync(otherUserId);
        }
      });

      it('should throw error when not authenticated', async function () {
        const context = { userId: null };
        const updateMethod = Meteor.server.method_handlers['messages.update'];

        try {
          await updateMethod.call(context, 'fake-id', 'New text');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'not-authorized');
        }
      });
    });

    describe('messages.remove with Authentication', function () {
      it('should allow user to delete their own message', async function () {
        // Create a message as the test user
        const context = { userId: testUserId };
        const insertMethod = Meteor.server.method_handlers['messages.insert'];
        const removeMethod = Meteor.server.method_handlers['messages.remove'];

        const messageId = await insertMethod.call(context, 'Test message', undefined, null, null);

        // Delete the message
        await removeMethod.call(context, messageId);

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.isUndefined(message);
      });

      it('should not allow user to delete someone elses message', async function () {
        // Create another user
        const otherUserId = await Accounts.createUserAsync({
          username: 'otheruser2',
          password: 'password123',
        });

        try {
          // Create message as test user
          const context1 = { userId: testUserId };
          const insertMethod = Meteor.server.method_handlers['messages.insert'];
          const messageId = await insertMethod.call(context1, 'Test message', undefined, null, null);

          // Try to delete as other user
          const context2 = { userId: otherUserId };
          const removeMethod = Meteor.server.method_handlers['messages.remove'];
          await removeMethod.call(context2, messageId);

          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'unauthorized');
        } finally {
          await Meteor.users.removeAsync(otherUserId);
        }
      });

      it('should throw error when not authenticated', async function () {
        const context = { userId: null };
        const removeMethod = Meteor.server.method_handlers['messages.remove'];

        try {
          await removeMethod.call(context, 'fake-id');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'not-authorized');
        }
      });
    });

    describe('messages.markAsSeen with Authentication', function () {
      it('should mark message as seen by authenticated user', async function () {
        // Create a message as test user
        const context1 = { userId: testUserId };
        const insertMethod = Meteor.server.method_handlers['messages.insert'];
        const messageId = await insertMethod.call(context1, 'Test message', undefined, null, null);

        // Create another user to mark as seen
        const otherUserId = await Accounts.createUserAsync({
          username: 'viewer',
          password: 'password123',
        });

        try {
          const context2 = { userId: otherUserId };
          const markAsSeenMethod = Meteor.server.method_handlers['messages.markAsSeen'];
          await markAsSeenMethod.call(context2, messageId);

          const message = await MessagesCollection.findOneAsync(messageId);
          assert.isArray(message?.seenBy);
          assert.equal(message?.seenBy?.length, 1);
          assert.equal(message?.seenBy?.[0].userId, otherUserId);
        } finally {
          await Meteor.users.removeAsync(otherUserId);
        }
      });

      it('should throw error when not authenticated', async function () {
        const context = { userId: null };
        const markAsSeenMethod = Meteor.server.method_handlers['messages.markAsSeen'];

        try {
          await markAsSeenMethod.call(context, 'fake-id');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'not-authorized');
        }
      });
    });

    describe('Backward Compatibility', function () {
      it('should handle old messages without userId', async function () {
        // Insert a message without userId (simulating old data)
        const messageId = await MessagesCollection.insertAsync({
          text: 'Old message',
          username: 'olduser',
          createdAt: new Date(),
          reactions: [],
          seenBy: [],
        });

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.isNotNull(message);
        assert.equal(message?.username, 'olduser');
        assert.isUndefined(message?.userId);
      });
    });
  });
}

