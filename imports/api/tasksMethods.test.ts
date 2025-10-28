import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { assert } from 'chai';
import { TasksCollection } from './tasks';
import './tasksMethods';

if (Meteor.isServer) {
  describe('Tasks Methods', function () {
    let testUserId: string;
    let testUsername: string;

    beforeEach(async function () {
      // Clear tasks collection before each test
      await TasksCollection.removeAsync({});

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

    describe('tasks.insert', function () {
      it('should insert a new task with valid data when authenticated', async function () {
        const text = 'Buy groceries';
        const context = { userId: testUserId };
        const insertMethod = Meteor.server.method_handlers['tasks.insert'];

        const taskId = await insertMethod.call(context, text);

        const task = await TasksCollection.findOneAsync(taskId);
        assert.isNotNull(task);
        assert.equal(task?.text, text);
        assert.equal(task?.isChecked, false);
        assert.instanceOf(task?.createdAt, Date);
      });

      it('should trim whitespace from text', async function () {
        const context = { userId: testUserId };
        const insertMethod = Meteor.server.method_handlers['tasks.insert'];

        const taskId = await insertMethod.call(context, '  Clean room  ');

        const task = await TasksCollection.findOneAsync(taskId);
        assert.equal(task?.text, 'Clean room');
      });

      it('should throw error for empty text', async function () {
        const context = { userId: testUserId };
        const insertMethod = Meteor.server.method_handlers['tasks.insert'];

        try {
          await insertMethod.call(context, '');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'invalid-text');
        }
      });

      it('should throw error for whitespace-only text', async function () {
        const context = { userId: testUserId };
        const insertMethod = Meteor.server.method_handlers['tasks.insert'];

        try {
          await insertMethod.call(context, '   ');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'invalid-text');
        }
      });

      it('should throw error when not authenticated', async function () {
        const context = { userId: null };
        const insertMethod = Meteor.server.method_handlers['tasks.insert'];

        try {
          await insertMethod.call(context, 'Test task');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'not-authorized');
        }
      });
    });

    describe('tasks.setChecked', function () {
      it('should toggle task completion status when authenticated', async function () {
        const taskId = await TasksCollection.insertAsync({
          text: 'Test task',
          isChecked: false,
          createdAt: new Date(),
        });

        const context = { userId: testUserId };
        const setCheckedMethod = Meteor.server.method_handlers['tasks.setChecked'];

        await setCheckedMethod.call(context, taskId, true);

        let task = await TasksCollection.findOneAsync(taskId);
        assert.equal(task?.isChecked, true);

        await setCheckedMethod.call(context, taskId, false);

        task = await TasksCollection.findOneAsync(taskId);
        assert.equal(task?.isChecked, false);
      });

      it('should throw error when not authenticated', async function () {
        const taskId = await TasksCollection.insertAsync({
          text: 'Test task',
          isChecked: false,
          createdAt: new Date(),
        });

        const context = { userId: null };
        const setCheckedMethod = Meteor.server.method_handlers['tasks.setChecked'];

        try {
          await setCheckedMethod.call(context, taskId, true);
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'not-authorized');
        }
      });
    });

    describe('tasks.remove', function () {
      it('should remove an existing task when authenticated', async function () {
        const taskId = await TasksCollection.insertAsync({
          text: 'Test task',
          isChecked: false,
          createdAt: new Date(),
        });

        const context = { userId: testUserId };
        const removeMethod = Meteor.server.method_handlers['tasks.remove'];

        await removeMethod.call(context, taskId);

        const task = await TasksCollection.findOneAsync(taskId);
        assert.isUndefined(task);
      });

      it('should not throw error when removing non-existent task', async function () {
        const context = { userId: testUserId };
        const removeMethod = Meteor.server.method_handlers['tasks.remove'];

        // This should not throw an error
        await removeMethod.call(context, 'nonexistent-id');
      });

      it('should throw error when not authenticated', async function () {
        const taskId = await TasksCollection.insertAsync({
          text: 'Test task',
          isChecked: false,
          createdAt: new Date(),
        });

        const context = { userId: null };
        const removeMethod = Meteor.server.method_handlers['tasks.remove'];

        try {
          await removeMethod.call(context, taskId);
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'not-authorized');
        }
      });
    });
  });
}
