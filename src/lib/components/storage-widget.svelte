<script lang="ts">
	import type { HDDInfo } from '$lib/utils/libre-hardware';
	import type { RestProps } from '$lib/utils/types';
	import { formatThroughput } from '$lib/utils/units';
	import { twMerge } from 'tailwind-merge';
	import type { TerminalProps } from './terminal.svelte';
	import WidgetTitle from './widget-title.svelte';
	import Terminal from './terminal.svelte';

	export type StorageWidgetProps = {
		hdds: HDDInfo[];
	} & RestProps;

	let { hdds, ...restProps }: StorageWidgetProps = $props();
	let { activeHDD, terminalLines } = $derived.by(() => {
		let activeHDD = hdds.sort(
			(a, b) => b.load.totalAcitivy.current.val - a.load.totalAcitivy.current.val
		)[0];

		let read = formatThroughput(activeHDD.throughput.read.current);
		let readPercentage =
			(activeHDD.throughput.read.current.val / activeHDD.throughput.read.max.val) * 100;
		let write = formatThroughput(activeHDD.throughput.write.current);
		let writePercentage =
			(activeHDD.throughput.write.current.val / activeHDD.throughput.write.max.val) * 100;
		let usedSpace = activeHDD.load.usedSpace.current.val;
		let totalActivity = activeHDD.load.totalAcitivy.current.val;
		let temp = activeHDD.temperature.current.val;
		let tempPercentage = (activeHDD.temperature.current.val / activeHDD.temperature.max.val) * 100;

		let terminalLines: TerminalProps['lines'] = [
			[`Read: ${read.val} ${read.unit}`, Math.round(readPercentage) + '%'],
			[`Write: ${write.val} ${write.unit}`, Math.round(writePercentage) + '%'],
			[`Used Space`, Math.round(usedSpace) + '%'],
			[`Total Activity`, Math.round(totalActivity) + '%'],
			[`Temp: ${Math.round(temp)} °C`, Math.round(tempPercentage) + '%']
		];

		return { activeHDD, terminalLines };
	});
</script>

<div class={twMerge('flex flex-col gap-2', restProps.class)}>
	<WidgetTitle title="Storage" subtitle={activeHDD.name} />
	<div class="flex h-full flex-col">
		<Terminal lines={terminalLines} />
	</div>
</div>
