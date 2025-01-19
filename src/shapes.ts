import * as THREE from 'three';

interface ShapeConfig {
    geometry: THREE.BufferGeometry;
    color?: number;
    position?: THREE.Vector3;
    dampening?: number;
    clickBoostVelocity?: number;
}

export class PhysicsShape {
    protected mesh: THREE.Mesh;
    protected velocity: number = 0;
    protected readonly gravity: number = -9.82;
    protected dampening: number;
    protected clickBoostVelocity: number;
    protected readonly maxHeight: number = 5;
    protected readonly minHeight: number = 0.55;

    constructor(scene: THREE.Scene, config: ShapeConfig) {
        this.dampening = config.dampening ?? 0.46;
        this.clickBoostVelocity = config.clickBoostVelocity ?? 3;
        
        const material = new THREE.MeshStandardMaterial({ color: config.color ?? 0xFF7F50 }); 
        this.mesh = new THREE.Mesh(config.geometry, material);
        this.mesh.castShadow = true;
        this.mesh.position.copy(config.position ?? new THREE.Vector3(0, 4, 0));
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

export class Ball extends PhysicsShape {
    constructor(scene: THREE.Scene) {
        super(scene, {
            geometry: new THREE.SphereGeometry(0.3, 32, 32),
            position: new THREE.Vector3(-1, 4, 0),
            dampening: 0.7,
            clickBoostVelocity: 2.5
        });
    }
}

export class Cube extends PhysicsShape {
    constructor(scene: THREE.Scene) {
        super(scene, {
            geometry: new THREE.BoxGeometry(0.6, 0.6, 0.6),
            color: 0x4169E1,
            position: new THREE.Vector3(1, 4, 0),
            dampening: 0.4,
            clickBoostVelocity: 1.4
        });
    }
} 