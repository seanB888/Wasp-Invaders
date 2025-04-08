// ScoreManager.js - Manages game score and lives
export class ScoreManager {
    constructor(events) {
        console.log('ScoreManager constructor called with events:', events);
        
        this.events = events;
        console.log('ScoreManager received EventBus:', this.events);
        this.score = 0;
        this.lives = 5;
        
        // Subscribe to events
        this.setupEvents();
    }
    
    /**
     * Set up event listeners
     */
    setupEvents() {
        // Listen for enemy destroyed events
        this.events.subscribe('enemy:destroyed', (data) => {
            console.log('Enemy destroyed event received!', data);
            this.addScore(10);
        });
        
        // Listen for power-up collected events
        this.events.subscribe('powerUp:collected', () => {
            this.addScore(50);
        });
    }
    
    /**
     * Reset score and lives
     */
    reset() {
        this.score = 0;
        this.lives = 5;
        this.events.publish('score:updated', this.score);
        this.events.publish('lives:updated', this.lives);
    }
    
    /**
     * Add to score
     * @param {number} points - Points to add
     */
    addScore(points) {
        this.score += points;
        this.events.publish('score:updated', this.score);
    }
    
    /**
     * Decrement lives
     * @return {number} - Remaining lives
     */
    decrementLives() {
        this.lives--;
        this.events.publish('lives:updated', this.lives);
        return this.lives;
    }
    
    /**
     * Get current score
     * @return {number} - Current score
     */
    getScore() {
        return this.score;
    }
    
    /**
     * Get current lives
     * @return {number} - Current lives
     */
    getLives() {
        return this.lives;
    }
}