// Renderer.js - Handles THREE.js rendering
export class Renderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }
    
    /**
     * Initialize renderer
     */
    init() {
        console.log("Initializing renderer...");
        
        // Create THREE.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050510);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 50;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("gameContainer").appendChild(this.renderer.domElement);
        
        // Add lights
        this.setupLights();
        
        // Add window resize handler
        window.addEventListener("resize", this.onWindowResize.bind(this));
        
        console.log("Renderer initialized successfully");
    }
    
    /**
     * Add lights to the scene
     */
    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 10);
        this.scene.add(directionalLight);
    }
    
    /**
     * Create game boundaries
     * @param {number} gameWidth - Width of the game area
     * @param {number} gameHeight - Height of the game area
     */
    createBoundaries(gameWidth, gameHeight) {
        // Create game boundaries
        const boundaryMaterial = new THREE.MeshLambertMaterial({
            color: 0x555555,
            emissive: 0x222222
        });
        
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(gameWidth * 2, 5);
        const ground = new THREE.Mesh(groundGeometry, boundaryMaterial);
        ground.position.y = -gameHeight / 2;
        ground.rotation.x = -Math.PI / 2;
        this.scene.add(ground);
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Render the scene
     */
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    /**
     * Get the scene
     * @return {THREE.Scene} - The THREE.js scene
     */
    getScene() {
        return this.scene;
    }
}