export const exhibitions = [
	{
		slug: 'argilla-2026',
		imageKeys: ['argilla'],
		url: 'https://argilla.cat/',
	},
] as const;

export type Exhibition = (typeof exhibitions)[number];
export type ExhibitionSlug = Exhibition['slug'];
export type ExhibitionImageKey = Exhibition['imageKeys'][number];

/**
 * Relative path (dir + file name without extension) under public/images, per
 * image key. Exhibition photos live in `exhibitions/`.
 */
export const exhibitionImageFiles: Record<ExhibitionImageKey, string> = {
	argilla: 'exhibitions/exposicion_calabaza_en_llotja',
};

export function getExhibition(slug: string): Exhibition | undefined {
	return exhibitions.find((exhibition) => exhibition.slug === slug);
}