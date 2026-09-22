import { BRAND_NAME } from '@/consts';
import { exhibitionOgImage, getAbout, getCookies, getLegal, getSlug, workOgImage } from '@/lib/content';
import { locales, t, type Locale } from '@/i18n';
import { resolveRoute } from './routes';

const ORIGIN = 'https://alsius21.github.io';
const BASE = '/nautilus-ceramica/';

type TextKey = Parameters<typeof t>[1];

const PATH_KEYS: TextKey[] = [
	'gallery.path',
	'exhibitions.path',
	'shop.path',
	'shop.article.path',
	'order.path',
	'shop.contact.path',
	'cookie.path',
	'legal.path',
	'about.path',
	'work.path',
];

export type MetaInput = {
	locale: Locale;
	title?: string;
	description?: string;
	path: string;
	image?: string;
	imageAlt?: string;
	imageWidth?: number;
	imageHeight?: number;
	ogType?: 'website' | 'article' | 'product';
	product?: { price?: number; availability?: string; sku?: string };
	noindex?: boolean;
};

function translatePath(locale: Locale, target: Locale, path: string): string {
	if (path === '/') return '/';
	const segments = path.split('/').filter(Boolean);
	const translated = segments.map((segment) => {
		for (const key of PATH_KEYS) {
			if (t(locale, key) === segment) return t(target, key);
		}
		const route = resolveRoute(`${locale === 'ca' ? '' : `/${locale}`}/${path.replace(/^\//, '')}`);
		if (route.kind === 'work') return getSlug(route.work, target);
		if (route.kind === 'shopWork') return getSlug(route.work, target);
		return segment;
	});
	return `/${translated.join('/')}`;
}

export function pageUrl(locale: Locale, path: string): string {
	const prefix = locale === 'ca' ? '' : `/${locale}`;
	const translated = translatePath(locale, locale, path);
	return `${ORIGIN}${BASE.replace(/\/$/, '')}${prefix}${translated === '/' ? '/' : translated}`;
}

function alternateUrl(locale: Locale, target: Locale, path: string): string {
	const prefix = target === 'ca' ? '' : `/${target}`;
	const translated = translatePath(locale, target, path);
	return `${ORIGIN}${BASE.replace(/\/$/, '')}${prefix}${translated === '/' ? '/' : translated}`;
}

export function metaFor(pathname: string): MetaInput {
	const route = resolveRoute(pathname);
	const { locale } = route;
	switch (route.kind) {
		case 'home':
			return { locale, path: '/', title: t(locale, 'home.title') };
		case 'gallery':
			return { locale, path: `/${t(locale, 'gallery.path')}`, title: t(locale, 'gallery.page.title'), description: t(locale, 'gallery.page.meta') };
		case 'work': {
			const work = route.work;
			return {
				locale,
				path: `/${t(locale, 'gallery.path')}/${getSlug(work, locale)}`,
				title: work.title[locale],
				description: work.meta[locale],
				image: workOgImage(work),
				imageAlt: work.images[0].alt[locale],
				ogType: 'article',
			};
		}
		case 'exhibitions':
			return { locale, path: `/${t(locale, 'exhibitions.path')}`, title: t(locale, 'exhibitions.page.title'), description: t(locale, 'exhibitions.page.meta') };
		case 'exhibition': {
			const exhibition = route.exhibition;
			return {
				locale,
				path: `/${t(locale, 'exhibitions.path')}/${exhibition.slug}`,
				title: exhibition.title[locale],
				description: exhibition.meta[locale],
				image: exhibitionOgImage(exhibition),
			};
		}
		case 'shop':
			return { locale, path: `/${t(locale, 'shop.path')}`, title: t(locale, 'shop.page.title'), description: t(locale, 'shop.page.meta') };
		case 'shopWork': {
			const work = route.work;
			const status = work.shop.status;
			const availability = status === 'available' ? 'InStock' : status === 'made_to_order' ? 'PreOrder' : 'OutOfStock';
			return {
				locale,
				path: `/${t(locale, 'shop.path')}/${t(locale, 'shop.article.path')}/${getSlug(work, locale)}`,
				title: work.title[locale],
				description: work.meta[locale],
				image: workOgImage(work),
				imageAlt: work.images[0].alt[locale],
				ogType: 'product',
				product: { price: work.shop.price, availability, sku: work.id },
			};
		}
		case 'order':
			return { locale, path: `/${t(locale, 'order.path')}/${t(locale, 'shop.contact.path')}`, title: t(locale, 'shop.contact.title'), description: t(locale, 'shop.contact.meta') };
		case 'about': {
			const about = getAbout(locale);
			return { locale, path: `/${t(locale, 'about.path')}`, title: about.title, description: about.lead };
		}
		case 'legal': {
			const legal = getLegal(locale);
			return { locale, path: `/${t(locale, 'legal.path')}`, title: legal.title, description: legal.lead };
		}
		case 'cookies': {
			const cookies = getCookies(locale);
			return { locale, path: `/${t(locale, 'cookie.path')}`, title: cookies.title, description: cookies.lead };
		}
		default:
			return { locale, path: '/', title: t(locale, 'notfound.title'), noindex: true };
	}
}

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Full document head contents for a route. */
export function renderHead(meta: MetaInput): string {
	const locale = meta.locale;
	const title = meta.title ?? BRAND_NAME;
	const description = meta.description ?? t(locale, 'meta.description');
	const fullTitle = meta.title ? `${title} · ${BRAND_NAME}` : BRAND_NAME;
	const ogImage = `${ORIGIN}${BASE}${meta.image ?? 'og-image.jpg'}`;
	const url = pageUrl(locale, meta.path);
	const alternates = locales.map((code) => ({ code, href: alternateUrl(locale, code, meta.path) }));
	const product = meta.product;
	const structuredData = product
		? {
				'@context': 'https://schema.org',
				'@type': 'Product',
				name: title,
				description,
				image: [ogImage],
				url,
				sku: product.sku,
				brand: { '@type': 'Brand', name: BRAND_NAME },
				offers:
					product.price !== undefined
						? {
								'@type': 'Offer',
								url,
								price: product.price,
								priceCurrency: 'EUR',
								availability: `https://schema.org/${product.availability ?? 'InStock'}`,
							}
						: undefined,
			}
		: {
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: BRAND_NAME,
				url: `${ORIGIN}${BASE}`,
				inLanguage: locale,
				description,
				image: ogImage,
				author: { '@type': 'Person', name: 'Zara Castillo Martínez' },
			};

	const tags: string[] = [];
	tags.push('<meta charset="utf-8">');
	tags.push('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');
	tags.push('<meta name="color-scheme" content="light dark">');
	tags.push(`<link rel="icon" type="image/png" href="${BASE}favicon.png">`);
	tags.push(`<link rel="icon" href="${BASE}favicon.ico">`);
	tags.push(`<title>${escape(fullTitle)}</title>`);
	tags.push(`<meta name="description" content="${escape(description)}">`);
	if (meta.noindex) tags.push('<meta name="robots" content="noindex, follow">');
	if (!meta.noindex) {
		tags.push(`<link rel="canonical" href="${url}">`);
		for (const alt of alternates) tags.push(`<link rel="alternate" hreflang="${alt.code}" href="${alt.href}">`);
		tags.push(`<link rel="alternate" hreflang="x-default" href="${alternateUrl(locale, 'ca', meta.path)}">`);
	}
	tags.push(`<meta property="og:site_name" content="${BRAND_NAME}">`);
	tags.push(`<meta property="og:type" content="${meta.ogType ?? 'website'}">`);
	tags.push(`<meta property="og:title" content="${escape(fullTitle)}">`);
	tags.push(`<meta property="og:description" content="${escape(description)}">`);
	tags.push(`<meta property="og:url" content="${url}">`);
	tags.push(`<meta property="og:image" content="${ogImage}">`);
	if (meta.imageAlt) tags.push(`<meta property="og:image:alt" content="${escape(meta.imageAlt)}">`);
	if (meta.imageWidth) tags.push(`<meta property="og:image:width" content="${meta.imageWidth}">`);
	if (meta.imageHeight) tags.push(`<meta property="og:image:height" content="${meta.imageHeight}">`);
	if (!meta.image) {
		tags.push('<meta property="og:image:width" content="1200">');
		tags.push('<meta property="og:image:height" content="630">');
	}
	tags.push(`<meta property="og:locale" content="${locale}">`);
	for (const alt of alternates.filter((entry) => entry.code !== locale)) tags.push(`<meta property="og:locale:alternate" content="${alt.code}">`);
	tags.push('<meta name="twitter:card" content="summary_large_image">');
	tags.push(`<meta name="twitter:title" content="${escape(fullTitle)}">`);
	tags.push(`<meta name="twitter:description" content="${escape(description)}">`);
	tags.push(`<meta name="twitter:image" content="${ogImage}">`);
	if (meta.imageAlt) tags.push(`<meta name="twitter:image:alt" content="${escape(meta.imageAlt)}">`);
	tags.push(`<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`);
	tags.push(`<link rel="manifest" href="${BASE}manifest.webmanifest">`);
	tags.push('<meta name="theme-color" content="#eee9e1">');
	tags.push('<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#191712">');
	tags.push('<meta name="mobile-web-app-capable" content="yes">');
	tags.push('<meta name="apple-mobile-web-app-capable" content="yes">');
	tags.push('<meta name="apple-mobile-web-app-status-bar-style" content="default">');
	tags.push(`<meta name="apple-mobile-web-app-title" content="${BRAND_NAME}">`);
	tags.push(`<link rel="apple-touch-icon" href="${BASE}apple-touch-icon.png">`);
	return tags.join('');
}
