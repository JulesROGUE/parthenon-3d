// Orchestration : scène, caméra, OrbitControls, rendu à la demande, transitions, visite guidée, jour/nuit.
// Aucune boucle requestAnimationFrame permanente : on ne redessine que lorsque quelque chose change.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createRenderer } from './renderer.js';
import { buildLights } from './lights.js';
import { buildSky } from './sky.js';
import { buildTerrain, groundHeightAt } from './terrain.js';
import { buildParthenon } from '../model/parthenon.js';
import { VIEWPOINTS } from '../viewpoints.js';

const FOG = { day: '#c9dcec', night: '#1d2440' };
const TRANSITION_MS = 1200;

export function createExperience(container, { view = 'angle', night = false, onTourStop } = {}) {
  const renderer = createRenderer(container);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(FOG.day, 160, 2600);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 6000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.minDistance = 8;
  controls.maxDistance = 900;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  controls.screenSpacePanning = false;
  controls.zoomSpeed = 1.2;

  const lights = buildLights();
  const sky = buildSky();
  const terrain = buildTerrain();
  const temple = buildParthenon();
  scene.add(lights.group, ...sky.meshes, terrain.group, temple.group);

  // ---- rendu à la demande -------------------------------------------------
  let frame = 0;
  function clampCamera() {
    const t = controls.target;
    t.x = THREE.MathUtils.clamp(t.x, -320, 320);
    t.z = THREE.MathUtils.clamp(t.z, -320, 320);
    t.y = THREE.MathUtils.clamp(t.y, 0, 60);
    const floor = groundHeightAt(camera.position.x, camera.position.z) + 1.6;
    if (camera.position.y < floor) camera.position.y = floor;
  }
  function render() {
    frame = 0;
    clampCamera();
    camera.lookAt(controls.target);
    renderer.render(scene, camera);
  }
  function requestRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  controls.addEventListener('change', requestRender);

  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestRender();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  // ---- points de vue et transitions courtes -----------------------------------
  let anim = 0;
  function cancelAnim() {
    if (anim) cancelAnimationFrame(anim);
    anim = 0;
  }
  function goTo(id, animate = true) {
    const v = VIEWPOINTS.find((p) => p.id === id) || VIEWPOINTS[0];
    stopTour(false);
    cancelAnim();
    const toPos = new THREE.Vector3(...v.position);
    const toTarget = new THREE.Vector3(...v.target);
    if (!animate) {
      camera.position.copy(toPos);
      controls.target.copy(toTarget);
      controls.update();
      return;
    }
    const fromPos = camera.position.clone();
    const fromTarget = controls.target.clone();
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / TRANSITION_MS);
      const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
      camera.position.lerpVectors(fromPos, toPos, e);
      controls.target.lerpVectors(fromTarget, toTarget, e);
      render();
      anim = k < 1 ? requestAnimationFrame(step) : 0;
      if (!anim) controls.update();
    };
    anim = requestAnimationFrame(step);
  }

  // ---- visite guidée (désactivée par défaut, lancée par un bouton) ---------------
  let tour = 0;
  let tourAngle = 0;
  let last = 0;
  function tourStep(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tourAngle += dt * 0.1;
    const r = 105;
    controls.target.set(0, 8, 0);
    camera.position.set(Math.cos(tourAngle) * r, 26 + Math.sin(tourAngle * 2) * 8, Math.sin(tourAngle) * r * 0.82);
    render();
    tour = requestAnimationFrame(tourStep);
  }
  function startTour() {
    cancelAnim();
    if (tour) return;
    const p = camera.position;
    tourAngle = Math.atan2(p.z / 0.82, p.x);
    last = performance.now();
    tour = requestAnimationFrame(tourStep);
  }
  function stopTour(notify = true) {
    if (!tour) return;
    cancelAnimationFrame(tour);
    tour = 0;
    if (notify && onTourStop) onTourStop();
  }
  controls.addEventListener('start', () => {
    cancelAnim();
    stopTour(true);
  });

  // ---- jour / nuit ------------------------------------------------------------
  function setNight(on) {
    const dir = lights.set(on);
    sky.set(on, dir);
    temple.materials.setNight(on);
    terrain.setNight(on);
    scene.fog.color.set(on ? FOG.night : FOG.day);
    renderer.toneMappingExposure = on ? 1.15 : 1.0;
    requestRender();
  }

  // ---- première image complète dès le chargement ----------------------------------
  setNight(night);
  goTo(view, false);
  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  render();

  return {
    goTo,
    setNight,
    setTour(on) {
      if (on) startTour();
      else stopTour(false);
    },
    dispose() {
      cancelAnim();
      stopTour(false);
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
