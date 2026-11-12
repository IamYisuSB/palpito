import type { LetterState } from './engine';

// ─────────────────────────────────────────────────────────────────────────────
// CAPA DE INTERFAZ (DOM): tablero, teclado, toasts y modales
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_GUESSES = 6;
export const WORD_LEN = 5;

const KEY_LAYOUT: string[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENVIAR', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

interface BoardRow {
  el: HTMLElement;
  cells: HTMLElement[];
}

let rows: BoardRow[] = [];
const keyEls = new Map<string, HTMLButtonElement>();

// ── Tablero ──────────────────────────────────────────────────────────────────

export function buildBoard(): void {
  const board = document.getElementById('board');
  if (!board) return;
  rows = [];
  for (let r = 0; r < MAX_GUESSES; r++) {
    const el = document.createElement('div');
    el.className = 'board-row';
    const cells: HTMLElement[] = [];
    for (let c = 0; c < WORD_LEN; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      el.appendChild(tile);
      cells.push(tile);
    }
    board.appendChild(el);
    rows.push({ el, cells });
  }
}

/** Pinta una letra en la celda (con animación pop). */
export function setTile(row: number, col: number, letter: string): void {
  const tile = rows[row]?.cells[col];
  if (!tile) return;
  tile.textContent = letter;
  tile.classList.add('filled');
}

/** Borra la letra de la celda actual. */
export function clearTile(row: number, col: number): void {
  const tile = rows[row]?.cells[col];
  if (!tile) return;
  tile.textContent = '';
  tile.classList.remove('filled');
}

/** Pinta un intento ya revelado (restaurar partida guardada, sin animación). */
export function fillRowStatic(row: number, guess: string, states: LetterState[]): void {
  for (let c = 0; c < WORD_LEN; c++) {
    const tile = rows[row].cells[c];
    tile.textContent = guess[c];
    tile.classList.add('filled', states[c]);
  }
}

/**
 * Revela una fila con la animación de giro: cada celda gira y a mitad de giro
 * recibe su color. Devuelve una promesa que termina al acabar la fila.
 */
export function revealRow(row: number, states: LetterState[]): Promise<void> {
  const STEP = 280; // ms entre celdas
  const FLIP = 550; // duración del giro
  rows[row].cells.forEach((tile, i) => {
    window.setTimeout(() => {
      tile.classList.add('flip');
      window.setTimeout(() => tile.classList.add(states[i]), FLIP / 2);
    }, i * STEP);
  });
  return new Promise((resolve) => window.setTimeout(resolve, (WORD_LEN - 1) * STEP + FLIP + 60));
}

export function shakeRow(row: number): void {
  const el = rows[row]?.el;
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth; // reinicia la animación
  el.classList.add('shake');
}

export function bounceRow(row: number): void {
  rows[row]?.el.classList.add('bounce');
}

// ── Teclado ──────────────────────────────────────────────────────────────────

/** onKey recibe 'ENVIAR', 'DEL' o una letra. */
export function buildKeyboard(onKey: (key: string) => void): void {
  const kb = document.getElementById('keyboard');
  if (!kb) return;
  for (const layoutRow of KEY_LAYOUT) {
    const rowEl = document.createElement('div');
    rowEl.className = 'keyboard-row';
    for (const key of layoutRow) {
      const btn = document.createElement('button');
      btn.className = 'key' + (key.length > 1 ? ' wide' : '');
      btn.textContent = key === 'DEL' ? '⌫' : key;
      btn.setAttribute('aria-label', key === 'DEL' ? 'Borrar' : key);
      btn.addEventListener('click', () => onKey(key));
      rowEl.appendChild(btn);
      if (key.length === 1) keyEls.set(key, btn);
    }
    kb.appendChild(rowEl);
  }
}

/** Aplica el color a una tecla (la clase de estado pinta el fondo). */
export function setKeyState(letter: string, state: LetterState): void {
  const btn = keyEls.get(letter);
  if (!btn) return;
  btn.classList.remove('correct', 'present', 'absent');
  btn.classList.add(state);
}

// ── Toast ────────────────────────────────────────────────────────────────────

export function toast(message: string, duration = 1600): void {
  const container = document.getElementById('toast');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast-msg';
  el.textContent = message;
  container.appendChild(el);
  window.setTimeout(() => {
    el.classList.add('leaving');
    window.setTimeout(() => el.remove(), 200);
  }, duration);
}

// ── Modales ──────────────────────────────────────────────────────────────────

export function openModal(id: string): void {
  document.getElementById(id)?.classList.remove('hidden');
}

export function closeModal(id: string): void {
  document.getElementById(id)?.classList.add('hidden');
}

export function closeAllModals(): void {
  document.querySelectorAll('.overlay:not(.hidden) > .modal').forEach((m) => {
    m.parentElement?.classList.add('hidden');
  });
}

export function isAnyModalOpen(): boolean {
  return document.querySelector('.overlay:not(.hidden)') !== null;
}

/** Conecta cierre por botón ✕ o clic en el fondo. onClose se llama en cada cierre. */
export function setupModals(onClose: () => void): void {
  document.querySelectorAll('.overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
        onClose();
      }
    });
  });
  document.querySelectorAll('.overlay .close').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.closest('.overlay')?.classList.add('hidden');
      onClose();
    });
  });
}

// ── Modal de estadísticas / resultado ────────────────────────────────────────

export interface StatsModalOptions {
  stats: {
    played: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    distribution: number[];
  };
  /** Resultado del día: null = solo estadísticas */
  result: 'won' | 'lost' | null;
  /** Palabra del día (se muestra solo al perder) */
  answer: string;
  showShare: boolean;
  /** Nº de intentos de la partida de hoy (para resaltar su barra) */
  guessCount: number;
}

export function renderStatsBody(opts: StatsModalOptions): void {
  const body = document.getElementById('stats-body');
  const title = document.getElementById('stats-title');
  if (!body || !title) return;

  title.textContent =
    opts.result === 'won' ? '¡LO CONSEGUISTE!' : opts.result === 'lost' ? 'MEJOR SUERTE MAÑANA' : 'ESTADÍSTICAS';

  const winRate = opts.stats.played > 0 ? Math.round((opts.stats.wins / opts.stats.played) * 100) : 0;
  const maxCount = Math.max(1, ...opts.stats.distribution);

  const bars = opts.stats.distribution
    .map((count, i) => {
      const width = Math.max(8, Math.round((count / maxCount) * 100));
      // Resaltar la barra del nº de intentos de HOY (no la primera barra con datos)
      const hl = opts.result === 'won' && opts.guessCount === i + 1 ? ' highlight' : '';
      return `<div class="dist-row"><span>${i + 1}</span><div class="dist-bar${hl}" style="width:${width}%">${count}</div></div>`;
    })
    .join('');

  const wordLine = opts.result === 'lost' ? `<p class="result-word">La palabra era <b>${opts.answer}</b></p>` : '';
  const shareBtn = opts.showShare && opts.result
    ? '<button id="btn-share" class="share-btn">COMPARTIR 📋</button>'
    : '';

  body.innerHTML = `
    ${wordLine}
    <div class="stats-grid">
      <div><div class="stat-num">${opts.stats.played}</div><div class="stat-label">Jugadas</div></div>
      <div><div class="stat-num">${winRate}%</div><div class="stat-label">Aciertos</div></div>
      <div><div class="stat-num">${opts.stats.currentStreak}</div><div class="stat-label">Racha</div></div>
      <div><div class="stat-num">${opts.stats.maxStreak}</div><div class="stat-label">Mejor racha</div></div>
    </div>
    <div class="distribution">${bars}</div>
    <div class="countdown">
      <small>Siguiente palabra en</small>
      <div class="clock" id="countdown-clock">--:--:--</div>
    </div>
    ${shareBtn}
  `;
}

export function setCountdownClock(text: string): void {
  const clock = document.getElementById('countdown-clock');
  if (clock) clock.textContent = text;
}

/** ms → "HH:MM:SS" */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
