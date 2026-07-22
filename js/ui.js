import { MONSTER_TYPES } from './entities/monster.js';
import { audio } from './audio.js';
import { clamp } from './utils.js';

const $ = (id) => document.getElementById(id);
const SCREEN_IDS = [
  'screen-loading', 'screen-menu', 'screen-select', 'screen-options', 'screen-howto', 'screen-credits',
  'hud', 'screen-inventory', 'screen-pause', 'screen-end', 'screen-tap-start',
];

let selectedMonster = 'abuela';
let toastTimer = null;

export function loadOptions() {
  const raw = localStorage.getItem('mansion_options');
  const defaults = { master: 80, music: 60, sensitivity: 50, invertY: false, forceTouch: false };
  if (!raw) return defaults;
  try { return { ...defaults, ...JSON.parse(raw) }; } catch { return defaults; }
}

export function saveOptions(opts) {
  localStorage.setItem('mansion_options', JSON.stringify(opts));
}

export function showScreen(id) {
  for (const s of SCREEN_IDS) {
    const el = $(s);
    if (!el) continue;
    el.classList.toggle('active', s === id);
  }
}

export function showToast(msg, duration = 2200) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), duration);
}

function colorToCss(hex) {
  return `#${hex.toString(16).padStart(6, '0')}`;
}

export function buildMonsterGrid(onChange) {
  const grid = $('monster-grid');
  grid.innerHTML = '';
  const options = [...MONSTER_TYPES.map((t) => ({ id: t.id, name: t.name, color: t.color, desc: t.desc })),
    { id: 'todos', name: 'Todos', color: 0x555555, desc: 'Los seis a la vez. Modo extremo.' }];
  for (const opt of options) {
    const card = document.createElement('div');
    card.className = 'monster-card' + (opt.id === selectedMonster ? ' selected' : '');
    card.dataset.id = opt.id;
    card.innerHTML = `<div class="m-swatch" style="background:${colorToCss(opt.color)}"></div>
      <div class="m-name">${opt.name}</div><div class="m-desc">${opt.desc}</div>`;
    card.addEventListener('click', () => {
      selectedMonster = opt.id;
      for (const c of grid.children) c.classList.toggle('selected', c.dataset.id === opt.id);
      audio.uiClick();
      onChange?.(opt.id);
    });
    grid.appendChild(card);
  }
}

export function getSelectedMonster() { return selectedMonster; }

export function selectedMonsterIds() {
  if (selectedMonster === 'todos') return MONSTER_TYPES.map((t) => t.id);
  return [selectedMonster];
}

export function updateHud(state) {
  $('bar-noise').style.width = `${clamp(state.noise, 0, 1) * 100}%`;
  $('bar-stamina').style.width = `${clamp(state.stamina, 0, 100)}%`;
  const capEl = $('captures-indicator');
  capEl.textContent = '⚠ '.repeat(state.captureCount) + '· '.repeat(Math.max(0, state.maxCaptures - state.captureCount));
  capEl.title = `Capturas: ${state.captureCount}/${state.maxCaptures}`;
  $('objective-box').textContent = state.objective || '';

  const prompt = $('interact-prompt');
  if (state.promptText) { prompt.textContent = `[E] ${state.promptText}`; prompt.classList.add('visible'); }
  else prompt.classList.remove('visible');

  const bar = $('quickbar');
  bar.innerHTML = '';
  state.quickItems.forEach((item, i) => {
    const slot = document.createElement('div');
    slot.className = 'q-slot';
    const count = item.charges !== undefined ? item.charges : item.count;
    slot.innerHTML = `<span class="q-key">${i + 1}</span>${item.icon}<span class="inv-count">${count > 1 ? count : ''}</span>`;
    bar.appendChild(slot);
  });
}

export function renderInventory(inventory) {
  const grid = $('inventory-grid');
  const desc = $('inventory-desc');
  grid.innerHTML = '';
  desc.textContent = '';
  const items = inventory.list();
  if (items.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-dim);font-size:0.8rem;">Inventario vacío.</p>';
    return;
  }
  for (const item of items) {
    const slot = document.createElement('div');
    slot.className = 'inv-slot';
    const count = item.charges !== undefined ? item.charges : item.count;
    slot.innerHTML = `${item.icon}${count > 1 ? `<span class="inv-count">x${count}</span>` : ''}`;
    slot.addEventListener('click', () => { desc.textContent = `${item.name}: ${item.desc}`; });
    grid.appendChild(slot);
  }
}

export function showEnd(content, stats) {
  const title = $('end-title');
  title.textContent = content.title;
  title.className = `end-title ${content.className}`;
  $('end-subtitle').textContent = content.subtitle;
  const mins = Math.floor(stats.time / 60), secs = Math.floor(stats.time % 60);
  $('end-stats').innerHTML = `
    <div>Tiempo: ${mins}m ${secs}s</div>
    <div>Capturas sufridas: ${stats.captures}</div>
    <div>Dificultad: ${stats.difficulty}</div>
    <div>Antagonista: ${stats.monsters}</div>
  `;
  showScreen('screen-end');
}

export function applyAudioOptions(opts) {
  audio.setMasterVolume(opts.master / 100);
  audio.setMusicVolume(opts.music / 100);
}

export function bindOptionInputs(opts, onChange) {
  $('opt-volume-master').value = opts.master;
  $('opt-volume-music').value = opts.music;
  $('opt-sensitivity').value = opts.sensitivity;
  $('opt-invert-y').checked = opts.invertY;
  $('opt-touch-force').checked = opts.forceTouch;

  $('opt-volume-master').addEventListener('input', (e) => onChange({ ...opts, master: +e.target.value }));
  $('opt-volume-music').addEventListener('input', (e) => onChange({ ...opts, music: +e.target.value }));
  $('opt-sensitivity').addEventListener('input', (e) => onChange({ ...opts, sensitivity: +e.target.value }));
  $('opt-invert-y').addEventListener('change', (e) => onChange({ ...opts, invertY: e.target.checked }));
  $('opt-touch-force').addEventListener('change', (e) => onChange({ ...opts, forceTouch: e.target.checked }));
}
