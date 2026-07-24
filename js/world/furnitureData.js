// Colocación de muebles y decoración por habitación. Cada entrada referencia una celda
// (floorId, col, row) + desplazamiento local (ox, oy, oz) en metros y rotación en Y.
// build: nombre del generador exportado por props.js. args: argumentos de ese generador.
// noCollide: fuerza que el mueble no genere colisión (p. ej. cosas colgadas de la pared).

export const FURNITURE = [
  // ================= PLANTA BAJA =================
  // --- Entrada (a) ---
  { floorId: 'ground', col: 1, row: 0, ox: 0, oz: -1.5, rotY: 0, build: 'table', args: [1.0, 0.42, 0.78] },
  { floorId: 'ground', col: 1, row: 0, ox: 0, oy: 1.7, oz: -1.92, rotY: 0, build: 'painting', args: [0, 0.7, 0.9], noCollide: true },
  { floorId: 'ground', col: 1, row: 1, ox: 0, oz: 0.2, rotY: 0, build: 'rug', args: [2.4, 2.2, 'blue'] },
  { floorId: 'ground', col: 0, row: 0, ox: -1.5, oz: -1.5, rotY: Math.PI / 4, build: 'shelfUnit', args: [0.8, 1.5, 0.3, 3] },

  // --- Salón (b) ---
  { floorId: 'ground', col: 0, row: 3, ox: -1.0, oz: 0, rotY: Math.PI / 2, build: 'sofa', args: ['red'] },
  { floorId: 'ground', col: 1, row: 3, ox: 0.3, oz: 0.1, rotY: 0, build: 'coffeeTable' },
  { floorId: 'ground', col: 1, row: 3, ox: 0.3, oz: 0.1, rotY: 0, build: 'rug', args: [2.6, 1.9, 'red'] },
  { floorId: 'ground', col: 1, row: 2, ox: 1.3, oz: -1.2, rotY: -Math.PI / 2, build: 'armchair' },
  { floorId: 'ground', col: 0, row: 2, ox: -1.4, oz: -1.3, rotY: Math.PI / 2, build: 'shelfUnit', args: [1.2, 1.9, 0.34, 4] },
  { floorId: 'ground', col: 1, row: 4, ox: 1.2, oz: 1.4, rotY: -Math.PI / 2, build: 'pianoBox' },
  { floorId: 'ground', col: 0, row: 3, ox: -1.92, oy: 1.75, oz: -1.2, rotY: Math.PI / 2, build: 'painting', args: [1, 1.0, 0.7], noCollide: true },
  { floorId: 'ground', col: 1, row: 4, ox: -0.6, oz: 1.9, rotY: 0, build: 'curtainPair', args: [1.5, 1.9], noCollide: true },

  // --- Comedor (c) ---
  { floorId: 'ground', col: 8, row: 2, ox: 0, oz: 0.6, rotY: 0, build: 'table', args: [1.8, 1.0, 0.76] },
  { floorId: 'ground', col: 8, row: 2, ox: 1.15, oz: 0.3, rotY: Math.PI / 2, build: 'chair' },
  { floorId: 'ground', col: 8, row: 2, ox: -1.15, oz: 0.3, rotY: -Math.PI / 2, build: 'chair' },
  { floorId: 'ground', col: 8, row: 2, ox: 1.15, oz: 1.0, rotY: Math.PI / 2, build: 'chair' },
  { floorId: 'ground', col: 8, row: 2, ox: -1.15, oz: 1.0, rotY: -Math.PI / 2, build: 'chair' },
  { floorId: 'ground', col: 8, row: 2, ox: 0, oz: 1.65, rotY: Math.PI, build: 'chair' },
  { floorId: 'ground', col: 8, row: 2, ox: 0, oz: -0.45, rotY: 0, build: 'chair' },
  { floorId: 'ground', col: 9, row: 3, ox: 1.4, oz: 1.2, rotY: -Math.PI / 2, build: 'dresser' },
  { floorId: 'ground', col: 7, row: 2, ox: -1.9, oy: 1.7, oz: 0, rotY: Math.PI / 2, build: 'painting', args: [2, 0.9, 0.7], noCollide: true },

  // --- Cocina (d) ---
  { floorId: 'ground', col: 3, row: 6, ox: -0.9, oz: -1.5, rotY: 0, build: 'kitchenCounter', args: [2.0] },
  { floorId: 'ground', col: 5, row: 6, ox: 0.4, oz: -1.5, rotY: 0, build: 'stove' },
  { floorId: 'ground', col: 5, row: 6, ox: 1.5, oz: -1.4, rotY: 0, build: 'fridge' },
  { floorId: 'ground', col: 3, row: 7, ox: -1.5, oz: 0.4, rotY: Math.PI / 2, build: 'sinkCounter' },
  { floorId: 'ground', col: 4, row: 7, ox: 0.2, oz: 0.7, rotY: 0, build: 'table', args: [1.2, 0.85, 0.75] },
  { floorId: 'ground', col: 4, row: 7, ox: 1.1, oz: 0.7, rotY: -Math.PI / 2, build: 'chair' },
  { floorId: 'ground', col: 4, row: 7, ox: -0.7, oz: 0.7, rotY: Math.PI / 2, build: 'chair' },

  // --- Despensa (e) ---
  { floorId: 'ground', col: 7, row: 6, ox: -1.5, oz: -1.2, rotY: Math.PI / 2, build: 'shelfUnit', args: [1.4, 1.9, 0.36, 4] },
  { floorId: 'ground', col: 8, row: 7, ox: 1.3, oz: 1.2, rotY: -Math.PI / 2, build: 'shelfUnit', args: [1.2, 1.7, 0.34, 4] },
  { floorId: 'ground', col: 8, row: 6, ox: 0.6, oz: -0.4, rotY: 0.5, build: 'crateStack', args: [2] },

  // --- Biblioteca (f) ---
  { floorId: 'ground', col: 3, row: 4, ox: -1.5, oz: -1.3, rotY: Math.PI / 2, build: 'shelfUnit', args: [1.8, 2.2, 0.36, 5] },
  { floorId: 'ground', col: 5, row: 4, ox: 1.5, oz: -1.3, rotY: -Math.PI / 2, build: 'shelfUnit', args: [1.8, 2.2, 0.36, 5] },
  { floorId: 'ground', col: 3, row: 5, ox: -1.5, oz: 1.3, rotY: Math.PI / 2, build: 'shelfUnit', args: [1.6, 2.2, 0.36, 5] },
  { floorId: 'ground', col: 4, row: 5, ox: 0.3, oz: 1.2, rotY: Math.PI, build: 'desk' },
  { floorId: 'ground', col: 4, row: 5, ox: 0.3, oy: 0.82, oz: 1.4, rotY: Math.PI, build: 'deskLamp', noCollide: true },
  { floorId: 'ground', col: 4, row: 5, ox: -0.1, oy: 0.82, oz: 1.05, rotY: 0.4, build: 'bookStack', noCollide: true },
  { floorId: 'ground', col: 4, row: 5, ox: 1.4, oz: 0.4, rotY: 0, build: 'globeStand' },
  { floorId: 'ground', col: 4, row: 4, ox: 0.2, oz: 1.2, rotY: Math.PI, build: 'safeBox' },
  { floorId: 'ground', col: 4, row: 4, ox: 0.2, oy: 1.35, oz: 1.55, rotY: Math.PI, build: 'painting', args: [0, 0.9, 0.7], noCollide: true },

  // --- Baño (g) ---
  { floorId: 'ground', col: 0, row: 5, ox: -1.3, oz: -1.2, rotY: 0, build: 'toilet' },
  { floorId: 'ground', col: 0, row: 6, ox: -1.3, oz: 0.6, rotY: 0, build: 'sinkCounter' },
  { floorId: 'ground', col: 0, row: 6, ox: 0.6, oz: 1.3, rotY: Math.PI / 2, build: 'bathtub' },

  // --- Sala de música (h) ---
  { floorId: 'ground', col: 7, row: 0, ox: -0.4, oz: -1.1, rotY: 0, build: 'pianoBox' },
  { floorId: 'ground', col: 7, row: 0, ox: -0.4, oz: 0.1, rotY: Math.PI, build: 'chair' },
  { floorId: 'ground', col: 8, row: 1, ox: 1.2, oz: 1.2, rotY: -Math.PI / 2, build: 'armchair' },
  { floorId: 'ground', col: 8, row: 0, ox: 1.2, oz: -1.9, rotY: 0, build: 'curtainPair', args: [1.6, 2.0], noCollide: true },
  { floorId: 'ground', col: 9, row: 1, ox: 1.5, oz: 0, rotY: -Math.PI / 2, build: 'shelfUnit', args: [1.2, 1.7, 0.32, 4] },

  // --- Garaje (i) ---
  { floorId: 'ground', col: 9, row: 5, ox: -0.3, oz: 0.2, rotY: 0, build: 'car' },
  { floorId: 'ground', col: 8, row: 4, ox: -1.4, oz: -1.2, rotY: Math.PI / 2, build: 'workbench' },
  { floorId: 'ground', col: 8, row: 5, ox: -1.5, oz: 1.0, rotY: Math.PI / 2, build: 'toolShelf' },
  { floorId: 'ground', col: 8, row: 6, ox: -1.2, oz: 0.8, rotY: 0.3, build: 'crateStack', args: [3] },

  // --- Armario escondite (k) ---
  { floorId: 'ground', col: 3, row: 3, ox: 0.85, oz: 0, rotY: -Math.PI / 2, build: 'wardrobe' },

  // ================= PRIMER PISO =================
  // --- Dormitorio principal (l) ---
  { floorId: 'first', col: 0, row: 1, ox: 0.1, oz: 0.5, rotY: 0, build: 'bed', args: ['double'] },
  { floorId: 'first', col: 0, row: 1, ox: 1.15, oz: -0.9, rotY: 0, build: 'nightstand' },
  { floorId: 'first', col: 0, row: 1, ox: 1.15, oy: 0.52, oz: -0.9, rotY: 0.4, build: 'deskLamp', noCollide: true },
  { floorId: 'first', col: 0, row: 0, ox: -1.1, oz: -1.5, rotY: 0, build: 'dresser' },
  { floorId: 'first', col: 2, row: 0, ox: 0.4, oz: -1.4, rotY: 0, build: 'wardrobe' },
  { floorId: 'first', col: 1, row: 1, ox: 0.5, oz: 1.6, rotY: 0, build: 'rug', args: [2.4, 1.6, 'red'] },
  { floorId: 'first', col: 3, row: 0, ox: 1.2, oy: 1.7, oz: -1.92, rotY: 0, build: 'painting', args: [1, 0.9, 0.7], noCollide: true },
  { floorId: 'first', col: 0, row: 0, ox: 0.4, oz: -1.9, rotY: 0, build: 'curtainPair', args: [1.4, 1.9], noCollide: true },

  // --- Habitación de invitados (m) ---
  { floorId: 'first', col: 0, row: 6, ox: 0.1, oz: 0.4, rotY: 0, build: 'bed', args: ['single'] },
  { floorId: 'first', col: 1, row: 6, ox: -0.6, oz: -0.9, rotY: 0, build: 'nightstand' },
  { floorId: 'first', col: 1, row: 7, ox: 1.2, oz: 1.2, rotY: -Math.PI / 2, build: 'wardrobe' },
  { floorId: 'first', col: 0, row: 5, ox: -1.4, oz: -1.4, rotY: Math.PI / 2, build: 'dresser' },

  // --- Habitación del nieto (n) ---
  { floorId: 'first', col: 0, row: 3, ox: -0.3, oz: -0.7, rotY: 0, build: 'bed', args: ['single'] },
  { floorId: 'first', col: 1, row: 4, ox: 1.0, oz: 1.1, rotY: 0.4, build: 'toyChest' },
  { floorId: 'first', col: 0, row: 4, ox: -1.4, oz: 1.2, rotY: Math.PI / 2, build: 'shelfUnit', args: [1.0, 1.4, 0.3, 3] },
  { floorId: 'first', col: 1, row: 3, ox: 1.1, oz: -1.3, rotY: -Math.PI / 2, build: 'desk' },

  // --- Habitación de la hija (o) ---
  { floorId: 'first', col: 7, row: 0, ox: -0.4, oz: -1.0, rotY: 0, build: 'bed', args: ['single'] },
  { floorId: 'first', col: 8, row: 1, ox: 0.4, oz: 1.2, rotY: Math.PI, build: 'desk' },
  { floorId: 'first', col: 9, row: 0, ox: 1.3, oz: -1.3, rotY: -Math.PI / 2, build: 'wardrobe' },
  { floorId: 'first', col: 8, row: 0, ox: 0.2, oz: -1.9, rotY: 0, build: 'curtainPair', args: [1.4, 1.9], noCollide: true },
  { floorId: 'first', col: 7, row: 1, ox: -1.5, oz: 1.2, rotY: Math.PI / 2, build: 'dresser' },

  // --- Despacho (p) ---
  { floorId: 'first', col: 8, row: 4, ox: 0.2, oz: -0.9, rotY: Math.PI, build: 'desk' },
  { floorId: 'first', col: 8, row: 4, ox: 0.2, oy: 0.82, oz: -1.2, rotY: Math.PI, build: 'deskLamp', noCollide: true },
  { floorId: 'first', col: 8, row: 4, ox: 0.2, oz: 0.1, rotY: 0, build: 'chair' },
  { floorId: 'first', col: 6, row: 4, ox: -1.5, oz: -1.2, rotY: Math.PI / 2, build: 'shelfUnit', args: [1.6, 2.0, 0.34, 4] },
  { floorId: 'first', col: 9, row: 5, ox: 1.4, oz: 1.0, rotY: -Math.PI / 2, build: 'shelfUnit', args: [1.4, 2.0, 0.34, 4] },
  { floorId: 'first', col: 6, row: 5, ox: -1.2, oz: 1.3, rotY: 0, build: 'globeStand' },

  // --- Baño (q) ---
  { floorId: 'first', col: 2, row: 2, ox: -1.2, oz: -1.2, rotY: 0, build: 'toilet' },
  { floorId: 'first', col: 3, row: 2, ox: 1.2, oz: -1.2, rotY: 0, build: 'sinkCounter' },
  { floorId: 'first', col: 3, row: 3, ox: 0.8, oz: 1.2, rotY: Math.PI / 2, build: 'bathtub' },

  // --- Balcón (r) ---
  { floorId: 'first', col: 7, row: 6, ox: -0.6, oz: 0, rotY: 0, build: 'table', args: [0.85, 0.85, 0.72, 'light'] },
  { floorId: 'first', col: 7, row: 6, ox: 0.5, oz: 0, rotY: -Math.PI / 2, build: 'chair' },
  { floorId: 'first', col: 8, row: 7, ox: 1.0, oz: 1.0, rotY: 0.6, build: 'chair' },

  // --- Armario grande escondite (t) ---
  { floorId: 'first', col: 2, row: 4, ox: -0.85, oz: 0, rotY: Math.PI / 2, build: 'wardrobe' },
  { floorId: 'first', col: 3, row: 4, ox: 1.2, oz: -1.2, rotY: 0, build: 'crateStack', args: [2] },

  // ================= SÓTANO =================
  // --- Sala de calderas (A) ---
  { floorId: 'basement', col: 0, row: 0, ox: -1.0, oz: -1.0, rotY: 0, build: 'boiler' },
  { floorId: 'basement', col: 1, row: 0, ox: 0.6, oy: 0.9, oz: -1.85, rotY: 0, build: 'breakerPanel', noCollide: true },
  { floorId: 'basement', col: 0, row: 1, ox: -1.4, oz: 1.2, rotY: Math.PI / 2, build: 'shelfUnit', args: [1.2, 1.7, 0.32, 4] },
  { floorId: 'basement', col: 1, row: 1, ox: 0.8, oz: 0.9, rotY: 0.4, build: 'crateStack', args: [3] },

  // --- Bodega (B) ---
  { floorId: 'basement', col: 6, row: 0, ox: -0.4, oz: -1.6, rotY: 0, build: 'wineRack', args: [1.6, 1.7] },
  { floorId: 'basement', col: 8, row: 0, ox: 0.8, oz: -1.6, rotY: 0, build: 'wineRack', args: [1.6, 1.7] },
  { floorId: 'basement', col: 9, row: 1, ox: 1.6, oz: 0, rotY: -Math.PI / 2, build: 'wineRack', args: [1.6, 1.7] },
  { floorId: 'basement', col: 8, row: 2, ox: 0.2, oz: 0.6, rotY: 0.7, build: 'crateStack', args: [3] },
  { floorId: 'basement', col: 6, row: 1, ox: -0.6, oz: 0.8, rotY: 0, build: 'table', args: [1.3, 0.8, 0.78, 'dark'] },

  // --- Trastero (C) ---
  { floorId: 'basement', col: 0, row: 3, ox: 0.6, oz: 0.6, rotY: 0.2, build: 'crateStack', args: [3] },
  { floorId: 'basement', col: 1, row: 4, ox: 0.7, oz: -0.6, rotY: 0.9, build: 'crateStack', args: [2] },
  { floorId: 'basement', col: 0, row: 4, ox: -1.4, oz: 1.0, rotY: Math.PI / 2, build: 'shelfUnit', args: [1.2, 1.8, 0.34, 4] },

  // --- Taller (E) ---
  { floorId: 'basement', col: 7, row: 4, ox: -0.3, oz: -1.4, rotY: 0, build: 'workbench' },
  { floorId: 'basement', col: 9, row: 4, ox: 1.4, oz: -0.6, rotY: -Math.PI / 2, build: 'toolShelf' },
  { floorId: 'basement', col: 8, row: 5, ox: 0.4, oz: 1.2, rotY: 0.4, build: 'crateStack', args: [2] },

  // --- Lavandería (D) ---
  { floorId: 'basement', col: 7, row: 6, ox: -0.2, oz: -1.5, rotY: 0, build: 'washerDryer' },
  { floorId: 'basement', col: 9, row: 7, ox: 1.4, oz: 1.0, rotY: -Math.PI / 2, build: 'shelfUnit', args: [1.2, 1.7, 0.32, 4] },
  { floorId: 'basement', col: 8, row: 7, ox: 0, oz: 1.0, rotY: 0, build: 'table', args: [1.2, 0.7, 0.8, 'dark'] },

  // --- La celda (H) ---
  { floorId: 'basement', col: 0, row: 5, ox: 1.9, oz: 1.9, rotY: 0, build: 'cage', args: [1.9, 1.9, 2.2] },
  { floorId: 'basement', col: 1, row: 6, ox: 0.9, oz: 0.6, rotY: 0.3, build: 'crate', args: [0.5] },

  // ================= ÁTICO =================
  { floorId: 'attic', col: 3, row: 1, ox: -0.6, oz: 0.6, rotY: 0.3, build: 'crateStack', args: [3] },
  { floorId: 'attic', col: 6, row: 2, ox: 0.6, oz: -0.6, rotY: 0.8, build: 'crateStack', args: [3] },
  { floorId: 'attic', col: 2, row: 2, ox: -0.5, oz: 0, rotY: Math.PI / 2, build: 'shelfUnit', args: [1.2, 1.6, 0.32, 3] },
  { floorId: 'attic', col: 5, row: 4, ox: 0.4, oz: 0.6, rotY: 0.2, build: 'table', args: [1.1, 0.75, 0.72, 'dark'] },
  { floorId: 'attic', col: 4, row: 4, ox: -0.8, oz: 0.9, rotY: 0.5, build: 'toyChest' },
  { floorId: 'attic', col: 7, row: 6, ox: 0.6, oz: 0.6, rotY: 0.6, build: 'crateStack', args: [2] },
  { floorId: 'attic', col: 4, row: 6, ox: 0, oz: 1.0, rotY: 0, build: 'dresser' },
];
