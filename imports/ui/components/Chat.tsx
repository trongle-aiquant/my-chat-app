import { TextInput } from 'flowbite-react';
import { Meteor } from 'meteor/meteor';
import { useFind, useSubscribe, useTracker } from 'meteor/react-meteor-data';
import React, { useEffect, useRef, useState } from 'react';
import { Message, MessagesCollection } from '../../api/messages';
import { ChatForm } from './ChatForm';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

export const Chat: React.FC = () => {
  // Get current user from Meteor
  const currentUser = useTracker(() => Meteor.user());
  const currentUserId = useTracker(() => Meteor.userId());
  const currentUsername = currentUser?.username || '';

  const isLoading = useSubscribe('messages');
  useSubscribe('users'); // Subscribe to users for username display
  const messages = useFind(() => MessagesCollection.find({}, { sort: { createdAt: 1 } }));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Ref to track messages already marked as seen (avoid calling multiple times)
  const markedAsSeenRef = useRef<Set<string>>(new Set());

  // Get pinned messages
  const pinnedMessages = messages.filter((m) => m.isPinned).slice(0, 5);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as seen - with debounce and error handling
  useEffect(() => {
    if (!currentUserId || !currentUsername || messages.length === 0) {
      return;
    }

    // Debounce: Wait 500ms after messages change before marking as seen
    const timeoutId = setTimeout(() => {
      messages.forEach(async (message) => {
        // Only mark messages from others (not your own messages)
        if (message.userId !== currentUserId) {
          // Check if already marked (both in DB and in local ref)
          const alreadySeen = message.seenBy?.some(
            (s) => s.userId === currentUserId || s.username === currentUsername
          );
          const alreadyMarkedLocally = markedAsSeenRef.current.has(message._id!);

          if (!alreadySeen && !alreadyMarkedLocally) {
            try {
              // Mark locally first to avoid calling again
              markedAsSeenRef.current.add(message._id!);

              // Call method to mark as seen
              await Meteor.callAsync('messages.markAsSeen', message._id!);

              console.log(`✓ Marked message ${message._id} as seen by ${currentUsername}`);
            } catch (error: any) {
              console.error('Error marking message as seen:', error);
              // If error, remove from local ref to retry
              markedAsSeenRef.current.delete(message._id!);
            }
          }
        }
      });
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [messages, currentUserId, currentUsername]);

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Handle scroll to message (from pinned messages)
  const handleScrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement && messagesContainerRef.current) {
      // Scroll to message
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight message for 3 seconds
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 3000);
    }
  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    // Cancel reply nếu đang reply
    setReplyingTo(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handleDelete = (messageId: string) => {
    // Callback after successful deletion (if needed)
    console.log(`Message ${messageId} deleted`);
  };

  // Filter messages based on search query
  const filteredMessages = searchQuery
    ? messages.filter(
        (msg) =>
          msg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  if (isLoading()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Modern chat container with gradient background */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 px-6 py-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Chat Room</h2>
                <p className="text-sm text-white/80">
                  Welcome, <span className="font-semibold">{currentUsername}</span>
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="w-64">
              <div className="relative">
                <TextInput
                  type="text"
                  placeholder="🔍 Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sizing="sm"
                  style={{
                    backgroundColor: 'white',
                    color: '#1e293b',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                  className="placeholder:text-slate-400 focus:ring-2 focus:ring-white/50 focus:border-white shadow-lg dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-6">
          {/* Username input (if not set) */}
          {!currentUsername && (
            <div className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-xl border-2 border-indigo-200 dark:border-indigo-600 shadow-md transition-colors duration-300">
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3 transition-colors duration-300">
                <span className="text-xl">👤</span>
                Enter your name to start chatting:
              </label>
              <TextInput
                type="text"
                placeholder="Your name"
                onBlur={(e) => setCurrentUsername(e.target.value)}
                sizing="md"
                style={{
                  backgroundColor: 'white',
                  color: '#1e293b',
                }}
                className="placeholder:text-slate-400 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 shadow-sm dark:bg-slate-700 dark:text-slate-100 dark:border-indigo-500 dark:placeholder:text-slate-400"
              />
            </div>
          )}

          {/* Pinned Messages Section */}
          {currentUsername && (
            <PinnedMessages
              pinnedMessages={pinnedMessages}
              onScrollToMessage={handleScrollToMessage}
            />
          )}

          {/* Messages container with subtle background */}
          <div
            ref={messagesContainerRef}
            className="h-[500px] overflow-y-auto mb-6 px-3 py-4 bg-white/60 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner transition-colors duration-300"
          >
            {filteredMessages.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 mt-20 transition-colors duration-300">
                <div className="text-6xl mb-4">💭</div>
                <p className="text-lg font-medium">
                  {searchQuery
                    ? 'No messages found matching your search.'
                    : 'No messages yet. Be the first to say hello! 👋'}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <ChatMessage
                  key={message._id}
                  message={message}
                  currentUsername={currentUsername}
                  onReply={handleReply}
                  isHighlighted={highlightedMessageId === message._id}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}

            {/* Typing indicator */}
            {currentUsername && <TypingIndicator currentUsername={currentUsername} />}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat form */}
          <ChatForm
            replyingTo={replyingTo}
            editingMessage={editingMessage}
            onCancelReply={handleCancelReply}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </div>
    </div>
  );
};
