// Datos de la mansión: 4 plantas en rejilla ASCII (cada carácter = 1 celda de CELL metros).
// '.' = vacío/exterior. Letras = habitaciones (por planta, se puede repetir letra en otra planta).
// Dígitos '1','2','3' = tramos de escalera que conectan dos plantas (misma celda en ambas).
export const CELL = 4;       // metros por celda
export const ROOM_H = 2.7;   // altura interior de una planta
export const FLOOR_H = 3.0;  // distancia vertical entre plantas (altura de suelo a suelo)

export const FLOORS = [
  {
    id: 'basement', index: -1, name: 'Sótano',
    floorTex: 'brick', wallTex: 'plaster',
    grid: [
      'AAGGGGBBBB',
      'AAGGGGBBBB',
      'GGG11GGGBB',
      'CCGGGGGGGG',
      'CCGGGGEEEE',
      'HHGGGGEEEE',
      'HHGGFFDDDD',
      '..GGFFDDDD',
    ],
    rooms: {
      A: { name: 'Sala de calderas', floorTex: 'brick' },
      B: { name: 'Bodega', floorTex: 'brick' },
      C: { name: 'Trastero', floorTex: 'brick' },
      D: { name: 'Lavandería', floorTex: 'tile' },
      E: { name: 'Taller', floorTex: 'brick' },
      F: { name: 'Túnel secreto', floorTex: 'brick', dark: true },
      G: { name: 'Pasillo del sótano', floorTex: 'brick' },
      H: { name: 'La celda', floorTex: 'metal', dark: true },
    },
    doors: [
      { col: 4, row: 6, side: 'W', id: 'tunnelHatch', locked: true, requiresItem: 'crank_handle', name: 'Trampilla del túnel' },
    ],
    exteriorDoors: [],
  },
  {
    id: 'ground', index: 0, name: 'Planta baja',
    floorTex: 'wood', wallTex: 'wallpaper',
    grid: [
      'aaajjjhhhh',
      'aaajjjhhhh',
      'bbj11j2ccc',
      'bbjkjj2ccc',
      'bbjfffjjii',
      'gjjfffjjii',
      'gjjdddjeei',
      '.jjdddjeei',
    ],
    rooms: {
      a: { name: 'Entrada', floorTex: 'tile' },
      b: { name: 'Salón', floorTex: 'carpet' },
      c: { name: 'Comedor', floorTex: 'wood' },
      d: { name: 'Cocina', floorTex: 'tile' },
      e: { name: 'Despensa', floorTex: 'tile' },
      f: { name: 'Biblioteca', floorTex: 'wood' },
      g: { name: 'Baño', floorTex: 'tile' },
      h: { name: 'Sala de música', floorTex: 'wood' },
      i: { name: 'Garaje', floorTex: 'brick' },
      j: { name: 'Pasillo', floorTex: 'wood' },
      k: { name: 'Armario', floorTex: 'wood', dark: true },
    },
    doors: [],
    exteriorDoors: [
      { col: 1, row: 0, side: 'N', id: 'frontDoor', locked: true, permanent: true, name: 'Puerta principal (atrancada)' },
      { col: 9, row: 7, side: 'S', id: 'garageDoor', locked: true, requiresCondition: 'garage', name: 'Puerta del garaje' },
    ],
  },
  {
    id: 'first', index: 1, name: 'Primer piso',
    floorTex: 'wood', wallTex: 'wallpaper',
    grid: [
      'llllssoooo',
      'llllssoooo',
      'ssqqss2sss',
      'nnqqss2sss',
      'nnttsspppp',
      'mm33sspppp',
      'mmssssrrrr',
      'mmss..rrrr',
    ],
    rooms: {
      l: { name: 'Dormitorio principal', floorTex: 'carpet' },
      m: { name: 'Habitación de invitados', floorTex: 'carpet' },
      n: { name: 'Habitación del nieto', floorTex: 'wood' },
      o: { name: 'Habitación de la hija', floorTex: 'wood' },
      p: { name: 'Despacho', floorTex: 'wood' },
      q: { name: 'Baño', floorTex: 'tile' },
      r: { name: 'Balcón', floorTex: 'tile' },
      s: { name: 'Pasillo', floorTex: 'wood' },
      t: { name: 'Armario grande', floorTex: 'wood', dark: true },
    },
    doors: [],
    exteriorDoors: [
      { col: 8, row: 7, side: 'S', id: 'balconyDoor', locked: false, name: 'Balcón' },
    ],
  },
  {
    id: 'attic', index: 2, name: 'Ático',
    floorTex: 'wood', wallTex: 'plaster',
    grid: [
      '..........',
      '..uuuuuu..',
      '..uuuuuu..',
      '..uuwwuu..',
      '..uuwwuu..',
      '..33uuuu..',
      '..uuuuxx..',
      '..........',
    ],
    rooms: {
      u: { name: 'Ático', floorTex: 'wood', dark: true },
      w: { name: 'Cuarto oculto', floorTex: 'wood', dark: true },
      x: { name: 'Ventana del tejado', floorTex: 'wood', dark: true },
    },
    doors: [
      { col: 4, row: 3, side: 'W', id: 'hiddenRoomDoor', locked: true, requiresItem: 'rusty_key', name: 'Cuarto oculto' },
    ],
    exteriorDoors: [
      { col: 7, row: 6, side: 'E', id: 'roofWindow', locked: false, name: 'Ventana del tejado' },
    ],
  },
];

// Escaleras: conectan dos plantas en las mismas celdas de rejilla (marcadas con el dígito).
export const STAIRS = [
  { id: '1', bottomFloor: 'basement', topFloor: 'ground', col: 3, row: 2, length: 2, axis: 'x' },
  { id: '2', bottomFloor: 'ground', topFloor: 'first', col: 6, row: 2, length: 2, axis: 'z' },
  { id: '3', bottomFloor: 'first', topFloor: 'attic', col: 2, row: 5, length: 2, axis: 'x' },
];

export function floorY(floorId) {
  const f = FLOORS.find((fl) => fl.id === floorId);
  return f.index * FLOOR_H;
}

export function getFloor(id) {
  return FLOORS.find((f) => f.id === id);
}
