// Genera src/data/dictionary.ts con TODAS las palabras españolas de 5 letras
// (incluye conjugaciones y plurales). Fuente: paquete npm
// `an-array-of-spanish-words` (MIT, ~636.000 palabras derivadas de Hunspell).
//
// Uso:  npm run dict
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const all = JSON.parse(readFileSync(require.resolve('an-array-of-spanish-words/index.json'), 'utf8'));

const norm = (w) =>
  w.toUpperCase().normalize('NFC')
    .replace(/[ÁÀ]/g, 'A').replace(/[ÉÈ]/g, 'E').replace(/[ÍÏ]/g, 'I')
    .replace(/[ÓÒ]/g, 'O').replace(/[ÚÜ]/g, 'U');

const words = [...new Set(all.map(norm).filter((w) => /^[A-ZÑ]{5}$/.test(w)))].sort();

const lines = [];
for (let i = 0; i < words.length; i += 16) lines.push(words.slice(i, i + 16).join(' '));

const out = `// ARCHIVO GENERADO por scripts/build-dictionary.mjs — no editar a mano.
// Diccionario completo de palabras de 5 letras aceptadas al escribir (${words.length}).
// Fuente: an-array-of-spanish-words (MIT). Para añadir palabras sueltas usa
// EXTRA_ACCEPTED en words.ts; para regenerar: npm run dict
//
// Se guarda como un único string (más ligero que un array en el bundle).
export const DICTIONARY_RAW = \`
${lines.join('\n')}
\`;
`;
writeFileSync(new URL('../src/data/dictionary.ts', import.meta.url), out);
console.log(`dictionary.ts: ${words.length} palabras`);
