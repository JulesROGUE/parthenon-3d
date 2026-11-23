// Ciel en dégradé (shader) avec soleil ou lune, et étoiles pour la nuit.
import * as THREE from 'three';
import { rng } from './textures.js';

export const SKY = {
  day: { top: '#1f5fae', horizon: '#c9dcec', bottom: '#d9d2c2', sun: '#fff3d6', glow: 0.35, disk: 0.99965 },
  night: { top: '#040814', horizon: '#26304f', bottom: '#1a1712', sun: '#dfe6ff', glow: 0.08, disk: 0.99988 },
};

export function buildSky() {
  const uniforms = {
    top: { value: new THREE.Color() },
    horizon: { value: new THREE.Color() },
    bottom: { value: new THREE.Color() },
    sunColor: { value: new THREE.Color() },
    sunDir: { value: new THREE.Vector3(0, 1, 0) },
    glow: { value: 0.3 },
    disk: { value: 0.99965 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sunColor; uniform vec3 sunDir;
      uniform float glow; uniform float disk;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = h > 0.0 ? mix(horizon, top, pow(smoothstep(0.0, 1.0, h), 0.6)) : mix(horizon, bottom, smoothstep(0.0, 0.15, -h));
        float s = max(dot(d, normalize(sunDir)), 0.0);
        col += sunColor * (smoothstep(disk, disk + 0.00012, s) * 1.6 + pow(s, 10.0) * glow);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(4200, 48, 24), mat);
  sky.frustumCulled = false;
  sky.renderOrder = -1;

  const r = rng(909);
  const n = 900;
  const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const y = 0.08 + r() * 0.92;
    const k = Math.sqrt(1 - y * y);
    p.set([Math.cos(a) * k * 3900, y * 3900, Math.sin(a) * k * 3900], i * 3);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: '#ffffff', size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 }));
  stars.visible = false;
  stars.frustumCulled = false;

  return {
    meshes: [sky, stars],
    set(night, dir) {
      const s = night ? SKY.night : SKY.day;
      uniforms.top.value.set(s.top);
      uniforms.horizon.value.set(s.horizon);
      uniforms.bottom.value.set(s.bottom);
      uniforms.sunColor.value.set(s.sun);
      uniforms.glow.value = s.glow;
      uniforms.disk.value = s.disk;
      uniforms.sunDir.value.copy(dir);
      stars.visible = night;
      return s;
    },
  };
}
