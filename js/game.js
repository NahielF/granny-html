import * as THREE from 'three';
import { buildHouse } from './world/houseBuilder.js';
import { PLAYER_SPAWN, MONSTER_SPAWN_POINTS, CAGE_LOCATION } from './world/spawnData.js';
import { Player } from './entities/player.js';
import { Monster, MONSTER_TYPES, getMonsterType } from './entities/monster.js';
import {
  Inventory, spawnPickups, buildDoorInteractables, buildHidingSpots, buildPuzzleInteractables,
  findNearestInteractable, updatePickupAnimations, useQuickItem, updateTraps,
} from './entities/items.js';
import { ENDING_CONTENT } from './endings.js';
import { audio } from './audio.js';
import { EventBus, clamp } from './utils.js';

const DIFFICULTY_MULT = { facil: 0.82, normal: 1.0, dificil: 1.22 };
const MAX_CAPTURES = { facil: 5, normal: 3, dificil: 2 };

const LIGHT_SPOTS = [
  { floorId: 'ground', col: 1, row: 0, color: 0xffb060 },
  { floorId: 'ground', col: 1, row: 3, color: 0xff8850 },
  { floorId: 'ground', col: 8, row: 2, color: 0xffc080 },
  { floorId: 'ground', col: 7, row: 0, color: 0xffb060 },
  { floorId: 'ground', col: 4, row: 5, color: 0xffd090 },
  { floorId: 'ground', col: 4, row: 6, color: 0xffb060 },
  { floorId: 'first', col: 1, row: 0, color: 0xff9060 },
  { floorId: 'first', col: 8, row: 0, color: 0xff7050 },
  { floorId: 'first', col: 1, row: 6, color: 0xffa060 },
  { floorId: 'basement', col: 8, row: 0, color: 0x8090ff },
];

export class Game {
  constructor(canvas, input) {
    this.canvas = canvas;
    this.input = input;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030202, 0.05);
    this.scene.background = new THREE.Color(0x020202);

    this.hemi = new THREE.HemisphereLight(0x3a3268, 0x120c0a, 1.8);
    this.scene.add(this.hemi);

    window.addEventListener('resize', () => this._onResize());

    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.flickerLights = [];
    this.traps = [];
    this.toastEl = null;
    this._toastTimer = 0;
    this._elapsed = 0;
    this._captureCooldown = 0;
    this._pendingEnding = null;

    EventBus.on('monster:capture', () => this._onCapture());
    EventBus.on('world:powerOn', () => this._onPowerOn());
    EventBus.on('player:addBattery', (amount) => this.player?.addFlashlightBattery(amount));
  }

  start(selectedIds, difficulty, callbacks) {
    this.callbacks = callbacks || {};
    this.difficulty = difficulty;
    this.difficultyMult = DIFFICULTY_MULT[difficulty] || 1;
    this.maxCaptures = MAX_CAPTURES[difficulty] || 3;
    this.selectedIds = selectedIds;

    // limpia estado anterior si existiera
    if (this.house) this._teardown();

    this.house = buildHouse();
    this.scene.add(this.house.group);

    this.player = new Player(this.house, PLAYER_SPAWN);
    this.scene.add(this.player.object);

    this.inventory = new Inventory();
    this.flags = { fusesInserted: 0, powerOn: false, safeOpen: false, batteryInstalled: false, fuelFilled: false };

    this.monsters = selectedIds.map((id, i) => {
      const type = getMonsterType(id);
      const spawn = MONSTER_SPAWN_POINTS[MONSTER_TYPES.findIndex((t) => t.id === id)] || MONSTER_SPAWN_POINTS[i % MONSTER_SPAWN_POINTS.length];
      const m = new Monster(type, this.house, spawn, this.difficultyMult);
      this.scene.add(m.mesh);
      return m;
    });

    this.traps = [];
    this._buildInteractables();
    this._buildFlickerLights();

    this.gameOver = false;
    this.paused = false;
    this.running = true;
    this._elapsed = 0;
    this._captureCooldown = 0;
    this.captureCount = 0;

    this._onResize();
    audio.setTension(0);
  }

  _buildInteractables() {
    const pickups = spawnPickups(this.house, this.house.group, this.inventory, (msg) => this._showToast(msg));
    const doors = buildDoorInteractables(this.house);
    const hides = buildHidingSpots(this.house, this.player);
    const puzzles = buildPuzzleInteractables(this.house, this.flags, this.inventory, (msg) => this._showToast(msg), (type) => this.endGame(type));
    this.interactables = [...pickups, ...doors, ...hides, ...puzzles];
  }

  _buildFlickerLights() {
    for (const spot of LIGHT_SPOTS) {
      const c = this.house.cellCenter(spot.floorId, spot.col, spot.row);
      const light = new THREE.PointLight(spot.color, 16, 9, 2);
      light.position.set(c.x, c.y + 2.1, c.z);
      this.scene.add(light);
      this.flickerLights.push({ light, base: 16, seed: Math.random() * 10, on: false });
    }
  }

  _onPowerOn() {
    for (const fl of this.flickerLights) fl.on = true;
    this._showToast('Las luces de la mansión parpadean y se encienden.');
  }

  _onCapture() {
    if (this.gameOver || this.player.captured || this._captureCooldown > 0) return;
    this.player.captured = true;
    this.player.exitHiding();
    this.captureCount++;
    audio.jumpscare();
    this._flash(1);
    if (this.captureCount >= this.maxCaptures) {
      setTimeout(() => this.endGame('defeat'), 900);
      return;
    }
    setTimeout(() => this._respawnAfterCapture(), 1400);
  }

  _respawnAfterCapture() {
    if (this.gameOver) return;
    const c = this.house.cellCenter(CAGE_LOCATION.floorId, CAGE_LOCATION.col, CAGE_LOCATION.row);
    this.player.position.set(c.x, c.y, c.z);
    this.player.currentFloorId = CAGE_LOCATION.floorId;
    for (const m of this.monsters) {
      m.state = 'patrol';
      m.path = [];
      m.stateTimer = 0;
    }
    this.player.captured = false;
    this._captureCooldown = 3;
    this._showToast('Consigues escapar de la celda... por ahora.');
  }

  endGame(type) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.running = false;
    if (this.input.pointerLocked) this.input.exitPointerLock();
    if (type === 'victory') audio.victoryFanfare();
    else if (type === 'defeat') audio.defeatDrone();
    else audio.victoryFanfare();
    this._flash(type === 'defeat' ? 1 : 0.4);
    const content = ENDING_CONTENT[type];
    const stats = {
      time: this._elapsed,
      captures: this.captureCount,
      difficulty: this.difficulty,
      monsters: this.selectedIds.map((id) => getMonsterType(id).name).join(', '),
    };
    setTimeout(() => this.callbacks.onEnd?.(content, stats), type === 'defeat' ? 1600 : 900);
  }

  _flash(intensity) {
    const el = document.getElementById('flash-overlay');
    if (!el) return;
    el.style.opacity = String(intensity);
    requestAnimationFrame(() => { el.style.transition = 'opacity 0.7s ease-out'; el.style.opacity = '0'; setTimeout(() => { el.style.transition = 'opacity 0.08s linear'; }, 750); });
  }

  _showToast(msg) {
    this.callbacks.onToast?.(msg);
  }

  quitToMenu() {
    this.running = false;
    this.gameOver = true;
    this.paused = false;
  }

  togglePause(force) {
    this.paused = force !== undefined ? force : !this.paused;
    if (this.paused) this.input.exitPointerLock();
  }

  update(dt) {
    if (!this.running || this.paused || this.gameOver) return;
    this._elapsed += dt;
    if (this._captureCooldown > 0) this._captureCooldown -= dt;

    const promptLocked = false;
    this.player.update(dt, this.input, promptLocked);

    for (const m of this.monsters) m.update(dt, this.player);
    updateTraps(this.traps, this.monsters, dt);

    for (const id of Object.keys(this.house.doors)) this.house.doors[id].update(dt);

    updatePickupAnimations(this.interactables, dt);

    // parpadeo de luces
    const t = performance.now() * 0.001;
    for (const fl of this.flickerLights) {
      const flicker = fl.on ? (0.85 + Math.sin(t * 6 + fl.seed) * 0.1 + (Math.random() < 0.02 ? -0.4 : 0)) : 0;
      fl.light.intensity = fl.base * Math.max(0, flicker);
    }

    // tensión / audio ambiente
    let tension = 0;
    for (const m of this.monsters) tension = Math.max(tension, m.tensionContribution);
    audio.setTension(tension);
    audio.update();

    // interacción
    const nearest = findNearestInteractable(this.interactables, this.player);
    this._nearestInteractable = nearest;
    if (this.input.consumePressed('interact') && nearest) {
      nearest.onInteract(this.inventory, (msg) => this._showToast(msg), this.house.doors);
    }
    if (this.input.consumePressed('flashlight')) this.player.toggleFlashlight();

    const qs = this.input.consumeQuickSlot();
    if (qs >= 0) {
      const items = this.inventory.list().filter((it) => ['beartrap', 'taser', 'molotov', 'meat'].includes(it.id));
      const item = items[qs];
      if (item) useQuickItem(item.id, { player: this.player, monsters: this.monsters, inventory: this.inventory, group: this.house.group, traps: this.traps, onToast: (m) => this._showToast(m) });
    }

    if (this._toastTimer > 0) this._toastTimer -= dt;
  }

  getHudState() {
    const nearest = this._nearestInteractable;
    return {
      noise: this.player.noise,
      stamina: this.player.stamina,
      flashlightBattery: this.player.flashlightBattery,
      flashlightOn: this.player.flashlightOn,
      captureCount: this.captureCount,
      maxCaptures: this.maxCaptures,
      promptText: nearest ? nearest.getPrompt(this.inventory, this.house.doors) : null,
      objective: this._computeObjective(),
      quickItems: this.inventory.list().filter((it) => ['beartrap', 'taser', 'molotov', 'meat'].includes(it.id)),
    };
  }

  _computeObjective() {
    const f = this.flags;
    const inv = this.inventory;
    if (!f.batteryInstalled) {
      return inv.has('battery_car') ? 'Lleva la batería al coche del garaje.' : 'Encuentra la batería del coche en la bodega del sótano.';
    }
    if (!f.fuelFilled) {
      return inv.has('fuelcan') ? 'Llena el depósito del coche con la gasolina.' : 'Encuentra el bidón de gasolina.';
    }
    if (f.fusesInserted < 2) {
      return `Encuentra fusibles (${f.fusesInserted}/2) para el cuadro eléctrico del sótano.`;
    }
    if (!f.safeOpen) {
      return 'Busca una pista para el código de la caja fuerte de la biblioteca y consigue la llave del coche.';
    }
    return '¡Vuelve al coche del garaje y escapa!';
  }

  render() {
    if (!this.player) return;
    this.renderer.render(this.scene, this.player.camera);
  }

  _onResize() {
    if (!this.player) return;
    this.player.camera.aspect = window.innerWidth / window.innerHeight;
    this.player.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _teardown() {
    for (const m of this.monsters || []) m.dispose();
    this.scene.remove(this.house.group);
    for (const fl of this.flickerLights) this.scene.remove(fl.light);
    this.flickerLights = [];
    for (const m of this.monsters || []) this.scene.remove(m.mesh);
    if (this.player) this.scene.remove(this.player.object);
  }
}
