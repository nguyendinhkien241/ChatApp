# Danh sách những vấn đề cần cải thiện 

## 1. Chức năng gửi file audio không hiển thị được duration của file audio
- Kiểm tra lại quá trình thu âm và lưu trữ vào biến
- Kiểm tra lại quá trình lưu vào cơ sở dữ liệu

## 2. Thêm chức năng xem profile của bạn bè hoặc người dùng được tìm kiếm.
- **Mô tả**: người dùng khi tìm kiếm hoặc vào trong danh sách bạn bè có thể xem được hồ sơ của người được tìm kiếm hoặc bạn bè, chỉ xem được những thông tin cơ bản như họ tên, userCode, giới tính, bio, sinh nhật và trạng thái của người dùng hiện tại với người đang được xem hồ sơ
- **Frontend**:
  - Tạo component hiển thị thông tin người dùng khác với ProfilePage khi chỉ hiện thị thông tin cá nhân
  - Có chức năng kết bạn hoặc hủy kết bạn trong trang profile này tùy theo đối tượng
  - Có button nhắn tin dẫn đến ChatContainer với đối tượng được chọn
  - Thêm chức năng xem profile của selectedUser trong chatHerder

## 3. Chức năng hủy kết bạn 
- **Mô tả**: Cho phép người dùng hủy kết bạn với những người bạn trong danh sách bạn bè
- **Backend**:
  - Thêm chức năng hủy kết bạn, xóa id người dùng trong trường friends của user
  - Cập nhật theo socket để thông tin được truyền đi theo thời gian thực
- **Frontend**:
  - Cập chức năng hủy kết bạn trong danh sách bạn bè 
  - Hỏi ý kiến người dùng trước khi hủy kết bạn
  - Xóa bỏ bạn bè ngay khi hủy kết bạn

## 4. Kiểm tra lại sau khi chấp nhận kết bạn
- **Mô tả**: Kiểm tra lại sau khi kết bạn, danh sách bạn bè và yêu cầu kết bạn không được cập nhật luôn và phải reload lại trang

## 5. Kiểm tra lại khi nhập emoji
- **Mô tả**: Tôi muốn khi nhập emoji có thể nhập liên tục được, hiện tại khi người dùng sẽ phải select lại nhiều lần để gửi nhiều icon cùng một lúc, điều này khá bất tiện

## 6. Hiển thị lại danh sách sidebar
- Chỉ hiển thị những user đã từng có đoạn chat với user hiện tại
- Sắp xếp theo user có tin nhắn gần nhất với người dùng hiện tại
- Khi có tin nhắn mới nhất đến thì cho người dùng đó lên đầu thanh sidebar

## 7. Sửa lại logic get messages
- Để tối ưu hóa trải nghiệm cũng như giảm tải khối lượng cho query, khi đối tượng selectedUser được chọn, sẽ chỉ lấy 15 tin nhắn cuối cùng của selectedUser với user hiện tại
- Khi người dùng thực hiện thao tác kéo lên trên sẽ có component loading và lấy tiếp 15 tin nhắn trước đó, cứ như vậy đến hết.
- 