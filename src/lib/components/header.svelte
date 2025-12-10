<script lang="ts">
	import { configState } from '$lib/state/config.svelte';
	import { switchTheme } from '$lib/state/theme.svelte';

	export type HeaderProps = {
		deviceName: string;
	};

	function showConfig() {
		configState.setSelectedDeviceId(null);
	}

	let { deviceName }: HeaderProps = $props();
</script>

<div class="flex items-center gap-2 border px-1 text-accent">
	<button onclick={showConfig}>
		<h1>{deviceName}</h1>
	</button>
	<button
		aria-label="change-theme"
		class="relative flex h-8 w-8 items-center justify-center"
		onclick={switchTheme}
	>
		<svg
			class="absolute h-full w-full animate-[spin_4s_linear_infinite] text-accent"
			viewBox="0 0 100 100"
		>
			<circle
				cx="50"
				cy="50"
				r="45"
				stroke="currentColor"
				stroke-width="2"
				fill="none"
				stroke-dasharray="10 10"
			/>
		</svg>

		<svg
			class="absolute h-3/4 w-3/4 animate-[spin_3s_linear_infinite_reverse] text-accent"
			viewBox="0 0 100 100"
		>
			<path d="M50 10 A 40 40 0 0 1 90 50" stroke="currentColor" stroke-width="8" fill="none" />
			<path d="M50 90 A 40 40 0 0 1 10 50" stroke="currentColor" stroke-width="8" fill="none" />
		</svg>

		<div class="h-1 w-1 rounded-full bg-accent"></div>
	</button>
</div>
