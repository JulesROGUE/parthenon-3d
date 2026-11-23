// Blocs et tambours de colonnes rangés autour du temple (le « lapidarium » visible sur toutes les photos).
import * as THREE from 'three';
import { Y0, CELLA, outlineDistance } from './dimensions.js';
import { rng } from '../scene/textures.js';
import { worldUV } from './geom.js';

export function buildRuins(mat) {
  const r = rng(77);
  const blocks = [];
  const drums = [];
  let guard = 0;
  while (blocks.length < 170 && guard++ < 5000) {
    const x = -95 + r() * 180;
    const z = -62 + r() * 100;
    if (Math.abs(x) < 39 && Math.abs(z) < 20) continue; // temple et degrés
    if (x < -40 && x > -100 && Math.abs(z) < 9) continue; // axe de la vue de la façade ouest
    if (outlineDistance(x, z) > -6) continue;
    if (Math.hypot(x + 60, z + 50) < 16 || Math.hypot(x + 46, z + 27) < 11) continue; // devant les caméras
    // Les blocs se regroupent en rangées (comme sur le site).
    const row = r() < 0.6;
    blocks.push({
      x: row ? Math.round(x / 3) * 3 : x,
      z: row ? Math.round(z / 2.2) * 2.2 : z,
      w: 0.8 + r() * 1.6,
      h: 0.4 + r() * 0.8,
      d: 0.6 + r() * 1.0,
      ry: row ? Math.round(r()) * 0.05 : r() * Math.PI,
    });
    if (r() < 0.14) drums.push({ x: x + 2, z: z + 1.5, h: 0.6 + r() * 0.5, lying: r() < 0.4 });
  }
  // Quelques blocs dans la cella.
  for (let i = 0; i < 14; i++) {
    blocks.push({
      x: -6 + r() * 28,
      z: -7 + r() * 14,
      w: 0.8 + r() * 1.4,
      h: 0.4 + r() * 0.6,
      d: 0.6 + r() * 0.8,
      ry: r() * 0.2,
      y: Y0 + CELLA.floorRise,
    });
  }

  const geo = worldUV(new THREE.BoxGeometry(1, 1, 1), 0.5);
  const im = new THREE.InstancedMesh(geo, mat.ruin, blocks.length);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const col = new THREE.Color();
  const tones = ['#f3e6cc', '#e9d6b3', '#ddc8a2', '#f8f3ea', '#d7cbb6'];
  blocks.forEach((b, i) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), b.ry);
    m4.compose(new THREE.Vector3(b.x, (b.y ?? 0) + b.h / 2, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
    im.setMatrixAt(i, m4);
    im.setColorAt(i, col.set(tones[i % tones.length]));
  });
  im.castShadow = true;
  im.receiveShadow = true;

  const dGeo = new THREE.CylinderGeometry(0.85, 0.85, 1, 20);
  const dm = new THREE.InstancedMesh(dGeo, mat.ruin, Math.max(1, drums.length));
  drums.forEach((d, i) => {
    if (d.lying) q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
    else q.identity();
    m4.compose(new THREE.Vector3(d.x, d.lying ? 0.85 : d.h / 2, d.z), q, new THREE.Vector3(1, d.h, 1));
    dm.setMatrixAt(i, m4);
    dm.setColorAt(i, col.set(tones[(i + 2) % tones.length]));
  });
  dm.count = drums.length;
  dm.castShadow = true;
  dm.receiveShadow = true;
  return [im, dm];
}
