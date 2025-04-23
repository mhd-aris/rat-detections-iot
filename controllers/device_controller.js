import { sendControlMessage, sendConfigMessage } from '../mqtt/client.js';

// Kirim perintah kontrol ke perangkat
export const controlDevice = async (req, res) => {
  try {
    const command = req.body;
    
    if (!command || Object.keys(command).length === 0) {
      return res.status(400).json({ message: 'Perintah kontrol tidak boleh kosong' });
    }
    
    // Validasi perintah-perintah khusus
    if (command.reset_count !== undefined && typeof command.reset_count !== 'boolean') {
      return res.status(400).json({ message: 'Parameter reset_count harus berupa boolean' });
    }
    
    if (command.buzzer_test !== undefined && typeof command.buzzer_test !== 'boolean') {
      return res.status(400).json({ message: 'Parameter buzzer_test harus berupa boolean' });
    }
    
    if (command.pir !== undefined && typeof command.pir !== 'boolean') {
      return res.status(400).json({ message: 'Parameter pir harus berupa boolean' });
    }
    
    if (command.restart !== undefined && typeof command.restart !== 'boolean') {
      return res.status(400).json({ message: 'Parameter restart harus berupa boolean' });
    }
    
    if (command.operation_mode !== undefined && 
        !['normal', 'sensitive', 'silent'].includes(command.operation_mode)) {
      return res.status(400).json({ 
        message: 'Parameter operation_mode harus bernilai normal, sensitive, atau silent' 
      });
    }
    
    const result = sendControlMessage(command);
    
    if (result) {
      res.status(200).json({ 
        message: 'Perintah kontrol berhasil dikirim',
        command: command
      });
    } else {
      res.status(500).json({ 
        message: 'Gagal mengirim perintah kontrol, MQTT tidak terhubung' 
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Kirim konfigurasi ke perangkat
export const configureDevice = async (req, res) => {
  try {
    const config = req.body;
    
    if (!config || Object.keys(config).length === 0) {
      return res.status(400).json({ message: 'Konfigurasi tidak boleh kosong' });
    }
    
    // Validasi parameter konfigurasi
    if (config.motion_cooldown !== undefined) {
      if (typeof config.motion_cooldown !== 'number' || 
          config.motion_cooldown < 1000 || 
          config.motion_cooldown > 60000) {
        return res.status(400).json({ 
          message: 'Parameter motion_cooldown harus berupa angka antara 1000-60000' 
        });
      }
    }
    
    if (config.pir_sensitivity !== undefined) {
      if (typeof config.pir_sensitivity !== 'number' || 
          config.pir_sensitivity < 0 || 
          config.pir_sensitivity > 100) {
        return res.status(400).json({ 
          message: 'Parameter pir_sensitivity harus berupa angka antara 0-100' 
        });
      }
    }
    
    if (config.buzzer_enabled !== undefined && typeof config.buzzer_enabled !== 'boolean') {
      return res.status(400).json({ message: 'Parameter buzzer_enabled harus berupa boolean' });
    }
    
    if (config.buzzer_pattern !== undefined && 
        !['default','ultrasonic', 'varying', 'aggressive'].includes(config.buzzer_pattern)) {
      return res.status(400).json({ 
        message: 'Parameter buzzer_pattern harus bernilai default, ultrasonic, varying atau aggresive' 
      });
    }
    
    if (config.alert_repeats !== undefined) {
      if (typeof config.alert_repeats !== 'number' || 
          config.alert_repeats < 1 || 
          config.alert_repeats > 10) {
        return res.status(400).json({ 
          message: 'Parameter alert_repeats harus berupa angka antara 1-10' 
        });
      }
    }
    
    if (config.led_brightness !== undefined) {
      if (typeof config.led_brightness !== 'number' || 
          config.led_brightness < 0 || 
          config.led_brightness > 255) {
        return res.status(400).json({ 
          message: 'Parameter led_brightness harus berupa angka antara 0-255' 
        });
      }
    }
    
    // Convert buzzer_enabled string to boolean if needed
    if (config.buzzer_enabled === 'true') config.buzzer_enabled = true;
    if (config.buzzer_enabled === 'false') config.buzzer_enabled = false;
    
    const result = sendConfigMessage(config);
    
    if (result) {
      res.status(200).json({ 
        message: 'Konfigurasi berhasil dikirim',
        config: config
      });
    } else {
      res.status(500).json({ 
        message: 'Gagal mengirim konfigurasi, MQTT tidak terhubung' 
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Perintah khusus untuk mengaktifkan/menonaktifkan PIR
export const togglePIR = async (req, res) => {
  try {
    const { active } = req.body;
    
    // Validasi data input
    if (active === undefined) {
      return res.status(400).json({ message: 'Parameter "active" diperlukan' });
    }
    
    // Convert string ke boolean jika diperlukan
    let activeStatus;
    if (typeof active === 'string') {
      activeStatus = active === 'true';
    } else {
      activeStatus = Boolean(active);
    }
    
    const command = { pir: activeStatus };
    const result = sendControlMessage(command);
    
    if (result) {
      res.status(200).json({ 
        message: `PIR berhasil ${activeStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
        command: command,
        status: 'success'
      });
    } else {
      res.status(503).json({ 
        message: 'Gagal mengirim perintah, MQTT tidak terhubung',
        status: 'error'
      });
    }
  } catch (err) {
    console.error('Error in togglePIR:', err);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat memproses perintah: ' + err.message,
      status: 'error'
    });
  }
};

// Perintah khusus untuk mengubah mode operasi
export const setOperationMode = async (req, res) => {
  try {
    const { mode } = req.body;
    
    if (!mode || !['normal', 'sensitive', 'silent'].includes(mode)) {
      return res.status(400).json({ 
        message: 'Mode operasi tidak valid. Pilih: normal, sensitive, atau silent' 
      });
    }
    
    const command = { operation_mode: mode };
    const result = sendControlMessage(command);
    
    if (result) {
      res.status(200).json({ 
        message: `Mode operasi berhasil diubah ke "${mode}"`,
        command: command
      });
    } else {
      res.status(500).json({ 
        message: 'Gagal mengirim perintah, MQTT tidak terhubung' 
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Perintah untuk menguji buzzer
export const testBuzzer = async (req, res) => {
  try {
    const command = { buzzer_test: true };
    const result = sendControlMessage(command);
    
    if (result) {
      res.status(200).json({ 
        message: 'Perintah uji buzzer berhasil dikirim',
        command: command
      });
    } else {
      res.status(500).json({ 
        message: 'Gagal mengirim perintah, MQTT tidak terhubung' 
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Perintah untuk restart perangkat
export const restartDevice = async (req, res) => {
  try {
    const command = { restart: true };
    const result = sendControlMessage(command);
    
    if (result) {
      res.status(200).json({ 
        message: 'Perintah restart berhasil dikirim',
        command: command
      });
    } else {
      res.status(500).json({ 
        message: 'Gagal mengirim perintah, MQTT tidak terhubung' 
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 