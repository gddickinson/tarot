// Entry point: lazy page registration, the starry background, and the router start.
import { lazy, start, route, app, isStatic } from './core.js';
import { reducedMotion } from './widgets.js';

lazy({
  home: () => import('./home.js'),
  read: () => import('./read.js'),
  cards: () => import('./cards.js'),
  card: () => import('./cards.js'),
  journal: () => import('./journal_page.js'),
  about: () => import('./about.js'),
});
route('notfound', async () => {
  app().innerHTML = '<h1>Not found</h1><p>That page is not in the deck. <a href="#/">Back to the start</a></p>';
});
document.getElementById('mode').textContent = `${isStatic() ? 'static site' : 'local app (Python server)'} · for entertainment`;

// Background: a slow field of twinkling stars in the accent colours; drawn once under reduced motion.
function stars() {
  const cv = document.getElementById('bg'), g = cv.getContext('2d');
  const cols = ['#f2c14e', '#b48cff', '#2ec4b6', '#e8f1ff'];
  let pts = [];
  const resize = () => {
    cv.width = innerWidth; cv.height = innerHeight;
    pts = Array.from({ length: Math.round(innerWidth * innerHeight / 9000) }, () => ({
      x: Math.random() * cv.width, y: Math.random() * cv.height, r: Math.random() * 1.4 + 0.3,
      c: cols[Math.floor(Math.random() * cols.length)], p: Math.random() * 6.28, s: 0.4 + Math.random() }));
  };
  const draw = t => {
    g.clearRect(0, 0, cv.width, cv.height);
    for (const s of pts) {
      g.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(s.p + t * 0.0006 * s.s));
      g.fillStyle = s.c; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.283); g.fill();
    }
  };
  resize();
  addEventListener('resize', () => { resize(); if (reducedMotion()) draw(0); });
  if (reducedMotion()) { draw(0); return; }
  const loop = t => { if (!document.hidden) draw(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
stars();
start();
