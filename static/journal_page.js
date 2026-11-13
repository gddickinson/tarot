// #/journal : saved readings, with notes, export (JSON, Markdown) and import. Stored through the API: in
// data/journal.json by the local Python app (for this computer), else in this browser's localStorage (journal_api.js).
import { $, $$, esc, route, app, download } from './core.js';
import { journalApi, inBrowser } from './journal_api.js';
import { CARD, SPREADS, deckById, readingToQuery } from './engine.js';
import { thumb } from './widgets.js';
import { serialiseJournal, journalToMarkdown } from './journal_model.js';

const load = async () => (await journalApi('/journal')).entries;
const post = (path, body) => journalApi('/journal/' + path, body);

const when = iso => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function entryHTML(e) {
  const d = deckById(e.deck);
  return `<article class="panel jentry" data-id="${esc(e.id)}">
    <h3>${esc(when(e.date))} · ${SPREADS[e.spread].label} · ${d.label}</h3>
    ${e.question ? `<p class="quote">“${esc(e.question)}”</p>` : ''}
    ${e.significator ? `<p class="small">Significator: ${CARD[e.significator].name}</p>` : ''}
    <div class="thumbs">${e.cards.map((c, i) => `<figure>${thumb(c.id, d, { reversed: c.reversed })}
      <figcaption>${i + 1}. ${esc(CARD[c.id].name)}${c.reversed ? ' (rev.)' : ''}</figcaption></figure>`).join('')}</div>
    <label for="n-${esc(e.id)}">Notes</label>
    <textarea id="n-${esc(e.id)}" data-note maxlength="5000" placeholder="What did you make of it?">${esc(e.note)}</textarea>
    <a class="btn alt" href="#/read?${readingToQuery(e, e.deck)}">Open reading</a>
    <button type="button" class="alt" data-del>Delete</button>
  </article>`;
}

route('journal', async () => {
  const draw = async (msg = '') => {
    const entries = await load(), local = await inBrowser();
    app().innerHTML = `
      <div class="hero"><p class="kicker">Reading journal</p><h1 class="glow">Your readings</h1>
        <p class="lead">${local ? `Readings you save are kept in this browser only (nothing is sent anywhere). Export them
        to keep a copy or move them to another browser.` : `Readings you save are kept on this computer by the local app
        (data/journal.json in the repository folder, never committed). Export them to keep a copy or move them elsewhere.`}</p></div>
      <div class="controls" style="justify-content:flex-start">
        <button type="button" id="x-json"${entries.length ? '' : ' disabled'}>Export JSON</button>
        <button type="button" id="x-md" class="alt"${entries.length ? '' : ' disabled'}>Export Markdown</button>
        <span class="btn alt file-btn">Import JSON<input type="file" id="imp" accept="application/json,.json" aria-label="Import a journal JSON file"></span>
        <button type="button" id="x-clear" class="alt"${entries.length ? '' : ' disabled'}>Delete all</button>
      </div>
      <p class="small" id="jmsg" role="status">${esc(msg)}</p>
      <div class="tiles"><div class="tile"><b>${entries.length}</b><span>saved reading${entries.length === 1 ? '' : 's'}</span></div>
        <div class="tile"><b>${entries.reduce((n, e) => n + e.cards.length, 0)}</b><span>cards drawn</span></div>
        <div class="tile"><b>${entries.reduce((n, e) => n + e.cards.filter(c => c.reversed).length, 0)}</b><span>of them reversed</span></div></div>
      ${entries.length ? entries.map(entryHTML).join('')
        : '<div class="panel"><p>No readings saved yet. <a href="#/read">Start a reading</a> and press "Save to journal" at the end.</p></div>'}`;
    const stamp = new Date().toISOString().slice(0, 10);
    const on = (id, fn) => { const b = $('#' + id); if (b) b.onclick = fn; };
    on('x-json', () => download(`tarot-journal-${stamp}.json`, serialiseJournal(entries), 'application/json'));
    on('x-md', () => download(`tarot-journal-${stamp}.md`, journalToMarkdown(entries), 'text/markdown'));
    on('x-clear', async () => {
      if (!confirm(`Delete every saved reading${local ? ' from this browser' : ''}? Export first if you want a copy.`)) return;
      try { await post('clear', {}); draw('Journal cleared.'); } catch (e) { draw('Could not clear the journal: ' + e.message); }
    });
    $('#imp').onchange = async ev => {
      const f = ev.target.files[0];
      if (!f) return;
      let data;
      try { data = JSON.parse(await f.text()); } catch (e) { draw('That file is not a tarot journal export.'); return; }
      try {
        const r = await post('import', { journal: data });
        draw(`Imported ${r.imported} reading(s).`);
      } catch (e) {
        draw(/^400 /.test(e.message) ? 'That file is not a tarot journal export.' : 'Could not store the readings: ' + e.message);
      }
    };
    $$('.jentry').forEach(el => {
      const id = el.dataset.id;
      el.querySelector('[data-del]').onclick = async () => {
        try { await post('delete', { id }); draw('Reading deleted.'); } catch (e) { draw('Could not delete: ' + e.message); }
      };
      const ta = el.querySelector('[data-note]');
      ta.onchange = async () => {
        try { await post('note', { id, note: ta.value.slice(0, 5000) }); $('#jmsg').textContent = 'Note saved.'; }
        catch (e) { $('#jmsg').textContent = 'Could not save the note: ' + e.message; }
      };
    });
  };
  await draw();
});
