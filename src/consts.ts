export const BRAND_NAME = 'nautilusceramica';

/**
 * Feature flag for shop (botiga) — disabled by default while in development.
 * Set `PUBLIC_SHOP_ENABLED=true` in env to enable commerce UI (prices, add-to-cart, request form).
 * When disabled: prices hidden, buttons/form not rendered, shop pages show fallback.
 */
const publicShopEnabled = import.meta.env?.PUBLIC_SHOP_ENABLED ?? (typeof process !== 'undefined' ? process.env.PUBLIC_SHOP_ENABLED : undefined);
export const SHOP_ENABLED = publicShopEnabled?.trim().toLowerCase() === 'true';
