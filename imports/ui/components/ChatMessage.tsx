import React from 'react';
import { Message } from '../../api/messages';
import { MessageReactions } from './MessageReactions';

interface ChatMessageProps {
  message: Message;
  currentUsername: string;
  onReply?: (message: Message) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUsername, onReply }) => {
  const isOwnMessage = message.username === currentUsername;

  return (
    <div className={`mb-4 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Reply reference */}
        {message.replyTo && (
          <div
            className={`mb-2 px-3 py-2 rounded-lg text-xs border-l-4 shadow-sm ${
              isOwnMessage
                ? 'bg-indigo-50 text-indigo-700 border-indigo-400'
                : 'bg-slate-100 text-slate-700 border-slate-400'
            }`}
          >
            <div className="font-bold">↩️ Reply to {message.replyTo.username}</div>
            <div className="truncate opacity-80">{message.replyTo.text}</div>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`p-4 rounded-2xl shadow-lg ${
            isOwnMessage
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md'
              : 'bg-white text-slate-800 rounded-bl-md border border-slate-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-baseline gap-2 mb-2">
            <span
              className={`font-bold text-sm ${isOwnMessage ? 'text-white/90' : 'text-indigo-700'}`}
            >
              {message.username}
            </span>
            <span className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-slate-500'}`}>
              {message.createdAt.toLocaleTimeString()}
            </span>
          </div>

          {/* Message text */}
          <p
            className={`break-words leading-relaxed ${
              isOwnMessage ? 'text-white' : 'text-slate-800'
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
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-full transition-all"
            >
              ↩️ Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
