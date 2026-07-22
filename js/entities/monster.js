import * as THREE from 'three';
import { clamp, dist2D, circleSegmentPush, segmentsIntersect, angleDiff, choice, EventBus } from '../utils.js';
import { audio } from '../audio.js';
import { CELL } from '../world/mapData.js';

export const MONSTER_TYPES = [
  {
    id: 'abuela', name: 'Abuela', color: 0x8a6a86, accent: 0xd8c9e0, height: 1.6, hunch: 0.18,
    speed: 2.9, chaseSpeedMult: 1.25, hearingRadius: 9, hearingMult: 1.3, visionRadius: 9, visionAngle: 1.15,
    searchDuration: 7, accessory: 'cane',
    desc: 'Oído muy fino. Escúchala llegar antes de que te vea.',
  },
  {
    id: 'abuelo', name: 'Abuelo', color: 0x585850, accent: 0x8a8a80, height: 1.68, hunch: 0.22,
    speed: 2.6, chaseSpeedMult: 1.35, hearingRadius: 8, hearingMult: 1.0, visionRadius: 9, visionAngle: 1.1,
    searchDuration: 11, accessory: 'cane',
    desc: 'Lento pero implacable: nunca deja de buscar.',
  },
  {
    id: 'bisabuela', name: 'Bisabuela', color: 0x9a9086, accent: 0xd8d2c8, height: 1.5, hunch: 0.32,
    speed: 2.2, chaseSpeedMult: 1.2, hearingRadius: 10, hearingMult: 1.5, visionRadius: 8, visionAngle: 1.0,
    searchDuration: 9, accessory: 'shawl', hiddenDetectChance: 0.12,
    desc: 'Sentidos sobrenaturales: a veces te encuentra hasta escondido.',
  },
  {
    id: 'bisabuelo', name: 'Bisabuelo', color: 0x4a3a2a, accent: 0x7a6248, height: 1.66, hunch: 0.24,
    speed: 2.7, chaseSpeedMult: 1.3, hearingRadius: 8, hearingMult: 1.1, visionRadius: 9, visionAngle: 1.1,
    searchDuration: 9, accessory: 'hat', screamInterval: 16,
    desc: 'De vez en cuando grita y delata su posición... y la tuya.',
  },
  {
    id: 'hija', name: 'La Hija', color: 0x7a1f2a, accent: 0x3a0f14, height: 1.62, hunch: 0.05,
    speed: 3.6, chaseSpeedMult: 1.55, hearingRadius: 7, hearingMult: 0.8, visionRadius: 11, visionAngle: 1.2,
    searchDuration: 6, accessory: 'none',
    desc: 'Rápida y letal en persecución, pero oye peor.',
  },
  {
    id: 'nieto', name: 'El Nieto', color: 0x2a3a6a, accent: 0x8a99c0, height: 1.3, hunch: 0.0,
    speed: 3.2, chaseSpeedMult: 1.35, hearingRadius: 8, hearingMult: 1.0, visionRadius: 9, visionAngle: 1.2,
    searchDuration: 8, accessory: 'toy', distractionMult: 1.7,
    desc: 'Errático y curioso: los señuelos lo distraen mucho más.',
  },
];

export function getMonsterType(id) { return MONSTER_TYPES.find((m) => m.id === id); }

function limb(w, h, d, color) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshLambertMaterial({ color });
  return new THREE.Mesh(geo, mat);
}

export function buildMonsterMesh(type) {
  const g = new THREE.Group();
  const skin = 0xcbb59a;
  const torsoH = type.height * 0.42;
  const torso = limb(0.44, torsoH, 0.26, type.color);
  torso.position.y = type.height - torsoH / 2 - type.height * 0.08;
  torso.rotation.x = type.hunch;
  g.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshLambertMaterial({ color: skin }));
  head.position.set(0, type.height - 0.05, -type.hunch * 0.5);
  head.position.y = torso.position.y + torsoH / 2 + 0.12 - Math.sin(type.hunch) * 0.1;
  head.position.z = -Math.sin(type.hunch) * 0.25;
  g.add(head);

  const hairColor = type.accent;
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI / 1.7), new THREE.MeshLambertMaterial({ color: hairColor }));
  hair.position.copy(head.position);
  hair.position.y += 0.05;
  g.add(hair);

  const legH = type.height * 0.4;
  for (const side of [-1, 1]) {
    const leg = limb(0.16, legH, 0.18, 0x2a2422);
    leg.position.set(side * 0.13, legH / 2, 0);
    g.add(leg);
    const arm = limb(0.13, torsoH * 0.85, 0.13, type.color);
    arm.position.set(side * 0.32, torso.position.y + 0.02, -type.hunch * 0.3);
    arm.rotation.x = type.hunch * 0.6;
    g.add(arm);
  }

  if (type.accessory === 'cane') {
    const cane = limb(0.04, type.height * 0.55, 0.04, 0x3a2410);
    cane.position.set(0.4, type.height * 0.28, -0.15);
    g.add(cane);
  } else if (type.accessory === 'hat') {
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.16, 10), new THREE.MeshLambertMaterial({ color: 0x1a1512 }));
    hat.position.copy(head.position);
    hat.position.y += 0.2;
    g.add(hat);
  } else if (type.accessory === 'shawl') {
    const shawl = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.35, 8), new THREE.MeshLambertMaterial({ color: type.accent }));
    shawl.position.set(0, torso.position.y + 0.15, -0.05);
    g.add(shawl);
  } else if (type.accessory === 'toy') {
    const toy = limb(0.1, 0.1, 0.1, 0xd4a017);
    toy.position.set(0.3, torso.position.y - 0.1, -0.2);
    g.add(toy);
  }

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeMat);
    eye.position.set(side * 0.06, head.position.y, head.position.z - 0.14);
    g.add(eye);
  }

  g.userData.eyeMat = eyeMat;
  g.userData.baseY = 0;
  return g;
}

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
    if (d < 0.35) { this.pathIndex++; return true; }
    this.facing = Math.atan2(dx, dz);
    const step = Math.min(d, speed * dt);
    this.position.x += (dx / d) * step;
    this.position.z += (dz / d) * step;
    this.position.y += (target.y - this.position.y) * clamp(dt * 2, 0, 1);
    this._resolveCollisions();
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
      this._syncMesh();
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

    this._syncMesh();
  }

  _syncMesh() {
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.facing;
    const bob = (this.state === STATE.CHASE ? 10 : 6);
    this.mesh.position.y = this.position.y + Math.abs(Math.sin(performance.now() * 0.005 * bob)) * 0.02;
  }

  get tensionContribution() {
    if (this.state === STATE.CHASE) return 1;
    if (this.state === STATE.SEARCH || this.state === STATE.INVESTIGATE) return 0.4;
    return 0;
  }
}
