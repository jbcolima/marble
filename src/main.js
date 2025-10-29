import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import GUI from 'lil-gui';

const container = document.getElementById('app');

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 2, 4);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const spot = new THREE.SpotLight(0xffffff, 8, 30, Math.PI / 6, 0.3, 1.0);
spot.castShadow = true;
spot.shadow.mapSize.set(2048, 2048);
spot.shadow.bias = -0.0005;
spot.shadow.normalBias = 0.02;
scene.add(spot);

// Ground (grass)
const texLoader = new THREE.TextureLoader();
const grassColor = texLoader.load('./static/textures/grass/color.jpg');
grassColor.colorSpace = THREE.SRGBColorSpace;
const grassNormal = texLoader.load('./static/textures/grass/normal.jpg');
const grassRoughness = texLoader.load('./static/textures/grass/roughness.jpg');
const grassAO = texLoader.load('./static/textures/grass/ambientOcclusion.jpg');

[grassColor, grassNormal, grassRoughness, grassAO].forEach((t) => {
  if (t) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4);
  }
});

const planeGeometry = new THREE.PlaneGeometry(8, 8);
planeGeometry.setAttribute('uv2', planeGeometry.attributes.uv.clone());

const grassMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.0,
  roughness: 1.0,
  map: grassColor,
  normalMap: grassNormal,
  roughnessMap: grassRoughness,
  aoMap: grassAO
});

const ground = new THREE.Mesh(planeGeometry, grassMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 🏌️ Parameters
const params = {
  golfScale: 0.01,
  golfHeight: 3.4,
  bounce: 0.2,
  // Spotlight settings
  spotRadius: 5,
  spotHeight: 8,
  spotSpeed: 0.5,
  spotIntensity: 8,
  spotAngle: 30,
  spotPenumbra: 0.3,
  spotSize: 1.0
};

// 🏐 Load golf ball FBX
const fbxLoader = new FBXLoader();
let golf;

const colorTex = texLoader.load('./static/models/golf_ball/golf ball_Bake1_PBR_Diffuse.png');
colorTex.colorSpace = THREE.SRGBColorSpace;
const metalTex = texLoader.load('./static/models/golf_ball/golf ball_Bake1_PBR_Metalness.png');
const roughTex = texLoader.load('./static/models/golf_ball/golf ball_Bake1_PBR_Roughness.png');

fbxLoader.load(
  './static/models/golf_ball/golf_ball.fbx',
  (obj) => {
    golf = obj;
    golf.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshStandardMaterial({
          map: colorTex,
          metalnessMap: metalTex,
          roughnessMap: roughTex,
          metalness: 0.0,
          roughness: 0.35
        });
      }
    });

    golf.scale.set(params.golfScale, params.golfScale, params.golfScale);
    golf.position.set(0, params.golfHeight, 0);
    scene.add(golf);
    spot.target = golf;
  },
  undefined,
  (err) => console.error('Error loading FBX:', err)
);

// 🧰 GUI
const gui = new GUI();
const golfFolder = gui.addFolder('Golf Ball');
golfFolder.add(params, 'golfScale', 0.001, 0.05, 0.001).name('Size').onChange(() => {
  if (golf) golf.scale.set(params.golfScale, params.golfScale, params.golfScale);
});
golfFolder.add(params, 'golfHeight', 0.1, 5, 0.1).name('Height').onChange(() => {
  if (golf) golf.position.y = params.golfHeight;
});
golfFolder.add(params, 'bounce', 0, 1, 0.01).name('Bounce');
golfFolder.open();

const spotFolder = gui.addFolder('Spotlight');
spotFolder.add(params, 'spotRadius', 1, 10, 0.1).name('Orbit Radius');
spotFolder.add(params, 'spotHeight', 2, 15, 0.1).name('Height');
spotFolder.add(params, 'spotSpeed', 0, 3, 0.1).name('Orbit Speed');
spotFolder.add(params, 'spotIntensity', 0, 20, 0.1).name('Intensity').onChange(() => {
  spot.intensity = params.spotIntensity;
});
spotFolder.add(params, 'spotAngle', 5, 90, 1).name('Beam Angle (°)').onChange(() => {
  spot.angle = THREE.MathUtils.degToRad(params.spotAngle);
});
spotFolder.add(params, 'spotPenumbra', 0, 1, 0.01).name('Soft Edge').onChange(() => {
  spot.penumbra = params.spotPenumbra;
});
spotFolder.addColor({ color: '#ffffff' }, 'color').name('Color').onChange((val) => {
  spot.color.set(val);
});
spotFolder.open();

// Resize
function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

// Animation
let lastTime = performance.now();
function animate(now = performance.now()) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;

  if (golf) {
    // Bounce
    const t = performance.now() * 0.002;
    golf.position.y = params.golfHeight + Math.abs(Math.sin(t)) * params.bounce;

    // Circular spotlight orbit
    const orbitT = performance.now() * 0.001 * params.spotSpeed;
    spot.position.x = Math.cos(orbitT) * params.spotRadius;
    spot.position.z = Math.sin(orbitT) * params.spotRadius;
    spot.position.y = params.spotHeight;

    spot.target.position.copy(golf.position);
    spot.target.updateMatrixWorld();
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

onResize();
animate();
