// Le rocher de l'Acropole et Athènes autour : plateau ceint de murs verticaux, pentes rocheuses
// puis boisées (pins, oliviers, cyprès), ville blanche et montagnes bleutées à l'horizon.
import * as THREE from 'three';
import { ACROPOLIS, ACROPOLIS_OUTLINE, outlineDistance } from '../model/dimensions.js';
import { groundTexture, ashlarTexture, cityTextures, rng } from './textures.js';

const WALL_DEPTH = 22;

function hash(x, z) {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}
function smoothNoise(x, z) {
  return (
    Math.sin(x * 0.021 + 1.3) * Math.cos(z * 0.017 - 0.7) * 0.5 +
    Math.sin(x * 0.047 - z * 0.039 + 2.1) * 0.3 +
    Math.sin(x * 0.11 + z * 0.093) * 0.2
  );
}
const smooth = (a, b, t) => {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

// Hauteur du terrain hors du plateau (le plateau lui-même est à y = 0).
export function terrainHeight(x, z) {
  const sd = outlineDistance(x, z);
  if (sd < 0) return -ACROPOLIS.wallDrop - 4;
  const n = smoothNoise(x, z);
  // Pied des murs à -13 m, éboulis rocheux jusqu'à -36 m, puis pente boisée jusqu'à la ville (-62 m).
  const h = -ACROPOLIS.wallDrop - 23 * smooth(0, 22, sd) - 26 * smooth(20, 130, sd) + n * 2.5 * smooth(0, 8, sd);
  return Math.max(ACROPOLIS.base + n * 1.5, h);
}

export function groundHeightAt(x, z) {
  return outlineDistance(x, z) < 0 ? 0 : terrainHeight(x, z);
}

function plateau() {
  const shape = new THREE.Shape(ACROPOLIS_OUTLINE.map(([x, z]) => new THREE.Vector2(x, z)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: WALL_DEPTH, bevelEnabled: false });
  g.rotateX(Math.PI / 2);
  const top = groundTexture();
  top.repeat.set(1 / 24, 1 / 24);
  const wallTex = ashlarTexture('#e6dccb', 'rgba(80,66,48,0.3)');
  wallTex.repeat.set(1 / 5, 1 / 5);
  const mats = [
    new THREE.MeshLambertMaterial({ color: '#e8dfcd', map: top }),
    new THREE.MeshLambertMaterial({ color: '#f2e6cf', map: wallTex }),
  ];
  const m = new THREE.Mesh(g, mats);
  m.receiveShadow = true;
  return m;
}

function hillside() {
  const SEG = 240;
  const HALF = 1100;
  const P = 1.9;
  const coords = Array.from({ length: SEG + 1 }, (_, i) => {
    const t = -1 + (2 * i) / SEG;
    return HALF * Math.sign(t) * Math.abs(t) ** P;
  });
  const n = (SEG + 1) * (SEG + 1);
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const c = new THREE.Color();
  const rock = new THREE.Color('#c2b39c');
  const rock2 = new THREE.Color('#a69580');
  const dry = new THREE.Color('#9c9668');
  const green = new THREE.Color('#5f7140');
  const town = new THREE.Color('#bdb6a8');
  let k = 0;
  for (let j = 0; j <= SEG; j++) {
    for (let i = 0; i <= SEG; i++) {
      const x = coords[i];
      const z = coords[j];
      const h = terrainHeight(x, z);
      pos[k * 3] = x;
      pos[k * 3 + 1] = h;
      pos[k * 3 + 2] = z;
      const sd = outlineDistance(x, z);
      const r = hash(x, z);
      c.copy(rock).lerp(rock2, r);
      const vegetation = smooth(14, 40, sd) * (1 - smooth(130, 190, sd));
      c.lerp(dry.clone().lerp(green, 0.35 + 0.5 * (smoothNoise(x * 2, z * 2) * 0.5 + 0.5)), vegetation);
      c.lerp(town, smooth(150, 210, sd));
      col[k * 3] = c.r;
      col[k * 3 + 1] = c.g;
      col[k * 3 + 2] = c.b;
      k++;
    }
  }
  const idx = [];
  for (let j = 0; j < SEG; j++) {
    for (let i = 0; i < SEG; i++) {
      const a = j * (SEG + 1) + i;
      const b = a + 1;
      const d = a + SEG + 1;
      const e = d + 1;
      idx.push(a, d, b, b, d, e);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
  m.receiveShadow = true;
  return m;
}

function trees() {
  const r = rng(303);
  const crowns = [];
  const cypress = [];
  let guard = 0;
  while ((crowns.length < 900 || cypress.length < 70) && guard++ < 40000) {
    const a = r() * Math.PI * 2;
    const d = 60 + r() * 260;
    const x = -50 + Math.cos(a) * d * 1.25;
    const z = Math.sin(a) * d;
    const sd = outlineDistance(x, z);
    if (sd < 16 || sd > 175) continue;
    const y = terrainHeight(x, z);
    if (r() < 0.08 && cypress.length < 70) cypress.push({ x, y, z, s: 1 + r() * 0.4, h: 8 + r() * 5 });
    else if (crowns.length < 900) crowns.push({ x, y, z, s: 2.4 + r() * 3, h: 2 + r() * 2.5 });
  }
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  const greens = ['#4d6a34', '#5d7a3c', '#6f7f4a', '#3f5a2e', '#7a8752'];
  const crownMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), crowns.length);
  crowns.forEach((t, i) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 6);
    m4.compose(new THREE.Vector3(t.x, t.y + t.h * 0.7, t.z), q, new THREE.Vector3(t.s, t.h, t.s));
    crownMesh.setMatrixAt(i, m4);
    crownMesh.setColorAt(i, c.set(greens[i % greens.length]));
  });
  const cone = new THREE.ConeGeometry(1, 1, 7);
  cone.translate(0, 0.5, 0);
  const cyp = new THREE.InstancedMesh(cone, new THREE.MeshLambertMaterial({ color: '#2f4a26', flatShading: true }), cypress.length);
  cypress.forEach((t, i) => {
    m4.compose(new THREE.Vector3(t.x, t.y - 0.5, t.z), new THREE.Quaternion(), new THREE.Vector3(t.s * 1.3, t.h, t.s * 1.3));
    cyp.setMatrixAt(i, m4);
  });
  return [crownMesh, cyp];
}

function city() {
  const r = rng(404);
  const { map, emissive } = cityTextures();
  const geo = new THREE.BoxGeometry(1, 1, 1);
  geo.translate(0, 0.5, 0);
  // Toits : coin uni de la texture (pas de fenêtres).
  const uv = geo.attributes.uv;
  for (let i = 8; i < 16; i++) uv.setXY(i, 0.985, 0.985);
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff', map, emissive: new THREE.Color('#ffb24d'), emissiveMap: emissive, emissiveIntensity: 0 });
  const items = [];
  for (let gx = -1150; gx <= 1150; gx += 34) {
    for (let gz = -1150; gz <= 1150; gz += 30) {
      const x = gx + (r() - 0.5) * 8;
      const z = gz + (r() - 0.5) * 8;
      const dist = Math.hypot(x + 40, z);
      if (dist > 1150 || r() < 0.12) continue;
      const sd = outlineDistance(x, z);
      if (sd < 165) continue;
      items.push({ x, z, w: 14 + r() * 16, d: 12 + r() * 14, h: 9 + r() * 16 + (dist > 700 ? r() * 10 : 0) });
    }
  }
  const im = new THREE.InstancedMesh(geo, mat, items.length);
  const m4 = new THREE.Matrix4();
  const c = new THREE.Color();
  const tones = ['#f4f1ea', '#ece6da', '#e6e2da', '#f2e9d8', '#dcd6cc', '#efe4cf'];
  items.forEach((b, i) => {
    m4.compose(new THREE.Vector3(b.x, ACROPOLIS.base - 0.5, b.z), new THREE.Quaternion(), new THREE.Vector3(b.w, b.h, b.d));
    im.setMatrixAt(i, m4);
    im.setColorAt(i, c.set(tones[i % tones.length]));
  });
  im.receiveShadow = false;
  return { mesh: im, material: mat };
}

function mountains() {
  const g = new THREE.CylinderGeometry(2600, 2600, 1, 160, 1, true);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const a = Math.atan2(z, x);
    if (pos.getY(i) > 0) {
      const h = 140 + 120 * Math.sin(a * 3 + 0.5) + 60 * Math.sin(a * 7 + 1.7) + 30 * Math.sin(a * 17);
      pos.setY(i, ACROPOLIS.base + Math.max(25, h));
    } else pos.setY(i, ACROPOLIS.base - 5);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: '#8592a3', side: THREE.DoubleSide }));
}

export function buildTerrain() {
  const group = new THREE.Group();
  group.name = 'terrain';
  group.add(plateau(), hillside(), ...trees(), mountains());
  const c = city();
  group.add(c.mesh);
  return {
    group,
    setNight(night) {
      c.material.emissiveIntensity = night ? 1.6 : 0;
    },
  };
}
