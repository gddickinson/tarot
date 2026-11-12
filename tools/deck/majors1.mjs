// Major arcana 0-X of the original "Night" deck. Each function returns { art, desc } in card coordinates
// (picture window x 24-276, y 56-440). Compositions are drawn from each card's traditional symbols.
import { C, f, sky, star, starPath, crescent, sun, hills, pillar, lemniscate, crown, person, dog, lion, use } from './lib.mjs';

const ground = (y, fill = C.dusk) => `<rect x="24" y="${y}" width="252" height="${440 - y}" fill="${fill}"/>`;
const wheat = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})" stroke="${C.gold}" stroke-width="1.6" fill="${C.gold}">` +
  `<path d="M0,0V-46" fill="none"/>${[0, 1, 2, 3].map(i => `<ellipse cx="${i % 2 ? 3 : -3}" cy="${-44 + i * 7}" rx="2.4" ry="5" transform="rotate(${i % 2 ? 25 : -25} ${i % 2 ? 3 : -3} ${-44 + i * 7})"/>`).join('')}</g>`;

export const MAJOR_A = [
  // 0 The Fool
  () => {
    const p = person({ x: 132, y: 352, h: 150, la: 115, ra: 150, robe: C.violet });
    return {
      desc: 'A traveller in a violet coat strides toward the edge of a cliff, a bundle on a staff over one shoulder and a white rose raised in the other hand, under a great rising sun; a small dog leaps at his heels.',
      art: sky('ar00', 18) + sun(196, 128, 34, 18) +
        `<path d="M24,440V352H196Q214,352 218,366L230,440Z" fill="${C.dusk}"/><path d="M230,440L220,370Q260,380 276,360V440Z" fill="${C.sea}"/>` +
        p.svg + `<path d="M${f(p.rh[0])},${f(p.rh[1])}L${f(p.rh[0] - 46)},${f(p.rh[1] + 56)}" stroke="${C.ember}" stroke-width="3.4" stroke-linecap="round"/>` +
        `<circle cx="${f(p.rh[0] + 2)}" cy="${f(p.rh[1] - 6)}" r="11" fill="${C.ember}"/>` +
        `<path d="${starPath(p.lh[0] - 6, p.lh[1] - 4, 7, 5, 0.6)}" fill="${C.ivory}"/>` +
        dog(84, 352, 1.1, C.pale) + `<path d="M150,352l10,-8 4,8" stroke="${C.gold}" stroke-width="2" fill="none"/>`,
    };
  },
  // I The Magician
  () => {
    const p = person({ x: 150, y: 350, h: 210, la: 160, ra: 20, robe: C.ember, trim: C.gold });
    return {
      desc: 'A magician in a fiery robe raises a wand to the sky with one hand and points to the earth with the other; a lemniscate burns above his head and a table before him holds a cup, a pentacle, a sword and a wand.',
      emblems: ['cu', 'pe', 'sw', 'wa'],
      art: sky('ar01', 22) + `<circle cx="150" cy="150" r="90" fill="${C.dusk}" opacity=".6"/>` + ground(380, C.deep) +
        p.svg + lemniscate(150, p.head[1] - 34, 12) +
        `<path d="M${f(p.lh[0])},${f(p.lh[1] + 26)}L${f(p.lh[0] + 4)},${f(p.lh[1] - 34)}" stroke="${C.pale}" stroke-width="4" stroke-linecap="round"/>` +
        star(p.lh[0] + 4, p.lh[1] - 38, 9, C.pale) +
        `<rect x="44" y="352" width="212" height="18" rx="3" fill="${C.gold}"/><rect x="56" y="370" width="10" height="60" fill="${C.gold}"/><rect x="234" y="370" width="10" height="60" fill="${C.gold}"/>` +
        use('cu', 70, 330, 0.7) + use('pe', 110, 338, 0.62) + use('sw', 190, 332, 0.6, 90) + use('wa', 232, 334, 0.6, 70) +
        [60, 96, 204, 240].map(x => star(x, 410, 5, C.rose)).join(''),
    };
  },
  // II The High Priestess
  () => {
    const p = person({ x: 150, y: 372, h: 200, pose: 'seat', la: 35, ra: 35, robe: C.sea, trim: C.ice });
    return {
      desc: 'A veiled priestess sits between a dark pillar and a pale pillar, a scroll in her lap and a crescent moon at her feet; behind her hangs a curtain sewn with pomegranates, and a horned crown with a full moon rests on her head.',
      art: `<rect x="60" y="80" width="180" height="300" fill="${C.dusk}"/>` +
        [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${84 + (i % 3) * 66}" cy="${120 + Math.floor(i / 3) * 90}" r="9" fill="${C.rose}" opacity=".75"/>`).join('') +
        pillar(36, 96, 26, 300, '#2b2850') + pillar(238, 96, 26, 300, C.ivory) + ground(396, C.deep) + p.svg +
        `<path d="M${f(p.lh[0])},${f(p.lh[1])}H${f(p.rh[0])}" stroke="${C.pale}" stroke-width="9" stroke-linecap="round"/>` +
        `<circle cx="150" cy="${f(p.head[1] - 24)}" r="9" fill="${C.pale}"/><path d="M136,${f(p.head[1] - 18)}q-6,-14 4,-22M164,${f(p.head[1] - 18)}q6,-14 -4,-22" stroke="${C.pale}" stroke-width="3" fill="none"/>` +
        crescent(150, 412, 18, C.pale) + `<path d="M144,${f(p.sy + 10)}h12M150,${f(p.sy + 4)}v14" stroke="${C.ivory}" stroke-width="2.5"/>`,
    };
  },
  // III The Empress
  () => {
    const p = person({ x: 150, y: 360, h: 200, pose: 'seat', la: 50, ra: 120, robe: C.rose, trim: C.gold });
    return {
      desc: 'A queen of the harvest sits on cushions in a field of ripe wheat beside a falling stream, crowned with twelve stars and holding a sceptre topped by a globe; a heart-shaped shield bears the sign of Venus.',
      art: sky('ar03', 12, 56, 140) + `<path d="M228,56V440H276V56Z" fill="${C.sea}"/><path d="M234,60V440M246,60V440M258,60V440" stroke="${C.teal}" stroke-width="2" opacity=".6"/>` +
        hills(330, 30, C.moss, 0.4, 2) + ground(360, '#3d6e46') +
        [40, 62, 84, 206, 222].map((x, i) => wheat(x, 430 - (i % 2) * 14, 1.1)).join('') +
        [60, 100, 160, 200].map(x => wheat(x, 440, 0.9)).join('') + p.svg +
        Array.from({ length: 12 }, (_, i) => { const a = Math.PI * (1.05 + i * 0.9 / 11); return star(150 + 34 * Math.cos(a), p.head[1] + 4 + 34 * Math.sin(a), 4, C.pale); }).join('') +
        `<path d="M${f(p.rh[0])},${f(p.rh[1] + 20)}V${f(p.rh[1] - 30)}" stroke="${C.gold}" stroke-width="3"/><circle cx="${f(p.rh[0])}" cy="${f(p.rh[1] - 34)}" r="7" fill="${C.gold}"/>` +
        `<path d="M76,330c-14,-14 -6,-30 8,-22c14,-8 22,8 8,22l-8,8z" fill="${C.gold}"/><circle cx="84" cy="314" r="5" fill="none" stroke="${C.night}" stroke-width="2"/><path d="M84,319v9M80,324h8" stroke="${C.night}" stroke-width="2"/>`,
    };
  },
  // IV The Emperor
  () => {
    const p = person({ x: 150, y: 356, h: 200, pose: 'seat', la: 70, ra: 70, robe: '#8c2f2f', trim: C.gold });
    const ram = (x, s) => `<path d="M${x},140c${s * 22},-10 ${s * 30},14 ${s * 14},22c${-s * 10},4 ${-s * 14},-8 ${-s * 4},-10" fill="none" stroke="${C.pale}" stroke-width="4"/>`;
    return {
      desc: 'A stern emperor sits on a square stone throne carved with rams\' heads, an ankh-headed sceptre in one hand and an orb in the other, before bare red mountains.',
      sky: ['#3a1730', C.night],
      art: `<path d="M24,300L70,180L110,250L160,150L214,260L250,200L276,250V440H24Z" fill="#6b2a2a"/>` +
        `<rect x="82" y="140" width="136" height="230" fill="${C.ivory}" opacity=".9"/><rect x="92" y="150" width="116" height="210" fill="${C.dusk}"/>` +
        ram(92, -1) + ram(208, 1) + ground(370, C.deep) + p.svg + crown(150, p.head[1] - 8, 34) +
        `<path d="M150,${f(p.head[1] + 10)}l-8,14h16z" fill="${C.ivory}"/>` +
        `<path d="M${f(p.rh[0])},${f(p.rh[1] + 18)}V${f(p.rh[1] - 30)}" stroke="${C.gold}" stroke-width="3.5"/><circle cx="${f(p.rh[0])}" cy="${f(p.rh[1] - 38)}" r="7" fill="none" stroke="${C.gold}" stroke-width="3"/><path d="M${f(p.rh[0] - 9)},${f(p.rh[1] - 30)}h18" stroke="${C.gold}" stroke-width="3"/>` +
        `<circle cx="${f(p.lh[0])}" cy="${f(p.lh[1] - 6)}" r="9" fill="${C.gold}"/><path d="M${f(p.lh[0])},${f(p.lh[1] - 22)}v10M${f(p.lh[0] - 4)},${f(p.lh[1] - 18)}h8" stroke="${C.gold}" stroke-width="2"/>`,
    };
  },
  // V The Hierophant
  () => {
    const p = person({ x: 150, y: 340, h: 200, pose: 'seat', la: 25, ra: 155, robe: '#7d2441', trim: C.gold });
    const key = (x, r) => `<g transform="translate(${x},400) rotate(${r})" stroke="${C.gold}" stroke-width="4" fill="none"><circle cy="-22" r="8"/><path d="M0,-14V22M0,14h8M0,20h6"/></g>`;
    return {
      desc: 'A high priest in a triple crown sits between two grey pillars, blessing with a raised hand and holding a triple cross; two crossed keys lie at his feet and two acolytes kneel before him.',
      art: pillar(40, 96, 30, 290, '#3d3a52') + pillar(230, 96, 30, 290, '#3d3a52') + `<rect x="70" y="110" width="160" height="240" fill="${C.dusk}" opacity=".7"/>` +
        ground(360, C.deep) + p.svg +
        [0, 1, 2].map(i => `<rect x="${136 + i * 3}" y="${f(p.head[1] - 22 - i * 13)}" width="${28 - i * 6}" height="11" rx="5" fill="${C.gold}"/>`).join('') +
        `<path d="M${f(p.lh[0])},${f(p.lh[1] + 20)}V${f(p.lh[1] - 70)}M${f(p.lh[0] - 12)},${f(p.lh[1] - 56)}h24M${f(p.lh[0] - 9)},${f(p.lh[1] - 46)}h18M${f(p.lh[0] - 6)},${f(p.lh[1] - 36)}h12" stroke="${C.gold}" stroke-width="3"/>` +
        key(136, -30) + key(164, 30) +
        `<circle cx="80" cy="392" r="12" fill="${C.ivory}"/><path d="M62,440Q80,396 98,440Z" fill="${C.rose}"/><circle cx="220" cy="392" r="12" fill="${C.ivory}"/><path d="M202,440Q220,396 238,440Z" fill="${C.teal}"/>`,
    };
  },
  // VI The Lovers
  () => {
    const a = person({ x: 92, y: 400, h: 150, la: 20, ra: 75, robe: C.ivory, trim: C.gold });
    const b = person({ x: 208, y: 400, h: 145, la: 75, ra: 20, robe: C.rose, trim: C.gold });
    return {
      desc: 'A man and a woman stand facing each other with open hands, a tree of flames behind one and a fruit tree with a serpent behind the other; a winged angel blesses them from a blazing sun above.',
      art: sun(150, 96, 26, 14) + `<path d="M150,130C110,110 70,130 50,160C90,150 120,158 150,150C180,158 210,150 250,160C230,130 190,110 150,130Z" fill="${C.lilac}"/>` +
        `<circle cx="150" cy="138" r="11" fill="${C.ivory}"/><path d="M134,190Q150,140 166,190Z" fill="${C.violet}"/>` +
        hills(350, 70, C.deep, 0.2, 1) + ground(400, C.dusk) +
        `<path d="M44,400V230" stroke="#5b3a2a" stroke-width="5"/>${[0, 1, 2, 3, 4].map(i => `<path d="M44,${246 + i * 26}q${i % 2 ? 14 : -14},-12 0,-24" fill="${C.ember}"/>`).join('')}` +
        `<path d="M256,400V230" stroke="#5b3a2a" stroke-width="5"/><circle cx="256" cy="246" r="28" fill="${C.moss}"/>${[0, 1, 2, 3].map(i => `<circle cx="${244 + i * 8}" cy="${238 + (i % 2) * 12}" r="4" fill="${C.rose}"/>`).join('')}` +
        `<path d="M262,330q-14,-10 0,-20q14,-10 0,-20" stroke="${C.teal}" stroke-width="3" fill="none"/>` + a.svg + b.svg,
    };
  },
  // VII The Chariot
  () => {
    const p = person({ x: 150, y: 300, h: 150, la: 40, ra: 150, robe: C.ice, trim: C.gold });
    const sphinx = (x, col, s) => `<g transform="translate(${x},392) scale(${s},1)" fill="${col}"><path d="M-26,0V-16C-26,-28 -6,-30 4,-24L12,-44C22,-50 30,-44 28,-32L22,-20V0Z"/><path d="M8,-44L24,-46L18,-30" fill="${C.gold}"/></g>`;
    return {
      desc: 'A crowned charioteer stands in a square chariot beneath a canopy of stars, a wand held high; two sphinxes, one dark and one pale, rest before the chariot, and a walled city lies behind.',
      art: sky('ar07', 20, 56, 180) + `<path d="M24,300h30v-30h14v30h30v-40h16v40h40v-26h14v26h30v-36h14v36h40V440H24Z" fill="${C.dusk}"/>` +
        `<path d="M70,150Q150,120 230,150V160H70Z" fill="${C.dusk}" stroke="${C.gold}" stroke-width="1.5"/>${[90, 120, 150, 180, 210].map(x => star(x, 150, 4, C.pale)).join('')}` +
        `<path d="M78,160V300M222,160V300" stroke="${C.gold}" stroke-width="3"/>` + p.svg + crown(150, p.head[1] - 7, 26) +
        `<rect x="88" y="280" width="124" height="74" fill="${C.ivory}" stroke="${C.gold}" stroke-width="2"/><circle cx="150" cy="316" r="13" fill="${C.gold}"/><path d="M130,316h40" stroke="${C.night}" stroke-width="2"/>` +
        `<path d="M${f(p.rh[0])},${f(p.rh[1] + 20)}V${f(p.rh[1] - 26)}" stroke="${C.gold}" stroke-width="3.5"/>` + star(p.rh[0], p.rh[1] - 30, 6) +
        `<g transform="translate(-60,-149) scale(1.4)">${sphinx(93, '#3d3a6a', 1)}</g><g transform="translate(-60,-149) scale(1.4)">${sphinx(207, C.ivory, -1)}</g>` + `<rect x="24" y="400" width="252" height="40" fill="${C.deep}"/>`,
    };
  },
  // VIII Strength
  () => {
    const p = person({ x: 120, y: 380, h: 200, la: 30, ra: 72, robe: C.ivory, trim: C.gold });
    return {
      desc: 'A woman in white with a garland of flowers calmly closes the jaws of a great lion with her bare hands, a lemniscate shining above her head in a golden sky.',
      sky: ['#4b3a14', C.night],
      art: hills(330, 50, C.sea, 2.2, 2) + ground(380, '#3d6e46') + p.svg + lemniscate(120, p.head[1] - 30, 11) +
        [0, 1, 2, 3, 4].map(i => `<circle cx="${108 + i * 6}" cy="${f(p.sy + 6 + Math.sin(i) * 3)}" r="3.4" fill="${C.rose}"/>`).join('') +
        `<path d="M176,370Q176,300 220,296Q268,296 268,346V380H176Z" fill="${C.ember}"/>` + lion(204, 282, 1.15) +
        `<path d="M260,330q20,10 8,40" stroke="${C.ember}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    };
  },
  // IX The Hermit
  () => {
    const p = person({ x: 140, y: 360, h: 210, la: 25, ra: 115, robe: '#5c5a74', trim: C.ice, hood: true });
    return {
      desc: 'A hooded hermit in a grey cloak stands alone on an icy summit at night, leaning on a long staff and holding up a lantern in which a six-pointed star shines.',
      art: sky('ar09', 36, 56, 300) + `<path d="M24,440V380L90,330L140,300L196,340L276,320V440Z" fill="${C.ice}"/><path d="M24,440V400L110,360L160,350L276,390V440Z" fill="${C.dusk}"/>` +
        p.svg + `<path d="M${f(p.lh[0])},${f(p.lh[1] - 40)}L${f(p.lh[0] - 6)},362" stroke="${C.gold}" stroke-width="3.4" stroke-linecap="round"/>` +
        `<circle cx="${f(p.rh[0] + 6)}" cy="${f(p.rh[1] + 18)}" r="28" fill="${C.gold}" opacity=".18"/><path d="M${f(p.rh[0])},${f(p.rh[1])}v6" stroke="${C.gold}" stroke-width="2"/>` +
        `<rect x="${f(p.rh[0] - 8)}" y="${f(p.rh[1] + 6)}" width="16" height="22" rx="3" fill="${C.night}" stroke="${C.gold}" stroke-width="2"/>` +
        `<path d="${starPath(p.rh[0], p.rh[1] + 17, 7, 6, 0.55)}" fill="${C.pale}"/>`,
    };
  },
  // X Wheel of Fortune
  () => {
    let spokes = '';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; spokes += `M150,240L${f(150 + 86 * Math.cos(a))},${f(240 + 86 * Math.sin(a))}`; }
    const sym = ['☉', '☿', '♈', '♒'];
    return {
      desc: 'A great golden wheel with eight spokes turns among clouds, its rim marked with small stars; a serpent slides down one side, a jackal-headed figure rises on the other, and a sphinx with a sword sits on top. Winged creatures read books in the four corners.',
      art: sky('ar10', 30, 56, 440) + [[70, 110], [230, 110], [70, 380], [230, 380]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="40" ry="18" fill="${C.dusk}"/><path d="${starPath(x, y - 8, 12, 4, 0.4)}" fill="${C.lilac}"/><rect x="${x - 10}" y="${y}" width="20" height="10" fill="${C.pale}"/>`).join('') +
        `<circle cx="150" cy="240" r="96" fill="${C.ember}" opacity=".25"/><circle cx="150" cy="240" r="92" fill="none" stroke="${C.gold}" stroke-width="8"/><circle cx="150" cy="240" r="62" fill="${C.dusk}" stroke="${C.gold}" stroke-width="3"/>` +
        `<path d="${spokes}" stroke="${C.gold}" stroke-width="3"/><circle cx="150" cy="240" r="18" fill="${C.gold}"/>` +
        sym.map((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2 + Math.PI / 4; return `<path d="${starPath(150 + 76 * Math.cos(a), 240 + 76 * Math.sin(a), 8, s, 0.45)}" fill="${C.night}"/>`; }).join('') +
        `<path d="M58,180q-14,30 6,50t0,60t10,40" stroke="${C.teal}" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<path d="M234,330q8,-30 20,-50l8,-10l4,14l-8,8q-6,20 -10,40z" fill="${C.ember}"/>` +
        `<path d="M132,146V130Q140,118 156,122L162,108L168,124V146Z" fill="${C.lilac}"/><path d="M166,104V146" stroke="${C.ice}" stroke-width="2.4"/>`,
    };
  },
];
