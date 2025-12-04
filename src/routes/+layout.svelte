<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { themeState } from '$lib/state/theme.svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	let { children } = $props();
	const queryClient = new QueryClient();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<main
		class="{themeState.value} bg-grid-pattern relative h-dvh w-dvw bg-base text-primary selection:bg-primary selection:text-base"
	>
		{@render children()}

		<div
			class="crt-overlay pointer-events-none fixed inset-0 z-50 opacity-80 mix-blend-overlay"
		></div>
	</main>
</QueryClientProvider>
