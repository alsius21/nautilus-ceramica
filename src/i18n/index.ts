// Central dictionary for the site's three languages.
// Catalan is the default locale served at `/`; Spanish lives at `/es/`, English at `/en/`.
// The `es` and `en` objects are type-checked to contain exactly the keys of `ca`.

export const defaultLocale = 'ca' as const;
export const locales = ['ca', 'es', 'en'] as const;
export type Locale = (typeof locales)[number];

const ca = {
	'meta.description': 'Ceràmica artesanal de Zara Castillo Martínez. Peces úniques fetes a mà, del taller a l’exposició.',
	'gallery.label': 'Obra seleccionada',
	'nav.label': 'Navegació principal',
	'nav.gallery': 'Galeria',
	'nav.exhibitions': 'Exposicions',
	'gallery.path': 'galeria',
	'gallery.back': 'Torna a l’inici',
	'gallery.page.eyebrow': 'Galeria',
	'gallery.page.title': 'Totes les peces',
	'gallery.page.description': 'Cada peça, del taller a l’exposició.',
	'exhibitions.path': 'exposicions',
	'exhibitions.back': 'Torna a l’inici',
	'exhibit.back': 'Tornar a exposicions',
	'exhibitions.page.eyebrow': 'Exposicions',
	'exhibitions.page.title': 'A la llum pública',
	'exhibitions.page.description': 'L’obra quan surt del taller: exposicions, mostres i altres trobades públiques.',
	'art.plate': 'Plat de ceràmica al taller Hoji',
	'work.back': 'Tornar',
	'work.meta': 'Galeria',
	'work.path': 'obres',
	'work.plate.title': 'Plat andalús',
	'work.plate.description': 'Una peça inspirada en la ceràmica andalusa, treballada a mà al taller Hoji.',
	'work.plate.alt': 'Plat de ceràmica treballat a mà al taller Hoji',
	'work.pumpkin.title': 'Calabaza',
	'work.pumpkin.description': 'Aquesta forma parteix d’una carabassa i en reté el moviment orgànic. Presentada al festival Argillà d’Argentona com a part de la collita de la Llotja, el volum parla de la tensió entre allò trobat, allò modelat i el temps lent de l’assecat.',
	'work.pumpkin.alt': 'Peça ceràmica Calabaza presentada al festival Argillà d’Argentona',
	'work.bowl.title': 'Bol de taller',
	'work.bowl.description': 'Un bol girat a mà al taller Hoji. Les parets conserven la pressió dels dits i una vora que no busca la perfecció, sinó l’equilibri de la matèria.',
	'work.bowl.alt': 'Bol de ceràmica treballat a mà al taller Hoji',
	'work.bishop.title': 'Alfil negre',
	'work.bishop.description': 'Peça del projecte d’escacs modelada a la Llotja.',
	'work.bishop.alt': 'Alfil negre del projecte d’escacs, a la Llotja',
	'work.queen.title': 'Dama',
	'work.queen.description': 'La dama del projecte d’escacs, modelada al taller Hoji.',
	'work.queen.alt': 'Dama del projecte d’escacs, al taller Hoji',
	'exhibit.argilla-2026.venue': 'Argentona',
	'exhibit.argilla-2026.title': 'Argillà',
	'exhibit.argilla-2026.description': 'Presentada al festival Argillà d’Argentona (2026), la carbassa forma part de la collita de la Llotja: una tria de peces que surten del taller cap a la llum pública.',
	'exhibit.argilla-2026.alt': 'Peça ceràmica de la collita de la Llotja al festival Argillà d’Argentona',
	'exhibit.visit': 'Visita el projecte',
	'lang.selector': 'Idioma',
	'lang.name': 'Català',
};

const es: Record<keyof typeof ca, string> = {
	'meta.description': 'Cerámica artesanal de Zara Castillo Martínez. Piezas únicas hechas a mano, del taller a la exposición.',
	'gallery.label': 'Obra seleccionada',
	'nav.label': 'Navegación principal',
	'nav.gallery': 'Galería',
	'nav.exhibitions': 'Exposiciones',
	'gallery.path': 'galeria',
	'gallery.back': 'Volver al inicio',
	'gallery.page.eyebrow': 'Galería',
	'gallery.page.title': 'Todas las piezas',
	'gallery.page.description': 'Cada pieza, del taller a la exposición.',
	'exhibitions.path': 'exposiciones',
	'exhibitions.back': 'Volver al inicio',
	'exhibit.back': 'Volver a exposiciones',
	'exhibitions.page.eyebrow': 'Exposiciones',
	'exhibitions.page.title': 'A la luz pública',
	'exhibitions.page.description': 'La obra cuando sale del taller: exposiciones, muestras y otros encuentros públicos.',
	'art.plate': 'Plato de cerámica en el taller Hoji',
	'work.back': 'Volver',
	'work.meta': 'Galería',
	'work.path': 'obras',
	'work.plate.title': 'Plato andaluz',
	'work.plate.description': 'Una pieza inspirada en la cerámica andaluza, trabajada a mano en el taller Hoji.',
	'work.plate.alt': 'Plato de cerámica trabajado a mano en el taller Hoji',
	'work.pumpkin.title': 'Calabaza',
	'work.pumpkin.description': 'Esta forma parte de una calabaza y conserva su movimiento orgánico. Presentada en el festival Argillà de Argentona como parte de la collita de la Llotja, el volumen habla de la tensión entre lo encontrado, lo modelado y el tiempo lento del secado.',
	'work.pumpkin.alt': 'Pieza cerámica Calabaza presentada en el festival Argillà de Argentona',
	'work.bowl.title': 'Cuenco de taller',
	'work.bowl.description': 'Un cuenco torneado a mano en el taller Hoji. Las paredes conservan la presión de los dedos y un borde que no busca la perfección, sino el equilibrio de la materia.',
	'work.bowl.alt': 'Cuenco de cerámica trabajado a mano en el taller Hoji',
	'work.bishop.title': 'Alfil negro',
	'work.bishop.description': 'Pieza del proyecto de ajedrez modelada en la Llotja.',
	'work.bishop.alt': 'Alfil negro del proyecto de ajedrez, en la Llotja',
	'work.queen.title': 'Dama',
	'work.queen.description': 'La dama del proyecto de ajedrez, modelada en el taller Hoji.',
	'work.queen.alt': 'Dama del proyecto de ajedrez, en el taller Hoji',
	'exhibit.argilla-2026.venue': 'Argentona',
	'exhibit.argilla-2026.title': 'Argillà',
	'exhibit.argilla-2026.description': 'Presentada en el festival Argillà de Argentona (2026), la calabaza forma parte de la collita de la Llotja: una selección de piezas que salen del taller hacia la luz pública.',
	'exhibit.argilla-2026.alt': 'Pieza cerámica de la collita de la Llotja en el festival Argillà de Argentona',
	'exhibit.visit': 'Visita el proyecto',
	'lang.selector': 'Idioma',
	'lang.name': 'Castellano',
};

const en: Record<keyof typeof ca, string> = {
	'meta.description': 'Handmade ceramics by Zara Castillo Martínez. One-of-a-kind pieces, from the workshop to the exhibition.',
	'gallery.label': 'Selected work',
	'nav.label': 'Main navigation',
	'nav.gallery': 'Gallery',
	'nav.exhibitions': 'Exhibitions',
	'gallery.path': 'gallery',
	'gallery.back': 'Back to home',
	'gallery.page.eyebrow': 'Gallery',
	'gallery.page.title': 'All the pieces',
	'gallery.page.description': 'Every piece, from the workshop to the exhibition.',
	'exhibitions.path': 'exhibitions',
	'exhibitions.back': 'Back to home',
	'exhibit.back': 'Back to exhibitions',
	'exhibitions.page.eyebrow': 'Exhibitions',
	'exhibitions.page.title': 'In the public light',
	'exhibitions.page.description': 'The work when it leaves the workshop: exhibitions, showings and other public moments.',
	'art.plate': 'Ceramic plate in the Hoji workshop',
	'work.back': 'Back',
	'work.meta': 'Gallery',
	'work.path': 'pieces',
	'work.plate.title': 'Andalusian plate',
	'work.plate.description': 'A piece inspired by Andalusian ceramics, made by hand at the Hoji workshop.',
	'work.plate.alt': 'Handmade ceramic plate in the Hoji workshop',
	'work.pumpkin.title': 'Calabaza',
	'work.pumpkin.description': 'This form begins with a pumpkin and keeps its organic movement. Shown at the Argillà festival in Argentona as part of the Llotja harvest, the volume speaks to the tension between what is found, what is shaped, and the slow time of drying.',
	'work.pumpkin.alt': 'Calabaza ceramic piece shown at the Argillà festival in Argentona',
	'work.bowl.title': 'Workshop bowl',
	'work.bowl.description': 'A bowl thrown by hand at the Hoji workshop. The walls keep the pressure of the fingers and a rim that seeks not perfection but the balance of the material.',
	'work.bowl.alt': 'Handmade ceramic bowl in the Hoji workshop',
	'work.bishop.title': 'Black bishop',
	'work.bishop.description': 'A piece from the chess project, modelled at the Llotja.',
	'work.bishop.alt': 'Black bishop from the chess project, at the Llotja',
	'work.queen.title': 'Queen',
	'work.queen.description': 'The queen of the chess project, modelled at the Hoji workshop.',
	'work.queen.alt': 'Queen from the chess project, at the Hoji workshop',
	'exhibit.argilla-2026.venue': 'Argentona',
	'exhibit.argilla-2026.title': 'Argillà',
	'exhibit.argilla-2026.description': 'Shown at the Argillà festival in Argentona (2026), the pumpkin is part of the Llotja harvest: a selection of pieces that leave the studio for the public light.',
	'exhibit.argilla-2026.alt': 'Ceramic piece from the Llotja harvest at the Argillà festival in Argentona',
	'exhibit.visit': 'Visit the project',
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