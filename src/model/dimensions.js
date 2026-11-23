// Dimensions du Parthénon. 1 unité = 1 mètre.
// Repère : axe long est-ouest = X (façade ouest du côté -X), nord = -Z, sol du plateau à y = 0.
//
// Sources :
//  - Wikipédia (en), « Parthenon » : 69,5 × 30,9 m, temple dorique octastyle périptère, 8 × 17 colonnes,
//    92 métopes (14 par façade, 32 par côté long), courbure du stylobate de 10,3 cm sur 70 m.
//  - Encyclopædia Britannica, « Parthenon » : 30,89 × 69,54 m mesurés sur le degré supérieur, soubassement à trois degrés.
//  - World History Encyclopedia, « Parthenon » : 30,88 × 69,5 m, frontons de 28,55 m pour 3,45 m de haut au centre,
//    métopes d'environ 1,2 × 1,25 m ; l'Acropole mesure environ 300 × 150 m.
//  - Valeurs relevées sur les images de référence (Wikimedia Commons, voir README) : hauteurs de l'ordre,
//    proportions de la cella (plan de Barthélemy, 1832), état ruiné des frontons.

export const STYLOBATE = { length: 69.5, width: 30.88 };

// Crépis : euthynteria (assise de réglage) + 3 degrés.
export const CREPIDOMA = { euthynteria: 0.4, steps: 3, stepHeight: 0.51, tread: 0.7 };
export const Y0 = CREPIDOMA.euthynteria + CREPIDOMA.steps * CREPIDOMA.stepHeight; // dessus du stylobate

// Colonnes doriques (relevé photo : colonne ≈ 3,2 × entablement, diamètre ≈ 1/5,5 de la hauteur).
export const COLUMN = {
  front: 8,
  side: 17,
  height: 10.43, // fût + chapiteau
  shaft: 9.57,
  echinus: 0.5,
  abacus: 0.36,
  abacusWidth: 2.04,
  rBottom: 0.95,
  rTop: 0.74,
  flutes: 20,
  drums: 11,
  edge: 1.0, // distance de l'axe des colonnes d'angle au bord du stylobate
  cornerContraction: 0.6, // entrecolonnement d'angle plus serré
};

// Axes des colonnes d'angle.
export const AX = STYLOBATE.length / 2 - COLUMN.edge; // 33.75
export const AZ = STYLOBATE.width / 2 - COLUMN.edge; // 14.44

// Entablement : architrave + frise + geison ≈ 3,3 m (10,43 + 3,29 ≈ 13,72 m, hauteur de l'ordre).
export const ENTABLATURE = {
  architrave: 1.35,
  frieze: 1.35,
  geison: 0.6,
  faceOffset: 0.85, // nu de l'architrave par rapport à l'axe des colonnes
  depth: 1.75,
  geisonOverhang: 0.75,
  triglyphWidth: 0.84,
};
export const Y_TOP = Y0 + COLUMN.height; // dessus des abaques
export const Y_FRIEZE = Y_TOP + ENTABLATURE.architrave;
export const Y_GEISON = Y_FRIEZE + ENTABLATURE.frieze;
export const Y_CORNICE_TOP = Y_GEISON + ENTABLATURE.geison;

export const METOPES = { front: 14, side: 32 }; // 14 + 14 + 32 + 32 = 92

// Fronton (World History Encyclopedia).
export const PEDIMENT = { length: 28.55, height: 3.45 };
export const PEDIMENT_SLOPE = Math.atan(PEDIMENT.height / (PEDIMENT.length / 2)); // ≈ 13,6°

// Cella (plan mis à l'échelle) : bloc muré, porches hexastyles, refend entre opisthodome et naos.
export const CELLA = {
  halfLength: 24.8,
  halfWidth: 10.4,
  wall: 1.2,
  floorRise: 0.7,
  porchX: 27.6,
  crossWallX: -8.1,
  doorWidth: 4.9,
  doorHeight: 9.6,
};

// Acropole : plateau d'environ 300 × 150 m, jusqu'à 70 m au-dessus de la ville.
export const ACROPOLIS = { wallDrop: 13, base: -62 };

// Contour simplifié du plateau de l'Acropole (x vers l'est, z vers le sud), d'après les vues d'ensemble :
// le temple occupe la moitié sud-est, l'entrée (Propylées) est à l'extrémité ouest.
export const ACROPOLIS_OUTLINE = [
  [-200, -8], [-186, -30], [-152, -48], [-100, -62], [-40, -78], [10, -80], [55, -72], [86, -55],
  [101, -25], [103, 8], [93, 32], [66, 46], [20, 49], [-30, 46], [-80, 40], [-130, 31], [-170, 22], [-193, 10],
];

export function pointInOutline(x, z, poly = ACROPOLIS_OUTLINE) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

// Distance signée au contour (négative à l'intérieur).
export function outlineDistance(x, z, poly = ACROPOLIS_OUTLINE) {
  let d = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[j];
    const [bx, bz] = poly[i];
    const vx = bx - ax;
    const vz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
    const dx = x - (ax + t * vx);
    const dz = z - (az + t * vz);
    d = Math.min(d, Math.hypot(dx, dz));
  }
  return pointInOutline(x, z, poly) ? -d : d;
}
