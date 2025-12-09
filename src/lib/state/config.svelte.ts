import { SIMULATED_DATA_URL } from '$lib/utils/libre-hardware';
import { v7 } from 'uuid';

export type Device = {
	url: string;
	id: string;
	name?: string;
};

export function genBlankDevice(): Device {
	return {
		url: 'http://localhost:8085/data.json',
		id: v7()
	};
}

export function getDevicesLS(): Device[] {
	try {
		let devices = localStorage.getItem('devices');
		if (!devices) {
			return [genBlankDevice()];
		}

		let parsed = JSON.parse(devices);
		return parsed;
	} catch (e) {
		console.error('Failed parsing LocalStorage item with key="devices". Clearing entry...');
		localStorage.removeItem('devices');
		return [genBlankDevice()];
	}
}

class ConfigState {
	selectedDevice: Device | null = $state(null);
	devices: Device[] = $state([]);

	constructor() {
		this.devices = getDevicesLS();
		let selectedDeviceId = localStorage.getItem('selected-device-id');
		this.selectedDevice = this.devices.find((d) => d.id === selectedDeviceId) || null;
	}

	updateDevice(updated: Device) {
		let existing = this.devices.find((d) => d.id === updated.id);

		if (!existing) {
			return this.addDevice(updated);
		}

		existing.url = updated.url;
		existing.id = updated.id;
		existing.name = updated.name;
		localStorage.setItem('devices', JSON.stringify(this.devices));
	}

	addDevice(device: Device) {
		this.devices.push(device);
		localStorage.setItem('devices', JSON.stringify(this.devices));
	}

	removeDevice(idToRemove: string) {
		this.devices = this.devices.filter((d) => d.id !== idToRemove);
		localStorage.setItem('devices', JSON.stringify(this.devices));
	}

	setSelectedDevice(device: Device | null) {
		this.selectedDevice = device;
		if (!device) {
			localStorage.removeItem('selected-device-id');
		} else {
			localStorage.setItem('selected-device-id', device.id);
		}
	}

	showSimulated() {
		this.selectedDevice = {
			url: SIMULATED_DATA_URL,
			id: v7()
		};
	}
}

export const configState = new ConfigState();
