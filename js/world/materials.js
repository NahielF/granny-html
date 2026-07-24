// Materiales compartidos y cacheados. Crear un material (y su textura) por cada
// mueble desperdicia memoria de GPU y multiplica las llamadas de dibujo.
import * as THREE from 'three';
import * as TEX from './textures.js';

const _mats = new Map();

function mat(key, factory) {
  let m = _mats.get(key);
  if (!m) { m = factory(); _mats.set(key, m); }
  return m;
}

export const M = {
  woodLight: () => mat('woodLight', () => new THREE.MeshLambertMaterial({ map: TEX.woodTexture('light') })),
  wood: () => mat('wood', () => new THREE.MeshLambertMaterial({ map: TEX.woodTexture('mid') })),
  woodDark: () => mat('woodDark', () => new THREE.MeshLambertMaterial({ map: TEX.woodTexture('dark') })),
  woodRed: () => mat('woodRed', () => new THREE.MeshLambertMaterial({ map: TEX.woodTexture('red') })),
  woodDoor: () => mat('woodDoor', () => new THREE.MeshLambertMaterial({ map: TEX.woodDoorTexture() })),

  fabricRed: () => mat('fabricRed', () => new THREE.MeshLambertMaterial({ map: TEX.fabricTexture([92, 31, 38]) })),
  fabricGreen: () => mat('fabricGreen', () => new THREE.MeshLambertMaterial({ map: TEX.fabricTexture([44, 62, 44]) })),
  fabricBlue: () => mat('fabricBlue', () => new THREE.MeshLambertMaterial({ map: TEX.fabricTexture([40, 52, 84]) })),
  fabricBrown: () => mat('fabricBrown', () => new THREE.MeshLambertMaterial({ map: TEX.fabricTexture([74, 56, 40]) })),

  linen: () => mat('linen', () => new THREE.MeshLambertMaterial({ map: TEX.linenTexture() })),
  pillow: () => mat('pillow', () => new THREE.MeshLambertMaterial({ map: TEX.linenTexture([242, 240, 232]) })),

  metal: () => mat('metal', () => new THREE.MeshLambertMaterial({ map: TEX.metalTexture() })),
  metalDark: () => mat('metalDark', () => new THREE.MeshLambertMaterial({ map: TEX.metalTexture([52, 54, 58]) })),
  brass: () => mat('brass', () => new THREE.MeshLambertMaterial({ map: TEX.metalTexture([158, 126, 52]) })),
  rust: () => mat('rust', () => new THREE.MeshLambertMaterial({ map: TEX.rustTexture() })),

  ceramic: () => mat('ceramic', () => new THREE.MeshLambertMaterial({ map: TEX.ceramicTexture() })),
  ceramicGrey: () => mat('ceramicGrey', () => new THREE.MeshLambertMaterial({ map: TEX.ceramicTexture([206, 202, 194]) })),

  paintedWhite: () => mat('paintedWhite', () => new THREE.MeshLambertMaterial({ map: TEX.paintedTexture('#d5d0c4') })),
  paintedGrey: () => mat('paintedGrey', () => new THREE.MeshLambertMaterial({ map: TEX.paintedTexture('#8d9096') })),
  paintedBlack: () => mat('paintedBlack', () => new THREE.MeshLambertMaterial({ map: TEX.paintedTexture('#26262a') })),
  paintedBlue: () => mat('paintedBlue', () => new THREE.MeshLambertMaterial({ map: TEX.paintedTexture('#2c5a8a') })),

  carPaint: () => mat('carPaint', () => new THREE.MeshLambertMaterial({ map: TEX.carPaintTexture('#7d1418') })),
  glass: () => mat('glass', () => new THREE.MeshLambertMaterial({ color: 0x141e2c, transparent: true, opacity: 0.55 })),
  glassDark: () => mat('glassDark', () => new THREE.MeshLambertMaterial({ color: 0x0a1018 })),

  books: () => mat('books', () => new THREE.MeshLambertMaterial({ map: TEX.bookRowTexture() })),
  curtain: () => mat('curtain', () => new THREE.MeshLambertMaterial({ map: TEX.curtainTexture(), side: THREE.DoubleSide })),
  carpet: () => mat('carpet', () => new THREE.MeshLambertMaterial({ map: TEX.carpetTexture([70, 15, 20]) })),
  carpetBlue: () => mat('carpetBlue', () => new THREE.MeshLambertMaterial({ map: TEX.carpetTexture([30, 38, 62]) })),
  concrete: () => mat('concrete', () => new THREE.MeshLambertMaterial({ map: TEX.concreteTexture() })),
  trim: () => mat('trim', () => new THREE.MeshLambertMaterial({ map: TEX.trimTexture() })),

  painting: (v) => mat(`painting${v}`, () => new THREE.MeshLambertMaterial({ map: TEX.paintingTexture(v) })),
  lampGlow: () => mat('lampGlow', () => new THREE.MeshBasicMaterial({ color: 0xffd9a0 })),
  lampGlowOff: () => mat('lampGlowOff', () => new THREE.MeshLambertMaterial({ color: 0x3a3630 })),
  skin: () => mat('skin', () => new THREE.MeshLambertMaterial({ color: 0xc9ab8c })),
};
