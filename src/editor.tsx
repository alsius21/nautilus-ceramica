import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
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
import { locales, t, type Locale } from '@/i18n';
import { Footer } from './components';
import { BASE, localeUrl } from './routes';

type EditorImage = {
	file?: string;
	upload?: File;
	sourceFile?: File;
	alt: string;
	sourceUrl: string;
	previewUrl: string;
	cropped?: boolean;
	width?: number;
	height?: number;
};
type PieceEditorProps = { locale: Locale; work?: Work };
type CropRect = { x: number; y: number; w: number; h: number };
type CropState = { index: number; sourceUrl: string; aspect: number; imgW: number; imgH: number; box: CropRect };
type CropDrag = { mode: 'move' | 'resize'; corner: string; startX: number; startY: number; box: CropRect };

const statusOptions = ['inquiry', 'available', 'made_to_order', 'reserved', 'sold'] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return <label className="field"><span className="label">{label}</span>{children}</label>;
}

function EditorHeader({ locale, backHref, title }: { locale: Locale; backHref: string; title: string }) {
	return <header className="topline">
		<a className="brand" href={localeUrl(locale, '/')}>nautilusceramica</a>
		<div className="topline-meta"><span className="tag">{title}</span><a className="quiet-link" href={backHref}>{editorStrings[locale].back}</a></div>
	</header>;
}

const CROP_MIN = 32;

function revokeObjectUrl(url: string, keep?: string) {
	if (url.startsWith('blob:') && url !== keep) URL.revokeObjectURL(url);
}

function resetCrop(state: CropState, imgW = state.imgW, imgH = state.imgH): CropState {
	if (!imgW || !imgH) return { ...state, imgW, imgH };
	let w = imgW;
	let h = imgH;
	if (state.aspect) {
		if (imgW / imgH > state.aspect) {
			h = imgH * 0.92;
			w = h * state.aspect;
		} else {
			w = imgW * 0.92;
			h = w / state.aspect;
		}
	}
	return { ...state, imgW, imgH, box: { x: (imgW - w) / 2, y: (imgH - h) / 2, w, h } };
}

function resizedCrop(corner: string, start: CropRect, dx: number, dy: number, aspect: number, imgW: number, imgH: number): CropRect {
	let left = start.x;
	let top = start.y;
	let right = start.x + start.w;
	let bottom = start.y + start.h;
	if (corner.includes('e')) right = Math.min(imgW, Math.max(left + CROP_MIN, right + dx));
	if (corner.includes('w')) left = Math.max(0, Math.min(right - CROP_MIN, left + dx));
	if (corner.includes('s')) bottom = Math.min(imgH, Math.max(top + CROP_MIN, bottom + dy));
	if (corner.includes('n')) top = Math.max(0, Math.min(bottom - CROP_MIN, top + dy));
	let w = right - left;
	let h = bottom - top;
	if (aspect) {
		if (w / h > aspect) h = w / aspect;
		else w = h * aspect;
		if (corner.includes('w')) left = right - w;
		if (corner.includes('n')) top = bottom - h;
		if (left < 0) { left = 0; w = right; h = w / aspect; if (corner.includes('n')) top = bottom - h; }
		if (top < 0) { top = 0; h = bottom; w = h * aspect; if (corner.includes('w')) left = right - w; }
		if (left + w > imgW) { w = imgW - left; h = w / aspect; if (corner.includes('n')) top = bottom - h; }
		if (top + h > imgH) { h = imgH - top; w = h * aspect; if (corner.includes('w')) left = right - w; }
	}
	return { x: Math.max(0, left), y: Math.max(0, top), w: Math.max(CROP_MIN, w), h: Math.max(CROP_MIN, h) };
}

async function cropToFile(source: string, rect: CropRect, name: string): Promise<{ file: File; url: string; width: number; height: number } | null> {
	const image = new Image();
	const loaded = new Promise<boolean>((resolve) => {
		image.onload = () => resolve(true);
		image.onerror = () => resolve(false);
	});
	image.src = source;
	if (!(await loaded)) return null;
	const sx = Math.round(rect.x * image.naturalWidth);
	const sy = Math.round(rect.y * image.naturalHeight);
	const sw = Math.max(1, Math.round(rect.w * image.naturalWidth));
	const sh = Math.max(1, Math.round(rect.h * image.naturalHeight));
	const scale = Math.min(1, 2400 / Math.max(sw, sh));
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(sw * scale));
	canvas.height = Math.max(1, Math.round(sh * scale));
	const context = canvas.getContext('2d');
	if (!context) return null;
	context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
	const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
	if (!blob) return null;
	return { file: new File([blob], name, { type: 'image/png' }), url: URL.createObjectURL(blob), width: canvas.width, height: canvas.height };
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
	const [images, setImages] = useState<EditorImage[]>(() => work?.images.map((image) => {
		const url = `${BASE}/images/${image.file}.webp`;
		return { file: image.file, alt: image.alt.ca, sourceUrl: url, previewUrl: url };
	}) ?? []);
	const [message, setMessage] = useState('');
	const [busy, setBusy] = useState(false);
	const [crop, setCrop] = useState<CropState | null>(null);
	const [cropBusy, setCropBusy] = useState(false);
	const dragRef = useRef<CropDrag | null>(null);
	const imagesRef = useRef(images);
	useEffect(() => { imagesRef.current = images; }, [images]);
	useEffect(() => () => imagesRef.current.forEach((image) => { revokeObjectUrl(image.previewUrl, image.sourceUrl); revokeObjectUrl(image.sourceUrl); }), []);
	useEffect(() => {
		if (!crop) return;
		document.body.classList.add('is-cropping');
		const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setCrop(null); };
		document.addEventListener('keydown', onKeyDown);
		return () => { document.removeEventListener('keydown', onKeyDown); document.body.classList.remove('is-cropping'); };
	}, [crop]);

	const addFiles = (files: FileList | File[] | null) => {
		if (!files) return;
		const next = Array.from(files).filter((file) => file.type.startsWith('image/')).map((file) => {
			const url = URL.createObjectURL(file);
			return { upload: file, sourceFile: file, sourceUrl: url, previewUrl: url, alt: '' };
		});
		setImages((current) => [...current, ...next]);
	};
	const autoSlug = () => {
		if (slug.trim() || !titleCa.trim()) return;
		setSlug(titleCa.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
	};
	const updateImage = (index: number, patch: Partial<EditorImage>) => setImages((current) => current.map((image, i) => i === index ? { ...image, ...patch } : image));
	const removeImage = (index: number) => setImages((current) => {
		const removed = current[index];
		if (removed) { revokeObjectUrl(removed.previewUrl, removed.sourceUrl); revokeObjectUrl(removed.sourceUrl); }
		return current.filter((_, i) => i !== index);
	});
	const moveImage = (index: number, direction: -1 | 1) => setImages((current) => {
		const target = index + direction;
		if (target < 0 || target >= current.length) return current;
		const copy = [...current]; [copy[index], copy[target]] = [copy[target], copy[index]]; return copy;
	});
	const revertImage = (index: number) => setImages((current) => current.map((image, i) => {
		if (i !== index || !image.cropped) return image;
		revokeObjectUrl(image.previewUrl, image.sourceUrl);
		return { ...image, upload: image.sourceFile, previewUrl: image.sourceUrl, cropped: false, width: undefined, height: undefined };
	}));
	const openCrop = (index: number) => {
		const image = images[index];
		if (image) setCrop({ index, sourceUrl: image.previewUrl, aspect: 0, imgW: 0, imgH: 0, box: { x: 0, y: 0, w: 0, h: 0 } });
	};
	const setCropAspect = (aspect: number) => setCrop((current) => current ? resetCrop({ ...current, aspect }) : current);
	const onCropImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
		const { clientWidth, clientHeight } = event.currentTarget;
		setCrop((current) => current ? resetCrop(current, clientWidth, clientHeight) : current);
	};
	const onCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!crop) return;
		const handle = (event.target as HTMLElement).dataset.handle ?? '';
		dragRef.current = { mode: handle ? 'resize' : 'move', corner: handle, startX: event.clientX, startY: event.clientY, box: { ...crop.box } };
		event.currentTarget.setPointerCapture(event.pointerId);
		event.preventDefault();
	};
	const onCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		const drag = dragRef.current;
		if (!drag) return;
		setCrop((current) => {
			if (!current) return current;
			const dx = event.clientX - drag.startX;
			const dy = event.clientY - drag.startY;
			const box = drag.mode === 'move'
				? { ...drag.box, x: Math.max(0, Math.min(current.imgW - drag.box.w, drag.box.x + dx)), y: Math.max(0, Math.min(current.imgH - drag.box.h, drag.box.y + dy)) }
				: resizedCrop(drag.corner, drag.box, dx, dy, current.aspect, current.imgW, current.imgH);
			return { ...current, box };
		});
	};
	const endCropDrag = (event: React.PointerEvent<HTMLDivElement>) => {
		dragRef.current = null;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
	};
	const applyCrop = async () => {
		if (!crop || !crop.imgW || !crop.imgH || cropBusy) return;
		const image = images[crop.index];
		if (!image) return;
		setCropBusy(true);
		const rect = { x: crop.box.x / crop.imgW, y: crop.box.y / crop.imgH, w: crop.box.w / crop.imgW, h: crop.box.h / crop.imgH };
		const baseName = (image.upload?.name ?? image.file?.split('/').pop() ?? 'retall').replace(/\.[^.]+$/, '') || 'retall';
		try {
			const result = await cropToFile(image.previewUrl, rect, `${baseName}.png`);
			if (!result) { setMessage(s.errorCrop); return; }
			setImages((current) => current.map((entry, index) => {
				if (index !== crop.index) return entry;
				revokeObjectUrl(entry.previewUrl, entry.sourceUrl);
				return { ...entry, upload: result.file, previewUrl: result.url, cropped: true, width: result.width, height: result.height };
			}));
			setMessage(`${s.cropApplied} · ${result.width} × ${result.height} px`);
			setCrop(null);
		} finally { setCropBusy(false); }
	};

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
					...(image.upload ? { upload: true } : { file: image.file }),
					alt: { ca: image.alt },
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
	const previewTitle = locale === 'es' ? titleEs || titleCa : locale === 'en' ? titleEn || titleCa : titleCa;
	const previewDescription = locale === 'es' ? descriptionEs || descriptionCa : locale === 'en' ? descriptionEn || descriptionCa : descriptionCa;

	return <main className="editor">
		<div className="editor-inner">
		<EditorHeader locale={locale} backHref={localeUrl(locale, `/${t(locale, 'gallery.path')}`)} title={editing ? s.headingEdit : s.heading} />
		<div className="intro"><p className="eyebrow">{s.eyebrow}</p><h1>{editing ? s.headingEdit : s.heading}</h1><p className="lead">{editing ? s.leadEdit : s.lead}</p></div>
		<div className="columns">
		<form className="sheet" onSubmit={submit}>
			<fieldset className="section"><legend className="section-title">{s.sectionPiece}</legend>
				<Field label={`${s.titleLabel} ${s.noteCa}`}><input value={titleCa} onChange={(e) => setTitleCa(e.target.value)} required /></Field>
				<div className="field-row"><Field label={`${s.slugLabel} ${s.optional}`}><input value={slug} onChange={(e) => setSlug(e.target.value)} onBlur={autoSlug} placeholder={s.slugPlaceholder} /></Field><Field label={s.madeLabel}><select value={made} onChange={(e) => setMade(e.target.value as 'hoji' | 'llotja')}><option value="hoji">{t(locale, 'work.made.hoji')}</option><option value="llotja">{t(locale, 'work.made.llotja')}</option></select></Field></div>
				<div className="field-row"><Field label={`${s.categoryLabel} ${s.optional}`}><select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}><option value="">{s.optional}</option>{PIECE_CATEGORIES.map((item) => <option key={item} value={item}>{categoryLabel(item, locale)}</option>)}</select></Field><Field label={`${s.sizeLabel} ${s.optional}`}><select value={size} onChange={(e) => setSize(e.target.value as typeof size)}><option value="">{s.optional}</option>{PIECE_SIZES.map((item) => <option key={item} value={item}>{sizeLabel(item, locale)}</option>)}</select></Field></div>
				<Field label={`${s.tagsLabel} (ca) ${s.optional}`}><input value={tagsCa} onChange={(e) => setTagsCa(e.target.value)} /><span className="field-note">{s.tagsHint}</span></Field>
				<div className="field-row"><Field label={`${s.madeAtLabel} ${s.optional}`}><input type="date" value={madeAt} onChange={(e) => setMadeAt(e.target.value)} /></Field><p className="field-note">{s.datesNote}</p></div>
			</fieldset>
			<fieldset className="section"><legend className="section-title">{s.sectionDescription}</legend><Field label={`${s.textLabel} ${s.noteCa}`}><textarea rows={6} value={descriptionCa} onChange={(e) => setDescriptionCa(e.target.value)} required /></Field></fieldset>
			<fieldset className="section"><legend className="section-title">{s.sectionPhotos}</legend><p className="hint">{s.photosHint}</p><label className="dropzone" onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('is-over'); }} onDragLeave={(e) => e.currentTarget.classList.remove('is-over')} onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('is-over'); addFiles(e.dataTransfer.files); }}><input type="file" accept="image/*" multiple onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ''; }} /><span className="dropzone-title">{s.dropTitle}</span><span className="dropzone-sub">{s.dropSub}</span></label><ul className="shots">{images.map((image, index) => <li className="shot" key={`${image.sourceUrl}-${index}`}>
				<div className="shot-thumb"><img src={image.previewUrl} alt="" /></div><div className="shot-body"><p className="shot-name">{image.upload?.name ?? `${image.file?.split('/').pop()}.webp`} {index === 0 && <span className="cover">{s.badgeCover}</span>} {image.cropped && <><span className="cover is-crop">{s.badgeCropped}</span>{image.width && image.height && <span className="cover is-size">{image.width}×{image.height}</span>}</>}</p><label className="shot-alt"><span>{s.altLabel}</span><input type="text" value={image.alt} onChange={(e) => updateImage(index, { alt: e.target.value })} autoComplete="off" /></label><div className="shot-tools"><button type="button" className="text-button" onClick={() => openCrop(index)}>{image.cropped ? s.cropAgain : s.crop}</button>{image.cropped && <button type="button" className="text-button is-quiet" onClick={() => revertImage(index)}>{s.revert}</button>}</div></div><div className="shot-actions"><button type="button" className="icon-button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label={s.moveUp}>↑</button><button type="button" className="icon-button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} aria-label={s.moveDown}>↓</button><button type="button" className="icon-button" onClick={() => removeImage(index)} aria-label={s.remove}>×</button></div>
			</li>)}</ul></fieldset>
			<details className="section collapsible"><summary className="section-title">{s.sectionI18n} <span>{s.optional}</span></summary><div className="collapsible-body"><p className="hint">{s.i18nHint}</p><div className="field-row"><Field label={s.titleEs}><input value={titleEs} onChange={(e) => setTitleEs(e.target.value)} /></Field><Field label={s.titleEn}><input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} /></Field></div><Field label={s.descEs}><textarea rows={3} value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)} /></Field><Field label={s.descEn}><textarea rows={3} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} /></Field><div className="field-row"><Field label={`${s.tagsLabel} (es)`}><input value={tagsEs} onChange={(e) => setTagsEs(e.target.value)} /></Field><Field label={`${s.tagsLabel} (en)`}><input value={tagsEn} onChange={(e) => setTagsEn(e.target.value)} /></Field></div></div></details>
			<details className="section collapsible"><summary className="section-title">{s.sectionShop} <span>{s.optional}</span></summary><div className="collapsible-body"><label className="check"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /><span>{s.shopAvailable}</span></label><div className="field-row"><Field label={s.statusLabel}><select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>{statusOptions.map((item) => <option key={item} value={item}>{t(locale, `shop.status.${item}` as Parameters<typeof t>[1])}</option>)}</select></Field><Field label={s.priceLabel}><input type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} /></Field></div><Field label={t(locale, 'shop.detail.dimensions')}><input value={dimensions} onChange={(e) => setDimensions(e.target.value)} /></Field></div></details>
			<div className="actions"><button className="submit" type="submit" disabled={busy}>{busy ? s.submitting : editing ? s.submitEdit : s.submit}</button><span role="status">{message}</span></div>
		</form>
		<aside className="sidebar">
			<section className="panel" aria-live="polite">
				<h2 className="panel-title">{s.previewTitle}<span>{locale.toUpperCase()}</span></h2>
				<article className="preview-card">
					<div className="preview-media">
						{images[0] ? <img src={images[0].previewUrl} alt={images[0].alt || previewTitle} /> : <p className="preview-empty">{s.previewEmpty}</p>}
					</div>
					<div className="preview-copy"><p className="preview-kicker">{made === 'hoji' ? t(locale, 'work.made.hoji') : t(locale, 'work.made.llotja')}</p><h3 className="preview-title">{previewTitle || s.previewUntitled}</h3><p className={`preview-description${previewDescription ? '' : ' is-empty'}`}>{previewDescription || s.previewNoDescription}</p>{(category || size || dimensions || price) && <div className="preview-meta">{category && <span>{categoryLabel(category as never, locale)}</span>}{size && <span>{sizeLabel(size as never, locale)}</span>}{dimensions && <span>{dimensions}</span>}{price && <span>{price} €</span>}</div>}<p className="preview-shop" data-available={available}>{available ? s.previewShopAvailable : s.previewShopUnavailable}</p></div>
				</article><p className="hint preview-hint">{s.previewHint}</p>
			</section>
			<section className="panel"><h2 className="panel-title">{s.panelExisting}<span>{works.length}</span></h2><ul className="work-list">{works.map((entry) => <li key={entry.id}><a href={localeUrl(locale, `/${t(locale, 'gallery.path')}/${getSlug(entry, locale)}`)}><span className="work-title">{entry.title[locale]}</span><span className="work-meta">{entry.images.length} {entry.images.length === 1 ? s.imageSingular : s.imagePlural}</span></a></li>)}</ul></section>
			<section className="panel"><h2 className="panel-title">{s.panelWhere}</h2><ul className="path-list"><li><code>src/content/works.json</code><span>{s.whereJson}</span></li><li><code>public/images/works/&lt;slug&gt;/</code><span>{s.whereImages}</span></li></ul><p className="hint">{s.whereHint}</p></section>
		</aside>
		</div>
		{crop && <div className="crop-layer" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setCrop(null); }}><div className="crop-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-title"><header className="crop-header"><h2 id="crop-title">{s.cropTitle}</h2><div className="crop-presets" role="group" aria-label={s.cropTitle}>{[[0, s.cropFree], [1, '1:1'], [0.8, '4:5'], [0.75, '3:4'], [1.7778, '16:9']].map(([aspect, label]) => <button type="button" key={String(aspect)} className={crop.aspect === aspect ? 'is-active' : ''} onClick={() => setCropAspect(Number(aspect))}>{label}</button>)}</div></header><div className="crop-stage"><div className="crop-frame"><img src={crop.sourceUrl} alt="" onLoad={onCropImageLoad} draggable={false} /><div className="crop-box" style={{ left: crop.box.x, top: crop.box.y, width: crop.box.w, height: crop.box.h }} onPointerDown={onCropPointerDown} onPointerMove={onCropPointerMove} onPointerUp={endCropDrag} onPointerCancel={endCropDrag}>{['nw', 'ne', 'sw', 'se'].map((handle) => <span className="crop-h" data-handle={handle} key={handle} />)}</div></div></div><footer className="crop-footer"><p className="hint">{s.cropHint}<br />{s.cropNote}</p><div className="crop-actions"><button type="button" className="ghost" onClick={() => setCrop(null)}>{s.cropCancel}</button><button type="button" className="submit" disabled={cropBusy} onClick={applyCrop}>{cropBusy ? s.submitting : s.cropApply}</button></div></footer></div></div>}



		</div>
	</main>;
}

type PageEditorProps = { locale: Locale; page: EditablePageKey };
type PageValue = Record<string, any>;

function getPath(value: PageValue, path: string): string {
	return path.split('.').reduce<any>((current, key) => current?.[key], value) ?? '';
}
function setPath(value: PageValue, path: string, text: string) {
	const keys = path.split('.');
	let current = value;
	keys.slice(0, -1).forEach((key) => { current[key] = current[key] && typeof current[key] === 'object' ? current[key] : {}; current = current[key]; });
	current[keys[keys.length - 1]] = text;
}
function cloneValue<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function pageEditorHref(locale: Locale, page: EditablePageKey) {
	const key = page === 'about' ? 'editor.page.about.path' : page === 'legal' ? 'editor.page.legal.path' : 'editor.page.cookies.path';
	return localeUrl(locale, '/' + t(locale, 'editor.path') + '/' + t(locale, 'editor.pages.path') + '/' + t(locale, key));
}
function EditableText({ tag, path, value, onChange, className }: { tag: 'p' | 'h1' | 'h2' | 'span'; path: string; value: string; onChange: (path: string, value: string) => void; className?: string }) {
	const props = { className, contentEditable: true, suppressContentEditableWarning: true, 'data-edit': path, onInput: (event: React.FormEvent<HTMLElement>) => onChange(path, event.currentTarget.textContent ?? '') };
	if (tag === 'h1') return <h1 {...props}>{value}</h1>;
	if (tag === 'h2') return <h2 {...props}>{value}</h2>;
	if (tag === 'span') return <span {...props}>{value}</span>;
	return <p {...props}>{value}</p>;
}
function PageEditorBar({ locale, page, value, source, setValue, published, dirty, setDirty }: { locale: Locale; page: EditablePageKey; value: PageValue; source: PageValue; setValue: React.Dispatch<React.SetStateAction<PageValue>>; published: string; dirty: boolean; setDirty: (value: boolean) => void }) {
	const s = pageEditorStrings[locale];
	const [status, setStatus] = useState({ text: '', tone: '' });
	const [busy, setBusy] = useState(false);
	const save = async () => {
		setBusy(true); setStatus({ text: s.saving, tone: 'progress' });
		try {
			const response = await fetch(BASE + '/__content/pages', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ page, locale, content: value }) });
			const result = await response.json().catch(() => ({}));
			if (!response.ok || !result.ok) throw new Error(result.error ?? s.errorSave);
			setDirty(false); setStatus({ text: s.saved, tone: 'ok' }); window.setTimeout(() => window.location.reload(), 400);
		} catch (error) { setStatus({ text: error instanceof Error ? error.message : s.errorGeneric, tone: 'error' }); }
		finally { setBusy(false); }
	};
	const discard = () => { if (dirty && !window.confirm(s.discardConfirm)) return; setDirty(false); setValue(cloneValue(source)); window.location.reload(); };
	return <div className="page-editor"><div className="page-editor__bar">
		<div className="page-editor__lead"><p className="page-editor__tag">{s.tag}</p><p className="page-editor__hint">{s.editing}</p></div>
		<p className="page-editor__status" role="status" aria-live="polite" data-tone={status.tone}>{status.text}</p>
		<div className="page-editor__actions"><nav className="page-editor__langs" aria-label={s.localeSwitcher}>{locales.map((code) => <Link key={code} to={pageEditorHref(code, page)} className={'page-editor__lang' + (code === locale ? ' is-current' : '')} aria-current={code === locale ? 'page' : undefined} title={code.toUpperCase()}>{code}</Link>)}</nav><Link className="page-editor__view" to={published}>{s.view}</Link><button type="button" className="page-editor__discard" onClick={discard}>{s.discard}</button><button type="button" className="page-editor__save" onClick={save} disabled={busy}>{busy ? s.saving : s.save}</button></div>
	</div></div>;
}
function PagePreview({ locale, page, value, onChange, onLink }: { locale: Locale; page: EditablePageKey; value: PageValue; onChange: (path: string, value: string) => void; onLink: (path: string) => void }) {
	const about = page === 'about', legal = page === 'legal';
	const mainClass = about ? 'about' : 'legal';
	const pathKey = about ? 'about.path' : legal ? 'legal.path' : 'cookie.path';
	const backKey = about ? 'about.back' : legal ? 'legal.back' : 'cookie.back';
	const text = (path: string) => getPath(value, path);
	const field = (tag: 'p' | 'h1' | 'h2' | 'span', path: string, className?: string) => <EditableText tag={tag} path={path} value={text(path)} onChange={onChange} className={className} />;
	const section = (path: string) => <section className="clause" key={path}>{field('h2', path + '.title')}{field('p', path + '.body')}</section>;
	let statement: React.ReactNode;
	if (about) statement = <div className="statement">
		<section className="clause">{field('h2', 's1.title')}{field('p', 's1.body')}</section>
		<section className="clause">{field('h2', 's2.title')}<p>{field('span', 's2.body')} <a className="external" href={text('s2.link.url')} data-link-url="s2.link.url" onClick={(event) => event.preventDefault()}><span>{field('span', 's2.link.label')}</span></a><button type="button" className="page-editor__chip" onClick={() => onLink('s2.link.url')}>url</button>{field('span', 's2.after')}</p></section>
		<section className="clause">{field('h2', 's3.title')}<p>{field('span', 's3.body')} <a className="external" href={text('s3.link.url')} data-link-url="s3.link.url" onClick={(event) => event.preventDefault()}><span>{field('span', 's3.link.label')}</span></a><button type="button" className="page-editor__chip" onClick={() => onLink('s3.link.url')}>url</button>{field('span', 's3.after')}</p></section>
		<section className="clause">{field('h2', 's4.title')}{field('p', 's4.body')}</section>
		<section className="clause">{field('h2', 's5.title')}{field('p', 's5.body')}<p style={{ marginTop: '0.75rem' }}><a href="https://www.instagram.com/nautilceramica/" target="_blank" rel="noopener noreferrer" className="external">Instagram →</a></p></section>
	</div>;
	else if (legal) statement = <div className="statement">{['s2', 's3'].map(section)}<section className="clause">{field('h2', 's4.title')}<p>{field('span', 's4.body')} <Link className="internal-link" to={localeUrl(locale, '/' + t(locale, 'cookie.path'))}>{field('span', 's4.linkLabel')}.</Link></p></section>{['s5', 's6'].map(section)}<p className="updated">{t(locale, 'legal.updated')} — {field('span', 'updated')}</p></div>;
	else statement = <div className="statement">{['s1', 's2', 's3', 's4', 's5'].map(section)}<p className="updated">{t(locale, 'cookie.updated')} — {field('span', 'updated')}</p></div>;
	return <main className={mainClass}>
		<header className="journal-header"><div className="header-left"><Link className="back-link" to={localeUrl(locale, '/')}>← {t(locale, backKey as Parameters<typeof t>[1])}</Link><Link className="edit-link" to={pageEditorHref(locale, page)}>{t(locale, 'editor.page')}</Link></div><nav className="lang-switcher" aria-label={t(locale, 'lang.selector')}>{locales.map((code) => <Link key={code} to={localeUrl(code, '/' + t(code, pathKey as Parameters<typeof t>[1]))} className={'lang-link' + (code === locale ? ' is-current' : '')}>{code}</Link>)}</nav></header>
		<article className="entry"><div className="entry-intro">{field('p', 'eyebrow', 'eyebrow')}{field('h1', 'title')}{field('p', 'lead', 'description')}</div>{statement}</article><Footer locale={locale} />
	</main>;
}
export function PageEditor({ locale, page }: PageEditorProps) {
	const source = page === 'about' ? getAbout(locale) : page === 'legal' ? getLegal(locale) : getCookies(locale);
	const [value, setValue] = useState<PageValue>(() => cloneValue(source));
	const [dirty, setDirty] = useState(false);
	const [linkPath, setLinkPath] = useState<string | null>(null);
	const [linkValue, setLinkValue] = useState('');
	const onChange = (path: string, text: string) => { setValue((current) => { const next = cloneValue(current); setPath(next, path, text); return next; }); setDirty(true); };
	const openLink = (path: string) => { setLinkPath(path); setLinkValue(getPath(value, path)); };
	const publishedKey = page === 'about' ? 'about.path' : page === 'legal' ? 'legal.path' : 'cookie.path';
	return <><PagePreview locale={locale} page={page} value={value} onChange={onChange} onLink={openLink} /><PageEditorBar locale={locale} page={page} value={value} source={source as PageValue} setValue={setValue} published={localeUrl(locale, '/' + t(locale, publishedKey as Parameters<typeof t>[1]))} dirty={dirty} setDirty={setDirty} />{linkPath && <div className="page-editor__popover"><label className="page-editor__popover-label" htmlFor="page-editor-link-url">{pageEditorStrings[locale].linkUrl}</label><input id="page-editor-link-url" value={linkValue} onChange={(event) => setLinkValue(event.target.value)} autoFocus /><div className="page-editor__popover-actions"><button type="button" className="page-editor__ghost" onClick={() => setLinkPath(null)}>{pageEditorStrings[locale].linkCancel}</button><button type="button" className="page-editor__save" onClick={() => { onChange(linkPath, linkValue.trim()); setLinkPath(null); }}>{pageEditorStrings[locale].linkApply}</button></div></div>}</>;
}
