// Crépis : assise de réglage (euthynteria) et trois degrés ; le dernier est le stylobate.
import { STYLOBATE, CREPIDOMA } from './dimensions.js';
import { box, merge, mesh } from './geom.js';

export function buildCrepidoma(mat) {
  const { euthynteria, steps, stepHeight, tread } = CREPIDOMA;
  const parts = [];
  const extra = tread * steps + 0.35;
  parts.push(box(STYLOBATE.length + 2 * extra, euthynteria + 0.8, STYLOBATE.width + 2 * extra, 0, (euthynteria - 0.8) / 2, 0));
  for (let i = 0; i < steps; i++) {
    const grow = 2 * tread * (steps - 1 - i);
    const y = euthynteria + i * stepHeight + stepHeight / 2;
    parts.push(box(STYLOBATE.length + grow, stepHeight, STYLOBATE.width + grow, 0, y, 0));
  }
  const foundation = mesh(merge(parts.slice(0, 1)), mat.foundation);
  const stepsMesh = mesh(merge(parts.slice(1)), mat.ashlar);
  return [foundation, stepsMesh];
}
