/// <reference lib="dom" />
import * as THREE from 'three';
import { Ball, Cube } from './shapes.ts';

class Wire {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private shapes: { mesh: THREE.Mesh, shape: Ball | Cube }[] = [];
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
        
        // Create ball and cube
        const ball = new Ball(this.scene);
        const cube = new Cube(this.scene);
        
        this.shapes.push(
            { mesh: ball.getMesh(), shape: ball },
            { mesh: cube.getMesh(), shape: cube }
        );
        
        this.lastTime = performance.now() / 1000;
        this.loop();
    }

    private setupRenderer(): void {
        this.renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        globalThis.document.body.appendChild(this.renderer.domElement);
    }

    private createGround(): void {
        const groundGeometry = new THREE.BoxGeometry(10, 0.5, 10);
        const materials = this.createGroundMaterials();
        const ground = new THREE.Mesh(groundGeometry, materials);
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    private createGroundMaterials(): THREE.Material[] {
        return [
            this.createSedimentMaterial(), // right side
            this.createSedimentMaterial(), // left side
            new THREE.MeshStandardMaterial({ color: 0xFFFFA0, roughness: 0.8 }), // top side
            this.createSedimentMaterial(), // bottom side
            this.createSedimentMaterial(), // front side
            this.createSedimentMaterial()  // back side
        ];
    }

    private createSedimentMaterial(): THREE.Material {
        const textureSize = 128;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.MeshStandardMaterial({ color: 0x808080 });

        const sedimentLayers = [
            { color: '#D2B48C', name: 'Light tan' },
            { color: '#8B7355', name: 'Medium brown' },
            { color: '#6B4423', name: 'Dark brown' },
            { color: '#463E3F', name: 'Deep brown' },
            { color: '#2F1F1F', name: 'Almost black' }
        ];

        this.drawSedimentLayers(ctx, sedimentLayers, textureSize);

        const texture = new THREE.CanvasTexture(canvas);
        return new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.9,
            metalness: 0.1
        });
    }

    private drawSedimentLayers(
        ctx: CanvasRenderingContext2D, 
        layers: Array<{ color: string, name: string }>, 
        size: number
    ): void {
        const layerHeight = size / layers.length;
        
        layers.forEach((layer, index) => {
            // Create gradient transition between layers
            const gradient = ctx.createLinearGradient(
                0, 
                index * layerHeight, 
                0, 
                (index + 1) * layerHeight
            );
            gradient.addColorStop(0, layer.color);
            gradient.addColorStop(1, layers[Math.min(index + 1, layers.length - 1)].color);
            
            // Draw base layer
            ctx.fillStyle = gradient;
            ctx.fillRect(0, index * layerHeight, size, layerHeight);
            
            // Add texture noise
            this.addLayerNoise(ctx, index * layerHeight, layerHeight, size);
        });
    }

    private addLayerNoise(
        ctx: CanvasRenderingContext2D, 
        startY: number, 
        height: number, 
        width: number,
        noisePoints: number = 100
    ): void {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let i = 0; i < noisePoints; i++) {
            const x = Math.random() * width;
            const y = startY + Math.random() * height;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    private setupLights(): void {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 10, 0);
        directionalLight.castShadow = true;
        
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
            this.mouse.x = (event.clientX / globalThis.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / globalThis.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);

            // Check intersections with all shapes
            for (const { mesh, shape } of this.shapes) {
                const intersects = this.raycaster.intersectObject(mesh);
                if (intersects.length > 0) {
                    shape.onClick();
                }
            }
        });
    }

    private loop(): void {
        const currentTime = performance.now() / 1000;
        let deltaTime = currentTime - this.lastTime;
        
        if (deltaTime > 0.1) {
            deltaTime = 1/60;
        }
        
        this.lastTime = currentTime;
        
        // Update all shapes
        for (const { shape } of this.shapes) {
            shape.update(deltaTime);
        }
        
        this.renderer.render(this.scene, this.camera);
        globalThis.requestAnimationFrame(() => this.loop());
    }
}

new Wire();