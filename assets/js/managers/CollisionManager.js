// CollisionManager.js - Handles collision detection between entities
export class CollisionManager {
    constructor(events, entityManager) {
        this.events = events;
        this.entityManager = entityManager;
    }
    
    /**
     * Update collision detection
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        if (!this.entityManager) return;
        
        // Get entity collections
        const player = this.entityManager.player;
        const enemies = this.entityManager.enemies;
        const playerBullets = this.entityManager.playerBullets;
        const enemyBullets = this.entityManager.enemyBullets;
        const powerUps = this.entityManager.powerUps;
        
        // Check player bullets vs enemies
        this.checkPlayerBulletsVsEnemies(playerBullets, enemies);
        
        // Check enemy bullets vs player
        if (player) {
            this.checkEnemyBulletsVsPlayer(enemyBullets, player);
        }
        
        // Check power-ups vs player
        if (player) {
            this.checkPowerUpsVsPlayer(powerUps, player);
        }
    }
    
    /**
     * Check collisions between player bullets and enemies
     * @param {Array} bullets - Player bullets
     * @param {Array} enemies - Enemies
     */
    checkPlayerBulletsVsEnemies(bullets, enemies) {
        console.log('Checking collisions: bullets=', bullets.length, 'enemies=', enemies.length);
        
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                
                if (bullet.collidesWith(enemy)) {
                    console.log('DIRECT COLLISION DETECTED in CollisionManager!');

                    // DIRECT SCORE UPDATE
                    let currentScore = parseInt(document.getElementById('score').textContent.split(': ')[1] || '0');
                    currentScore += 10;
                    document.getElementById('score').textContent = `Score: ${currentScore}`;
                    console.log('Updated score directly to:', currentScore);

                    // Direct score update
                    document.getElementById('score').textContent = `Score: ${parseInt(document.getElementById('score').textContent.split(': ')[1] || '0') + 10}`;
                    
                    // Create explosion at enemy position
                    this.events.publish('entity:explode', {
                        position: enemy.getPosition(),
                        isWasp: true
                    });
                    
                    // Destroy bullet and enemy
                    bullet.destroy();
                    enemy.destroy();
                    
                    // Publish enemy destroyed event
                    this.events.publish('enemy:destroyed', {
                        position: enemy.getPosition()
                    });
                    
                    break;
                }
            }
        }
    }
    
    /**
     * Check collisions between enemy bullets and player
     * @param {Array} bullets - Enemy bullets
     * @param {Object} player - Player entity
     */
    checkEnemyBulletsVsPlayer(bullets, player) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            
            if (bullet.collidesWith(player)) {
                // If shield is active, destroy bullet without damage
                if (player.shieldActive) {
                    // Create shield impact effect
                    this.events.publish('entity:explode', {
                        position: bullet.getPosition(),
                        isWasp: false,
                        color: 0x00FFFF // Cyan color for shield hit
                    });
                    
                    // Destroy bullet
                    bullet.destroy();
                    continue;
                }
                
                // Create explosion at player position
                this.events.publish('entity:explode', {
                    position: player.getPosition(),
                    isWasp: false
                });
                
                // Destroy bullet
                bullet.destroy();
                
                // Player is hit
                player.hit();
            }
        }
    }
    
    /**
     * Check collisions between power-ups and player
     * @param {Array} powerUps - Power-ups
     * @param {Object} player - Player entity
     */
    checkPowerUpsVsPlayer(powerUps, player) {
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const powerUp = powerUps[i];
            
            if (powerUp.collidesWith(player)) {
                // Apply power-up effect
                if (powerUp.type === 'shield') {
                    player.activateShield();
                }
                
                // Destroy power-up
                powerUp.destroy();
                
                // Publish power-up collected event
                this.events.publish('powerUp:collected', {
                    type: powerUp.type
                });
            }
        }
    }
}