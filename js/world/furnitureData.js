// Colocación de muebles y decoración por habitación. Cada entrada referencia una celda
// (floorId, col, row) + un desplazamiento local (ox, oz) en metros y una rotación en Y.
// build: nombre del generador exportado por props.js. args: argumentos para ese generador.

export const FURNITURE = [
  // ---------------- PLANTA BAJA ----------------
  // Entrada
  { floorId: 'ground', col: 1, row: 0, ox: 0, oz: -1.2, rotY: 0, build: 'table', args: [0.9, 0.4, 0.75] },
  { floorId: 'ground', col: 1, row: 1, ox: 0, oz: 0, rotY: 0, build: 'rug', args: [2, 2, 0x3a2a28] },

  // Salón
  { floorId: 'ground', col: 0, row: 3, ox: 0.9, oz: 0, rotY: Math.PI / 2, build: 'sofa' },
  { floorId: 'ground', col: 1, row: 3, ox: -0.7, oz: 0.3, rotY: 0, build: 'coffeeTable' },
  { floorId: 'ground', col: 0, row: 2, ox: 0.9, oz: -1.2, rotY: Math.PI / 2, build: 'shelfUnit' },
  { floorId: 'ground', col: 1, row: 4, ox: -0.8, oz: 1, rotY: 0, build: 'rug', args: [1.8, 1.2, 0x2a3a4a] },

  // Comedor
  { floorId: 'ground', col: 8, row: 2, ox: 0, oz: 0.8, rotY: 0, build: 'table', args: [1.6, 0.95, 0.75] },
  { floorId: 'ground', col: 8, row: 2, ox: 0.9, oz: 0.2, rotY: Math.PI / 2, build: 'chair' },
  { floorId: 'ground', col: 8, row: 2, ox: -0.9, oz: 0.2, rotY: -Math.PI / 2, build: 'chair' },
  { floorId: 'ground', col: 8, row: 2, ox: 0, oz: 1.5, rotY: Math.PI, build: 'chair' },
  { floorId: 'ground', col: 8, row: 2, ox: 0, oz: -0.5, rotY: 0, build: 'chair' },

  // Cocina
  { floorId: 'ground', col: 3, row: 6, ox: -1.2, oz: -1.2, rotY: 0, build: 'kitchenCounter', args: [1.6] },
  { floorId: 'ground', col: 4, row: 6, ox: 0, oz: -1.3, rotY: 0, build: 'stove' },
  { floorId: 'ground', col: 5, row: 6, ox: 1.2, oz: -1.2, rotY: 0, build: 'sinkCounter' },
  { floorId: 'ground', col: 4, row: 7, ox: 0, oz: 1, rotY: 0, build: 'table', args: [1.1, 0.8, 0.75] },
  { floorId: 'ground', col: 4, row: 7, ox: 0.9, oz: 1, rotY: -Math.PI / 2, build: 'chair' },

  // Despensa
  { floorId: 'ground', col: 7, row: 6, ox: -1, oz: -1, rotY: 0, build: 'shelfUnit', args: [1.0, 1.8, 0.4, 4] },
  { floorId: 'ground', col: 8, row: 7, ox: 1, oz: 1, rotY: 0, build: 'crateStack' },

  // Biblioteca
  { floorId: 'ground', col: 3, row: 4, ox: -1.3, oz: -1.2, rotY: Math.PI / 2, build: 'shelfUnit', args: [1.6, 2.1, 0.35, 5] },
  { floorId: 'ground', col: 5, row: 4, ox: 1.3, oz: -1.2, rotY: -Math.PI / 2, build: 'shelfUnit', args: [1.6, 2.1, 0.35, 5] },
  { floorId: 'ground', col: 3, row: 5, ox: -1, oz: 1, rotY: Math.PI / 4, build: 'desk' },
  { floorId: 'ground', col: 3, row: 5, ox: -1, oz: 0.5, rotY: Math.PI / 4, build: 'bookStack' },
  { floorId: 'ground', col: 4, row: 4, ox: 0, oz: 1, rotY: 0, build: 'safeBox' },

  // Baño planta baja
  { floorId: 'ground', col: 0, row: 5, ox: 0, oz: -1, rotY: 0, build: 'toilet' },
  { floorId: 'ground', col: 0, row: 6, ox: 0, oz: 0, rotY: 0, build: 'sinkCounter' },

  // Sala de música
  { floorId: 'ground', col: 7, row: 0, ox: 0, oz: -0.8, rotY: 0, build: 'pianoBox' },
  { floorId: 'ground', col: 7, row: 0, ox: 0, oz: 0.5, rotY: Math.PI, build: 'chair' },

  // Garaje
  { floorId: 'ground', col: 9, row: 5, ox: 0, oz: 0, rotY: 0, build: 'car' },
  { floorId: 'ground', col: 8, row: 4, ox: -1, oz: -1.2, rotY: Math.PI / 2, build: 'shelfUnit', args: [1.0, 1.8, 0.35, 4] },

  // Armario (escondite)
  { floorId: 'ground', col: 3, row: 3, ox: 0.8, oz: 0, rotY: -Math.PI / 2, build: 'wardrobe' },

  // ---------------- PRIMER PISO ----------------
  // Dormitorio principal
  { floorId: 'first', col: 0, row: 1, ox: 0.3, oz: -0.3, rotY: 0, build: 'bed', args: ['double'] },
  { floorId: 'first', col: 0, row: 1, ox: 1.1, oz: -1.1, rotY: 0, build: 'nightstand' },
  { floorId: 'first', col: 2, row: 0, ox: 0, oz: -1.2, rotY: 0, build: 'wardrobe' },

  // Habitación de invitados
  { floorId: 'first', col: 0, row: 6, ox: 0.2, oz: -0.3, rotY: 0, build: 'bed', args: ['single'] },
  { floorId: 'first', col: 1, row: 6, ox: -0.8, oz: -1, rotY: 0, build: 'nightstand' },

  // Habitación del nieto
  { floorId: 'first', col: 0, row: 3, ox: 0, oz: -0.9, rotY: 0, build: 'bed', args: ['single'] },
  { floorId: 'first', col: 1, row: 4, ox: 0.8, oz: 0.8, rotY: 0, build: 'toyChest' },

  // Habitación de la hija
  { floorId: 'first', col: 7, row: 0, ox: 0, oz: -1, rotY: 0, build: 'bed', args: ['single'] },
  { floorId: 'first', col: 8, row: 1, ox: 0, oz: 1, rotY: Math.PI, build: 'desk' },

  // Despacho
  { floorId: 'first', col: 8, row: 4, ox: 0, oz: -1, rotY: Math.PI, build: 'desk' },
  { floorId: 'first', col: 8, row: 4, ox: 0, oz: -1.7, rotY: 0, build: 'deskLamp' },
  { floorId: 'first', col: 6, row: 4, ox: -1.2, oz: -1.2, rotY: Math.PI / 2, build: 'shelfUnit' },

  // Baño primer piso
  { floorId: 'first', col: 2, row: 2, ox: -1, oz: -1, rotY: 0, build: 'toilet' },
  { floorId: 'first', col: 3, row: 3, ox: 1, oz: 1, rotY: 0, build: 'sinkCounter' },

  // Balcón
  { floorId: 'first', col: 7, row: 6, ox: 0, oz: 0, rotY: 0, build: 'table', args: [0.8, 0.8, 0.7] },
  { floorId: 'first', col: 7, row: 6, ox: 0.9, oz: 0, rotY: -Math.PI / 2, build: 'chair' },

  // Armario grande (escondite)
  { floorId: 'first', col: 2, row: 4, ox: -0.8, oz: 0, rotY: Math.PI / 2, build: 'wardrobe' },

  // ---------------- SÓTANO ----------------
  // Sala de calderas
  { floorId: 'basement', col: 0, row: 0, ox: -0.8, oz: -0.8, rotY: 0, build: 'boiler' },
  { floorId: 'basement', col: 1, row: 0, ox: 0, oz: 1, rotY: 0, build: 'breakerPanel' },

  // Bodega
  { floorId: 'basement', col: 6, row: 0, ox: 0, oz: -1.2, rotY: 0, build: 'wineRack', args: [1.4, 1.6] },
  { floorId: 'basement', col: 9, row: 1, ox: 1.2, oz: 0, rotY: Math.PI / 2, build: 'wineRack', args: [1.4, 1.6] },
  { floorId: 'basement', col: 8, row: 2, ox: 0, oz: 0, rotY: 0, build: 'crateStack' },

  // Trastero (escondite)
  { floorId: 'basement', col: 0, row: 3, ox: 0.5, oz: 0.5, rotY: 0, build: 'crateStack' },
  { floorId: 'basement', col: 1, row: 4, ox: 0.5, oz: 0.5, rotY: 0, build: 'crate' },

  // Taller
  { floorId: 'basement', col: 7, row: 4, ox: 0, oz: -1, rotY: 0, build: 'workbench' },
  { floorId: 'basement', col: 9, row: 5, ox: 1.2, oz: 1, rotY: -Math.PI / 2, build: 'shelfUnit' },

  // Lavandería
  { floorId: 'basement', col: 7, row: 6, ox: 0, oz: -1.2, rotY: 0, build: 'washerDryer' },
  { floorId: 'basement', col: 9, row: 7, ox: 1.2, oz: 1, rotY: -Math.PI / 2, build: 'shelfUnit' },

  // Celda (jaula)
  { floorId: 'basement', col: 0, row: 5, ox: 2, oz: 2, rotY: 0, build: 'cage', args: [1.8, 1.8, 2.2] },

  // ---------------- ÁTICO ----------------
  { floorId: 'attic', col: 3, row: 1, ox: -0.5, oz: 0.5, rotY: 0, build: 'crateStack' },
  { floorId: 'attic', col: 6, row: 2, ox: 0.5, oz: -0.5, rotY: 0, build: 'crateStack' },
  { floorId: 'attic', col: 4, row: 4, ox: 0, oz: 0, rotY: 0, build: 'table', args: [1.0, 0.7, 0.7] },
];
