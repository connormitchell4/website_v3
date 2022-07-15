import './style.css';
import * as THREE from 'three';
//orbit controls

import { threeToCannon, ShapeType } from 'three-to-cannon';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Ammo from "ammo.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { PointLight, Raycaster } from 'three';
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";
//import { Mesh, MeshBasicMaterial, MeshMatcapMaterial, MeshPhongMaterial, MeshStandardMaterial, StaticReadUsage } from 'three';

//scene
const scene = new THREE.Scene();
const scene2 = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 3000);
const camera2 = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 3000);
camera2.position.set(0,2,4);

//cameraphysics





//renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg")
})
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener( "resize", function(){
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    camera2.aspect = width/height;
    camera2.updateProjectionMatrix();
});

//importing custom model from blender with animation


var model, environment, navMap;

const urlModel = new URL("fractal.glb", import.meta.url);
const urlModelEnvironment = new URL("trainstation_edited.glb", import.meta.url);
const urlNavMap = new URL("pathway_train.glb", import.meta.url);
const assetLoader = new GLTFLoader();
assetLoader.load(urlModel.href, function(gltf) {
    model = gltf.scene;
   
    scene.add(model);

    


}, undefined, function(error) {
    console.error(error);

});


assetLoader.load(urlModelEnvironment.href, function(gltf) {
    environment = gltf.scene;
    
    scene2.add(environment);


}, undefined, function(error) {
    console.error(error);

});
if(environment){
    environment.visible = false;
}

assetLoader.load(urlNavMap.href, function(gltf) {
    navMap = gltf.scene;

    navMap.position.y += 2;
    navMap.position.z += 2;
    navMap.position.x -= 1/2;
    navMap.traverse(child => {
        if (child.isMesh) {
          child.material = new THREE.MeshNormalMaterial();
        }
      });
    scene2.add(navMap);
    navMap.visible = false;
})


//using the navmap function
const up = new THREE.Vector3(0.0, 1.0, 0.0);
const down = new THREE.Vector3(0.0, -1.0, 0.0);
const ENABLE_NAVMESH = true

const positionVector = new THREE.Vector3();
const collisionVector = new THREE.Vector3();
const raycaster = new THREE.Raycaster(
  positionVector,
  down,
  0.0,
  10.0
);

let restoreCamPos = new THREE.Vector3();
const useNavMap = (object) => {
    if (!object || !navMap) {
      return;
    }
    
    // Ensure up and down vectors are pointing ±1.0 on Y-axis
    up.normalize();
    down.normalize();
    
    // Read world position of the object
    object.getWorldPosition(positionVector);
    
    // Set collision vector to be a little above the object
    collisionVector.copy(positionVector).add(up.multiplyScalar(2.0));
  
    // Point the raycaster down
    raycaster.set(collisionVector, down);
    
    // See if ray intersects the navmesh
    const hits = raycaster.intersectObject(navMap, true);
    
    if (hits[0]) {
      // If there's an intersection, move cam to its position
      const {point} = hits[0]  
      object.position.y = point.y + 0.5;
      object.position.z = point.z ;
      object.position.x = point.x;
      
      restoreCamPos.copy(object.position);
      
      

    } else {
     
      return ENABLE_NAVMESH ? false : true;
    }
    
    return true;
  };

//animating background based on mouse cursor
document.addEventListener('mousemove', onDocumentMouseMove)

let mouseX = 0
let mouseY = 0
let targetX = 0
let targetY = 0

const windowHalfX = window.innerWidth/2;
const windowHalfY = window.innerHeight /2;

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX)
    mouseY = (event.clientY - windowHalfY)
    
}

//keyboard inputs for camera2
//const controls = new FirstPersonControls(camera2, renderer.domElement)
const controls = new PointerLockControls(camera2, renderer.domElement);
let keys = [];

function onKeyDown(event) {
    keys[event.key] = true;
}
function onKeyUp(event) {
    keys[event.key] = false;
}
document.addEventListener('keydown', onKeyDown)
document.addEventListener("keyup", onKeyUp);
//controls.lookSpeed = 0;
//controls.lookSpeed = .5;
//controls.movementSpeed = 2;
//controls.noFly = true;
//controls.lookVertical = false;


//lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
const ambientLight2 = new THREE.AmbientLight(0xffffff, 1);
const pointLight1 = new THREE.PointLight(0xffffff, 1/16);

pointLight1.position.set(-4.5,7,5.2);
const environmentAmbientLight = new THREE.AmbientLight(0xffffff, 0);
//const environmentPointLight = new THREE.PointLight(0xffffff, 1);
scene.add(ambientLight);
scene2.add(ambientLight2)
scene2.add(pointLight1)



const lighthelper = new THREE.PointLightHelper(pointLight1);
const gridHelper = new THREE.GridHelper(200, 50);
scene2.add(lighthelper);
//scene.add(gridHelper);

//orbit controls
//const controls = new OrbitControls(camera, renderer.domElement);



//clock
var clock = new THREE.Clock();
var x = 0;
var z = 0;
var y = 0;
var w = 0;

//rendering animation function
var random1 = 0.2 * (2*Math.random()-1)
var random2 = 0.2 * (2*Math.random()-1)
var random3 = 0.2 * (2*Math.random()-1) 

//scrolling 

let scrollPos, scrollPercent;
window.addEventListener("scroll", (event) => {
    scrollPos = window.scrollY;
    scrollPercent = 100/3*(scrollPos/window.innerHeight)
    //console.log(scrollPercent)
})




function animate() {
    var delta = clock.getDelta();
    const elaspedTime = clock.getElapsedTime();
    requestAnimationFrame(animate);
    //background fractal
    
    if (model) {
    model.rotation.y = random1 * elaspedTime/12 ;
    model.rotation.z = random2 * elaspedTime/2;
    model.rotation.x =  random3 * elaspedTime;
    if(scrollPercent < 100/3) {
        model.visible = true;
        targetX = mouseX * 0.005;
        targetY = mouseY * -0.005;
        camera.position.set(targetX, targetY, 0)
        
        camera.rotation.x = -scrollPercent/30;
        ambientLight.color.setHSL(1/2*Math.sin(elaspedTime/32+(random1*100))+1/2, 1/2, 1/2);
        
        ambientLight2.intensity = 0;
        renderer.render(scene, camera);
    
    } else {
        renderer.render(scene2, camera2)
    }
}
    if (scrollPercent > 75) {
        
        if(environment) {environment.visible = true;

        }
    } else {
        if(environment) {environment.visible =false;}
    }
    document.getElementById("home").style.opacity = Math.max(0, 1-(scrollPercent/15));
    document.getElementById("background").style.opacity = Math.max(Math.min(1, (scrollPercent-10)/23), 0);
    document.getElementById("projects").style.opacity = Math.max(Math.min(1, (scrollPercent-80)/20), 0);
    ambientLight2.intensity = Math.max(Math.min((scrollPercent-80)/20, 1/8), 0);
    ambientLight.intensity = Math.max(2-scrollPercent*3/50, 0);
    
    if (scrollPercent > 99) {
        //controls.connect()
        controls.lock()
        if (!useNavMap(camera2)) {
           camera2.position.copy(restoreCamPos);
           
          }
            if(keys['w']){
            controls.moveForward(Math.min(x, 0.05));
            x+=0.001;
            } else {
                x = 0;
            }
            if(keys['s']){
            controls.moveForward(-Math.min(y,.05));
            y+=0.001;
            } else {
                y = 0;
            }
            if(keys['a']){
            controls.moveRight(-Math.min(z,.05));
            z+=0.001;
            } else {
                z = 0;
            }
            if(keys['d']){
            controls.moveRight(Math.min(w,.05));
            w+=0.001;
            } else {
                w = 0;
            }

        //controls.handleResize();
    }
    else {
        controls.unlock();
        //controls.disconnect()
    }
    
    // orbit controls
    
    
}

animate();

