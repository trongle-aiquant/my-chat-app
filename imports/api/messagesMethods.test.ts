import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';
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
        const messageId = await Meteor.callAsync(
          'messages.insert',
          '  Hello  ',
          '  User  '
        );

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
      it('should remove an existing message', async function () {
        const messageId = await MessagesCollection.insertAsync({
          text: 'Test message',
          username: 'TestUser',
          createdAt: new Date(),
        });

        await Meteor.callAsync('messages.remove', messageId);

        const message = await MessagesCollection.findOneAsync(messageId);
        assert.isUndefined(message);
      });

      it('should not throw error when removing non-existent message', async function () {
        // This should not throw an error
        await Meteor.callAsync('messages.remove', 'nonexistent-id');
      });
    });
  });
}

