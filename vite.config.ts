import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';

import { loadEnv, type UserConfig } from 'vite';

export default defineConfig((config) => {
	const dotEnv = loadEnv(config.mode, process.cwd(), 'VITE_');
	const userConfig = <UserConfig>{
		plugins: [tailwindcss(), sveltekit()],
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
