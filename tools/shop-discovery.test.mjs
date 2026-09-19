import test from 'node:test';
import assert from 'node:assert/strict';
import { getRelatedWorks, normalizeSearch, PIECE_CATEGORIES, PIECE_SIZES, categoryLabel, sizeLabel } from '../src/lib/shop-discovery.ts';

const piece = (id, metadata = {}) => ({ id, shop: { available: true, status: 'available' }, ...metadata });

test('search normalizes accents, case and whitespace across the three languages', () => {
	assert.equal(normalizeSearch('  CERÀMICA   Jarrón  '), 'ceramica jarron');
	for (const locale of ['ca', 'es', 'en']) {
		for (const category of PIECE_CATEGORIES) assert.ok(categoryLabel(category, locale));
		for (const size of PIECE_SIZES) assert.ok(sizeLabel(size, locale));
	}
});

test('recommendations exclude the current piece, unpublished works and unrelated works', () => {
	const current = piece('current', { category: 'vase', size: 'small' });
	const related = piece('related', { category: 'vase' });
	const unpublished = piece('unpublished', { category: 'vase', shop: { available: false, status: 'available' } });
	const sameSizeOnly = piece('same-size', { size: 'small', category: 'plate' });
	assert.deepEqual(getRelatedWorks(current, [current, related, unpublished, sameSizeOnly]), [related]);
});

test('recommendations prioritize purchasable pieces, then category and tags, and cap results', () => {
	const current = piece('current', { category: 'vase', tags: { ca: 'Blau, mat', es: 'Azul', en: 'Blue' } });
	const sold = piece('sold', { category: 'vase', shop: { available: true, status: 'sold' } });
	const tagged = piece('tagged', { category: 'cup', tags: { ca: ' blau ', es: '', en: '' } });
	const category = piece('category', { category: 'vase' });
	const both = piece('both', { category: 'vase', tags: { ca: 'blau', es: '', en: '' } });
	assert.deepEqual(getRelatedWorks(current, [sold, tagged, category, both]), [both, category, tagged]);
	assert.deepEqual(getRelatedWorks(current, [sold, tagged, category, both], 4), [both, category, tagged, sold]);
	assert.deepEqual(getRelatedWorks(current, [category], 0), []);
});

test('legacy pieces and generic other categories do not create false recommendations', () => {
	assert.deepEqual(getRelatedWorks(piece('old'), [piece('another-old')]), []);
	assert.deepEqual(getRelatedWorks(piece('other', { category: 'other' }), [piece('another', { category: 'other' })]), []);
});
