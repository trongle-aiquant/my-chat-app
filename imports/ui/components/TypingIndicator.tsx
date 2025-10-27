import React from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { TypingIndicatorsCollection } from '../../api/typingIndicators';

interface TypingIndicatorProps {
  currentUsername: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ currentUsername }) => {
  useSubscribe('typingIndicators');
  
  const typingUsers = useFind(() => 
    TypingIndicatorsCollection.find({
      username: { $ne: currentUsername }
    })
  );

  if (typingUsers.length === 0) {
    return null;
  }

  const usernames = typingUsers.map(u => u.username);
  const displayText = usernames.length === 1
    ? `${usernames[0]} is typing...`
    : `${usernames.join(', ')} are typing...`;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 px-4 py-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
      <span>{displayText}</span>
    </div>
  );
};

