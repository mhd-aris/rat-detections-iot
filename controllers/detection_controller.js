import { addDetection, getAllDetections, deleteAllDetections, getDetectionById } from '../services/detection_service.js';

export const create = async (req, res) => {
  try {
    // Pastikan timestamp dan id disertakan
    const detectionData = {
      ...req.body,
      // Konversi tipe data jika diperlukan
      detectionTime: req.body.detectionTime ? new Date(req.body.detectionTime) : new Date(),
      motionCount: req.body.motionCount ? parseInt(req.body.motionCount) : null,
      duration: req.body.duration ? parseInt(req.body.duration) : null,
      rssi: req.body.rssi ? parseInt(req.body.rssi) : null,
      uptime: req.body.uptime ? parseInt(req.body.uptime) : null,
    };

    // Log data yang akan disimpan
    console.log('Creating detection:', JSON.stringify(detectionData, null, 2));

    const result = await addDetection(detectionData);
    res.status(201).json({ 
      message: 'Berhasil menyimpan', 
      data: result 
    });
  } catch (err) {
    console.error('Error creating detection:', err);
    res.status(500).json({ 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

// Endpoint untuk membuat test detection
export const createTest = async (req, res) => {
  try {
    // Buat sample data detection
    const timestamp = new Date();
    const testData = {
      sensorId: 'test-device-001',
      detectionTime: timestamp,
      status: 'motion_detected',
      motionCount: 1,
      duration: 1500,
      zone: '1',
      sensorType: 'PIR',
      powerSource: 'Battery',
      rssi: -65,
      operationMode: 'normal',
      deviceMac: 'AA:BB:CC:DD:EE:FF',
      uptime: 3600000,
      rawPayload: {
        device_id: 'test-device-001',
        mac: 'AA:BB:CC:DD:EE:FF',
        timestamp: timestamp.toISOString(),
        event: 'motion_detected',
        motion_count: 1,
        duration_ms: 1500,
        rssi: -65,
        uptime_ms: 3600000,
        device: {
          operation_mode: 'normal'
        }
      }
    };

    console.log('Creating test detection:', JSON.stringify(testData, null, 2));
    
    const result = await addDetection(testData);
    res.status(201).json({ 
      message: 'Berhasil membuat data test',
      data: result
    });
  } catch (err) {
    console.error('Error creating test detection:', err);
    res.status(500).json({ 
      message: 'Error membuat data test: ' + err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const getAll = async (req, res) => {
  try {
    // Tambahkan parameter untuk filter jika tersedia
    const filters = {};
    const { sensorId, zone, startDate, endDate, limit } = req.query;
    
    if (sensorId) filters.sensorId = sensorId;
    if (zone) filters.zone = zone;
    
    // Filter berdasarkan rentang waktu
    if (startDate || endDate) {
      filters.dateRange = {};
      
      if (startDate) {
        // Validasi format tanggal
        const parsedStartDate = new Date(startDate);
        if (!isNaN(parsedStartDate.getTime())) {
          filters.dateRange.start = parsedStartDate;
        } else {
          console.warn(`Format tanggal tidak valid untuk startDate: ${startDate}`);
        }
      }
      
      if (endDate) {
        // Validasi format tanggal
        const parsedEndDate = new Date(endDate);
        if (!isNaN(parsedEndDate.getTime())) {
          filters.dateRange.end = parsedEndDate;
        } else {
          console.warn(`Format tanggal tidak valid untuk endDate: ${endDate}`);
        }
      }
    }
    
    // Batasi jumlah hasil
    const resultLimit = limit ? parseInt(limit) : undefined;
    
    console.log('Request filter parameters:', { 
      sensorId, zone, 
      startDate: startDate ? new Date(startDate).toISOString() : undefined, 
      endDate: endDate ? new Date(endDate).toISOString() : undefined, 
      limit 
    });
    
    const data = await getAllDetections(filters, resultLimit);
    res.json(data);
  } catch (err) {
    console.error('Error getting detections:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getDetectionById(id);
    
    if (!data) {
      return res.status(404).json({ 
        message: 'Data deteksi tidak ditemukan',
        status: 'error'
      });
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error: ' + err.message,
      status: 'error'
    });
  }
};

export const deleteAll = async (_req, res) => {
  try {
    await deleteAllDetections();
    res.json({ 
      message: 'Semua data deteksi berhasil dihapus',
      status: 'success'
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Gagal menghapus data: ' + err.message,
      status: 'error'
    });
  }
};
