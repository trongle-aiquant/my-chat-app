import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Reaction } from '../../api/messages';
import { Tooltip } from 'flowbite-react';

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  currentUsername: string;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  currentUsername,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReaction = async (emoji: string) => {
    try {
      await Meteor.callAsync('messages.addReaction', messageId, emoji, currentUsername);
      setShowEmojiPicker(false);
    } catch (err: any) {
      console.error('Error adding reaction:', err);
    }
  };

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Display existing reactions */}
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => {
        const userReacted = reactionList.some(r => r.username === currentUsername);
        const usernames = reactionList.map(r => r.username).join(', ');
        
        return (
          <Tooltip key={emoji} content={usernames}>
            <button
              onClick={() => handleReaction(emoji)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
                userReacted
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              <span>{emoji}</span>
              <span className="text-xs font-semibold text-gray-700">
                {reactionList.length}
              </span>
            </button>
          </Tooltip>
        );
      })}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
          title="Add reaction"
        >
          <span className="text-lg">😊</span>
        </button>

        {/* Emoji picker dropdown */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1 z-10">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-100 transition-all text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

