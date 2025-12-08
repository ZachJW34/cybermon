<script lang="ts">
	import { dev } from '$app/environment';
	import { configState, genBlankDevice, type Device } from '$lib/state/config.svelte';

	function addDevice() {
		const newDevice = genBlankDevice();
		configState.addDevice(newDevice);
	}

	function removeDevice(id: string) {
		configState.removeDevice(id);
	}

	function updateDevice(
		event: SubmitEvent & {
			currentTarget: EventTarget & HTMLFormElement;
		},
		id: string
	) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const device: Device = { ...(Object.fromEntries(formData) as any), id };
		console.log({ device });
		configState.updateDevice(device);
		configState.setSelectedDevice(device.id);
	}
</script>

<div class="m-2 flex flex-col gap-4">
	<div class="flex justify-between border p-2">
		<h1>CyberMon: Config</h1>
		<button class="border border-primary/50 p-1 text-xs" onclick={addDevice}>Add Device</button>
	</div>

	<div class="mb-2 flex flex-col gap-2 p-2">
		{#if configState.devices.length === 0}
			<div>No devices saved. Click "Add Device" above to configure a new device.</div>
		{/if}

		{#each configState.devices as device, idx}
			{@const nameId = `name-${idx}`}
			{@const urlId = `url-${idx}`}
			<form
				class="flex flex-col gap-2 bg-primary/15 p-2"
				onsubmit={(val) => updateDevice(val, device.id)}
			>
				<div class="flex items-baseline gap-1">
					<label class="flex w-18 justify-end" for={urlId}>URL:</label>
					<input
						required
						name="url"
						class="flex-1 border-b text-xs outline-primary"
						id={urlId}
						value={device.url}
					/>
				</div>
				<div class="flex items-baseline gap-1">
					<label class="flex w-18 justify-end" for={nameId}>Device:</label>
					<input
						name="name"
						class="flex-1 border-b text-xs outline-primary"
						id={nameId}
						value={device.name}
						placeholder="Optional Display Name"
					/>
				</div>
				<div class="flex justify-end">
					<div class="flex gap-2">
						<button type="submit" class="border px-1 text-xs">Select</button>
						<button
							type="button"
							class="border px-1 text-xs"
							onclick={() => removeDevice(device.id)}>Delete</button
						>
					</div>
				</div>
			</form>
		{/each}
	</div>
</div>
