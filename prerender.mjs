import { readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { render } from './src/ssr.tsx';
import { metaFor, renderHead } from './src/seo.ts';
import { exhibitions, getSlug, works } from './src/lib/content.ts';
import { locales, t } from './src/i18n/index.ts';

const root = path.resolve('dist');
const base = '/nautilus-ceramica/';
const manifest = JSON.parse(await readFile(path.join(root, '.vite', 'manifest.json'), 'utf8'));
const entry = manifest['index.html'];
const js = `${base}${entry.file}`;
const css = entry.css?.map((file) => `${base}${file}`) ?? [`${base}assets/index.css`];

function localizedPrefix(locale) { return locale === 'ca' ? '' : `/${locale}`; }
function addRoute(routes, route) {
	if (route.endsWith('.html')) routes.add(route);
	else routes.add(`${route.replace(/\/+$/, '') || ''}/`);
}
function aliases(work, locale) { return new Set([getSlug(work, locale), work.id]); }
function generateRoutes() {
	const routes = new Set(['/','/404.html']);
	for (const locale of locales) {
		const prefix = localizedPrefix(locale);
		addRoute(routes, prefix || '/');
		for (const key of ['gallery.path', 'exhibitions.path', 'about.path', 'legal.path', 'cookie.path', 'shop.path']) {
			addRoute(routes, `${prefix}/${t(locale, key)}`);
		}
		addRoute(routes, `${prefix}/${t(locale, 'order.path')}/${t(locale, 'shop.contact.path')}`);
		for (const work of works) {
			for (const slug of aliases(work, locale)) addRoute(routes, `${prefix}/${t(locale, 'gallery.path')}/${slug}`);
			if (work.shop.available) {
				for (const slug of aliases(work, locale)) addRoute(routes, `${prefix}/${t(locale, 'shop.path')}/${t(locale, 'shop.article.path')}/${slug}`);
			}
		}
		for (const exhibition of exhibitions) addRoute(routes, `${prefix}/${t(locale, 'exhibitions.path')}/${exhibition.slug}`);
	}
	return [...routes].sort();
}

// The route list is derived from the React content source.
const routes = generateRoutes();

async function copyTree(from, to) {
	await mkdir(to, { recursive: true });
	for (const item of await readdir(from, { withFileTypes: true })) {
		const src = path.join(from, item.name);
		const dst = path.join(to, item.name);
		if (item.isDirectory()) await copyTree(src, dst);
		else await copyFile(src, dst);
	}
}

const dimensionCache = new Map();
async function dimensions(image) {
	if (!image) return {};
	if (dimensionCache.has(image)) return dimensionCache.get(image);
	let value = {};
	try {
		const metadata = await sharp(path.join('public', image)).metadata();
		value = { imageWidth: metadata.width, imageHeight: metadata.height };
	} catch {
		value = {};
	}
	dimensionCache.set(image, value);
	return value;
}

for (const route of routes) {
	const clean = route.replace(/^\/nautilus-ceramica/, '') || '/';
	const html = render(clean);
	const meta = metaFor(clean);
// Work and shop pages receive explicit social image dimensions.
	if (meta.image && (meta.ogType === 'article' || meta.ogType === 'product')) {
		Object.assign(meta, await dimensions(meta.image));
	}
	const head = `${renderHead(meta)}${css.map((href) => `<link rel="stylesheet" href="${href}">`).join('')}`;
	const document = `<!doctype html><html lang="${meta.locale}"><head>${head}</head><body><div id="root">${html}</div><script type="module" src="/${js.replace(/^\//, '')}"></script></body></html>`;
	const relative = route.replace(/^\/nautilus-ceramica\/?/, '');
	if (relative.endsWith('.html')) {
		await writeFile(path.join(root, relative), document);
	} else {
		const folder = path.join(root, relative.replace(/\/$/, ''));
		await mkdir(folder, { recursive: true });
		await writeFile(path.join(folder, 'index.html'), document);
	}
}

await copyTree('public', root);
await mkdir(path.join(root, 'fonts'), { recursive: true });
async function copyFont(primary, fallback, target) {
	try { await copyFile(primary, target); }
	catch { await copyFile(fallback, target); }
}
await copyFont(
  'node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2',
  'node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2',
	path.join(root, 'fonts/fraunces-latin-full-normal.woff2'),
);
await copyFont(
  'node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2',
  'node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2',
	path.join(root, 'fonts/archivo-latin-wght-normal.woff2'),
);

// PWA manifest.
const manifestJson = {
	name: 'nautilusceramica',
	short_name: 'nautilusceramica',
	description: 'Ceràmica artesanal de Zara Castillo Martínez. Peces úniques fetes a mà, del taller a l’exposició.',
	start_url: '.',
	scope: '.',
	lang: 'ca',
	display: 'standalone',
	background_color: '#eee9e1',
	theme_color: '#eee9e1',
	icons: [
		{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
		{ src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
		{ src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
	],
};
await writeFile(path.join(root, 'manifest.webmanifest'), JSON.stringify(manifestJson));

// Sitemap — public route set (404 and editors excluded).
const origin = 'https://alsius21.github.io';
const publicRoutes = routes.filter((route) => !route.endsWith('.html'));
const locs = publicRoutes.map((route) => `${origin}${base}${route.replace(/^\//, '')}`);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${locs.map((loc) => `<url><loc>${loc}</loc></url>`).join('')}</urlset>`;
await writeFile(path.join(root, 'sitemap-0.xml'), sitemap);
await writeFile(
	path.join(root, 'sitemap-index.xml'),
	`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${origin}${base}sitemap-0.xml</loc></sitemap></sitemapindex>`,
);

// Service worker — workbox precache generated after every HTML page exists.
const { generateSW } = await import('workbox-build');
await generateSW({
	globDirectory: root,
	globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
	swDest: path.join(root, 'sw.js'),
	sourcemap: false,
	cleanupOutdatedCaches: true,
	skipWaiting: true,
	clientsClaim: true,
});

console.log(`React prerendered ${routes.length} routes to ${root}`);
