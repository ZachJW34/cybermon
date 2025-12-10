import { SIMULATED_DATA_URL } from '$lib/utils/libre-hardware';
import { v7 } from 'uuid';
import { BooleanTransforms, LocalStorageState, StringTranforms } from './local-storage.svelte';

export type Device = {
	url: string;
	id: string;
	name?: string;
};

class ConfigState {
	selectedDeviceId: LocalStorageState<string | null>;
	devices: LocalStorageState<Device[]>;
	keepalive: LocalStorageState<boolean>;
	selecteDevice: Device | null;

	constructor() {
		this.devices = new LocalStorageState('devices', () => [genBlankDevice()]);
		this.selectedDeviceId = new LocalStorageState('selected', null, StringTranforms);
		this.keepalive = new LocalStorageState('keep-alive', false, BooleanTransforms);
		this.selecteDevice = $derived.by(() => {
			if (!this.selectedDeviceId.value) {
				return null;
			}

			if (this.selectedDeviceId.value === SIMULATED_DATA_URL) {
				return {
					id: SIMULATED_DATA_URL,
					url: SIMULATED_DATA_URL
				};
			}

			return this.devices.value.find((d) => d.id === this.selectedDeviceId.value) || null;
		});
	}

	updateDevice(updated: Device) {
		let existing = this.devices.value.find((d) => d.id === updated.id);

		if (!existing) {
			return this.addDevice(updated);
		}

		this.devices.update(() => {
			existing.url = updated.url;
			existing.id = updated.id;
			existing.name = updated.name;
		});
	}

	addDevice(device: Device) {
		this.devices.update(() => {
			this.devices.value.push(device);
		});
	}

	removeDevice(idToRemove: string) {
		this.devices.value = this.devices.value.filter((d) => d.id !== idToRemove);
	}

	setSelectedDeviceId(deviceId: string | null) {
		this.selectedDeviceId.value = deviceId;
	}

	showSimulated() {
		this.selectedDeviceId.value = SIMULATED_DATA_URL;
	}

	updateKeepAlive(keepalive: boolean) {
		this.keepalive.value = keepalive;
	}

	// Only call within component and only once
	handleKeepAlive() {
		let wakeLock: WakeLockSentinel | null;

		const acquireWakeLock = async () => {
			try {
				console.log('Attempting to acquire WakeLock...');
				wakeLock = await navigator.wakeLock.request('screen');
				console.log('WakeLock acquired!');
				wakeLock.onrelease = () => {
					console.log('WakeLock released!');
					wakeLock = null;
				};
			} catch (e) {
				console.error('Failed to acquire wake lock: ', e);
			}
		};

		document.addEventListener('visibilitychange', async () => {
			if (document.visibilityState === 'visible') {
				await acquireWakeLock();
			}
		});

		$effect(() => {
			if (!this.keepalive.value) {
				if (wakeLock) {
					wakeLock.release();
				}

				return;
			}

			if ('wakeLock' in navigator && !wakeLock) {
				acquireWakeLock();
			}

			return () => wakeLock?.release();
		});
	}
}

export const configState = new ConfigState();

// function getDevicesLS(): Device[] {
// 	try {
// 		let devices = localStorage.getItem('devices');
// 		if (!devices) {
// 			return [genBlankDevice()];
// 		}

// 		let parsed = JSON.parse(devices);
// 		return parsed;
// 	} catch (e) {
// 		console.error('Failed parsing LocalStorage item with key="devices". Clearing entry...');
// 		localStorage.removeItem('devices');
// 		return [genBlankDevice()];
// 	}
// }

export function genBlankDevice(): Device {
	return {
		url: 'http://localhost:8085/data.json',
		id: v7()
	};
}

// function getKeepAliveLS() {
// 	return localStorage.getItem('keep-alive') === 'true';
// }
