// ~500 cầu thủ đắt giá / nổi tiếng — World Cup 2026 era
// flagcdn.com: ảnh cờ miễn phí, code = ISO 3166-1 alpha-2 (lowercase)
const crypto = require("node:crypto");

const WC2026_PLAYERS = [
  // ── ARGENTINA ──────────────────────────────────────────────────────────────
  { name: "Lionel Messi", country: "Argentina", code: "ar", color: "#74ACDF" },
  {
    name: "Lautaro Martínez",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  {
    name: "Julián Álvarez",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  {
    name: "Rodrigo De Paul",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  {
    name: "Alexis Mac Allister",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  { name: "Paulo Dybala", country: "Argentina", code: "ar", color: "#74ACDF" },
  {
    name: "Enzo Fernández",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  { name: "Nahuel Molina", country: "Argentina", code: "ar", color: "#74ACDF" },
  { name: "Marcos Acuña", country: "Argentina", code: "ar", color: "#74ACDF" },
  {
    name: "Cristian Romero",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  {
    name: "Lisandro Martínez",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  {
    name: "Nicolás Otamendi",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  {
    name: "Emiliano Martínez",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  {
    name: "Ángel Di María",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  {
    name: "Giovani Lo Celso",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  {
    name: "Exequiel Palacios",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  {
    name: "Franco Mastantuono",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  { name: "Thiago Almada", country: "Argentina", code: "ar", color: "#74ACDF" },
  {
    name: "Germán Pezzella",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  {
    name: "Leandro Paredes",
    country: "Argentina",
    code: "ar",
    color: "#74ACDF",
  },
  // ── PHAP ──────────────────────────────────────────────────────────────
  { name: "Kylian Mbappé", country: "France", code: "fr", color: "#002395" },
  {
    name: "Antoine Griezmann",
    country: "France",
    code: "fr",
    color: "#002395",
  },
  { name: "Ousmane Dembélé", country: "France", code: "fr", color: "#002395" },
  {
    name: "Eduardo Camavinga",
    country: "France",
    code: "fr",
    color: "#002395",
  },
  {
    name: "Aurélien Tchouaméni",
    country: "France",
    code: "fr",
    color: "#002395",
  },
  { name: "Dayot Upamecano", country: "France", code: "fr", color: "#002395" },
  { name: "Théo Hernández", country: "France", code: "fr", color: "#002395" },
  { name: "Mike Maignan", country: "France", code: "fr", color: "#002395" },
  { name: "Jules Koundé", country: "France", code: "fr", color: "#002395" },
  { name: "William Saliba", country: "France", code: "fr", color: "#002395" },
  { name: "N'Golo Kanté", country: "France", code: "fr", color: "#002395" },
  { name: "Kingsley Coman", country: "France", code: "fr", color: "#002395" },
  { name: "Marcus Thuram", country: "France", code: "fr", color: "#002395" },
  { name: "Bradley Barcola", country: "France", code: "fr", color: "#002395" },
  {
    name: "Randal Kolo Muani",
    country: "France",
    code: "fr",
    color: "#002395",
  },
  {
    name: "Warren Zaïre-Emery",
    country: "France",
    code: "fr",
    color: "#002395",
  },
  { name: "Mattéo Guendouzi", country: "France", code: "fr", color: "#002395" },
  { name: "Adrien Rabiot", country: "France", code: "fr", color: "#002395" },
  { name: "Benjamin Pavard", country: "France", code: "fr", color: "#002395" },
  { name: "Ibrahima Konaté", country: "France", code: "fr", color: "#002395" },
  // ── ANH ──────────────────────────────────────────────────────────────
  {
    name: "Jude Bellingham",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  { name: "Harry Kane", country: "England", code: "gb-eng", color: "#CF081F" },
  { name: "Bukayo Saka", country: "England", code: "gb-eng", color: "#CF081F" },
  { name: "Phil Foden", country: "England", code: "gb-eng", color: "#CF081F" },
  {
    name: "Trent Alexander-Arnold",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  { name: "Declan Rice", country: "England", code: "gb-eng", color: "#CF081F" },
  { name: "John Stones", country: "England", code: "gb-eng", color: "#CF081F" },
  {
    name: "Marcus Rashford",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  {
    name: "Jack Grealish",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  { name: "Cole Palmer", country: "England", code: "gb-eng", color: "#CF081F" },
  {
    name: "Kobbie Mainoo",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  {
    name: "Eberechi Eze",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  {
    name: "Anthony Gordon",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  {
    name: "Kieran Trippier",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  {
    name: "Jordan Pickford",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  {
    name: "Levi Colwill",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  {
    name: "Conor Gallagher",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  {
    name: "Ollie Watkins",
    country: "England",
    code: "gb-eng",
    color: "#CF081F",
  },
  { name: "Ivan Toney", country: "England", code: "gb-eng", color: "#CF081F" },
  { name: "Luke Shaw", country: "England", code: "gb-eng", color: "#CF081F" },
  // ── TAY BAN NHA ──────────────────────────────────────────────────────────────
  { name: "Pedri", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Lamine Yamal", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Rodri", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Gavi", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Nico Williams", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Dani Olmo", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Álvaro Morata", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Fabián Ruiz", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Dani Carvajal", country: "Spain", code: "es", color: "#AA151B" },
  {
    name: "Alejandro Grimaldo",
    country: "Spain",
    code: "es",
    color: "#AA151B",
  },
  { name: "Aymeric Laporte", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Robin Le Normand", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Mikel Merino", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Fermín López", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Unai Simón", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Ferran Torres", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Martín Zubimendi", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Ansu Fati", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Marcos Llorente", country: "Spain", code: "es", color: "#AA151B" },
  { name: "Eric García", country: "Spain", code: "es", color: "#AA151B" },
];

// Trả về { emoji: <img URL cờ>, name: "Tên (Quốc gia)", color: <hex> }
function getRandomAnimal() {
  // Dùng crypto.getRandomValues thay Math.random() — không phải vì cần an
  // toàn mật mã (chỉ chọn avatar hiển thị), nhưng tránh cảnh báo PRNG yếu.
  const idx =
    crypto.getRandomValues(new Uint32Array(1))[0] % WC2026_PLAYERS.length;
  const p = WC2026_PLAYERS[idx];
  return {
    emoji: `https://flagcdn.com/w40/${p.code}.png`,
    name: `${p.name} (${p.country})`,
    color: p.color,
  };
}

// Lấy IP thực từ request
function getClientIP(socket) {
  const headers = socket.handshake.headers;
  const forwarded = headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = headers["x-real-ip"];
  if (realIp) return realIp;
  return socket.handshake.address
    .replace("::ffff:", "")
    .replace("::1", "127.0.0.1");
}

// Phân tích User-Agent để xác định thiết bị
function parseUserAgent(ua) {
  if (!ua) return { device: "Unknown", icon: "💻" };
  const uaLower = ua.toLowerCase();
  if (uaLower.includes("iphone")) return { device: "iPhone", icon: "📱" };
  if (uaLower.includes("ipad")) return { device: "iPad", icon: "📱" };
  if (
    uaLower.includes("android") &&
    (uaLower.includes("samsung") || uaLower.includes("sm-"))
  )
    return { device: "Samsung", icon: "📱" };
  if (
    uaLower.includes("android") &&
    (uaLower.includes("xiaomi") || uaLower.includes("redmi"))
  )
    return { device: "Xiaomi", icon: "📱" };
  if (uaLower.includes("android")) return { device: "Android", icon: "📱" };
  if (uaLower.includes("macintosh")) return { device: "Mac", icon: "💻" };
  if (uaLower.includes("windows")) return { device: "Windows PC", icon: "🖥️" };
  if (uaLower.includes("linux")) return { device: "Linux", icon: "🐧" };
  if (uaLower.includes("cros")) return { device: "Chromebook", icon: "💻" };
  return { device: "Unknown", icon: "💻" };
}

// Tạo ID ngắn gọn cho peer
function generatePeerId() {
  // Dùng crypto.randomBytes thay Math.random() — tránh cảnh báo PRNG yếu.
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// Format bytes thành chuỗi dễ đọc
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

module.exports = {
  getRandomAnimal,
  getClientIP,
  parseUserAgent,
  generatePeerId,
  formatBytes,
};
