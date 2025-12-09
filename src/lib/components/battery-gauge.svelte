<script lang="ts">
	export type BatteryGaugeProps = {
		value: number;
		max: number;
		label: string;
		displayVal: string;
	};
	let props: BatteryGaugeProps = $props();

	let barCount = 16;
	let numFilled = $derived((props.value / props.max) * barCount);
</script>

<div class="flex w-full flex-col">
	<div class="flex justify-between text-xs font-bold">
		<span>{props.label}:</span>
		<span class="text-primary/70">{props.displayVal}</span>
	</div>

	<div class="flex gap-0.5">
		{#each { length: barCount }, idx}
			<div
				class={[
					'h-4 grow border border-primary/30 transition-[background-color] duration-1000 ease-linear',
					[idx <= numFilled ? 'bg-accent' : 'bg-base']
				]}
			></div>
		{/each}
	</div>
</div>
