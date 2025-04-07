// LevelManager.js - Manages game levels and difficulty
import { GAME_WIDTH, GAME_HEIGHT, ENEMY_ROWS, ENEMIES_PER_ROW } from '../utils/Constants.js';

export class LevelManager {
    constructor(events, entityManager) {
        this.events = events;
        this.entityManager = entityManager;
        this.level = 1;
        this.enemySpeed = 0.3;
        this.enemyDirection = 1;
        this.enemyMoveDelay = 500; // ms
        this.enemyShotDelay = 1000; // ms
        this.lastEnemyMove = Date.now();
        this.lastEnemyShot = Date.now();
    }
    
    /**
     * Reset level settings
     */
    reset() {
        this.level = 1;
        this.enemySpeed = 0.3;
        this.enemyMoveDelay = 500;
        this.enemyShotDelay = 1000;
    }
    
    /**
     * Spawn enemies for current level
     */
    spawnEnemies() {
        const rows = ENEMY_ROWS;
        const cols = ENEMIES_PER_ROW;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const spacing = GAME_WIDTH / (cols + 1);
                const x = col * spacing - GAME_WIDTH / 2 + spacing;
                const y = GAME_HEIGHT / 3 - row * 5;
                
                this.entityManager.createEnemy(x, y);
            }
        }
        
        // Adjust enemy difficulty based on level
        this.adjustDifficulty();
    }
    
    /**
     * Adjust enemy difficulty based on current level
     */
    adjustDifficulty() {
        // Increase enemy speed with level
        this.enemySpeed = Math.min(1.0, 0.3 + (this.level - 1) * 0.1);
        
        // Decrease enemy move delay with level (faster movement)
        this.enemyMoveDelay = Math.max(200, 500 - (this.level - 1) * 30);
        
        // Decrease enemy shot delay with level (faster shooting)
        this.enemyShotDelay = Math.max(500, 1000 - (this.level - 1) * 50);
        
        // Publish updated settings
        this.events.publish('level:difficultyUpdated', {
            level: this.level,
            enemySpeed: this.enemySpeed,
            enemyMoveDelay: this.enemyMoveDelay,
            enemyShotDelay: this.enemyShotDelay
        });
    }
    
    /**
     * Increase level number
     */
    increaseLevel() {
        this.level++;
        this.events.publish('level:changed', this.level);
    }
    
    /**
     * Get current level
     * @return {number} - Current level
     */
    getLevel() {
        return this.level;
    }
    
    /**
     * Move to next level
     */
    nextLevel() {
        this.increaseLevel();
        this.spawnEnemies();
    }

    // Add this to your LevelManager class
updateEnemies(deltaTime) {
    if (!this.entityManager) return;
    
    const now = Date.now();
    let changeDirection = false;
    const enemies = this.entityManager.enemies;
    
    // Move enemies based on timer
    if (now - this.lastEnemyMove > this.enemyMoveDelay) {
        this.lastEnemyMove = now;
        
        for (let enemy of enemies) {
            // Move enemy horizontally
            enemy.position.x += this.enemyDirection * this.enemySpeed;
            
            // Check if any enemy is at the edge
            if (
                enemy.position.x > GAME_WIDTH / 2 - 3 ||
                enemy.position.x < -GAME_WIDTH / 2 + 3
            ) {
                changeDirection = true;
            }
        }
        
        if (changeDirection) {
            // Reverse direction
            this.enemyDirection *= -1;
            
            // Move enemies down
            for (let enemy of enemies) {
                enemy.position.y -= ENEMY_DESCENT;
            }
        }
    }
    
    // Random enemy shooting
    if (enemies.length > 0 && now - this.lastEnemyShot > this.enemyShotDelay) {
        this.lastEnemyShot = now;
        
        // Random enemy shoots
        const randomIndex = Math.floor(Math.random() * enemies.length);
        enemies[randomIndex].shoot();
        
        // Adjust difficulty based on remaining enemies
        this.enemyShotDelay = Math.max(500, 1000 - (ENEMY_ROWS * ENEMIES_PER_ROW - enemies.length) * 15);
        this.enemyMoveDelay = Math.max(200, 500 - (ENEMY_ROWS * ENEMIES_PER_ROW - enemies.length) * 9);
    }
}
}