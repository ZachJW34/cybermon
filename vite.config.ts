import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { loadEnv, type UserConfig } from 'vite';
import { join as pathJoin } from 'node:path';

export default defineConfig((config) => {
	const dotEnv = loadEnv(config.mode, process.cwd(), 'VITE_');
	const userConfig = <UserConfig>{
		plugins: [
			tailwindcss(),
			sveltekit(),
			SvelteKitPWA({
				injectRegister: null,
				registerType: 'prompt',
				kit: {
					adapterFallback: '200.html'
				},
				manifest: {
					name: 'CyberMon',
					short_name: 'CyberMon',
					description: 'Your app description',
					theme_color: '#050505',
					background_color: '#050505',
					display: 'standalone',
					orientation: 'portrait',
					scope: '/',
					start_url: '/',

					icons: [
						{
							src: '/web-app-manifest-192x192.png',
							sizes: '192x192',
							type: 'image/png',
							purpose: 'any maskable'
						},
						{
							src: '/web-app-manifest-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'any maskable'
						}
					]
				},
				includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'favicon-96x96.png']
			})
		],
		test: {
			expect: { requireAssertions: true },
			projects: [
				{
					extends: './vite.config.ts',
					test: {
						name: 'client',
						browser: {
							enabled: true,
							provider: playwright(),
							instances: [{ browser: 'chromium', headless: true }]
						},
						include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
						exclude: ['src/lib/server/**']
					}
				},
				{
					extends: './vite.config.ts',
					test: {
						name: 'server',
						environment: 'node',
						include: ['src/**/*.{test,spec}.{js,ts}'],
						exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
					}
				}
			]
		},
		server: {}
	};

	if (dotEnv.VITE_ALLOWED_HOSTS) {
		userConfig.server!.allowedHosts = JSON.parse(dotEnv.VITE_ALLOWED_HOSTS);
	}

	return userConfig;
});
