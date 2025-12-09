<script lang="ts">
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
		configState.updateDevice(device);
		configState.setSelectedDevice(device);
	}

	function showSimulated() {
		configState.showSimulated();
	}
</script>

<div class="flex justify-center">
	<div class="m-2 flex w-full max-w-4xl flex-col gap-2">
		<div class="flex justify-between border p-2">
			<h1>CyberMon: Config</h1>
		</div>

		<div class="mx-2 flex flex-col gap-2 border p-2">
			<div class="flex w-full justify-between">
				<h2>Devices</h2>
				<button class="border border-primary/575 p-1 text-xs" onclick={addDevice}>Add Device</button
				>
			</div>

			{#if configState.devices.length === 0}
				<div>No devices saved. Click "Add Device" above to configure a new device.</div>
			{/if}

			{#each configState.devices as device, idx}
				{@const nameId = `name-${idx}`}
				{@const urlId = `url-${idx}`}
				<form
					class="flex flex-col gap-2 bg-primary/15 p-2 text-xs"
					onsubmit={(val) => updateDevice(val, device.id)}
				>
					<div class="flex items-baseline gap-1">
						<label class="flex w-12 justify-end" for={urlId}>URL:</label>
						<input
							required
							name="url"
							class="flex-1 border-b border-primary/60 text-xs outline-primary"
							id={urlId}
							value={device.url}
						/>
					</div>
					<div class="flex items-baseline gap-1">
						<label class="flex w-12 justify-end" for={nameId}>Device:</label>
						<input
							name="name"
							class="flex-1 border-b border-primary/60 text-xs outline-primary"
							id={nameId}
							value={device.name}
							placeholder="Optional Display Name"
						/>
					</div>
					<div class="flex justify-end">
						<div class="flex gap-2">
							<button type="submit" class="border border-primary/75 bg-base px-1 text-xs"
								>Select</button
							>
							<button
								type="button"
								class="border border-primary/75 bg-base px-1 text-xs"
								onclick={() => removeDevice(device.id)}>Delete</button
							>
						</div>
					</div>
				</form>
			{/each}
		</div>

		<button class="mx-2 border border-primary/75 p-1" onclick={showSimulated}>
			Preview with Simulated Data
		</button>
	</div>
</div>
