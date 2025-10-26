import React, { useEffect, useRef } from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { MessagesCollection } from '../../api/messages';
import { ChatMessage } from './ChatMessage';
import { ChatForm } from './ChatForm';

export const Chat: React.FC = () => {
  const isLoading = useSubscribe('messages');
  const messages = useFind(() => MessagesCollection.find({}, { sort: { createdAt: 1 } }));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Chat Room</h2>

      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="h-96 overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No messages yet. Be the first to say hello! 👋
            </div>
          ) : (
            messages.map((message) => <ChatMessage key={message._id} message={message} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatForm />
      </div>
    </div>
  );
};
