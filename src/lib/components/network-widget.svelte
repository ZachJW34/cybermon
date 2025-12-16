<script lang="ts">
	import type { NetworkInfo } from '$lib/utils/libre-hardware';
	import type { RestProps } from '$lib/utils/types';
	import { formatThroughput } from '$lib/utils/units';
	import { twMerge } from 'tailwind-merge';
	import SimpleGauge from './simple-gauge.svelte';
	import WidgetTitle from './widget-title.svelte';

	export type NetworkWidgetProps = {
		networks: NetworkInfo[];
	} & RestProps;

	let { networks, ...restProps }: NetworkWidgetProps = $props();
	let activeNetwork = $derived.by(() => {
		let active = networks.sort(
			(a, b) => b.throughput.downloadSpeed.max.val - a.throughput.downloadSpeed.max.val
		)[0];

		return active;
	});
</script>

<div class={twMerge('flex flex-col', restProps.class)}>
	<WidgetTitle title="Network" subtitle={activeNetwork.name} />
	<div class="flex w-full flex-1 flex-col justify-center">
		<div class="mt-2 flex flex-1 items-center justify-center gap-4">
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
				<div class="h-full flex-1 border border-primary/50 bg-base">
					<div
						class="h-full bg-accent transition-[width] duration-3000"
						style="width: {activeNetwork.utilization.current.val}%"
					></div>
				</div>
			</div>
		</div>
	</div>
</div>
