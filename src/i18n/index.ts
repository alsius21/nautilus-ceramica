// Central dictionary for the site's three languages.
// Catalan is the default locale served at `/`; Spanish lives at `/es/`, English at `/en/`.
// The `es` and `en` objects are type-checked to contain exactly the keys of `ca`.

export const defaultLocale = 'ca' as const;
export const locales = ['ca', 'es', 'en'] as const;
export type Locale = (typeof locales)[number];

const ca = {
	'meta.description': 'Ceràmica artesanal de Zara Castillo Martínez. Peces úniques fetes a mà, del taller a l’exposició.',
	'gallery.label': 'Obra seleccionada',
	'art.plate': 'Plat de ceràmica al taller Hoji',
	'art.pumpkin': 'Peça de ceràmica «Calabaza» en una exposició a la Llotja',
	'lang.selector': 'Idioma',
	'lang.name': 'Català',
};

const es: Record<keyof typeof ca, string> = {
	'meta.description': 'Cerámica artesanal de Zara Castillo Martínez. Piezas únicas hechas a mano, del taller a la exposición.',
	'gallery.label': 'Obra seleccionada',
	'art.plate': 'Plato de cerámica en el taller Hoji',
	'art.pumpkin': 'Pieza de cerámica «Calabaza» en una exposición en la Llotja',
	'lang.selector': 'Idioma',
	'lang.name': 'Castellano',
};

const en: Record<keyof typeof ca, string> = {
	'meta.description': 'Handmade ceramics by Zara Castillo Martínez. One-of-a-kind pieces, from the workshop to the exhibition.',
	'gallery.label': 'Selected work',
	'art.plate': 'Ceramic plate in the Hoji workshop',
	'art.pumpkin': '"Calabaza" ceramic piece at an exhibition at Llotja',
	'lang.selector': 'Language',
	'lang.name': 'English',
};

export const ui = { ca, es, en };

/** Translate a key into the given locale. */
export function t(locale: Locale, key: keyof typeof ca): string {
	return ui[locale][key];
}

/** Map Astro's locale (from the URL) onto a supported locale, falling back to the default. */
export function normalizeLocale(locale: string | undefined): Locale {
	if (locale && (locales as readonly string[]).includes(locale)) {
		return locale as Locale;
	}
	return defaultLocale;
}