/* LUMEN RESIDENCES — gallery plates.
   Each plate is a one-point perspective interior. Sunlight is projected
   from every window pane onto floor and walls, so mullion shadows, beams
   and furniture shadows come from the same sun direction. Moving the
   pointer over a plate turns the sun a few degrees. */
import { clipRect, DEG } from './plan.js';

const TONES = {
  morning: { ceil: '#C8C5BF', back: '#D2CFC9', left: '#BBB7B0', right: '#DAD7D1', floor: '#B4ADA2', light: '#F6DCA8', beam: 0.17, sky: ['#EEF0EC', '#BFD0D6'] },
  noon: { ceil: '#CFCDC8', back: '#DAD8D3', left: '#C9C6C0', right: '#C1BEB8', floor: '#C2BDB4', light: '#FCF0D6', beam: 0.1, sky: ['#F4F6F5', '#C9D7DC'] },
  afternoon: { ceil: '#C4BFB7', back: '#CFC9C0', left: '#D6D0C7', right: '#B9B3AA', floor: '#B3AA9D', light: '#F4CC84', beam: 0.15, sky: ['#F5E8CF', '#BCCBD0'] },
  dusk: { ceil: '#968D84', back: '#A2988D', left: '#8F857B', right: '#998F85', floor: '#8A8075', light: '#F2A85E', beam: 0.22, sky: ['#F6C27E', '#8E9BA6'] },
};

export const SCENES = [
  { id: 'loggia', title: 'East loggia', time: '07:40', res: 'Residence 2.04 · The Atelier', tone: 'morning',
    W: 4.6, H: 3.0, zb: 6.5, eye: 1.4, f: 540, camX: 0.4, cy: 500,
    windows: [{ wall: 'left', a: 2.2, b: 6.0, y0: 0.05, y1: 2.7, panes: 4 }], az: 18, alt: 14,
    objects: [{ x0: 0.2, x1: 1.9, z0: 4.6, z1: 5.0, h: 0.42, c: '#9B8C79' }, { x0: 1.95, x1: 2.2, z0: 5.5, z1: 5.75, h: 0.9, c: '#6F706A' }] },
  { id: 'gallery', title: 'The long gallery', time: '12:10', res: 'Residence 11.01 · The Meridian', tone: 'noon',
    W: 3.4, H: 3.2, zb: 9, eye: 1.5, f: 560, camX: -0.2, cy: 470,
    windows: [{ wall: 'back', a: -1.2, b: 1.2, y0: 0.05, y1: 2.9, panes: 3 }], az: -97, alt: 38,
    objects: [{ x0: -0.4, x1: 0.4, z0: 5.2, z1: 5.6, h: 1.0, c: '#E2DFD9' }, { x0: -0.13, x1: 0.13, z0: 5.29, z1: 5.51, y: 1.0, h: 0.52, c: '#2A2927' }] },
  { id: 'living', title: 'Living room, late afternoon', time: '16:30', res: 'Residence 11.01 · The Meridian', tone: 'afternoon',
    W: 6, H: 3.2, zb: 7.5, eye: 1.3, f: 500, camX: -0.6, cy: 470,
    windows: [{ wall: 'right', a: 2.0, b: 7.0, y0: 0.05, y1: 2.9, panes: 4 }], az: 168, alt: 20,
    objects: [{ x0: -2.6, x1: -0.6, z0: 5.6, z1: 6.5, h: 0.42, c: '#7F7A73' }, { x0: -2.6, x1: -0.6, z0: 6.3, z1: 6.5, h: 0.8, c: '#77726B' }, { x0: -1.9, x1: -1.0, z0: 4.4, z1: 4.9, h: 0.36, c: '#A68E6F' }] },
  { id: 'bedroom', title: 'Bedroom two, before dusk', time: '18:50', res: 'Residence 12.02 · The Meridian', tone: 'dusk',
    W: 4.4, H: 3.2, zb: 6.8, eye: 1.3, f: 520, camX: 0.3, cy: 470,
    windows: [{ wall: 'back', a: -1.9, b: 1.4, y0: 0.05, y1: 2.8, panes: 3 }], az: -78, alt: 7,
    objects: [{ x0: -2.2, x1: -0.4, z0: 4.0, z1: 6.1, h: 0.48, c: '#D9D2C6' }, { x0: -2.2, x1: -0.4, z0: 6.1, z1: 6.25, h: 1.0, c: '#7D7268' }] },
  { id: 'stair', title: 'The lobby stair', time: '09:15', res: 'Ground floor · Lantern Quay', tone: 'morning',
    W: 5, H: 4.2, zb: 8, eye: 1.6, f: 520, camX: -0.5, cy: 450,
    windows: [{ wall: 'left', a: 2.5, b: 7.5, y0: 0.3, y1: 3.9, panes: 7 }], az: 12, alt: 26,
    objects: Array.from({ length: 12 }, (_, i) => ({ x0: 1.2, x1: 2.5, z0: 3.0 + i * 0.36, z1: 3.36 + i * 0.36, h: 0.18 * (i + 1), c: i % 2 ? '#CFCBC4' : '#C8C4BD' })) },
];

const VW = 800, VH = 1000;
const r1 = (n) => Math.round(n * 10) / 10;

function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

function camera(sc) {
  const cx = VW / 2;
  return (x, y, z) => [cx + (sc.f * (x - sc.camX)) / z, sc.cy - (sc.f * (y - sc.eye)) / z];
}
const pts = (arr) => arr.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' ');

function paneCorners(sc, w) {
  const out = [];
  for (let i = 0; i < w.panes; i++) {
    const gap = 0.05;
    const a = w.a + ((w.b - w.a) * i) / w.panes + gap, b = w.a + ((w.b - w.a) * (i + 1)) / w.panes - gap;
    if (w.wall === 'left' || w.wall === 'right') {
      const x = w.wall === 'left' ? -sc.W / 2 : sc.W / 2;
      out.push([[x, w.y0, a], [x, w.y0, b], [x, w.y1, b], [x, w.y1, a]]);
    } else out.push([[a, w.y0, sc.zb], [b, w.y0, sc.zb], [b, w.y1, sc.zb], [a, w.y1, sc.zb]]);
  }
  return out;
}

function lightPolys(sc, az, alt) {
  const P = camera(sc);
  const d = [Math.cos(alt * DEG) * Math.cos(az * DEG), -Math.sin(alt * DEG), Math.cos(alt * DEG) * Math.sin(az * DEG)];
  const zn = 0.7, hw = sc.W / 2;
  const floor = [], walls = [], beams = [];
  for (const w of sc.windows) {
    const beamPts = [];
    for (const C of paneCorners(sc, w)) {
      C.forEach((c) => beamPts.push(P(c[0], c[1], c[2])));
      // floor
      const fl = C.map((c) => { const t = -c[1] / d[1]; return [c[0] + t * d[0], c[2] + t * d[2]]; });
      const fc = clipRect(fl, [-hw, zn, hw, sc.zb]);
      if (fc.length > 2) { const s = fc.map((q) => P(q[0], 0, q[1])); floor.push(s); s.forEach((q) => beamPts.push(q)); }
      // side walls
      for (const side of [-1, 1]) {
        if (Math.sign(d[0]) !== side || Math.abs(d[0]) < 1e-3) continue;
        const X = side * hw;
        const wl = C.map((c) => { const t = (X - c[0]) / d[0]; return [c[2] + t * d[2], c[1] + t * d[1]]; });
        const wc = clipRect(wl, [zn, 0, sc.zb, sc.H]);
        if (wc.length > 2) { const s = wc.map((q) => P(X, q[1], q[0])); walls.push(s); s.forEach((q) => beamPts.push(q)); }
      }
      if (d[2] > 1e-3 && w.wall !== 'back') {
        const bl = C.map((c) => { const t = (sc.zb - c[2]) / d[2]; return [c[0] + t * d[0], c[1] + t * d[1]]; });
        const bc = clipRect(bl, [-hw, 0, hw, sc.H]);
        if (bc.length > 2) { const s = bc.map((q) => P(q[0], q[1], sc.zb)); walls.push(s); s.forEach((q) => beamPts.push(q)); }
      }
    }
    beams.push(hull(beamPts));
  }
  // object shadows on the floor
  const shadows = [];
  for (const o of sc.objects) {
    const y0 = o.y || 0, y1 = y0 + o.h;
    const corners = [];
    for (const x of [o.x0, o.x1]) for (const z of [o.z0, o.z1]) for (const y of [y0, y1]) {
      const t = -y / d[1]; corners.push([x + t * d[0], z + t * d[2]]);
    }
    const hp = clipRect(hull(corners), [-hw, zn, hw, sc.zb]);
    if (hp.length > 2) shadows.push(hp.map((q) => P(q[0], 0, q[1])));
  }
  return { floor, walls, beams, shadows };
}

function box(P, sc, o, tone) {
  const y0 = o.y || 0, y1 = y0 + o.h;
  const c = (x, y, z) => P(x, y, z);
  let s = '';
  // top
  if (sc.eye > y1) s += `<polygon points="${pts([c(o.x0, y1, o.z0), c(o.x1, y1, o.z0), c(o.x1, y1, o.z1), c(o.x0, y1, o.z1)])}" fill="${o.c}" style="filter:brightness(1.1)"/>`;
  // sides facing the camera
  if (sc.camX < o.x0) s += `<polygon points="${pts([c(o.x0, y0, o.z0), c(o.x0, y0, o.z1), c(o.x0, y1, o.z1), c(o.x0, y1, o.z0)])}" fill="${o.c}" style="filter:brightness(.82)"/>`;
  if (sc.camX > o.x1) s += `<polygon points="${pts([c(o.x1, y0, o.z0), c(o.x1, y0, o.z1), c(o.x1, y1, o.z1), c(o.x1, y1, o.z0)])}" fill="${o.c}" style="filter:brightness(.78)"/>`;
  s += `<polygon points="${pts([c(o.x0, y0, o.z0), c(o.x1, y0, o.z0), c(o.x1, y1, o.z0), c(o.x0, y1, o.z0)])}" fill="${o.c}" style="filter:brightness(.92)"/>`;
  return s;
}

export function renderInterior(svg, sc) {
  const P = camera(sc);
  const T = TONES[sc.tone];
  const hw = sc.W / 2, zn = 0.7, id = 'ip-' + sc.id;
  const q = (arr) => pts(arr.map((p) => P(p[0], p[1], p[2])));
  const floor = q([[-hw, 0, zn], [hw, 0, zn], [hw, 0, sc.zb], [-hw, 0, sc.zb]]);
  const left = q([[-hw, 0, zn], [-hw, 0, sc.zb], [-hw, sc.H, sc.zb], [-hw, sc.H, zn]]);
  const right = q([[hw, 0, zn], [hw, 0, sc.zb], [hw, sc.H, sc.zb], [hw, sc.H, zn]]);
  const back = q([[-hw, 0, sc.zb], [hw, 0, sc.zb], [hw, sc.H, sc.zb], [-hw, sc.H, sc.zb]]);
  const ceil = q([[-hw, sc.H, zn], [hw, sc.H, zn], [hw, sc.H, sc.zb], [-hw, sc.H, sc.zb]]);
  let glass = '';
  for (const w of sc.windows) for (const C of paneCorners(sc, w)) glass += `<polygon class="ip-glass" points="${q(C)}" fill="url(#${id}-sky)"/>`;
  let frames = '';
  for (const w of sc.windows) {
    const all = paneCorners(sc, w);
    const first = all[0], last = all[all.length - 1];
    const outline = [first[0], last[1], last[2], first[3]];
    frames += `<polygon points="${q(outline)}" fill="none" stroke="#141414" stroke-width="2.2" stroke-linejoin="round"/>`;
  }
  const objs = sc.objects.slice().sort((a, b) => b.z1 - a.z1).map((o) => box(P, sc, o, T)).join('');
  const corner = (a, b) => `<path d="M${pts([P(...a)]).replace(',', ' ')}L${pts([P(...b)]).replace(',', ' ')}" stroke="rgba(20,20,20,.35)" stroke-width="6" filter="url(#${id}-ao)"/>`;
  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  svg.innerHTML = `<defs>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.sky[0]}"/><stop offset="1" stop-color="${T.sky[1]}"/></linearGradient>
    <linearGradient id="${id}-fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.floor}"/><stop offset="1" stop-color="${T.floor}" stop-opacity=".82"/></linearGradient>
    <linearGradient id="${id}-beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${T.beam}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="${id}-vig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#141414" stop-opacity="0"/><stop offset="1" stop-color="#141414" stop-opacity=".38"/></radialGradient>
    <filter id="${id}-soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="${id}-ao" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="${id}-beamblur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9"/></filter>
    <clipPath id="${id}-lit"></clipPath>
  </defs>
  <rect width="${VW}" height="${VH}" fill="${T.floor}"/>
  <polygon points="${ceil}" fill="${T.ceil}"/>
  <polygon points="${back}" fill="${T.back}"/>
  <polygon points="${left}" fill="${T.left}"/>
  <polygon points="${right}" fill="${T.right}"/>
  <polygon points="${floor}" fill="url(#${id}-fl)"/>
  ${corner([-hw, 0, zn], [-hw, 0, sc.zb])}${corner([hw, 0, zn], [hw, 0, sc.zb])}${corner([-hw, 0, sc.zb], [hw, 0, sc.zb])}
  ${corner([-hw, sc.H, sc.zb], [hw, sc.H, sc.zb])}${corner([-hw, 0, sc.zb], [-hw, sc.H, sc.zb])}${corner([hw, 0, sc.zb], [hw, sc.H, sc.zb])}
  ${glass}${frames}
  <g class="ip-light" filter="url(#${id}-soft)" style="mix-blend-mode:screen"></g>
  <g class="ip-shadow" clip-path="url(#${id}-lit)" filter="url(#${id}-soft)"></g>
  <g class="ip-beam" filter="url(#${id}-beamblur)"></g>
  <g class="ip-objs">${objs}</g>
  <rect width="${VW}" height="${VH}" fill="url(#${id}-vig)" pointer-events="none"/>`;
  svg._scene = sc;
  updateInterior(svg, 0);
}

export function updateInterior(svg, offset) {
  const sc = svg._scene; if (!sc) return;
  const T = TONES[sc.tone], id = 'ip-' + sc.id;
  const L = lightPolys(sc, sc.az + offset, Math.max(4, sc.alt + offset * 0.25));
  const all = L.floor.concat(L.walls);
  svg.querySelector('.ip-light').innerHTML = all.map((p) => `<polygon points="${pts(p)}" fill="${T.light}" opacity=".9"/>`).join('');
  svg.querySelector(`#${id}-lit`).innerHTML = L.floor.map((p) => `<polygon points="${pts(p)}"/>`).join('');
  svg.querySelector('.ip-shadow').innerHTML = L.shadows.map((p) => `<polygon points="${pts(p)}" fill="${T.floor}" opacity=".88"/>`).join('');
  svg.querySelector('.ip-beam').innerHTML = L.beams.filter((b) => b.length > 2).map((b) => `<polygon points="${pts(b)}" fill="url(#${id}-beam)"/>`).join('');
}
