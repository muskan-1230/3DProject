import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

// 1. SCENE & CAMERA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Set starting position at the door for the walkthrough
camera.position.set(12, 2, 5); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// --- TEXTURE LOADER ---
const textureLoader = new THREE.TextureLoader();
const paintingRedTex = textureLoader.load('https://picsum.photos/id/10/200/200'); 
const paintingBlueTex = textureLoader.load('https://picsum.photos/id/20/200/200');

// --- ROOM CONSTRUCTION ---
const wallMat = new THREE.MeshStandardMaterial({ color: 0xe0cda9 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x7a5230 });
const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 10), floorMat);
scene.add(floor);
const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 0.2), wallMat);
backWall.position.set(0, 2.5, -5);
scene.add(backWall);
const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMat);
leftWall.position.set(-10, 2.5, 0);
scene.add(leftWall);
const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMat);
rightWall.position.set(10, 2.5, 0);
scene.add(rightWall);
const ceiling = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }));
ceiling.position.set(0, 5, 0);
scene.add(ceiling);
const door = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 2), new THREE.MeshStandardMaterial({ color: 0x4b2e1e }));
door.position.set(10, 1.5, 2);
scene.add(door);

// --- DRAGGABLE PAINTINGS ---
const draggableObjects = [];
const painting1 = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshStandardMaterial({ map: paintingRedTex }));
painting1.position.set(-4, 3, -4.89);
scene.add(painting1);
draggableObjects.push(painting1);
const painting2 = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshStandardMaterial({ map: paintingBlueTex }));
painting2.position.set(4, 3, -4.89);
scene.add(painting2);
draggableObjects.push(painting2);

// --- LIGHT SWITCH (3D) ---
const switchBox = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
switchBox.position.set(9.8, 1.5, 1.1);
scene.add(switchBox);

// --- FURNITURE ---
const tableMat = new THREE.MeshStandardMaterial({ color: 0x4b2e1e });
const chairMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
function createTable(x, z) {
    const table = new THREE.Mesh(new THREE.BoxGeometry(12, 1, 2), tableMat);
    table.position.set(x, 0.6, z);
    scene.add(table);
}
function createChair(x, z) {
    const chairGroup = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), chairMat);
    seat.position.y = 0.5;
    const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const leg1 = new THREE.Mesh(legGeo, chairMat); leg1.position.set(0.3, 0.25, 0.3);
    const leg2 = new THREE.Mesh(legGeo, chairMat); leg2.position.set(-0.3, 0.25, 0.3);
    const leg3 = new THREE.Mesh(legGeo, chairMat); leg3.position.set(0.3, 0.25, -0.3);
    const leg4 = new THREE.Mesh(legGeo, chairMat); leg4.position.set(-0.3, 0.25, -0.3);
    chairGroup.add(seat, leg1, leg2, leg3, leg4);
    chairGroup.position.set(x, 0, z);
    scene.add(chairGroup);
}

createTable(0, -3); 
createTable(0, 3);  

for (let i = 0; i < 5; i++) {
    const posX = -5 + (i * 2.5);
    createChair(posX, -2); 
    createChair(posX, 2);  
}

// --- 6 CEILING LIGHTS ---
const lights = [];
const lightPositions = [
    [-5, 4.8, -3], [5, 4.8, -3], [0, 4.8, -3],
    [-5, 4.8, 3], [5, 4.8, 3], [0, 4.8, 3]
];
lightPositions.forEach(pos => {
    const light = new THREE.PointLight(0xffffff, 15, 10);
    light.position.set(pos[0], pos[1], pos[2]);
    scene.add(light);
    lights.push(light);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    bulb.position.set(pos[0], pos[1], pos[2]);
    scene.add(bulb);
});
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); 
scene.add(ambientLight);

// --- DRAG CONTROLS ---
const dragControls = new DragControls(draggableObjects, camera, renderer.domElement);
dragControls.addEventListener('dragstart', () => controls.enabled = false);
dragControls.addEventListener('dragend', () => controls.enabled = true);

// --- UI LIGHT SWITCH ---
const btn = document.getElementById('lightSwitch');
let lightsOn = true;
btn.addEventListener('click', () => {
    lightsOn = !lightsOn;
    lights.forEach(l => l.intensity = lightsOn ? 15 : 0);
    btn.innerText = lightsOn ? "Switch Lights OFF" : "Switch Lights ON";
});

// --- CAMERA WALKTHROUGH LOGIC ---
let isWalkthrough = false;
let walkthroughStep = 0;
const walkPoints = [
    { pos: { x: 12, y: 2, z: 5 }, target: { x: 0, y: 2, z: 0 } },   
    { pos: { x: 0, y: 2, z: 5 }, target: { x: 0, y: 2, z: -5 } },  
    { pos: { x: -5, y: 2, z: 0 }, target: { x: -4, y: 3, z: -5 } }, 
    { pos: { x: 5, y: 2, z: 0 }, target: { x: 4, y: 3, z: -5 } },   
    { pos: { x: 12, y: 2, z: 5 }, target: { x: 0, y: 2, z: 0 } }    
];

const walkBtn = document.getElementById('walkthroughBtn');
if (walkBtn) {
    walkBtn.addEventListener('click', () => {
        isWalkthrough = true;
        walkthroughStep = 0;
        controls.enabled = false; 
    });
}

function handleWalkthrough() {
    if (!isWalkthrough) return;
    const currentPoint = walkPoints[walkthroughStep];
    camera.position.lerp(new THREE.Vector3(currentPoint.pos.x, currentPoint.pos.y, currentPoint.pos.z), 0.02);
    const targetVec = new THREE.Vector3(currentPoint.target.x, currentPoint.target.y, currentPoint.target.z);
    controls.target.lerp(targetVec, 0.02);
    if (camera.position.distanceTo(new THREE.Vector3(currentPoint.pos.x, currentPoint.pos.y, currentPoint.pos.z)) < 0.1) {
        walkthroughStep++;
        if (walkthroughStep >= walkPoints.length) {
            isWalkthrough = false;
            controls.enabled = true; 
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (isWalkthrough) {
        handleWalkthrough();
    }
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();