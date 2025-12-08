<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
		onRegistered(r) {
			// uncomment following code if you want check for updates
			// r && setInterval(() => {
			//   console.log('Checking for sw update')
			//   r.update()
			// }, 20000 /* 20s for testing purposes */)
			console.log(`SW Registered: ${r}`);
		},
		onRegisterError(error) {
			console.log('SW registration error', error);
		}
	});
	const close = () => {
		offlineReady.set(false);
		needRefresh.set(false);
	};
	$: toast = $offlineReady || $needRefresh;
</script>

{#if toast}
	<div
		class="fixed right-0 bottom-0 z-10 m-2 border border-primary bg-base p-2 text-primary"
		role="alert"
	>
		<div class="mb-2">
			{#if $offlineReady}
				<span> App ready to work offline </span>
			{:else}
				<span> New content available, click on reload button to update. </span>
			{/if}
		</div>
		{#if $needRefresh}
			<button
				class="mr-1 border border-accent p-1 text-accent"
				on:click={() => updateServiceWorker(true)}
			>
				Reload
			</button>
		{/if}
		<button class="mr-1 border border-accent p-1 text-accent" on:click={close}> Close </button>
	</div>
{/if}
