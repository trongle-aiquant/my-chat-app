import { Button, TextInput } from 'flowbite-react';
import { Meteor } from 'meteor/meteor';
import React, { useEffect, useRef, useState } from 'react';
import { Attachment, Message, ReplyTo } from '../../api/messages';
import { FileUpload } from './FileUpload';

interface ChatFormProps {
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  defaultUsername?: string;
}

export const ChatForm: React.FC<ChatFormProps> = ({
  replyingTo,
  onCancelReply,
  defaultUsername = '',
}) => {
  const [text, setText] = useState('');
  const [username, setUsername] = useState(defaultUsername);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update username when defaultUsername changes
  useEffect(() => {
    if (defaultUsername) {
      setUsername(defaultUsername);
    }
  }, [defaultUsername]);

  // Focus input when replying
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!username.trim()) return;

    if (!isTyping) {
      setIsTyping(true);
      Meteor.callAsync('typingIndicators.set', username);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      Meteor.callAsync('typingIndicators.clear', username);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() || !username.trim()) {
      setError('Please enter both username and message');
      return;
    }

    try {
      // Clear typing indicator
      if (isTyping) {
        await Meteor.callAsync('typingIndicators.clear', username);
        setIsTyping(false);
      }

      // Prepare reply data if replying
      let replyToData: ReplyTo | undefined;
      if (replyingTo) {
        replyToData = {
          messageId: replyingTo._id!,
          text: replyingTo.text,
          username: replyingTo.username,
        };
      }

      await Meteor.callAsync('messages.insert', text, username, replyToData, attachments);
      setText('');
      setAttachments([]);
      setError('');

      if (onCancelReply) {
        onCancelReply();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Reply preview */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg">
          <div className="flex-1">
            <div className="text-xs font-semibold text-blue-600">
              ↩️ Replying to {replyingTo.username}
            </div>
            <div className="text-sm text-gray-600 truncate">{replyingTo.text}</div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="ml-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full w-6 h-6 flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>
      )}

      {!defaultUsername && (
        <div>
          <TextInput
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sizing="md"
            style={{
              backgroundColor: 'white',
              color: '#1e293b',
            }}
            className="placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-slate-300 shadow-sm"
          />
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group">
              {attachment.type === 'image' ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center bg-white rounded-lg border border-gray-300">
                  <span className="text-2xl">📎</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
              >
                ✕
              </button>
              <div className="text-xs text-gray-600 truncate w-20 mt-1 font-medium">
                {attachment.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 items-center">
        <FileUpload onFileSelect={(attachment) => setAttachments([...attachments, attachment])} />

        <TextInput
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          style={{
            backgroundColor: 'white',
            color: '#1e293b',
          }}
          className="flex-1 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-slate-300 shadow-md"
          sizing="md"
        />
        <Button
          type="submit"
          className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Send 📤
        </Button>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
};
