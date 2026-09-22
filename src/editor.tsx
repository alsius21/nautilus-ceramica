import React, { useMemo, useState } from 'react';
import {
	getAbout,
	getCookies,
	getLegal,
	getSlug,
	works,
	type EditablePageKey,
	type Work,
} from '@/lib/content';
import { editorStrings, pageEditorStrings } from '@/dev/editor-i18n';
import { categoryLabel, PIECE_CATEGORIES, PIECE_SIZES, sizeLabel } from '@/lib/shop-discovery';
import { t, type Locale } from '@/i18n';
import { BASE, localeUrl } from './routes';

type EditorImage = { file?: string; upload?: File; alt: string };
type PieceEditorProps = { locale: Locale; work?: Work };

const statusOptions = ['inquiry', 'available', 'made_to_order', 'reserved', 'sold'] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return <label className="editor-field"><span>{label}</span>{children}</label>;
}

function EditorHeader({ locale, backHref, title }: { locale: Locale; backHref: string; title: string }) {
	return <header className="editor-topline">
		<a className="editor-brand" href={localeUrl(locale, '/')}>nautilusceramica</a>
		<div><span className="editor-tag">{title}</span> <a className="editor-back" href={backHref}>{editorStrings[locale].back}</a></div>
	</header>;
}

export function PieceEditor({ locale, work }: PieceEditorProps) {
	const s = editorStrings[locale];
	const editing = Boolean(work);
	const [titleCa, setTitleCa] = useState(work?.title.ca ?? '');
	const [titleEs, setTitleEs] = useState(work?.title.es ?? '');
	const [titleEn, setTitleEn] = useState(work?.title.en ?? '');
	const [descriptionCa, setDescriptionCa] = useState(work?.description.ca ?? '');
	const [descriptionEs, setDescriptionEs] = useState(work?.description.es ?? '');
	const [descriptionEn, setDescriptionEn] = useState(work?.description.en ?? '');
	const [slug, setSlug] = useState(work?.slugs.ca ?? '');
	const [made, setMade] = useState(work?.made ?? 'hoji');
	const [madeAt, setMadeAt] = useState(work?.madeAt ?? '');
	const [category, setCategory] = useState(work?.category ?? '');
	const [size, setSize] = useState(work?.size ?? '');
	const [tagsCa, setTagsCa] = useState(work?.tags?.ca ?? '');
	const [tagsEs, setTagsEs] = useState(work?.tags?.es ?? '');
	const [tagsEn, setTagsEn] = useState(work?.tags?.en ?? '');
	const [available, setAvailable] = useState(work?.shop.available ?? false);
	const [status, setStatus] = useState(work?.shop.status ?? 'inquiry');
	const [price, setPrice] = useState(work?.shop.price?.toString() ?? '');
	const [dimensions, setDimensions] = useState(work?.shop.dimensions ?? '');
	const [images, setImages] = useState<EditorImage[]>(() => work?.images.map((image) => ({ file: image.file, alt: image.alt[locale] })) ?? []);
	const [message, setMessage] = useState('');
	const [busy, setBusy] = useState(false);

	const addFiles = (files: FileList | null) => {
		if (!files) return;
		const next = Array.from(files).filter((file) => file.type.startsWith('image/')).map((file) => ({ upload: file, alt: '' }));
		setImages((current) => [...current, ...next]);
	};
	const autoSlug = () => {
		if (slug.trim() || !titleCa.trim()) return;
		setSlug(titleCa.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
	};
	const updateImage = (index: number, patch: Partial<EditorImage>) => setImages((current) => current.map((image, i) => i === index ? { ...image, ...patch } : image));
	const moveImage = (index: number, direction: -1 | 1) => setImages((current) => {
		const target = index + direction;
		if (target < 0 || target >= current.length) return current;
		const copy = [...current]; [copy[index], copy[target]] = [copy[target], copy[index]]; return copy;
	});

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!titleCa.trim()) {
			setMessage(s.errorTitle);
			return;
		}
		if (!descriptionCa.trim()) {
			setMessage(locale === 'ca' ? 'Cal una descripció en català.' : locale === 'es' ? 'Hace falta una descripción en catalán.' : 'A Catalan description is required.');
			return;
		}
		if (images.length === 0) {
			setMessage(s.errorPhoto);
			return;
		}
		setBusy(true); setMessage(s.statusConverting);
		try {
			const form = new FormData();
			const payload = {
				...(work ? { id: work.id } : {}),
				title: { ca: titleCa, es: titleEs, en: titleEn },
				description: { ca: descriptionCa, es: descriptionEs, en: descriptionEn },
				slug: { ca: slug }, made, madeAt, category, size,
				tags: { ca: tagsCa, es: tagsEs, en: tagsEn },
				shop: { available, status, price, dimensions },
				images: images.map((image) => ({
					...(image.file ? { file: image.file } : { upload: true }),
					alt: { ca: image.alt, es: image.alt, en: image.alt },
				})),
			};
			form.set('payload', JSON.stringify(payload));
			images.forEach((image, index) => { if (image.upload) form.set(`image-${index}`, image.upload); });
			const response = await fetch(`${BASE}/__content/works`, { method: 'POST', body: form });
			const result = await response.json();
			if (!response.ok || !result.ok) throw new Error(result.error ?? s.errorSave);
			setMessage(`${s.statusSaved} ${result.slug}`);
			// Vite invalidates the JSON module after the middleware writes it. Give
			// HMR a moment to refresh the catalogue before opening the new entry.
			window.setTimeout(() => { window.location.assign(localeUrl(locale, `/${t(locale, 'gallery.path')}/${result.slug}`)); }, 450);
		} catch (error) { setMessage(error instanceof Error ? error.message : s.errorGeneric); }
		finally { setBusy(false); }
	};

	return <main className="editor-page">
		<EditorHeader locale={locale} backHref={localeUrl(locale, `/${t(locale, 'gallery.path')}`)} title={editing ? s.headingEdit : s.heading} />
		<div className="editor-intro"><p className="eyebrow">{s.eyebrow}</p><h1>{editing ? s.headingEdit : s.heading}</h1><p>{editing ? s.leadEdit : s.lead}</p></div>
		<div className="editor-layout">
		<form className="editor-form" onSubmit={submit}>
			<fieldset><legend>{s.sectionPiece}</legend>
				<Field label={`${s.titleLabel} ${s.noteCa}`}><input value={titleCa} onChange={(e) => setTitleCa(e.target.value)} required /></Field>
				<div className="editor-grid-2"><Field label={`${s.slugLabel} ${s.optional}`}><input value={slug} onChange={(e) => setSlug(e.target.value)} onBlur={autoSlug} placeholder={s.slugPlaceholder} /></Field><Field label={s.madeLabel}><select value={made} onChange={(e) => setMade(e.target.value as 'hoji' | 'llotja')}><option value="hoji">{t(locale, 'work.made.hoji')}</option><option value="llotja">{t(locale, 'work.made.llotja')}</option></select></Field></div>
				<div className="editor-grid-2"><Field label={`${s.categoryLabel} ${s.optional}`}><select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}><option value="">{s.optional}</option>{PIECE_CATEGORIES.map((item) => <option key={item} value={item}>{categoryLabel(item, locale)}</option>)}</select></Field><Field label={`${s.sizeLabel} ${s.optional}`}><select value={size} onChange={(e) => setSize(e.target.value as typeof size)}><option value="">{s.optional}</option>{PIECE_SIZES.map((item) => <option key={item} value={item}>{sizeLabel(item, locale)}</option>)}</select></Field></div>
				<div className="editor-grid-2"><Field label={s.madeAtLabel}><input type="date" value={madeAt} onChange={(e) => setMadeAt(e.target.value)} /></Field><Field label={`${s.tagsLabel} (ca)`}><input value={tagsCa} onChange={(e) => setTagsCa(e.target.value)} /></Field></div>
			</fieldset>
			<fieldset><legend>{s.sectionDescription}</legend><Field label={`${s.textLabel} ${s.noteCa}`}><textarea rows={6} value={descriptionCa} onChange={(e) => setDescriptionCa(e.target.value)} required /></Field></fieldset>
			<fieldset><legend>{s.sectionPhotos}</legend><p className="editor-hint">{s.photosHint}</p><label className="editor-dropzone" onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('is-over'); }} onDragLeave={(e) => e.currentTarget.classList.remove('is-over')} onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('is-over'); addFiles(e.dataTransfer.files); }}><input type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} /><strong>{s.dropTitle}</strong><span>{s.dropSub}</span></label><div className="editor-shots">{images.map((image, index) => <div className="editor-shot" key={`${image.file ?? image.upload?.name}-${index}`}>
				{image.file ? <img src={`${BASE}/images/${image.file}.webp`} alt="" /> : image.upload && <img src={URL.createObjectURL(image.upload)} alt="" />}
				<div><input value={image.alt} onChange={(e) => updateImage(index, { alt: e.target.value })} placeholder={s.altLabel} /><div className="editor-shot-actions"><button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0}>↑</button><button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1}>↓</button><button type="button" onClick={() => setImages((current) => current.filter((_, i) => i !== index))}>{s.remove}</button></div></div>
			</div>)}</div></fieldset>
			<details><summary>{s.sectionI18n}</summary><div className="editor-grid-2"><Field label={s.titleEs}><input value={titleEs} onChange={(e) => setTitleEs(e.target.value)} /></Field><Field label={s.titleEn}><input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} /></Field></div><Field label={s.descEs}><textarea rows={3} value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)} /></Field><Field label={s.descEn}><textarea rows={3} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} /></Field><div className="editor-grid-2"><Field label={`${s.tagsLabel} (es)`}><input value={tagsEs} onChange={(e) => setTagsEs(e.target.value)} /></Field><Field label={`${s.tagsLabel} (en)`}><input value={tagsEn} onChange={(e) => setTagsEn(e.target.value)} /></Field></div></details>
			<details><summary>{s.sectionShop}</summary><label className="editor-check"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />{s.shopAvailable}</label><div className="editor-grid-2"><Field label={s.statusLabel}><select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>{statusOptions.map((item) => <option key={item} value={item}>{t(locale, `shop.status.${item}` as Parameters<typeof t>[1])}</option>)}</select></Field><Field label={s.priceLabel}><input type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} /></Field></div><Field label={t(locale, 'shop.detail.dimensions')}><input value={dimensions} onChange={(e) => setDimensions(e.target.value)} /></Field></details>
			<div className="editor-actions"><button className="editor-submit" type="submit" disabled={busy}>{busy ? s.submitting : editing ? s.submitEdit : s.submit}</button><span role="status">{message}</span></div>
		</form>
		<aside className="editor-sidebar">
			<section className="editor-panel" aria-live="polite">
				<h2>{s.previewTitle}<span>{locale.toUpperCase()}</span></h2>
				<article className="editor-preview">
					<div className="editor-preview-media">
						{images[0] ? <img src={images[0].upload ? URL.createObjectURL(images[0].upload) : `${BASE}/images/${images[0].file}.webp`} alt={images[0].alt || titleCa} /> : <p>{s.previewEmpty}</p>}
					</div>
					<div className="editor-preview-copy"><p>{made === 'hoji' ? t(locale, 'work.made.hoji') : t(locale, 'work.made.llotja')}</p><h3>{titleCa || s.previewUntitled}</h3><p>{descriptionCa || s.previewNoDescription}</p>{(category || size || dimensions || price) && <small>{[category && categoryLabel(category as never, locale), size && sizeLabel(size as never, locale), dimensions, price && `${price} €`].filter(Boolean).join(' · ')}</small>}<strong data-available={available}>{available ? s.previewShopAvailable : s.previewShopUnavailable}</strong></div>
				</article>
			</section>
			<section className="editor-panel"><h2>{s.panelExisting}<span>{works.length}</span></h2><ul className="editor-existing">{works.map((entry) => <li key={entry.id}><a href={localeUrl(locale, `/${t(locale, 'gallery.path')}/${getSlug(entry, locale)}`)}><span>{entry.title[locale]}</span><small>{entry.images.length} {entry.images.length === 1 ? s.imageSingular : s.imagePlural}</small></a></li>)}</ul></section>
		</aside>
		</div>
	</main>;
}

type PageEditorProps = { locale: Locale; page: EditablePageKey };
type PageValue = Record<string, unknown>;
const pageFields: Record<EditablePageKey, string[]> = {
	about: ['eyebrow', 'title', 'lead', 's1.title', 's1.body', 's2.title', 's2.body', 's2.link.label', 's2.link.url', 's2.after', 's3.title', 's3.body', 's3.link.label', 's3.link.url', 's3.after', 's4.title', 's4.body', 's5.title', 's5.body'],
	legal: ['eyebrow', 'title', 'lead', 's2.title', 's2.body', 's3.title', 's3.body', 's4.title', 's4.body', 's4.linkLabel', 's5.title', 's5.body', 's6.title', 's6.body', 'updated'],
	cookies: ['eyebrow', 'title', 'lead', 's1.title', 's1.body', 's2.title', 's2.body', 's3.title', 's3.body', 's4.title', 's4.body', 's5.title', 's5.body', 'updated'],
};
function getPath(value: PageValue, path: string) { return path.split('.').reduce<unknown>((current, key) => (current as PageValue)?.[key], value) as string ?? ''; }
function setPath(value: PageValue, path: string, text: string) { const keys = path.split('.'); let current = value; keys.slice(0, -1).forEach((key) => { current[key] = (current[key] as PageValue) ?? {}; current = current[key] as PageValue; }); current[keys[keys.length - 1]] = text; }

export function PageEditor({ locale, page }: PageEditorProps) {
	const strings = pageEditorStrings[locale];
	const source = page === 'about' ? getAbout(locale) : page === 'legal' ? getLegal(locale) : getCookies(locale);
	const [value, setValue] = useState<PageValue>(() => JSON.parse(JSON.stringify(source)) as PageValue);
	const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
	const title = (source as { title: string }).title;
	const published = localeUrl(locale, `/${page === 'about' ? t(locale, 'about.path') : page === 'legal' ? t(locale, 'legal.path') : t(locale, 'cookie.path')}`);
	const fields = useMemo(() => pageFields[page], [page]);
	const save = async () => { setBusy(true); setMessage(strings.saving); try { const response = await fetch(`${BASE}/__content/pages`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ page, locale, content: value }) }); const result = await response.json(); if (!response.ok || !result.ok) throw new Error(result.error ?? strings.errorSave); setMessage(strings.saved); } catch (error) { setMessage(error instanceof Error ? error.message : strings.errorGeneric); } finally { setBusy(false); } };
	return <main className="editor-page"><EditorHeader locale={locale} backHref={published} title={strings.tag} /><div className="editor-intro"><p className="eyebrow">{strings.tag}</p><h1>{title}</h1><p>{strings.editing}</p></div><div className="page-editor-form">{fields.map((field) => <Field key={field} label={field}><textarea rows={field.endsWith('body') || field === 'lead' ? 4 : 2} value={getPath(value, field)} onChange={(e) => { const next = JSON.parse(JSON.stringify(value)) as PageValue; setPath(next, field, e.target.value); setValue(next); }} /></Field>)}</div><div className="editor-actions"><a className="editor-back" href={published}>{strings.view}</a><button className="editor-submit" type="button" onClick={save} disabled={busy}>{busy ? strings.saving : strings.save}</button><span role="status">{message}</span></div></main>;
}
