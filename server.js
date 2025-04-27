const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const Docker = require('dockerode');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

// Initialize database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(
      'CREATE TABLE IF NOT EXISTS metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME, cpu_usage REAL, memory_usage REAL, disk_usage REAL, network_in REAL, network_out REAL, container_stats TEXT)'
    );
  }
});

// Initialize Docker
const docker = new Docker();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes
app.get('/api/metrics', authenticateToken, (req, res) => {
  db.all('SELECT * FROM metrics ORDER BY timestamp DESC LIMIT 100', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/metrics', authenticateToken, (req, res) => {
  const { cpu_usage, memory_usage, disk_usage, network_in, network_out, container_stats } = req.body;
  db.run(
    'INSERT INTO metrics (timestamp, cpu_usage, memory_usage, disk_usage, network_in, network_out, container_stats) VALUES (datetime(\'now\'), ?, ?, ?, ?, ?, ?)',
    [cpu_usage, memory_usage, disk_usage, network_in, network_out, container_stats],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Docker container stats
app.get('/api/containers', authenticateToken, async (req, res) => {
  try {
    const containers = await docker.listContainers();
    res.json(containers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// WebSocket for real-time updates
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});