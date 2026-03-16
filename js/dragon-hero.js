import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/loaders/GLTFLoader.js";

const hero = document.querySelector(".hero");
const mount = document.getElementById("dragon-hero-canvas");
const loading = document.getElementById("dragon-hero-loading");
const fallback = document.getElementById("dragon-hero-fallback");
const trace = document.querySelector(".hero-dragon-trace");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileViewport = window.matchMedia("(max-width: 760px)");
const lowPowerDevice =
  mobileViewport.matches ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

if (!hero || !mount) {
  throw new Error("Dragon hero mount point was not found.");
}

let renderer;
let scene;
let camera;
let dragonGroup;
let dragonModel;
let placeholderGroup;
let animationFrameId = 0;
let resizeObserver;
let clock;
let startTime = 0;

const state = {
  interactive3d: !lowPowerDevice,
  ready: false,
  failed: false,
};

const setFallback = (reason = "fallback") => {
  state.failed = true;
  hero.classList.add("hero-3d-fallback-active");
  if (fallback) {
    fallback.hidden = false;
    fallback.dataset.reason = reason;
  }
  if (loading) {
    loading.hidden = true;
  }
  if (trace) {
    trace.style.opacity = "0.82";
  }
};

const setLoading = (visible) => {
  if (!loading) {
    return;
  }
  loading.hidden = !visible;
};

const createRenderer = () => {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);
};

const createScene = () => {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x090807, 8, 22);

  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 1.2, 9.5);

  const ambient = new THREE.AmbientLight(0xf2dcc2, 1.4);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xf0d2ad, 2.2);
  keyLight.position.set(4.5, 5.5, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xc25b26, 1.4);
  rimLight.position.set(-6, 2.8, -4);
  scene.add(rimLight);

  const accentLight = new THREE.PointLight(0x4f8f98, 0.8, 20, 2);
  accentLight.position.set(2.8, 1.8, 2.6);
  scene.add(accentLight);

  const floorGlow = new THREE.Mesh(
    new THREE.CircleGeometry(2.8, 48),
    new THREE.MeshBasicMaterial({
      color: 0xb14b1d,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
    })
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.set(1.8, -1.9, -0.8);
  scene.add(floorGlow);
};

const createPlaceholderDragon = () => {
  const placeholder = new THREE.Group();

  const bodyPoints = [];
  for (let index = 0; index < 36; index += 1) {
    const t = index / 35;
    const angle = t * Math.PI * 2.1;
    bodyPoints.push(
      new THREE.Vector3(
        (t - 0.5) * 5.8,
        Math.sin(angle) * 0.75 + Math.cos(t * Math.PI * 4) * 0.12,
        Math.cos(angle) * 0.5
      )
    );
  }

  const bodyCurve = new THREE.CatmullRomCurve3(bodyPoints);
  const bodyGeometry = new THREE.TubeGeometry(bodyCurve, 160, 0.17, 16, false);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a221c,
    roughness: 0.5,
    metalness: 0.24,
    emissive: 0x6f2d11,
    emissiveIntensity: 0.18,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  placeholder.add(body);

  const maneGeometry = new THREE.TorusGeometry(0.34, 0.085, 14, 40);
  const maneMaterial = new THREE.MeshStandardMaterial({
    color: 0xb08a4b,
    roughness: 0.34,
    metalness: 0.42,
    emissive: 0x3c2317,
    emissiveIntensity: 0.14,
  });

  for (let index = 0; index < 7; index += 1) {
    const ring = new THREE.Mesh(maneGeometry, maneMaterial);
    ring.position.set(2.1 - index * 0.52, Math.sin(index * 0.8) * 0.42, 0.08);
    ring.rotation.y = Math.PI / 2 + index * 0.16;
    ring.rotation.x = 0.4 + index * 0.05;
    placeholder.add(ring);
  }

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 24, 24),
    new THREE.MeshStandardMaterial({
      color: 0x201915,
      roughness: 0.46,
      metalness: 0.22,
      emissive: 0x5a2410,
      emissiveIntensity: 0.16,
    })
  );
  head.position.set(2.75, 0.14, 0.16);
  placeholder.add(head);

  const hornMaterial = new THREE.MeshStandardMaterial({
    color: 0xc7a36a,
    roughness: 0.28,
    metalness: 0.36,
  });

  const leftHorn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.42, 12), hornMaterial);
  leftHorn.position.set(2.92, 0.42, 0.2);
  leftHorn.rotation.z = -0.5;
  leftHorn.rotation.x = 0.6;
  placeholder.add(leftHorn);

  const rightHorn = leftHorn.clone();
  rightHorn.position.z = -0.02;
  rightHorn.rotation.z = -0.22;
  placeholder.add(rightHorn);

  const whiskerMaterial = new THREE.MeshBasicMaterial({
    color: 0xe5c89a,
    transparent: true,
    opacity: 0.42,
  });

  const whiskerCurveA = new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.76, 0.1, 0.12),
    new THREE.Vector3(3.42, 0.22, 0.5),
    new THREE.Vector3(3.9, 0.48, 0.2),
  ]);
  const whiskerCurveB = new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.78, 0.02, 0.08),
    new THREE.Vector3(3.26, -0.22, -0.24),
    new THREE.Vector3(3.78, -0.08, -0.5),
  ]);

  const whiskerA = new THREE.Mesh(
    new THREE.TubeGeometry(whiskerCurveA, 40, 0.02, 8, false),
    whiskerMaterial
  );
  const whiskerB = new THREE.Mesh(
    new THREE.TubeGeometry(whiskerCurveB, 40, 0.02, 8, false),
    whiskerMaterial
  );
  placeholder.add(whiskerA, whiskerB);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xb14b1d,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
    })
  );
  glow.position.set(1.2, 0.2, -0.8);
  placeholder.add(glow);

  placeholder.scale.setScalar(0.92);
  placeholderGroup = placeholder;
  dragonGroup = placeholder;
  dragonGroup.position.set(2.9, -0.55, -0.6);
  dragonGroup.rotation.set(-0.05, -0.45, -0.02);
  scene.add(placeholder);
};

const fitScene = () => {
  const bounds = hero.getBoundingClientRect();
  const width = Math.max(bounds.width, 1);
  const height = Math.max(bounds.height, 1);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
};

const applyDragonMaterials = (root) => {
  root.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = false;
    child.receiveShadow = false;

    if (child.material) {
      child.material.side = THREE.FrontSide;
      child.material.envMapIntensity = 1.1;
      child.material.roughness = Math.min(child.material.roughness ?? 0.8, 0.78);
      child.material.metalness = Math.max(child.material.metalness ?? 0.05, 0.12);
    }
  });
};

const placeDragon = (model) => {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  model.position.sub(center);

  const largestDimension = Math.max(size.x, size.y, size.z) || 1;
  const scale = 4.2 / largestDimension;
  model.scale.setScalar(scale);

  dragonGroup = new THREE.Group();
  dragonGroup.position.set(2.9, -0.55, -0.6);
  dragonGroup.rotation.set(-0.05, -0.45, -0.02);

  model.position.y -= 0.35;
  dragonGroup.add(model);
  scene.add(dragonGroup);
};

const loadDragon = async () => {
  const loader = new GLTFLoader();

  try {
    const modelResponse = await fetch("models/dragon.glb", { method: "GET" });
    if (!modelResponse.ok) {
      throw new Error(`dragon.glb request failed with status ${modelResponse.status}`);
    }

    const blob = await modelResponse.blob();
    if (blob.size === 0) {
      throw new Error("dragon.glb exists but is empty (0 bytes).");
    }

    const gltf = await loader.loadAsync("models/dragon.glb");
    dragonModel = gltf.scene;
    applyDragonMaterials(dragonModel);
    placeDragon(dragonModel);
    state.ready = true;
    hero.classList.add("hero-3d-ready");
    setLoading(false);
    if (trace) {
      trace.style.opacity = "0.14";
    }
  } catch (error) {
    console.error("Failed to load dragon.glb", error);
    setLoading(false);
    setFallback("sketchfab-embed");
  }
};

const animateDragon = (elapsed) => {
  if (!dragonGroup) {
    return;
  }

  if (reducedMotion.matches) {
    dragonGroup.position.set(2.7, -0.55, -0.7);
    dragonGroup.rotation.set(-0.03, -0.36, -0.01);
    return;
  }

  const introDuration = 3.4;
  const introProgress = Math.min((elapsed - startTime) / introDuration, 1);
  const eased = 1 - Math.pow(1 - introProgress, 3);

  const from = {
    x: 7.8,
    y: 2.4,
    z: -4.6,
    ry: -1.25,
    rx: -0.18,
    rz: 0.16,
  };

  const to = {
    x: 2.9,
    y: -0.55,
    z: -0.6,
    ry: -0.45,
    rx: -0.05,
    rz: -0.02,
  };

  dragonGroup.position.set(
    THREE.MathUtils.lerp(from.x, to.x, eased),
    THREE.MathUtils.lerp(from.y, to.y, eased),
    THREE.MathUtils.lerp(from.z, to.z, eased)
  );
  dragonGroup.rotation.set(
    THREE.MathUtils.lerp(from.rx, to.rx, eased),
    THREE.MathUtils.lerp(from.ry, to.ry, eased),
    THREE.MathUtils.lerp(from.rz, to.rz, eased)
  );

  if (introProgress >= 1) {
    const idleTime = elapsed - startTime - introDuration;
    dragonGroup.position.y = to.y + Math.sin(idleTime * 1.15) * 0.08;
    dragonGroup.position.x = to.x + Math.cos(idleTime * 0.45) * 0.05;
    dragonGroup.rotation.z = to.rz + Math.sin(idleTime * 0.9) * 0.016;
    dragonGroup.rotation.y = to.ry + Math.sin(idleTime * 0.5) * 0.045;
  }
};

const render = () => {
  animationFrameId = requestAnimationFrame(render);
  const elapsed = clock.getElapsedTime();

  animateDragon(elapsed);
  renderer.render(scene, camera);
};

const handleResize = () => {
  if (!renderer || !camera) {
    return;
  }
  fitScene();
};

const destroyScene = () => {
  cancelAnimationFrame(animationFrameId);
  resizeObserver?.disconnect();
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
  }
};

const init = async () => {
  if (!state.interactive3d) {
    setFallback("mobile");
    return;
  }

  if (!window.WebGLRenderingContext) {
    setFallback("no-webgl");
    return;
  }

  createRenderer();
  createScene();
  fitScene();

  resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(hero);

  clock = new THREE.Clock();
  startTime = 0;

  await loadDragon();

  if (!state.failed) {
    render();
  }
};

reducedMotion.addEventListener?.("change", () => {
  if (!state.failed && dragonGroup) {
    hero.classList.toggle("hero-3d-reduced", reducedMotion.matches);
  }
});

window.addEventListener("beforeunload", destroyScene, { once: true });

init();
