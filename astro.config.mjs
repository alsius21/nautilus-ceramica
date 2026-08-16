// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// GitHub Pages project site: https://alsius21.github.io/nautilus-ceramica/
	site: 'https://alsius21.github.io',
	base: '/nautilus-ceramica',
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
});
