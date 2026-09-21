import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Editor de contingut — eina de desenvolupament.
 *
 * Les pàgines són pàgines normals sota `src/pages/` (`/contingut/peces/afegir`,
 * `/contingut/peces/editar/<id>`, i les versions es/en). Aquesta integració hi
 * afegeix el punt de desament (`POST /__content/works`), que només existeix
 * mentre corre `astro dev`, i esborra les pàgines de l'editor de `dist/` en
 * compilar, perquè no arribin mai a producció.
 *
 * El desament converteix les fotografies a WebP amb `sharp`, les desa a
 * `public/images/works/<id>/` (la convenció que valida `src/lib/content.ts`) i
 * reescriu `src/content/works.json` amb el mateix estil que la resta del fitxer.
 * Amb `payload.id` actualitza una peça existent (i actualitza `updatedAt`);
 * sense, n'afegeix una de nova.
 */

const LOCALES = ['ca', 'es', 'en'];
const MADE = ['hoji', 'llotja'];
const STATUSES = ['available', 'reserved', 'sold', 'made_to_order', 'inquiry'];
const CATEGORIES = ['vase', 'cup', 'bowl', 'plate', 'bottle', 'juicer', 'sculpture', 'other'];
const SIZES = ['small', 'medium', 'large'];

const routePath = '/__content/works';
const pagesRoutePath = '/__content/pages';

/** Pàgines editables: fitxer a `src/content/` i esquema de camps (text). */
const PAGE_FILES = { about: 'about.json', legal: 'legal.json', cookies: 'cookies.json' };
const PAGE_SCHEMAS = {
	about: {
		eyebrow: 'text',
		title: 'text',
		lead: 'text',
		s1: { title: 'text', body: 'text' },
		s2: { title: 'text', body: 'text', link: { label: 'text', url: 'text' }, after: 'text' },
		s3: { title: 'text', body: 'text', link: { label: 'text', url: 'text' }, after: 'text' },
		s4: { title: 'text', body: 'text' },
		s5: { title: 'text', body: 'text' },
	},
	legal: {
		eyebrow: 'text',
		title: 'text',
		lead: 'text',
		s2: { title: 'text', body: 'text' },
		s3: { title: 'text', body: 'text' },
		s4: { title: 'text', body: 'text', linkLabel: 'text' },
		s5: { title: 'text', body: 'text' },
		s6: { title: 'text', body: 'text' },
		updated: 'text',
	},
	cookies: {
		eyebrow: 'text',
		title: 'text',
		lead: 'text',
		s1: { title: 'text', body: 'text' },
		s2: { title: 'text', body: 'text' },
		s3: { title: 'text', body: 'text' },
		s4: { title: 'text', body: 'text' },
		s5: { title: 'text', body: 'text' },
		updated: 'text',
	},
};

function fail(message, status = 400) {
	const error = new Error(message);
	error.status = status;
	return error;
}

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

function slugify(value) {
	return clean(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60);
}

function truncate(value, max = 158) {
	const text = clean(value).replace(/\s+/g, ' ');
	if (text.length <= max) return text;
	return `${text.slice(0, max - 1).trimEnd()}…`;
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function localized(payload, key, fallback, slugFallback) {
	const source = payload?.[key] ?? {};
	const output = {};
	for (const locale of LOCALES) {
		const raw = key === 'slugs' ? slugify(source[locale]) : clean(source[locale]);
		output[locale] = raw || (key === 'slugs' ? slugFallback : fallback);
	}
	return output;
}

function tagText(value) {
	return clean(value)
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean)
		.join(', ');
}

function buildText(payload) {
	const titleCa = clean(payload?.title?.ca);
	if (!titleCa) throw fail('Cal un títol en català.');

	const descriptionCa = clean(payload?.description?.ca);
	if (!descriptionCa) throw fail('Cal una descripció en català.');

	const slugCa = slugify(payload?.slug?.ca) || slugify(titleCa);
	if (!slugCa) throw fail('No s’ha pogut generar un identificador per a la peça.');

	const title = localized(payload, 'title', titleCa, slugCa);
	const description = localized(payload, 'description', descriptionCa, slugCa);
	const slugs = localized(payload, 'slugs', titleCa, slugCa);

	const metaSource = payload?.meta ?? {};
	const meta = {};
	for (const locale of LOCALES) {
		meta[locale] = clean(metaSource[locale]) || truncate(description[locale]);
	}

	const made = MADE.includes(payload?.made) ? payload.made : 'hoji';
	let category;
	if (payload?.category !== undefined && payload.category !== '') {
		if (!CATEGORIES.includes(payload.category)) throw fail('La categoria de la peça no és vàlida.');
		category = payload.category;
	}
	let size;
	if (payload?.size !== undefined && payload.size !== '') {
		if (!SIZES.includes(payload.size)) throw fail('La mida de la peça no és vàlida.');
		size = payload.size;
	}
	if (payload?.tags !== undefined && (payload.tags === null || typeof payload.tags !== 'object' || Array.isArray(payload.tags))) {
		throw fail('Les etiquetes han de ser un objecte amb valors ca/es/en.');
	}
	const tagsSource = payload?.tags ?? {};
	for (const locale of LOCALES) {
		if (tagsSource[locale] !== undefined && typeof tagsSource[locale] !== 'string') {
			throw fail(`Les etiquetes de ${locale} han de ser text.`);
		}
	}
	const tagsCa = tagText(tagsSource.ca);
	if (!tagsCa && LOCALES.some((locale) => tagText(tagsSource[locale]))) {
		throw fail('Cal indicar les etiquetes en català abans dels altres idiomes.');
	}
	const localizedTags = tagsCa
		? Object.fromEntries(
				LOCALES.map((locale) => [locale, tagText(tagsSource[locale]) || tagsCa]),
			)
		: undefined;

	const shopRaw = payload?.shop ?? {};
	const shop = {
		available: shopRaw.available === true,
		status: STATUSES.includes(shopRaw.status) ? shopRaw.status : 'sold',
	};
	if (shopRaw.price !== undefined && shopRaw.price !== null && `${shopRaw.price}`.trim() !== '') {
		const price = Number(shopRaw.price);
		if (!Number.isInteger(price) || price < 0) throw fail('El preu ha de ser un enter ≥ 0.');
		shop.price = price;
	}
	const dimensions = clean(shopRaw.dimensions);
	if (dimensions) shop.dimensions = dimensions;

	let madeAt;
	const madeAtRaw = clean(payload?.madeAt);
	if (madeAtRaw) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(madeAtRaw)) {
			throw fail('La data de fabricació ha de tenir el format AAAA-MM-DD.');
		}
		madeAt = madeAtRaw;
	}

	return { title, description, slugs, meta, made, madeAt, shop, category, size, tags: localizedTags };
}

function templateAlt(title, index) {
	return index === 0 ? title : `${title} — detall ${index}`;
}

function buildAlt(rawAlt, title, index) {
	const altCa = clean(rawAlt?.ca) || templateAlt(title.ca, index);
	const alt = {};
	for (const locale of LOCALES) {
		alt[locale] = clean(rawAlt?.[locale]) || (locale === 'ca' ? altCa : templateAlt(title[locale], index));
	}
	return alt;
}

function localizedInline(text) {
	return `{ "ca": ${JSON.stringify(text.ca)}, "es": ${JSON.stringify(text.es)}, "en": ${JSON.stringify(text.en)} }`;
}

function localizedBlock(text) {
	return [
		'{',
		`      "ca": ${JSON.stringify(text.ca)},`,
		`      "es": ${JSON.stringify(text.es)},`,
		`      "en": ${JSON.stringify(text.en)}`,
		'    }',
	].join('\n');
}

function shopInline(shop) {
	const parts = [`"available": ${shop.available}`, `"status": ${JSON.stringify(shop.status)}`];
	if (shop.price !== undefined) parts.push(`"price": ${shop.price}`);
	if (shop.dimensions) parts.push(`"dimensions": ${JSON.stringify(shop.dimensions)}`);
	return `{ ${parts.join(', ')} }`;
}

function formatWork(work) {
	const images = work.images
		.map(
			(image) =>
				[
					'      {',
					`        "file": ${JSON.stringify(image.file)},`,
					'        "alt": {',
					`          "ca": ${JSON.stringify(image.alt.ca)},`,
					`          "es": ${JSON.stringify(image.alt.es)},`,
					`          "en": ${JSON.stringify(image.alt.en)}`,
					'        }',
					'      }',
				].join('\n'),
		)
		.join(',\n');

	const lines = [
		'  {',
		`    "id": ${JSON.stringify(work.id)},`,
		`    "slugs": ${localizedInline(work.slugs)},`,
		`    "title": ${localizedInline(work.title)},`,
		`    "description": ${localizedBlock(work.description)},`,
		`    "meta": ${localizedBlock(work.meta)},`,
		`    "made": ${JSON.stringify(work.made)},`,
	];
	if (work.madeAt) lines.push(`    "madeAt": ${JSON.stringify(work.madeAt)},`);
	if (work.addedAt) lines.push(`    "addedAt": ${JSON.stringify(work.addedAt)},`);
	if (work.updatedAt) lines.push(`    "updatedAt": ${JSON.stringify(work.updatedAt)},`);
	if (work.category) lines.push(`    "category": ${JSON.stringify(work.category)},`);
	if (work.size) lines.push(`    "size": ${JSON.stringify(work.size)},`);
	if (work.tags) lines.push(`    "tags": ${localizedInline(work.tags)},`);
	lines.push('    "images": [', images, '    ],', `    "shop": ${shopInline(work.shop)}`, '  }');
	return lines.join('\n');
}

async function readWorks(root) {
	const file = path.join(root, 'src', 'content', 'works.json');
	const raw = await fs.readFile(file, 'utf8');
	let data;
	try {
		data = JSON.parse(raw);
	} catch {
		throw fail('works.json no s’ha pogut interpretar.', 500);
	}
	if (!Array.isArray(data)) throw fail('works.json ha de ser una llista.', 500);
	return { file, data };
}

async function writeWorks(root, data) {
	const file = path.join(root, 'src', 'content', 'works.json');
	const body = data.map((work) => formatWork(work)).join(',\n');
	await fs.writeFile(file, `[\n${body}\n]\n`, 'utf8');
}

async function nextImageIndex(dir, id) {
	try {
		const entries = await fs.readdir(dir);
		const pattern = new RegExp(`^${escapeRegExp(id)}-(\\d+)\\.webp$`);
		let max = 0;
		for (const name of entries) {
			const match = pattern.exec(name);
			if (match) max = Math.max(max, Number(match[1]));
		}
		return max + 1;
	} catch {
		return 1;
	}
}

async function resolveImages({ form, payload, id, title, startIndex }) {
	const rawImages = Array.isArray(payload?.images) ? payload.images : [];
	if (rawImages.length === 0) throw fail('Cal almenys una fotografia.');

	const images = [];
	const uploads = [];
	const migrations = [];
	let counter = startIndex;

	for (let index = 0; index < rawImages.length; index += 1) {
		const raw = rawImages[index] ?? {};
		const alt = buildAlt(raw.alt, title, index);

		if (raw.upload !== true && typeof raw.file === 'string' && raw.file.trim() !== '') {
			const file = raw.file.trim();
			const normalizedFile = file.startsWith(`${id}/`) ? `works/${file}` : file;
			if (!normalizedFile.startsWith('works/') && !normalizedFile.startsWith('exhibitions/')) {
				throw fail(`La ruta de la fotografia ${index + 1} ha de començar per «works/» o «exhibitions/».`);
			}
			images.push({ file: normalizedFile, alt });
			if (normalizedFile !== file) migrations.push({ from: file, to: normalizedFile });
			continue;
		}

		const upload = form.get(`image-${index}`);
		const isUpload = typeof upload === 'object' && upload !== null && typeof upload.arrayBuffer === 'function';
		if (!isUpload || upload.size === 0) throw fail(`Falta la fotografia ${index + 1}.`);
		if (!String(upload.type ?? '').startsWith('image/')) {
			throw fail(`«${upload.name ?? `fotografia ${index + 1}`}» no és una imatge.`);
		}

		const file = `works/${id}/${id}-${String(counter).padStart(2, '0')}`;
		counter += 1;
		images.push({ file, alt });
		uploads.push({ file, upload });
	}

	return { images, uploads, migrations };
}

async function convertToWebp(sharp, file) {
	const input = Buffer.from(await file.arrayBuffer());
	return sharp(input)
		.rotate()
		.resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 82 })
		.toBuffer();
}

async function writeUploads(root, dir, uploads) {
	if (uploads.length === 0) return;
	await fs.mkdir(dir, { recursive: true });
	const sharp = (await import('sharp')).default;
	for (const item of uploads) {
		const buffer = await convertToWebp(sharp, item.upload);
		await fs.writeFile(path.join(root, 'public', 'images', `${item.file}.webp`), buffer);
	}
}

async function migrateImages(root, migrations) {
	for (const migration of migrations) {
		const from = path.join(root, 'public', 'images', `${migration.from}.webp`);
		const to = path.join(root, 'public', 'images', `${migration.to}.webp`);
		if (from === to) continue;
		try {
			await fs.mkdir(path.dirname(to), { recursive: true });
			await fs.rename(from, to);
		} catch (error) {
			if (error?.code !== 'ENOENT') throw error;
		}
	}
}

async function pruneImages(dir, id, images) {
	let entries;
	try {
		entries = await fs.readdir(dir);
	} catch {
		return;
	}
	const referenced = new Set(
		images
			.filter((image) => image.file.startsWith(`works/${id}/`))
			.map((image) => `${path.basename(image.file)}.webp`),
	);
	let removed = 0;
	for (const name of entries) {
		if (!name.endsWith('.webp') || referenced.has(name)) continue;
		await fs.rm(path.join(dir, name), { force: true });
		removed += 1;
	}
	if (removed > 0) {
		const remaining = await fs.readdir(dir).catch(() => []);
		if (remaining.length === 0) await fs.rmdir(dir).catch(() => {});
	}
}

async function readMultipart(req) {
	const chunks = [];
	for await (const chunk of req) chunks.push(chunk);
	const body = Buffer.concat(chunks);
	const response = new Response(body, {
		headers: { 'content-type': req.headers['content-type'] ?? '' },
	});
	return response.formData();
}

function sendJson(res, status, payload) {
	res.statusCode = status;
	res.setHeader('content-type', 'application/json; charset=utf-8');
	res.setHeader('cache-control', 'no-store');
	res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
	const chunks = [];
	for await (const chunk of req) chunks.push(chunk);
	const text = Buffer.concat(chunks).toString('utf8').trim();
	if (text === '') return {};
	try {
		return JSON.parse(text);
	} catch {
		throw fail('Les dades rebudes no són JSON vàlid.');
	}
}

/** Valida i normalitza el contingut d'una pàgina segons el seu esquema. */
function sanitize(schema, value, path) {
	const output = {};
	for (const [key, spec] of Object.entries(schema)) {
		const raw = value?.[key];
		if (spec === 'text') {
			const text = clean(raw);
			if (key === 'title' && text === '') throw fail(`Falta «${path}.${key}».`);
			if (key === 'lead' && text === '') throw fail(`Falta «${path}.${key}».`);
			output[key] = text;
			continue;
		}
		if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
			throw fail(`Falten dades a «${path}.${key}».`);
		}
		output[key] = sanitize(spec, raw, `${path}.${key}`);
	}
	return output;
}

function isInlineLeaf(value) {
	return (
		value !== null &&
		typeof value === 'object' &&
		!Array.isArray(value) &&
		Object.values(value).every((item) => item === null || typeof item !== 'object')
	);
}

/**
 * Escriu JSON amb el mateix estil que els fitxers de `src/content/`: els
 * objectes s'expandeixen, excepte els enllaços (`link`), que queden en una línia.
 */
function formatJsonValue(value, indent, key) {
	const pad = '  '.repeat(indent);
	if (value === null || typeof value !== 'object') return JSON.stringify(value);
	if (Array.isArray(value)) {
		if (value.length === 0) return '[]';
		const inner = value
			.map((item) => `${'  '.repeat(indent + 1)}${formatJsonValue(item, indent + 1)}`)
			.join(',\n');
		return `[\n${inner}\n${pad}]`;
	}
	const entries = Object.entries(value);
	if (entries.length === 0) return '{}';
	if (key === 'link' && isInlineLeaf(value)) {
		return `{ ${entries.map(([item, text]) => `${JSON.stringify(item)}: ${JSON.stringify(text)}`).join(', ')} }`;
	}
	const inner = entries
		.map(([item, child]) => `${'  '.repeat(indent + 1)}${JSON.stringify(item)}: ${formatJsonValue(child, indent + 1, item)}`)
		.join(',\n');
	return `{\n${inner}\n${pad}}`;
}

async function readPage(root, page) {
	const file = path.join(root, 'src', 'content', PAGE_FILES[page]);
	const raw = await fs.readFile(file, 'utf8');
	let data;
	try {
		data = JSON.parse(raw);
	} catch {
		throw fail(`${PAGE_FILES[page]} no s’ha pogut interpretar.`, 500);
	}
	if (data === null || typeof data !== 'object' || Array.isArray(data)) {
		throw fail(`${PAGE_FILES[page]} ha de ser un objecte amb entrades ca/es/en.`, 500);
	}
	// Respectem el final de línia del fitxer per no embrutar el diff (CRLF a Windows).
	const eol = raw.includes('\r\n') ? '\r\n' : '\n';
	return { file, data, eol };
}

export default function contentEditor() {
	let root = process.cwd();

	return {
		name: 'nautilus-content-editor',
		hooks: {
			'astro:config:setup': ({ config }) => {
				root = fileURLToPath(config.root);
			},
			'astro:server:setup': ({ server, logger }) => {
				server.middlewares.use(async (req, res, next) => {
					const url = (req.url ?? '').split('?')[0] ?? '';

					if (url.endsWith(pagesRoutePath)) {
						try {
							if (req.method !== 'POST') {
								return sendJson(res, 405, { ok: false, error: 'Mètode no admès.' });
							}
							const payload = await readJsonBody(req);
							const page = clean(payload?.page);
							if (!Object.prototype.hasOwnProperty.call(PAGE_FILES, page)) {
								throw fail('La pàgina indicada no és editable.');
							}
							const locale = clean(payload?.locale);
							if (!LOCALES.includes(locale)) throw fail('L’idioma indicat no és vàlid.');

							const content = sanitize(PAGE_SCHEMAS[page], payload?.content, page);
							const { file, data, eol } = await readPage(root, page);
							data[locale] = content;
							const body = formatJsonValue(data, 0).replace(/\n/g, eol);
							await fs.writeFile(file, `${body}${eol}`, 'utf8');

							logger.info(`pàgina «${page}» (${locale}) desada`);
							return sendJson(res, 200, { ok: true, page, locale });
						} catch (error) {
							const status = error?.status ?? 500;
							const message = error?.message ?? 'Error inesperat en desar la pàgina.';
							logger.error(message);
							return sendJson(res, status, { ok: false, error: message });
						}
					}

					if (!url.endsWith(routePath)) return next();

					try {
						if (req.method === 'GET') {
							const { data } = await readWorks(root);
							return sendJson(res, 200, { ok: true, works: data });
						}
						if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Mètode no admès.' });

						const form = await readMultipart(req);
						const rawPayload = form.get('payload');
						if (typeof rawPayload !== 'string') throw fail('Falten les dades de la peça.');

						let payload;
						try {
							payload = JSON.parse(rawPayload);
						} catch {
							throw fail('Les dades de la peça no són vàlides.');
						}

						const text = buildText(payload);
						const { data } = await readWorks(root);
						const now = new Date().toISOString();

						let index = -1;
						let existing = null;
						let id;
						let addedAt;

						if (clean(payload?.id)) {
							index = data.findIndex((entry) => entry.id === payload.id);
							if (index === -1) throw fail(`No existeix cap peça amb l’identificador «${payload.id}».`, 404);
							existing = data[index];
							id = existing.id;
							addedAt = existing.addedAt ?? now;
							for (const locale of LOCALES) {
								if (data.some((entry, i) => i !== index && entry.slugs?.[locale] === text.slugs[locale])) {
									throw fail(`Ja existeix una altra peça amb el slug «${text.slugs[locale]}» (${locale}).`);
								}
							}
						} else {
							id = text.slugs.ca;
							if (data.some((entry) => entry.id === id)) {
								throw fail(`Ja existeix una peça amb l’identificador «${id}». Canvia el títol o el slug.`);
							}
							for (const locale of LOCALES) {
								if (data.some((entry) => entry.slugs?.[locale] === text.slugs[locale])) {
									throw fail(`Ja existeix una peça amb el slug «${text.slugs[locale]}» (${locale}).`);
								}
							}
							addedAt = now;
						}

						const dir = path.join(root, 'public', 'images', 'works', id);
						const startIndex = await nextImageIndex(dir, id);
						const { images, uploads, migrations } = await resolveImages({
							form,
							payload,
							id,
							title: text.title,
							startIndex,
						});

						await writeUploads(root, dir, uploads);
						await migrateImages(root, migrations);
						await pruneImages(dir, id, images);

						const work = {
							id,
							slugs: text.slugs,
							title: text.title,
							description: text.description,
							meta: text.meta,
							made: text.made,
						};
						if (text.madeAt) work.madeAt = text.madeAt;
						if (text.category) work.category = text.category;
						else if (existing?.category && payload.category === undefined) work.category = existing.category;
						if (text.size) work.size = text.size;
						else if (existing?.size && payload.size === undefined) work.size = existing.size;
						if (text.tags) work.tags = text.tags;
						else if (existing?.tags && payload.tags === undefined) work.tags = existing.tags;
						work.addedAt = addedAt;
						work.updatedAt = now;
						work.images = images;
						work.shop = text.shop;

						if (index === -1) data.push(work);
						else data[index] = work;
						await writeWorks(root, data);

						logger.info(
							`peça ${index === -1 ? 'creada' : 'actualitzada'} «${id}» (${images.length} imatge${images.length === 1 ? '' : 's'})`,
						);
						return sendJson(res, index === -1 ? 201 : 200, {
							ok: true,
							id,
							slug: work.slugs.ca,
							images: images.length,
							created: index === -1,
						});
					} catch (error) {
						const status = error?.status ?? 500;
						const message = error?.message ?? 'Error inesperat en desar la peça.';
						logger.error(message);
						return sendJson(res, status, { ok: false, error: message });
					}
				});
			},
			'astro:build:done': async ({ dir }) => {
				// Les pàgines de l'editor són pàgines normals, així que es compilen
				// amb la resta del lloc. Les traiem de `dist/` perquè no arribin a
				// producció (i netegem les carpetes i els assets que quedin orfes).
				const dist = fileURLToPath(dir);
				const editorDirs = [
					['contingut', 'peces', 'afegir'],
					['contingut', 'peces', 'editar'],
					['contingut', 'pagines', 'sobre'],
					['contingut', 'pagines', 'avis-legal'],
					['contingut', 'pagines', 'cookies'],
					['es', 'contenido', 'piezas', 'crear'],
					['es', 'contenido', 'piezas', 'editar'],
					['es', 'contenido', 'paginas', 'sobre-mi'],
					['es', 'contenido', 'paginas', 'aviso-legal'],
					['es', 'contenido', 'paginas', 'cookies'],
					['en', 'content', 'pieces', 'add'],
					['en', 'content', 'pieces', 'edit'],
					['en', 'content', 'pages', 'about'],
					['en', 'content', 'pages', 'legal-notice'],
					['en', 'content', 'pages', 'cookies'],
				];

				const candidates = new Set();
				for (const parts of editorDirs) {
					const leaf = path.join(dist, ...parts);
					try {
						const html = await fs.readFile(path.join(leaf, 'index.html'), 'utf8');
						for (const match of html.matchAll(/(?:src|href)="[^"]*?(\/_astro\/[^"]+)"/g)) {
							candidates.add(match[1].replace(/^\//, ''));
						}
					} catch {
						// Sense HTML: no hi ha res a rastrejar.
					}
					await fs.rm(leaf, { recursive: true, force: true });
					let current = path.dirname(leaf);
					while (current.startsWith(dist) && current !== dist) {
						try {
							await fs.rmdir(current);
						} catch {
							break;
						}
						current = path.dirname(current);
					}
				}

				if (candidates.size === 0) return;

				const referenced = new Set();
				const htmlFiles = [];
				const walk = async (folder) => {
					for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
						const full = path.join(folder, entry.name);
						if (entry.isDirectory()) await walk(full);
						else if (entry.name.endsWith('.html')) htmlFiles.push(full);
					}
				};
				await walk(dist);
				for (const file of htmlFiles) {
					const html = await fs.readFile(file, 'utf8');
					for (const match of html.matchAll(/_astro\/[^"'()]+/g)) referenced.add(match[0]);
				}
				for (const asset of candidates) {
					if (!referenced.has(asset)) {
						await fs.rm(path.join(dist, asset), { force: true });
					}
				}
			},
		},
	};
}
