import { FURNITURE } from './furnitureData.js';
import * as PROPS from './props.js';

export function buildFurniture(house, group) {
  for (const item of FURNITURE) {
    const builder = PROPS.BUILDERS[item.build];
    if (!builder) continue;
    const mesh = builder(...(item.args || []));
    const c = house.cellCenter(item.floorId, item.col, item.row);
    mesh.position.x += c.x + (item.ox || 0);
    mesh.position.y += c.y;
    mesh.position.z += c.z + (item.oz || 0);
    mesh.rotation.y = item.rotY || 0;
    group.add(mesh);
  }
}
