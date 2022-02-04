import {
  Scene,
  Mesh,
  PerspectiveCamera,
  WebGLRenderer,
  Clock,
  TorusBufferGeometry,
  ConeGeometry,
  TorusKnotBufferGeometry,
  MeshToonMaterial,
  DirectionalLight,
  TextureLoader,
  NearestFilter,
  Group,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
} from "three";
import * as dat from "dat.gui";
import { gsap } from "gsap";

const params = {
  materialColor: "#fc6d6d",
};

/**
 ** Scene
 */
const scene = new Scene();

/**
 ** Textures
 */

const textureLoader = new TextureLoader();
const gradientTexture = textureLoader.load("/public/assets/textures/3.jpg");
gradientTexture.magFilter = NearestFilter;

/**
 ** Objects
 */
const material = new MeshToonMaterial({
  color: params.materialColor,
  gradientMap: gradientTexture,
});

const objectDisance = 4;

const mesh1 = new Mesh(new TorusBufferGeometry(1, 0.4, 16, 60), material);
const mesh2 = new Mesh(new ConeGeometry(1, 2, 32), material);
const mesh3 = new Mesh(new TorusKnotBufferGeometry(0.8, 0.35, 100, 16), material);

mesh2.position.y = -objectDisance * 1;
mesh3.position.y = -objectDisance * 2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

/**
 ** Particles
 */

const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 10;
  positions[i3 + 1] = objectDisance * 0.5 - Math.random() * objectDisance * sectionMeshes.length;
  positions[i3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new BufferGeometry();
particlesGeometry.setAttribute("position", new BufferAttribute(positions, 3));

const particlesMaterial = new PointsMaterial({
  color: params.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

const particles = new Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 ** Debug
 */
const debug = new dat.GUI({ closed: true, hideable: true });

debug.addColor(params, "materialColor").onChange((color) => {
  material.color.set(color);
  particlesMaterial.color.set(color);
});

/**
 ** Lights
 */
const directionalLight = new DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 ** Cameras
 */
const cameraGroup = new Group();
scene.add(cameraGroup);
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;
cameraGroup.add(camera);

/**
 ** Renderer
 */
const canvas = document.getElementById("webgl");
const renderer = new WebGLRenderer({
  canvas,
  alpha: true,
});

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 ** Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);
  if (newSection !== currentSection) {
    currentSection = newSection;
    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=6",
      z: "+=1.5",
    });
  }
});

const cursor = { x: 0, y: 0 };

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
});

const clock = new Clock();
let prevTime = 0;

function animate() {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.2;
  }

  camera.position.y = (-scrollY / sizes.height) * objectDisance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;

  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 3 * deltaTime;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 3 * deltaTime;

  renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
}

animate();
