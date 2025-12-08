<script lang="ts">
	import { fetchJson } from '$lib/utils/fetch';
	import { createQuery } from '@tanstack/svelte-query';
	import { transformToSnapshot, type LhmPayload } from '$lib/utils/libre-hardware';
	import CpuWidget from '$lib/components/cpu-widget.svelte';
	import Header from '$lib/components/header.svelte';
	import MemoryWidget from '$lib/components/memory-widget.svelte';
	import GpuWidget from '$lib/components/gpu-widget.svelte';
	import NetworkWidget from '$lib/components/network-widget.svelte';
	import StorageWidget from '$lib/components/storage-widget.svelte';
	import { configState, type Device } from '$lib/state/config.svelte';

	let props: { device: Device } = $props();

	const hwQuery = createQuery(() => ({
		queryKey: [`libre-hardware-${props.device.url}`],
		queryFn: () => fetchJson<LhmPayload>(props.device.url, { timeout: 1000 }),
		refetchInterval: (query) => {
			if (query.state.status === 'error') {
				return false;
			}

			return 3000;
		},
		select(lhm) {
			const snapshot = transformToSnapshot(lhm);
			return snapshot;
		}
	}));

	function editConfig() {
		configState.setSelectedDevice(null);
	}
</script>

<div class="flex h-full justify-center">
	{#if hwQuery.isLoading}
		Loading...
	{:else if hwQuery.isError}
		<div class="m-2 flex flex-col gap-2 border p-2 text-xs">
			<div>Error fetching LibreHardware stats from {props.device.url}</div>
			<div class="bg-primary/20 p-2">> {hwQuery.error}</div>
			<div class="flex justify-end">
				<button class="border p-1" onclick={editConfig}>Edit Config</button>
			</div>
		</div>
	{:else if hwQuery.data}
		{@const { cpu, gpus, memoryTotal, networks, name: deviceName, hdds } = hwQuery.data}

		<div class="grid h-full min-h-0 max-w-4xl grid-cols-12 grid-rows-12 gap-1 p-2">
			<CpuWidget {cpu} class="col-span-12 row-span-3 flex flex-col">
				<Header deviceName={props.device.name || deviceName} />
			</CpuWidget>
			<MemoryWidget memory={memoryTotal} class="col-span-2 row-span-6" />
			<GpuWidget gpu={gpus[0]} class="col-span-10 row-span-6" />
			<NetworkWidget {networks} class="col-span-6 row-span-3 pr-1" />
			<StorageWidget {hdds} class="col-span-6 row-span-3 pl-1" />
		</div>
	{/if}
</div>
