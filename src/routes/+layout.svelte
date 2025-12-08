<script lang="ts">
	import './layout.css';
	import { themeState } from '$lib/state/theme.svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { pwaInfo } from 'virtual:pwa-info';

	let { children } = $props();
	const queryClient = new QueryClient();

	let webManifestLink = $state(pwaInfo ? pwaInfo.webManifest.linkTag : '');
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="shortcut icon" href="/favicon.ico" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<meta name="apple-mobile-web-app-title" content="CyberMon" />
	{@html webManifestLink}
</svelte:head>

<QueryClientProvider client={queryClient}>
	<main
		class="{themeState.value} bg-grid-pattern relative h-dvh w-full overflow-hidden bg-base text-primary selection:bg-primary selection:text-base"
	>
		{@render children()}

		<div
			class="crt-overlay pointer-events-none fixed inset-0 z-50 opacity-80 mix-blend-overlay"
		></div>

		{#await import('$lib/components/reload-prompt.svelte') then { default: ReloadPrompt }}
			<ReloadPrompt />
		{/await}
	</main>
</QueryClientProvider>
