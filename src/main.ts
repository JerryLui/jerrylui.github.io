/// <reference lib="dom" />
import * as THREE from 'three';

class Ball {
    private mesh: THREE.Mesh;
    private velocity: number = 0;
    private readonly gravity: number = -9.82;
    private readonly dampening: number = 0.46;
    private readonly clickBoostVelocity: number = 3;
    private readonly maxHeight: number = 5;
    private readonly minHeight: number = 0.55;

    constructor(scene: THREE.Scene) {
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xFF7F50 }); 
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.position.set(0, 4, 0);
        scene.add(this.mesh);
    }

    getMesh(): THREE.Mesh {
        return this.mesh;
    }

    onClick(): void {
        this.velocity = this.clickBoostVelocity;
    }

    update(deltaTime: number): void {
        // Apply gravity
        this.velocity += this.gravity * deltaTime;
        
        // Update position
        this.mesh.position.y += this.velocity * deltaTime;

        // Clamp position between min and max height
        if (this.mesh.position.y >= this.maxHeight) {
            this.mesh.position.y = this.maxHeight;
            this.velocity = 0;
        }
        
        // Bounce when hitting the ground
        if (this.mesh.position.y <= this.minHeight) {
            this.mesh.position.y = this.minHeight;
            this.velocity = -this.velocity * this.dampening;
            // Stop completely if velocity is very small
            if (Math.abs(this.velocity) < 0.01) {
                this.velocity = 0;
            }
        }
    }
}

class Wire {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private ball: Ball;
    private lastTime: number = 0;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, globalThis.innerWidth / globalThis.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.setupRenderer();
        this.createGround();
        this.setupLights();
        this.setupCamera();
        this.setupEventListeners();
        
        this.ball = new Ball(this.scene);
        this.lastTime = performance.now() / 1000;
        this.gameLoop();
    }

    private setupRenderer(): void {
        this.renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        globalThis.document.body.appendChild(this.renderer.domElement);
    }

    private createGround(): void {
        const groundGeometry = new THREE.BoxGeometry(10, 0.5, 10);
        const materials = [
            new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8 }), // right side
            new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8 }), // left side
            new THREE.MeshStandardMaterial({ color: 0xFFFFA0, roughness: 0.8 }), // top side
            new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8 }), // bottom side
            new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8 }), // front side
            new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8 }), // back side
        ];
        const ground = new THREE.Mesh(groundGeometry, materials);
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    private setupLights(): void {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 10, 0); // Position light directly above
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 20;
        directionalLight.shadow.camera.left = -5;
        directionalLight.shadow.camera.right = 5;
        directionalLight.shadow.camera.top = 5;
        directionalLight.shadow.camera.bottom = -5;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        
        this.scene.add(directionalLight);
    }

    private setupCamera(): void {
        this.camera.position.set(10, 12, 10);
        this.camera.lookAt(0, 0, 0);
    }

    private setupEventListeners(): void {
        globalThis.addEventListener('resize', () => {
            this.camera.aspect = globalThis.innerWidth / globalThis.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
        });

        globalThis.addEventListener('click', (event) => {
            // Calculate mouse position in normalized device coordinates (-1 to +1)
            this.mouse.x = (event.clientX / globalThis.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / globalThis.innerHeight) * 2 + 1;

            // Update the picking ray with the camera and mouse position
            this.raycaster.setFromCamera(this.mouse, this.camera);

            // Calculate objects intersecting the picking ray
            const intersects = this.raycaster.intersectObject(this.ball.getMesh());

            if (intersects.length > 0) {
                this.ball.onClick();
            }
        });
    }

    private gameLoop(): void {
        const currentTime = performance.now() / 1000;
        let deltaTime = currentTime - this.lastTime;
        
        // If we've been away for too long, use a safe delta
        if (deltaTime > 0.1) {
            deltaTime = 1/60;
        }
        
        this.lastTime = currentTime;
        this.ball.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
        globalThis.requestAnimationFrame(() => this.gameLoop());
    }
}

new Wire();