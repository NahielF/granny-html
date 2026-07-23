// Muebles y objetos de decoración low-poly (formas simples, sin modelos externos).
import * as THREE from 'three';
import * as TEX from './textures.js';

const WOOD = 0x5a3d24;
const WOOD_DARK = 0x3b2717;
const FABRIC_RED = 0x5c1f26;
const METAL = 0x6b6e75;
const METAL_DARK = 0x33342f;

function box(w, h, d, color, mapTex) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = mapTex ? new THREE.MeshLambertMaterial({ map: mapTex }) : new THREE.MeshLambertMaterial({ color });
  return new THREE.Mesh(geo, mat);
}
function cyl(rt, rb, h, color, radial = 10) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, radial), new THREE.MeshLambertMaterial({ color }));
}
function put(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }

export function bed(size = 'double') {
  const g = new THREE.Group();
  const w = size === 'double' ? 1.5 : 0.95, len = 2.0, frameH = 0.28;
  const frame = box(w, frameH, len, WOOD_DARK);
  g.add(put(frame, 0, frameH / 2, 0));
  const mattress = box(w * 0.94, 0.22, len * 0.96, 0xe8e2d6);
  g.add(put(mattress, 0, frameH + 0.11, 0));
  const pillow = box(w * 0.4, 0.1, 0.32, 0xffffff);
  g.add(put(pillow, -(w * 0.22), frameH + 0.27, -(len / 2 - 0.28)));
  const headboard = box(w * 1.02, 0.75, 0.08, WOOD_DARK);
  g.add(put(headboard, 0, 0.5, -len / 2 - 0.02));
  const blanket = box(w * 0.94, 0.06, len * 0.55, FABRIC_RED);
  g.add(put(blanket, 0, frameH + 0.25, len * 0.18));
  return g;
}

export function nightstand() {
  const g = new THREE.Group();
  const body = box(0.4, 0.5, 0.4, WOOD);
  g.add(put(body, 0, 0.25, 0));
  const knob = cyl(0.02, 0.02, 0.08, 0xc9a24a);
  knob.rotation.z = Math.PI / 2;
  g.add(put(knob, 0.2, 0.3, 0));
  return g;
}

export function wardrobe() {
  const g = new THREE.Group();
  const body = box(1.1, 1.9, 0.55, WOOD_DARK);
  g.add(put(body, 0, 0.95, 0));
  const seam = box(0.02, 1.8, 0.56, 0x1a1210);
  g.add(put(seam, 0, 0.95, 0));
  for (const side of [-1, 1]) {
    const knob = cyl(0.018, 0.018, 0.1, 0xc9a24a);
    knob.rotation.z = Math.PI / 2;
    g.add(put(knob, side * 0.12, 0.95, 0.28));
  }
  const cornice = box(1.16, 0.08, 0.6, WOOD_DARK);
  g.add(put(cornice, 0, 1.94, 0));
  return g;
}

export function table(w = 1.4, d = 0.8, h = 0.75, topColor = WOOD) {
  const g = new THREE.Group();
  const top = box(w, 0.06, d, topColor);
  g.add(put(top, 0, h, 0));
  const legOff = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (const [sx, sz] of legOff) {
    const leg = box(0.06, h, 0.06, WOOD_DARK);
    g.add(put(leg, sx * (w / 2 - 0.08), h / 2, sz * (d / 2 - 0.08)));
  }
  return g;
}

export function chair() {
  const g = new THREE.Group();
  const seat = box(0.42, 0.05, 0.42, WOOD);
  g.add(put(seat, 0, 0.46, 0));
  const back = box(0.42, 0.5, 0.05, WOOD_DARK);
  g.add(put(back, 0, 0.7, -0.19));
  const legOff = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (const [sx, sz] of legOff) {
    const leg = box(0.05, 0.46, 0.05, WOOD_DARK);
    g.add(put(leg, sx * 0.17, 0.23, sz * 0.17));
  }
  return g;
}

export function sofa(color = FABRIC_RED) {
  const g = new THREE.Group();
  const base = box(1.8, 0.42, 0.8, color);
  g.add(put(base, 0, 0.21, 0));
  const back = box(1.8, 0.5, 0.18, color);
  g.add(put(back, 0, 0.55, -0.31));
  for (const side of [-1, 1]) {
    const arm = box(0.18, 0.5, 0.8, color);
    g.add(put(arm, side * 0.91, 0.46, 0));
  }
  for (const c of [0.5, 0, -0.5]) {
    const cushion = box(0.55, 0.12, 0.72, color);
    g.add(put(cushion, c, 0.46, 0.02));
  }
  return g;
}

export function shelfUnit(w = 1.0, h = 1.8, d = 0.35, rows = 4, color = WOOD_DARK) {
  const g = new THREE.Group();
  const back = box(w, h, 0.03, color);
  g.add(put(back, 0, h / 2, -d / 2 + 0.015));
  for (const side of [-1, 1]) {
    const side_ = box(0.03, h, d, color);
    g.add(put(side_, side * (w / 2 - 0.015), h / 2, 0));
  }
  for (let i = 0; i <= rows; i++) {
    const shelf = box(w - 0.06, 0.03, d - 0.03, color);
    g.add(put(shelf, 0, (h / rows) * i, 0));
    if (i < rows) {
      for (let b = 0; b < 3; b++) {
        const item = box(0.12, (h / rows) * 0.6, 0.2, Math.random() > 0.5 ? 0x7a5a34 : 0x8a2020);
        g.add(put(item, -w / 2 + 0.2 + b * 0.3, (h / rows) * i + (h / rows) * 0.35, 0));
      }
    }
  }
  return g;
}

export function crate(sz = 0.5) {
  const geo = new THREE.BoxGeometry(sz, sz, sz);
  const mat = new THREE.MeshLambertMaterial({ map: TEX.woodDoorTexture() });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = sz / 2;
  return mesh;
}

export function crateStack(count = 3) {
  const g = new THREE.Group();
  let y = 0;
  const positions = [[0, 0], [0.3, 0.15], [-0.15, -0.25]];
  for (let i = 0; i < count; i++) {
    const c = crate(0.48 - i * 0.02);
    const [ox, oz] = positions[i % positions.length];
    c.position.set(ox, y + 0.24, oz);
    g.add(c);
    y += 0.46;
  }
  return g;
}

export function kitchenCounter(w = 2.0) {
  const g = new THREE.Group();
  const base = box(w, 0.85, 0.6, 0xd8d2c4);
  g.add(put(base, 0, 0.425, 0));
  const top = box(w + 0.06, 0.05, 0.64, 0x2a2a2a);
  g.add(put(top, 0, 0.87, 0));
  for (let i = -1; i <= 1; i++) {
    const knob = cyl(0.015, 0.015, 0.06, 0x888);
    knob.rotation.z = Math.PI / 2;
    g.add(put(knob, i * (w / 3.2), 0.55, 0.31));
  }
  return g;
}

export function stove() {
  const g = new THREE.Group();
  const body = box(0.7, 0.85, 0.6, 0x2a2a28);
  g.add(put(body, 0, 0.425, 0));
  for (const [sx, sz] of [[-0.17, -0.13], [0.17, -0.13], [-0.17, 0.13], [0.17, 0.13]]) {
    const burner = cyl(0.09, 0.09, 0.02, 0x111);
    g.add(put(burner, sx, 0.86, sz));
  }
  return g;
}

export function sinkCounter() {
  const g = new THREE.Group();
  const base = box(0.7, 0.8, 0.5, 0xe4e0d6);
  g.add(put(base, 0, 0.4, 0));
  const basin = box(0.4, 0.08, 0.3, 0xffffff);
  g.add(put(basin, 0, 0.82, 0));
  const faucet = cyl(0.02, 0.02, 0.25, 0xaaa);
  g.add(put(faucet, 0, 0.95, -0.15));
  return g;
}

export function toilet() {
  const g = new THREE.Group();
  const base = cyl(0.22, 0.26, 0.4, 0xf2f0ea, 12);
  g.add(put(base, 0, 0.2, 0));
  const tank = box(0.4, 0.35, 0.18, 0xf2f0ea);
  g.add(put(tank, 0, 0.55, -0.2));
  return g;
}

export function desk() {
  return table(1.2, 0.6, 0.74, WOOD_DARK);
}

export function deskLamp() {
  const g = new THREE.Group();
  const base = cyl(0.08, 0.1, 0.03, 0x222);
  g.add(put(base, 0, 0.015, 0));
  const arm = box(0.02, 0.3, 0.02, 0x333);
  g.add(put(arm, 0, 0.16, 0));
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.12, 8, 1, true), new THREE.MeshLambertMaterial({ color: 0xd4a017, side: THREE.DoubleSide }));
  g.add(put(shade, 0, 0.34, 0.05));
  return g;
}

export function bookStack() {
  const g = new THREE.Group();
  const colors = [0x7a2020, 0x205a30, 0x203a6a, 0x6a5a20];
  for (let i = 0; i < colors.length; i++) {
    const b = box(0.3, 0.05, 0.2, colors[i]);
    g.add(put(b, 0, 0.025 + i * 0.05, 0));
  }
  return g;
}

export function wineRack(w = 1.2, h = 1.4) {
  const g = new THREE.Group();
  const frame = box(w, h, 0.4, WOOD_DARK);
  g.add(put(frame, 0, h / 2, 0));
  const cols = 4, rows = 3;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const bottle = cyl(0.03, 0.035, 0.32, Math.random() > 0.5 ? 0x1a2e1a : 0x2a1a10);
      bottle.rotation.x = Math.PI / 2;
      g.add(put(bottle, -w / 2 + 0.2 + c * (w / cols), 0.2 + r * (h / rows), 0.05));
    }
  }
  return g;
}

export function washerDryer() {
  const g = new THREE.Group();
  for (const side of [-1, 1]) {
    const body = box(0.6, 0.85, 0.6, 0xd8d8d8);
    g.add(put(body, side * 0.32, 0.425, 0));
    const door = cyl(0.2, 0.2, 0.04, 0x333, 16);
    door.rotation.x = Math.PI / 2;
    g.add(put(door, side * 0.32, 0.4, 0.31));
  }
  return g;
}

export function workbench() {
  const g = new THREE.Group();
  const top = table(1.6, 0.7, 0.85, 0x6b5a3c);
  g.add(top);
  const vice = box(0.15, 0.12, 0.1, METAL_DARK);
  g.add(put(vice, 0.4, 0.91, 0));
  for (let i = 0; i < 3; i++) {
    const tool = box(0.35, 0.03, 0.04, METAL);
    g.add(put(tool, -0.3 + i * 0.05, 0.89, 0.2 - i * 0.1));
  }
  return g;
}

export function boiler() {
  const g = new THREE.Group();
  const tank = cyl(0.35, 0.35, 1.3, 0x8a3a2a, 14);
  g.add(put(tank, 0, 0.65, 0));
  const cap = cyl(0.36, 0.36, 0.06, 0x5a2a1a, 14);
  g.add(put(cap, 0, 1.31, 0));
  for (let i = 0; i < 3; i++) {
    const pipe = cyl(0.04, 0.04, 0.6, METAL);
    pipe.rotation.z = Math.PI / 2;
    g.add(put(pipe, 0.3, 0.9 - i * 0.25, 0));
  }
  return g;
}

export function breakerPanel() {
  const g = new THREE.Group();
  const box_ = box(0.6, 0.8, 0.12, 0xb8bcc2);
  g.add(put(box_, 0, 0.4, 0));
  const doorFrame = box(0.54, 0.74, 0.02, 0x8c9096);
  g.add(put(doorFrame, 0, 0.4, 0.06));
  for (let i = 0; i < 6; i++) {
    const sw = box(0.06, 0.1, 0.02, i % 2 === 0 ? 0xd42c2c : 0x2cd47a);
    g.add(put(sw, -0.18 + (i % 3) * 0.18, 0.55 - Math.floor(i / 3) * 0.25, 0.08));
  }
  return g;
}

export function safeBox() {
  const g = new THREE.Group();
  const body = box(0.6, 0.6, 0.55, 0x2a2a2e);
  g.add(put(body, 0, 0.3, 0));
  const door = box(0.5, 0.5, 0.03, 0x3a3a40);
  g.add(put(door, 0, 0.3, 0.28));
  const dial = cyl(0.08, 0.08, 0.04, 0xc9a24a, 16);
  dial.rotation.x = Math.PI / 2;
  g.add(put(dial, 0, 0.35, 0.3));
  const handle = box(0.04, 0.15, 0.04, 0x111);
  g.add(put(handle, 0.18, 0.25, 0.3));
  return g;
}

export function car() {
  const g = new THREE.Group();
  const body = box(1.8, 0.55, 3.6, 0x8a1414);
  g.add(put(body, 0, 0.55, 0));
  const cabin = box(1.6, 0.5, 1.8, 0x6a1010);
  g.add(put(cabin, 0, 1.05, -0.2));
  const glassMat = new THREE.MeshLambertMaterial({ color: 0x1a2430 });
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 0.05), glassMat);
  windshield.rotation.x = 0.35;
  g.add(put(windshield, 0, 1.1, 0.68));
  for (const [sx, sz] of [[-0.85, 1.2], [0.85, 1.2], [-0.85, -1.2], [0.85, -1.2]]) {
    const wheel = cyl(0.32, 0.32, 0.25, 0x111, 14);
    wheel.rotation.z = Math.PI / 2;
    g.add(put(wheel, sx, 0.32, sz));
  }
  for (const sz of [1.75, -1.75]) {
    const light = box(0.3, 0.18, 0.05, 0xf0e8c8);
    g.add(put(light, 0, 0.55, sz));
  }
  return g;
}

export function cage(w = 1.6, d = 1.6, h = 2.2) {
  const g = new THREE.Group();
  const barMat = new THREE.MeshLambertMaterial({ color: METAL_DARK });
  const bars = 8;
  for (let side = 0; side < 4; side++) {
    const horiz = side % 2 === 0;
    const len = horiz ? w : d;
    for (let i = 0; i <= bars; i++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, h, 6), barMat);
      const t = i / bars - 0.5;
      if (side === 0) put(bar, t * w, h / 2, -d / 2);
      else if (side === 1) put(bar, w / 2, h / 2, t * d);
      else if (side === 2) put(bar, t * w, h / 2, d / 2);
      else put(bar, -w / 2, h / 2, t * d);
      g.add(bar);
    }
  }
  return g;
}

export function windowFrame(w = 1.2, h = 1.4) {
  const g = new THREE.Group();
  const frame = box(w, h, 0.1, WOOD_DARK);
  g.add(put(frame, 0, h / 2, 0));
  const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.16, h - 0.16, 0.02), new THREE.MeshLambertMaterial({ color: 0x0a1420 }));
  g.add(put(glass, 0, h / 2, 0.02));
  return g;
}

export function rug(w = 2.2, d = 1.4, color = 0x6a1f24) {
  const geo = new THREE.PlaneGeometry(w, d);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
  mesh.position.y = 0.01;
  return mesh;
}

export function pianoBox() {
  const g = new THREE.Group();
  const body = box(1.3, 0.9, 0.6, 0x1a1210);
  g.add(put(body, 0, 0.45, 0));
  const keys = box(1.1, 0.06, 0.2, 0xf2efe6);
  g.add(put(keys, 0, 0.7, 0.32));
  return g;
}

export function toyChest() {
  const g = new THREE.Group();
  const body = box(0.7, 0.4, 0.4, 0x2c5a8a);
  g.add(put(body, 0, 0.2, 0));
  const lid = box(0.74, 0.06, 0.44, 0x1c3a5a);
  g.add(put(lid, 0, 0.43, 0));
  return g;
}

export function coffeeTable() {
  return table(0.9, 0.55, 0.4, WOOD_DARK);
}

export const BUILDERS = {
  bed, nightstand, wardrobe, table, chair, sofa, shelfUnit, crate, crateStack,
  kitchenCounter, stove, sinkCounter, toilet, desk, deskLamp, bookStack, wineRack,
  washerDryer, workbench, boiler, breakerPanel, safeBox, car, cage, windowFrame,
  rug, pianoBox, toyChest, coffeeTable,
};
