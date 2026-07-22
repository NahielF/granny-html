// Entrada unificada: teclado + ratón (PC) y joystick/gestos táctiles (móvil/tablet).
import { clamp, isTouchDevice } from './utils.js';

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.moveX = 0; // -1..1
    this.moveZ = 0; // -1..1
    this.lookDX = 0;
    this.lookDY = 0;
    this.sensitivity = 0.5;
    this.invertY = false;
    this.pointerLocked = false;
    this.touch = isTouchDevice();
    this.forceTouch = false;
    this.actions = { interact: false, run: false, crouch: false, flashlight: false, inventory: false, pause: false };
    this._actionPressed = { interact: false, flashlight: false, inventory: false, pause: false };
    this.quickSlot = -1;

    this._bindKeyboard();
    this._bindMouse();
    this._bindTouch();
  }

  get useTouchControls() { return this.touch || this.forceTouch; }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if (e.code === 'KeyE') this._actionPressed.interact = true;
      if (e.code === 'KeyF') this._actionPressed.flashlight = true;
      if (e.code === 'Tab' || e.code === 'KeyI') { this._actionPressed.inventory = true; e.preventDefault(); }
      if (e.code === 'Escape') this._actionPressed.pause = true;
      const num = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].indexOf(e.code);
      if (num >= 0) this.quickSlot = num;
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
  }

  _isDown(...codes) { return codes.some((c) => this.keys.has(c)); }

  _bindMouse() {
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });
    this.canvas.addEventListener('click', () => {
      if (!this.useTouchControls) this.canvas.requestPointerLock?.();
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      this.lookDX += e.movementX || 0;
      this.lookDY += e.movementY || 0;
    });
  }

  requestPointerLock() {
    if (!this.useTouchControls) this.canvas.requestPointerLock?.();
  }
  exitPointerLock() {
    if (document.pointerLockElement) document.exitPointerLock?.();
  }

  _bindTouch() {
    const joyZone = document.getElementById('joystick-zone');
    const joyBase = document.getElementById('joystick-base');
    const joyStick = document.getElementById('joystick-stick');
    const lookZone = document.getElementById('look-zone');

    let joyTouchId = null;
    let joyOrigin = { x: 0, y: 0 };
    const maxRadius = 45;

    joyZone.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      joyTouchId = t.identifier;
      const rect = joyZone.getBoundingClientRect();
      joyOrigin = { x: t.clientX, y: t.clientY };
      joyBase.style.left = `${t.clientX - rect.left - 55}px`;
      joyBase.style.top = `${t.clientY - rect.top - 55}px`;
      joyBase.style.bottom = 'auto';
      e.preventDefault();
    }, { passive: false });

    const moveHandler = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joyTouchId) {
          let dx = t.clientX - joyOrigin.x;
          let dy = t.clientY - joyOrigin.y;
          const d = Math.hypot(dx, dy);
          if (d > maxRadius) { dx = (dx / d) * maxRadius; dy = (dy / d) * maxRadius; }
          joyStick.style.left = `${30 + dx}px`;
          joyStick.style.top = `${30 + dy}px`;
          this.moveX = clamp(dx / maxRadius, -1, 1);
          this.moveZ = clamp(dy / maxRadius, -1, 1);
        }
      }
    };
    joyZone.addEventListener('touchmove', (e) => { moveHandler(e); e.preventDefault(); }, { passive: false });
    const endJoy = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joyTouchId) {
          joyTouchId = null;
          this.moveX = 0; this.moveZ = 0;
          joyStick.style.left = '30px'; joyStick.style.top = '30px';
        }
      }
    };
    joyZone.addEventListener('touchend', endJoy);
    joyZone.addEventListener('touchcancel', endJoy);

    let lookTouchId = null;
    let lastLook = { x: 0, y: 0 };
    lookZone.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      lookTouchId = t.identifier;
      lastLook = { x: t.clientX, y: t.clientY };
      e.preventDefault();
    }, { passive: false });
    lookZone.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === lookTouchId) {
          this.lookDX += (t.clientX - lastLook.x) * 2.2;
          this.lookDY += (t.clientY - lastLook.y) * 2.2;
          lastLook = { x: t.clientX, y: t.clientY };
        }
      }
      e.preventDefault();
    }, { passive: false });
    const endLook = (e) => {
      for (const t of e.changedTouches) if (t.identifier === lookTouchId) lookTouchId = null;
    };
    lookZone.addEventListener('touchend', endLook);
    lookZone.addEventListener('touchcancel', endLook);

    const bindHold = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      const on = (e) => { this.actions[key] = true; e.preventDefault(); };
      const off = (e) => { this.actions[key] = false; e.preventDefault(); };
      el.addEventListener('touchstart', on, { passive: false });
      el.addEventListener('touchend', off, { passive: false });
      el.addEventListener('touchcancel', off, { passive: false });
    };
    bindHold('btn-touch-run', 'run');
    bindHold('btn-touch-crouch', 'crouch');

    const bindTap = (id, cb) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); cb(); }, { passive: false });
    };
    bindTap('btn-touch-flash', () => { this._actionPressed.flashlight = true; });
    bindTap('btn-touch-inventory', () => { this._actionPressed.inventory = true; });
    bindTap('btn-touch-interact', () => { this._actionPressed.interact = true; });
  }

  // Devuelve el movimiento deseado (-1..1 en x/z) combinando teclado + joystick
  getMove() {
    let x = this.moveX, z = this.moveZ;
    if (this._isDown('KeyA', 'ArrowLeft')) x -= 1;
    if (this._isDown('KeyD', 'ArrowRight')) x += 1;
    if (this._isDown('KeyW', 'ArrowUp')) z -= 1;
    if (this._isDown('KeyS', 'ArrowDown')) z += 1;
    return { x: clamp(x, -1, 1), z: clamp(z, -1, 1) };
  }

  isRunning() { return this.actions.run || this._isDown('ShiftLeft', 'ShiftRight'); }
  isCrouching() { return this.actions.crouch || this._isDown('ControlLeft', 'ControlRight', 'KeyC'); }

  // Consume la mirada acumulada desde la última llamada (para aplicar a la cámara)
  consumeLook() {
    const dx = this.lookDX * this.sensitivity * 0.0025;
    let dy = this.lookDY * this.sensitivity * 0.0025;
    if (this.invertY) dy = -dy;
    this.lookDX = 0; this.lookDY = 0;
    return { dx, dy };
  }

  consumePressed(name) {
    if (this._actionPressed[name]) { this._actionPressed[name] = false; return true; }
    return false;
  }

  consumeQuickSlot() {
    const s = this.quickSlot;
    this.quickSlot = -1;
    return s;
  }
}
