// Texturas procedurales generadas con <canvas>, sin ficheros externos.
// Todas las texturas se cachean por clave: crear una textura de canvas es caro y
// muchos muebles/paredes comparten el mismo material.
import * as THREE from 'three';

const _cache = new Map();

function cached(key, factory) {
  let t = _cache.get(key);
  if (!t) { t = factory(); _cache.set(key, t); }
  return t;
}

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

function clampByte(v) { return v < 0 ? 0 : v > 255 ? 255 : v | 0; }

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

// Superpone grano/suciedad sin borrar lo ya dibujado.
function grain(ctx, size, strength = 0.06, dark = true) {
  ctx.save();
  ctx.globalAlpha = strength;
  for (let i = 0; i < size * 6; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    ctx.fillStyle = dark && Math.random() > 0.4 ? '#000' : '#fff';
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  ctx.restore();
}

// Vetas de madera reutilizables sobre un color base.
function woodGrain(ctx, size, base, streaks = 40) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < streaks; i++) {
    const y = Math.random() * size;
    const alpha = 0.04 + Math.random() * 0.1;
    ctx.strokeStyle = Math.random() > 0.5 ? `rgba(0,0,0,${alpha})` : `rgba(255,220,170,${alpha * 0.5})`;
    ctx.lineWidth = 0.6 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + (Math.random() - 0.5) * 10, size * 0.7, y + (Math.random() - 0.5) * 10, size, y + (Math.random() - 0.5) * 6);
    ctx.stroke();
  }
  // nudos ocasionales
  for (let k = 0; k < 2; k++) {
    const cx = Math.random() * size, cy = Math.random() * size;
    for (let r = 3; r < 14; r += 2.5) {
      ctx.strokeStyle = `rgba(0,0,0,${0.14 - r * 0.008})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.65, 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// ---------------------------------------------------------------- Suelos

export function woodFloorTexture() {
  return cached('woodFloor', () => {
    const size = 256;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#4a3221';
    ctx.fillRect(0, 0, size, size);
    const plankH = size / 8;
    for (let i = 0; i < 8; i++) {
      const shade = 20 + Math.sin(i * 12.9) * 10;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, i * plankH, size, plankH - 3);
      ctx.clip();
      woodGrain(ctx, size, `rgb(${74 + shade | 0},${50 + shade * 0.6 | 0},${33 + shade * 0.4 | 0})`, 14);
      ctx.restore();
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, i * plankH + plankH - 1.5);
      ctx.lineTo(size, i * plankH + plankH - 1.5);
      ctx.stroke();
    }
    grain(ctx, size, 0.05);
    return toTexture(c, [6, 6]);
  });
}

export function tileFloorTexture(colorA = '#cfc9bd', colorB = '#a8a196') {
  return cached(`tile:${colorA}:${colorB}`, () => {
    const size = 256;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    const tiles = 4;
    const t = size / tiles;
    for (let y = 0; y < tiles; y++) {
      for (let x = 0; x < tiles; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? colorA : colorB;
        ctx.fillRect(x * t, y * t, t, t);
        // manchas/desgaste por baldosa
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = '#000';
        for (let s = 0; s < 4; s++) {
          ctx.beginPath();
          ctx.arc(x * t + Math.random() * t, y * t + Math.random() * t, 2 + Math.random() * 8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 3;
    for (let i = 0; i <= tiles; i++) {
      ctx.beginPath(); ctx.moveTo(i * t, 0); ctx.lineTo(i * t, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * t); ctx.lineTo(size, i * t); ctx.stroke();
    }
    grain(ctx, size, 0.04);
    return toTexture(c, [5, 5]);
  });
}

export function carpetTexture(base = [70, 15, 20]) {
  return cached(`carpet:${base.join(',')}`, () => {
    const size = 256;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 22, base);
    // pelo de la moqueta: trazos cortos
    for (let i = 0; i < 1600; i++) {
      const x = Math.random() * size, y = Math.random() * size;
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 4, y + (Math.random() - 0.5) * 4);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(20,5,5,0.55)';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, size - 16, size - 16);
    return toTexture(c, [4, 4]);
  });
}

export function brickTexture() {
  return cached('brick', () => {
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
        // desgaste del ladrillo
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = '#000';
        for (let s = 0; s < 3; s++) {
          ctx.fillRect(x + offset + Math.random() * bw, y + Math.random() * bh, 3 + Math.random() * 6, 2 + Math.random() * 4);
        }
        ctx.restore();
      }
    }
    grain(ctx, size, 0.07);
    return toTexture(c, [4, 4]);
  });
}

export function concreteTexture(base = [78, 76, 72]) {
  return cached(`concrete:${base.join(',')}`, () => {
    const size = 256;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 18, base);
    // manchas de humedad
    for (let i = 0; i < 14; i++) {
      const x = Math.random() * size, y = Math.random() * size, r = 8 + Math.random() * 30;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,0.16)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // grietas
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    for (let i = 0; i < 5; i++) {
      ctx.lineWidth = 0.6 + Math.random();
      ctx.beginPath();
      let x = Math.random() * size, y = Math.random() * size;
      ctx.moveTo(x, y);
      for (let s = 0; s < 6; s++) {
        x += (Math.random() - 0.5) * 40; y += (Math.random() - 0.5) * 40;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    return toTexture(c, [4, 4]);
  });
}

export function grassTexture() {
  return cached('grass', () => {
    const size = 256;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#161d10';
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 14, [22, 30, 16]);
    for (let i = 0; i < 2500; i++) {
      const x = Math.random() * size, y = Math.random() * size;
      ctx.strokeStyle = `rgba(${30 + Math.random() * 40 | 0},${45 + Math.random() * 45 | 0},${20 + Math.random() * 25 | 0},0.7)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 2 - Math.random() * 3);
      ctx.stroke();
    }
    return toTexture(c, [30, 30]);
  });
}

// ---------------------------------------------------------------- Paredes

export function wallpaperTexture(base = [76, 34, 38], accent = 'rgba(20,10,10,0.4)') {
  return cached(`wallpaper:${base.join(',')}:${accent}`, () => {
    const size = 256;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 10, base);
    // rayas verticales del papel
    for (let x = 0; x < size; x += 32) {
      ctx.fillStyle = 'rgba(255,255,255,0.035)';
      ctx.fillRect(x, 0, 16, size);
    }
    // motivo floral repetido (denso: a escala de pared cada flor mide ~8 cm)
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    const step = 32;
    for (let y = 8; y < size; y += step) {
      for (let x = 8; x < size; x += step) {
        const ox = ((y / step) % 2) * (step / 2);
        ctx.save();
        ctx.translate(x + ox, y);
        for (let p = 0; p < 5; p++) {
          ctx.rotate((Math.PI * 2) / 5);
          ctx.beginPath();
          ctx.ellipse(0, -3.6, 1.7, 3.4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    // desconchones y manchas de humedad
    ctx.save();
    ctx.globalAlpha = 0.14;
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * size, y = Math.random() * size, r = 10 + Math.random() * 26;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, '#000');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return toTexture(c, [3, 2]);
  });
}

export function plasterTexture(base = [64, 58, 55]) {
  return cached(`plaster:${base.join(',')}`, () => {
    const size = 256;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 16, base);
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size, y = Math.random() * size, r = 6 + Math.random() * 22;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,0.14)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    return toTexture(c, [3, 2]);
  });
}

export function ceilingTexture() {
  return cached('ceiling', () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#241d1b';
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 12, [36, 30, 28]);
    // manchas de humedad en el techo
    for (let i = 0; i < 6; i++) {
      const x = Math.random() * size, y = Math.random() * size, r = 8 + Math.random() * 20;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(60,45,25,0.4)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    return toTexture(c, [4, 4]);
  });
}

export function trimTexture() {
  return cached('trim', () => {
    const size = 64;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    woodGrain(ctx, size, '#3a2a1c', 10);
    return toTexture(c, [8, 1]);
  });
}

// ---------------------------------------------------------------- Materiales de muebles

export function woodTexture(tone = 'mid') {
  const bases = { light: '#7a5836', mid: '#5a3d24', dark: '#3b2717', red: '#4a2418' };
  return cached(`wood:${tone}`, () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    woodGrain(ctx, size, bases[tone] || bases.mid, 26);
    grain(ctx, size, 0.05);
    return toTexture(c, [1, 1]);
  });
}

export function woodDoorTexture() {
  return cached('woodDoor', () => {
    const size = 256;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    woodGrain(ctx, size, '#4a2f1b', 34);
    // cuarterones
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 7;
    ctx.strokeRect(24, 22, size - 48, size * 0.4);
    ctx.strokeRect(24, size * 0.53, size - 48, size * 0.4);
    ctx.strokeStyle = 'rgba(255,220,180,0.09)';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 26, size - 56, size * 0.4 - 8);
    ctx.strokeRect(28, size * 0.53 + 4, size - 56, size * 0.4 - 8);
    // pomo
    const kx = size - 34, ky = size / 2;
    const g = ctx.createRadialGradient(kx - 2, ky - 2, 1, kx, ky, 8);
    g.addColorStop(0, '#f0d68a');
    g.addColorStop(1, '#8a6a20');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(kx, ky, 7.5, 0, Math.PI * 2); ctx.fill();
    grain(ctx, size, 0.05);
    return toTexture(c, [1, 1]);
  });
}

export function fabricTexture(base = [92, 31, 38]) {
  return cached(`fabric:${base.join(',')}`, () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 14, base);
    // trama de tejido
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < size; i += 3) {
      ctx.strokeStyle = i % 6 === 0 ? '#000' : '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    grain(ctx, size, 0.06);
    return toTexture(c, [2, 2]);
  });
}

export function linenTexture(base = [222, 216, 202]) {
  return cached(`linen:${base.join(',')}`, () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 12, base);
    // arrugas suaves
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    for (let i = 0; i < 26; i++) {
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      const y = Math.random() * size;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.3, y + (Math.random() - 0.5) * 20, size * 0.7, y + (Math.random() - 0.5) * 20, size, y);
      ctx.stroke();
    }
    grain(ctx, size, 0.05);
    return toTexture(c, [1, 1]);
  });
}

export function leatherTexture(base = [58, 44, 34]) {
  return cached(`leather:${base.join(',')}`, () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 14, base);
    // poro/grano irregular del cuero
    for (let i = 0; i < 380; i++) {
      const x = Math.random() * size, y = Math.random() * size;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.16)' : 'rgba(255,235,205,0.06)';
      ctx.beginPath();
      ctx.ellipse(x, y, 1 + Math.random() * 3, 1 + Math.random() * 2.4, Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    return toTexture(c, [1, 1]);
  });
}

export function metalTexture(base = [92, 95, 102]) {
  return cached(`metal:${base.join(',')}`, () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 16, base);
    // cepillado horizontal
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < size; i += 2) {
      ctx.strokeStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return toTexture(c, [2, 2]);
  });
}

export function rustTexture(base = [96, 58, 34]) {
  return cached(`rust:${base.join(',')}`, () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 26, base);
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * size, y = Math.random() * size, r = 3 + Math.random() * 14;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${120 + Math.random() * 60 | 0},${50 + Math.random() * 30 | 0},20,0.5)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    return toTexture(c, [2, 2]);
  });
}

export function ceramicTexture(base = [238, 235, 228]) {
  return cached(`ceramic:${base.join(',')}`, () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 6, base);
    // craquelado fino
    ctx.strokeStyle = 'rgba(0,0,0,0.09)';
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      let x = Math.random() * size, y = Math.random() * size;
      ctx.moveTo(x, y);
      for (let s = 0; s < 4; s++) { x += (Math.random() - 0.5) * 30; y += (Math.random() - 0.5) * 30; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    return toTexture(c, [1, 1]);
  });
}

export function paintedTexture(hex = '#c8c2b4') {
  return cached(`painted:${hex}`, () => {
    const size = 96;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, size, size);
    grain(ctx, size, 0.09);
    // brochazos
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 30; i++) {
      ctx.strokeStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.lineWidth = 1 + Math.random() * 3;
      const y = Math.random() * size;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y + (Math.random() - 0.5) * 6); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return toTexture(c, [1, 1]);
  });
}

export function carPaintTexture(hex = '#7d1418') {
  return cached(`carPaint:${hex}`, () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, size, size);
    // brillo superior
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, 'rgba(255,255,255,0.22)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.02)');
    g.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // arañazos y óxido
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 26; i++) {
      ctx.strokeStyle = Math.random() > 0.6 ? '#5a3520' : 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 0.6 + Math.random();
      const x = Math.random() * size, y = Math.random() * size;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (Math.random() - 0.5) * 26, y + (Math.random() - 0.5) * 10); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return toTexture(c, [1, 1]);
  });
}

export function bookRowTexture() {
  return cached('bookRow', () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#160f0c';
    ctx.fillRect(0, 0, size, size);
    const palette = ['#6d1f1f', '#1f4a2c', '#1e3358', '#6a5a1c', '#4a2154', '#5a3216', '#2a2a2a'];
    let x = 0;
    while (x < size) {
      const w = 5 + Math.random() * 11;
      const h = size * (0.62 + Math.random() * 0.34);
      ctx.fillStyle = palette[(Math.random() * palette.length) | 0];
      ctx.fillRect(x, size - h, w - 1.2, h);
      // relieve del lomo
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(x + w - 2.4, size - h, 1.2, h);
      ctx.fillStyle = 'rgba(230,210,150,0.4)';
      ctx.fillRect(x + 1.5, size - h + h * 0.16, w - 4.5, 1.6);
      ctx.fillRect(x + 1.5, size - h + h * 0.78, w - 4.5, 1.2);
      x += w;
    }
    grain(ctx, size, 0.05);
    return toTexture(c, [1, 1]);
  });
}

export function paintingTexture(variant = 0) {
  return cached(`painting:${variant}`, () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    if (variant % 3 === 0) {
      // retrato sombrío
      ctx.fillStyle = '#241a14';
      ctx.fillRect(0, 0, size, size);
      const g = ctx.createRadialGradient(size / 2, size * 0.42, 4, size / 2, size * 0.45, size * 0.5);
      g.addColorStop(0, '#5a4534');
      g.addColorStop(1, '#140e0a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#8d7256';
      ctx.beginPath(); ctx.ellipse(size / 2, size * 0.4, size * 0.15, size * 0.19, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a2018';
      ctx.beginPath(); ctx.moveTo(size * 0.24, size); ctx.lineTo(size * 0.36, size * 0.56); ctx.lineTo(size * 0.64, size * 0.56); ctx.lineTo(size * 0.76, size); ctx.fill();
      ctx.fillStyle = '#0a0806';
      ctx.beginPath(); ctx.arc(size * 0.45, size * 0.38, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(size * 0.55, size * 0.38, 2.4, 0, Math.PI * 2); ctx.fill();
    } else if (variant % 3 === 1) {
      // paisaje nocturno
      const g = ctx.createLinearGradient(0, 0, 0, size);
      g.addColorStop(0, '#16223a');
      g.addColorStop(1, '#0b1018');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#e8e2c0';
      ctx.beginPath(); ctx.arc(size * 0.72, size * 0.24, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0d1410';
      ctx.beginPath();
      ctx.moveTo(0, size);
      for (let x = 0; x <= size; x += 16) ctx.lineTo(x, size * (0.62 + Math.sin(x * 0.09) * 0.09));
      ctx.lineTo(size, size); ctx.fill();
    } else {
      // abstracto viejo
      ctx.fillStyle = '#2a2118';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 22; i++) {
        ctx.fillStyle = `rgba(${90 + Math.random() * 80 | 0},${60 + Math.random() * 50 | 0},${40 + Math.random() * 40 | 0},0.35)`;
        ctx.beginPath();
        ctx.ellipse(Math.random() * size, Math.random() * size, 4 + Math.random() * 22, 3 + Math.random() * 16, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    grain(ctx, size, 0.12);
    return toTexture(c, [1, 1]);
  });
}

export function curtainTexture(base = [58, 26, 30]) {
  return cached(`curtain:${base.join(',')}`, () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
    ctx.fillRect(0, 0, size, size);
    // pliegues verticales
    for (let x = 0; x < size; x += 10) {
      const g = ctx.createLinearGradient(x, 0, x + 10, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.34)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.09)');
      g.addColorStop(1, 'rgba(0,0,0,0.34)');
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, 10, size);
    }
    grain(ctx, size, 0.05);
    return toTexture(c, [1, 1]);
  });
}

export function nightSkyTexture() {
  return cached('nightSky', () => {
    const size = 512;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, '#05070f');
    g.addColorStop(0.62, '#0a1020');
    g.addColorStop(1, '#131a26');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // estrellas
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * size, y = Math.random() * size * 0.75;
      const r = Math.random() * 1.3;
      ctx.fillStyle = `rgba(255,255,${230 + Math.random() * 25 | 0},${0.25 + Math.random() * 0.7})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // luna con halo
    const mx = size * 0.74, my = size * 0.2;
    const halo = ctx.createRadialGradient(mx, my, 4, mx, my, 62);
    halo.addColorStop(0, 'rgba(220,228,255,0.5)');
    halo.addColorStop(1, 'rgba(220,228,255,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(mx, my, 62, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8ecf8';
    ctx.beginPath(); ctx.arc(mx, my, 17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(150,160,185,0.35)';
    ctx.beginPath(); ctx.arc(mx - 5, my - 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + 6, my + 3, 5.5, 0, Math.PI * 2); ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.mapping = THREE.EquirectangularReflectionMapping;
    return tex;
  });
}

// Lo que se ve a través del cristal de una ventana por la noche.
export function windowNightTexture() {
  return cached('windowNight', () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, '#1b2740');
    g.addColorStop(0.6, '#121a2c');
    g.addColorStop(1, '#0c1119');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * size, y = Math.random() * size * 0.7;
      ctx.fillStyle = `rgba(220,230,255,${0.2 + Math.random() * 0.6})`;
      ctx.beginPath(); ctx.arc(x, y, Math.random() * 1.1, 0, Math.PI * 2); ctx.fill();
    }
    // siluetas de árboles al fondo
    ctx.fillStyle = '#080c10';
    ctx.beginPath();
    ctx.moveTo(0, size);
    for (let x = 0; x <= size; x += 8) ctx.lineTo(x, size * (0.68 + Math.sin(x * 0.21) * 0.11));
    ctx.lineTo(size, size);
    ctx.fill();
    // reflejo diagonal en el cristal
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#cfe0ff';
    ctx.beginPath();
    ctx.moveTo(0, size * 0.85); ctx.lineTo(size * 0.5, 0); ctx.lineTo(size * 0.72, 0); ctx.lineTo(size * 0.2, size);
    ctx.fill();
    ctx.restore();
    return toTexture(c, [1, 1]);
  });
}

export function roofTexture() {
  return cached('roof', () => {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#1a1414';
    ctx.fillRect(0, 0, size, size);
    noise(ctx, size, size, 10, [26, 20, 20]);
    return toTexture(c, [8, 8]);
  });
}
