import type { Locale } from '@/i18n';
import type { Work } from '@/lib/content';

export const PIECE_CATEGORIES = ['vase', 'cup', 'bowl', 'plate', 'bottle', 'juicer', 'sculpture', 'other'] as const;
export const PIECE_SIZES = ['small', 'medium', 'large'] as const;
export type PieceCategory = (typeof PIECE_CATEGORIES)[number];
export type PieceSize = (typeof PIECE_SIZES)[number];

const categories: Record<Locale, Record<PieceCategory, string>> = {
	ca: { vase: 'Gerros', cup: 'Gots i tasses', bowl: 'Bols', plate: 'Plats', bottle: 'Setrilleres', juicer: 'Espremedors', sculpture: 'Escultures', other: 'Altres peces' },
	es: { vase: 'Jarrones', cup: 'Vasos y tazas', bowl: 'Cuencos', plate: 'Platos', bottle: 'Aceiteras', juicer: 'Exprimidores', sculpture: 'Esculturas', other: 'Otras piezas' },
	en: { vase: 'Vases', cup: 'Cups and mugs', bowl: 'Bowls', plate: 'Plates', bottle: 'Oil bottles', juicer: 'Juicers', sculpture: 'Sculptures', other: 'Other pieces' },
};

const sizes: Record<Locale, Record<PieceSize, string>> = {
	ca: { small: 'Petita', medium: 'Mitjana', large: 'Gran' },
	es: { small: 'Pequeña', medium: 'Mediana', large: 'Grande' },
	en: { small: 'Small', medium: 'Medium', large: 'Large' },
};

export function categoryLabel(category: PieceCategory, locale: Locale): string {
	return categories[locale][category];
}

export function sizeLabel(size: PieceSize, locale: Locale): string {
	return sizes[locale][size];
}

export function normalizeSearch(text: string): string {
	return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function tagsFor(work: Work): Set<string> {
	return new Set(Object.values(work.tags ?? {}).flatMap((text) => text.split(',').map(normalizeSearch)).filter(Boolean));
}

/** Only published shop pieces with a real category/tag connection are recommended. */
export function getRelatedWorks(current: Work, candidates: readonly Work[], limit = 3): Work[] {
	const tags = tagsFor(current);
	const purchasable = (work: Work) => work.shop.status !== 'sold' && work.shop.status !== 'reserved';
	return candidates
		.filter((candidate) => candidate.id !== current.id && candidate.shop.available)
		.map((candidate) => {
			const sameCategory = !!current.category && current.category !== 'other' && current.category === candidate.category;
			const sharedTags = [...tagsFor(candidate)].filter((tag) => tags.has(tag)).length;
			const connected = sameCategory || sharedTags > 0;
			const sameSize = !!current.size && current.size === candidate.size;
			return { candidate, connected, score: (sameCategory ? 100 : 0) + Math.min(sharedTags, 10) * 5 + (sameSize ? 1 : 0) };
		})
		.filter(({ connected }) => connected)
		.sort((a, b) => Number(purchasable(b.candidate)) - Number(purchasable(a.candidate)) || b.score - a.score || a.candidate.id.localeCompare(b.candidate.id))
		.slice(0, Math.max(0, Math.floor(limit)))
		.map(({ candidate }) => candidate);
}
