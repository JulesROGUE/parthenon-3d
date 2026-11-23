// Frontons dans leur état actuel : tympans ruinés en gradins (profils relevés sur les photos),
// amorces des corniches rampantes et restes du groupe sculpté (copies) à l'ouest.
import * as THREE from 'three';
import { AX, AZ, ENTABLATURE as E, PEDIMENT, PEDIMENT_SLOPE, Y_CORNICE_TOP } from './dimensions.js';
import { box, merge, mesh, worldUV } from './geom.js';

const FX = AX + E.faceOffset;
const XF = FX - 0.08; // nu du tympan (plan de la frise)
const DEPTH = 0.9;
const HALF = PEDIMENT.length / 2;
const S = AZ + E.faceOffset + E.geisonOverhang; // angle extérieur de la corniche

const tri = (s) => PEDIMENT.height * (1 - Math.abs(s) / HALF);

// Profils (s : de la gauche à la droite du spectateur face au fronton ; hauteurs en m).
const PROFILES = {
  // Façade ouest (gauche = nord) : haut à gauche du centre, plus bas vers le sud.
  west: [
    [-HALF, -9.2, 0.7],
    [-9.2, -6.7, 2.0],
    [-6.7, -3.1, 2.9],
    [-3.1, 0, 2.75],
    [0, 2.7, 1.9],
    [2.7, 5.4, 1.75],
    [5.4, 8.0, 1.5],
    [8.0, 12.9, 0.9],
    [12.9, HALF, 0.6],
  ],
  // Façade est (gauche = sud) : rampant conservé au sud, centre bas.
  east: [
    [-HALF, -7.5, 9],
    [-7.5, -4, 1.6],
    [-4, 3, 0.8],
    [3, 9, 1.1],
    [9, HALF, 0.55],
  ],
};

function tympanumShape(blocks) {
  const pts = [new THREE.Vector2(-HALF, 0)];
  for (const [a, b, h] of blocks) {
    const n = Math.max(2, Math.ceil((b - a) / 0.5));
    for (let i = 0; i <= n; i++) {
      const s = a + ((b - a) * i) / n;
      pts.push(new THREE.Vector2(s, Math.max(0.05, Math.min(h, tri(s)))));
    }
  }
  pts.push(new THREE.Vector2(HALF, 0));
  // Supprime les doublons exacts consécutifs
  const clean = pts.filter((p, i) => i === 0 || p.distanceTo(pts[i - 1]) > 1e-4);
  return new THREE.Shape(clean);
}

function facadeMatrix(face) {
  const m = new THREE.Matrix4();
  if (face === 'west') m.set(0, 0, -1, -XF + DEPTH, 0, 1, 0, Y_CORNICE_TOP, 1, 0, 0, 0, 0, 0, 0, 1);
  else m.set(0, 0, 1, XF - DEPTH, 0, 1, 0, Y_CORNICE_TOP, -1, 0, 0, 0, 0, 0, 0, 1);
  return m;
}

// Morceau de corniche rampante partant de l'angle z0 (= ±S) vers le faîte, sur la façade de signe sx.
function raking(sx, z0, length) {
  const a = PEDIMENT_SLOPE;
  const dir = -Math.sign(z0);
  const g = new THREE.BoxGeometry(1.6, 0.75, length);
  g.rotateX(dir > 0 ? -a : a);
  const zc = z0 + dir * (length / 2) * Math.cos(a) - dir * Math.sin(a) * 0.375;
  const yc = Y_CORNICE_TOP + (length / 2) * Math.sin(a) + Math.cos(a) * 0.375;
  g.translate(sx * (FX + E.geisonOverhang - 0.8), yc, zc);
  return worldUV(g);
}

export function buildPediments(mat) {
  const tymp = [];
  for (const face of ['west', 'east']) {
    const g = new THREE.ExtrudeGeometry(tympanumShape(PROFILES[face]), { depth: DEPTH, bevelEnabled: false });
    g.applyMatrix4(facadeMatrix(face));
    g.computeVertexNormals();
    tymp.push(worldUV(g));
  }
  const pieces = [
    raking(-1, -S, 2.6), // ouest, angle nord
    raking(-1, S, 2.2), // ouest, angle sud
    raking(1, S, 6.4), // est, angle sud
    box(1.8, 1.25, 2.2, FX - 0.1, Y_CORNICE_TOP + 0.62, -S + 1.3), // est, bloc d'angle nord
  ];
  // Restes du groupe sculpté (copies) à gauche du fronton ouest.
  const statues = [
    new THREE.DodecahedronGeometry(0.8, 0).scale(0.8, 1.25, 0.6).translate(-FX - 0.3, Y_CORNICE_TOP + 1.0, -8.4),
    new THREE.DodecahedronGeometry(0.7, 0).scale(0.7, 1.1, 0.6).translate(-FX - 0.3, Y_CORNICE_TOP + 0.85, -7.2),
    new THREE.DodecahedronGeometry(0.6, 0).scale(1.2, 0.7, 0.6).translate(-FX - 0.3, Y_CORNICE_TOP + 0.45, -10.4),
  ].map((g) => worldUV(g));

  return [mesh(merge(tymp), mat.pediment), mesh(merge(pieces), mat.marble), mesh(merge(statues), mat.ruin)];
}
