// Table animations with the Web Animations API: riffle shuffle, cut, deal (FLIP) and flip.
// Under prefers-reduced-motion every function finishes at once with the same end state.
import { reducedMotion } from './widgets.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
const done = a => a.finished.catch(() => {});

// A face-down pack of n visible card backs.
export function packHTML(back, n = 14) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<div class="pk back-${back}" style="transform:translate(${-i * 0.6}px,${-i * 0.6}px)"></div>`;
  return s;
}
const base = i => `translate(${-i * 0.6}px,${-i * 0.6}px)`;

// Riffle: split the pack in two halves that slide apart, tilt, and fall back interleaved; three passes.
export async function shuffleAnim(pack, passes = 3) {
  if (reducedMotion()) return;
  const cards = [...pack.children], w = pack.offsetWidth;
  for (let p = 0; p < passes; p++) {
    const runs = cards.map((el, i) => {
      const left = i % 2 === 0, dx = (left ? -1 : 1) * w * 0.62, rot = left ? -9 : 9;
      return el.animate([
        { transform: base(i), zIndex: i },
        { transform: `${base(i)} translateX(${dx}px) rotate(${rot}deg)`, offset: 0.4 },
        { transform: `${base(i)} translateX(${dx * 0.35}px) translateY(-6px) rotate(${rot / 3}deg)`, offset: 0.7 },
        { transform: base(i) },
      ], { duration: 620, delay: (left ? i : cards.length - i) * 18, easing: 'ease-in-out' });
    });
    await Promise.all(runs.map(done));
  }
}

// Cut: the top part of the pack lifts off to the side, the rest slides out, and the top goes underneath.
export async function cutAnim(pack, frac = 0.5) {
  if (reducedMotion()) return;
  const cards = [...pack.children], k = Math.max(1, Math.round(cards.length * frac)), w = pack.offsetWidth;
  const top = cards.slice(cards.length - k), rest = cards.slice(0, cards.length - k);
  const a = top.map((el, j) => el.animate([
    { transform: el.style.transform }, { transform: `${el.style.transform} translate(${w * 0.75}px,-14px) rotate(6deg)`, offset: 0.45 },
    { transform: `${el.style.transform} translate(${w * 0.75}px,-14px) rotate(6deg)`, offset: 0.6 }, { transform: el.style.transform }],
  { duration: 900, delay: j * 6, easing: 'ease-in-out' }));
  const b = rest.map(el => el.animate([{ transform: el.style.transform },
    { transform: `${el.style.transform} translateX(-${w * 0.3}px)`, offset: 0.5 }, { transform: el.style.transform }],
  { duration: 900, easing: 'ease-in-out' }));
  await Promise.all([...a, ...b].map(done));
}

// Deal: each card element appears to fly from the pack to its slot (First-Last-Invert-Play).
// `rot` (degrees) is a rotation the card already has in its slot, e.g. 90 for the crossing card.
export async function dealAnim(pack, items, step = 140) {
  const from = pack.getBoundingClientRect();
  const fx = from.left + from.width / 2, fy = from.top + from.height / 2;
  if (reducedMotion()) { items.forEach(({ el }) => { el.style.visibility = ''; }); return; }
  const runs = items.map(({ el, rot = 0 }, i) => {
    const to = el.getBoundingClientRect();
    let dx = fx - (to.left + to.width / 2), dy = fy - (to.top + to.height / 2);
    if (rot) { const t = -rot * Math.PI / 180; [dx, dy] = [dx * Math.cos(t) - dy * Math.sin(t), dx * Math.sin(t) + dy * Math.cos(t)]; }
    const spin = rot ? `rotate(${rot}deg)` : '';
    el.style.visibility = '';
    return el.animate([
      { transform: `${spin} translate(${dx}px,${dy}px) rotate(${(i % 2 ? 1 : -1) * 12}deg) scale(.82)`, opacity: 0.4 },
      { transform: `${spin} translate(0,0) rotate(0) scale(1)`, opacity: 1 },
    ], { duration: 560, delay: i * step, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
  });
  await Promise.all(runs.map(done));
}

// Flip a dealt card face up (the CSS transition does the 3D turn); resolves when it has turned.
export async function flip(el) {
  if (el.classList.contains('up')) return;
  el.classList.add('up');
  if (!reducedMotion()) await wait(820);
}
