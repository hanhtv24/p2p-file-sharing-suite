# Giới thiệu dự án: Hệ thống chia sẻ file ngang hàng (P2P)

> Tài liệu này viết theo văn phong giới thiệu/báo cáo — dùng làm phần mở đầu
> cho báo cáo đồ án hoặc để đọc hiểu tổng quan trước khi đi vào chi tiết kỹ
> thuật ở [`01_PHAN_TICH_DU_AN.md`](01_PHAN_TICH_DU_AN.md). Trả lời đúng câu
> hỏi: *app WebRTC ban đầu làm được gì, hệ BitTorrent thêm vào khác gì và có
> thêm những gì.*

---

## 1. Bối cảnh và mục tiêu đồ án

Đề bài môn Các hệ thống phân tán yêu cầu xây dựng một **hệ thống chia sẻ file
ngang hàng (P2P)**, mô phỏng theo mô hình BitTorrent — nơi người tải file cũng
đồng thời là người chia sẻ lại file đó cho người khác, tạo thành một "swarm"
(bầy đàn) các máy cùng trao đổi dữ liệu trực tiếp với nhau thay vì phụ thuộc
vào một máy chủ trung tâm.

Dự án đi qua hai giai đoạn phát triển rõ rệt, được giữ lại **cả hai** trong
cùng một sản phẩm để tiện đối chiếu:

1. **App WebRTC** — bản gốc, khai thác công nghệ truyền file trực tiếp giữa
   các trình duyệt.
2. **Hệ BitTorrent-swarm** — bản mở rộng, xây một engine P2P đúng nghĩa
   BitTorrent bằng Node.js/TCP, giải quyết những gì app WebRTC chưa làm được.

Hai hệ thống này hiện chạy **chung một server, một cổng (`5000`)**, có nút bấm
chuyển qua lại — người dùng có thể trải nghiệm cả hai cách tiếp cận trong cùng
một phiên làm việc.

---

## 2. App WebRTC — nền tảng ban đầu

### 2.1. Ý tưởng cốt lõi

App WebRTC cho phép nhiều trình duyệt kết nối **trực tiếp với nhau** (không
qua server) bằng công nghệ `WebRTC DataChannel`, và trao đổi file ngay trong
trình duyệt. Vai trò của server (`server/index.js`) chỉ là **"môi giới"** ban
đầu: giúp 2 trình duyệt trao đổi thông tin kết nối (SDP, ICE candidate) rồi
rút lui — sau đó dữ liệu đi thẳng giữa các máy.

### 2.2. Các tính năng đã có

**Kết nối ngang hàng:**
- Kết nối được với **nhiều peer cùng lúc** — mỗi kết nối là một
  `RTCPeerConnection` độc lập, quản lý qua `Map<socketId, PeerConnection>`
  (không chỉ 1–1 như nhiều bản mô phỏng đơn giản khác).
- Tự động dò đường kết nối tốt nhất qua STUN (Google, Cloudflare) để vượt NAT.
- Nhận diện identity từng peer bằng avatar/tên (chủ đề World Cup 2026).

**Truyền và xác minh file:**
- Kéo–thả hoặc chọn file, tự động chia thành chunk 16KB, gửi qua DataChannel.
- **Tính SHA-256 cho từng chunk** — bên nhận verify ngay khi nhận, phát hiện
  chunk lỗi tức thời (đánh dấu đỏ trên chunk-map).
- **Tính SHA-256 cho toàn bộ file** sau khi ghép lại — hiển thị badge xác nhận
  toàn vẹn.
- Cơ chế **flow control**: tạm dừng gửi khi bộ đệm DataChannel vượt 8MB, tránh
  tràn bộ nhớ khi truyền file lớn.
- Danh sách file đang chia sẻ tự động đồng bộ tới mọi peer đang kết nối.

**Giao diện:**
- Bố cục 3 cột: danh sách peer — khu vực truyền file — danh sách file.
- **Chunk map trực quan**: mỗi ô nhỏ đại diện 1 chunk, đổi màu real-time theo
  trạng thái (xám = chưa nhận, cam = đang nhận, xanh = OK, đỏ = lỗi hash).
- Theme sáng/tối, lưu lựa chọn vào `localStorage`.
- Thanh thống kê tốc độ upload/download cập nhật mỗi giây.
- Thông báo dạng toast tự ẩn sau 4 giây.

### 2.3. Giới hạn của mô hình này

App WebRTC làm rất tốt phần **"truyền file đáng tin cậy giữa các trình duyệt"**,
nhưng bản chất kỹ thuật của nó là **nhiều kết nối 1–1 chạy song song** (mô
hình "star" — mỗi cặp peer nói chuyện riêng), **không phải một swarm thật**:

- Không có "tracker" đúng nghĩa — server chỉ biết ai đang online, không biết
  **ai đang giữ file nào**.
- Muốn tải file, phải **đã kết nối P2P với đúng người có file** — không có cơ
  chế "tìm ai đang có file X trong toàn mạng".
- Khi B tải file từ A, **toàn bộ file luôn do một mình A gửi trọn vẹn** — B
  không tự động tách nhỏ để tải từ nhiều nguồn khác nhau.
- Sau khi B tải xong, B **không tự động trở thành nguồn phát lại** file đó cho
  C — thiếu đúng cơ chế "downloader cũng là uploader" làm nên BitTorrent.

Đây chính là khoảng trống mà hệ thống thứ hai được xây để lấp đầy.

---

## 3. Vì sao cần thêm một hệ thống mới, không chỉnh sửa app cũ?

Có thể nghĩ: sao không sửa thẳng `webrtc.js` để thêm mấy tính năng còn thiếu?
Vấn đề nằm ở **nền tảng kỹ thuật**:

- WebRTC chỉ tồn tại **trong trình duyệt** — một "peer" luôn cần một con người
  mở tab trình duyệt. Muốn có 10–20 peer để kiểm chứng swarm thật, phải mở
  20 tab/trình duyệt thật, không thể tự động hoá để đo đạc, thử nghiệm.
- Để có tracker đúng nghĩa (server biết ai giữ file gì) và peer discovery theo
  file, cần thiết kế lại từ gốc cách server lưu trạng thái — không chỉ thêm
  vài dòng vào signaling server hiện tại.
- Để tải 1 file từ nhiều nguồn + re-upload, cần đổi `WebRTCHandler` từ giữ
  **một** kết nối sang quản lý **nhiều** kết nối đồng thời với logic điều phối
  chunk phức tạp hơn hẳn.

→ Giải pháp: xây một **engine P2P độc lập bằng Node.js + TCP socket**, nơi mỗi
"peer" là một tiến trình phần mềm (không cần con người ngồi trước màn hình) —
nhờ đó có thể **tự động sinh ra hàng chục peer để kiểm thử thật**, đồng thời
thiết kế đúng ngay từ đầu theo kiến trúc swarm chuẩn BitTorrent.

---

## 4. Hệ BitTorrent-swarm — những gì được thêm mới

### 4.1. Kiến trúc

```
                    ┌─────────────────────────┐
                    │   TRACKER (HTTP, :4000) │   "Danh bạ": ai đang giữ file gì
                    └────────────┬────────────┘
        announce/heartbeat        │        announce/heartbeat
   ┌───────────┬───────────┬──────┴──────┬───────────┬───────────┐
   ▼           ▼           ▼             ▼           ▼           ▼
 SEEDER     LEECHER     LEECHER   ...  LEECHER   LEECHER (web)  LEECHER (CLI)
   └──────────────── TCP: trao đổi chunk trực tiếp ────────────────┘
```

Mỗi "peer" trong hệ mới đồng thời là **TCP server** (phục vụ upload) và **TCP
client** (đi tải chunk từ người khác) — khác hẳn app WebRTC nơi vai trò
gửi/nhận tách biệt theo từng kết nối.

### 4.2. Các tính năng mới so với app WebRTC

| Tính năng | App WebRTC | Hệ BitTorrent-swarm mới |
|-----------|:----------:|:-----------------------:|
| Metadata + hash từng chunk | Tính khi gửi, không lưu file riêng | Tạo file metadata (`.meta.json`) độc lập, giống file `.torrent` thật, kèm `infohash` định danh |
| **Tracker theo file** | ❌ (chỉ biết peer online) | ✅ Tracker HTTP thật, map `infohash → danh sách peer`, tự loại peer quá hạn |
| **Peer discovery theo file** | ❌ (phải đã kết nối sẵn) | ✅ Peer mới tự "hỏi" tracker và nhận ngay danh sách người đang giữ file |
| **Tải 1 file từ nhiều nguồn cùng lúc** | ❌ (luôn 1 nguồn/lần tải) | ✅ Mở nhiều kết nối TCP song song, mỗi kết nối lấy các chunk khác nhau từ peer khác nhau |
| **Re-upload / swarm** | ❌ | ✅ Ngay khi có 1 chunk mới, peer báo `HAVE` cho cả swarm và sẵn sàng phục vụ chunk đó |
| **Thuật toán chọn chunk (rarest-first)** | Không có khái niệm | ✅ Ưu tiên tải chunk đang hiếm nhất trong swarm trước, tránh "tuyệt chủng" dữ liệu |
| **Mô phỏng peer rời/vào mạng (churn)** | Không hỗ trợ thử nghiệm | ✅ Harness tự động kill/restart peer theo lịch để kiểm chứng khả năng chịu lỗi |
| **Khung đo đạc tự động (harness)** | Không có | ✅ 1 lệnh dựng cả swarm (tracker + N peer), đo thời gian/throughput, xuất CSV |
| Kiểm tra hash | ✅ đã có, làm tốt | ✅ giữ nguyên triết lý, verify từng chunk trước khi ghi đĩa |
| Giao diện Web | ✅ (chunk-map, theme, stats) | ✅ Dashboard riêng (`/bittorrent`) — upload tự seed, bấm 1 nút để tải, tiến độ/tốc độ real-time |

### 4.3. Công cụ đi kèm

Ngoài engine lõi, hệ mới còn mang theo:
- **CLI (`bittorrent/cli.js`)** — dùng dòng lệnh để tạo metadata, chạy tracker,
  seed, hoặc tải file, phục vụ demo/thử nghiệm không cần trình duyệt.
- **Harness (`harness/`)** — bộ khung tự động dựng hàng chục peer, chạy kịch
  bản (mở rộng số peer, so sánh rarest-first/random, mô phỏng churn), xuất số
  liệu để đưa vào báo cáo.
- **Dashboard Web (`web/`)** — giao diện trực quan tương đương app WebRTC
  nhưng điều khiển engine mới, tích hợp chung 1 server tại đường dẫn
  `/bittorrent`.

---

## 5. Hai hệ thống, một sản phẩm

Điểm đặc biệt của đồ án: thay vì thay thế, **hai cách tiếp cận được giữ song
song** để người xem tự so sánh trực tiếp:

- Vào `http://localhost:5000/` → trải nghiệm app WebRTC (đa peer, chunk-map,
  theme World Cup 2026).
- Bấm nút **"🧲 BitTorrent Engine"** trên header → chuyển sang
  `http://localhost:5000/bittorrent/` → trải nghiệm engine BitTorrent-swarm
  thật (tracker, tải đa nguồn, re-upload) qua giao diện cùng phong cách màu
  sắc/typography để không bị "lệch tông" khi chuyển qua lại.
- Bấm **"⇄ App WebRTC"** để quay lại.

Về mặt kỹ thuật, cả hai chạy **chung 1 tiến trình Node.js**: `server/index.js`
vẫn phục vụ app WebRTC như cũ, đồng thời gắn thêm route `/bittorrent` (thông
qua `web/api.js`) — chỉ cần 1 lệnh `npm run dev` để khởi động toàn bộ.

---

## 6. Tóm tắt

App WebRTC chứng minh nhóm nắm vững các khái niệm nền tảng của truyền thông
P2P trong trình duyệt: NAT/STUN/ICE, DataChannel, xác minh toàn vẹn dữ liệu,
và xây được một giao diện hoàn chỉnh, trực quan. Đây là nền tảng tốt nhưng về
bản chất kiến trúc vẫn là **nhiều kết nối 1–1**, chưa phải mô hình swarm.

Hệ BitTorrent-swarm được xây thêm để **lấp đúng khoảng trống đó**: một tracker
thật, cơ chế tải đa nguồn, re-upload/swarm, rarest-first — đúng những gì làm
nên "BitTorrent" theo tên gọi. Kết quả là một bộ sản phẩm hoàn chỉnh: vừa có
chiều sâu kỹ thuật về WebRTC, vừa đáp ứng đầy đủ chuẩn đề bài về mô hình P2P
kiểu BitTorrent, có công cụ đo đạc/kiểm chứng đi kèm, và một giao diện thống
nhất để trình bày cả hai.

---

## 7. Đọc tiếp
- [`01_PHAN_TICH_DU_AN.md`](01_PHAN_TICH_DU_AN.md) — Phân tích kỹ thuật chi tiết, sơ đồ, wire protocol.
- [`02_HARNESS.md`](02_HARNESS.md) — Khung thử nghiệm và số liệu đã đo.
- [`03_DANH_GIA_DE_BAI.md`](03_DANH_GIA_DE_BAI.md) — Đối chiếu từng yêu cầu đề bài.
- [`04_SLIDE_OUTLINE.md`](04_SLIDE_OUTLINE.md) — Dàn ý slide thuyết trình.
- [`05_HUONG_DAN_DEMO.md`](05_HUONG_DAN_DEMO.md) — Kịch bản demo trực tiếp trên giao diện.
