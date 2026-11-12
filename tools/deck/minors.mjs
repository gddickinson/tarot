// Minor arcana of the original "Night" deck: aces, pip cards 2-10 and the four court cards per suit.
import { C, SUIT_COL, f, sky, star, starPath, crescent, hills, waves, crown, person, horse, use } from './lib.mjs';

export const SUIT_NAMES = { wa: 'Wands', cu: 'Cups', sw: 'Swords', pe: 'Pentacles' };
const NUM = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const ELEMENT = { wa: 'fire', cu: 'water', sw: 'air', pe: 'earth' };

// The element of each suit as a landscape strip along the bottom of the picture.
function land(s, y = 372) {
  if (s === 'cu') return waves(y, C.sea, C.teal, 4);
  if (s === 'pe') return hills(y, 16, '#3d6e46', 0.7, 3) + `<path d="M24,${y + 30}Q150,${y + 14} 276,${y + 30}M24,${y + 46}Q150,${y + 30} 276,${y + 46}" stroke="${C.gold}" stroke-width="1.4" fill="none" opacity=".6"/>`;
  if (s === 'sw') return `<path d="M24,440V${y + 16}L70,${y - 14}L110,${y + 10}L160,${y - 22}L212,${y + 8}L248,${y - 6}L276,${y + 10}V440Z" fill="#5c6380"/>` +
    `<path d="M40,${y - 28}h50M150,${y - 38}h60M200,${y - 26}h46" stroke="${C.ice}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
  return hills(y, 22, '#3b1d22', 2.4, 2) + [60, 108, 192, 240].map((x, i) => `<path d="M${x},${y + 30 + (i % 2) * 8}q-6,-10 0,-20q6,10 0,20" fill="${C.ember}"/>`).join('');
}

// A small roundel with a number motif.
function motif(n, col) {
  const x = 150, y = 410;
  const shapes = {
    1: `<path d="M${x},${y + 9}V${y - 2}M${x},${y}q-10,-2 -10,-10q10,0 10,10q0,-12 10,-12q0,10 -10,12" stroke="${col}" fill="none" stroke-width="2"/>`,
    2: `<circle cx="${x - 5}" cy="${y}" r="8" fill="none" stroke="${col}" stroke-width="2"/><circle cx="${x + 5}" cy="${y}" r="8" fill="none" stroke="${col}" stroke-width="2"/>`,
    3: `<path d="M${x},${y - 10}L${x + 10},${y + 7}H${x - 10}Z" fill="none" stroke="${col}" stroke-width="2"/>`,
    4: `<rect x="${x - 8}" y="${y - 8}" width="16" height="16" fill="none" stroke="${col}" stroke-width="2"/>`,
    5: `<path d="M${x - 9},${y - 9}l9,7l-6,4l12,8" fill="none" stroke="${col}" stroke-width="2.2"/>`,
    6: `<path d="${starPath(x, y, 11, 6, 0.58)}" fill="none" stroke="${col}" stroke-width="1.8"/>`,
    7: crescent(x - 2, y, 10, col) + star(x + 8, y - 6, 4, col),
    8: `<path d="${starPath(x, y, 11, 8, 0.45)}" fill="${col}"/>`,
    9: Array.from({ length: 9 }, (_, i) => `<circle cx="${x - 7 + (i % 3) * 7}" cy="${y - 7 + Math.floor(i / 3) * 7}" r="2.2" fill="${col}"/>`).join(''),
    10: `<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="${col}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="3.5" fill="${col}"/>`,
  };
  return `<circle cx="${x}" cy="${y}" r="19" fill="${C.night}" stroke="${C.gold}" stroke-width="1.4"/>${shapes[n]}`;
}

const L = 108, M = 150, R = 192;
const LAYOUT = {
  2: [[M, 140], [M, 280]],
  3: [[M, 110], [M, 210], [M, 310]],
  4: [[L, 140], [R, 140], [L, 280], [R, 280]],
  5: [[L, 120], [R, 120], [M, 210], [L, 300], [R, 300]],
  6: [[L, 110], [R, 110], [L, 210], [R, 210], [L, 310], [R, 310]],
  7: [[L, 110], [R, 110], [M, 160], [L, 210], [R, 210], [L, 310], [R, 310]],
  8: [[L, 110], [R, 110], [M, 160], [L, 210], [R, 210], [M, 260], [L, 310], [R, 310]],
  9: [[L, 100], [R, 100], [L, 170], [R, 170], [M, 205], [L, 240], [R, 240], [L, 310], [R, 310]],
  10: [[L, 100], [R, 100], [M, 135], [L, 170], [R, 170], [L, 240], [R, 240], [M, 275], [L, 310], [R, 310]],
};

function ace(s, id) {
  const col = SUIT_COL[s];
  let rays = '';
  for (let i = 0; i < 24; i++) {
    const a = i * Math.PI / 12, l = i % 2 ? 100 : 130;
    rays += `M${f(150 + 30 * Math.cos(a - 0.08))},${f(210 + 30 * Math.sin(a - 0.08))}L${f(150 + l * Math.cos(a))},${f(210 + l * Math.sin(a))}L${f(150 + 30 * Math.cos(a + 0.08))},${f(210 + 30 * Math.sin(a + 0.08))}Z`;
  }
  const ring = Array.from({ length: 20 }, (_, i) => { const a = i * Math.PI / 10; return `<circle cx="${f(150 + 86 * Math.cos(a))}" cy="${f(210 + 86 * Math.sin(a))}" r="3" fill="${C.gold}"/>`; }).join('');
  return {
    desc: `A single great ${SUIT_NAMES[s].slice(0, -1).toLowerCase()} blazes at the centre of a ring of golden beads and long rays, above a landscape of ${ELEMENT[s]}; a small roundel holds a sprouting seed.`,
    art: sky(id, 24, 56, 360) + `<path d="${rays}" fill="${col}" opacity=".35"/><circle cx="150" cy="210" r="86" fill="none" stroke="${C.gold}" stroke-width="1"/>` + ring +
      `<circle cx="150" cy="210" r="62" fill="${C.night}" opacity=".55"/>` + use(s, 150, 210, 2.5) + land(s) + motif(1, col),
  };
}

function pips(s, n, id) {
  const col = SUIT_COL[s], sc = n <= 3 ? 1.6 : n <= 6 ? 1.35 : n <= 8 ? 1.15 : 1.05;
  const items = LAYOUT[n].map(([x, y], i) => use(s, x, y, sc, s === 'wa' ? (i % 2 ? 14 : -14) : s === 'sw' && n > 1 ? (x < 150 ? -8 : x > 150 ? 8 : 0) : 0)).join('');
  return {
    desc: `${NUM[n][0].toUpperCase() + NUM[n].slice(1)} ${SUIT_NAMES[s].toLowerCase()} arranged in a symmetrical pattern above a landscape of ${ELEMENT[s]}; a small roundel at the foot carries a sign for the number ${n}.`,
    art: sky(id, 22, 56, 360) + `<ellipse cx="150" cy="208" rx="112" ry="150" fill="${col}" fill-opacity=".07" stroke="${C.gold}" stroke-opacity=".35"/><ellipse cx="150" cy="208" rx="104" ry="142" fill="none" stroke="${col}" stroke-opacity=".3" stroke-dasharray="2 6"/>` + items + land(s) + motif(n, col),
  };
}

const HORSE = { wa: '#c98a52', cu: C.ivory, sw: '#8a8aa6', pe: '#6b4a2e' };
const ROBE = { wa: '#8a3b22', cu: C.sea, sw: '#3c4a78', pe: '#4a5a24' };

function court(s, rank, id) {
  const col = SUIT_COL[s], robe = ROBE[s], name = ['Page', 'Knight', 'Queen', 'King'][rank - 11];
  const back = sky(id, 20, 56, 300);
  if (rank === 11) {
    const p = person({ x: 150, y: 380, h: 230, la: 20, ra: 150, robe, trim: col });
    return { desc: `A young page in a ${ELEMENT[s]}-coloured tunic stands on open ground and lifts a ${SUIT_NAMES[s].slice(0, -1).toLowerCase()} high above his head, gazing up at it.`,
      art: back + land(s, 360) + p.svg + `<path d="M${p.head[0] - 16},${f(p.head[1] - 10)}h32l-6,-10h-20z" fill="${col}"/>` + use(s, p.rh[0] + 4, p.rh[1] - 34, 1.55) };
  }
  if (rank === 12) {
    const rider = person({ x: 136, y: 282, h: 160, pose: 'seat', la: 30, ra: 95, robe, trim: col });
    return { desc: `A knight in a ${ELEMENT[s]}-coloured surcoat rides a horse across the land, holding a ${SUIT_NAMES[s].slice(0, -1).toLowerCase()} out before him; a plume streams from his helmet.`,
      art: back + land(s, 380) + horse(140, 290, 1.3, HORSE[s], C.gold) + rider.svg +
        `<path d="M${f(rider.head[0] - 11)},${f(rider.head[1] - 2)}a11,11 0 0,1 22,0z" fill="${C.ice}"/><path d="M${f(rider.head[0])},${f(rider.head[1] - 12)}q-16,-10 -30,0q12,-2 30,6" fill="${col}"/>` +
        use(s, rider.rh[0] + 16, rider.rh[1] - 12, 1.45, s === 'sw' ? 50 : s === 'wa' ? 30 : 0) };
  }
  const queen = rank === 13;
  const p = person({ x: 150, y: 382, h: 220, pose: 'seat', la: queen ? 40 : 70, ra: queen ? 75 : 25, robe, trim: col });
  const throne = queen
    ? `<path d="M84,382V150Q150,70 216,150V382Z" fill="${C.dusk}" stroke="${C.gold}" stroke-width="2"/>` + use(s, 150, 122, 0.9)
    : `<rect x="78" y="120" width="144" height="262" fill="${C.dusk}" stroke="${C.gold}" stroke-width="2"/><rect x="70" y="112" width="160" height="12" fill="${C.gold}"/>` + use(s, 150, 150, 0.9);
  const held = queen ? use(s, p.rh[0] - 8, p.rh[1] - 10, 1.5) : use(s, p.lh[0] + 4, p.lh[1] - 10, 1.4) +
    `<path d="M${f(p.rh[0])},${f(p.rh[1] + 24)}V${f(p.rh[1] - 60)}" stroke="${C.gold}" stroke-width="4"/>` + star(p.rh[0], p.rh[1] - 64, 8, C.gold);
  return {
    desc: queen
      ? `A crowned queen in a ${ELEMENT[s]}-coloured gown sits on an arched throne marked with her suit and holds a ${SUIT_NAMES[s].slice(0, -1).toLowerCase()} in her hand.`
      : `A crowned king sits upright on a square throne marked with his suit, a ${SUIT_NAMES[s].slice(0, -1).toLowerCase()} in one hand and a tall star-topped sceptre in the other.`,
    art: back + land(s, 382) + throne + p.svg + crown(150, p.head[1] - 7, queen ? 26 : 32, C.gold, queen ? 4 : 3) +
      (queen ? `<path d="M128,${f(p.head[1] - 4)}q-6,30 4,46M172,${f(p.head[1] - 4)}q6,30 -4,46" stroke="${col}" stroke-width="4" fill="none"/>`
        : `<path d="M140,${f(p.head[1] + 8)}l10,16l10,-16z" fill="${C.ice}"/>`) + held,
    name,
  };
}

export function minor(s, rank, id) {
  const r = rank === 1 ? ace(s, id) : rank <= 10 ? pips(s, rank, id) : court(s, rank, id);
  return { ...r, emblems: [s] };
}
