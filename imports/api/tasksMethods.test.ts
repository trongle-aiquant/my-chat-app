import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';
import { TasksCollection } from './tasks';
import './tasksMethods';

if (Meteor.isServer) {
  describe('Tasks Methods', function () {
    beforeEach(async function () {
      // Clear tasks collection before each test
      await TasksCollection.removeAsync({});
    });

    describe('tasks.insert', function () {
      it('should insert a new task with valid data', async function () {
        const text = 'Buy groceries';

        const taskId = await Meteor.callAsync('tasks.insert', text);

        const task = await TasksCollection.findOneAsync(taskId);
        assert.isNotNull(task);
        assert.equal(task?.text, text);
        assert.equal(task?.isChecked, false);
        assert.instanceOf(task?.createdAt, Date);
      });

      it('should trim whitespace from text', async function () {
        const taskId = await Meteor.callAsync('tasks.insert', '  Clean room  ');

        const task = await TasksCollection.findOneAsync(taskId);
        assert.equal(task?.text, 'Clean room');
      });

      it('should throw error for empty text', async function () {
        try {
          await Meteor.callAsync('tasks.insert', '');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'invalid-text');
        }
      });

      it('should throw error for whitespace-only text', async function () {
        try {
          await Meteor.callAsync('tasks.insert', '   ');
          assert.fail('Should have thrown an error');
        } catch (error: any) {
          assert.equal(error.error, 'invalid-text');
        }
      });
    });

    describe('tasks.setChecked', function () {
      it('should toggle task completion status', async function () {
        const taskId = await TasksCollection.insertAsync({
          text: 'Test task',
          isChecked: false,
          createdAt: new Date(),
        });

        await Meteor.callAsync('tasks.setChecked', taskId, true);

        let task = await TasksCollection.findOneAsync(taskId);
        assert.equal(task?.isChecked, true);

        await Meteor.callAsync('tasks.setChecked', taskId, false);

        task = await TasksCollection.findOneAsync(taskId);
        assert.equal(task?.isChecked, false);
      });
    });

    describe('tasks.remove', function () {
      it('should remove an existing task', async function () {
        const taskId = await TasksCollection.insertAsync({
          text: 'Test task',
          isChecked: false,
          createdAt: new Date(),
        });

        await Meteor.callAsync('tasks.remove', taskId);

        const task = await TasksCollection.findOneAsync(taskId);
        assert.isUndefined(task);
      });

      it('should not throw error when removing non-existent task', async function () {
        // This should not throw an error
        await Meteor.callAsync('tasks.remove', 'nonexistent-id');
      });
    });
  });
}

