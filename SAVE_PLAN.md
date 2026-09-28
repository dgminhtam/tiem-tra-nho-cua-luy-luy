# Kế hoạch lưu và khôi phục tiến trình độc lập

Khảo sát ngày 28/09/2026. **Đã chốt cách A làm hướng chính:** tiến trình lưu trong trình duyệt, người chơi tự xuất/nhập file hoặc mã dài. Mục tiêu: không còn gọi API sao lưu `tiemtranho-api.trongnhi110266.workers.dev`. Chưa thay đổi mã game.

## Hiện trạng

- `index.html` lưu tiến trình chính ở `localStorage` (`tsShop2`) và xoay vòng ba bản dự phòng cuối ngày (`tsBak1`–`tsBak3`). Khi hết chỗ, bản dự phòng có thể bị xóa để giữ bản chính. Trò chơi gọi `navigator.storage.persist()` nhưng không kiểm tra yêu cầu có được chấp thuận.
- Mã dài `TTN1...` và file `.txt` chứa toàn bộ bản lưu, đọc được khi không có mạng. Hàm băm `bakHash` phát hiện lỗi chép/sửa vô ý; nó không xác thực nguồn gốc và không mã hóa dữ liệu.
- Mã 8 số tải bản lưu từ API của trang nguồn. `backupDlg()` hiện ghi `bakDay` trước khi biết yêu cầu gửi có thành công không. `applyRestore()` ghi đè bản lưu chính trước khi xác nhận dữ liệu đọc được.
- Game giữ tối đa 2.500 đánh giá và 400 bản tổng kết trong tiến trình; chưa có số đo kích thước save thật ở các mốc chơi dài ngày.

Trình duyệt thường giới hạn `localStorage` khoảng 5 MiB cho mỗi origin; dữ liệu trình duyệt có thể bị người dùng xóa hoặc bị dọn theo chính sách lưu trữ. Chuyển sang IndexedDB đơn thuần sẽ không giúp khôi phục trên thiết bị khác. Nguồn: [MDN về quota và eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

## Hai cách thay API cũ

| Cách | Trải nghiệm người chơi | Phần cần vận hành |
| --- | --- | --- |
| **A. Lưu trên máy + file/mã dài** | Tạo bản sao lưu, chép file hoặc mã sang máy khác rồi nhập. Dùng được offline. | Không có backend; chỉ sửa UI và luồng khôi phục. Người chơi phải tự giữ bản sao lưu. |
| **B. A + mã ngắn của riêng game** | Sao lưu thủ công, nhận một mã khoảng 16 ký tự; nhập mã ở máy khác để lấy tiến trình. File vẫn là dự phòng. | Cloudflare Pages Function và D1 trong tài khoản do chủ game quản lý; cần mạng cho mã ngắn. |

**Quyết định:** triển khai A. File/mã dài do trình duyệt tạo và đọc, không cần máy chủ lưu game hay mạng khi sao lưu/khôi phục. Website vẫn cần hosting để tải lần đầu và nhận cập nhật; bản PWA có đủ file đã cache có thể mở offline. Người chơi phải giữ file hoặc mã đã xuất, vì xóa dữ liệu trình duyệt cũng xóa save trên máy. B là lựa chọn mở rộng sau này, chưa nằm trong phạm vi triển khai A.

## Phương án B để tham khảo sau này

1. Dùng Pages Function cùng origin với game (`POST /api/save`, `POST /api/load`), gắn một cơ sở D1. Cloudflare hỗ trợ [D1 binding cho Pages Functions](https://developers.cloudflare.com/pages/functions/bindings/), nên không cần gọi API qua origin khác hoặc cấu hình CORS.
2. Mỗi bản lưu có mã ngẫu nhiên ít nhất 80 bit, ví dụ 16 ký tự từ bảng 32 ký tự dễ đọc. Mã là quyền truy cập bản lưu: ai có mã sẽ đọc được và có thể cập nhật tiến trình. Mã 8 chữ số hiện tại chỉ có khoảng 26,6 bit; không giữ độ dài này cho dịch vụ công khai nếu thiếu lớp xác thực khác.
3. Chỉ lưu bản snapshot khi người chơi bấm **Sao lưu**. Giới hạn kích thước request theo số đo thực tế, kiểm tra cấu trúc save ở cả máy khách và API, dùng truy vấn có tham số và giới hạn tần suất yêu cầu. API trả về `Cache-Control: no-store`; gửi mã trong body của `POST` để nó không nằm trong URL hoặc lịch sử trình duyệt.
4. Tạo mới trả về mã; lưu lại cùng mã dùng số phiên bản bản lưu để ngăn máy cũ âm thầm ghi đè tiến trình mới (`409` nếu phiên bản không khớp). Lỗi mạng giữ nguyên bản local và báo rõ lần sao lưu gần nhất **đã thành công**. File/mã dài luôn tải được kể cả khi API lỗi.
5. Giữ định dạng `TTN1` tương thích, nhập được file/mã cũ. `S.cloud.code` của API cũ không được đem sang API mới; lần sao lưu đầu tạo mã mới. Khôi phục chỉ thay `tsShop2` sau khi đã xác minh toàn bộ snapshot, giữ bản hiện tại làm dự phòng.

D1 Free hiện có giới hạn 500 MB cho một database, 2 MB cho một row, 5 triệu row đọc và 100.000 row ghi mỗi ngày. Pages Functions dùng hạn mức Workers Free (100.000 request/ngày); dữ liệu D1 có Time Travel 7 ngày trên Free. Cần đo dung lượng save và số người chơi trước khi coi các hạn mức này là đủ. Nguồn: [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/), [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/).

Workers KV đơn giản cho key/value nhưng có thể mất 60 giây hoặc hơn để thay đổi xuất hiện ở vùng khác; điều đó không phù hợp kỳ vọng sao lưu xong rồi khôi phục ngay trên thiết bị khác. Nguồn: [Cloudflare KV consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works/).

## Trình tự triển khai cách A và tiêu chí chấp nhận

1. Đo kích thước `tsShop2`, ba bản dự phòng và mã nén tại ngày đầu, một mốc chơi dài và gần giới hạn đánh giá. Nếu có lỗi quota thật, cân nhắc IndexedDB riêng; không chuyển sớm chỉ vì có API mới.
2. Sửa `applyRestore()`/`loadFrom()` theo hướng kiểm tra và dựng trạng thái trước khi ghi; kiểm tra bản hợp lệ, thiếu trường, sai kiểu và bản bị sửa. Bản hiện có phải sống sót sau mọi lần nhập lỗi.
3. Bỏ `CLOUD`, `cloudFetch`, `cloudSave`, `cloudLoad` và UI mã 8 số khỏi luồng sao lưu/khôi phục. Nút sao lưu hiển thị mã dài và tùy chọn chép/lưu file ngay; không chờ request mạng. Chỉ cập nhật `bakDay` khi chép mã thành công hoặc người chơi xác nhận đã giữ file; thao tác bắt đầu tải file không chứng minh file đã được giữ. Nếu không thể ghi `localStorage`, vẫn cho người chơi lấy bản xuất và nhắc họ giữ nó ngoài trình duyệt.
4. Giữ `TTN1` và cách nhập file/mã dài để các bản đã xuất vẫn dùng được. Mã 8 số cũ không thể khôi phục sau khi bỏ API: trước khi cập nhật, người chỉ có mã 8 số cần khôi phục qua bản cũ rồi xuất file/mã dài. Hiển thị hướng dẫn chuyển đổi này cho người chơi trong giai đoạn cập nhật.
5. Thử tạo/khôi phục file và mã dài khi offline, hết quota, mã lỗi, tắt tab giữa thao tác và khi đổi domain. Xác nhận không có request đến API cũ bằng DevTools Network; save cũ trên cùng origin vẫn tải được.

**Giới hạn đã chấp nhận:** không có đồng bộ tự động giữa thiết bị; khôi phục trên máy khác cần chuyển file hoặc mã dài bằng cách người chơi tự chọn. Không phát sinh chi phí hoặc tài khoản máy chủ dành riêng cho dữ liệu save.
