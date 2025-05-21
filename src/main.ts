/// <reference lib="dom" />
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

class LoadingBar {
  private container: HTMLDivElement;
  private progressBar: HTMLDivElement;
  private currentProgress: number = 0;
  private targetProgress: number = 0;
  private readonly MINIMUM_LOAD_TIME = 2000; // 2 seconds
  private loadStartTime: number;
  private isAnimating: boolean = true;
  private onComplete?: () => void;

  constructor() {
    this.container = document.querySelector(".loading-bar") as HTMLDivElement;
    this.progressBar = document.querySelector(
      ".loading-progress"
    ) as HTMLDivElement;
    this.loadStartTime = performance.now();
    this.animate();
  }

  updateProgress(percent: number): void {
    this.targetProgress = percent;
  }

  private animate = () => {
    if (!this.isAnimating) return;

    // Automatically progress to 90% if no real progress
    if (this.targetProgress < 90 && this.currentProgress < 90) {
      this.targetProgress += 0.1;
    }

    // Smooth progress animation
    this.currentProgress += (this.targetProgress - this.currentProgress) * 0.1;
    this.progressBar.style.width = `${this.currentProgress}%`;

    requestAnimationFrame(this.animate);
  };

  hide(onComplete: () => void): void {
    this.onComplete = onComplete;
    const elapsedTime = performance.now() - this.loadStartTime;
    const remainingTime = Math.max(0, this.MINIMUM_LOAD_TIME - elapsedTime);

    // Ensure we reach 100% smoothly
    this.targetProgress = 100;

    setTimeout(() => {
      this.isAnimating = false;
      this.container.style.display = "none";
      this.onComplete?.();
    }, remainingTime);
  }

  showError(): void {
    this.container.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
    this.isAnimating = false;
  }
}

class RoomScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private room: THREE.Group | null = null;
  private axesHelper: THREE.AxesHelper;
  private chair: THREE.Object3D | null = null;
  private isRotating: boolean = false;
  private targetRotation: number = 0;
  private startRotation: number = 0;
  private raycaster: THREE.Raycaster;
  private readonly ROTATION_ANGLE = Math.PI / 6; // 30 degrees
  private readonly ANIMATION_DURATION = 1000; // 1 second in ms
  private animationStartTime: number = 0;
  private readonly BOUNCEABLE_OBJECT_NAMES = [
    "Mouse",
    "Keyboard",
    "KeyboardBase",
  ];
  private bounceableObjects: {
    object: THREE.Object3D;
    initialY: number;
    velocity: number;
  }[] = [];
  private readonly GRAVITY = -2.45; // Reduced from -4.91 to -2.45 for slower falling
  private readonly DAMPENING = 0.6; // Reduced from 0.85 to 0.6 for less bouncy
  private loadingBar: LoadingBar;
  private loadedModel?: THREE.Group;

  constructor() {
    // Initialize scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });

    // Setup renderer with improved quality
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    // Setup camera and controls for isometric view
    this.camera.position.set(4, 4, 4);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.minPolarAngle = Math.PI / 4;
    this.controls.maxPolarAngle = Math.PI / 3;
    this.controls.minAzimuthAngle = Math.PI / 6;
    this.controls.maxAzimuthAngle = Math.PI / 3;

    // Add axes helper
    // const axesHelper = new THREE.AxesHelper(1); // Length of 1 unit
    // this.axesHelper = axesHelper;
    // this.scene.add(axesHelper);

    // Add lights
    this.setupLights();

    // Load room model
    this.raycaster = new THREE.Raycaster();
    this.loadingBar = new LoadingBar();
    this.loadRoom();

    // Setup event listeners
    this.setupEventListeners();

    // Start animation loop
    this.animate(performance.now());
  }

  private setupLights(): void {
    // Increase ambient light intensity for better fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
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
    const pointLight = new THREE.PointLight(0xffd28e, 0.1, 5, 1);
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

    this.scene.add(pointLight);
    this.scene.add(spotLight);
  }

  private enhanceMaterial(object: THREE.Mesh): void {
    if (
      !object.material ||
      !(object.material instanceof THREE.MeshStandardMaterial)
    )
      return;

    object.castShadow = true;
    object.receiveShadow = true;

    object.material.envMapIntensity = 1.5;
    object.material.metalness = object.material.metalness || 0;
    object.material.roughness = Math.max(0.3, object.material.roughness || 1);

    if (object.name === "Glass" || object.name.includes("Glass")) {
      object.material.emissive = new THREE.Color(0xffd28e);
      object.material.emissiveIntensity = 0.9;
    }

    object.material.needsUpdate = true;
  }

  private loadRoom(): void {
    const loader = new GLTFLoader();

    // Setup Draco loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    dracoLoader.setDecoderConfig({ type: "js" });
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "room.glb?v=1.0.0",
      (gltf: { scene: THREE.Group }) => {
        this.loadedModel = gltf.scene;
        this.setupLoadedModel();
        this.loadingBar.hide(() => {
          this.room = this.loadedModel || null;
          if (this.room) {
            this.scene.add(this.room);
          }
        });
      },
      (progressEvent: ProgressEvent) => {
        if (progressEvent.lengthComputable) {
          const percent = (progressEvent.loaded / progressEvent.total) * 100;
          this.loadingBar.updateProgress(percent);
        }
      },
      (error: unknown) => {
        console.error("Error loading room:", error);
        this.loadingBar.showError();
      }
    );
  }

  private setupLoadedModel(): void {
    if (!this.loadedModel) return;

    // Find chair object after loading
    this.chair = this.loadedModel.getObjectByName("Chair") || null;
    if (this.chair) {
      this.setupChairInteraction();
      setTimeout(() => this.startChairRotation(), 1000);
    }

    // Find and setup bounceable objects
    this.BOUNCEABLE_OBJECT_NAMES.forEach((name) => {
      const object = this.loadedModel?.getObjectByName(name);
      if (object) {
        this.setupBounceableObject(object);
      }
    });

    this.loadedModel.traverse((object: THREE.Object3D) => {
      if (
        object.name === "WindowGlass" ||
        object.name.includes("WindowGlass")
      ) {
        this.setupWindowLight(object);
      } else if (
        object.name === "TableLampShade" ||
        object.name.includes("TableLampShade")
      ) {
        this.setupLampLight(object);
      }

      if (object instanceof THREE.Mesh) {
        this.enhanceMaterial(object);
      }
    });

    // Center the room
    const box = new THREE.Box3().setFromObject(this.loadedModel);
    const center = box.getCenter(new THREE.Vector3());
    this.loadedModel.position.sub(center);
  }

  private setupChairInteraction(): void {
    const pointer = new THREE.Vector2();

    window.addEventListener("click", (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(pointer, this.camera);
      const intersects = this.raycaster.intersectObject(this.chair!, true);

      if (intersects.length > 0 && !this.isRotating) {
        this.startChairRotation();
      }
    });
  }

  private startChairRotation(): void {
    if (!this.chair) return;

    this.startRotation = this.chair.rotation.y;
    // Determine next rotation based on current position
    this.targetRotation =
      Math.abs(this.startRotation) < 0.01 ? this.ROTATION_ANGLE : 0;
    this.isRotating = true;
    this.animationStartTime = performance.now();
  }

  private updateChairRotation(currentTime: number): void {
    if (!this.chair || !this.isRotating) return;

    const elapsed = currentTime - this.animationStartTime;
    const progress = Math.min(elapsed / this.ANIMATION_DURATION, 1);

    if (progress < 1) {
      const easedProgress = this.easeInOutQuad(progress);
      this.chair.rotation.y =
        this.startRotation +
        (this.targetRotation - this.startRotation) * easedProgress;
    } else {
      this.chair.rotation.y = this.targetRotation;
      this.isRotating = false;
    }
  }

  private setupBounceableObject(object: THREE.Object3D): void {
    const worldPosition = new THREE.Vector3();
    object.getWorldPosition(worldPosition);

    // Store initial Y position and set initial elevated position
    const initialY = worldPosition.y;
    object.position.y = initialY + 0.3; // Reduced from 0.5 to 0.3 for lower initial height

    this.bounceableObjects.push({
      object,
      initialY,
      velocity: 0,
    });
  }

  private setupEventListeners(): void {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Add click handler for bounceable objects
    window.addEventListener("click", (event) => {
      const pointer = new THREE.Vector2();
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(pointer, this.camera);

      for (const bounceable of this.bounceableObjects) {
        const intersects = this.raycaster.intersectObject(
          bounceable.object,
          true
        );
        if (intersects.length > 0) {
          bounceable.velocity = 0.8; // Reduced from 1.5 to 0.8 for slower initial velocity
          break;
        }
      }
    });
  }

  private easeInOutQuad(t: number): number {
    // Quadratic ease-in-out function
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  private updateBounceableObjects(deltaTime: number): void {
    for (const bounceable of this.bounceableObjects) {
      // Apply gravity
      bounceable.velocity += this.GRAVITY * deltaTime;

      // Update position
      bounceable.object.position.y += bounceable.velocity * deltaTime;

      // Bounce when hitting the ground
      if (bounceable.object.position.y <= bounceable.initialY) {
        bounceable.object.position.y = bounceable.initialY;
        bounceable.velocity = -bounceable.velocity * this.DAMPENING;

        // Stop if velocity is very small
        if (Math.abs(bounceable.velocity) < 0.01) {
          bounceable.velocity = 0;
        }
      }
    }
  }

  private animate(currentTime: number): void {
    requestAnimationFrame((time) => this.animate(time));

    if (this.isRotating) {
      this.updateChairRotation(currentTime);
    }

    // Update bounceable objects
    this.updateBounceableObjects(0.016); // Assuming 60fps

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

new RoomScene();
