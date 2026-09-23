import { defineConfig } from 'vite-plus';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import viteContentEditor from './tools/vite-content-editor.mjs';

function serveDevelopmentFonts() {
  const fonts = new Map([
    ['fraunces-latin-full-normal.woff2', path.resolve(import.meta.dirname, './node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2')],
    ['archivo-latin-wght-normal.woff2', path.resolve(import.meta.dirname, './node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2')],
  ]);
  return {
    name: 'serve-development-fonts',
    configureServer(server: { middlewares: { use: (handler: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? '';
        const prefix = '/nautilus-ceramica/fonts/';
        if (!pathname.startsWith(prefix)) return next();
        const file = fonts.get(decodeURIComponent(pathname.slice(prefix.length)));
        if (!file) return next();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'font/woff2');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(readFileSync(file));
      });
    },
  };
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, import.meta.dirname, '');
	return {
		root: import.meta.dirname,
		base: '/nautilus-ceramica/',
		publicDir: path.resolve(import.meta.dirname, './public'),
		plugins: [serveDevelopmentFonts(), viteContentEditor(), react()],
		define: { 'import.meta.env.PUBLIC_SHOP_ENABLED': JSON.stringify(env.PUBLIC_SHOP_ENABLED ?? '') },
		resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
		build: {
			outDir: path.resolve(import.meta.dirname, './dist'),
			emptyOutDir: true,
			manifest: true,
			rollupOptions: { output: { entryFileNames: 'assets/app.js', chunkFileNames: 'assets/[name].js', assetFileNames: 'assets/[name][extname]' } },
		},
	};
});
