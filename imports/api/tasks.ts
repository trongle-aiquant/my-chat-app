import { Mongo } from 'meteor/mongo';

export interface Task {
  _id?: string;
  text: string;
  isChecked: boolean;
  createdAt: Date;
}

export const TasksCollection = new Mongo.Collection<Task>('tasks');

