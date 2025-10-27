import { Mongo } from 'meteor/mongo';

export interface TypingIndicator {
  _id?: string;
  username: string;
  conversationId?: string;
  updatedAt: Date;
}

export const TypingIndicatorsCollection = new Mongo.Collection<TypingIndicator>('typingIndicators');

