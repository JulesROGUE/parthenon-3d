// Textures générées en code (CanvasTexture) : aucune image téléchargée.
import * as THREE from 'three';

// Générateur pseudo-aléatoire déterministe (mulberry32) pour un rendu identique à chaque lancement.
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function finish(c, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

function speckle(ctx, w, h, r, n, colors, alpha, size = [1, 3]) {
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = alpha * (0.4 + r() * 0.6);
    ctx.fillStyle = colors[Math.floor(r() * colors.length)];
    const s = size[0] + r() * (size[1] - size[0]);
    ctx.beginPath();
    ctx.ellipse(r() * w, r() * h, s, s * (0.5 + r()), r() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Marbre patiné (1 répétition = 4 m) : base claire, taches dorées, coulures verticales.
export function marbleTexture() {
  const [c, ctx] = canvas(512, 512);
  const r = rng(11);
  ctx.fillStyle = '#f1ebdf';
  ctx.fillRect(0, 0, 512, 512);
  speckle(ctx, 512, 512, r, 260, ['#e3cfa8', '#dbc196', '#ece0c6', '#d6bb8f'], 0.18, [10, 40]);
  for (let i = 0; i < 90; i++) {
    ctx.globalAlpha = 0.05 + r() * 0.08;
    ctx.fillStyle = r() < 0.7 ? '#b48a55' : '#8c7a66';
    const x = r() * 512;
    ctx.fillRect(x, r() * 512, 2 + r() * 6, 30 + r() * 160);
  }
  speckle(ctx, 512, 512, r, 1600, ['#a8977f', '#f8f4ec', '#c8b28c'], 0.22, [0.6, 2]);
  ctx.globalAlpha = 1;
  return finish(c);
}

// Appareil de pierre (blocs réguliers) : 1 répétition = 4 m ; assises de 0,5 m, blocs de 1,33 m.
export function ashlarTexture(base = '#e3d8c4', joint = 'rgba(90,70,45,0.45)') {
  const [c, ctx] = canvas(512, 512);
  const r = rng(23);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  speckle(ctx, 512, 512, r, 200, ['#dcc8a2', '#d3ba90', '#f2ebdd', '#c8b190'], 0.18, [8, 34]);
  speckle(ctx, 512, 512, r, 1400, ['#9c8a73', '#f8f4ec'], 0.22, [0.6, 1.8]);
  ctx.strokeStyle = joint;
  ctx.lineWidth = 2;
  const course = 64; // 0,5 m
  for (let y = 0; y <= 512; y += course) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
    const off = (y / course) % 2 ? 85 : 0;
    for (let x = off; x < 512; x += 170) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + course);
      ctx.stroke();
    }
  }
  return finish(c);
}

// Colonnes : u = tour du fût, v = hauteur ; joints de tambours et coulures verticales.
export function columnTexture(drums = 11) {
  const [c, ctx] = canvas(256, 1024);
  const r = rng(37);
  ctx.fillStyle = '#f2ecdf';
  ctx.fillRect(0, 0, 256, 1024);
  speckle(ctx, 256, 1024, r, 220, ['#e2cca3', '#d9bd8f', '#ece0c6'], 0.2, [8, 30]);
  for (let i = 0; i < 70; i++) {
    ctx.globalAlpha = 0.05 + r() * 0.1;
    ctx.fillStyle = r() < 0.75 ? '#b08451' : '#7d6c58';
    ctx.fillRect(r() * 256, r() * 1024, 2 + r() * 5, 60 + r() * 300);
  }
  speckle(ctx, 256, 1024, r, 1500, ['#a3907a', '#faf6ef'], 0.22, [0.5, 1.6]);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(95,75,50,0.22)';
  const shaftPart = 9.57 / 10.43; // la texture couvre le fût, le chapiteau garde le haut
  for (let i = 1; i <= drums; i++) {
    const y = 1024 - (i / drums) * shaftPart * 1024;
    ctx.fillRect(0, y - 1, 256, 2);
  }
  return finish(c);
}

// Métope : relief très érodé (deux silhouettes indistinctes) dans un cadre.
export function metopeTexture() {
  const [c, ctx] = canvas(256, 256);
  const r = rng(53);
  ctx.fillStyle = '#e2d6bf';
  ctx.fillRect(0, 0, 256, 256);
  speckle(ctx, 256, 256, r, 80, ['#cdb58c', '#bfa47a', '#efe5d2'], 0.3, [6, 22]);
  ctx.filter = 'blur(3px)';
  ctx.fillStyle = 'rgba(135,110,78,0.32)';
  // Deux corps en lutte, très usés.
  ctx.beginPath();
  ctx.ellipse(92, 120, 26, 70, -0.35, 0, Math.PI * 2);
  ctx.ellipse(168, 140, 30, 62, 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(250,244,232,0.35)';
  ctx.beginPath();
  ctx.ellipse(86, 112, 12, 46, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';
  speckle(ctx, 256, 256, r, 700, ['#8a765e', '#f6f0e4'], 0.4, [0.6, 2]);
  ctx.strokeStyle = 'rgba(90,70,45,0.5)';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 250);
  return finish(c, false);
}

// Frise ionique (procession) vue du porche ouest : silhouettes stylisées, 1 répétition = 6 m.
export function ionicFriezeTexture() {
  const [c, ctx] = canvas(1024, 256);
  const r = rng(71);
  ctx.fillStyle = '#d9cbb0';
  ctx.fillRect(0, 0, 1024, 256);
  ctx.fillStyle = 'rgba(110,88,60,0.55)';
  for (let x = 30; x < 1024; x += 128) {
    // cavalier : cheval (ellipse + pattes) et cavalier (buste)
    const y = 150 + r() * 10;
    ctx.beginPath();
    ctx.ellipse(x + 40, y, 42, 22, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 82, y - 30, 12, 22, 0.6, 0, Math.PI * 2);
    ctx.fill();
    for (const lx of [8, 22, 58, 72]) ctx.fillRect(x + lx, y + 12, 7, 62 + r() * 6);
    ctx.beginPath();
    ctx.ellipse(x + 40, y - 42, 11, 30, 0.1, 0, Math.PI * 2);
    ctx.arc(x + 42, y - 80, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  speckle(ctx, 1024, 256, r, 1500, ['#8a765e', '#f6f0e4'], 0.35, [0.6, 2]);
  ctx.fillStyle = 'rgba(90,70,45,0.45)';
  ctx.fillRect(0, 0, 1024, 10);
  ctx.fillRect(0, 246, 1024, 10);
  return finish(c);
}

// Sol du plateau : calcaire clair, rocher affleurant, terre et touffes sèches (1 répétition = 24 m).
export function groundTexture() {
  const [c, ctx] = canvas(512, 512);
  const r = rng(91);
  ctx.fillStyle = '#d9d3c6';
  ctx.fillRect(0, 0, 512, 512);
  speckle(ctx, 512, 512, r, 160, ['#c9c0ae', '#e4dfd3', '#c2b59b', '#cfc7b6'], 0.45, [12, 48]);
  speckle(ctx, 512, 512, r, 90, ['#a89c80', '#9c9176'], 0.35, [10, 30]);
  speckle(ctx, 512, 512, r, 60, ['#8f8c5c', '#a39d68'], 0.35, [4, 14]);
  ctx.strokeStyle = 'rgba(110,95,70,0.35)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 40; i++) {
    let x = r() * 512;
    let y = r() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (r() - 0.5) * 40;
      y += (r() - 0.5) * 40;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  speckle(ctx, 512, 512, r, 2500, ['#8d8169', '#efe8da', '#a99a7c'], 0.45, [0.6, 2.2]);
  return finish(c);
}

// Façades d'immeubles : mur clair, fenêtres sombres le jour ; carte d'émission pour les fenêtres éclairées la nuit.
// Le coin supérieur droit (u, v > 0,9) reste uni : on y projette les toits.
export function cityTextures() {
  const r = rng(101);
  const [c, ctx] = canvas(256, 256);
  const [e, ectx] = canvas(256, 256);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);
  ectx.fillStyle = '#000000';
  ectx.fillRect(0, 0, 256, 256);
  for (let y = 12; y < 228; y += 36) {
    for (let x = 10; x < 226; x += 30) {
      ctx.fillStyle = r() < 0.3 ? '#b4bcc3' : '#99a3ac';
      ctx.fillRect(x, y, 16, 20);
      ctx.fillStyle = '#d9d4cc';
      ctx.fillRect(x - 3, y + 20, 22, 4); // balcon
      if (r() < 0.42) {
        ectx.fillStyle = r() < 0.7 ? '#ffc477' : '#ffe3b0';
        ectx.fillRect(x, y, 16, 20);
      }
    }
  }
  const map = finish(c, false);
  const emissive = finish(e, false);
  return { map, emissive };
}
