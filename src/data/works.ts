export const works = [
	{
		slug: 'plat-de-taller',
		imageKeys: ['plate'],
	},
	{
		slug: 'calabaza-a-la-llotja',
		imageKeys: ['pumpkin'],
	},
] as const;

export type Work = (typeof works)[number];
export type WorkSlug = Work['slug'];
export type WorkImageKey = Work['imageKeys'][number];

export function getWork(slug: string): Work | undefined {
	return works.find((work) => work.slug === slug);
}
