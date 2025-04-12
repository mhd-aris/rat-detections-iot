import mqtt from "mqtt";
import { addDetection } from "../services/detection_service.js";
import dotenv from "dotenv";
dotenv.config();

// Konfigurasi MQTT Topic
const MQTT_BASE_TOPIC = "ratdetect"; // Harus sesuai dengan ESP32
const MQTT_DEVICE_ID = process.env.MQTT_DEVICE_ID || "device001";

// Topik yang diterima dari perangkat
const TOPIC_TELEMETRY = `${MQTT_BASE_TOPIC}/${MQTT_DEVICE_ID}/telemetry`;
const TOPIC_STATUS = `${MQTT_BASE_TOPIC}/${MQTT_DEVICE_ID}/status`;
const TOPIC_RESPONSE = `${MQTT_BASE_TOPIC}/${MQTT_DEVICE_ID}/response`;

// Topik untuk mengirim perintah ke perangkat
const TOPIC_CONTROL = `${MQTT_BASE_TOPIC}/${MQTT_DEVICE_ID}/control`;
const TOPIC_CONFIG = `${MQTT_BASE_TOPIC}/${MQTT_DEVICE_ID}/config`;

const mqttOptions = {
  host: process.env.MQTT_HOST,
  port: parseInt(process.env.MQTT_PORT || "8883"),
  protocol: "mqtts",
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clientId: `iot_backend_${Math.random().toString(16).slice(2, 8)}`,
  clean: true,
  rejectUnauthorized: false,
  reconnectPeriod: 5000,
};

// Log konfigurasi MQTT
console.log("MQTT Config:", {
  ...mqttOptions,
  password: "********",
});

// Log topik MQTT
console.log("MQTT Topics:", {
  telemetry: TOPIC_TELEMETRY,
  status: TOPIC_STATUS,
  response: TOPIC_RESPONSE,
  control: TOPIC_CONTROL,
  config: TOPIC_CONFIG,
});

const client = mqtt.connect(mqttOptions);

client.on("connect", () => {
  console.log("MQTT connected to", process.env.MQTT_HOST);

  // Subscribe ke semua topik yang diperlukan
  const topics = [TOPIC_TELEMETRY, TOPIC_STATUS, TOPIC_RESPONSE];

  topics.forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Subscribed to topic: ${topic}`);
      } else {
        console.error(`Failed to subscribe to topic: ${err.message}`);
      }
    });
  });

  // Kirim status online ke perangkat
  sendControlMessage({ server_status: "online" });

  // Kirim status MQTT ke klien WebSocket
  if (global.broadcastToClients) {
    global.broadcastToClients({
      type: "mqtt_status",
      connected: true,
    });
  }
});

client.on("error", (error) => {
  console.error("MQTT Error:", error.message);

  // Kirim status error ke klien WebSocket
  if (global.broadcastToClients) {
    global.broadcastToClients({
      type: "mqtt_status",
      connected: false,
      error: error.message,
    });
  }
});

client.on("reconnect", () => {
  console.log("MQTT trying to reconnect...");

  // Kirim status reconnecting ke klien WebSocket
  if (global.broadcastToClients) {
    global.broadcastToClients({
      type: "mqtt_status",
      connected: false,
      reconnecting: true,
    });
  }
});

client.on("offline", () => {
  console.log("MQTT is offline");

  // Kirim status offline ke klien WebSocket
  if (global.broadcastToClients) {
    global.broadcastToClients({
      type: "mqtt_status",
      connected: false,
    });
  }
});

client.on("message", async (topic, message) => {
  try {
    console.log(`Received message from topic: ${topic}`);
    const payload = JSON.parse(message.toString());

    // Broadcast pesan ke klien WebSocket
    if (global.broadcastToClients) {
      global.broadcastToClients({
        topic: topic,
        data: payload,
      });
    }

    // Tangani pesan berdasarkan topik
    if (topic === TOPIC_TELEMETRY) {
      handleTelemetryMessage(payload);
    } else if (topic === TOPIC_STATUS) {
      handleStatusMessage(payload);
    } else if (topic === TOPIC_RESPONSE) {
      handleResponseMessage(payload);
    }
  } catch (err) {
    console.error("Failed to process MQTT data:", err.message);
  }
});

// Fungsi untuk menangani pesan telemetri (deteksi gerakan)
async function handleTelemetryMessage(payload) {
  try {
    console.log("Telemetry data:", payload);

    // Generate zona acak 1-16 jika tidak ada
    if (!payload.zone) {
      const randomZone = Math.floor(Math.random() * 16) + 1;
      payload.zone = randomZone.toString();
    }

    // Data untuk disimpan ke database
    // Pastikan nama properti sesuai dengan model Sequelize (camelCase)
    const detectionData = {
      sensorId: payload.device_id,
      detectionTime: new Date(payload.timestamp),
      status: payload.event || "motion_detected",
      motionCount: payload.motion_count ? parseInt(payload.motion_count) : null,
      duration: payload.duration_ms ? parseInt(payload.duration_ms) : null,
      zone: payload.zone,
      latitude: payload.latitude || null,
      longitude: payload.longitude || null,
      sensorType: payload.sensor_type || "PIR",
      powerSource: payload.power_source || "Battery",
      rssi: payload.rssi ? parseInt(payload.rssi) : null,
      operationMode: payload.device?.operation_mode || payload.config?.operation_mode,
      deviceMac: payload.mac,
      uptime: payload.uptime_ms ? parseInt(payload.uptime_ms) : null,
      
      // Simpan payload lengkap
      rawPayload: payload
    };

    // Log data yang akan disimpan
    console.log("Saving detection data:", JSON.stringify(detectionData, null, 2));

    // Simpan ke database
    const savedData = await addDetection(detectionData);
    console.log(`Detection data saved to database with ID: ${savedData.id}`);
  } catch (err) {
    console.error("Error processing telemetry:", err.message);
    console.error(err.stack);
  }
}

// Fungsi untuk menangani pesan status perangkat
function handleStatusMessage(payload) {
  console.log("Status update received:", payload);

  // Simpan status terakhir yang diterima
  let lastStatus = {};

  try {
    // Pastikan payload valid
    if (!payload.device_id) {
      console.error("Invalid device status payload: missing device_id");
      return;
    }

    // Penyesuaian data status jika diperlukan
    // Pastikan format sesuai dengan yang diharapkan frontend
    if (
      payload.config &&
      !payload.config.operation_mode &&
      payload.status &&
      payload.status.operation_mode
    ) {
      payload.config.operation_mode = payload.status.operation_mode;
    }

    // Simpan status terakhir (bisa disimpan ke database jika dibutuhkan)
    lastStatus = payload;

    // Log detail tambahan
    if (payload.status && payload.status.motion_count !== undefined) {
      console.log(`Current motion count: ${payload.status.motion_count}`);
    }

    // Catat timestamp penerimaan status untuk monitoring koneksi
    const receivedTime = new Date();
    console.log(`Status update processed at: ${receivedTime.toISOString()}`);
  } catch (error) {
    console.error("Error processing status message:", error.message);
  }
}

// Fungsi untuk menangani respons dari perangkat
function handleResponseMessage(payload) {
  console.log("Response from device:", payload);
  // Tangani respons dari perangkat atas perintah yang dikirim
}

// Fungsi untuk mengirim perintah kontrol ke perangkat
export function sendControlMessage(command) {
  try {
    const message = {
      ...command,
      timestamp: new Date().toISOString(),
    };

    const messageString = JSON.stringify(message);

    if (client.connected) {
      client.publish(TOPIC_CONTROL, messageString);
      console.log(`Control message sent to ${TOPIC_CONTROL}:`, message);
      return true;
    } else {
      console.log("Cannot send control message - MQTT not connected");
      return false;
    }
  } catch (error) {
    console.error("Error sending control message:", error);
    return false;
  }
}

// Fungsi untuk mengirim konfigurasi ke perangkat
export function sendConfigMessage(config) {
  try {
    const message = {
      ...config,
      timestamp: new Date().toISOString(),
    };

    const messageString = JSON.stringify(message);

    if (client.connected) {
      client.publish(TOPIC_CONFIG, messageString);
      console.log(`Config message sent to ${TOPIC_CONFIG}:`, message);
      return true;
    } else {
      console.log("Cannot send config message - MQTT not connected");
      return false;
    }
  } catch (error) {
    console.error("Error sending config message:", error);
    return false;
  }
}

export default client;
