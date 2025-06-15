import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const mountainlocation = document.getElementById("mountain-location");

const scene = new THREE.Scene();

// Camera
let camera;
if (window.innerWidth < 600) {
	// Mobile: wider FOV for smaller screens
	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
} else {
	// Large screen: narrower FOV for desktop
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
}
camera.position.set(-2, 4, 6);
// const helper = new THREE.CameraHelper( camera );
// scene.add( helper );

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // black with 0 opacity (transparent)
renderer.setPixelRatio(window.devicePixelRatio);
mountainlocation.appendChild(renderer.domElement);

// Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
directionalLight.position.set(2, 12, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

const sunLight = new THREE.DirectionalLight(0xfff9d8, 0.5);
sunLight.position.set(-2, 10, 5);
sunLight.castShadow = true;
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xddddff, 0x666666, 0.9);
scene.add(hemiLight);

// axesHelper
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// Mountain
const mountainGeo = new THREE.ConeGeometry(4, 3, 12, 256, true);
mountainGeo.translate(0, 3, 0); // Move so base sits on ground

const mountainMat = new THREE.MeshStandardMaterial({
	vertexColors: true,
	flatShading: true,
	transparent: true,
	opacity: 0.9,
	transmission: 0.9,
	roughness: 0.4,
	metalness: 0,
	clearcoat: 1,
	clearcoatRoughness: 0.05,
	reflectivity: 0.5,
	side: THREE.FrontSide,
});

// Color
const pos = mountainGeo.attributes.position;
const colors = new Float32Array(mountainGeo.attributes.position.count * 3);
mountainGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
const colorAttr = mountainGeo.attributes.color;
const color = new THREE.Color();
// Find peak Y
let maxY = -Infinity;
for (let i = 0; i < pos.count; i++) {
	maxY = Math.max(maxY, pos.getY(i));
}
let minY = Infinity;
for (let i = 0; i < pos.count; i++) {
	minY = Math.min(minY, pos.getY(i));
}
// Fill color array based on height (snow on top 10%)
for (let i = 0; i < pos.count; i++) {
	const y = pos.getY(i);
	const t = (y-(0.105*maxY)) / (maxY-(0.1*maxY));
	if (t > 0.62) {
		color.set("#ffffff"); // snow
	} else {
		color.set("#39535c"); // rock
	}
	colorAttr.setXYZ(i, color.r, color.g, color.b);
}
colorAttr.needsUpdate = true;
mountainGeo.computeVertexNormals();

// Flatten the top few vertices
for (let i = 0; i < pos.count; i++) {
	const y = pos.getY(i);
	if (y > maxY-(0.1*maxY)) { // close to peak height
		pos.setY(i, maxY-(0.105*maxY)); // flatten it slightly
	}
}
const maxYMountainFlatten = maxY-(0.1*maxY)-3;
const minYMountainFlatten = minY-3;
// console.log(maxYMountainFlatten, minYMountainFlatten)
pos.needsUpdate = true;
mountainGeo.computeVertexNormals();

// Mountain Mesh
const mountain = new THREE.Mesh(mountainGeo, mountainMat);
mountain.rotation.y = 2*Math.PI;
scene.add(mountain);

// Data
const temperatureData = {1: [6.0, 5.9, 5.8, 5.8, 5.7, 5.7, 5.6, 5.6, 5.5, 5.5, 5.5, 5.4, 5.4, 5.3, 5.3, 5.2, 5.2, 5.2, 5.2, 5.2, 5.1, 5.1, 5.2, 5.2, 5.2, 5.2, 5.2, 5.3, 5.3, 5.3, 5.4], 2: [5.4, 5.4, 5.5, 5.5, 5.5, 5.6, 5.6, 5.6, 5.7, 5.7, 5.8, 5.9, 5.9, 6.0, 6.1, 6.1, 6.2, 6.3, 6.4, 6.4, 6.5, 6.6, 6.7, 6.9, 7.0, 7.1, 7.2, 7.3], 3: [7.4, 7.5, 7.7, 7.8, 7.9, 8.0, 8.1, 8.2, 8.4, 8.5, 8.7, 8.8, 9.0, 9.1, 9.3, 9.5, 9.6, 9.7, 9.9, 10.0, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.8, 11.0, 11.1, 11.3, 11.5], 4: [11.7, 11.9, 12.1, 12.3, 12.5, 12.7, 12.9, 13.1, 13.2, 13.4, 13.6, 13.8, 13.9, 14.1, 14.3, 14.5, 14.6, 14.8, 14.9, 15.1, 15.3, 15.4, 15.6, 15.8, 15.9, 16.1, 16.3, 16.5, 16.7, 16.8], 5: [17.0, 17.1, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 18.0, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.8, 18.9, 19.1, 19.2, 19.4, 19.5, 19.6, 19.7, 19.9, 20.0, 20.1, 20.2, 20.3, 20.3, 20.4], 6: [20.5, 20.6, 20.7, 20.7, 20.8, 20.9, 20.9, 21.0, 21.1, 21.2, 21.2, 21.3, 21.5, 21.6, 21.7, 21.8, 21.9, 22.1, 22.2, 22.3, 22.4, 22.5, 22.7, 22.8, 23.0, 23.2, 23.3, 23.5, 23.7, 23.8], 7: [24.0, 24.2, 24.3, 24.4, 24.6, 24.7, 24.8, 24.9, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.7, 25.8, 25.9, 26.0, 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8, 26.9, 27.0, 27.1, 27.1], 8: [27.2, 27.2, 27.3, 27.3, 27.3, 27.3, 27.3, 27.3, 27.3, 27.3, 27.2, 27.2, 27.1, 27.1, 27.0, 26.9, 26.9, 26.8, 26.8, 26.7, 26.6, 26.6, 26.5, 26.4, 26.3, 26.2, 26.2, 26.1, 26.0, 25.9, 25.8], 9: [25.7, 25.6, 25.5, 25.4, 25.3, 25.2, 25.0, 24.9, 24.7, 24.6, 24.4, 24.2, 24.0, 23.8, 23.6, 23.3, 23.1, 22.9, 22.6, 22.4, 22.2, 21.9, 21.7, 21.5, 21.3, 21.2, 21.0, 20.9, 20.8, 20.6], 10: [20.5, 20.3, 20.2, 20.1, 19.9, 19.7, 19.6, 19.4, 19.2, 19.1, 18.9, 18.7, 18.5, 18.3, 18.1, 17.9, 17.7, 17.5, 17.3, 17.2, 17.0, 16.8, 16.6, 16.5, 16.3, 16.1, 16.0, 15.8, 15.7, 15.5, 15.3], 11: [15.2, 15.0, 14.8, 14.7, 14.5, 14.3, 14.1, 13.9, 13.8, 13.6, 13.4, 13.2, 13.0, 12.8, 12.6, 12.4, 12.2, 12.0, 11.8, 11.6, 11.4, 11.2, 11.1, 10.9, 10.8, 10.6, 10.5, 10.4, 10.2, 10.1], 12: [9.9, 9.8, 9.6, 9.4, 9.3, 9.1, 8.9, 8.8, 8.6, 8.4, 8.3, 8.1, 8.0, 7.9, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.8, 6.7, 6.6, 6.5, 6.4, 6.3, 6.2, 6.1, 6.0]};
const cloudData = {1: [3.7, 3.7, 3.7, 3.8, 3.8, 3.9, 3.9, 4.0, 4.1, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.7, 4.8, 4.8, 4.8, 4.8, 4.8, 4.7, 4.7, 4.6, 4.6, 4.5, 4.5, 4.5, 4.5, 4.5], 2: [4.6, 4.6, 4.7, 4.8, 4.9, 4.9, 5.0, 5.1, 5.1, 5.2, 5.3, 5.3, 5.4, 5.4, 5.4, 5.5, 5.5, 5.5, 5.6, 5.6, 5.6, 5.7, 5.7, 5.8, 5.9, 5.9, 6.0, 6.1], 3: [6.1, 6.1, 6.1, 6.1, 6.1, 6.0, 6.0, 6.0, 5.9, 5.9, 5.9, 5.9, 5.9, 5.9, 5.9, 6.0, 6.0, 6.1, 6.2, 6.3, 6.3, 6.4, 6.4, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.4, 6.4], 4: [6.4, 6.4, 6.4, 6.4, 6.4, 6.5, 6.5, 6.5, 6.6, 6.6, 6.7, 6.7, 6.8, 6.9, 6.9, 6.9, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 6.9, 6.9, 6.8, 6.8, 6.7, 6.7, 6.7, 6.7], 5: [6.7, 6.8, 6.8, 6.9, 7.0, 7.1, 7.2, 7.3, 7.3, 7.4, 7.4, 7.5, 7.5, 7.5, 7.4, 7.4, 7.4, 7.4, 7.3, 7.3, 7.3, 7.3, 7.4, 7.4, 7.5, 7.5, 7.6, 7.7, 7.7, 7.8, 7.8], 6: [7.9, 7.9, 8.0, 8.1, 8.1, 8.2, 8.2, 8.3, 8.4, 8.4, 8.5, 8.5, 8.6, 8.6, 8.6, 8.7, 8.7, 8.7, 8.8, 8.8, 8.8, 8.8, 8.8, 8.8, 8.8, 8.8, 8.7, 8.7, 8.6, 8.6], 7: [8.5, 8.5, 8.4, 8.4, 8.3, 8.3, 8.2, 8.2, 8.2, 8.2, 8.1, 8.1, 8.1, 8.1, 8.1, 8.1, 8.1, 8.1, 8.1, 8.0, 8.0, 8.0, 7.9, 7.9, 7.8, 7.7, 7.7, 7.6, 7.5, 7.5, 7.4], 8: [7.3, 7.3, 7.2, 7.2, 7.2, 7.2, 7.2, 7.3, 7.3, 7.3, 7.3, 7.4, 7.4, 7.4, 7.4, 7.4, 7.4, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.6, 7.6, 7.6, 7.6, 7.6, 7.6], 9: [7.7, 7.7, 7.7, 7.7, 7.7, 7.7, 7.7, 7.8, 7.8, 7.8, 7.8, 7.8, 7.8, 7.8, 7.8, 7.9, 7.9, 7.9, 7.9, 7.9, 7.9, 7.9, 7.9, 7.9, 7.9, 7.9, 7.9, 7.8, 7.8, 7.8], 10: [7.8, 7.8, 7.8, 7.8, 7.8, 7.7, 7.7, 7.7, 7.6, 7.5, 7.5, 7.4, 7.4, 7.3, 7.2, 7.2, 7.1, 7.1, 7.0, 7.0, 6.9, 6.8, 6.7, 6.6, 6.6, 6.5, 6.4, 6.3, 6.2, 6.2, 6.1], 11: [6.1, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 5.9, 5.9, 5.9, 5.9, 5.9, 5.8, 5.8, 5.8, 5.7, 5.7, 5.7, 5.6], 12: [5.6, 5.5, 5.5, 5.4, 5.4, 5.3, 5.2, 5.2, 5.1, 5.1, 5.0, 4.9, 4.8, 4.8, 4.7, 4.7, 4.6, 4.5, 4.5, 4.4, 4.4, 4.3, 4.3, 4.2, 4.1, 4.0, 4.0, 3.9, 3.8, 3.8, 3.7]}
const precipitationData = {1: [1.2, 1.2, 1.2, 1.2, 1.3, 1.3, 1.4, 1.5, 1.6, 1.8, 1.9, 2.0, 2.1, 2.1, 2.2, 2.2, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.2, 2.2, 2.1, 2.0], 2: [2.0, 1.9, 1.8, 1.7, 1.6, 1.6, 1.6, 1.6, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.2, 2.3, 2.4, 2.4, 2.4, 2.5, 2.6, 2.7, 2.8, 3.0, 3.1, 3.3, 3.4], 3: [3.6, 3.7, 3.8, 3.8, 3.9, 3.8, 3.8, 3.7, 3.6, 3.5, 3.4, 3.3, 3.3, 3.2, 3.1, 3.1, 3.1, 3.2, 3.2, 3.3, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9, 4.0, 4.1, 4.3, 4.4, 4.6], 4: [4.7, 4.8, 4.9, 4.9, 5.0, 5.0, 5.0, 5.0, 4.9, 4.9, 4.8, 4.7, 4.7, 4.6, 4.6, 4.5, 4.4, 4.3, 4.3, 4.2, 4.1, 4.0, 4.0, 3.9, 3.8, 3.8, 3.7, 3.7, 3.6, 3.6], 5: [3.6, 3.6, 3.6, 3.6, 3.6, 3.7, 3.7, 3.8, 3.9, 4.0, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0, 5.1, 5.1, 5.1, 5.0, 5.0, 4.9, 4.8, 4.6, 4.5, 4.4], 6: [4.4, 4.5, 4.5, 4.6, 4.8, 5.0, 5.3, 5.5, 5.8, 6.0, 6.2, 6.4, 6.5, 6.6, 6.6, 6.6, 6.6, 6.5, 6.4, 6.3, 6.2, 6.0, 5.9, 5.8, 5.7, 5.6, 5.5, 5.5, 5.6, 5.7], 7: [5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.3, 6.2, 6.1, 6.1, 5.9, 5.8, 5.6, 5.4, 5.2, 5.1, 4.9, 4.7, 4.6, 4.4, 4.3, 4.2, 4.1, 4.0, 3.9, 3.8, 3.7, 3.6, 3.5, 3.4, 3.3], 8: [3.3, 3.3, 3.4, 3.4, 3.5, 3.7, 3.8, 4.0, 4.1, 4.3, 4.5, 4.6, 4.7, 4.9, 5.0, 5.1, 5.2, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.1, 6.2, 6.2, 6.2, 6.3, 6.4], 9: [6.5, 6.6, 6.8, 7.0, 7.2, 7.4, 7.6, 7.7, 7.8, 7.9, 8.0, 8.0, 8.1, 8.1, 8.2, 8.3, 8.4, 8.4, 8.4, 8.4, 8.3, 8.1, 7.9, 7.8, 7.6, 7.4, 7.3, 7.3, 7.3, 7.5], 10: [7.7, 8.0, 8.3, 8.7, 9.0, 9.2, 9.3, 9.4, 9.4, 9.2, 9.0, 8.7, 8.4, 8.1, 7.9, 7.7, 7.5, 7.3, 7.2, 7.0, 6.9, 6.7, 6.6, 6.3, 6.1, 5.7, 5.4, 5.0, 4.7, 4.3, 4.0], 11: [3.7, 3.4, 3.2, 3.1, 3.0, 2.9, 2.9, 2.9, 3.0, 3.1, 3.1, 3.2, 3.2, 3.3, 3.4, 3.4, 3.5, 3.5, 3.6, 3.6, 3.6, 3.6, 3.5, 3.5, 3.4, 3.3, 3.2, 3.1, 3.0, 2.9], 12: [2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 2.0, 1.9, 1.8, 1.7, 1.6, 1.6, 1.5, 1.5, 1.5, 1.5, 1.5, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.5, 1.5, 1.4, 1.4, 1.3]}
const snowData = {1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 11: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 12: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}

const biggerRadius = 4; // slightly smaller than mountain (40)
const biggerHeight = 3;  // slightly smaller than mountain (30)

const monthCount = 12;
const anglePerMonth = (2 * Math.PI) / monthCount;
const coneTip = new THREE.Vector3(0, maxYMountainFlatten+3, 0); // Cone peak

function getMonthColors(data, startColor, endColor) {
	// Compute average for each month
	const monthAverages = [];
	for (let month = 1; month <= 12; month++) {
		const temps = data[month];
		const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
		monthAverages.push(avg);
	}
	// Find min and max average for normalization
	const minAvg = Math.min(...monthAverages);
	const maxAvg = Math.max(...monthAverages);

	// Helper: interpolate between two colors (hex or int)
	function lerpColor(t, c1, c2) {
		// Clamp t to [0,1]
		t = Math.max(0, Math.min(1, t));
		const c1r = (c1 >> 16) & 0xff, c1g = (c1 >> 8) & 0xff, c1b = c1 & 0xff;
		const c2r = (c2 >> 16) & 0xff, c2g = (c2 >> 8) & 0xff, c2b = c2 & 0xff;
		const r = Math.round(c1r + (c2r - c1r) * t);
		const g = Math.round(c1g + (c2g - c1g) * t);
		const b = Math.round(c1b + (c2b - c1b) * t);
		return (r << 16) | (g << 8) | b;
	}

	const c1 = typeof startColor === "string" ? parseInt(startColor.replace("#", ""), 16) : startColor;
	const c2 = typeof endColor === "string" ? parseInt(endColor.replace("#", ""), 16) : endColor;

	return monthAverages.map(avg => {
		// Normalize: 0 (startColor) ... 1 (endColor)
		const t = (maxAvg - minAvg === 0) ? 1 : (avg - minAvg) / (maxAvg - minAvg);
		return lerpColor(t, c1, c2);
	});
}

function createWeatherGraph(data, startColor, endColor) {
	const allPositions = [];
	const allColors = [];

	const monthColors = getMonthColors(data, startColor, endColor);
	const maxTemp = Math.max(...Object.values(data).flat());

	let lastPointPrevMonth = null;

	for (let month = 1; month <= 12; month++) {
		const temps = data[month];
		if (!temps || temps.length < 2) continue;

		const daysCount = temps.length;

		// Base triangle vertices for this month face
		const angle1 = (month - 1) * anglePerMonth;
		const angle2 = month * anglePerMonth;

		const baseLeft = new THREE.Vector3(
			biggerRadius * Math.cos(angle1),
			0,
			biggerRadius * Math.sin(angle1)
		);
		const baseRight = new THREE.Vector3(
			biggerRadius * Math.cos(angle2),
			0,
			biggerRadius * Math.sin(angle2)
		);

		const color = new THREE.Color(monthColors[month - 1]);
		let linePoint = null;

		for (let day = 0; day < daysCount; day++) {
			const t = day / (daysCount - 1);
			// const basePoint = baseLeft.clone().lerp(baseRight, t);
			// const linePoint = basePoint.clone().lerp(coneTip, 0.0);
			// const temp = temps[day];
			// const y = minYMountainFlatten + 
			// 	((maxTemp !== 0 ? temp / maxTemp : temp) * (maxYMountainFlatten - minYMountainFlatten));
			// linePoint.y = y;

			// const x = linePoint.x;
			// const z = linePoint.z;

			const basePoint = baseLeft.clone().lerp(baseRight, t);
			const temp = temps[day];
			const y = minYMountainFlatten + ((maxTemp !== 0 ? temp / maxTemp : temp) * (maxYMountainFlatten - minYMountainFlatten));

			const coneVector = coneTip.clone().sub(basePoint);
			const totalHeight = coneVector.y;
			const alpha = totalHeight !== 0 ? (y - minYMountainFlatten) / totalHeight : 0;

			linePoint = basePoint.clone().lerp(coneTip, alpha);
			linePoint.y = y;
			
			const x = linePoint.x;
			const z = linePoint.z;

			// if (
			// 	Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)
			// ) {
			// 	// Each: [x1, y1, z1]
			// 	allPositions.push(x, y, z);
			// 	// Each color: [r1, g1, b1]
			// 	allColors.push(color.r, color.g, color.b);
			// }

			// For LineSegmentsGeometry, each segment needs two points (start and end)
			if (day > 0) {
				const prevT = (day - 1) / (daysCount - 1);
				// const prevBasePoint = baseLeft.clone().lerp(baseRight, prevT);
				// const prevLinePoint = prevBasePoint.clone().lerp(coneTip, 0.0);
				// const prevTemp = temps[day - 1];
				// const prevY = minYMountainFlatten +
				// 	((maxTemp !== 0 ? prevTemp / maxTemp : prevTemp) * (maxYMountainFlatten - minYMountainFlatten));
				// prevLinePoint.y = prevY;

				// const prevX = prevLinePoint.x;
				// const prevZ = prevLinePoint.z;

				const prevBasePoint = baseLeft.clone().lerp(baseRight, prevT);
				const prevTemp = temps[day-1];
				const prevY = minYMountainFlatten + ((maxTemp !== 0 ? prevTemp / maxTemp : prevTemp) * (maxYMountainFlatten - minYMountainFlatten));

				const coneVector = coneTip.clone().sub(prevBasePoint);
				const totalHeight = coneVector.y;
				const alpha = totalHeight !== 0 ? (prevY - minYMountainFlatten) / totalHeight : 0;

				const prevLinePoint = prevBasePoint.clone().lerp(coneTip, alpha);
				prevLinePoint.y = prevY;

				const prevX = prevLinePoint.x;
				const prevZ = prevLinePoint.z;


				if (
					Number.isFinite(prevX) && Number.isFinite(prevY) && Number.isFinite(prevZ) &&
					Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)
				) {
					// Each segment: [x1, y1, z1, x2, y2, z2]
					allPositions.push(prevX, prevY, prevZ, x, y, z);
					// Each color: [r1, g1, b1, r2, g2, b2]
					allColors.push(color.r, color.g, color.b, color.r, color.g, color.b);
				}
			} else {
				// First point of the month
				if (lastPointPrevMonth) {
					// Connect last point of previous month to first of this month
					const prevX = lastPointPrevMonth.x;
					const prevY = lastPointPrevMonth.y;
					const prevZ = lastPointPrevMonth.z;

					const x = linePoint.x;
					const y = linePoint.y;
					const z = linePoint.z;

					if (
						Number.isFinite(prevX) && Number.isFinite(prevY) && Number.isFinite(prevZ) &&
						Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)
					) {
						allPositions.push(prevX, prevY, prevZ, x, y, z);
						allColors.push(color.r, color.g, color.b, color.r, color.g, color.b);
					}
				}
			}
		}
		lastPointPrevMonth = linePoint.clone();
	}


	// // Geometry and material
	// const lineGeo = new THREE.BufferGeometry();
	// lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(allPositions, 3));
	// lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(allColors, 3));
	// lineGeo.translate(0, 3, 0); // Move so base sits on ground

	// const lineMat = new THREE.LineBasicMaterial({
	// 	vertexColors: true,
	// 	linewidth: 5 // has no effect in most browsers; WebGL limitation
	// });

	// const graph = new THREE.Line(lineGeo, lineMat);

	// return graph;

	// Geometry and material LineSegmentsGeometry
	const lineMat = new LineMaterial({
		color: 0xffffff,
		linewidth: 2.0, // in world units
		vertexColors: true,
		dashed: false,
	});

	const lineSegmentsGeometry = new LineSegmentsGeometry();
	lineSegmentsGeometry.setPositions(allPositions);
	lineSegmentsGeometry.setColors(allColors);

	const graph = new LineSegments2(lineSegmentsGeometry, lineMat);
	graph.computeLineDistances();
	graph.scale.set(1, 1, 1);
	graph.position.y += 3;

	return graph;
}

// Example usage:
const tempGraph = createWeatherGraph(
	temperatureData,
	"#ff9800", // orange (hot)
	"#2196f3"  // blue (cold)
);

// Cloud graph (white to gray)
const cloudGraph = createWeatherGraph(
	cloudData,
	"#ffffff", // white (low)
	"#888888"  // gray (high)
);

// Precipitation graph (light blue to dark blue)
const precipitationGraph = createWeatherGraph(
	precipitationData,
	"#b3e5fc", // light blue (low)
	"#01579b"  // dark blue (high)
);
// Snow graph (light gray to blue)
const snowGraph = createWeatherGraph(
	snowData,
	"#e0e0e0", // light gray (no snow)
	"#1976d2"  // blue (snow)
);

function createTextLabel(text) {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	const fontSize = 64;

	canvas.width = 512;
	canvas.height = 128;

	context.font = `${fontSize}px Inter`;
	context.fillStyle = 'white';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(text, canvas.width / 2, canvas.height / 2);

	const texture = new THREE.CanvasTexture(canvas);
	texture.needsUpdate = true;

	const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
	const sprite = new THREE.Sprite(material);

	// Optional: Scale down
	sprite.scale.set(0.8, 0.2, 1); // Adjust size based on your scene

	return sprite;
}
const tempLabel = createTextLabel("Temperature");
tempLabel.position.set(-0.6, 3, 2.5); // adjust as needed
const cloudLabel = createTextLabel("Cloud Coverage");
cloudLabel.position.set(-0.5, 3.6, 2); // adjust as needed
const precipitationLabel = createTextLabel("Precipitation");
precipitationLabel.position.set(-1, 2.5, 3); // adjust as needed
const snowLabel = createTextLabel("Snow Level");
snowLabel.position.set(-1, 1.8, 3.9); // adjust as needed

const groupGraph = new THREE.Group();
// Add multiple objects to the group
groupGraph.add(tempGraph);
groupGraph.add(cloudGraph);
groupGraph.add(precipitationGraph);
groupGraph.add(snowGraph);
groupGraph.add(tempLabel);
groupGraph.add(cloudLabel);
groupGraph.add(precipitationLabel);
groupGraph.add(snowLabel);
groupGraph.rotation.y = 2 * Math.PI;
scene.add(groupGraph);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0); // Look at mountain peak
controls.maxPolarAngle = Math.PI / 2; // Limit to horizontal and slightly above
controls.minPolarAngle = Math.PI / 5;   // Don’t allow camera to go under
controls.enableZoom = false;
// controls.minDistance = 5;
// controls.maxDistance = 8;
controls.enablePan = false;
controls.enableRotate = false;

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

export function updateSnowCapColor(heightValue) {
	const pos = mountainGeo.attributes.position;
	const colorAttr = mountainGeo.attributes.color;
	const color = new THREE.Color();
	let maxY = -Infinity;
	for (let i = 0; i < pos.count; i++) {
		maxY = Math.max(maxY, pos.getY(i));
	}
	for (let i = 0; i < pos.count; i++) {
		const y = pos.getY(i);
		const t = (y-(0.105*maxY)) / (maxY-(0.1*maxY));
		if (t > heightValue) {
			color.set("#ffffff"); // snow
		} else {
			color.set("#39535c"); // rock
		}
		colorAttr.setXYZ(i, color.r, color.g, color.b);
	}
	colorAttr.needsUpdate = true;
}

// Definition
const transitionSpeed = 0.1; // Controls how smooth the transition is
let snowCapHeight = 0.62;
let targetSnowCapHeight = 0.8;
let cameraTargetX = camera.position.x;
let rotateTargetY = mountain.rotation.y;

// Render loop
function animate() {
	requestAnimationFrame(animate);
  	controls.update();
  	// Interpolate snow height
  	snowCapHeight += (targetSnowCapHeight - snowCapHeight) * transitionSpeed;
  	updateSnowCapColor(snowCapHeight);
	// Camera
	camera.position.x += (cameraTargetX - camera.position.x) * transitionSpeed;
	// Rotation
	mountain.rotation.y += (rotateTargetY - mountain.rotation.y) * transitionSpeed;
	groupGraph.rotation.y += (rotateTargetY - groupGraph.rotation.y) * transitionSpeed;
	// Render
  	renderer.render(scene, camera);
}
animate();

export function updateSnowCap(newValue) {
  targetSnowCapHeight = newValue;
}

export function moveCameraX(newX) {
  cameraTargetX = newX;
}

export function rotateY(newY) {
  rotateTargetY = newY;
}