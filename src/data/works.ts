export const works = [
	{
		slug: 'plat-de-taller',
		imageKeys: ['plate'],
	},
	{
		slug: 'calabaza-a-la-llotja',
		imageKeys: ['pumpkin'],
	},
	{
		slug: 'bol-de-taller',
		imageKeys: ['bowl'],
	},
	{
		slug: 'alfil-negre',
		imageKeys: ['bishop'],
	},
	{
		slug: 'dama',
		imageKeys: ['queen'],
	},
] as const;

export type Work = (typeof works)[number];
export type WorkSlug = Work['slug'];
export type WorkImageKey = Work['imageKeys'][number];

/**
 * Relative path (dir + file name without extension) under public/images, per
 * image key. Classified works live in `gallery/`; pieces tied to a public
 * display live in `exhibitions/`. Unclassified photos stay in `instagram/`
 * until they are assigned to a work or exhibition.
 */
export const workImageFiles: Record<WorkImageKey, string> = {
	plate: 'gallery/plato_en_taller_de_hoji',
	pumpkin: 'exhibitions/exposicion_calabaza_en_llotja',
	bowl: 'gallery/bol_en_taller_de_hoji',
	bishop: 'gallery/proyecto-alfil-negro_en_taller-de-hoji',
	queen: 'gallery/proyecto-dama_en_taller-de-hoji',
};

export function getWork(slug: string): Work | undefined {
	return works.find((work) => work.slug === slug);
}