// PowerUp.js - PowerUp entity implementation
import { Entity } from './Entity.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';

export class PowerUp extends Entity {
    constructor(scene, events, type) {
        super(scene, events);
        
        this.type = type || 'shield';
        
        // Set default velocity
        this.velocity.set(0, -5, 0);
        
        // Add random rotation
        this.rotationSpeed = Math.random() * 2 + 1;
        
        // Set random position at top of screen
        this.setPosition(
            (Math.random() - 0.5) * GAME_WIDTH,
            GAME_HEIGHT / 2,
            0
        );
    }
    
    /**
     * Create power-up mesh
     */
    createMesh() {
        const powerUpGroup = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.SphereGeometry(1, 16, 16);
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00FFFF,
            emissive: 0x00BFFF,
            emissiveIntensity: 0.5
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        
        // Shield icon
        const shieldGeometry = new THREE.CircleGeometry(0.6, 16);
        const shieldMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            side: THREE.DoubleSide
        });
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.position.z = 0.6;
        
        powerUpGroup.add(base);
        powerUpGroup.add(shield);
        
        this.mesh = powerUpGroup;
    }
    
    /**
     * Update power-up
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Rotate power-up
        if (this.mesh) {
            this.mesh.rotation.y += this.rotationSpeed * deltaTime;
        }
        
        // Check if out of bounds
        if (this.position.y < -GAME_HEIGHT / 2) {
            this.destroy();
        }
    }
}