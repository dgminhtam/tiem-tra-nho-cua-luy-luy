# Khả năng triển khai lên GitHub Pages

Ngày kiểm tra: 2026-09-28. Phạm vi: nghiên cứu mã nguồn, tài liệu chính thức và trạng thái GitHub; chưa triển khai.

## Kết luận

**Có thể triển khai game này bằng GitHub Pages, dùng ngay workflow có sẵn.** Game là HTML/CSS/JavaScript tĩnh, tài nguyên nằm trong repo, tiến trình quán lưu trong trình duyệt; không cần máy chủ ứng dụng hay bước build. Đây là mô hình Pages hỗ trợ. Nguồn: [index.html](../../index.html), [ADR lưu tiến trình](../adr/0001-browser-local-progress-and-portable-backups.md), [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

**Điều kiện cần làm rõ là gói tài khoản:** repo hiện private. Pages trên repo private cần GitHub Pro/Team/Enterprise; GitHub Free hỗ trợ Pages từ repo public. Chưa xác minh gói tài khoản của chủ repo, nên chưa thể khẳng định có thể bật Pages ngay với trạng thái hiện tại. Nguồn: [GitHub Pages — Who can use this feature?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Bằng chứng trong dự án

| Hạng mục | Kết quả |
| --- | --- |
| Workflow | [.github/workflows/static.yml](../../.github/workflows/static.yml) đã checkout, cấu hình Pages, tải artifact và deploy; chỉ chạy thủ công qua `workflow_dispatch`. |
| Quyền | Có `contents: read`, `pages: write`, `id-token: write` và environment `github-pages`, đáp ứng yêu cầu cơ bản của [custom workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Upload và deploy trong cùng một job được hỗ trợ. |
| Phiên bản action | `deploy-pages@v5` có thật; [release v5.0.0](https://github.com/actions/deploy-pages/releases/tag/v5.0.0) chuyển sang Node 24. Bộ phiên bản trong repo trùng [mẫu static chính thức](https://github.com/actions/starter-workflows/blob/main/pages/static.yml), không có căn cứ phải hạ v5 xuống v4. |
| Đường dẫn | [index.html](../../index.html) dùng đường dẫn tương đối; [manifest.webmanifest](../../manifest.webmanifest) đặt `start_url` và `scope` là `./`; [sw.js](../../sw.js) cache đường dẫn `./…`. Suy luận từ mã nguồn: phù hợp thư mục con của project Pages, không cần sửa base path. |
| Dung lượng | Tổng file được Git theo dõi tại thời điểm kiểm tra: 6.997.888 byte, khoảng 6,67 MiB; thấp hơn giới hạn site 1 GB. [Giới hạn Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) còn gồm 100 GB băng thông/tháng dạng soft limit và timeout triển khai 10 phút. |
| Tiến trình quán | Vẫn nằm trong trình duyệt, không đồng bộ máy chủ; chuyển thiết bị bằng bản sao tiến trình theo [ADR](../adr/0001-browser-local-progress-and-portable-backups.md). Đổi origin từ localhost sang Pages cần nhập bản sao nếu muốn mang tiến trình sang; [localStorage phân theo origin](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). |

## Trạng thái GitHub đã kiểm tra

Kiểm tra đọc qua GitHub CLI đã đăng nhập, ngày 2026-09-28:

- [Repo dgminhtam/tiem-tra-nho-cua-luy-luy](https://github.com/dgminhtam/tiem-tra-nho-cua-luy-luy): `private: true`, nhánh mặc định `main`, `has_pages: false`.
- `gh api repos/dgminhtam/tiem-tra-nho-cua-luy-luy/pages` trả HTTP 404, phù hợp Pages chưa được cấu hình.
- `gh run list --workflow static.yml --limit 5` trả danh sách trống: chưa tìm thấy lượt chạy workflow này trong kết quả kiểm tra.

Địa chỉ mặc định dự kiến sau khi triển khai thành công: [dgminhtam.github.io/tiem-tra-nho-cua-luy-luy/](https://dgminhtam.github.io/tiem-tra-nho-cua-luy-luy/). Đây là URL suy ra theo [quy tắc project site](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), chưa phải xác nhận website đang hoạt động.

## Cách triển khai khi đáp ứng điều kiện tài khoản

1. Vào **Settings → Pages → Build and deployment → Source → GitHub Actions**. Giữ workflow có sẵn; không cần tạo thêm. [Hướng dẫn cấu hình nguồn](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
2. Đảm bảo workflow có trên nhánh mặc định `main`; vào **Actions → Deploy static content to Pages → Run workflow → main**. Workflow hiện không tự deploy khi push. [Hướng dẫn chạy thủ công](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow).
3. Sau khi workflow thành công, mở URL trong kết quả deploy và kiểm tra game mới, chuẩn bị, một ngày bán, lưu/tải lại, khôi phục bản sao, rồi tải lại khi offline theo [AGENTS.md](../../AGENTS.md). Nếu sửa tài nguyên được cache, tăng `VERSION` trong [sw.js](../../sw.js).

Website Pages thường công khai dù repo private; việc giữ repo private không đồng nghĩa giới hạn người chơi truy cập website. [Tài liệu cấu hình Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Phạm vi xác minh

`node test_backup.js` đã trả `TTN2 backup and safe restore: OK`. Kiểm tra danh sách `FILES` trong `sw.js` ghi nhận đủ 122 mục cache trên đĩa, không thiếu file. Chưa chạy workflow, chưa đổi cài đặt repo, chưa kiểm thử trình duyệt trên hosting thật. Kết luận hiện là khả thi về kiến trúc và cấu hình; điều kiện gói tài khoản và lần triển khai thực tế vẫn cần được xác nhận.
