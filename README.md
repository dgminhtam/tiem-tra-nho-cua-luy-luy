# Tiệm trà nhỏ của Luy Luy

Game quản lý tiệm trà sữa bằng tiếng Việt, chạy trong trình duyệt và có thể cài như ứng dụng web (PWA). Repo này là nguồn mã chính; game được phục vụ tĩnh, không có máy chủ lưu tiến trình.

## Chạy trên máy

Không cần cài gói hay build. Từ thư mục repo, chạy:

```sh
py -3 -m http.server 8000
```

Mở `http://localhost:8000/`. Dùng `localhost` thay vì `file://` để service worker và chế độ offline hoạt động. Trên điện thoại, cài game từ trình duyệt qua HTTPS.

## Cách chơi

1. Trong **Kho**, chọn số phần nguyên liệu cần nấu rồi bấm **Nấu & nhập**.
2. Bấm **Mở cửa** và pha đồ uống theo đơn của khách.
3. Cuối ngày, xem tổng kết rồi điều chỉnh giá, mở món, mua trang bị hoặc thuê nhân viên.

Hướng dẫn đầy đủ nằm ở **Cài đặt → Hướng dẫn**.

## Tiến trình và bản sao lưu

Game tự lưu tiến trình trong `localStorage` trên thiết bị. Giữ ba bản tự lưu cuối ngày và một bản riêng ngay trước lần khôi phục gần nhất. Trong **Cài đặt → Sao lưu tiến trình**, người chơi có thể chép mã TTN2 hoặc xuất file để tự giữ hay chuyển sang thiết bị khác. Tạo và nhập mã hoạt động offline.

Khôi phục kiểm tra bản sao và hiện tên quán, ngày, tiền trước khi thay tiến trình. Bản khôi phục mở ở màn hình chuẩn bị; bản sao không chứa khách, đơn và đồng hồ của ca đang chạy, cũng không chứa cấu hình chủ game, giao diện hay âm thanh. Nếu trình duyệt không ghi được vì hết dung lượng, game giữ tiến trình chính và các bản dự phòng, báo lỗi, cho tiếp tục trong phiên hiện tại và xuất bản sao.

Mã TTN1 cũ được đọc và kiểm tra lại theo schema hiện tại trước khi khôi phục; mã 8 số và các khóa save cũ không được hỗ trợ. Tiến trình lưu theo trình duyệt và origin; để chuyển thiết bị, hãy xuất rồi nhập mã TTN1 hoặc TTN2.

`sw.js` cache giao diện, ảnh và âm thanh sau lần tải đầu. Khi thay đổi tài nguyên được cache, tăng `VERSION` trong `sw.js`.

## Cấu trúc repo

| Đường dẫn | Vai trò |
| --- | --- |
| `index.html` | Giao diện, CSS, dữ liệu và logic game. |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | Chế độ offline và cài PWA. |
| `img/`, `snd/`, `s/` | Hình ảnh, âm thanh và font cục bộ. |
| `test_*.js` | Kiểm tra hồi quy cho lưu tiến trình, chuẩn bị và asset cache. |
| `.github/workflows/static.yml` | Triển khai tĩnh qua GitHub Pages khi chạy thủ công. |

## Phát triển và phát hành

Sửa trực tiếp `index.html`; repo này là nguồn mã, không còn quy trình tải hoặc biến đổi từ trang upstream. Chạy kiểm tra hồi quy bằng `node test_backup.js`, `node test_prep.js` và `node test_assets.js`. Với thay đổi gameplay hoặc lưu tiến trình, kiểm tra trong trình duyệt bằng một ngày chơi, tải lại trang, sao lưu/khôi phục và chế độ offline.

Workflow GitHub Pages chỉ chạy khi kích hoạt thủ công. Đẩy code không tự triển khai website.

## Giới hạn

- Không có tài khoản hay đồng bộ tự động giữa các thiết bị. Hãy giữ một bản sao ngoài trình duyệt.
- Game không còn gọi API lưu cũ. Worker và dữ liệu đã gửi lên dịch vụ cũ nằm ngoài repo; thay đổi ở đây không xóa dữ liệu đó hay tắt dịch vụ.
- Repo không có file `LICENSE`; không nên suy đoán quyền phát hành lại tài nguyên.

Xem [AGENTS.md](AGENTS.md) về quy ước đóng góp, [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md) về phát hành và [SAVE_PLAN.md](SAVE_PLAN.md) về quyết định lưu tiến trình.
