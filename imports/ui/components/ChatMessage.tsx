import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import { Message } from '../../api/messages';
import { MessageReactions } from './MessageReactions';

interface ChatMessageProps {
  message: Message;
  currentUsername: string;
  onReply?: (message: Message) => void;
  isHighlighted?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUsername,
  onReply,
  isHighlighted,
}) => {
  const isOwnMessage = message.username === currentUsername;
  const [isPinning, setIsPinning] = useState(false);

  // Handle pin/unpin message
  const handleTogglePin = async () => {
    if (isPinning) return; // Prevent double-click

    setIsPinning(true);
    try {
      if (message.isPinned) {
        await Meteor.callAsync('messages.unpin', message._id);
      } else {
        await Meteor.callAsync('messages.pin', message._id, currentUsername);
      }
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      alert(error.reason || 'Failed to pin/unpin message');
    } finally {
      setIsPinning(false);
    }
  };

  // Debug: Log seenBy data (chỉ trong development)
  if (process.env.NODE_ENV === 'development' && isOwnMessage && message.seenBy) {
    console.log(`Message ${message._id} seenBy:`, message.seenBy);
  }

  return (
    <div
      id={`message-${message._id}`}
      className={`mb-4 flex ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      } transition-all duration-500 ${isHighlighted ? 'scale-105' : ''}`}
    >
      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Reply reference */}
        {message.replyTo && (
          <div
            className={`mb-2 px-3 py-2 rounded-lg text-xs border-l-4 shadow-sm transition-colors duration-300 ${
              isOwnMessage
                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-400 dark:border-indigo-500'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600'
            }`}
          >
            <div className="font-bold">↩️ Reply to {message.replyTo.username}</div>
            <div className="truncate opacity-80">{message.replyTo.text}</div>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${
            isOwnMessage
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-600 dark:to-purple-600 text-white rounded-br-md'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md border border-slate-200 dark:border-slate-700'
          } ${isHighlighted ? 'ring-4 ring-indigo-400 dark:ring-indigo-500' : ''}`}
        >
          {/* Header */}
          <div className="flex items-baseline gap-2 mb-2">
            <span
              className={`font-bold text-sm ${
                isOwnMessage ? 'text-white/90' : 'text-indigo-700 dark:text-indigo-400'
              }`}
            >
              {message.username}
            </span>
            <span
              className={`text-xs ${
                isOwnMessage ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {message.createdAt.toLocaleTimeString()}
            </span>
          </div>

          {/* Message text */}
          <p
            className={`break-words leading-relaxed ${
              isOwnMessage ? 'text-white' : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {message.text}
          </p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index}>
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="max-w-full rounded-xl shadow-md border-2 border-white/20"
                    />
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 p-3 rounded-lg transition-all hover:scale-105 ${
                        isOwnMessage
                          ? 'bg-white/20 hover:bg-white/30 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>📎</span>
                      <span className="text-sm font-medium">{attachment.name}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Seen status */}
          {isOwnMessage && message.seenBy && message.seenBy.length > 0 && (
            <div className="mt-2 text-xs text-white/70 font-medium">
              ✓✓ Seen by {message.seenBy.map((s) => s.username).join(', ')}
            </div>
          )}
        </div>

        {/* Reactions */}
        <MessageReactions
          messageId={message._id!}
          reactions={message.reactions || []}
          currentUsername={currentUsername}
        />

        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          {onReply && (
            <button
              onClick={() => onReply(message)}
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1 rounded-full transition-all"
            >
              ↩️ Reply
            </button>
          )}

          {/* Pin/Unpin button */}
          <button
            onClick={handleTogglePin}
            disabled={isPinning}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all duration-200 ${
              message.isPinned
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
            } ${isPinning ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={message.isPinned ? 'Unpin message' : 'Pin message'}
          >
            {isPinning ? '⏳' : message.isPinned ? '📌 Pinned' : '📌 Pin'}
          </button>
        </div>
      </div>
    </div>
  );
};
