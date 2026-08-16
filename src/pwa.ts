import { registerSW } from 'virtual:pwa-register';

// Registers the service worker so the site works offline and can be installed
// as a PWA. `immediate: true` installs it on first visit; the plugin's
// `registerType: 'autoUpdate'` swaps in new builds silently on redeploy.
registerSW({ immediate: true });