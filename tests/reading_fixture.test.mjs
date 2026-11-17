// node --test tests/*.test.mjs : the JS reading engine still gives exactly tests/fixtures/readings.json, the
// reference the Python port (web/reading.py, tests/test_reading.py) is checked against.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixtureText } from '../tools/make_reading_fixture.mjs';

test('reading fixture is current', () => {
  const saved = readFileSync(new URL('fixtures/readings.json', import.meta.url), 'utf8');
  assert.deepEqual(JSON.parse(fixtureText()), JSON.parse(saved));
});
