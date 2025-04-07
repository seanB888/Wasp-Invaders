// Particle.js - Explosion particle implementation
import { Entity } from './Entity.js';

export class Particle extends Entity {
    constructor(scene, events, position, color, lifetime) {
        super(scene, events);
        
        // Set initial position
        if (position) {
            this.position.copy(position);
        }
        
        this.color = color || 0xff0000;
        this.created = Date.now();
        this.lifetime = lifetime || 1000;
        
        // Set random velocity
        const speed = Math.random() * 10 + 5;
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 8 - 4;
        
        this.velocity.set(
            Math.cos(angle) * speed,
            height,
            Math.sin(angle) * speed
        );
    }
    
    /**
     * Create particle mesh
     */
    createMesh() {
        // Random size
        const size = Math.random() * 0.5 + 0.2;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshLambertMaterial({
            color: this.color,
            emissive: this.color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 1
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
    }
    
    /**
     * Update particle
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Apply gravity
        const gravity = 9.8 * deltaTime;
        this.velocity.y -= gravity;
        
        // Rotate particle
        if (this.mesh) {
            this.mesh.rotation.x += deltaTime * 5;
            this.mesh.rotation.y += deltaTime * 5;
        }
        
        // Check lifetime
        const now = Date.now();
        const age = now - this.created;
        const normalizedAge = age / this.lifetime;
        
        if (normalizedAge >= 1) {
            // Remove expired particles
            this.destroy();
        } else {
            // Fade out
            if (this.mesh && this.mesh.material && this.mesh.material.opacity !== undefined) {
                this.mesh.material.opacity = 1 - normalizedAge;
            }
            
            // Shrink slightly
            const scale = 1 - normalizedAge * 0.5;
            if (this.mesh) {
                this.mesh.scale.set(scale, scale, scale);
            }
        }
    }
}