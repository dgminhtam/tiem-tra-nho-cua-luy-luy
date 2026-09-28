# Kế hoạch refactor lưu và khôi phục tiến trình

Khảo sát ngày 28/09/2026. Refactor bắt đầu một định dạng save mới, không đọc hay chuyển đổi tiến trình từ game cũ. Tiến trình nằm trên thiết bị người chơi; server chỉ host game. Người chơi có thể tự xuất/nhập file hoặc mã theo định dạng mới.

## Phạm vi hiện tại

- Bản nền cũ dùng `tsShop2`, các khóa `tsBak*`, mã `TTN1` và API mã 8 số tại `tiemtranho-api.trongnhi110266.workers.dev`.
- Bản `index.html` đang sửa đã đổi sang khóa `ttn*`, mã `TTN2` và bỏ luồng API mã 8 số. Đây là thay đổi chưa hoàn chỉnh: `SAVE_PLAN.md` trước đó vẫn yêu cầu tương thích dữ liệu cũ.
- `sync.py` và `.github/workflows/sync.yml` vẫn tải/đẩy game từ nguồn upstream `trongnhi.trongnhi110266.workers.dev`. Đây là luồng đồng bộ mã nguồn, tách biệt với API lưu game.
- Mã nguồn của hai Worker bên ngoài không nằm trong repo. Tắt API và retire luồng đồng bộ cần xử lý cả cấu hình/dịch vụ bên ngoài tương ứng.
- Repo hiện triển khai game tĩnh qua GitHub Pages; không có backend lưu save. Bản refactor giữ server ở vai trò host game.

`localStorage` có giới hạn theo origin và dữ liệu có thể bị xóa/dọn theo chính sách trình duyệt. Tham khảo [quota và eviction của MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

Các khóa cũ trong trình duyệt được để nguyên nhưng không đọc, chuyển đổi hay xóa. Dữ liệu đã gửi lên API cũ không bị xóa; API sẽ ngừng hoạt động độc lập với thay đổi trong repo. Game không cung cấp giai đoạn chuyển đổi hay tương thích ngược với dữ liệu cũ.

## Hành vi save đã chốt

- Lưu tiến trình trong trình duyệt bằng `localStorage`. Chỉ cân nhắc IndexedDB nếu đo kích thước ở các mốc chơi dài hoặc gặp lỗi quota thật.
- Giữ ba bản tự lưu cuối ngày và một bản riêng chụp tiến trình hiện tại trước khôi phục. Bản trước khôi phục tồn tại tới lần khôi phục kế tiếp và không bị vòng xoay cuối ngày xóa.
- Bản sao chứa tiến trình quán, không chứa cài đặt chủ game, giao diện/âm thanh, khách, đơn hoặc đồng hồ của ca đang chạy. Khôi phục mở ở màn hình chuẩn bị.
- Người chơi vẫn có thể xuất và nhập file hoặc mã dài theo định dạng mới; định dạng này tiếp tục được hỗ trợ qua các bản game mới. Mã 8 số, `TTN1` và các khóa save của game cũ không được nhận.
- Nếu không lưu được do quota, không xóa bản lưu chính hay bản trước khôi phục. Báo lỗi, cho chơi tiếp trong phiên hiện tại và cho xuất bản sao để người chơi giữ bên ngoài trình duyệt.
- Kiểm tra, xác thực và dựng tiến trình nhập trước khi thay trạng thái đang chơi hoặc ghi save. Nhập sai/không hợp lệ phải để cả hai nguyên vẹn. Nếu không thể giữ bản trước khôi phục, yêu cầu người chơi xuất tiến trình hiện tại trước khi tiếp tục.
- Chỉ cập nhật `bakDay` sau khi mã được chép thành công hoặc người chơi xác nhận đã giữ file. Việc bắt đầu tải file không chứng minh người chơi đã giữ nó.

## Loại bỏ nguồn/API cũ

1. Bỏ mọi lời gọi tới API lưu mã 8 số và đóng Worker `tiemtranho-api.trongnhi110266.workers.dev`; không phát hành bản chuyển tiếp. Không xóa dữ liệu đã lưu trên Worker.
2. Bỏ đồng bộ mã nguồn upstream: retire `sync.py`, `.github/workflows/sync.yml` và các artifact deobfuscation chỉ được luồng đó dùng (`deobf.py`, `decrypted.js`, `test.txt`). Cập nhật `README.md`, `DEPLOYMENT_PLAN.md` và `AGENTS.md` để repo này là nguồn mã game chính, không còn chỉ dẫn chạy sync.
3. Giữ hosting tĩnh và service worker cùng origin để tải/cached game. Việc phục vụ website không tạo API lưu tiến trình.
4. Tăng `VERSION` trong `sw.js` khi tài nguyên đã cache thay đổi.

## Trình tự triển khai và tiêu chí chấp nhận

1. Đo save mới ở ngày đầu, một mốc chơi dài và gần giới hạn 2.500 đánh giá/400 bản tổng kết. Dùng kết quả để xác định liệu quota `localStorage` gây lỗi thực tế hay không.
2. Ghi/đọc định dạng mới và giữ định dạng đó khi nâng cấp các bản game sau. Không có nhánh đọc/migrate từ `tsShop2`, `tsOwner`, `tsBak*`, `tsTheme`, `tsAudio`, `tsVer`, `TTN1` hay mã 8 số.
3. Thử lưu, sao lưu và khôi phục offline; nhập mã/file sai; khôi phục khi hết quota; đóng tab giữa thao tác; và khôi phục bản mới sau khi nâng cấp game. Lỗi nhập không đổi tiến trình đang chơi hay save đã lưu.
4. Xác nhận ba bản cuối ngày và bản trước khôi phục được giữ theo chính sách đã chốt; lỗi ghi không âm thầm xóa chúng hoặc bản save chính.
5. Xác nhận bản mới không gửi request tới API save cũ, còn `sync.py` và workflow upstream đã được retire. Xác nhận PWA vẫn mở được khi offline sau khi đã cache đủ tài nguyên.

**Giới hạn đã chấp nhận:** không đồng bộ save giữa thiết bị. Khi bắt đầu refactor, người chơi bắt đầu save mới; dữ liệu cũ và mã cũ không khôi phục được trong game mới. Người chơi cần tự giữ bản xuất mới để chuyển thiết bị.
