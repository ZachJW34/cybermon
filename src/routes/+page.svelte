<script lang="ts">
	import HardwareMonitor from '$lib/components/hardware-monitor.svelte';
	import { configState } from '$lib/state/config.svelte';
	import Config from '$lib/components/config.svelte';

	configState.handleKeepAlive();
</script>

{#if !configState.selecteDevice}
	<Config />
{:else}
	<HardwareMonitor device={configState.selecteDevice} />
{/if}
