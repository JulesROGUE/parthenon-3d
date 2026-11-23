// Petits outils de géométrie : boîtes avec UV « monde » (densité de texture constante) et fusion.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Projette les UV selon l'axe dominant de la normale (u, v en mètres × scale).
export function worldUV(geo, scale = 0.25) {
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i));
    const ny = Math.abs(nor.getY(i));
    const nz = Math.abs(nor.getZ(i));
    let u;
    let v;
    if (nx >= ny && nx >= nz) {
      u = pos.getZ(i);
      v = pos.getY(i);
    } else if (ny >= nz) {
      u = pos.getX(i);
      v = pos.getZ(i);
    } else {
      u = pos.getX(i);
      v = pos.getY(i);
    }
    uv[i * 2] = u * scale;
    uv[i * 2 + 1] = v * scale;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

// Boîte centrée en (x, y, z), éventuellement tournée autour de Y.
export function box(w, h, d, x, y, z, { rotY = 0, scale = 0.25 } = {}) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rotY) g.rotateY(rotY);
  g.translate(x, y, z);
  return worldUV(g, scale);
}

// Normalise puis fusionne (toutes non indexées, attributs position/normal/uv).
export function merge(list) {
  const prepared = list.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) {
      if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k);
    }
    n.clearGroups();
    return n;
  });
  const out = mergeGeometries(prepared, false);
  out.computeBoundingSphere();
  return out;
}

export function mesh(geo, material, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}
