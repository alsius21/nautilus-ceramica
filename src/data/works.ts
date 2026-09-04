import type { Locale } from '@/i18n';

export type ShopStatus = 'available' | 'reserved' | 'sold' | 'made_to_order' | 'inquiry';

export type ShopInfo = {
	/** Whether this work appears in the "Peces disponibles" collection. Toggle to curate the shop. */
	available: boolean;
	status: ShopStatus;
	/** Price in euros (integer). Omit to show "A consultar" — mixt mode. */
	price?: number;
	/** Optional dimensions display, e.g. "Ø 24 cm". Kept as free text per piece. */
	dimensions?: string;
	/** Stripe Price ID for future pre-orders / manual capture. E.g. "price_1Q..." */
	stripePriceId?: string;
};

export type LocalizedSlugs = Record<Locale, string>;

export const works = [
	{
		id: 'plat-de-taller',
		titleKey: 'plate',
		slugs: { ca: 'plat-de-taller', es: 'plato-de-taller', en: 'workshop-plate' } as LocalizedSlugs,
		imageKeys: ['plate'],
		made: 'hoji',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		id: 'calabaza-a-la-llotja',
		titleKey: 'pumpkin',
		slugs: {
			ca: 'carabassa-a-la-llotja',
			es: 'calabaza-a-la-llotja',
			en: 'pumpkin-at-llotja',
		} as LocalizedSlugs,
		imageKeys: ['pumpkin'],
		made: 'llotja',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		id: 'bol-de-taller',
		titleKey: 'bowl',
		slugs: { ca: 'bol-de-taller', es: 'cuenco-de-taller', en: 'workshop-bowl' } as LocalizedSlugs,
		imageKeys: ['bowl'],
		made: 'hoji',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		id: 'peces-descacs',
		titleKey: 'chess',
		slugs: { ca: 'peces-descacs', es: 'piezas-de-ajedrez', en: 'chess-pieces' } as LocalizedSlugs,
		imageKeys: ['queen', 'bishop'],
		made: 'llotja',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		id: 'jarron',
		titleKey: 'jarron',
		slugs: { ca: 'gerro', es: 'jarron', en: 'vase' } as LocalizedSlugs,
		imageKeys: ['jarron-1', 'jarron-2', 'jarron-3'],
		made: 'hoji',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		id: 'aceitera',
		titleKey: 'aceitera',
		slugs: { ca: 'setrillera', es: 'aceitera', en: 'oil-cruet' } as LocalizedSlugs,
		imageKeys: ['aceitera-1', 'aceitera-2'],
		made: 'hoji',
		shop: { available: false, status: 'sold', price: 45, dimensions: 'Ø 8 · 14 cm' } as ShopInfo,
	},
	{
		id: 'jarron-alt',
		titleKey: 'jarron-alt',
		slugs: { ca: 'gerro-alt', es: 'jarron-alto', en: 'tall-vase' } as LocalizedSlugs,
		imageKeys: ['jarron-alt-1', 'jarron-alt-2'],
		made: 'hoji',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		id: 'jarron-pf',
		titleKey: 'jarron-pf',
		slugs: { ca: 'gerro-pf', es: 'jarron-pf', en: 'pf-vase' } as LocalizedSlugs,
		imageKeys: ['jarron-pf-1'],
		made: 'hoji',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
] as const;

export type Work = (typeof works)[number];
export type WorkId = Work['id'];
export type WorkSlug = Work['slugs'][Locale];
export type WorkImageKey = Work['imageKeys'][number];

/**
 * Relative path (dir + file name without extension) under public/images, per
 * image key. Classified works live in `gallery/`; pieces tied to a public
 * display live in `exhibitions/`; grouped works (chess, jarron) share a
 * directory so the detail page can enumerate every photo of the group.
 * Unclassified photos stay in `instagram/` until they are assigned to a work.
 */
export const workImageFiles: Record<WorkImageKey, string> = {
	plate: 'gallery/plato_en_taller_de_hoji',
	pumpkin: 'exhibitions/exposicion_calabaza_en_llotja',
	bowl: 'gallery/bol_en_taller_de_hoji',
	queen: 'chess/proyecto-dama_en_taller-de-hoji',
	bishop: 'chess/proyecto-alfil-negro_en_taller-de-hoji',
	'jarron-1': 'jarron/jarron-08-26_01',
	'jarron-2': 'jarron/jarron-08-26_02',
	'jarron-3': 'jarron/jarron-08-26_03',
	'aceitera-1': 'aceitera/aceitera_taller-de-hoji',
	'aceitera-2': 'aceitera/aceitera_taller-de-hoji-02',
	'jarron-alt-1': 'jarron-alt/jarron-alto_taller-de-hoji',
	'jarron-alt-2': 'jarron-alt/jarron-alto_taller-de-hoji-02',
	'jarron-pf-1': 'jarron-pf/jarron-pf',
};

export function getSlug(work: Work, locale: Locale): string {
	return work.slugs[locale] ?? work.slugs.ca;
}

export function getWorkBySlug(slug: string, locale: Locale): Work | undefined {
	return works.find((work) => getSlug(work, locale) === slug);
}

export function getWorkById(id: string): Work | undefined {
	return works.find((work) => work.id === id);
}

// Legacy helper — finds by any slug or id across locales (for redirects / backwards compat)
export function getWork(slug: string): Work | undefined {
	return (
		works.find((work) => work.id === slug) ??
		works.find((work) => Object.values(work.slugs).includes(slug as WorkSlug))
	);
}
