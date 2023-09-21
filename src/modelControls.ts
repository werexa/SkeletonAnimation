import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { W, S, DIRECTIONS, A, D } from './keyDisplay';

export class ModelControls {

    model: THREE.Group
    mixer: THREE.AnimationMixer
    animationsMap: Map<string, THREE.AnimationAction> = new Map()
    control: OrbitControls
    camera: THREE.Camera

    //stan
    toggleRun: boolean = true
    currentAction: string

    //temp
    walkDirection = new THREE.Vector3()
    rotateAngle = new THREE.Vector3(0, 1, 0)
    rotateQuarternion: THREE.Quaternion = new THREE.Quaternion()
    cameraTarget = new THREE.Vector3()

    //stałe
    fadeDuration: number = 0.2
    runVelocity = 5
    walkVelocity = 2

    constructor(
        model: THREE.Group,
        mixer: THREE.AnimationMixer,
        animationsMap: Map<string, THREE.AnimationAction>,
        control: OrbitControls,
        camera: THREE.Camera,
        currentAction: string
    ) {
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        this.control = control
        this.camera = camera

        this.animationsMap.forEach((value, key) => {
            if (key == currentAction) {
                value.play()
            }
        })

        this.updateCameraTarget(0,0)


    }
    //Wyłączenie animacji biegania
    public switchRunToggle() {
        this.toggleRun = !this.toggleRun
    }

    //aktualizacja animacji
    public update(delta: number, keysPressed: any) {
        const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true) // sprawdzenie który zostal wcisniety klawisz w s a d

        //Ktore poruszanie kliknąć
        var play = '';
        if (directionPressed && this.toggleRun) {
            play = 'Run'
        }
        else if (directionPressed) {
            play = 'Walk'
        }
        else if(keysPressed[' ']){
            play = 'Jump'
        }
        else {
            play = 'Idle'
        }

        
        if (this.currentAction != play) { //zeby nie zmieniać tej samej akcji poruszania
            const toPlay = this.animationsMap.get(play)
            const current = this.animationsMap.get(this.currentAction)

            current.fadeOut(this.fadeDuration)
            if(play == 'Jump'){
                toPlay.reset().fadeIn(this.fadeDuration).setLoop(THREE.LoopOnce, 1)
                toPlay.clampWhenFinished = true;
                toPlay.play()
            }
            else{
                toPlay.reset().fadeIn(this.fadeDuration).play()
            }

            this.currentAction = play
        }

        this.mixer.update(delta)



        if (this.currentAction == 'Run' || this.currentAction == 'Walk') {

             //zmiana kąta patrzenia kamery
            var Y_cameraDirection = Math.atan2(
                (this.camera.position.x - this.model.position.x),
                (this.camera.position.z - this.model.position.z))

            //zmiana kierunku przemieszczenia obiektu
            var directionOffset = this.directionOffset(keysPressed)

            //obrocenie modelu
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle,Y_cameraDirection + directionOffset )
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2)


            //wyliczenie kierunku
            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.x *=-1
            this.walkDirection.z *=-1
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)

            //run/ walk prędkosc
            const velocity = this.currentAction == "Run" ? this.runVelocity : this.walkVelocity

            // move model & camera
            const moveX = this.walkDirection.x * velocity * delta
            const moveZ = this.walkDirection.z * velocity * delta
            this.model.position.x += moveX
            this.model.position.z += moveZ

            this.updateCameraTarget(moveX, moveZ)
       
        }

    }

    private updateCameraTarget(moveX: number, moveZ: number) {
        // move camera
        this.camera.position.x += moveX
        this.camera.position.z += moveZ

        // update camera target
        this.cameraTarget.x = this.model.position.x
        this.cameraTarget.y = this.model.position.y + 1
        this.cameraTarget.z = this.model.position.z
        this.control.target = this.cameraTarget
    }

    // //Kierunek przemieszczenia obiektu
    private directionOffset(keysPressed: any) {
        var directionOffset = Math.PI // w

        if (keysPressed[W]) {
            if (keysPressed[A]) {
                directionOffset = -3*Math.PI / 4// a + w
            } else if (keysPressed[D]) {
                directionOffset = 3*Math.PI / 4// d + w
            }
        } else if (keysPressed[S]) {
            if (keysPressed[A]) {
                directionOffset = -Math.PI/4// a+s
            } else if (keysPressed[D]) {
                directionOffset = Math.PI / 4  // d+s
            } else {
                directionOffset = 0 // s
            }
        } else if (keysPressed[A]) {
            directionOffset = - Math.PI / 2 // a
        } else if (keysPressed[D]) {
            directionOffset = Math.PI / 2 // d
        }

        return directionOffset
    }
}