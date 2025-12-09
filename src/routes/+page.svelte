<script lang="ts">
	import HardwareMonitor from '$lib/components/hardware-monitor.svelte';
	import { configState } from '$lib/state/config.svelte';
	import Config from '$lib/components/config.svelte';
</script>

{#if !configState.selectedDevice}
	<Config />
{:else}
	<HardwareMonitor device={configState.selectedDevice} />
{/if}
