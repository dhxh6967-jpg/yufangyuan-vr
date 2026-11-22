import * as THREE from "three";

const canvas = document.createElement("canvas");
document.body.prepend(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a120c);
scene.fog = new THREE.Fog(0x1a120c, 9, 18);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.08, 40);
camera.rotation.order = "YXZ";

function woodTex(hex, lines) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = hex;
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 70; i++) {
    g.strokeStyle = lines;
    g.globalAlpha = 0.08 + Math.random() * 0.18;
    g.lineWidth = 1 + Math.random() * 2;
    g.beginPath();
    const y = Math.random() * 512;
    g.moveTo(0, y);
    g.bezierCurveTo(140, y + 12, 300, y - 10, 512, y + 4);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const wallMap = woodTex("#6d4630", "#2a160c");
wallMap.repeat.set(2, 1);
const floorMap = woodTex("#3e291c", "#1a0e08");
floorMap.repeat.set(4, 4);
const tableMap = woodTex("#5a341f", "#241208");

const wallMat = new THREE.MeshStandardMaterial({ map: wallMap, roughness: 0.78, metalness: 0.04 });
const floorMat = new THREE.MeshStandardMaterial({ map: floorMap, roughness: 0.55, metalness: 0.05 });
const ceilMat = new THREE.MeshStandardMaterial({ color: 0xcbb89a, roughness: 0.9 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0x2b1b12, roughness: 0.6 });
const clothMat = new THREE.MeshStandardMaterial({ color: 0xd7c4a8, roughness: 0.82 });
const metalMat = new THREE.MeshStandardMaterial({ color: 0x3a342e, metalness: 0.55, roughness: 0.38 });
const tableMat = new THREE.MeshStandardMaterial({ map: tableMap, roughness: 0.42, metalness: 0.08 });

const W = 8.6;
const D = 7.4;
const H = 4.2;

scene.add(new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, D), floorMat).translateY(0.06));
const ceil = new THREE.Mesh(new THREE.BoxGeometry(W, 0.08, D), ceilMat);
ceil.position.y = H;
scene.add(ceil);

function wall(width, height, depth, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
}
wall(W, H, 0.16, 0, H / 2, -D / 2);
wall(W, H, 0.16, 0, H / 2, D / 2);
wall(0.16, H, D, -W / 2, H / 2, 0);
wall(0.16, H, D, W / 2, H / 2, 0);

const base = new THREE.Mesh(new THREE.BoxGeometry(W - 0.2, 0.16, 0.08), trimMat);
base.position.set(0, 0.16, -D / 2 + 0.12);
scene.add(base);

const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.35, 0.08), metalMat);
door.position.set(0, 1.2, D / 2 - 0.12);
scene.add(door);
const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.06), metalMat);
handle.position.set(0.38, 1.15, D / 2 - 0.2);
scene.add(handle);

const table = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.08, 48), tableMat);
table.position.y = 0.78;
table.castShadow = true;
table.receiveShadow = true;
scene.add(table);
const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 0.7, 20), trimMat);
pedestal.position.y = 0.38;
scene.add(pedestal);

for (let i = 0; i < 10; i++) {
  const a = (i / 10) * Math.PI * 2;
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.48), clothMat);
  seat.position.y = 0.48;
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.06), clothMat);
  back.position.set(0, 0.82, -0.21);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), trimMat);
  leg.position.y = 0.24;
  g.add(seat, back, leg);
  g.position.set(Math.sin(a) * 2.25, 0, Math.cos(a) * 2.25);
  g.lookAt(0, 0, 0);
  scene.add(g);
}

scene.add(new THREE.HemisphereLight(0xfff3df, 0x3a2416, 1.05));
const key = new THREE.SpotLight(0xffe1b5, 18, 14, 0.85, 0.4, 1);
key.position.set(0, H - 0.3, 0);
key.target.position.set(0, 0, 0);
key.castShadow = true;
scene.add(key, key.target);
for (const [x, z] of [[-2.4, -1.6], [2.4, -1.6], [-2.4, 1.8], [2.4, 1.8]]) {
  const p = new THREE.PointLight(0xffc98a, 3.2, 9, 2);
  p.position.set(x, H - 0.35, z);
  scene.add(p);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe7c2 }),
  );
  bulb.position.copy(p.position);
  scene.add(bulb);
}

const eye = 1.58;
const pos = new THREE.Vector3(0, eye, 2.55);
let yaw = 0;
let pitch = -0.08;
const keys = new Set();
const speed = 1.7;

function applyPose() {
  camera.position.copy(pos);
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

function collide() {
  const m = 0.35;
  pos.x = Math.max(-W / 2 + m, Math.min(W / 2 - m, pos.x));
  pos.z = Math.max(-D / 2 + m, Math.min(D / 2 - m, pos.z));
  const dist = Math.hypot(pos.x, pos.z);
  const limit = 2.05;
  if (dist < limit && dist > 0.001) {
    pos.x *= limit / dist;
    pos.z *= limit / dist;
  }
  pos.y = eye;
}

function reset() {
  pos.set(0, eye, 2.55);
  yaw = 0;
  pitch = -0.08;
  collide();
  applyPose();
}
reset();
document.getElementById("reset").addEventListener("click", reset);

addEventListener("keydown", (e) => {
  if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].includes(e.code)) {
    keys.add(e.code);
    e.preventDefault();
  }
});
addEventListener("keyup", (e) => keys.delete(e.code));
addEventListener("blur", () => keys.clear());

let dragging = false;
let lx = 0;
let ly = 0;
canvas.addEventListener("pointerdown", (e) => {
  dragging = true;
  lx = e.clientX;
  ly = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointerup", () => { dragging = false; });
canvas.addEventListener("pointercancel", () => { dragging = false; });
canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  yaw -= (e.clientX - lx) * 0.0024;
  pitch -= (e.clientY - ly) * 0.0022;
  pitch = Math.max(-1.05, Math.min(1.05, pitch));
  lx = e.clientX;
  ly = e.clientY;
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  let moving = false;
  if (keys.has("KeyW") || keys.has("ArrowUp")) { pos.addScaledVector(forward, speed * dt); moving = true; }
  if (keys.has("KeyS") || keys.has("ArrowDown")) { pos.addScaledVector(forward, -speed * dt); moving = true; }
  if (keys.has("KeyD") || keys.has("ArrowRight")) { pos.addScaledVector(right, speed * dt); moving = true; }
  if (keys.has("KeyA") || keys.has("ArrowLeft")) { pos.addScaledVector(right, -speed * dt); moving = true; }
  if (moving) collide();
  applyPose();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.__controlsTest = {
  getYaw: () => yaw,
  getSpeed: () => (keys.has("KeyW") || keys.has("KeyA") || keys.has("KeyS") || keys.has("KeyD") ? speed : 0),
  getPos: () => ({ x: pos.x, z: pos.z }),
  setKeys: (codes) => {
    keys.clear();
    for (const code of codes) keys.add(code);
  },
};

renderer.domElement.addEventListener("webglcontextlost", () => {
  const err = document.getElementById("err");
  err.style.display = "block";
  err.textContent = "这个窗口没能启动三维画面。";
});
