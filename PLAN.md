# Kế hoạch triển khai — thương.

Rà soát mã nguồn và chạy kiểm tra ngày 17/10/2026. Trạng thái dưới đây thay thế các nhận định cũ; hạng mục đề xuất chưa có nghĩa là đã được yêu cầu triển khai.

## Đã hoàn thành

- [x] SQLite và API tạo/đọc lời chúc; đồng bộ hồ sơ từ `app/data/sisters.ts`, giữ nguyên lời chúc đã lưu.
- [x] Sáu ảnh đại diện đã được người dùng xác nhận và gán đúng trong `public/avatars/` và database.
- [x] Album ảnh theo manifest, có HEIC: bản gốc, WebP preview/thumbnail, slideshow, phóng to và lưới toàn bộ ảnh.
- [x] Form viết thủ công, chọn người nhận, tìm kiếm/lọc, sao chép và link `?to=slug`.
- [x] Các tùy chọn chia sẻ ứng dụng có trong `MemberModal.tsx`; cần kiểm tra thực tế trên điện thoại, không coi việc có link là đã xác nhận mọi ứng dụng hoạt động.
- [x] `WishSection` đã được gắn vào `app/page.tsx`, nút tương tác đã nối `Confetti`.
- [x] Nhạc ngẫu nhiên, nhớ bài trước và thử phát lại khi người dùng tương tác; danh sách hiện có 5 bài. Trình duyệt vẫn quyết định cho phép autoplay.
- [x] Đã ẩn điều khiển nhạc nổi theo yêu cầu người dùng; component chỉ quản lý audio và trả về null.
- [x] Đã bỏ tính năng gợi ý OpenAI theo yêu cầu mới nhất: không còn endpoint, nút gợi ý hay cấu hình key do tính năng này tạo.

## Kiểm tra hiện tại

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run build` | Thành công |
| `npm run test:db` | 4/4 đạt |
| `npm run test:photos` | 3/3 đạt |
| `npm run lint` | Thành công, không lỗi/cảnh báo |

Đã sửa nguồn gây lỗi lint của nhạc và chuyển avatar sang next/image.

## Việc cần làm tiếp và tiêu chí hoàn thành

| Ưu tiên | Công việc | Trạng thái / tiêu chí |
| --- | --- | --- |
| P1 | Sửa effect và dependency của nhạc | Đã làm; audio dùng effect/ref, cleanup đầy đủ, giới hạn chuyển bài khi lỗi. Lint đạt. |
| P1 | Giao diện nhạc | Đã ẩn widget theo yêu cầu trước đó. Nhạc vẫn chạy ngầm và thử lại sau tương tác. |
| P2 | Tối ưu avatar | Đã dùng next/image với fill/sizes và initials fallback khi ảnh lỗi. |
| P2 | Kiểm tra giao diện trên điện thoại | Kiểm tra slideshow vuốt, modal focus/đóng, bàn phím form, tên dài và chia sẻ thật trên thiết bị. Chưa có bằng chứng kiểm tra đầy đủ. |
| P3 | Xuất thiệp PNG | Đã thêm nút trong MemberModal và canvas tăng chiều cao theo nội dung; cần kiểm tra tải thực tế trên điện thoại. |
| P3 | Cấu hình triển khai | Đã có Dockerfile, compose.yaml, volume và health check. Compose validate đạt; chưa build container vì Docker engine đang dừng. Chưa deploy online. |
| P3 | Backup và phục hồi | Đã có db:backup/db:restore dùng VACUUM INTO và kiểm tra integrity. Đã chạy backup và restore ra file riêng thành công. Chưa cài lịch tự động. |

## Phạm vi trước khi đưa lên mạng

Ứng dụng hiện chưa có đăng nhập/quyền quản trị và API tạo lời chúc đang công khai. Cần quyết định ai được viết/sửa lời chúc trước khi mở cho nhiều người. SQLite cần ổ đĩa ghi được và lưu bền; không dùng file cục bộ làm cơ sở dữ liệu bền vững trên filesystem tạm thời.

Không thêm lại AI, lời chúc mẫu, hay thay ảnh đại diện khi chưa có yêu cầu mới. Giữ nguyên dữ liệu và các chỉnh sửa tên của người dùng.

## Việc còn lại

Kiểm tra trên điện thoại thật và chia sẻ qua ứng dụng; khởi động Docker để kiểm tra container; chọn hosting và chính sách quyền viết trước khi triển khai. Backup tự động chỉ cấu hình khi đã chọn môi trường chạy.