# Homelab Monitoring Dashboard

A self-hosted monitoring dashboard designed for homelab environments. This dashboard provides real-time insights into your homelab infrastructure, including system metrics, network status, and service health.

## Features

- **Real-time Monitoring**: Track CPU, memory, disk usage, and network traffic.
- **Service Health**: Monitor the status of your homelab services (e.g., Plex, Nextcloud, etc.).
- **Customizable Alerts**: Set up alerts for critical events.
- **Easy Setup**: Simple installation and configuration process.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mavasahikona/homelab-monitoring-dashboard.git
   ```
2. Navigate to the project directory:
   ```bash
   cd homelab-monitoring-dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dashboard:
   ```bash
   npm start
   ```

## Usage

After starting the dashboard, access it via `http://localhost:3000` in your browser. Configure the dashboard settings to match your homelab environment.

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js
- **Database**: SQLite (for lightweight storage)
- **Visualization**: Chart.js

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License.