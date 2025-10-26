import { Mongo } from 'meteor/mongo';

export interface Message {
  _id?: string;
  text: string;
  username: string;
  createdAt: Date;
}

export const MessagesCollection = new Mongo.Collection<Message>('messages');

