// Lumières : soleil (ombres), ciel/sol (hémisphère) et projecteurs chauds pour la nuit.
import * as THREE from 'three';

export const SUN_DIR = new THREE.Vector3(-0.72, 0.6, -0.36).normalize(); // soleil de fin d'après-midi d'été, ouest-nord-ouest
export const MOON_DIR = new THREE.Vector3(0.45, 0.5, -0.74).normalize();

export function buildLights() {
  const hemi = new THREE.HemisphereLight('#cfe3ff', '#b59e7c', 1.15);

  const sun = new THREE.DirectionalLight('#fff1dc', 3.1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const cam = sun.shadow.camera;
  cam.left = -62;
  cam.right = 62;
  cam.top = 62;
  cam.bottom = -62;
  cam.near = 10;
  cam.far = 420;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  sun.target.position.set(0, 4, 0);

  // Projecteurs au ras du sol (éteints le jour : on garde le même nombre de lumières pour éviter les recompilations).
  const spots = [
    [-62, 0.6, 28],
    [-62, 0.6, -28],
    [62, 0.6, -30],
    [60, 0.6, 30],
    [0, 0.6, 46],
    [0, 0.6, -50],
  ].map(([x, y, z]) => {
    const s = new THREE.SpotLight('#ffc27a', 0, 0, Math.PI / 5.2, 0.55, 0);
    s.position.set(x, y, z);
    s.target.position.set(x * 0.3, 9, z * 0.25);
    return s;
  });

  const group = new THREE.Group();
  group.add(hemi, sun, sun.target);
  for (const s of spots) group.add(s, s.target);

  return {
    group,
    set(night) {
      if (night) {
        hemi.color.set('#3a4a78');
        hemi.groundColor.set('#2a2016');
        hemi.intensity = 0.55;
        sun.color.set('#9fb3e6');
        sun.intensity = 0.35;
        sun.position.copy(MOON_DIR).multiplyScalar(200);
        for (const s of spots) s.intensity = 1.9;
      } else {
        hemi.color.set('#cfe3ff');
        hemi.groundColor.set('#b59e7c');
        hemi.intensity = 1.15;
        sun.color.set('#fff1dc');
        sun.intensity = 3.1;
        sun.position.copy(SUN_DIR).multiplyScalar(200);
        for (const s of spots) s.intensity = 0;
      }
      sun.position.add(sun.target.position);
      return night ? MOON_DIR : SUN_DIR;
    },
  };
}
