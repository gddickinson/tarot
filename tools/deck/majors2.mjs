// Major arcana XI-XXI of the original "Night" deck (see majors1.mjs for the conventions).
import { C, f, sky, star, starPath, crescent, sun, hills, waves, pillar, crown, person, dog, horse } from './lib.mjs';

const ground = (y, fill = C.dusk) => `<rect x="24" y="${y}" width="252" height="${440 - y}" fill="${fill}"/>`;
const wing = (x, y, s) => `<path d="M${x},${y}c${s * 30},-40 ${s * 70},-50 ${s * 96},-40c${-s * 20},10 ${-s * 30},24 ${-s * 40},26c${s * 14},2 ${s * 24},6 ${s * 30},14c${-s * 30},6 ${-s * 60},10 ${-s * 86},0z" fill="${C.lilac}" opacity=".9"/>`;
const tower = (x, w, top, col) => `<rect x="${x}" y="${top}" width="${w}" height="${440 - top}" fill="${col}"/>` +
  Array.from({ length: 4 }, (_, i) => `<rect x="${f(x + i * w / 3.5)}" y="${top - 8}" width="${f(w / 7)}" height="9" fill="${col}"/>`).join('') +
  `<rect x="${f(x + w / 2 - 4)}" y="${top + 20}" width="8" height="14" rx="4" fill="${C.gold}"/>`;

export const MAJOR_B = [
  // XI Justice
  () => {
    const p = person({ x: 150, y: 370, h: 210, pose: 'seat', la: 160, ra: 55, robe: '#8c2f2f', trim: C.gold });
    return {
      desc: 'Justice sits crowned between two pillars, an upright double-edged sword raised in one hand and balanced scales in the other, before a violet veil.',
      art: `<rect x="62" y="86" width="176" height="290" fill="${C.violet}" opacity=".55"/>` + pillar(40, 100, 24, 290, '#3d3a52') + pillar(236, 100, 24, 290, '#3d3a52') +
        ground(380, C.deep) + p.svg + crown(150, p.head[1] - 8, 28) +
        `<path d="M${f(p.lh[0])},${f(p.lh[1] + 14)}V${f(p.lh[1] - 80)}l5,10V${f(p.lh[1] + 2)}M${f(p.lh[0] - 12)},${f(p.lh[1] + 2)}h24" stroke="${C.ice}" stroke-width="4" fill="none"/>` +
        `<path d="M${f(p.rh[0])},${f(p.rh[1])}V${f(p.rh[1] + 18)}M${f(p.rh[0] - 26)},${f(p.rh[1] + 18)}H${f(p.rh[0] + 26)}M${f(p.rh[0] - 26)},${f(p.rh[1] + 18)}l-8,22M${f(p.rh[0] - 26)},${f(p.rh[1] + 18)}l8,22M${f(p.rh[0] + 26)},${f(p.rh[1] + 18)}l-8,22M${f(p.rh[0] + 26)},${f(p.rh[1] + 18)}l8,22" stroke="${C.gold}" stroke-width="1.6" fill="none"/>` +
        `<path d="M${f(p.rh[0] - 38)},${f(p.rh[1] + 40)}h24q-12,10 -24,0zM${f(p.rh[0] + 14)},${f(p.rh[1] + 40)}h24q-12,10 -24,0z" fill="${C.gold}"/>`,
    };
  },
  // XII The Hanged Man
  () => {
    const p = person({ x: 150, y: 120, h: 200, la: 12, ra: 12, robe: C.teal, trim: C.gold });
    return {
      desc: 'A man hangs upside down by one foot from a living T-shaped tree, his arms folded behind his back and his other leg bent across, a calm golden halo around his head.',
      art: sky('ar12', 16) + hills(400, 30, C.sea, 0.5, 2) +
        `<path d="M60,440V100M240,440V100M52,96H248" stroke="#6b4a2e" stroke-width="12" stroke-linecap="round"/>` +
        [70, 110, 190, 230].map((x, i) => `<ellipse cx="${x}" cy="${88 - (i % 2) * 4}" rx="10" ry="5" fill="${C.moss}"/>`).join('') +
        `<path d="M150,96V112" stroke="${C.gold}" stroke-width="2"/><g transform="rotate(180 150 116)">${p.svg}</g>` +
        `<circle cx="150" cy="${f(232 - p.head[1])}" r="26" fill="none" stroke="${C.gold}" stroke-width="3"/><circle cx="150" cy="${f(232 - p.head[1])}" r="34" fill="${C.gold}" opacity=".15"/>`,
    };
  },
  // XIII Death
  () => {
    let blade = `<path d="M70,140Q160,96 232,150Q170,128 96,160Z" fill="${C.ice}"/><path d="M78,150L206,410" stroke="#7a5a3a" stroke-width="7" stroke-linecap="round"/>`;
    return {
      desc: 'A tall scythe leans across the night beside a black banner bearing a white rose; beyond a river, a pale sun rises between two towers, and a harvest of fallen crowns lies on dark ground.',
      art: sky('ar13', 14, 56, 200) + `<circle cx="160" cy="250" r="44" fill="${C.pale}" opacity=".9"/>` + tower(96, 36, 200, C.dusk) + tower(198, 36, 196, C.dusk) +
        waves(280, C.sea, C.teal, 3) + ground(330, '#100d24') + blade +
        `<path d="M206,120V330" stroke="${C.gold}" stroke-width="3"/><path d="M206,124H262V196L234,184L206,196Z" fill="#05040e" stroke="${C.gold}" stroke-width="1.5"/>` +
        `<path d="${starPath(234, 156, 16, 5, 0.75, -90)}" fill="${C.ivory}"/><circle cx="234" cy="156" r="5" fill="${C.gold}"/>` +
        crown(110, 400, 30, C.gold) + crown(160, 420, 22, C.gold) + `<circle cx="60" cy="410" r="8" fill="${C.ivory}" opacity=".6"/>`,
    };
  },
  // XIV Temperance
  () => {
    const p = person({ x: 150, y: 380, h: 220, la: 60, ra: 95, robe: C.ivory, trim: C.gold });
    return {
      desc: 'A winged angel in white pours water from one cup into another, one foot on the land and one in a pool; irises grow at the water\'s edge and a path leads to a golden crown of light over distant mountains.',
      art: wing(150, 170, -1) + wing(150, 170, 1) + `<path d="M24,330L80,270L120,310Z" fill="${C.dusk}"/><path d="M200,300L250,250L276,280V330Z" fill="${C.dusk}"/>` +
        `<circle cx="232" cy="236" r="14" fill="${C.gold}" opacity=".9"/><path d="M180,440Q200,340 232,260" stroke="${C.pale}" stroke-width="3" fill="none" stroke-dasharray="6 5"/>` +
        ground(360, '#3d6e46') + `<ellipse cx="96" cy="414" rx="70" ry="22" fill="${C.sea}"/>` + p.svg +
        `<path d="${starPath(150, p.sy + 22, 8, 3, 0.4)}" fill="${C.gold}"/>` +
        `<path d="M${f(p.lh[0] - 9)},${f(p.lh[1] - 4)}h18l-3,16h-12z" fill="${C.gold}"/><path d="M${f(p.rh[0] - 9)},${f(p.rh[1] + 26)}h18l-3,16h-12z" fill="${C.gold}"/>` +
        `<path d="M${f(p.lh[0] + 8)},${f(p.lh[1] - 2)}Q${f((p.lh[0] + p.rh[0]) / 2)},${f(p.lh[1] - 20)} ${f(p.rh[0] - 2)},${f(p.rh[1] + 26)}" stroke="${C.teal}" stroke-width="3" fill="none"/>` +
        [44, 58].map(x => `<path d="M${x},400V380" stroke="${C.moss}" stroke-width="2"/><path d="M${x - 6},380q6,-14 12,0q-6,6 -12,0" fill="${C.violet}"/>`).join(''),
    };
  },
  // XV The Devil
  () => {
    const p = person({ x: 150, y: 290, h: 170, la: 150, ra: 40, robe: '#3a1020', trim: C.ember });
    const bat = s => `<path d="M150,190c${s * 30},-40 ${s * 80},-50 ${s * 110},-30l${-s * 16},14l${-s * 10},-4l${-s * 8},16l${-s * 12},-6l${-s * 10},18c${-s * 20},-8 ${-s * 40},-6 ${-s * 54},0z" fill="#2a0f1f" stroke="${C.ember}" stroke-width="1.2"/>`;
    const thrall = x => `<circle cx="${x}" cy="350" r="11" fill="${C.ivory}"/><path d="M${x - 14},420Q${x},346 ${x + 14},420Z" fill="${C.ivory}"/><path d="M${x},360L150,300" stroke="${C.gold}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
    return {
      desc: 'A horned, bat-winged devil crouches on a black pedestal under an inverted pentagram, a torch held downward; two small figures stand loosely chained to the pedestal below.',
      sky: ['#2a0a18', C.night],
      art: bat(-1) + bat(1) + p.svg + `<path d="M138,${f(p.head[1] - 6)}l-12,-22l16,14M162,${f(p.head[1] - 6)}l12,-22l-16,14" fill="${C.ember}"/>` +
        `<path d="${starPath(150, p.head[1] - 46, 16, 5, 0.38, 90)}" fill="none" stroke="${C.ember}" stroke-width="2"/>` +
        `<path d="M${f(p.rh[0])},${f(p.rh[1] - 10)}l6,40" stroke="${C.gold}" stroke-width="4"/><path d="M${f(p.rh[0] + 6)},${f(p.rh[1] + 30)}q8,10 0,22q-8,-10 0,-22" fill="${C.ember}"/>` +
        `<rect x="112" y="290" width="76" height="70" fill="#05040e" stroke="${C.ember}" stroke-width="1.5"/><circle cx="150" cy="312" r="5" fill="${C.ember}"/>` +
        ground(420, '#140611') + thrall(84) + thrall(216),
    };
  },
  // XVI The Tower
  () => {
    const drops = Array.from({ length: 10 }, (_, i) => `<path d="M${50 + i * 22},${110 + (i % 3) * 40}q3,6 0,9q-3,-3 0,-9" fill="${C.gold}"/>`).join('');
    return {
      desc: 'A tall stone tower on a crag is struck by lightning; its crown is blown off, flames burst from the windows, two figures fall headlong through the dark and drops of fire rain down.',
      sky: ['#10081e', C.night],
      art: `<path d="M24,440V400L90,360L150,380L210,350L276,390V440Z" fill="${C.dusk}"/>` +
        `<path d="M120,370V140H180V370Z" fill="#6c6680"/><path d="M128,160h44M128,220h44M128,280h44M128,340h44" stroke="${C.dusk}" stroke-width="1.2"/>` +
        `<rect x="140" y="186" width="20" height="26" rx="10" fill="${C.ember}"/><rect x="132" y="250" width="14" height="20" rx="7" fill="${C.ember}"/><rect x="156" y="300" width="14" height="20" rx="7" fill="${C.ember}"/>` +
        `<path d="M118,140q10,-30 30,-20q14,-30 34,-4q16,-6 14,20z" fill="${C.ember}"/><g transform="rotate(-24 196 112)">${crown(196, 112, 34)}</g>` +
        `<path d="M250,56L196,118L214,122L170,164" stroke="${C.pale}" stroke-width="5" fill="none" stroke-linejoin="bevel"/>` + drops +
        `<g transform="rotate(150 78 260)">${person({ x: 78, y: 260, h: 90, la: 150, ra: 130, robe: C.teal }).svg}</g>` +
        `<g transform="rotate(-160 226 300)">${person({ x: 226, y: 300, h: 86, la: 130, ra: 160, robe: C.rose }).svg}</g>`,
    };
  },
  // XVII The Star
  () => {
    const p = person({ x: 140, y: 400, h: 190, pose: 'kneel', la: 70, ra: 65, robe: C.lilac, trim: C.pale });
    const small = [[60, 90], [96, 74], [204, 74], [240, 90], [70, 150], [230, 150], [150, 200]];
    return {
      desc: 'A kneeling woman pours water from two jugs, one into a pool and one onto the land, beneath a great eight-pointed star and seven smaller stars; a bird rests in a tree on a hill behind her.',
      sky: ['#13246b', C.night],
      art: sky('ar17', 30, 56, 300) + `<path d="${starPath(150, 120, 46, 8, 0.42, -90)}" fill="${C.gold}"/><circle cx="150" cy="120" r="54" fill="${C.gold}" opacity=".12"/>` +
        small.map(([x, y]) => `<path d="${starPath(x, y, 11, 8, 0.42)}" fill="${C.pale}"/>`).join('') +
        hills(330, 34, C.dusk, 1.6, 2) + `<path d="M232,330V270" stroke="#5b3a2a" stroke-width="4"/><circle cx="232" cy="262" r="20" fill="${C.moss}"/><path d="M230,250l10,-6l-2,8z" fill="${C.ember}"/>` +
        ground(370, '#3d6e46') + waves(380, C.sea, C.teal, 3).replace(`x="24" y="380" width="252"`, `x="150" y="380" width="126"`) + p.svg +
        `<path d="M${f(p.lh[0] - 6)},${f(p.lh[1] - 6)}h14v16h-14z" fill="${C.gold}"/><path d="M${f(p.rh[0] - 8)},${f(p.rh[1] - 6)}h14v16h-14z" fill="${C.gold}"/>` +
        `<path d="M${f(p.lh[0] - 6)},${f(p.lh[1] + 8)}Q${f(p.lh[0] - 20)},${f(p.lh[1] + 30)} ${f(p.lh[0] - 26)},420M${f(p.rh[0] + 4)},${f(p.rh[1] + 8)}Q${f(p.rh[0] + 18)},${f(p.rh[1] + 30)} ${f(p.rh[0] + 24)},410" stroke="${C.ice}" stroke-width="3" fill="none"/>`,
    };
  },
  // XVIII The Moon
  () => {
    let rays = '';
    for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; rays += `M${f(150 + 50 * Math.cos(a))},${f(130 + 50 * Math.sin(a))}L${f(150 + 64 * Math.cos(a))},${f(130 + 64 * Math.sin(a))}`; }
    return {
      desc: 'A full moon holding a crescent within it shines between two towers and lets fall drops of dew; a dog and a wolf bay at it on either side of a winding path that rises from a pool, where a crayfish crawls out of the water.',
      sky: ['#14183f', C.night],
      art: sky('ar18', 20, 56, 260) + `<path d="${rays}" stroke="${C.pale}" stroke-width="2"/><circle cx="150" cy="130" r="46" fill="${C.pale}"/>` + crescent(150, 130, 38, C.gold, -1) +
        [100, 128, 172, 200].map((x, i) => `<path d="M${x},${196 + (i % 2) * 14}q4,8 0,12q-4,-4 0,-12" fill="${C.gold}"/>`).join('') +
        tower(40, 34, 200, C.dusk) + tower(226, 34, 200, C.dusk) + hills(320, 20, C.deep, 0.3, 2) +
        `<path d="M150,330Q120,300 160,270T150,220" stroke="${C.gold}" stroke-width="3" fill="none" opacity=".7"/>` +
        dog(96, 330, -1.4, C.pale) + dog(204, 330, 1.4, '#8a8aa6') + ground(340, C.dusk) + waves(366, C.sea, C.teal, 4) +
        `<g transform="translate(150,392)" fill="${C.ember}"><ellipse rx="10" ry="16"/><path d="M-8,-12l-12,-14l4,-2l12,12M8,-12l12,-14l-4,-2l-12,12"/><path d="M-10,0h-10M-10,6h-10M10,0h10M10,6h10" stroke="${C.ember}" stroke-width="2"/></g>`,
    };
  },
  // XIX The Sun
  () => {
    const p = person({ x: 150, y: 336, h: 110, la: 150, ra: 150, robe: C.ember, trim: C.gold });
    const flower = x => `<path d="M${x},270V214" stroke="${C.moss}" stroke-width="3"/><path d="${starPath(x, 206, 13, 10, 0.55)}" fill="${C.gold}"/><circle cx="${x}" cy="206" r="6" fill="#5b3a2a"/>`;
    return {
      desc: 'A blazing sun with long straight and wavy rays fills the sky over a garden wall lined with sunflowers; below, a joyful child rides a white horse with arms spread wide, a red banner streaming.',
      sky: ['#5e4a12', '#1a1430'],
      art: sun(150, 120, 40, 22) + `<rect x="24" y="260" width="252" height="40" fill="${C.ivory}" opacity=".85"/><path d="M24,272h252M24,286h252M60,260v40M110,260v40M160,260v40M210,260v40M260,260v40" stroke="${C.dusk}" stroke-width="1" opacity=".6"/>` +
        [50, 92, 208, 250].map(flower).join('') + ground(300, '#3d6e46') + horse(150, 330, 0.95, C.ivory, C.gold) +
        `<g transform="translate(-2,-50)">${p.svg}</g><path d="M${f(p.rh[0] - 2)},${f(p.rh[1] - 50)}V${f(p.rh[1] - 4)}" stroke="${C.gold}" stroke-width="2.5"/>` +
        `<path d="M${f(p.rh[0] - 2)},${f(p.rh[1] - 50)}q30,-10 50,10q-26,-4 -50,16z" fill="${C.rose}"/>`,
    };
  },
  // XX Judgement
  () => {
    const riser = (x, col) => `<rect x="${x - 26}" y="390" width="52" height="30" fill="${C.dusk}" stroke="${C.ice}" stroke-width="1.5"/>` +
      person({ x, y: 400, h: 90, la: 160, ra: 160, robe: col, trim: C.pale }).svg;
    return {
      desc: 'A great angel in the clouds sounds a trumpet hung with a banner bearing a cross; below, on a grey sea, figures rise from open coffins with arms lifted toward the call.',
      art: `<path d="M24,200Q60,160 110,180Q150,150 190,180Q240,160 276,200V230H24Z" fill="${C.ice}" opacity=".6"/>` + wing(150, 130, -1) + wing(150, 130, 1) +
        `<circle cx="150" cy="96" r="14" fill="${C.ivory}"/><path d="M134,190Q150,110 166,190Z" fill="${C.lilac}"/>` +
        `<path d="M156,120L226,170L232,160Z" fill="${C.gold}"/><path d="M190,146V190H222V156Z" fill="${C.ivory}"/><path d="M206,152V184M196,166H216" stroke="${C.ember}" stroke-width="4"/>` +
        hills(330, 50, C.ice, 1, 2).replace(`fill="${C.ice}"`, `fill="${C.ice}" opacity=".35"`) + waves(350, C.sea, C.teal, 2) + riser(80, C.ivory) + riser(150, C.ivory) + riser(220, C.ivory),
    };
  },
  // XXI The World
  () => {
    const p = person({ x: 150, y: 330, h: 170, la: 130, ra: 130, robe: C.violet, trim: C.gold });
    const leaves = Array.from({ length: 28 }, (_, i) => {
      const a = i * Math.PI * 2 / 28, x = 150 + 76 * Math.cos(a), y = 240 + 128 * Math.sin(a);
      return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="9" ry="4" fill="${i % 2 ? C.moss : C.teal}" transform="rotate(${f(a * 180 / Math.PI + 90)} ${f(x)} ${f(y)})"/>`;
    }).join('');
    const corner = (x, y, kind) => `<circle cx="${x}" cy="${y}" r="22" fill="${C.dusk}" stroke="${C.gold}" stroke-width="1.5"/>` +
      `<path d="${kind < 2 ? `M${x},${y - 12}L${x + 11},${y + 8}H${x - 11}Z` : `M${x},${y + 12}L${x + 11},${y - 8}H${x - 11}Z`}" fill="none" stroke="${[C.ember, C.ice, C.teal, C.moss][kind]}" stroke-width="2.4"/>` +
      (kind % 2 ? `<path d="M${x - 9},${y + (kind < 2 ? 2 : -2)}h18" stroke="${[C.ember, C.ice, C.teal, C.moss][kind]}" stroke-width="2.4"/>` : '');
    return {
      desc: 'A dancing figure holding two small wands floats inside a great oval wreath of leaves bound with ribbons; the four corners hold the signs of fire, air, water and earth.',
      art: sky('ar21', 30, 56, 440) + `<ellipse cx="150" cy="240" rx="76" ry="128" fill="${C.dusk}" opacity=".7"/>` + leaves +
        `<path d="M138,110l12,6l12,-6M138,370l12,-6l12,6" stroke="${C.ember}" stroke-width="4" fill="none"/>` +
        p.svg + `<path d="M${f(p.lh[0] - 4)},${f(p.lh[1] + 10)}l8,-24M${f(p.rh[0] + 4)},${f(p.rh[1] + 10)}l-8,-24" stroke="${C.gold}" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M136,${f(p.sy + 16)}q30,30 -6,80" stroke="${C.lilac}" stroke-width="5" fill="none"/>` +
        corner(56, 92, 0) + corner(244, 92, 1) + corner(56, 404, 2) + corner(244, 404, 3),
    };
  },
];
