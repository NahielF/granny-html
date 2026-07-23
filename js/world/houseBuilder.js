import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FLOORS, STAIRS, CELL, ROOM_H, FLOOR_H, floorY, getFloor } from './mapData.js';
import * as TEX from './textures.js';

const WALL_THICK = 0.2;
const DEFAULT_GAP = 1.8;
const EXTRA_GAP = { garageDoor: 3.0, balconyDoor: 2.0 };

const OPPOSITE = { N: 'S', S: 'N', E: 'W', W: 'E' };

function textureFor(name) {
  switch (name) {
    case 'wood': return TEX.woodFloorTexture();
    case 'tile': return TEX.tileFloorTexture();
    case 'carpet': return TEX.carpetTexture();
    case 'brick': return TEX.brickTexture();
    case 'metal': return TEX.metalTexture();
    case 'wallpaper': return TEX.wallpaperTexture();
    case 'plaster': return TEX.plasterTexture();
    default: return TEX.plasterTexture();
  }
}

function edgeLine(col, row, side) {
  const x0 = col * CELL, x1 = x0 + CELL, z0 = row * CELL, z1 = z0 + CELL;
  switch (side) {
    case 'N': return { x1: x0, z1: z0, x2: x1, z2: z0 };
    case 'S': return { x1: x0, z1: z1, x2: x1, z2: z1 };
    case 'W': return { x1: x0, z1: z0, x2: x0, z2: z1 };
    case 'E': return { x1: x1, z1: z0, x2: x1, z2: z1 };
  }
}

function neighborOf(col, row, side) {
  switch (side) {
    case 'N': return { col, row: row - 1 };
    case 'S': return { col, row: row + 1 };
    case 'W': return { col: col - 1, row };
    case 'E': return { col: col + 1, row };
  }
}

export function cellCenter(floorId, col, row) {
  return new THREE.Vector3(col * CELL + CELL / 2, floorY(floorId), row * CELL + CELL / 2);
}

export class Door {
  constructor({ id, mesh, kind, gapCenter, gapWidth, side, locked, requiresItem, requiresCondition, permanent, name, collSegsRef }) {
    this.id = id;
    this.mesh = mesh;
    this.kind = kind;
    this.side = side;
    this.locked = !!locked;
    this.permanent = !!permanent;
    this.requiresItem = requiresItem || null;
    this.requiresCondition = requiresCondition || null;
    this.name = name || id;
    this.open = false;
    this.gapCenter = gapCenter;
    this._t = 0;
    this._targetOpen = false;
    this._isGarage = id === 'garageDoor';
  }
  canUnlock(inventory) {
    if (!this.locked) return true;
    if (this.permanent) return false;
    if (this.requiresItem) return inventory && inventory.has(this.requiresItem);
    return false;
  }
  unlock() { this.locked = false; }
  setOpen(open) {
    if (this.locked || this.permanent) return false;
    this._targetOpen = open;
    return true;
  }
  update(dt) {
    if (!this.mesh) return;
    const target = this._targetOpen ? 1 : 0;
    this._t += ((target - this._t) * Math.min(1, dt * 4));
    if (Math.abs(target - this._t) < 0.01) this._t = target;
    this.open = this._t > 0.5;
    if (this._isGarage) {
      this.mesh.position.y = this.mesh.userData.closedY + this._t * this.mesh.userData.riseHeight;
    } else {
      this.mesh.rotation.y = this.mesh.userData.closedRotY + this._t * this.mesh.userData.openRotDelta;
    }
  }
}

export function buildHouse() {
  const group = new THREE.Group();
  const collision = {};      // floorId -> [{x1,z1,x2,z2, doorId?}]
  const doors = {};          // id -> Door
  const navNodes = {};       // floorId -> Set('col,row')
  const navEdges = {};       // floorId -> Map('col,row' -> Set('col,row'))
  const crossEdges = [];     // [{a:{floorId,col,row}, b:{floorId,col,row}}]
  const ramps = [];
  const roomLookup = {};     // floorId -> Map('col,row' -> {char,name,dark})
  const flickerLights = [];

  for (const f of FLOORS) {
    collision[f.id] = [];
    navNodes[f.id] = new Set();
    navEdges[f.id] = new Map();
    roomLookup[f.id] = new Map();
  }

  // ---- Precompute stair shaft cells + open connection points ----
  const stairShaftCells = {};      // floorId -> Map('col,row'->stairId)
  const stairOpenConn = new Set(); // `${floorId}:${col}:${row}:${side}`
  for (const f of FLOORS) stairShaftCells[f.id] = new Map();
  for (const st of STAIRS) {
    const cells = [];
    for (let i = 0; i < st.length; i++) {
      cells.push(st.axis === 'x' ? { col: st.col + i, row: st.row } : { col: st.col, row: st.row + i });
    }
    for (const fid of [st.bottomFloor, st.topFloor]) {
      for (const c of cells) stairShaftCells[fid].set(`${c.col},${c.row}`, st.id);
    }
    let low, lowSide, high, highSide;
    if (st.axis === 'x') {
      low = { col: st.col - 1, row: st.row }; lowSide = 'E';
      high = { col: st.col + st.length, row: st.row }; highSide = 'W';
    } else {
      low = { col: st.col, row: st.row - 1 }; lowSide = 'S';
      high = { col: st.col, row: st.row + st.length }; highSide = 'N';
    }
    stairOpenConn.add(`${st.bottomFloor}:${low.col}:${low.row}:${lowSide}`);
    stairOpenConn.add(`${st.topFloor}:${high.col}:${high.row}:${highSide}`);
    st._low = low; st._high = high; st._lowSide = lowSide; st._highSide = highSide;
    crossEdges.push({ a: { floorId: st.bottomFloor, col: low.col, row: low.row }, b: { floorId: st.topFloor, col: high.col, row: high.row } });

    // Ramp descriptor
    const y0 = floorY(st.bottomFloor), y1 = floorY(st.topFloor);
    let bounds;
    if (st.axis === 'x') {
      bounds = { x0: st.col * CELL, x1: (st.col + st.length) * CELL, z0: st.row * CELL, z1: (st.row + 1) * CELL, axis: 'x' };
    } else {
      bounds = { x0: st.col * CELL, x1: (st.col + 1) * CELL, z0: st.row * CELL, z1: (st.row + st.length) * CELL, axis: 'z' };
    }
    ramps.push({ id: st.id, bottomFloor: st.bottomFloor, topFloor: st.topFloor, y0, y1, bounds });
  }

  const meshBuckets = {}; // key -> [THREE.BufferGeometry] (world-space)

  function pushGeom(key, geom, matrix, matArgs) {
    const g = geom.clone();
    g.applyMatrix4(matrix);
    if (!meshBuckets[key]) meshBuckets[key] = { geoms: [], matArgs };
    meshBuckets[key].geoms.push(g);
  }

  function addFloorTile(floorId, texName, x0, x1, z0, z1, y) {
    const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Matrix4().makeTranslation((x0 + x1) / 2, y, (z0 + z1) / 2);
    pushGeom(`floor:${floorId}:${texName}`, geo, m, { map: texName, kind: 'floor' });
  }

  function addCeilTile(floorId, x0, x1, z0, z1, y) {
    const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
    geo.rotateX(Math.PI / 2);
    const m = new THREE.Matrix4().makeTranslation((x0 + x1) / 2, y, (z0 + z1) / 2);
    pushGeom(`ceil:${floorId}`, geo, m, { map: 'ceil', kind: 'ceiling' });
  }

  function addWallBox(floorId, x1, z1, x2, z2, y0, height, texName) {
    const length = Math.hypot(x2 - x1, z2 - z1);
    if (length < 0.05) return;
    const geo = new THREE.BoxGeometry(length, height, WALL_THICK);
    const angle = Math.atan2(z2 - z1, x2 - x1);
    const mid = new THREE.Vector3((x1 + x2) / 2, y0 + height / 2, (z1 + z2) / 2);
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle);
    const m = new THREE.Matrix4().compose(mid, q, new THREE.Vector3(1, 1, 1));
    pushGeom(`wall:${floorId}:${texName}`, geo, m, { map: texName, kind: 'wall' });
    collision[floorId].push({ x1, z1, x2, z2 });
  }

  function makeDoorMesh(x1, z1, x2, z2, y0, height, texName, hinge) {
    const length = Math.hypot(x2 - x1, z2 - z1);
    const geo = new THREE.BoxGeometry(length, height, 0.08);
    const mat = new THREE.MeshLambertMaterial({ map: textureFor(texName) });
    const mesh = new THREE.Mesh(geo, mat);
    const angle = Math.atan2(z2 - z1, x2 - x1);
    if (hinge) {
      // pivot group at (x1,z1) so it can swing
      const pivot = new THREE.Group();
      pivot.position.set(x1, y0, z1);
      pivot.rotation.y = -angle;
      mesh.position.set(length / 2, height / 2, 0);
      pivot.add(mesh);
      pivot.userData.closedRotY = -angle;
      pivot.userData.openRotDelta = Math.PI / 1.8;
      return pivot;
    }
    mesh.position.set((x1 + x2) / 2, y0 + height / 2, (z1 + z2) / 2);
    mesh.rotation.y = -angle;
    mesh.userData.closedY = mesh.position.y;
    mesh.userData.riseHeight = height * 0.95;
    return mesh;
  }

  function addDecorDoor(floorId, gx1, gz1, gx2, gz2, height) {
    const length = Math.hypot(gx2 - gx1, gz2 - gz1);
    const doorMat = new THREE.MeshLambertMaterial({ map: TEX.woodDoorTexture() });
    const doorH = height * 0.88;
    const geo = new THREE.BoxGeometry(length, doorH, 0.06);
    const mesh = new THREE.Mesh(geo, doorMat);
    const angle = Math.atan2(gz2 - gz1, gx2 - gx1);
    const pivot = new THREE.Group();
    pivot.position.set(gx1, floorY(floorId), gz1);
    pivot.rotation.y = -angle - Math.PI / 2.05;
    mesh.position.set(length / 2, doorH / 2, 0);
    pivot.add(mesh);
    group.add(pivot);
  }

  function buildDoorway(floorId, col, row, side, doorCfg, height) {
    const { x1, z1, x2, z2 } = edgeLine(col, row, side);
    const gapWidth = EXTRA_GAP[doorCfg.id] || DEFAULT_GAP;
    const stub = Math.max(0, (CELL - gapWidth) / 2);
    const dx = (x2 - x1) / CELL, dz = (z2 - z1) / CELL;
    const sx1 = x1, sz1 = z1;
    const sx2 = x1 + dx * stub, sz2 = z1 + dz * stub;
    const ex1 = x2 - dx * stub, ez1 = z2 - dz * stub;
    const ex2 = x2, ez2 = z2;
    const texName = floorId === 'basement' || floorId === 'attic' ? 'plaster' : 'wallpaper';
    addWallBox(floorId, sx1, sz1, sx2, sz2, floorY(floorId), height, texName);
    addWallBox(floorId, ex1, ez1, ex2, ez2, floorY(floorId), height, texName);

    const gx1 = x1 + dx * stub, gz1 = z1 + dz * stub;
    const gx2 = x2 - dx * stub, gz2 = z2 - dz * stub;
    const isExterior = doorCfg.kind === 'exterior';
    const isGarage = doorCfg.id === 'garageDoor';
    const doorTex = isGarage ? 'metal' : 'wooddoor';
    let mesh;
    if (isGarage) {
      mesh = makeDoorMesh(gx1, gz1, gx2, gz2, floorY(floorId), height, 'metal', false);
    } else {
      const doorMat = new THREE.MeshLambertMaterial({ map: TEX.woodDoorTexture() });
      const length = Math.hypot(gx2 - gx1, gz2 - gz1);
      const geo = new THREE.BoxGeometry(length, height * 0.9, 0.08);
      const meshObj = new THREE.Mesh(geo, doorMat);
      const angle = Math.atan2(gz2 - gz1, gx2 - gx1);
      const pivot = new THREE.Group();
      pivot.position.set(gx1, floorY(floorId), gz1);
      pivot.rotation.y = -angle;
      meshObj.position.set(length / 2, (height * 0.9) / 2, 0);
      pivot.add(meshObj);
      pivot.userData.closedRotY = -angle;
      pivot.userData.openRotDelta = Math.PI / 1.9;
      mesh = pivot;
    }
    group.add(mesh);

    const door = new Door({
      id: doorCfg.id, mesh, kind: doorCfg.kind, side,
      locked: !!doorCfg.locked, requiresItem: doorCfg.requiresItem, requiresCondition: doorCfg.requiresCondition,
      permanent: !!doorCfg.permanent, name: doorCfg.name,
    });
    doors[doorCfg.id] = door;
    const segRef = { x1: gx1, z1: gz1, x2: gx2, z2: gz2, doorId: doorCfg.id };
    collision[floorId].push(segRef);
    door._collisionRef = segRef;
    door._collisionFloor = floorId;

    // Puertas exteriores decorativas (balcón, ventana tejado): barandilla fija más allá
    // del umbral para que el jugador pueda abrir/asomarse sin caer al vacío exterior.
    if (isExterior && doorCfg.id !== 'garageDoor') {
      const outX = side === 'E' ? 1 : side === 'W' ? -1 : 0;
      const outZ = side === 'S' ? 1 : side === 'N' ? -1 : 0;
      const off = 1.4;
      const bx1 = gx1 + outX * off, bz1 = gz1 + outZ * off;
      const bx2 = gx2 + outX * off, bz2 = gz2 + outZ * off;
      const railGeo = new THREE.BoxGeometry(Math.hypot(bx2 - bx1, bz2 - bz1) || gapWidth, 1.0, 0.1);
      const railMesh = new THREE.Mesh(railGeo, new THREE.MeshLambertMaterial({ map: TEX.metalTexture() }));
      const railAngle = Math.atan2(bz2 - bz1, bx2 - bx1);
      railMesh.position.set((bx1 + bx2) / 2, floorY(floorId) + 0.5, (bz1 + bz2) / 2);
      railMesh.rotation.y = -railAngle;
      group.add(railMesh);
      collision[floorId].push({ x1: bx1, z1: bz1, x2: bx2, z2: bz2 });
    }
    return door;
  }

  const processedEdges = new Set();
  const oppositeSide = (s) => OPPOSITE[s];

  for (const floor of FLOORS) {
    const grid = floor.grid;
    const R = grid.length, C = grid[0].length;
    const charAt = (c, r) => (r >= 0 && r < R && c >= 0 && c < C) ? grid[r][c] : '.';
    const stairIdAt = (c, r) => stairShaftCells[floor.id].get(`${c},${r}`);
    const fY = floorY(floor.id);
    const ceilY = fY + ROOM_H;

    const doorDefsByKey = {};
    for (const d of floor.doors || []) doorDefsByKey[`${d.col}:${d.row}:${d.side}`] = { ...d, kind: 'interior' };
    for (const d of floor.exteriorDoors || []) doorDefsByKey[`${d.col}:${d.row}:${d.side}`] = { ...d, kind: 'exterior' };

    for (let row = 0; row < R; row++) {
      for (let col = 0; col < C; col++) {
        const ch = charAt(col, row);
        if (ch === '.' || stairIdAt(col, row)) continue;
        const roomDef = floor.rooms[ch] || {};
        const x0 = col * CELL, x1 = x0 + CELL, z0 = row * CELL, z1 = z0 + CELL;

        addFloorTile(floor.id, roomDef.floorTex || floor.floorTex, x0, x1, z0, z1, fY);
        addCeilTile(floor.id, x0, x1, z0, z1, ceilY);

        navNodes[floor.id].add(`${col},${row}`);
        roomLookup[floor.id].set(`${col},${row}`, { char: ch, name: roomDef.name, dark: !!roomDef.dark });

        for (const side of ['N', 'S', 'E', 'W']) {
          const nb = neighborOf(col, row, side);
          const nbChar = charAt(nb.col, nb.row);
          const nbStairId = stairIdAt(nb.col, nb.row);

          if (nbStairId) {
            const key = `${floor.id}:${col}:${row}:${side}`;
            if (stairOpenConn.has(key)) {
              // open connection into the stairwell — no wall
            } else {
              addWallBox(floor.id, ...Object.values(edgeLine(col, row, side)), fY, ROOM_H, floor.wallTex);
            }
            continue;
          }

          if (nbChar === '.') {
            const doorCfg = doorDefsByKey[`${col}:${row}:${side}`];
            if (doorCfg) {
              buildDoorway(floor.id, col, row, side, doorCfg, ROOM_H);
            } else {
              const { x1: ex1, z1: ez1, x2: ex2, z2: ez2 } = edgeLine(col, row, side);
              addWallBox(floor.id, ex1, ez1, ex2, ez2, fY, ROOM_H, floor.wallTex);
            }
            continue;
          }

          if (nbChar === ch) {
            // misma habitación: abierto, añade arista de navegación
            const a = `${col},${row}`, b = `${nb.col},${nb.row}`;
            if (!navEdges[floor.id].has(a)) navEdges[floor.id].set(a, new Set());
            if (!navEdges[floor.id].has(b)) navEdges[floor.id].set(b, new Set());
            navEdges[floor.id].get(a).add(b);
            navEdges[floor.id].get(b).add(a);
            continue;
          }

          // habitaciones distintas: puerta o hueco abierto por defecto (dedupe por arista canónica)
          const edgeKeyParts = [`${col},${row}`, `${nb.col},${nb.row}`].sort();
          const edgeKey = `${floor.id}:${edgeKeyParts[0]}-${edgeKeyParts[1]}`;
          if (processedEdges.has(edgeKey)) {
            // ya construido desde el otro lado; solo añade nav edge si estaba abierto
            const a = `${col},${row}`, b = `${nb.col},${nb.row}`;
            if (!doorDefsByKey[`${col}:${row}:${side}`] && !doorDefsByKey[`${nb.col}:${nb.row}:${oppositeSide(side)}`]) {
              if (!navEdges[floor.id].has(a)) navEdges[floor.id].set(a, new Set());
              if (!navEdges[floor.id].has(b)) navEdges[floor.id].set(b, new Set());
              navEdges[floor.id].get(a).add(b);
              navEdges[floor.id].get(b).add(a);
            }
            continue;
          }
          processedEdges.add(edgeKey);

          const doorCfg = doorDefsByKey[`${col}:${row}:${side}`] || doorDefsByKey[`${nb.col}:${nb.row}:${oppositeSide(side)}`];
          if (doorCfg) {
            buildDoorway(floor.id, col, row, side, doorCfg, ROOM_H);
            if (!doorCfg.locked) {
              const a = `${col},${row}`, b = `${nb.col},${nb.row}`;
              if (!navEdges[floor.id].has(a)) navEdges[floor.id].set(a, new Set());
              if (!navEdges[floor.id].has(b)) navEdges[floor.id].set(b, new Set());
              navEdges[floor.id].get(a).add(b);
              navEdges[floor.id].get(b).add(a);
            }
          } else {
            const { x1: gx1, z1: gz1, x2: gx2, z2: gz2 } = edgeLine(col, row, side);
            const gapWidth = DEFAULT_GAP;
            const stub = Math.max(0, (CELL - gapWidth) / 2);
            const dx = (gx2 - gx1) / CELL, dz = (gz2 - gz1) / CELL;
            addWallBox(floor.id, gx1, gz1, gx1 + dx * stub, gz1 + dz * stub, fY, ROOM_H, floor.wallTex);
            addWallBox(floor.id, gx2 - dx * stub, gz2 - dz * stub, gx2, gz2, fY, ROOM_H, floor.wallTex);
            addDecorDoor(floor.id, gx1 + dx * stub, gz1 + dz * stub, gx2 - dx * stub, gz2 - dz * stub, ROOM_H);
            const a = `${col},${row}`, b = `${nb.col},${nb.row}`;
            if (!navEdges[floor.id].has(a)) navEdges[floor.id].set(a, new Set());
            if (!navEdges[floor.id].has(b)) navEdges[floor.id].set(b, new Set());
            navEdges[floor.id].get(a).add(b);
            navEdges[floor.id].get(b).add(a);
          }
        }
      }
    }
  }

  // Cross-floor nav edges via stairs
  for (const ce of crossEdges) {
    const aKey = `${ce.a.col},${ce.a.row}`, bKey = `${ce.b.col},${ce.b.row}`;
    if (!navEdges[ce.a.floorId].has(aKey)) navEdges[ce.a.floorId].set(aKey, new Set());
    if (!navEdges[ce.b.floorId].has(bKey)) navEdges[ce.b.floorId].set(bKey, new Set());
    navEdges[ce.a.floorId].get(aKey).add(`__cross__${ce.b.floorId}:${bKey}`);
    navEdges[ce.b.floorId].get(bKey).add(`__cross__${ce.a.floorId}:${aKey}`);
  }

  // ---- Ramp meshes ----
  for (const ramp of ramps) {
    const { bounds, y0, y1 } = ramp;
    const w = bounds.x1 - bounds.x0, d = bounds.z1 - bounds.z0;
    const segs = 10;
    const geo = new THREE.PlaneGeometry(bounds.axis === 'x' ? w : d, bounds.axis === 'x' ? d : w, segs, 1);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i);
      const t = bounds.axis === 'x' ? (lx / w + 0.5) : (pos.getZ(i) / d + 0.5);
      pos.setY(i, (y1 - y0) * t);
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshLambertMaterial({ map: TEX.woodFloorTexture() });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((bounds.x0 + bounds.x1) / 2, y0, (bounds.z0 + bounds.z1) / 2);
    group.add(mesh);

    // barandillas simples
    const railMat = new THREE.MeshLambertMaterial({ map: TEX.metalTexture() });
    for (const sideOff of [-1, 1]) {
      const railGeo = new THREE.BoxGeometry(bounds.axis === 'x' ? w : 0.1, 0.9, bounds.axis === 'x' ? 0.1 : d);
      const rail = new THREE.Mesh(railGeo, railMat);
      const midY = y0 + (y1 - y0) / 2 + 0.45;
      if (bounds.axis === 'x') rail.position.set((bounds.x0 + bounds.x1) / 2, midY, sideOff > 0 ? bounds.z1 : bounds.z0);
      else rail.position.set(sideOff > 0 ? bounds.x1 : bounds.x0, midY, (bounds.z0 + bounds.z1) / 2);
      rail.rotation.x = bounds.axis === 'x' ? Math.atan2(y1 - y0, w) : 0;
      rail.rotation.z = bounds.axis === 'z' ? -Math.atan2(y1 - y0, d) : 0;
      group.add(rail);
    }

    ramp.sampleY = (x, z) => {
      if (x < bounds.x0 - 0.3 || x > bounds.x1 + 0.3 || z < bounds.z0 - 0.3 || z > bounds.z1 + 0.3) return null;
      const t = bounds.axis === 'x' ? (x - bounds.x0) / w : (z - bounds.z0) / d;
      return y0 + (y1 - y0) * Math.min(1, Math.max(0, t));
    };
  }

  // ---- Merge geometry buckets into meshes ----
  for (const key of Object.keys(meshBuckets)) {
    const bucket = meshBuckets[key];
    if (bucket.geoms.length === 0) continue;
    const merged = mergeGeometries(bucket.geoms, false);
    let mat;
    if (bucket.matArgs.kind === 'ceiling') {
      mat = new THREE.MeshLambertMaterial({ color: 0x0c0a0a });
    } else {
      mat = new THREE.MeshLambertMaterial({ map: textureFor(bucket.matArgs.map) });
    }
    const mesh = new THREE.Mesh(merged, mat);
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    group.add(mesh);
  }

  function getFloorIndexAtY(y) {
    return Math.round(y / FLOOR_H);
  }
  function floorIdFromIndex(idx) {
    const f = FLOORS.find((fl) => fl.index === idx);
    return f ? f.id : FLOORS[0].id;
  }

  function findPath(startFloorId, startCol, startRow, goalFloorId, goalCol, goalRow) {
    const startKey = `${startFloorId}|${startCol},${startRow}`;
    const goalKey = `${goalFloorId}|${goalCol},${goalRow}`;
    if (startKey === goalKey) return [];
    const visited = new Set([startKey]);
    const prev = new Map();
    const queue = [startKey];
    let qi = 0;
    let found = false;
    while (qi < queue.length) {
      const cur = queue[qi++];
      if (cur === goalKey) { found = true; break; }
      const [fid, cr] = cur.split('|');
      const neighbors = navEdges[fid].get(cr);
      if (!neighbors) continue;
      for (const n of neighbors) {
        let nfid = fid, ncr = n;
        if (n.startsWith('__cross__')) {
          const rest = n.slice('__cross__'.length);
          const idx = rest.indexOf(':');
          nfid = rest.slice(0, idx);
          ncr = rest.slice(idx + 1);
        }
        const key = `${nfid}|${ncr}`;
        if (!visited.has(key)) {
          visited.add(key);
          prev.set(key, cur);
          queue.push(key);
        }
      }
    }
    if (!found) return null;
    const path = [];
    let cur = goalKey;
    while (cur !== startKey) {
      const [fid, cr] = cur.split('|');
      const [col, row] = cr.split(',').map(Number);
      path.push({ floorId: fid, col, row });
      cur = prev.get(cur);
      if (!cur) break;
    }
    path.reverse();
    return path;
  }

  function roomAt(floorId, col, row) {
    return roomLookup[floorId].get(`${col},${row}`);
  }

  function allRoomCells(floorId) {
    return Array.from(roomLookup[floorId].entries()).map(([k, v]) => {
      const [col, row] = k.split(',').map(Number);
      return { col, row, ...v };
    });
  }

  return {
    group,
    collision,
    doors,
    ramps,
    getFloorIndexAtY,
    floorIdFromIndex,
    findPath,
    roomAt,
    allRoomCells,
    cellCenter,
    flickerLights,
  };
}
