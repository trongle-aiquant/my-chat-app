# Authentication Testing Guide

This guide provides step-by-step instructions for manually testing the authentication features.

---

## Prerequisites

1. Start the Meteor application:
   ```bash
   npm start
   ```

2. Open your browser to `http://localhost:3000`

---

## Test Scenarios

### 1. User Registration

**Steps:**
1. Navigate to home page (`/`)
2. Click "🔐 Login to Chat" button
3. You should be redirected to `/auth`
4. Click "Create one" link to switch to registration form
5. Enter a username (e.g., "testuser1") - minimum 3 characters
6. Enter a password (e.g., "password123") - minimum 6 characters
7. Confirm the password
8. Click "Create Account"

**Expected Results:**
- ✅ Form validates input (shows errors for invalid data)
- ✅ Loading spinner appears during registration
- ✅ User is automatically logged in after registration
- ✅ Redirected to `/chat` page
- ✅ Username appears in header with user menu

**Error Cases to Test:**
- Username less than 3 characters → Error message
- Password less than 6 characters → Error message
- Passwords don't match → Error message
- Duplicate username → Error message from server

---

### 2. User Login

**Steps:**
1. If logged in, logout first (click username → Logout)
2. Navigate to `/auth`
3. Enter your username
4. Enter your password
5. Click "Sign In"

**Expected Results:**
- ✅ Form validates input
- ✅ Loading spinner appears during login
- ✅ Redirected to `/chat` page
- ✅ Username appears in header

**Error Cases to Test:**
- Wrong username → "Username not found" error
- Wrong password → "Incorrect password" error
- Empty fields → Validation errors

---

### 3. Protected Routes

**Test A: Access Protected Route While Logged Out**

**Steps:**
1. Logout if logged in
2. Try to navigate directly to `/chat`

**Expected Results:**
- ✅ Automatically redirected to `/auth`
- ✅ Cannot access chat without authentication

**Test B: Access Protected Route While Logged In**

**Steps:**
1. Login with valid credentials
2. Navigate to `/chat`

**Expected Results:**
- ✅ Chat page loads successfully
- ✅ Can see messages and send new ones

**Test C: Test All Protected Routes**

Try accessing these routes while logged out:
- `/chat` → Should redirect to `/auth`
- `/todos` → Should redirect to `/auth`

---

### 4. Logout Functionality

**Steps:**
1. Login with valid credentials
2. Click on your username in the header
3. Dropdown menu should appear
4. Click "🚪 Logout"

**Expected Results:**
- ✅ User is logged out
- ✅ Redirected to `/auth` page
- ✅ Header shows "🔐 Login" button instead of username
- ✅ Cannot access protected routes

---

### 5. User Menu

**Steps:**
1. Login with valid credentials
2. Click on your username in the header

**Expected Results:**
- ✅ Dropdown menu appears with:
  - Username display
  - Email (or "No email")
  - Navigation links (💬 Chat, ✅ Todos)
  - Logout button
- ✅ Clicking navigation links works
- ✅ Avatar shows first letter of username

---

### 6. Session Persistence

**Steps:**
1. Login with valid credentials
2. Refresh the page (F5 or Cmd+R)

**Expected Results:**
- ✅ User remains logged in
- ✅ No redirect to login page
- ✅ Username still appears in header

**Steps:**
1. Login with valid credentials
2. Close the browser tab
3. Open a new tab and navigate to `http://localhost:3000`

**Expected Results:**
- ✅ User remains logged in (session persists)

---

### 7. Chat Authentication

**Test A: Send Message While Logged In**

**Steps:**
1. Login with valid credentials
2. Navigate to `/chat`
3. Type a message and click "Send"

**Expected Results:**
- ✅ Message is sent successfully
- ✅ Message shows your username
- ✅ Can edit your own messages (within 15 minutes)
- ✅ Can delete your own messages

**Test B: Message Ownership**

**Steps:**
1. Login as User A
2. Send a message
3. Logout and login as User B
4. Try to edit/delete User A's message

**Expected Results:**
- ✅ Edit/Delete buttons don't appear for other users' messages
- ✅ Only see edit/delete for your own messages

---

### 8. Todo Authentication

**Test A: Create Task While Logged In**

**Steps:**
1. Login with valid credentials
2. Navigate to `/todos`
3. Enter a task and click "Add"

**Expected Results:**
- ✅ Task is created successfully
- ✅ Task appears in the list

**Test B: Access Todos While Logged Out**

**Steps:**
1. Logout
2. Try to navigate to `/todos`

**Expected Results:**
- ✅ Redirected to `/auth`
- ✅ Cannot access todos without authentication

---

### 9. Multiple Users

**Steps:**
1. Open browser in normal mode, login as User A
2. Open browser in incognito/private mode, login as User B
3. Send messages from both users
4. Check that messages appear in real-time for both users

**Expected Results:**
- ✅ Both users can send messages
- ✅ Messages appear in real-time
- ✅ Each user can only edit/delete their own messages
- ✅ Typing indicators work for both users

---

### 10. Navigation Flow

**Test Complete User Journey:**

**Steps:**
1. Start at home page (`/`)
2. Click "🔐 Login to Chat"
3. Register a new account
4. Automatically redirected to chat
5. Send a few messages
6. Click "✅ Todos" in header
7. Add some tasks
8. Click "💬 Chat" in header
9. Click username dropdown
10. Click "Logout"

**Expected Results:**
- ✅ Smooth navigation throughout
- ✅ No broken links or errors
- ✅ Proper redirects at each step
- ✅ Data persists across navigation

---

## Automated Tests

Run the test suite to verify all authentication logic:

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test-app
```

**Expected Test Results:**
- ✅ All authentication tests pass
- ✅ All message method tests pass
- ✅ All task method tests pass
- ✅ No errors or warnings

---

## Common Issues and Solutions

### Issue: "User not found" error when logging in
**Solution:** Make sure you registered the account first, or check for typos in username

### Issue: Redirected to /auth when trying to access chat
**Solution:** This is expected behavior - you need to login first

### Issue: Session doesn't persist after refresh
**Solution:** Check browser console for errors, ensure cookies are enabled

### Issue: Can't see other users' messages
**Solution:** Make sure both users are logged in and the Meteor server is running

### Issue: Tests failing
**Solution:** 
1. Make sure MongoDB is running
2. Clear the database: `meteor reset`
3. Restart the server
4. Run tests again

---

## Security Checklist

Verify these security features are working:

- [ ] Passwords are never visible in the UI
- [ ] Passwords are hashed (not stored in plain text)
- [ ] Cannot access protected routes without authentication
- [ ] Cannot edit/delete other users' messages
- [ ] Server-side validation on all methods
- [ ] Authentication required for all data operations
- [ ] No sensitive data in error messages
- [ ] Session tokens are secure

---

## Performance Checklist

Verify these performance aspects:

- [ ] Login/registration is fast (< 1 second)
- [ ] No lag when switching between pages
- [ ] Real-time updates work smoothly
- [ ] No memory leaks (check browser dev tools)
- [ ] Reactive updates are efficient

---

## Browser Compatibility

Test in multiple browsers:

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Mobile Testing

If testing on mobile:

- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Forms are usable on small screens
- [ ] Dropdown menus work on mobile

---

## Conclusion

If all tests pass, the authentication system is working correctly and ready for production use!

**Next Steps:**
1. Deploy to production environment
2. Set up HTTPS for secure connections
3. Configure production database
4. Set up monitoring and logging
5. Create user documentation

