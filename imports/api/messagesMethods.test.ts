import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { MessagesCollection } from './messages';
import './messagesMethods';

if (Meteor.isServer) {
  describe('Messages Methods', function () {
    beforeEach(async function () {
      // Clear messages collection before each test
      await MessagesCollection.removeAsync({});
    });

    describe('messages.insert', function () {
      it('should insert a new message with valid data', async function () {
        const text = 'Hello, World!';
        const username = 'TestUser';

        const messageId = await Meteor.callAsync('messages.insert', text, username);

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.isNotNull(message);
        assert.equal(message?.text, text);
        assert.equal(message?.username, username);
        assert.instanceOf(message?.createdAt, Date);
      });

      it('should trim whitespace from text and username', async function () {
        const messageId = await Meteor.callAsync('messages.insert', '  Hello  ', '  User  ');

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.equal(message?.text, 'Hello');
        assert.equal(message?.username, 'User');
      });

      it('should throw error for empty text', async function () {
        try {
          await Meteor.callAsync('messages.insert', '', 'TestUser');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'invalid-text');
        }
      });

      it('should throw error for empty username', async function () {
        try {
          await Meteor.callAsync('messages.insert', 'Hello', '');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'invalid-username');
        }
      });

      it('should throw error for whitespace-only text', async function () {
        try {
          await Meteor.callAsync('messages.insert', '   ', 'TestUser');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'invalid-text');
        }
      });
    });

    describe('messages.remove', function () {
      it('should remove a message by the owner', async function () {
        const messageId = await MessagesCollection.insertAsync({
          text: 'Test message',
          username: 'TestUser',
          createdAt: new Date(),
        });

        await Meteor.callAsync('messages.remove', messageId, 'TestUser');

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.isUndefined(message);
      });

      it('should throw error when trying to delete someone elses message', async function () {
        const messageId = await MessagesCollection.insertAsync({
          text: 'Test message',
          username: 'User1',
          createdAt: new Date(),
        });

        try {
          await Meteor.callAsync('messages.remove', messageId, 'User2');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'unauthorized');
        }
      });

      it('should throw error for non-existent message', async function () {
        try {
          await Meteor.callAsync('messages.remove', 'nonexistent-id', 'TestUser');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'not-found');
        }
      });
    });

    describe('messages.markAsSeen', function () {
      it('should mark message as seen by a user', async function () {
        // Tạo message từ User A
        const messageId = await MessagesCollection.insertAsync({
          text: 'Hello from User A',
          username: 'UserA',
          createdAt: new Date(),
          seenBy: [],
        });

        // User B mark message là đã xem
        await Meteor.callAsync('messages.markAsSeen', messageId, 'UserB');

        // Kiểm tra message đã được mark
        const message = await MessagesCollection.findOneAsync(messageId);
        assert.isNotNull(message);
        assert.equal(message?.seenBy?.length, 1);
        assert.equal(message?.seenBy?.[0].username, 'UserB');
        assert.instanceOf(message?.seenBy?.[0].seenAt, Date);
      });

      it('should not duplicate seenBy when marking twice', async function () {
        const messageId = await MessagesCollection.insertAsync({
          text: 'Test message',
          username: 'UserA',
          createdAt: new Date(),
          seenBy: [],
        });

        // Mark lần 1
        await Meteor.callAsync('messages.markAsSeen', messageId, 'UserB');
        // Mark lần 2 (không nên duplicate)
        await Meteor.callAsync('messages.markAsSeen', messageId, 'UserB');

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.equal(message?.seenBy?.length, 1);
      });

      it('should allow multiple users to mark as seen', async function () {
        const messageId = await MessagesCollection.insertAsync({
          text: 'Test message',
          username: 'UserA',
          createdAt: new Date(),
          seenBy: [],
        });

        // User B và User C mark message
        await Meteor.callAsync('messages.markAsSeen', messageId, 'UserB');
        await Meteor.callAsync('messages.markAsSeen', messageId, 'UserC');

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.equal(message?.seenBy?.length, 2);

        const usernames = message?.seenBy?.map((s) => s.username);
        assert.include(usernames, 'UserB');
        assert.include(usernames, 'UserC');
      });

      it('should throw error for empty username', async function () {
        const messageId = await MessagesCollection.insertAsync({
          text: 'Test message',
          username: 'UserA',
          createdAt: new Date(),
          seenBy: [],
        });

        try {
          await Meteor.callAsync('messages.markAsSeen', messageId, '');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'invalid-username');
        }
      });

      it('should throw error for non-existent message', async function () {
        try {
          await Meteor.callAsync('messages.markAsSeen', 'nonexistent-id', 'UserB');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'not-found');
        }
      });
    });

    describe('messages.update', function () {
      it('should update a message by the owner within 15 minutes', async function () {
        const messageId = await MessagesCollection.insertAsync({
          text: 'Original text',
          username: 'TestUser',
          createdAt: new Date(),
        });

        await Meteor.callAsync('messages.update', messageId, 'Updated text', 'TestUser');

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.equal(message?.text, 'Updated text');
        assert.isTrue(message?.isEdited);
        assert.instanceOf(message?.editedAt, Date);
      });

      it('should throw error when trying to edit someone elses message', async function () {
        const messageId = await MessagesCollection.insertAsync({
          text: 'Original text',
          username: 'User1',
          createdAt: new Date(),
        });

        try {
          await Meteor.callAsync('messages.update', messageId, 'Updated text', 'User2');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'unauthorized');
        }
      });

      it('should throw error when editing after 15 minutes', async function () {
        const sixteenMinutesAgo = new Date(Date.now() - 16 * 60 * 1000);
        const messageId = await MessagesCollection.insertAsync({
          text: 'Original text',
          username: 'TestUser',
          createdAt: sixteenMinutesAgo,
        });

        try {
          await Meteor.callAsync('messages.update', messageId, 'Updated text', 'TestUser');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'time-expired');
        }
      });

      it('should throw error for empty text', async function () {
        const messageId = await MessagesCollection.insertAsync({
          text: 'Original text',
          username: 'TestUser',
          createdAt: new Date(),
        });

        try {
          await Meteor.callAsync('messages.update', messageId, '', 'TestUser');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'invalid-text');
        }
      });

      it('should throw error for non-existent message', async function () {
        try {
          await Meteor.callAsync('messages.update', 'nonexistent-id', 'Updated text', 'TestUser');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'not-found');
        }
      });
    });
  });
}
