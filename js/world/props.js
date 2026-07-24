// Muebles y objetos de decoración low-poly, todos texturizados con materiales
// compartidos. Cada mueble declara `userData.footprint = {w, d}` con su huella en
// planta; furniture.js la usa para generar colisión (si falta, no colisiona).
import * as THREE from 'three';
import { M } from './materials.js';
import * as TEX from './textures.js';

function box(w, h, d, material) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
}
function cyl(rt, rb, h, material, radial = 12) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, radial), material);
}
function put(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }
function foot(g, w, d) { g.userData.footprint = { w, d }; return g; }

function legs(g, w, d, h, material, inset = 0.08, thick = 0.06) {
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    g.add(put(box(thick, h, thick, material), sx * (w / 2 - inset), h / 2, sz * (d / 2 - inset)));
  }
}

// ------------------------------------------------------------ Dormitorio

export function bed(size = 'double') {
  const g = new THREE.Group();
  const w = size === 'double' ? 1.5 : 0.95, len = 2.0, frameH = 0.3;
  g.add(put(box(w, frameH, len, M.woodDark()), 0, frameH / 2 + 0.08, 0));
  legs(g, w, len, 0.12, M.woodDark(), 0.06, 0.09);
  // colchón + sábana
  g.add(put(box(w * 0.94, 0.24, len * 0.96, M.linen()), 0, frameH + 0.2, 0));
  // manta a los pies
  g.add(put(box(w * 0.96, 0.09, len * 0.5, M.fabricRed()), 0, frameH + 0.36, len * 0.2));
  // almohadas
  const px = size === 'double' ? w * 0.24 : 0;
  for (const s of (size === 'double' ? [-1, 1] : [0])) {
    g.add(put(box(w * (size === 'double' ? 0.42 : 0.6), 0.12, 0.34, M.pillow()), s * px, frameH + 0.38, -(len / 2 - 0.3)));
  }
  // cabecero con listones
  g.add(put(box(w * 1.04, 0.8, 0.09, M.woodDark()), 0, 0.55, -len / 2 - 0.03));
  for (let i = -2; i <= 2; i++) {
    g.add(put(box(0.05, 0.62, 0.11, M.wood()), i * (w * 0.17), 0.6, -len / 2 - 0.04));
  }
  g.add(put(box(w * 1.02, 0.12, 0.09, M.woodDark()), 0, 0.2, len / 2 + 0.03));
  return foot(g, w + 0.1, len + 0.12);
}

export function nightstand() {
  const g = new THREE.Group();
  g.add(put(box(0.44, 0.5, 0.42, M.wood()), 0, 0.3, 0));
  legs(g, 0.44, 0.42, 0.06, M.woodDark(), 0.05, 0.05);
  for (const y of [0.22, 0.4]) {
    g.add(put(box(0.36, 0.14, 0.02, M.woodDark()), 0, y, 0.22));
    const knob = cyl(0.018, 0.018, 0.06, M.brass(), 8);
    knob.rotation.x = Math.PI / 2;
    g.add(put(knob, 0, y, 0.25));
  }
  return foot(g, 0.46, 0.44);
}

export function wardrobe() {
  const g = new THREE.Group();
  g.add(put(box(1.12, 1.9, 0.56, M.woodDark()), 0, 0.95, 0));
  // puertas con panel
  for (const s of [-1, 1]) {
    g.add(put(box(0.5, 1.7, 0.03, M.woodDoor()), s * 0.28, 0.95, 0.29));
    const knob = cyl(0.02, 0.02, 0.07, M.brass(), 8);
    knob.rotation.x = Math.PI / 2;
    g.add(put(knob, s * 0.08, 0.95, 0.33));
  }
  g.add(put(box(1.2, 0.1, 0.62, M.woodDark()), 0, 1.95, 0));
  g.add(put(box(1.16, 0.08, 0.6, M.wood()), 0, 0.04, 0));
  return foot(g, 1.14, 0.58);
}

export function dresser() {
  const g = new THREE.Group();
  g.add(put(box(1.0, 0.9, 0.48, M.wood()), 0, 0.5, 0));
  legs(g, 1.0, 0.48, 0.1, M.woodDark(), 0.07, 0.07);
  for (let i = 0; i < 3; i++) {
    g.add(put(box(0.86, 0.22, 0.02, M.woodDark()), 0, 0.25 + i * 0.26, 0.25));
    for (const s of [-1, 1]) {
      const knob = cyl(0.02, 0.02, 0.06, M.brass(), 8);
      knob.rotation.x = Math.PI / 2;
      g.add(put(knob, s * 0.22, 0.25 + i * 0.26, 0.28));
    }
  }
  return foot(g, 1.02, 0.5);
}

// ------------------------------------------------------------ Salón / comedor

export function table(w = 1.4, d = 0.8, h = 0.75, tone = 'mid') {
  const g = new THREE.Group();
  const mtl = tone === 'dark' ? M.woodDark() : tone === 'light' ? M.woodLight() : M.wood();
  g.add(put(box(w, 0.07, d, mtl), 0, h, 0));
  g.add(put(box(w - 0.14, 0.05, d - 0.14, M.woodDark()), 0, h - 0.07, 0));
  legs(g, w, d, h - 0.07, M.woodDark());
  return foot(g, w, d);
}

export function chair() {
  const g = new THREE.Group();
  g.add(put(box(0.44, 0.06, 0.44, M.wood()), 0, 0.46, 0));
  g.add(put(box(0.4, 0.04, 0.4, M.fabricRed()), 0, 0.5, 0));
  g.add(put(box(0.44, 0.56, 0.05, M.woodDark()), 0, 0.74, -0.2));
  for (let i = -1; i <= 1; i++) {
    g.add(put(box(0.05, 0.44, 0.06, M.wood()), i * 0.13, 0.7, -0.2));
  }
  legs(g, 0.44, 0.44, 0.46, M.woodDark(), 0.05, 0.05);
  return foot(g, 0.46, 0.46);
}

export function sofa(tone = 'red') {
  const g = new THREE.Group();
  const fab = tone === 'green' ? M.fabricGreen() : tone === 'brown' ? M.fabricBrown() : M.fabricRed();
  g.add(put(box(1.85, 0.34, 0.82, fab), 0, 0.3, 0));
  legs(g, 1.85, 0.82, 0.14, M.woodDark(), 0.12, 0.07);
  g.add(put(box(1.85, 0.56, 0.2, fab), 0, 0.6, -0.32));
  for (const s of [-1, 1]) g.add(put(box(0.2, 0.52, 0.82, fab), s * 0.92, 0.5, 0));
  for (const c of [-0.56, 0, 0.56]) {
    g.add(put(box(0.54, 0.15, 0.72, fab), c, 0.54, 0.03));
    g.add(put(box(0.38, 0.34, 0.12, M.fabricBrown()), c, 0.72, -0.24));
  }
  return foot(g, 1.9, 0.86);
}

export function armchair() {
  const g = new THREE.Group();
  const fab = M.fabricGreen();
  g.add(put(box(0.8, 0.32, 0.8, fab), 0, 0.3, 0));
  legs(g, 0.8, 0.8, 0.14, M.woodDark(), 0.1, 0.06);
  g.add(put(box(0.8, 0.58, 0.18, fab), 0, 0.6, -0.31));
  for (const s of [-1, 1]) g.add(put(box(0.18, 0.5, 0.8, fab), s * 0.4, 0.5, 0));
  g.add(put(box(0.6, 0.14, 0.66, fab), 0, 0.53, 0.02));
  return foot(g, 0.84, 0.84);
}

export function coffeeTable() {
  const g = table(0.95, 0.58, 0.42, 'dark');
  const glass = box(0.85, 0.02, 0.5, M.glass());
  g.add(put(glass, 0, 0.44, 0));
  return foot(g, 0.95, 0.58);
}

export function shelfUnit(w = 1.0, h = 1.8, d = 0.35, rows = 4) {
  const g = new THREE.Group();
  const mtl = M.woodDark();
  g.add(put(box(w, h, 0.04, mtl), 0, h / 2, -d / 2 + 0.02));
  for (const s of [-1, 1]) g.add(put(box(0.04, h, d, mtl), s * (w / 2 - 0.02), h / 2, 0));
  g.add(put(box(w, 0.05, d, mtl), 0, h + 0.02, 0));
  for (let i = 0; i <= rows; i++) {
    const y = (h / rows) * i;
    g.add(put(box(w - 0.08, 0.035, d - 0.04, mtl), 0, y, 0));
    if (i < rows) {
      // fila de libros con textura de lomos
      const rowH = (h / rows) * 0.62;
      const booksMesh = box(w - 0.16, rowH, d * 0.62, M.books());
      g.add(put(booksMesh, 0, y + rowH / 2 + 0.02, -0.02));
    }
  }
  return foot(g, w, d);
}

export function pianoBox() {
  const g = new THREE.Group();
  g.add(put(box(1.35, 0.92, 0.62, M.paintedBlack()), 0, 0.5, 0));
  legs(g, 1.35, 0.62, 0.06, M.paintedBlack(), 0.1, 0.09);
  g.add(put(box(1.4, 0.06, 0.68, M.paintedBlack()), 0, 0.97, 0));
  // teclas
  g.add(put(box(1.12, 0.05, 0.22, M.ceramic()), 0, 0.73, 0.32));
  for (let i = 0; i < 15; i++) {
    g.add(put(box(0.035, 0.045, 0.13, M.paintedBlack()), -0.5 + i * 0.072, 0.77, 0.28));
  }
  g.add(put(box(1.12, 0.2, 0.04, M.woodDark()), 0, 0.86, 0.42));
  return foot(g, 1.4, 0.68);
}

// ------------------------------------------------------------ Cocina / baño

export function kitchenCounter(w = 2.0) {
  const g = new THREE.Group();
  g.add(put(box(w, 0.82, 0.6, M.paintedWhite()), 0, 0.45, 0));
  g.add(put(box(w + 0.06, 0.06, 0.66, M.paintedBlack()), 0, 0.89, 0));
  const doors = Math.max(2, Math.round(w / 0.65));
  for (let i = 0; i < doors; i++) {
    const cx = -w / 2 + (w / doors) * (i + 0.5);
    g.add(put(box(w / doors - 0.06, 0.62, 0.02, M.woodLight()), cx, 0.44, 0.31));
    const knob = cyl(0.015, 0.015, 0.05, M.metal(), 8);
    knob.rotation.x = Math.PI / 2;
    g.add(put(knob, cx + w / doors / 2 - 0.08, 0.62, 0.34));
  }
  return foot(g, w, 0.62);
}

export function stove() {
  const g = new THREE.Group();
  g.add(put(box(0.72, 0.82, 0.6, M.metal()), 0, 0.45, 0));
  g.add(put(box(0.74, 0.05, 0.62, M.paintedBlack()), 0, 0.89, 0));
  for (const [sx, sz] of [[-0.17, -0.13], [0.17, -0.13], [-0.17, 0.13], [0.17, 0.13]]) {
    g.add(put(cyl(0.085, 0.085, 0.02, M.metalDark(), 14), sx, 0.92, sz));
  }
  // puerta del horno + tirador
  g.add(put(box(0.6, 0.46, 0.02, M.glassDark()), 0, 0.42, 0.31));
  const bar = cyl(0.02, 0.02, 0.56, M.metal(), 8);
  bar.rotation.z = Math.PI / 2;
  g.add(put(bar, 0, 0.68, 0.34));
  for (let i = -1; i <= 1; i++) g.add(put(cyl(0.025, 0.025, 0.03, M.metalDark(), 8), i * 0.2, 0.86, 0.3));
  return foot(g, 0.74, 0.62);
}

export function fridge() {
  const g = new THREE.Group();
  g.add(put(box(0.72, 1.75, 0.68, M.paintedWhite()), 0, 0.875, 0));
  g.add(put(box(0.7, 0.6, 0.03, M.metal()), 0, 1.4, 0.35));
  g.add(put(box(0.7, 1.05, 0.03, M.metal()), 0, 0.56, 0.35));
  for (const y of [1.14, 0.98]) {
    const h = cyl(0.02, 0.02, 0.3, M.metalDark(), 8);
    g.add(put(h, 0.26, y, 0.38));
  }
  return foot(g, 0.74, 0.7);
}

export function sinkCounter() {
  const g = new THREE.Group();
  g.add(put(box(0.72, 0.78, 0.52, M.paintedWhite()), 0, 0.42, 0));
  g.add(put(box(0.76, 0.06, 0.56, M.ceramicGrey()), 0, 0.84, 0));
  g.add(put(box(0.42, 0.06, 0.32, M.ceramic()), 0, 0.86, 0.02));
  const faucet = cyl(0.022, 0.022, 0.26, M.metal(), 8);
  g.add(put(faucet, 0, 1.0, -0.16));
  const spout = cyl(0.018, 0.018, 0.16, M.metal(), 8);
  spout.rotation.x = Math.PI / 2;
  g.add(put(spout, 0, 1.12, -0.09));
  return foot(g, 0.74, 0.54);
}

export function toilet() {
  const g = new THREE.Group();
  g.add(put(cyl(0.21, 0.25, 0.36, M.ceramic(), 14), 0, 0.18, 0));
  g.add(put(box(0.42, 0.06, 0.36, M.ceramic()), 0, 0.39, 0.02));
  g.add(put(box(0.42, 0.4, 0.2, M.ceramic()), 0, 0.6, -0.2));
  g.add(put(box(0.44, 0.04, 0.22, M.ceramicGrey()), 0, 0.82, -0.2));
  return foot(g, 0.44, 0.56);
}

export function bathtub() {
  const g = new THREE.Group();
  g.add(put(box(1.6, 0.55, 0.72, M.ceramic()), 0, 0.28, 0));
  g.add(put(box(1.44, 0.1, 0.56, M.glassDark()), 0, 0.52, 0));
  const faucet = cyl(0.02, 0.02, 0.16, M.metal(), 8);
  g.add(put(faucet, 0.7, 0.63, 0));
  return foot(g, 1.62, 0.74);
}

// ------------------------------------------------------------ Despacho / biblioteca

export function desk() {
  const g = new THREE.Group();
  g.add(put(box(1.3, 0.07, 0.66, M.woodDark()), 0, 0.75, 0));
  legs(g, 1.3, 0.66, 0.72, M.woodDark(), 0.09, 0.07);
  // cajonera lateral
  g.add(put(box(0.42, 0.56, 0.6, M.wood()), 0.4, 0.42, 0));
  for (let i = 0; i < 2; i++) {
    g.add(put(box(0.36, 0.2, 0.02, M.woodDark()), 0.4, 0.3 + i * 0.26, 0.31));
    const knob = cyl(0.016, 0.016, 0.05, M.brass(), 8);
    knob.rotation.x = Math.PI / 2;
    g.add(put(knob, 0.4, 0.3 + i * 0.26, 0.34));
  }
  return foot(g, 1.32, 0.68);
}

export function deskLamp() {
  const g = new THREE.Group();
  g.add(put(cyl(0.09, 0.11, 0.035, M.metalDark(), 12), 0, 0.02, 0));
  const arm = box(0.025, 0.32, 0.025, M.metalDark());
  arm.rotation.x = 0.18;
  g.add(put(arm, 0, 0.19, -0.02));
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.14, 10, 1, true), new THREE.MeshLambertMaterial({ color: 0x2a2a2e, side: THREE.DoubleSide }));
  shade.rotation.x = Math.PI * 0.86;
  g.add(put(shade, 0, 0.36, 0.05));
  g.add(put(new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), M.lampGlow()), 0, 0.32, 0.06));
  return g; // pequeño, sin colisión
}

export function bookStack() {
  const g = new THREE.Group();
  const mats = [M.fabricRed(), M.fabricGreen(), M.fabricBlue(), M.fabricBrown()];
  for (let i = 0; i < 4; i++) {
    const b = box(0.3 - i * 0.015, 0.05, 0.21 - i * 0.01, mats[i]);
    b.rotation.y = (Math.random() - 0.5) * 0.3;
    g.add(put(b, (Math.random() - 0.5) * 0.03, 0.025 + i * 0.05, (Math.random() - 0.5) * 0.03));
  }
  return g;
}

export function globeStand() {
  const g = new THREE.Group();
  g.add(put(cyl(0.12, 0.16, 0.03, M.woodDark(), 12), 0, 0.015, 0));
  g.add(put(cyl(0.02, 0.02, 0.5, M.woodDark(), 8), 0, 0.26, 0));
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), M.fabricBlue());
  g.add(put(ball, 0, 0.66, 0));
  return foot(g, 0.34, 0.34);
}

// ------------------------------------------------------------ Sótano / taller

export function crate(sz = 0.5) {
  const g = new THREE.Group();
  g.add(put(box(sz, sz, sz, M.woodDoor()), 0, sz / 2, 0));
  // listones en cruz
  for (const [ax, az] of [[0, 1], [1, 0]]) {
    const plank = box(ax ? sz * 1.02 : 0.06, 0.05, az ? sz * 1.02 : 0.06, M.woodDark());
    g.add(put(plank, ax ? 0 : (sz / 2) * 1.01, sz * 0.7, az ? (sz / 2) * 1.01 : 0));
  }
  return foot(g, sz, sz);
}

export function crateStack(count = 3) {
  const g = new THREE.Group();
  const offsets = [[0, 0], [0.26, 0.12], [-0.13, -0.2]];
  let y = 0, maxR = 0.5;
  for (let i = 0; i < count; i++) {
    const sz = 0.5 - i * 0.03;
    const c = crate(sz);
    const [ox, oz] = offsets[i % offsets.length];
    c.position.set(ox, y, oz);
    c.rotation.y = (i * 0.4) % Math.PI;
    c.userData.footprint = null;
    g.add(c);
    y += sz;
    maxR = Math.max(maxR, Math.abs(ox) + sz / 2, Math.abs(oz) + sz / 2);
  }
  return foot(g, maxR * 2, maxR * 2);
}

export function wineRack(w = 1.2, h = 1.4) {
  const g = new THREE.Group();
  g.add(put(box(w, h, 0.42, M.woodDark()), 0, h / 2, 0));
  const cols = 4, rows = 3;
  const bottleMats = [M.fabricGreen(), M.woodRed(), M.glassDark()];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      // hueco oscuro + botella asomando
      g.add(put(box(w / cols - 0.06, h / rows - 0.08, 0.02, M.paintedBlack()), -w / 2 + (w / cols) * (c + 0.5), 0.22 + r * (h / rows), 0.21));
      const bottle = cyl(0.032, 0.038, 0.3, bottleMats[(c + r) % bottleMats.length], 8);
      bottle.rotation.x = Math.PI / 2;
      g.add(put(bottle, -w / 2 + (w / cols) * (c + 0.5), 0.22 + r * (h / rows), 0.14));
    }
  }
  return foot(g, w, 0.44);
}

export function washerDryer() {
  const g = new THREE.Group();
  for (const side of [-1, 1]) {
    g.add(put(box(0.62, 0.84, 0.62, M.paintedWhite()), side * 0.33, 0.42, 0));
    const door = cyl(0.2, 0.2, 0.045, M.glassDark(), 16);
    door.rotation.x = Math.PI / 2;
    g.add(put(door, side * 0.33, 0.42, 0.32));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.022, 6, 16), M.metal());
    g.add(put(ring, side * 0.33, 0.42, 0.32));
    g.add(put(box(0.56, 0.1, 0.02, M.paintedGrey()), side * 0.33, 0.76, 0.32));
  }
  return foot(g, 1.28, 0.64);
}

export function workbench() {
  const g = new THREE.Group();
  g.add(put(box(1.7, 0.09, 0.72, M.woodLight()), 0, 0.86, 0));
  legs(g, 1.7, 0.72, 0.82, M.metalDark(), 0.1, 0.07);
  g.add(put(box(1.5, 0.04, 0.6, M.woodDark()), 0, 0.28, 0));
  // panel de herramientas
  g.add(put(box(1.7, 0.7, 0.04, M.paintedGrey()), 0, 1.26, -0.34));
  for (let i = 0; i < 5; i++) {
    const tool = box(0.05, 0.26 + Math.random() * 0.12, 0.03, M.metal());
    g.add(put(tool, -0.6 + i * 0.3, 1.28, -0.3));
  }
  // tornillo de banco
  g.add(put(box(0.18, 0.14, 0.12, M.metalDark()), 0.55, 0.97, 0.05));
  return foot(g, 1.72, 0.74);
}

export function boiler() {
  const g = new THREE.Group();
  g.add(put(cyl(0.36, 0.36, 1.3, M.rust(), 16), 0, 0.65, 0));
  g.add(put(cyl(0.38, 0.38, 0.08, M.metalDark(), 16), 0, 1.32, 0));
  g.add(put(cyl(0.38, 0.38, 0.08, M.metalDark(), 16), 0, 0.04, 0));
  for (let i = 0; i < 3; i++) {
    const pipe = cyl(0.045, 0.045, 0.7, M.metal(), 8);
    pipe.rotation.z = Math.PI / 2;
    g.add(put(pipe, 0.35, 0.95 - i * 0.28, 0));
  }
  // manómetro
  g.add(put(cyl(0.07, 0.07, 0.04, M.ceramic(), 12), 0, 1.0, 0.36));
  const vpipe = cyl(0.05, 0.05, 1.4, M.metal(), 8);
  g.add(put(vpipe, -0.3, 1.6, 0));
  return foot(g, 0.78, 0.78);
}

export function breakerPanel() {
  const g = new THREE.Group();
  g.add(put(box(0.62, 0.82, 0.14, M.paintedGrey()), 0, 0.4, 0));
  g.add(put(box(0.54, 0.74, 0.02, M.metalDark()), 0, 0.4, 0.08));
  for (let i = 0; i < 6; i++) {
    g.add(put(box(0.07, 0.11, 0.03, i % 2 === 0 ? M.woodRed() : M.fabricGreen()), -0.18 + (i % 3) * 0.18, 0.56 - Math.floor(i / 3) * 0.24, 0.1));
  }
  // conductos
  for (const s of [-1, 1]) {
    const conduit = cyl(0.035, 0.035, 0.5, M.metal(), 8);
    g.add(put(conduit, s * 0.22, 0.95, 0));
  }
  return foot(g, 0.64, 0.18);
}

export function safeBox() {
  const g = new THREE.Group();
  g.add(put(box(0.66, 0.66, 0.58, M.metalDark()), 0, 0.33, 0));
  g.add(put(box(0.56, 0.56, 0.04, M.metal()), 0, 0.33, 0.3));
  const dial = cyl(0.09, 0.09, 0.05, M.brass(), 16);
  dial.rotation.x = Math.PI / 2;
  g.add(put(dial, -0.06, 0.36, 0.33));
  for (let i = 0; i < 8; i++) {
    const tick = box(0.012, 0.03, 0.01, M.metalDark());
    const a = (i / 8) * Math.PI * 2;
    g.add(put(tick, -0.06 + Math.cos(a) * 0.07, 0.36 + Math.sin(a) * 0.07, 0.36));
  }
  const handle = box(0.05, 0.2, 0.05, M.metalDark());
  g.add(put(handle, 0.17, 0.28, 0.33));
  return foot(g, 0.68, 0.6);
}

export function toolShelf() {
  return shelfUnit(1.0, 1.6, 0.34, 3);
}

// ------------------------------------------------------------ Garaje / especiales

export function car() {
  const g = new THREE.Group();
  const paint = M.carPaint();
  g.add(put(box(1.85, 0.58, 3.7, paint), 0, 0.58, 0));
  g.add(put(box(1.62, 0.52, 1.85, paint), 0, 1.1, -0.25));
  // cristales
  g.add(put(box(1.5, 0.42, 0.04, M.glass()), 0, 1.12, 0.66));
  g.add(put(box(1.5, 0.42, 0.04, M.glass()), 0, 1.12, -1.16));
  for (const s of [-1, 1]) g.add(put(box(0.04, 0.38, 1.6, M.glass()), s * 0.8, 1.12, -0.25));
  // ruedas con llanta
  for (const [sx, sz] of [[-0.9, 1.25], [0.9, 1.25], [-0.9, -1.25], [0.9, -1.25]]) {
    const wheel = cyl(0.34, 0.34, 0.26, M.paintedBlack(), 14);
    wheel.rotation.z = Math.PI / 2;
    g.add(put(wheel, sx, 0.34, sz));
    const rim = cyl(0.17, 0.17, 0.28, M.metal(), 10);
    rim.rotation.z = Math.PI / 2;
    g.add(put(rim, sx, 0.34, sz));
  }
  // faros y pilotos
  for (const s of [-1, 1]) {
    g.add(put(box(0.34, 0.2, 0.06, M.lampGlowOff()), s * 0.6, 0.62, 1.86));
    g.add(put(box(0.3, 0.16, 0.06, M.woodRed()), s * 0.62, 0.62, -1.86));
  }
  // parachoques
  for (const sz of [1.87, -1.87]) g.add(put(box(1.8, 0.16, 0.1, M.metalDark()), 0, 0.4, sz));
  return foot(g, 1.9, 3.8);
}

export function cage(w = 1.8, d = 1.8, h = 2.2) {
  const g = new THREE.Group();
  const barMat = M.rust();
  const bars = 7;
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i <= bars; i++) {
      const t = i / bars - 0.5;
      const bar = cyl(0.028, 0.028, h, barMat, 6);
      if (side === 0) put(bar, t * w, h / 2, -d / 2);
      else if (side === 1) put(bar, w / 2, h / 2, t * d);
      else if (side === 2) put(bar, t * w, h / 2, d / 2);
      else put(bar, -w / 2, h / 2, t * d);
      g.add(bar);
    }
  }
  // marcos horizontales
  for (const y of [0.06, h * 0.5, h - 0.06]) {
    for (const [ax, az, len] of [[1, 0, w], [0, 1, d]]) {
      for (const s of [-1, 1]) {
        const rail = box(ax ? len : 0.05, 0.05, az ? len : 0.05, barMat);
        g.add(put(rail, ax ? 0 : s * (w / 2), y, az ? 0 : s * (d / 2)));
      }
    }
  }
  g.add(put(box(w, 0.06, d, barMat), 0, h, 0));
  return g; // sin colisión: es la celda donde reapareces
}

export function toyChest() {
  const g = new THREE.Group();
  g.add(put(box(0.72, 0.42, 0.44, M.paintedBlue()), 0, 0.21, 0));
  g.add(put(box(0.76, 0.07, 0.48, M.woodDark()), 0, 0.45, 0));
  for (const s of [-1, 1]) g.add(put(box(0.05, 0.44, 0.46, M.metalDark()), s * 0.26, 0.22, 0));
  return foot(g, 0.76, 0.48);
}

export function rug(w = 2.2, d = 1.4, tone = 'red') {
  const geo = new THREE.PlaneGeometry(w, d);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, tone === 'blue' ? M.carpetBlue() : M.carpet());
  mesh.position.y = 0.012;
  return mesh; // sin colisión
}

export function ceilingLamp() {
  const g = new THREE.Group();
  const cord = cyl(0.012, 0.012, 0.34, M.metalDark(), 6);
  g.add(put(cord, 0, -0.17, 0));
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.22, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0x2f2722, side: THREE.DoubleSide }));
  shade.rotation.x = Math.PI;
  g.add(put(shade, 0, -0.44, 0));
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), M.lampGlowOff());
  g.add(put(bulb, 0, -0.5, 0));
  g.userData.bulb = bulb;
  return g;
}

export function painting(variant = 0, w = 0.8, h = 0.6) {
  const g = new THREE.Group();
  g.add(put(box(w + 0.08, h + 0.08, 0.05, M.brass()), 0, 0, 0));
  g.add(put(box(w, h, 0.02, M.painting(variant % 3)), 0, 0, 0.03));
  return g;
}

export function curtainPair(w = 1.3, h = 1.6) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const panel = box(w * 0.3, h, 0.05, M.curtain());
    g.add(put(panel, s * w * 0.34, h / 2, 0));
  }
  const rod = cyl(0.022, 0.022, w * 1.1, M.brass(), 8);
  rod.rotation.z = Math.PI / 2;
  g.add(put(rod, 0, h + 0.04, 0));
  return g;
}

export const BUILDERS = {
  bed, nightstand, wardrobe, dresser,
  table, chair, sofa, armchair, coffeeTable, shelfUnit, pianoBox,
  kitchenCounter, stove, fridge, sinkCounter, toilet, bathtub,
  desk, deskLamp, bookStack, globeStand,
  crate, crateStack, wineRack, washerDryer, workbench, boiler, breakerPanel, safeBox, toolShelf,
  car, cage, toyChest, rug, ceilingLamp, painting, curtainPair,
};
