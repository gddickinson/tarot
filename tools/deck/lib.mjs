// Drawing kit for the original "Night" tarot deck: palette, seeded RNG, number formatting, the card frame,
// stars, figures, animals and the four suit emblems. Everything is deterministic (no Math.random).

export const W = 300, H = 520;            // card size (ratio 1.733, as the site's --ratio)
export const ART = { x: 24, y: 56, w: 252, h: 384 }; // the picture window
export const C = {
  night: '#070616', deep: '#151038', dusk: '#251a5a', violet: '#7b5cd6', lilac: '#b48cff', gold: '#f2c14e',
  pale: '#f8e3a3', teal: '#2ec4b6', sea: '#0f4f57', ivory: '#efe6cf', ember: '#e07a3f', rose: '#e0708f',
  ice: '#9fb4e8', moss: '#5f9d6a', shadow: '#0b0920',
};
export const SUIT_COL = { wa: C.ember, cu: C.teal, sw: C.ice, pe: C.gold };

export const f = n => Math.round(n * 10) / 10; // short numbers keep the files small
export const pts = list => list.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function rng(seed) { // mulberry32, as static/core.js
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function seedOf(text) { let h = 0x811c9dc5; for (const ch of text) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h; }

export const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV',
  'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

// --- shapes ---------------------------------------------------------------------------------------
export function starPath(cx, cy, r, n = 5, inner = 0.45, rot = -90) {
  const p = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? r * inner : r;
    p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return `M${pts(p).replace(/ /g, 'L')}Z`;
}
export const star = (cx, cy, r, fill = C.pale, n = 4, inner = 0.3, extra = '') =>
  `<path d="${starPath(cx, cy, r, n, inner)}" fill="${fill}"${extra}/>`;

// Sky dots, seeded by the card id.
export function sky(id, n = 26, y1 = ART.y, y2 = ART.y + 200) {
  const r = rng(seedOf(id)); let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${f(ART.x + r() * ART.w)}" cy="${f(y1 + r() * (y2 - y1))}" r="${f(0.5 + r() * 1.3)}"/>`;
  return `<g fill="${C.pale}" opacity=".7">${s}</g>`;
}
export const crescent = (cx, cy, r, fill = C.pale, dir = 1) =>
  `<path d="M${f(cx)},${f(cy - r)}A${r},${r} 0 1,${dir > 0 ? 0 : 1} ${f(cx)},${f(cy + r)}A${f(r * 0.72)},${r} 0 1,${dir > 0 ? 1 : 0} ${f(cx)},${f(cy - r)}Z" fill="${fill}"/>`;
export function sun(cx, cy, r, rays = 16, fill = C.gold) {
  let d = '';
  for (let i = 0; i < rays; i++) {
    const a = i * 2 * Math.PI / rays, L = i % 2 ? r * 1.45 : r * 1.75;
    d += `M${f(cx + r * 1.05 * Math.cos(a - 0.12))},${f(cy + r * 1.05 * Math.sin(a - 0.12))}L${f(cx + L * Math.cos(a))},${f(cy + L * Math.sin(a))}L${f(cx + r * 1.05 * Math.cos(a + 0.12))},${f(cy + r * 1.05 * Math.sin(a + 0.12))}Z`;
  }
  return `<path d="${d}" fill="${fill}" opacity=".85"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}
export const hills = (y, amp, fill, phase = 0, n = 3) => {
  let d = `M${ART.x},${ART.y + ART.h}V${y}`;
  const step = ART.w / n;
  for (let i = 0; i < n; i++) {
    const x0 = ART.x + i * step;
    d += `Q${f(x0 + step / 2)},${f(y - amp * (1 + 0.4 * Math.sin(i * 2.1 + phase)))} ${f(x0 + step)},${y}`;
  }
  return `<path d="${d}V${ART.y + ART.h}Z" fill="${fill}"/>`;
};
export function waves(y, fill = C.sea, line = C.teal, rows = 3) {
  let s = `<rect x="${ART.x}" y="${y}" width="${ART.w}" height="${ART.y + ART.h - y}" fill="${fill}"/>`;
  for (let r = 0; r < rows; r++) {
    let d = '';
    const yy = y + 10 + r * 14;
    for (let x = ART.x - (r % 2) * 12; x < ART.x + ART.w; x += 24) d += `M${x},${yy}q6,-5 12,0t12,0`;
    s += `<path d="${d}" fill="none" stroke="${line}" stroke-width="1.6" opacity="${f(0.8 - r * 0.2)}"/>`;
  }
  return s;
}
export const pillar = (x, y, w, h, fill, cap = C.gold) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/><rect x="${x - 4}" y="${y - 8}" width="${w + 8}" height="9" rx="2" fill="${cap}"/>` +
  `<rect x="${x - 4}" y="${y + h - 4}" width="${w + 8}" height="8" rx="2" fill="${cap}"/>`;
export const lemniscate = (cx, cy, s = 10, col = C.gold) =>
  `<path d="M${cx},${cy}c${-s * 0.6},${-s} ${-s * 2},${-s} ${-s * 2},0s${s * 1.4},${s} ${s * 2},0s${s * 2},${-s} ${s * 2},0s${-s * 1.4},${s} ${-s * 2},0" fill="none" stroke="${col}" stroke-width="2.2"/>`;
export const crown = (cx, y, w, col = C.gold, n = 3) => {
  const p = [[cx - w / 2, y]];
  for (let i = 0; i <= n * 2; i++) p.push([cx - w / 2 + i * w / (n * 2), i % 2 ? y - w * 0.22 : y - w * 0.55]);
  p.push([cx + w / 2, y]);
  return `<polygon points="${pts(p)}" fill="${col}"/>`;
};

// A stylised figure: head, robe, arms at angles (0 = down, 90 = out, 180 = up). Returns svg + hand points.
export function person({ x, y, h, pose = 'stand', la = 20, ra = 20, robe = C.dusk, trim = C.gold, skin = C.ivory, hood = false, armW = 0 }) {
  const k = pose === 'seat' ? 0.78 : pose === 'kneel' ? 0.7 : 1;
  const top = y - h * k, r = h * 0.075, hy = top + r, sy = top + h * 0.2, sw = h * 0.12;
  const hem = pose === 'seat' ? h * 0.3 : pose === 'kneel' ? h * 0.26 : h * 0.19;
  const waist = sy + (y - sy) * 0.42;
  const body = `M${f(x - sw)},${f(sy)}Q${f(x)},${f(sy - h * 0.04)} ${f(x + sw)},${f(sy)}L${f(x + sw * 0.8)},${f(waist)}L${f(x + hem)},${f(y)}L${f(x - hem)},${f(y)}L${f(x - sw * 0.8)},${f(waist)}Z`;
  const L = h * 0.34, aw = armW || h * 0.065;
  const hp = (side, a) => { const t = a * Math.PI / 180; return [x + side * (sw * 0.8 + L * Math.sin(t)), sy + 3 + L * Math.cos(t)]; };
  const lh = hp(-1, la), rh = hp(1, ra);
  const arm = (side, p) => `M${f(x + side * sw * 0.8)},${f(sy + 3)}L${f(p[0])},${f(p[1])}`;
  const svg = `<g><path d="${arm(-1, lh)}${arm(1, rh)}" stroke="${robe}" stroke-width="${f(aw)}" stroke-linecap="round"/>` +
    `<path d="${body}" fill="${robe}" stroke="${trim}" stroke-width="1.4"/>` +
    `<circle cx="${f(lh[0])}" cy="${f(lh[1])}" r="${f(aw * 0.45)}" fill="${skin}"/><circle cx="${f(rh[0])}" cy="${f(rh[1])}" r="${f(aw * 0.45)}" fill="${skin}"/>` +
    (hood ? `<path d="M${f(x - r * 1.6)},${f(sy + 4)}Q${f(x)},${f(hy - r * 2.6)} ${f(x + r * 1.6)},${f(sy + 4)}Z" fill="${robe}" stroke="${trim}" stroke-width="1.2"/>` +
      `<circle cx="${f(x)}" cy="${f(hy + 1)}" r="${f(r * 0.75)}" fill="${C.shadow}"/>`
      : `<circle cx="${f(x)}" cy="${f(hy)}" r="${f(r)}" fill="${skin}"/>`) +
    `<path d="M${f(x)},${f(waist - 2)}V${f(y)}" stroke="${trim}" stroke-width=".8" opacity=".5"/></g>`;
  return { svg, lh, rh, head: [x, hy], r, top, sy };
}

// Profile animals (facing right at s = 1; flip with s < 0).
export function horse(x, y, s, fill = C.ivory, line = C.gold) {
  return `<g transform="translate(${x},${y}) scale(${s},${Math.abs(s)})" fill="${fill}" stroke="${line}" stroke-width="1.5">` +
    `<path d="M-38,40L-42,78M-24,42L-20,78M26,40L34,62L46,70M38,38L44,78" fill="none" stroke="${fill}" stroke-width="7" stroke-linecap="round"/>` +
    `<path d="M-50,18C-50,0 -30,-4 0,-2C22,0 30,-6 40,-30L46,-52C52,-60 64,-58 76,-42L82,-30L72,-24L58,-30L52,-6C52,20 40,44 20,44L-30,44C-46,44 -50,32 -50,18Z"/>` +
    `<path d="M-50,14C-64,24 -66,44 -58,58" fill="none" stroke-width="5"/><path d="M42,-50L30,-10" fill="none" stroke="${line}" stroke-width="3"/></g>`;
}
export function dog(x, y, s, fill = C.ivory) {
  return `<g transform="translate(${x},${y}) scale(${s},${Math.abs(s)})" fill="${fill}"><path d="M-18,0L-16,-14C-10,-20 6,-20 12,-16L18,-28L22,-26L24,-20L30,-18L26,-12L20,-10L18,0L14,0L12,-8L-10,-8L-12,0Z"/>` +
    `<path d="M-16,-14L-26,-24" stroke="${fill}" stroke-width="3" stroke-linecap="round"/></g>`;
}
export function lion(x, y, s, mane = C.ember, face = C.gold) {
  let d = '';
  for (let i = 0; i < 14; i++) {
    const a = i * Math.PI / 7, b = a + Math.PI / 14;
    d += `${i ? 'L' : 'M'}${f(30 * Math.cos(a))},${f(30 * Math.sin(a))}L${f(22 * Math.cos(b))},${f(22 * Math.sin(b))}`;
  }
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="${d}Z" fill="${mane}"/><circle r="18" fill="${face}"/>` +
    `<circle cx="-7" cy="-4" r="2.4" fill="${C.night}"/><circle cx="7" cy="-4" r="2.4" fill="${C.night}"/>` +
    `<path d="M-5,6L5,6L0,11Z" fill="${C.night}"/><path d="M-8,13Q0,18 8,13" fill="none" stroke="${C.night}" stroke-width="1.6"/></g>`;
}

// --- suit emblems: defined once per card in <defs>, placed with <use> ---------------------------------
export const EMBLEM = {
  cu: `<g id="cu"><path d="M-17,-20H17C17,-2 9,5 3,7V15H11V21H-11V15H-3V7C-9,5 -17,-2 -17,-20Z" fill="${C.gold}" stroke="${C.night}" stroke-width="1.2"/>` +
    `<ellipse cx="0" cy="-19" rx="15" ry="3.2" fill="${C.teal}"/><path d="M-11,-12Q0,-6 11,-12" fill="none" stroke="${C.night}" stroke-width="1"/></g>`,
  pe: `<g id="pe"><circle r="19" fill="${C.gold}" stroke="${C.night}" stroke-width="1.2"/><circle r="15.5" fill="${C.dusk}"/>` +
    `<path d="${starPath(0, 0, 14, 5, 0.38)}" fill="${C.pale}"/></g>`,
  sw: `<g id="sw"><path d="M0,-30L7,-19V9H-7V-19Z" fill="${C.ice}" stroke="${C.night}" stroke-width="1"/><path d="M0,-26V7" stroke="#5c6380" stroke-width="1.4"/>` +
    `<path d="M-16,8H16L13,14H-13Z" fill="${C.gold}"/><rect x="-3.5" y="14" width="7" height="11" rx="1.5" fill="${C.lilac}"/><circle cy="28" r="4.5" fill="${C.gold}"/></g>`,
  wa: `<g id="wa"><rect x="-4.5" y="-27" width="9" height="54" rx="4.5" fill="${C.ember}" stroke="${C.night}" stroke-width="1"/>` +
    `<path d="M-1.5,-24V24" stroke="${C.gold}" stroke-width="1.2" opacity=".6"/>` +
    `<path d="M4,-12q12,-9 16,-2q-8,6 -16,2M-4,3q-12,-9 -16,-2q8,6 16,2M4,15q11,-7 14,-1q-7,5 -14,1" fill="#7cc46f"/><path d="M0,-38q7,7 0,12q-7,-5 0,-12" fill="${C.gold}"/></g>`,
};
export const use = (id, x, y, s = 1, rot = 0) =>
  `<use href="#${id}" transform="translate(${f(x)},${f(y)})${rot ? ` rotate(${rot})` : ''}${s !== 1 ? ` scale(${s})` : ''}"/>`;

// --- the frame ------------------------------------------------------------------------------------
const corner = (x, y) => `<path d="${starPath(x, y, 6, 4, 0.3)}" fill="${C.gold}"/>`;
export function card({ title, label, numeral, desc, art, defs = '', emblems = [], sky: skyFill = [C.deep, C.night] }) {
  const t = title.toUpperCase(), size = Math.min(19, 236 / (t.length * 0.74));
  const nsize = numeral.length > 5 ? 13 : numeral.length > 3 ? 15 : 18;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">` +
    `<title id="t">${esc(label || title)}</title><desc id="d">${esc(desc)}</desc>` +
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyFill[0]}"/><stop offset="1" stop-color="${skyFill[1]}"/></linearGradient>` +
    `<clipPath id="w"><rect x="${ART.x}" y="${ART.y}" width="${ART.w}" height="${ART.h}" rx="8"/></clipPath>` +
    emblems.map(e => EMBLEM[e]).join('') + defs + `</defs>` +
    `<rect width="${W}" height="${H}" rx="16" fill="${C.night}"/>` +
    `<rect x="7" y="7" width="286" height="506" rx="12" fill="${C.shadow}" stroke="${C.gold}" stroke-width="2.2"/>` +
    `<rect x="14" y="14" width="272" height="492" rx="8" fill="none" stroke="${C.lilac}" stroke-opacity=".55"/>` +
    `<g clip-path="url(#w)"><rect x="${ART.x}" y="${ART.y}" width="${ART.w}" height="${ART.h}" fill="url(#bg)"/>${art}</g>` +
    `<rect x="${ART.x}" y="${ART.y}" width="${ART.w}" height="${ART.h}" rx="8" fill="none" stroke="${C.gold}" stroke-width="1.6"/>` +
    corner(24, 31) + corner(276, 31) + corner(24, 489) + corner(276, 489) +
    `<rect x="112" y="19" width="76" height="28" rx="14" fill="${C.night}" stroke="${C.gold}" stroke-width="1.4"/>` +
    `<text x="150" y="39" text-anchor="middle" font-family="Times New Roman,Times,serif" font-size="${nsize}" font-weight="bold" fill="${C.gold}">${esc(numeral)}</text>` +
    `<path d="M40,452H260L270,474L260,496H40L30,474Z" fill="${C.night}" stroke="${C.gold}" stroke-width="1.4"/>` +
    `<text x="150" y="${f(474 + size * 0.36)}" text-anchor="middle" font-family="Georgia,serif" font-size="${f(size)}" letter-spacing="1.2" fill="${C.pale}">${esc(t)}</text></svg>`;
}
