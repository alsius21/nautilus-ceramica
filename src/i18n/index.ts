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
	'work.pumpkin.description': 'Aquesta forma parteix d’una carabassa i en reté el moviment orgànic. El volum, exposat a la Llotja, parla de la tensió entre allò trobat, allò modelat i el temps lent de l’assecat.',
	'work.pumpkin.alt': 'Peça ceràmica Calabaza exposada a la Llotja',
	'work.bowl.title': 'Bol de taller',
	'work.bowl.description': 'Un bol girat a mà al taller Hoji. Les parets conserven la pressió dels dits i una vora que no busca la perfecció, sinó l’equilibri de la matèria.',
	'work.bowl.alt': 'Bol de ceràmica treballat a mà al taller Hoji',
	'work.bishop.title': 'Alfil negre',
	'work.bishop.description': 'Peça del projecte d’escacs modelada a la Llotja.',
	'work.bishop.alt': 'Alfil negre del projecte d’escacs, a la Llotja',
	'work.queen.title': 'Dama',
	'work.queen.description': 'La dama del projecte d’escacs, modelada al taller Hoji.',
	'work.queen.alt': 'Dama del projecte d’escacs, al taller Hoji',
	'exhibit.a-la-llotja.venue': 'La Llotja',
	'exhibit.a-la-llotja.title': 'Exposició a la Llotja',
	'exhibit.a-la-llotja.description': 'El volum de la carbassa es va presentar públicament a la Llotja, on el gest del modelatge troba la mirada de qui s’atura.',
	'exhibit.a-la-llotja.alt': 'Peça ceràmica exposada a la Llotja',
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
	'work.pumpkin.description': 'Esta forma parte de una calabaza y conserva su movimiento orgánico. El volumen, expuesto en la Llotja, habla de la tensión entre lo encontrado, lo modelado y el tiempo lento del secado.',
	'work.pumpkin.alt': 'Pieza cerámica Calabaza expuesta en la Llotja',
	'work.bowl.title': 'Cuenco de taller',
	'work.bowl.description': 'Un cuenco torneado a mano en el taller Hoji. Las paredes conservan la presión de los dedos y un borde que no busca la perfección, sino el equilibrio de la materia.',
	'work.bowl.alt': 'Cuenco de cerámica trabajado a mano en el taller Hoji',
	'work.bishop.title': 'Alfil negro',
	'work.bishop.description': 'Pieza del proyecto de ajedrez modelada en la Llotja.',
	'work.bishop.alt': 'Alfil negro del proyecto de ajedrez, en la Llotja',
	'work.queen.title': 'Dama',
	'work.queen.description': 'La dama del proyecto de ajedrez, modelada en el taller Hoji.',
	'work.queen.alt': 'Dama del proyecto de ajedrez, en el taller Hoji',
	'exhibit.a-la-llotja.venue': 'La Llotja',
	'exhibit.a-la-llotja.title': 'Exposición en la Llotja',
	'exhibit.a-la-llotja.description': 'El volumen de la calabaza se presentó públicamente en la Llotja, donde el gesto del modelado encuentra la mirada de quien se detiene.',
	'exhibit.a-la-llotja.alt': 'Pieza cerámica expuesta en la Llotja',
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
	'work.pumpkin.description': 'This form begins with a pumpkin and keeps its organic movement. Exhibited at Llotja, the volume speaks to the tension between what is found, what is shaped, and the slow time of drying.',
	'work.pumpkin.alt': 'Calabaza ceramic piece exhibited at Llotja',
	'work.bowl.title': 'Workshop bowl',
	'work.bowl.description': 'A bowl thrown by hand at the Hoji workshop. The walls keep the pressure of the fingers and a rim that seeks not perfection but the balance of the material.',
	'work.bowl.alt': 'Handmade ceramic bowl in the Hoji workshop',
	'work.bishop.title': 'Black bishop',
	'work.bishop.description': 'A piece from the chess project, modelled at the Llotja.',
	'work.bishop.alt': 'Black bishop from the chess project, at the Llotja',
	'work.queen.title': 'Queen',
	'work.queen.description': 'The queen of the chess project, modelled at the Hoji workshop.',
	'work.queen.alt': 'Queen from the chess project, at the Hoji workshop',
	'exhibit.a-la-llotja.venue': 'La Llotja',
	'exhibit.a-la-llotja.title': 'Exhibition at the Llotja',
	'exhibit.a-la-llotja.description': 'The volume of the pumpkin was presented publicly at the Llotja, where the gesture of shaping meets the gaze of those who stop.',
	'exhibit.a-la-llotja.alt': 'Ceramic piece exhibited at the Llotja',
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