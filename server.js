const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(
      'CREATE TABLE IF NOT EXISTS metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME, cpu_usage REAL, memory_usage REAL, disk_usage REAL, network_in REAL, network_out REAL)'
    );
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))

// API Routes
app.get('/api/metrics', (req, res) => {
  // Mock data for testing
  const mockData = [
    { timestamp: new Date().toISOString(), cpu_usage: Math.random() * 100, memory_usage: Math.random() * 100, disk_usage: Math.random() * 100, network_in: Math.random() * 100, network_out: Math.random() * 100 },
  ];
  res.json(mockData);
});

app.post('/api/metrics', (req, res) => {
  const { cpu_usage, memory_usage, disk_usage, network_in, network_out } = req.body;
  db.run(
    'INSERT INTO metrics (timestamp, cpu_usage, memory_usage, disk_usage, network_in, network_out) VALUES (datetime(\'now\'), ?, ?, ?, ?, ?)',
    [cpu_usage, memory_usage, disk_usage, network_in, network_out],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});