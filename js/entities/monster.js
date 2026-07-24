import * as THREE from 'three';
import { clamp, dist2D, circleSegmentPush, segmentsIntersect, angleDiff, choice, EventBus } from '../utils.js';
import { audio } from '../audio.js';
import { CELL } from '../world/mapData.js';
import * as TEX from '../world/textures.js';

export const MONSTER_TYPES = [
  {
    id: 'abuela', name: 'Abuela', color: 0x8a6a86, accent: 0xd8c9e0, height: 1.6, hunch: 0.18,
    speed: 2.7, chaseSpeedMult: 1.15, hearingRadius: 9, hearingMult: 1.3, visionRadius: 9, visionAngle: 1.15,
    searchDuration: 7, accessory: 'cane',
    desc: 'Oído muy fino. Escúchala llegar antes de que te vea.',
  },
  {
    id: 'abuelo', name: 'Abuelo', color: 0x585850, accent: 0x8a8a80, height: 1.68, hunch: 0.22,
    speed: 2.5, chaseSpeedMult: 1.2, hearingRadius: 8, hearingMult: 1.0, visionRadius: 9, visionAngle: 1.1,
    searchDuration: 11, accessory: 'cane',
    desc: 'Lento pero implacable: nunca deja de buscar.',
  },
  {
    id: 'bisabuela', name: 'Bisabuela', color: 0x9a9086, accent: 0xd8d2c8, height: 1.5, hunch: 0.32,
    speed: 2.1, chaseSpeedMult: 1.15, hearingRadius: 10, hearingMult: 1.5, visionRadius: 8, visionAngle: 1.0,
    searchDuration: 9, accessory: 'shawl', hiddenDetectChance: 0.12,
    desc: 'Sentidos sobrenaturales: a veces te encuentra hasta escondido.',
  },
  {
    id: 'bisabuelo', name: 'Bisabuelo', color: 0x4a3a2a, accent: 0x7a6248, height: 1.66, hunch: 0.24,
    speed: 2.5, chaseSpeedMult: 1.2, hearingRadius: 8, hearingMult: 1.1, visionRadius: 9, visionAngle: 1.1,
    searchDuration: 9, accessory: 'hat', screamInterval: 16,
    desc: 'De vez en cuando grita y delata su posición... y la tuya.',
  },
  {
    id: 'hija', name: 'La Hija', color: 0x7a1f2a, accent: 0x3a0f14, height: 1.62, hunch: 0.05,
    speed: 3.2, chaseSpeedMult: 1.35, hearingRadius: 7, hearingMult: 0.8, visionRadius: 11, visionAngle: 1.2,
    searchDuration: 6, accessory: 'none',
    desc: 'Rápida y letal en persecución, pero oye peor.',
  },
  {
    id: 'nieto', name: 'El Nieto', color: 0x2a3a6a, accent: 0x8a99c0, height: 1.3, hunch: 0.0,
    speed: 2.9, chaseSpeedMult: 1.2, hearingRadius: 8, hearingMult: 1.0, visionRadius: 9, visionAngle: 1.2,
    searchDuration: 8, accessory: 'toy', distractionMult: 1.7,
    desc: 'Errático y curioso: los señuelos lo distraen mucho más.',
  },
];

export function getMonsterType(id) { return MONSTER_TYPES.find((m) => m.id === id); }

function hexToRgb(hex) { return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]; }

function boxMesh(w, h, d, material) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
}

/**
 * Construye la malla de un antagonista. Los brazos y piernas cuelgan de pivotes
 * (grupos situados en cadera/hombro) para poder animarlos girándolos en X.
 * Se exponen en userData: {legs, arms, torso, head} para la animación de caminar.
 */
export function buildMonsterMesh(type) {
  const g = new THREE.Group();
  const clothRgb = hexToRgb(type.color);
  const accentRgb = hexToRgb(type.accent);
  const cloth = new THREE.MeshLambertMaterial({ map: TEX.fabricTexture(clothRgb) });
  const clothDark = new THREE.MeshLambertMaterial({ map: TEX.fabricTexture(clothRgb.map((v) => Math.max(0, v - 26))) });
  const accent = new THREE.MeshLambertMaterial({ map: TEX.fabricTexture(accentRgb) });
  const skinMat = new THREE.MeshLambertMaterial({ map: TEX.linenTexture([201, 176, 148]) });
  const hairMat = new THREE.MeshLambertMaterial({ map: TEX.linenTexture(accentRgb) });
  const shoeMat = new THREE.MeshLambertMaterial({ map: TEX.leatherTexture([38, 30, 26]) });

  const H = type.height;
  const legLen = H * 0.44;
  const torsoH = H * 0.34;
  const hipY = legLen;
  const shoulderY = hipY + torsoH * 0.86;
  const isChild = type.id === 'nieto';
  const shoulderW = isChild ? 0.15 : 0.19;

  // ---- Torso (inclinado por la joroba) ----
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, hipY, 0);
  torsoPivot.rotation.x = type.hunch;
  g.add(torsoPivot);

  const torso = boxMesh(shoulderW * 2.3, torsoH, 0.25, cloth);
  torsoPivot.add(put3(torso, 0, torsoH / 2, 0));
  // falda / faldón para las mujeres mayores
  if (type.id === 'abuela' || type.id === 'bisabuela' || type.id === 'hija') {
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(shoulderW * 1.15, shoulderW * 1.75, H * 0.3, 10), clothDark);
    torsoPivot.add(put3(skirt, 0, -H * 0.1, 0));
  } else {
    // camisa metida + cinturón
    torsoPivot.add(put3(boxMesh(shoulderW * 2.35, 0.06, 0.27, shoeMat), 0, 0.04, 0));
  }
  // cuello
  torsoPivot.add(put3(boxMesh(0.1, 0.08, 0.1, skinMat), 0, torsoH + 0.02, 0));

  // ---- Cabeza ----
  const headGroup = new THREE.Group();
  headGroup.position.set(0, torsoH + 0.16, 0);
  torsoPivot.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 10), skinMat);
  head.scale.set(1, 1.12, 0.94);
  headGroup.add(head);
  // nariz
  headGroup.add(put3(boxMesh(0.035, 0.05, 0.06, skinMat), 0, -0.005, -0.13));
  // pelo (casquete)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.147, 12, 10, 0, Math.PI * 2, 0, Math.PI / 1.85), hairMat);
  hair.scale.set(1, 1.1, 0.98);
  headGroup.add(put3(hair, 0, 0.012, 0.006));
  // moño para las ancianas
  if (type.id === 'abuela' || type.id === 'bisabuela') {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.062, 8, 8), hairMat);
    headGroup.add(put3(bun, 0, 0.075, 0.125));
  }
  // ojos brillantes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2a2a });
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.019, 6, 6), eyeMat);
    headGroup.add(put3(eye, s * 0.052, 0.022, -0.116));
  }

  // ---- Accesorios en la cabeza ----
  if (type.accessory === 'hat') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.018, 12), shoeMat);
    headGroup.add(put3(brim, 0, 0.1, 0));
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.13, 0.15, 12), shoeMat);
    headGroup.add(put3(crown, 0, 0.18, 0));
  } else if (type.accessory === 'shawl') {
    const shawl = new THREE.Mesh(new THREE.ConeGeometry(shoulderW * 1.9, H * 0.26, 10, 1, true), accent);
    shawl.material.side = THREE.DoubleSide;
    torsoPivot.add(put3(shawl, 0, torsoH * 0.62, 0));
  }

  // ---- Piernas con pivote en la cadera ----
  const legsArr = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * (shoulderW * 0.62), hipY, 0);
    g.add(pivot);
    const thigh = boxMesh(0.13, legLen * 0.55, 0.15, clothDark);
    pivot.add(put3(thigh, 0, -legLen * 0.275, 0));
    const shin = boxMesh(0.11, legLen * 0.45, 0.13, clothDark);
    pivot.add(put3(shin, 0, -legLen * 0.775, 0));
    const shoe = boxMesh(0.13, 0.07, 0.24, shoeMat);
    pivot.add(put3(shoe, 0, -legLen + 0.035, -0.045));
    legsArr.push(pivot);
  }

  // ---- Brazos con pivote en el hombro ----
  const armsArr = [];
  const armLen = torsoH * 1.02;
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * (shoulderW + 0.055), shoulderY, 0);
    pivot.rotation.z = side * 0.09;
    g.add(pivot);
    const upper = boxMesh(0.1, armLen * 0.55, 0.11, cloth);
    pivot.add(put3(upper, 0, -armLen * 0.275, 0));
    const fore = boxMesh(0.09, armLen * 0.45, 0.1, cloth);
    pivot.add(put3(fore, 0, -armLen * 0.775, 0));
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), skinMat);
    pivot.add(put3(hand, 0, -armLen - 0.02, 0));
    armsArr.push(pivot);
  }

  // ---- Accesorios en la mano ----
  if (type.accessory === 'cane') {
    const cane = boxMesh(0.032, H * 0.58, 0.032, shoeMat);
    armsArr[1].add(put3(cane, 0, -armLen - H * 0.29 + 0.02, 0));
    const grip = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.017, 5, 8, Math.PI), shoeMat);
    grip.rotation.y = Math.PI / 2;
    armsArr[1].add(put3(grip, 0, -armLen - 0.01, 0.04));
  } else if (type.accessory === 'toy') {
    const toy = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), new THREE.MeshLambertMaterial({ map: TEX.fabricTexture([170, 130, 30]) }));
    armsArr[1].add(put3(toy, 0, -armLen - 0.09, 0));
  }

  g.userData.eyeMat = eyeMat;
  g.userData.legs = legsArr;
  g.userData.arms = armsArr;
  g.userData.torso = torsoPivot;
  g.userData.head = headGroup;
  g.userData.baseHunch = type.hunch;
  g.userData.phase = Math.random() * Math.PI * 2;
  return g;
}

function put3(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }

const STATE = { PATROL: 'patrol', INVESTIGATE: 'investigate', CHASE: 'chase', SEARCH: 'search', STUNNED: 'stunned' };

export class Monster {
  constructor(type, house, spawn, difficultyMult = 1) {
    this.type = type;
    this.house = house;
    this.difficultyMult = difficultyMult;
    this.mesh = buildMonsterMesh(type);
    const c = house.cellCenter(spawn.floorId, spawn.col, spawn.row);
    this.position = new THREE.Vector3(c.x, c.y, c.z);
    this.currentFloorId = spawn.floorId;
    this.mesh.position.copy(this.position);
    this.facing = Math.random() * Math.PI * 2;

    this.state = STATE.PATROL;
    this.stateTimer = 0;
    this.path = [];
    this.pathIndex = 0;
    this.lastKnownPlayerPos = null;
    this.lastKnownPlayerFloor = null;
    this._perceptionTimer = Math.random();
    this._screamTimer = type.screamInterval ? Math.random() * type.screamInterval : Infinity;
    this._stunTimer = 0;
    this._distracted = null; // {position, floorId}
    this._growlCooldown = Math.random() * 6;

    this._footstepHandler = (data) => this._onNoise(data.position, data.floorId, data.running ? 1 : 0.5);
    this._noiseHandler = (data) => this._onNoise(data.position, data.floorId, data.strength || 1);
    EventBus.on('player:footstep', this._footstepHandler);
    EventBus.on('world:noise', this._noiseHandler);
  }

  dispose() {
    EventBus.off('player:footstep', this._footstepHandler);
    EventBus.off('world:noise', this._noiseHandler);
  }

  stun(duration) {
    this.state = STATE.STUNNED;
    this._stunTimer = duration;
    this.path = [];
  }

  _onNoise(pos, floorId, strength) {
    if (this.state === STATE.STUNNED || this.state === STATE.CHASE) return;
    if (floorId !== this.currentFloorId) return;
    const d = dist2D(this.position.x, this.position.z, pos.x, pos.z);
    const radius = this.type.hearingRadius * this.type.hearingMult * strength * this.difficultyMult;
    if (d <= radius) {
      this.lastKnownPlayerPos = pos.clone ? pos.clone() : new THREE.Vector3(pos.x, pos.y, pos.z);
      this.lastKnownPlayerFloor = floorId;
      if (this.state !== STATE.INVESTIGATE) {
        this.state = STATE.INVESTIGATE;
        this.stateTimer = 0;
        this.path = [];
      }
    }
  }

  distract(pos, floorId) {
    const mult = this.type.distractionMult || 1;
    this._distracted = { position: pos.clone(), floorId };
    this.state = STATE.INVESTIGATE;
    this.lastKnownPlayerPos = pos.clone();
    this.lastKnownPlayerFloor = floorId;
    this.stateTimer = -2 * mult; // tiempo extra "negativo" para alargar la investigación
  }

  _hasLineOfSight(player) {
    if (player.currentFloorId !== this.currentFloorId) return false;
    const segs = this.house.collision[this.currentFloorId] || [];
    for (const seg of segs) {
      if (seg.doorId) {
        const d = this.house.doors[seg.doorId];
        if (d && d.open) continue;
      }
      if (segmentsIntersect(this.position.x, this.position.z, player.position.x, player.position.z, seg.x1, seg.z1, seg.x2, seg.z2)) return false;
    }
    return true;
  }

  _canSeePlayer(player) {
    if (player.hidden || player.captured) return false;
    const d = dist2D(this.position.x, this.position.z, player.position.x, player.position.z);
    let visionR = this.type.visionRadius;
    if (player.flashlightOn) visionR *= 1.35;
    if (d > visionR) return false;
    const angleToPlayer = Math.atan2(player.position.x - this.position.x, player.position.z - this.position.z);
    const facingVec = angleDiff(angleToPlayer, this.facing);
    if (Math.abs(facingVec) > this.type.visionAngle / 2) return false;
    return this._hasLineOfSight(player);
  }

  _pickPatrolTarget() {
    const cells = this.house.allRoomCells(this.currentFloorId).filter((c) => !c.dark || Math.random() < 0.3);
    if (cells.length === 0) return;
    const target = choice(cells);
    const startCol = Math.floor(this.position.x / CELL), startRow = Math.floor(this.position.z / CELL);
    const path = this.house.findPath(this.currentFloorId, startCol, startRow, this.currentFloorId, target.col, target.row);
    if (path && path.length) { this.path = path; this.pathIndex = 0; }
  }

  _pathTo(floorId, col, row) {
    const startCol = Math.floor(this.position.x / CELL), startRow = Math.floor(this.position.z / CELL);
    const path = this.house.findPath(this.currentFloorId, startCol, startRow, floorId, col, row);
    if (path && path.length) { this.path = path; this.pathIndex = 0; return true; }
    return false;
  }

  _followPath(dt, speed) {
    if (!this.path || this.pathIndex >= this.path.length) return false;
    const wp = this.path[this.pathIndex];
    if (wp.floorId !== this.currentFloorId) { this.currentFloorId = wp.floorId; }
    const target = this.house.cellCenter(wp.floorId, wp.col, wp.row);
    const dx = target.x - this.position.x, dz = target.z - this.position.z;
    const d = Math.hypot(dx, dz);
    // Umbral generoso: el centro exacto de la celda puede estar ocupado por un mueble.
    if (d < 0.6) { this.pathIndex++; this._stuckTimer = 0; return true; }
    this.facing = Math.atan2(dx, dz);
    const step = Math.min(d, speed * dt);
    const beforeX = this.position.x, beforeZ = this.position.z;
    this.position.x += (dx / d) * step;
    this.position.z += (dz / d) * step;
    this.position.y += (target.y - this.position.y) * clamp(dt * 2, 0, 1);
    this._resolveCollisions();

    // Anti-atasco: si un mueble bloquea el camino y apenas avanzamos, saltamos el
    // punto de ruta; si sigue sin haber progreso, replanificamos desde cero.
    const progress = dist2D(beforeX, beforeZ, this.position.x, this.position.z);
    if (progress < step * 0.35) {
      this._stuckTimer = (this._stuckTimer || 0) + dt;
      // rodea el obstáculo desplazándose de lado
      const side = this._stuckSide || (this._stuckSide = Math.random() < 0.5 ? -1 : 1);
      this.position.x += Math.cos(this.facing) * side * speed * dt * 0.8;
      this.position.z -= Math.sin(this.facing) * side * speed * dt * 0.8;
      this._resolveCollisions();
      if (this._stuckTimer > 1.2) {
        this._stuckTimer = 0;
        this._stuckSide = null;
        this.pathIndex++;
        if (this.pathIndex >= this.path.length) { this.path = []; return false; }
      }
    } else {
      this._stuckTimer = 0;
      this._stuckSide = null;
    }
    return true;
  }

  _resolveCollisions() {
    const segs = this.house.collision[this.currentFloorId] || [];
    const doors = this.house.doors;
    for (const seg of segs) {
      if (seg.doorId) {
        const d = doors[seg.doorId];
        if (d && d.open) continue;
      }
      const push = circleSegmentPush(this.position.x, this.position.z, 0.32, seg.x1, seg.z1, seg.x2, seg.z2);
      if (push) { this.position.x += push.dx; this.position.z += push.dz; }
    }
  }

  update(dt, player) {
    if (this.state === STATE.STUNNED) {
      this._stunTimer -= dt;
      if (this._stunTimer <= 0) { this.state = STATE.PATROL; this._pickPatrolTarget(); }
      this._syncMesh(dt);
      return;
    }

    this._perceptionTimer -= dt;
    if (this._perceptionTimer <= 0) {
      this._perceptionTimer = 0.18;
      if (this._canSeePlayer(player)) {
        this.state = STATE.CHASE;
        this.path = [];
        this.lastKnownPlayerPos = player.position.clone();
        this.lastKnownPlayerFloor = player.currentFloorId;
      } else if (this.type.hiddenDetectChance && player.hidden && player.currentFloorId === this.currentFloorId) {
        const d = dist2D(this.position.x, this.position.z, player.position.x, player.position.z);
        if (d < 4 && Math.random() < this.type.hiddenDetectChance * dt) {
          this.state = STATE.CHASE;
          this.lastKnownPlayerPos = player.position.clone();
          this.lastKnownPlayerFloor = player.currentFloorId;
        }
      }
    }

    if (this.type.screamInterval) {
      this._screamTimer -= dt;
      if (this._screamTimer <= 0) {
        this._screamTimer = this.type.screamInterval * (0.7 + Math.random() * 0.6);
        if (player.currentFloorId === this.currentFloorId) {
          audio.growl();
          EventBus.emit('monster:scream', { position: this.position.clone() });
        }
      }
    }

    switch (this.state) {
      case STATE.PATROL: {
        if (!this._followPath(dt, this.type.speed * this.difficultyMult)) this._pickPatrolTarget();
        this.stateTimer += dt;
        if (this.stateTimer > 20) { this.stateTimer = 0; this._pickPatrolTarget(); }
        break;
      }
      case STATE.INVESTIGATE: {
        if (this.lastKnownPlayerFloor && this.lastKnownPlayerPos) {
          const col = Math.floor(this.lastKnownPlayerPos.x / CELL), row = Math.floor(this.lastKnownPlayerPos.z / CELL);
          if (this.path.length === 0) this._pathTo(this.lastKnownPlayerFloor, col, row);
        }
        const moved = this._followPath(dt, this.type.speed * 1.1 * this.difficultyMult);
        this.stateTimer += dt;
        if (!moved || this.stateTimer > 6) {
          this.state = STATE.SEARCH;
          this.stateTimer = 0;
        }
        break;
      }
      case STATE.SEARCH: {
        if (this.path.length === 0 && this.pathIndex >= this.path.length) this._pickPatrolTarget();
        this._followPath(dt, this.type.speed * this.difficultyMult);
        this.stateTimer += dt;
        if (this.stateTimer > this.type.searchDuration) {
          this.state = STATE.PATROL;
          this.stateTimer = 0;
          this._pickPatrolTarget();
        }
        break;
      }
      case STATE.CHASE: {
        const target = player.hidden ? this.lastKnownPlayerPos : player.position;
        if (target) {
          const dx = target.x - this.position.x, dz = target.z - this.position.z;
          const d = Math.hypot(dx, dz);
          if (d > 0.05) {
            this.facing = Math.atan2(dx, dz);
            const speed = this.type.speed * this.type.chaseSpeedMult * this.difficultyMult;
            const step = Math.min(d, speed * dt);
            this.position.x += (dx / d) * step;
            this.position.z += (dz / d) * step;
            this._resolveCollisions();
          }
          this.lastKnownPlayerPos = player.hidden ? this.lastKnownPlayerPos : player.position.clone();
        }
        if (!this._canSeePlayer(player)) {
          this.stateTimer += dt;
          if (this.stateTimer > 1.2) { this.state = STATE.SEARCH; this.stateTimer = 0; this.path = []; }
        } else {
          this.stateTimer = 0;
        }
        if (!player.hidden && !player.captured) {
          const d = dist2D(this.position.x, this.position.z, player.position.x, player.position.z);
          if (d < 0.85 && player.currentFloorId === this.currentFloorId) {
            EventBus.emit('monster:capture', { monster: this });
          }
        }
        break;
      }
    }

    this._syncMesh(dt);
  }

  _syncMesh(dt = 0) {
    this.mesh.rotation.y = this.facing;

    const ud = this.mesh.userData;
    // Distancia recorrida este frame -> hace avanzar el ciclo de paso.
    const moved = this._lastMeshPos
      ? dist2D(this.position.x, this.position.z, this._lastMeshPos.x, this._lastMeshPos.z)
      : 0;
    if (!this._lastMeshPos) this._lastMeshPos = { x: this.position.x, z: this.position.z };
    else { this._lastMeshPos.x = this.position.x; this._lastMeshPos.z = this.position.z; }

    const stunned = this.state === STATE.STUNNED;
    const speedNow = dt > 0 ? moved / dt : 0;
    ud.phase += moved * 3.4;

    const swing = stunned ? 0 : Math.min(0.85, speedNow * 0.19);
    const s = Math.sin(ud.phase);
    const c = Math.cos(ud.phase);

    if (ud.legs) {
      ud.legs[0].rotation.x = s * swing;
      ud.legs[1].rotation.x = -s * swing;
    }
    if (ud.arms) {
      // Al perseguir extiende los brazos hacia delante; si no, balanceo normal.
      const reach = this.state === STATE.CHASE ? -1.15 : 0;
      ud.arms[0].rotation.x = reach - s * swing * 0.75;
      ud.arms[1].rotation.x = reach + s * swing * 0.75;
    }
    if (ud.torso) {
      ud.torso.rotation.x = ud.baseHunch + (this.state === STATE.CHASE ? 0.16 : 0) + Math.abs(c) * swing * 0.05;
      ud.torso.rotation.z = s * swing * 0.05;
    }
    if (ud.head) {
      // mira alrededor mientras busca
      ud.head.rotation.y = (this.state === STATE.SEARCH || this.state === STATE.INVESTIGATE)
        ? Math.sin(performance.now() * 0.0016 + ud.phase) * 0.55 : 0;
    }
    if (stunned) {
      // se tambalea aturdido
      this.mesh.rotation.z = Math.sin(performance.now() * 0.011) * 0.16;
    } else {
      this.mesh.rotation.z = 0;
    }

    this.mesh.position.set(this.position.x, this.position.y + Math.abs(c) * swing * 0.035, this.position.z);
  }

  get tensionContribution() {
    if (this.state === STATE.CHASE) return 1;
    if (this.state === STATE.SEARCH || this.state === STATE.INVESTIGATE) return 0.4;
    return 0;
  }
}
