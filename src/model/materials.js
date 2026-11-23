// Matériaux partagés : marbre du Pentélique patiné (crème à miel), maçonnerie, ombres des rainures.
import * as THREE from 'three';
import { marbleTexture, ashlarTexture, columnTexture, metopeTexture, ionicFriezeTexture } from '../scene/textures.js';
import { COLUMN } from './dimensions.js';

const NIGHT_GLOW = new THREE.Color('#ff9440');

export function createMaterials() {
  const marbleMap = marbleTexture();
  const ashlarMap = ashlarTexture();
  const footMap = ashlarTexture('#cbbfa8', 'rgba(70,55,35,0.5)');

  const std = (opts) => new THREE.MeshStandardMaterial({ roughness: 0.86, metalness: 0, ...opts });

  const m = {
    marble: std({ color: '#fbf3e4', map: marbleMap }),
    ashlar: std({ color: '#f6ebd8', map: ashlarMap }),
    foundation: std({ color: '#d8ccb4', map: footMap }),
    column: std({ color: '#ffffff', map: columnTexture(COLUMN.drums) }),
    metope: std({ color: '#f7ecd8', map: metopeTexture() }),
    ionic: std({ color: '#f0e2c6', map: ionicFriezeTexture() }),
    groove: std({ color: '#6f5d47', roughness: 1 }),
    mutule: std({ color: '#9c8a70', roughness: 1 }),
  };
  m.ruin = std({ color: '#f1e6d2', map: marbleMap });
  m.pediment = std({ color: '#f5ead6', map: ashlarMap, side: THREE.DoubleSide });

  const glowing = [m.marble, m.ashlar, m.foundation, m.column, m.metope, m.ionic, m.ruin, m.pediment, m.mutule];

  m.setNight = (night) => {
    for (const mat of glowing) {
      mat.emissive.copy(NIGHT_GLOW);
      mat.emissiveIntensity = night ? 0.05 : 0;
    }
  };
  return m;
}
