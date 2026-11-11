/* =====================================================================
   THREE SECONDS: a web film in one scene (v3).
   One number, p (0 → 1), drives everything. Scroll moves p.
   Scroll back and the fish (and its bike, car, boat) turns round and goes back.

   The story, by p:
     0      the bowl on the window ledge
     .05    the jump; legs grow in mid-air; a bicycle rolls in to catch the fish
     .11    WORK on the road: two projects by bike (.15, .21)
     .26    a car pulls up; legs become hands; three projects by car (.33, .39, .45)
     .49    a drift to the jetty, a walk, a sail
     .615   into the sea (fins only): EXPLORATION
     .84    the surface, wings; a space suit; the ocean is the Earth
     .92    about       1  contact
   ===================================================================== */
(() => {
  const T = THREE, CT = window.CONTENT;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COL = {
    ink: 0x2b3240, paper: 0xf6f3ec, white: 0xffffff,
    blue: 0x6f9cc9, blue2: 0xa9c6e0, blue3: 0xd6e3ef,
    mango: 0xf7c443, belly: 0xfbe39a, space: 0x121a2e, road: 0xa9adb5,
    rose: 0xd3d9de, butter: 0xece0c0, lav: 0xb6c6d5, mint: 0xc3d3ae, skyb: 0xbcd3e6, orchid: 0xdfe3e6, aqua: 0xa9c7c6, cream: 0xf3eee4,
    navy: 0x2f4a6e, olive: 0x6f8455, teal: 0x4f8a8b, stone: 0xcfc8b8, yellow: 0xf2cf4a,
    coral: 0xd9604f, trunk: 0xa48a72, sand: 0xece0c4, verge: 0xb4cd93, metal: 0xe3e7ec, glow: 0x8fd6ff
  };
  const GREENS = [0x7fae5e, 0x6a9d55, 0x96bf6e, 0x5f8f4e, 0x88b465];
  const FLOWERS = [0xffffff, 0xfde27a, 0xf2cf4a, 0xffffff, 0xffe9a6, 0xd9604f];
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const eOut = t => 1 - (1 - t) * (1 - t);
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const pick = a => a[(rnd() * a.length) | 0];

  /* ---------------- renderer ---------------- */
  const canvas = document.getElementById('scene');
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.background = new T.Color(0xfde6dc);
  scene.fog = new T.Fog(0xfde6dc, 60, 450);
  const cam = new T.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 30000);
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); });
  const hemi = new T.HemisphereLight(0xfff4ea, 0xe2cfe6, 0.68); scene.add(hemi);
  const sun = new T.DirectionalLight(0xfff0dc, 0.55); scene.add(sun); scene.add(sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = .03;
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 });

  /* ---------------- materials + helpers ---------------- */
  const grad = new T.DataTexture(new Uint8Array([150, 212, 255]), 3, 1, T.RedFormat); grad.needsUpdate = true; grad.minFilter = grad.magFilter = T.NearestFilter;
  const toon = (c, o = {}) => new T.MeshToonMaterial({ color: c, gradientMap: grad, ...o });
  const mats = {}; const tm = c => mats[c] || (mats[c] = toon(c));
  const M = { paper: tm(COL.paper), white: tm(COL.white), ink: new T.MeshBasicMaterial({ color: COL.ink }), mango: tm(COL.mango), blue: tm(COL.blue), blue2: tm(COL.blue2), blue3: tm(COL.blue3), road: tm(COL.road), glass: new T.MeshBasicMaterial({ color: COL.blue3, transparent: true, opacity: .55 }) };
  const inkBack = new T.MeshBasicMaterial({ color: COL.ink, side: T.BackSide });
  const lineMat = new T.LineBasicMaterial({ color: COL.ink });
  const cityLine = new T.LineBasicMaterial({ color: COL.ink, transparent: true, opacity: .8 });
  function add(parent, geo, mat, x = 0, y = 0, z = 0, o = {}) {
    const m = new T.Mesh(geo, mat); m.position.set(x, y, z);
    if (o.rot) m.rotation.set(...o.rot);
    if (o.outline) { const h = new T.Mesh(geo, inkBack); if (Array.isArray(o.outline)) h.scale.set(...o.outline); else h.scale.setScalar(o.outline); h.userData.hull = 1; m.add(h); }
    if (o.edges) m.add(new T.LineSegments(new T.EdgesGeometry(geo, 25), o.lines || lineMat));
    parent.add(m); return m;
  }
  function rod(parent, a, b, r, mat = M.ink) { const d = new T.Vector3().subVectors(b, a); const m = new T.Mesh(new T.CylinderGeometry(r, r, d.length(), 8), mat); m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); parent.add(m); return m; }
  function flat(shape, depth = .03) { const g = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 }); g.translate(0, 0, -depth / 2); return g; }
  function inked(geo, mat) { const m = new T.Mesh(geo, mat); m.add(new T.LineSegments(new T.EdgesGeometry(geo, 30), lineMat)); return m; }
  // a flat shape with a solid ink border (a slightly bigger, thinner ink copy behind it)
  function bordered(shape, depth, mat, grow = .035) {
    const g = new T.Group(); const main = new T.Mesh(flat(shape, depth), mat); g.add(main);
    const pts = shape.getPoints(24); let cx = 0, cy = 0; pts.forEach(q => { cx += q.x; cy += q.y; }); cx /= pts.length; cy /= pts.length;
    const sz = new T.Box2().setFromPoints(pts).getSize(new T.Vector2());
    const ig = flat(shape, depth * .55); ig.translate(-cx, -cy, 0); ig.scale(1 + 2 * grow / sz.x, 1 + 2 * grow / sz.y, 1); ig.translate(cx, cy, 0);
    const ink = new T.Mesh(ig, M.ink); ink.userData.hull = 1; g.add(ink); return { g, main };
  }
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return new T.CanvasTexture(c); };
  const stripeTex = (a, b, n = 6) => canvasTex(64, 64, (g, w) => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * w / n, 0, w / n + 1, 64); } });
  function shade(root, cast = true) { root.traverse(o => { if (o.isMesh && !o.userData.hull && o.material !== inkBack) { const clear = o.material.transparent || o.material.isShaderMaterial || o.material.isMeshBasicMaterial; o.castShadow = cast && !clear; o.receiveShadow = !o.material.isShaderMaterial; } }); }
  const glassMat = (tint = 1) => new T.ShaderMaterial({
    transparent: true, depthWrite: false, side: T.DoubleSide, uniforms: { op: { value: 1 } },
    vertexShader: 'varying vec3 vN, vV; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float op; varying vec3 vN, vV; void main(){ vec3 n = normalize(vN), v = normalize(vV); float f = 1.0 - abs(dot(n, v));
      float rim = smoothstep(0.80, 0.96, f); float hl = smoothstep(0.94, 0.975, dot(reflect(-v, n), normalize(vec3(0.5, 0.7, 0.5))));
      vec3 c = mix(vec3(0.9, 0.94, 0.99), vec3(0.2, 0.22, 0.3), rim); c = mix(c, vec3(1.0), hl);
      gl_FragColor = vec4(c, max(max(rim * 0.9, ${(0.07 * tint).toFixed(3)}), hl) * op); }`
  });
  const puffTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const glowSprite = (parent, x, y, z, s, col = 0xfff0b8) => { const sp = new T.Sprite(new T.SpriteMaterial({ map: puffTex, color: col, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 })); sp.position.set(x, y, z); sp.scale.setScalar(s); parent.add(sp); return sp; };

  /* ---------------- flowers (instanced: thousands, one draw call) ---------------- */
  const FL = [];   // [x, y, z, colour, size]
  const flower = (x, y, z, c = pick(FLOWERS), s = 1) => FL.push([x, y, z, c, s]);

  /* ---------------- greens ---------------- */
  function roundTree(parent, x, z, s = 1) {
    const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
    add(g, new T.CylinderGeometry(.13, .19, 2, 7), tm(COL.trunk), 0, 1, 0, { outline: 1.08 });
    const kind = rnd(); const can = kind < .25 ? [0xe9c94e, 0x96bf6e] : GREENS;   // yellow copper-pod trees and greens
    const n = 3 + (rnd() * 3 | 0);
    for (let k = 0; k < n; k++) { const cx = (rnd() - .5) * 1.2, cy = 2.2 + rnd() * .9, cz = (rnd() - .5) * 1.1, r = .75 + rnd() * .45; add(g, new T.IcosahedronGeometry(r, 1), tm(pick(can)), cx, cy, cz, { outline: 1.05 }); if (kind >= .25) for (let f = 0; f < 3; f++) flower(x + (cx + (rnd() - .5) * r) * s, (cy + r * .6) * s, z + (cz + r * .8) * s, pick(FLOWERS), 1.3); }
    return g;
  }
  const frond = (() => { const s = new T.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(.9, .32, 1.9, -.25); s.quadraticCurveTo(.9, .02, 0, 0); return flat(s, .02); })();
  function palm(parent, x, z, s = 1) {
    const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
    const lean = (rnd() - .5) * .8; const pts = []; for (let k = 0; k <= 6; k++) pts.push(V(Math.sin(k / 6 * 1.2) * lean, k / 6 * 4.6, 0));
    add(g, new T.TubeGeometry(new T.CatmullRomCurve3(pts), 16, .13, 7), tm(COL.trunk), 0, 0, 0, { outline: 1.06 });
    const top = pts[6]; for (let k = 0; k < 8; k++) { const f = inked(frond, tm(k % 2 ? GREENS[0] : GREENS[3])); f.position.copy(top); f.rotation.set(0, k / 8 * Math.PI * 2, -.25 - rnd() * .35); g.add(f); }
    add(g, new T.SphereGeometry(.16, 8, 6), tm(COL.trunk), top.x, top.y - .1, .1, { outline: 1.1 });
    return g;
  }
  function bush(parent, x, y, z, s = 1, nf = 7) {
    const g = new T.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
    for (let k = 0; k < 3; k++) add(g, new T.IcosahedronGeometry(.42 + rnd() * .2, 1), tm(pick(GREENS)), (k - 1) * .45, .3, (rnd() - .5) * .3, { outline: 1.06 }).scale.y = .8;
    const fc = pick(FLOWERS);
    for (let k = 0; k < nf; k++) flower(x + (rnd() - .5) * 1.3 * s, y + (.48 + rnd() * .22) * s, z + (rnd() - .2) * .5 * s, rnd() < .7 ? fc : pick(FLOWERS), .9 + rnd() * .4);
    return g;
  }
  const leafGeo = (() => { const lf = new T.Shape(); lf.moveTo(0, 0); lf.quadraticCurveTo(.14, .2, 0, .5); lf.quadraticCurveTo(-.14, .2, 0, 0); return flat(lf, .015); })();
  function pottedPlant(parent, x, y, z, s = 1, potCol = COL.rose, nf = 5) {
    const g = new T.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
    add(g, new T.CylinderGeometry(.16, .12, .26, 14), tm(potCol), 0, .13, 0, { outline: 1.1 });
    add(g, new T.TorusGeometry(.16, .025, 6, 18), tm(potCol), 0, .26, 0, { rot: [Math.PI / 2, 0, 0] });
    for (let k = 0; k < 9; k++) { const m = inked(leafGeo, tm(pick(GREENS))); m.position.set(0, .25, 0); m.rotation.set((rnd() - .5) * .9, k / 9 * Math.PI * 2, (rnd() - .5) * .9); g.add(m); }
    const fc = pick(FLOWERS); for (let k = 0; k < nf; k++) { const a = rnd() * 6.28, r = .1 + rnd() * .2; flower(x + Math.cos(a) * r * s, y + (.55 + rnd() * .2) * s, z + Math.sin(a) * r * s, fc, s * 1.1); }
    return g;
  }
  function quickPlant(parent, x, y, z) { add(parent, new T.CylinderGeometry(.13, .1, .22, 8), tm(pick([COL.rose, COL.skyb, COL.butter, COL.lav])), x, y + .11, z); add(parent, new T.IcosahedronGeometry(.26, 0), tm(pick(GREENS)), x, y + .38, z, { outline: 1.1 }); for (let k = 0; k < 3; k++) flower(x + (rnd() - .5) * .4, y + .55, z + .15, undefined, .9); }
  // money plant: a vine with heart leaves
  const heartGeo = (() => { const h = new T.Shape(); h.moveTo(0, 0); h.bezierCurveTo(.09, .05, .12, .17, .05, .21); h.bezierCurveTo(.02, .23, 0, .2, 0, .18); h.bezierCurveTo(0, .2, -.02, .23, -.05, .21); h.bezierCurveTo(-.12, .17, -.09, .05, 0, 0); return flat(h, .01); })();
  function vine(parent, pts, every = .22) {
    const curve = new T.CatmullRomCurve3(pts); parent.add(new T.Mesh(new T.TubeGeometry(curve, pts.length * 8, .014, 4), tm(0x6a9e57)));
    const L = curve.getLength(); for (let d = 0; d < L; d += every * (.7 + rnd() * .6)) { const p = curve.getPointAt(d / L); const m = inked(heartGeo, tm(pick([0x8cc56a, 0xb6d97a, 0x74b05e, 0x9ccc6a]))); m.position.copy(p); m.rotation.set((rnd() - .5) * .8, (rnd() - .5) * 1.2, Math.PI + (rnd() - .5) * 1.6); m.scale.setScalar(.9 + rnd() * .5); parent.add(m); }
  }

  /* =====================================================================
     SET: the room (a flat in Chennai, second floor), window on the street
     ===================================================================== */
  const room = new T.Group(); scene.add(room);
  const HOLE = { x0: -1.6, x1: 2.2, y0: 5.0, y1: 7.8 }, WZ = -3.15;
  const wallM = tm(COL.cream), wallOut = tm(COL.stone);
  const wall = (w, h, x, y) => add(room, new T.BoxGeometry(w, h, .3), wallM, x, y, WZ, { edges: 1 });
  wall(8, HOLE.y0 - 4, 0, (4 + HOLE.y0) / 2); wall(8, 9.2 - HOLE.y1, 0, (HOLE.y1 + 9.2) / 2);
  wall(HOLE.x0 + 4, HOLE.y1 - HOLE.y0, (-4 + HOLE.x0) / 2, (HOLE.y0 + HOLE.y1) / 2); wall(4 - HOLE.x1, HOLE.y1 - HOLE.y0, (HOLE.x1 + 4) / 2, (HOLE.y0 + HOLE.y1) / 2);
  add(room, new T.BoxGeometry(8, 4, .3), wallOut, 0, 2, WZ, { edges: 1 });
  add(room, new T.BoxGeometry(1.4, 2.4, .05), tm(COL.teal), -2.2, 1.2, WZ - .18, { edges: 1 });
  add(room, new T.BoxGeometry(8.8, .35, .9), M.white, 0, 9.35, WZ + .1, { edges: 1 });
  add(room, new T.BoxGeometry(8.4, .2, 6.4), tm(0xe2d6c1), 0, 3.9, 0, { edges: 1 });
  add(room, new T.BoxGeometry(.3, 5.4, 6.4), wallM, -4.15, 6.6, 0, { edges: 1 });
  add(room, new T.BoxGeometry(.3, 5.4, 6.4), wallM, 4.15, 6.6, 0, { edges: 1 });
  add(room, new T.BoxGeometry(8.6, .3, 6.4), M.white, 0, 9.35, 0.05, { edges: 1 });
  [[HOLE.x0, 1], [HOLE.x1, -1]].forEach(([x, s]) => { const g = new T.Group(); g.position.set(x, (HOLE.y0 + HOLE.y1) / 2, WZ - .2); g.rotation.y = s * 1.45; room.add(g); add(g, new T.BoxGeometry(1.5, HOLE.y1 - HOLE.y0, .08), M.white, s * .75, 0, 0, { edges: 1 }); for (let i = -3; i <= 3; i++) add(g, new T.BoxGeometry(1.2, .05, .1), tm(COL.navy), s * .75, i * .34, 0); });
  add(room, new T.BoxGeometry(HOLE.x1 - HOLE.x0 + .2, .1, .4), tm(COL.navy), (HOLE.x0 + HOLE.x1) / 2, HOLE.y1 + .05, WZ, { edges: 1 });
  // window grill (Chennai): thin bars across the opening
  for (let x = HOLE.x0 + .55; x < HOLE.x1 - .2; x += .55) rod(room, V(x, HOLE.y0 + .02, WZ - .1), V(x, HOLE.y1 - .02, WZ - .1), .012, tm(0x7a8098));
  // ledge (top at y 5.05)
  const LEDGE = 5.05;
  add(room, new T.BoxGeometry(4.4, .14, .9), M.white, .3, 4.98, -2.8, { edges: 1 });
  // the bowl: sitting ON the ledge, on a small base
  const BR = .55, BC = V(.3, LEDGE + .04 + Math.cos(.35) * BR, -2.8);
  add(room, new T.CylinderGeometry(Math.sin(.35) * BR + .03, Math.sin(.35) * BR + .06, .05, 28), tm(COL.lav), BC.x, LEDGE + .025, BC.z, { outline: 1.06 });
  const bowl = new T.Mesh(new T.SphereGeometry(BR, 48, 32, 0, Math.PI * 2, .62, Math.PI - .62 - .35), glassMat(1.4)); bowl.position.copy(BC); bowl.renderOrder = 10; room.add(bowl);
  const rim = new T.Mesh(new T.TorusGeometry(Math.sin(.62) * BR, .012, 8, 48), M.ink); rim.rotation.x = Math.PI / 2; rim.position.set(BC.x, BC.y + Math.cos(.62) * BR, BC.z); room.add(rim);
  const foot = new T.Mesh(new T.TorusGeometry(Math.sin(.35) * BR, .02, 8, 30), M.ink); foot.rotation.x = Math.PI / 2; foot.position.set(BC.x, BC.y - Math.cos(.35) * BR, BC.z); room.add(foot);
  const waterMat = toon(COL.blue, { transparent: true, opacity: .35, depthWrite: false, side: T.DoubleSide });
  const bowlWater = new T.Mesh(new T.SphereGeometry(BR * .96, 40, 24, 0, Math.PI * 2, 1.1, Math.PI - 1.1 - .35), waterMat); bowlWater.position.copy(BC); bowlWater.renderOrder = 6; room.add(bowlWater);
  const surfR = BR * .96 * Math.sin(1.1), surfY = BR * .96 * Math.cos(1.1);
  const bowlSurf = new T.Mesh(new T.CircleGeometry(surfR, 40), toon(COL.blue3, { transparent: true, opacity: .75, depthWrite: false, side: T.DoubleSide })); bowlSurf.rotation.x = -Math.PI / 2; bowlSurf.position.set(BC.x, BC.y + surfY, BC.z); bowlSurf.renderOrder = 7; room.add(bowlSurf);
  bowlSurf.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(new T.Path().absarc(0, 0, surfR, 0, Math.PI * 2).getPoints(40)), lineMat));
  for (let i = 0; i < 7; i++) add(room, new T.SphereGeometry(.06 + (i % 3) * .015, 10, 8), tm([COL.rose, COL.white, COL.mint][i % 3]), BC.x - .22 + i * .075, BC.y - .43, BC.z + Math.sin(i * 2.3) * .14, { outline: 1.15 });
  for (let k = 0; k < 3; k++) { const pts = []; for (let j = 0; j <= 4; j++) pts.push(V(BC.x + .18 + Math.sin(j + k) * .04, BC.y - .44 + j * .1, BC.z - .1 + k * .06)); room.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 8, .018, 4), tm(GREENS[0]))); }
  // ledge props: a small rover, books, plants
  const rv = new T.Group(); rv.position.set(1.65, LEDGE, -2.75); room.add(rv);
  add(rv, new T.CylinderGeometry(.18, .18, .1, 16), M.ink, 0, .05, 0); add(rv, new T.CylinderGeometry(.015, .015, .45, 6), M.ink, 0, .3, 0);
  const rvHead = add(rv, new T.SphereGeometry(.11, 16, 12), M.white, 0, .58, 0, { outline: 1.12 });
  const smile = new T.Mesh(new T.TorusGeometry(.05, .012, 6, 12, Math.PI), M.ink); smile.rotation.z = Math.PI; smile.position.set(0, -.01, .1); rvHead.add(smile);
  add(room, new T.BoxGeometry(.5, .08, .32), tm(COL.navy), -1.05, LEDGE + .04, -2.8, { edges: 1 }); add(room, new T.BoxGeometry(.46, .08, .3), tm(COL.olive), -1.03, LEDGE + .12, -2.8, { edges: 1 }); add(room, new T.BoxGeometry(.48, .08, .3), tm(COL.sand), -1.06, LEDGE + .2, -2.8, { edges: 1 });
  pottedPlant(room, 2.2, LEDGE, -2.75, 1.1, COL.skyb, 6);
  pottedPlant(room, -1.6, LEDGE, -2.7, .8, COL.butter, 4);
  pottedPlant(room, -3.4, 4.0, -2.4, 2.2, COL.rose, 9);
  pottedPlant(room, 3.5, 4.0, -2.2, 1.8, COL.mint, 8);
  // money plant: a pot on the ledge, the vine climbs over the window and trails down
  add(room, new T.CylinderGeometry(.13, .1, .22, 12), tm(COL.orchid), 1.15, LEDGE + .11, -2.65, { outline: 1.1 });
  vine(room, [V(1.15, LEDGE + .2, -2.65), V(1.6, LEDGE + .9, -2.9), V(2.1, 6.6, -2.95), V(2.35, 7.6, -2.95), V(1.4, 7.98, -2.95), V(.3, 7.9, -2.95), V(-.8, 8.0, -2.95), V(-1.55, 7.7, -2.95), V(-1.75, 6.9, -2.95), V(-1.7, 6.2, -2.9)]);
  vine(room, [V(1.15, LEDGE + .2, -2.65), V(1.0, LEDGE - .3, -2.3), V(1.1, LEDGE - .9, -2.32), V(.95, LEDGE - 1.4, -2.34)]);
  vine(room, [V(.3, 7.9, -2.95), V(.25, 7.5, -2.9), V(.35, 7.15, -2.9)]);
  // a hanging plant, and a bulb for the night
  rod(room, V(-2.4, 9.2, -2.6), V(-2.4, 8.2, -2.6), .008); pottedPlant(room, -2.4, 7.95, -2.6, .9, COL.lav, 4);
  for (let k = 0; k < 5; k++) { const pts = []; for (let j = 0; j <= 5; j++) pts.push(V(-2.4 + Math.cos(k * 1.3) * (.15 + j * .02), 8.1 - j * .25, -2.6 + Math.sin(k * 1.3) * (.15 + j * .02))); vine(room, pts, .3); }
  rod(room, V(1.2, 9.2, -1.2), V(1.2, 8.55, -1.2), .01);
  const bulbMat = new T.MeshBasicMaterial({ color: 0xffffff }); add(room, new T.SphereGeometry(.12, 12, 10), bulbMat, 1.2, 8.45, -1.2, { outline: 1.12 });
  add(room, new T.ConeGeometry(.28, .22, 16, 1, true), tm(COL.butter), 1.2, 8.6, -1.2, { outline: 1.06 }).material.side = T.DoubleSide;
  const roomLight = new T.PointLight(0xffe7b8, 0, 11, 1.4); roomLight.position.set(1.2, 8.3, -1.2); room.add(roomLight);
  const roomGlow = glowSprite(room, 1.2, 8.45, -1.2, 1.6);
  shade(room, false);

  /* =====================================================================
     SET: the street (Chennai, warm pastel), the beach, the jetty
     ===================================================================== */
  const city = new T.Group(); scene.add(city);
  const SHORE = 176, ROAD_END = 168;
  const ground = new T.Mesh(new T.PlaneGeometry(SHORE + 60, 160), tm(0xf4efe0)); ground.rotation.x = -Math.PI / 2; ground.position.set((SHORE - 60) / 2, 0, -18); city.add(ground);
  const roadLen = ROAD_END + 60, roadX = (ROAD_END - 60) / 2;
  add(city, new T.BoxGeometry(roadLen, .06, 5), M.road, roadX, .03, -12);
  for (let x = -55; x < ROAD_END - 2; x += 4) add(city, new T.BoxGeometry(1.6, .07, .14), M.white, x, .05, -12);
  add(city, new T.BoxGeometry(roadLen, .2, 1.4), tm(COL.paper), roadX, .1, -8.8, { edges: 1, lines: cityLine });
  add(city, new T.BoxGeometry(roadLen, .2, 1.4), tm(COL.paper), roadX, .1, -15.2, { edges: 1, lines: cityLine });
  add(city, new T.BoxGeometry(roadLen, .12, 3.6), tm(COL.verge), roadX, .06, -17.7);
  add(city, new T.BoxGeometry(roadLen, .12, 3.2), tm(COL.verge), roadX, .06, -6.5);
  add(city, new T.BoxGeometry(SHORE - ROAD_END + 2, .1, 60), tm(COL.sand), (SHORE + ROAD_END) / 2 - 1, .03, -14);
  // buildings
  const BLD = [COL.cream, COL.rose, COL.butter, COL.lav, COL.mint, COL.skyb, COL.orchid, COL.aqua];
  const winGeo = new T.BoxGeometry(.6, .8, .06), frameGeo = new T.BoxGeometry(.78, .98, .04), boxGeo = new T.BoxGeometry(.8, .16, .24);
  const NW = 2600;
  const wins = new T.InstancedMesh(winGeo, new T.MeshBasicMaterial({ color: 0xffffff }), NW);
  const frames = new T.InstancedMesh(frameGeo, new T.MeshBasicMaterial({ color: 0xffffff }), NW);
  const wboxes = new T.InstancedMesh(boxGeo, new T.MeshToonMaterial({ color: 0xffffff, gradientMap: grad }), 700);
  city.add(wins, frames, wboxes);
  let wi = 0, bi = 0; const winLit = []; const dm = new T.Object3D(); const _c = new T.Color();
  const awnings = [stripeTex('#ffffff', '#2f4a6e'), stripeTex('#ffffff', '#4f8a8b'), stripeTex('#ffffff', '#6f8455'), stripeTex('#ffffff', '#6b7f8f'), stripeTex('#ffffff', '#f3d36a')];
  const lampGlows = [];
  for (let x = -40; x < ROAD_END - 4;) {
    const w = 5 + rnd() * 5, h = 4.5 + rnd() * 11, d = 6 + rnd() * 3, z = -21 - d / 2 - rnd() * 1.5;
    const cx = x + w / 2, front = z + d / 2, bc = pick(BLD);
    add(city, new T.BoxGeometry(w, h, d), tm(bc), cx, h / 2, z, { edges: 1, lines: cityLine });
    add(city, new T.BoxGeometry(w + .3, .25, d + .3), M.white, cx, h + .12, z, { edges: 1, lines: cityLine });
    add(city, new T.BoxGeometry(w + .02, .14, .06), M.white, cx, 2.9, front + .02);     // a floor band
    for (let fy = 2.6 + .9; fy < h - .8; fy += 1.6) for (let fx = -w / 2 + .9; fx < w / 2 - .5; fx += 1.3) {
      if (wi >= NW) break; if (rnd() < .12) continue;
      dm.position.set(cx + fx, fy, front + .03); dm.updateMatrix(); wins.setMatrixAt(wi, dm.matrix); dm.position.z = front + .01; dm.updateMatrix(); frames.setMatrixAt(wi, dm.matrix); winLit[wi] = rnd() < .55; wi++;
      if (bi < 700 && rnd() < .2) { dm.position.set(cx + fx, fy - .5, front + .12); dm.updateMatrix(); wboxes.setMatrixAt(bi, dm.matrix); wboxes.setColorAt(bi, _c.set(pick(BLD))); bi++; const fc = pick(FLOWERS); for (let k = 0; k < 4; k++) flower(cx + fx - .3 + k * .2, fy - .36, front + .14, rnd() < .7 ? fc : pick(GREENS), .9); }
    }
    if (rnd() < .65) for (let fy = 3.4 + .9; fy < h - 1; fy += 3.2) { const bw = Math.min(w - 1, 2.4 + rnd() * 2); const bx = cx + (rnd() - .5) * (w - bw - .6); add(city, new T.BoxGeometry(bw, .1, .7), M.white, bx, fy - .9, front + .35, { edges: 1, lines: cityLine }); add(city, new T.BoxGeometry(bw, .38, .04), tm(pick([COL.white, COL.skyb, COL.mint, COL.rose])), bx, fy - .66, front + .7, { edges: 1, lines: cityLine }); if (rnd() < .8) quickPlant(city, bx - bw / 2 + .35, fy - .85, front + .4); if (rnd() < .5) quickPlant(city, bx + bw / 2 - .35, fy - .85, front + .4); }
    if (rnd() < .65) { const aw = Math.min(w - .6, 3 + rnd() * 2); add(city, new T.BoxGeometry(aw, .06, 1.1), new T.MeshToonMaterial({ map: pick(awnings), gradientMap: grad }), cx, 2.1, front + .5, { rot: [.35, 0, 0], edges: 1, lines: cityLine }); add(city, new T.BoxGeometry(aw * .7, .4, .06), tm(pick(BLD)), cx, 2.6, front + .04, { edges: 1, lines: cityLine }); add(city, new T.BoxGeometry(aw * .8, 1.5, .05), tm(0x9fb6cc), cx, .85, front + .03); quickPlant(city, cx - aw / 2 - .1, .1, front + .4); quickPlant(city, cx + aw / 2 + .1, .1, front + .4); }
    else if (rnd() < .6) { add(city, new T.BoxGeometry(.9, 1.8, .05), tm(pick([COL.mint, COL.skyb, COL.lav])), cx + (rnd() - .5) * (w - 2), .9, front + .03, { edges: 1, lines: cityLine }); }
    if (rnd() < .6) { const tx = cx + (rnd() - .5) * (w - 1.5); add(city, new T.CylinderGeometry(.45, .45, .9, 14), tm(0x4a4e60), tx, h + .7, z - .5, { outline: 1.05 }); add(city, new T.CylinderGeometry(.2, .2, .1, 10), tm(0x4a4e60), tx, h + 1.2, z - .5); }
    if (rnd() < .55) for (let k = 0; k < 3; k++) bush(city, cx + (k - 1) * 1.2, h + .25, z + (rnd() - .5) * 2, .9, 6);
    x += w + .4 + rnd() * 1.2;
  }
  wins.count = frames.count = wi; wboxes.count = bi; wins.instanceMatrix.needsUpdate = frames.instanceMatrix.needsUpdate = wboxes.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < wi; i++) wins.setColorAt(i, _c.set(0x9db6da)); wins.instanceColor.needsUpdate = true;
  // trees and bushes
  for (let x = -34; x < ROAD_END - 3; x += 5.5 + rnd() * 3) { if (rnd() < .35) palm(city, x, -17.6, .9 + rnd() * .3); else roundTree(city, x, -17.6, .85 + rnd() * .35); }
  for (let x = -30; x < ROAD_END - 2; x += 2.6 + rnd() * 2.6) bush(city, x, .1, -6.4 + (rnd() - .5) * 1.2, .6 + rnd() * .3, 9);
  for (let x = -30; x < ROAD_END - 2; x += 3 + rnd() * 3) bush(city, x, .1, -19 + (rnd() - .5) * 1, .55 + rnd() * .2, 6);
  for (let i = 0; i < 700; i++) { const far = rnd() < .5; flower(-40 + rnd() * (ROAD_END + 38), .15, far ? -17.7 + (rnd() - .5) * 3.2 : -6.5 + (rnd() - .5) * 2.8, undefined, .8 + rnd() * .4); }
  const BUBX = [25, 47, 96.7, 123.7, 150.7];   // where the project bubbles float; keep lamps and palms clear of them
  for (const x of [-14, 36, 66, 110, 138, 164]) palm(city, x, -5.6, .85);
  // street lamps (they glow at night)
  const lampBulb = new T.MeshBasicMaterial({ color: 0xffffff }); const LAMPS = [];
  for (let x = -24; x < ROAD_END; x += 14) { if (BUBX.some(b => Math.abs(x + .58 - b) < 5)) continue; const g = new T.Group(); g.position.set(x, 0, -9.3); city.add(g); add(g, new T.CylinderGeometry(.05, .07, 3.4, 6), tm(0x7a8098), 0, 1.7, 0); add(g, new T.BoxGeometry(.7, .08, .14), tm(0x7a8098), .3, 3.4, 0); add(g, new T.SphereGeometry(.13, 10, 8), lampBulb, .58, 3.3, 0, { outline: 1.2 }); lampGlows.push(glowSprite(g, .58, 3.25, 0, 2.6)); LAMPS.push(V(x + .58, 3.2, -9.3)); }
  // clouds
  const clouds = new T.Group(); scene.add(clouds);
  for (let i = 0; i < 14; i++) { const g = new T.Group(); g.position.set(-20 + i * 32 + rnd() * 20, 22 + rnd() * 16, -40 - rnd() * 30); for (let k = 0; k < 4; k++) add(g, new T.SphereGeometry(2 + rnd() * 1.6, 14, 10), M.white, k * 2.4 - 3.6, rnd() * 1.2, rnd() * 1.5, { outline: 1.04 }); clouds.add(g); }
  // the jetty
  const JZ = -12.6, JX0 = ROAD_END + 2.6, JX1 = ROAD_END + 17, DECK = .56;
  add(city, new T.BoxGeometry(JX1 - JX0, .14, 1.7), tm(0xead8bf), (JX0 + JX1) / 2, DECK - .07, JZ, { edges: 1, lines: cityLine });
  for (let x = JX0 + .5; x < JX1; x += .9) add(city, new T.BoxGeometry(.04, .02, 1.7), tm(0xcdb79c), x, DECK + .005, JZ);
  for (let x = JX0 + 1; x <= JX1; x += 2.4) for (const z of [JZ - .8, JZ + .8]) { add(city, new T.CylinderGeometry(.09, .09, 4, 6), tm(0xcdb79c), x, -1.5, z); add(city, new T.CylinderGeometry(.1, .1, .5, 6), tm(0xcdb79c), x, DECK + .2, z, { outline: 1.15 }); }
  const lampEnd = new T.Group(); lampEnd.position.set(JX1 - .3, DECK, JZ - .7); city.add(lampEnd); add(lampEnd, new T.CylinderGeometry(.04, .05, 1.6, 6), tm(0x7a8098), 0, .8, 0); add(lampEnd, new T.SphereGeometry(.14, 10, 8), lampBulb, 0, 1.7, 0, { outline: 1.2 }); lampGlows.push(glowSprite(lampEnd, 0, 1.7, 0, 2.4)); LAMPS.push(V(JX1 - .3, DECK + 1.65, JZ - .7));
  const lampFlies = []; LAMPS.forEach(h => { for (let k = 0; k < 3; k++) lampFlies.push({ sp: glowSprite(city, h.x, h.y, h.z, .14, 0xfff8d8), h, a: rnd() * 6.28, r: .22 + rnd() * .4, w: 1.8 + rnd() * 2.6, ph: rnd() * 6 }); });
  const parked = [];
  // the sea
  const seaTop = new T.Mesh(new T.PlaneGeometry(6000, 6000), toon(COL.blue, { transparent: true, opacity: .96 })); seaTop.rotation.x = -Math.PI / 2; seaTop.position.set(SHORE - 3 + 3000, -.05, -12); seaTop.receiveShadow = true; scene.add(seaTop);
  const seaBot = new T.Mesh(new T.PlaneGeometry(6000, 6000), new T.MeshBasicMaterial({ color: COL.blue2, side: T.BackSide, transparent: true, opacity: .9 })); seaBot.rotation.x = -Math.PI / 2; seaBot.position.set(SHORE - 3 + 3000, -.06, -12); scene.add(seaBot);
  for (let z = -60; z < 30; z += 2.6) add(city, new T.BoxGeometry(.6, .05, 2), M.white, SHORE + .4 + Math.sin(z) * .3, .01, z);

  /* =====================================================================
     SET: under the sea (built in its own coordinates, then slid along by SX)
     ===================================================================== */
  const SX = 60, S0 = 116;
  const sea = new T.Group(); sea.position.x = SX; scene.add(sea);
  const bedGeo = new T.PlaneGeometry(440, 120, 88, 24); bedGeo.rotateX(-Math.PI / 2); bedGeo.translate(S0 + 220, 0, -12);
  const bp = bedGeo.attributes.position; for (let i = 0; i < bp.count; i++) { const x = bp.getX(i), z = bp.getZ(i); let y = -31 + Math.sin(x * .07) * 1.6 + Math.cos(z * .19 + x * .03) * 1.1; y = lerp(y, -1.2 - (x - S0) * .35, sm(178, 125, x)); bp.setY(i, Math.min(y, -1)); }
  bedGeo.computeVertexNormals(); sea.add(new T.Mesh(bedGeo, tm(0xf3e6d3)));
  for (let i = 0; i < 44; i++) { const x = 175 + rnd() * 165, z = -26 + rnd() * 26; add(sea, new T.DodecahedronGeometry(.6 + rnd() * 1.6, 0), tm(pick([COL.cream, COL.blue2, COL.lav, COL.rose])), x, -30 + rnd(), z, { outline: 1.05 }); }
  const rayTex = canvasTex(4, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,.32)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  for (let i = 0; i < 12; i++) { const m = new T.Mesh(new T.PlaneGeometry(1.5 + rnd() * 2.2, 34), new T.MeshBasicMaterial({ map: rayTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide })); m.position.set(175 + i * 9 + rnd() * 5, -17, -16 - rnd() * 8); m.rotation.z = .25; sea.add(m); }
  // exploration bubbles (small experiments), drifting in open water
  const EXX = [186, 199, 212, 225, 238, 251];
  const exBubbles = EXX.map((x, i) => { const g = new T.Group(); g.position.set(x - 2, -5.5 + (i % 2) * 1.6, -15.5 - (i % 3) * .8); sea.add(g); const s = new T.Mesh(new T.SphereGeometry(1.35, 36, 24), glassMat(1)); s.renderOrder = 9; g.add(s); const icon = new T.Group(); icon.scale.setScalar(.6); g.add(icon); buildExIcon(i, icon); return { g, icon, y: g.position.y, ph: i * 1.1 }; });
  function buildExIcon(i, g) {
    if (i === 0) { add(g, new T.SphereGeometry(.5, 16, 12), tm(0x9fc3ec), 0, -.2, 0, { outline: 1.1 }); add(g, new T.ConeGeometry(.42, .8, 16), tm(0x9fc3ec), 0, .45, 0, { outline: 1.1 }); }
    else if (i === 1) { for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) add(g, new T.BoxGeometry(.32, .32, .1), tm(pick([COL.rose, COL.butter, COL.mint, COL.lav, 0xffffff])), -.55 + a * .37, -.55 + b * .37, 0, { outline: 1.12 }); }
    else if (i === 2) { add(g, new T.BoxGeometry(1.1, .5, .7), tm(COL.mint), 0, 0, 0, { edges: 1 }); [-.4, .4].forEach(x => add(g, new T.CylinderGeometry(.25, .25, .12, 14), M.ink, x, -.3, .4, { rot: [Math.PI / 2, 0, 0] })); add(g, new T.SphereGeometry(.12, 8, 6), M.white, .4, .35, 0, { outline: 1.2 }); }
    else if (i === 3) { add(g, new T.CylinderGeometry(.8, .8, .2, 20), tm(COL.lav), 0, 0, 0, { outline: 1.06 }); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; add(g, new T.CylinderGeometry(.18, .18, .25, 10), M.ink, Math.cos(a) * .8, 0, Math.sin(a) * .8, { rot: [Math.PI / 2, a, 0] }); } }
    else if (i === 4) { const pts = []; for (let k = 0; k <= 10; k++) pts.push(V(-1 + k * .2, Math.sin(k * .8) * .3 - .5, 0)); g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 20, .05, 5), M.ink)); add(g, new T.BoxGeometry(.6, .3, .4), tm(COL.butter), 0, .1, 0, { edges: 1 }); }
    else { for (let k = 0; k < 4; k++) add(g, new T.ConeGeometry(.15, .9, 4), tm(0xfde27a), 0, 0, 0, { rot: [0, 0, k * Math.PI / 2], outline: 1.12 }); add(g, new T.SphereGeometry(.2, 10, 8), tm(0xfde27a), 0, 0, 0, { outline: 1.15 }); }
  }
  // reef: coral, brain coral, kelp, sea grass
  const reef = new T.Group(); sea.add(reef);
  const REEF = 284;
  function coral(x, y, z, mat, depth = 0, a = 0, len = 1.4) { if (depth > 3) return; const tip = V(x + Math.sin(a) * len, y + Math.cos(a) * len, z); rod(reef, V(x, y, z), tip, .16 - depth * .03, mat); add(reef, new T.SphereGeometry(.17 - depth * .03, 8, 6), mat, tip.x, tip.y, tip.z); coral(tip.x, tip.y, tip.z, mat, depth + 1, a - .45 - rnd() * .2, len * .78); coral(tip.x, tip.y, tip.z, mat, depth + 1, a + .45 + rnd() * .2, len * .78); }
  for (let i = 0; i < 18; i++) { const x = REEF - 9 + rnd() * 38, z = -19 + rnd() * 9; coral(x, -29.5, z, tm([COL.white, COL.aqua, COL.butter, COL.yellow, COL.mint, COL.lav][i % 6]), 0, (rnd() - .5) * .4, 1.2 + rnd() * .8); }
  for (let i = 0; i < 9; i++) { const r = 1 + rnd() * .8; const m = add(reef, new T.SphereGeometry(r, 18, 12), tm(pick([COL.white, COL.butter, COL.rose])), REEF - 7 + rnd() * 34, -29.6, -16 + rnd() * 8, { outline: 1.05 }); m.scale.y = .7; for (let k = 0; k < 4; k++) { const t = new T.Mesh(new T.TorusGeometry(r * (.3 + k * .18), .03, 6, 20), M.ink); t.rotation.x = Math.PI / 2; t.position.y = r * .5 - k * .05; m.add(t); } }
  const kelp = [];
  for (let i = 0; i < 30; i++) { const pts = []; const hgt = 6 + rnd() * 10; for (let k = 0; k <= 8; k++) pts.push(V(Math.sin(k * .7 + i) * .4, k * hgt / 8, 0)); const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 20, .12, 5), tm(pick([...GREENS, COL.blue]))); m.position.set(180 + rnd() * 150, -30, -22 + rnd() * 7); sea.add(m); kelp.push(m); }
  const grassBlade = (() => { const s = new T.Shape(); s.moveTo(-.06, 0); s.quadraticCurveTo(.05, .6, .02, 1.2); s.quadraticCurveTo(.12, .6, .06, 0); return flat(s, .01); })();
  for (let i = 0; i < 90; i++) { const x = 172 + rnd() * 160; const z = -22 + rnd() * 9; const m = new T.Mesh(grassBlade, tm(pick(GREENS))); m.position.set(x, -29.5 + (x < 180 ? 8 : 0), z); m.scale.setScalar(1 + rnd() * 1.5); m.rotation.set((rnd() - .5) * .4, rnd() * 3, (rnd() - .5) * .4); sea.add(m); kelp.push(m); }
  const school = [];
  for (let i = 0; i < 18; i++) { const c = pick([COL.white, COL.rose, COL.lav, COL.skyb, COL.butter]); const g = new T.Group(); add(g, new T.SphereGeometry(.22, 10, 8), tm(c), 0, 0, 0, { outline: 1.12 }).scale.set(1.4, .8, .7); add(g, new T.ConeGeometry(.15, .28, 4), tm(c), -.38, 0, 0, { rot: [0, 0, Math.PI / 2], outline: 1.12 }); sea.add(g); school.push({ g, a: rnd() * 6.28, r: 4 + rnd() * 3, y: (rnd() - .5) * 3, sp: .25 + rnd() * .2, cx: 200 + (i % 2) * 50 }); }
  const specks = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(Array.from({ length: 900 }, (_, i) => i % 3 === 0 ? 165 + rnd() * 175 : i % 3 === 1 ? -29 + rnd() * 28 : -30 + rnd() * 30), 3)), new T.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: .75 }));
  sea.add(specks);

  /* =====================================================================
     SET: the world and space
     ===================================================================== */
  const PR = 500, PC = V(330 + SX, -PR, -12);
  const planetTex = canvasTex(2048, 1024, (g, w, h) => {
    g.fillStyle = '#6f9cc9'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(221,233,248,.6)'; g.lineWidth = 2; for (let y = 20; y < h; y += 26) { g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * .01 + y) * 4); g.stroke(); }
    const land = [[300, 300, 180], [520, 420, 140], [900, 260, 210], [1050, 520, 150], [1400, 330, 190], [1650, 600, 160], [700, 700, 120], [1250, 760, 110], [180, 620, 100]];
    land.forEach(([cx, cy, r], k) => { g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; const rr = r * (1 + .25 * Math.sin(a * 3 + k) + .15 * Math.sin(a * 7 + k * 2)); g.lineTo(cx + Math.cos(a) * rr * 1.4, cy + Math.sin(a) * rr * .8); } g.closePath(); g.fillStyle = ['#b4cd93', '#9cbf7e', '#d9cfae'][k % 3]; g.fill(); g.lineWidth = 5; g.strokeStyle = '#2b3240'; g.stroke();
      for (let j = 0; j < 12; j++) { g.fillStyle = j % 4 === 0 ? 'rgba(242,207,74,.8)' : 'rgba(116,180,110,.55)'; g.beginPath(); g.arc(cx + Math.sin(j * 2.1 + k) * r * .7, cy + Math.cos(j * 1.7 + k) * r * .35, 8 + (j % 3) * 6, 0, 7); g.fill(); } });
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, 40); g.fillRect(0, h - 40, w, 40);
  });
  const planetPivot = new T.Group(); planetPivot.position.copy(PC); planetPivot.rotation.set(1.05, 0, .3); scene.add(planetPivot);
  const planet = new T.Mesh(new T.SphereGeometry(PR, 96, 64), toon(0xffffff, { map: planetTex })); planet.visible = false; planetPivot.add(planet);
  const planetInk = new T.Mesh(planet.geometry, inkBack); planetInk.scale.setScalar(1.008); planet.add(planetInk);
  const halo = new T.Mesh(new T.SphereGeometry(PR * 1.06, 64, 48), new T.MeshBasicMaterial({ color: COL.blue2, transparent: true, opacity: .25, side: T.BackSide })); planet.add(halo);
  const starPos = []; for (let i = 0; i < 2200; i++) { const v = V(rnd() - .5, rnd() - .5, rnd() - .5).normalize().multiplyScalar(9000); starPos.push(v.x + PC.x, v.y + PC.y, v.z + PC.z); }
  const stars = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(starPos, 3)), new T.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false })); scene.add(stars);

  /* ---------------- the sky: a gradient dome, a sun or moon, night stars ---------------- */
  const skyU = { top: { value: new T.Color() }, mid: { value: new T.Color() }, bot: { value: new T.Color() }, space: { value: new T.Color(COL.space) }, sp: { value: 0 } };
  const skyDome = new T.Mesh(new T.SphereGeometry(5000, 32, 16), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, depthTest: false, fog: false, uniforms: skyU,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top, mid, bot, space; uniform float sp; varying vec3 vP; void main(){ float y = vP.y; vec3 c = y > 0.0 ? mix(mid, top, smoothstep(0.0, 0.5, pow(y, 0.8))) : mix(mid, bot, smoothstep(0.0, -0.2, y)); gl_FragColor = vec4(mix(c, space, sp), 1.0); }' }));
  skyDome.renderOrder = -10; scene.add(skyDome);
  const nsPos = []; for (let i = 0; i < 900; i++) { const v = V(rnd() - .5, rnd() * .9 + .03, rnd() - .5).normalize().multiplyScalar(4500); nsPos.push(v.x, v.y, v.z); }
  const nightStars = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(nsPos, 3)), new T.PointsMaterial({ color: 0xfff8e6, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  nightStars.renderOrder = -9; skyDome.add(nightStars);
  const orbTex = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 30, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.33, 'rgba(255,255,255,1)'); gr.addColorStop(.36, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const orb = new T.Sprite(new T.SpriteMaterial({ map: orbTex, transparent: true, depthWrite: false, fog: false })); orb.renderOrder = -8; scene.add(orb);

  /* =====================================================================
     THE GOLDFISH (head = +x). A little chubby. Wears specs.
     ===================================================================== */
  const fish = new T.Group(); scene.add(fish);
  const rig = new T.Group(); fish.add(rig);
  const fishSkin = M.mango, suitM = tm(0xffffff);
  const body = add(rig, new T.SphereGeometry(.5, 36, 24), fishSkin, 0, 0, 0, { outline: 1.05 }); body.scale.set(1.12, .92, .84);
  add(rig, new T.SphereGeometry(.5, 24, 16), tm(COL.belly), .05, -.12, 0).scale.set(.95, .62, .72);
  for (let k = 0; k < 3; k++) { const a = new T.Mesh(new T.TorusGeometry(.09, .012, 5, 10, Math.PI), M.ink); a.position.set(-.18 + k * .14, .12 - (k % 2) * .1, .4); a.rotation.z = -Math.PI / 2; rig.add(a); const b = a.clone(); b.position.z = -.4; rig.add(b); }
  const tailPivot = new T.Group(); tailPivot.position.set(-.52, 0, 0); rig.add(tailPivot);
  const ts = new T.Shape(); ts.moveTo(.06, .1); ts.lineTo(-.44, .42); ts.quadraticCurveTo(-.3, 0, -.44, -.42); ts.lineTo(.06, -.1); ts.lineTo(.06, .1);
  const tailB = bordered(ts, .05, fishSkin, .04); tailPivot.add(tailB.g); const tail = tailB.main;
  const ds = new T.Shape(); ds.moveTo(-.25, .32); ds.quadraticCurveTo(-.1, .7, .15, .62); ds.quadraticCurveTo(.2, .48, .2, .38); ds.lineTo(-.25, .32);
  const dorsalB = bordered(ds, .04, fishSkin, .035); rig.add(dorsalB.g); const dorsal = dorsalB.g;
  const finShape = new T.Shape(); finShape.moveTo(0, 0); finShape.quadraticCurveTo(-.12, -.16, -.26, -.14); finShape.quadraticCurveTo(-.12, -.02, 0, 0);
  const fins = [1, -1].map(s => { const b = bordered(finShape, .03, fishSkin, .025); b.g.position.set(.08, -.12, s * .4); b.g.rotation.y = s * .5; rig.add(b.g); return b; });
  const eyes = [1, -1].map(s => { const e = add(rig, new T.SphereGeometry(.13, 18, 14), M.white, .3, .13, s * .3, { outline: 1.12 }); const pu = add(e, new T.SphereGeometry(.065, 12, 10), M.ink, .04, 0, s * .085); add(pu, new T.SphereGeometry(.02, 6, 5), new T.MeshBasicMaterial({ color: 0xffffff }), .03, .025, s * .03); return { e, pu, s }; });
  add(rig, new T.TorusGeometry(.06, .018, 6, 12, Math.PI), M.ink, .56, -.08, 0, { rot: [0, Math.PI / 2, Math.PI] });
  // specs: bold round frames, a pale lens, a bridge; no arms
  const specs = new T.Group(); rig.add(specs);
  eyes.forEach(({ s }) => {
    const g = new T.Group(); g.position.set(.31, .14, s * .4); g.rotation.y = s > 0 ? .6 : -.6; specs.add(g);
    g.add(new T.Mesh(new T.TorusGeometry(.155, .036, 10, 32), M.ink));
    g.add(new T.Mesh(new T.CircleGeometry(.15, 24), new T.MeshBasicMaterial({ color: 0xe8f1ff, transparent: true, opacity: .28, depthWrite: false, side: T.DoubleSide })));
    const glint = new T.Mesh(new T.PlaneGeometry(.035, .14), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85, side: T.DoubleSide })); glint.position.set(-.06, .03, s * .005); glint.rotation.z = -.6; g.add(glint);
  });
  specs.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(.44, .17, .31), V(.55, .23, 0), V(.44, .17, -.31)]), 12, .028, 6), M.ink));
  // bike helmet: coral dome, white stripes, a peak, a strap, all inked
  const helmet = new T.Group(); rig.add(helmet);
  const dome = add(helmet, new T.SphereGeometry(.42, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), tm(COL.navy), .02, .3, 0, { outline: 1.1, edges: 1 }); dome.scale.set(.98, .72, .98);
  [-.12, .12].forEach(z => { const sg = new T.Group(); sg.position.set(.02, .3, z); sg.scale.set(.99, .73, 1); sg.add(new T.Mesh(new T.TorusGeometry(.42, .028, 6, 28, Math.PI), tm(COL.yellow))); helmet.add(sg); });
  for (let k = 0; k < 3; k++) add(helmet, new T.BoxGeometry(.11, .035, .06), M.ink, -.12 + k * .12, .6, 0);
  add(helmet, new T.BoxGeometry(.2, .04, .46), tm(COL.navy), .42, .36, 0, { rot: [0, 0, -.3], outline: 1.15 });
  const strap = new T.Mesh(new T.TorusGeometry(.4, .016, 5, 30, Math.PI * .9), M.ink); strap.rotation.set(0, Math.PI / 2, Math.PI * 1.05); strap.position.set(.12, .18, 0); helmet.add(strap);
  // seat belt
  const belt = new T.Group(); rig.add(belt);
  const sash = new T.Mesh(new T.TorusGeometry(.5, .035, 6, 40), tm(0x6f7aa0)); sash.rotation.set(0, Math.PI / 2, 0); sash.scale.set(.86, .93, 1); belt.add(sash); belt.rotation.set(.6, 0, -.25); belt.position.x = -.04;
  add(belt, new T.BoxGeometry(.06, .1, .08), tm(0xdfe3ec), 0, -.48, 0, { outline: 1.2 });
  // arms (car, boat): skin-coloured with white mitten hands
  const arms = [1, -1].map(s => { const g = new T.Group(); rig.add(g); const up = new T.Mesh(new T.CylinderGeometry(.04, .04, 1, 8), fishSkin); const h = new T.Mesh(up.geometry, inkBack); h.scale.set(1.5, 1, 1.5); h.userData.hull = 1; up.add(h); g.add(up); const hand = add(g, new T.SphereGeometry(.075, 10, 8), M.white, 0, 0, 0, { outline: 1.18 }); return { g, up, hand, s, sh: V(.12, -.06, s * .38) }; });
  const _ad = V(0, 0, 0), _tg = V(0, 0, 0);
  function setArm(a, to, k = 1) { _tg.copy(a.sh).lerp(to, k); _ad.copy(_tg).sub(a.sh); const L = Math.max(.02, _ad.length()); a.up.position.copy(a.sh).addScaledVector(_ad, .5); a.up.scale.set(1, L, 1); a.up.quaternion.setFromUnitVectors(V(0, 1, 0), _ad.normalize()); a.hand.position.copy(_tg); a.hand.scale.setScalar(Math.max(.01, k)); }
  // cyborg legs: silver segments, glowing joints, a piston, sneaker-boots. Two-bone IK.
  const L1 = .36, L2 = .36;
  const metal = tm(COL.metal), jointGlow = new T.MeshBasicMaterial({ color: COL.glow }), sole = tm(COL.skyb);
  const legs = [1, -1].map(s => {
    const hip = new T.Group(); hip.position.set(.02, -.36, s * .17); rig.add(hip);
    add(hip, new T.SphereGeometry(.075, 12, 10), metal, 0, 0, 0, { outline: 1.18 });
    add(hip, new T.CylinderGeometry(.055, .048, L1, 10), metal, 0, -L1 / 2, 0, { outline: [1.35, 1.02, 1.35] });
    add(hip, new T.TorusGeometry(.056, .014, 6, 14), jointGlow, 0, -L1 * .45, 0, { rot: [Math.PI / 2, 0, 0] });
    rod(hip, V(.05, -.06, s * .02), V(.05, -L1 + .06, s * .02), .012, tm(0x8d93a8));
    const knee = new T.Group(); knee.position.y = -L1; hip.add(knee);
    add(knee, new T.SphereGeometry(.065, 12, 10), metal, 0, 0, 0, { outline: 1.18 });
    add(knee, new T.CircleGeometry(.035, 12), jointGlow, 0, 0, s * .067, { rot: [0, s > 0 ? 0 : Math.PI, 0] });
    add(knee, new T.CylinderGeometry(.046, .036, L2, 10), metal, 0, -L2 / 2, 0, { outline: [1.35, 1.02, 1.35] });
    add(knee, new T.BoxGeometry(.03, L2 * .6, .05), tm(COL.yellow), .04, -L2 / 2, 0);
    const ankle = new T.Group(); ankle.position.y = -L2; knee.add(ankle);
    const shoe = add(ankle, new T.BoxGeometry(.25, .1, .14), M.white, .06, -.03, 0, { outline: 1.15 }); add(shoe, new T.BoxGeometry(.26, .03, .15), sole, 0, -.045, 0); add(shoe, new T.SphereGeometry(.022, 6, 5), jointGlow, .12, .02, 0);
    return { hip, knee, ankle, s };
  });
  function setLeg(l, tx, ty) {
    const dx = tx - l.hip.position.x, dy = ty - l.hip.position.y; const d = clamp(Math.hypot(dx, dy), .12, L1 + L2 - .002);
    const phi = Math.atan2(dx, -dy), a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), b = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
    l.hip.rotation.z = phi + a; l.knee.rotation.z = -(Math.PI - b); l.ankle.rotation.z = -(l.hip.rotation.z + l.knee.rotation.z);
  }
  // wings
  const wingShape = new T.Shape(); wingShape.moveTo(0, 0); wingShape.quadraticCurveTo(.3, .5, .1, 1.2); wingShape.quadraticCurveTo(-.05, 1.0, -.15, 1.05); wingShape.quadraticCurveTo(-.2, .8, -.32, .82); wingShape.quadraticCurveTo(-.32, .55, -.45, .5); wingShape.quadraticCurveTo(-.3, .2, 0, 0);
  const wings = [1, -1].map(s => { const pv = new T.Group(); pv.position.set(-.05, .3, s * .28); rig.add(pv); const b = bordered(wingShape, .03, M.white, .035); b.g.rotation.x = s * 1.05; pv.add(b.g); pv.visible = false; return { pv, s }; });
  // space suit
  const suit = new T.Group(); rig.add(suit); suit.visible = false;
  const shellGeo = new T.SphereGeometry(.5, 32, 20, 0, Math.PI * 2, 0, 1.95); shellGeo.rotateZ(Math.PI / 2);
  const shell = add(suit, shellGeo, suitM, -.01, 0, 0, { outline: 1.04 }); shell.scale.set(1.15, .96, .89);
  [-.15, .05].forEach(x => { const r = new T.Mesh(new T.TorusGeometry(.43, .03, 6, 30), tm(COL.skyb)); r.rotation.y = Math.PI / 2; r.position.x = x - .08; r.scale.set(1, .98, .9); suit.add(r); });
  const collar = new T.Mesh(new T.TorusGeometry(.43, .06, 8, 32), tm(COL.skyb)); collar.rotation.y = Math.PI / 2; collar.position.x = .2; collar.scale.set(1, .98, .88); suit.add(collar);
  const bubbleH = new T.Mesh(new T.SphereGeometry(.47, 32, 24), glassMat(1.4)); bubbleH.position.set(.36, .06, 0); bubbleH.renderOrder = 12; suit.add(bubbleH);
  const pack = add(suit, new T.BoxGeometry(.42, .2, .36), tm(0xe9edf5), -.16, .48, 0, { edges: 1 });
  [-.1, .1].forEach(z => add(pack, new T.CylinderGeometry(.06, .06, .34, 10), tm(COL.skyb), 0, .12, z, { rot: [0, 0, Math.PI / 2], outline: 1.15 }));
  rod(suit, V(.3, .48, 0), V(.28, .78, 0), .012); const beacon = add(suit, new T.SphereGeometry(.05, 12, 10), new T.MeshBasicMaterial({ color: 0xe05a4f }), .28, .8, 0, { outline: 1.25 }); const beaconGlow = glowSprite(suit, .28, .8, 0, .3, 0xffb3a6);
  add(suit, new T.BoxGeometry(.12, .1, .02), tm(COL.yellow), -.05, .05, .44);
  shade(fish);
  const fmap = new Map(); const fc = m => { if (!fmap.has(m)) fmap.set(m, m.clone()); return fmap.get(m); };
  fish.traverse(o => { if (o.material) o.material = fc(o.material); });
  const FM = { skin: fc(fishSkin), suit: fc(suitM) };
  // a clean copy of the fish (no helmet, legs, arms, belt, wings or suit) for the project pages
  [helmet, belt, suit].forEach(o => o.userData.extra = 1); arms.forEach(a => a.g.userData.extra = 1); legs.forEach(l => l.hip.userData.extra = 1); wings.forEach(w => w.pv.userData.extra = 1);
  tailPivot.name = 'tailPivot';
  const fishProto = fish.clone(true); fishProto.traverse(o => { if (o.userData.extra) o.visible = false; });

  /* ---------------- vehicles ---------------- */
  function wheel(parent, x, y, z, r, w = .2) { const g = new T.Group(); g.position.set(x, y, z); parent.add(g); const sp = new T.Group(); g.add(sp); add(sp, new T.CylinderGeometry(r, r, w, 18), tm(0x4a4e60), 0, 0, 0, { rot: [Math.PI / 2, 0, 0] }); add(sp, new T.CylinderGeometry(r * .45, r * .45, w + .01, 12), M.white, 0, 0, 0, { rot: [Math.PI / 2, 0, 0] }); add(sp, new T.BoxGeometry(r * .7, .04, w + .02), tm(0x9aa1b5), 0, 0, 0); return { g, sp }; }
  // the bicycle
  const bike = new T.Group(); scene.add(bike); bike.visible = false;
  const bwheels = [.78, -.78].map(x => { const w = new T.Group(); w.position.set(x, .45, 0); bike.add(w); w.add(new T.Mesh(new T.TorusGeometry(.42, .045, 8, 32), tm(0x4a4e60))); for (let k = 0; k < 6; k++) { const sp = new T.Mesh(new T.CylinderGeometry(.008, .008, .82, 4), M.ink); sp.rotation.z = k * Math.PI / 6; w.add(sp); } return w; });
  [[V(-.78, .45, 0), V(0, .38, 0)], [V(0, .38, 0), V(-.22, 1.0, 0)], [V(-.78, .45, 0), V(-.22, 1.0, 0)], [V(0, .38, 0), V(.58, 1.02, 0)], [V(-.22, 1.0, 0), V(.58, 1.02, 0)], [V(.58, 1.02, 0), V(.78, .45, 0)], [V(.58, 1.02, 0), V(.62, 1.3, 0)]].forEach(([a, b]) => rod(bike, a, b, .035, tm(0x7fa8e0)));
  // a water bowl instead of a saddle (legs come out through two ports), fin cuffs instead of grips, a gill mister
  rod(bike, V(-.22, 1.0, 0), V(-.06, .98, 0), .035, tm(0x7fa8e0));
  const bowlSeat = new T.Mesh(new T.SphereGeometry(.5, 32, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), glassMat(1.6)); bowlSeat.position.set(-.05, 1.32, 0); bowlSeat.scale.set(1.2, .75, 1.02); bowlSeat.renderOrder = 11; bike.add(bowlSeat);
  const seatWater = new T.Mesh(new T.SphereGeometry(.48, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon(COL.blue, { transparent: true, opacity: .45, depthWrite: false })); seatWater.position.set(-.05, 1.2, 0); seatWater.scale.set(1.2, .55, 1); seatWater.renderOrder = 10; bike.add(seatWater);
  add(bike, new T.CircleGeometry(.56, 28), toon(COL.blue3, { transparent: true, opacity: .55, depthWrite: false, side: T.DoubleSide }), -.05, 1.2, 0, { rot: [-Math.PI / 2, 0, 0] }).scale.set(1.04, .88, 1);
  const bowlRim = new T.Mesh(new T.TorusGeometry(.5, .025, 6, 36), M.ink); bowlRim.rotation.x = Math.PI / 2; bowlRim.position.set(-.05, 1.32, 0); bowlRim.scale.set(1.2, 1.02, 1); bike.add(bowlRim);
  [.17, -.17].forEach(z => add(bike, new T.TorusGeometry(.08, .02, 6, 14), M.ink, 0, .97, z, { rot: [Math.PI / 2, 0, 0] }));
  rod(bike, V(.62, 1.3, 0), V(.62, 1.3, 0).add(V(0, 0, .01)), .03);
  [1, -1].forEach(s => { const pts = [V(.62, 1.3, 0), V(.6, 1.32, s * .3), V(.35, 1.24, s * .48), V(.18, 1.2, s * .5)]; bike.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 16, .026, 6), tm(0x4a4e60))); add(bike, new T.TorusGeometry(.09, .026, 8, 18, Math.PI * 1.3), tm(COL.yellow), .14, 1.2, s * .5, { rot: [0, Math.PI / 2, -Math.PI * .15], outline: 1.2 }); });
  rod(bike, V(.58, 1.02, 0), V(.62, 1.5, -.12), .018, tm(0x4a4e60)); const mister = add(bike, new T.ConeGeometry(.05, .12, 10), tm(COL.teal), .6, 1.52, -.14, { rot: [0, 0, Math.PI / 2], outline: 1.2 });
  add(bike, new T.CylinderGeometry(.07, .07, .28, 12), tm(COL.teal), .22, .72, 0, { rot: [0, 0, -.75], outline: 1.12 }); add(bike, new T.CylinderGeometry(.04, .04, .05, 8), M.white, .33, .83, 0, { rot: [0, 0, -.75] });
  add(bike, new T.CylinderGeometry(.11, .11, .04, 16), tm(0x9aa1b5), 0, .38, .1, { rot: [Math.PI / 2, 0, 0], outline: 1.1 });   // chainring
  const CR = .17;
  const crank = new T.Group(); crank.position.set(0, .38, 0); bike.add(crank);
  const pedals = [1, -1].map(s => { rod(crank, V(0, 0, s * .12), V(s * CR, 0, s * .12), .025, tm(0x6f7690)); const pd = new T.Group(); pd.position.set(s * CR, 0, s * .16); crank.add(pd); add(pd, new T.BoxGeometry(.13, .03, .07), M.ink); return pd; });
  add(bike, new T.ConeGeometry(.07, .16, 10), tm(COL.sand), .66, 1.36, .14, { rot: [0, 0, -.6], outline: 1.2 });   // a shell for a bell
  const basket = add(bike, new T.CylinderGeometry(.22, .17, .24, 12, 1, true), tm(0xe9d6bd), .92, 1.12, 0, { outline: 1.06 }); basket.material.side = T.DoubleSide;
  for (let k = 0; k < 4; k++) add(bike, new T.IcosahedronGeometry(.11, 0), tm(pick(GREENS)), .92 + (rnd() - .5) * .2, 1.27, (rnd() - .5) * .2, { outline: 1.1 });
  const kick = rod(bike, V(-.1, .38, -.08), V(-.3, 0, -.2), .02);
  shade(bike);
  // cars
  function makeCar(col, open) {
    const g = new T.Group(); const m = tm(col); const out = { g };
    add(g, new T.BoxGeometry(2.9, .42, 1.5), m, 0, .52, 0, { edges: 1 });
    add(g, new T.BoxGeometry(.95, .2, 1.5), m, .97, .83, 0, { edges: 1 });
    add(g, new T.BoxGeometry(.62, .2, 1.5), m, -1.14, .83, 0, { edges: 1 });
    [.7, -.7].forEach(z => add(g, new T.BoxGeometry(1.6, .22, .1), m, -.1, .84, z, { edges: 1 }));
    add(g, new T.BoxGeometry(.12, .16, 1.56), M.white, 1.47, .4, 0, { edges: 1 }); add(g, new T.BoxGeometry(.12, .16, 1.56), M.white, -1.47, .4, 0, { edges: 1 });
    [.5, -.5].forEach(z => { const e = add(g, new T.SphereGeometry(.13, 12, 10), new T.MeshBasicMaterial({ color: 0xffffff }), 1.42, .64, z, { outline: 1.15 }); if (open) add(e, new T.SphereGeometry(.06, 8, 6), M.ink, .09, .01, 0); add(g, new T.BoxGeometry(.04, .1, .22), tm(COL.coral), -1.47, .62, z); });
    add(g, new T.BoxGeometry(.08, .03, 1.2), tm(0xffffff), .99, .94, 0);
    out.wheels = [[.92, .72], [.92, -.72], [-.92, .72], [-.92, -.72]].map(([x, z]) => wheel(g, x, .3, z, .3));
    if (open) {
      const tank = add(g, new T.BoxGeometry(1.0, .62, 1.18), new T.MeshBasicMaterial({ color: 0xe6f0f8, transparent: true, opacity: .22, depthWrite: false }), -.32, 1.03, 0, { edges: 1 }); tank.renderOrder = 11;
      add(g, new T.BoxGeometry(.96, .38, 1.14), toon(COL.blue, { transparent: true, opacity: .5, depthWrite: false }), -.32, .91, 0).renderOrder = 10;
      add(g, new T.PlaneGeometry(.96, 1.14), toon(COL.blue3, { transparent: true, opacity: .6, depthWrite: false, side: T.DoubleSide }), -.32, 1.1, 0, { rot: [-Math.PI / 2, 0, 0] });
      for (let k = 0; k < 4; k++) add(g, new T.SphereGeometry(.05, 8, 6), tm(pick([COL.white, COL.sand, COL.stone])), -.6 + k * .18, .74, (rnd() - .5) * .7, { outline: 1.2 });
      const weed = []; for (let j = 0; j <= 4; j++) weed.push(V(-.72, .72 + j * .08, .4 + Math.sin(j) * .03)); g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(weed), 8, .02, 4), tm(GREENS[0])));
      const finS = new T.Shape(); finS.moveTo(0, 0); finS.lineTo(.55, 0); finS.quadraticCurveTo(.2, .2, -.12, .55); finS.lineTo(0, 0);
      [.62, -.62].forEach(z => { const f = bordered(finS, .05, m, .03); f.g.position.set(-1.45, .9, z); g.add(f.g); });
      const ws = add(g, new T.BoxGeometry(.05, .45, 1.4), M.glass, .48, 1.12, 0, { rot: [0, 0, .5], edges: 1 }); ws.renderOrder = 8;
      rod(g, V(.72, .78, 0), V(.42, 1.02, 0), .035);
      const tilt = new T.Group(); tilt.position.set(.42, 1.02, 0); tilt.rotation.z = .55; g.add(tilt);
      const face = new T.Group(); face.rotation.y = Math.PI / 2; tilt.add(face);
      const spin = new T.Group(); face.add(spin);
      spin.add(new T.Mesh(new T.TorusGeometry(.2, .03, 8, 28), tm(0x4a4e60)));
      for (let k = 0; k < 3; k++) { const s = new T.Mesh(new T.BoxGeometry(.2, .03, .02), tm(0x9aa1b5)); s.rotation.z = Math.PI / 2 + k * Math.PI * 2 / 3; s.position.set(Math.cos(Math.PI / 2 + k * 2.094) * .1, Math.sin(Math.PI / 2 + k * 2.094) * .1, 0); spin.add(s); }
      add(spin, new T.CylinderGeometry(.05, .05, .04, 10), tm(COL.yellow), 0, 0, 0, { rot: [Math.PI / 2, 0, 0] });
      out.grips = [new T.Object3D(), new T.Object3D()]; out.grips[0].position.set(-.17, .1, 0); out.grips[1].position.set(.17, .1, 0); spin.add(out.grips[0], out.grips[1]);
      out.spin = spin;
      out.lights = [.5, -.5].map(z => glowSprite(g, 1.6, .62, z, 1.4, 0xfff6d8));
    } else {
      add(g, new T.BoxGeometry(1.45, .5, 1.36), m, -.15, 1.17, 0, { edges: 1 });
      [.69, -.69].forEach(z => add(g, new T.BoxGeometry(1.2, .32, .02), tm(0x9fb6cc), -.15, 1.2, z));
      add(g, new T.BoxGeometry(.02, .32, 1.15), tm(0x9fb6cc), .58, 1.2, 0);
    }
    shade(g); return out;
  }
  const hero = makeCar(0x7fa6cf, true); const car = hero.g; scene.add(car); car.visible = false;
  function makeAuto() {
    const g = new T.Group(); const body = tm(0x4f7a5c), top = tm(COL.yellow);
    add(g, new T.BoxGeometry(1.7, .3, 1.15), body, -.1, .45, 0, { edges: 1 });
    add(g, new T.BoxGeometry(.9, .75, 1.15), body, -.45, .95, 0, { edges: 1 });
    add(g, new T.BoxGeometry(.5, .55, .55), body, .62, .8, 0, { edges: 1 });
    add(g, new T.BoxGeometry(1.7, .1, 1.25), top, -.15, 1.65, 0, { edges: 1 });
    [.6, -.6].forEach(z => add(g, new T.BoxGeometry(.06, 1.0, .06), M.ink, .55, 1.15, z));
    add(g, new T.BoxGeometry(.05, .45, .95), M.glass, .5, 1.3, 0, { rot: [0, 0, -.12], edges: 1 });
    add(g, new T.SphereGeometry(.08, 8, 6), new T.MeshBasicMaterial({ color: 0xffffff }), .88, .85, 0, { outline: 1.2 });
    wheel(g, .75, .25, 0, .25, .14); wheel(g, -.7, .25, .55, .25, .14); wheel(g, -.7, .25, -.55, .25, .14);
    shade(g); return { g };
  }
  function makeScooter() {
    const g = new T.Group(); const m = tm(COL.navy);
    wheel(g, .55, .2, 0, .2, .1); wheel(g, -.55, .2, 0, .2, .1);
    add(g, new T.BoxGeometry(.8, .1, .3), m, 0, .35, 0, { edges: 1 });
    add(g, new T.BoxGeometry(.5, .35, .32), m, -.35, .55, 0, { edges: 1 });
    add(g, new T.BoxGeometry(.5, .1, .3), tm(0x6f7aa0), -.35, .78, 0, { edges: 1 });
    add(g, new T.BoxGeometry(.12, .7, .34), m, .45, .7, 0, { rot: [0, 0, -.25], edges: 1 });
    rod(g, V(.55, 1.05, -.3), V(.55, 1.05, .3), .025);
    [.3, -.3].forEach(z => add(g, new T.SphereGeometry(.05, 6, 5), M.white, .58, 1.2, z, { outline: 1.2 }));
    shade(g); return { g };
  }
  [[8, -14.4, 'car', 0xe9e6df, Math.PI], [31, -14.4, 'scooter', 0, Math.PI * .92], [58, -14.4, 'car', COL.navy, Math.PI], [88, -14.4, 'auto', 0, Math.PI], [104, -10.0, 'auto', 0, 0], [125, -14.4, 'car', 0x8a9a6a, Math.PI], [142, -10.1, 'scooter', 0, .1], [156, -14.4, 'scooter', 0, Math.PI]].forEach(([x, z, k, c, ry]) => {
    const v = k === 'car' ? makeCar(c, false) : k === 'auto' ? makeAuto() : makeScooter();
    v.g.position.set(x, 0, z); v.g.rotation.y = ry; city.add(v.g); parked.push({ g: v.g, kind: k, b: 0 });
  });
  // the surfboard and its wave (the fish surfs out to sea)
  const board = new T.Group(); scene.add(board);
  const deckM = add(board, new T.SphereGeometry(1, 36, 12), tm(COL.white), 0, 0, 0, { outline: [1.025, 1.4, 1.06] }); deckM.scale.set(1.3, .075, .38);
  add(board, new T.BoxGeometry(2.15, .012, .07), tm(COL.navy), 0, .072, 0);
  [.17, -.17].forEach(z => add(board, new T.BoxGeometry(1.7, .01, .035), tm(COL.yellow), -.05, .068, z));
  add(board, new T.CircleGeometry(.16, 20), tm(COL.yellow), .78, .074, 0, { rot: [-Math.PI / 2, 0, 0] });
  const finBS = new T.Shape(); finBS.moveTo(0, 0); finBS.lineTo(.32, 0); finBS.quadraticCurveTo(.05, -.1, -.06, -.34); finBS.lineTo(0, 0);
  const finB = bordered(finBS, .03, tm(COL.teal), .025); finB.g.position.set(-1.05, -.04, 0); board.add(finB.g);
  shade(board);
  const WAVE_X = 2.0;   // the board rides this far in front of the crest, clear of the curling lip
  const FALL = z => Math.exp(-Math.pow(z / 4.4, 2));
  const waveH = (x, z) => 1.75 * (x > 0 ? Math.exp(-Math.pow(x / 1.9, 2)) : Math.exp(-Math.pow(x / 3.6, 2))) * FALL(z);
  const wave = new T.Group(); scene.add(wave); wave.visible = false;
  // the face: one smooth sheet, coloured from the sea's own blue at the base to a lighter, glassy aqua at the top
  const waveGeo = new T.PlaneGeometry(13, 15, 96, 56); waveGeo.rotateX(-Math.PI / 2);
  { const wp = waveGeo.attributes.position; for (let i = 0; i < wp.count; i++) wp.setY(i, waveH(wp.getX(i), wp.getZ(i))); waveGeo.computeVertexNormals(); waveGeo.setAttribute('color', new T.Float32BufferAttribute(new Float32Array(wp.count * 3), 3)); }
  const faceMat = toon(0xffffff, { vertexColors: true }); const face = new T.Mesh(waveGeo, faceMat); face.receiveShadow = true; wave.add(face);
  // the lip: a ribbon that rises from the crest and curls forward
  const LIP = new T.CatmullRomCurve3([V(-.15, 0, 0), V(.12, .14, 0), V(.4, .2, 0), V(.64, .1, 0), V(.76, -.1, 0), V(.78, -.28, 0)]);
  const lipPts = LIP.getPoints(18), NZ = 46;
  const lipGeo = new T.BufferGeometry(); { const pos = [], col = [], idx = []; for (let k = 0; k <= NZ; k++) { const z = -4.6 + 9.2 * k / NZ, f = FALL(z); lipPts.forEach((q, u) => { pos.push(q.x * f, waveH(-.15, z) + q.y * f, z); col.push(0, 0, 0); }); } const W = lipPts.length; for (let k = 0; k < NZ; k++) for (let u = 0; u < W - 1; u++) { const a = k * W + u, b = a + 1, c = a + W, d = c + 1; idx.push(a, c, b, b, c, d); } lipGeo.setIndex(idx); lipGeo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); lipGeo.setAttribute('color', new T.Float32BufferAttribute(col, 3)); lipGeo.computeVertexNormals(); }
  const lipMesh = new T.Mesh(lipGeo, toon(0xffffff, { vertexColors: true, side: T.DoubleSide })); wave.add(lipMesh);
  { const tip = []; for (let z = -4.2; z <= 4.2; z += .3) { const f = FALL(z), q = lipPts[lipPts.length - 1]; tip.push(V(q.x * f, waveH(-.15, z) + q.y * f, z)); } wave.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(tip), 60, .06, 6), M.white)); }
  { const crest = []; for (let z = -4.4; z <= 4.4; z += .3) { const f = FALL(z), q = lipPts[9]; crest.push(V(q.x * f, waveH(-.15, z) + q.y * f + .02, z)); } wave.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(crest), 60, .035, 5), M.white)); }
  let waveCol = -1; const _wc = new T.Color(), _wl = new T.Color(), _aq = new T.Color(0xcfeff0);
  function tintWave(sea) {   // recolour only when the sea colour changes (time of day)
    const hx = sea.getHex(); if (hx === waveCol) return; waveCol = hx;
    _wl.copy(sea).lerp(_aq, .5);
    const fc = waveGeo.attributes.color, fp = waveGeo.attributes.position; for (let i = 0; i < fc.count; i++) { const h = fp.getY(i) / 1.75; _wc.copy(sea).lerp(_wl, Math.pow(h, 1.3)); fc.setXYZ(i, _wc.r, _wc.g, _wc.b); } fc.needsUpdate = true;
    const lc = lipGeo.attributes.color, W = lipPts.length; for (let i = 0; i < lc.count; i++) { const u = (i % W) / (W - 1); _wc.copy(_wl).lerp(_tc.set(0xffffff), u * u * .7); lc.setXYZ(i, _wc.r, _wc.g, _wc.b); } lc.needsUpdate = true;
  }
  // ripples on the sea around the surf, and a few fish that leap out of the wave (away from the surfer)
  const ripples = []; for (let k = 0; k < 6; k++) { const m = new T.Mesh(new T.RingGeometry(.94, 1, 48), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.scale.set(1.6, 1, 1); scene.add(m); ripples.push({ m, u: k / 6, x: 0, z: 0 }); }
  const leapers = [[0, -2.9], [.4, 3.1], [.75, -3.6]].map(([ph, z], k) => { const g = new T.Group(); const c = [COL.white, COL.skyb, COL.butter][k]; add(g, new T.SphereGeometry(.13, 10, 8), tm(c), 0, 0, 0, { outline: 1.15 }).scale.set(1.5, .8, .7); add(g, new T.ConeGeometry(.09, .18, 4), tm(c), -.24, 0, 0, { rot: [0, 0, Math.PI / 2], outline: 1.15 }); wave.add(g); return { g, ph, z }; });

  /* ---------------- work bubbles, floating over the road ---------------- */
  const workBubbles = [];
  function buildIcon(id, g) {
    if (id === 'flock') { for (let k = -1; k <= 1; k++) { const r = new T.Group(); r.position.set(k * .9, -.9, k === 0 ? .3 : -.2); g.add(r); add(r, new T.CylinderGeometry(.35, .35, .2, 8), M.ink, 0, 0, 0); add(r, new T.CylinderGeometry(.03, .03, .9, 6), M.ink, 0, .5, 0); const head = add(r, new T.SphereGeometry(.26, 16, 12), M.white, 0, 1.05, 0, { outline: 1.12 }); const s2 = new T.Mesh(new T.TorusGeometry(.12, .025, 6, 12, Math.PI), M.ink); s2.rotation.z = Math.PI; s2.position.set(0, -.02, .24); head.add(s2); } }
    else if (id === 'ruhi') { add(g, new T.BoxGeometry(2, .5, 1.3), M.white, 0, -.4, 0, { edges: 1 }); for (let k = -2; k <= 2; k++) add(g, new T.BoxGeometry(.12, .52, 1.32), tm(COL.lav), k * .35, -.4, 0); add(g, new T.BoxGeometry(1.8, .4, 1.2), tm(COL.rose), .05, .05, .05, { edges: 1 }); for (let k = 1; k <= 3; k++) { const a = new T.Mesh(new T.TorusGeometry(.2 * k, .025, 6, 20, Math.PI * .6), M.ink); a.position.set(.2, .6, 0); a.rotation.z = Math.PI * .2; g.add(a); } }
    else if (id === 'ennore') { add(g, new T.CylinderGeometry(.6, .45, .9, 16, 1, true), M.white, 0, -.4, 0, { outline: 1.05 }); add(g, new T.CircleGeometry(.56, 16), M.ink, 0, -.02, 0, { rot: [-Math.PI / 2, 0, 0] }); const hd = new T.Mesh(new T.TorusGeometry(.6, .03, 6, 20, Math.PI), M.ink); hd.position.y = .05; g.add(hd); for (let k = 0; k < 4; k++) add(g, new T.SphereGeometry(.08, 8, 6), M.ink, -.2 + k * .15, -1.1 - (k % 2) * .2, .1); }
    else if (id === 'kottakkal') { add(g, new T.CylinderGeometry(.5, .5, .95, 16), tm(COL.mint), 0, -.35, 0, { outline: 1.06 }); add(g, new T.CylinderGeometry(.53, .53, .25, 16), tm(GREENS[3]), 0, .26, 0); add(g, new T.BoxGeometry(.75, .4, .02), M.white, 0, -.35, .5); const lf = new T.Shape(); lf.moveTo(0, 0); lf.quadraticCurveTo(.4, .3, .8, 0); lf.quadraticCurveTo(.4, -.3, 0, 0); const leaf = inked(flat(lf, .02), tm(GREENS[0])); leaf.position.set(.1, .45, 0); leaf.rotation.z = .6; g.add(leaf); }
    else { add(g, new T.BoxGeometry(.3, 1.4, .3), M.white, -.6, -.4, 0, { edges: 1 }); add(g, new T.BoxGeometry(.3, 1.4, .3), M.white, .6, -.4, 0, { edges: 1 }); const ar = new T.Mesh(new T.TorusGeometry(.6, .15, 8, 20, Math.PI), M.white); ar.position.y = .3; const hh = new T.Mesh(ar.geometry, inkBack); hh.scale.setScalar(1.06); ar.add(hh); g.add(ar); add(g, new T.BoxGeometry(1.9, .14, .5), M.ink, 0, -1.15, 0); }
  }

  /* ---------------- life: birds, butterflies, ladybirds ---------------- */
  const life = new T.Group(); scene.add(life);
  const birdMat = new T.MeshBasicMaterial({ color: 0x565b75, side: T.DoubleSide });
  const wingGeoB = new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute([-.16, 0, 0, .14, 0, 0, -.06, 0, .55], 3));
  const birds = [];
  [[0, 11, -21, 9, 4], [26, 12, -24, 12, 4], [70, 13, -24, 13, 3], [110, 11, -22, 10, 3], [150, 12, -24, 12, 4], [178, 10, -18, 8, 3]].forEach(([cx, cy, cz, r, n], f) => {
    for (let i = 0; i < n; i++) {
      const g = new T.Group(); life.add(g);
      add(g, new T.SphereGeometry(.09, 8, 6), birdMat, 0, 0, 0).scale.set(2.2, .8, .8);
      const wl = new T.Mesh(wingGeoB, birdMat), wr = new T.Mesh(wingGeoB, birdMat); wr.scale.z = -1; g.add(wl, wr);
      birds.push({ g, wl, wr, cx, cy, cz, r: r * (.8 + rnd() * .4), a: rnd() * 6.28, sp: (.18 + rnd() * .1) * (f % 2 ? -1 : 1), y: (rnd() - .5) * 2, ph: rnd() * 6, flee: V(0, 0, 0), fv: V(0, 0, 0) });
    }
  });
  const bflyWing = (() => { const s = new T.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(.12, .22, .02, .26); s.quadraticCurveTo(-.06, .16, 0, 0); return new T.ShapeGeometry(s); })();
  const bflies = [];
  for (let i = 0; i < 16; i++) {
    const m = new T.MeshBasicMaterial({ color: pick([0xffffff, 0xf9e39a, 0x9fc3ec, 0xf2cf4a, 0xffffff]), side: T.DoubleSide });
    const g = new T.Group(); life.add(g);
    const wl = new T.Mesh(bflyWing, m), wr = new T.Mesh(bflyWing, m); wr.scale.x = -1; g.add(wl, wr); add(g, new T.CylinderGeometry(.012, .012, .2, 4), M.ink, 0, .1, 0);
    const far = rnd() < .5;
    bflies.push({ g, wl, wr, ax: -20 + rnd() * 190, az: far ? -17.4 + (rnd() - .5) * 2 : -6.5 + (rnd() - .5) * 1.5, ay: .7 + rnd() * 1.2, ph: rnd() * 30, sp: .6 + rnd() * .6, flee: 0 });
  }
  const bugs = [];
  for (let i = 0; i < 2; i++) {
    const g = new T.Group(); life.add(g);
    const sh = add(g, new T.SphereGeometry(.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), tm(COL.coral), 0, 0, 0, { outline: 1.15 }); sh.scale.set(1.2, .8, 1);
    add(g, new T.SphereGeometry(.045, 8, 6), M.ink, .1, .02, 0);
    [[.0, .05, .04], [-.04, .05, -.04], [.04, .04, -.03]].forEach(([x, y, z]) => add(g, new T.SphereGeometry(.018, 5, 4), M.ink, x, y, z));
    g.scale.setScalar(.7); bugs.push({ g, x: 3 + i * 9, z: -8.6 - i * .4, y: .2, a: rnd() * 6.28, sp: .08 + rnd() * .05, x0: 3 + i * 9 });
  }

  /* ---------------- particles ---------------- */
  const bubTex = canvasTex(64, 64, (g) => { g.strokeStyle = '#5b8fd9'; g.lineWidth = 4; g.beginPath(); g.arc(32, 32, 26, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(23, 22, 7, 0, 7); g.fill(); });
  const dotTex = canvasTex(64, 64, (g) => { g.fillStyle = '#fff'; g.strokeStyle = '#2b3240'; g.lineWidth = 5; g.beginPath(); g.arc(32, 32, 24, 0, 7); g.fill(); g.stroke(); });
  const sparkTex = canvasTex(64, 64, (g) => { g.fillStyle = '#fff6c8'; g.strokeStyle = '#2b3240'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 9 : 28, a = i / 8 * Math.PI * 2 - Math.PI / 2; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); });
  const parts = [];
  function emit(tex, pos, vel, life, size, grav = 0, grow = 0) { const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); s.position.copy(pos); s.scale.setScalar(size); scene.add(s); parts.push({ s, vel, life, max: life, grav, size, grow }); }
  function burst(tex, pos, n, spread, up, size, grav) { for (let i = 0; i < n; i++) emit(tex, pos.clone().add(V((rnd() - .5) * spread, (rnd() - .5) * spread * .5, (rnd() - .5) * spread)), V((rnd() - .5) * spread * 3, up * (.6 + rnd() * .8), (rnd() - .5) * spread * 2), .8 + rnd() * .7, size * (.5 + rnd() * .8), grav); }

  /* =====================================================================
     THE STORY: where everything is at every p
     ===================================================================== */
  const P = { jump0: .05, land: .11, hop1: .262, carGo: .278, drift: .49, park: .505, walk: .511, hop2: .527, sail: .535, leap: .585, dive: .615, fly: .84, suit: .862 };
  const WORKP = [.15, .21, .33, .39, .45];
  const BOWL = BC.clone().add(V(0, -.08, 0));
  const LANE_B = -10.8, LANE_C = -12.6, BIKE_Y = 1.3, WALK_Y = DECK + 1.0;
  const JUMP = [BOWL, V(.3, 7.95, -5.6), V(.6, BIKE_Y, LANE_B)];
  const BIKE_K = [[P.land, .6], [WORKP[0], 22], [WORKP[1], 44], [.26, 64]];
  const CAR_X0 = 67.2, CAR_K = [[P.carGo, CAR_X0], [WORKP[2], 94], [WORKP[3], 121], [WORKP[4], 148], [P.park, ROAD_END + .6]];
  const BOAT_X0 = JX1 + 1.8, BOAT_X1 = JX1 + 35, ENTRY = V(170 + SX, -4.5, -12);
  const qb = (a, b, c, t) => V(lerp(lerp(a.x, b.x, t), lerp(b.x, c.x, t), t), lerp(lerp(a.y, b.y, t), lerp(b.y, c.y, t), t), lerp(lerp(a.z, b.z, t), lerp(b.z, c.z, t), t));
  const hop = (a, c, k, h = 1.4) => qb(a, V((a.x + c.x) / 2, Math.max(a.y, c.y) + h, (a.z + c.z) / 2), c, k);
  const kk = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  // knots: travel between stops with ease-in and ease-out, so the ride stops at each project
  function knots(K, p) { if (p <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (p <= K[i + 1][0]) { const t = kk(p, K[i][0], K[i + 1][0]); return lerp(K[i][1], K[i + 1][1], t * t * (3 - 2 * t)); } return K[K.length - 1][1]; }
  function bikeX(p) { if (p < P.land) return lerp(-17, .6, eOut(kk(p, .07, P.land))); return knots(BIKE_K, p); }
  function carState(p) {
    let x, z = LANE_C, yaw = 0;
    if (p < .258) x = lerp(30, CAR_X0, 1 - Math.pow(1 - kk(p, .232, .258), 3));
    else x = knots(CAR_K, p);
    const wv = sm(P.carGo, P.carGo + .02, p) * (1 - sm(P.drift - .01, P.drift, p));
    z += Math.sin((x - CAR_X0) * .16) * .35 * wv; yaw = -Math.atan(Math.cos((x - CAR_X0) * .16) * .16 * .35 * wv);
    const d = sm(P.drift, P.park - .004, p); yaw += 1.15 * d - .12 * sm(P.park - .006, P.park + .004, p); z += .45 * d;
    return { x, z, yaw };
  }
  const SEAT = V(-.32, 1.12, 0);
  function seatAt(p, out = V(0, 0, 0)) { const c = carState(p); const cs = Math.cos(c.yaw), sn = Math.sin(c.yaw); return out.set(c.x + cs * SEAT.x, SEAT.y, c.z - sn * SEAT.x); }
  function boatX(p) { if (p < P.sail) return BOAT_X0; if (p < P.leap) return lerp(BOAT_X0, BOAT_X1, easeIO(kk(p, P.sail, P.leap))); return BOAT_X1 + (p - P.leap) * 20; }
  const waveAmp = p => sm(P.hop2 - .006, P.sail, p) * (1 - sm(P.leap + .004, P.leap + .03, p));
  const SURF_H = waveH(WAVE_X, 0);
  const boatY = (t, p = st.p) => .05 + SURF_H * waveAmp(p) + Math.sin(t * 1.1) * .015;
  const carve = p => Math.sin(kk(p, P.sail, P.leap) * Math.PI * 2) * .9 * waveAmp(p);   // gentle S-turns across the wave, driven by the scroll
  const BSEAT = V(-.05, 1.06, 0);   // standing on the board
  const boatSeat = (p, t) => V(boatX(p) + BSEAT.x, boatY(t, p) + BSEAT.y, LANE_C + carve(p));
  // the sea path (old timing .42–.84 squeezed into .615–.84, moved along by SX)
  const seaP = q => q <= .84 ? P.dive + (q - .42) * (.84 - P.dive) / .42 : q;
  const SW = [[.42, 170, -4.5, -12], [.435, 175, -6, -12], [.66, 260, -6.4, -12], [.695, 278, -16, -12], [.72, 291, -21.5, -12], [.745, 300, -22.5, -12],
    [.775, 307, -20, -12], [.81, 316, -9, -12], [.84, 326, .6, -12], [.855, 329, 6, -11], [.87, 332, 14, -9], [.95, 336, 40, -2]].map(k => [seaP(k[0]), k[1] + SX, k[2], k[3]]);
  function cr(keys, p, out) {
    let i = 0; while (i < keys.length - 2 && p > keys[i + 1][0]) i++;
    const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)];
    const t = clamp((p - k1[0]) / (k2[0] - k1[0]), 0, 1), t2 = t * t, t3 = t2 * t;
    const c = (j) => .5 * (2 * k1[j] + (-k0[j] + k2[j]) * t + (2 * k0[j] - 5 * k1[j] + 4 * k2[j] - k3[j]) * t2 + (-k0[j] + 3 * k1[j] - 3 * k2[j] + k3[j]) * t3);
    return out.set(c(1), c(2), c(3));
  }
  function fishAt(p, t, still = false) {
    if (p < P.jump0) { const w = 1 - sm(.03, P.jump0, p); return BOWL.clone().add(V(Math.sin(t * .9) * .2 * w, Math.sin(t * 1.4) * .05 * w, Math.cos(t * .7) * .12 * w)); }
    if (p < P.land) { const k = (p - P.jump0) / (P.land - P.jump0); return qb(JUMP[0], JUMP[1], JUMP[2], k * k * (1.6 - .6 * k)); }
    if (p < P.hop1) { const x = bikeX(p); return V(x, BIKE_Y, LANE_B); }
    if (p < P.carGo - .003) return hop(V(bikeX(P.hop1), BIKE_Y, LANE_B), seatAt(P.carGo), eOut(kk(p, P.hop1, P.carGo - .003)), 1.3);
    if (p < P.park) return seatAt(p);
    if (p < P.walk) return hop(seatAt(P.park), V(JX0 + 1.2, WALK_Y, JZ), kk(p, P.park, P.walk), 1.2);
    if (p < P.hop2) { const x = lerp(JX0 + 1.2, JX1 - .6, kk(p, P.walk, P.hop2)); return V(x, WALK_Y + Math.abs(Math.sin(x * 3.2)) * .05, JZ); }
    if (p < P.sail) return hop(V(JX1 - .6, WALK_Y, JZ), boatSeat(P.sail, t), kk(p, P.hop2, P.sail), 1);
    if (p < P.leap) return boatSeat(p, t);
    if (p < P.dive) return qb(boatSeat(P.leap, t), V(ENTRY.x - 4.5, 4.8, -12.3), ENTRY, kk(p, P.leap, P.dive));
    const o = cr(SW, p, V(0, 0, 0));
    const a = seaP(.435), b = seaP(.66);
    if (p > a && p < b && !still) o.y += Math.sin((o.x - 175 - SX) * .2) * .45 * sm(a, a + .012, p) * (1 - sm(b - .01, b, p));
    return o;
  }
  // work bubbles: one over the road at each stop, a little ahead of where the rider stops
  const resF = q => (CT.__files && CT.__files[q]) || q;
  // a project picture becomes a round duotone badge (navy shadows, warm paper highlights) so every image fits the film
  function badgeTexture(src, mode, cb) {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => { const S = 320, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); const k = Math.max(S / img.width, S / img.height); g.drawImage(img, (S - img.width * k) / 2, (S - img.height * k) / 2, img.width * k, img.height * k);
      if (mode !== 'none') { const d = g.getImageData(0, 0, S, S), a = d.data, lo = [43, 58, 92], hi = [248, 240, 222]; for (let q = 0; q < a.length; q += 4) { let l = (a[q] * .3 + a[q + 1] * .59 + a[q + 2] * .11) / 255; l = Math.min(1, Math.max(0, (l - .06) * 1.18)); l = l * l * (3 - 2 * l); for (let j = 0; j < 3; j++) a[q + j] = lo[j] + (hi[j] - lo[j]) * l; } g.putImageData(d, 0, 0); }
      g.globalCompositeOperation = 'destination-in'; g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 2, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over';
      g.lineWidth = 10; g.strokeStyle = '#2b3240'; g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 6, 0, 7); g.stroke(); g.lineWidth = 5; g.strokeStyle = '#f7c443'; g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 15, 0, 7); g.stroke();
      const tx = new T.CanvasTexture(c); cb(tx); };
    img.src = src;
  }
  function drawLabel(sp, text) { const c = document.createElement('canvas'), g = c.getContext('2d'), f = '500 40px "IBM Plex Mono", "JetBrains Mono", monospace'; g.font = f; const w = Math.ceil(g.measureText(text).width) + 44; c.width = w; c.height = 70; g.font = f; g.fillStyle = '#2b3240'; g.fillRect(0, 0, w, 70); g.fillStyle = '#f7c443'; g.fillRect(0, 64, w, 6); g.fillStyle = '#f6f3ec'; g.textBaseline = 'middle'; g.fillText(text, 22, 34); if (sp.material.map) sp.material.map.dispose(); sp.material.map = new T.CanvasTexture(c); sp.material.needsUpdate = true; sp.scale.set(w / 70 * .4, .4, 1); }
  (CT.projects || []).slice(0, 5).forEach((pr, i) => {
    const f = fishAt(WORKP[i], 0); const g = new T.Group(); g.position.set(f.x + 3, 3.7, f.z); city.add(g);
    const s = new T.Mesh(new T.SphereGeometry(1.45, 40, 28), glassMat(1.3)); s.renderOrder = 9; g.add(s);
    const ring = new T.Group(); g.add(ring);   // faces the camera: a clean ink outline, a highlight, a tiny shine
    ring.add(new T.Mesh(new T.RingGeometry(1.45, 1.5, 72), new T.MeshBasicMaterial({ color: COL.ink, transparent: true, opacity: .85, depthWrite: false })));
    const shine = new T.Mesh(new T.RingGeometry(1.2, 1.28, 40, 1, Math.PI * .58, Math.PI * .3), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, depthWrite: false })); ring.add(shine);
    add(ring, new T.CircleGeometry(.09, 12), new T.MeshBasicMaterial({ color: 0xffffff }), -.62, .88, .01);
    const icon = new T.Group(); icon.scale.setScalar(.6); g.add(icon);
    const pic = pr.iconImg && pr.iconImg.src;
    if (pic) { const disc = new T.Mesh(new T.CircleGeometry(1.05, 48), new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); disc.renderOrder = 8; g.add(disc); badgeTexture(resF(pic), pr.iconFilter || 'duotone', tx => { disc.material.map = tx; disc.material.opacity = 1; disc.material.needsUpdate = true; }); icon.userData.disc = disc; }
    else buildIcon(pr.id, icon);
    const label = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthWrite: false })); label.position.y = -1.98; g.add(label); const lt = `${String(i + 1).padStart(2, '0')}  ${pr.title || ''}`; drawLabel(label, lt);
    if (document.fonts) document.fonts.ready.then(() => drawLabel(label, lt));
    const shadow = new T.Mesh(new T.CircleGeometry(1, 24), new T.MeshBasicMaterial({ color: COL.ink, transparent: true, opacity: .1, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.set(f.x + 3, .08, f.z); city.add(shadow);
    workBubbles.push({ g, icon, ring, y: 3.7, ph: i * 1.3, shadow, i });
  });

  /* ---------------- flowers: build the instanced meshes ---------------- */
  {
    const petal = new T.SphereGeometry(.055, 6, 4), centre = new T.SphereGeometry(.035, 6, 4);
    const pm = new T.InstancedMesh(petal, new T.MeshToonMaterial({ color: 0xffffff, gradientMap: grad }), FL.length * 5);
    const cm = new T.InstancedMesh(centre, new T.MeshToonMaterial({ color: 0xfde27a, gradientMap: grad }), FL.length);
    const o = new T.Object3D(); let n = 0;
    FL.forEach(([x, y, z, c, s], i) => { _c.set(c); const tw = rnd() * 6.28; for (let k = 0; k < 5; k++) { const a = tw + k / 5 * Math.PI * 2; o.position.set(x + Math.cos(a) * .055 * s, y, z + Math.sin(a) * .055 * s); o.scale.set(s, s * .6, s); o.updateMatrix(); pm.setMatrixAt(n, o.matrix); pm.setColorAt(n++, _c); } o.position.set(x, y + .02 * s, z); o.scale.setScalar(s); o.updateMatrix(); cm.setMatrixAt(i, o.matrix); });
    pm.instanceMatrix.needsUpdate = cm.instanceMatrix.needsUpdate = true; if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
    city.add(pm, cm);
  }
  shade(city);
  city.traverse(o => { if (o.isInstancedMesh) o.castShadow = false; });

  /* camera: absolute rails in the room, fish-relative on land and at sea, then a long pull back */
  const RIDE_B = [-1.6, 1.3, 7.6, 2.2, .5, 0], STOP = [-1.1, 1.7, 9.2, .1, 1.3, 0], RIDE_C = [-3, 1.8, 9.2, 3.2, .4, 0], STOP_C = [-1.1, 1.9, 9.6, .1, 1.4, 0], FRONT = [3.6, 1.5, 4.2, -.8, .3, 0];
  const REL = [[.11, 1.2, 1.5, 7.2, 1.0, .2, 0], [.122, ...RIDE_B], [.142, ...STOP], [.158, ...STOP], [.17, ...RIDE_B], [.19, ...RIDE_B], [.202, ...STOP], [.218, ...STOP], [.23, ...RIDE_B], [.25, ...RIDE_B],
    [.264, -2.6, 2.1, 8.6, 1.4, .3, -.9], [.282, ...RIDE_C], [.3, ...RIDE_C], [.322, ...STOP_C], [.338, ...STOP_C], [.352, ...FRONT], [.37, ...FRONT], [.382, ...STOP_C], [.398, ...STOP_C], [.412, ...RIDE_C], [.43, ...RIDE_C], [.442, ...STOP_C], [.458, ...STOP_C], [.47, ...RIDE_C],
    [.486, -3.2, 2.8, 10.5, 3.2, .2, 0], [.502, -4.8, 4.2, 11.5, 2.6, -.2, 0], [.515, -3, 2.4, 9.5, 2.4, .1, 0], [.538, -2.6, 2.2, 9.2, 2.6, .2, 0], [.578, -2.6, 2.4, 9.2, 2.6, .2, 0], [.598, -3, 2.8, 9.5, 3, -1, 0],
    ...[[.425, .4, .6, 9.4, -1.8, -.3, 0], [.66, .4, .6, 9.4, -1.8, -.3, 0], [.695, 1, 2.6, 10, -1, -2.5, 0], [.72, 1.4, 1.2, 8.6, -1.5, -.8, 0], [.745, -1, 1.4, 9, 1.4, 0, 0], [.81, -2, -.6, 9, 1.4, 2.6, 0], [.84, -1.5, .4, 8.5, .5, 2, 0]].map(k => [seaP(k[0]), ...k.slice(1)]),
    [.845, -1.2, .8, 8.2, .5, 2, 0]];
  const KO = REL.map(r => [r[0], r[1], r[2], r[3]]), KL = REL.map(r => [r[0], r[4], r[5], r[6]]);
  const relOff = (p, o, l) => { const q = clamp(p, REL[0][0], REL[REL.length - 1][0]); cr(KO, q, o); cr(KL, q, l); };
  const ABS = [[0, -.35, 6.26, 1.7, -.75, 5.81, -3], [.03, -.1, 6.11, .7, -.2, 5.71, -3], [.05, .1, 6.36, .2, .2, 5.96, -3.5], [.075, .4, 7.3, -1.6, .4, 5.2, -8], [.09, .55, 6.4, -3.15, .6, 3.2, -10], [.1, .9, 4.4, -4.6, .9, 2.2, -10.8]];
  const _o = V(0, 0, 0), _l = V(0, 0, 0);
  const PB0 = .845, PB1 = .87, C1 = V(316 + SX, 95, 150), L1v = V(252 + SX, 0, -14);
  let camFlip = 1;
  function camAt(p, t, pos, look) {
    if (p <= P.land) {
      const f = fishAt(P.land, t); relOff(P.land, _o, _l);
      const keysP = ABS.map(k => [k[0], k[1], k[2], k[3]]).concat([[P.land, f.x + _o.x, f.y + _o.y, f.z + _o.z]]);
      const keysL = ABS.map(k => [k[0], k[4], k[5], k[6]]).concat([[P.land, f.x + _l.x, f.y + _l.y, f.z + _l.z]]);
      cr(keysP, p, pos); cr(keysL, p, look);
      if (p > P.jump0) look.lerp(fishAt(p, t), sm(P.jump0, P.jump0 + .015, p) * (1 - sm(P.land - .02, P.land, p)) * .8);
      return;
    }
    if (p <= PB0) { const f = fishAt(p, t, true); if (p > P.hop1 && p < P.sail) f.y = lerp(f.y, p < P.park ? 1.2 : WALK_Y, .7); else if (p >= P.sail && p < P.leap) { f.y = boatY(0, p) + BSEAT.y; f.z = LANE_C + carve(p) * .5; } relOff(p, _o, _l); _l.x *= camFlip; _o.x = lerp(_o.x, -_o.x * .5, (1 - camFlip) / 2); pos.copy(f).add(_o); look.copy(f).add(_l); return; }
    const f0 = fishAt(PB0, t); relOff(PB0, _o, _l); const c0 = f0.clone().add(_o), l0 = f0.clone().add(_l);
    if (p <= PB1) { const s0 = sm(PB0, PB1, p), s = s0 * s0; pos.lerpVectors(c0, C1, s); look.lerpVectors(l0, L1v, s0); return; }
    const d1 = C1.clone().sub(PC), dist1 = d1.length(); d1.normalize();
    const dir = d1.clone().lerp(V(-.12, .74, .66).normalize(), sm(PB1, .95, p)).normalize();
    const dist = Math.exp(lerp(Math.log(dist1), Math.log(1750), sm(PB1, .95, p)) + Math.log(3000 / 1750) * sm(.95, 1, p));
    pos.copy(PC).addScaledVector(dir, dist);
    look.lerpVectors(L1v, PC, sm(PB1, .91, p));
  }

  /* ---------------- orientation ---------------- */
  const _m = new T.Matrix4(), _x = V(0, 0, 0), _y = V(0, 0, 0), _z = V(0, 0, 0);
  function orient(obj, dir, up = V(0, 1, 0)) { _x.copy(dir).normalize(); _z.crossVectors(_x, up); if (_z.lengthSq() < 1e-6) _z.set(0, 0, 1); _z.normalize(); _y.crossVectors(_z, _x).normalize(); _m.makeBasis(_x, _y, _z); obj.quaternion.setFromRotationMatrix(_m); }
  let turn = 0, facing = 1;
  const turnDir = d => { const c = Math.cos(turn), s = Math.sin(turn); return V(d.x * c + d.z * s, d.y * c, -d.x * s + d.z * c); };

  /* =====================================================================
     THE STORY'S TEXT: captions and stops
     ===================================================================== */
  const projects = CT.projects || [];
  const ABOUT0 = .9, ABOUT1 = .972;
  const RES = p => (CT.__files && CT.__files[p]) || p;   // the editor's preview passes not-yet-pushed files here
  const H = CT.home || {};
  const workStops = WORKP.slice(0, projects.length).map((p, i) => ({ id: 'work' + i, p, kind: 'work', i }));
  const solveX = (x) => { let a = P.dive + .005, b = seaP(.69); for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (fishAt(m, 0).x < x) a = m; else b = m; } return (a + b) / 2; };
  const EXP_P = solveX(EXX[2] + SX + 6.5);
  const STOPS = [{ id: 'title', p: 0, kind: 'title' }, ...workStops, { id: 'exploration', p: EXP_P, kind: 'exploration' }, { id: 'about', p: ABOUT0, kind: 'about' }, { id: 'contact', p: 1, kind: 'contact' }];
  const CAPS = [
    [.012, .048, 'One day, the bowl felt small.'], [.052, .1, 'So I jumped, and grew legs on the way down.'],
    [.113, .144, 'Outside: a city, a road, and work to do.'],
    [.158, .204, 'I explore the human side of AI and emotions.'], [.218, .256, 'Robots, agents, objects that answer back.'],
    [.266, .296, 'Then a car pulled up. Legs out, hands in.'], [.3, .324, 'Faster.'],
    [.338, .384, 'Every project is a road to the same question:'], [.398, .444, 'what happens when people feel something for a machine?'],
    [.458, .488, 'The road ran into the sea.'], [.508, .532, 'So I walked.'], [.538, .58, 'Then I caught a wave.'], [.588, .612, 'And jumped again.'],
    [.618, EXP_P - .006, 'In the ocean, I play. Small experiments, watched closely.'],
    [EXP_P + .006, .76, 'Deeper.'], [.77, .80, 'Then I looked up.'], [.805, .838, 'And kept going.'],
    [.85, .905, 'The ocean was never the edge. It was the world.'], [.93, .99, 'Every interface is a bowl, and someone lives inside it.']];

  // caption words can be edited (content.js → captions, in order)
  (CT.captions || []).forEach((txt, i) => { if (CAPS[i] && typeof txt === 'string' && txt.trim()) CAPS[i][2] = txt; });

  /* =====================================================================
     DRIVER: scroll and the header move p
     ===================================================================== */
  const st = { p: 0, target: 0, lastIn: 0, tween: null, prevP: 0 };
  const clampP = v => clamp(v, 0, 1);
  function flyTo(p) { const d = Math.abs(p - st.p); st.tween = { from: st.p, to: p, t: 0, dur: clamp(d * 13, .55, 4.5) }; }
  // far jumps are a cut, not a rewind: a bubble wipe hides the jump
  let cutting = false;
  function cutTo(p) {
    if (Math.abs(p - st.p) < .06) return flyTo(p);
    if (cutting) return; cutting = true; const c = document.getElementById('cut'); if (!c) { st.p = st.target = st.prevP = p; cutting = false; return; }
    c.classList.add('on'); Sound.bubbles(10, .5, .6);
    setTimeout(() => { st.tween = null; st.p = st.target = st.prevP = p; facing = 1; turn = 0; lastBX = lastCX = null; camSnap = true; setTimeout(() => { c.classList.remove('on'); cutting = false; }, 50); }, 230);
  }
  addEventListener('wheel', e => { if (panelOpen) return; e.preventDefault(); const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX; st.target = clampP(st.target + d * (e.deltaMode === 1 ? 30 : 1) * .00004); st.tween = null; st.lastIn = performance.now(); Sound.init(); }, { passive: false });
  let ty = null; canvas.addEventListener('touchstart', e => { ty = e.touches[0].clientY; Sound.init(); }, { passive: true });
  canvas.addEventListener('touchmove', e => { if (ty == null) return; const y = e.touches[0].clientY; st.target = clampP(st.target + (ty - y) * .00012); ty = y; st.tween = null; st.lastIn = performance.now(); }, { passive: true });
  addEventListener('keydown', e => {
    if (viewerMax) { if (e.key === 'Escape') { setMax(null); e.preventDefault(); } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { viewerMax.step(e.key === 'ArrowRight' ? 1 : -1); e.preventDefault(); } return; }
    if (panelOpen) { if (e.key === 'Escape') closePanel(); else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && viewers[0]) { viewers[0].step(e.key === 'ArrowRight' ? 1 : -1); e.preventDefault(); } return; }
    const nx = ['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key), pv = ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key); if (!nx && !pv) return; e.preventDefault(); Sound.init();
    const s = nx ? STOPS.find(s => s.p > st.p + .003) : [...STOPS].reverse().find(s => s.p < st.p - .003); if (s) cutTo(s.p);
  });

  /* ---------------- sound ---------------- */
  const Sound = (() => {
    /* Sound effects + a small 1950s cool-jazz combo, played live (nothing recorded, nothing licensed):
       walking upright bass, brushes and a ride cymbal, Rhodes-style comping and a vibraphone that improvises.
       Under water the band goes muffled; in space it thins out and floats. */
    let ac = null, master, sfx, band, drumBus, lp, wet, musicBus, vibeBus, on = true, musicOn = true, scene = 'land', duckTo = 1, noiseBuf = null, timer = null;
    try { const mv = localStorage.getItem('fish-music'); if (mv === 'off' || (!mv && (CT.site || {}).musicDefault === 'off')) musicOn = false; } catch (e) { }
    const S = {};
    const now = () => ac ? ac.currentTime : 0;
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    function impulse(sec) { const n = ac.sampleRate * sec, b = ac.createBuffer(2, n, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); } return b; }
    S.init = () => {
      if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
      try { const AC = window.AudioContext || window.webkitAudioContext; try { ac = new AC({ latencyHint: 'playback' }); } catch (e) { ac = new AC(); } } catch (e) { return; }
      const limiter = ac.createDynamicsCompressor(); limiter.threshold.value = -10; limiter.knee.value = 6; limiter.ratio.value = 8; limiter.attack.value = .003; limiter.release.value = .2; limiter.connect(ac.destination);
      master = ac.createGain(); master.gain.value = on ? .85 : 0; master.connect(limiter);
      sfx = ac.createGain(); sfx.gain.value = 1; sfx.connect(master);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); { const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      // the band: instruments → (drums) → vintage filter → dry + room → music level
      musicBus = ac.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
      band = ac.createGain(); drumBus = ac.createGain(); drumBus.gain.value = 1; drumBus.connect(band);
      const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 45;
      lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200; lp.Q.value = .4;
      wet = ac.createGain(); wet.gain.value = .2; const rf = ac.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 2400;
      [[.067, .32], [.113, .28]].forEach(([dt, fb]) => { const d = ac.createDelay(1), g = ac.createGain(); d.delayTime.value = dt; g.gain.value = fb; rf.connect(d); d.connect(g); g.connect(d); d.connect(wet); });
      band.connect(hp); hp.connect(lp); lp.connect(musicBus); lp.connect(rf); wet.connect(musicBus);
      // vibes share one tremolo (one LFO for the whole instrument, not one per note)
      vibeBus = ac.createGain(); vibeBus.gain.value = .75; const vl = ac.createOscillator(), vlg = ac.createGain(); vl.frequency.value = 5.2; vlg.gain.value = .22; vl.connect(vlg); vlg.connect(vibeBus.gain); vl.start(); vibeBus.connect(band);
      if (musicOn) startBand();
    };
    // ---------- instruments ----------
    function env(g, t, a, peak, d) { g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
    function bass(m, t, len) { const o = ac.createOscillator(), o2 = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = o2.frequency.value = mtof(m); f.type = 'lowpass'; f.frequency.setValueAtTime(1400, t); f.frequency.exponentialRampToValueAtTime(380, t + .18); env(g, t, .008, .34, len * 1.05); o.connect(f); o2.connect(f); f.connect(g); g.connect(band); o.start(t); o2.start(t); o.stop(t + len + .2); o2.stop(t + len + .2); }
    function noiseHit(t, type, freq, q, peak, dec, bus = drumBus) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q; env(g, t, .003, peak, dec); s.connect(f); f.connect(g); g.connect(bus); s.start(t, Math.random() * .5); s.stop(t + dec + .05); }
    function ride(t, acc) { noiseHit(t, 'bandpass', 7600, 1.4, .055 * acc, .38); }
    const hat = t => noiseHit(t, 'highpass', 8200, .7, .045, .05);
    const brush = (t, v = 1) => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = .5; g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.045 * v, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + .26); s.connect(f); f.connect(g); g.connect(drumBus); s.start(t, Math.random() * .5); s.stop(t + .32); };
    function kick(t) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(75, t); o.frequency.exponentialRampToValueAtTime(42, t + .14); env(g, t, .004, .09, .16); o.connect(g); g.connect(drumBus); o.start(t); o.stop(t + .25); }
    function rhodes(ms, t, len, v = 1) { ms.forEach(m => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = mtof(m); env(g, t, .015, .026 * v, len); o.connect(g); g.connect(band); o.start(t); o.stop(t + len + .1); }); }
    function vibes(m, t, v = 1) { const o = ac.createOscillator(), o4 = ac.createOscillator(), g = ac.createGain(), g4 = ac.createGain(); o.type = 'sine'; o4.type = 'sine'; o.frequency.value = mtof(m); o4.frequency.value = mtof(m) * 4; env(g, t, .004, .085 * v, 1.6); env(g4, t, .002, .02 * v, .3); o.connect(g); o4.connect(g4); g.connect(vibeBus); g4.connect(vibeBus); o.start(t); o4.start(t); o.stop(t + 1.7); o4.stop(t + .4); }
    // ---------- the tune: an original 16-bar form in F ----------
    const CH = { F6: [41, [0, 4, 7, 9]], D7: [38, [0, 4, 7, 10]], Gm7: [43, [0, 3, 7, 10]], C7: [36, [0, 4, 7, 10]], Am7: [45, [0, 3, 7, 10]], Bb6: [46, [0, 4, 7, 9]], Bdim: [47, [0, 3, 6, 9]], E7: [40, [0, 4, 7, 10]] };
    const FORM = [['F6', 'F6'], ['D7', 'D7'], ['Gm7', 'Gm7'], ['C7', 'C7'], ['Am7', 'Am7'], ['D7', 'D7'], ['Gm7', 'C7'], ['F6', 'C7'], ['Bb6', 'Bb6'], ['Bdim', 'Bdim'], ['F6', 'F6'], ['D7', 'D7'], ['Gm7', 'Gm7'], ['C7', 'C7'], ['Am7', 'D7'], ['Gm7', 'C7']];
    const SCALE = [0, 2, 4, 5, 7, 9, 10, 11].map(x => x + 5);   // F major with a blue seventh
    const BPM = 112, BEAT = 60 / BPM;
    const RHY = [[0, 2, 3, 4], [1, 2, 4, 6, 7], [0, 3, 4, 6], [2, 3, 5, 6], [0, 1, 2, 4], [4, 6, 7], [0, 2, 4, 5, 6], [3, 4, 6]];
    const COMP = [[[0, 0], [1, 1]], [[1, 1], [3, 0]], [[0, 1], [2, 1]], [[0, 0], [2, 1], [3, 1]], [[1, 1]]];
    let step = 0, next = 0, mel = 72, plan = [], compPlan = [], phrase = 0;
    const chordAt = (bar, beat) => FORM[bar % 16][beat < 2 ? 0 : 1];
    const tones = (name, lo, hi) => { const [r, iv] = CH[name], out = []; for (let m = lo; m <= hi; m++) if (iv.includes(((m - r) % 12 + 12) % 12)) out.push(m); return out; };
    const scaleTones = (lo, hi) => { const out = []; for (let m = lo; m <= hi; m++) if (SCALE.map(x => x % 12).includes(m % 12)) out.push(m); return out; };
    const nearest = (arr, m, avoid) => arr.filter(x => x !== avoid).sort((a, b) => Math.abs(a - m) - Math.abs(b - m) + (Math.random() - .5) * 1.5)[0];
    function planBar(bar) {
      plan = Array(8).fill(null); compPlan = COMP[(Math.random() * COMP.length) | 0];
      if (bar % 2 === 0) phrase = Math.random() < (scene === 'space' ? .45 : .65) ? 1 : 0;
      if (!phrase) return;
      const rh = RHY[(Math.random() * RHY.length) | 0];
      rh.forEach((s, k) => { const ch = chordAt(bar, s >> 1); const pool = s % 2 === 0 ? tones(ch, 65, 86) : scaleTones(65, 86); let m = nearest(pool, mel + (Math.random() < .5 ? -2 : 2)); if (k === rh.length - 1 && bar % 2 === 1) m = nearest(tones(ch, 65, 86), m); mel = m; plan[s] = m; });
    }
    function schedule(s, t) {
      const bar = Math.floor(s / 8), e = s % 8, beat = e >> 1, off = e & 1;
      if (e === 0) planBar(bar);
      const ch = chordAt(bar, beat), [root, iv] = CH[ch];
      const drums = scene !== 'space';
      if (!off) {
        // walking bass
        let m;
        if (beat === 0 || (beat === 2 && FORM[bar % 16][0] !== FORM[bar % 16][1])) m = root;
        else if (beat === 3) { const nb = beat === 3 ? bar + 1 : bar, nr = CH[chordAt(nb, 0)][0]; m = nr + (Math.random() < .5 ? -1 : 1); }
        else m = root + iv[(Math.random() * 3 | 0) + 1];
        while (m > 52) m -= 12; while (m < 33) m += 12;
        bass(m, t, BEAT * .95);
        if (drums) { ride(t, beat % 2 ? 1 : .8); if (beat % 2) { hat(t); brush(t); } if (Math.random() < .5) kick(t); }
      } else if (drums) {
        if (beat === 1 || beat === 3) ride(t, .55);
        if (Math.random() < .12) brush(t, .5);
      }
      // comping chords (rootless voicings) and the vibes line
      if (compPlan.some(([b, o]) => b === beat && o === off)) { const v = [iv[1], iv[3], iv[2] + (ch === 'Bdim' ? 0 : 7), 14].map(x => root + 24 + x).map(x => { while (x > 70) x -= 12; while (x < 55) x += 12; return x; }); rhodes(v, t, BEAT * (off ? 1.4 : 1.9), .9 + Math.random() * .3); }
      if (plan[e] != null) vibes(plan[e], t, .7 + Math.random() * .3);
    }
    function tick() { if (!ac) return; if (next < ac.currentTime + .02) next = ac.currentTime + .05; while (next < ac.currentTime + .6) { schedule(step, next); next += BEAT * (step % 2 === 0 ? .63 : .37); step++; } timer = setTimeout(tick, 110); }
    function startBand() { if (timer) return; next = ac.currentTime + .1; tick(); musicBus.gain.cancelScheduledValues(now()); musicBus.gain.setTargetAtTime(.6 * duckTo, now(), 1.2); }
    function stopBand() { musicBus.gain.setTargetAtTime(0, now(), .3); setTimeout(() => { clearTimeout(timer); timer = null; }, 1200); }
    S.music = (v) => { musicOn = v === undefined ? !musicOn : v; try { localStorage.setItem('fish-music', musicOn ? 'on' : 'off'); } catch (e) { } if (ac) { musicOn ? startBand() : stopBand(); } return musicOn; };
    S.musicOn = () => musicOn;
    document.addEventListener('visibilitychange', () => { if (!ac) return; if (document.hidden) ac.suspend(); else ac.resume(); });
    S._render = (sec) => { startBand(); clearTimeout(timer); timer = 1; musicBus.gain.cancelScheduledValues(0); musicBus.gain.value = .6; while (next < sec) { schedule(step, next); next += BEAT * (step % 2 === 0 ? .63 : .37); step++; } };   // used to bounce a sample offline
    S.duck = (k) => { duckTo = k; if (ac && musicOn) musicBus.gain.setTargetAtTime(.6 * k, now(), .4); };
    S.scene = (sc) => { if (sc === scene || !ac) { scene = sc; return; } scene = sc; const T0 = now();
      lp.frequency.setTargetAtTime(sc === 'sea' ? 720 : sc === 'space' ? 3200 : 5200, T0, .5);
      wet.gain.setTargetAtTime(sc === 'space' ? .55 : sc === 'sea' ? .32 : .2, T0, .6);
      drumBus.gain.setTargetAtTime(sc === 'space' ? .0 : sc === 'sea' ? .6 : 1, T0, .6); };
    S.water = under => S.scene(under ? 'sea' : 'land');
    // ---------- sound effects ----------
    function tone(f, d, type = 'sine', v = .2, slide = 0, delay = 0) { if (!ac || !on) return; const t0 = now() + delay; const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t0 + d); g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(g); g.connect(sfx); o.start(t0); o.stop(t0 + d + .05); }
    function noise(d, f, v = .2, sweep = 1) { if (!ac || !on) return; const s = ac.createBufferSource(); s.buffer = noiseBuf; const bf = ac.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.setValueAtTime(f, now()); bf.frequency.exponentialRampToValueAtTime(f * sweep, now() + d); const g = ac.createGain(); g.gain.setValueAtTime(v, now()); g.gain.exponentialRampToValueAtTime(.0001, now() + d); s.connect(bf); bf.connect(g); g.connect(sfx); s.start(); s.stop(now() + d + .05); }
    // a bubble: a quick upward "bloop"
    S.blip = (v = 1, f = 420 + Math.random() * 500, delay = 0) => { if (!ac || !on) return; const t0 = now() + delay, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 2.7, t0 + .07); g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(.09 * v, t0 + .008); g.gain.exponentialRampToValueAtTime(.0001, t0 + .1); o.connect(g); g.connect(sfx); o.start(t0); o.stop(t0 + .14); };
    S.bubbles = (n = 8, spread = .7, v = .7) => { for (let i = 0; i < n; i++) S.blip(v * (.5 + Math.random() * .5), 300 + Math.random() * 900, Math.random() * spread); };
    S.bubble = () => S.blip(1, 400 + Math.random() * 500);
    S.pop = () => { tone(700, .07, 'triangle', .14, 1.8); S.blip(.5, 900); };
    S.bell = () => { tone(1568, .9, 'sine', .14); tone(2093, .7, 'sine', .08, 1, .02); };
    S.horn = () => { tone(330, .22, 'square', .05); tone(415, .22, 'square', .04); tone(330, .2, 'square', .05, 1, .3); };
    S.auto = () => { tone(620, .1, 'square', .045); tone(620, .1, 'square', .045, 1, .16); };
    S.beep = () => { tone(980, .08, 'square', .035); tone(980, .08, 'square', .035, 1, .12); };
    S.screech = () => { noise(.7, 2600, .14, .6); tone(1800, .5, 'sawtooth', .02, .7); };
    S.boat = () => { tone(196, .7, 'triangle', .08); tone(247, .7, 'sine', .04); };
    S.wave = () => { noise(1.8, 700, .22, .45); S.bubbles(6, 1, .4); };
    S.splash = () => { noise(.7, 1800, .3, .25); tone(500, .3, 'triangle', .08, .4); S.bubbles(12, .9, .8); };
    S.whoosh = () => noise(1.1, 400, .2, 4);
    S.chime = () => { [0, 4, 7].forEach((s, i) => tone(523.2 * Math.pow(2, s / 12), .7, 'sine', .028, 1, i * .09)); };
    // a soft, low bloom for opening and closing pages
    S.soft = (up = true) => { if (!ac || !on) return; const notes = up ? [392, 493.9, 587.3] : [587.3, 493.9, 392]; notes.forEach((f, i) => { const t0 = now() + i * .11, o = ac.createOscillator(), g = ac.createGain(), lp2 = ac.createBiquadFilter(); o.type = 'sine'; o.frequency.value = f; lp2.type = 'lowpass'; lp2.frequency.value = 1400; g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(.03, t0 + .12); g.gain.exponentialRampToValueAtTime(.0001, t0 + 1.4); o.connect(lp2); lp2.connect(g); g.connect(sfx); o.start(t0); o.stop(t0 + 1.5); }); S.blip(.25, 380); };
    S.morph = () => { [0, 7, 12, 19].forEach((s, i) => tone(660 * Math.pow(2, s / 12), .2, 'triangle', .05, 1, i * .045)); S.bubbles(4, .3, .5); };
    S.chirp = () => { tone(2900, .06, 'sine', .05, 1.3); tone(3300, .06, 'sine', .04, 1.2, .08); };
    S.blub = () => { S.bubbles(5, .35, 1); tone(260, .16, 'sine', .1, 2.6); };
    S.click = () => tone(880, .05, 'square', .04);
    S.toggle = () => { on = !on; if (master) master.gain.setTargetAtTime(on ? .85 : 0, now(), .05); return on; };
    return S;
  })();
  // browsers only allow sound after a click, tap or key press
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, () => Sound.init(), { passive: true }));
  const bMusic = document.getElementById('bMusic');
  if (bMusic) { const setM = () => { bMusic.classList.toggle('muted', !Sound.musicOn()); bMusic.setAttribute('aria-label', Sound.musicOn() ? 'Music on' : 'Music off'); }; setM(); bMusic.addEventListener('click', () => { Sound.init(); Sound.music(); setM(); }); }
  const bSound = document.getElementById('bSound');
  bSound.addEventListener('click', () => { Sound.init(); const on = Sound.toggle(); bSound.classList.toggle('muted', !on); bSound.setAttribute('aria-label', on ? 'Sound on' : 'Sound off'); });
  const CUES = [[.075, () => Sound.whoosh()], [.108, () => Sound.pop()], [.13, () => Sound.bell()], [.235, () => Sound.horn()], [P.drift + .002, () => Sound.screech()], [.508, () => Sound.pop()], [.53, () => Sound.pop()], [.54, () => Sound.wave()], [.59, () => Sound.whoosh()], [.613, () => Sound.splash()], [.838, () => Sound.splash()], [.845, () => Sound.whoosh()]];
  const MORPHS = [.1, .266, .505, .535, .585, .84, .864];   // limbs change here (either direction)

  /* ---------------- time of day ---------------- */
  const THEMES = {
    day:     { top: 0x7fb0dc, mid: 0xeef0ea, bot: 0xe6e1d4, hemiS: 0xffffff, hemiG: 0xcfd3cf, hemiI: .68, sunC: 0xfff7e8, sunI: .55, sx: 7, sy: 15, sz: 10, sea: 0x6f9cc9, under: 0x86aed6, deep: 0x3f6496, win: 0, lamps: 0, stars: 0, orbC: 0xfff7d6, orbA: 0, orbS: 300, orbEl: .5, orbAz: -.3 },
    sunset:  { top: 0x2f3f7a, mid: 0xf0cf7c, bot: 0xe7d6a6, hemiS: 0xfff6e2, hemiG: 0x8d93a6, hemiI: .6, sunC: 0xfff1d2, sunI: .55, sx: 12, sy: 5, sz: 6, sea: 0x4f6f9e, under: 0x5f7fae, deep: 0x2c4475, win: .45, lamps: .6, stars: .12, orbC: 0xfff0b8, orbA: 1, orbS: 620, orbEl: .035, orbAz: .45 },
    night:   { top: 0x0b1428, mid: 0x1f3357, bot: 0x2a3d62, hemiS: 0x8ea6d4, hemiG: 0x1f2a40, hemiI: .5, sunC: 0xcad8ff, sunI: .32, sx: -6, sy: 14, sz: 8, sea: 0x22385f, under: 0x24406e, deep: 0x0e1c3a, win: 1, lamps: 1, stars: 1, orbC: 0xf1f4ff, orbA: 1, orbS: 260, orbEl: .3, orbAz: -.25 },
    sunrise: { top: 0x8db7dc, mid: 0xf5e6bd, bot: 0xeeeee0, hemiS: 0xfffaf0, hemiG: 0xd2d6d2, hemiI: .64, sunC: 0xfff3d6, sunI: .5, sx: -12, sy: 6, sz: 6, sea: 0x7fa6cf, under: 0x8eb3d8, deep: 0x46699c, win: .15, lamps: .15, stars: .05, orbC: 0xfff4c8, orbA: 1, orbS: 520, orbEl: .045, orbAz: -.5 }
  };
  // colours set in the editor (content.js → themes) override these
  if (CT.themes) for (const k in CT.themes) if (THEMES[k]) for (const c in CT.themes[k]) { const v = CT.themes[k][c]; THEMES[k][c] = typeof v === 'string' && v[0] === '#' ? parseInt(v.slice(1), 16) : v; }
  const TH_ORDER = ['day', 'sunset', 'night', 'sunrise'];
  const isCol = k => /^(top|mid|bot|hemiS|hemiG|sunC|sea|under|deep|orbC)$/.test(k);
  const cur = {}; let thName = 'day', thTarget = THEMES.day, winDone = -1;
  function setTheme(name, instant) {
    thName = name; thTarget = THEMES[name]; document.documentElement.dataset.time = name;
    for (const k in thTarget) { if (isCol(k)) { if (!cur[k]) cur[k] = new T.Color(thTarget[k]); else if (instant) cur[k].set(thTarget[k]); } else if (cur[k] === undefined || instant) cur[k] = thTarget[k]; }
    const b = document.getElementById('bTime'); if (b) { b.dataset.t = name; b.setAttribute('aria-label', 'Time of day: ' + name + '. Click to change.'); b.title = name; }
    try { localStorage.setItem('fish-time', name); } catch (e) { }
  }
  const _tc = new T.Color(), litC = new T.Color(0xffe39a), darkC = new T.Color(0x2c3a55), glassC = new T.Color(0x9fb6cc);
  function tickTheme(dt) {
    const k = Math.min(1, dt * 2.2);
    for (const key in thTarget) { if (isCol(key)) cur[key].lerp(_tc.set(thTarget[key]), k); else cur[key] = lerp(cur[key], thTarget[key], k); }
    skyU.top.value.copy(cur.top); skyU.mid.value.copy(cur.mid); skyU.bot.value.copy(cur.bot);
    hemi.color.copy(cur.hemiS); hemi.groundColor.copy(cur.hemiG); hemi.intensity = cur.hemiI; sun.color.copy(cur.sunC); sun.intensity = cur.sunI;
    seaTop.material.color.copy(cur.sea); seaBot.material.color.copy(cur.under).lerp(_tc.set(0xffffff), .25);
    if (Math.abs(cur.win - winDone) > .004) { winDone = cur.win; for (let i = 0; i < wi; i++) wins.setColorAt(i, _c.copy(glassC).lerp(winLit[i] ? litC : darkC, cur.win)); wins.instanceColor.needsUpdate = true; frames.material.color.set(0xffffff).lerp(_tc.set(0x7c8aa0), cur.win * .7); }
    const L = cur.lamps; lampGlows.forEach(g => g.material.opacity = L * .9); lampBulb.color.set(0xffffff).lerp(_tc.set(0xffe9a6), L); bulbMat.color.set(0xffffff).lerp(_tc.set(0xffe9a6), L); roomLight.intensity = L * 1.1; roomGlow.material.opacity = L * .8; lampFlies.forEach(f => f.sp.material.opacity = L); hero.lights.forEach(g => g.material.opacity = L * .85);
    nightStars.material.opacity = cur.stars * (1 - skyU.sp.value);
    orb.material.color.copy(cur.orbC); orb.material.opacity = cur.orbA * (1 - skyU.sp.value);
  }
  let saved = null; try { saved = localStorage.getItem('fish-time'); } catch (e) { }
  const hr = new Date().getHours();
  setTheme(THEMES[saved] ? saved : THEMES[(CT.site || {}).defaultTime] ? CT.site.defaultTime : hr >= 5 && hr < 8 ? 'sunrise' : hr >= 8 && hr < 17 ? 'day' : hr >= 17 && hr < 19 ? 'sunset' : 'night', true);
  const bTime = document.getElementById('bTime');
  if (bTime) bTime.addEventListener('click', () => { Sound.init(); Sound.chime(); setTheme(TH_ORDER[(TH_ORDER.indexOf(thName) + 1) % 4]); });

  /* =====================================================================
     UI: header bubbles, captions, cards, case panel, viewers
     ===================================================================== */
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function bubbles(x, y, n = 3, spread = 30) { if (RM) return; for (let i = 0; i < n; i++) { const b = document.createElement('div'); b.className = 'bub'; const s = 5 + Math.random() * 9; b.style.cssText = `left:${x + (Math.random() - .5) * spread}px;top:${y}px;--s:${s}px;--d:${1.4 + Math.random() * 1.4}s;--dx:${(Math.random() - .5) * 30}px;--dy:${-40 - Math.random() * 60}px`; document.body.appendChild(b); setTimeout(() => b.remove(), 3000); } }
  const nav = $('nav');
  nav.querySelectorAll('a').forEach(a => { a.addEventListener('mouseenter', () => { const r = a.getBoundingClientRect(); bubbles(r.left + r.width / 2, r.bottom - 4, 4, r.width * .6); Sound.bubble(); }); });
  setInterval(() => { if (document.hidden) return; const as = nav.querySelectorAll('a'); const a = as[(Math.random() * as.length) | 0]; const r = a.getBoundingClientRect(); bubbles(r.left + r.width / 2, r.top + 4, 1, r.width * .5); }, 1400);
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-go]'); if (!a) return; e.preventDefault(); Sound.init(); Sound.click();
    const r = a.getBoundingClientRect(); bubbles(r.left + r.width / 2, r.top + r.height / 2, 8, 40);
    const go = a.dataset.go; const s = go === 'work' ? workStops[0] : STOPS.find(s => s.id === go); if (!s) return;
    if (panelOpen) closePanel(); cutTo(s.p);
  });

  const capEl = $('caption'); let capText = '', capShown = 0;
  function setCaption(t) { if (t === capText) return; capText = t; capShown = 0; }
  function tickCaption(dt) { if (!capText) { capEl.innerHTML = ''; return; } capShown = Math.min(capText.length, capShown + dt * 42); const s = capText.slice(0, capShown | 0); capEl.innerHTML = `<span>${esc(s)}${capShown < capText.length ? '<i class="cur"></i>' : ''}</span>`; }

  // the opening: who I am, nothing else
  const titleEl = $('title'), cardEl = $('card');
  if (CT.ui && CT.ui.nav) nav.querySelectorAll('a').forEach(a => { const v = CT.ui.nav[a.dataset.go]; if (v) a.textContent = v; });
  if (CT.ui && CT.ui.hint) $('hint').textContent = CT.ui.hint;
  { const RF = (CT.site && CT.site.readFont) || 'IBM Plex Mono'; const FAM = { 'IBM Plex Mono': 'IBM+Plex+Mono:wght@400;500;600', 'JetBrains Mono': 'JetBrains+Mono:wght@400;500', 'Space Mono': 'Space+Mono:wght@400;700', 'IBM Plex Sans': 'IBM+Plex+Sans:wght@400;500;600', 'Atkinson Hyperlegible': 'Atkinson+Hyperlegible:wght@400;700' };
    if (FAM[RF] && RF !== 'IBM Plex Mono' && RF !== 'JetBrains Mono') { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + FAM[RF] + '&display=swap'; document.head.appendChild(l); }
    document.documentElement.style.setProperty('--read', `"${RF}", ui-monospace, Menlo, monospace`); }
  const SITE = CT.site || {};
  titleEl.innerHTML = `<h1>${esc(SITE.name || 'Hemesh Kanth')}</h1><p class="lead">${esc(SITE.tagline || 'Exploring the human side of AI and emotions.')}</p>${SITE.subline ? `<p class="sub">${esc(SITE.subline)}</p>` : ''}`;
  let cardFor = null;
  const UI = Object.assign({ openCase: 'open case study', game: 'play the game', deck: 'view the deck', report: 'read the report', nextCase: 'next case', hint: 'scroll ↓', email: 'copy email', copied: 'copied ✓', aboutTitle: 'about', contactTitle: 'Send a signal', exploreTitle: 'exploration' }, CT.ui || {});
  const mediaVerb = m => m.type === 'game' ? '▶ ' + UI.game : m.type === 'deck' ? UI.deck : UI.report;
  const sym = (ch, label, attrs = '') => `<button class="btn sym" type="button" aria-label="${esc(label)}" title="${esc(label)}" ${attrs}>${ch}</button>`;
  function cardHTML(s) {
    if (s.kind === 'work') { const pr = projects[s.i]; return { html: `<div class="k"><span>work · ${s.i + 1}/${projects.length}</span><span>${esc(pr.year)}</span></div><h2>${esc(pr.title)}</h2><p class="meta">${esc(pr.kind)}</p><p>${esc(pr.line)}</p><div class="btns"><button class="btn primary" data-case="${s.i}" type="button">${esc(UI.openCase)} ↗</button>${pr.media ? `<button class="btn" data-media="${s.i}" type="button">${esc(mediaVerb(pr.media))}</button>` : ''}${sym('←', 'previous', 'data-prev')}${sym('→', 'next', 'data-next')}</div>` }; }
    if (s.kind === 'exploration') return { html: `<div class="k"><span>${esc(UI.exploreTitle)}</span><span>the open sea</span></div><h2>${esc(H.reefTitle || 'Small things, watched closely')}</h2><ul class="mini exp">${(H.reef || []).map((x, k) => `<li><button type="button" data-exp="${k}" aria-label="open ${esc(x.t)}"><span class="t">${esc(x.k)}</span><b>${esc(x.t)} <i>↗</i></b><span>${esc(x.p)}</span></button></li>`).join('')}</ul><div class="btns">${sym('←', 'previous', 'data-prev')}${sym('→', 'next', 'data-next')}</div>` };
    if (s.kind === 'about') { const A = H.about || {};
      return { cls: 'about', html: `<div class="k"><span>${esc(UI.aboutTitle)}</span><span>${esc(CT.site.place || '')}</span></div><h2>${esc(CT.site.name)}</h2>
        <div class="aboutScroll" id="aboutScroll"><p class="lead">${esc(A.lead || H.intro || '')}</p>${A.lead && H.intro ? `<p>${esc(H.intro)}</p>` : ''}
        ${(A.sections || []).map(x => `<h4>${esc(x.h)}</h4><p>${esc(x.p)}</p>`).join('')}
        ${(H.keen || []).length ? `<h4>${esc(A.keenTitle || 'What I believe')}</h4><ul class="mini">${H.keen.map(k => `<li><b>${esc(k.h)}</b>${k.p ? `<span>${esc(k.p)}</span>` : ''}</li>`).join('')}</ul>` : ''}
        ${H.bowl ? `<p class="meta quiet">${esc(H.bowl)}</p>` : ''}
        ${A.tools ? `<h4>Tools</h4><p class="meta">${esc(A.tools)}</p>` : ''}${A.languages ? `<h4>Languages</h4><p class="meta">${esc(A.languages)}</p>` : ''}
        <h4>Education</h4><p class="meta">${esc(CT.site.education || 'M.Des New Media Design, National Institute of Design, Gandhinagar')}</p><p class="end">· · ·</p></div>
        <div class="aboutBar"><i id="aboutProg"></i></div><div class="btns">${sym('←', 'previous', 'data-prev')}${sym('→', 'next', 'data-next')}</div>` }; }
    if (s.kind === 'contact') return { html: `<div class="k"><span>contact</span><span>say hi</span></div><h2>${esc(UI.contactTitle)}</h2><p>${esc(H.return)}</p><div class="mail" id="mailT">${esc(CT.site.email)}</div><div class="btns"><button class="btn primary" id="bCopy" type="button">${esc(UI.email)}</button><a class="btn" href="${esc(CT.site.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a><a class="btn" href="${esc(CT.site.github)}" target="_blank" rel="noopener">GitHub ↗</a>${sym('↺', 'back to the bowl', 'data-go="title"')}</div>` };
    return null;
  }
  function showCard(s) {
    if (cardFor === (s && s.id)) return; cardFor = s && s.id;
    if (!s || s.kind === 'title') { cardEl.classList.remove('on'); return; }
    const c = cardHTML(s); cardEl.className = 'card' + (c.cls ? ' ' + c.cls : ''); cardEl.innerHTML = c.html; requestAnimationFrame(() => cardEl.classList.add('on')); Sound.chime();
    cardEl.querySelectorAll('[data-case]').forEach(b => b.addEventListener('click', () => openPanel(+b.dataset.case)));
    cardEl.querySelectorAll('[data-media]').forEach(b => b.addEventListener('click', () => openPanel(+b.dataset.media, true)));
    cardEl.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => { const n = STOPS.find(x => x.p > st.p + .003); if (n) flyTo(n.p); }));
    cardEl.querySelectorAll('[data-prev]').forEach(b => b.addEventListener('click', () => { const n = [...STOPS].reverse().find(x => x.p < st.p - .003); if (n) flyTo(n.p); }));
    cardEl.querySelectorAll('[data-exp]').forEach(b => b.addEventListener('click', () => openPanel(+b.dataset.exp, false, 'exp')));
    const cp = $('bCopy'); if (cp) cp.addEventListener('click', () => { const ok = () => { cp.textContent = UI.copied; setTimeout(() => cp.textContent = UI.email, 1600); }; try { navigator.clipboard.writeText(CT.site.email).then(ok, () => sel()); } catch (e) { sel(); } function sel() { const r = document.createRange(); r.selectNodeContents($('mailT')); getSelection().removeAllRanges(); getSelection().addRange(r); cp.textContent = 'selected'; } });
  }

  // viewers
  let viewers = [], viewerMax = null;
  const pad = (n, w) => String(n).padStart(w, '0');
  function mediaHTML(m) {
    if (m.type === 'game') return `<section class="media" id="mediaSec"><h3>${esc(m.label || 'play it here')}</h3><div class="game" data-game="${esc(m.src)}"><div class="gcover"><button class="btn primary" type="button" data-gstart>▶ ${esc(UI.game)}</button><span>sound on · runs right here in the page</span></div></div><div class="vbar">${sym('⤢', 'full screen', 'data-gmax')}<a class="btn sym" href="${esc(m.src)}" target="_blank" rel="noopener" aria-label="open in a new tab" title="open in a new tab">↗</a></div></section>`;
    const n = m.pages, src = i => RES(m.src.replace('{n}', pad(i, m.pad || 2)));
    return `<section class="media" id="mediaSec"><h3>${esc(m.label)}</h3><div class="viewer" data-n="${n}"><div class="stage"><img alt="" src="${src(1)}"><button class="nav prev" type="button" aria-label="Previous page">‹</button><button class="nav nextp" type="button" aria-label="Next page">›</button></div>
      <div class="vbar"><span class="count px">01 / ${pad(n, 2)}</span><span class="vsp"></span>${sym('⤢', 'full screen', 'data-vmax')}</div>
      <div class="thumbs">${Array.from({ length: n }, (_, i) => `<button type="button" data-i="${i + 1}"><img loading="lazy" alt="page ${i + 1}" src="${src(i + 1)}"></button>`).join('')}</div></div></section>`;
  }
  function bindViewer(root, m) {
    if (m.type === 'game') {
      const box = root.querySelector('.game'), start = () => { if (box.querySelector('iframe')) return; const f = document.createElement('iframe'); f.src = RES(box.dataset.game); f.title = 'Average Ennorian, the game'; f.allow = 'autoplay; fullscreen'; box.innerHTML = ''; box.appendChild(f); };
      root.querySelector('[data-gstart]').addEventListener('click', () => { Sound.click(); Sound.duck(0); start(); });
      root.querySelector('[data-gmax]').addEventListener('click', () => { Sound.duck(0); start(); setMax({ el: box, step() { } }); });
      return null;
    }
    const v = root.querySelector('.viewer'), n = +v.dataset.n, img = v.querySelector('.stage img'), cnt = v.querySelector('.count'), th = [...v.querySelectorAll('.thumbs button')];
    const src = i => RES(m.src.replace('{n}', pad(i, m.pad || 2))); let i = 1;
    const api = { el: v, go(k) { i = clamp(k, 1, n); img.src = src(i); cnt.textContent = `${pad(i, 2)} / ${pad(n, 2)}`; th.forEach((b, j) => b.classList.toggle('on', j === i - 1)); const b = th[i - 1]; if (b) b.parentNode.scrollTo({ left: b.offsetLeft - b.parentNode.clientWidth / 2 + b.clientWidth / 2, behavior: 'smooth' }); for (const k2 of [i + 1, i + 2]) if (k2 <= n) { const pre = new Image(); pre.src = src(k2); } }, step(d) { Sound.bubble(); this.go(i + d); } };
    v.querySelector('.prev').addEventListener('click', () => api.step(-1)); v.querySelector('.nextp').addEventListener('click', () => api.step(1));
    th.forEach(b => b.addEventListener('click', () => api.go(+b.dataset.i)));
    v.querySelector('.stage').addEventListener('click', e => { if (e.target.closest('.nav')) return; const r = e.currentTarget.getBoundingClientRect(); api.step(e.clientX - r.left > r.width / 2 ? 1 : -1); });
    v.querySelector('[data-vmax]').addEventListener('click', () => setMax(api));
    let sx = null; v.querySelector('.stage').addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true }); v.querySelector('.stage').addEventListener('touchend', e => { if (sx == null) return; const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 40) api.step(d < 0 ? 1 : -1); sx = null; });
    api.go(1); return api;
  }
  function setMax(api) {
    if (viewerMax) { viewerMax.el.classList.remove('max'); const x = viewerMax.el.querySelector('.closeMax'); if (x) x.remove(); }
    viewerMax = api; if (!api) return;
    api.el.classList.add('max'); const x = document.createElement('button'); x.className = 'btn sym closeMax'; x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', 'close'); x.title = 'close'; x.addEventListener('click', ev => { ev.stopPropagation(); setMax(null); }); api.el.appendChild(x);
  }

  // case study: a full page that opens out of the fish; the fish jumps out with you and follows your cursor
  const panel = $('panel'), veil = $('veil'), pBody = $('panelBody'); let panelOpen = false, panelAt = 0, curCase = -1;
  function fishScreen() { const v = fish.position.clone().project(cam); return { x: clamp((v.x + 1) / 2 * innerWidth, 0, innerWidth), y: clamp((1 - v.y) / 2 * innerHeight, 0, innerHeight) }; }
  let curKind = 'work';
  const expItem = x => ({ title: x.t, kind: x.k, line: x.p, year: x.year || '', status: '', facts: x.facts || [], cover: x.cover, blocks: x.blocks || [], media: x.media, link: x.link });
  function openPanel(i, toMedia, kind = 'work') {
    const LIST = kind === 'exp' ? (H.reef || []).map(expItem) : projects;
    const pr = LIST[i]; if (!pr) return; const was = panelOpen; panelOpen = true; curCase = i; curKind = kind; setMax(null);
    const img = (o) => `<figure><div class="img">${o && o.src ? `<img src="${esc(RES(o.src))}" alt="${esc(o.cap || '')}">` : 'image'}</div>${o && o.cap ? `<figcaption>${esc(o.cap)}</figcaption>` : ''}</figure>`;
    const blocks = (pr.blocks || []).map(b => {
      if (b.t === 'text') return `<section><h3>${esc(b.h)}</h3><p>${esc(b.p)}</p>${b.d ? `<p class="deep">${esc(b.d)}</p>` : ''}</section>`;
      if (b.t === 'quote') return `<section><p class="pull">${esc(b.q)}</p></section>`;
      if (b.t === 'list') return `<section><h3>${esc(b.h)}</h3><div class="items">${(b.items || []).map(it => `<div><b>${esc(it[0])}</b><span>${esc(it[1])}</span></div>`).join('')}</div></section>`;
      if (b.t === 'image') return `<section class="wide">${img(b)}</section>`;
      if (b.t === 'gallery') return `<section class="wide"><div class="gal">${(b.items || []).map(img).join('')}</div></section>`;
      if (b.t === 'demo') return `<section class="note"><h3>${esc(b.h)}</h3><p>${esc(b.p)}</p></section>`;
      return '';
    }).join('');
    const n = LIST.length, prv = LIST[(i - 1 + n) % n], nx = LIST[(i + 1) % n];
    $('panelK').textContent = `${kind === 'exp' ? UI.exploreTitle + ' · ' : ''}${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    pBody.innerHTML = `<article class="wrap"><p class="kind px">${esc(pr.kind)}${pr.status ? ' · ' + esc(pr.status) : ''}${pr.year ? ' · ' + esc(pr.year) : ''}</p><h1>${esc(pr.title)}</h1><p class="line">${esc(pr.line)}</p>
      ${pr.link && pr.link.url && !pr.media ? `<p style="margin-top:18px"><a class="btn primary" href="${esc(pr.link.url)}" target="_blank" rel="noopener">${esc(pr.link.label || 'open')} ↗</a></p>` : ''}
      ${(pr.facts || []).length ? `<dl class="facts">${pr.facts.map(f => `<div><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join('')}</dl>` : ''}
      ${pr.media ? `<div class="wide">${mediaHTML(pr.media)}</div>` : (pr.cover && pr.cover.src ? `<section class="wide">${img(pr.cover)}</section>` : '')}${blocks}
      <nav class="next" aria-label="other projects"><button class="btn" id="pPrev" type="button" aria-label="previous project: ${esc(prv.title)}">← <span>${esc(prv.title)}</span></button><button class="btn" id="pNext" type="button" aria-label="next project: ${esc(nx.title)}"><span>${esc(nx.title)}</span> →</button></nav></article>`;
    panel.dataset.filter = CT.site.imgFilter || 'film';
    viewers = []; if (pr.media) { const a = bindViewer(pBody, pr.media); if (a) viewers.push(a); }
    if (!was) { const f = fishScreen(); panel.style.setProperty('--ox', f.x + 'px'); panel.style.setProperty('--oy', f.y + 'px'); FOL.open(f.x, f.y); panelAt = performance.now(); Sound.soft(true); }
    Sound.duck(.35); pBody.scrollTop = 0; panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false');
    if (toMedia) setTimeout(() => { const m = $('mediaSec'); if (m) pBody.scrollTo({ top: m.offsetTop - 80, behavior: 'smooth' }); }, 500);
    $('pNext').onclick = () => goCase((i + 1) % n); $('pPrev').onclick = () => goCase((i - 1 + n) % n);
  }
  function goCase(j) { if (curKind === 'work' && workStops[j]) { st.tween = null; st.p = st.target = st.prevP = workStops[j].p; camSnap = true; } Sound.blip(.3, 420); openPanel(j, false, curKind); }
  function closePanel() {
    if (!panelOpen) return; Sound.duck(1); setMax(null); panelOpen = false;
    renderer.render(scene, cam); const f = fishScreen(); panel.style.setProperty('--ox', f.x + 'px'); panel.style.setProperty('--oy', f.y + 'px'); FOL.close(f.x, f.y);
    panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); Sound.soft(false);
    setTimeout(() => { if (!panelOpen) { const fr = pBody.querySelector('iframe'); if (fr) fr.remove(); } }, 800);
  }
  $('panelClose').addEventListener('click', closePanel);
  const curLen = () => curKind === 'exp' ? (H.reef || []).length : projects.length;
  $('panelPrev').addEventListener('click', () => goCase((curCase - 1 + curLen()) % curLen()));
  $('panelNext').addEventListener('click', () => goCase((curCase + 1) % curLen()));

  /* ---------------- pointer ---------------- */
  const mouse = { x: 0, y: 0, on: false };
  addEventListener('pointermove', e => { mouse.x = (e.clientX / innerWidth - .5) * 2; mouse.y = -(e.clientY / innerHeight - .5) * 2; mouse.on = true; if (e.pointerType === 'mouse') { mouse.px = e.clientX; mouse.py = e.clientY; } }, { passive: true });
  // the fish that follows the cursor on project pages (its own little renderer, drawn over the page)
  const FOL = (() => {
    const cv = document.getElementById('fishCursor'); if (!cv) return { open() { }, close() { }, tick() { } };
    const r2 = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); r2.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); r2.setClearColor(0x000000, 0);
    const sc2 = new T.Scene(); sc2.add(new T.HemisphereLight(0xffffff, 0xd8d2c4, .95)); const d2 = new T.DirectionalLight(0xffffff, .5); d2.position.set(2, 3, 6); sc2.add(d2);
    const oc = new T.OrthographicCamera(0, 1, 0, -1, -600, 600);
    const f = fishProto; sc2.add(f); const ftail = f.getObjectByName('tailPivot');
    const S = { on: false, mode: '', k: 0, x: 0, y: 0, vx: 0, vy: 0, from: { x: 0, y: 0 }, to: { x: 0, y: 0 }, face: 1, size: 34, ry: -.35, ang: 0, sp: 0 };
    const resize = () => { r2.setSize(innerWidth, innerHeight, false); oc.left = 0; oc.right = innerWidth; oc.top = 0; oc.bottom = -innerHeight; oc.updateProjectionMatrix(); };
    addEventListener('resize', resize); resize();
    const tgt = (t = performance.now() / 1000) => { const cx = mouse.px != null ? mouse.px : innerWidth - 120, cy = mouse.py != null ? mouse.py : innerHeight - 110; return { x: cx + Math.cos(t * .55) * 74 + Math.sin(t * 1.3) * 18, y: cy + Math.sin(t * .8) * 46 + 30 }; };
    return {
      open(x, y) { S.on = true; S.mode = 'in'; S.k = 0; S.from = { x, y }; S.x = x; S.y = y; cv.classList.add('on'); },
      close(x, y) { if (!S.on) return; S.mode = 'out'; S.k = 0; S.from = { x: S.x, y: S.y }; S.to = { x, y }; },
      tick(dt, t) {
        if (!S.on) return;
        let x, y, sc = 1, spin = 0;
        if (S.mode === 'in' || S.mode === 'out') {
          S.k = Math.min(1, S.k + dt / .8); const e = easeIO(S.k), a = S.from, b = S.mode === 'in' ? tgt() : S.to;
          const mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - 180;
          x = lerp(lerp(a.x, mx, e), lerp(mx, b.x, e), e); y = lerp(lerp(a.y, my, e), lerp(my, b.y, e), e);
          sc = S.mode === 'in' ? lerp(.55, 1, e) + Math.sin(e * Math.PI) * .45 : lerp(1, .45, e) + Math.sin(e * Math.PI) * .35;
          spin = Math.sin(e * Math.PI) * .7 * (S.mode === 'in' ? 1 : -1);
          if (S.k >= 1) { if (S.mode === 'in') { S.mode = 'follow'; S.ang = Math.atan2(S.vy, S.vx); S.sp = 160; } else { S.on = false; cv.classList.remove('on'); r2.clear(); return; } }
        } else {
          // swim: steer toward a point that circles the cursor, with a top speed and a gentle turn rate, so the path curves
          const g = tgt(t), want = Math.atan2(g.y - S.y, g.x - S.x), dist = Math.hypot(g.x - S.x, g.y - S.y);
          let da = want - S.ang; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
          S.ang += clamp(da, -2.6 * dt, 2.6 * dt); S.sp = lerp(S.sp, clamp(dist * 1.6, 40, 420), Math.min(1, dt * 2));
          x = S.x + Math.cos(S.ang) * S.sp * dt; y = S.y + Math.sin(S.ang) * S.sp * dt + Math.sin(t * 5) * .4;
        }
        const id = 1 / Math.max(dt, 1e-3); S.vx = lerp(S.vx, (x - S.x) * id, .2); S.vy = lerp(S.vy, (y - S.y) * id, .2); S.x = x; S.y = y;
        if (Math.abs(S.vx) > 40) S.face = S.vx > 0 ? 1 : -1;
        S.ry = lerp(S.ry, S.face > 0 ? -.35 : Math.PI + .35, Math.min(1, dt * 7));
        const sp = Math.hypot(S.vx, S.vy);
        f.position.set(x, -y + Math.sin(t * 2.2) * 3, 0); f.scale.setScalar(S.size * sc);
        f.rotation.set(0, S.ry, clamp(-S.vy * .0016 * S.face, -.6, .6) + spin + Math.sin(t * 7) * .06);
        if (ftail) ftail.rotation.y = Math.sin(t * (8 + Math.min(sp, 900) * .02)) * .45;
        if (Math.random() < dt * 1.2) bubbles(x + S.face * 18, y - 6, 1, 6);
        r2.render(sc2, oc);
      }
    };
  })();
  const ray = new T.Raycaster(), _nd = new T.Vector2();
  let fishPoke = 0, rvSpin = 0;
  function hitAt(e) {
    _nd.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(_nd, cam);
    const roots = [fish, rv, ...parked.map(v => v.g), ...workBubbles.map(b => b.g)].filter(o => o.visible && (o !== rv || room.visible) && city.visible).concat(sea.visible ? exBubbles.map(b => b.g) : []);
    const h = ray.intersectObjects(roots, true)[0]; if (!h) return null;
    let o = h.object; while (o && !roots.includes(o)) o = o.parent; return o;
  }
  canvas.addEventListener('click', e => {
    const o = hitAt(e); if (!o) return; Sound.init();
    if (o === fish) { fishPoke = 1; Sound.blub(); burst(bubTex, fish.position.clone().add(V(.3, .4, 0)), 6, .6, 1.5, .25, 0); return; }
    if (o === rv) { rvSpin = 1; Sound.beep(); return; }
    const wb = workBubbles.findIndex(b => b.g === o); if (wb >= 0) { Sound.bubble(); openPanel(wb); return; }
    const eb = exBubbles.findIndex(b => b.g === o); if (eb >= 0 && (H.reef || [])[eb]) { Sound.bubble(); openPanel(eb, false, 'exp'); return; }
    const v = parked.find(v => v.g === o); if (v) { v.b = 1; (v.kind === 'auto' ? Sound.auto : v.kind === 'scooter' ? Sound.beep : Sound.horn)(); }
  });
  let hovT = 0; canvas.addEventListener('pointermove', e => { const n = performance.now(); if (n - hovT < 120) return; hovT = n; const ho = hitAt(e); canvas.style.cursor = ho ? 'pointer' : ''; if (ho && ho !== lastHover && workBubbles.some(b => b.g === ho)) Sound.bubbles(3, .2, .6); lastHover = ho; });
  let lastHover = null;

  /* =====================================================================
     FRAME
     ===================================================================== */
  const camPos = V(0, 0, 0), camLook = V(0, 0, 0), fogCol = new T.Color(), spaceC = new T.Color(COL.space);
  let last = performance.now(), bubT = 0, puffT = 0, wasUnder = false, forced = null, chirpT = 0, cityFadeOn = false, odoB = 0, odoC = 0, lastBX = null, lastCX = null;
  const cityMats = []; city.traverse(o => { if (o.material && !o.material.isSpriteMaterial && !o.material.isShaderMaterial && !cityMats.includes(o.material)) cityMats.push(o.material); });
  cityMats.forEach(m => { m.userData.wasT = m.transparent; m.userData.op0 = m.opacity; });
  function cityTransparent(on) { if (on === cityFadeOn) return; cityFadeOn = on; cityMats.forEach(m => { m.transparent = on || m.userData.wasT || false; if (!on) m.opacity = m.userData.op0; m.needsUpdate = true; }); }
  const hintEl = $('hint'), progEl = $('prog');
  const camS = { p: V(0, 0, 0), l: V(0, 0, 0) }, mouseS = { x: 0, y: 0 }; let camSnap = false;
  const _p = V(0, 0, 0), _q = V(0, 0, 0), _w = V(0, 0, 0);
  const span = (p, a, b) => sm(a, a + .006, p) * (1 - sm(b - .004, b + .002, p));
  const pop = s => s + Math.sin(s * Math.PI) * .22;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000;
    if (forced !== null) { st.p = st.target = forced; }
    else if (st.tween) { const tw = st.tween; tw.t += dt / tw.dur; st.p = st.target = lerp(tw.from, tw.to, easeIO(clamp(tw.t, 0, 1))); if (tw.t >= 1) st.tween = null; }
    else {
      if (performance.now() - st.lastIn > 650) { const n = STOPS.reduce((a, b) => Math.abs(b.p - st.target) < Math.abs(a.p - st.target) ? b : a); if (Math.abs(n.p - st.target) < .018 && !(st.target > ABOUT0 + .004 && st.target < ABOUT1)) st.target += (n.p - st.target) * Math.min(1, dt * 2.5); }
      st.p += (st.target - st.p) * Math.min(1, dt * 3.2);
    }
    const p = st.p, pp = st.prevP;
    if (p > pp && p - pp < .02) CUES.forEach(([cp, fn]) => { if (pp < cp && p >= cp) fn(); });
    // which way are we going? turn round when scrolling back
    const vp = p - pp; if (Math.abs(vp) > 2e-5 && forced === null) facing = vp > 0 ? 1 : -1;
    const turnable = p > P.land + .002 && p < PB0;
    turn += ((facing < 0 && turnable ? -Math.PI : 0) - turn) * Math.min(1, dt * 4.2);
    const nearStop = STOPS.reduce((m, s) => Math.max(m, 1 - sm(.004, .014, Math.abs(p - s.p))), 0);
    camFlip = lerp(1, Math.cos(turn), 1 - nearStop);
    st.prevP = p;

    // ---- vehicles (the fish rides them)
    const bx = bikeX(p);
    bike.visible = p >= .07 && p < .52;
    if (lastBX !== null) odoB += Math.abs(bx - lastBX); lastBX = bx;
    if (bike.visible) { bike.position.set(bx + .05, 0, LANE_B); const parkedB = sm(P.hop1, P.hop1 + .01, p); bike.rotation.set(-.12 * parkedB, p < P.hop1 ? turn : 0, 0); bwheels.forEach(w => w.rotation.z = -odoB / .42); crank.rotation.z = -odoB * 1.5; kick.visible = parkedB > .5; }
    const cs = carState(p);
    if (lastCX !== null) odoC += Math.abs(cs.x - lastCX); lastCX = cs.x;
    car.visible = p >= .232;
    const carTurn = p > P.carGo - .003 && p < P.park ? turn : 0;
    if (car.visible) { car.position.set(cs.x, 0, cs.z); car.rotation.y = cs.yaw + carTurn; hero.wheels.forEach(w => { w.sp.rotation.z = -odoC / .3; }); }
    const yawRate = (carState(Math.min(1, p + .002)).yaw - carState(Math.max(0, p - .002)).yaw) / .004;
    const driving = p > P.carGo && p < P.park;
    const steer = clamp(-yawRate * .05, -2.4, 2.4) * (p > P.drift - .002 ? -1.2 : 1) + (driving ? Math.sin(t * 1.3) * .1 : 0);
    hero.spin.rotation.z = lerp(hero.spin.rotation.z, steer, Math.min(1, dt * 8));
    hero.wheels.slice(0, 2).forEach(w => w.g.rotation.y = hero.spin.rotation.z * .25);
    const bt = boatX(p), wa = waveAmp(p), surfT = p >= P.sail && p < P.leap ? turn : 0;
    const pitch = wa * .12, cz = carve(p), heading = -Math.atan2(carve(Math.min(1, p + .002)) - carve(Math.max(0, p - .002)), Math.max(.05, boatX(Math.min(1, p + .002)) - boatX(Math.max(0, p - .002)))), lean = clamp(heading * .9, -.3, .3);
    board.position.set(bt, boatY(t, p), LANE_C + cz); board.rotation.set(lean + Math.sin(t * .8) * .02 * wa, surfT + heading * Math.cos(surfT), -pitch * Math.cos(surfT));
    wave.visible = wa > .01 && board.visible;
    if (wave.visible) { wave.position.set(bt - WAVE_X * Math.cos(surfT), -.05, LANE_C); wave.rotation.y = surfT; wave.scale.set(1, wa, 1); tintWave(cur.sea);
      leapers.forEach(L => { const u = (t * .32 + L.ph) % 1, x = .9 + u * 2.4, y = waveH(x, L.z) + Math.sin(u * Math.PI) * 1.1 - .2; L.g.position.set(x, y, L.z); L.g.rotation.z = Math.cos(u * Math.PI) * .9; L.g.visible = u > .06 && u < .94; }); }
    const surfZone = sm(P.hop2 - .02, P.sail, p) * (1 - sm(P.leap + .01, P.dive + .01, p));
    ripples.forEach(r => { r.m.visible = surfZone > .01; if (!r.m.visible) return; r.u += dt * .16; if (r.u > 1) { r.u -= 1; r.x = bt + 4 + rnd() * 14; r.z = LANE_C + (rnd() < .5 ? -1 : 1) * (3 + rnd() * 6); } const e = r.u; r.m.position.set(r.x, -.03, r.z); r.m.scale.set(1.4 * (.3 + e * 1.1), 1, .3 + e * 1.1); r.m.material.opacity = Math.sin(e * Math.PI) * .22 * surfZone; });

    // ---- camera
    camAt(p, t, camPos, camLook);
    // ease the camera toward where the story wants it (removes small jumps between path pieces); snap after a cut or in tests
    const snap = forced !== null || camSnap || camS.p.lengthSq() === 0; const ck = snap ? 1 : 1 - Math.exp(-dt * 9);
    camS.p.lerp(camPos, ck); camS.l.lerp(camLook, ck); camSnap = false;
    mouseS.x += (mouse.x - mouseS.x) * Math.min(1, dt * 2.5); mouseS.y += (mouse.y - mouseS.y) * Math.min(1, dt * 2.5);
    cam.position.copy(camS.p); cam.position.x += mouseS.x * .22; cam.position.y += mouseS.y * .12; cam.lookAt(camS.l);

    // ---- the fish
    const fp = fishAt(p, t); const fp2 = fishAt(Math.min(1, p + .0015), t + .05), fp0 = fishAt(Math.max(0, p - .0015), t - .05);
    const dir = fp2.clone().sub(fp0); if (dir.lengthSq() < 1e-8) dir.set(1, 0, 0);
    const scale = p < P.jump0 ? .3 : p < P.land ? lerp(.3, 1, sm(P.jump0 + .004, P.jump0 + .03, p)) : 1;
    const inCar = p >= P.carGo - .003 && p < P.park, onBoat = p >= P.sail && p < P.leap, onBike = p >= P.land - .004 && p < P.hop1, walking = p >= P.walk && p < P.hop2;
    bike.updateMatrixWorld(true); car.updateMatrixWorld(true); board.updateMatrixWorld(true);
    if (p <= PB0 + .001) {
      if (onBike && p >= P.land) { fish.position.copy(bike.localToWorld(_w.set(-.05, BIKE_Y + Math.sin(t * 7) * .012, 0))); orient(fish, turnDir(V(1, 0, 0))); }
      else if (inCar) { fish.position.copy(car.localToWorld(_w.copy(SEAT))); orient(fish, V(Math.cos(cs.yaw + carTurn), 0, -Math.sin(cs.yaw + carTurn))); }
      else if (onBoat) { fish.position.set(board.position.x - .05 * Math.cos(surfT), board.position.y + BSEAT.y, board.position.z); orient(fish, turnDir(V(Math.cos(heading), 0, -Math.sin(heading)))); }
      else { fish.position.copy(fp); if (walking) orient(fish, turnDir(V(1, 0, 0))); else if (p < P.land) orient(fish, dir); else orient(fish, turnDir(dir)); }
    } else {
      const fwd = camLook.clone().sub(cam.position).normalize(), rt = V(0, 0, 0).crossVectors(fwd, cam.up).normalize(), upv = V(0, 0, 0).crossVectors(rt, fwd);
      const D = lerp(11, 4.6, sm(.9, 1, p));
      const rel = cam.position.clone().addScaledVector(fwd, D).addScaledVector(rt, lerp(.6, 1.1, sm(.9, 1, p))).addScaledVector(upv, -.25 + Math.sin(t * 1.5) * .15);
      const w = sm(PB0 + .001, PB0 + .009, p); fish.position.lerpVectors(fp, rel, w);
      const towards = cam.position.clone().addScaledVector(rt, -3).sub(fish.position); orient(fish, dir.clone().lerp(towards.normalize(), w), upv);
    }
    if (p < P.jump0 - .004) { const vx = Math.cos(t * .9) * .18, vz = -Math.sin(t * .7) * .084; orient(fish, V(Math.abs(vx) < .02 ? Math.sign(vx || 1) * .02 : vx, 0, vz)); }
    fish.scale.setScalar(scale);
    if (fishPoke > 0) { fishPoke = Math.max(0, fishPoke - dt * 1.6); rig.rotation.y = Math.sin(fishPoke * 20) * .35 * fishPoke; } else rig.rotation.y = 0;
    // morphology: legs for the bike and the jetty, hands for the car and the boat, fins in the sea, wings for the sky
    const swimming = p > P.dive - .004 && p < P.fly, suitOn = p > P.suit;
    const legS = Math.max(span(p, .096, .266), span(p, .505, .585)), armS = Math.max(span(p, .266, .505), span(p, .535, .585));
    tailPivot.rotation.y = Math.sin(t * (swimming ? 9 : 6)) * (swimming ? .5 : .35);
    fins.forEach((f, i) => { f.g.rotation.z = Math.sin(t * (swimming ? 9 : 6) + i) * (swimming ? .5 : .3); f.g.scale.setScalar(swimming ? 1.35 : 1); });
    eyes.forEach(e => e.pu.position.y = Math.sin(t * .7) * .015);
    helmet.visible = p > .104 && p < P.hop1 + .004;
    belt.visible = inCar && p > P.carGo - .001;
    fish.updateMatrixWorld(true);
    legs.forEach((l, i) => {
      l.hip.visible = legS > .01; l.hip.scale.setScalar(Math.max(.01, pop(legS)));
      if (!l.hip.visible) return;
      if (onBike && p >= P.land - .002) { pedals[i].getWorldPosition(_w); rig.worldToLocal(_w); setLeg(l, _w.x, _w.y + .06); }
      else if (walking) { const ph = fp.x * 3.2 + i * Math.PI; setLeg(l, .04 + Math.sin(ph) * .2, -.97 + Math.max(0, Math.cos(ph)) * .12); }
      else if (onBoat) { _w.set(l.s > 0 ? .34 : -.3, .1, l.s * .07); board.localToWorld(_w); rig.worldToLocal(_w); setLeg(l, _w.x, _w.y); }
      else { setLeg(l, .14 + Math.sin(t * 3 + i) * .05, -.95 + i * .04); }
    });
    MORPHS.forEach(m => { if ((pp < m) !== (p < m) && Math.abs(p - pp) < .02) { burst(sparkTex, fish.position.clone(), 10, 1.2, 1.2, .3, 0); Sound.morph(); } });
    arms.forEach(a => a.g.visible = armS > .01);
    if (armS > .01) {
      if (inCar) { const g = hero.grips.map(o => rig.worldToLocal(o.getWorldPosition(V(0, 0, 0)))); g.sort((u, v) => v.z - u.z); arms.forEach(a => setArm(a, a.s > 0 ? g[0] : g[1], pop(armS))); }
      else if (onBoat) arms.forEach(a => setArm(a, _w.set(.05 + a.s * .08, .12 + Math.sin(t * 2.4 + a.s) * .12, a.s * .82), pop(armS)));
      else arms.forEach(a => setArm(a, _w.set(.3, -.25, a.s * .55), pop(armS)));
    }
    rig.rotation.z = inCar ? Math.sin(t * 9) * .01 + clamp(yawRate * .004, -.08, .08) : onBike ? Math.sin(t * 6) * .02 : 0;
    rig.rotation.x = onBoat ? lean * .6 : 0;
    const wingOn = p > P.fly - .002; wings.forEach(w => { w.pv.visible = wingOn; const s = sm(P.fly - .002, P.fly + .01, p); w.pv.scale.setScalar(Math.max(.01, pop(s))); w.pv.rotation.x = w.s * Math.sin(t * 9) * .42; });
    suit.visible = suitOn; if (suitOn) { const s = sm(P.suit, P.suit + .01, p); suit.scale.setScalar(Math.max(.01, pop(s))); const bl = .5 + .5 * Math.sin(t * 2.2); beacon.material.color.setRGB(lerp(.78, .96, bl), lerp(.38, .55, bl), lerp(.34, .48, bl)); beaconGlow.material.opacity = .06 + .3 * bl * bl; }
    dorsal.visible = !suitOn; const finM = suitOn ? FM.suit : FM.skin; tail.material = finM; fins.forEach(f => f.main.material = finM);

    // ---- particles
    if (swimming && !RM) { bubT += dt; if (bubT > .3) { bubT = 0; emit(bubTex, fish.position.clone().add(turnDir(V(.5, 0, 0))).add(V(0, .1, 0)), V((rnd() - .5) * .3, 1.2, 0), 2.2, .22 + rnd() * .15); if (rnd() < .3) Sound.blip(.4); } }
    puffT += dt;
    const moving = Math.abs(vp) > 1e-5;
    if (!RM && puffT > .07) { puffT = 0;
      if (p > P.drift - .004 && p < P.park + .002 && moving) for (const s of [-.72, .72]) { _w.set(-.95, .2, s); car.localToWorld(_w); emit(puffTex, _w.clone(), V((rnd() - .5) * .8, .6 + rnd() * .4, (rnd() - .5) * .8), 1.1, .5, -.2, 1.2); }
      if (onBoat && p > P.sail + .002 && moving) { for (const z of [-.3, .3]) { _w.set(-1.1, 0, z); board.localToWorld(_w); emit(puffTex, _w.clone(), V(-.5, .35 + rnd() * .3, z * 1.5), .9, .32, 1.2, 1); } if (rnd() < .3) { const z = board.position.z + (rnd() - .5) * 2.4, f = FALL(z - LANE_C); emit(dotTex, V(wave.position.x + 1.0 * f, waveH(-.15, 0) * f * wa + .1, z), V(.7 + rnd() * .5, .8 + rnd() * .6, (rnd() - .5) * .6), .7, .06 + rnd() * .04, 3.2); } }
      if (driving && moving) { if (rnd() < .15) Sound.blip(.25, 300 + rnd() * 300); _w.set(-1.55, .3, -.4); car.localToWorld(_w); emit(bubTex, _w.clone(), V((rnd() - .5) * .4, .6 + rnd() * .4, (rnd() - .5) * .4), 1.1, .14 + rnd() * .1); }
      if (inCar && rnd() < .35) { if (rnd() < .12) Sound.blip(.2, 900 + rnd() * 600); _w.set(-.32 + (rnd() - .5) * .8, .8, (rnd() - .5) * .9); car.localToWorld(_w); emit(bubTex, _w.clone(), V(0, .5, 0), .55, .07); }
      if (onBike && rnd() < .25) { _w.set(.55, 1.52, -.16); bike.localToWorld(_w); emit(puffTex, _w.clone(), turnDir(V(-.9, -.1, .25)), .45, .18, 0, 1.4); }
    }
    const under = cam.position.y < 0; if (under !== wasUnder) { wasUnder = under; Sound.water(under); if (Math.abs(p - P.dive) < .03) { burst(bubTex, fish.position.clone(), 18, 2, 2.5, .35, 0); Sound.bubbles(14, 1.1, .8); } }
    if (p > P.dive - .004 && st.prevSplash !== 1 && p < P.dive + .01) { st.prevSplash = 1; burst(dotTex, V(ENTRY.x - .5, .2, -12), 16, 1.6, 4, .4, 9); }
    if (p < P.dive - .008) st.prevSplash = 0;
    if (p > .839 && st.prevSplash2 !== 1 && p < .85) { st.prevSplash2 = 1; burst(dotTex, V(326 + SX, .2, -12), 16, 1.6, 4, .4, 9); }
    if (p < .835) st.prevSplash2 = 0;
    for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.life -= dt; q.vel.y -= q.grav * dt; q.s.position.addScaledVector(q.vel, dt); if (q.grow) q.s.scale.setScalar(q.size * (1 + (1 - q.life / q.max) * q.grow)); q.s.material.opacity = clamp(q.life / q.max, 0, 1); if (q.life <= 0) { scene.remove(q.s); q.s.material.dispose(); parts.splice(i, 1); } }

    // ---- the world: sky, water, space, fog, light
    const h = cam.position.y; const sp = sm(140, 900, h); skyU.sp.value = sp;
    Sound.scene(h < 0 ? 'sea' : p > .862 ? 'space' : 'land');
    tickTheme(dt);
    skyDome.position.copy(cam.position); skyDome.visible = h >= 0 && sp < .985;
    if (h < 0) { const d = sm(0, -30, h); fogCol.copy(cur.under).lerp(cur.deep, d * .8); scene.fog.near = 3; scene.fog.far = lerp(75, 50, d); scene.background.copy(fogCol); }
    else { fogCol.copy(cur.mid).lerp(spaceC, sp); scene.fog.near = 60 + h * .5; scene.fog.far = 460 + h * 14; scene.background.copy(spaceC); }
    scene.fog.color.copy(fogCol);
    const el = cur.orbEl, az = cur.orbAz; orb.position.copy(cam.position).add(_w.set(Math.sin(az), Math.sin(el), -Math.cos(az)).normalize().multiplyScalar(3000)); orb.scale.setScalar(cur.orbS); orb.visible = h >= 0;
    stars.material.opacity = sm(250, 1000, h);
    const dP = cam.position.distanceTo(PC); planet.visible = p > .835 && dP > PR + 40; planetInk.visible = dP > PR * 1.4; halo.visible = dP > PR * 1.25; planet.rotation.y = t * .01;
    const fade = p < .8 ? 1 : 1 - sm(220, 650, cam.position.distanceTo(_w.set(338 + SX, 0, -12)));
    cityTransparent(fade < .999);
    if (cityFadeOn) cityMats.forEach(m => { m.opacity = m.userData.op0 * fade; });
    seaTop.material.opacity = .96 * fade;
    city.visible = room.visible = fade > .01; clouds.visible = fade > .01; seaTop.visible = seaBot.visible = fade > .01;
    sea.visible = h < 6 || (p > .57 && p < .87);
    const lifeOn = fade > .3 && h > 0 && p < .63; life.visible = lifeOn;
    _q.copy(p < P.land ? V(1, 1, -12) : fish.position); sun.position.copy(_q).add(_w.set(cur.sx, cur.sy, cur.sz)); sun.target.position.copy(_q);

    // ---- ambient life
    workBubbles.forEach(b => { const nb = 1 - sm(.004, .04, Math.abs(p - WORKP[b.i])); b.g.position.y = b.y + Math.sin(t * .8 + b.ph) * .25; b.g.scale.setScalar(1 + nb * .06 + Math.sin(t * 1.6 + b.ph) * .012); b.icon.rotation.y = t * .4 + b.ph; if (b.icon.userData.disc) b.icon.userData.disc.quaternion.copy(cam.quaternion);
      b.ring.quaternion.copy(cam.quaternion); b.shadow.scale.setScalar(.9 + Math.sin(t * .8 + b.ph) * .06); });
    if (cur.lamps > .05) lampFlies.forEach(f => { f.a += f.w * dt; f.sp.position.set(f.h.x + Math.cos(f.a) * f.r + Math.sin(t * 7 + f.ph) * .05, f.h.y - .1 + Math.sin(f.a * 1.7 + f.ph) * .25, f.h.z + Math.sin(f.a) * f.r); });
    exBubbles.forEach(b => { b.g.position.y = b.y + Math.sin(t * .8 + b.ph) * .3; b.icon.rotation.y = t * .5 + b.ph; });
    kelp.forEach((k, i) => k.rotation.z = Math.sin(t * .8 + i) * .08);
    school.forEach(s => { s.a += s.sp * dt; s.g.position.set(s.cx + Math.cos(s.a) * s.r, -11 + s.y + Math.sin(s.a * 2) * .5, -18 + Math.sin(s.a) * s.r * .6); s.g.rotation.y = -s.a - Math.PI / 2; });
    clouds.children.forEach((c, i) => c.position.x += dt * (.3 + i * .05));
    bowlSurf.rotation.z = Math.sin(t * 2) * .02 * (p > .04 && p < .1 ? 10 : 1);
    if (rvSpin > 0) { rvSpin = Math.max(0, rvSpin - dt * .8); rv.rotation.y += dt * 14 * rvSpin; } else rv.rotation.y = Math.sin(t * .5) * .6;
    parked.forEach(v => { if (v.b > 0) { v.b = Math.max(0, v.b - dt * 1.4); v.g.position.y = Math.abs(Math.sin(v.b * Math.PI * 3)) * .3 * v.b; v.g.scale.set(1 + Math.sin(v.b * 20) * .04 * v.b, 1 - Math.sin(v.b * 20) * .04 * v.b, 1); } });
    if (lifeOn) {
      const aspect = innerWidth / innerHeight;
      birds.forEach(b => {
        b.a += b.sp * dt; _p.set(b.cx + Math.cos(b.a) * b.r, b.cy + b.y + Math.sin(b.a * 2 + b.ph) * .6, b.cz + Math.sin(b.a) * b.r * .5);
        if (mouse.on && b.fv.lengthSq() < .01) { _q.copy(_p).add(b.flee).project(cam); const dx = (_q.x - mouse.x) * aspect, dy = _q.y - mouse.y; if (_q.z < 1 && dx * dx + dy * dy < .03) { b.fv.set((rnd() - .5) * 6, 5 + rnd() * 3, -3 - rnd() * 3); if (t - chirpT > .4) { chirpT = t; Sound.chirp(); } } }
        b.flee.addScaledVector(b.fv, dt); b.fv.multiplyScalar(Math.pow(.25, dt)); b.flee.multiplyScalar(Math.pow(.82, dt));
        b.g.position.copy(_p).add(b.flee);
        const fl = Math.sin(t * (b.fv.lengthSq() > .1 ? 22 : 11) + b.ph) * .7; b.wl.rotation.x = fl; b.wr.rotation.x = -fl;
        const sg = Math.sign(b.sp); b.g.rotation.y = Math.atan2(-Math.cos(b.a) * .5 * sg, -Math.sin(b.a) * sg);
      });
      bflies.forEach(b => {
        const tt = t * b.sp + b.ph; _p.set(b.ax + Math.sin(tt * .7) * 1.4, b.ay + Math.sin(tt * 1.9) * .35 + b.flee, b.az + Math.cos(tt * .9) * .8);
        if (mouse.on && b.flee < .2) { _q.copy(_p).project(cam); const dx = (_q.x - mouse.x) * aspect, dy = _q.y - mouse.y; if (_q.z < 1 && dx * dx + dy * dy < .02) b.flee = 2.5; }
        b.flee = Math.max(0, b.flee - dt * .5);
        b.g.position.copy(_p); b.g.rotation.y = tt * .7; const f = Math.sin(t * 18 + b.ph) * 1.1; b.wl.rotation.y = f; b.wr.rotation.y = -f;
      });
      bugs.forEach(b => { b.a += (Math.sin(t * .7 + b.x) * .8) * dt + (b.x - b.x0) * -.02 * dt; b.x += Math.cos(b.a) * b.sp * dt; b.z = clamp(b.z + Math.sin(b.a) * b.sp * dt * .4, -9.3, -8.2); b.g.position.set(b.x, b.y, b.z); b.g.rotation.y = -b.a; });
    }

    // ---- story text
    let near = STOPS.find(s => Math.abs(s.p - p) < .0045 && s.kind !== 'title');
    if (!near && p > ABOUT0 && p < ABOUT1) near = STOPS.find(s => s.id === 'about');
    showCard(panelOpen ? null : near || null);
    if (cardFor === 'about') { const as = $('aboutScroll'); if (as) { const k = sm(ABOUT0 + .004, ABOUT1 - .008, p); as.scrollTop = k * (as.scrollHeight - as.clientHeight); const ap = $('aboutProg'); if (ap) ap.style.width = (k * 100).toFixed(1) + '%'; } }
    titleEl.classList.toggle('on', p < .012 && !panelOpen);
    const cap = !near && !panelOpen ? CAPS.find(c => p >= c[0] && p <= c[1]) : null; setCaption(cap ? cap[2] : ''); tickCaption(dt);
    hintEl.style.opacity = p < .02 ? 1 : 0;
    progEl.style.width = (p * 100).toFixed(2) + '%';
    const sec = p >= .11 && p < .51 ? 'work' : p >= .6 && p < .845 ? 'exploration' : p >= .86 && p < .99 ? 'about' : p >= .99 ? 'contact' : '';
    nav.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.go === sec));

    if (!(panelOpen && performance.now() - panelAt > 900)) renderer.render(scene, cam);
    FOL.tick(dt, t);
  }

  window.FILM = { sound: Sound, _dbg: () => ({ scene, cam, T }), jump: p => { forced = null; flyTo(p); }, go: p => { forced = p; }, free: () => { forced = null; }, stops: STOPS, state: st, open: openPanel, max: setMax, viewers: () => viewers, theme: n => setTheme(n, true), back: (on) => { facing = on ? -1 : 1; turn = on ? -Math.PI : 0; } };
  requestAnimationFrame(frame);
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
  fontsReady.then(() => setTimeout(() => $('loader').classList.add('gone'), 600));
})();
