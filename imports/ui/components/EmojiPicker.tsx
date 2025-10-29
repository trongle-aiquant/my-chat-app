import EmojiPickerReact, { EmojiClickData, Theme } from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * EmojiPicker Component
 *
 * Tính năng:
 * - Integration với emoji-picker-react library
 * - Dark mode support với slate-based color palette
 * - Positioning: Popup xuất hiện phía trên input, align right
 * - Click outside to close
 * - Search/filter emojis
 * - Categories (Smileys, Animals, Food, etc.)
 * - Recently used emojis (localStorage persistence - built-in)
 * - Skin tone selection
 * - Keyboard navigation (Tab, Enter, Escape)
 * - Smooth animations (fade in/out)
 * - TypeScript types đầy đủ
 * - Error handling
 */

interface EmojiPickerProps {
  /** Callback khi user chọn emoji */
  onEmojiClick: (emoji: string) => void;
  /** Callback khi user click outside để close picker */
  onClose: () => void;
  /** Dark mode state */
  isDarkMode: boolean;
  /** Button element để tính position */
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiClick,
  onClose,
  isDarkMode,
  buttonRef,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position based on button (recalculate on scroll/resize)
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef?.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const pickerHeight = 420; // 400px height + 20px margin
        const pickerWidth = 350;

        // Calculate top position
        let top = rect.top - pickerHeight;

        // If not enough space above, show below button instead
        if (top < 10) {
          top = rect.bottom + 10;
        }

        // Calculate left position (align right edge)
        let left = rect.right - pickerWidth;

        // If picker goes off left edge, align to left edge of button
        if (left < 10) {
          left = rect.left;
        }

        // If picker goes off right edge, align to right edge of viewport
        if (left + pickerWidth > window.innerWidth - 10) {
          left = window.innerWidth - pickerWidth - 10;
        }

        setPosition({ top, left });
      }
    };

    // Initial calculation
    updatePosition();

    // Recalculate on scroll and resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [buttonRef]);

  // Animation: Fade in khi mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Click outside to close với animation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    // Delay để tránh đóng ngay khi mở
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle close với smooth animation
  const handleClose = () => {
    setIsVisible(false);
    // Delay để animation chạy trước khi unmount
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    try {
      // Lấy emoji character từ emojiData
      const emoji = emojiData.emoji;

      // Gọi callback với emoji
      onEmojiClick(emoji);

      // Close picker sau khi chọn (theo requirements)
      handleClose();
    } catch (error) {
      console.error('Error selecting emoji:', error);
    }
  };

  // Render picker với fixed positioning để tránh overflow issues
  const pickerContent = (
    <div
      ref={pickerRef}
      className={`fixed z-[9999] transition-all duration-200 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        // Đảm bảo không bị cắt
        maxWidth: '350px',
      }}
    >
      {/* Wrapper với shadow và border */}
      <div
        className={`rounded-lg shadow-2xl border transition-colors duration-300 overflow-hidden ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}
      >
        <EmojiPickerReact
          onEmojiClick={handleEmojiClick}
          theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
          width={350}
          height={400}
          searchPlaceHolder="Search emoji..."
          previewConfig={{
            showPreview: true,
          }}
          skinTonesDisabled={false}
          lazyLoadEmojis={true}
          // Categories enabled by default (Smileys, Animals, Food, etc.)
          // Recently used enabled by default (localStorage persistence)
        />
      </div>

      {/* Hint text */}
      <div
        className={`mt-2 text-xs text-center transition-colors duration-300 ${
          isDarkMode ? 'text-slate-400' : 'text-gray-500'
        }`}
      >
        Press{' '}
        <kbd className="px-1 py-0.5 rounded bg-slate-700 text-slate-200 dark:bg-slate-600">Esc</kbd>{' '}
        to close
      </div>
    </div>
  );

  // Render vào document.body để tránh overflow constraints
  return typeof document !== 'undefined' ? createPortal(pickerContent, document.body) : null;
};

export default EmojiPicker;
