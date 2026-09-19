import type { Locale } from '@/i18n';
import worksData from '@/content/works.json';
import exhibitionsData from '@/content/exhibitions.json';
import aboutData from '@/content/about.json';
import { PIECE_CATEGORIES, PIECE_SIZES, type PieceCategory, type PieceSize } from '@/lib/shop-discovery';

/**
 * Capa de contingut — l'únic punt d'accés a les dades editorials.
 *
 * Els components i les pàgines importen d'aquí, mai del provider directament.
 * Avui el provider és `local` (JSON versionats a `src/content/`, editables
 * sense tocar codi). Quan es triï Storyblok o Google Sheets, s'hi afegeix un
 * adaptador amb la mateixa signatura i els consumidors no canvien.
 *
 * Selecció via env (només build, no exposada al client):
 *   CONTENT_PROVIDER=local   # per defecte
 */

export type ShopStatus = 'available' | 'reserved' | 'sold' | 'made_to_order' | 'inquiry';

export type LocalizedText = Record<Locale, string>;

export type ContentImage = {
	/**
	 * Ruta relativa sense extensió sota `public/images/` (l'extensió sempre és
	 * `.webp`). Convenció:
	 * - obres: `works/<work.id>/<nom>`;
	 * - exposicions: `exhibitions/<nom>`;
	 * - `instagram/` és àrea de tria i no es pot publicar.
	 */
	file: string;
	alt: LocalizedText;
};

export type ShopInfo = {
	available: boolean;
	status: ShopStatus;
	/** Preu en euros (enter). Absent = "A consultar". */
	price?: number;
	dimensions?: string;
	stripePriceId?: string;
};

export type WorkContent = {
	id: string;
	slugs: LocalizedText;
	title: LocalizedText;
	description: LocalizedText;
	meta: LocalizedText;
	made: 'hoji' | 'llotja';
	/** Category and size are optional so older catalogue entries remain valid. */
	category?: PieceCategory;
	size?: PieceSize;
	/** Comma-separated discovery tags, translated per locale. */
	tags?: LocalizedText;
	/** Data de fabricació (AAAA-MM-DD), opcional. */
	madeAt?: string;
	/** Data d'alta al catàleg (ISO), opcional; l'omple l'editor. */
	addedAt?: string;
	/** Data de l'última edició (ISO), opcional; l'omple l'editor. */
	updatedAt?: string;
	images: ContentImage[];
	shop: ShopInfo;
};

export type ExhibitionContent = {
	slug: string;
	url?: string;
	venue: LocalizedText;
	title: LocalizedText;
	description: LocalizedText;
	meta: LocalizedText;
	images: ContentImage[];
};

export type AboutPlainSection = { title: string; body: string };

export type AboutLinkSection = {
	title: string;
	body: string;
	link: { label: string; url: string };
	after: string;
};

export type AboutContent = {
	eyebrow: string;
	title: string;
	lead: string;
	s1: AboutPlainSection;
	s2: AboutLinkSection;
	s3: AboutLinkSection;
	s4: AboutPlainSection;
	s5: AboutPlainSection;
};

const LOCALES: Locale[] = ['ca', 'es', 'en'];
const SHOP_STATUSES: ShopStatus[] = ['available', 'reserved', 'sold', 'made_to_order', 'inquiry'];

function fail(msg: string): never {
	throw new Error(`[content] ${msg}`);
}

function checkText(value: unknown, path: string): asserts value is LocalizedText {
	for (const locale of LOCALES) {
		const text = (value as Record<string, unknown> | null)?.[locale];
		if (typeof text !== 'string' || text.trim() === '') {
			fail(`falta text a «${path}.${locale}» (cal ca/es/en no buits)`);
		}
	}
}

function checkImage(image: unknown, path: string): asserts image is ContentImage {
	const file = (image as ContentImage | null)?.file;
	if (typeof file !== 'string' || file.trim() === '') fail(`falta «${path}.file»`);
	if (file.includes('..') || file.startsWith('/')) {
		fail(`«${path}.file» no pot contenir «..» ni començar per «/» («${file}»)`);
	}
	if (file.startsWith('instagram/')) {
		fail(`«${path}.file» apunta a instagram/, que no és publicable («${file}»)`);
	}
	if (!file.startsWith('works/') && !file.startsWith('exhibitions/')) {
		fail(`«${path}.file» ha de començar per «works/» o «exhibitions/» («${file}»)`);
	}
	checkText((image as ContentImage).alt, `${path}.alt`);
}

function checkShop(shop: unknown, path: string): asserts shop is ShopInfo {
	const s = shop as ShopInfo | null;
	if (typeof s?.available !== 'boolean') fail(`«${path}.available» ha de ser booleà`);
	if (!SHOP_STATUSES.includes(s.status)) {
		fail(`«${path}.status» invàlid («${s?.status}»); valors: ${SHOP_STATUSES.join(', ')}`);
	}
	if (s.price !== undefined && (!Number.isInteger(s.price) || s.price < 0)) {
		fail(`«${path}.price» ha de ser un enter ≥ 0`);
	}
}

function checkDiscovery(work: WorkContent, path: string): void {
	if (work.category !== undefined && !PIECE_CATEGORIES.includes(work.category)) {
		fail(`${path}.category invàlida`);
	}
	if (work.size !== undefined && !PIECE_SIZES.includes(work.size)) {
		fail(`${path}.size invàlida`);
	}
	if (work.tags !== undefined) {
		checkText(work.tags, `${path}.tags`);
		for (const locale of LOCALES) {
			if (work.tags[locale].split(',').some((tag) => tag.trim() === '')) {
				fail(`${path}.tags.${locale} ha de contenir etiquetes separades per comes sense buits`);
			}
		}
	}
}

function loadWorks(raw: unknown): WorkContent[] {
	if (!Array.isArray(raw)) fail('works.json ha de ser una llista');
	const ids = new Set<string>();
	const slugs = new Set<string>();
	return raw.map((entry, index) => {
		const work = entry as WorkContent;
		const path = `works[${index}]${work?.id ? ` (${work.id})` : ''}`;
		if (typeof work?.id !== 'string' || work.id.trim() === '') fail(`${path}: falta «id»`);
		if (ids.has(work.id)) fail(`«id» duplicat: ${work.id}`);
		ids.add(work.id);
		checkText(work.slugs, `${path}.slugs`);
		for (const locale of LOCALES) {
			const key = `${locale}:${work.slugs[locale]}`;
			if (slugs.has(key)) fail(`slug duplicat «${work.slugs[locale]}» a ${locale}`);
			slugs.add(key);
		}
		checkText(work.title, `${path}.title`);
		checkText(work.description, `${path}.description`);
		checkText(work.meta, `${path}.meta`);
		if (work.made !== 'hoji' && work.made !== 'llotja') {
			fail(`${path}.made ha de ser «hoji» o «llotja»`);
		}
		checkDiscovery(work, path);
		for (const key of ['madeAt', 'addedAt', 'updatedAt'] as const) {
			const value = (work as Record<string, unknown>)[key];
			if (value !== undefined && typeof value !== 'string') fail(`${path}.${key} ha de ser text`);
		}
		if (!Array.isArray(work.images) || work.images.length === 0) {
			fail(`${path}: cal almenys una imatge`);
		}
		work.images.forEach((image, i) => checkImage(image, `${path}.images[${i}]`));
		checkShop(work.shop, `${path}.shop`);
		return work;
	});
}

function loadExhibitions(raw: unknown): ExhibitionContent[] {
	if (!Array.isArray(raw)) fail('exhibitions.json ha de ser una llista');
	const slugs = new Set<string>();
	return raw.map((entry, index) => {
		const exhibition = entry as ExhibitionContent;
		const path = `exhibitions[${index}]${exhibition?.slug ? ` (${exhibition.slug})` : ''}`;
		if (typeof exhibition?.slug !== 'string' || exhibition.slug.trim() === '') {
			fail(`${path}: falta «slug»`);
		}
		if (slugs.has(exhibition.slug)) fail(`«slug» duplicat: ${exhibition.slug}`);
		slugs.add(exhibition.slug);
		checkText(exhibition.venue, `${path}.venue`);
		checkText(exhibition.title, `${path}.title`);
		checkText(exhibition.description, `${path}.description`);
		checkText(exhibition.meta, `${path}.meta`);
		if (!Array.isArray(exhibition.images) || exhibition.images.length === 0) {
			fail(`${path}: cal almenys una imatge`);
		}
		exhibition.images.forEach((image, i) => checkImage(image, `${path}.images[${i}]`));
		return exhibition;
	});
}

function loadAbout(raw: unknown): Record<Locale, AboutContent> {
	for (const locale of LOCALES) {
		const entry = (raw as Record<string, unknown> | null)?.[locale] as AboutContent | undefined;
		if (!entry || typeof entry.title !== 'string' || typeof entry.lead !== 'string') {
			fail(`about.json: falta l'entrada «${locale}» (title/lead/sections)`);
		}
		for (const key of ['s1', 's2', 's3', 's4', 's5'] as const) {
			const section = entry[key];
			if (!section || typeof section.title !== 'string' || typeof section.body !== 'string') {
				fail(`about.json: falta «${locale}.${key}» (title/body)`);
			}
		}
	}
	return raw as Record<Locale, AboutContent>;
}

function loadLocal() {
	return {
		works: loadWorks(worksData),
		exhibitions: loadExhibitions(exhibitionsData),
		about: loadAbout(aboutData),
	};
}

const provider = (import.meta.env.CONTENT_PROVIDER ?? 'local').toLowerCase();
if (provider !== 'local') {
	fail(
		`provider «${provider}» no configurat. Valors admesos avui: «local». ` +
			`Per afegir Storyblok o Google Sheets, implementa l'adaptador a src/lib/content.ts ` +
			`amb la mateixa signatura (works, exhibitions, about).`,
	);
}

// La validació corre en carregar el mòdul: qualsevol dada malmesa
// (idioma buit, slug duplicat, imatge sense alt) fa fallar el build amb
// un missatge que diu exactament on és el problema.
const store = loadLocal();

export const works: WorkContent[] = store.works;
export const exhibitions: ExhibitionContent[] = store.exhibitions;

export type Work = WorkContent;
export type WorkId = Work['id'];
export type Exhibition = ExhibitionContent;

export function getAbout(locale: Locale): AboutContent {
	return store.about[locale] ?? store.about.ca;
}

export function getSlug(work: Work, locale: Locale): string {
	return work.slugs[locale] ?? work.slugs.ca;
}

export function getWorkBySlug(slug: string, locale: Locale): Work | undefined {
	return works.find((work) => getSlug(work, locale) === slug);
}

export function getWorkById(id: string): Work | undefined {
	return works.find((work) => work.id === id);
}

// Legacy helper — finds by any slug or id across locales (for redirects / backwards compat)
export function getWork(slug: string): Work | undefined {
	return (
		works.find((work) => work.id === slug) ??
		works.find((work) => (Object.values(work.slugs) as string[]).includes(slug))
	);
}

export function getExhibition(slug: string): Exhibition | undefined {
	return exhibitions.find((exhibition) => exhibition.slug === slug);
}

/** Relative og-image path (without base) for a work's first image. */
export function workOgImage(work: Work): string {
	return `images/${work.images[0].file}.webp`;
}

/** Relative og-image path (without base) for an exhibition's first image. */
export function exhibitionOgImage(exhibition: Exhibition): string {
	return `images/${exhibition.images[0].file}.webp`;
}
