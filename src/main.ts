/// <reference lib="dom" />
import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.172.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.172.0/examples/jsm/loaders/GLTFLoader.js';

class RoomScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private room: THREE.Group | null = null;
    private pointLight: THREE.PointLight;

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

        // Improved point light settings
        const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 2048;
        pointLight.shadow.mapSize.height = 2048;
        pointLight.shadow.bias = -0.001;
        this.scene.add(pointLight);

        // const hemiLight = new THREE.HemisphereLight('#ADD8E6', 0x080820, 0.1);
        // hemiLight.position.set(0, 20, 0);
        // this.scene.add(hemiLight);

        this.pointLight = pointLight;
    }

    private loadRoom(): void {
        const loader = new GLTFLoader();
        loader.load(
            'room.glb',
            (gltf: { scene: THREE.Group }) => {
                this.room = gltf.scene;
                this.scene.add(this.room);
                
                // Improve material quality
                this.room.traverse((object: THREE.Object3D) => {
                    if (object.name === 'Lampshade' || object.name.includes('Lampshade')) {
                        const worldPosition = new THREE.Vector3();
                        object.getWorldPosition(worldPosition);
                        this.pointLight.position.copy(worldPosition);
                        console.log(this.pointLight.position);
                    }
                    
                    if (object instanceof THREE.Mesh) {
                        object.castShadow = true;
                        object.receiveShadow = true;
                        
                        if (object.material) {
                            // Enhanced material settings
                            if (object.material instanceof THREE.MeshStandardMaterial) {
                                object.material.envMapIntensity = 1.5;
                                object.material.metalness = object.material.metalness || 0;
                                object.material.roughness = Math.max(0.3, object.material.roughness || 1);
                                object.material.needsUpdate = true;
                            }
                        }
                    }
                });

                // Center the room if needed
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