<script lang="ts">
	import { BYTES_THRESHOLD, type GPUInfo } from '$lib/utils/libre-hardware';
	import type { RestProps, Vec4 } from '$lib/utils/types';
	import { twMerge } from 'tailwind-merge';
	import WidgetTitle from './widget-title.svelte';
	import QuadGauge, { type QuadGaugeValue } from './quad-gauge.svelte';
	import BatteryGauge, { type BatteryGaugeProps } from './battery-gauge.svelte';

	export type GPUWidgetProps = {
		gpu: GPUInfo;
	} & RestProps;

	let { gpu, ...restProps }: GPUWidgetProps = $props();
	let { quadGauge, batteryGauges } = $derived.by(() => {
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

		return { quadGauge, batteryGauges };
	});
</script>

<div class={twMerge('ml-2 flex flex-col justify-center', restProps.class)}>
	<WidgetTitle title="GPU" subtitle={gpu.name} class="justify-center" />

	<div class="flex min-h-0 flex-1 flex-col justify-center gap-4">
		<div class="flex min-h-0 w-full items-center justify-center">
			<QuadGauge class="text-accent" values={quadGauge} />
		</div>
		<div class="flex flex-wrap content-center items-center gap-2">
			{#each batteryGauges as bGauge}
				<div class="grow basis-[47%]">
					<BatteryGauge {...bGauge} />
				</div>
			{/each}
		</div>
	</div>
</div>
