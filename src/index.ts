import * as THREE from 'three';
import { KeyDisplay } from './keyDisplay';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; //do poruszania camery 
import { mode } from '../webpack.config';
import { ModelControls } from './modelControls';
const textureLoader = new THREE.TextureLoader()

//SCENE
const scene: THREE.Scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5)); //dodanie osi y

//CAMERA
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 0, 5) //pozycja poziomo = 0, pozycja pionowa ( czy ma być wyżej , czy niżej y =5 , z = 0
camera.lookAt(0,0,0)
//RENDER
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true }) //krawędzie modelu są ostre
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.setPixelRatio(window.devicePixelRatio)


//PODŁOŻE
setFLoor()

//ORBITAL CONTROLS //można dzięki temu poruszać siatką
const control = new OrbitControls(camera, renderer.domElement)
setControl(control)

//ŚWIATŁO PADANIA
setlight()


//ŁADOWANIE MODELU 
var modelControls: ModelControls
new GLTFLoader().load('models/ninja.glb', function (gltf) {
    const model = gltf.scene;
    model.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
    });
    scene.add(model);

    const gltfAnimation: THREE.AnimationClip[] = gltf.animations;
    const mixer = new THREE.AnimationMixer(model); //Odtawrzacz animacji dla danego modelu w scenie
    const animationMap: Map<string, THREE.AnimationAction> = new Map()

    gltfAnimation.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
        animationMap.set(a.name, mixer.clipAction(a))
    })     //każdą animacje z obiektu ( oprócz animacji TPose) zapisz do lokalnej mapy (uporządowane miejsce w pamięci)

    modelControls = new ModelControls(model, mixer, animationMap, control, camera, 'Idle')
})


//CONTROL KEYS - jak klikniemy na przycisk na klawiaturze to ma coś się dziać
const keysPressed = {}
const keyDisplayQueue = new KeyDisplay()
document.addEventListener('keydown', (event) => {
    keyDisplayQueue.down(event.key);
    if (event.ctrlKey && modelControls) {
        modelControls.switchRunToggle()
    }
    else {
        (keysPressed as any)[event.key.toLowerCase()] = true
    }
}, false);

document.addEventListener('keyup', (event) => {
    keyDisplayQueue.up(event.key);
    (keysPressed as any)[event.key.toLowerCase()] = false
}, false);


const clock = new THREE.Clock();
export function animate() {
    let mixerUpdateDelta = clock.getDelta();
    if (modelControls) {
        modelControls.update(mixerUpdateDelta, keysPressed);
    }

    control.update()
    renderer.render(scene, camera) //zmiana modułu
    requestAnimationFrame(animate)
}

export function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
    keyDisplayQueue.setPosition()


}
window.addEventListener('resize', onWindowResize);

class Helper {

    public component(): void {
        const container = document.createElement('div')
        document.body.appendChild(container)
        container.appendChild(renderer.domElement)
        animate() //animacja 
    }
}

new Helper().component()


function setlight() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(- 60, 100, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);

    //background
    scene.background = textureLoader.load("./textures/sky/sky.jpg")
}

function setControl(control: OrbitControls) {
    control.enableDamping = true //dzięki temu operowanie kamerą jest płyniejsze, odczucie wagi w kontroli obrazu. Potrzebne gdy kamera będzie sama się obracać, by nie było za ostrych zmian. 
    control.minDistance = 5 // jak bardzo mogę się przybliżyć do obiektu 
    control.maxDistance = 15  // jak bardzo mogę się odchylić od obiektu 
    control.enablePan = false //wyłączenie obracanie kamery 
    control.maxPolarAngle = Math.PI / 2 - 0.05 //nie wyjdziemy kamerą pod podłoże 
    control.update(); //potrzebne do uruchomenia zmian wyżej, ponieważ OrbitControls wywołuje się podczas inicjacji 
}

function setFLoor() {
    const WIDTH = 80
    const LENGTH = 80

    const grass = textureLoader.load("./textures/grass/Cartoon_green_texture_grass.jpg")
    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512) //kształt powierszchni płaski 
    const material = new THREE.MeshStandardMaterial({ map: grass }) // kolor / materiał powierzchni
    
    material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping
    material.map.repeat.x = material.map.repeat.y = 10

    const floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true //czy materiał ma uzyskać cień ?
    floor.rotation.x = - Math.PI / 2 //to podłoże ma leżeć na osi x 
    scene.add(floor)

}
