/* LUMEN RESIDENCES — CSS 3D room view ("dollhouse" model).
   The selected room is built from DOM faces with preserve-3d. Walls face
   inward with hidden backfaces, so whichever wall is between you and the
   room simply disappears as you turn the model. */
import { winPoints, clamp } from './plan.js';

const MAP = {
  n: (x, y, r) => [x - r[0], y - r[1]],
  e: (x, y, r) => [y - r[1], r[2] - x],
  s: (x, y, r) => [r[2] - x, r[3] - y],
  w: (x, y, r) => [r[3] - y, x - r[0]],
};
const LEFT = { n: 'w', e: 'n', s: 'e', w: 's' };
const RIGHT = { n: 'e', e: 's', s: 'w', w: 'n' };
const FLOORS = { oak: '#C7B79F', stone: '#D3CFC8', deck: '#A99B8C' };
const FURN = {
  sofa: ['#8C8780', '#77726B'], table: ['#B39B7C', '#957F63'], island: ['#E3E0DA', '#C2BEB6'], bed: ['#EFECE6', '#CFCAC1'],
  tub: ['#F1EFEB', '#CBC7BF'], bench: ['#B39B7C', '#957F63'], planter: ['#6E7469', '#555A50'], desk: ['#B39B7C', '#957F63'],
  chair: ['#8C8780', '#77726B'], lounger: ['#E6E2DA', '#BDB8AE'], rug: ['#BFB6A8', '#BFB6A8'],
};

const el = (cls, w, h, tf) => {
  const d = document.createElement('div');
  d.className = cls;
  d.style.width = w + 'px'; d.style.height = h + 'px';
  d.style.marginLeft = -w / 2 + 'px'; d.style.marginTop = -h / 2 + 'px';
  d.style.transform = tf;
  return d;
};
const px = (n) => Math.round(n * 10) / 10;

function backSide(plan, room) {
  const len = { n: 0, e: 0, s: 0, w: 0 };
  for (const w of plan.windows) if (w.room === room.id) len[w.side] += w.b - w.a;
  if (room.outdoor) return 'n';
  return Object.keys(len).reduce((a, b) => (len[b] > len[a] ? b : a), 'n');
}

export class RoomView {
  constructor(stage) {
    this.stage = stage;
    this.ry = -16;
    this.room = null;
  }

  build(plan, roomId) {
    const room = plan.rooms.find((r) => r.id === roomId);
    const B = backSide(plan, room);
    const r = room.r;
    const isNS = B === 'n' || B === 's';
    const W = isNS ? r[2] - r[0] : r[3] - r[1];
    const D = isNS ? r[3] - r[1] : r[2] - r[0];
    const H = room.outdoor ? 3.0 : plan.ceil;
    const wallH = room.outdoor ? 1.1 : H;
    const sw = this.stage.clientWidth || 480, sh = this.stage.clientHeight || 400;
    const s = Math.min((sw * 0.7) / Math.max(W, 3.2), (sh * 0.6) / Math.max(D * 0.45 + H, 3.8));
    this.ctx = { plan, room, B, W, D, H, s };

    const box = document.createElement('div');
    box.className = 'rv-room' + (room.outdoor ? ' is-out' : '');
    const Y0 = (H / 2) * s;
    const t = Math.max(5, 0.22 * s);

    // floor with its own SVG for the sunlight patches
    const floor = el('rv-face rv-floor', W * s, D * s, `translate3d(0,${px(Y0)}px,0) rotateX(90deg)`);
    floor.style.setProperty('--floor', FLOORS[room.floor] || FLOORS.oak);
    floor.innerHTML = `<svg viewBox="0 0 ${W} ${D}" preserveAspectRatio="none" aria-hidden="true">
      <defs><filter id="rv-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${room.floor === 'oak' ? 0.05 : 0.04}"/></filter>
      <pattern id="rv-planks" width="${W}" height="0.22" patternUnits="userSpaceOnUse"><path d="M0 0H${W}" stroke="rgba(60,40,20,.12)" stroke-width="0.012"/></pattern>
      <pattern id="rv-tiles" width="0.6" height="0.6" patternUnits="userSpaceOnUse"><path d="M0.6 0H0V0.6" fill="none" stroke="rgba(20,20,20,.1)" stroke-width="0.01"/></pattern></defs>
      <rect width="${W}" height="${D}" fill="url(#${room.floor === 'oak' ? 'rv-planks' : 'rv-tiles'})"/>
      <g class="rv-sun" filter="url(#rv-blur)"></g></svg>`;
    box.appendChild(floor);

    // slab edges: a section cut through the model
    box.appendChild(el('rv-face rv-cut', W * s + 2 * t, 0.34 * s, `translate3d(0,${px(Y0 + 0.17 * s)}px,${px((D / 2) * s)}px)`));

    const walls = {};
    const mk = (key, len, tf) => {
      const w = el('rv-face rv-wall rv-wall--' + key, len * s, wallH * s, tf);
      w.innerHTML = '<span class="rv-glow" aria-hidden="true"></span>';
      walls[key] = w; box.appendChild(w);
      return w;
    };
    const yw = Y0 - (wallH * s) / 2;
    mk('back', W, `translate3d(0,${px(yw)}px,${px((-D / 2) * s)}px)`);
    mk('left', D, `translate3d(${px((-W / 2) * s)}px,${px(yw)}px,0) rotateY(90deg)`);
    mk('right', D, `translate3d(${px((W / 2) * s)}px,${px(yw)}px,0) rotateY(-90deg)`);
    // wall caps (cut wall thickness)
    const capY = Y0 - wallH * s;
    box.appendChild(el('rv-face rv-cut', W * s + 2 * t, t, `translate3d(0,${px(capY)}px,${px((-D / 2) * s - t / 2)}px) rotateX(90deg)`));
    box.appendChild(el('rv-face rv-cut', t, D * s, `translate3d(${px((-W / 2) * s - t / 2)}px,${px(capY)}px,0) rotateX(90deg)`));
    box.appendChild(el('rv-face rv-cut', t, D * s, `translate3d(${px((W / 2) * s + t / 2)}px,${px(capY)}px,0) rotateX(90deg)`));

    // windows on visible walls
    const sideToWall = { [B]: 'back', [LEFT[B]]: 'left', [RIGHT[B]]: 'right' };
    this.panes = [];
    if (!room.outdoor) {
      for (const w of plan.windows) {
        if (w.room !== room.id || !sideToWall[w.side]) continue;
        const key = sideToWall[w.side];
        const [p1, p2] = winPoints(room, w).map((p) => MAP[B](p[0], p[1], r));
        let a, b;
        if (key === 'back') { a = Math.min(p1[0], p2[0]); b = Math.max(p1[0], p2[0]); }
        else if (key === 'left') { a = Math.min(D - p1[1], D - p2[1]); b = Math.max(D - p1[1], D - p2[1]); }
        else { a = Math.min(p1[1], p2[1]); b = Math.max(p1[1], p2[1]); }
        const head = Math.min(wallH - 0.22, 2.75), sill = 0.06;
        const g = document.createElement('span');
        g.className = 'rv-pane';
        g.style.left = px(a * s) + 'px'; g.style.width = px((b - a) * s) + 'px';
        g.style.top = px((wallH - head) * s) + 'px'; g.style.height = px((head - sill) * s) + 'px';
        g.style.setProperty('--pane', px(Math.max(0.7, (b - a) / Math.max(1, Math.round((b - a) / 1.15))) * s) + 'px');
        g.style.backgroundPositionX = -px(a * s * 0.6) + 'px';
        walls[key].appendChild(g);
        this.panes.push({ g, side: w.side });
      }
    }

    // furniture as small cuboids
    for (const fu of plan.furniture) {
      const cx = fu.x + fu.w / 2, cy = fu.y + fu.d / 2;
      if (cx < r[0] || cx > r[2] || cy < r[1] || cy > r[3]) continue;
      const c1 = MAP[B](fu.x, fu.y, r), c2 = MAP[B](fu.x + fu.w, fu.y + fu.d, r);
      const u0 = Math.min(c1[0], c2[0]), u1 = Math.max(c1[0], c2[0]);
      const v0 = Math.min(c1[1], c2[1]), v1 = Math.max(c1[1], c2[1]);
      const X = ((u0 + u1) / 2 - W / 2) * s, Z = ((v0 + v1) / 2 - D / 2) * s;
      const w = (u1 - u0) * s, d = (v1 - v0) * s, h = Math.max(1, fu.h * s);
      const [top, side] = FURN[fu.t] || FURN.table;
      const add = (fw, fh, tf, col, cls = '') => { const e = el('rv-face rv-fu ' + cls, fw, fh, tf); e.style.background = col; box.appendChild(e); };
      add(w, d, `translate3d(${px(X)}px,${px(Y0 - h)}px,${px(Z)}px) rotateX(90deg)`, top, 'rv-fu--top');
      if (fu.t === 'rug') continue;
      add(w, h, `translate3d(${px(X)}px,${px(Y0 - h / 2)}px,${px(Z + d / 2)}px)`, side);
      add(w, h, `translate3d(${px(X)}px,${px(Y0 - h / 2)}px,${px(Z - d / 2)}px) rotateY(180deg)`, side);
      add(d, h, `translate3d(${px(X - w / 2)}px,${px(Y0 - h / 2)}px,${px(Z)}px) rotateY(-90deg)`, side, 'rv-fu--shade');
      add(d, h, `translate3d(${px(X + w / 2)}px,${px(Y0 - h / 2)}px,${px(Z)}px) rotateY(90deg)`, side, 'rv-fu--shade');
    }

    this.walls = walls;
    this.box = box;
    this.sideToWall = sideToWall;
    this.applyRotation();
    return box;
  }

  mount(box) {
    const old = this.stage.querySelector('.rv-room');
    if (old) old.remove();
    this.stage.prepend(box);
  }

  applyRotation() {
    if (!this.box) return;
    const lift = (this.ctx.H * this.ctx.s) * 0.05;
    this.box.style.transform = `translateY(${px(lift)}px) rotateX(-24deg) rotateY(${this.ry}deg)`;
  }

  rotate(delta) { this.ry = clamp(this.ry + delta, -42, 42); this.applyRotation(); }
  setRotation(v) { this.ry = clamp(v, -42, 42); this.applyRotation(); }

  update(light) {
    if (!this.box) return;
    const { room, B, W, D } = this.ctx;
    const R = light.rooms[room.id];
    const g = this.box.querySelector('.rv-sun');
    if (room.outdoor) {
      g.innerHTML = light.fade > 0 ? `<rect x="0" y="0" width="${W}" height="${D}" fill="#F7D995" opacity="${(0.5 * light.fade).toFixed(2)}"/>` : '';
    } else {
      g.innerHTML = R.patches.map((p) => `<polygon points="${p.poly.map((q) => MAP[B](q[0], q[1], room.r).map((n) => n.toFixed(3)).join(',')).join(' ')}" fill="#F7D995" opacity="${Math.min(0.95, p.op * 1.15).toFixed(2)}"/>`).join('');
    }
    // light overshooting the floor climbs the wall it reaches
    const target = this.sideToWall[R.spillSide];
    const amount = clamp(R.spill / Math.max(4, R.area * 0.6), 0, 1);
    for (const k of Object.keys(this.walls)) this.walls[k].style.setProperty('--glow', k === target ? amount.toFixed(2) : '0');
    for (const p of this.panes) {
      const lit = R.patches.length && light.fade > 0;
      p.g.classList.toggle('is-lit', !!lit);
    }
  }
}
