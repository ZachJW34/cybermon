<script lang="ts">
	import type { CPUInfo } from '$lib/utils/libre-hardware';
	import { twMerge } from 'tailwind-merge';
	import WidgetTitle from './widget-title.svelte';
	import type { RestProps } from '$lib/utils/types';

	export type CPUWidgetProps = {
		cpu: CPUInfo;
	} & RestProps;

	let { cpu, ...restProps }: CPUWidgetProps = $props();

	let cpuCores = $derived.by(() => {
		let coresToShow = cpu.loads.cores.length < 10 ? cpu.loads.cores.length : 10;
		let sorted = cpu.loads.cores.toSorted((a, b) => b.value.current.val - a.value.current.val);

		return sorted.slice(0, coresToShow);
	});
</script>

<div class={twMerge('flex flex-col', restProps.class)}>
	<div class="flex items-center justify-between gap-1 pb-1">
		<WidgetTitle title="CPU" subtitle={cpu.name} class="flex-1" />
		{#if restProps.children}
			{@render restProps.children()}
		{/if}
	</div>

	<div class="flex h-full flex-1 items-end justify-between gap-1 opacity-90">
		{#each cpuCores as core}
			<div class="flex h-full w-full flex-col justify-end border border-primary-800 bg-base">
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
			<span class="text-xs text-primary/70">Temp</span>
		</div>
		<div class="flex w-22 flex-col items-center justify-center border-x border-primary/30">
			<span class="text-lg leading-4 text-accent">
				{Math.round(cpu.loads.main.current.val)}%
			</span>
			<span class="text-xs text-primary/70">Load</span>
		</div>
		<div class="flex w-22 flex-col items-center justify-center border-x border-base">
			<span class="text-lg leading-4 text-accent">
				{Math.round(cpu.power.current.val)}W
			</span>
			<span class="text-xs text-primary/70">Power</span>
		</div>

		<div class="relative col-span-5 flex w-full items-center p-2">
			<div class="absolute -top-2 left-2 z-1 text-xs text-primary/75">
				<span>{(cpu.clocks.main.min.val / 1000).toFixed(1)}GHz</span>
			</div>
			<div class="absolute right-2 -bottom-2 z-1 text-xs text-primary/75">
				<span>{(cpu.clocks.main.max.val / 1000).toFixed(1)}GHz</span>
			</div>
			<div class="absolute -top-2 right-2 z-1 text-xs text-accent">
				<span>Current: {(cpu.clocks.main.current.val / 1000).toFixed(1)}GHz</span>
			</div>

			<div class="relative h-6 w-full border border-primary-800 bg-base">
				<div class="absolute top-1 right-[20%] bottom-1 left-[20%] bg-primary-950"></div>

				<div
					class="absolute top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_rgba(255,165,0,0.8)] transition-[left] duration-3000"
					style="left: {(cpu.clocks.main.current.val / cpu.clocks.main.max.val) * 100}%;"
				></div>
			</div>
		</div>
	</div>
</div>
