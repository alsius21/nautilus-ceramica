import {
	PAGE_FILES,
	PAGE_SCHEMAS,
	buildText,
	clean,
	fail,
	formatJsonValue,
	migrateImages,
	nextImageIndex,
	pruneImages,
	readJsonBody,
	readMultipart,
	readPage,
	readWorks,
	resolveImages,
	sanitize,
	sendJson,
	writeUploads,
	writeWorks,
} from './content-editor.mjs';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const WORKS_ROUTE = '/__content/works';
const PAGES_ROUTE = '/__content/pages';

async function handlePage(req, res, root) {
	if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Mètode no admès.' });
	const payload = await readJsonBody(req);
	const page = clean(payload?.page);
	if (!Object.prototype.hasOwnProperty.call(PAGE_FILES, page)) throw fail('La pàgina indicada no és editable.');
	const locale = clean(payload?.locale);
	if (!['ca', 'es', 'en'].includes(locale)) throw fail("L'idioma indicat no és vàlid.");
	const content = sanitize(PAGE_SCHEMAS[page], payload?.content, page);
	const { file, data, eol } = await readPage(root, page);
	data[locale] = content;
	const body = formatJsonValue(data, 0).replace(/\n/g, eol);
	await fs.writeFile(file, `${body}${eol}`, 'utf8');
	return sendJson(res, 200, { ok: true, page, locale });
}

async function handleWork(req, res, root) {
	if (req.method === 'GET') {
		const { data } = await readWorks(root);
		return sendJson(res, 200, { ok: true, works: data });
	}
	if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Mètode no admès.' });

	const form = await readMultipart(req);
	const rawPayload = form.get('payload');
	if (typeof rawPayload !== 'string') throw fail('Falten les dades de la peça.');
	let payload;
	try { payload = JSON.parse(rawPayload); } catch { throw fail('Les dades de la peça no són JSON vàlides.'); }

	const text = buildText(payload);
	const { data } = await readWorks(root);
	const now = new Date().toISOString();
	let index = -1;
	let existing = null;
	let id;
	let addedAt;

	if (clean(payload?.id)) {
		index = data.findIndex((entry) => entry.id === payload.id);
		if (index === -1) throw fail(`No existeix cap peça amb l'identificador «${payload.id}».`, 404);
		existing = data[index];
		id = existing.id;
		addedAt = existing.addedAt ?? now;
		for (const locale of ['ca', 'es', 'en']) {
			if (data.some((entry, i) => i !== index && entry.slugs?.[locale] === text.slugs[locale])) {
				throw fail(`Ja existeix una altra peça amb el slug «${text.slugs[locale]}» (${locale}).`);
			}
		}
	} else {
		id = text.slugs.ca;
		if (data.some((entry) => entry.id === id)) throw fail(`Ja existeix una peça amb l'identificador «${id}». Canvia el títol o el slug.`);
		for (const locale of ['ca', 'es', 'en']) {
			if (data.some((entry) => entry.slugs?.[locale] === text.slugs[locale])) throw fail(`Ja existeix una peça amb el slug «${text.slugs[locale]}» (${locale}).`);
		}
		addedAt = now;
	}

	const dir = path.join(root, 'public', 'images', 'works', id);
	const startIndex = await nextImageIndex(dir, id);
	const { images, uploads, migrations } = await resolveImages({ form, payload, id, title: text.title, startIndex });
	await writeUploads(root, dir, uploads);
	await migrateImages(root, migrations);
	await pruneImages(dir, id, images);

	const work = { id, slugs: text.slugs, title: text.title, description: text.description, meta: text.meta, made: text.made };
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
	return sendJson(res, index === -1 ? 201 : 200, { ok: true, id, slug: work.slugs.ca, images: images.length, created: index === -1 });
}

export default function viteContentEditor() {
  const root = process.cwd();
	return {
		name: 'nautilus-content-editor-vite',
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				const url = (req.url ?? '').split('?')[0].replace(/^\/nautilus-ceramica(?=\/)/, '');
				if (url !== WORKS_ROUTE && url !== PAGES_ROUTE) return next();
				try {
					if (url === PAGES_ROUTE) return await handlePage(req, res, root);
					return await handleWork(req, res, root);
				} catch (error) {
					const status = error?.status ?? 500;
					const message = error?.message ?? 'Error inesperat en desar el contingut.';
					return sendJson(res, status, { ok: false, error: message });
				}
			});
		},
	};
}
