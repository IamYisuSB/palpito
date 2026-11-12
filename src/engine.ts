import { ANSWERS } from './data/words';

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR DEL JUEGO (puro, sin DOM — 100% testeable)
// ─────────────────────────────────────────────────────────────────────────────

export type LetterState = 'correct' | 'present' | 'absent';

/** Prioridad de color al actualizar el teclado: correct > present > absent */
const PRIORITY: Record<LetterState, number> = { absent: 1, present: 2, correct: 3 };

/**
 * Normaliza una palabra: mayúsculas SIN acentos (Á→A, Ü→U), manteniendo la Ñ.
 * Las palabras de las listas ya están guardadas normalizadas.
 */
export function normalizeWord(word: string): string {
  return word
    .toUpperCase()
    .replace(/Á/g, 'A')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ú/g, 'U')
    .replace(/Ü/g, 'U');
}

/**
 * Evalúa un intento contra la respuesta con el algoritmo estándar de 2 pasadas,
 * que resuelve correctamente las letras repetidas:
 *
 *  1ª pasada: marca las verdes (posición exacta) y cuenta las letras restantes
 *             de la respuesta (mapa de frecuencias).
 *  2ª pasada: marca amarillas solo mientras queden "unidades" de esa letra
 *             en el mapa; el resto grises.
 *
 * Así, si la respuesta tiene una sola A y el intento dos, solo una se pinta.
 */
export function evaluateGuess(guess: string, answer: string): LetterState[] {
  const g = normalizeWord(guess);
  const a = normalizeWord(answer);
  const result: LetterState[] = new Array(g.length).fill('absent');
  const remaining = new Map<string, number>();

  // 1ª pasada
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      result[i] = 'correct';
    } else {
      remaining.set(a[i], (remaining.get(a[i]) ?? 0) + 1);
    }
  }

  // 2ª pasada
  for (let i = 0; i < g.length; i++) {
    if (result[i] === 'correct') continue;
    const c = g[i];
    const n = remaining.get(c) ?? 0;
    if (n > 0) {
      result[i] = 'present';
      remaining.set(c, n - 1);
    }
  }

  return result;
}

/**
 * Devuelve el mejor estado conocido para cada letra del teclado,
 * respetando la prioridad correct > present > absent.
 */
export function keyboardStates(guesses: string[], answer: string): Map<string, LetterState> {
  const best = new Map<string, LetterState>();
  for (const guess of guesses) {
    const states = evaluateGuess(guess, answer);
    for (let i = 0; i < guess.length; i++) {
      const letter = normalizeWord(guess[i]);
      const prev = best.get(letter);
      if (!prev || PRIORITY[states[i]] > PRIORITY[prev]) {
        best.set(letter, states[i]);
      }
    }
  }
  return best;
}

/**
 * Modo difícil: los intentos posteriores deben respetar las pistas obtenidas.
 * Devuelve un mensaje de error, o null si el intento es válido.
 */
export function getHardModeError(guess: string, previousGuesses: string[], answer: string): string | null {
  const g = normalizeWord(guess);

  for (const prev of previousGuesses) {
    const states = evaluateGuess(prev, answer);

    // 1) Las letras verdes deben conservar su posición
    for (let i = 0; i < states.length; i++) {
      if (states[i] === 'correct' && g[i] !== prev[i]) {
        return `La ${i + 1}ª letra debe ser ${prev[i]}`;
      }
    }

    // 2) Las letras amarillas deben volver a aparecer
    const yellows = new Set<string>();
    for (let i = 0; i < states.length; i++) {
      if (states[i] === 'present') yellows.add(prev[i]);
    }
    for (const letter of yellows) {
      if (!g.includes(letter)) {
        return `El intento debe contener la letra ${letter}`;
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PALABRA DIARIA — determinista por fecha, SIN backend
// ─────────────────────────────────────────────────────────────────────────────

/** Fecha de inicio del juego (medianoche local del 1 de enero de 2026 = puzzle #1) */
const EPOCH = { year: 2026, month: 0, day: 1 };

/** Clave local de la fecha en formato YYYY-MM-DD (para localStorage) */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Número de días transcurridos desde el EPOCH (medianoche local). Puede ser negativo. */
export function dayNumber(d: Date = new Date()): number {
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const epoch = Date.UTC(EPOCH.year, EPOCH.month, EPOCH.day);
  return Math.round((utc - epoch) / 86_400_000);
}

/** Número de puzzle público: el 2026-01-01 fue el #1 */
export function puzzleNumber(d: Date = new Date()): number {
  return dayNumber(d) + 1;
}

/**
 * La palabra del día: índice determinista sobre la lista barajada.
 * Todos los jugadores del mismo día (misma zona horaria) ven la misma palabra
 * sin necesidad de servidor. Cambia solo a medianoche local.
 */
export function getDailyWord(d: Date = new Date()): string {
  const n = dayNumber(d);
  const i = ((n % ANSWERS.length) + ANSWERS.length) % ANSWERS.length;
  return ANSWERS[i];
}

/** Milisegundos hasta la siguiente palabra (medianoche local) */
export function msUntilNextWord(d: Date = new Date()): number {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return next.getTime() - d.getTime();
}
