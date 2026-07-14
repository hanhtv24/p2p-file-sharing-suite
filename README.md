# P2P File Sharing Suite

Bộ 2 hệ thống chia sẻ file phân tán, chạy chung 1 server Node.js:

1. **WebRTC P2P Transfer** (`/`) — chia sẻ file trực tiếp giữa browser qua `RTCDataChannel`, xác minh SHA-256.
2. **BitTorrent-swarm Engine** (`/bittorrent/`) — tracker điều phối peer, tải đa nguồn, rarest-first, chịu được peer rời/vào giữa chừng.

Đồ án môn **Các hệ thống phân tán**. Chi tiết đầy đủ (kiến trúc, kịch bản thử nghiệm, hướng dẫn demo) xem báo cáo trong [`docs/`](docs/).

---

## Chạy dự án

**Yêu cầu:** Node.js 16+, trình duyệt Chrome/Firefox/Edge.

```bash
git clone https://github.com/hanhtv24/p2p-file-sharing-suite.git
cd p2p-file-sharing-suite
npm install
npm run dev
```

| URL | Nội dung |
| --- | --- |
| `http://localhost:5000/` | App WebRTC P2P Transfer |
| `http://localhost:5000/bittorrent/` | Dashboard BitTorrent-swarm |

Chạy thử kịch bản đo hiệu năng (không cần mở web):
```bash
node harness/run-experiment.js harness/scenarios/baseline.json
```

Demo qua LAN nhiều máy: máy A chạy `npm run dev`, máy B/C truy cập `http://<IP-máy-A>:5000`.

---

## Sự cố thường gặp

**`Error: listen EADDRINUSE :::5000`**

- **Trên macOS**: gần như luôn do **AirPlay Receiver** (bật sẵn từ macOS Monterey) chiếm đúng cổng 5000. Nhận biết: log vẫn in được `[tracker] đang chạy tại :4000` bình thường, chỉ cổng 5000 lỗi. Xử lý — chọn 1 trong 2:
  - Tắt: **System Settings → General → AirDrop & Handoff → tắt "AirPlay Receiver"**, rồi chạy lại `npm run dev` bình thường.
  - Hoặc đổi cổng, không cần đổi gì hệ thống: `PORT=5001 npm run dev`.
- **Đã đổi `PORT` mà vẫn lỗi**: do `npm run dev` dùng `node --watch` — khi server lỗi, tiến trình cũ **không tự thoát hẳn** (`Waiting for file changes...`), tracker cổng 4000 của lần chạy trước vẫn còn sống và đụng độ lần chạy sau. Xử lý dứt điểm:
  ```bash
  killall node                              # macOS/Linux
  taskkill /F /IM node.exe                  # Windows
  PORT=5001 TRACKER_PORT=4001 npm run dev   # đổi luôn cả 2 cổng cho chắc
  ```
- Log lỗi luôn ghi rõ `port: <số>` đang bị chiếm — đổi đúng biến môi trường tương ứng (`PORT` cho server chính, `TRACKER_PORT` cho tracker).

---

## Cấu trúc project

```
server/, public/     # App WebRTC (server/index.js gắn thêm route /bittorrent)
bittorrent/           # Engine BitTorrent-swarm: torrent.js, protocol.js, tracker.js, peer.js, cli.js
web/                  # Dashboard cho BitTorrent-swarm (api.js gắn vào server chính)
harness/              # Khung đo hiệu năng tự động (baseline / scaling / rarest-vs-random / churn)
docs/                 # Báo cáo tiểu luận đầy đủ
```

---

## Tech stack

Node.js, Express, Socket.io · WebRTC (`RTCPeerConnection`, `RTCDataChannel`) · TCP thuần (`net`) cho BitTorrent-swarm · SHA-256 (`crypto`) · HTML/CSS/JS thuần, không framework frontend.

---

## Tài liệu tham khảo

- [MDN — WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [BEP 3 — BitTorrent Protocol Specification](https://www.bittorrent.org/beps/bep_0003.html)
- [RFC 8445 — ICE](https://tools.ietf.org/html/rfc8445)
