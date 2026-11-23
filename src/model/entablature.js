// Entablement dorique : architrave + taenia, frise (triglyphes et 92 métopes), geison avec mutules,
// et blocs isolés conservés au-dessus des corniches des côtés longs.
import * as THREE from 'three';
import { AX, AZ, ENTABLATURE as E, METOPES, Y_TOP, Y_FRIEZE, Y_GEISON, Y_CORNICE_TOP } from './dimensions.js';
import { box, merge, mesh } from './geom.js';

const FX = AX + E.faceOffset; // nu de l'architrave, façades est/ouest
const FZ = AZ + E.faceOffset; // nu de l'architrave, côtés nord/sud

export const SIDES = [
  { name: 'north', axis: 'x', sign: -1, half: FX, plane: FZ, metopes: METOPES.side },
  { name: 'south', axis: 'x', sign: 1, half: FX, plane: FZ, metopes: METOPES.side },
  { name: 'west', axis: 'z', sign: -1, half: FZ, plane: FX, metopes: METOPES.front },
  { name: 'east', axis: 'z', sign: 1, half: FZ, plane: FX, metopes: METOPES.front },
];

// Boîte posée sur un côté : s = abscisse le long du côté, o = décalage du centre vers l'extérieur.
export function sideBox(side, along, h, thick, s, y, o, opts) {
  const n = side.sign * (side.plane + o);
  return side.axis === 'x' ? box(along, h, thick, s, y, n, opts) : box(thick, h, along, n, y, s, opts);
}

function rawSideBox(side, along, h, thick, s, y, o) {
  const g = new THREE.BoxGeometry(side.axis === 'x' ? along : thick, h, side.axis === 'x' ? thick : along);
  const n = side.sign * (side.plane + o);
  if (side.axis === 'x') g.translate(s, y, n);
  else g.translate(n, y, s);
  return g;
}

export function triglyphPositions(side) {
  const n = side.metopes + 1;
  const a = -side.half + E.triglyphWidth / 2;
  const step = (2 * side.half - E.triglyphWidth) / side.metopes;
  return Array.from({ length: n }, (_, i) => a + i * step);
}

export function buildEntablature(mat) {
  const stone = [];
  const grooves = [];
  const metopes = [];
  const mutules = [];
  const teeth = [];
  const archH = E.architrave;
  const frH = E.frieze;
  const gH = E.geison;

  for (const side of SIDES) {
    const long = side.axis === 'x';
    // Architrave
    const archLen = long ? 2 * side.half : 2 * side.half - 2 * E.depth;
    stone.push(sideBox(side, archLen, archH - 0.12, E.depth, 0, Y_TOP + (archH - 0.12) / 2, -E.depth / 2));
    // Taenia (bandeau saillant)
    stone.push(sideBox(side, long ? 2 * side.half + 0.12 : 2 * side.half, 0.12, 0.08 + E.depth, 0, Y_FRIEZE - 0.06, 0.08 - (0.08 + E.depth) / 2));
    // Mur de fond de la frise (en retrait)
    const backT = 1.4;
    stone.push(sideBox(side, long ? 2 * side.half - 0.16 : 2 * side.half - 0.16 - 2 * backT, frH, backT, 0, Y_FRIEZE + frH / 2, -0.08 - backT / 2));

    const tri = triglyphPositions(side);
    tri.forEach((s, i) => {
      stone.push(sideBox(side, E.triglyphWidth, frH, 0.16, s, Y_FRIEZE + frH / 2, -0.08));
      for (const g of [-0.14, 0.14]) grooves.push(sideBox(side, 0.1, frH - 0.26, 0.02, s + g, Y_FRIEZE + (frH - 0.26) / 2 + 0.02, 0.005));
      for (const g of [-0.375, 0.375]) grooves.push(sideBox(side, 0.06, frH - 0.26, 0.02, s + g, Y_FRIEZE + (frH - 0.26) / 2 + 0.02, 0.005));
      if (i < tri.length - 1) {
        const mid = (s + tri[i + 1]) / 2;
        const w = tri[i + 1] - s - E.triglyphWidth - 0.04;
        metopes.push(rawSideBox(side, w, frH - 0.12, 0.06, mid, Y_FRIEZE + frH / 2, -0.06));
      }
    });

    // Geison (corniche) débordant + mutules sous le larmier
    const gThick = E.geisonOverhang + 1.2;
    const gLen = long ? 2 * (side.half + E.geisonOverhang) : 2 * (side.half + E.geisonOverhang) - 2 * gThick;
    stone.push(sideBox(side, gLen, gH, gThick, 0, Y_GEISON + gH / 2, E.geisonOverhang - gThick / 2));
    const centres = [];
    tri.forEach((s, i) => {
      centres.push(s);
      if (i < tri.length - 1) centres.push((s + tri[i + 1]) / 2);
    });
    for (const s of centres) mutules.push(sideBox(side, 0.78, 0.08, 0.62, s, Y_GEISON - 0.04, E.geisonOverhang - 0.36));

    // Blocs isolés au-dessus des corniches des côtés longs, surtout vers les extrémités (photos).
    if (long) {
      const keep = side.name === 'north' ? [0, 1, 2, 3, 4, 5, 6, 12, 13, 26, 27, 28, 29, 30, 31] : [0, 1, 2, 3, 4, 9, 18, 27, 28, 29, 30, 31];
      const mids = tri.slice(0, -1).map((s, i) => (s + tri[i + 1]) / 2);
      for (const k of keep) {
        const h = 0.75 + ((k * 37) % 5) * 0.06;
        teeth.push(sideBox(side, 0.95, h, 1.1, mids[k], Y_CORNICE_TOP + h / 2, 0.15));
      }
    }
  }

  return [
    mesh(merge(stone), mat.marble),
    mesh(merge(grooves), mat.groove, { cast: false }),
    mesh(merge(metopes), mat.metope, { cast: false }),
    mesh(merge(mutules), mat.mutule, { cast: false }),
    mesh(merge(teeth), mat.marble),
  ];
}
