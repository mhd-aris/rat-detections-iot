import sequelize from '../config/database.js';
import Detection from '../models/detection.js';

async function syncDatabase() {
  try {
    // Authenticate ke database
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync model dengan database (force: true akan drop tabel dan buat ulang)
    const shouldForce = process.argv.includes('--force');
    
    if (shouldForce) {
      console.log('WARNING: Force sync akan menghapus semua data yang ada!');
      console.log('Melakukan force sync dalam 5 detik...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Sync all models
    await sequelize.sync({ force: shouldForce, alter: !shouldForce });
    
    console.log(`Database sync completed. Force mode: ${shouldForce}`);
    
    // Cek struktur model Detection
    const tableInfo = await sequelize.getQueryInterface().describeTable('Detections');
    console.log('Detection table structure:');
    console.log(JSON.stringify(tableInfo, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Unable to sync database:', error);
    process.exit(1);
  }
}

syncDatabase(); 