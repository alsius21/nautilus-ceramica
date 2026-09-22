import { expect, test, type Page } from '@playwright/test';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const basePath = '/nautilus-ceramica';
const dist = path.resolve(import.meta.dirname, '../../dist');

async function routeFiles(directory: string, relative = ''): Promise<string[]> {
  const routes: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const current = path.join(directory, entry.name);
    const relativePath = relative ? path.join(relative, entry.name) : entry.name;
    if (entry.isDirectory()) {
      routes.push(...(await routeFiles(current, relativePath)));
    } else if (entry.name === 'index.html') {
      routes.push(relative ? `/${relative.replaceAll(path.sep, '/')}/` : '/');
    } else if (entry.name === '404.html' && !relative) {
      routes.push('/404.html');
    }
  }
  return routes;
}

const routes = (await routeFiles(dist)).sort();
if (!routes.length) {
  throw new Error('No prerendered routes found in dist/. Run pnpm build first.');
}

const knownUrls = new Set(routes.map((route) => `${basePath}${route === '/' ? '/' : route}`));

test.setTimeout(60_000);

async function checkRoute(page: Page, route: string) {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const failedRequests: string[] = [];
      const badResponses: string[] = [];

      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('requestfailed', (request) => {
        failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText ?? 'failed'}`);
      });
      page.on('response', (response) => {
        if (response.status() >= 400 && !response.url().includes('/favicon')) {
          badResponses.push(`${response.status()} ${response.url()}`);
        }
      });

      const urlPath = `${basePath}${route === '/' ? '/' : route}`;
      const response = await page.goto(urlPath, { waitUntil: 'networkidle' });
      expect(response?.status(), `HTTP status for ${route}`).toBeLessThan(400);

      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
        return new Promise((resolve) => setTimeout(resolve, 100));
      });
      await page.evaluate(() => window.scrollTo(0, 0));

      const data = await page.evaluate((siteBasePath) => ({
        title: document.title.trim(),
        lang: document.documentElement.lang,
        mainText: document.querySelector('main')?.textContent?.trim() ?? '',
        hasNotFound: Boolean(document.querySelector('.not-found')),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
        images: [...document.images].map((image) => ({ src: image.currentSrc || image.src, width: image.naturalWidth })),
        internalLinks: [...document.querySelectorAll('a[href]')]
          .map((anchor) => anchor.getAttribute('href') ?? '')
          .filter((href) => href.startsWith(`${siteBasePath}/`)),
      }), basePath);

      expect(data.title).not.toBe('');
      expect(['ca', 'es', 'en']).toContain(data.lang);
      expect(data.mainText.length).toBeGreaterThanOrEqual(20);
      if (route !== '/404.html') {
        expect(data.canonical).not.toBe('');
        expect(data.hasNotFound).toBe(false);
      }
      expect(data.images.filter((image) => image.width === 0)).toEqual([]);
      expect(data.internalLinks.filter((href) => !knownUrls.has(new URL(href, page.url()).pathname))).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(pageErrors).toEqual([]);
      expect(failedRequests).toEqual([]);
      expect(badResponses).toEqual([]);
}

routes.map((route) =>
  test(`renders ${route}`, async ({ page }) => {
    await checkRoute(page, route);
  }),
);
