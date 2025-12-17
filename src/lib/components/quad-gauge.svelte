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
		class: className,
		...restProps
	}: {
		values: Vec4<QuadGaugeValue>;
		strokeWidth?: number;
		[key: string]: any;
	} = $props();

	const vWidth = 150;
	const vHeight = 110;
	const viewbox = `0 0 ${vWidth} ${vHeight}`;

	const angle = 45;
	const radian = (angle * Math.PI) / 180;
	const dx = Math.cos(radian); // ~0.707
	const dy = Math.sin(radian); // ~0.707

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
			direction: 'reverse',
			gVal: values[3],
			corner: { x: -1, y: 1 }
		}
	]);

	function getConnectorCoords(ring: (typeof rings)[0]) {
		const { x: dirX, y: dirY } = ring.corner;

		const startRadius = ring.radius;
		const x1 = dirX * startRadius * dx;
		const y1 = dirY * startRadius * dy;

		const x2 = dirX * lineLength * dx;
		const y2 = dirY * lineLength * dy;

		return { x1, y1, x2, y2 };
	}

	let classes = twMerge([`flex items-center justify-center aspect-150/110`, className]);
</script>

<div {...restProps} class={classes}>
	<svg
		viewBox={viewbox}
		preserveAspectRatio="xMidYMid meet"
		width="100%"
		height="100%"
		class="block"
	>
		<g transform={`translate(${vWidth / 2} ${vHeight / 2})`}>
			{#each rings as ring}
				{@const coords = getConnectorCoords(ring)}

				<line
					x1={coords.x1}
					y1={coords.y1}
					x2={coords.x2}
					y2={coords.y2}
					class="stroke-current stroke-[0.5px] text-primary-900"
					stroke-dasharray="1.5"
				/>

				<g transform="translate({coords.x2}, {coords.y2})">
					<text
						x="-1"
						y={ring.corner.y === 1 ? 8 : -2}
						text-anchor="end"
						fill="currentColor"
						class="text-[8px] text-primary opacity-60"
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
				{@const maxVisible = 0.85}
				{@const offset =
					circumference - (ring.gVal.value / ring.gVal.max) * (circumference * maxVisible)}

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
						stroke-width="0.5"
						fill="none"
						class="text-primary-950"
						style="animation: pulse-stroke 3s ease-in-out infinite;"
					/>
					<circle
						cx="0"
						cy="0"
						r={ring.radius}
						stroke="currentColor"
						stroke-width={4}
						fill="none"
						class="text-primary-950"
						stroke-linecap="butt"
						stroke-dasharray={circumference}
						stroke-dashoffset={circumference * (1 - maxVisible)}
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
		</g>
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

	@keyframes -global-pulse-stroke {
		0%,
		100% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
	}
</style>
