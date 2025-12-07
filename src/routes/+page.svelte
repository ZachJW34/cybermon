<script lang="ts">
	import HardwareMonitor from '$lib/components/hardware-monitor.svelte';
	import { configState } from '$lib/state/config.svelte';
	import Config from '$lib/components/config.svelte';

	let device = $derived(configState.devices.find((d) => d.id === configState.selectedDeviceId));
</script>

{#if !device}
	<Config />
{:else}
	<HardwareMonitor {device} />
{/if}
