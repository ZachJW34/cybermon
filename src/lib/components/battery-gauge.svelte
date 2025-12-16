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
	<div class="flex justify-between text-xs font-bold text-primary/70">
		<span>{props.label}:</span>
		<span>{props.displayVal}</span>
	</div>

	<div class="flex gap-0.5">
		{#each { length: barCount }, idx}
			<div class="h-4 grow border border-primary/30 transition-[opacity] duration-1000 ease-linear">
				<div
					class={[
						'flex h-full w-full bg-accent transition-[opacity] duration-1000 ease-linear',
						[idx <= numFilled ? 'opacity-100' : 'opacity-0']
					]}
				></div>
			</div>
		{/each}
	</div>
</div>
