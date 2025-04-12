import Detection from '../models/detection.js';
import { Op } from 'sequelize';

async function addDetection(data) {
  return await Detection.create(data);
}

async function getAllDetections(filters = {}, limit) {
  // Siapkan kondisi query
  const whereClause = {};
  
  // Filter berdasarkan sensorId
  if (filters.sensorId) {
    whereClause.sensorId = filters.sensorId;
  }
  
  // Filter berdasarkan zone
  if (filters.zone) {
    whereClause.zone = filters.zone;
  }
  
  // Filter berdasarkan rentang tanggal deteksi
  if (filters.dateRange) {
    whereClause.detectionTime = {};
    
    if (filters.dateRange.start) {
      // Pastikan tanggal mulai diset ke awal hari (00:00:00)
      const startDate = new Date(filters.dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      whereClause.detectionTime[Op.gte] = startDate;
    }
    
    if (filters.dateRange.end) {
      // Pastikan tanggal akhir diset ke akhir hari (23:59:59)
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      whereClause.detectionTime[Op.lte] = endDate;
    }
  }
  
  // Siapkan opsi query
  const queryOptions = {
    where: whereClause,
    order: [['detectionTime', 'DESC']]
  };
  
  // Batasi hasil jika diminta
  if (limit && limit > 0) {
    queryOptions.limit = limit;
  }
  
  console.log('Filter query:', JSON.stringify(whereClause, null, 2));
  return await Detection.findAll(queryOptions);
}

async function getDetectionById(id) {
  return await Detection.findByPk(id);
}

async function deleteAllDetections() {
  return await Detection.destroy({
    where: {},
    truncate: true
  });
}

export { addDetection, getAllDetections, getDetectionById, deleteAllDetections };
