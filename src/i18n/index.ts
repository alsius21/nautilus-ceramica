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
	'work.back': 'Torna a l’obra seleccionada',
	'work.meta': 'Diari de taller',
	'work.path': 'obres',
	'work.plate.title': 'Plat de taller',
	'work.plate.description': 'Una peça oberta i silenciosa, treballada a mà al taller Hoji. La superfície conserva el gest dels dits i una irregularitat buscada: la matèria no s’amaga, acompanya cada ús.',
	'work.plate.alt': 'Plat de ceràmica treballat a mà al taller Hoji',
	'work.pumpkin.title': 'Calabaza',
	'work.pumpkin.description': 'Aquesta forma parteix d’una carabassa i en reté el moviment orgànic. El volum, exposat a la Llotja, parla de la tensió entre allò trobat, allò modelat i el temps lent de l’assecat.',
	'work.pumpkin.alt': 'Peça ceràmica Calabaza exposada a la Llotja',
	'lang.selector': 'Idioma',
	'lang.name': 'Català',
};

const es: Record<keyof typeof ca, string> = {
	'meta.description': 'Cerámica artesanal de Zara Castillo Martínez. Piezas únicas hechas a mano, del taller a la exposición.',
	'gallery.label': 'Obra seleccionada',
	'art.plate': 'Plato de cerámica en el taller Hoji',
	'art.pumpkin': 'Pieza de cerámica «Calabaza» en una exposición en la Llotja',
	'work.back': 'Volver a la obra seleccionada',
	'work.meta': 'Diario de taller',
	'work.path': 'obras',
	'work.plate.title': 'Plato de taller',
	'work.plate.description': 'Una pieza abierta y silenciosa, trabajada a mano en el taller Hoji. La superficie conserva el gesto de los dedos y una irregularidad buscada: la materia no se esconde, acompaña cada uso.',
	'work.plate.alt': 'Plato de cerámica trabajado a mano en el taller Hoji',
	'work.pumpkin.title': 'Calabaza',
	'work.pumpkin.description': 'Esta forma parte de una calabaza y conserva su movimiento orgánico. El volumen, expuesto en la Llotja, habla de la tensión entre lo encontrado, lo modelado y el tiempo lento del secado.',
	'work.pumpkin.alt': 'Pieza cerámica Calabaza expuesta en la Llotja',
	'lang.selector': 'Idioma',
	'lang.name': 'Castellano',
};

const en: Record<keyof typeof ca, string> = {
	'meta.description': 'Handmade ceramics by Zara Castillo Martínez. One-of-a-kind pieces, from the workshop to the exhibition.',
	'gallery.label': 'Selected work',
	'art.plate': 'Ceramic plate in the Hoji workshop',
	'art.pumpkin': '"Calabaza" ceramic piece at an exhibition at Llotja',
	'work.back': 'Back to selected work',
	'work.meta': 'Studio journal',
	'work.path': 'pieces',
	'work.plate.title': 'Workshop plate',
	'work.plate.description': 'An open, quiet piece made by hand at the Hoji workshop. The surface keeps the movement of the fingers and a considered irregularity: the material is not hidden, but allowed to accompany each use.',
	'work.plate.alt': 'Handmade ceramic plate in the Hoji workshop',
	'work.pumpkin.title': 'Calabaza',
	'work.pumpkin.description': 'This form begins with a pumpkin and keeps its organic movement. Exhibited at Llotja, the volume speaks to the tension between what is found, what is shaped, and the slow time of drying.',
	'work.pumpkin.alt': 'Calabaza ceramic piece exhibited at Llotja',
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