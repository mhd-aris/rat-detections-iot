# IoT Rat Detection System

A comprehensive IoT backend system for monitoring and controlling rat detection devices. This system receives, processes, and visualizes data from IoT sensors that detect rat activity in predefined zones.

## Features

- **Real-time Detection Monitoring**: View live detection events as they happen
- **WebSocket Integration**: For real-time status updates and controls
- **MQTT Communication**: Secure data exchange with IoT devices
- **Data Visualization**: 
  - Heatmap of detection zones
  - Analytics and charts for detection frequency
  - Historical data analysis
- **Device Control**: 
  - Change operation modes ("ultrasonic", "varying", "aggressive")
  - Control buzzer and sensor functions
  - Remote device reset
- **Responsive Dashboard**: Access from any device with full functionality

## Technology Stack

- **Backend**: 
  - Node.js with Express.js
  - WebSocket for real-time communication
  - MQTT client for IoT device integration
  - PostgreSQL with Sequelize ORM for data storage

- **Frontend**: 
  - HTML, JavaScript, and Tailwind CSS
  - Chart.js for data visualization
  - Responsive design for all device sizes

## System Architecture

The system follows a three-tier architecture:

1. **IoT Devices Layer**: 
   - PIR motion sensors
   - Sends detection data via MQTT

2. **Server Layer**:
   - MQTT broker for device communication
   - Express.js API server for data processing
   - WebSocket server for real-time updates
   - PostgreSQL database for data storage

3. **Client Layer**:
   - Web dashboard for monitoring and control
   - Supports multiple views (status, analytics)

## API Endpoints

- `GET /api/detections`: Get detection data with optional filtering
- `GET /api/detections/:id`: Get specific detection details
- `POST /api/detections/test`: Create test detection data
- `DELETE /api/detections/all`: Delete all detection records
- `POST /api/devices/control`: Send control commands to devices
- `POST /api/devices/buzzer/test`: Test device buzzer
- `POST /api/devices/restart`: Restart connected devices

## Installation

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database
- MQTT broker (e.g., Mosquitto, HiveMQ)

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=youruser
   DB_PASS=yourpassword
   DB_NAME=iot_detection
   DB_PORT=5432
   
   MQTT_HOST=your-mqtt-broker
   MQTT_PORT=8883
   MQTT_USERNAME=your-mqtt-username
   MQTT_PASSWORD=your-mqtt-password
   MQTT_DEVICE_ID=device001
   ```

4. Initialize the database:
   ```
   node migrations/sync_database.js
   ```

5. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

6. Access the dashboard at:
   ```
   http://localhost:3000
   ```

## Usage

### Dashboard Navigation

- **Home Page**: View device status and latest detections
- **Analytics Page**: Visualize detection data with filtering options
- **Detection List**: Review all detections with filtering and sorting

### Device Control

1. Go to the "Status & Device Control" section
2. Use the provided buttons to:
   - Change operation mode
   - Test device functions
   - Reset counters
   - Restart the device

### Data Visualization

1. Go to the "Analytics" page
2. Use date filters to select a time range
3. View the heatmap showing detection frequency by zone
4. Check the chart showing distribution of detections

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the ISC License. 