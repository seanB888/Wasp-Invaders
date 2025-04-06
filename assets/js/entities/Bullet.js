// Bullet.js - Bullet entity implementation
import { Entity } from './Entity.js';
import { GAME_HEIGHT, BULLET_SPEED } from '../utils/Constants.js';

export class Bullet extends Entity {
    constructor(scene, events, direction) {
        super(scene, events);
        
        this.direction = direction; // 1 for player bullet, -1 for enemy bullet
        this.speed = BULLET_SPEED || 40;
    }
    
    /**
     * Create bullet mesh
     */
    createMesh() {
        const bulletGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        
        // Different colors for player and enemy bullets
        const bulletColor = this.direction > 0 ? 0x00ff00 : 0xff0000;
        const bulletMaterial = new THREE.MeshLambertMaterial({ color: bulletColor });
        
        this.mesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
    }
    
    /**
     * Update bullet position
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Move bullet based on direction
        this.position.y += this.direction * this.speed * deltaTime;
        
        // Check if bullet is out of bounds
        if (this.position.y > GAME_HEIGHT / 2 || this.position.y < -GAME_HEIGHT / 2) {
            this.destroy();
        }
    }
}