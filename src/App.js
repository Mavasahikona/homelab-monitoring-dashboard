import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';

const App = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [containers, setContainers] = useState([]);
  const [token, setToken] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Authenticate and get token
    const authenticate = async () => {
      try {
        const response = await axios.post('/api/auth', { username: 'admin', password: 'admin' });
        setToken(response.data.token);
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };

    authenticate();
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/api/metrics', {
          headers: { Authorization: token },
        });
        setMetrics(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setLoading(false);
      }
    };

    const fetchContainers = async () => {
      try {
        const response = await axios.get('/api/containers', {
          headers: { Authorization: token },
        });
        setContainers(response.data);
      } catch (error) {
        console.error('Error fetching containers:', error);
      }
    };

    fetchMetrics();
    fetchContainers();
    const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // Initialize WebSocket
    const socket = new WebSocket(`ws://localhost:3000`);
    socket.onopen = () => {
      console.log('WebSocket connected');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'metrics') {
        setMetrics((prev) => [data.payload, ...prev.slice(0, 99)]);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
    };

    return () => {
      if (socket) socket.close();
    };
  }, [token]);

  useEffect(() => {
    if (metrics.length > 0) {
      const ctx = document.getElementById('metricsChart');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: metrics.map((metric) => new Date(metric.timestamp).toLocaleTimeString()),
            datasets: [
              {
                label: 'CPU Usage (%)',
                data: metrics.map((metric) => metric.cpu_usage),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
              },
              {
                label: 'Memory Usage (%)',
                data: metrics.map((metric) => metric.memory_usage),
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                tension: 0.1,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
  }, [metrics]);

  return (
    <div className="dashboard">
      <h1>Homelab Monitoring Dashboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="chart-container">
          <canvas id="metricsChart"></canvas>
          <div className="containers">
            <h2>Docker Containers</h2>
            <ul>
              {containers.map((container) => (
                <li key={container.Id}>{container.Names[0]}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;