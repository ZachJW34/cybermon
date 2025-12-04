export const BYTES_THRESHOLD = 1024;

export type SensorReading = {
	val: number;
	unit: string;
};

export type SensorValue = {
	min: SensorReading;
	current: SensorReading;
	max: SensorReading;
};

export type Sensor = {
	name: string;
	value: SensorValue;
};

export type CPUInfo = {
	name: string;
	voltage: SensorValue;
	power: SensorValue;
	clocks: {
		main: SensorValue;
		cores: Sensor[];
	};
	temperature: SensorValue;
	loads: {
		main: SensorValue;
		cores: Sensor[];
	};
};

export type MemoryVirtual = {
	load: SensorValue;
	used: SensorValue;
	available: SensorValue;
};

export type MemoryTotal = {
	load: SensorValue;
	used: SensorValue;
	available: SensorValue;
};

export type GPUInfo = {
	name: string;
	power: SensorValue;
	temperature: SensorValue;
	load: SensorValue;
	clocks: {
		core: SensorValue;
		memory: SensorValue;
	};
	fans: Sensor[];
	data: {
		used: SensorValue;
		total: SensorValue;
	};
};

export type HDDInfo = {
	name: string;
	temperature: SensorValue;
	load: {
		usedSpace: SensorValue;
		readActivity: SensorValue;
		writeActivity: SensorValue;
		totalAcitivy: SensorValue;
	};
	data: {
		read: SensorValue;
		written: SensorValue;
	};
	throughput: {
		read: SensorValue;
		write: SensorValue;
	};
};

export type NetworkInfo = {
	name: string;
	data: {
		uploaded: SensorValue;
		downloaded: SensorValue;
	};
	throughput: {
		uploadSpeed: SensorValue;
		downloadSpeed: SensorValue;
	};
	utilization: SensorValue;
};

export type LibreSnapshot = {
	name: string;
	cpu: CPUInfo;
	gpus: GPUInfo[];
	memoryVirtual: MemoryVirtual;
	memoryTotal: MemoryTotal;
	networks: NetworkInfo[];
	hdds: HDDInfo[];
};

interface LhmNode {
	id: number;
	Text: string;
	Min: string;
	Value: string;
	Max: string;
	ImageURL: string;
	Children: LhmNode[];
	HardwareId?: string;
	SensorId?: string;
	Type?: string;
}

export interface LhmPayload {
	id: number;
	Text: string;
	Children: LhmNode[];
}

const parseSensorValue = (min: string, val: string, max: string): SensorValue => {
	const regex = /([\d\.]+)\s*(.*)/;

	const parse = (str: string): SensorReading => {
		const match = str.match(regex);
		if (match) {
			return { val: parseFloat(match[1]), unit: match[2] };
		}
		return { val: 0, unit: '' };
	};

	const minParsed = parse(min);
	const currentParsed = parse(val);
	const maxParsed = parse(max);

	return {
		min: minParsed,
		current: currentParsed,
		max: maxParsed
	};
};

const emptyReading = (): SensorReading => ({ val: 0, unit: '' });

const emptySensor = (): SensorValue => ({
	min: emptyReading(),
	current: emptyReading(),
	max: emptyReading()
});

const findNode = (parent: LhmNode, criteria: string | RegExp): LhmNode | undefined => {
	if (!parent.Children) return undefined;
	return parent.Children.find((child) =>
		typeof criteria === 'string' ? child.Text === criteria : criteria.test(child.Text)
	);
};

const findNodes = (parent: LhmNode, criteria: RegExp): LhmNode[] => {
	if (!parent.Children) return [];
	return parent.Children.filter((child) => criteria.test(child.Text));
};

const getSensorFromCategory = (
	hardware: LhmNode,
	category: string,
	sensorName: string | RegExp
): SensorValue => {
	const catNode = findNode(hardware, category);
	if (!catNode) return emptySensor();
	const sensorNode = findNode(catNode, sensorName);
	return sensorNode
		? parseSensorValue(sensorNode.Min, sensorNode.Value, sensorNode.Max)
		: emptySensor();
};

const mapCpu = (node: LhmNode): CPUInfo => {
	// 1. Voltage: Try to find highly accurate "SVI2 TFN" (Ryzen) first, fallback to "Vcore" or "Core #1"
	let voltNode =
		findNode(findNode(node, 'Voltages')!, /SVI2 TFN/) ||
		findNode(findNode(node, 'Voltages')!, 'Vcore') ||
		findNode(findNode(node, 'Voltages')!, /Core #1/);

	let powerNode =
		findNode(findNode(node, 'Powers')!, 'Package') ||
		findNode(findNode(node, 'Powers')!, 'CPU Package');

	let tempNode =
		findNode(findNode(node, 'Temperatures')!, /Tctl\/Tdie/) ||
		findNode(findNode(node, 'Temperatures')!, 'CPU Package') ||
		findNode(findNode(node, 'Temperatures')!, 'Core');

	const clockCat = findNode(node, 'Clocks');
	const mainClock =
		findNode(clockCat!, /Cores \(Average\)$/) || // Exact match first
		findNode(clockCat!, 'Core #1'); // Fallback

	const coreClocks = clockCat
		? findNodes(clockCat, /Core #\d+$/).map((n) => ({
				name: n.Text,
				value: parseSensorValue(n.Min, n.Value, n.Max)
			}))
		: [];

	let mainClockParsed: SensorValue;
	if (mainClock) {
		mainClockParsed = parseSensorValue(mainClock.Min, mainClock.Value, mainClock.Max);
	} else if (coreClocks.length) {
		mainClockParsed = coreClocks.reduce<SensorValue>((acc, cur) => {
			acc.min.val += cur.value.min.val / coreClocks.length;
			acc.min.unit = cur.value.min.unit;
			acc.current.val += cur.value.current.val / coreClocks.length;
			acc.current.unit = cur.value.current.unit;
			acc.max.val += cur.value.max.val / coreClocks.length;
			acc.max.unit = cur.value.max.unit;
			return acc;
		}, emptySensor());
	} else {
		mainClockParsed = emptySensor();
	}

	const loadCat = findNode(node, 'Load');
	const mainLoad = findNode(loadCat!, 'CPU Total') || findNode(loadCat!, 'Total Activity');
	const coreLoads = loadCat
		? findNodes(loadCat, /Core #\d+/).map((n) => ({
				name: n.Text,
				value: parseSensorValue(n.Min, n.Value, n.Max)
			}))
		: [];

	return {
		name: node.Text,
		voltage: voltNode
			? parseSensorValue(voltNode.Min, voltNode.Value, voltNode.Max)
			: emptySensor(),
		power: powerNode
			? parseSensorValue(powerNode.Min, powerNode.Value, powerNode.Max)
			: emptySensor(),
		temperature: tempNode
			? parseSensorValue(tempNode.Min, tempNode.Value, tempNode.Max)
			: emptySensor(),
		clocks: {
			main: mainClockParsed,
			cores: coreClocks
		},
		loads: {
			main: mainLoad ? parseSensorValue(mainLoad.Min, mainLoad.Value, mainLoad.Max) : emptySensor(),
			cores: coreLoads
		}
	};
};

const mapGpu = (node: LhmNode): GPUInfo => {
	// Fans can be in "Fans" or "Controls" depending on driver, usually "Fans" has RPM
	const fanCat = findNode(node, 'Fans');
	const fans = fanCat
		? fanCat.Children.map((f) => ({
				name: f.Text,
				value: parseSensorValue(f.Min, f.Value, f.Max)
			}))
		: [];

	return {
		name: node.Text,
		power: getSensorFromCategory(node, 'Powers', /Package|Total/),
		temperature: getSensorFromCategory(node, 'Temperatures', 'GPU Core'),
		load: getSensorFromCategory(node, 'Load', 'GPU Core'),
		clocks: {
			core: getSensorFromCategory(node, 'Clocks', 'GPU Core'),
			memory: getSensorFromCategory(node, 'Clocks', 'GPU Memory')
		},
		fans: fans,
		data: {
			used: getSensorFromCategory(node, 'Data', 'D3D Dedicated Memory Used'),
			total: getSensorFromCategory(node, 'Data', 'GPU Memory Total')
		}
	};
};

const mapRam = (node: LhmNode): MemoryTotal => {
	return {
		load: getSensorFromCategory(node, 'Load', 'Memory'),
		used: getSensorFromCategory(node, 'Data', 'Memory Used'),
		available: getSensorFromCategory(node, 'Data', 'Memory Available')
	};
};

const mapHdd = (node: LhmNode): HDDInfo => {
	return {
		name: node.Text,
		temperature: getSensorFromCategory(node, 'Temperatures', 'Temperature'),
		load: {
			usedSpace: getSensorFromCategory(node, 'Load', 'Used Space'),
			readActivity: getSensorFromCategory(node, 'Load', 'Read Activity'),
			writeActivity: getSensorFromCategory(node, 'Load', 'Write Activity'),
			totalAcitivy: getSensorFromCategory(node, 'Load', 'Total Activity')
		},
		data: {
			read: getSensorFromCategory(node, 'Data', 'Data read'),
			written: getSensorFromCategory(node, 'Data', 'Data written')
		},
		throughput: {
			read: normalizeMBPStoKBPS(getSensorFromCategory(node, 'Throughput', 'Read Rate')),
			write: normalizeMBPStoKBPS(getSensorFromCategory(node, 'Throughput', 'Write Rate'))
		}
	};
};

const normalizeMBPStoKBPS = (sv: SensorValue) => {
	for (const sr of Object.values(sv)) {
		if (sr.unit === 'MB/s') {
			sr.val *= BYTES_THRESHOLD;
			sr.unit = 'KB/s';
		}
	}

	return sv;
};

const mapNic = (node: LhmNode): NetworkInfo => {
	return {
		name: node.Text,
		data: {
			uploaded: getSensorFromCategory(node, 'Data', 'Data Uploaded'),
			downloaded: getSensorFromCategory(node, 'Data', 'Data Downloaded')
		},
		throughput: {
			uploadSpeed: normalizeMBPStoKBPS(getSensorFromCategory(node, 'Throughput', 'Upload Speed')),
			downloadSpeed: normalizeMBPStoKBPS(
				getSensorFromCategory(node, 'Throughput', 'Download Speed')
			)
		},
		utilization: getSensorFromCategory(node, 'Load', 'Network Utilization')
	};
};

export const transformToSnapshot = (payload: LhmPayload): LibreSnapshot => {
	const rootComputer = payload.Children[0];

	const snapshot: LibreSnapshot = {
		name: rootComputer.Text,
		cpu: null as any,
		gpus: [],
		memoryVirtual: {
			load: emptySensor(),
			used: emptySensor(),
			available: emptySensor()
		},
		memoryTotal: {
			load: emptySensor(),
			used: emptySensor(),
			available: emptySensor()
		},
		networks: [],
		hdds: []
	};

	if (!rootComputer || !rootComputer.Children) return snapshot;

	for (const hardware of rootComputer.Children) {
		const id = hardware.HardwareId || '';
		const img = hardware.ImageURL || '';

		// CPU (Identified by /cpu path or cpu icon)
		if (id.includes('/cpu') || img.includes('cpu.png')) {
			snapshot.cpu = mapCpu(hardware);
		}

		// GPU (Identified by /gpu or nvidia/amd icon)
		else if (id.includes('/gpu') || img.includes('nvidia.png') || img.includes('ati.png')) {
			snapshot.gpus.push(mapGpu(hardware));
		}

		// RAM - Total Physical
		else if (id === '/ram' || (img.includes('ram.png') && hardware.Text === 'Total Memory')) {
			snapshot.memoryTotal = mapRam(hardware);
		}

		// RAM - Virtual
		else if (id === '/vram' || hardware.Text === 'Virtual Memory') {
			snapshot.memoryVirtual = mapRam(hardware);
		}

		// Storage (NVMe / HDD)
		else if (id.includes('/nvme') || id.includes('/hdd') || img.includes('hdd.png')) {
			snapshot.hdds.push(mapHdd(hardware));
		}

		// Network (NIC) - Exclude specific ones if needed, currently taking all
		else if (id.includes('/nic') || img.includes('nic.png')) {
			snapshot.networks.push(mapNic(hardware));
		}
	}

	return snapshot;
};
