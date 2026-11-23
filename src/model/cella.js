// Cella dans son état actuel : plate-forme surélevée, mur ouest entier avec sa grande porte,
// murs latéraux arasés vers l'est, porche ouest avec architrave et frise ionique, poutres du plafond du péristyle.
import * as THREE from 'three';
import { AX, Y0, CELLA as C, COLUMN, ENTABLATURE as E, Y_GEISON } from './dimensions.js';
import { box, merge, mesh } from './geom.js';

const YF = Y0 + C.floorRise; // sol de la cella
const FULL = Y_GEISON - YF; // mur entier jusqu'au sommet de la frise

// Murs latéraux : [x0, x1, hauteur conservée] (pleine hauteur à l'ouest, arasés à l'est).
const NORTH = [
  [-C.halfLength, -17, FULL],
  [-17, -14, 9.5],
  [-14, -10, 6.0],
  [-10, -2, 3.2],
  [-2, 6, 4.4],
  [6, 14, 2.4],
  [14, C.halfLength, 1.4],
];
const SOUTH = [
  [-C.halfLength, -18, FULL],
  [-18, -15, 8.0],
  [-15, -9, 3.5],
  [-9, 3, 1.6],
  [3, 12, 2.2],
  [12, C.halfLength, 1.0],
];

export function buildCella(mat) {
  const walls = [];
  const zWall = C.halfWidth - C.wall / 2;
  for (const [segs, sign] of [
    [NORTH, -1],
    [SOUTH, 1],
  ]) {
    for (const [x0, x1, h] of segs) walls.push(box(x1 - x0, h, C.wall, (x0 + x1) / 2, YF + h / 2, sign * zWall));
  }
  // Mur ouest (opisthodome) et sa porte monumentale.
  const xw = -C.halfLength + C.wall / 2;
  const dz = C.doorWidth / 2;
  const inner = C.halfWidth - C.wall;
  for (const s of [-1, 1]) walls.push(box(C.wall, FULL, inner - dz, xw, YF + FULL / 2, s * (dz + (inner - dz) / 2)));
  walls.push(box(C.wall, FULL - C.doorHeight, C.doorWidth, xw, YF + C.doorHeight + (FULL - C.doorHeight) / 2, 0));
  // Refend et mur est : arasés.
  for (const [x, h] of [
    [C.crossWallX, 1.2],
    [C.halfLength - C.wall / 2, 1.8],
  ]) {
    for (const s of [-1, 1]) walls.push(box(C.wall, h, inner - 3, x, YF + h / 2, s * (3 + (inner - 3) / 2)));
  }

  // Plate-forme de la cella (deux marches au-dessus du stylobate).
  const floor = box(2 * (C.porchX + 1.3), C.floorRise, 2 * (C.halfWidth + 0.9), 0, Y0 + C.floorRise / 2, 0);

  // Porche ouest : architrave sur les 6 colonnes, frise ionique, poutres du plafond du péristyle.
  const colTop = YF + COLUMN.height * 0.99;
  const archH = Y_GEISON - 1.0 - colTop;
  const span = 2 * (C.halfWidth + 0.2);
  const stone = [box(1.5, archH, span, -C.porchX, colTop + archH / 2, 0)];
  const xOuterBack = -(AX + E.faceOffset - E.depth);
  const xInner = -C.porchX - 0.75;
  const beamLen = xInner - xOuterBack;
  for (let z = -11; z <= 11.01; z += 2.2) stone.push(box(beamLen + 0.6, 0.5, 0.45, (xInner + xOuterBack) / 2, Y_GEISON - 0.25, z));

  const frieze = new THREE.BoxGeometry(1.5, 1.0, span);
  frieze.translate(-C.porchX, Y_GEISON - 0.5, 0);
  mat.ionic.map.repeat.set(span / 6, 1);

  return [
    mesh(merge(walls), mat.ashlar),
    mesh(merge([floor]), mat.ashlar),
    mesh(merge(stone), mat.marble),
    mesh(frieze, mat.ionic),
  ];
}
