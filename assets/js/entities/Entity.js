// Entity.js - Base class for game objects
import { generateUUID } from '../utils/MathUtils.js';

export class Entity {
    constructor(scene, events) {
        this.id = generateUUID();
        this.scene = scene;
        this.events = events;
        this.mesh = null;
        this.active = true;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
    }
    
    /**
     * Initialize entity and add to scene
     */
    init() {
        this.createMesh();
        if (this.mesh) {
            this.scene.add(this.mesh);
        }
    }
    
    /**
     * Create the mesh for this entity
     * Should be implemented by subclasses
     */
    createMesh() {
        // To be implemented by subclasses
        console.warn("createMesh not implemented");
    }
    
    /**
     * Update entity state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        if (!this.active || !this.mesh) return;
        
        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Update mesh position
        this.mesh.position.copy(this.position);
    }
    
    /**
     * Set entity position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     */
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
    }
    
    /**
     * Set entity velocity
     * @param {number} x - X velocity
     * @param {number} y - Y velocity
     * @param {number} z - Z velocity
     */
    setVelocity(x, y, z) {
        this.velocity.set(x, y, z);
    }
    
    /**
     * Check if this entity collides with another
     * @param {Entity} other - Other entity to check collision with
     * @param {number} threshold - Distance threshold for collision
     * @return {boolean} - Whether entities collide
     */
    collidesWith(other, threshold = 10) {
        if (!this.active || !other.active) return false;
        const distance = this.position.distanceTo(other.position);
        console.log('Collision check:', distance < threshold, 'distance:', distance, 'threshold:', threshold);
        // return distance < threshold;
        return this.position.distanceTo(other.position) < threshold;
    }
    
    
    /**
     * Destroy this entity and remove from scene
     */
    destroy() {
        console.log('Entity destroyed:', this.id);

        this.active = false;
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh = null;
        }
    }
    
    /**
     * Get entity position
     * @return {THREE.Vector3} - Current position
     */
    getPosition() {
        return this.position.clone();
    }
}