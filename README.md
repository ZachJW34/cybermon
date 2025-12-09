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
4. Take note of host IP address. Will be used to link the frontend to this device.

> Note: Though LibreHardwareMonitor's UI can be found by visiting `http://<host-ip>:8085`, the API the frontend uses is `http://<host-ip>:8085/data.json`. The latter is what is used by CyberMon.

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Development Server

```bash
pnpm run dev
```

### 3. Configure Devices

1. Visit `http://localhost:5173`
2. Add devices to config screen:
   - URL: The LHM API for your specific device. Will be of the format `http://<host-ip>:8085/data.json`
   - Device: Optional display name used in the top right corner when the device is selected.
3. Hit "Select" on a configured device and enjoy!

## Contributing

LibreHardwareMonitor is an awesome application, but the formatting of the sensors is a bit machine specific. Hopefully I've made it generic enough to pick up on the proper sensors for your device, but if not and you're having problems then feel free to open an issue or contribute a PR! If you have any cool ideas or UI tweaks, again feel free to contribute and I'll consider adding them in.
