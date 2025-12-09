<script lang="ts">
	import type { Memory } from '$lib/utils/libre-hardware';
	import type { RestProps } from '$lib/utils/types';
	import { twMerge } from 'tailwind-merge';
	import WidgetTitle from './widget-title.svelte';

	export type MemoryWidgetProps = {
		memory: Memory;
	} & RestProps;

	let { memory, ...restProps }: MemoryWidgetProps = $props();

	let memorySquaresContainer: HTMLDivElement | undefined = $state();
	let memorySquares: boolean[] = $derived.by(() => {
		if (!memorySquaresContainer) return [];

		return updateGrid(memory, memorySquaresContainer);
	});

	function updateGrid(memory: Memory, memorySquaresContainer: HTMLDivElement) {
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

		return generateRandomMemorySquares(memory, count);
	}

	function generateRandomMemorySquares(memory: Memory, length = 100) {
		let ratio = memory.used.current.val / (memory.available.current.val + memory.used.current.val);
		let squares = Array.from({ length }).map(() => Math.random() < ratio);

		return squares;
	}
</script>

<div class={twMerge('flex flex-col items-center gap-1', restProps.class)}>
	<WidgetTitle title="Memory" class="w-full justify-center" />
	<div
		class="flex w-full flex-1 flex-wrap justify-center gap-0.5 overflow-hidden bg-base"
		bind:this={memorySquaresContainer}
	>
		{#each memorySquares as highlighted}
			<div
				class={[
					'h-1 w-1 bg-accent transition-opacity duration-1000 ease-linear',
					{ 'opacity-100': highlighted, 'opacity-30': !highlighted }
				]}
			></div>
		{/each}
	</div>
	<div class="text-xs text-primary">
		{Math.round(memory.used.current.val)}/{Math.round(
			memory.used.current.val + memory.available.current.val
		)} GB
	</div>
</div>
