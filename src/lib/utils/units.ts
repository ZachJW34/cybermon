import { BYTES_THRESHOLD, type SensorReading, type SensorValue } from './libre-hardware';

export function formatThroughput(sr: SensorReading): { val: string; unit: string } {
	if (sr.unit === 'KB/s' && sr.val >= 999) {
		sr.val = sr.val / BYTES_THRESHOLD;
		sr.unit = 'MB/s';
	}

	if (sr.val < 10) {
		return { val: sr.val.toFixed(1), unit: sr.unit };
	}

	return { val: sr.val.toFixed(), unit: sr.unit };
}
