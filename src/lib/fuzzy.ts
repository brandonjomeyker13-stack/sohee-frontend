/**
 * Búsqueda difusa (tolerante a errores de tipeo) en el cliente.
 * No depende del backend: normaliza el texto, tolera acentos, letras
 * repetidas ("caamisssetas") y erratas usando distancia de Levenshtein.
 */

/** Quita acentos, pasa a minúsculas y colapsa letras repetidas. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/(.)\1+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Distancia de edición con corte temprano. */
function levenshtein(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      curr[j] = v;
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

/** Tolerancia según el largo de la palabra buscada. */
function tolerance(len: number): number {
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 8) return 2;
  return 3;
}

/**
 * Devuelve un puntaje de coincidencia (0 = no coincide, mayor = mejor)
 * entre lo que escribió el usuario y el texto del producto.
 */
export function fuzzyScore(query: string, text: string): number {
  const q = normalize(query);
  const t = normalize(text);
  if (!q) return 1;
  if (!t) return 0;

  const words = t.split(" ");
  let total = 0;

  for (const term of q.split(" ")) {
    if (!term) continue;
    let best = 0;

    if (t.includes(term)) {
      best = t.startsWith(term) ? 100 : 80;
    } else {
      const max = tolerance(term.length);
      for (const word of words) {
        // Coincidencia por prefijo (el usuario escribe a medias).
        if (word.startsWith(term) || term.startsWith(word)) {
          best = Math.max(best, 70);
          continue;
        }
        if (max === 0) continue;
        const d = levenshtein(term, word, max);
        if (d <= max) best = Math.max(best, 60 - d * 10);
        // También contra el prefijo de la palabra, para plurales/sufijos.
        if (word.length > term.length) {
          const d2 = levenshtein(term, word.slice(0, term.length), max);
          if (d2 <= max) best = Math.max(best, 55 - d2 * 10);
        }
      }
    }

    if (best === 0) return 0; // todos los términos deben coincidir de algún modo
    total += best;
  }

  return total;
}

/** Filtra y ordena una lista por relevancia difusa. */
export function fuzzyFilter<T>(items: T[], query: string, toText: (item: T) => string): T[] {
  if (!query.trim()) return items;
  return items
    .map((item) => ({ item, score: fuzzyScore(query, toText(item)) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item);
}
