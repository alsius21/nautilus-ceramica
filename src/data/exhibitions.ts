export const exhibitions = [
	{
		slug: 'a-la-llotja',
		imageKeys: ['llotja'],
	},
] as const;

export type Exhibition = (typeof exhibitions)[number];
export type ExhibitionSlug = Exhibition['slug'];
export type ExhibitionImageKey = Exhibition['imageKeys'][number];

/** File name (without extension) under public/images/instagram, per image key. */
export const exhibitionImageFiles: Record<ExhibitionImageKey, string> = {
	llotja: 'exposicion_calabaza_en_llotja',
};

export function getExhibition(slug: string): Exhibition | undefined {
	return exhibitions.find((exhibition) => exhibition.slug === slug);
}