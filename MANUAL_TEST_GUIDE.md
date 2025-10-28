# HƯỚNG DẪN TEST THỦ CÔNG TÍNH NĂNG SEEN STATUS

## 🎯 MỤC ĐÍCH
Kiểm tra tính năng "Seen Status" (đã xem) hoạt động đúng sau khi sửa lỗi.

## 📋 CHUẨN BỊ

### 1. Khởi động ứng dụng
```bash
npm start
```

### 2. Mở 2 browser tabs/windows
- Tab 1: http://localhost:3000 (User Alice)
- Tab 2: http://localhost:3000 (User Bob)

Hoặc sử dụng 2 browsers khác nhau (Chrome + Firefox)

## 🧪 TEST CASES

### Test Case 1: Basic Seen Status
**Mục đích:** Kiểm tra seen status cơ bản

**Các bước:**
1. **Tab 1 (Alice):**
   - Nhập username: "Alice"
   - Gửi tin nhắn: "Hello Bob, how are you?"

2. **Tab 2 (Bob):**
   - Nhập username: "Bob"
   - Xem tin nhắn từ Alice (tin nhắn sẽ tự động được mark as seen)

3. **Tab 1 (Alice):**
   - Kiểm tra tin nhắn của mình
   - **Kết quả mong đợi:** Thấy text "✓✓ Seen by Bob" dưới tin nhắn

**✅ Pass nếu:** Alice thấy "Seen by Bob" dưới tin nhắn của mình

---

### Test Case 2: Multiple Users Seen
**Mục đích:** Kiểm tra nhiều người xem cùng tin nhắn

**Các bước:**
1. **Tab 1 (Alice):**
   - Gửi tin nhắn: "Hello everyone!"

2. **Tab 2 (Bob):**
   - Xem tin nhắn

3. **Tab 3 (Charlie):**
   - Mở tab mới với username "Charlie"
   - Xem tin nhắn

4. **Tab 1 (Alice):**
   - Kiểm tra tin nhắn
   - **Kết quả mong đợi:** "✓✓ Seen by Bob, Charlie"

**✅ Pass nếu:** Alice thấy cả Bob và Charlie trong danh sách seen

---

### Test Case 3: Own Messages Not Marked
**Mục đích:** Kiểm tra không tự mark tin nhắn của mình

**Các bước:**
1. **Tab 1 (Alice):**
   - Gửi tin nhắn: "Test message"
   - Refresh trang
   - Xem lại tin nhắn

2. **Kiểm tra:**
   - **Kết quả mong đợi:** KHÔNG thấy "Seen by Alice" (không tự mark)

**✅ Pass nếu:** Alice không thấy tên mình trong seenBy

---

### Test Case 4: Real-time Update
**Mục đích:** Kiểm tra cập nhật realtime

**Các bước:**
1. **Tab 1 (Alice):**
   - Gửi tin nhắn: "Testing realtime"
   - Để tab mở, KHÔNG refresh

2. **Tab 2 (Bob):**
   - Xem tin nhắn (đợi 1-2 giây)

3. **Tab 1 (Alice):**
   - Quan sát tin nhắn (KHÔNG refresh)
   - **Kết quả mong đợi:** "Seen by Bob" xuất hiện tự động

**✅ Pass nếu:** Seen status cập nhật mà không cần refresh

---

### Test Case 5: No Duplicate Seen
**Mục đích:** Kiểm tra không bị duplicate khi xem nhiều lần

**Các bước:**
1. **Tab 1 (Alice):**
   - Gửi tin nhắn: "No duplicate test"

2. **Tab 2 (Bob):**
   - Xem tin nhắn
   - Refresh trang nhiều lần (3-4 lần)
   - Scroll lên xuống

3. **Tab 1 (Alice):**
   - Kiểm tra tin nhắn
   - **Kết quả mong đợi:** Chỉ thấy "Seen by Bob" MỘT LẦN (không duplicate)

**✅ Pass nếu:** Bob chỉ xuất hiện 1 lần trong seenBy

---

### Test Case 6: Multiple Messages
**Mục đích:** Kiểm tra với nhiều tin nhắn

**Các bước:**
1. **Tab 1 (Alice):**
   - Gửi 5 tin nhắn liên tiếp:
     - "Message 1"
     - "Message 2"
     - "Message 3"
     - "Message 4"
     - "Message 5"

2. **Tab 2 (Bob):**
   - Xem tất cả tin nhắn

3. **Tab 1 (Alice):**
   - Kiểm tra TẤT CẢ 5 tin nhắn
   - **Kết quả mong đợi:** Tất cả đều có "Seen by Bob"

**✅ Pass nếu:** Cả 5 tin nhắn đều có seen status

---

## 🔍 DEBUG CHECKLIST

Nếu test fail, kiểm tra các điểm sau:

### 1. Console Logs (DevTools)
Mở Console trong cả 2 tabs và kiểm tra:

**Tab 1 (Alice) - Console:**
```
✓ Marked message XXX as seen by Alice
Message YYY seenBy: [{username: "Bob", seenAt: ...}]
```

**Tab 2 (Bob) - Console:**
```
✓ Marked message XXX as seen by Bob
```

### 2. Network Tab
Kiểm tra có method calls `messages.markAsSeen` không:
- Mở Network tab
- Filter: "websocket" hoặc "DDP"
- Xem có messages với method "messages.markAsSeen"

### 3. MongoDB Data
Kiểm tra database trực tiếp:

```bash
# Connect to MongoDB
meteor mongo

# Query messages
db.messages.find({}).pretty()
```

Kiểm tra field `seenBy`:
```json
{
  "_id": "...",
  "text": "Hello",
  "username": "Alice",
  "seenBy": [
    {
      "username": "Bob",
      "seenAt": ISODate("...")
    }
  ]
}
```

### 4. Subscription Status
Trong Console, check subscription:
```javascript
// Paste vào Console
Meteor.connection.status()
// Kết quả mong đợi: {connected: true, status: "connected"}
```

## 📊 PERFORMANCE CHECK

### Kiểm tra số lượng method calls
1. Mở Network tab
2. Clear logs
3. Gửi 1 tin nhắn từ Alice
4. Bob xem tin nhắn
5. Đếm số lượng `messages.markAsSeen` calls

**Kết quả mong đợi:** 
- Chỉ 1 call cho mỗi message (nhờ debounce và local tracking)
- KHÔNG có calls duplicate

### Kiểm tra debounce
1. Alice gửi 3 tin nhắn liên tiếp (trong vòng 1 giây)
2. Bob xem
3. Kiểm tra Console logs

**Kết quả mong đợi:**
- Có delay ~500ms trước khi mark as seen
- Tất cả 3 messages được mark trong 1 batch

## ❌ COMMON ISSUES

### Issue 1: Không thấy "Seen by"
**Nguyên nhân có thể:**
- Username không khớp (case-sensitive)
- Subscription chưa ready
- Method call bị lỗi

**Giải pháp:**
- Check Console logs
- Verify username chính xác
- Refresh cả 2 tabs

### Issue 2: Seen status không update realtime
**Nguyên nhân có thể:**
- Subscription không hoạt động
- Reactivity bị break

**Giải pháp:**
- Check `Meteor.connection.status()`
- Restart Meteor server
- Clear browser cache

### Issue 3: Duplicate "Seen by Bob, Bob"
**Nguyên nhân có thể:**
- Local tracking không hoạt động
- Method được gọi nhiều lần

**Giải pháp:**
- Check code trong `Chat.tsx`
- Verify `markedAsSeenRef` hoạt động
- Check MongoDB data

## ✅ SUCCESS CRITERIA

Tính năng được coi là hoạt động đúng khi:
- ✅ Tất cả 6 test cases đều pass
- ✅ Không có errors trong Console
- ✅ Seen status update realtime
- ✅ Không có duplicate
- ✅ Performance tốt (ít method calls)

## 📝 NOTES

- Debounce time: 500ms (có thể thấy delay nhỏ)
- Chỉ tin nhắn của người khác mới được mark
- Seen status chỉ hiển thị trên tin nhắn của chính mình
- Cần ít nhất 2 users để test đầy đủ

