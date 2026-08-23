export const works = [
	{
		slug: 'plat-de-taller',
		titleKey: 'plate',
		imageKeys: ['plate'],
		made: 'hoji',
	},
	{
		slug: 'calabaza-a-la-llotja',
		titleKey: 'pumpkin',
		imageKeys: ['pumpkin'],
		made: 'llotja',
	},
	{
		slug: 'bol-de-taller',
		titleKey: 'bowl',
		imageKeys: ['bowl'],
		made: 'hoji',
	},
	{
		slug: 'peces-descacs',
		titleKey: 'chess',
		imageKeys: ['queen', 'bishop'],
		made: 'llotja',
	},
	{
		slug: 'jarron',
		titleKey: 'jarron',
		imageKeys: ['jarron-1', 'jarron-2', 'jarron-3'],
		made: 'hoji',
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
};

export function getWork(slug: string): Work | undefined {
	return works.find((work) => work.slug === slug);
}