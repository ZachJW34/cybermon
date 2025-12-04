<script lang="ts">
	import BatteryGauge, { type BatteryGaugeProps } from '$lib/components/battery-gauge.svelte';
	import QuadGauge, { type QuadGaugeValue } from '$lib/components/quad-gauge.svelte';
	import SimpleGauge from '$lib/components/simple-gauge.svelte';
	import Terminal, { type TerminalProps } from '$lib/components/terminal.svelte';
	import { switchTheme } from '$lib/state/theme.svelte';
	import { fetchJson } from '$lib/utils/fetch';
	import { createQuery } from '@tanstack/svelte-query';
	import { PUBLIC_LIBRE_HARDWARE_API } from '$env/static/public';
	import {
		BYTES_THRESHOLD,
		transformToSnapshot,
		type CPUInfo,
		type GPUInfo,
		type HDDInfo,
		type LhmPayload,
		type MemoryTotal,
		type NetworkInfo
	} from '$lib/utils/libre-hardware';
	import type { Vec4 } from '$lib/utils/types';
	import { formatThroughput } from '$lib/utils/units';
	import WidgetTitle from '$lib/components/widget-title.svelte';

	const hwQuery = createQuery(() => ({
		queryKey: ['libre-hardware'],
		queryFn: () => fetchJson<LhmPayload>(PUBLIC_LIBRE_HARDWARE_API),
		refetchInterval: 3000,
		select(before) {
			const snapshot = transformToSnapshot(before);
			return snapshot;
		}
	}));

	let memorySquaresContainer: HTMLDivElement = $state()!;
	let memorySquares: boolean[] = $state([]);

	function generateRandomMemorySquares(memory: MemoryTotal, length = 100) {
		let ratio = memory.used.current.val / (memory.available.current.val + memory.used.current.val);
		let squares = Array.from({ length }).map(() => Math.random() < ratio);

		return squares;
	}

	function updateGrid() {
		if (!memorySquaresContainer || !hwQuery.data) return;

		let memory = hwQuery.data.memoryTotal;

		const styles = getComputedStyle(memorySquaresContainer);

		let { offsetWidth, offsetHeight } = memorySquaresContainer;

		const squareSize = parseFloat(styles.fontSize) * 0.25; // h-1/w-1 = 0.25rem
		const gap = parseFloat(styles.fontSize) * 0.125; // gap-0.5 = 0.125rem

		const totalSize = squareSize + gap;

		let cols = Math.floor(offsetWidth / totalSize);
		let rows = Math.floor(offsetHeight / totalSize);

		if (offsetWidth - (cols * totalSize - gap) > totalSize) {
			cols++;
		}

		if (offsetHeight - (rows * totalSize - gap) > totalSize) {
			rows++;
		}

		const count = Math.max(0, cols * rows);

		memorySquares = generateRandomMemorySquares(memory, count);
	}

	function rafThrottle(fn: () => void) {
		let frame = 0;

		return () => {
			if (frame) return;

			frame = requestAnimationFrame(() => {
				frame = 0;
				fn();
			});
		};
	}

	$effect(() => {
		if (!memorySquaresContainer || !hwQuery.data?.memoryTotal) return;

		const onResize = rafThrottle(updateGrid);

		const observer = new ResizeObserver(onResize);
		observer.observe(memorySquaresContainer);

		updateGrid(); // initial fill

		return () => observer.disconnect();
	});

	function filterCpuCoreLoads(cpu: CPUInfo) {
		let coresToShow = cpu.loads.cores.length < 10 ? cpu.loads.cores.length : 10;
		let sorted = cpu.loads.cores.toSorted((a, b) => b.value.current.val - a.value.current.val);

		return sorted.slice(0, coresToShow);
	}

	function gpuData(
		gpu: GPUInfo
	): GPUInfo & { quadGauge: Vec4<QuadGaugeValue>; batteryGauges: BatteryGaugeProps[] } {
		let coreClock: QuadGaugeValue = {
			value: gpu.clocks.core.current.val,
			max: gpu.clocks.core.max.val,
			label: 'CCLK',
			display: (gpu.clocks.core.current.val / 1000).toFixed(1) + 'GHz'
		};

		let memoryClock: QuadGaugeValue = {
			value: gpu.clocks.memory.current.val,
			max: gpu.clocks.memory.max.val,
			label: 'MCLK',
			display: (gpu.clocks.memory.current.val / 1000).toFixed(1) + 'GHz'
		};

		let temperature: QuadGaugeValue = {
			value: gpu.temperature.current.val,
			max: gpu.temperature.max.val,
			label: 'Temp',
			display: gpu.temperature.current.val.toFixed(1) + '°C'
		};

		let power: QuadGaugeValue = {
			value: gpu.power.current.val,
			max: gpu.power.max.val,
			label: 'Draw',
			display: gpu.power.current.val.toFixed(1) + 'W'
		};

		let quadGauge: Vec4<QuadGaugeValue> = [coreClock, memoryClock, temperature, power];

		const batteryGauges = [];

		const vramGauge: BatteryGaugeProps = {
			value: gpu.data.used.current.val,
			max: gpu.data.total.current.val,
			label: 'VRAM',
			displayVal: `${(gpu.data.used.current.val / BYTES_THRESHOLD).toFixed(1)} / ${(gpu.data.total.current.val / BYTES_THRESHOLD).toFixed(0)} GB`
		};

		batteryGauges.push(vramGauge);

		return { ...gpu, quadGauge, batteryGauges };
	}

	function pickActiveNetwork(networks: NetworkInfo[]) {
		let active = networks.sort(
			(a, b) => b.throughput.downloadSpeed.max.val - a.throughput.downloadSpeed.max.val
		)[0];

		return active;
	}

	function pickActiveHDD(drives: HDDInfo[]) {
		let active = drives.sort(
			(a, b) => b.load.totalAcitivy.current.val - a.load.totalAcitivy.current.val
		)[0];

		let read = formatThroughput(active.throughput.read.current);
		let readPercentage =
			(active.throughput.read.current.val / active.throughput.read.max.val) * 100;
		let write = formatThroughput(active.throughput.write.current);
		let writePercentage =
			(active.throughput.write.current.val / active.throughput.write.max.val) * 100;
		let usedSpace = active.load.usedSpace.current.val;
		let totalActivity = active.load.totalAcitivy.current.val;
		let temp = active.temperature.current.val;
		let tempPercentage = (active.temperature.current.val / active.temperature.max.val) * 100;

		let terminalLines: TerminalProps['lines'] = [
			[`Read: ${read.val} ${read.unit}`, Math.round(readPercentage) + '%'],
			[`Write: ${write.val} ${write.unit}`, Math.round(writePercentage) + '%'],
			[`Used Space`, Math.round(usedSpace) + '%'],
			[`Total Activity`, Math.round(totalActivity) + '%'],
			[`Temp: ${Math.round(temp)} °C`, Math.round(tempPercentage) + '%']
		];

		return { activeHDD: active, hddTerminalLines: terminalLines };
	}
</script>

<div class="grid h-full min-h-0 grid-cols-12 grid-rows-12 gap-1 p-2">
	{#if hwQuery.isLoading}
		Loading...
	{:else if hwQuery.isError}
		Error
	{:else if hwQuery.data}
		{@const { cpu, gpus, memoryTotal, networks, name: deviceName, hdds } = hwQuery.data}
		{@const cpuCoreLoads = filterCpuCoreLoads(cpu)}
		{@const gpu = gpuData(gpus[0])}
		{@const activeNetwork = pickActiveNetwork(networks)}
		{@const { activeHDD, hddTerminalLines } = pickActiveHDD(hdds)}
		<div class="col-span-12 row-span-3 flex h-full flex-col">
			<div class="flex items-center justify-between gap-1 pb-1">
				<WidgetTitle title="CPU" subtitle={cpu.name} class="flex-1" />
				<div class="flex items-center gap-2">
					<h1 class="border px-1">{deviceName}</h1>
					<button
						aria-label="change-theme"
						class="relative flex h-8 w-8 items-center justify-center"
						onclick={switchTheme}
					>
						<svg
							class="absolute h-full w-full animate-[spin_4s_linear_infinite] text-accent"
							viewBox="0 0 100 100"
						>
							<circle
								cx="50"
								cy="50"
								r="45"
								stroke="currentColor"
								stroke-width="2"
								fill="none"
								stroke-dasharray="10 10"
							/>
						</svg>

						<svg
							class="absolute h-3/4 w-3/4 animate-[spin_3s_linear_infinite_reverse] text-accent"
							viewBox="0 0 100 100"
						>
							<path
								d="M50 10 A 40 40 0 0 1 90 50"
								stroke="currentColor"
								stroke-width="8"
								fill="none"
							/>
							<path
								d="M50 90 A 40 40 0 0 1 10 50"
								stroke="currentColor"
								stroke-width="8"
								fill="none"
							/>
						</svg>

						<div class="h-1 w-1 rounded-full bg-accent"></div>
					</button>
				</div>
			</div>

			<div class="flex h-full flex-1 items-end justify-between gap-1 opacity-90">
				{#each cpuCoreLoads as core}
					<div class="flex h-full w-full flex-col justify-end border border-primary bg-base">
						<div
							class={[
								'w-full bg-accent transition-[height] duration-3000',
								{ 'animate-pulse': core.value.current.val === 100 }
							]}
							style="height: {core.value.current.val}%"
						></div>
					</div>
				{/each}
			</div>

			<div class="mt-4 flex gap-1 text-sm">
				<div class="flex w-22 flex-col items-center justify-center border-x border-base">
					<div class="items-start-safe flex text-lg leading-4 text-accent">
						<span>{Math.round(cpu.temperature.current.val)}</span>
						<span class="inline-flex w-4 -tracking-[0.2em]">°C</span>
					</div>
					<span class="text-xs text-primary/50">Temp</span>
				</div>
				<div class="flex w-22 flex-col items-center justify-center border-x border-primary/30">
					<span class="text-lg leading-4 text-accent">
						{Math.round(cpu.loads.main.current.val)}%
					</span>
					<span class="text-xs text-primary/50">Load</span>
				</div>
				<div class="flex w-22 flex-col items-center justify-center border-x border-base">
					<span class="text-lg leading-4 text-accent">
						{Math.round(cpu.power.current.val)}W
					</span>
					<span class="text-xs text-primary/50">Power</span>
				</div>

				<div class="relative col-span-5 flex w-full items-center p-2">
					<div class="absolute -top-2 left-2 z-1 text-xs text-primary/75">
						<span>{(cpu.clocks.main.min.val / 1000).toFixed(1)}GHz</span>
					</div>
					<div class="absolute right-2 -bottom-2 z-1 text-xs text-primary/75">
						<span>{(cpu.clocks.main.max.val / 1000).toFixed(1)}GHz</span>
					</div>
					<div class="absolute -top-2 right-2 z-1 text-xs text-primary/75">
						<span>Current: {(cpu.clocks.main.current.val / 1000).toFixed(1)}GHz</span>
					</div>

					<div class="relative h-6 w-full border border-primary/30 bg-base">
						<div class="absolute top-1 right-[20%] bottom-1 left-[20%] bg-primary/10"></div>

						<div
							class="absolute top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_rgba(255,165,0,0.8)] transition-[left] duration-3000"
							style="left: {(cpu.clocks.main.current.val / cpu.clocks.main.max.val) * 100}%;"
						></div>
					</div>
				</div>
			</div>
		</div>

		<div class="col-span-2 col-start-1 row-span-6 row-start-4 flex flex-col items-center gap-1">
			<WidgetTitle title="Memory" />
			<div
				class="flex w-full flex-1 flex-wrap justify-center gap-0.5 bg-base"
				bind:this={memorySquaresContainer}
			>
				{#each memorySquares as highlighted}
					<div
						class={[
							'h-1 w-1 bg-accent transition-opacity duration-3000',
							{ 'opacity-100': highlighted, 'opacity-30': !highlighted }
						]}
					></div>
				{/each}
			</div>
			<div class="text-xs text-primary">
				{Math.round(memoryTotal.used.current.val)}/{Math.round(
					memoryTotal.used.current.val + memoryTotal.available.current.val
				)} GB
			</div>
		</div>

		<div class="col-span-10 row-span-6 ml-2 flex flex-col justify-center">
			<WidgetTitle title="GPU" subtitle={gpu.name} class="justify-center" />

			<div class="flex min-h-0 flex-1 flex-col justify-center gap-4">
				<div class="flex min-h-0 w-full items-center justify-center">
					<QuadGauge class="text-accent" values={gpu.quadGauge} />
				</div>
				<div class="flex flex-wrap content-center items-center gap-2">
					{#each gpu.batteryGauges as gauge}
						<div class="grow basis-[47%]">
							<BatteryGauge {...gauge} />
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="col-span-6 row-span-3 flex flex-col pr-1">
			<WidgetTitle title="Network" subtitle={activeNetwork.name} />
			<div class="flex w-full flex-1 flex-col justify-center">
				<div class="mt-2 flex items-center justify-center gap-4">
					<SimpleGauge
						value={activeNetwork.throughput.uploadSpeed.current.val}
						max={activeNetwork.throughput.uploadSpeed.max.val}
						label="Upload"
						display={formatThroughput(activeNetwork.throughput.uploadSpeed.current)}
					/>
					<SimpleGauge
						value={activeNetwork.throughput.downloadSpeed.current.val}
						max={activeNetwork.throughput.downloadSpeed.max.val}
						label="Download"
						display={formatThroughput(activeNetwork.throughput.downloadSpeed.current)}
					/>
				</div>
				<div class="h-10 w-full">
					<div class="flex h-full flex-col">
						<div class="flex w-full justify-between text-sm">
							<span>Utilization</span>
							<span class="font-bold">{activeNetwork.utilization.current.val.toFixed(1)}%</span>
						</div>
						<div class="h-full max-h-8 flex-1 border border-primary/50 bg-base">
							<div
								class="h-full bg-primary transition-[width] duration-3000"
								style="width: {activeNetwork.utilization.current.val}%"
							></div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="col-span-6 row-span-3 flex flex-col gap-2 pl-1">
			<WidgetTitle title="Storage" subtitle={activeHDD.name} />
			<div class="flex h-full flex-col">
				<Terminal lines={hddTerminalLines} />
			</div>
		</div>
	{/if}
</div>
