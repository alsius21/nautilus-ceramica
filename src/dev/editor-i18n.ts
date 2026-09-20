// Textos de l'editor de contingut (només desenvolupament).
// Separats del diccionari públic perquè no formen part del lloc.

export type EditorLocale = 'ca' | 'es' | 'en';

export type EditorStrings = {
	metaTitle: string;
	tag: string;
	back: string;
	eyebrow: string;
	heading: string;
	headingEdit: string;
	lead: string;
	leadEdit: string;
	previewTitle: string;
	previewHint: string;
	previewEmpty: string;
	previewUntitled: string;
	previewNoDescription: string;
	previewShopAvailable: string;
	previewShopUnavailable: string;
	sectionPiece: string;
	titleLabel: string;
	noteCa: string;
	slugLabel: string;
	optional: string;
	slugPlaceholder: string;
	madeLabel: string;
	categoryLabel: string;
	sizeLabel: string;
	tagsLabel: string;
	tagsHint: string;
	madeAtLabel: string;
	datesNote: string;
	sectionDescription: string;
	textLabel: string;
	textPlaceholder: string;
	sectionPhotos: string;
	photosHint: string;
	dropTitle: string;
	dropSub: string;
	sectionI18n: string;
	i18nHint: string;
	titleEs: string;
	titleEn: string;
	descEs: string;
	descEn: string;
	sectionShop: string;
	shopAvailable: string;
	statusLabel: string;
	priceLabel: string;
	submit: string;
	submitEdit: string;
	submitting: string;
	panelExisting: string;
	imageSingular: string;
	imagePlural: string;
	panelWhere: string;
	whereJson: string;
	whereImages: string;
	whereHint: string;
	cropTitle: string;
	cropFree: string;
	cropHint: string;
	cropNote: string;
	cropApplied: string;
	cropCancel: string;
	cropApply: string;
	altLabel: string;
	badgeCover: string;
	badgeCropped: string;
	crop: string;
	cropAgain: string;
	revert: string;
	moveUp: string;
	moveDown: string;
	remove: string;
	errorTitle: string;
	errorPhoto: string;
	statusConverting: string;
	statusSaved: string;
	viewIt: string;
	reloadNote: string;
	errorCrop: string;
	errorSave: string;
	errorGeneric: string;
};

export const editorStrings: Record<EditorLocale, EditorStrings> = {
	ca: {
		metaTitle: 'Nova peça',
		tag: 'Editor · només en desenvolupament',
		back: 'Torna a la galeria',
		eyebrow: 'Contingut',
		heading: 'Nova peça',
		headingEdit: 'Edita la peça',
		lead: 'Escriu el títol i la descripció, afegeix les fotografies, retalla-les si cal i desa la peça.',
		leadEdit: 'Canvia els textos, les fotografies o les dades de la peça i desa els canvis.',
		previewTitle: 'Vista prèvia',
		previewHint: 'Així es veurà la peça amb les dades actuals.',
		previewEmpty: 'Afegeix una fotografia per veure-la aquí.',
		previewUntitled: 'Peça sense títol',
		previewNoDescription: 'Encara no hi ha descripció.',
		previewShopAvailable: 'Disponible a la botiga',
		previewShopUnavailable: 'No disponible a la botiga',
		sectionPiece: 'La peça',
		titleLabel: 'Títol',
		noteCa: '(català)',
		slugLabel: 'Slug',
		optional: '(opcional)',
		slugPlaceholder: 'gerro-de-tardor',
		madeLabel: 'Taller',
		categoryLabel: 'Categoria',
		sizeLabel: 'Mida',
		tagsLabel: 'Etiquetes',
		tagsHint: 'Separa les etiquetes amb comes.',
		madeAtLabel: 'Data de fabricació',
		datesNote: 'Les dates d’alta i d’edició s’omplen automàticament en desar.',
		sectionDescription: 'Descripció',
		textLabel: 'Text',
		textPlaceholder: 'Materials, procés, textura, anècdotes del taller…',
		sectionPhotos: 'Fotografies',
		photosHint:
			'La primera imatge és la portada de la peça. Arrossega-les o tria-les de l’equip; pots retallar cada imatge abans de desar.',
		dropTitle: 'Afegeix fotografies',
		dropSub: 'JPG, PNG, HEIC… es converteixen a WebP',
		sectionI18n: 'Altres idiomes i SEO',
		i18nHint: 'Si ho deixes buit, el castellà i l’anglès faran servir el text català.',
		titleEs: 'Títol (castellà)',
		titleEn: 'Títol (anglès)',
		descEs: 'Descripció (castellà)',
		descEn: 'Descripció (anglès)',
		sectionShop: 'Botiga',
		shopAvailable: 'Disponible a la botiga',
		statusLabel: 'Estat',
		priceLabel: 'Preu (€)',
		submit: 'Desa la peça',
		submitEdit: 'Desa els canvis',
		submitting: 'Desant…',
		panelExisting: 'Peces existents',
		imageSingular: 'imatge',
		imagePlural: 'imatges',
		panelWhere: 'On es desa',
		whereJson: 'Textos i slugs (ca/es/en)',
		whereImages: 'Fotografies convertides a WebP',
		whereHint: 'Aquesta pàgina i el punt de desament només funcionen amb astro dev.',
		cropTitle: 'Retalla la imatge',
		cropFree: 'Lliure',
		cropHint:
			'Arrossega el marc per moure’l i les cantonades per ajustar-lo. El retall s’aplica abans de desar.',
		cropNote: 'El retall es guarda en desar la peça; la imatge original no es toca.',
		cropApplied: 'Retall aplicat',
		cropCancel: 'Cancel·la',
		cropApply: 'Aplica el retall',
		altLabel: 'Text alternatiu',
		badgeCover: 'Portada',
		badgeCropped: 'Retallada',
		crop: 'Retallar',
		cropAgain: 'Retallar de nou',
		revert: 'Revertir',
		moveUp: 'Moure amunt',
		moveDown: 'Moure avall',
		remove: 'Treure',
		errorTitle: 'Cal un títol en català.',
		errorPhoto: 'Afegeix almenys una fotografia.',
		statusConverting: 'Convertint les imatges…',
		statusSaved: 'Peça desada.',
		viewIt: 'Veure-la',
		reloadNote: 'torna a carregar la galeria per veure-la a la graella.',
		errorCrop: 'No s’ha pogut retallar la imatge.',
		errorSave: 'No s’ha pogut desar la peça.',
		errorGeneric: 'Error inesperat.',
	},
	es: {
		metaTitle: 'Nueva pieza',
		tag: 'Editor · solo en desarrollo',
		back: 'Volver a la galería',
		eyebrow: 'Contenido',
		heading: 'Nueva pieza',
		headingEdit: 'Edita la pieza',
		lead: 'Escribe el título y la descripción, añade las fotografías, recórtalas si hace falta y guarda la pieza.',
		leadEdit: 'Cambia los textos, las fotografías o los datos de la pieza y guarda los cambios.',
		previewTitle: 'Vista previa',
		previewHint: 'Así se verá la pieza con los datos actuales.',
		previewEmpty: 'Añade una fotografía para verla aquí.',
		previewUntitled: 'Pieza sin título',
		previewNoDescription: 'Todavía no hay descripción.',
		previewShopAvailable: 'Disponible en la tienda',
		previewShopUnavailable: 'No disponible en la tienda',
		sectionPiece: 'La pieza',
		titleLabel: 'Título',
		noteCa: '(catalán)',
		slugLabel: 'Slug',
		optional: '(opcional)',
		slugPlaceholder: 'jarron-de-otono',
		madeLabel: 'Taller',
		categoryLabel: 'Categoría',
		sizeLabel: 'Tamaño',
		tagsLabel: 'Etiquetas',
		tagsHint: 'Separa las etiquetas con comas.',
		madeAtLabel: 'Fecha de fabricación',
		datesNote: 'Las fechas de alta y edición se rellenan automáticamente al guardar.',
		sectionDescription: 'Descripción',
		textLabel: 'Texto',
		textPlaceholder: 'Materiales, proceso, textura, anécdotas del taller…',
		sectionPhotos: 'Fotografías',
		photosHint:
			'La primera imagen es la portada de la pieza. Arrástralas o elígelas del equipo; puedes recortar cada imagen antes de guardar.',
		dropTitle: 'Añade fotografías',
		dropSub: 'JPG, PNG, HEIC… se convierten a WebP',
		sectionI18n: 'Otros idiomas y SEO',
		i18nHint: 'Si lo dejas vacío, el inglés y el catalán usarán el texto en catalán.',
		titleEs: 'Título (español)',
		titleEn: 'Título (inglés)',
		descEs: 'Descripción (español)',
		descEn: 'Descripción (inglés)',
		sectionShop: 'Tienda',
		shopAvailable: 'Disponible en la tienda',
		statusLabel: 'Estado',
		priceLabel: 'Precio (€)',
		submit: 'Guardar la pieza',
		submitEdit: 'Guardar los cambios',
		submitting: 'Guardando…',
		panelExisting: 'Piezas existentes',
		imageSingular: 'imagen',
		imagePlural: 'imágenes',
		panelWhere: 'Dónde se guarda',
		whereJson: 'Textos y slugs (ca/es/en)',
		whereImages: 'Fotografías convertidas a WebP',
		whereHint: 'Esta página y el punto de guardado solo funcionan con astro dev.',
		cropTitle: 'Recorta la imagen',
		cropFree: 'Libre',
		cropHint:
			'Arrastra el marco para moverlo y las esquinas para ajustarlo. El recorte se aplica antes de guardar.',
		cropNote: 'El recorte se guarda al guardar la pieza; la imagen original no se toca.',
		cropApplied: 'Recorte aplicado',
		cropCancel: 'Cancelar',
		cropApply: 'Aplicar el recorte',
		altLabel: 'Texto alternativo',
		badgeCover: 'Portada',
		badgeCropped: 'Recortada',
		crop: 'Recortar',
		cropAgain: 'Recortar de nuevo',
		revert: 'Revertir',
		moveUp: 'Subir',
		moveDown: 'Bajar',
		remove: 'Quitar',
		errorTitle: 'Hace falta un título en catalán.',
		errorPhoto: 'Añade al menos una fotografía.',
		statusConverting: 'Convirtiendo las imágenes…',
		statusSaved: 'Pieza guardada.',
		viewIt: 'Verla',
		reloadNote: 'recarga la galería para verla en la cuadrícula.',
		errorCrop: 'No se ha podido recortar la imagen.',
		errorSave: 'No se ha podido guardar la pieza.',
		errorGeneric: 'Error inesperado.',
	},
	en: {
		metaTitle: 'New piece',
		tag: 'Editor · development only',
		back: 'Back to the gallery',
		eyebrow: 'Content',
		heading: 'New piece',
		headingEdit: 'Edit piece',
		lead: 'Write the title and description, add the photos, crop them if needed and save the piece.',
		leadEdit: 'Change the text, photos or details of the piece and save your changes.',
		previewTitle: 'Preview',
		previewHint: 'This is how the piece will look with the current data.',
		previewEmpty: 'Add a photo to see it here.',
		previewUntitled: 'Untitled piece',
		previewNoDescription: 'No description yet.',
		previewShopAvailable: 'Available in the shop',
		previewShopUnavailable: 'Not available in the shop',
		sectionPiece: 'The piece',
		titleLabel: 'Title',
		noteCa: '(Catalan)',
		slugLabel: 'Slug',
		optional: '(optional)',
		slugPlaceholder: 'autumn-vase',
		madeLabel: 'Workshop',
		categoryLabel: 'Category',
		sizeLabel: 'Size',
		tagsLabel: 'Tags',
		tagsHint: 'Separate tags with commas.',
		madeAtLabel: 'Date made',
		datesNote: 'Added and edited dates are filled in automatically on save.',
		sectionDescription: 'Description',
		textLabel: 'Text',
		textPlaceholder: 'Materials, process, texture, workshop notes…',
		sectionPhotos: 'Photos',
		photosHint:
			'The first image is the piece cover. Drag them in or pick them from your device; you can crop each image before saving.',
		dropTitle: 'Add photos',
		dropSub: 'JPG, PNG, HEIC… converted to WebP',
		sectionI18n: 'Other languages and SEO',
		i18nHint: 'If left empty, Spanish and English will use the Catalan text.',
		titleEs: 'Title (Spanish)',
		titleEn: 'Title (English)',
		descEs: 'Description (Spanish)',
		descEn: 'Description (English)',
		sectionShop: 'Shop',
		shopAvailable: 'Available in the shop',
		statusLabel: 'Status',
		priceLabel: 'Price (€)',
		submit: 'Save piece',
		submitEdit: 'Save changes',
		submitting: 'Saving…',
		panelExisting: 'Existing pieces',
		imageSingular: 'image',
		imagePlural: 'images',
		panelWhere: 'Where it is saved',
		whereJson: 'Text and slugs (ca/es/en)',
		whereImages: 'Photos converted to WebP',
		whereHint: 'This page and the save endpoint only work with astro dev.',
		cropTitle: 'Crop the image',
		cropFree: 'Free',
		cropHint: 'Drag the frame to move it and the corners to resize. The crop is applied before saving.',
		cropNote: 'The crop is saved when you save the piece; the original image is left untouched.',
		cropApplied: 'Crop applied',
		cropCancel: 'Cancel',
		cropApply: 'Apply crop',
		altLabel: 'Alt text',
		badgeCover: 'Cover',
		badgeCropped: 'Cropped',
		crop: 'Crop',
		cropAgain: 'Crop again',
		revert: 'Revert',
		moveUp: 'Move up',
		moveDown: 'Move down',
		remove: 'Remove',
		errorTitle: 'A Catalan title is required.',
		errorPhoto: 'Add at least one photo.',
		statusConverting: 'Converting images…',
		statusSaved: 'Piece saved.',
		viewIt: 'View it',
		reloadNote: 'reload the gallery to see it in the grid.',
		errorCrop: 'Could not crop the image.',
		errorSave: 'Could not save the piece.',
		errorGeneric: 'Unexpected error.',
	},
};
