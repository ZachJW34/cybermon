import { BYTES_THRESHOLD, type SensorReading, type SensorValue } from './libre-hardware';

export function formatThroughput(sr: SensorReading): { val: string; unit: string } {
	let formatted = structuredClone(sr);
	if (formatted.unit === 'KB/s' && formatted.val >= 999) {
		formatted.val = formatted.val / BYTES_THRESHOLD;
		formatted.unit = 'MB/s';
	}

	if (formatted.val < 10) {
		return { val: formatted.val.toFixed(1), unit: formatted.unit };
	}

	return { val: formatted.val.toFixed(), unit: formatted.unit };
}
