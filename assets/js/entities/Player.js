// Player.js - Player (ant) entity implementation
import { Entity } from './Entity.js';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED } from '../utils/Constants.js';

export class Player extends Entity {
    constructor(scene, events) {
        super(scene, events);
        
        this.speed = PLAYER_SPEED;
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldDuration = 10000; // 10 seconds
        this.lastShot = 0;
        this.shotDelay = 500; // ms
        
        // Set initial position
        this.setPosition(0, -GAME_HEIGHT / 2 + 5, 0);
    }
    
    /**
     * Create player mesh (ant model)
     */
    createMesh() {
        // Create player (ant) mesh
        const playerGeometry = new THREE.Group();

        // Ant body
        const bodyGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

        // Ant head
        const headGeometry = new THREE.SphereGeometry(1, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 1.5, 0);

        // Ant legs
        const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });

        for (let i = 0; i < 6; i++) {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.rotation.z = Math.PI / 2;
            leg.position.x = i < 3 ? -1.5 : 1.5;
            leg.position.y = -0.5 + (i % 3) * 0.7;
            playerGeometry.add(leg);
        }

        // Antennae
        const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5);
        const antenna1 = new THREE.Mesh(antennaGeometry, legMaterial);
        antenna1.position.set(-0.5, 2.3, 0);
        antenna1.rotation.z = -Math.PI / 6;

        const antenna2 = new THREE.Mesh(antennaGeometry, legMaterial);
        antenna2.position.set(0.5, 2.3, 0);
        antenna2.rotation.z = Math.PI / 6;

        playerGeometry.add(body);
        playerGeometry.add(head);
        playerGeometry.add(antenna1);
        playerGeometry.add(antenna2);

        this.mesh = playerGeometry;
    }
    
    /**
     * Move the player based on input
     * @param {Object} input - Input state object
     * @param {number} deltaTime - Time since last update
     */
    handleInput(input, deltaTime) {
        // Handle horizontal movement
        if (input.left) {
            this.position.x -= this.speed * deltaTime;
        }
        if (input.right) {
            this.position.x += this.speed * deltaTime;
        }

        // Limit player to screen bounds
        if (this.position.x < -GAME_WIDTH / 2 + 3) {
            this.position.x = -GAME_WIDTH / 2 + 3;
        }
        if (this.position.x > GAME_WIDTH / 2 - 3) {
            this.position.x = GAME_WIDTH / 2 - 3;
        }

        // Update mesh position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
        
        // Handle shooting
        const now = Date.now();
        if (input.space && now - this.lastShot > this.shotDelay) {
            this.shoot();
            this.lastShot = now;
        }
    }
    
    /**
     * Player shoots a bullet
     */
    shoot() {
        this.events.publish('player:shoot', {
            position: new THREE.Vector3(this.position.x, this.position.y + 2, 0),
            direction: 1
        });
    }
    
    /**
     * Activate shield power-up
     */
    activateShield() {
        this.shieldActive = true;
        this.shieldTimer = Date.now();
        
        // Create shield visual
        if (this.mesh) {
            if (this.mesh.userData.shield) {
                // If shield exists, just make it visible
                this.mesh.userData.shield.visible = true;
            } else {
                // Create shield mesh
                const shieldGeometry = new THREE.SphereGeometry(3, 32, 32);
                const shieldMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00FFFF,
                    transparent: true,
                    opacity: 0.4,
                    side: THREE.DoubleSide
                });
                
                const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
                this.mesh.add(shield);
                this.mesh.userData.shield = shield;
            }
        }
        
        // Publish shield event
        this.events.publish('player:shieldActivated', {
            duration: this.shieldDuration
        });
    }
    
    /**
     * Deactivate shield
     */
    deactivateShield() {
        this.shieldActive = false;
        
        if (this.mesh && this.mesh.userData.shield) {
            this.mesh.userData.shield.visible = false;
        }
        
        // Publish shield deactivated event
        this.events.publish('player:shieldDeactivated', {});
    }
    
    /**
     * Handle being hit by an enemy bullet
     * @return {boolean} - Whether the player was destroyed
     */
    hit() {
        // If shield is active, player is not hit
        if (this.shieldActive) {
            this.events.publish('player:shieldHit', {
                position: this.position.clone()
            });
            return false;
        }
        
        // Player is hit - publish event
        this.events.publish('player:hit', {
            position: this.position.clone()
        });
        
        // Make player flash for feedback
        if (this.mesh) {
            this.mesh.visible = false;
            setTimeout(() => {
                if (this.mesh) {
                    this.mesh.visible = true;
                }
            }, 150);
        }
        
        return true;
    }
    
    /**
     * Update player state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Check shield timer
        if (this.shieldActive && Date.now() - this.shieldTimer > this.shieldDuration) {
            this.deactivateShield();
        }
    }
}