import type { ImageMetadata } from 'astro';

// Eager glob of all images in src/assets/images
const allImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{webp,jpg,jpeg,png,avif}',
  { eager: true }
);

/**
 * Resolve an image from src/assets/images by relative path without extension,
 * e.g. "gallery/plato_en_taller_de_hoji" -> ImageMetadata
 *
 * Falls back to trying .webp then other extensions.
 */
export function getImageAsset(relativePath: string): ImageMetadata {
  const candidates = [
    `/src/assets/images/${relativePath}.webp`,
    `/src/assets/images/${relativePath}.jpg`,
    `/src/assets/images/${relativePath}.jpeg`,
    `/src/assets/images/${relativePath}.png`,
    `/src/assets/images/${relativePath}.avif`,
  ];
  for (const key of candidates) {
    const mod = allImages[key];
    if (mod) return mod.default;
  }
  throw new Error(
    `[images] Asset not found: "${relativePath}". Tried: ${candidates.join(', ')}. Available: ${Object.keys(allImages).join(', ')}`
  );
}

// Re-export for convenience in components that need widths/sizes presets
export const imageSizes = {
  // Home hero: two columns ~50vw each, 100vw on mobile
  home: '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 620px',
  // Gallery grid: auto-fill minmax 19rem
  gallery: '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw',
  // Shop cards: similar but slightly smaller due to padding
  shop: '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 400px',
  // Detail page (work/journal): image column ~60vw
  detail: '(max-width: 700px) 100vw, 60vw',
  // Exhibition grid: same as gallery
  exhibition: '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw',
} as const;

export const imageWidths = {
  // Provide enough steps to cover 1x and 2x for each layout breakpoint
  thumb: [320, 480, 640, 800],
  card: [360, 480, 640, 800, 960],
  hero: [400, 640, 800, 1024, 1280, 1440],
  detail: [480, 640, 800, 1024, 1280, 1440],
} as const;
