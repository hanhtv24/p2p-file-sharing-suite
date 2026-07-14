// @ts-check
/**
 * web/server.js — Chạy dashboard BitTorrent-swarm ĐỘC LẬP (không gộp vào app WebRTC).
 *
 * Mặc định dự án dùng chung 1 server (server/index.js, cổng 5000) với route
 * `/bittorrent` — xem `web/api.js`. File này chỉ còn dùng khi muốn chạy RIÊNG
 * dashboard (vd để debug, hoặc dùng trong harness) mà không cần khởi động app
 * WebRTC. Mount tại `/` (gốc) thay vì `/bittorrent`.
 *
 * Chạy: node web/server.js [port] [trackerPort]
 */

const express = require("express");
const http = require("http");

const { startTracker } = require("../bittorrent/tracker/tracker");
const { createBittorrentRouter } = require("./api");

const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 5050;
const TRACKER_PORT = Number(process.argv[3]) || Number(process.env.TRACKER_PORT) || 4000;

async function main() {
  const { server: trackerServer } = await startTracker(TRACKER_PORT);
  const trackerUrl = `http://localhost:${TRACKER_PORT}`;

  const app = express();
  const router = createBittorrentRouter({ trackerUrl });
  app.use("/", router);

  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`\n[web] Dashboard BitTorrent (độc lập): http://localhost:${PORT}`);
    console.log(`[web] Tracker dùng chung : ${trackerUrl}  (peer CLI khác cũng có thể trỏ vào đây)\n`);
  });

  const shutdown = () => {
    router.stopAllPeers();
    server.close();
    trackerServer.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
