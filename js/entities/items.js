import * as THREE from 'three';
import { dist2D, EventBus } from '../utils.js';
import { floorY } from '../world/mapData.js';
import { ITEMS, PUZZLES, HIDING_SPOTS } from '../world/spawnData.js';
import { audio } from '../audio.js';

export class Inventory {
  constructor() {
    this.items = new Map(); // id -> {count, name, icon, desc, charges}
  }
  add(def, qty = 1) {
    const cur = this.items.get(def.id);
    if (cur) { cur.count += qty; }
    else this.items.set(def.id, { id: def.id, name: def.name, icon: def.icon, desc: def.desc, count: qty, charges: def.charges });
  }
  has(id, qty = 1) {
    const cur = this.items.get(id);
    return !!cur && cur.count >= qty;
  }
  remove(id, qty = 1) {
    const cur = this.items.get(id);
    if (!cur) return false;
    cur.count -= qty;
    if (cur.count <= 0) this.items.delete(id);
    return true;
  }
  list() { return Array.from(this.items.values()); }
}

export class Interactable {
  constructor({ floorId, position, radius = 1.6, getPrompt, onInteract, mesh }) {
    this.floorId = floorId;
    this.position = position;
    this.radius = radius;
    this.getPrompt = getPrompt;
    this.onInteract = onInteract;
    this.mesh = mesh || null;
    this.enabled = true;
  }
}

function pickupMesh(icon) {
  const g = new THREE.Group();
  const geo = new THREE.OctahedronGeometry(0.14, 0);
  const mat = new THREE.MeshBasicMaterial({ color: 0xd4a017 });
  const core = new THREE.Mesh(geo, mat);
  g.add(core);
  const light = new THREE.PointLight(0xd4a017, 3.5, 2.5);
  light.position.set(0, 0.1, 0);
  g.add(light);
  g.userData.core = core;
  return g;
}

export function spawnPickups(house, group, inventory, onToast) {
  const interactables = [];
  for (const def of ITEMS) {
    const c = house.cellCenter(def.floorId, def.col, def.row);
    const jitterX = ((def.col * 7 + def.row * 13) % 5 - 2) * 0.25;
    const jitterZ = ((def.col * 11 + def.row * 5) % 5 - 2) * 0.25;
    const pos = new THREE.Vector3(c.x + jitterX, c.y + 1.0, c.z + jitterZ);
    const mesh = pickupMesh(def.icon);
    mesh.position.copy(pos);
    group.add(mesh);

    const interactable = new Interactable({
      floorId: def.floorId,
      position: pos,
      radius: 1.4,
      getPrompt: () => `Coger ${def.name}`,
      onInteract: () => {
        inventory.add(def, 1);
        group.remove(mesh);
        interactable.enabled = false;
        audio.pickupItem();
        onToast?.(`+ ${def.name}`);
        if (def.id === 'battery_flash') EventBus.emit('player:addBattery', 25);
      },
    });
    interactable._mesh = mesh;
    interactable.itemId = def.id;
    interactables.push(interactable);
  }
  return interactables;
}

function animatePickups(interactables, dt) {
  const t = performance.now() * 0.002;
  for (const it of interactables) {
    if (!it.enabled || !it._mesh) continue;
    it._mesh.rotation.y = t * 2;
    it._mesh.position.y += Math.sin(t * 2 + it.position.x) * 0.0015;
  }
}

export function buildDoorInteractables(house) {
  const interactables = [];
  for (const id of Object.keys(house.doors)) {
    if (id === 'garageDoor') continue; // se gestiona desde el puzzle del coche
    const door = house.doors[id];
    const floorId = door._collisionFloor;
    const ref = door._collisionRef;
    const cx = (ref.x1 + ref.x2) / 2, cz = (ref.z1 + ref.z2) / 2;
    const position = new THREE.Vector3(cx, floorY(floorId) + 1, cz);
    const interactable = new Interactable({
      floorId,
      position,
      radius: 1.7,
      getPrompt: (inventory) => {
        if (door.permanent) return `${door.name}`;
        if (door.locked) {
          if (door.canUnlock(inventory)) return `Abrir ${door.name}`;
          return `${door.name} (cerrada)`;
        }
        return door.open ? `Cerrar ${door.name}` : `Abrir ${door.name}`;
      },
      onInteract: (inventory, onToast) => {
        if (door.permanent) { onToast?.('Está atrancada con tablones. No se abrirá.'); audio.errorBeep(); return; }
        if (door.locked) {
          if (door.canUnlock(inventory)) {
            door.unlock();
            door.setOpen(true);
            audio.doorCreak();
            onToast?.(`${door.name} abierta`);
          } else {
            onToast?.(door.requiresItem ? 'Necesitas algo para abrir esto.' : 'Está cerrada.');
            audio.errorBeep();
          }
        } else {
          door.setOpen(!door.open);
          audio.doorCreak();
        }
      },
    });
    interactable.doorId = id;
    interactables.push(interactable);
  }
  return interactables;
}

export function buildHidingSpots(house, player) {
  const interactables = [];
  for (const spot of HIDING_SPOTS) {
    const c = house.cellCenter(spot.floorId, spot.col, spot.row);
    const pos = new THREE.Vector3(c.x + (spot.ox || 0), c.y + 1, c.z + (spot.oz || 0));
    const interactable = new Interactable({
      floorId: spot.floorId,
      position: pos,
      radius: 1.3,
      getPrompt: () => (player.hidden && player.hidingSpot === spot ? 'Salir' : `Esconderse (${spot.name})`),
      onInteract: () => {
        if (player.hidden && player.hidingSpot === spot) player.exitHiding();
        else if (!player.hidden) player.enterHiding(spot);
      },
    });
    interactables.push(interactable);
  }
  return interactables;
}

export function buildPuzzleInteractables(house, flags, inventory, onToast, triggerEnding) {
  const interactables = [];

  // Cuadro eléctrico (sótano)
  {
    const p = PUZZLES.breaker;
    const c = house.cellCenter(p.floorId, p.col, p.row);
    const position = new THREE.Vector3(c.x, c.y + 1.2, c.z + 1);
    const breakerIt = new Interactable({
      floorId: p.floorId, position, radius: 1.8,
      getPrompt: () => flags.powerOn ? 'Cuadro eléctrico (encendido)' : `Insertar fusible (${flags.fusesInserted}/2)`,
      onInteract: () => {
        if (flags.powerOn) { onToast?.('La luz ya está restablecida.'); return; }
        if (!inventory.has('fuse')) { onToast?.('Necesitas un fusible.'); audio.errorBeep(); return; }
        inventory.remove('fuse', 1);
        flags.fusesInserted++;
        audio.stunZap();
        if (flags.fusesInserted >= 2) {
          flags.powerOn = true;
          onToast?.('¡La corriente ha vuelto a la mansión!');
          EventBus.emit('world:powerOn');
        } else {
          onToast?.(`Fusible insertado (${flags.fusesInserted}/2)`);
        }
      },
    });
    breakerIt.puzzleId = 'breaker';
    interactables.push(breakerIt);
  }

  // Caja fuerte (biblioteca)
  {
    const p = PUZZLES.safe;
    const c = house.cellCenter(p.floorId, p.col, p.row);
    const position = new THREE.Vector3(c.x, c.y + 1, c.z + 1);
    const safeIt = new Interactable({
      floorId: p.floorId, position, radius: 1.8,
      getPrompt: () => flags.safeOpen ? 'Caja fuerte (abierta)' : 'Caja fuerte cerrada',
      onInteract: () => {
        if (flags.safeOpen) { onToast?.('Ya está vacía.'); return; }
        if (!inventory.has('safecode_note')) {
          onToast?.('Está cerrada con un código de 3 dígitos. Debe haber una pista en la mansión.');
          audio.errorBeep();
          return;
        }
        flags.safeOpen = true;
        inventory.add({ id: 'car_key', name: 'Llave del coche', icon: '🔑', desc: 'La llave del coche del garaje.' }, 1);
        audio.pickupItem();
        onToast?.('Código correcto (731). ¡Llave del coche conseguida!');
      },
    });
    safeIt.puzzleId = 'safe';
    interactables.push(safeIt);
  }

  // Coche (garaje) — instala batería, gasolina y arranca si todo listo
  {
    const p = PUZZLES.car;
    const c = house.cellCenter(p.floorId, p.col, p.row);
    const position = new THREE.Vector3(c.x, c.y + 1, c.z);
    const carIt = new Interactable({
      floorId: p.floorId, position, radius: 2.2,
      getPrompt: () => {
        if (!flags.batteryInstalled) return 'Instalar batería del coche';
        if (!flags.fuelFilled) return 'Llenar depósito de gasolina';
        if (!flags.powerOn) return 'El garaje no tiene corriente';
        if (!inventory.has('car_key')) return 'Falta la llave del coche';
        return '¡Arrancar el coche y escapar!';
      },
      onInteract: () => {
        if (!flags.batteryInstalled) {
          if (!inventory.has('battery_car')) { onToast?.('Necesitas la batería del coche.'); audio.errorBeep(); return; }
          inventory.remove('battery_car', 1);
          flags.batteryInstalled = true;
          onToast?.('Batería instalada.');
          return;
        }
        if (!flags.fuelFilled) {
          if (!inventory.has('fuelcan')) { onToast?.('Necesitas gasolina.'); audio.errorBeep(); return; }
          inventory.remove('fuelcan', 1);
          flags.fuelFilled = true;
          onToast?.('Depósito lleno.');
          return;
        }
        if (!flags.powerOn) { onToast?.('El motor del garaje necesita corriente eléctrica.'); audio.errorBeep(); return; }
        if (!inventory.has('car_key')) { onToast?.('Te falta la llave del coche.'); audio.errorBeep(); return; }
        triggerEnding('victory');
      },
    });
    carIt.puzzleId = 'car';
    interactables.push(carIt);
  }

  // Salida del túnel secreto (sótano)
  {
    const p = PUZZLES.tunnelExit;
    const c = house.cellCenter(p.floorId, p.col, p.row);
    const position = new THREE.Vector3(c.x, c.y + 1, c.z);
    const tunnelIt = new Interactable({
      floorId: p.floorId, position, radius: 1.8,
      getPrompt: (inventory, doors) => {
        const hatch = doors?.tunnelHatch;
        if (hatch && hatch.locked) return 'El túnel está bloqueado por una trampilla';
        return 'Escapar por el túnel';
      },
      onInteract: (inventory, onToastArg, doors) => {
        const hatch = doors?.tunnelHatch;
        if (hatch && hatch.locked) { onToast?.('Necesitas abrir antes la trampilla.'); return; }
        triggerEnding('secret');
      },
    });
    tunnelIt.puzzleId = 'tunnelExit';
    interactables.push(tunnelIt);
  }

  // Caja tablada — bonus con la palanca
  {
    const c = house.cellCenter('basement', 1, 4);
    const position = new THREE.Vector3(c.x, c.y + 1, c.z - 1);
    let opened = false;
    interactables.push(new Interactable({
      floorId: 'basement', position, radius: 1.6,
      getPrompt: () => opened ? 'Caja forzada' : 'Forzar caja tablada (necesitas palanca)',
      onInteract: () => {
        if (opened) return;
        if (!inventory.has('crowbar')) { onToast?.('Necesitas una palanca.'); audio.errorBeep(); return; }
        opened = true;
        inventory.add({ id: 'battery_flash', name: 'Pilas', icon: '🔦', desc: 'Recarga la linterna.' }, 2);
        audio.pickupItem();
        onToast?.('Encuentras pilas dentro de la caja.');
      },
    }));
  }

  return interactables;
}

export function findNearestInteractable(interactables, player) {
  let best = null, bestDist = Infinity;
  for (const it of interactables) {
    if (!it.enabled || it.floorId !== player.currentFloorId) continue;
    const d = dist2D(player.position.x, player.position.z, it.position.x, it.position.z);
    if (d <= it.radius && d < bestDist) { best = it; bestDist = d; }
  }
  return best;
}

export function updatePickupAnimations(interactables, dt) { animatePickups(interactables, dt); }

// ---------------- Objetos rápidos (trampas y armas) ----------------
export function useQuickItem(id, ctx) {
  const { player, monsters, inventory, group, onToast } = ctx;
  if (!inventory.has(id)) return false;
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.yawObject.quaternion);

  if (id === 'beartrap') {
    inventory.remove('beartrap', 1);
    const pos = player.position.clone().addScaledVector(forward, 0.8);
    const geo = new THREE.CylinderGeometry(0.35, 0.35, 0.06, 12);
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x3a3a3a }));
    mesh.position.set(pos.x, pos.y + 0.03, pos.z);
    group.add(mesh);
    ctx.traps.push({ position: pos, floorId: player.currentFloorId, radius: 0.9, mesh, armed: true });
    onToast?.('Trampa colocada.');
    return true;
  }

  if (id === 'taser') {
    const item = inventory.items.get('taser');
    let target = null, bestD = 2.2;
    for (const m of monsters) {
      if (m.currentFloorId !== player.currentFloorId) continue;
      const d = dist2D(player.position.x, player.position.z, m.position.x, m.position.z);
      if (d < bestD) { bestD = d; target = m; }
    }
    if (!target) { onToast?.('No hay nadie lo bastante cerca.'); return false; }
    target.stun(4.5);
    audio.stunZap();
    if (item) { item.charges -= 1; if (item.charges <= 0) inventory.remove('taser', 1); }
    onToast?.('¡Aturdido!');
    return true;
  }

  if (id === 'molotov') {
    inventory.remove('molotov', 1);
    const pos = player.position.clone().addScaledVector(forward, 3);
    let hit = 0;
    for (const m of monsters) {
      if (m.currentFloorId !== player.currentFloorId) continue;
      if (dist2D(pos.x, pos.z, m.position.x, m.position.z) < 5) { m.stun(9); hit++; }
    }
    const fireLight = new THREE.PointLight(0xff6620, 28, 7.5, 1.8);
    fireLight.position.set(pos.x, pos.y + 0.3, pos.z);
    group.add(fireLight);
    let t = 0;
    const anim = () => {
      t += 0.05;
      fireLight.intensity = 24 + Math.sin(t * 20) * 10;
      if (t < 8) requestAnimationFrame(anim); else group.remove(fireLight);
    };
    anim();
    audio.jumpscare();
    onToast?.(hit > 0 ? '¡El fuego los ahuyenta!' : 'El cóctel molotov arde en el suelo.');
    return true;
  }

  if (id === 'meat') {
    inventory.remove('meat', 1);
    const pos = player.position.clone().addScaledVector(forward, 4);
    let lured = 0;
    for (const m of monsters) {
      if (m.currentFloorId !== player.currentFloorId) continue;
      if (dist2D(pos.x, pos.z, m.position.x, m.position.z) < 9 || dist2D(player.position.x, player.position.z, m.position.x, m.position.z) < 9) {
        m.distract(pos, player.currentFloorId);
        lured++;
      }
    }
    onToast?.(lured > 0 ? 'Los atraes hacia allí...' : 'La carne cae al suelo sin que nadie la note.');
    return true;
  }

  return false;
}

export function updateTraps(traps, monsters, dt) {
  for (const trap of traps) {
    if (!trap.armed) continue;
    for (const m of monsters) {
      if (m.currentFloorId !== trap.floorId) continue;
      if (m.state === 'stunned') continue;
      const d = dist2D(trap.position.x, trap.position.z, m.position.x, m.position.z);
      if (d < trap.radius) {
        m.stun(6);
        trap.armed = false;
        if (trap.mesh) trap.mesh.visible = false;
        audio.stunZap();
      }
    }
  }
}
