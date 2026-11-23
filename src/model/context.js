// Contexte sur le plateau (volumes simplifiés, pour la vue aérienne) : l'Érechthéion au nord
// et les Propylées à l'entrée ouest. Le sujet détaillé reste le Parthénon.
import * as THREE from 'three';
import { box, merge, mesh, worldUV } from './geom.js';

function cyl(r, h, x, y, z, seg = 12) {
  const g = new THREE.CylinderGeometry(r * 0.9, r, h, seg);
  g.translate(x, y + h / 2, z);
  return worldUV(g, 0.5);
}

export function buildContext(mat) {
  const stone = [];
  const cols = [];

  // Érechthéion : cella de 23,5 × 11,6 m (sans toit), porche est ionique, porche nord, porche des Caryatides au sud.
  const ex = -30;
  const ez = -58;
  stone.push(box(25.5, 0.8, 13.6, ex, 0.4, ez));
  for (const [w, d, x, z] of [
    [23.5, 1.0, ex, ez - 5.3],
    [23.5, 1.0, ex, ez + 5.3],
    [1.0, 11.6, ex - 11.25, ez],
    [1.0, 11.6, ex + 3, ez],
  ]) stone.push(box(w, 8.2, d, x, 0.8 + 4.1, z));
  stone.push(box(1.0, 1.6, 11.6, ex + 11.25, 0.8 + 7.4, ez)); // linteau du porche est
  for (let i = 0; i < 6; i++) cols.push(cyl(0.38, 6.6, ex + 12.2, 0.8, ez - 4.9 + i * 1.96));
  stone.push(box(1.6, 1.0, 11.8, ex + 12.2, 0.8 + 6.6 + 0.5, ez));
  // Porche nord (plus bas, sur le côté)
  stone.push(box(10.5, 0.6, 7.2, ex - 7.5, 0.3, ez - 9.6));
  for (let i = 0; i < 4; i++) cols.push(cyl(0.42, 7.2, ex - 12 + i * 3, 0.6, ez - 12.4));
  for (const z of [ez - 9.6]) cols.push(cyl(0.42, 7.2, ex - 12, 0.6, z), cyl(0.42, 7.2, ex - 3, 0.6, z));
  stone.push(box(10.5, 1.2, 7.2, ex - 7.5, 0.6 + 7.2 + 0.6, ez - 9.6));
  // Porche des Caryatides (sud)
  stone.push(box(5.6, 1.8, 3.8, ex - 7, 0.9, ez + 7.2));
  for (let i = 0; i < 4; i++) cols.push(cyl(0.33, 2.3, ex - 9.1 + i * 1.4, 1.8, ez + 8.6));
  for (const x of [ex - 9.1, ex - 4.9]) cols.push(cyl(0.33, 2.3, x, 1.8, ez + 7.1));
  stone.push(box(5.8, 0.7, 4.0, ex - 7, 1.8 + 2.3 + 0.35, ez + 7.2));

  // Propylées : portique ouest à six colonnes doriques, mur des portes, ailes nord (Pinacothèque) et sud.
  const px = -170;
  const pz = 2;
  stone.push(box(14, 1.2, 24, px, 0.6, pz));
  for (const z of [-8.2, -4.9, -1.6, 1.6, 4.9, 8.2]) cols.push(cyl(0.78, 8.8, px - 5.5, 1.2, pz + z, 16));
  stone.push(box(2.2, 2.4, 20, px - 5.5, 1.2 + 8.8 + 1.2, pz));
  stone.push(box(1.4, 11, 18.5, px + 4.5, 1.2 + 5.5, pz));
  for (const s of [-1, 1]) stone.push(box(11, 11.4, 1.2, px - 0.5, 1.2 + 5.7, pz + s * 9.6));
  stone.push(box(10, 7.5, 9, px - 8, 3.75, pz - 19)); // Pinacothèque
  stone.push(box(8, 6.5, 6, px - 8, 3.25, pz + 15));

  return [mesh(merge(stone), mat.marble), mesh(merge(cols), mat.ruin)];
}
