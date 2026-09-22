import { getExhibition, getWork, type EditablePageKey, type Exhibition, type Work } from '@/lib/content';
import { normalizeLocale, t, type Locale } from '@/i18n';

export const BASE = '/nautilus-ceramica';

export function stripBase(pathname: string): string {
	const clean = pathname.replace(/^\/nautilus-ceramica/, '');
	return clean.startsWith('/') ? clean : `/${clean}`;
}

export function localeFromPath(pathname: string): Locale {
	const path = stripBase(pathname);
	return normalizeLocale(path === '/es' || path.startsWith('/es/') ? 'es' : path === '/en' || path.startsWith('/en/') ? 'en' : 'ca');
}

export type Route =
	| { kind: 'home'; locale: Locale }
	| { kind: 'gallery'; locale: Locale }
	| { kind: 'work'; locale: Locale; work: Work }
	| { kind: 'exhibitions'; locale: Locale }
	| { kind: 'exhibition'; locale: Locale; exhibition: Exhibition }
	| { kind: 'shop'; locale: Locale }
	| { kind: 'shopWork'; locale: Locale; work: Work }
	| { kind: 'order'; locale: Locale }
	| { kind: 'about'; locale: Locale }
	| { kind: 'legal'; locale: Locale }
	| { kind: 'cookies'; locale: Locale }
	| { kind: 'pieceEditor'; locale: Locale; work?: Work }
	| { kind: 'pageEditor'; locale: Locale; page: EditablePageKey }
	| { kind: 'notfound'; locale: Locale };

export function resolveRoute(pathname: string): Route {
	const locale = localeFromPath(pathname);
	const path = stripBase(pathname).replace(/^\/(es|en)(?=\/|$)/, '') || '/';
	const [first, second, third, fourth] = path.split('/').filter(Boolean);
	if (!first) return { kind: 'home', locale };
	if (first === t(locale, 'editor.path')) {
		if (second === t(locale, 'editor.pieces.path')) {
			if (third === t(locale, 'editor.add.path')) return { kind: 'pieceEditor', locale };
			if (third === t(locale, 'editor.edit.path') && fourth) {
				const work = getWork(fourth);
				return work ? { kind: 'pieceEditor', locale, work } : { kind: 'notfound', locale };
			}
		}
		if (second === t(locale, 'editor.pages.path')) {
			const pageRoutes: Array<[EditablePageKey, string]> = [
				['about', t(locale, 'editor.page.about.path')],
				['legal', t(locale, 'editor.page.legal.path')],
				['cookies', t(locale, 'editor.page.cookies.path')],
			];
			const page = pageRoutes.find(([, segment]) => segment === third)?.[0];
			if (page) return { kind: 'pageEditor', locale, page };
		}
	}
	if (first === t(locale, 'gallery.path')) {
		if (second) {
			const work = getWork(second);
			return work ? { kind: 'work', locale, work } : { kind: 'notfound', locale };
		}
		return { kind: 'gallery', locale };
	}
	if (first === t(locale, 'exhibitions.path')) {
		if (second) {
			const exhibition = getExhibition(second);
			return exhibition ? { kind: 'exhibition', locale, exhibition } : { kind: 'notfound', locale };
		}
		return { kind: 'exhibitions', locale };
	}
	if (first === t(locale, 'shop.path')) {
		if (second === t(locale, 'shop.article.path') && third) {
			const work = getWork(third);
			return work ? { kind: 'shopWork', locale, work } : { kind: 'notfound', locale };
		}
		return { kind: 'shop', locale };
	}
	if (first === t(locale, 'order.path') && second === t(locale, 'shop.contact.path')) return { kind: 'order', locale };
	if (first === t(locale, 'about.path')) return { kind: 'about', locale };
	if (first === t(locale, 'legal.path')) return { kind: 'legal', locale };
	if (first === t(locale, 'cookie.path')) return { kind: 'cookies', locale };
	return { kind: 'notfound', locale };
}

/** Localised directory URL with a trailing slash. */
export function localeUrl(locale: Locale, path = '/'): string {
	const prefix = locale === 'ca' ? '' : `/${locale}`;
	const suffix = path === '/' ? '/' : `${path.replace(/\/$/, '')}/`;
	return `${BASE}${prefix}${suffix}`;
}

export function pagePath(locale: Locale, key: Parameters<typeof t>[1]): string {
	return `/${t(locale, key)}`;
}
