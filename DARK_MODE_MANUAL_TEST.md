# 🧪 DARK MODE - MANUAL TESTING GUIDE

## 📋 TESTING CHECKLIST

### ✅ PHASE 1: BASIC FUNCTIONALITY

#### Test 1.1: Toggle Dark Mode từ Home Page
**Steps:**
1. Mở browser tại `http://localhost:3000/`
2. Quan sát icon ở góc trên phải (nên là mặt trời ☀️ - light mode)
3. Click vào icon
4. **Expected:** 
   - Icon chuyển thành mặt trăng 🌙
   - Background chuyển từ blue gradient → dark gray gradient
   - Text chuyển từ dark → white
   - Cards chuyển từ white → dark gray
   - Smooth transition (300ms)

#### Test 1.2: Toggle Dark Mode từ Chat Page
**Steps:**
1. Navigate to `/chat`
2. Quan sát icon ở header (bên phải navigation)
3. Click vào icon
4. **Expected:**
   - Theme toggle ngay lập tức
   - Header background: white → dark gray
   - Chat container: light gradient → dark gradient
   - Messages container: light → dark
   - Input fields: white → dark gray

#### Test 1.3: Toggle Dark Mode từ Todo Page
**Steps:**
1. Navigate to `/todos`
2. Click toggle icon ở header
3. **Expected:**
   - Todo list container: white → dark gray
   - Task items: light gray → dark gray
   - Input field: white → dark gray
   - Text colors update correctly

#### Test 1.4: Persistence Test
**Steps:**
1. Toggle dark mode ON
2. Reload page (F5)
3. **Expected:** Dark mode vẫn ON
4. Toggle dark mode OFF
5. Reload page
6. **Expected:** Dark mode vẫn OFF

#### Test 1.5: localStorage Test
**Steps:**
1. Open DevTools → Application → Local Storage
2. Toggle dark mode
3. **Expected:** 
   - Key `darkMode` xuất hiện
   - Value: `"true"` hoặc `"false"`
4. Manually change value trong localStorage
5. Reload page
6. **Expected:** Theme theo localStorage value

---

### ✅ PHASE 2: COMPONENTS TESTING

#### Test 2.1: Home Page Components
**Dark Mode Elements to Check:**
- [ ] Background gradient (blue → dark gray)
- [ ] Main heading "Welcome to Meteor Chat App" (dark → white)
- [ ] Subtitle text (gray → light gray)
- [ ] Feature cards background (white → dark gray)
- [ ] Feature cards text (dark → white/light gray)
- [ ] Buttons (should remain same colors)
- [ ] Theme toggle icon (fixed position, visible)

#### Test 2.2: Layout Component
**Dark Mode Elements to Check:**
- [ ] Header background (white → dark gray)
- [ ] App title text (dark → white)
- [ ] Navigation buttons inactive (light gray → dark gray)
- [ ] Navigation buttons active (blue/green - same)
- [ ] Navigation buttons hover (darker shade)
- [ ] Theme toggle button (gradient changes)
- [ ] Main content background (light → dark)

#### Test 2.3: Chat Component
**Dark Mode Elements to Check:**
- [ ] Chat container background (light gradient → dark gradient)
- [ ] Chat container border (light → dark)
- [ ] Header gradient (slightly darker in dark mode)
- [ ] Search input (white → dark gray)
- [ ] Search input text (dark → white)
- [ ] Search input placeholder (gray → light gray)
- [ ] Username input section (light purple → dark purple)
- [ ] Messages container (light → dark with transparency)
- [ ] Empty state text (gray → light gray)

#### Test 2.4: ChatMessage Component
**Test với Own Messages:**
- [ ] Message bubble gradient (indigo/purple - slightly darker)
- [ ] Message text (white - same)
- [ ] Username (white - same)
- [ ] Timestamp (light white - same)
- [ ] Reply reference (light purple → dark purple)
- [ ] Seen status (light white - same)

**Test với Other Messages:**
- [ ] Message bubble (white → dark gray)
- [ ] Message text (dark → light gray)
- [ ] Username (indigo → light indigo)
- [ ] Timestamp (gray → light gray)
- [ ] Reply reference (light gray → dark gray)
- [ ] Attachments (light → dark)
- [ ] Reply button (gray → light gray on hover)

#### Test 2.5: ChatForm Component
**Dark Mode Elements to Check:**
- [ ] Reply preview background (light blue → dark blue)
- [ ] Reply preview text (blue → light blue)
- [ ] Reply preview message text (gray → light gray)
- [ ] Cancel button (gray → light gray)
- [ ] Username input (white → dark gray)
- [ ] Attachments preview container (light gray → dark gray)
- [ ] Attachment thumbnails border (light → dark)
- [ ] Message input (white → dark gray)
- [ ] Message input text (dark → white)
- [ ] Message input placeholder (gray → light gray)
- [ ] Send button (gradient - same)
- [ ] Error message (red → light red)

#### Test 2.6: TodoList Component
**Dark Mode Elements to Check:**
- [ ] Page heading (dark → white)
- [ ] Pending count (dark → white)
- [ ] "Hide completed" label (gray → light gray)
- [ ] Checkbox (same)
- [ ] Todo container (white → dark gray)
- [ ] Empty state text (gray → light gray)

#### Test 2.7: TaskForm Component
**Dark Mode Elements to Check:**
- [ ] Input field background (white → dark gray)
- [ ] Input field border (light gray → dark gray)
- [ ] Input field text (dark → white)
- [ ] Input field placeholder (gray → light gray)
- [ ] Add button (green - same)
- [ ] Error message (red → light red)

#### Test 2.8: TaskItem Component
**Dark Mode Elements to Check:**
- [ ] List item background (light gray → dark gray)
- [ ] List item hover (darker shade)
- [ ] Checkbox (same)
- [ ] Task text unchecked (dark → light gray)
- [ ] Task text checked/strikethrough (gray → light gray)
- [ ] Delete button text (red → light red)
- [ ] Delete button hover background (light red → dark red)

---

### ✅ PHASE 3: ADVANCED FEATURES

#### Test 3.1: System Preference Detection
**Steps:**
1. Clear localStorage (DevTools → Application → Clear)
2. Set OS to dark mode:
   - **Windows:** Settings → Personalization → Colors → Dark
   - **Mac:** System Preferences → General → Dark
3. Reload app
4. **Expected:** App automatically in dark mode
5. Set OS to light mode
6. Clear localStorage again
7. Reload app
8. **Expected:** App automatically in light mode

#### Test 3.2: Smooth Transitions
**Steps:**
1. Toggle dark mode multiple times rapidly
2. **Expected:**
   - No flicker
   - Smooth color transitions (300ms)
   - No layout shift
   - No content jump

#### Test 3.3: Icon Animation
**Steps:**
1. Click toggle button
2. Observe icon animation
3. **Expected:**
   - Sun icon rotates out (180deg) and scales down
   - Moon icon rotates in (0deg) and scales up
   - Smooth transition (500ms)
   - Background gradient changes
   - Shadow color changes

#### Test 3.4: Tooltip
**Steps:**
1. Hover over toggle button
2. **Expected:**
   - Tooltip appears below button
   - Shows "Light mode" when in dark mode
   - Shows "Dark mode" when in light mode
   - Smooth fade in/out

---

### ✅ PHASE 4: EDGE CASES

#### Test 4.1: Long Messages
**Steps:**
1. Send a very long message (500+ characters)
2. Toggle dark mode
3. **Expected:**
   - Message wraps correctly
   - Text remains readable
   - No overflow issues

#### Test 4.2: Images/Attachments
**Steps:**
1. Upload an image
2. Toggle dark mode
3. **Expected:**
   - Image displays correctly
   - Border color changes
   - Thumbnail background changes

#### Test 4.3: Empty States
**Steps:**
1. Clear all messages/todos
2. Toggle dark mode
3. **Expected:**
   - Empty state text visible
   - Emoji visible
   - Proper contrast

#### Test 4.4: Error States
**Steps:**
1. Trigger an error (empty message, etc.)
2. Toggle dark mode
3. **Expected:**
   - Error message visible
   - Red color adjusted for dark mode
   - Readable contrast

#### Test 4.5: Loading States
**Steps:**
1. Refresh page while in dark mode
2. Observe loading state
3. **Expected:**
   - "Loading..." text visible
   - Proper contrast
   - No flash of light theme

---

### ✅ PHASE 5: ACCESSIBILITY

#### Test 5.1: Keyboard Navigation
**Steps:**
1. Use Tab key to navigate
2. Press Enter on toggle button
3. **Expected:**
   - Toggle button focusable
   - Focus indicator visible (ring)
   - Enter key toggles theme
   - Focus indicator visible in both themes

#### Test 5.2: Screen Reader
**Steps:**
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate to toggle button
3. **Expected:**
   - Announces "Switch to light mode" or "Switch to dark mode"
   - Clear indication of current state

#### Test 5.3: Color Contrast
**Steps:**
1. Use browser DevTools → Accessibility
2. Check contrast ratios
3. **Expected:**
   - All text meets WCAG AA (4.5:1 for normal text)
   - Important elements meet WCAG AAA (7:1)

#### Test 5.4: High Contrast Mode
**Steps:**
1. Enable Windows High Contrast mode
2. Toggle dark mode
3. **Expected:**
   - App still usable
   - Text readable
   - Buttons visible

---

### ✅ PHASE 6: RESPONSIVE DESIGN

#### Test 6.1: Mobile (< 640px)
**Steps:**
1. Resize browser to 375px width
2. Toggle dark mode
3. **Expected:**
   - Toggle button visible and clickable
   - All elements scale correctly
   - No horizontal scroll
   - Text readable

#### Test 6.2: Tablet (640px - 1024px)
**Steps:**
1. Resize browser to 768px width
2. Toggle dark mode
3. **Expected:**
   - Layout adjusts correctly
   - Toggle button in good position
   - Cards stack properly

#### Test 6.3: Desktop (> 1024px)
**Steps:**
1. Resize browser to 1920px width
2. Toggle dark mode
3. **Expected:**
   - Max-width containers work
   - Toggle button visible
   - No excessive whitespace

---

### ✅ PHASE 7: CROSS-BROWSER TESTING

#### Test 7.1: Chrome/Edge
- [ ] Toggle works
- [ ] Transitions smooth
- [ ] localStorage persists
- [ ] System preference detection works

#### Test 7.2: Firefox
- [ ] Toggle works
- [ ] Transitions smooth
- [ ] localStorage persists
- [ ] System preference detection works

#### Test 7.3: Safari
- [ ] Toggle works
- [ ] Transitions smooth
- [ ] localStorage persists
- [ ] System preference detection works

---

## 🐛 KNOWN ISSUES & WORKAROUNDS

### Issue 1: Flash of Light Theme on Load
**Status:** ✅ FIXED
**Solution:** Initial state loaded from localStorage in hook

### Issue 2: Tooltip Position on Mobile
**Status:** ⚠️ MINOR
**Workaround:** Tooltip may be cut off on very small screens

---

## ✅ FINAL CHECKLIST

Before marking as complete, verify:

- [ ] All components have dark mode classes
- [ ] Transitions are smooth (no flicker)
- [ ] localStorage persistence works
- [ ] System preference detection works
- [ ] Toggle button accessible (keyboard + screen reader)
- [ ] Color contrast meets WCAG AA
- [ ] Responsive on all screen sizes
- [ ] Works in Chrome, Firefox, Safari
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Documentation complete

---

## 📊 TEST RESULTS

**Date:** 2025-10-28  
**Tester:** [Your Name]  
**Status:** ✅ PASSED / ⚠️ PARTIAL / ❌ FAILED

**Notes:**
- [Add any observations or issues found]

---

## 🎉 CONCLUSION

Dark Mode implementation is **READY FOR PRODUCTION** if all tests pass.

**Next Steps:**
1. Fix any issues found during testing
2. Get user feedback
3. Proceed to next feature: Emoji Picker

