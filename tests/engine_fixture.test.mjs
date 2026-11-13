// node --test tests/*.test.mjs : the JS engine still gives exactly the values in tests/fixtures/engine.json,
// the reference the Python port (web/engine.py, tests/test_web.py) is checked against.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture } from '../tools/make_engine_fixture.mjs';

test('engine fixture is current (JS deck, rng, seedFrom, shuffle, cut, draws, recurrences)', () => {
  const saved = JSON.parse(readFileSync(new URL('fixtures/engine.json', import.meta.url), 'utf8'));
  assert.deepEqual(JSON.parse(JSON.stringify(fixture())), saved);
});
