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
	selectedDeviceId: string | null = $state(null);
	devices: Device[] = $state([]);

	constructor() {
		this.selectedDeviceId = localStorage.getItem('selected-device-id');
		this.devices = getDevicesLS();
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

	setSelectedDevice(id: string | null) {
		this.selectedDeviceId = id;
		if (!id) {
			localStorage.removeItem('selected-device-id');
		} else {
			localStorage.setItem('selected-device-id', id);
		}
	}
}

export const configState = new ConfigState();
