// PowerUpManager.js - Manages power-up spawning and effects
export class PowerUpManager {
    constructor(events) {
        this.events = events;
        this.lastPowerUpSpawn = 0;
        this.powerUpSpawnDelay = 15000; // 15 seconds
    }
    
    /**
     * Reset power-up manager
     */
    reset() {
        this.lastPowerUpSpawn = Date.now();
    }
    
    /**
     * Update power-up spawning
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        const now = Date.now();
        
        // Check if we should spawn a new power-up
        if (now - this.lastPowerUpSpawn > this.powerUpSpawnDelay) {
            this.spawnPowerUp();
            this.lastPowerUpSpawn = now;
        }
    }
    
    /**
     * Spawn a new power-up
     */
    spawnPowerUp() {
        // Spawn a shield power-up
        this.events.publish('powerUp:spawn', {
            type: 'shield',
            position: null // Use default position in PowerUp constructor
        });
    }
}