<div align="center">

<h1>CyberMon</h1>

<img src="./docs/cybermon.gif" width="50%" alt="CyberMon Demo" />

A futuristic hardware monitoring dashboard built with SvelteKit.

</div>

## Prerequisites

This project relies on **LibreHardwareMonitor** to fetch system statistics.

1. Download the latest **Nightly Build** of [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor).
2. Run LibreHardwareMonitor on your host machine.
3. Enable the HTTP server inside the application:
   - Go to **Options** > **Remote Web Server** > **Run**
   - _Default port is 8085_

## Getting Started

### 1. Configure Environment

Create a `.env` file in the root directory of the project and set the API URL:

```properties
PUBLIC_LIBRE_HARDWARE_API=http://localhost:8085
```

(Replace localhost with your host IP if accessing from a different device)

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run Development Server

```bash
pnpm run dev
```
