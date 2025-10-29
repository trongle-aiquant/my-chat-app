# 🧪 Testing Guide - Requirements 2 & 3

## Quick Start

### 1. Start the Application

```bash
meteor npm install  # Install dependencies if needed
meteor run          # Start the development server
```

The app will be available at: `http://localhost:3000`

### 2. Navigate to Chat

Click on "💬 Start Chatting" button or go to: `http://localhost:3000/chat`

---

## 🎯 Feature Testing

### Feature 1: Edit Message ✏️

**Steps to Test:**

1. **Enter your username** (e.g., "Alice")
2. **Send a message** (e.g., "Hello, this is a test message")
3. **Hover over your message** → You should see "✏️ Edit" button appear
4. **Click "Edit" button**
   - ✅ Amber banner should appear: "✏️ Editing message"
   - ✅ Message text should populate in the input field
   - ✅ Button should change to "Update ✏️"
5. **Modify the text** (e.g., "Hello, this is an edited message")
6. **Click "Update ✏️"**
   - ✅ Message should update
   - ✅ "(edited)" label should appear next to timestamp
   - ✅ Edit banner should disappear

**Edge Cases to Test:**

- **Cancel Edit:** Click the "✕" button on the amber banner
  - ✅ Should clear the input and exit edit mode
  
- **Edit Time Limit:** Wait 16 minutes after sending a message, then try to edit
  - ✅ Should show error: "You can only edit messages within 15 minutes"
  - ✅ Edit button should not appear after 15 minutes

- **Edit Someone Else's Message:** 
  - Open in incognito/another browser with different username
  - Try to edit the first user's message (via console if needed)
  - ✅ Should show error: "You can only edit your own messages"

---

### Feature 2: Delete Message 🗑️

**Steps to Test:**

1. **Send a message** as any user
2. **Hover over your message** → You should see "🗑️ Delete" button appear
3. **Click "Delete" button**
   - ✅ Confirmation dialog should appear: "Bạn có chắc chắn muốn xóa tin nhắn này?"
4. **Click "OK"**
   - ✅ Message should be deleted immediately
   - ✅ Message should disappear from the chat

**Edge Cases to Test:**

- **Cancel Delete:** Click "Cancel" on the confirmation dialog
  - ✅ Message should NOT be deleted
  
- **Delete Someone Else's Message:**
  - Try to delete another user's message (via console if needed)
  - ✅ Should show error: "You can only delete your own messages"

---

### Feature 3: Cursor-Based Pagination 📄

**Setup:** You need many messages to test pagination properly.

**Quick Setup Script (Run in Browser Console):**

```javascript
// Generate 100 test messages
for (let i = 1; i <= 100; i++) {
  Meteor.call('messages.insert', `Test message ${i}`, 'TestUser', null, null);
}
```

**Steps to Test:**

1. **Refresh the page** after generating messages
2. **Check initial load:**
   - ✅ Should load approximately 30 most recent messages
   - ✅ Should NOT load all 100 messages at once

3. **Test Load More:**
   - Currently, you need to manually call `loadMore()` function
   - Or implement a "Load More" button in the UI
   - ✅ Should load 30 more older messages
   - ✅ Should NOT duplicate any messages

4. **Test Realtime Updates:**
   - Open in another browser/tab with different username
   - Send a new message
   - ✅ New message should appear immediately in both tabs
   - ✅ Should NOT affect pagination state

**Performance Test:**

```javascript
// Generate 1000 messages
for (let i = 1; i <= 1000; i++) {
  Meteor.call('messages.insert', `Message ${i}`, 'User' + (i % 10), null, null);
}
```

- ✅ Initial load should still be fast (< 1 second)
- ✅ Load more should be fast (< 500ms)
- ✅ No lag when scrolling

---

## 🔍 Testing via Browser Console

### Test Edit Message Method

```javascript
// 1. Send a message
const messageId = await Meteor.callAsync('messages.insert', 'Original text', 'Alice');

// 2. Edit the message (within 15 minutes)
await Meteor.callAsync('messages.update', messageId, 'Updated text', 'Alice');
// ✅ Should succeed

// 3. Try to edit as different user
await Meteor.callAsync('messages.update', messageId, 'Hacked text', 'Bob');
// ❌ Should throw error: "unauthorized"
```

### Test Delete Message Method

```javascript
// 1. Send a message
const messageId = await Meteor.callAsync('messages.insert', 'Test message', 'Alice');

// 2. Delete as owner
await Meteor.callAsync('messages.remove', messageId, 'Alice');
// ✅ Should succeed

// 3. Try to delete as different user
const messageId2 = await Meteor.callAsync('messages.insert', 'Another message', 'Alice');
await Meteor.callAsync('messages.remove', messageId2, 'Bob');
// ❌ Should throw error: "unauthorized"
```

### Test Pagination Subscription

```javascript
// Subscribe to paginated messages
const handle = Meteor.subscribe('messages.paginated', null, 30, null);

// Check if ready
handle.ready(); // Should return true after loading

// Get messages
const messages = MessagesCollection.find({}, { sort: { createdAt: 1 } }).fetch();
console.log(`Loaded ${messages.length} messages`);

// Load more with cursor
const oldestMessage = messages[0];
const handle2 = Meteor.subscribe('messages.paginated', oldestMessage._id, 30, null);
```

---

## 🧪 Automated Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
meteor test --once --driver-package meteortesting:mocha --grep "messages.update"
```

### Expected Test Results

```
Messages Methods
  messages.insert
    ✓ should insert a new message with valid data
    ✓ should trim whitespace from text and username
    ✓ should throw error for empty text
    ✓ should throw error for empty username
    ✓ should throw error for whitespace-only text
  
  messages.remove
    ✓ should remove a message by the owner
    ✓ should throw error when trying to delete someone elses message
    ✓ should throw error for non-existent message
  
  messages.update
    ✓ should update a message by the owner within 15 minutes
    ✓ should throw error when trying to edit someone elses message
    ✓ should throw error when editing after 15 minutes
    ✓ should throw error for empty text
    ✓ should throw error for non-existent message
  
  messages.markAsSeen
    ✓ should mark message as seen by a user
    ✓ should not duplicate seenBy when marking twice
    ✓ should allow multiple users to mark as seen
    ✓ should throw error for empty username
    ✓ should throw error for non-existent message

Total: 18 passing
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Edit button doesn't appear

**Possible causes:**
- Not hovering over the message
- Message is older than 15 minutes
- Message is not yours (different username)

**Solution:** Check `showActions` state and `canEdit()` function logic

### Issue 2: Delete confirmation in English instead of Vietnamese

**Cause:** Browser language settings

**Solution:** The confirmation uses `window.confirm()` which respects browser language. For custom modal, implement a React modal component.

### Issue 3: Pagination not loading more messages

**Possible causes:**
- Not enough messages in database (< 30)
- `loadMore()` function not called
- Subscription not ready

**Solution:** 
- Generate more test messages
- Implement UI button to call `loadMore()`
- Check `hasMore` flag

### Issue 4: "(edited)" label not showing

**Possible causes:**
- `isEdited` field not set in database
- UI not re-rendering

**Solution:** Check message object in console: `MessagesCollection.findOne(messageId)`

---

## 📊 Performance Benchmarks

### Expected Performance:

| Operation | Expected Time | Notes |
|-----------|--------------|-------|
| Initial load (30 messages) | < 500ms | First subscription |
| Load more (30 messages) | < 300ms | Subsequent loads |
| Edit message | < 100ms | Local update + server sync |
| Delete message | < 100ms | Optimistic UI |
| Realtime message | < 50ms | WebSocket push |

### How to Measure:

```javascript
// Measure initial load
console.time('initial-load');
const handle = Meteor.subscribe('messages.paginated', null, 30, null, {
  onReady: () => {
    console.timeEnd('initial-load');
  }
});

// Measure edit
console.time('edit-message');
await Meteor.callAsync('messages.update', messageId, 'New text', 'Alice');
console.timeEnd('edit-message');
```

---

## ✅ Testing Checklist

Before marking as complete, ensure:

- [ ] All automated tests pass
- [ ] Edit message works for own messages
- [ ] Edit message fails for others' messages
- [ ] Edit message fails after 15 minutes
- [ ] "(edited)" label appears correctly
- [ ] Delete message works with confirmation
- [ ] Delete message fails for others' messages
- [ ] Pagination loads initial 30 messages
- [ ] Pagination loads more on demand
- [ ] No duplicate messages in pagination
- [ ] Realtime messages still work with pagination
- [ ] Performance is acceptable (< 500ms for operations)
- [ ] UI is responsive and smooth
- [ ] No console errors
- [ ] No TypeScript errors

---

## 🎉 Success Criteria

All features are working correctly when:

1. ✅ You can edit your own messages within 15 minutes
2. ✅ "(edited)" label appears on edited messages
3. ✅ You can delete your own messages with confirmation
4. ✅ You cannot edit/delete others' messages
5. ✅ Pagination loads messages in batches of 30
6. ✅ New messages appear in realtime
7. ✅ No performance issues with 1000+ messages
8. ✅ All automated tests pass

