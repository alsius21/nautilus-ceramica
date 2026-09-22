import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import './base.css';
import './styles.css';

const root = document.getElementById('root')!;
const app = <BrowserRouter basename="/nautilus-ceramica"><App /></BrowserRouter>;

// Vite dev serves an empty root; prerendered production pages contain markup.
// Use the matching client API in each mode to avoid hydration mismatches.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
	});
}
