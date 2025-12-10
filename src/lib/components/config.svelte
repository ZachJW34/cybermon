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
		configState.setSelectedDeviceId(device.id);
	}

	function showSimulated() {
		configState.showSimulated();
	}
</script>

<div class="flex justify-center">
	<div class="m-2 flex w-full max-w-4xl flex-col gap-2 bg-base">
		<div class="flex justify-between border p-2">
			<h1>CyberMon: Config</h1>
		</div>

		<button
			class="mx-2 border border-accent/75 bg-base p-1 text-accent shadow-primary"
			onclick={showSimulated}
		>
			Preview with Simulated Data
		</button>

		<div class="mx-2 flex flex-col gap-2 border border-primary/75 bg-base p-2">
			<div class="flex w-full justify-between">
				<h2>Devices</h2>
				<button class="border border-accent/75 p-1 text-xs text-accent" onclick={addDevice}
					>Add Device</button
				>
			</div>

			{#if configState.devices.value.length === 0}
				<div>No devices saved. Click "Add Device" above to configure a new device.</div>
			{/if}

			{#each configState.devices.value as device, idx}
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
							<button
								type="submit"
								class="border border-accent/75 bg-base px-1 text-xs text-accent"
							>
								Select
							</button>
							<button
								type="button"
								class="border border-accent/75 bg-base px-1 text-xs text-accent"
								onclick={() => removeDevice(device.id)}>Delete</button
							>
						</div>
					</div>
				</form>
			{/each}
		</div>

		<div class="mx-2 flex justify-between border border-primary/75 bg-base p-2">
			<h2>KeepAlive</h2>
			<div class="item-center relative flex h-6 w-12">
				<input
					type="checkbox"
					name="keep-alive"
					class="absolute top-0 right-0 bottom-0 left-0 z-10 cursor-pointer appearance-none"
					bind:checked={configState.keepalive.value}
				/>
				<div
					class={[
						'flex h-full flex-1 p-1',
						[configState.keepalive.value ? 'bg-accent/90' : 'bg-accent/50']
					]}
				>
					<div
						class={[
							'absolute top-1 bottom-1 w-4.5 bg-base transition-[right]',
							configState.keepalive.value ? 'right-[10%]' : 'right-[52%]'
						]}
					></div>
				</div>
			</div>
		</div>
	</div>
</div>
