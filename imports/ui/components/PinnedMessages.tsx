import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import { Message } from '../../api/messages';
import { useDarkMode } from '../hooks/useDarkMode';

interface PinnedMessagesProps {
  pinnedMessages: Message[];
  onScrollToMessage: (messageId: string) => void;
}

/**
 * PinnedMessages Component
 * 
 * Hiển thị danh sách các tin nhắn đã được ghim
 * 
 * Features:
 * - Horizontal scrollable section
 * - Collapse/expand functionality
 * - Click to scroll to original message
 * - Unpin button
 * - Dark mode support (slate colors)
 * - Empty state
 * - Smooth animations
 */
export const PinnedMessages: React.FC<PinnedMessagesProps> = ({ pinnedMessages, onScrollToMessage }) => {
  const { isDarkMode } = useDarkMode();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle unpin message
  const handleUnpin = async (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent scroll to message

    try {
      await Meteor.callAsync('messages.unpin', messageId);
    } catch (error: any) {
      console.error('Error unpinning message:', error);
      alert(error.reason || 'Failed to unpin message');
    }
  };

  // Handle click on pinned message
  const handleClick = (messageId: string) => {
    onScrollToMessage(messageId);
  };

  // Truncate text to max length
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Format timestamp
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // If no pinned messages, don't render anything
  if (pinnedMessages.length === 0) {
    return null;
  }

  return (
    <div
      className={`mb-4 rounded-xl border transition-all duration-300 overflow-hidden ${
        isDarkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-gray-100 border-gray-200'
      }`}
    >
      {/* Header with collapse button */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-200 ${
          isDarkMode
            ? 'hover:bg-slate-700/50'
            : 'hover:bg-gray-200/50'
        }`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">📌</span>
          <span className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
            Pinned Messages
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              isDarkMode
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            {pinnedMessages.length}/5
          </span>
        </div>

        {/* Collapse/Expand icon */}
        <button
          className={`p-1 rounded-lg transition-all duration-300 ${
            isDarkMode
              ? 'hover:bg-slate-600 text-slate-400'
              : 'hover:bg-gray-300 text-gray-600'
          }`}
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Pinned messages list - horizontal scroll */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'max-h-0' : 'max-h-96'
        }`}
      >
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {pinnedMessages.map((message) => (
            <div
              key={message._id}
              onClick={() => handleClick(message._id!)}
              className={`flex-shrink-0 w-80 p-3 rounded-lg border cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* Message header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                      }`}
                    >
                      {message.username}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  {message.pinnedBy && (
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                      Pinned by {message.pinnedBy}
                    </div>
                  )}
                </div>

                {/* Unpin button */}
                <button
                  onClick={(e) => handleUnpin(message._id!, e)}
                  className={`ml-2 p-1 rounded-lg transition-all duration-200 hover:scale-110 ${
                    isDarkMode
                      ? 'hover:bg-slate-500 text-slate-400 hover:text-red-400'
                      : 'hover:bg-gray-200 text-gray-500 hover:text-red-600'
                  }`}
                  title="Unpin message"
                  aria-label="Unpin message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Message text */}
              <p
                className={`text-sm leading-relaxed ${
                  isDarkMode ? 'text-slate-200' : 'text-gray-700'
                }`}
              >
                {truncateText(message.text)}
              </p>

              {/* Pin icon indicator */}
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-xs ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  📌
                </span>
                <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                  Click to view
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

