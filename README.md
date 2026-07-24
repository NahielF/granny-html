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
las camas y vigilar tu nivel de ruido (sigilo) y el aguante al correr. La linterna no gasta batería.

La mansión está amueblada habitación por habitación (camas, armarios, sofás, estanterías, cocina, coche
en el garaje, jaula en el sótano...) y **los muebles bloquean el paso**, así que sirven de cobertura y de
obstáculo tanto para ti como para quien te persigue.

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

En cualquier plataforma, el botón `⛶` de la esquina superior derecha activa la **pantalla completa**.

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
js/world/textures.js    Texturas procedurales (canvas) cacheadas, sin imágenes externas
js/world/materials.js   Materiales compartidos construidos sobre esas texturas
js/world/props.js       Generadores de muebles low-poly (cama, armario, coche, ...)
js/world/furnitureData.js Qué mueble va en cada habitación y con qué orientación
js/world/furniture.js   Coloca los muebles, fusiona su geometría y genera su colisión
js/vendor/three/        Three.js vendorizado (sin CDN)
```

## Notas técnicas

- Sin dependencias de red en tiempo de ejecución: Three.js está vendorizado en el propio repositorio.
- Todas las texturas se dibujan por código en un `<canvas>` (madera, papel pintado, tela, cerámica,
  ladrillo, metal, óxido, lomos de libros, cuadros, cielo nocturno...) y se cachean por clave.
- Geometría de la mansión y de los muebles fusionada por material para mantener pocas llamadas de dibujo
  incluso siendo una casa enorme y amueblada (~230 draw calls con los 6 monstruos a la vez).
- Las ventanas usan material no iluminado, así que de noche se ven como rectángulos que dan al exterior
  (terreno, árboles y cielo estrellado reales, no un vacío negro).
- La IA usa un grafo de navegación derivado del propio plano de la casa (BFS) para moverse entre
  habitaciones y plantas (escaleras incluidas).
- Ajustes (volumen, sensibilidad, invertir eje Y, forzar controles táctiles) se guardan en
  `localStorage`.
