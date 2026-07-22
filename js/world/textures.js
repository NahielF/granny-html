// Texturas procedurales generadas con <canvas>, sin ficheros externos.
import * as THREE from 'three';

function makeCanvas(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

function toTexture(canvas, repeat = [4, 4]) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function noise(ctx, w, h, amount, base) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] = clampByte(base[0] + n);
    d[i + 1] = clampByte(base[1] + n);
    d[i + 2] = clampByte(base[2] + n);
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
function clampByte(v) { return v < 0 ? 0 : v > 255 ? 255 : v | 0; }

export function woodFloorTexture() {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#4a3221';
  ctx.fillRect(0, 0, size, size);
  const plankH = size / 8;
  for (let i = 0; i < 8; i++) {
    const shade = 20 + Math.sin(i * 12.9) * 10;
    ctx.fillStyle = `rgb(${74 + shade | 0},${50 + shade * 0.6 | 0},${33 + shade * 0.4 | 0})`;
    ctx.fillRect(0, i * plankH, size, plankH - 3);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, i * plankH + plankH - 1.5);
    ctx.lineTo(size, i * plankH + plankH - 1.5);
    ctx.stroke();
    for (let g = 0; g < 6; g++) {
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const y = i * plankH + 2 + Math.random() * (plankH - 4);
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.3, y + 4, size * 0.7, y - 4, size, y);
      ctx.stroke();
    }
  }
  return toTexture(c, [6, 6]);
}

export function tileFloorTexture(colorA = '#cfc9bd', colorB = '#a8a196') {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  const tiles = 4;
  const t = size / tiles;
  for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? colorA : colorB;
      ctx.fillRect(x * t, y * t, t, t);
    }
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= tiles; i++) {
    ctx.beginPath(); ctx.moveTo(i * t, 0); ctx.lineTo(i * t, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * t); ctx.lineTo(size, i * t); ctx.stroke();
  }
  return toTexture(c, [5, 5]);
}

export function wallpaperTexture(base = [90, 40, 45], accent = 'rgba(20,10,10,0.4)') {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, size, 8, base);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  for (let x = -size; x < size * 2; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + size * 0.4, size);
    ctx.stroke();
  }
  ctx.fillStyle = accent;
  for (let y = 16; y < size; y += 64) {
    for (let x = 16; x < size; x += 64) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return toTexture(c, [3, 2]);
}

export function plasterTexture(base = [58, 52, 50]) {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, size, 14, base);
  return toTexture(c, [3, 2]);
}

export function brickTexture() {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2b2320';
  ctx.fillRect(0, 0, size, size);
  const bw = 44, bh = 22;
  for (let y = 0, row = 0; y < size; y += bh, row++) {
    const offset = (row % 2) * (bw / 2);
    for (let x = -bw; x < size + bw; x += bw) {
      const shade = 25 + Math.random() * 20;
      ctx.fillStyle = `rgb(${90 + shade | 0},${55 + shade * 0.5 | 0},${45 + shade * 0.3 | 0})`;
      ctx.fillRect(x + offset, y, bw - 4, bh - 4);
    }
  }
  return toTexture(c, [4, 4]);
}

export function metalTexture(base = [70, 72, 78]) {
  const size = 128;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, size, 18, base);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  for (let i = 0; i < size; i += 16) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
  }
  return toTexture(c, [2, 2]);
}

export function carpetTexture(base = [70, 15, 20]) {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, size, 20, base);
  ctx.strokeStyle = 'rgba(20,5,5,0.5)';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, size - 20, size - 20);
  return toTexture(c, [4, 4]);
}

export function woodDoorTexture() {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#3b2314';
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, size, 10, [59, 35, 20]);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, size - 40, size * 0.42);
  ctx.strokeRect(20, size * 0.52, size - 40, size * 0.42);
  ctx.fillStyle = '#caa24a';
  ctx.beginPath();
  ctx.arc(size - 40, size / 2, 6, 0, Math.PI * 2);
  ctx.fill();
  return toTexture(c, [1, 1]);
}

export function grassTexture() {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1c2414';
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, size, 16, [28, 36, 20]);
  return toTexture(c, [20, 20]);
}

export function roofTexture() {
  const size = 128;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a1414';
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, size, 10, [26, 20, 20]);
  return toTexture(c, [8, 8]);
}
