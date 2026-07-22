// Utilidades genéricas: matemáticas, colisión 2D (círculo vs segmento) y aleatoriedad.

export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function randRange(min, max) {
  return min + Math.random() * (max - min);
}

export function randInt(min, max) {
  return Math.floor(randRange(min, max + 1));
}

export function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function dist2D(ax, az, bx, bz) {
  const dx = ax - bx, dz = az - bz;
  return Math.sqrt(dx * dx + dz * dz);
}

// Mundo simple con seed lineal (para variaciones deterministas si hiciera falta)
export function makeSeededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Resuelve la colisión de un círculo (jugador o monstruo, radio r) contra un
 * segmento de pared (x1,z1)-(x2,z2). Si hay penetración, devuelve el vector
 * de corrección {dx, dz} a sumar a la posición; si no hay colisión, null.
 */
export function circleSegmentPush(px, pz, r, x1, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1;
  const lenSq = dx * dx + dz * dz;
  let t = lenSq > 0 ? ((px - x1) * dx + (pz - z1) * dz) / lenSq : 0;
  t = clamp(t, 0, 1);
  const cx = x1 + dx * t, cz = z1 + dz * t;
  const ox = px - cx, oz = pz - cz;
  const d = Math.sqrt(ox * ox + oz * oz);
  if (d < r && d > 1e-6) {
    const push = (r - d) / d;
    return { dx: ox * push, dz: oz * push };
  }
  if (d <= 1e-6) {
    return { dx: r, dz: 0 };
  }
  return null;
}

export function degToRad(d) { return (d * Math.PI) / 180; }

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// ¿Se cortan los segmentos (ax1,az1)-(ax2,az2) y (bx1,bz1)-(bx2,bz2)?
export function segmentsIntersect(ax1, az1, ax2, az2, bx1, bz1, bx2, bz2) {
  const d1x = ax2 - ax1, d1z = az2 - az1;
  const d2x = bx2 - bx1, d2z = bz2 - bz1;
  const denom = d1x * d2z - d1z * d2x;
  if (Math.abs(denom) < 1e-9) return false;
  const t = ((bx1 - ax1) * d2z - (bz1 - az1) * d2x) / denom;
  const u = ((bx1 - ax1) * d1z - (bz1 - az1) * d1x) / denom;
  return t > 0 && t < 1 && u > 0 && u < 1;
}

export function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;
}

export const EventBus = {
  _listeners: {},
  on(event, cb) {
    (this._listeners[event] ||= []).push(cb);
    return cb;
  },
  off(event, cb) {
    const arr = this._listeners[event];
    if (!arr) return;
    const i = arr.indexOf(cb);
    if (i >= 0) arr.splice(i, 1);
  },
  emit(event, data) {
    const arr = this._listeners[event];
    if (!arr) return;
    for (const cb of arr.slice()) cb(data);
  },
};
