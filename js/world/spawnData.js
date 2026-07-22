// Posiciones de aparición: jugador, objetos, puzzles, escondites y monstruos.
// Coordenadas en celdas de rejilla (col,row) sobre una planta concreta.

export const PLAYER_SPAWN = { floorId: 'ground', col: 1, row: 1, angleY: Math.PI };

export const ITEMS = [
  { id: 'crowbar', name: 'Palanca', icon: '🛠️', floorId: 'basement', col: 7, row: 4, unique: true,
    desc: 'Sirve para forzar cajones y cajas tabladas.' },
  { id: 'fuse', name: 'Fusible', icon: '🔌', floorId: 'basement', col: 8, row: 4, stack: true,
    desc: 'Un fusible para el cuadro eléctrico. Necesitas dos.' },
  { id: 'fuse', name: 'Fusible', icon: '🔌', floorId: 'first', col: 8, row: 5, stack: true,
    desc: 'Un fusible para el cuadro eléctrico. Necesitas dos.' },
  { id: 'battery_car', name: 'Batería del coche', icon: '🔋', floorId: 'basement', col: 8, row: 1, unique: true,
    desc: 'Una batería de coche pesada, aún parece servir.' },
  { id: 'fuelcan', name: 'Bidón de gasolina', icon: '⛽', floorId: 'ground', col: 7, row: 6, unique: true,
    desc: 'Gasolina para el depósito del coche.' },
  { id: 'safecode_note', name: 'Nota con un código', icon: '📝', floorId: 'first', col: 1, row: 0, unique: true, note: true,
    desc: 'Una nota antigua: "731... la única combinación que nunca olvido."' },
  { id: 'beartrap', name: 'Trampa para osos', icon: '🪤', floorId: 'first', col: 2, row: 4, stack: true,
    desc: 'Colócala en el suelo para atrapar a quien te persiga durante unos segundos.' },
  { id: 'beartrap', name: 'Trampa para osos', icon: '🪤', floorId: 'basement', col: 1, row: 3, stack: true,
    desc: 'Colócala en el suelo para atrapar a quien te persiga durante unos segundos.' },
  { id: 'taser', name: 'Táser', icon: '⚡', floorId: 'first', col: 9, row: 4, unique: true, charges: 2,
    desc: 'Aturde brevemente a quien te persiga si está muy cerca. Quedan 2 cargas.' },
  { id: 'molotov', name: 'Cóctel molotov', icon: '🍾', floorId: 'ground', col: 4, row: 6, unique: true,
    desc: 'Un uso único: prende la habitación y ahuyenta a cualquiera un buen rato.' },
  { id: 'meat', name: 'Carne cruda', icon: '🥩', floorId: 'ground', col: 5, row: 7, stack: true,
    desc: 'Lánzala para atraer a quien te persiga hacia otro lugar.' },
  { id: 'meat', name: 'Carne cruda', icon: '🥩', floorId: 'ground', col: 3, row: 6, stack: true,
    desc: 'Lánzala para atraer a quien te persiga hacia otro lugar.' },
  { id: 'crank_handle', name: 'Manivela oxidada', icon: '🔧', floorId: 'attic', col: 5, row: 3, unique: true,
    desc: 'Encaja en la trampilla del túnel secreto del sótano.' },
  { id: 'rusty_key', name: 'Llave oxidada', icon: '🗝️', floorId: 'ground', col: 3, row: 3, unique: true,
    desc: 'Una llave vieja. Abrirá alguna puerta cerrada de la mansión.' },
  { id: 'battery_flash', name: 'Pilas', icon: '🔦', floorId: 'basement', col: 7, row: 7, stack: true,
    desc: 'Recarga la linterna.' },
  { id: 'battery_flash', name: 'Pilas', icon: '🔦', floorId: 'ground', col: 8, row: 2, stack: true,
    desc: 'Recarga la linterna.' },
  { id: 'battery_flash', name: 'Pilas', icon: '🔦', floorId: 'first', col: 1, row: 3, stack: true,
    desc: 'Recarga la linterna.' },
  { id: 'battery_flash', name: 'Pilas', icon: '🔦', floorId: 'attic', col: 4, row: 2, stack: true,
    desc: 'Recarga la linterna.' },
];

export const PUZZLES = {
  breaker: { floorId: 'basement', col: 1, row: 0, name: 'Cuadro eléctrico' },
  safe: { floorId: 'ground', col: 4, row: 4, name: 'Caja fuerte', code: '731' },
  car: { floorId: 'ground', col: 9, row: 5, name: 'Coche' },
  tunnelExit: { floorId: 'basement', col: 5, row: 7, name: 'Túnel secreto' },
};

export const HIDING_SPOTS = [
  { floorId: 'ground', col: 3, row: 3, name: 'Armario', ox: 0.8, oz: 0 },
  { floorId: 'first', col: 2, row: 4, name: 'Armario grande', ox: -0.8, oz: 0 },
  { floorId: 'first', col: 0, row: 1, name: 'Debajo de la cama', ox: 0, oz: 0.9 },
  { floorId: 'first', col: 0, row: 6, name: 'Debajo de la cama', ox: 0, oz: 0.9 },
  { floorId: 'basement', col: 0, row: 3, name: 'Detrás de las cajas', ox: 0.5, oz: 0.5 },
  { floorId: 'attic', col: 3, row: 1, name: 'Detrás de las cajas', ox: -0.5, oz: 0.5 },
];

export const MONSTER_SPAWN_POINTS = [
  { floorId: 'first', col: 1, row: 0 },
  { floorId: 'basement', col: 8, row: 0 },
  { floorId: 'attic', col: 4, row: 2 },
  { floorId: 'first', col: 8, row: 0 },
  { floorId: 'ground', col: 8, row: 0 },
  { floorId: 'basement', col: 1, row: 6 },
];

export const CAGE_LOCATION = { floorId: 'basement', col: 0, row: 5 };
