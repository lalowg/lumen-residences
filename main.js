/* LUMEN RESIDENCES — page orchestration */
import { PLANS, LISTINGS, S, DEG, clamp, planSVG, thumbSVG, lightFor, dayCurve, sunWindow, bestHour, sunAt, fmtTime, BEARING, roomArea, planArea, outdoorArea } from './plan.js';
import { RoomView } from './roomview.js';
import { SCENES, renderInterior, updateInterior } from './interiors.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const euro = (n) => '€' + n.toLocaleString('en-GB');
const m2 = (n) => (Math.round(n * 10) / 10).toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' m²';
const P = 58;

/* ---------------------------------------------------------------- */
/* Header                                                            */
/* ---------------------------------------------------------------- */
const menuBtn = $('.menu-btn');
const nav = $('#site-nav');
menuBtn.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') !== 'true';
  menuBtn.setAttribute('aria-expanded', String(open));
  root.classList.toggle('nav-open', open);
});
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) { menuBtn.setAttribute('aria-expanded', 'false'); root.classList.remove('nav-open'); }
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && root.classList.contains('nav-open')) { menuBtn.setAttribute('aria-expanded', 'false'); root.classList.remove('nav-open'); menuBtn.focus(); }
});
const onScroll = () => root.classList.toggle('is-scrolled', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ---------------------------------------------------------------- */
/* Light study (signature)                                           */
/* ---------------------------------------------------------------- */
const state = { listing: LISTINGS.find((l) => l.no === '11.01'), roomId: 'living', t: reduced ? 9.5 : 6.6, playing: false };
const planOf = () => PLANS[state.listing.plan];

const holder = $('#plan-holder');
const labels = $('#plan-labels');
const stage = $('#rv-stage');
const range = $('#time');
const rv = new RoomView(stage);
let curve = [];

function buildPlan() {
  const plan = planOf();
  holder.innerHTML = planSVG(plan);
  holder.style.aspectRatio = `${plan.w * S + 2 * P} / ${plan.h * S + 2 * P}`;
  const VW = plan.w * S + 2 * P, VH = plan.h * S + 2 * P;
  labels.innerHTML = plan.rooms.map((r) => {
    const cx = ((r.r[0] + r.r[2]) / 2) * S + P, cy = ((r.r[1] + r.r[3]) / 2) * S + P;
    return `<button type="button" class="plan-label${r.outdoor ? ' is-out' : ''}${r.r[2] - r.r[0] < 3.6 ? ' is-narrow' : ''}" data-room="${r.id}" style="left:${((cx / VW) * 100).toFixed(2)}%;top:${((cy / VH) * 100).toFixed(2)}%" aria-pressed="false">
      <span class="plan-label__name"><span class="plan-label__long">${r.name}</span><span class="plan-label__short" aria-hidden="true">${r.short}</span></span>
      <span class="plan-label__area">${m2(roomArea(r))}</span><span class="plan-label__sun" aria-hidden="true"><i></i></span></button>`;
  }).join('');
  $$('.pl-hit', holder).forEach((h) => h.addEventListener('click', () => selectRoom(h.dataset.room, true)));
  const area = planArea(plan), out = outdoorArea(plan);
  $('#res-label').textContent = `No. ${state.listing.no} · ${plan.name}`;
  $('#res-sub').textContent = `Level ${state.listing.level} · ${plan.beds} bedroom${plan.beds > 1 ? 's' : ''} · ${m2(area)}${out ? ' + ' + m2(out) + ' outdoor' : ''} · facade faces ${BEARING(state.listing.rot)}`;
  $$('#type-picker [data-type]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === plan.id)));
}

function selectRoom(id, animate = false) {
  const plan = planOf();
  if (!plan.rooms.find((r) => r.id === id)) id = plan.rooms[0].id;
  const changed = id !== state.roomId || !rv.box || rv.ctx.plan !== plan;
  state.roomId = id;
  $$('.plan-label', labels).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.room === id)));
  const room = plan.rooms.find((r) => r.id === id);
  const sel = $('.pl-selrect', holder);
  sel.setAttribute('x', room.r[0] * S); sel.setAttribute('y', room.r[1] * S);
  sel.setAttribute('width', (room.r[2] - room.r[0]) * S); sel.setAttribute('height', (room.r[3] - room.r[1]) * S);
  $$('.pl-room', holder).forEach((r) => r.classList.toggle('is-sel', r.dataset.room === id));
  curve = dayCurve(plan, state.listing.rot, id);
  const swap = () => { rv.mount(rv.build(plan, id)); render(); };
  if (changed && animate && !reduced) {
    stage.classList.remove('is-sweeping'); void stage.offsetWidth; stage.classList.add('is-sweeping');
    setTimeout(swap, 360);
    setTimeout(() => stage.classList.remove('is-sweeping'), 950);
  } else swap();
  const idx = plan.rooms.indexOf(room);
  $('#ri-index').textContent = `Room ${idx + 1} of ${plan.rooms.length}`;
  $('#ri-name').textContent = room.name;
  $('#ri-area').textContent = m2(roomArea(room));
  $('#ri-ceil').textContent = room.outdoor ? 'Open sky' : plan.ceil.toFixed(2) + ' m';
  const faces = [...new Set(plan.windows.filter((w) => w.room === id).map((w) => BEARING(state.listing.rot + { n: 0, e: 90, s: 180, w: 270 }[w.side])))];
  $('#ri-aspect').textContent = room.outdoor ? 'Open terrace' : faces.length ? faces.map(cap).join(', ') : 'Interior room';
  const win = sunWindow(plan, state.listing.rot, id);
  $('#ri-window').textContent = win ? `${fmtTime(win[0])}–${fmtTime(win[1])}` : 'No direct sun';
  drawCurve();
  render();
}

function drawCurve() {
  const svg = $('#ri-curve');
  const w = 300, h = 64;
  const x = (t) => ((t - 6) / 14) * w, y = (v) => h - 4 - v * (h - 10);
  const line = curve.map((p, i) => (i ? 'L' : 'M') + x(p[0]).toFixed(1) + ' ' + y(p[1]).toFixed(1)).join('');
  svg.innerHTML = `<path class="cv-grid" d="M0 ${h - 4}H${w}M${x(9)} 4V${h}M${x(12)} 4V${h}M${x(15)} 4V${h}M${x(18)} 4V${h}"/>
    <path class="cv-area" d="${line}L${w} ${h - 4}L0 ${h - 4}Z"/><path class="cv-line" d="${line}"/>
    <line class="cv-now" x1="0" x2="0" y1="2" y2="${h}"/><circle class="cv-dot" r="3.5"/>`;
}

function skyFor(t, alt) {
  const k = clamp(alt / 52, 0, 1);
  const warm = clamp(1 - Math.abs(t - 13) / 7, 0, 1);
  const mix = (a, b, m) => a.map((v, i) => Math.round(v + (b[i] - v) * m));
  const top = mix([116, 128, 146], [169, 188, 196], k), low = mix([242, 178, 106], [226, 234, 236], Math.pow(warm, 0.6));
  return [`rgb(${top})`, `rgb(${low})`];
}

function render() {
  const plan = planOf();
  const L = lightFor(plan, state.listing.rot, state.t);
  // plan light
  for (const r of plan.rooms) {
    const g = holder.querySelector(`[data-light="${r.id}"]`);
    if (!g) continue;
    const R = L.rooms[r.id];
    if (r.outdoor) g.innerHTML = L.fade > 0 ? `<rect x="${r.r[0] * S}" y="${r.r[1] * S}" width="${(r.r[2] - r.r[0]) * S}" height="${(r.r[3] - r.r[1]) * S}" class="pl-sun" opacity="${(0.55 * L.fade).toFixed(2)}"/>` : '';
    else g.innerHTML = R.patches.map((p) => `<polygon class="pl-sun" points="${p.poly.map((q) => (q[0] * S).toFixed(1) + ',' + (q[1] * S).toFixed(1)).join(' ')}" opacity="${Math.min(1, p.op * 1.1).toFixed(2)}"/>`).join('');
    const lab = labels.querySelector(`[data-room="${r.id}"]`);
    if (lab) lab.style.setProperty('--sun', R.frac.toFixed(3));
  }
  $$('.pl-glass', holder).forEach((g) => g.classList.toggle('is-lit', L.rooms[g.dataset.win].patches.length > 0));
  const rays = $('.pl-rays-wrap', holder);
  if (rays) {
    rays.setAttribute('transform', `rotate(${(L.phi / DEG + 180).toFixed(2)} ${(plan.w * S) / 2} ${(plan.h * S) / 2})`);
    rays.style.opacity = (L.fade * 0.9).toFixed(2);
  }
  // dial
  const sunA = L.sunLocal * DEG, rr = 46 - (L.alt / 52) * 30;
  const sun = $('#dial-sun');
  sun.setAttribute('cx', (60 + Math.sin(sunA) * rr).toFixed(1));
  sun.setAttribute('cy', (60 - Math.cos(sunA) * rr).toFixed(1));
  sun.style.opacity = L.alt > 0.3 ? 1 : 0.25;
  $('#dial-n').setAttribute('transform', `rotate(${-state.listing.rot} 60 60)`);
  $('#dial-beam').setAttribute('transform', `rotate(${L.sunLocal.toFixed(1)} 60 60)`);
  // room view
  rv.update(L);
  const [s1, s2] = skyFor(state.t, L.alt);
  stage.style.setProperty('--sky1', s1); stage.style.setProperty('--sky2', s2);
  root.style.setProperty('--fade', L.fade.toFixed(3));
  // readouts
  const R = L.rooms[state.roomId];
  $('#ri-sun').textContent = R ? Math.round(R.frac * 100) + '%' : '—';
  $('#time-out').textContent = fmtTime(state.t);
  const sunTxt = L.alt > 0.3 ? `Sun in the ${BEARING(L.az)}, ${Math.round(L.alt)}° high` : 'Sun on the horizon';
  $('#sun-out').textContent = sunTxt;
  range.value = state.t;
  range.setAttribute('aria-valuetext', `${fmtTime(state.t)}. ${sunTxt}.`);
  range.style.setProperty('--p', (((state.t - 6) / 14) * 100).toFixed(2) + '%');
  const x = ((state.t - 6) / 14) * 300;
  const now = $('#ri-curve .cv-now'), dot = $('#ri-curve .cv-dot');
  if (now) {
    now.setAttribute('x1', x); now.setAttribute('x2', x);
    dot.setAttribute('cx', x); dot.setAttribute('cy', 60 - (R ? R.frac : 0) * 54);
  }
}

function loadListing(no, scroll = false) {
  const l = LISTINGS.find((x) => x.no === no);
  if (!l) return;
  state.listing = l;
  buildPlan();
  selectRoom('living');
  $('#study-status').textContent = `Showing residence ${l.no}, ${planOf().name}, facade facing ${BEARING(l.rot)}.`;
  if (scroll) $('#plan').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

$('#type-picker').addEventListener('click', (e) => {
  const b = e.target.closest('[data-type]');
  if (b) loadListing(b.dataset.listing);
});
labels.addEventListener('click', (e) => { const b = e.target.closest('.plan-label'); if (b) selectRoom(b.dataset.room, true); });
const stepRoom = (d) => { const rooms = planOf().rooms; const i = rooms.findIndex((r) => r.id === state.roomId); selectRoom(rooms[(i + d + rooms.length) % rooms.length].id, true); };
$('#rv-prev').addEventListener('click', () => stepRoom(-1));
$('#rv-next').addEventListener('click', () => stepRoom(1));
$('#rv-left').addEventListener('click', () => rv.rotate(-14));
$('#rv-right').addEventListener('click', () => rv.rotate(14));
stage.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { rv.rotate(-8); e.preventDefault(); }
  if (e.key === 'ArrowRight') { rv.rotate(8); e.preventDefault(); }
  if (e.key === 'PageDown' || e.key === ']') { stepRoom(1); e.preventDefault(); }
  if (e.key === 'PageUp' || e.key === '[') { stepRoom(-1); e.preventDefault(); }
});
{
  let drag = null;
  stage.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, ry: rv.ry }; stage.setPointerCapture(e.pointerId); stage.classList.add('is-drag'); });
  stage.addEventListener('pointermove', (e) => { if (drag) rv.setRotation(drag.ry + (e.clientX - drag.x) * 0.3); });
  const end = () => { drag = null; stage.classList.remove('is-drag'); };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
}

range.addEventListener('input', () => { stopPlay(); state.t = parseFloat(range.value); render(); });
const playBtn = $('#play');
let raf = 0, last = 0;
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  state.t += dt * 1.1;
  if (state.t >= 20) { state.t = 20; render(); stopPlay(); return; }
  render();
  raf = requestAnimationFrame(tick);
}
function startPlay() {
  if (state.t >= 19.9) state.t = 6;
  state.playing = true; playBtn.setAttribute('aria-pressed', 'true'); $('.play__txt', playBtn).textContent = 'Pause the day';
  last = performance.now(); raf = requestAnimationFrame(tick);
}
function stopPlay() {
  state.playing = false; cancelAnimationFrame(raf); playBtn.setAttribute('aria-pressed', 'false'); $('.play__txt', playBtn).textContent = 'Play the day';
}
playBtn.addEventListener('click', () => (state.playing ? stopPlay() : startPlay()));
document.addEventListener('visibilitychange', () => { if (document.hidden && state.playing) stopPlay(); });

buildPlan();
selectRoom('living');
// opening light sweep: the morning arrives across the plan
if (!reduced) {
  const t0 = performance.now(), from = 6.6, to = 9.5, dur = 2600;
  const intro = (now) => {
    if (state.playing) return;
    const k = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
    state.t = from + (to - from) * e; render();
    if (k < 1) requestAnimationFrame(intro);
  };
  setTimeout(() => requestAnimationFrame(intro), 400);
}
let rz = 0;
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { rv.mount(rv.build(planOf(), state.roomId)); render(); }, 180); });

/* ---------------------------------------------------------------- */
/* Residences index                                                  */
/* ---------------------------------------------------------------- */
const listEl = $('#res-list');
const filters = { beds: 'any', aspect: 'any', level: 'any', reserved: true, sort: 'level' };
function rowHTML(l) {
  const p = PLANS[l.plan];
  const win = sunWindow(p, l.rot, 'living');
  const out = outdoorArea(p);
  return `<li class="lst" data-no="${l.no}" data-reveal>
    <div class="lst__no"><span class="lst__lvl">Level ${l.level}</span><span class="lst__num">${l.no}</span></div>
    <div class="lst__thumb">${thumbSVG(p, l.rot)}</div>
    <div class="lst__main"><h3 class="lst__name">${p.name}</h3><p class="lst__meta">${p.beds} bedroom${p.beds > 1 ? 's' : ''} · ${m2(planArea(p))}${out ? ' + ' + m2(out) + (l.plan === 'meridian' ? ' terrace' : ' loggia') : ''}</p></div>
    <dl class="lst__facts">
      <div><dt>Facade faces</dt><dd>${cap(BEARING(l.rot))}</dd></div>
      <div><dt>Living-room sun</dt><dd>${win ? fmtTime(win[0]) + '–' + fmtTime(win[1]) : 'Indirect'}</dd></div>
      <div><dt>Guide price</dt><dd>${euro(l.price)}</dd></div>
    </dl>
    <p class="lst__status lst__status--${l.status}">${cap(l.status)}</p>
    <div class="lst__actions">
      <button type="button" class="btn btn--line" data-study="${l.no}">Study the light<span class="visually-hidden"> in residence ${l.no}</span></button>
      <a class="btn btn--text" href="#inquire" data-enquire="${l.no}">Enquire<span class="visually-hidden"> about residence ${l.no}</span></a>
    </div>
  </li>`;
}
function renderList() {
  let rows = LISTINGS.filter((l) => {
    const p = PLANS[l.plan], b = BEARING(l.rot);
    if (filters.beds !== 'any' && String(p.beds) !== filters.beds) return false;
    if (filters.aspect !== 'any' && !b.includes(filters.aspect)) return false;
    if (filters.level === 'lower' && l.level > 5) return false;
    if (filters.level === 'upper' && (l.level < 6 || l.level > 9)) return false;
    if (filters.level === 'pent' && l.level < 10) return false;
    if (!filters.reserved && l.status !== 'available') return false;
    return true;
  });
  const key = { level: (l) => l.level, price: (l) => l.price, area: (l) => -planArea(PLANS[l.plan]) }[filters.sort];
  rows = rows.sort((a, b) => key(a) - key(b));
  const apply = () => {
    listEl.innerHTML = rows.length ? rows.map(rowHTML).join('') : `<li class="lst-empty"><p>No released residence matches every filter. Try a different aspect or level.</p><button type="button" class="btn btn--line" data-reset>Clear filters</button></li>`;
    $$('[data-reveal]', listEl).forEach((n) => n.classList.add('is-in'));
  };
  if (document.startViewTransition && !reduced) document.startViewTransition(apply); else apply();
  $('#res-count').textContent = `${rows.length} of ${LISTINGS.length} residences shown`;
}
$('#res-filters').addEventListener('submit', (e) => e.preventDefault());
$('#res-filters').addEventListener('change', (e) => {
  const t = e.target;
  if (t.name === 'reserved') filters.reserved = t.checked; else if (t.name in filters) filters[t.name] = t.value;
  renderList();
});
listEl.addEventListener('click', (e) => {
  const s = e.target.closest('[data-study]');
  if (s) loadListing(s.dataset.study, true);
  const q = e.target.closest('[data-enquire]');
  if (q) { const sel = $('#f-res'); sel.value = q.dataset.enquire; sel.dispatchEvent(new Event('change')); }
  if (e.target.closest('[data-reset]')) {
    Object.assign(filters, { beds: 'any', aspect: 'any', level: 'any', reserved: true, sort: 'level' });
    $('#res-filters').reset(); renderList();
  }
});
renderList();

/* ---------------------------------------------------------------- */
/* Gallery plates                                                    */
/* ---------------------------------------------------------------- */
const track = $('#plates');
track.innerHTML = SCENES.map((sc, i) => `<li class="plate" data-scene="${sc.id}">
  <figure>
    <div class="plate__art"><svg class="plate__svg" role="img" aria-label="Illustrated interior: ${sc.title}, ${sc.time}"></svg></div>
    <figcaption><span class="plate__no">${String(i + 1).padStart(2, '0')}</span><span class="plate__title">${sc.title}</span><span class="plate__time">${sc.time}</span><span class="plate__res">${sc.res}</span></figcaption>
  </figure></li>`).join('');
const plates = $$('.plate', track).map((li, i) => { const svg = $('svg', li); renderInterior(svg, SCENES[i]); return { li, svg, offset: 0, target: 0 }; });
let galleryBias = 0;
const sunRange = $('#g-sun');
sunRange.addEventListener('input', () => { galleryBias = parseFloat(sunRange.value); plates.forEach((p) => updateInterior(p.svg, p.offset + galleryBias)); $('#g-sun-out').textContent = (galleryBias > 0 ? '+' : '') + galleryBias + '°'; });
plates.forEach((p) => {
  let pending = false;
  p.li.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const r = p.li.getBoundingClientRect();
    p.offset = ((e.clientX - r.left) / r.width - 0.5) * 22;
    if (!pending) { pending = true; requestAnimationFrame(() => { pending = false; updateInterior(p.svg, p.offset + galleryBias); }); }
  });
  p.li.addEventListener('pointerleave', () => { p.offset = 0; updateInterior(p.svg, galleryBias); });
});
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    const p = plates.find((x) => x.li === en.target); const t0 = performance.now();
    const step = (now) => { const k = clamp((now - t0) / 2200, 0, 1); const e = 1 - Math.pow(1 - k, 3); updateInterior(p.svg, -16 * (1 - e) + galleryBias); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.35 });
  plates.forEach((p) => io.observe(p.li));
}
const plateStep = (d) => { const w = plates[0].li.getBoundingClientRect().width + 24; track.scrollBy({ left: d * w, behavior: reduced ? 'auto' : 'smooth' }); };
$('#g-prev').addEventListener('click', () => plateStep(-1));
$('#g-next').addEventListener('click', () => plateStep(1));
const syncTrack = () => {
  const max = track.scrollWidth - track.clientWidth - 2;
  $('#g-prev').disabled = track.scrollLeft <= 2; $('#g-next').disabled = track.scrollLeft >= max;
  $('#g-progress').style.setProperty('--p', max > 0 ? (track.scrollLeft / max).toFixed(3) : '1');
};
track.addEventListener('scroll', syncTrack, { passive: true }); addEventListener('resize', syncTrack); syncTrack();

/* ---------------------------------------------------------------- */
/* Materials                                                         */
/* ---------------------------------------------------------------- */
const MATERIALS = {
  concrete: { name: 'Board-marked concrete', where: 'Lobby walls, stair core, loggia soffits', note: 'Poured against rough-sawn larch boards, so every wall carries the grain of the timber that shaped it. Low sun picks out each board line.' },
  oak: { name: 'Smoked oak', where: 'Floors in living rooms and bedrooms', note: 'Wide, fumed boards laid lengthways toward the windows, so the grain runs with the light rather than across it.' },
  travertine: { name: 'Honed travertine', where: 'Kitchens, baths, entrance galleries', note: 'Cut across the bed and honed rather than polished. The open pores hold a soft shadow; the surface never glares.' },
  glass: { name: 'Low-iron glass', where: 'Floor-to-ceiling glazing on every facade', note: 'Without the green cast of ordinary float glass, so the light arrives in the room the colour it left the sky.' },
  plaster: { name: 'Lime plaster', where: 'Bedroom walls and ceilings', note: 'Trowelled in two coats with a faint undulation. It takes light like paper and turns warm in the last hour of the day.' },
  brass: { name: 'Brushed brass', where: 'Door furniture, kitchen rails, lift interiors', note: 'Left unlacquered to darken where hands rest. The only metal in the residences, used sparingly.' },
};
const matSw = $('#mat-swatch');
$('#mat-list').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mat]'); if (!b) return;
  const m = MATERIALS[b.dataset.mat];
  $$('#mat-list [data-mat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  matSw.dataset.mat = b.dataset.mat;
  matSw.classList.remove('is-swept'); void matSw.offsetWidth; matSw.classList.add('is-swept');
  $('#mat-name').textContent = m.name; $('#mat-where').textContent = m.where; $('#mat-note').textContent = m.note;
});

/* ---------------------------------------------------------------- */
/* Building section                                                  */
/* ---------------------------------------------------------------- */
function buildSection() {
  const svg = $('#bld-svg');
  const k = 13, gy = 730, x0 = 150, x1 = 490;
  const lv = [{ h: 5.0, band: 'ground' }];
  for (let i = 1; i <= 9; i++) lv.push({ h: 3.3, band: i <= 4 ? 'lower' : i <= 8 ? 'upper' : 'upper' });
  for (let i = 0; i < 3; i++) lv.push({ h: 3.6, band: 'pent' });
  lv[1].band = 'ground';
  let y = gy, s = '';
  const slabs = [];
  lv.forEach((l, i) => {
    const top = y - l.h * k;
    const setL = l.band === 'pent' ? x0 + 46 : x0, setR = l.band === 'pent' ? x1 - 30 : x1;
    s += `<g class="bld-lv" data-band="${l.band}"><rect class="bld-fill" x="${setL}" y="${top}" width="${setR - setL}" height="${y - top}"/>`;
    s += `<path class="bld-glaze" d="M${setL + 3} ${top + 6}V${y - 2}M${setR - 3} ${top + 6}V${y - 2}"/>`;
    if (i > 0 && l.band !== 'pent') s += `<path class="bld-balc" d="M${x1} ${y - 1}h${22}v-${11}"/>`;
    if (l.band === 'pent') s += `<path class="bld-balc" d="M${setR} ${y - 1}H${x1}v-12"/>`;
    s += `<text class="bld-no" x="${x0 - 16}" y="${y - (l.h * k) / 2 + 4}" text-anchor="end">${i === 0 ? 'G' : i}</text></g>`;
    slabs.push(`M${setL - 2} ${top}H${setR + (l.band === 'pent' ? 2 : 24)}`);
    y = top;
  });
  const roofY = y;
  s += `<path class="bld-slab" d="M${x0 - 2} ${gy}H${x1 + 24}${slabs.join('')}"/>`;
  s += `<g class="bld-lv" data-band="roof"><path class="bld-roof" d="M${x0 + 46} ${roofY}v-14M${x1 - 30} ${roofY}v-14"/><circle class="bld-tree" cx="${x0 + 110}" cy="${roofY - 22}" r="16"/><circle class="bld-tree" cx="${x0 + 150}" cy="${roofY - 16}" r="11"/><circle class="bld-tree" cx="${x1 - 80}" cy="${roofY - 20}" r="14"/></g>`;
  s += `<path class="bld-ground" d="M20 ${gy}H620"/><path class="bld-hatch" d="${Array.from({ length: 30 }, (_, i) => `M${20 + i * 20} ${gy + 2}l-12 12`).join('')}"/>`;
  // sun rays from the south (right)
  const ray = (alt, cls) => {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const yy = gy - 70 - i * 92, len = 360, a = alt * DEG;
      d += `M${x1 + 130} ${yy - Math.tan(a) * 130}L${x1 + 130 - len} ${yy - Math.tan(a) * 130 + Math.tan(a) * len}`;
    }
    return `<path class="bld-ray ${cls}" d="${d}"/>`;
  };
  s += ray(17, 'bld-ray--winter') + ray(58, 'bld-ray--summer');
  s += `<text class="bld-cap" x="${x1 + 120}" y="40" text-anchor="end">South</text><text class="bld-cap" x="30" y="40">North</text>`;
  svg.innerHTML = s;
}
buildSection();
const bld = $('#building');
$$('[data-sun-season]').forEach((b) => b.addEventListener('click', () => {
  bld.dataset.season = b.dataset.sunSeason;
  $$('[data-sun-season]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
}));
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) {
      bld.dataset.band = en.target.dataset.band;
      $$('.bstep').forEach((s) => s.classList.toggle('is-active', s === en.target));
    }
  }), { rootMargin: '-45% 0px -45% 0px' });
  $$('.bstep').forEach((s) => io.observe(s));
}

/* ---------------------------------------------------------------- */
/* Inquiry form                                                      */
/* ---------------------------------------------------------------- */
const form = $('#inq-form');
const resSel = $('#f-res');
resSel.innerHTML = `<option value="">Choose a residence</option>` + LISTINGS.map((l) => `<option value="${l.no}"${l.status !== 'available' ? ' disabled' : ''}>No. ${l.no} · ${PLANS[l.plan].name} · Level ${l.level}${l.status !== 'available' ? ' (reserved)' : ''}</option>`).join('') + `<option value="any">Not sure yet, show me the light</option>`;
const hint = $('#f-res-hint');
resSel.addEventListener('change', () => {
  const l = LISTINGS.find((x) => x.no === resSel.value);
  if (!l) { hint.textContent = 'We schedule each viewing for the hour its living room is brightest.'; return; }
  const h = bestHour(PLANS[l.plan], l.rot);
  hint.textContent = `No. ${l.no}: in the light study, the living room is brightest around ${fmtTime(h)} (illustrative, equinox day).`;
  const pref = h < 11 ? 'morning' : h < 14.5 ? 'midday' : 'afternoon';
  const radio = form.querySelector(`input[name="light"][value="${pref}"]`); if (radio) radio.checked = true;
});
const rules = {
  name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address, for example name@domain.com.'),
  phone: (v) => (!v.trim() || /^[+()\d\s-]{7,20}$/.test(v.trim()) ? '' : 'Use digits, spaces and an optional + only.'),
  residence: (v) => (v ? '' : 'Please choose a residence, or "Not sure yet".'),
  consent: (_, el) => (el.checked ? '' : 'Please confirm you understand this is a demo form.'),
};
function check(el) {
  const fn = rules[el.name]; if (!fn) return true;
  const msg = fn(el.value, el);
  const err = $(`#err-${el.name}`);
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (err) err.textContent = msg;
  return !msg;
}
let tried = false;
form.addEventListener('input', (e) => { if (tried) check(e.target); });
form.addEventListener('change', (e) => { if (tried) check(e.target); });
form.addEventListener('submit', (e) => {
  e.preventDefault(); tried = true;
  const els = ['name', 'email', 'phone', 'residence', 'consent'].map((n) => form.elements[n]);
  const bad = els.filter((el) => !check(el));
  if (bad.length) { bad[0].focus(); $('#inq-status').textContent = `Please check ${bad.length} field${bad.length > 1 ? 's' : ''}.`; return; }
  const name = form.elements.name.value.trim().split(' ')[0];
  const ok = $('#inq-done');
  $('#inq-done-name').textContent = name;
  form.hidden = true; ok.hidden = false; ok.focus();
  $('#inq-status').textContent = '';
});
$('#inq-again').addEventListener('click', () => { form.reset(); tried = false; $$('[aria-invalid]', form).forEach((x) => x.removeAttribute('aria-invalid')); $$('.field__err', form).forEach((x) => (x.textContent = '')); $('#inq-done').hidden = true; form.hidden = false; form.elements.name.focus(); });

/* ---------------------------------------------------------------- */
/* Light-sweep reveals                                               */
/* ---------------------------------------------------------------- */
if ('IntersectionObserver' in window && !reduced) {
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach((n) => { if (!n.classList.contains('is-in')) io.observe(n); });
} else $$('[data-reveal]').forEach((n) => n.classList.add('is-in'));

$('#year').textContent = new Date().getFullYear();
window.lumenReady = true;
