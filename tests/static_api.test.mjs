// node --test tests/*.test.mjs : static/static_api.js, the API of the local app answered in the browser on the
// static site: draws match the engine, the journal endpoints work on (a stand-in for) localStorage.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const store = {};
globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); } };
globalThis.matchMedia = () => ({ matches: false });
const { staticApi } = await import('../static/static_api.js');
const { drawReading, drawQuery, queryToArgs, readingToQuery } = await import('../static/engine.js');
const { makeEntry } = await import('../static/journal_model.js');

test('draw: the engine reading for the query, plus recurrences', async () => {
  const args = { seed: 5, spread: 'celtic', cutAt: 33, reversals: false, significator: 'cu13' };
  const r = await staticApi('/draw?' + drawQuery(args));
  assert.deepEqual({ ...r, recurrences: undefined }, { ...drawReading(args), recurrences: undefined });
  assert.ok(Array.isArray(r.recurrences));
  await assert.rejects(staticApi('/draw?spread=nope'), /^Error: 400/);
  await assert.rejects(staticApi('/draw?spread=three&cut=1.5'), /^Error: 422/);
  const random = await staticApi('/draw?spread=three');
  assert.deepEqual(await staticApi(`/draw?spread=three&seed=${random.seed}`), random);
});

test('share-link query -> draw query gives the same reading', () => {
  const r = drawReading({ seed: 123456, spread: 'celtic', cutAt: 33, significator: 'cu13' });
  const args = queryToArgs(Object.fromEntries(new URLSearchParams(readingToQuery(r, 'night'))));
  const q = Object.fromEntries(new URLSearchParams(drawQuery(args)));
  assert.deepEqual(q, { spread: 'celtic', seed: '123456', rev: '1', cut: '33', sig: 'cu13' });
  assert.deepEqual(drawReading(args), r);
});

test('journal: add, note, delete, import, clear', async () => {
  const e1 = makeEntry(drawReading({ seed: 1, spread: 'three' }), { date: '2026-01-01T00:00:00Z' });
  const e2 = makeEntry(drawReading({ seed: 2, spread: 'single' }), { date: '2026-02-01T00:00:00Z' });
  assert.deepEqual(await staticApi('/journal/add', { entry: e1 }), { ok: true, count: 1 });
  await staticApi('/journal/add', { entry: e2 });
  assert.deepEqual((await staticApi('/journal')).entries.map(e => e.id), [e2.id, e1.id]);
  await staticApi('/journal/note', { id: e1.id, note: 'hello' });
  assert.equal((await staticApi('/journal')).entries[1].note, 'hello');
  await assert.rejects(staticApi('/journal/note', { id: 'nope', note: '' }), /^Error: 404/);
  assert.equal((await staticApi('/journal/delete', { id: e2.id })).count, 1);
  assert.deepEqual(await staticApi('/journal/import', { journal: [e2, { bad: 1 }] }), { ok: true, imported: 1, count: 2 });
  await assert.rejects(staticApi('/journal/import', { journal: { format: 'other' } }), /^Error: 400/);
  await assert.rejects(staticApi('/journal/add', { entry: { cards: [] } }), /^Error: 400/);
  assert.equal((await staticApi('/info')).journal, 2);
  await staticApi('/journal/clear', {});
  assert.deepEqual(await staticApi('/journal'), { entries: [] });
});
