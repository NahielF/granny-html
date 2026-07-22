import { InputManager } from './input.js';
import { Game } from './game.js';
import { audio } from './audio.js';
import { isTouchDevice } from './utils.js';
import * as UI from './ui.js';

const canvas = document.getElementById('game-canvas');
const input = new InputManager(canvas);
const game = new Game(canvas, input);
window.__debugGame = game;

let options = UI.loadOptions();
applyOptions(options);

function applyOptions(opts) {
  options = opts;
  input.sensitivity = opts.sensitivity / 50;
  input.invertY = opts.invertY;
  input.forceTouch = opts.forceTouch;
  UI.applyAudioOptions(opts);
  document.getElementById('touch-controls').classList.toggle('enabled', input.useTouchControls);
  UI.saveOptions(opts);
}

let optionsReturnTo = 'screen-menu';
let lastDifficulty = 'normal';

function unlockAudioOnce() {
  audio.unlock();
  UI.applyAudioOptions(options);
  window.removeEventListener('pointerdown', unlockAudioOnce);
  window.removeEventListener('keydown', unlockAudioOnce);
}
window.addEventListener('pointerdown', unlockAudioOnce, { once: true });
window.addEventListener('keydown', unlockAudioOnce, { once: true });

// ---------------- Flujo de pantallas ----------------
document.getElementById('btn-play').addEventListener('click', () => {
  audio.uiClick();
  UI.showScreen('screen-select');
});
document.getElementById('btn-options').addEventListener('click', () => {
  audio.uiClick();
  optionsReturnTo = 'screen-menu';
  UI.showScreen('screen-options');
});
document.getElementById('btn-howto').addEventListener('click', () => { audio.uiClick(); UI.showScreen('screen-howto'); });
document.getElementById('btn-credits').addEventListener('click', () => { audio.uiClick(); UI.showScreen('screen-credits'); });
document.getElementById('btn-howto-back').addEventListener('click', () => { audio.uiClick(); UI.showScreen('screen-menu'); });
document.getElementById('btn-credits-back').addEventListener('click', () => { audio.uiClick(); UI.showScreen('screen-menu'); });
document.getElementById('btn-options-back').addEventListener('click', () => { audio.uiClick(); UI.showScreen(optionsReturnTo); if (optionsReturnTo === 'screen-pause') game.togglePause(true); });

UI.bindOptionInputs(options, (opts) => applyOptions(opts));
UI.buildMonsterGrid();

document.getElementById('btn-select-back').addEventListener('click', () => { audio.uiClick(); UI.showScreen('screen-menu'); });
document.getElementById('btn-select-start').addEventListener('click', () => {
  audio.unlock();
  audio.uiClick();
  const difficulty = document.getElementById('difficulty-select').value;
  lastDifficulty = difficulty;
  startGame(UI.selectedMonsterIds(), difficulty);
});

function startGame(ids, difficulty) {
  game.start(ids, difficulty, {
    onEnd: (content, stats) => { UI.showEnd(content, stats); },
    onToast: (msg) => UI.showToast(msg),
  });
  UI.showScreen('hud');
  if (!input.useTouchControls) input.requestPointerLock();
}

document.getElementById('btn-pause').addEventListener('click', () => openPause());
document.getElementById('btn-resume').addEventListener('click', () => closePause());
document.getElementById('btn-pause-options').addEventListener('click', () => {
  audio.uiClick();
  optionsReturnTo = 'screen-pause';
  UI.showScreen('screen-options');
});
document.getElementById('btn-quit').addEventListener('click', () => {
  audio.uiClick();
  game.quitToMenu();
  input.exitPointerLock();
  UI.showScreen('screen-menu');
});

function openPause() {
  if (!game.running) return;
  audio.uiClick();
  game.togglePause(true);
  input.exitPointerLock();
  UI.showScreen('screen-pause');
}
function closePause() {
  audio.uiClick();
  game.togglePause(false);
  UI.showScreen('hud');
  if (!input.useTouchControls) input.requestPointerLock();
}

document.getElementById('btn-inventory-close').addEventListener('click', () => closeInventory());
let inventoryOpen = false;
function openInventory() {
  if (inventoryOpen) return;
  inventoryOpen = true;
  UI.renderInventory(game.inventory);
  UI.showScreen('screen-inventory');
}
function closeInventory() {
  inventoryOpen = false;
  UI.showScreen('hud');
}

document.getElementById('btn-end-retry').addEventListener('click', () => {
  audio.uiClick();
  startGame(UI.selectedMonsterIds(), lastDifficulty);
});
document.getElementById('btn-end-menu').addEventListener('click', () => {
  audio.uiClick();
  UI.showScreen('screen-menu');
});

// ---------------- Aviso de girar el dispositivo ----------------
function updateRotateNotice() {
  const shouldShow = isTouchDevice() && window.innerHeight > window.innerWidth && window.innerWidth < 900;
  document.getElementById('screen-rotate').classList.toggle('active', shouldShow);
}
window.addEventListener('resize', updateRotateNotice);
window.addEventListener('orientationchange', updateRotateNotice);
updateRotateNotice();

// ---------------- Bucle principal ----------------
let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (document.getElementById('hud').classList.contains('active')) {
    if (input.consumePressed('pause')) { openPause(); }
    if (input.consumePressed('inventory')) { openInventory(); }
    game.update(dt);
    UI.updateHud(game.getHudState());
    if (game.gameOver) {
      // el propio game dispara onEnd tras el retardo del final
    }
  } else if (document.getElementById('screen-inventory').classList.contains('active')) {
    if (input.consumePressed('inventory')) closeInventory();
    game.update(dt);
  } else if (document.getElementById('screen-pause').classList.contains('active')) {
    if (input.consumePressed('pause')) closePause();
  }
  game.render();
  requestAnimationFrame(loop);
}

// ---------------- Arranque: pantalla de carga ----------------
let loadProgress = 0;
function loadingTick() {
  loadProgress = Math.min(100, loadProgress + 6 + Math.random() * 10);
  document.getElementById('loading-fill').style.width = `${loadProgress}%`;
  if (loadProgress >= 100) {
    setTimeout(() => UI.showScreen('screen-menu'), 200);
    return;
  }
  setTimeout(loadingTick, 90);
}
document.getElementById('loading-text').textContent = 'Preparando la mansión...';
loadingTick();
requestAnimationFrame(loop);
