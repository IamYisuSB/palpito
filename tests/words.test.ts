import { describe, it, expect } from 'vitest';
import { ANSWERS, EXTRA_ACCEPTED, DICTIONARY, isAcceptedWord } from '../src/data/words';

// Estas pruebas garantizan que las listas de palabras estén siempre sanas:
// si añades palabras nuevas, cualquier errata (longitud, tilde, duplicado)
// se detectará aquí antes de llegar a producción.

describe('ANSWERS (respuestas posibles)', () => {
  it('todas tienen exactamente 5 letras', () => {
    for (const w of ANSWERS) {
      expect(w.length, `Longitud de ${w}`).toBe(5);
    }
  });

  it('todas son MAYÚSCULAS A-Z o Ñ, sin tildes ni espacios', () => {
    for (const w of ANSWERS) {
      expect(w, `Formato de ${w}`).toMatch(/^[A-ZÑ]{5}$/);
    }
  });

  it('no hay duplicados', () => {
    expect(new Set(ANSWERS).size).toBe(ANSWERS.length);
  });

  it('hay al menos 500 palabras (recorrido de más de un año)', () => {
    expect(ANSWERS.length).toBeGreaterThanOrEqual(500);
  });

  it('incluye palabras con Ñ', () => {
    expect(ANSWERS.some((w) => w.includes('Ñ'))).toBe(true);
  });
});

describe('EXTRA_ACCEPTED (válidas pero nunca respuesta)', () => {
  it('todas tienen exactamente 5 letras y formato correcto', () => {
    for (const w of EXTRA_ACCEPTED) {
      expect(w.length, `Longitud de ${w}`).toBe(5);
      expect(w, `Formato de ${w}`).toMatch(/^[A-ZÑ]{5}$/);
    }
  });

  it('no hay duplicados ni solapamiento con ANSWERS', () => {
    expect(new Set(EXTRA_ACCEPTED).size).toBe(EXTRA_ACCEPTED.length);
    const solape = EXTRA_ACCEPTED.filter((w) => ANSWERS.includes(w));
    expect(solape).toEqual([]);
  });
});

describe('isAcceptedWord', () => {
  it('acepta palabras de ambas listas', () => {
    expect(isAcceptedWord('PLAYA')).toBe(true);
    expect(isAcceptedWord(EXTRA_ACCEPTED[0])).toBe(true);
  });

  it('rechaza palabras desconocidas o mal formadas', () => {
    expect(isAcceptedWord('ZZZZZ')).toBe(false);
    expect(isAcceptedWord('PLAYA ')).toBe(false);
    expect(isAcceptedWord('playa')).toBe(false); // hay que normalizar antes
  });
});

describe('DICTIONARY (diccionario general generado)', () => {
  it('tiene miles de palabras con formato correcto', () => {
    expect(DICTIONARY.length).toBeGreaterThan(10000);
    for (const w of DICTIONARY) {
      expect(w, `Formato de ${w}`).toMatch(/^[A-ZÑ]{5}$/);
    }
  });

  it('acepta palabras comunes que antes se rechazaban', () => {
    for (const w of ['CARNE', 'GRUPO', 'FUMAR', 'LEJOS', 'MARCO', 'PERRA', 'BARCA', 'PUEDO', 'ENTRE', 'HASTA', 'MISMO', 'CANTO']) {
      expect(isAcceptedWord(w), w).toBe(true);
    }
  });

  it('acepta conjugaciones y plurales', () => {
    for (const w of ['COMIO', 'BEBIA', 'SALTE', 'VIMOS', 'LUCES', 'PECES', 'ARBOL']) {
      expect(isAcceptedWord(w), w).toBe(true);
    }
  });

  it('acepta palabras con Ñ', () => {
    for (const w of ['NIÑOS', 'AÑEJO', 'SUEÑO', 'BAÑAR', 'ÑANDU']) {
      expect(isAcceptedWord(w), w).toBe(true);
    }
  });
});
