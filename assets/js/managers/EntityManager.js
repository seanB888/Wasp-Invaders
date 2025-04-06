// EntityManager.js - Manages collections of game entities
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Bullet } from '../entities/Bullet.js';
import { PowerUp } from '../entities/PowerUp.js';
import { Particle } from '../entities/Particle.js';

export class EntityManager {
    constructor(events, scene) {
        this.events = events;
        this.scene = scene;
        
        // Entity collections
        this.player = null;
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.particles = [];
        
        // Subscribe to game events
        this.setupEvents();
    }
    
    setupEvents() {
        // Bullet events
        this.events.subscribe('player:shoot', data => this.createBullet(data.position, data.direction));
        this.events.subscribe('enemy:shoot', data => this.createBullet(data.position, data.direction));
        
        // PowerUp events
        this.events.subscribe('powerUp:spawn', data => this.createPowerUp(data.type, data.position));
        
        // Explosion events
        this.events.subscribe('entity:explode', data => this.createExplosion(data.position, data.isWasp));
        
        // Store latest input state
        this.latestInput = {};
        this.events.subscribe('input:state', data => {
            this.latestInput = data;
        });
    }
    
    /**
     * Create the player entity
     * @return {Player} - The created player
     */
    createPlayer() {
        this.player = new Player(this.scene, this.events);
        this.player.init();
        return this.player;
    }
    
    /**
     * Create a new enemy entity
     * @param {number} x - X position
     * @param {number} y - Y position
     * @return {Enemy} - The created enemy
     */
    createEnemy(x, y) {
        const enemy = new Enemy(this.scene, this.events);
        enemy.init();
        enemy.setPosition(x, y, 0);
        this.enemies.push(enemy);
        return enemy;
    }
    
    /**
     * Create a bullet entity
     * @param {THREE.Vector3} position - Starting position
     * @param {number} direction - Direction (1 for player, -1 for enemy)
     * @return {Bullet} - The created bullet
     */
    createBullet(position, direction) {
        const bullet = new Bullet(this.scene, this.events, direction);
        bullet.init();
        bullet.setPosition(position.x, position.y, position.z);
        
        if (direction > 0) {
            this.playerBullets.push(bullet);
        } else {
            this.enemyBullets.push(bullet);
        }
        
        return bullet;
    }
    
    /**
     * Create a power-up entity
     * @param {string} type - PowerUp type
     * @param {THREE.Vector3} position - Position
     * @return {PowerUp} - The created power-up
     */
    createPowerUp(type, position) {
        const powerUp = new PowerUp(this.scene, this.events, type);
        powerUp.init();
        
        if (position) {
            powerUp.setPosition(position.x, position.y, position.z);
        }
        
        this.powerUps.push(powerUp);
        return powerUp;
    }
    
    /**
     * Create explosion particles
     * @param {THREE.Vector3} position - Explosion center
     * @param {boolean} isWasp - Whether this is a wasp explosion
     * @return {Array} - Created particles
     */
    createExplosion(position, isWasp = true) {
        const particleCount = 30;
        const particles = [];
        const colors = isWasp ? [0xff0000, 0xffffff] : [0xff8800, 0xffcc00];
        const lifetime = isWasp ? 800 : 1200;
        
        for (let i = 0; i < particleCount; i++) {
            // Create a particle with random properties
            const particle = new Particle(
                this.scene, 
                this.events,
                position.clone(),
                colors[Math.floor(Math.random() * colors.length)],
                lifetime
            );
            
            particle.init();
            this.particles.push(particle);
            particles.push(particle);
        }
        
        return particles;
    }
    
    /**
     * Update all entities
     * @param {number} deltaTime - Time since last update
     * @param {Object} input - Input state
     */
    update(deltaTime) {
        // We'll store the latest input state locally instead of using getLatestData
        const input = this.latestInput || {};
        
        // Update player if it exists
        if (this.player) {
            this.player.handleInput(input, deltaTime);
            this.player.update(deltaTime);
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime);
            
            // Remove inactive enemies
            if (!enemy.active) {
                this.enemies.splice(i, 1);
            }
        }
        
        // Update bullets
        this.updateBullets(this.playerBullets, deltaTime);
        this.updateBullets(this.enemyBullets, deltaTime);
        
        // Update power-ups
        this.updatePowerUps(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
    }
    
    /**
     * Update bullets and check for collisions
     * @param {Array} bullets - Bullet array to update
     * @param {number} deltaTime - Time since last update
     */
    updateBullets(bullets, deltaTime) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.update(deltaTime);
            
            // Remove inactive bullets
            if (!bullet.active) {
                bullets.splice(i, 1);
            }
        }
    }
    
    /**
     * Update power-ups and check for collisions
     * @param {number} deltaTime - Time since last update
     */
    updatePowerUps(deltaTime) {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update(deltaTime);
            
            // Remove inactive power-ups
            if (!powerUp.active) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    /**
     * Update particles
     * @param {number} deltaTime - Time since last update
     */
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            // Remove inactive particles
            if (!particle.active) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * Get count of remaining enemies
     * @return {number} - Enemy count
     */
    getEnemyCount() {
        return this.enemies.length;
    }
    
    /**
     * Clear all entities
     */
    clear() {
        // Clear player
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        
        // Clear bullets
        this.clearEntityArray(this.playerBullets);
        this.clearEntityArray(this.enemyBullets);
        
        // Clear enemies
        this.clearEntityArray(this.enemies);
        
        // Clear power-ups
        this.clearEntityArray(this.powerUps);
        
        // Clear particles
        this.clearEntityArray(this.particles);
    }
    
    /**
     * Clear all entities in an array
     * @param {Array} entities - Array of entities to clear
     */
    clearEntityArray(entities) {
        for (const entity of entities) {
            entity.destroy();
        }
        entities.length = 0;
    }
}