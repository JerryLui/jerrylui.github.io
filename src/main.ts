/// <reference lib="dom" />
import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.172.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.172.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.172.0/examples/jsm/loaders/DRACOLoader.js';

class RoomScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private room: THREE.Group | null = null;
    private axesHelper: THREE.AxesHelper;
    constructor() {
        // Initialize scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance",
        });
        
        // Setup renderer with improved quality
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        // Setup camera and controls for isometric view
        this.camera.position.set(7.07, 12, 7.07);
        this.camera.lookAt(0, 0, 0);
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        // this.controls.enableZoom = true;
        // this.controls.enablePan = false;   
        // this.controls.minPolarAngle = Math.PI / 4;  
        // this.controls.maxPolarAngle = Math.PI / 3;
        // this.controls.minAzimuthAngle = Math.PI / 4;  // Limit horizontal rotation
        // this.controls.maxAzimuthAngle = Math.PI / 4;
        
        // Add axes helper
        const axesHelper = new THREE.AxesHelper(1); // Length of 1 unit
        this.axesHelper = axesHelper;
        this.scene.add(axesHelper);
        
        // Add lights
        this.setupLights();
        
        // Load room model
        this.loadRoom();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start animation loop
        this.animate();
    }

    private setupLights(): void {
        // Increase ambient light intensity for better fill
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);
    }

    private setupWindowLight(object: THREE.Object3D): void {
        const worldPosition = new THREE.Vector3();
        object.getWorldPosition(worldPosition);
        worldPosition.z -= 0.06;
        worldPosition.y += 0.06;

        const windowLight = new THREE.PointLight(0xffd28e, 1, 0);
        windowLight.position.copy(worldPosition);
        windowLight.castShadow = true;
        windowLight.shadow.mapSize.width = 1024;
        windowLight.shadow.mapSize.height = 1024;
        windowLight.shadow.bias = -0.001;
        this.scene.add(windowLight);
    }

    private setupLampLight(object: THREE.Object3D): void {
        const worldPosition = new THREE.Vector3();
        object.getWorldPosition(worldPosition);
        worldPosition.y += 0.06;
        worldPosition.z += 0.04;

        // Point light setup
        const pointLight = new THREE.PointLight(0xffd28e, .1, 5, 1);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 1024;
        pointLight.shadow.mapSize.height = 1024;
        pointLight.shadow.bias = -0.001;
        pointLight.position.copy(worldPosition);
        
        // Spotlight setup
        const spotLight = new THREE.SpotLight(0xffd28e, 1);
        spotLight.position.copy(worldPosition);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.2;
        spotLight.decay = 2;
        spotLight.distance = 10;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.bias = -0.001;
        
        const targetObject = new THREE.Object3D();
        this.scene.add(targetObject);
        spotLight.target = targetObject;
        targetObject.position.set(0, -1, 0);
        
        this.axesHelper.position.copy(worldPosition);
        this.scene.add(pointLight);
        this.scene.add(spotLight);
    }

    private enhanceMaterial(object: THREE.Mesh): void {
        if (!object.material || !(object.material instanceof THREE.MeshStandardMaterial)) return;
        
        object.castShadow = true;
        object.receiveShadow = true;
        
        object.material.envMapIntensity = 1.5;
        object.material.metalness = object.material.metalness || 0;
        object.material.roughness = Math.max(0.3, object.material.roughness || 1);
        
        if (object.name === 'Glass' || object.name.includes('Glass')) {
            object.material.emissive = new THREE.Color(0xffd28e);
            object.material.emissiveIntensity = 0.9;
        }
        
        object.material.needsUpdate = true;
    }

    private loadRoom(): void {
        const loader = new GLTFLoader();
        
        // Setup Draco loader
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        dracoLoader.setDecoderConfig({ type: 'js' });
        loader.setDRACOLoader(dracoLoader);
        
        loader.load(
            'room.glb',
            (gltf: { scene: THREE.Group }) => {
                this.room = gltf.scene;
                this.scene.add(this.room);
                
                this.room.traverse((object: THREE.Object3D) => {
                    if (object.name === 'WindowGlass' || object.name.includes('WindowGlass')) {
                        this.setupWindowLight(object);
                    } else if (object.name === 'Lampshade' || object.name.includes('Lampshade')) {
                        this.setupLampLight(object);
                    }
                    
                    if (object instanceof THREE.Mesh) {
                        this.enhanceMaterial(object);
                    }
                });

                // Center the room
                const box = new THREE.Box3().setFromObject(this.room);
                const center = box.getCenter(new THREE.Vector3());
                this.room.position.sub(center);
            },
            (progress: ProgressEvent) => {
                console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error: ErrorEvent) => {
                console.error('Error loading room:', error);
            }
        );
    }

    private setupEventListeners(): void {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    private animate(): void {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

new RoomScene(); 