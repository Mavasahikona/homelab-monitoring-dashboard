import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';

const App = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/api/metrics');
        setMetrics(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setError('Failed to load metrics. Please try again later.');
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="chart-container">
          <canvas id="metricsChart"></canvas>
        </div>
      )}
    </div>
  );
};

export default App;