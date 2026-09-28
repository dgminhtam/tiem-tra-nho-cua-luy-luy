# Kế hoạch lưu và khôi phục tiến trình độc lập

Khảo sát ngày 28/09/2026. **Phương án đã chốt:** tiến trình lưu trong trình duyệt, người chơi tự xuất/nhập file hoặc mã dài. Mục tiêu: không còn gọi API sao lưu `tiemtranho-api.trongnhi110266.workers.dev`. Chưa thay đổi mã game.

## Hiện trạng

- `index.html` lưu tiến trình chính ở `localStorage` (`tsShop2`) và xoay vòng ba bản dự phòng cuối ngày (`tsBak1`–`tsBak3`). Khi hết chỗ, bản dự phòng có thể bị xóa để giữ bản chính. Trò chơi gọi `navigator.storage.persist()` nhưng không kiểm tra yêu cầu có được chấp thuận.
- Mã dài `TTN1...` và file `.txt` chứa toàn bộ bản lưu, đọc được khi không có mạng. Hàm băm `bakHash` phát hiện lỗi chép/sửa vô ý; nó không xác thực nguồn gốc và không mã hóa dữ liệu.
- Mã 8 số tải bản lưu từ API của trang nguồn. `backupDlg()` hiện ghi `bakDay` trước khi biết yêu cầu gửi có thành công không. `applyRestore()` ghi đè bản lưu chính trước khi xác nhận dữ liệu đọc được.
- Game giữ tối đa 2.500 đánh giá và 400 bản tổng kết trong tiến trình; chưa có số đo kích thước save thật ở các mốc chơi dài ngày.

Trình duyệt thường giới hạn `localStorage` khoảng 5 MiB cho mỗi origin; dữ liệu trình duyệt có thể bị người dùng xóa hoặc bị dọn theo chính sách lưu trữ. Chuyển sang IndexedDB đơn thuần sẽ không giúp khôi phục trên thiết bị khác. Nguồn: [MDN về quota và eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

## Phương án lưu game

Game tiếp tục lưu tiến trình tại máy. Khi cần đổi thiết bị hoặc giữ bản dự phòng, người chơi tạo file hoặc mã dài rồi tự chuyển bản đó sang thiết bị mới. Trình duyệt tạo và đọc bản xuất, không cần máy chủ lưu game hay mạng khi sao lưu/khôi phục. Website vẫn cần hosting để tải lần đầu và nhận cập nhật; bản PWA có đủ file đã cache có thể mở offline. Người chơi phải giữ file hoặc mã đã xuất, vì xóa dữ liệu trình duyệt cũng xóa save trên máy.

## Trình tự triển khai và tiêu chí chấp nhận

1. Đo kích thước `tsShop2`, ba bản dự phòng và mã nén tại ngày đầu, một mốc chơi dài và gần giới hạn đánh giá. Nếu có lỗi quota thật, cân nhắc IndexedDB riêng; không chuyển sớm chỉ vì có API mới.
2. Sửa `applyRestore()`/`loadFrom()` theo hướng kiểm tra và dựng trạng thái trước khi ghi; kiểm tra bản hợp lệ, thiếu trường, sai kiểu và bản bị sửa. Bản hiện có phải sống sót sau mọi lần nhập lỗi.
3. Bỏ `CLOUD`, `cloudFetch`, `cloudSave`, `cloudLoad` và UI mã 8 số khỏi luồng sao lưu/khôi phục. Nút sao lưu hiển thị mã dài và tùy chọn chép/lưu file ngay; không chờ request mạng. Chỉ cập nhật `bakDay` khi chép mã thành công hoặc người chơi xác nhận đã giữ file; thao tác bắt đầu tải file không chứng minh file đã được giữ. Nếu không thể ghi `localStorage`, vẫn cho người chơi lấy bản xuất và nhắc họ giữ nó ngoài trình duyệt.
4. Giữ `TTN1` và cách nhập file/mã dài để các bản đã xuất vẫn dùng được. Mã 8 số cũ không thể khôi phục sau khi bỏ API: trước khi cập nhật, người chỉ có mã 8 số cần khôi phục qua bản cũ rồi xuất file/mã dài. Hiển thị hướng dẫn chuyển đổi này cho người chơi trong giai đoạn cập nhật.
5. Thử tạo/khôi phục file và mã dài khi offline, hết quota, mã lỗi, tắt tab giữa thao tác và khi đổi domain. Xác nhận không có request đến API cũ bằng DevTools Network; save cũ trên cùng origin vẫn tải được.

**Giới hạn đã chấp nhận:** không có đồng bộ tự động giữa thiết bị; khôi phục trên máy khác cần chuyển file hoặc mã dài bằng cách người chơi tự chọn. Không phát sinh chi phí hoặc tài khoản máy chủ dành riêng cho dữ liệu save.
