import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

// 1. SCENE & CAMERA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 8, 20); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace; 
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// ==================================================
// WALKTHROUGH SYSTEM
// ==================================================

let walkthroughMode = false;

const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

const moveSpeed = 0.15;
const mouseSensitivity = 0.002;

let yaw = 0;
let pitch = 0;

camera.rotation.order = "YXZ";

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
});

window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
});

document.addEventListener("mousemove", (e) => {

    if (!walkthroughMode) return;

    yaw -= e.movementX * mouseSensitivity;
    pitch -= e.movementY * mouseSensitivity;

    pitch = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, pitch)
    );

    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
});

function updateWalkthrough() {

    if (!walkthroughMode) return;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);

    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(
        forward,
        new THREE.Vector3(0, 1, 0),
        forward
    ).normalize();

    if (keys.w)
        camera.position.add(
            forward.clone().multiplyScalar(moveSpeed)
        );

    if (keys.s)
        camera.position.add(
            forward.clone().multiplyScalar(-moveSpeed)
        );

    if (keys.a)
        camera.position.add(
            right.clone().multiplyScalar(-moveSpeed)
        );

    if (keys.d)
        camera.position.add(
            right.clone().multiplyScalar(moveSpeed)
        );

    // Eye level
    camera.position.y = 1.8;

    // Room boundaries
    camera.position.x = Math.max(
        -roomWidth / 2 + 1,
        Math.min(roomWidth / 2 - 1, camera.position.x)
    );

    camera.position.z = Math.max(
        -roomDepth / 2 + 1,
        Math.min(roomDepth / 2 - 1, camera.position.z)
    );
}

// --- TEXTURE LOADER ---
const textureLoader = new THREE.TextureLoader();

// Using a clean, high-res seamless marble texture from an open source repository (No Watermarks)
const marbleTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg'); 
// Since most marble links are blocked by CORS, we use a refined material approach to make it look like marble
const floorTex = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg');
floorTex.wrapS = THREE.RepeatWrapping;
floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(4, 4);

const tvImageTex = textureLoader.load('https://picsum.photos/id/0/800/450');

// --- ROOM CONSTRUCTION ---
const wallMat = new THREE.MeshStandardMaterial({ color: 0xdddddd }); 
const floorMat = new THREE.MeshStandardMaterial({ 
    map: floorTex, 
    roughness: 0.05, 
    metalness: 0.4,
    color: 0xffffff 
}); 
const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

const roomWidth = 30;
const roomDepth = 20;
const roomHeight = 10;

const floor = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 0.2, roomDepth), floorMat);
scene.add(floor);

const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, roomHeight, 0.2), wallMat);
backWall.position.set(0, roomHeight/2, -roomDepth/2);
scene.add(backWall);

const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, roomHeight, roomDepth), wallMat);
leftWall.position.set(-roomWidth/2, roomHeight/2, 0);
scene.add(leftWall);

const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, roomHeight, roomDepth), wallMat);
rightWall.position.set(roomWidth/2, roomHeight/2, 0);
scene.add(rightWall);

const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(13, roomHeight, 0.2), wallMat);
frontWallLeft.position.set(-8.5, roomHeight/2, roomDepth/2);
scene.add(frontWallLeft);

const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(13, roomHeight, 0.2), wallMat);
frontWallRight.position.set(8.5, roomHeight/2, roomDepth/2);
scene.add(frontWallRight);

const frontWallTop = new THREE.Mesh(new THREE.BoxGeometry(4, roomHeight - 3.5, 0.2), wallMat);
frontWallTop.position.set(0, (roomHeight - 3.5)/2 + 3.5, roomDepth/2);
scene.add(frontWallTop);

const ceiling = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 0.2, roomDepth), ceilingMat);
ceiling.position.set(0, roomHeight, 0);
scene.add(ceiling);

// --- THE DOOR ---
const doorPivot = new THREE.Group();
doorPivot.position.set(0, 0, roomDepth/2);
scene.add(doorPivot);
const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 3.5, 0.2), new THREE.MeshStandardMaterial({ color: 0x222222 }));
doorMesh.position.set(2, 1.75, 0);
doorPivot.add(doorMesh);

// --- TV SCREEN WITH SWITCH ---
const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 0.3), new THREE.MeshStandardMaterial({ color: 0x000000 }));
tvFrame.position.set(0, 4, -roomDepth/2 + 0.2);
scene.add(tvFrame);

const tvScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(6.6, 3.6), 
    new THREE.MeshBasicMaterial({ color: 0x000000 }) // Start OFF (Black)
);
tvScreen.position.set(0, 4, -roomDepth/2 + 0.36);
scene.add(tvScreen);

// --- POTTED PLANTS ---
function createPlant(x, z) {
    const plantGroup = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.6), new THREE.MeshStandardMaterial({color: 0x5c4033}));
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), new THREE.MeshStandardMaterial({color: 0x2d5a27}));
    leaves.position.y = 0.6;
    plantGroup.add(pot, leaves);
    plantGroup.position.set(x, 0.3, z);
    scene.add(plantGroup);
}
createPlant(-roomWidth/2 + 1.5, -roomDepth/2 + 1.5);
createPlant(roomWidth/2 - 1.5, -roomDepth/2 + 1.5);
createPlant(-roomWidth/2 + 1.5, roomDepth/2 - 1.5);
createPlant(roomWidth/2 - 1.5, roomDepth/2 - 1.5);

// --- CORNER LAMPS ---
const lampPositions = [
    [-roomWidth/2 + 1, 0, -roomDepth/2 + 1], [roomWidth/2 - 1, 0, -roomDepth/2 + 1],
    [-roomWidth/2 + 1, 0, roomDepth/2 - 1], [roomWidth/2 - 1, 0, roomDepth/2 - 1]
];
const cornerLights = [];
lampPositions.forEach(pos => {
    const lampGroup = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.2), new THREE.MeshStandardMaterial({color: 0xaa8800}));
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4), new THREE.MeshStandardMaterial({color: 0xaa8800}));
    pole.position.y = 2;
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 0.8), new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xffccaa}));
    shade.position.y = 4;
    lampGroup.add(base, pole, shade);
    lampGroup.position.set(pos[0], 0, pos[2]);
    scene.add(lampGroup);
    const l = new THREE.PointLight(0xffaa00, 20, 8);
    l.position.set(pos[0], 4, pos[2]);
    scene.add(l);
    cornerLights.push(l);
});

// --- FURNITURE & MUGS ---
const tableMat = new THREE.MeshStandardMaterial({ color: 0x4a4e69 });
const chairMat = new THREE.MeshStandardMaterial({ color: 0x22223b });
const mugMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const draggableObjects = [];

function createTable(x, z) {
    const table = new THREE.Mesh(new THREE.BoxGeometry(18, 1, 3), tableMat);
    table.position.set(x, 0.6, z);
    scene.add(table);
}
function createChair(x, z) {
    const chairGroup = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), chairMat);
    seat.position.y = 0.5;
    const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const legs = [[0.3,0.25,0.3], [-0.3,0.25,0.3], [0.3,0.25,-0.3], [-0.3,0.25,-0.3]];
    legs.forEach(p => {
        const leg = new THREE.Mesh(legGeo, chairMat);
        leg.position.set(p[0], p[1], p[2]);
        chairGroup.add(leg);
    });
    chairGroup.add(seat);
    chairGroup.position.set(x, 0, z);
    scene.add(chairGroup);
}
function createMug(x, y, z) {
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.3, 16), mugMat);
    mug.position.set(x, y, z);
    scene.add(mug);
    draggableObjects.push(mug);
}

createTable(0, -5); createTable(0, 5);  
for (let i = 0; i < 5; i++) {
    const posX = -6 + (i * 3);
    createChair(posX, -3); createMug(posX, 1.1, -5); 
    createChair(posX, 3); createMug(posX, 1.1, 5);  
}

// --- SQUARE CEILING PANELS ---
const mainLights = [];
const panelPositions = [[-8, roomHeight - 0.1, -5], [0, roomHeight - 0.1, -5], [8, roomHeight - 0.1, -5], [-8, roomHeight - 0.1, 5], [0, roomHeight - 0.1, 5], [8, roomHeight - 0.1, 5]];

panelPositions.forEach(pos => {
    const light = new THREE.PointLight(0xffffff, 80, 20); 
    light.position.set(pos[0], pos[1] - 0.5, pos[2]);
    scene.add(light);
    mainLights.push(light);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    panel.rotation.x = Math.PI / 2;
    panel.position.set(pos[0], roomHeight - 0.11, pos[2]);
    scene.add(panel);
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
scene.add(ambientLight);

// --- CONTROLS & TRIGGER ---
const dragControls = new DragControls(draggableObjects, camera, renderer.domElement);
dragControls.addEventListener('dragstart', () => controls.enabled = false,dragControls.enabled = false);
dragControls.addEventListener('dragend', () => controls.enabled = true,dragControls.enabled = true);

let lightsOn = false;
mainLights.forEach(l => l.intensity = 0);
cornerLights.forEach(l => l.intensity = 0);

const btn = document.getElementById('lightSwitch');
btn.addEventListener('click', () => {
    lightsOn = !lightsOn;
    mainLights.forEach(l => l.intensity = lightsOn ? 80 : 0);
    cornerLights.forEach(l => l.intensity = lightsOn ? 20 : 0);
    btn.innerText = lightsOn ? "Switch Lights OFF" : "Switch Lights ON";
});

// ==================================================
// WALKTHROUGH BUTTON
// ==================================================

const walkthroughBtn =
    document.getElementById("walkthroughBtn");

walkthroughBtn.addEventListener("click", () => {

    walkthroughMode = !walkthroughMode;

    if (walkthroughMode) {

        controls.enabled = false;

        camera.position.set(
            0,
            1.8,
            roomDepth / 2 - 2
        );

        yaw = camera.rotation.y;
        pitch = camera.rotation.x;

        renderer.domElement.requestPointerLock();

        walkthroughBtn.innerText =
            "Exit Walkthrough";

    } else {

        controls.enabled = true;

        document.exitPointerLock();

        walkthroughBtn.innerText =
            "Start Walkthrough";
    }
});

document.addEventListener(
    "pointerlockchange",
    () => {

        if (
            document.pointerLockElement !==
                renderer.domElement &&
            walkthroughMode
        ) {

            walkthroughMode = false;
            controls.enabled = true;

            walkthroughBtn.innerText =
                "Start Walkthrough";
        }
    }
);

// TV SWITCH LOGIC
let tvOn = false;
const tvBtn = document.getElementById('tvSwitch');
if(tvBtn) {
    tvBtn.addEventListener('click', () => {
        tvOn = !tvOn;
        if (tvOn) {
            tvScreen.material = new THREE.MeshBasicMaterial({ map: tvImageTex });
            tvBtn.innerText = "Turn TV OFF";
        } else {
            tvScreen.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
            tvBtn.innerText = "Turn TV ON";
        }
    });
}

let hasEntered = false;
function checkTrigger() {
    if (!hasEntered && camera.position.z < roomDepth/2) {
        hasEntered = true;
        lightsOn = true;
        mainLights.forEach(l => l.intensity = 80);
        cornerLights.forEach(l => l.intensity = 20);
        if(btn) btn.innerText = "Switch Lights OFF";
        doorPivot.rotation.y = -Math.PI / 2; 
    }
}

function animate() {

    requestAnimationFrame(animate);

    checkTrigger();

    updateWalkthrough();

    if (!walkthroughMode) {
        controls.update();
    }

    renderer.render(scene, camera);
}
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
