import { Mongo } from 'meteor/mongo';

// Reaction interface
export interface Reaction {
  emoji: string;
  username: string;
  userId?: string; // User ID for authenticated users
  createdAt: Date;
}

// Attachment interface
export interface Attachment {
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
}

// Reply reference interface
export interface ReplyTo {
  messageId: string;
  text: string;
  username: string;
  userId?: string; // User ID for authenticated users
}

// Seen status interface
export interface SeenBy {
  username: string;
  userId?: string; // User ID for authenticated users
  seenAt: Date;
}

export interface Message {
  _id?: string;
  text: string;
  username: string; // Keep for backward compatibility
  userId?: string; // User ID for authenticated users
  createdAt: Date;

  // Advanced features
  reactions?: Reaction[];
  replyTo?: ReplyTo;
  attachments?: Attachment[];
  seenBy?: SeenBy[];

  // Pin feature
  isPinned?: boolean;
  pinnedAt?: Date;
  pinnedBy?: string;
  // Edit tracking
  isEdited?: boolean;
  editedAt?: Date;

  // Optional: conversation/room ID for future multi-room support
  conversationId?: string;
}

export const MessagesCollection = new Mongo.Collection<Message>('messages');
