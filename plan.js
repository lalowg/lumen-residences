/* LUMEN RESIDENCES — plan data, daylight geometry and plan drawing.
   Units are metres. Plan coordinates: x to the right, y downward; the top
   edge of every plan is its principal facade. `rot` (per listing) is the
   compass bearing that the principal facade faces. */

export const S = 40;            // SVG units per metre
export const DEG = Math.PI / 180;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export const PLANS = {
  atelier: {
    id: 'atelier', name: 'The Atelier', beds: 1, w: 10, h: 7, ceil: 2.9,
    rooms: [
      { id: 'living', name: 'Living & kitchen', short: 'Living', r: [0, 0, 6.5, 4.5], floor: 'oak' },
      { id: 'bedroom', name: 'Bedroom', short: 'Bedroom', r: [6.5, 0, 10, 4.5], floor: 'oak' },
      { id: 'entry', name: 'Entry', short: 'Entry', r: [0, 4.5, 3, 7], floor: 'stone' },
      { id: 'bath', name: 'Bath', short: 'Bath', r: [3, 4.5, 5.5, 7], floor: 'stone' },
      { id: 'loggia', name: 'Loggia', short: 'Loggia', r: [5.5, 4.5, 10, 7], floor: 'deck', outdoor: true },
    ],
    windows: [
      { room: 'living', side: 'n', a: 0.6, b: 2.9 }, { room: 'living', side: 'n', a: 3.5, b: 6.0 },
      { room: 'living', side: 'w', a: 0.8, b: 3.7 },
      { room: 'bedroom', side: 'n', a: 7.2, b: 9.4 }, { room: 'bedroom', side: 'e', a: 1.0, b: 3.6 },
      { room: 'bedroom', side: 's', a: 7.0, b: 9.3 },
    ],
    doors: [
      { x: 1.0, y: 4.5, o: 'h', w: 0.9, sw: -1 }, { x: 3, y: 5.2, o: 'v', w: 0.8, sw: 1 },
      { x: 6.5, y: 3.0, o: 'v', w: 0.85, sw: 1 }, { x: 0.9, y: 7, o: 'h', w: 1.0, sw: -1, front: true },
    ],
    furniture: [
      { t: 'rug', x: 0.7, y: 1.3, w: 2.8, d: 2.0, h: 0.01 },
      { t: 'sofa', x: 0.6, y: 3.2, w: 2.6, d: 0.95, h: 0.75 },
      { t: 'table', x: 1.3, y: 1.8, w: 1.3, d: 0.7, h: 0.38 },
      { t: 'island', x: 4.3, y: 1.4, w: 0.95, d: 2.2, h: 0.92 },
      { t: 'bed', x: 7.3, y: 1.1, w: 1.8, d: 2.1, h: 0.5 },
      { t: 'bench', x: 0.3, y: 5.0, w: 0.45, d: 1.4, h: 0.45 },
      { t: 'tub', x: 3.3, y: 6.0, w: 1.7, d: 0.75, h: 0.55 },
      { t: 'planter', x: 9.2, y: 4.8, w: 0.55, d: 1.9, h: 0.6 },
      { t: 'table', x: 6.4, y: 5.3, w: 1.0, d: 1.0, h: 0.72 },
    ],
  },
  courtyard: {
    id: 'courtyard', name: 'The Courtyard', beds: 2, w: 12, h: 8.5, ceil: 3.0,
    rooms: [
      { id: 'living', name: 'Living room', short: 'Living', r: [0, 0, 5.5, 5], floor: 'oak' },
      { id: 'kitchen', name: 'Kitchen & dining', short: 'Kitchen', r: [5.5, 0, 8, 5], floor: 'stone' },
      { id: 'principal', name: 'Principal bedroom', short: 'Bedroom', r: [8, 0, 12, 5], floor: 'oak' },
      { id: 'second', name: 'Bedroom two', short: 'Bed 2', r: [0, 5, 4, 8.5], floor: 'oak' },
      { id: 'bath', name: 'Bath', short: 'Bath', r: [4, 5, 6, 8.5], floor: 'stone' },
      { id: 'hall', name: 'Hall', short: 'Hall', r: [6, 5, 9.5, 8.5], floor: 'stone' },
      { id: 'study', name: 'Study', short: 'Study', r: [9.5, 5, 12, 8.5], floor: 'oak' },
    ],
    windows: [
      { room: 'living', side: 'n', a: 0.6, b: 2.6 }, { room: 'living', side: 'n', a: 3.0, b: 5.0 },
      { room: 'living', side: 'w', a: 0.8, b: 4.2 },
      { room: 'kitchen', side: 'n', a: 5.9, b: 7.6 },
      { room: 'principal', side: 'n', a: 8.6, b: 11.4 }, { room: 'principal', side: 'e', a: 0.8, b: 3.8 },
      { room: 'second', side: 'w', a: 5.7, b: 7.7 }, { room: 'second', side: 's', a: 0.6, b: 3.2 },
      { room: 'study', side: 'e', a: 5.6, b: 7.9 }, { room: 'study', side: 's', a: 10.0, b: 11.5 },
    ],
    doors: [
      { x: 5.5, y: 1.0, o: 'v', w: 3.2, open: true }, { x: 6.3, y: 5, o: 'h', w: 1.4, open: true },
      { x: 8.4, y: 5, o: 'h', w: 0.9, sw: -1 }, { x: 2.6, y: 5, o: 'h', w: 0.9, sw: 1 },
      { x: 6, y: 6.0, o: 'v', w: 0.8, sw: -1 }, { x: 9.5, y: 6.3, o: 'v', w: 0.85, sw: 1 },
      { x: 7.2, y: 8.5, o: 'h', w: 1.0, sw: -1, front: true },
    ],
    furniture: [
      { t: 'rug', x: 0.8, y: 1.3, w: 3.0, d: 2.3, h: 0.01 },
      { t: 'sofa', x: 0.7, y: 3.6, w: 2.8, d: 0.95, h: 0.75 },
      { t: 'table', x: 1.5, y: 2.1, w: 1.3, d: 0.7, h: 0.38 },
      { t: 'chair', x: 4.0, y: 1.1, w: 0.85, d: 0.85, h: 0.75 },
      { t: 'island', x: 6.2, y: 1.2, w: 1.1, d: 2.4, h: 0.92 },
      { t: 'bed', x: 9.1, y: 1.3, w: 1.8, d: 2.1, h: 0.5 },
      { t: 'bed', x: 0.8, y: 5.9, w: 1.5, d: 2.0, h: 0.5 },
      { t: 'tub', x: 4.2, y: 7.4, w: 1.6, d: 0.75, h: 0.55 },
      { t: 'bench', x: 8.9, y: 5.6, w: 0.45, d: 1.3, h: 0.45 },
      { t: 'desk', x: 10.0, y: 7.3, w: 1.6, d: 0.7, h: 0.75 },
    ],
  },
  meridian: {
    id: 'meridian', name: 'The Meridian', beds: 2, w: 16, h: 10, ceil: 3.2,
    rooms: [
      { id: 'living', name: 'Living room', short: 'Living', r: [0, 0, 7, 6], floor: 'oak' },
      { id: 'kitchen', name: 'Kitchen & dining', short: 'Kitchen', r: [7, 0, 11.5, 6], floor: 'stone' },
      { id: 'terrace', name: 'Terrace', short: 'Terrace', r: [11.5, 0, 16, 6], floor: 'deck', outdoor: true },
      { id: 'principal', name: 'Principal suite', short: 'Suite', r: [0, 6, 5.5, 10], floor: 'oak' },
      { id: 'bath', name: 'Bath & dressing', short: 'Bath', r: [5.5, 6, 8, 10], floor: 'stone' },
      { id: 'entry', name: 'Entrance gallery', short: 'Entry', r: [8, 6, 11, 10], floor: 'stone' },
      { id: 'second', name: 'Bedroom two', short: 'Bed 2', r: [11, 6, 16, 10], floor: 'oak' },
    ],
    windows: [
      { room: 'living', side: 'n', a: 0.6, b: 3.2 }, { room: 'living', side: 'n', a: 3.8, b: 6.4 },
      { room: 'living', side: 'w', a: 0.8, b: 5.2 },
      { room: 'kitchen', side: 'n', a: 7.6, b: 11.0 }, { room: 'kitchen', side: 'e', a: 0.7, b: 5.3 },
      { room: 'principal', side: 'w', a: 6.6, b: 9.4 }, { room: 'principal', side: 's', a: 0.8, b: 4.6 },
      { room: 'bath', side: 's', a: 6.0, b: 7.4 },
      { room: 'second', side: 'e', a: 6.6, b: 9.4 }, { room: 'second', side: 's', a: 12.0, b: 15.0 },
      { room: 'second', side: 'n', a: 12.4, b: 15.2 },
    ],
    doors: [
      { x: 7, y: 1.0, o: 'v', w: 4.0, open: true }, { x: 8.4, y: 6, o: 'h', w: 2.2, open: true },
      { x: 4.2, y: 6, o: 'h', w: 0.9, sw: 1 }, { x: 5.5, y: 6.4, o: 'v', w: 0.85, sw: 1 },
      { x: 11, y: 7.0, o: 'v', w: 0.9, sw: 1 }, { x: 9.0, y: 10, o: 'h', w: 1.1, sw: -1, front: true },
    ],
    furniture: [
      { t: 'rug', x: 1.0, y: 1.4, w: 3.6, d: 2.6, h: 0.01 },
      { t: 'sofa', x: 1.0, y: 4.4, w: 3.2, d: 1.0, h: 0.75 },
      { t: 'table', x: 1.9, y: 2.4, w: 1.5, d: 0.8, h: 0.38 },
      { t: 'chair', x: 5.0, y: 1.4, w: 0.9, d: 0.9, h: 0.75 },
      { t: 'island', x: 7.9, y: 1.1, w: 2.8, d: 1.0, h: 0.92 },
      { t: 'table', x: 8.1, y: 3.5, w: 2.4, d: 1.0, h: 0.75 },
      { t: 'planter', x: 15.1, y: 0.4, w: 0.6, d: 4.8, h: 0.6 },
      { t: 'lounger', x: 12.4, y: 3.4, w: 0.8, d: 1.9, h: 0.4 },
      { t: 'lounger', x: 13.6, y: 3.4, w: 0.8, d: 1.9, h: 0.4 },
      { t: 'bed', x: 1.2, y: 6.9, w: 2.0, d: 2.2, h: 0.5 },
      { t: 'tub', x: 5.8, y: 8.9, w: 1.8, d: 0.8, h: 0.55 },
      { t: 'bench', x: 10.3, y: 7.9, w: 0.45, d: 1.6, h: 0.45 },
      { t: 'bed', x: 12.6, y: 7.1, w: 1.8, d: 2.1, h: 0.5 },
    ],
  },
};

// Fictional listings. `rot` is the bearing the principal facade faces.
export const LISTINGS = [
  { no: '2.04', plan: 'atelier', level: 2, rot: 135, price: 640000, status: 'available' },
  { no: '3.01', plan: 'courtyard', level: 3, rot: 180, price: 1080000, status: 'reserved' },
  { no: '4.06', plan: 'atelier', level: 4, rot: 270, price: 655000, status: 'available' },
  { no: '5.02', plan: 'courtyard', level: 5, rot: 225, price: 1125000, status: 'available' },
  { no: '6.03', plan: 'courtyard', level: 6, rot: 90, price: 1150000, status: 'available' },
  { no: '8.01', plan: 'atelier', level: 8, rot: 180, price: 720000, status: 'reserved' },
  { no: '11.01', plan: 'meridian', level: 11, rot: 180, price: 2850000, status: 'available' },
  { no: '12.02', plan: 'meridian', level: 12, rot: 225, price: 3100000, status: 'available' },
];

export const BEARING = (deg) => ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.round((((deg % 360) + 360) % 360) / 45) % 8];
export const fmtTime = (t) => { const m = Math.round(t * 60); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
export const roomArea = (r) => (r.r[2] - r.r[0]) * (r.r[3] - r.r[1]);
export const planArea = (p) => p.rooms.filter((r) => !r.outdoor).reduce((s, r) => s + roomArea(r), 0);
export const outdoorArea = (p) => p.rooms.filter((r) => r.outdoor).reduce((s, r) => s + roomArea(r), 0);

/* ---------------------------------------------------------------- */
/* Geometry                                                          */
/* ---------------------------------------------------------------- */
export function clipRect(poly, [x0, y0, x1, y1]) {
  const planes = [
    [(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((x0 - a[0]) / (b[0] - a[0])) * (b[1] - a[1])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((x1 - a[0]) / (b[0] - a[0])) * (b[1] - a[1])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((y0 - a[1]) / (b[1] - a[1])) * (b[0] - a[0]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + ((y1 - a[1]) / (b[1] - a[1])) * (b[0] - a[0]), y1]],
  ];
  let out = poly;
  for (const [inside, cut] of planes) {
    const src = out; out = [];
    for (let i = 0; i < src.length; i++) {
      const cur = src[i], prev = src[(i + src.length - 1) % src.length];
      const ci = inside(cur), pi = inside(prev);
      if (ci) { if (!pi) out.push(cut(prev, cur)); out.push(cur); } else if (pi) out.push(cut(prev, cur));
    }
    if (!out.length) break;
  }
  return out;
}
export function polyArea(p) {
  let s = 0;
  for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; }
  return Math.abs(s) / 2;
}

const NORMAL = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
export function winPoints(room, w) {
  const [x0, y0, x1, y1] = room.r;
  if (w.side === 'n') return [[w.a, y0], [w.b, y0]];
  if (w.side === 's') return [[w.a, y1], [w.b, y1]];
  if (w.side === 'w') return [[x0, w.a], [x0, w.b]];
  return [[x1, w.a], [x1, w.b]];
}

// An illustrative clear equinox day: sunrise 06:00 due east, highest at 13:00 due south, sunset 20:00 due west.
export function sunAt(t) {
  const k = clamp((t - 6) / 14, 0, 1);
  return { az: 90 + k * 180, alt: 52 * Math.sin(Math.PI * k) };
}

export function lightFor(plan, rot, t) {
  const { az, alt } = sunAt(t);
  const fade = smooth(0.3, 7, alt);
  const phi = (az + 180 - rot) * DEG;               // travel direction of light, in plan space
  const L = [Math.sin(phi), -Math.cos(phi)];
  const len = alt > 0.4 ? Math.min(14, (plan.ceil - 0.25) / Math.tan(alt * DEG)) : 0;
  const rooms = {};
  for (const r of plan.rooms) rooms[r.id] = { patches: [], lit: 0, spill: 0, spillSide: null, area: roomArea(r), frac: 0 };
  if (fade > 0) {
    for (const w of plan.windows) {
      const room = plan.rooms.find((r) => r.id === w.room);
      const n = NORMAL[w.side];
      const k = -(n[0] * L[0] + n[1] * L[1]);
      if (k <= 0.04) continue;
      const [p1, p2] = winPoints(room, w);
      const quad = [p1, p2, [p2[0] + L[0] * len, p2[1] + L[1] * len], [p1[0] + L[0] * len, p1[1] + L[1] * len]];
      const poly = clipRect(quad, room.r);
      if (poly.length < 3) continue;
      const a = polyArea(poly);
      const op = (0.32 + 0.6 * k) * fade;
      const R = rooms[w.room];
      R.patches.push({ poly, op });
      R.lit += a;
      R.spill += Math.max(0, polyArea(quad) - a) * op;
    }
  }
  for (const r of plan.rooms) {
    const R = rooms[r.id];
    if (r.outdoor) { R.frac = fade > 0 ? 1 : 0; R.lit = R.area * R.frac; }
    else R.frac = Math.min(1, R.lit / R.area);
    // the wall that receives light that overshoots the floor
    const sides = ['n', 's', 'e', 'w'];
    R.spillSide = sides.reduce((best, s) => (NORMAL[s][0] * L[0] + NORMAL[s][1] * L[1] > NORMAL[best][0] * L[0] + NORMAL[best][1] * L[1] ? s : best), 'n');
  }
  return { t, az, alt, fade, L, phi, len, rooms, sunBearing: az, sunLocal: az - rot };
}

export function dayCurve(plan, rot, roomId, step = 0.25) {
  const pts = [];
  for (let t = 6; t <= 20.0001; t += step) pts.push([t, lightFor(plan, rot, t).rooms[roomId].frac]);
  return pts;
}

export function sunWindow(plan, rot, roomId, min = 0.06) {
  const c = dayCurve(plan, rot, roomId, 0.25).filter((p) => p[1] >= min && sunAt(p[0]).alt >= 8);
  if (!c.length) return null;
  return [c[0][0], c[c.length - 1][0]];
}

export function bestHour(plan, rot, roomId = 'living') {
  let best = [9, 0];
  for (const p of dayCurve(plan, rot, roomId, 0.5)) {
    const v = p[1] * Math.min(1, sunAt(p[0]).alt / 30);
    if (v > best[1]) best = [p[0], v];
  }
  return best[0];
}

/* ---------------------------------------------------------------- */
/* Plan drawing (SVG strings)                                        */
/* ---------------------------------------------------------------- */
const f = (n) => Math.round(n * 100) / 100;

function furnitureSVG(fu) {
  const x = fu.x * S, y = fu.y * S, w = fu.w * S, d = fu.d * S;
  let s = `<rect class="pl-f pl-f--${fu.t}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(d)}" rx="${fu.t === 'rug' ? 0 : 3}"/>`;
  if (fu.t === 'sofa') s += `<path class="pl-fl" d="M${f(x + 4)} ${f(y + d - 9)}H${f(x + w - 4)}"/>`;
  if (fu.t === 'bed') s += `<path class="pl-fl" d="M${f(x + 3)} ${f(y + 15)}H${f(x + w - 3)}M${f(x + w / 2)} ${f(y + 3)}V${f(y + 13)}"/>`;
  if (fu.t === 'tub') s += `<rect class="pl-fl" x="${f(x + 5)}" y="${f(y + 5)}" width="${f(w - 10)}" height="${f(d - 10)}" rx="10"/>`;
  if (fu.t === 'island') s += `<path class="pl-fl" d="M${f(x + 6)} ${f(y + 6)}h8M${f(x + 6)} ${f(y + 18)}h8"/>`;
  if (fu.t === 'lounger') s += `<path class="pl-fl" d="M${f(x + 3)} ${f(y + 16)}H${f(x + w - 3)}"/>`;
  if (fu.t === 'planter') s += `<circle class="pl-fl" cx="${f(x + w / 2)}" cy="${f(y + d * 0.25)}" r="7"/><circle class="pl-fl" cx="${f(x + w / 2)}" cy="${f(y + d * 0.7)}" r="8"/>`;
  return s;
}

export function planSVG(plan) {
  const W = plan.w * S, H = plan.h * S, P = 58;
  const cx = W / 2, cy = H / 2, R = Math.hypot(W, H) * 0.75;
  let rays = '';
  for (let x = -R; x <= R; x += 18) rays += `M${f(cx + x)} ${f(cy - R)}V${f(cy + R)}`;
  const clips = plan.rooms.map((r) => `<clipPath id="lr-c-${r.id}"><rect x="${r.r[0] * S}" y="${r.r[1] * S}" width="${(r.r[2] - r.r[0]) * S}" height="${(r.r[3] - r.r[1]) * S}"/></clipPath>`).join('');
  const floors = plan.rooms.map((r) => `<rect class="pl-room${r.outdoor ? ' is-out' : ''}" data-room="${r.id}" x="${r.r[0] * S}" y="${r.r[1] * S}" width="${(r.r[2] - r.r[0]) * S}" height="${(r.r[3] - r.r[1]) * S}"/>`).join('');
  const lights = plan.rooms.map((r) => `<g clip-path="url(#lr-c-${r.id})" data-light="${r.id}"></g>`).join('');
  const parts = plan.rooms.map((r) => `<rect class="pl-part" x="${r.r[0] * S}" y="${r.r[1] * S}" width="${(r.r[2] - r.r[0]) * S}" height="${(r.r[3] - r.r[1]) * S}"/>`).join('');
  const hits = plan.rooms.map((r) => `<rect class="pl-hit" data-room="${r.id}" x="${r.r[0] * S}" y="${r.r[1] * S}" width="${(r.r[2] - r.r[0]) * S}" height="${(r.r[3] - r.r[1]) * S}"><title>${r.name}</title></rect>`).join('');
  let open = '';
  for (const w of plan.windows) {
    const room = plan.rooms.find((r) => r.id === w.room);
    const [p1, p2] = winPoints(room, w);
    const ext = (w.side === 'n' && room.r[1] === 0) || (w.side === 's' && room.r[3] === plan.h) || (w.side === 'w' && room.r[0] === 0) || (w.side === 'e' && room.r[2] === plan.w);
    const t = ext ? 7 : 4;
    if (w.side === 'n' || w.side === 's') {
      const y = p1[1] * S;
      open += `<rect class="pl-gap" x="${f(p1[0] * S)}" y="${f(y - t)}" width="${f((p2[0] - p1[0]) * S)}" height="${2 * t}"/><path class="pl-glass" data-win="${w.room}" d="M${f(p1[0] * S)} ${f(y - 2.2)}H${f(p2[0] * S)}M${f(p1[0] * S)} ${f(y + 2.2)}H${f(p2[0] * S)}"/>`;
    } else {
      const x = p1[0] * S;
      open += `<rect class="pl-gap" x="${f(x - t)}" y="${f(p1[1] * S)}" width="${2 * t}" height="${f((p2[1] - p1[1]) * S)}"/><path class="pl-glass" data-win="${w.room}" d="M${f(x - 2.2)} ${f(p1[1] * S)}V${f(p2[1] * S)}M${f(x + 2.2)} ${f(p1[1] * S)}V${f(p2[1] * S)}"/>`;
    }
  }
  for (const d of plan.doors) {
    const x = d.x * S, y = d.y * S, w = d.w * S, t = d.front ? 8 : 5;
    if (d.o === 'h') {
      open += `<rect class="pl-gap" x="${f(x)}" y="${f(y - t)}" width="${f(w)}" height="${2 * t}"/>`;
      if (!d.open) open += `<path class="pl-door" d="M${f(x)} ${f(y)}V${f(y + d.sw * w)}M${f(x + w)} ${f(y)}A${f(w)} ${f(w)} 0 0 ${d.sw > 0 ? 1 : 0} ${f(x)} ${f(y + d.sw * w)}"/>`;
      if (d.front) open += `<path class="pl-entry" d="M${f(x + w / 2 - 7)} ${f(y + 22)}L${f(x + w / 2)} ${f(y + 12)}L${f(x + w / 2 + 7)} ${f(y + 22)}Z"/>`;
    } else {
      open += `<rect class="pl-gap" x="${f(x - t)}" y="${f(y)}" width="${2 * t}" height="${f(w)}"/>`;
      if (!d.open) open += `<path class="pl-door" d="M${f(x)} ${f(y)}H${f(x + d.sw * w)}M${f(x)} ${f(y + w)}A${f(w)} ${f(w)} 0 0 ${d.sw > 0 ? 0 : 1} ${f(x + d.sw * w)} ${f(y)}"/>`;
    }
  }
  const dims = `<g class="pl-dims">
    <path d="M0 ${-34}H${W}M0 ${-40}V${-28}M${W} ${-40}V${-28}M${-34} 0V${H}M${-40} 0H${-28}M${-40} ${H}H${-28}"/>
    <text class="pl-dimtxt" x="${cx}" y="-42" text-anchor="middle">${plan.w.toFixed(2)} m</text>
    <text class="pl-dimtxt" x="${-42}" y="${cy}" text-anchor="middle" transform="rotate(-90 ${-42} ${cy})">${plan.h.toFixed(2)} m</text>
  </g>`;
  return `<svg class="plan__svg" viewBox="${-P} ${-P} ${W + 2 * P} ${H + 2 * P}" role="img" aria-label="Floor plan of ${plan.name}, with today's sunlight drawn into each room">
  <defs>
    <pattern id="lr-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(20,20,20,.07)" stroke-width=".6"/></pattern>
    <pattern id="lr-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V9" stroke="rgba(20,20,20,.16)" stroke-width="1"/></pattern>
    <filter id="lr-soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.4"/></filter>
    ${clips}
  </defs>
  <rect class="pl-ground" x="${-P}" y="${-P}" width="${W + 2 * P}" height="${H + 2 * P}" fill="url(#lr-grid)"/>
  <g class="pl-rays-wrap"><path class="pl-rays" d="${rays}"/></g>
  <g class="pl-floors">${floors}</g>
  <g class="pl-hatch">${plan.rooms.filter((r) => r.outdoor).map((r) => `<rect x="${r.r[0] * S}" y="${r.r[1] * S}" width="${(r.r[2] - r.r[0]) * S}" height="${(r.r[3] - r.r[1]) * S}" fill="url(#lr-hatch)"/>`).join('')}</g>
  <g class="pl-light" filter="url(#lr-soft)">${lights}</g>
  <g class="pl-furn">${plan.furniture.map(furnitureSVG).join('')}</g>
  <g class="pl-parts">${parts}</g>
  <rect class="pl-outline" x="0" y="0" width="${W}" height="${H}"/>
  <g class="pl-open">${open}</g>
  ${dims}
  <g class="pl-sel"><rect class="pl-selrect" x="0" y="0" width="0" height="0"/></g>
  <g class="pl-hits">${hits}</g>
</svg>`;
}

// Small listing thumbnail, rotated so north is up.
export function thumbSVG(plan, rot) {
  const W = plan.w * S, H = plan.h * S, D = Math.hypot(W, H) + 24;
  const rooms = plan.rooms.map((r) => `<rect class="th-room${r.outdoor ? ' is-out' : ''}" x="${r.r[0] * S}" y="${r.r[1] * S}" width="${(r.r[2] - r.r[0]) * S}" height="${(r.r[3] - r.r[1]) * S}"/>`).join('');
  const glass = plan.windows.map((w) => {
    const room = plan.rooms.find((r) => r.id === w.room); const [p1, p2] = winPoints(room, w);
    return `M${p1[0] * S} ${p1[1] * S}L${p2[0] * S} ${p2[1] * S}`;
  }).join('');
  return `<svg class="thumb" viewBox="${-D / 2} ${-D / 2} ${D} ${D}" aria-hidden="true" focusable="false">
    <circle r="${D / 2 - 4}" class="th-ring"/>
    <path class="th-n" d="M0 ${-D / 2 + 2}l-7 14h14z"/>
    <g transform="rotate(${rot - 0}) translate(${-W / 2} ${-H / 2})">${rooms}<rect class="th-out" width="${W}" height="${H}"/><path class="th-glass" d="${glass}"/></g>
  </svg>`;
}
