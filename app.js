import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import http from "http";
import { WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import sequelize from "./config/database.js";
import detectionRoutes from "./routes/detection_route.js";
import deviceRoutes from "./routes/device_route.js";
import authRoutes from "./routes/auth_route.js";
import { authenticatePage } from "./middleware/auth.js";

// Konfigurasi environment
dotenv.config();

// Konfigurasi __dirname di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inisialisasi Express dan HTTP server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Inisialisasi WebSocket Server
const wss = new WebSocketServer({ server });

// Menyimpan semua koneksi aktif untuk broadcast
const clients = new Set();

// Event handler untuk koneksi WebSocket
wss.on("connection", (ws) => {
  // Tambahkan klien baru ke set
  clients.add(ws);
  console.log(`WebSocket client connected. Total clients: ${clients.size}`);

  // Kirim pesan selamat datang
  ws.send(JSON.stringify({
    type: "info",
    message: "Terhubung ke server deteksi tikus"
  }));

  // Event handler untuk pesan masuk dari klien
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message from client:", data);
      
      // Proses pesan jika diperlukan
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  });

  // Event handler saat klien terputus
  ws.on("close", () => {
    clients.delete(ws);
    console.log(`WebSocket client disconnected. Total clients: ${clients.size}`);
  });
});

// Fungsi untuk broadcast pesan ke semua klien
export function broadcastMessage(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(message);
    }
  });
}

// Simpan wss dan fungsi broadcast ke global scope
global.wss = wss;
global.broadcastToClients = broadcastMessage;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/detections", detectionRoutes);
app.use("/api/devices", deviceRoutes);

// Root API route
app.get("/api", (req, res) => {
  res.json({
    message: "IoT Detection API Service",
    version: "1.0.0",
    status: "running",
  });
});

// Middleware autentikasi untuk halaman web
app.use(authenticatePage);

// Serve halaman login tanpa autentikasi
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route untuk halaman analytics
app.get("/analytics", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Terjadi kesalahan pada server",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Sync database dan jalankan server
async function startServer() {
  try {
    sequelize
      .authenticate()
      .then(() => console.log("Koneksi database berhasil"))
      .catch((err) => console.error("Tidak dapat terhubung ke database:", err));

    await sequelize.sync();
    console.log("Database berhasil tersinkronisasi");

    server.listen(PORT, () => {
      console.log(`Server HTTP berjalan pada port ${PORT}`);
      console.log(`WebSocket server aktif`);
      
      // Import MQTT client setelah server berjalan
      import('./mqtt/client.js').then(mqttModule => {
        const mqttClient = mqttModule.default;
        console.log("MQTT client dimulai");
      }).catch(err => {
        console.error("Gagal memulai MQTT client:", err.message);
      });
    });
  } catch (error) {
    console.error("Gagal menjalankan server:", error);
  }
}

startServer();
