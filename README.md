# Mansión Siniestra 3D

Un juego de terror y sigilo en primera persona, **100% HTML + CSS + JavaScript** (Three.js), pensado para
jugarse directamente desde **GitHub Pages**, sin ningún paso de compilación. Funciona en **PC, móvil y
tablet**.

> Proyecto de fan, original e independiente. **No usa la marca, los personajes, ni ningún asset** (modelos,
> texturas, sonidos) de ningún juego comercial. Toda la geometría 3D es generada por código (formas
> low-poly), las texturas se pintan en un `<canvas>` en tiempo real y todos los sonidos se sintetizan con la
> Web Audio API. Es un homenaje al género de terror "escapa de la casa", con nombre, historia y diseño
> propios.

## Cómo jugar

Te despiertas encerrado en una mansión enorme (sótano, planta baja, primer piso y ático) junto a un
antiguo miembro de la familia que no quiere dejarte marchar. Para escapar tienes que:

1. Encontrar la **batería** y la **gasolina** del coche del garaje.
2. Encontrar **2 fusibles** y restaurar la corriente en el cuadro eléctrico del sótano.
3. Encontrar la **nota** con el código y abrir la **caja fuerte** de la biblioteca para conseguir la
   **llave del coche**.
4. Volver al garaje, montar todo en el coche y **escapar**.

También existe un **final secreto**: hay una manivela oculta en el ático que abre una trampilla en el
sótano hacia un túnel de escape alternativo.

Por el camino puedes usar **palancas, trampas para oso, un táser, un cóctel molotov y carne cruda** como
señuelo para despistar, atrapar o ahuyentar a quien te persigue, además de esconderte en armarios y bajo
las camas y vigilar tu nivel de ruido (sigilo) y el aguante al correr.

Antes de empezar puedes elegir **quién ronda la mansión**: la Abuela, el Abuelo, la Bisabuela, el
Bisabuelo, la Hija, el Nieto, o el modo **Todos** (los seis a la vez, extremo). Cada uno tiene su propio
oído, velocidad y una habilidad especial distinta.

### Controles

**PC**
- `WASD` / flechas — moverte
- Ratón — mirar
- `Mayús` — correr (hace ruido)
- `Ctrl` / `C` — agacharte (sigilo)
- `E` — interactuar / coger
- `F` — linterna
- `Tab` / `I` — inventario
- `1`-`6` — usar objeto rápido (trampas, táser, molotov, carne)
- `Esc` — pausa

**Móvil / Tablet**
- Joystick virtual (izquierda) — moverte
- Arrastrar con el dedo (derecha) — mirar
- Botones — linterna, agacharte, correr, inventario, e interactuar (`A`)
- Se recomienda **jugar en horizontal**; el juego te avisa si giras el dispositivo a vertical.

## Ejecutarlo

### GitHub Pages (recomendado)

1. En el repositorio, ve a **Settings → Pages**.
2. En "Build and deployment", elige **Deploy from a branch**.
3. Selecciona la rama (`main` o la que corresponda) y la carpeta `/ (root)`.
4. Guarda: en un minuto tendrás la URL pública para jugar desde cualquier navegador.

No hace falta build ni backend: es HTML/CSS/JS estático, y Three.js está incluido localmente en
`js/vendor/three/` (no depende de ningún CDN externo).

### En local

Al usar módulos ES (`type="module"`), necesitas servirlo por HTTP (no abrir `index.html` con `file://`).
Por ejemplo:

```bash
npx http-server -p 8080
# o
python3 -m http.server 8080
```

Y abre `http://localhost:8080`.

## Estructura del proyecto

```
index.html              Pantallas (menú, HUD, inventario, etc.) y el <canvas>
css/style.css           Estilos responsivos (PC / móvil / tablet)
js/main.js              Arranque, flujo de pantallas y bucle principal
js/game.js              Orquestador: escena, luces, jugador, monstruos, objetos
js/ui.js                HUD, menús, inventario, pantallas de fin
js/input.js             Teclado + ratón (PC) y joystick + gestos táctiles
js/audio.js             Motor de audio sintetizado (Web Audio API)
js/endings.js           Contenido de los finales
js/utils.js             Utilidades (colisión, matemáticas, EventBus)
js/entities/player.js   Controlador del jugador (movimiento, sigilo, linterna)
js/entities/monster.js  IA de los 6 antagonistas (máquina de estados) + mallas low-poly
js/entities/items.js    Inventario, objetos, puzzles, trampas y armas
js/world/mapData.js     Planos de las 4 plantas de la mansión (rejilla)
js/world/houseBuilder.js Generador de geometría/colisión/navegación a partir del plano
js/world/spawnData.js   Dónde aparecen objetos, puzzles, escondites y monstruos
js/world/textures.js    Texturas procedurales (canvas), sin imágenes externas
js/vendor/three/        Three.js vendorizado (sin CDN)
```

## Notas técnicas

- Sin dependencias de red en tiempo de ejecución: Three.js está vendorizado en el propio repositorio.
- Geometría de la mansión fusionada por planta/material para mantener pocas llamadas de dibujo incluso
  siendo una casa enorme (rinde bien también en móviles).
- La IA usa un grafo de navegación derivado del propio plano de la casa (BFS) para moverse entre
  habitaciones y plantas (escaleras incluidas).
- Ajustes (volumen, sensibilidad, invertir eje Y, forzar controles táctiles) se guardan en
  `localStorage`.
