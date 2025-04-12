import express from 'express';
import * as controller from '../controllers/device_controller.js';

const router = express.Router();

// Rute untuk pengaturan dan kontrol perangkat

// Kirim perintah kontrol umum ke perangkat
router.post('/control', controller.controlDevice);

// Kirim konfigurasi ke perangkat
router.post('/config', controller.configureDevice);

// Perintah khusus untuk fungsi-fungsi tertentu
router.post('/pir/toggle', controller.togglePIR);
router.post('/mode', controller.setOperationMode);
router.post('/buzzer/test', controller.testBuzzer);
router.post('/restart', controller.restartDevice);

export default router; 