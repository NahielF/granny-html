import * as THREE from 'three';
import { clamp, circleSegmentPush, EventBus } from '../utils.js';
import { FLOOR_H } from '../world/mapData.js';

const EYE_HEIGHT = 1.65;
const CROUCH_HEIGHT = 1.05;
const RADIUS = 0.32;
const WALK_SPEED = 2.6;
const RUN_SPEED = 4.6;
const CROUCH_SPEED = 1.35;

export class Player {
  constructor(house, spawn) {
    this.house = house;
    this.yawObject = new THREE.Object3D();
    this.pitchObject = new THREE.Object3D();
    this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 60);
    this.pitchObject.add(this.camera);
    this.yawObject.add(this.pitchObject);

    const c = house.cellCenter(spawn.floorId, spawn.col, spawn.row);
    this.position = new THREE.Vector3(c.x, c.y, c.z);
    this.currentFloorId = spawn.floorId;
    this.yawObject.rotation.y = spawn.angleY || 0;

    this.crouching = false;
    this.running = false;
    this.moving = false;
    this.hidden = false;
    this.hidingSpot = null;
    this.stamina = 100;
    this.noise = 0; // 0..1, radio de ruido normalizado
    this.captured = false;
    this.captureCount = 0;

    this.flashlightOn = false;
    this.flashlightBattery = 100;
    this.spotlight = new THREE.SpotLight(0xfff2d0, 0, 16, Math.PI / 6.2, 0.5, 1.7);
    this.spotlight.visible = false;
    this.camera.add(this.spotlight);
    this.spotlight.position.set(0, 0, 0.1);
    this.spotlightTarget = new THREE.Object3D();
    this.spotlightTarget.position.set(0, 0, -1);
    this.camera.add(this.spotlightTarget);
    this.spotlight.target = this.spotlightTarget;

    this._stepTimer = 0;
    this._bobTime = 0;
    this._eyeCurrent = EYE_HEIGHT;
    this._targetFloorHeight = this.position.y;
  }

  get object() { return this.yawObject; }

  toggleFlashlight() {
    if (this.flashlightBattery <= 0 && !this.flashlightOn) return;
    this.flashlightOn = !this.flashlightOn;
    this.spotlight.visible = this.flashlightOn;
    this.spotlight.intensity = this.flashlightOn ? 22 : 0;
  }

  addFlashlightBattery(amount) {
    this.flashlightBattery = clamp(this.flashlightBattery + amount, 0, 100);
  }

  enterHiding(spot) {
    this.hidden = true;
    this.hidingSpot = spot;
    EventBus.emit('player:hide', spot);
  }
  exitHiding() {
    this.hidden = false;
    this.hidingSpot = null;
    EventBus.emit('player:unhide');
  }

  setCrouch(v) { this.crouching = v; }

  update(dt, input, promptLocked) {
    const move = promptLocked || this.hidden || this.captured ? { x: 0, z: 0 } : input.getMove();
    const { dx, dy } = input.consumeLook();
    this.yawObject.rotation.y -= dx;
    this.pitchObject.rotation.x = clamp(this.pitchObject.rotation.x - dy, -Math.PI / 2.15, Math.PI / 2.15);

    this.crouching = !this.hidden && !this.captured && input.isCrouching();
    const wantsRun = !this.crouching && input.isRunning() && this.stamina > 1;
    this.running = wantsRun && (move.x !== 0 || move.z !== 0);
    this.moving = (move.x !== 0 || move.z !== 0) && !this.hidden && !this.captured;

    let speed = this.crouching ? CROUCH_SPEED : (this.running ? RUN_SPEED : WALK_SPEED);

    if (this.running) this.stamina = clamp(this.stamina - dt * 18, 0, 100);
    else this.stamina = clamp(this.stamina + dt * 10, 0, 100);

    if (this.moving && !this.hidden) {
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.yawObject.quaternion);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.yawObject.quaternion);
      const dir = new THREE.Vector3();
      dir.addScaledVector(right, move.x);
      dir.addScaledVector(forward, -move.z);
      if (dir.lengthSq() > 1) dir.normalize();
      const delta = dir.multiplyScalar(speed * dt);
      this.position.x += delta.x;
      this.position.z += delta.z;
      this._resolveCollisions();
      this._bobTime += dt * (this.running ? 14 : this.crouching ? 8 : 10);
      this._stepTimer -= dt;
      if (this._stepTimer <= 0) {
        this._stepTimer = this.running ? 0.32 : this.crouching ? 0.55 : 0.42;
        EventBus.emit('player:footstep', { running: this.running, crouching: this.crouching, position: this.position.clone(), floorId: this.currentFloorId });
      }
    }

    // ruido objetivo
    let targetNoise = 0;
    if (!this.hidden && !this.captured) {
      if (this.crouching) targetNoise = this.moving ? 0.12 : 0;
      else if (this.running) targetNoise = 1;
      else targetNoise = this.moving ? 0.45 : 0.04;
    }
    this.noise += (targetNoise - this.noise) * clamp(dt * 6, 0, 1);

    this._resolveRamps();

    if (this.flashlightOn) {
      this.flashlightBattery = clamp(this.flashlightBattery - dt * 1.6, 0, 100);
      if (this.flashlightBattery <= 0) this.toggleFlashlight();
    }

    const targetEye = this.crouching ? CROUCH_HEIGHT : EYE_HEIGHT;
    this._eyeCurrent += (targetEye - this._eyeCurrent) * clamp(dt * 8, 0, 1);
    const bob = this.moving && !this.hidden ? Math.sin(this._bobTime) * (this.running ? 0.045 : 0.028) : 0;
    this.yawObject.position.set(this.position.x, this.position.y + this._eyeCurrent + bob, this.position.z);

    this.currentFloorId = this.house.floorIdFromIndex(this.house.getFloorIndexAtY(this.position.y));
  }

  _resolveCollisions() {
    const segs = this.house.collision[this.currentFloorId] || [];
    const doors = this.house.doors;
    for (let iter = 0; iter < 3; iter++) {
      for (const seg of segs) {
        if (seg.doorId) {
          const d = doors[seg.doorId];
          if (d && d.open) continue;
        }
        const push = circleSegmentPush(this.position.x, this.position.z, RADIUS, seg.x1, seg.z1, seg.x2, seg.z2);
        if (push) { this.position.x += push.dx; this.position.z += push.dz; }
      }
    }
  }

  _resolveRamps() {
    for (const ramp of this.house.ramps) {
      const y = ramp.sampleY(this.position.x, this.position.z);
      if (y !== null) {
        this.position.y += (y - this.position.y) * 0.35;
        return;
      }
    }
    // no ramp: snap suavemente a la altura de planta más cercana
    const targetFloorIdx = Math.round(this.position.y / FLOOR_H);
    const targetY = targetFloorIdx * FLOOR_H;
    this.position.y += (targetY - this.position.y) * 0.3;
  }
}
