import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FURNITURE } from './furnitureData.js';
import * as PROPS from './props.js';

/**
 * Un mueble se construye como un grupo de muchas piezas pequeñas, y cada pieza
 * sería una llamada de dibujo. Como los muebles no se animan, fusionamos su
 * geometría por material: una cómoda de 14 piezas pasa a ser 3 mallas.
 */
function mergeProp(root) {
  root.updateMatrixWorld(true);
  const byMaterial = new Map();
  root.traverse((o) => {
    if (!o.isMesh || !o.geometry.attributes.position) return;
    const key = o.material.uuid;
    if (!byMaterial.has(key)) byMaterial.set(key, { material: o.material, geos: [] });
    const geo = o.geometry.clone();
    geo.applyMatrix4(o.matrixWorld);
    byMaterial.get(key).geos.push(geo);
  });
  const out = new THREE.Group();
  for (const { material, geos } of byMaterial.values()) {
    let merged;
    try {
      merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
    } catch {
      merged = null;
    }
    if (merged) out.add(new THREE.Mesh(merged, material));
    else for (const g of geos) out.add(new THREE.Mesh(g, material));
  }
  out.userData = root.userData;
  return out;
}

// Genera los 4 segmentos de colisión del rectángulo (huella) de un mueble, ya rotado.
function footprintSegments(cx, cz, w, d, rotY) {
  const hw = Math.max(0.05, w / 2 - 0.04);
  const hd = Math.max(0.05, d / 2 - 0.04);
  const cos = Math.cos(rotY), sin = Math.sin(rotY);
  const corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([lx, lz]) => ({
    x: cx + lx * cos + lz * sin,
    z: cz - lx * sin + lz * cos,
  }));
  const segs = [];
  for (let i = 0; i < 4; i++) {
    const a = corners[i], b = corners[(i + 1) % 4];
    segs.push({ x1: a.x, z1: a.z, x2: b.x, z2: b.z, prop: true });
  }
  return segs;
}

export function buildFurniture(house, group) {
  for (const item of FURNITURE) {
    const builder = PROPS.BUILDERS[item.build];
    if (!builder) continue;
    const raw = builder(...(item.args || []));
    // El desplazamiento interno de cada pieza queda horneado al fusionar, así que
    // el grupo resultante se posiciona con set() y no con +=.
    const mesh = mergeProp(raw);
    const c = house.cellCenter(item.floorId, item.col, item.row);
    const x = c.x + (item.ox || 0);
    const z = c.z + (item.oz || 0);
    mesh.position.set(x, c.y + (item.oy || 0), z);
    mesh.rotation.y = item.rotY || 0;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    group.add(mesh);

    const fp = mesh.userData && mesh.userData.footprint;
    if (fp && !item.noCollide) {
      const segs = footprintSegments(x, z, fp.w, fp.d, item.rotY || 0);
      const list = house.collision[item.floorId];
      if (list) for (const s of segs) list.push(s);
    }
  }
}
