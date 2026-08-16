// @ts-check
import { defineConfig } from 'astro/config';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Minimal re-implementation of `@vite-pwa/astro`'s build wiring.
 *
 * Astro 7 builds with Vite's environment API, where the plugin's own
 * `closeBundle` hook (which would run workbox's `generateSW`) is skipped.
 * Instead: keep the plugin's virtual modules + manifest emission, and call
 * `api.generateSW()` from Astro's own `astro:build:done` hook, after the
 * dist folder is fully populated.
 */
function astroPWA(options) {
	let api;

	const plugins = VitePWA(options).filter(
		(p) => 'name' in p && p.name !== 'vite-plugin-pwa:build',
	);

	return {
		name: 'vite-pwa:astro-integration',
		hooks: {
			'astro:config:setup': ({ command, updateConfig }) => {
				let pwaPlugins = plugins;
				if (command === 'build') {
					pwaPlugins = plugins.filter(
						(p) => !('name' in p) || p.name !== 'vite-plugin-pwa:dev-sw',
					);
				}
				if (command === 'build') {
					pwaPlugins = pwaPlugins.concat({
						name: 'vite-pwa:astro:build:plugin',
						// Only run inside the client build pipeline.
						// @ts-expect-error env API is a Vite 5.1+ feature
						applyToEnvironment(env) {
							return env.name === 'client';
						},
						configResolved(resolvedConfig) {
							// Grab the plugin API from the client pipeline so we can
							// emit the manifest there and generate the SW at build:done.
							if (!resolvedConfig.build.ssr) {
								api = resolvedConfig.plugins
									.flat(Number.POSITIVE_INFINITY)
									.find((p) => p.name === 'vite-plugin-pwa')?.api;
							}
						},
						async generateBundle(_, bundle) {
							if (api) {
								api.generateBundle(bundle, this);
							}
						},
					});
				}
				updateConfig({ vite: { plugins: pwaPlugins } });
			},
			'astro:build:done': async () => {
				if (api && !api.disabled) {
					await api.generateSW();
				}
			},
		},
	};
}

// https://astro.build/config
// Netlify sets NETLIFY=true during its builds and serves the site at the
// domain root, so the base must be '/' there. GitHub Pages serves the
// project site under the /nautilus-ceramica base path.
const isNetlify = process.env.NETLIFY === 'true';
const base = isNetlify ? '/' : '/nautilus-ceramica';

export default defineConfig({
	// GitHub Pages project site: https://alsius21.github.io/nautilus-ceramica/
	site: isNetlify && process.env.URL ? process.env.URL : 'https://alsius21.github.io',
	base,
	server: {
		host: true,
		port: 80,
		allowedHosts: ['nautilusceramica.localhost'],
	},
	i18n: {
		locales: ['ca', 'es', 'en'],
		defaultLocale: 'ca',
		routing: {
			// Catalan lives at `/` without a prefix; `/es/` and `/en/` are prefixed.
			prefixDefaultLocale: false,
		},
	},
	integrations: [
		astroPWA({
			// Silently swap in new SW builds when the site is redeployed.
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'favicon.png'],
			// We register the SW ourselves from src/pwa.ts via the
			// virtual:pwa-register module; skip auto-injected scripts.
			injectRegister: false,
			manifest: {
				name: 'NautilusCeramica',
				short_name: 'NautilusCeramica',
				description:
					'Ceràmica artesanal de Zara Castillo Martínez. Peces úniques fetes a mà, del taller a l’exposició.',
				// Relative to the manifest URL, so they resolve to the base
				// path on GitHub Pages (start_url '.' -> /nautilus-ceramica/).
				start_url: '.',
				scope: '.',
				lang: 'ca',
				display: 'standalone',
				background_color: '#eee9e1',
				theme_color: '#eee9e1',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'pwa-maskable-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
			workbox: {
				// Precache every static asset: the three locale pages, CSS/JS,
				// the webp artworks, fonts (woff2) and the favicons.
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
				cleanupOutdatedCaches: true,
			},
		}),
	],
});