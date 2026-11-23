// Colonnes doriques : fût cannelé (20 cannelures) avec galbe, échine et abaque ; péristyle 8 × 17 et porches.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { COLUMN, AX, AZ, Y0, CELLA } from './dimensions.js';
import { rng } from '../scene/textures.js';

// Fût cannelé : rayon décroissant + léger galbe (entasis), cannelures concaves à arêtes vives.
function flutedShaft(height, rBottom, rTop, flutes, withTexV = true) {
  const radial = flutes * 4;
  const g = new THREE.CylinderGeometry(1, 1, height, radial, 14, true);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const t = (pos.getY(i) + height / 2) / height;
    const R = rBottom + (rTop - rBottom) * t + 0.018 * Math.sin(Math.PI * t);
    const theta = Math.atan2(x, z);
    let phase = (theta / (Math.PI * 2)) * flutes;
    phase -= Math.floor(phase);
    const r = R * (1 - 0.05 * Math.sin(Math.PI * phase));
    pos.setXYZ(i, Math.sin(theta) * r, t * height, Math.cos(theta) * r);
    if (withTexV) uv.setY(i, t * (COLUMN.shaft / COLUMN.height));
  }
  g.computeVertexNormals();
  return g;
}

export function doricColumnGeometry() {
  const { shaft, echinus, abacus, abacusWidth, rBottom, rTop, flutes, height } = COLUMN;
  const s = flutedShaft(shaft, rBottom, rTop, flutes);
  // Échine : profil évasé avec annelets, du sommet du fût jusqu'à l'abaque.
  const prof = [
    [rTop * 0.97, 0],
    [rTop + 0.03, 0.03],
    [rTop + 0.01, 0.07],
    [rTop + 0.04, 0.1],
    [rTop + 0.02, 0.14],
    [rTop + 0.1, 0.2],
    [rTop + 0.2, 0.28],
    [abacusWidth / 2 - 0.06, 0.4],
    [abacusWidth / 2 - 0.02, echinus],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const e = new THREE.LatheGeometry(prof, 48);
  e.translate(0, shaft, 0);
  const uvE = e.attributes.uv;
  for (let i = 0; i < uvE.count; i++) uvE.setY(i, 0.93 + uvE.getY(i) * 0.03);
  const a = new THREE.BoxGeometry(abacusWidth, abacus, abacusWidth);
  a.translate(0, height - abacus / 2, 0);
  const uvA = a.attributes.uv;
  for (let i = 0; i < uvA.count; i++) uvA.setXY(i, uvA.getX(i) * 0.25, 0.965 + uvA.getY(i) * 0.03);
  const geo = mergeGeometries([s, e, a].map((g) => g.toNonIndexed()), false);
  geo.computeBoundingSphere();
  return geo;
}

export function shaftOnlyGeometry() {
  const g = flutedShaft(1, COLUMN.rBottom, COLUMN.rBottom - 0.05, COLUMN.flutes, false);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * 0.25);
  return g;
}

// Axes avec contraction d'angle : intervalle courant a, intervalles extrêmes a - contraction.
function axes(n, half, contraction) {
  const a = (2 * half + 2 * contraction) / (n - 1);
  const c = a - contraction;
  const out = [-half];
  for (let i = 1; i < n; i++) out.push(out[i - 1] + (i === 1 || i === n - 1 ? c : a));
  return out;
}

export function peristylePositions() {
  const xs = axes(COLUMN.side, AX, COLUMN.cornerContraction);
  const zs = axes(COLUMN.front, AZ, COLUMN.cornerContraction);
  const list = [];
  for (const z of zs) list.push({ x: -AX, z, side: 'west' }, { x: AX, z, side: 'east' });
  for (const x of xs.slice(1, -1)) list.push({ x, z: -AZ, side: 'north' }, { x, z: AZ, side: 'south' });
  return { list, xs, zs };
}

const WARM = ['#fcf2de', '#f8ebd0', '#f4e3c2', '#faeed8', '#f2deb8'];
const RESTORED = '#fbf8f1';

export function buildColumns(mat) {
  const r = rng(5);
  const geo = doricColumnGeometry();
  const { list } = peristylePositions();
  const mesh = new THREE.InstancedMesh(geo, mat.column, list.length);
  const m4 = new THREE.Matrix4();
  const col = new THREE.Color();
  list.forEach((p, i) => {
    m4.makeRotationY(r() * Math.PI * 2);
    m4.setPosition(p.x, Y0, p.z);
    mesh.setMatrixAt(i, m4);
    const restored = p.side === 'north' ? r() < 0.35 : r() < 0.08;
    col.set(restored ? RESTORED : WARM[Math.floor(r() * WARM.length)]);
    mesh.setColorAt(i, col);
  });
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Porches hexastyles (colonnes plus fines, sur la plate-forme surélevée de la cella).
  const porchZ = axes(6, CELLA.halfWidth - 0.5, 0);
  const sx = 0.9;
  const sy = 0.99;
  const porch = [];
  const partial = [];
  for (const z of porchZ) porch.push({ x: -CELLA.porchX, z });
  porchZ.forEach((z, i) => {
    if (i === 1 || i === 4) porch.push({ x: CELLA.porchX, z, white: true });
    else partial.push({ x: CELLA.porchX, z, h: [3.2, 0, 5.1, 2.4, 0, 4.2][i] });
  });
  const porchMesh = new THREE.InstancedMesh(geo, mat.column, porch.length);
  porch.forEach((p, i) => {
    m4.makeScale(sx, sy, sx);
    m4.setPosition(p.x, Y0 + CELLA.floorRise, p.z);
    porchMesh.setMatrixAt(i, m4);
    col.set(p.white ? RESTORED : WARM[i % WARM.length]);
    porchMesh.setColorAt(i, col);
  });
  porchMesh.castShadow = true;
  porchMesh.receiveShadow = true;

  const stumps = new THREE.InstancedMesh(shaftOnlyGeometry(), mat.column, partial.length);
  partial.forEach((p, i) => {
    m4.makeScale(sx, p.h, sx);
    m4.setPosition(p.x, Y0 + CELLA.floorRise, p.z);
    stumps.setMatrixAt(i, m4);
    col.set(i % 2 ? RESTORED : WARM[2]);
    stumps.setColorAt(i, col);
  });
  stumps.castShadow = true;
  stumps.receiveShadow = true;

  return { meshes: [mesh, porchMesh, stumps], porchZ, sx, sy };
}
