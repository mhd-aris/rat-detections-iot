import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Detection = sequelize.define('Detection', {
  sensorId: { 
    type: DataTypes.STRING, 
    allowNull: false,
    field: 'sensor_id'
  },
  detectionTime: { 
    type: DataTypes.DATE, 
    allowNull: false,
    field: 'detection_time'
  },
  status: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  motionCount: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    field: 'motion_count'
  },
  duration: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
  zone: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  latitude: { 
    type: DataTypes.FLOAT, 
    allowNull: true 
  },
  longitude: { 
    type: DataTypes.FLOAT, 
    allowNull: true 
  },
  sensorType: { 
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'sensor_type'
  },
  powerSource: { 
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'power_source'
  },
  rssi: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
  operationMode: { 
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'operation_mode'
  },
  // Tambahkan kolom untuk menyimpan payload lengkap
  rawPayload: { 
    type: DataTypes.JSONB, 
    allowNull: true,
    field: 'raw_payload',
    comment: 'Payload lengkap dari perangkat dalam format JSON'
  },
  deviceMac: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'device_mac'
  },
  uptime: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true, // Gunakan snake_case untuk semua kolom secara otomatis
});

export default Detection;
