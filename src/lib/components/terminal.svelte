<script lang="ts">
	import { untrack } from 'svelte';

	export type TerminalProps = {
		lines: [string, string][];
	};

	let props: TerminalProps = $props();
	let trackingIdxs = $state(Array.from({ length: props.lines.length }).fill(0) as number[]);
	let randomNums = $state(
		Array.from({ length: props.lines.length }).map(() => Math.round(Math.random() * 100))
	);

	let visibleLines = $state(props.lines);
	let updateCounter = 0;

	$effect(() => {
		const newValue = props.lines;

		updateCounter += 1;

		if (updateCounter % 2 !== 0) {
			visibleLines = newValue;
		}
	});

	$effect(() => {
		const lines = visibleLines;

		let interval: number;
		untrack(() => {
			trackingIdxs = Array.from({ length: lines.length }).fill(0) as number[];
			let count = -1;
			interval = setInterval(() => {
				count++;
				if (count % 4 === 0) {
					randomNums = Array.from({ length: lines.length }).map(() =>
						Math.round(Math.random() * 100)
					);
				}

				for (let i = 0; i < props.lines.length; i++) {
					let [left] = props.lines[i];

					if (trackingIdxs[i] < left.length) {
						trackingIdxs[i]++;
						return;
					}
				}

				clearInterval(interval);
			}, 25);
		});

		return () => clearInterval(interval);
	});
</script>

<div
	class="flex flex-1 border-t-4 border-b-4 border-l-4 border-primary/30 bg-base pl-1 text-xs font-bold"
>
	<div class="my-1 flex-1 text-accent">
		{#each visibleLines as [left], idx}
			<div>{left.slice(0, trackingIdxs[idx])}</div>
		{/each}
	</div>
	<div class="my-1 flex h-full w-9 flex-col items-end bg-primary px-1 text-base">
		{#each visibleLines as [left, right], idx}
			<div class="text-xs">
				{left.length > trackingIdxs[idx] ? `${randomNums[idx]}%` : right}
			</div>
		{/each}
	</div>
</div>
