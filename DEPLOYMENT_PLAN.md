# Kế hoạch phát hành công khai Tiệm Trà Nhỏ

Khảo sát ngày 28/09/2026. Đây là kế hoạch đề xuất; chưa triển khai công khai hoặc thay đổi logic game. Hai workflow được chuyển sang chạy thủ công khi chuẩn bị đưa bản local lên GitHub.

## 1. Phương án đề xuất

Repo được chỉ định là [dgminhtam/tiem-tra-nho-cua-luy-luy](https://github.com/dgminhtam/tiem-tra-nho-cua-luy-luy), hiện private và chưa có commit tại thời điểm kiểm tra trước khi nhập mã. Đề xuất **Cloudflare Pages Free** nếu giữ repo private và muốn hosting miễn phí. **GitHub Pages** tận dụng được workflow có sẵn nếu tài khoản có gói hỗ trợ repo private hoặc người dùng chủ động chọn công khai repo; chưa xác minh gói tài khoản.

Game chạy hoàn toàn phía trình duyệt nên phần chơi cơ bản không cần máy chủ ứng dụng hay cơ sở dữ liệu. Người dùng đã chốt lưu tại máy và xuất/nhập file hoặc mã dài làm hướng chính; cần bỏ API mã 8 số hiện có trước khi phát hành. Xem [SAVE_PLAN.md](SAVE_PLAN.md).

Bộ file duy nhất được liệt kê trong cache hiện có 121 file, tổng khoảng 6,32 MiB; file lớn nhất khoảng 0,46 MiB. Đây là dung lượng file trên đĩa, chưa phải số đo tải mạng thực tế.

| Phương án | Phù hợp khi | Chi phí và giới hạn đã kiểm tra |
| --- | --- | --- |
| Cloudflare Pages — đề xuất | Giữ repo private, hosting Free và có preview theo PR | Request tài nguyên tĩnh miễn phí, không giới hạn số request; Free có 500 build/tháng, 20.000 file và tối đa 25 MiB/file. Backend Functions có hạn mức riêng. |
| GitHub Pages — phương án thay thế | Tận dụng workflow, tài khoản hỗ trợ Pages private hoặc chọn repo public | Có trên repo public với GitHub Free; private cần gói hỗ trợ. Site tối đa 1 GB, băng thông mềm 100 GB/tháng. |

Nguồn: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Cloudflare static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [Cloudflare limits](https://developers.cloudflare.com/pages/platform/limits/), [Cloudflare pricing](https://developers.cloudflare.com/pages/functions/pricing/). Tên miền riêng là khoản mua riêng nếu sử dụng.

## 2. Những điểm cần xử lý trước bản beta

| Vấn đề xác nhận từ mã | Việc cần làm | Tiêu chí hoàn tất |
| --- | --- | --- |
| `BAD = []` nhưng `mkBadPlan()`, `badCheck()` và `cheatHit()` vẫn sử dụng dữ liệu sự cố | Thống nhất cách tắt sự cố tại các đường gọi, xử lý cả kế hoạch đã lưu từ bản cũ | Qua ngày có sự cố và tải save cũ không phát sinh lỗi hoặc trừ tiền ngoài ý muốn. |
| `applyRestore()` ghi save trước khi `loadFrom()` thành công | Kiểm tra dữ liệu nhập, dựng trạng thái hợp lệ rồi mới thay save; phục hồi trạng thái cũ nếu thất bại | Bản nhập lỗi không thay đổi save tốt; bản hợp lệ khôi phục được. |
| Backup chỉ kiểm tra vài trường; một số giá trị được đưa trực tiếp vào HTML | Kiểm tra kiểu, giới hạn số và danh sách giá trị hợp lệ; escape dữ liệu nhập khi hiển thị | Backup bất thường bị từ chối hoặc hiển thị như văn bản, không tạo HTML ngoài ý muốn. |
| `sync.py` ghi lại `index.html`; sync đã chuyển sang thủ công | Xem diff và kiểm thử trước khi đưa bản sync vào phát hành | Không ghi mất bản sửa đã kiểm thử. |
| Deploy đã chuyển sang thủ công; artifact hiện vẫn là cả repo và chưa có kiểm tra | Cho kiểm tra và deploy phụ thuộc trực tiếp; chỉ đóng gói file chạy game | Kiểm tra thất bại thì không deploy; tài liệu/công cụ giải mã không nằm trong gói web. |
| Service worker xóa mọi cache khác tên trên cùng origin | Chỉ xóa cache thuộc game; kiểm tra tên khóa lưu nếu có nhiều bản game cùng hostname | Cập nhật game không ảnh hưởng ứng dụng khác dùng chung origin. |

Tham chiếu chính: [logic game](index.html), [service worker](sw.js), [sync](sync.py), [workflow deploy](.github/workflows/static.yml), [workflow sync](.github/workflows/sync.yml).

## 3. Các quyết định cần chốt

- **Repo và quyền triển khai:** đã xác nhận repo private và quyền ADMIN qua GitHub CLI. Người dùng đã cho phép đẩy code; chưa yêu cầu mở công khai site hoặc thay đổi độ hiển thị repo. Cấu hình hosting và tên miền vẫn cần chốt.
- **Quyền phát hành:** repo tải mã, ảnh và nhạc từ nguồn khác, có bước bỏ kiểm tra hostname và chưa có `LICENSE`. Cần xác nhận quyền phân phối những nội dung này trước khi công khai; ghi công không tự thay thế quyền sử dụng.
- **Địa chỉ chính thức:** chọn URL ổn định trước khi mời người chơi. Dữ liệu `localStorage` không tự đi theo khi đổi hostname; chuyển địa chỉ cần hướng dẫn xuất/nhập backup. Nếu chưa có domain, có thể dùng URL của nhà cung cấp.
- **Sao lưu độc lập:** đã chốt lưu tại máy và xuất/nhập file hoặc mã dài trong [SAVE_PLAN.md](SAVE_PLAN.md). Cần sửa UI hiện vẫn gọi Worker ngoài trước khi hiện mã dài, đồng thời hướng dẫn người chỉ giữ mã 8 số cũ khôi phục và xuất file/mã dài trước khi bỏ API.

## 4. Trình tự thực hiện

1. **Chốt nguồn phát hành:** xác định URL và quyền sử dụng tài nguyên. Cách lưu game đã chốt; giữ bản snapshot trước khi sửa.
2. **Sửa các lỗi chặn phát hành:** xử lý sự cố, restore và dữ liệu nhập; thêm kiểm tra hồi quy nhỏ cho từng lỗi thực tế. Giữ nguyên kiến trúc HTML/CSS/JS hiện tại.
3. **Chuẩn bị gói web:** tạo thư mục đầu ra chỉ chứa `index.html`, `sw.js`, manifest, icon, ảnh, âm thanh và font cần dùng. Kiểm tra mọi đường dẫn cache tồn tại. Nếu tự phục vụ font, đổi tham chiếu hiện đang gọi Google Fonts và đưa font vào cache.
4. **Sửa CI:** kiểm tra cú pháp JavaScript lấy trực tiếp từ `index.html`, cú pháp Python, file tài nguyên và các kiểm tra hồi quy. Đóng gói và deploy đúng commit đã kiểm tra. Với Cloudflare, kết nối repo private và đặt bước kiểm tra trước đóng gói; dùng thư mục đầu ra làm publish directory. Với GitHub Pages, thêm job kiểm tra trước deploy. Giữ sync tách khỏi phát hành.
5. **Kiểm thử trên HTTPS:** kiểm tra Chrome desktop/Android và Safari iOS nếu có thiết bị. Chơi một ngày, đóng/mở lại, restore hợp lệ/lỗi, PWA, offline và nâng phiên bản khi đã có save. Nếu dùng GitHub project Pages, kiểm tra thêm đường dẫn dưới `/ten-repo/`.
6. **Mở beta và chuẩn bị quay lui:** ghi lại commit phát hành, thử khôi phục bản trước, kiểm tra lại save và offline rồi mới chia sẻ URL rộng rãi. Khi quay lui, phát hành lại mã cũ với phiên bản cache mới và xác nhận tương thích save.

Workflow GitHub Pages có thể dùng một job kiểm tra/đóng gói và một job deploy với `needs`, theo [hướng dẫn chính thức](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Nếu vẫn giữ `workflow_run`, cần kiểm tra kết quả thành công; sự kiện hoàn tất tự nó không bảo đảm workflow trước đã thành công, theo [GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_run).

## 5. Điều kiện mở công khai

- Tất cả file runtime tải được; luồng kiểm thử không có lỗi JavaScript chưa xử lý.
- Bản nhập lỗi không làm mất dữ liệu; cập nhật và quay lui không phá save đã có.
- Chế độ offline và cập nhật cache đã được thử trên bản HTTPS.
- CI chỉ deploy sau kiểm tra thành công; sync không tự thay bản đang phục vụ.
- Quyền phát hành, địa chỉ chính thức và phương án sao lưu đã được xác nhận.

Khảo sát này dựa trên mã local và tài liệu nhà cung cấp. Chưa kiểm thử đầy đủ gameplay trên thiết bị thật, chưa truy cập cấu hình tài khoản hosting và chưa gửi dữ liệu người chơi tới API bên ngoài.
