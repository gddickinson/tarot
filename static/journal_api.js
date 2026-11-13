// Where the reading journal lives: the local app's data/journal.json (web/app.py) for requests from the computer
// running it, else this browser's localStorage (the static site, and other devices using the local app, whose journal
// requests the server refuses with 403). The pages call journalApi('/journal...', body) instead of api().
import { api, isStatic } from './core.js';

let browserOnly = isStatic() ? true : null; // null: not yet asked

export async function inBrowser() {
  if (browserOnly === null) {
    try { browserOnly = (await api('/info')).journal === null; } catch (e) { browserOnly = false; }
  }
  return browserOnly;
}

export async function journalApi(path, body = null) {
  if (!(await inBrowser())) {
    try { return await api(path, { body, fresh: true }); } catch (e) {
      if (!/^403 /.test(e.message)) throw e;
      browserOnly = true;
    }
  }
  return (await import('./static_api.js')).staticApi(path, body);
}
