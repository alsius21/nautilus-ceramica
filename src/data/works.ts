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

export const works = [
	{
		slug: 'plat-de-taller',
		titleKey: 'plate',
		imageKeys: ['plate'],
		made: 'hoji',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		slug: 'calabaza-a-la-llotja',
		titleKey: 'pumpkin',
		imageKeys: ['pumpkin'],
		made: 'llotja',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		slug: 'bol-de-taller',
		titleKey: 'bowl',
		imageKeys: ['bowl'],
		made: 'hoji',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		slug: 'peces-descacs',
		titleKey: 'chess',
		imageKeys: ['queen', 'bishop'],
		made: 'llotja',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		slug: 'jarron',
		titleKey: 'jarron',
		imageKeys: ['jarron-1', 'jarron-2', 'jarron-3'],
		made: 'hoji',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		slug: 'aceitera',
		titleKey: 'aceitera',
		imageKeys: ['aceitera-1', 'aceitera-2'],
		made: 'hoji',
		shop: { available: true, status: 'available', price: 45, dimensions: 'Ø 8 · 14 cm' } as ShopInfo,
	},
	{
		slug: 'jarron-alt',
		titleKey: 'jarron-alt',
		imageKeys: ['jarron-alt-1', 'jarron-alt-2'],
		made: 'hoji',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
	{
		slug: 'jarron-pf',
		titleKey: 'jarron-pf',
		imageKeys: ['jarron-pf-1'],
		made: 'hoji',
		shop: { available: false, status: 'sold' } as ShopInfo,
	},
] as const;

export type Work = (typeof works)[number];
export type WorkSlug = Work['slug'];
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

export function getWork(slug: string): Work | undefined {
	return works.find((work) => work.slug === slug);
}