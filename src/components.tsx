import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { BRAND_NAME, SHOP_ENABLED } from '@/consts';
import {
	exhibitions,
	getAbout,
	getCookies,
	getLegal,
	getSlug,
	works,
	type Exhibition,
	type Work,
} from '@/lib/content';
import { categoryLabel, getRelatedWorks, normalizeSearch, PIECE_CATEGORIES, PIECE_SIZES, sizeLabel } from '@/lib/shop-discovery';
import { locales, t, type Locale } from '@/i18n';
import { localeUrl } from './routes';

type TKey = Parameters<typeof t>[1];

const BASE = '/nautilus-ceramica';
const IMG = (file: string) => `${BASE}/images/${file}.webp`;
const INSTAGRAM = 'https://www.instagram.com/nautilceramica/';
const DEV_EDITOR = import.meta.env?.DEV === true;

function pieceEditorUrl(locale: Locale, mode: 'add' | 'edit', id?: string) {
	const segment = mode === 'add' ? 'editor.add.path' : 'editor.edit.path';
	const path = `/${t(locale, 'editor.path')}/${t(locale, 'editor.pieces.path')}/${t(locale, segment)}${id ? `/${id}` : ''}`;
	return localeUrl(locale, path);
}

function pageEditorUrl(locale: Locale, page: 'about' | 'legal' | 'cookies') {
	const key = page === 'about' ? 'editor.page.about.path' : page === 'legal' ? 'editor.page.legal.path' : 'editor.page.cookies.path';
	return localeUrl(locale, `/${t(locale, 'editor.path')}/${t(locale, 'editor.pages.path')}/${t(locale, key)}`);
}

export function Footer({ locale }: { locale: Locale }) {
	return (
		<footer className="site-footer">
			<p className="footer-year">&copy; {new Date().getFullYear()} {BRAND_NAME}</p>
			<div className="footer-links">
				<Link className="footer-legal" to={localeUrl(locale, `/${t(locale, 'about.path')}`)}>{t(locale, 'about.footer')}</Link>
				<Link className="footer-legal" to={localeUrl(locale, `/${t(locale, 'legal.path')}`)}>{t(locale, 'legal.footer')}</Link>
				<Link className="footer-cookies" to={localeUrl(locale, `/${t(locale, 'cookie.path')}`)}>{t(locale, 'cookie.footer')}</Link>
				<a className="footer-instagram" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Instagram</a>
			</div>
		</footer>
	);
}

function LangSwitcher({ locale, target }: { locale: Locale; target: (code: Locale) => string }) {
	return (
		<nav className="lang-switcher" aria-label={t(locale, 'lang.selector')}>
			{locales.map((code) => (
				<Link
					key={code}
					to={target(code)}
					className={`lang-link${code === locale ? ' is-current' : ''}`}
					aria-current={code === locale ? 'page' : undefined}
					title={t(code, 'lang.name')}
				>
					{code}
				</Link>
			))}
		</nav>
	);
}

function PageHeader({ locale, current }: { locale: Locale; current: 'gallery' | 'exhibitions' | 'shop' }) {
	const paths = { gallery: 'gallery.path', exhibitions: 'exhibitions.path', shop: 'shop.path' } as const;
	return (
		<header className="journal-header">
			<Link className="brand-name" to={localeUrl(locale, '/')}>{BRAND_NAME}</Link>
			<div className="header-meta">
				<nav className="page-nav" aria-label={t(locale, 'nav.label')}>
					{(['gallery', 'exhibitions', 'shop'] as const).map((key) => (
						<Link key={key} to={localeUrl(locale, `/${t(locale, paths[key])}`)} aria-current={current === key ? 'page' : undefined}>
							{t(locale, key === 'gallery' ? 'nav.gallery' : key === 'exhibitions' ? 'nav.exhibitions' : 'nav.shop')}
						</Link>
					))}
				</nav>
				<LangSwitcher locale={locale} target={(code) => localeUrl(code, `/${t(code, paths[current])}`)} />
				{DEV_EDITOR && current !== 'exhibitions' && <Link className="dev-link" to={pieceEditorUrl(locale, 'add')}>{t(locale, 'editor.add')}</Link>}
			</div>
		</header>
	);
}

function HomeHeader({ locale }: { locale: Locale }) {
	return (
		<header className="journal-header">
			<Link className="brand-name" to={localeUrl(locale, '/')} aria-label={BRAND_NAME}>
				<h1>{BRAND_NAME}</h1>
			</Link>
			<div className="header-meta">
				<nav className="page-nav" aria-label={t(locale, 'nav.label')}>
					<Link to={localeUrl(locale, `/${t(locale, 'gallery.path')}`)}>{t(locale, 'nav.gallery')}</Link>
					<Link to={localeUrl(locale, `/${t(locale, 'exhibitions.path')}`)}>{t(locale, 'nav.exhibitions')}</Link>
					<Link to={localeUrl(locale, `/${t(locale, 'shop.path')}`)}>{t(locale, 'nav.shop')}</Link>
				</nav>
				<LangSwitcher locale={locale} target={(code) => localeUrl(code, '/')} />
				{DEV_EDITOR && <Link className="dev-link" to={pieceEditorUrl(locale, 'add')}>{t(locale, 'editor.add')}</Link>}
			</div>
		</header>
	);
}

export function ShareButton({ title, text, locale }: { title: string; text: string; locale: Locale }) {
	const defaultLabel = t(locale, 'shop.share');
	const [label, setLabel] = useState(defaultLabel);
	const [busy, setBusy] = useState(false);
	const timer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(timer.current), []);
	const onClick = async () => {
		setBusy(true);
		try {
			if (typeof navigator.share === 'function') {
				await navigator.share({ title, text, url: window.location.href });
				setLabel(t(locale, 'shop.share.shared'));
			} else {
				await navigator.clipboard.writeText(window.location.href);
				setLabel(t(locale, 'shop.share.copied'));
			}
			timer.current = window.setTimeout(() => setLabel(defaultLabel), 2200);
		} catch (error) {
			if ((error as { name?: string })?.name !== 'AbortError') {
				setLabel(t(locale, 'shop.share.error'));
				timer.current = window.setTimeout(() => setLabel(defaultLabel), 3200);
			}
		} finally {
			setBusy(false);
		}
	};
	return (
		<button
			className="share-button"
			type="button"
			aria-label={label}
			title={label}
			disabled={busy}
			onClick={onClick}
			data-share-piece
			data-share-title={title}
			data-share-text={text}
			data-share-default={defaultLabel}
			data-share-copied={t(locale, 'shop.share.copied')}
			data-share-shared={t(locale, 'shop.share.shared')}
			data-share-error={t(locale, 'shop.share.error')}
		>
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<circle cx="18" cy="5" r="2.5" />
				<circle cx="6" cy="12" r="2.5" />
				<circle cx="18" cy="19" r="2.5" />
				<path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
			</svg>
			<span className="sr-only" data-share-label>{label}</span>
		</button>
	);
}

export function Welcome({ locale }: { locale: Locale }) {
	const featured = works.find((work) => work.id === 'peces-descacs')!;
	const images = [
		{ slug: getSlug(works[0], locale), src: works[0].images[0].file, alt: t(locale, 'art.plate') },
		{ slug: getSlug(featured, locale), src: featured.images[0].file, alt: featured.images[0].alt[locale] },
	];
	return (
		<main className="home home-alt">
			<HomeHeader locale={locale} />
			<section className="gallery" aria-label={t(locale, 'gallery.label')}>
				{images.map((image, index) => (
					<Link className={`artwork artwork-${index + 1}`} key={image.slug} to={localeUrl(locale, `/${t(locale, 'gallery.path')}/${image.slug}`)}>
						<figure>
							<img src={IMG(image.src)} alt={image.alt} loading={index === 0 ? 'eager' : 'lazy'} />
						</figure>
					</Link>
				))}
			</section>
			<Footer locale={locale} />
		</main>
	);
}

export function Gallery({ locale }: { locale: Locale }) {
	const images = works
		.filter((work) => work.id !== 'calabaza-a-la-llotja')
		.map((work) => ({ slug: getSlug(work, locale), src: work.images[0].file, alt: work.images[0].alt[locale] }));
	return (
		<main className="portfolio">
			<PageHeader locale={locale} current="gallery" />
			<article className="entry">
				<div className="entry-intro">
					<p className="eyebrow">{t(locale, 'gallery.page.eyebrow')}</p>
					<h1>{t(locale, 'gallery.page.title')}</h1>
					<p className="description">{t(locale, 'gallery.page.description')}</p>
				</div>
				<section className="work-grid" aria-label={t(locale, 'nav.gallery')}>
					{images.map((image, index) => (
						<Link className="artwork" key={image.slug} to={localeUrl(locale, `/${t(locale, 'gallery.path')}/${image.slug}`)}>
							<figure>
								<img src={IMG(image.src)} alt={image.alt} loading={index === 0 ? 'eager' : 'lazy'} />
							</figure>
						</Link>
					))}
				</section>
			</article>
			<Footer locale={locale} />
		</main>
	);
}

export function WorkJournal({ locale, work }: { locale: Locale; work: Work }) {
	const title = work.title[locale];
	const madeAt = work.madeAt ? new Date(`${work.madeAt}T12:00:00`) : null;
	const madeAtLabel = madeAt && !Number.isNaN(madeAt.getTime())
		? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(madeAt)
		: null;
	const shopAvailable = work.shop?.available ?? false;
	return (
		<main className="journal">
			<header className="journal-header">
				<div className="header-left">
					<Link className="back-link" to={localeUrl(locale, `/${t(locale, 'gallery.path')}`)}>← {t(locale, 'gallery.page.eyebrow')}</Link>
					{DEV_EDITOR && <Link className="edit-link" to={pieceEditorUrl(locale, 'edit', work.id)}>{t(locale, 'editor.edit')}</Link>}
				</div>
				<LangSwitcher locale={locale} target={(code) => localeUrl(code, `/${t(code, 'gallery.path')}/${getSlug(work, code)}`)} />
			</header>
			<article className="entry">
				<div className="entry-intro">
					<h1>{title}</h1>
					<p className="description">{work.description[locale]}</p>
					{madeAtLabel && <p className="made-date">{t(locale, 'work.made_at')} {madeAtLabel}</p>}
					<div className="shop-detail">
						<div className="detail-actions">
							<ShareButton title={title} text={work.description[locale]} locale={locale} />
							{shopAvailable && (
									<Link className="shop-link" to={localeUrl(locale, `/${t(locale, 'shop.path')}/${t(locale, 'shop.article.path')}/${getSlug(work, locale)}`)}>
									{t(locale, 'shop.view_in_shop')} →
								</Link>
							)}
						</div>
					</div>
				</div>
				<div className="entry-main">
					<div className={`work-gallery${work.images.length > 1 ? ' is-gallery' : ''}`} aria-label={title}>
						{work.images.map((image, index) => (
							<figure key={image.file}>
								<img src={IMG(image.file)} alt={image.alt[locale]} loading={index === 0 ? 'eager' : 'lazy'} />
							</figure>
						))}
					</div>
				</div>
			</article>
			<Footer locale={locale} />
		</main>
	);
}

export function Exhibitions({ locale }: { locale: Locale }) {
	return (
		<main className="portfolio">
			<PageHeader locale={locale} current="exhibitions" />
			<article className="entry">
				<div className="entry-intro">
					<p className="eyebrow">{t(locale, 'exhibitions.page.eyebrow')}</p>
					<h1>{t(locale, 'exhibitions.page.title')}</h1>
					<p className="description">{t(locale, 'exhibitions.page.description')}</p>
				</div>
				<div className="exhibitions" aria-label={t(locale, 'exhibitions.page.title')}>
					{exhibitions.map((exhibition) => {
						const detail = localeUrl(locale, `/${t(locale, 'exhibitions.path')}/${exhibition.slug}`);
						return (
							<section className="exhibit" key={exhibition.slug}>
								<header className="exhibit-meta">
									<p className="venue">
										{exhibition.url ? <a href={exhibition.url} target="_blank" rel="noopener noreferrer">{exhibition.venue[locale]}</a> : exhibition.venue[locale]}
									</p>
								<h2><Link className="exhibit-link" to={detail}>{exhibition.title[locale]}</Link></h2>
									<p className="description">{exhibition.description[locale]}</p>
								</header>
								<div className="exhibit-grid">
									{exhibition.images.map((image, index) => (
										<Link className="artwork" key={image.file} to={detail}>
											<figure>
												<img src={IMG(image.file)} alt={image.alt[locale]} loading={index === 0 ? 'eager' : 'lazy'} />
											</figure>
										</Link>
									))}
								</div>
							</section>
						);
					})}
				</div>
			</article>
			<Footer locale={locale} />
		</main>
	);
}

export function ExhibitionJournal({ locale, exhibition }: { locale: Locale; exhibition: Exhibition }) {
	const title = exhibition.title[locale];
	return (
		<main className="journal">
			<header className="journal-header">
				<Link className="back-link" to={localeUrl(locale, `/${t(locale, 'exhibitions.path')}`)}>← {t(locale, 'exhibit.back')}</Link>
				<LangSwitcher locale={locale} target={(code) => localeUrl(code, `/${t(code, 'exhibitions.path')}/${exhibition.slug}`)} />
			</header>
			<article className="entry">
				<div className="entry-intro">
					<p className="eyebrow">{exhibition.venue[locale]}</p>
					<h1>{title}</h1>
					<p className="description">{exhibition.description[locale]}</p>
					{exhibition.url && (
						<a className="visit" href={exhibition.url} target="_blank" rel="noopener noreferrer">
							{t(locale, 'exhibit.visit')} ↗
						</a>
					)}
				</div>
				<div className={`work-gallery${exhibition.images.length > 1 ? ' is-gallery' : ''}`} aria-label={title}>
					{exhibition.images.map((image, index) => (
						<figure key={image.file}>
							<img src={IMG(image.file)} alt={image.alt[locale]} loading={index === 0 ? 'eager' : 'lazy'} />
						</figure>
					))}
				</div>
			</article>
			<Footer locale={locale} />
		</main>
	);
}

function BackHeader({ locale, backHref, backLabel, target }: { locale: Locale; backHref: string; backLabel: string; target: (code: Locale) => string }) {
	return (
		<header className="journal-header">
			<Link className="back-link" to={backHref}>← {backLabel}</Link>
			<LangSwitcher locale={locale} target={target} />
		</header>
	);
}

export function About({ locale }: { locale: Locale }) {
	const about = getAbout(locale);
	return (
		<main className="about">
			<header className="journal-header">
				<div className="header-left">
					<Link className="back-link" to={localeUrl(locale, '/')}>← {t(locale, 'about.back')}</Link>
					{DEV_EDITOR && <Link className="edit-link" to={pageEditorUrl(locale, 'about')}>{t(locale, 'editor.page')}</Link>}
				</div>
				<LangSwitcher locale={locale} target={(code) => localeUrl(code, `/${t(code, 'about.path')}`)} />
			</header>
			<article className="entry">
				<div className="entry-intro">
					{about.eyebrow && <p className="eyebrow">{about.eyebrow}</p>}
					<h1>{about.title}</h1>
					<p className="description">{about.lead}</p>
				</div>
				<div className="statement">
					<section className="clause">
						<h2>{about.s1.title}</h2>
						<p>{about.s1.body}</p>
					</section>
					<section className="clause">
						<h2>{about.s2.title}</h2>
						<p>
							<span>{about.s2.body}</span>{' '}
							<a href={about.s2.link.url} target="_blank" rel="noopener noreferrer" className="external">{about.s2.link.label}</a>
							<span>{about.s2.after}</span>
						</p>
					</section>
					<section className="clause">
						<h2>{about.s3.title}</h2>
						<p>
							<span>{about.s3.body}</span>{' '}
							<a href={about.s3.link.url} target="_blank" rel="noopener noreferrer" className="external">{about.s3.link.label}</a>
							<span>{about.s3.after}</span>
						</p>
					</section>
					<section className="clause">
						<h2>{about.s4.title}</h2>
						<p>{about.s4.body}</p>
					</section>
					<section className="clause">
						<h2>{about.s5.title}</h2>
						<p>{about.s5.body}</p>
						<p style={{ marginTop: '0.75rem' }}>
							<a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="external">Instagram →</a>
						</p>
					</section>
				</div>
			</article>
			<Footer locale={locale} />
		</main>
	);
}

export function LegalNotice({ locale }: { locale: Locale }) {
	const legal = getLegal(locale);
	const cookiesHref = localeUrl(locale, `/${t(locale, 'cookie.path')}`);
	return (
		<main className="legal">
			<header className="journal-header">
				<div className="header-left">
					<Link className="back-link" to={localeUrl(locale, '/')}>← {t(locale, 'legal.back')}</Link>
					{DEV_EDITOR && <Link className="edit-link" to={pageEditorUrl(locale, 'legal')}>{t(locale, 'editor.page')}</Link>}
				</div>
				<LangSwitcher locale={locale} target={(code) => localeUrl(code, `/${t(code, 'legal.path')}`)} />
			</header>
			<article className="entry">
				<div className="entry-intro">
					<p className="eyebrow">{legal.eyebrow}</p>
					<h1>{legal.title}</h1>
					<p className="description">{legal.lead}</p>
				</div>
				<div className="statement">
					{[legal.s2, legal.s3].map((section, index) => (
						<section className="clause" key={index}>
							<h2>{section.title}</h2>
							<p>{section.body}</p>
						</section>
					))}
					<section className="clause">
						<h2>{legal.s4.title}</h2>
						<p>
							<span>{legal.s4.body}</span>{' '}
							<Link className="internal-link" to={cookiesHref}><span>{legal.s4.linkLabel}</span>.</Link>
						</p>
					</section>
					{[legal.s5, legal.s6].map((section, index) => (
						<section className="clause" key={index}>
							<h2>{section.title}</h2>
							<p>{section.body}</p>
						</section>
					))}
					<p className="updated">{t(locale, 'legal.updated')} — <span>{legal.updated}</span></p>
				</div>
			</article>
			<Footer locale={locale} />
		</main>
	);
}

export function CookiePolicy({ locale }: { locale: Locale }) {
	const cookies = getCookies(locale);
	return (
		<main className="legal">
			<header className="journal-header">
				<div className="header-left">
					<Link className="back-link" to={localeUrl(locale, '/')}>← {t(locale, 'cookie.back')}</Link>
					{DEV_EDITOR && <Link className="edit-link" to={pageEditorUrl(locale, 'cookies')}>{t(locale, 'editor.page')}</Link>}
				</div>
				<LangSwitcher locale={locale} target={(code) => localeUrl(code, `/${t(code, 'cookie.path')}`)} />
			</header>
			<article className="entry">
				<div className="entry-intro">
					<p className="eyebrow">{cookies.eyebrow}</p>
					<h1>{cookies.title}</h1>
					<p className="description">{cookies.lead}</p>
				</div>
				<div className="statement">
					{[cookies.s1, cookies.s2, cookies.s3, cookies.s4, cookies.s5].map((section, index) => (
						<section className="clause" key={index}>
							<h2>{section.title}</h2>
							<p>{section.body}</p>
						</section>
					))}
					<p className="updated">{t(locale, 'cookie.updated')} — <span>{cookies.updated}</span></p>
				</div>
			</article>
			<Footer locale={locale} />
		</main>
	);
}

type ShopCard = {
	id: string;
	slug: string;
	title: string;
	description: string;
	status: string;
	statusLabel: string;
	category: string;
	size: string;
	search: string;
	href: string;
	src: string;
	alt: string;
};

function shopCards(locale: Locale): ShopCard[] {
	return works
		.filter((work) => work.shop.available)
		.map((work) => {
			const title = work.title[locale];
			const description = work.description[locale];
			const tags = work.tags?.[locale] ?? '';
			const category = work.category ?? '';
			const size = work.size ?? '';
			const search = normalizeSearch(
				`${title} ${description} ${tags} ${category ? categoryLabel(category, locale) : ''} ${size ? sizeLabel(size, locale) : ''}`,
			);
			return {
				id: work.id,
				slug: getSlug(work, locale),
				title,
				description,
				status: work.shop.status,
				statusLabel: t(locale, `shop.status.${work.shop.status}` as TKey),
				category,
				size,
				search,
				href: localeUrl(locale, `/${t(locale, 'shop.path')}/${t(locale, 'shop.article.path')}/${getSlug(work, locale)}`),
				src: work.images[0].file,
				alt: work.images[0].alt[locale],
			};
		});
}

const COUNT_LABELS: Record<Locale, (count: number) => string> = {
	ca: (count) => `${count} ${count === 1 ? 'peça' : 'peces'}`,
	es: (count) => `${count} ${count === 1 ? 'pieza' : 'piezas'}`,
	en: (count) => `${count} ${count === 1 ? 'piece' : 'pieces'}`,
};

const FILTER_COPY: Record<Locale, { search: string; searchPlaceholder: string; details: string; type: string; allTypes: string; size: string; allSizes: string; clear: string; empty: string }> = {
	ca: { search: 'Cerca', searchPlaceholder: 'Nom, acabat o paraula clau', details: 'Filtra per tipus i mida', type: 'Tipus de peça', allTypes: 'Tots els tipus', size: 'Mida', allSizes: 'Totes les mides', clear: 'Neteja filtres', empty: 'No hem trobat cap peça amb aquests criteris.' },
	es: { search: 'Buscar', searchPlaceholder: 'Nombre, acabado o palabra clave', details: 'Filtrar por tipo y tamaño', type: 'Tipo de pieza', allTypes: 'Todos los tipos', size: 'Tamaño', allSizes: 'Todos los tamaños', clear: 'Limpiar filtros', empty: 'No hemos encontrado ninguna pieza con estos criterios.' },
	en: { search: 'Search', searchPlaceholder: 'Name, finish or keyword', details: 'Filter by type and size', type: 'Piece type', allTypes: 'All types', size: 'Size', allSizes: 'All sizes', clear: 'Clear filters', empty: 'No pieces match these criteria.' },
};

const AVAILABLE_WORKS = works.filter((work) => work.shop.available);
const PRESENT_CATEGORIES = PIECE_CATEGORIES.filter((category) => AVAILABLE_WORKS.some((work) => work.category === category));
const PRESENT_SIZES = PIECE_SIZES.filter((size) => AVAILABLE_WORKS.some((work) => work.size === size));

function useCart() {
	const [items, setItems] = useState<string[]>([]);
	const hydrated = useRef(false);
	useEffect(() => {
		try { const stored = JSON.parse(window.localStorage.getItem('nautilus-cart') ?? '[]'); if (Array.isArray(stored)) setItems(stored.filter((id): id is string => typeof id === 'string')); } catch { /* empty cart */ }
		hydrated.current = true;
	}, []);
	useEffect(() => { if (hydrated.current) window.localStorage.setItem('nautilus-cart', JSON.stringify(items)); }, [items]);
	useEffect(() => { const onStorage = () => { try { const stored = JSON.parse(window.localStorage.getItem('nautilus-cart') ?? '[]'); if (Array.isArray(stored)) setItems(stored.filter((id): id is string => typeof id === 'string')); } catch {} }; window.addEventListener('storage', onStorage); return () => window.removeEventListener('storage', onStorage); }, []);
	return { items, setItems, toggle: (id: string) => setItems(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]) };
}

function InquiryForm({ locale, selected, onSuccess, compact = false }: { locale: Locale; selected: string[]; onSuccess: () => void; compact?: boolean }) {
	const [feedback, setFeedback] = useState('');
	const [busy, setBusy] = useState(false);
	const endpoint = import.meta.env?.PUBLIC_FORMSPREE_ENDPOINT ?? 'https://formspree.io/f/xplaceholder';
	const selectedLabels = selected.map(id => { const work = works.find(item => item.id === id); return work ? `${work.title[locale]} — ${getSlug(work, locale)}` : id; });
	const submit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selected.length) { setFeedback(t(locale, 'shop.form.validation_pieces')); return; }
		if (endpoint.includes('xplaceholder')) { setFeedback(t(locale, 'shop.form.error')); return; }
		setBusy(true); setFeedback('');
		try { const response = await fetch(endpoint, { method: 'POST', body: new FormData(event.currentTarget), headers: { Accept: 'application/json' } }); if (!response.ok) throw new Error('form'); event.currentTarget.reset(); onSuccess(); setFeedback(t(locale, 'shop.form.success')); } catch { setFeedback(t(locale, 'shop.form.error')); } finally { setBusy(false); }
	};
	return <section className={`inquiry${compact ? ' is-compact' : ''}`} id="inquiry">
		{!compact && <div className="inquiry-intro"><p className="eyebrow">{t(locale, 'shop.form.eyebrow')}</p><h2>{t(locale, 'shop.form.title')}</h2><p className="lead">{t(locale, 'shop.form.lead')}</p></div>}
		<form className="inquiry-form" onSubmit={submit}><input type="text" name="_gotcha" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" /><input type="hidden" name="_subject" value={`[Nautilus] Interès — ${selectedLabels.join(', ') || 'Peces disponibles'}`} /><input type="hidden" name="_language" value={locale} /><input type="hidden" name="pieces" value={selectedLabels.join(', ')} />
			<div className="field-grid"><div className="field"><label htmlFor="inquiry-name">{t(locale, 'shop.form.name_label')}</label><input id="inquiry-name" name="name" type="text" autoComplete="name" required /></div><div className="field"><label htmlFor="inquiry-email">{t(locale, 'shop.form.email_label')}</label><input id="inquiry-email" name="email" type="email" autoComplete="email" required /></div></div>
			<div className="field"><label htmlFor="inquiry-message">{t(locale, 'shop.form.message_label')}</label><textarea id="inquiry-message" name="message" rows={4} placeholder={t(locale, 'shop.form.message_placeholder')} /></div><button type="submit" className="submit" disabled={busy}>{busy ? '…' : t(locale, 'shop.form.submit')}</button><p className="privacy">{t(locale, 'shop.form.privacy')}</p>{feedback && <p className="form-feedback" role="status" aria-live="polite">{feedback}</p>}
		</form>
	</section>;
}

function CartUI({ locale, items, setItems, contactHref }: { locale: Locale; items: string[]; setItems: React.Dispatch<React.SetStateAction<string[]>>; contactHref: string }) {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	useEffect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
		if (window.matchMedia('(max-width: 768px)').matches) document.body.style.overflow = 'hidden';
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = previousOverflow;
			if (window.matchMedia('(max-width: 768px)').matches) triggerRef.current?.focus({ preventScroll: true });
		};
	}, [open]);
	const entries = items.map(id => works.find(work => work.id === id)).filter((work): work is Work => Boolean(work));
	const total = entries.reduce((sum, work) => sum + (work.shop.price ?? 0), 0);
	const hasInquiry = entries.some(work => work.shop.price === undefined);
	if (!items.length) return null;
	return <><aside className={`cart-sidebar${open ? ' is-open' : ''}`} data-cart role="dialog" aria-modal="true" aria-label={t(locale, 'shop.cart.title')}>
		<div className="cart-head"><h3 className="cart-title">{t(locale, 'shop.cart.title')} — <span>{items.length}</span></h3><div className="cart-head-actions"><button type="button" className="cart-clear" onClick={() => setItems([])}>{t(locale, 'shop.cart.clear')}</button><button type="button" className="cart-close" onClick={() => setOpen(false)} aria-label={t(locale, 'shop.cart.close')}>×</button></div></div>
		<ul className="cart-list">{entries.map(work => <li className="cart-item" key={work.id}><span className="cart-item-title">{work.title[locale]}</span><span className="cart-item-right"><span className="cart-item-price">{work.shop.price ?? t(locale, 'shop.price.inquiry')} {work.shop.price !== undefined ? t(locale, 'shop.price.suffix') : ''}</span><button type="button" className="cart-item-remove" onClick={() => setItems(current => current.filter(id => id !== work.id))} aria-label={`${t(locale, 'shop.cart.remove_label')} ${work.title[locale]}`}>×</button></span></li>)}</ul>
		<p className="cart-total">{total ? `${t(locale, 'shop.cart.total')}: ${total} €${hasInquiry ? ` + ${t(locale, 'shop.price.inquiry').toLocaleLowerCase(locale)}` : ''}` : t(locale, 'shop.price.inquiry')}</p><Link className="cart-cta" to={contactHref}>{t(locale, 'shop.cart.go_to_form')} →</Link>
	</aside><button ref={triggerRef} type="button" className="cart-fab" onClick={() => setOpen(value => !value)} aria-label={t(locale, 'shop.cart.open')} aria-haspopup="dialog" aria-expanded={open}><span aria-hidden="true">▢</span><span className="cart-fab-badge">{items.length}</span></button>{open && <div className="cart-backdrop is-open" onClick={() => setOpen(false)} />}</>;
}

export function Shop({ locale }: { locale: Locale }) {
	const cards = shopCards(locale);
	const cart = useCart();
	const copy = FILTER_COPY[locale];
	const presentCategories = PRESENT_CATEGORIES;
	const presentSizes = PRESENT_SIZES;
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState('');
	const [size, setSize] = useState('');
	const [detailsOpen, setDetailsOpen] = useState(true);
	const queryInput = useRef<HTMLInputElement>(null);

	const valid = (options: readonly string[], value: string) => (value && options.includes(value) ? value : '');

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		setQuery(params.get('q') ?? '');
		setCategory(valid(presentCategories as readonly string[], params.get('category') ?? ''));
		setSize(valid(presentSizes as readonly string[], params.get('size') ?? ''));
		const mq = window.matchMedia('(max-width: 768px)');
		const sync = () => setDetailsOpen(!mq.matches || Boolean(params.get('category') || params.get('size')));
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	}, [presentCategories, presentSizes]);

	const writeFilters = (next: { q: string; category: string; size: string }) => {
		const url = new URL(window.location.href);
		for (const [key, value] of Object.entries(next)) {
			if (value) url.searchParams.set(key, value);
			else url.searchParams.delete(key);
		}
		window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
	};

	const apply = (next: { q: string; category: string; size: string }) => {
		setQuery(next.q);
		setCategory(next.category);
		setSize(next.size);
		writeFilters(next);
	};

	const normalized = normalizeSearch(query);
	const visible = cards.filter(
		(card) =>
			(!normalized || normalizeSearch(card.search).includes(normalized)) &&
			(!category || card.category === category) &&
			(!size || card.size === size),
	);
	const hasFilters = Boolean(normalized || category || size);
	const contactHref = localeUrl(locale, `/${t(locale, 'order.path')}/${t(locale, 'shop.contact.path')}`);

	return (
		<main className="portfolio shop-index">
			<PageHeader locale={locale} current="shop" />
			<article className={`entry is-shop-list${cart.items.length ? ' has-cart' : ''}`}>
				<div className="shop-main">
					{cards.length === 0 ? (
						<p className="empty">{t(locale, 'shop.empty')}</p>
					) : (
						<>
							<div className="shop-filters">
								<form className="filter-form" role="search" onSubmit={(event) => event.preventDefault()}>
									<label className="filter-search">
										<span>{copy.search}</span>
										<input
											type="search"
											name="q"
											value={query}
											placeholder={copy.searchPlaceholder}
											autoComplete="off"
											ref={queryInput}
											onChange={(event) => apply({ q: event.target.value, category, size })}
										/>
									</label>
									<details className="filter-details" open={detailsOpen}>
										<summary>{copy.details}</summary>
										<div className="filter-selects">
											<label>
												<span>{copy.type}</span>
												<select name="category" value={category} onChange={(event) => apply({ q: query, category: event.target.value, size })}>
													<option value="">{copy.allTypes}</option>
													{presentCategories.map((option) => (
														<option value={option} key={option}>{categoryLabel(option, locale)}</option>
													))}
												</select>
											</label>
											<label>
												<span>{copy.size}</span>
												<select name="size" value={size} onChange={(event) => apply({ q: query, category, size: event.target.value })}>
													<option value="">{copy.allSizes}</option>
													{presentSizes.map((option) => (
														<option value={option} key={option}>{sizeLabel(option, locale)}</option>
													))}
												</select>
											</label>
										</div>
									</details>
									<button
										type="button"
										className="filter-clear"
										hidden={!hasFilters}
										onClick={() => {
											apply({ q: '', category: '', size: '' });
											queryInput.current?.focus();
										}}
									>
										{copy.clear}
									</button>
								</form>
							</div>
							<p className="filter-empty" hidden={!(hasFilters && visible.length === 0)}>{copy.empty}</p>
							<section className="shop-grid" aria-label={t(locale, 'shop.page.title')}>
								{visible.map((card, index) => (
									<article
										className="shop-card"
										key={card.id}
										data-card
										data-slug={card.id}
										data-search={card.search}
										data-category={card.category}
										data-size={card.size}
									>
										<Link className="card-link" to={card.href} aria-label={`${card.title} — ${t(locale, 'shop.card.view')}`}>
											<figure>
												<img src={IMG(card.src)} alt={card.alt} loading={index === 0 ? 'eager' : 'lazy'} />
												<span className={`badge badge-${card.status}`}>{card.statusLabel}</span>
											</figure>
										</Link>
										<div className="card-meta">
											<h2 className="card-title"><Link to={card.href}>{card.title}</Link></h2>
										<div className="card-actions">
											<Link className="view-link" to={card.href}>{t(locale, 'shop.card.view')} →</Link>
											{SHOP_ENABLED && <button type="button" className={`cart-btn${cart.items.includes(card.id) ? ' is-added' : ''}`} onClick={() => cart.toggle(card.id)} aria-pressed={cart.items.includes(card.id)}>{cart.items.includes(card.id) ? t(locale, 'shop.card.remove') : t(locale, 'shop.card.add')}</button>}
										</div>
										</div>
									</article>
								))}
							</section>
							<p className="filter-count" aria-live="polite">{COUNT_LABELS[locale](visible.length)}</p>
						</>
					)}
				</div>
				{SHOP_ENABLED && <CartUI locale={locale} items={cart.items} setItems={cart.setItems} contactHref={contactHref} />}
			</article>
			<Footer locale={locale} />
		</main>
	);
}

export function ShopJournal({ locale, work }: { locale: Locale; work: Work }) {
	const title = work.title[locale];
	const description = work.description[locale];
	const shop = work.shop;
	const statusLabel = t(locale, `shop.status.${shop.status}` as TKey);
	const related = getRelatedWorks(work, works);
	const cart = useCart();
	const contactHref = localeUrl(locale, `/${t(locale, 'order.path')}/${t(locale, 'shop.contact.path')}`);
	const priceLabel = work.shop.price === undefined ? t(locale, 'shop.price.inquiry') : `${work.shop.price} ${t(locale, 'shop.price.suffix')}`;
	return (
		<main className="journal shop-journal">
			<header className="journal-header">
				<div className="header-left">
					<Link className="back-link" to={localeUrl(locale, `/${t(locale, 'shop.path')}`)}>← {t(locale, 'shop.page.title')}</Link>
					{DEV_EDITOR && <Link className="edit-link" to={pieceEditorUrl(locale, 'edit', work.id)}>{t(locale, 'editor.edit')}</Link>}
				</div>
				<LangSwitcher locale={locale} target={(code) => localeUrl(code, `/${t(code, 'shop.path')}/${t(code, 'shop.article.path')}/${getSlug(work, code)}`)} />
			</header>
			<article className={`entry${SHOP_ENABLED ? ' has-cart' : ''}`}>
				<div className="entry-intro">
					<h1>{title}</h1>
					<p className="description">{description}</p>
					<div className="shop-detail">
						<dl className="shop-meta">
							<div className="meta-row">
								<dt>{t(locale, 'shop.detail.availability')}</dt>
								<dd><span className={`badge badge-${shop.status}`}>{statusLabel}</span></dd>
							</div>
							{SHOP_ENABLED && <div className="meta-row"><dt>{locale === 'ca' ? 'Preu' : locale === 'es' ? 'Precio' : 'Price'}</dt><dd className={`price${work.shop.price === undefined ? ' is-inquiry' : ''}`}>{priceLabel}</dd></div>}
							{shop.dimensions && (
								<div className="meta-row">
									<dt>{t(locale, 'shop.detail.dimensions')}</dt>
									<dd className="dims">{shop.dimensions}</dd>
								</div>
							)}
						</dl>
						<div className="detail-actions">
							<ShareButton title={title} text={description} locale={locale} />
							<Link className="gallery-link" to={localeUrl(locale, `/${t(locale, 'gallery.path')}/${getSlug(work, locale)}`)}>{t(locale, 'gallery.view_in_gallery')} →</Link>
						</div>
						{SHOP_ENABLED ? <><div className="shop-actions"><button type="button" className={`cart-btn${cart.items.includes(work.id) ? ' is-added' : ''}`} onClick={() => cart.toggle(work.id)} aria-pressed={cart.items.includes(work.id)}>{cart.items.includes(work.id) ? t(locale, 'shop.card.remove') : t(locale, 'shop.card.add')}</button></div><p className="shop-note">{t(locale, 'shop.form.hint')}</p></> : <p className="shop-note">{t(locale, 'shop.disabled.description')}</p>}
					</div>
				</div>
				<div className="entry-main">
					<div className={`work-gallery${work.images.length > 1 ? ' is-gallery' : ''}`} aria-label={title}>
						{work.images.map((image, index) => (
							<figure key={image.file}>
								<img src={IMG(image.file)} alt={image.alt[locale]} loading={index === 0 ? 'eager' : 'lazy'} />
							</figure>
						))}
						</div>
				</div>
				{SHOP_ENABLED && <CartUI locale={locale} items={cart.items} setItems={cart.setItems} contactHref={contactHref} />}
			</article>
			{related.length > 0 && <RelatedPieces pieces={related} category={work.category} locale={locale} />}
			<Footer locale={locale} />
		</main>
	);
}

export function RelatedPieces({ pieces, category, locale }: { pieces: readonly Work[]; category?: Work['category']; locale: Locale }) {
	const copy = {
		ca: { eyebrow: 'També et pot interessar', title: 'Peces que dialoguen amb aquesta', view: 'Veure la peça' },
		es: { eyebrow: 'También te puede interesar', title: 'Piezas que dialogan con esta', view: 'Ver la pieza' },
		en: { eyebrow: 'You may also like', title: 'Pieces that speak to this one', view: 'View piece' },
	} as const;
	const labels = copy[locale];
	const heading = category
		? `${locale === 'ca' ? 'Més' : locale === 'es' ? 'Más' : 'More'} ${categoryLabel(category, locale).toLocaleLowerCase(locale)}`
		: labels.title;
	return (
		<section className="related" aria-labelledby="related-title">
			<div className="related-heading">
				<p className="related-eyebrow">{labels.eyebrow}</p>
				<h2 id="related-title">{heading}</h2>
			</div>
			<div className="related-grid">
				{pieces.map((piece) => (
					<article className="related-card" key={piece.id}>
						<Link className="related-link" to={localeUrl(locale, `/${t(locale, 'shop.path')}/${t(locale, 'shop.article.path')}/${getSlug(piece, locale)}`)} aria-label={`${piece.title[locale]} — ${labels.view}`}>
							<figure>
								<img src={IMG(piece.images[0].file)} alt={piece.images[0].alt[locale]} loading="lazy" sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw" />
							</figure>
							<div className="related-meta">
								<h3>{piece.title[locale]}</h3>
								<span>{labels.view} <span aria-hidden="true">→</span></span>
							</div>
						</Link>
					</article>
				))}
			</div>
		</section>
	);
}

export function ShopContact({ locale }: { locale: Locale }) {
	const shopHref = localeUrl(locale, `/${t(locale, 'shop.path')}`);
	if (!SHOP_ENABLED) {
		return (
			<main className="portfolio">
				<header className="journal-header">
					<Link className="back-link" to={shopHref}>← {t(locale, 'shop.contact.back')}</Link>
					<LangSwitcher locale={locale} target={(code) => localeUrl(code, `/${t(code, 'order.path')}/${t(code, 'shop.contact.path')}`)} />
				</header>
				<article className="entry">
					<div className="entry-intro">
						<p className="eyebrow">{t(locale, 'shop.contact.title')}</p>
						<h1>{t(locale, 'shop.contact.title')}</h1>
						<p className="description">{t(locale, 'shop.contact.fallback')}</p>
					</div>
					<div className="shop-main">
						<div className="contact-fallback">
							<p className="contact-text">{t(locale, 'shop.contact.fallback')}</p>
							<a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="shop-link">Instagram →</a>
							<p className="contact-hint" style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'color-mix(in srgb, var(--ink) 58%, transparent)' }}>
								You can contact me by email at [EMAIL] or through the Instagram account found in the footer of the page.
							</p>
						</div>
					</div>
				</article>
				<meta httpEquiv="refresh" content={`0;url=${shopHref}`} />
				<script dangerouslySetInnerHTML={{ __html: `window.location.replace(${JSON.stringify(shopHref)});` }} />
				<Footer locale={locale} />
			</main>
		);
	}
	const cart = useCart();
	return <main className="portfolio"><header className="journal-header"><Link className="back-link" to={shopHref}>← {t(locale, 'shop.contact.back')}</Link><LangSwitcher locale={locale} target={(code) => localeUrl(code, `/${t(code, 'order.path')}/${t(code, 'shop.contact.path')}`)} /></header><article className="entry"><div className="entry-intro"><p className="eyebrow">{t(locale, 'shop.form.eyebrow')}</p><h1>{t(locale, 'shop.form.title')}</h1><p className="description">{t(locale, 'shop.form.lead')}</p></div><div className="shop-main"><div className="cart cart-contact"><div className="cart-head"><h3 className="cart-title">{t(locale, 'shop.cart.title')} — <span>{cart.items.length}</span></h3><button type="button" className="cart-clear" onClick={() => cart.setItems([])}>{t(locale, 'shop.cart.clear')}</button></div><ul className="cart-list">{cart.items.map(id => { const work = works.find(item => item.id === id); return work ? <li className="cart-item" key={id}><span className="cart-item-title">{work.title[locale]}</span></li> : null; })}</ul></div><InquiryForm locale={locale} selected={cart.items} onSuccess={() => cart.setItems([])} compact /></div></article><Footer locale={locale} /></main>;
}

export function NotFound({ locale }: { locale: Locale }) {
	const title = t(locale, 'notfound.title');
	return (
		<main className="not-found">
			<div className="panel">
				<p className="eyebrow">{t(locale, 'notfound.eyebrow')}</p>
				<h1>{title}</h1>
				<p className="body">{t(locale, 'notfound.body')}</p>
				<nav className="links" aria-label={title}>
					<Link to={localeUrl(locale, '/')}>{t(locale, 'notfound.home')}</Link>
					<Link to={localeUrl(locale, `/${t(locale, 'gallery.path')}`)}>{t(locale, 'nav.gallery')}</Link>
				</nav>
			</div>
			<Footer locale={locale} />
		</main>
	);
}
