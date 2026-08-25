export const BRAND_NAME = 'nautilusceramica';

/**
 * Feature flag for shop (botiga) — disabled by default while in development.
 * Set `PUBLIC_SHOP_ENABLED=true` in env to enable commerce UI (prices, add-to-cart, request form).
 * When disabled: prices hidden, buttons/form not rendered, shop pages show fallback.
 */
export const SHOP_ENABLED = import.meta.env.PUBLIC_SHOP_ENABLED === 'true';