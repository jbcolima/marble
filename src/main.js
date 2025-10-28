import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('app');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 2, 4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


scene.add(new THREE.AmbientLight(0xffffff, 0.5));


const spot = new THREE.SpotLight(0xffffff, 7.5, 30, Math.PI / 9, 0.25, 1.0);
spot.position.set(0, 10, 0);
spot.castShadow = true;
spot.shadow.mapSize.set(2048, 2048);
spot.shadow.bias = -0.0006;
spot.shadow.normalBias = 0.02;
spot.shadow.camera.near = 0.5;
spot.shadow.camera.far = 30;
scene.add(spot);

const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
sphereGeometry.setAttribute('uv2', sphereGeometry.attributes.uv.clone());

const loader = new THREE.TextureLoader();
const colorTex = loader.load('/static/textures/marble/marble_0003_color_1k.jpg');
colorTex.colorSpace = THREE.SRGBColorSpace;
colorTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy?.() || 1);

const normalTex = loader.load('/static/textures/marble/marble_0003_normal_opengl_1k.png');
const roughnessTex = loader.load('/static/textures/marble/marble_0003_roughness_1k.jpg');
const aoTex = loader.load('/static/textures/marble/marble_0003_ao_1k.jpg');

[colorTex, normalTex, roughnessTex, aoTex].forEach((t) => {
	if (!t) return;
	t.wrapS = THREE.RepeatWrapping;
	t.wrapT = THREE.RepeatWrapping;
	t.repeat.set(1, 1);
});

const sphereMaterial = new THREE.MeshStandardMaterial({
	color: 0xffffff,
	metalness: 0.0,
	roughness: 0.7,
	map: colorTex,
	normalMap: normalTex,
	roughnessMap: roughnessTex,
	aoMap: aoTex
});

const ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
ball.position.y = 3.4; 
ball.castShadow = true;
scene.add(ball);

spot.target = ball;
scene.add(spot.target);


const planeSize = 8;
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 1, 1);
planeGeometry.setAttribute('uv2', planeGeometry.attributes.uv.clone());

const grassColor = loader.load('/static/textures/grass/color.jpg');
grassColor.colorSpace = THREE.SRGBColorSpace;
const grassNormal = loader.load('/static/textures/grass/normal.jpg');
const grassRoughness = loader.load('/static/textures/grass/roughness.jpg');
const grassAO = loader.load('/static/textures/grass/ambientOcclusion.jpg');

[grassColor, grassNormal, grassRoughness, grassAO].forEach((t) => {
	if (!t) return;
	t.wrapS = THREE.RepeatWrapping;
	t.wrapT = THREE.RepeatWrapping;
	t.repeat.set(4, 4);
});

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
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

function onResize() {
	const width = window.innerWidth;
	const height = window.innerHeight;
	renderer.setSize(width, height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

let lastTime = performance.now();
function animate(now = performance.now()) {
	const dt = Math.min((now - lastTime) / 1000, 0.033);
	lastTime = now;

	ball.rotation.x += 0.6 * dt;
	ball.rotation.y += 0.8 * dt;

	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

onResize();
animate();
