<div align="center">

<h1>CyberMon</h1>

<img src="./docs/cybermon.gif" width="50%" alt="CyberMon Demo" />

A futuristic mobile hardware monitoring dashboard.

</div>

## Prerequisites

This project relies on **LibreHardwareMonitor** to fetch system statistics.

1. Download the latest **Nightly Build** of [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor).
2. Run LibreHardwareMonitor on your host machine.
3. Enable the HTTP server inside the application:
   - Go to **Options** > **Remote Web Server** > **Run**
   - _Default port is 8085_

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Development Server

```bash
pnpm run dev
```
