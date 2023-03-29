import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import nebula from "../imgs/nebula.jpg";
import starts from "../imgs/stars.jpg";

const monkeyUrl = new URL("../assets/monkey.glb", import.meta.url);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(0, 10, 25);
orbit.update();

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const sphereGeometry = new THREE.SphereGeometry(2);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0x0000ff,
  wireframe: false,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.set(-5, 5, -5);
sphere.castShadow = true;

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff);
// scene.add(directionalLight);
// directionalLight.position.set(-10, 10, 0);
// directionalLight.castShadow = true;
// directionalLight.shadow.camera.bottom = -10;
// directionalLight.shadow.camera.left = -10;
// directionalLight.shadow.camera.right = 10;
// directionalLight.shadow.camera.top = 10;

// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
// scene.add(dLightHelper);

// const dLightShadowHelper = new THREE.CameraHelper(
//   directionalLight.shadow.camera
// );
// scene.add(dLightShadowHelper);

const spotLight = new THREE.SpotLight(0xffffff);
scene.add(spotLight);
spotLight.position.set(-30, 30, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

const sightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sightHelper);

// scene.fog = new THREE.Fog(0x000000, 0, 200);
scene.fog = new THREE.FogExp2(0x000000, 0.01);

// renderer.setClearColor(0x333);

const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load(starts);
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  starts,
  nebula,
  nebula,
  nebula,
  nebula,
  nebula,
]);

const box2Geometry = new THREE.BoxGeometry(5, 5, 5);
const box2Material = new THREE.MeshBasicMaterial({
  //   color: 0x00ff00,
  //   map: textureLoader.load(nebula),
});
const box2Multimaterial = [
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(starts) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(starts) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
  new THREE.MeshBasicMaterial({ color: 0x00ffff }),
];
const box2 = new THREE.Mesh(box2Geometry, box2Multimaterial);
scene.add(box2);
box2.position.set(5, 5, 5);
box2.material.map = textureLoader.load(nebula);

const sphere2Geometry = new THREE.SphereGeometry(4);
const sphere2Material = new THREE.ShaderMaterial({
  //   vertexShader: `
  //     void main() {
  //         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //     }
  //   `,
  //   fragmentShader: `
  //     void main() {
  //         gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  //     }
  //   `,
  vertexShader: document.getElementById("vertexShader").textContent,
  fragmentShader: document.getElementById("fragmentShader").textContent,
});
const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);
scene.add(sphere2);
sphere2.position.set(-5, 10, 10);

const assetLoader = new GLTFLoader();
assetLoader.load(
  monkeyUrl.href,
  function (gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(0, 5, 0);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

const gui = new dat.GUI();
const options = {
  sphereColor: 0x0000ff,
  wireframe: false,
  speed: 0.01,

  angle: 0.2,
  penumbra: 0,
  intensity: 1,
};
let sphereFolder = gui.addFolder("Sphere");
sphereFolder.addColor(options, "sphereColor").onChange((e) => {
  sphereMaterial.color.set(e);
});
sphereFolder.add(options, "wireframe").onChange((e) => {
  sphereMaterial.wireframe = e;
});
sphereFolder.add(options, "speed", 0, 0.1);

// add title to the gui
let spotLightFolder = gui.addFolder("Spot Light");
spotLightFolder.add(options, "angle", 0, 1);
spotLightFolder.add(options, "penumbra", 0, 1);
spotLightFolder.add(options, "intensity", 0, 1);

const mousePosition = new THREE.Vector2();
window.addEventListener("mousemove", (e) => {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const raycaster = new THREE.Raycaster();

const sphereId = sphere.id;

let step = 0;

const animate = function (time) {
  box.rotation.x = time / 1000;
  box.rotation.y = time / 1000;

  step += options.speed;
  sphere.position.y = 10 * Math.abs(Math.sin(step));

  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity;
  sightHelper.update();

  raycaster.setFromCamera(mousePosition, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  for (const o of intersects) {
    if (o.object.id === sphereId) {
      o.object.material.color.set(0xff0000);
    }
  }

  renderer.render(scene, camera);
};

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
