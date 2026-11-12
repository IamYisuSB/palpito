# CLAUDE.md — Guía completa del proyecto Pálpito

> Documentación para continuar este proyecto con cualquier asistente de IA (Claude, etc.)
> o a mano. Última actualización: 2026-11-06.

## Qué es este proyecto

Pálpito (antes "Wordle ES"; renombrado y rediseñado para no copiar la marca original) — juego en español para web: adivinar una palabra de 5 letras en 6 intentos,
**una partida por día**, con una palabra nueva automáticamente cada medianoche.

**Decisiones de producto ya tomadas (no reabrir sin preguntar):**

| Decisión | Valor |
|---|---|
| Idioma | Español (con Ñ; tildes ignoradas: JAPÓN se escribe JAPON) |
| Stack | TypeScript + Vite + CSS puro, sin framework, sin dependencias runtime |
| Tests | Vitest (solo lógica pura del motor y listas de palabras) |
| Palabra diaria | **Determinista por fecha en el cliente — SIN backend ni cron** |
| Persistencia | Solo `localStorage` (no hay cuentas ni servidor) |
| Hosting previsto | Netlify o Vercel (deploy estático desde Git) |

## Cómo funciona la palabra diaria (lo más importante)

No hay servidor. La palabra se calcula en el navegador de forma determinista
(igual que el Wordle original):

```
índice = días transcurridos desde el 2026-01-01 (medianoche hora local)  módulo  tamaño de la lista
```

- El 2026-01-01 fue el puzzle **#1** (constante `EPOCH` en `src/engine.ts`).
- La lista `ANSWERS` tiene ~570 palabras ⇒ más de un año y medio sin repetir.
- Todos los jugadores del mismo día (misma zona horaria) ven la misma palabra.
- El cambio ocurre a **medianoche hora local** del jugador.
- Consecuencia asumida: la palabra es visible en el código fuente del bundle.
  No es trampa "hackeable" que importe cerrar — es el modelo del Wordle original.

Si algún día se quisiera un backend (rankings globales, palabra elegida a mano,
estadísticas agregadas), el punto de extensión sería sustituir `getDailyWord()`
por una llamada a una API — el resto del código no cambia.

## Comandos

```bash
npm install        # instalar dependencias (una sola vez)
npm run dev        # servidor de desarrollo → http://localhost:5173
npm test           # ejecutar la suite de tests (vitest, un solo run)
npm run test:watch # tests en modo watch
npm run build      # typecheck (tsc) + build de producción → dist/
npm run preview    # servir el build de producción localmente
npm run dict       # regenerar src/data/dictionary.ts desde an-array-of-spanish-words
```

## Estructura del código

```
Wordle/
├── index.html              # shell HTML: header, tablero, teclado, 3 modales
├── src/
│   ├── main.ts             # ORQUESTACIÓN: flujo de partida, input, fin de juego,
│   │                       #   compartir, ajustes. Empezar a leer aquí.
│   ├── engine.ts           # LÓGICA PURA (sin DOM, 100% testeable):
│   │                       #   evaluateGuess, keyboardStates, getHardModeError,
│   │                       #   normalizeWord y toda la lógica diaria
│   │                       #   (dateKey, dayNumber, getDailyWord, msUntilNextWord)
│   ├── storage.ts          # localStorage: progreso del día, stats y ajustes
│   ├── ui.ts               # DOM puro: construir tablero/teclado, animaciones
│   │                       #   (flip/shake/bounce/pop), toasts, modales, countdown
│   ├── style.css           # TODO el CSS. Temas: html.dark, html.contrast. Paleta: turquesa (--correct) + terracota (--present) sobre crema
│   └── data/
│       ├── words.ts        # ANSWERS (respuestas) + EXTRA_ACCEPTED (solo válidas)
│       └── dictionary.ts   # GENERADO: ~10.800 palabras de 5 letras aceptadas
├── scripts/build-dictionary.mjs  # regenera dictionary.ts (npm run dict)
├── tests/
│   ├── engine.test.ts      # motor: colores, letras repetidas, Ñ, modo difícil, fechas
│   └── words.test.ts       # sanidad de las listas (longitud, formato, duplicados)
├── netlify.toml            # config de deploy (build → dist)
├── vercel.json             # config de deploy alternativa
└── CLAUDE.md / README.md
```

Flujo de dependencias (importante mantenerlo):
`main.ts → engine.ts / storage.ts / ui.ts / data/words.ts`
`ui.ts` no importa lógica de juego; `engine.ts` no toca el DOM.

## Mecánicas implementadas (fase 1–5 del roadmap: HECHAS)

- [x] Tablero 6×5 + teclado virtual en pantalla (layout con Ñ) + teclado físico
- [x] Colores verde/amarillo/gris con **algoritmo de 2 pasadas** (letras repetidas correctas)
- [x] Estado del teclado con prioridad verde > amarillo > gris
- [x] Validación de palabra contra diccionario (shake + toast si no vale)
- [x] Animaciones: pop al escribir, flip escalonado al revelar, shake, bounce al ganar
- [x] 1 partida/día: al terminar se bloquea y muestra cuenta atrás hasta medianoche
- [x] Restaurar partida a medias al recargar (mismo día)
- [x] Estadísticas: jugadas, % acierto, racha actual/máxima, distribución 1–6
- [x] Compartir resultado en emoji 🟢🟠⚫ (Web Share API o portapapeles)
- [x] Modo difícil (obliga a reutilizar pistas; solo conmutable antes del 1er intento)
- [x] Tema oscuro y alto contraste (colores para daltónicos, también en los emoji)
- [x] Ayuda automática la primera vez que se visita

## Detalles que no son obvios (leer antes de tocar)

**Motor (`evaluateGuess`):** primera pasada marca verdes y cuenta en un Map las
letras de la respuesta aún "sin asignar"; segunda pasada pinta amarillo solo si
queda cupo. Por eso `SALSA` contra `CENAS` no pinta dos veces la S.

**Normalización:** las listas guardan palabras en MAYÚSCULAS sin tilde y con Ñ.
`normalizeWord()` convierte la entrada del jugador a ese formato (solo reemplaza
ÁÉÍÓÚÜ, nunca la virgulilla de la Ñ). El teclado físico solo acepta `/^[a-zñ]$/`.

**Claves de localStorage** (prefijo `wordle-es:`, versionadas `:v1`):
- `wordle-es:state:v1` → `{ dateKey, guesses, status }`. Si `dateKey` ≠ hoy, se
  descarta y se empieza partida nueva (así cambia el día sin recargar rara).
- `wordle-es:stats:v1` → `{ played, wins, currentStreak, maxStreak, distribution[6] }`
- `wordle-es:settings:v1` → `{ hardMode, dark, highContrast }`

**Rachas:** `registerGameResult()` en `storage.ts`. Victoria suma racha y actualiza
máximo; derrota la reinicia. OJO: si el jugador no juega un día, la racha NO se
corta (simplificación asumida; el original hace lo mismo con juego local).

**Modo difícil:** `getHardModeError()` devuelve mensaje de error en español o
`null`. Reglas: las verdes conservan posición y las amarillas deben reaparecer.

**Cuenta atrás:** un `setInterval` de 1 s actualiza el reloj del modal; se limpia
al cerrar cualquier modal (`onModalClose` en `main.ts`). No dejes intervals vivos.

**Animación de revelado:** `revealRow()` resuelve una Promise al acabar toda la
fila (~2 s); durante ese tiempo `revealing === true` bloquea el input.

**Alto contraste:** cambia las variables CSS `--correct/--present` **y** los emoji
del texto para compartir (🔵🟡 en vez de 🟢🟠).

## Cómo ampliar las listas de palabras

**Validación de intentos:** se acepta cualquier palabra de `ANSWERS`, `EXTRA_ACCEPTED`
o `DICTIONARY` (generado, ~10.800 palabras con conjugaciones y plurales, fuente
`an-array-of-spanish-words`, MIT). No editar `dictionary.ts` a mano: las palabras
sueltas que falten van a `EXTRA_ACCEPTED`.

`src/data/words.ts` tiene dos listas:

- `ANSWERS` (~570): pueden ser palabra del día. Deben ser comunes y variadas.
- `EXTRA_ACCEPTED` (~85): se aceptan al escribirlas pero nunca son respuesta
  (plurales raros, conjugaciones, palabras poco frecuentes).

**Reglas duras** (las impone `tests/words.test.ts` — el test fallará si las rompes):
exactamente 5 letras, solo `[A-ZÑ]`, sin tildes, sin duplicados dentro ni entre
listas, y `ANSWERS.length >= 500`. Al añadir palabras, ejecuta `npm test`.

**OJO — cambiar ANSWERS cambia el histórico:** el índice del día depende de la
posición de cada palabra en el array. Añadir al final solo afecta a días futuros
(lejos del ciclo actual); insertar en medio desplaza palabras ya usadas. Regla
segura: solo añadir al final de cada grupo o, mejor, al final del array.

## Deploy

El build es 100% estático (`dist/`), funciona en cualquier hosting:

- **Netlify:** ya hay `netlify.toml` (build `npm run build`, publish `dist`).
  Conectar el repo en app.netlify.com → Import from Git → deploy automático.
- **Vercel:** ya hay `vercel.json`. Importar el repo en vercel.com; Vite se
  autodetecta.
- GitHub Pages también valdría (la config de Vite usa `base: './'`).

## Roadmap restante (opcional, por prioridad)

1. **Deploy real** en Netlify/Vercel + dominio (fase 6 del roadmap original)
2. **PWA**: manifest + service worker para "instalarlo" en móvil (fase 7)
3. **Más palabras**: subir ANSWERS hacia 1000+ (reglas de arriba)
4. Página "Archivo/práctica" (wordle ilimitado sin afectar stats)
5. Meta tags Open Graph para que el enlace compartido muestre tarjeta bonita
6. Si algún día se quiere multiidioma o rankings globales → backend (ver arriba)

## Estado de tests y build (al redactar esto)

- `npm test` → 32/32 pasando (los tests ya pillaron 5 erratas en las listas:
  `UÑAS`, `DABA`, `VAYA` con longitud incorrecta y 3 duplicados — funcionan)
- `npm run build` → OK, bundle ~81 KB JS (35 KB gzip, casi todo es el diccionario) + 7 KB CSS
