# Tiệm Trà Nhỏ

Game quản lý tiệm trà sữa bằng tiếng Việt, chạy trực tiếp trên trình duyệt và có thể cài như một ứng dụng web (PWA). Người chơi chuẩn bị nguyên liệu, pha đồ uống theo đơn, phục vụ khách và quản lý doanh thu, chi phí qua từng ngày.

Repo này là **bản đồng bộ và chỉnh sửa từ một trang nguồn**, không phải mã nguồn gốc của game. `sync.py` tải bản mới, giải mã phần JavaScript và áp dụng các thay đổi của bản này trước khi triển khai.

## Chơi thử trên máy

Không cần `npm install` hay bước build. Từ thư mục repo, chạy một máy chủ tĩnh:

```sh
python3 -m http.server 8000
# Windows: py -3 -m http.server 8000
```

Mở `http://localhost:8000/`. Dùng `localhost` thay vì mở `index.html` bằng `file://` để service worker và chức năng offline hoạt động. Trên điện thoại, có thể dùng tính năng **Thêm vào màn hình chính** của trình duyệt sau khi trang được phục vụ qua HTTPS.

## Cách chơi

1. Trong **Kho**, chọn số phần nguyên liệu cần nấu hoặc nhập rồi bấm **Nấu & nhập**. Nguyên liệu có hạn dùng; hàng hết hạn sẽ bị bỏ.
2. Bấm **Mở cửa**. Đọc món, cỡ ly và các yêu cầu trong bóng thoại của khách; vòng quanh mặt khách cho biết thời gian chờ còn lại.
3. Lấy ly, nhấn giữ hũ trà để rót đến vạch, thêm hương và topping theo đơn. Ở các cấp sau, chọn thêm mức đường và đá. Dán nắp để giao; có thể đổ ly sai và pha lại.
4. Cuối ngày, xem tổng kết rồi điều chỉnh giá bán, mở món, mua trang bị hoặc thuê nhân viên. Điểm đánh giá ảnh hưởng lượng khách.

Hướng dẫn trong game nằm ở **Cài đặt → Hướng dẫn**.

## Lưu tiến trình và chơi offline

Game lưu tiến trình trong `localStorage` của trình duyệt và giữ các bản dự phòng cuối ngày. Trong **Cài đặt → Sao lưu tiến trình**, người chơi có thể lấy mã dài hoặc tải file để tự giữ. Mã ngắn 8 số sử dụng API sao lưu bên ngoài và cần mạng để tạo hoặc khôi phục; thao tác này gửi dữ liệu tiến trình đến máy chủ của game. Hãy sao lưu trước khi xóa dữ liệu trình duyệt hoặc đổi thiết bị.

`sw.js` lưu giao diện, ảnh và âm thanh để dùng sau khi trang đã tải thành công ít nhất một lần. Khi thay đổi tài nguyên được cache, cập nhật `VERSION` trong `sw.js` để người chơi nhận bản mới.

## Cấu trúc repo

| Đường dẫn | Vai trò |
| --- | --- |
| `index.html` | Giao diện, CSS, dữ liệu và logic game. |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | Chơi offline và cài PWA. |
| `img/`, `snd/` | Hình ảnh và âm thanh. |
| `sync.py` | Tải và biến đổi phiên bản từ trang nguồn. |
| `deobf.py`, `decrypted.js`, `test.txt` | Công cụ và dữ liệu phục vụ giải mã; game không tải các file này lúc chạy. |
| `.github/workflows/` | Đồng bộ tự động và triển khai GitHub Pages. |

## Phát triển và triển khai

`index.html` được `sync.py` ghi lại khi đồng bộ. Nếu chỉnh trực tiếp logic game, hãy kiểm tra liệu thay đổi có cần đưa vào bước biến đổi trong `sync.py` để không bị mất ở lần đồng bộ tiếp theo. Lệnh đồng bộ thủ công là `python3 sync.py` (Windows: `py -3 sync.py`); lệnh này cần mạng và sửa file trong repo. Kiểm tra bản diff trước khi commit.

Hai workflow hiện chỉ chạy khi kích hoạt thủ công trong GitHub Actions. **Sync Updates** tải bản nguồn và commit các file thay đổi; **Deploy static content to Pages** triển khai toàn bộ thư mục lên GitHub Pages. Đẩy code không tự kích hoạt hai workflow này trong giai đoạn chuẩn bị phát hành. Repo chưa có test runner hay bước build. Có thể kiểm tra cú pháp Python bằng `python3 -m py_compile sync.py deobf.py`; với thay đổi gameplay, hãy thử thủ công một ngày chơi, tải lại trang, sao lưu/khôi phục và chế độ offline.

## Lưu ý hiện tại

- Phần loại bỏ sự cố trong `sync.py` hiện để `BAD = []`, trong khi logic lên lịch sự cố vẫn dùng mảng này; một số ngày chơi có thể gặp lỗi runtime.
- Luồng khôi phục hiện ghi bản nhập vào bộ nhớ trình duyệt trước khi xác nhận đọc thành công. Nên giữ mã sao lưu riêng trước khi thử khôi phục dữ liệu không chắc chắn.
- Repo không có file `LICENSE`; không nên suy đoán quyền sử dụng lại tài nguyên từ repo này.

Xem [AGENTS.md](AGENTS.md) để biết quy ước đóng góp và [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md) để xem kế hoạch phát hành công khai.
