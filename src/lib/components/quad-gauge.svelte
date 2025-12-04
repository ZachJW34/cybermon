<script lang="ts">
	import type { Vec4 } from '$lib/utils/types';
	import { twMerge } from 'tailwind-merge';

	export type QuadGaugeValue = {
		label: string;
		value: number;
		max: number;
		display: string;
	};

	let {
		values,
		strokeWidth = 6,
		...restProps
	}: {
		values: Vec4<QuadGaugeValue>;
		strokeWidth?: number;
		[key: string]: any;
	} = $props();

	// 1. Coordinate System
	// Viewbox centered at 0,0
	const vWidth = 150;
	const vHeight = 110;
	const viewbox = `${-vWidth / 2} ${-vHeight / 2} ${vWidth + 5} ${vHeight}`;

	// 2. Constants for 45 Degree Lock
	// We use exactly 45 degrees for that clean diagonal look.
	const angle = 45;
	const radian = (angle * Math.PI) / 180;
	const dx = Math.cos(radian); // ~0.707
	const dy = Math.sin(radian); // ~0.707

	// How far out the line extends from the center (0,0)
	const lineLength = 60;

	let rings = $derived([
		// Top Left
		{
			radius: 40,
			duration: '20s',
			direction: 'normal',
			gVal: values[0],
			corner: { x: -1, y: -1 }
		},
		// Top Right
		{
			radius: 30,
			duration: '25s',
			direction: 'reverse',
			gVal: values[1],
			corner: { x: 1, y: -1 }
		},
		// Bottom Right
		{
			radius: 20,
			duration: '15s',
			direction: 'normal',
			gVal: values[2],
			corner: { x: 1, y: 1 }
		},
		// Bottom Left
		{
			radius: 10,
			duration: '10s',
			direction: 'normal',
			gVal: values[3],
			corner: { x: -1, y: 1 }
		}
	]);

	function getConnectorCoords(ring: (typeof rings)[0]) {
		const { x: dirX, y: dirY } = ring.corner;

		// Start: Just outside the ring edge
		const startRadius = ring.radius + 4;
		const x1 = dirX * startRadius * dx;
		const y1 = dirY * startRadius * dy;

		// End: Fixed distance
		const x2 = dirX * lineLength * dx;
		const y2 = dirY * lineLength * dy;

		return { x1, y1, x2, y2 };
	}

	let classes = twMerge([
		'relative w-full max-h-full aspect-[155/110] mx-auto flex items-center justify-center',
		restProps.class
	]);
</script>

<div {...restProps} class={classes}>
	<svg
		viewBox={viewbox}
		preserveAspectRatio="xMidYMid meet"
		class="block h-full w-full overflow-visible text-primary"
	>
		{#each rings as ring}
			{@const coords = getConnectorCoords(ring)}

			<line
				x1={coords.x1}
				y1={coords.y1}
				x2={coords.x2}
				y2={coords.y2}
				class="stroke-current stroke-[1px] text-accent"
				stroke-dasharray="3 3"
			/>
			<g transform="translate({coords.x2}, {coords.y2})">
				<text
					x="-1"
					y={ring.corner.y === 1 ? 8 : -2}
					text-anchor="end"
					fill="currentColor"
					class="text-[8px] opacity-60"
				>
					{ring.gVal.label}:
				</text>
				<text
					x="1"
					y={ring.corner.y === 1 ? 8 : -2}
					text-anchor="start"
					fill="currentColor"
					class="font-mono text-[8px]"
				>
					{ring.gVal.display}
				</text>
			</g>
		{/each}

		{#each rings as ring}
			{@const circumference = 2 * Math.PI * ring.radius}
			{@const offset = circumference - (ring.gVal.value / ring.gVal.max) * circumference}

			<g
				style="
          transform-origin: 0px 0px; 
          animation: spin-gauge {ring.duration} linear infinite;
          animation-direction: {ring.direction};
      "
			>
				<circle
					cx="0"
					cy="0"
					r={ring.radius}
					stroke="currentColor"
					stroke-opacity="0.1"
					stroke-width={4}
					fill="none"
					class="text-accent"
				/>
				<circle
					cx="0"
					cy="0"
					r={ring.radius}
					stroke="currentColor"
					fill="none"
					stroke-width={strokeWidth}
					stroke-dasharray={circumference}
					stroke-dashoffset={offset}
					stroke-linecap="butt"
					class="transition-[stroke-dashoffset] duration-3000"
				/>
			</g>
		{/each}
	</svg>
</div>

<style>
	@keyframes -global-spin-gauge {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
