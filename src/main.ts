import './style.css';
import {
  evaluateGuess,
  normalizeWord,
  keyboardStates,
  getHardModeError,
  getDailyWord,
  dateKey,
  msUntilNextWord,
  puzzleNumber,
  type LetterState,
} from './engine';
import { isAcceptedWord, ANSWERS } from './data/words';
import {
  loadState,
  saveState,
  hasSavedState,
  loadStats,
  saveStats,
  registerGameResult,
  loadSettings,
  saveSettings,
  clearSaved,
  type GameState,
  type Stats,
  type Settings,
  type GameStatus,
} from './storage';
import * as ui from './ui';

// ── Reinicio para pruebas (SOLO en `npm run dev`, no existe en producción) ───
//   http://localhost:5173/?reset      → borra la partida de hoy
//   http://localhost:5173/?reset=all  → borra partida + estadísticas
//   http://localhost:5173/?practica   → palabra ALEATORIA; no guarda partida ni stats
//                                       (recarga la página para otra palabra)
const practice = import.meta.env.DEV && new URLSearchParams(window.location.search).has('practica');
if (import.meta.env.DEV) {
  const reset = new URLSearchParams(window.location.search).get('reset');
  if (reset !== null) {
    clearSaved(reset === 'all');
    window.history.replaceState(null, '', window.location.pathname); // quitar ?reset de la URL
  }
}

// ── Estado de la partida ─────────────────────────────────────────────────────

const answer = practice ? ANSWERS[Math.floor(Math.random() * ANSWERS.length)] : getDailyWord();
const todayKey = dateKey();

let settings: Settings = loadSettings();
let state: GameState = practice
  ? { dateKey: todayKey, guesses: [], status: 'playing' }
  : loadState(todayKey);
let stats: Stats = loadStats();

let guesses: string[] = [...state.guesses];
let status: GameStatus = state.status;
let current = '';
let revealing = false;
let countdownTimer: number | undefined;

// ── Inicialización ───────────────────────────────────────────────────────────

applyTheme();
ui.buildBoard();
ui.buildKeyboard(onVirtualKey);
ui.setupModals(onModalClose);

const firstVisit = !hasSavedState();
restoreGame();

if (practice) {
  window.setTimeout(() => ui.toast('Modo práctica: palabra aleatoria, no cuenta en stats', 2500), 300);
} else if (firstVisit) {
  ui.openModal('modal-help');
} else if (status !== 'playing') {
  // Ya jugó hoy: al abrir mostramos sus estadísticas, como el original
  window.setTimeout(() => openStatsModal(status as 'won' | 'lost'), 400);
}

setupHeaderButtons();
setupSettingsToggles();
setupPhysicalKeyboard();

// Si la pestaña se queda abierta y cambia el día, recargar al volver a ella
// (si no, se seguiría jugando la palabra de ayer y se guardaría con la fecha vieja).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && dateKey() !== todayKey) {
    window.location.reload();
  }
});

// ── Render inicial de una partida a medias / terminada ───────────────────────

function restoreGame(): void {
  for (let r = 0; r < guesses.length; r++) {
    ui.fillRowStatic(r, guesses[r], evaluateGuess(guesses[r], answer));
  }
  updateKeyboardColors();
}

function updateKeyboardColors(): void {
  const best = keyboardStates(guesses, answer);
  best.forEach((st, letter) => ui.setKeyState(letter, st));
}

// ── Entrada ──────────────────────────────────────────────────────────────────

function onVirtualKey(key: string): void {
  if (key === 'ENVIAR') submitGuess();
  else if (key === 'DEL') deleteLetter();
  else addLetter(key);
}

function addLetter(letter: string): void {
  if (status !== 'playing' || revealing) return;
  if (current.length >= ui.WORD_LEN) return;
  const normalized = normalizeWord(letter);
  if (!/^[A-ZÑ]$/.test(normalized)) return;
  current += normalized;
  ui.setTile(guesses.length, current.length - 1, normalized);
}

function deleteLetter(): void {
  if (status !== 'playing' || revealing) return;
  if (current.length === 0) return;
  ui.clearTile(guesses.length, current.length - 1);
  current = current.slice(0, -1);
}

function submitGuess(): void {
  if (status !== 'playing' || revealing) return;

  const guess = normalizeWord(current);
  const row = guesses.length;

  if (guess.length < ui.WORD_LEN) {
    ui.shakeRow(row);
    ui.toast('Faltan letras');
    return;
  }
  if (!isAcceptedWord(guess)) {
    ui.shakeRow(row);
    ui.toast('Palabra no válida');
    return;
  }
  if (settings.hardMode) {
    const error = getHardModeError(guess, guesses, answer);
    if (error) {
      ui.shakeRow(row);
      ui.toast(error);
      return;
    }
  }

  guesses.push(guess);
  current = '';
  status = 'playing';
  persist();

  revealing = true;
  ui.revealRow(row, evaluateGuess(guess, answer)).then(() => {
    revealing = false;
    updateKeyboardColors();

    if (guess === answer) {
      status = 'won';
      persist();
      ui.bounceRow(row);
      window.setTimeout(() => endGame(true), 1500);
    } else if (guesses.length >= ui.MAX_GUESSES) {
      status = 'lost';
      persist();
      window.setTimeout(() => endGame(false), 900);
    }
  });
}

/** Guarda el progreso del día (nunca en modo práctica). */
function persist(): void {
  if (!practice) saveState({ dateKey: todayKey, guesses: [...guesses], status });
}

// ── Fin de partida y estadísticas ────────────────────────────────────────────

function endGame(won: boolean): void {
  if (!practice) {
    stats = registerGameResult(stats, won, guesses.length);
    saveStats(stats);
  }
  openStatsModal(won ? 'won' : 'lost');
}

function openStatsModal(result: 'won' | 'lost' | null): void {
  stopCountdown();
  ui.renderStatsBody({
    stats,
    result,
    answer,
    showShare: true,
    guessCount: guesses.length,
  });
  ui.openModal('modal-stats');
  startCountdown();

  document.getElementById('btn-share')?.addEventListener('click', shareResult);
}

function startCountdown(): void {
  const tick = () => {
    if (dateKey() !== todayKey) {
      window.location.reload(); // ha pasado la medianoche: cargar la palabra nueva
      return;
    }
    ui.setCountdownClock(ui.formatCountdown(msUntilNextWord()));
  };
  tick();
  countdownTimer = window.setInterval(tick, 1000);
}

function stopCountdown(): void {
  if (countdownTimer !== undefined) {
    window.clearInterval(countdownTimer);
    countdownTimer = undefined;
  }
}

function onModalClose(): void {
  stopCountdown();
}

// ── Compartir resultado ──────────────────────────────────────────────────────

function buildShareText(): string {
  const emoji = settings.highContrast
    ? { correct: '🔵', present: '🟡', absent: '⚫' }
    : { correct: '🟢', present: '🟠', absent: '⚫' };
  const rows = guesses
    .map((g) => evaluateGuess(g, answer).map((s: LetterState) => emoji[s]).join(''))
    .join('\n');
  const score = status === 'won' ? String(guesses.length) : 'X';
  return `Pálpito #${puzzleNumber()} ${score}/6\n\n${rows}`;
}

async function shareResult(): Promise<void> {
  const text = buildShareText();
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return;
    }
    await navigator.clipboard.writeText(text);
    ui.toast('Copiado al portapapeles');
  } catch {
    ui.toast('No se pudo compartir');
  }
}

// ── Cabecera, ajustes y tema ─────────────────────────────────────────────────

function setupHeaderButtons(): void {
  document.getElementById('btn-help')?.addEventListener('click', () => ui.openModal('modal-help'));
  document.getElementById('btn-stats')?.addEventListener('click', () => openStatsModal(status !== 'playing' ? status : null));
  document.getElementById('btn-settings')?.addEventListener('click', () => ui.openModal('modal-settings'));
}

function applyTheme(): void {
  const root = document.documentElement;
  root.classList.toggle('dark', settings.dark);
  root.classList.toggle('contrast', settings.highContrast);
}

function setupSettingsToggles(): void {
  bindSwitch('toggle-hard', () => settings.hardMode, (v) => {
    // Como el original: solo puede activarse/desactivarse antes del primer intento del día
    if (guesses.length > 0 && status === 'playing') {
      ui.toast('El modo solo puede cambiarse al inicio de la partida');
      return false; // revertir
    }
    settings.hardMode = v;
    return true;
  });
  bindSwitch('toggle-dark', () => settings.dark, (v) => {
    settings.dark = v;
    applyTheme();
    return true;
  });
  bindSwitch('toggle-contrast', () => settings.highContrast, (v) => {
    settings.highContrast = v;
    applyTheme();
    return true;
  });
  syncSwitches();
}

/** Sincroniza el estado visual de los switches con los ajustes cargados. */
function syncSwitches(): void {
  setSwitch('toggle-hard', settings.hardMode);
  setSwitch('toggle-dark', settings.dark);
  setSwitch('toggle-contrast', settings.highContrast);
}

function setSwitch(id: string, on: boolean): void {
  const el = document.getElementById(id);
  if (el) el.setAttribute('aria-checked', String(on));
}

/**
 * Conecta un botón-switch a un ajuste. El callback recibe el nuevo valor y
 * devuelve false si debe revertirse (por reglas del juego).
 */
function bindSwitch(id: string, get: () => boolean, set: (v: boolean) => boolean): void {
  document.getElementById(id)?.addEventListener('click', () => {
    const next = !get();
    if (set(next)) {
      setSwitch(id, next);
      saveSettings(settings);
    } else {
      setSwitch(id, get()); // revertir visualmente
    }
  });
}

// ── Teclado físico ───────────────────────────────────────────────────────────

function setupPhysicalKeyboard(): void {
  window.addEventListener('keydown', (e) => {
    if (ui.isAnyModalOpen()) {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        ui.closeAllModals();
        onModalClose();
      }
      return;
    }
    // No interceptar atajos del navegador (Ctrl+R, Cmd+C…)
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      submitGuess();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      deleteLetter();
    } else if (e.key.length === 1 && /^[a-zñáéíóúüA-ZÑÁÉÍÓÚÜ]$/.test(e.key)) {
      // Las vocales con tilde (teclado español) se normalizan a vocal simple
      addLetter(e.key);
    }
  });
}
