import { describe, it, expect } from 'vitest';
import {
  evaluateGuess,
  normalizeWord,
  keyboardStates,
  getHardModeError,
  getDailyWord,
  dateKey,
  dayNumber,
  msUntilNextWord,
  puzzleNumber,
} from '../src/engine';

// ── evaluateGuess ─────────────────────────────────────────────────────────────

describe('evaluateGuess', () => {
  it('marca todo verde cuando el intento es exacto', () => {
    expect(evaluateGuess('PLAYA', 'PLAYA')).toEqual([
      'correct', 'correct', 'correct', 'correct', 'correct',
    ]);
  });

  it('marca todo gris cuando no coincide ninguna letra', () => {
    expect(evaluateGuess('SUDOR', 'CINEA')).toEqual([
      'absent', 'absent', 'absent', 'absent', 'absent',
    ]);
  });

  it('combina verde, amarillo y gris', () => {
    // MAGIA vs CASAS: pos1 A verde; la otra A de MAGIA es amarilla (CASAS tiene 2 A)
    expect(evaluateGuess('MAGIA', 'CASAS')).toEqual([
      'absent', 'correct', 'absent', 'absent', 'present',
    ]);
  });

  it('no pinta más amarillos de las veces que aparece la letra', () => {
    // SALSA vs CENAS: solo hay una S y una A → la 2ª S y la 2ª A quedan grises
    expect(evaluateGuess('SALSA', 'CENAS')).toEqual([
      'present', 'present', 'absent', 'absent', 'absent',
    ]);
  });

  it('la Ñ es una letra distinta de la N', () => {
    // SUEÑO: la S es verde, la O amarilla; N y Ñ no se mezclan
    expect(evaluateGuess('SONAR', 'SUEÑO')).toEqual([
      'correct', 'present', 'absent', 'absent', 'absent',
    ]);
    expect(evaluateGuess('NIÑOS', 'NIÑOS')[2]).toBe('correct');
  });

  it('reparto de letras repetidas entre verde y amarillo', () => {
    // SOPAS vs CASAS: la A y la S de las posiciones 3-4 son verdes;
    // la S inicial es amarilla (quedaba una S por asignar), la O y la P grises
    expect(evaluateGuess('SOPAS', 'CASAS')).toEqual([
      'present', 'absent', 'absent', 'correct', 'correct',
    ]);
  });
});

// ── normalizeWord ─────────────────────────────────────────────────────────────

describe('normalizeWord', () => {
  it('pasa a mayúsculas y quita tildes', () => {
    expect(normalizeWord('ÉXITO')).toBe('EXITO');
    expect(normalizeWord('agüita')).toBe('AGUITA');
    expect(normalizeWord('adiós')).toBe('ADIOS');
    expect(normalizeWord('más')).toBe('MAS');
  });

  it('conserva la Ñ', () => {
    expect(normalizeWord('ñandú')).toBe('ÑANDU');
    expect(normalizeWord('sueño')).toBe('SUEÑO');
  });
});

// ── keyboardStates ────────────────────────────────────────────────────────────

describe('keyboardStates', () => {
  it('acumula el mejor color por letra (verde > amarillo > gris)', () => {
    const best = keyboardStates(['PANES'], 'PLAYA');
    expect(best.get('P')).toBe('correct');
    expect(best.get('A')).toBe('present');
    expect(best.get('N')).toBe('absent');
  });

  it('una letra gris puede mejorar en intentos posteriores (prioridad)', () => {
    // En AAAA la A sale 2× gris (consumida por las 2 A de CABAL);
    // al acertar CABAL, la A debe quedar verde pese a su gris anterior
    const best = keyboardStates(['AAAAA', 'CABAL'], 'CABAL');
    expect(best.get('A')).toBe('correct');
    expect(best.get('C')).toBe('correct');
    expect(best.get('B')).toBe('correct');
  });
});

// ── getHardModeError ──────────────────────────────────────────────────────────

describe('getHardModeError (modo difícil)', () => {
  const answer = 'PLAYA';

  it('null cuando se respetan las pistas', () => {
    expect(getHardModeError('PALAS', ['PANES'], answer)).toBeNull();
    expect(getHardModeError('PARTO', ['PANES'], answer)).toBeNull();
  });

  it('error si no se conserva una letra verde', () => {
    // PANES dejó la P verde en la posición 1
    const err = getHardModeError('TARDa'.toUpperCase(), ['PANES'], answer);
    expect(err).toContain('1');
    expect(err).toContain('P');
  });

  it('error si falta una letra amarilla', () => {
    const err = getHardModeError('PERRO', ['PANES'], answer);
    expect(err).toContain('A');
  });
});

// ── Palabra diaria ────────────────────────────────────────────────────────────

describe('palabra diaria', () => {
  it('la misma palabra durante todo el día (hora local)', () => {
    const manana = getDailyWord(new Date(2026, 0, 1, 0, 0, 0));
    const noche = getDailyWord(new Date(2026, 0, 1, 23, 59, 59));
    expect(manana).toBe(noche);
  });

  it('cambia al día siguiente', () => {
    const hoy = getDailyWord(new Date(2026, 0, 1));
    const manana = getDailyWord(new Date(2026, 0, 2));
    expect(hoy).not.toBe(manana);
  });

  it('es determinista: misma fecha → misma palabra, siempre', () => {
    const a = getDailyWord(new Date(2027, 5, 15, 10, 30));
    const b = getDailyWord(new Date(2027, 5, 15, 18, 45));
    expect(a).toBe(b);
    expect(a).toMatch(/^[A-ZÑ]{5}$/);
  });

  it('dayNumber y puzzleNumber cuentan días desde el epoch (2026-01-01 = #1)', () => {
    expect(dayNumber(new Date(2026, 0, 1))).toBe(0);
    expect(puzzleNumber(new Date(2026, 0, 1))).toBe(1);
    expect(puzzleNumber(new Date(2026, 0, 2))).toBe(2);
    expect(puzzleNumber(new Date(2025, 11, 31))).toBe(0); // antes del epoch
  });

  it('msUntilNextWord llega hasta medianoche', () => {
    const mediodia = new Date(2026, 0, 1, 12, 0, 0);
    expect(msUntilNextWord(mediodia)).toBe(12 * 60 * 60 * 1000);
    const casiMedianoche = new Date(2026, 0, 1, 23, 59, 0);
    expect(msUntilNextWord(casiMedianoche)).toBe(60 * 1000);
  });

  it('dateKey formatea YYYY-MM-DD local', () => {
    expect(dateKey(new Date(2026, 10, 6, 20, 0))).toBe('2026-11-06');
    expect(dateKey(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});
