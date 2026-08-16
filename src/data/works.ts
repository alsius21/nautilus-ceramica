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

/** File name (without extension) under public/images/instagram, per image key. */
export const workImageFiles: Record<WorkImageKey, string> = {
	plate: 'plato_en_taller_de_hoji',
	pumpkin: 'exposicion_calabaza_en_llotja',
	bowl: 'bol_en_taller_de_hoji',
	bishop: 'proyecto-alfil-negro_en_taller-de-hoji',
	queen: 'proyecto-dama_en_taller-de-hoji',
};

export function getWork(slug: string): Work | undefined {
	return works.find((work) => work.slug === slug);
}