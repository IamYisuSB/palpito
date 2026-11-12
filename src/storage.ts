// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENCIA EN localStorage (progreso, estadísticas y ajustes)
// ─────────────────────────────────────────────────────────────────────────────

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  /** Fecha del progreso guardado (YYYY-MM-DD local). Si no coincide con hoy, se descarta. */
  dateKey: string;
  guesses: string[];
  status: GameStatus;
}

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[i] = nº de partidas ganadas en (i+1) intentos */
  distribution: number[];
}

export interface Settings {
  hardMode: boolean;
  dark: boolean;
  highContrast: boolean;
}

const KEY_STATE = 'wordle-es:state:v1';
const KEY_STATS = 'wordle-es:stats:v1';
const KEY_SETTINGS = 'wordle-es:settings:v1';

export const EMPTY_STATS: Stats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
};

export const DEFAULT_SETTINGS: Settings = {
  hardMode: false,
  dark: false,
  highContrast: false,
};

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage lleno o no disponible: el juego sigue funcionando sin persistencia
  }
}

// ── Progreso del día ──────────────────────────────────────────────────────────

export function loadState(todayKey: string): GameState {
  const state = readJSON<GameState>(KEY_STATE);
  if (state && state.dateKey === todayKey && Array.isArray(state.guesses)) {
    return state;
  }
  return { dateKey: todayKey, guesses: [], status: 'playing' };
}

export function saveState(state: GameState): void {
  writeJSON(KEY_STATE, state);
}

/** ¿Hay algún progreso guardado de días anteriores? (para mostrar la ayuda la 1ª vez) */
export function hasSavedState(): boolean {
  try {
    return localStorage.getItem(KEY_STATE) !== null;
  } catch {
    return false;
  }
}

/** Borra el progreso guardado (y opcionalmente las estadísticas). Uso: pruebas en desarrollo. */
export function clearSaved(includeStats: boolean): void {
  try {
    localStorage.removeItem(KEY_STATE);
    if (includeStats) localStorage.removeItem(KEY_STATS);
  } catch {
    // sin localStorage no hay nada que borrar
  }
}

// ── Estadísticas ──────────────────────────────────────────────────────────────

export function loadStats(): Stats {
  const s = readJSON<Stats>(KEY_STATS);
  if (!s || !Array.isArray(s.distribution) || s.distribution.length !== 6) {
    return { ...EMPTY_STATS, distribution: [...EMPTY_STATS.distribution] };
  }
  return s;
}

export function saveStats(stats: Stats): void {
  writeJSON(KEY_STATS, stats);
}

/** Registra el resultado de una partida terminada y devuelve las stats actualizadas. */
export function registerGameResult(stats: Stats, won: boolean, guessCount: number): Stats {
  const next: Stats = {
    ...stats,
    distribution: [...stats.distribution],
  };
  next.played += 1;
  if (won) {
    next.wins += 1;
    next.currentStreak += 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
    next.distribution[guessCount - 1] += 1;
  } else {
    next.currentStreak = 0;
  }
  return next;
}

// ── Ajustes ───────────────────────────────────────────────────────────────────

export function loadSettings(): Settings {
  const s = readJSON<Partial<Settings>>(KEY_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...s };
}

export function saveSettings(settings: Settings): void {
  writeJSON(KEY_SETTINGS, settings);
}
