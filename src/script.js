/////////////////////////////////////////////////////////////////////////
///// IMPORT
import './main.css'
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'

/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader()
const loader = new GLTFLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
dracoLoader.setDecoderConfig({ type: 'js' })
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement('div')
document.body.appendChild(container)

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color('#c8f0f9')

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true }) // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding // set color encoding
container.appendChild(renderer.domElement) // add the renderer to the HTML div

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100)
camera.position.set(34, 16, -20)
scene.add(camera)

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(2)
})

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)

/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82)
scene.add(ambient)

const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96)
sunLight.position.set(-69, 44, 14)
scene.add(sunLight)

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
loader.load('models/gltf/sample-maisn.glb', function (gltf) {
    scene.add(gltf.scene)
})

/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
    controls.enabled = false // disable orbit controls to animate the camera

    new TWEEN.Tween(camera.position.set(26, 4, -35)).to({ // from camera position
        x: 16, // desired x position to go
        y: 50, // desired y position to go
        z: -0.1 // desired z position to go
    }, 6500) // time take to animate
        .delay(1000).easing(TWEEN.Easing.Quartic.InOut).start() // define delay, easing
        .onComplete(function () { // on finish animation
            controls.enabled = true // enable orbit controls
            setOrbitControlsLimits() // enable controls limits
            TWEEN.remove(this) // remove the animation from memory
        })
}

introAnimation() // call intro animation on start

/////////////////////////////////////////////////////////////////////////
//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits() {
    controls.enableDamping = true
    controls.dampingFactor = 0.04
    controls.minDistance = 35
    controls.maxDistance = 60
    controls.enableRotate = true
    controls.enableZoom = true
    controls.maxPolarAngle = Math.PI / 2.5
}

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION
function rendeLoop() {
    TWEEN.update() // update animations

    controls.update() // update orbit controls

    renderer.render(scene, camera) // render the scene using the camera

    requestAnimationFrame(rendeLoop) // loop the render function
}

rendeLoop() // start rendering

//////////////////////////////////////////////////
//// GUI CONTROLS FOR LIGHTING AND COLORS
const gui = new GUI()

// create parameters for GUI
const lightParams = {
    dirLightIntensity: sunLight.intensity,
    dirLightColor: sunLight.color.getHex(),
    ambLightIntensity: ambient.intensity,
    ambLightColor: ambient.color.getHex(),
    bgColor: scene.background.getHex()
};

// Function to update colors and intensities
function updateColorsAndIntensities() {
    sunLight.intensity = lightParams.dirLightIntensity;
    sunLight.color.setHex(lightParams.dirLightColor);

    ambient.intensity = lightParams.ambLightIntensity;
    ambient.color.setHex(lightParams.ambLightColor);

    scene.background.setHex(lightParams.bgColor);
}

gui.add(lightParams, 'dirLightIntensity').min(0).max(10).step(0.0001).name('Dir Intensity');
gui.addColor(lightParams, 'dirLightColor').name('Dir Color').onChange(updateColorsAndIntensities);

gui.add(lightParams, 'ambLightIntensity').min(0).max(10).step(0.001).name('Amb Intensity');
gui.addColor(lightParams, 'ambLightColor').name('Amb Color').onChange(updateColorsAndIntensities);

gui.addColor(lightParams, 'bgColor').name('Background Color').onChange(updateColorsAndIntensities);

/////////////////////////////////////////////////////////////////////////
//// TOGGLE DARK MODE
// Add a button for toggling dark mode
const darkModeButton = document.createElement('button');
darkModeButton.textContent = 'Toggle Dark Mode';
document.body.appendChild(darkModeButton);

// Dark mode flag
let isDarkMode = false;

// Function to toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;

    if (isDarkMode) {
        // Dark mode colors
        scene.background = new THREE.Color('#000000'); // Black background
        ambient.color.setHex(0x333333); // Dark ambient light color
        sunLight.color.setHex(0x555555); // Dark directional light color
    } else {
        // Light mode colors
        scene.background = new THREE.Color('#c8f0f9'); // Light blue background
        ambient.color.setHex(0xa0a0fc); // Light ambient light color
        sunLight.color.setHex(0xe8c37b); // Light directional light color
    }

    // Update GUI controls based on the current mode
    updateGUIControls();
}

// Event listener for dark mode button
darkModeButton.addEventListener('click', toggleDarkMode);

// Function to update GUI controls based on the current mode
function updateGUIControls() {
    if (isDarkMode) {
        // Update GUI controls for dark mode
        lightParams.dirLightIntensity = 1.96;
        lightParams.dirLightColor = 0x555555;
        lightParams.ambLightIntensity = 0.82;
        lightParams.ambLightColor = 0x333333;
        lightParams.bgColor = 0x000000;
    } else {
        // Update GUI controls for light mode
        lightParams.dirLightIntensity = 1.96;
        lightParams.dirLightColor = 0xe8c37b;
        lightParams.ambLightIntensity = 0.82;
        lightParams.ambLightColor = 0xa0a0fc;
        lightParams.bgColor = 0xc8f0f9;
    }

    // Update GUI
    gui.updateDisplay();
    // Update colors and intensities in the scene
    updateColorsAndIntensities();
}

// Initial GUI update based on the default (light) mode
updateGUIControls();

/////////////////////////////////////////////////////////////////////////
//// ON MOUSE MOVE TO GET CAMERA POSITION
document.addEventListener('mousemove', (event) => {
    event.preventDefault()

    console.log(camera.position)

}, false)
