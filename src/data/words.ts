// ─────────────────────────────────────────────────────────────────────────────
// LISTAS DE PALABRAS (español, 5 letras, MAYÚSCULAS, sin tildes, con Ñ)
//
//  • ANSWERS: palabras que pueden ser la respuesta diaria (comunes, variadas).
//  • EXTRA_ACCEPTED: palabras válidas para escribir, pero nunca respuesta.
//
// Reglas de las listas (las valida tests/words.test.ts):
//  - exactamente 5 letras, solo A-Z y Ñ, sin tildes (á→a ya aplicado)
//  - sin duplicados ni entre listas ni dentro de una
// ─────────────────────────────────────────────────────────────────────────────

import { DICTIONARY_RAW } from './dictionary';

export const ANSWERS: string[] = [
  // Personas y familia
  'HIJOS', 'HIJAS', 'MADRE', 'PADRE', 'NIÑOS', 'NIÑAS', 'NIÑEZ', 'BEBES',
  'VIEJO', 'VIEJA', 'JOVEN', 'CHICA', 'CHICO', 'MUJER', 'VARON', 'SEÑOR',
  'DAMAS', 'REINA', 'REYES', 'DUQUE', 'CONDE', 'MONJA', 'CURAS', 'SANTO',
  'SANTA', 'DIOSA', 'BRUJA', 'BRUJO', 'HEROE', 'POETA', 'PRIMO', 'PRIMA',
  'NUERA', 'NOVIA', 'NOVIO',
  // Cuerpo y salud
  'VISTA', 'NARIZ', 'BOCAS', 'CEJAS', 'OREJA', 'OIDOS', 'PELOS', 'BRAZO',
  'MANOS', 'DEDOS', 'PECHO', 'MUSLO', 'TALON', 'HUESO', 'VENAS',
  'DOLOR', 'SALUD', 'GRIPE', 'VIRUS', 'VENDA', 'ALMAS', 'SORDO', 'SORDA',
  'CIEGO', 'CIEGA', 'CALVO', 'CALVA', 'RIÑON',
  // Casa y objetos
  'TECHO', 'PARED', 'SUELO', 'SALON', 'BAÑOS', 'DUCHA', 'CAMAS', 'MESAS',
  'SILLA', 'BANCO', 'VELAS', 'COJIN', 'CAJON', 'LIBRO', 'HOJAS', 'PLUMA',
  'LAPIZ', 'BOLSA', 'CAJAS', 'CUBOS', 'PALAS', 'HILOS', 'BOTON', 'CREMA',
  'JABON', 'GRIFO', 'OLLAS', 'VASOS', 'TAZAS', 'COPAS', 'GAFAS', 'RELOJ',
  'BOLSO', 'MEDIA', 'FALDA', 'GORRA', 'CINTO', 'BOTAS', 'TACON', 'JOYAS',
  'PERLA', 'TALLA', 'TIMON', 'JARRA', 'PLATO', 'TAZON', 'HORNO',
  // Naturaleza
  'PLAYA', 'MONTE', 'LAGOS', 'MAREA', 'NIEVE', 'CIELO', 'NUBES', 'BRISA',
  'RAYOS', 'ARENA', 'DUNAS', 'ROCAS', 'SELVA', 'ARBOL', 'ROSAS', 'HOYOS',
  'CAMPO', 'PRADO', 'VALLE', 'SENDA', 'CUEVA', 'BRUMA', 'HIELO', 'FUEGO',
  'HUMOS', 'POLVO', 'OASIS', 'ISLAS', 'COSTA', 'PALMA', 'ROSAL', 'FRESA',
  'CORAL', 'DELTA', 'GRAVA', 'BARRO', 'BRASA', 'ASCUA', 'FLAMA', 'VAPOR',
  'GOTAS', 'POZOS', 'RIADA',
  // Animales
  'ABEJA', 'BURRO', 'CABRA', 'CERDO', 'GANSO', 'LINCE', 'LOBOS', 'PATOS',
  'PERRO', 'POLLO', 'RATON', 'TIGRE', 'VACAS', 'ZORRO', 'LEONA', 'POTRO',
  'YEGUA', 'MULAS', 'TOROS', 'PECES', 'GATOS', 'RANAS', 'MONOS', 'ALCES',
  'PUMAS', 'RENOS', 'ORCAS', 'PULPO', 'ERIZO', 'COBRA', 'ARAÑA', 'ÑANDU',
  'MOSCA', 'PULGA', 'ORUGA', 'BICHO', 'MIGAS', 'PANAL', 'PATAS', 'NIDOS',
  'CRIAS', 'ALETA', 'ZARPA', 'CARPA', 'PESCA', 'COCOS',
  // Comida
  'PANES', 'LECHE', 'HUEVO', 'QUESO', 'YOGUR', 'ARROZ', 'PASTA', 'SOPAS',
  'CALDO', 'TARTA', 'SALSA', 'LIMON', 'MELON', 'HIGOS', 'DATIL', 'PERAS',
  'JAMON', 'LOMOS', 'PAPAS', 'HABAS', 'SETAS', 'GUISO', 'MANGO',
  // Plantas y campo
  'YERBA', 'CLAVO', 'MUSGO', 'ROBLE', 'PINOS', 'ABETO', 'CEDRO', 'SAUCE',
  'ALAMO', 'TALLO', 'GRANO', 'TRIGO', 'AVENA', 'HONGO', 'VIÑAS',
  // Verbos y formas comunes
  'CARNE', 'COMER', 'BEBER', 'VIVIR', 'ANDAR', 'ODIAR', 'MIRAR', 'GANAR',
  'MATAR', 'SANAR', 'CURAR', 'DOLER', 'DECIR', 'COCER', 'FREIR', 'BATIR',
  'PELAR', 'LAVAR', 'PONER', 'SACAR', 'METER', 'TRAER', 'ABRIR', 'BESAR',
  'GOZAR', 'SABER', 'CREER', 'DUDAR', 'TENER', 'ESTAR', 'HACER', 'PEINE',
  'VENIR', 'TOCAR', 'TIRAR', 'SUBIR', 'BAJAR', 'SALIR', 'VOLAR', 'NADAR',
  'PARAR', 'TOMAR', 'DEJAR', 'COGER', 'DONAR', 'SUMAR', 'MEDIR', 'PESAR',
  'SOÑAR', 'DAÑAR', 'GRUPO', 'MARCO', 'BARCA', 'PIEZA', 'MUELA', 'AMADO',
  'AMADA', 'FOCAS', 'HIENA', 'PANDA', 'CEBRA', 'LABIO', 'CODOS', 'FRUTA',
  'LECHO', 'FUERA', 'PLAZO', 'MANTA', 'CINTA', 'TECLA', 'DUDAS', 'NAIPE',
  'PUEDA', 'PODER', 'DARDO', 'GLOBO', 'PIÑAS', 'MARCA', 'TORTA', 'BANDA',
  'CASCO', 'GALLO', 'LLAMA', 'CUERO', 'PAVOS', 'LANZA', 'ARCOS', 'TRONO',
  'CETRO', 'CISNE', 'CAPAS', 'HECHO', 'GARZA',
  // Adjetivos
  'ALTOS', 'ALTAS', 'BAJOS', 'BAJAS', 'LARGO', 'LARGA', 'CORTO', 'CORTA',
  'ANCHO', 'ANCHA', 'FINOS', 'FINAS', 'FLACO', 'FLACA', 'GORDO', 'GORDA',
  'DEBIL', 'DURAS', 'DUROS', 'SUAVE', 'LISOS', 'SUCIO', 'NUEVO', 'NUEVA',
  'LISTO', 'LISTA', 'TONTO', 'TONTA', 'LOCOS', 'LOCAS', 'SABIO', 'SABIA',
  'CULTO', 'TORPE', 'HABIL', 'ZURDO', 'LENTO', 'LENTA', 'TARDE', 'OPACO',
  'RICOS', 'RICAS', 'POBRE', 'CAROS', 'CARAS', 'FELIZ', 'BRAVO', 'CALMO',
  'NEGRO', 'NEGRA', 'ROJOS', 'ROJAS', 'VERDE', 'PLATA', 'CLARO', 'CLARA',
  'BUENO', 'BUENA', 'MALOS', 'MALAS', 'LIBRE', 'FALSA', 'FALSO', 'ENANO',
  // Sustantivos varios
  'AMIGO', 'AMIGA', 'JUEGO', 'GOLES', 'BALON', 'REDES', 'TENIS', 'SALTO',
  'PASOS', 'RITMO', 'BAILE', 'NOTAS', 'LETRA', 'VERSO', 'RIMAS', 'POEMA',
  'FOLIO', 'PAPEL', 'SELLO', 'CARTA', 'SOBRE', 'CUPON', 'FICHA', 'SIGNO',
  'CIFRA', 'EUROS', 'PESOS', 'PAGOS', 'DEUDA', 'VENTA', 'JEFES', 'TURNO',
  'HORAS', 'MESES', 'SIGLO', 'FECHA', 'NOCHE', 'FINES', 'METAS', 'IDEAS',
  'FRASE', 'PISTA', 'AVISO', 'LUCES', 'FAROL', 'ORDEN', 'NORMA', 'REGLA',
  'LEYES', 'FALLO', 'CULPA', 'ROBOS', 'HURTO', 'PRESO', 'MIEDO', 'RISAS',
  'LLORO', 'GRITO', 'GOZOS', 'GUSTO', 'ANSIA', 'DESEO', 'LOGRO', 'EXITO',
  'HONOR', 'DIGNO', 'CELOS', 'ODIOS', 'APOYO', 'AYUDA', 'COSAS', 'CASOS',
  'TEMAS', 'BROMA', 'METAL', 'ACERO', 'PLOMO', 'COBRE', 'LATON', 'NUDOS',
  'LAZOS', 'GOMAS', 'LIGAS', 'TIZAS', 'CANTO', 'CRETA', 'CEROS', 'CINCO',
  'SIETE', 'NUEVE', 'TRECE', 'DOBLE', 'MITAD', 'PARTE', 'TOTAL', 'TODOS',
  'TODAS', 'NADIE', 'POCOS', 'POCAS', 'FALTA', 'RESTO', 'RESTA', 'SUMAS',
  'GRADO', 'NIVEL', 'PUNTO', 'LINEA', 'RAYAS', 'ROMBO', 'CONOS', 'MUCHO',
  'MAGIA', 'PIANO', 'DANZA', 'CIRCO', 'FERIA', 'MODAS',
  // Lugares, viajes y tecnología
  'HOGAR', 'PISOS', 'ATICO', 'PATIO', 'PLAZA', 'CALLE', 'ALDEA', 'MUNDO',
  'TORRE', 'RUINA', 'NORTE', 'OESTE', 'HOTEL', 'CINES', 'SERIE', 'LLAVE',
  'MURAL', 'ARTES', 'OBRAS', 'TINTA', 'RADIO', 'CANAL', 'VIDEO', 'AUDIO',
  'FOTOS', 'MOVIL', 'MOTOR', 'RUEDA', 'COCHE', 'AUTOS', 'MOTOS', 'PATIN',
  'AVION', 'BARCO', 'CANOA', 'VAGON', 'VIAJE', 'RUTAS', 'MAPAS', 'SOLAR',
  'LUNAR', 'MAREO', 'CLAVE', 'PULSO', 'VOCES', 'FAROS', 'COLAS', 'CERCA',
  'MEDIO',
  // Palabras comunes (adverbios, pronombres…)
  'QUIZA', 'ACASO', 'NUNCA', 'AHORA', 'ANTES', 'LUEGO', 'DONDE', 'QUIEN',
  'HARTO',
];

// Palabras válidas al escribirlas, pero que nunca serán la respuesta del día.
export const EXTRA_ACCEPTED: string[] = [
  // Formas verbales y gramática
  'AQUEL', 'SERIA', 'HEMOS', 'HABRA', 'VERAS', 'VIERA', 'VENGA',
  'DAMOS', 'DIGAN', 'DIGAS', 'PONGO', 'PONES', 'CABEN', 'ANDAS', 'BEBIA',
  'DEBIA', 'DEBIO', 'DECIA', 'MASAS', 'AMASA', 'ASADO', 'ASADA', 'TAPAR',
  'FRITO', 'RALLA', 'SIRVE', 'SIRVO', 'TRAGA', 'USABA',
  // Plurales y derivados
  'SOLAS', 'ROTOS', 'ROTAS', 'COSIO', 'LANAS', 'PERAL', 'PAJAS', 'ARPAS',
  'COROS', 'TENOR', 'ACTOS', 'MIMOS', 'BODAS', 'CITAS', 'GALAN', 'MAGOS',
  'HADAS', 'MITOS', 'ASTAS', 'LUNAS', 'CAZAS', 'BALSA', 'REMOS', 'FLOTA',
  'NAVES', 'BUZOS', 'MOLAR', 'LODOS', 'ROCIO', 'ALBAS', 'OCASO', 'MOJOS',
  'TAPAS', 'POLOS', 'MUROS', 'SETOS', 'VERJA', 'VALLA',
  // Préstamos de uso común que no trae el diccionario generado
  'VODKA', 'SUSHI', 'KIWIS', 'BLOGS', 'CHATS', 'PAPIS',
];

/** Diccionario general (~10.800 palabras de 5 letras, con conjugaciones y plurales). */
export const DICTIONARY: string[] = DICTIONARY_RAW.split(/\s+/).filter(Boolean);

/** Diccionario completo aceptado al escribir (respuestas + extras + diccionario general). */
export const ACCEPTED_SET: Set<string> = new Set([...ANSWERS, ...EXTRA_ACCEPTED, ...DICTIONARY]);

/** ¿La palabra (ya normalizada) es válida para jugarla? */
export function isAcceptedWord(word: string): boolean {
  return ACCEPTED_SET.has(word);
}
