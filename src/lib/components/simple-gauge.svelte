<script lang="ts">
	export type SimpleGaugeProps = {
		value: number;
		max: number;
		label: String;
		display: { val: string; unit: string };
	};
	let props: SimpleGaugeProps = $props();

	// The gauge is a 220-degree arc.
	// We start at 220 and subtract the progress.
	let ratio = $derived(props.value / props.max);
	let dashOffset = $derived(220 - (props.value / props.max) * 220);
</script>

<div class="relative flex flex-1 flex-col items-center justify-center">
	<h2 class="text-sm font-bold text-primary/70">{props.label}</h2>

	<div class="relative flex h-16 w-16 items-center justify-center">
		<svg class="rotate-[-215deg] transform" viewBox="0 0 120 120">
			<circle
				class="text-primary/15"
				stroke="currentColor"
				stroke-width="12"
				fill="none"
				cx="60"
				cy="60"
				r="50"
				stroke-dasharray="220 360"
				stroke-linecap="round"
			/>

			<circle
				stroke="currentColor"
				stroke-width="12"
				fill="none"
				cx="60"
				cy="60"
				r="50"
				stroke-dasharray="220 360"
				stroke-dashoffset={dashOffset}
				stroke-linecap="square"
				class="text-accent transition-all duration-500 ease-out"
			/>
		</svg>

		<div class="absolute flex flex-col items-center justify-center">
			<span class="leading-none font-bold">{props.display.val}</span>
			<span class="text-xs leading-none">{props.display.unit}</span>
		</div>
	</div>
</div>
