# Lưu tiến trình tại máy và chuyển bằng bản xuất

Tiến trình mới lưu trong trình duyệt; người chơi tự giữ file hoặc mã dài để chuyển máy và khôi phục offline, không có API hay tài khoản đồng bộ save. Refactor không nhập dữ liệu từ game cũ, nhưng giữ định dạng của refactor qua các lần nâng cấp; repo trở thành nguồn mã chính và bỏ đồng bộ từ upstream để thay đổi game không bị ghi đè. Chấp nhận bắt đầu save mới và chỉ cân nhắc IndexedDB nếu đo được lỗi quota thật.
