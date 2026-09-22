import { spawn, spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const basePath = '/nautilus-ceramica';
const host = process.env.E2E_HOST ?? '127.0.0.1';
const port = Number(process.env.E2E_PORT ?? 4173);
const externalBaseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, '');

async function routeFiles(directory, relative = '') {
	const routes = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const current = path.join(directory, entry.name);
		const relativePath = relative ? path.join(relative, entry.name) : entry.name;
		if (entry.isDirectory()) {
			routes.push(...(await routeFiles(current, relativePath)));
			continue;
		}
		if (entry.name === 'index.html') {
			const route = relative ? `/${relative.replaceAll(path.sep, '/')}/` : '/';
			routes.push(route);
		} else if (entry.name === '404.html' && !relative) {
			routes.push('/404.html');
		}
	}
	return routes;
}

async function waitForServer(url) {
	const deadline = Date.now() + 30_000;
	while (Date.now() < deadline) {
		try {
			const response = await fetch(url);
			if (response.ok) return;
		} catch {
			// The preview process may need a few seconds to bind its port.
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	throw new Error(`E2E server did not become ready at ${url}`);
}

function startPreview() {
	if (externalBaseUrl) return null;
	const windows = process.platform === 'win32';
	const command = windows ? (process.env.ComSpec ?? 'cmd.exe') : 'pnpm';
	const args = windows
		? ['/d', '/s', '/c', `pnpm preview --host ${host} --port ${port} --strictPort`]
		: ['preview', '--host', host, '--port', String(port), '--strictPort'];
	const child = spawn(command, args, {
		cwd: root,
		stdio: ['ignore', 'pipe', 'pipe'],
		env: { ...process.env, CI: 'true' },
	});
	child.stdout.on('data', (chunk) => process.stdout.write(`[preview] ${chunk}`));
	child.stderr.on('data', (chunk) => process.stderr.write(`[preview] ${chunk}`));
	return child;
}

function stopPreview(child) {
	if (!child || child.exitCode !== null) return;
	if (process.platform === 'win32') {
		spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
	} else {
		child.kill('SIGTERM');
	}
}

function fail(message) {
	throw new Error(message);
}

const routes = (await routeFiles(dist)).sort();
if (!routes.length) fail('No prerendered routes found in dist/. Run pnpm build first.');

const origin = externalBaseUrl ?? `http://${host}:${port}`;
const preview = startPreview();
const browser = await chromium.launch({ headless: true });
const viewports = [
	{ name: 'mobile', width: 390, height: 844 },
	{ name: 'desktop', width: 1440, height: 1000 },
];
const knownUrls = new Set(routes.map((route) => `${basePath}${route === '/' ? '/' : route}`));
const failures = [];
let checks = 0;

try {
	await waitForServer(`${origin}${basePath}/`);
	for (const viewport of viewports) {
		for (const route of routes) {
			const urlPath = `${basePath}${route === '/' ? '/' : route}`;
			const url = `${origin}${urlPath}`;
			const page = await browser.newPage({ viewport });
			const consoleErrors = [];
			const pageErrors = [];
			const failedRequests = [];
			const badResponses = [];
			page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
			page.on('pageerror', (error) => pageErrors.push(error.message));
			page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`));
			page.on('response', (response) => {
				if (response.status() >= 400 && !response.url().includes('/favicon')) badResponses.push(`${response.status()} ${response.url()}`);
			});

			try {
				const response = await page.goto(url, { waitUntil: 'networkidle' });
				if (!response || response.status() >= 400) fail(`HTTP ${response?.status() ?? 'no response'}`);
				await page.evaluate(async () => {
					window.scrollTo(0, document.body.scrollHeight);
					await new Promise((resolve) => setTimeout(resolve, 100));
					window.scrollTo(0, 0);
				});
				const data = await page.evaluate(() => ({
					title: document.title.trim(),
					lang: document.documentElement.lang,
					mainText: document.querySelector('main')?.textContent?.trim() ?? '',
					hasNotFound: Boolean(document.querySelector('.not-found')),
					canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
					images: [...document.images].map((image) => ({ src: image.currentSrc || image.src, width: image.naturalWidth })),
					internalLinks: [...document.querySelectorAll('a[href]')]
						.map((anchor) => anchor.getAttribute('href') ?? '')
						.filter((href) => href.startsWith('/nautilus-ceramica/')),
				}));
				checks += 1;
				if (!data.title) fail('document title is empty');
				if (!['ca', 'es', 'en'].includes(data.lang)) fail(`unexpected html lang: ${data.lang}`);
				if (data.mainText.length < 20) fail(`main content is too short (${data.mainText.length} chars)`);
				if (route !== '/404.html' && !data.canonical) fail('canonical link is missing');
				if (route !== '/404.html' && data.hasNotFound) fail('unexpected NotFound page');
				const brokenImages = data.images.filter((image) => image.width === 0);
				if (brokenImages.length) fail(`broken images: ${brokenImages.map((image) => image.src).join(', ')}`);
				const unknownLinks = data.internalLinks.filter((href) => !knownUrls.has(new URL(href, url).pathname));
				if (unknownLinks.length) fail(`links to untested routes: ${unknownLinks.join(', ')}`);
				if (consoleErrors.length) fail(`console errors: ${consoleErrors.join(' | ')}`);
				if (pageErrors.length) fail(`page errors: ${pageErrors.join(' | ')}`);
				if (failedRequests.length) fail(`failed requests: ${failedRequests.join(' | ')}`);
				if (badResponses.length) fail(`bad responses: ${badResponses.join(' | ')}`);
				process.stdout.write(`✓ ${viewport.name.padEnd(7)} ${route}\n`);
			} catch (error) {
				failures.push(`${viewport.name} ${route}: ${error.message}`);
				process.stdout.write(`✗ ${viewport.name.padEnd(7)} ${route} — ${error.message}\n`);
			} finally {
				await page.close();
			}
		}
	}
} finally {
	await browser.close();
	stopPreview(preview);
}

process.stdout.write(`\nE2E checked ${checks}/${routes.length * viewports.length} page views (${routes.length} routes × ${viewports.length} viewports).\n`);
if (failures.length) {
	process.stderr.write(`\n${failures.length} E2E failures:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
	process.exitCode = 1;
}
