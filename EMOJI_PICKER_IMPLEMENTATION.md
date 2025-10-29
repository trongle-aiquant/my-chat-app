# 😊 EMOJI PICKER - TECHNICAL IMPLEMENTATION

## 📋 OVERVIEW

This document describes the implementation of the **Emoji Picker** feature for the Meteor Chat App. The feature allows users to easily insert emojis into their messages with a rich, user-friendly interface.

**Library Used:** `emoji-picker-react` v4.x  
**Implementation Date:** 2025-10-28  
**Status:** ✅ Production Ready

---

## 🏗️ ARCHITECTURE

### Component Structure

```
ChatForm (Parent)
├── FileUpload (Sibling)
├── EmojiPicker (Portal Component - renders to document.body)
│   └── EmojiPickerReact (Library Component)
└── TextInput (Message Input)
```

**Note:** EmojiPicker uses React Portal to render to `document.body`, avoiding overflow constraints from parent containers.

### Data Flow

```
User clicks emoji button
    ↓
Toggle showEmojiPicker state
    ↓
EmojiPicker component renders
    ↓
User selects emoji
    ↓
handleEmojiSelect() called
    ↓
Emoji inserted at cursor position
    ↓
Focus restored to input
```

---

## 📁 FILES CREATED/MODIFIED

### Created Files:

1. **`imports/ui/components/EmojiPicker.tsx`** (130 lines)
   - Wrapper component for emoji-picker-react
   - Dark mode support
   - Click outside to close
   - Keyboard navigation (Escape to close)
   - Smooth animations

### Modified Files:

1. **`imports/ui/components/ChatForm.tsx`** (+60 lines)

   - Added emoji picker button
   - Added emoji selection handler
   - Integrated EmojiPicker component
   - Cursor position management

2. **`tailwind.config.js`** (+10 lines)

   - Added fade-in animation keyframes
   - Custom animation utilities

3. **`package.json`** (via npm install)
   - Added `emoji-picker-react` dependency

---

## 🎨 COMPONENT API

### EmojiPicker Component

**Props:**

```typescript
interface EmojiPickerProps {
  /** Callback when user selects emoji */
  onEmojiClick: (emoji: string) => void;

  /** Callback when user clicks outside to close picker */
  onClose: () => void;

  /** Dark mode state */
  isDarkMode: boolean;
}
```

**Features:**

- ✅ **Search/Filter:** Built-in search functionality
- ✅ **Categories:** Smileys, Animals, Food, Travel, Activities, Objects, Symbols, Flags
- ✅ **Recently Used:** Automatically tracked via localStorage
- ✅ **Skin Tone Selection:** Support for different skin tones
- ✅ **Keyboard Navigation:** Tab, Enter, Escape keys
- ✅ **Click Outside to Close:** Automatic detection
- ✅ **Dark Mode:** Seamless integration with app theme
- ✅ **Lazy Loading:** Emojis loaded on demand for performance
- ✅ **Preview:** Shows emoji name and category on hover

**Usage Example:**

```tsx
import { EmojiPicker } from './EmojiPicker';
import { useDarkMode } from '../hooks/useDarkMode';

function MyComponent() {
  const [showPicker, setShowPicker] = useState(false);
  const { isDarkMode } = useDarkMode();

  const handleEmojiSelect = (emoji: string) => {
    console.log('Selected emoji:', emoji);
  };

  return (
    <div className="relative">
      <button onClick={() => setShowPicker(!showPicker)}>😊</button>

      {showPicker && (
        <EmojiPicker
          onEmojiClick={handleEmojiSelect}
          onClose={() => setShowPicker(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
```

---

## 🎯 INTEGRATION DETAILS

### Portal Rendering (IMPORTANT!)

**Why Portal?**

- Emoji picker was initially constrained by parent container's `overflow: hidden`
- Using React Portal renders picker to `document.body`, avoiding overflow issues
- Ensures picker always displays at full size (350x400px)

**Implementation:**

```typescript
import { createPortal } from 'react-dom';

// Render to document.body
return typeof document !== 'undefined' ? createPortal(pickerContent, document.body) : null;
```

### Smart Positioning System

**Features:**

- ✅ Calculates position based on button's `getBoundingClientRect()`
- ✅ Auto-flips to below button if not enough space above
- ✅ Adjusts horizontal position to stay within viewport
- ✅ Recalculates on scroll and resize events
- ✅ Always stays within viewport bounds

**Position Logic:**

```typescript
const updatePosition = () => {
  const rect = buttonRef.current.getBoundingClientRect();
  const pickerHeight = 420; // 400px + 20px margin
  const pickerWidth = 350;

  // Calculate top (flip if needed)
  let top = rect.top - pickerHeight;
  if (top < 10) {
    top = rect.bottom + 10; // Show below instead
  }

  // Calculate left (stay in viewport)
  let left = rect.right - pickerWidth;
  if (left < 10) left = rect.left;
  if (left + pickerWidth > window.innerWidth - 10) {
    left = window.innerWidth - pickerWidth - 10;
  }

  setPosition({ top, left });
};

// Update on scroll/resize
window.addEventListener('scroll', updatePosition, true);
window.addEventListener('resize', updatePosition);
```

### ChatForm Integration

**State Management:**

```typescript
const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const emojiButtonRef = useRef<HTMLButtonElement>(null);
const { isDarkMode } = useDarkMode();
```

**Emoji Insertion Logic:**

```typescript
const handleEmojiSelect = (emoji: string) => {
  // Get current cursor position
  const input = inputRef.current;
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;

  // Insert emoji at cursor position
  const newText = text.substring(0, start) + emoji + text.substring(end);
  setText(newText);

  // Restore cursor position after emoji
  setTimeout(() => {
    const newCursorPos = start + emoji.length;
    input.setSelectionRange(newCursorPos, newCursorPos);
    input.focus();
  }, 0);
};
```

**UI Layout:**

```tsx
<div className="flex gap-3 items-center relative">
  {/* File Upload Button */}
  <FileUpload ... />

  {/* Emoji Picker Button */}
  <div className="relative">
    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
      😊
    </button>

    {showEmojiPicker && (
      <EmojiPicker
        onEmojiClick={handleEmojiSelect}
        onClose={() => setShowEmojiPicker(false)}
        isDarkMode={isDarkMode}
      />
    )}
  </div>

  {/* Message Input */}
  <TextInput ... />

  {/* Send Button */}
  <Button>Send 📤</Button>
</div>
```

---

## 🎨 DARK MODE STYLING

### Color Palette Integration

The emoji picker uses the new **slate-based color palette** for dark mode:

```tsx
// Wrapper styling
className={`rounded-lg shadow-2xl border transition-colors duration-300 ${
  isDarkMode
    ? 'bg-slate-800 border-slate-700'  // Dark mode
    : 'bg-white border-gray-200'       // Light mode
}`}

// Hint text
className={`text-xs text-center ${
  isDarkMode ? 'text-slate-400' : 'text-gray-500'
}`}
```

### Library Theme

```tsx
<EmojiPickerReact
  theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
  // ... other props
/>
```

**Result:** Seamless integration with app's dark mode, using consistent slate colors.

---

## ⌨️ KEYBOARD NAVIGATION

### Supported Keys:

| Key                | Action                            |
| ------------------ | --------------------------------- |
| **Escape**         | Close emoji picker                |
| **Tab**            | Navigate between emoji categories |
| **Enter**          | Select focused emoji              |
| **Arrow Keys**     | Navigate within emoji grid        |
| **Type to search** | Filter emojis by name             |

### Implementation:

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [onClose]);
```

---

## 💾 PERSISTENCE

### Recently Used Emojis

The `emoji-picker-react` library automatically stores recently used emojis in **localStorage**:

**Key:** `epr_recent_emojis`  
**Format:** JSON array of emoji objects  
**Max Items:** 30 (configurable)

**Example:**

```json
[
  { "emoji": "😊", "unified": "1f60a" },
  { "emoji": "👍", "unified": "1f44d" },
  { "emoji": "❤️", "unified": "2764-fe0f" }
]
```

---

## 🎭 ANIMATIONS

### Fade-In Animation

**Tailwind Config:**

```javascript
keyframes: {
  'fade-in': {
    '0%': { opacity: '0', transform: 'translateY(10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
},
animation: {
  'fade-in': 'fade-in 0.2s ease-out',
},
```

**Usage:**

```tsx
<div className="animate-fade-in">{/* Emoji picker content */}</div>
```

**Result:** Smooth 200ms fade-in with subtle upward motion.

---

## 📱 RESPONSIVE DESIGN

### Positioning

```tsx
<div
  className="absolute bottom-full right-0 mb-2 z-50"
  style={{ maxHeight: '400px' }}
>
```

- **Position:** Above the input field, aligned to the right
- **Z-index:** 50 (ensures it appears above other elements)
- **Max Height:** 400px (prevents overflow on small screens)

### Mobile Considerations

- Picker width: 350px (fits most mobile screens)
- Touch-friendly emoji size
- Scrollable categories
- Responsive search input

---

## 🐛 ERROR HANDLING

### Emoji Insertion Fallback

```typescript
try {
  // Insert at cursor position
  const newText = text.substring(0, start) + emoji + text.substring(end);
  setText(newText);
} catch (error) {
  console.error('Error inserting emoji:', error);
  // Fallback: append to end
  setText((prev) => prev + emoji);
}
```

### Click Outside Detection

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  // Delay to prevent immediate close on open
  const timeoutId = setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside);
  }, 100);

  return () => {
    clearTimeout(timeoutId);
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [onClose]);
```

---

## 🔧 TROUBLESHOOTING

### Issue: Picker appears too small or cut off (FIXED!)

**Cause:** Parent container has `overflow: hidden` constraint
**Solution:** Use React Portal to render to `document.body`

```typescript
import { createPortal } from 'react-dom';
return createPortal(pickerContent, document.body);
```

### Issue: Picker position wrong after scrolling

**Cause:** Position calculated once on mount
**Solution:** Recalculate position on scroll/resize events

```typescript
window.addEventListener('scroll', updatePosition, true);
window.addEventListener('resize', updatePosition);
```

### Issue: Picker goes off-screen on small viewports

**Cause:** Fixed positioning without viewport bounds checking
**Solution:** Smart positioning with auto-flip and viewport constraints

```typescript
// Flip to below if not enough space above
if (top < 10) top = rect.bottom + 10;

// Keep within viewport horizontally
if (left + pickerWidth > window.innerWidth - 10) {
  left = window.innerWidth - pickerWidth - 10;
}
```

### Issue: Picker closes immediately after opening

**Cause:** Click event propagates to document listener
**Solution:** 100ms delay before adding click listener

### Issue: Cursor position lost after emoji insertion

**Cause:** React re-render resets input focus
**Solution:** Use `setTimeout` to restore cursor position after state update

### Issue: Emoji picker not visible in dark mode

**Cause:** Missing dark mode theme prop
**Solution:** Pass `isDarkMode` prop and set `theme={isDarkMode ? Theme.DARK : Theme.LIGHT}`

### Issue: Emojis not rendering correctly

**Cause:** Font support or encoding issues
**Solution:** Library handles emoji rendering internally, ensure browser supports emoji fonts

---

## 📊 PERFORMANCE

### Optimizations:

1. **Lazy Loading:** Emojis loaded on demand
2. **Virtual Scrolling:** Only visible emojis rendered
3. **Debounced Search:** Search input debounced to reduce re-renders
4. **Memoization:** Library uses React.memo for emoji components

### Bundle Size:

- `emoji-picker-react`: ~150KB (gzipped)
- Emoji data: Loaded incrementally

---

## ✅ TESTING CHECKLIST

- [x] Emoji picker opens on button click
- [x] Emoji picker closes on outside click
- [x] Emoji picker closes on Escape key
- [x] Emoji inserts at cursor position
- [x] Cursor position restored after insertion
- [x] Focus maintained on input
- [x] Search functionality works
- [x] Categories navigation works
- [x] Recently used emojis persist
- [x] Skin tone selection works
- [x] Dark mode styling correct
- [x] Light mode styling correct
- [x] Responsive on mobile
- [x] No console errors
- [x] Smooth animations

---

## 🚀 FUTURE ENHANCEMENTS

### Potential Improvements:

1. **Custom Emoji Support:** Allow users to upload custom emojis
2. **Emoji Shortcuts:** Type `:smile:` to insert 😊
3. **Emoji Reactions:** Quick reactions to messages (separate feature)
4. **Emoji Statistics:** Track most used emojis
5. **Emoji Autocomplete:** Suggest emojis while typing
6. **GIF Support:** Integrate GIF picker alongside emoji picker

---

## 📚 REFERENCES

- **emoji-picker-react:** https://github.com/ealush/emoji-picker-react
- **Emoji Unicode Standard:** https://unicode.org/emoji/
- **Tailwind CSS Animations:** https://tailwindcss.com/docs/animation

---

**Implementation by:** Augment Agent  
**Date:** 2025-10-28  
**Status:** ✅ COMPLETE & PRODUCTION READY
