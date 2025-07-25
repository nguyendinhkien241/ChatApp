# Kế hoạch phát triển ứng dụng chat

## 1. Quản lý profile

- **Mô tả**: Cho phép người dùng cập nhật tên, mật khẩu, ảnh đại diện, ngày sinh, giới tính, và mô tả bản thân.
- **Backend**:
  - Cập nhật schema `User`: Thêm `dateOfBirth`, `bio`, `gender`.
  - Cập nhật API `/api/auth/updateProfile` để xử lý các trường mới và mật khẩu.
  - Phát sự kiện Socket.IO `profileUpdated`.
- **Frontend**:
  - Cập nhật lại `ProfilePage` với form chỉnh sửa profile.
  - Cập nhật `useAuthStore.js` để hỗ trợ các trường mới và lắng nghe sự kiện `profileUpdated`.
- **Thư viện**: Cloudinary, bcrypt, react-hot-toast, axios.

## 2. Gửi emoji, file, đoạn ghi âm, link

- **Mô tả**: Hỗ trợ gửi emoji, file (PDF, Word, txt), và đoạn ghi âm trong tin nhắn.
- **Backend**:
  - Cập nhật schema `Message`: Thêm `file` và `audio`.
  - Cập nhật `sendMessage` controller để tải file/audio lên Cloudinary.
- **Frontend**:
  - Cập nhật `ChatInput.js`: Thêm giao diện chọn emoji (`emoji-picker-react`), tải file, và ghi âm (`react-mic`).
  - Cập nhật `ChatContainer.js`: Hiển thị file và audio.
  - Cập nhật `useChatStore.js`: Hỗ trợ `FormData` trong `sendMessage`.
- **Thư viện**: emoji-picker-react, react-mic, Cloudinary, lucide-react.

## 3. Kết bạn và tìm kiếm người dùng

- **Mô tả**: Tìm kiếm người dùng qua `userCode` và gửi/chấp nhận lời mời kết bạn.
- **Backend**:
  - Cập nhật schema `User`: Thêm `userCode` (dùng `nanoid`) và `friends`.
  - Tạo schema `FriendRequest` để quản lý lời mời.
  - Tạo API: `/api/users/search`, `/api/friends/request`, `/api/friends/request/:id`.
- **Frontend**:
  - Tạo component `FriendsPage` để tìm kiếm và gửi lời mời.
  - Cập nhật `useAuthStore.js` để xử lý lời mời kết bạn.
- **Thư viện**: nanoid, axios, react-hot-toast.

## 4. Tạo nhóm chat và chat nhóm

- **Mô tả**: Tạo nhóm chat, mời bạn bè hoặc thêm người qua mã nhóm, gửi tin nhắn nhóm.
- **Backend**:
  - Tạo schema `Group` với `name`, `groupCode`, `members`, `creatorId`.
  - Cập nhật schema `Message`: Thêm `groupId`.
  - Tạo API: `/api/groups`, `/api/groups/join`, `/api/groups/send/:id`.
  - Cập nhật `sendMessage` để hỗ trợ tin nhắn nhóm.
- **Frontend**:
  - Cập nhật `useChatStore.js`: Thêm `groups`, `selectedGroup`, và các hàm `createGroup`, `joinGroup`.
  - Cập nhật `ChatContainer.js`: Hỗ trợ hiển thị tin nhắn nhóm.
- **Thư viện**: nanoid, axios, Socket.IO.

