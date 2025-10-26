import React from 'react';
import { Message } from '../../api/messages';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className="mb-3 p-3 bg-gray-100 rounded-lg">
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-blue-600">{message.username}</span>
        <span className="text-xs text-gray-500">{message.createdAt.toLocaleTimeString()}</span>
      </div>
      <p className="mt-1 text-gray-800">{message.text}</p>
    </div>
  );
};
