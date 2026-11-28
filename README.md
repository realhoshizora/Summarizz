# Chia tiền · Hội nghị bàn tròn

App chia tiền sau buổi đi chơi, ăn uống. Mỗi món có một người trả trước và chia cho cả bàn hoặc chỉ vài người. App tính ra ai phải chuyển cho ai bao nhiêu, với số lượt chuyển khoản ít nhất. Mèo thần tài ngồi giữa bàn làm chủ toạ.

Trang web tĩnh: chỉ có HTML, CSS và JS, không có server, không có database, không cần build.

```
public/
  index.html    giao diện
  style.css
  app.js        lưu trữ, link chia sẻ, vẽ bàn tròn, form
  split.js      toàn bộ phần tính tiền (không phụ thuộc giao diện)
  favicon.png
test/
  split.test.js test cho phần tính tiền
render.yaml     cấu hình deploy Render (Blueprint)
package.json    chỉ để chạy test, không có thư viện nào
```

## Chạy trên máy

```
npm start
```

Mở http://localhost:5173. Lệnh này dùng Python có sẵn trên máy. Server tĩnh nào cũng được, kể cả mở thẳng `public/index.html`, chỉ có nút "Gửi link" là cần http(s).

Chạy test:

```
npm test
```

## Dữ liệu được lưu ở đâu

- Trên máy: trong `localStorage` của trình duyệt. Reload trang hay tắt máy cũng không mất.
- Trong link: nút "Gửi link" nhét toàn bộ buổi đi chơi vào phần `#d=...` của URL. Ai mở link sẽ thấy đúng bản đó và bản đó được lưu luôn vào máy họ. Phần sau dấu `#` không được gửi lên server, nên Render không bao giờ thấy dữ liệu.
- Không có đồng bộ realtime. Ai sửa thì bấm "Gửi link" lại vào nhóm. Nếu máy đã có bản khác của cùng buổi đó, app sẽ hỏi trước khi ghi đè.
- Xoá dữ liệu trình duyệt thì mất dữ liệu trên máy đó. Link đã gửi vào nhóm chat vẫn mở lại được.

Vì không có server nên không bị dính các giới hạn của gói Free trên Render: file bị xoá mỗi lần restart, service ngủ sau 15 phút, Postgres free hết hạn sau 30 ngày.

## Deploy lên Render

Cách 1, Blueprint (nhanh nhất):

1. Đẩy thư mục này lên một repo GitHub hoặc GitLab.
2. Trên Render chọn **New → Blueprint**, chọn repo. Render đọc `render.yaml` và tạo một Static Site tên `chia-tien`.
3. Bấm **Apply**. Vài chục giây sau sẽ có link dạng `https://chia-tien.onrender.com`.

Cách 2, tạo tay:

1. Render → **New → Static Site** → chọn repo.
2. **Build Command:** `npm test` (chạy test trước khi lên mạng, test hỏng thì không deploy; để trống cũng được).
3. **Publish Directory:** `public`
4. Không cần biến môi trường nào.
5. Tuỳ chọn: ở mục **Headers**, thêm `/*` → `Cache-Control: no-cache` để mọi người luôn nhận bản mới nhất.

Static Site trên Render miễn phí, không ngủ, có sẵn HTTPS. Mỗi lần push lên nhánh chính là tự deploy lại.

## Cách tính

Mọi số tiền đều là số nguyên tính bằng đồng, không dùng số thực.

1. **Chia từng món.** Món `X` đồng chia cho `n` người: mỗi người `floor(X / n)`, số đồng lẻ còn lại chia cho từng người đầu tiên mỗi người 1đ, theo thứ tự trong bàn. Ví dụ 100.000đ chia 3 thành 33.334 + 33.333 + 33.333, cộng lại đúng 100.000đ.
2. **Số dư.** `Chênh lệch = Đã trả − Phải chịu`. Dương là được nhận lại, âm là phải chuyển ra. Tổng chênh lệch của cả bàn luôn bằng 0.
3. **Làm tròn đến 1.000đ, không mất đồng nào.** Làm tròn xuống mọi số dư, rồi cộng thêm 1.000đ cho những người có phần lẻ lớn nhất, đến khi tổng quay về 0 (phương pháp phần dư lớn nhất). Mỗi người lệch dưới 1.000đ, và app ghi rõ ai chịu thêm, ai được lợi bao nhiêu.
4. **Ít lượt chuyển khoản nhất.** Có `k` người còn nợ hoặc còn được nhận. Nếu chia được họ thành `G` nhóm nhỏ rời nhau mà mỗi nhóm tự cộng lại bằng 0, thì mỗi nhóm `m` người tự thanh toán trong `m − 1` lượt, tổng cộng `k − G` lượt. Vì vậy cần tìm `G` lớn nhất. `split.js` tìm chính xác bằng quy hoạch động trên các tập con (`dp[mask]` là số nhóm tổng bằng 0 nhiều nhất mà các người trong `mask` chia được), sau đó trong mỗi nhóm người nợ nhiều nhất trả người được nhận nhiều nhất. Cách chỉ dùng "nợ nhiều nhất trả cho nhận nhiều nhất" có thể tốn thêm lượt: test có một ca cách đó cần 4 lượt, bản này chỉ cần 3.

Với nhóm từ 19 người trở lên có khoản chênh lệch, app chuyển sang cách tham lam (không quá `k − 1` lượt) để vẫn chạy tức thì. Ghi chú `shortcut:` trong `split.js` nói rõ chỗ này.
