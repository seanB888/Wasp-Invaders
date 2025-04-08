// Game.js - Main game controller
import { Renderer } from './Renderer.js';
import { InputManager } from './Input.js';
import { EventBus } from './EventBus.js';
import { EntityManager } from '../managers/EntityManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { PowerUpManager } from '../managers/PowerUpManager.js';
import { LevelManager } from '../managers/LevelManager.js';
import { GAME_STATES, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';
import { AudioManager } from './AudioManager.js';

export class Game {
    constructor() {
        // Core systems
        this.events = new EventBus();
        console.log('Main EventBus created:', this.event);
        this.renderer = new Renderer();
        this.input = new InputManager(this.events);
        this.audio = new AudioManager(this.events);
        
        // Game state
        this.state = GAME_STATES.INIT;
        this.clock = new THREE.Clock();
        
        // We'll initialize managers after renderer is set up
        
        // Setup event listeners
        this.setupEvents();
    }
    
    init() {
        console.log("Initializing game...");
        
        // Get DOM elements
        this.setupDomElements();
        
        // Initialize systems
        this.renderer.init();
        this.input.init();
        
        // Now that the renderer is initialized, we can create the other managers
        this.scene = this.renderer.getScene();
        this.entities = new EntityManager(this.events, this.scene);
        this.score = new ScoreManager(this.events);
        this.powerUps = new PowerUpManager(this.events);
        this.level = new LevelManager(this.events, this.entities);
        this.collisions = new CollisionManager(this.events, this.entities);
        
        // Create game boundaries
        this.renderer.createBoundaries(GAME_WIDTH, GAME_HEIGHT);
        
        // Start animation loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        
        // Show start screen
        this.setState(GAME_STATES.START_SCREEN);
        
        console.log("Game initialized successfully");
    }
    
    setupDomElements() {
        this.domElements = {
            scoreElement: document.getElementById("score"),
            livesElement: document.getElementById("lives"),
            gameOverElement: document.getElementById("gameOver"),
            finalScoreElement: document.getElementById("finalScore"),
            resetButton: document.getElementById("resetButton"),
            startButton: document.getElementById("startButton"),
            startScreen: document.getElementById("startScreen"),
            shieldElement: document.getElementById('shield')
        };
        
        // Add button listeners
        this.domElements.resetButton.addEventListener("click", () => this.resetGame());
        this.domElements.startButton.addEventListener("click", () => this.startGame());
    }
    
    setupEvents() {
        // Game state events
        this.events.subscribe('game:start', () => this.startGame());
        this.events.subscribe('game:reset', () => this.resetGame());
        this.events.subscribe('game:over', () => this.endGame());
        this.events.subscribe('game:victory', () => this.victory());
        
        // Player events
        this.events.subscribe('player:hit', () => this.handlePlayerHit());
        
        // Level events
        this.events.subscribe('level:complete', () => this.level.nextLevel());

        this.events.subscribe('score:updated', (score) => {
            if (this.domElements && this.domElements.scoreElement) {
                this.domElements.scoreElement.textContent = `Score: ${score}`;
            }
        });
    }
    
    setState(newState) {
        this.state = newState;
        this.events.publish('game:stateChanged', newState);
    }
    
    startGame() {
        console.log("Starting game...");
        if (this.domElements.startScreen) {
            this.domElements.startScreen.style.display = "none";
            this.resetGame();
        } else {
            console.error("Start screen not found");
        }
    }
    
    resetGame() {
        console.log("Resetting game...");
        
        // Clear existing elements
        this.entities.clear();
        
        // Reset game systems
        this.score.reset();
        this.level.reset();
        this.powerUps.reset();
        
        // Create new player and enemies
        this.entities.createPlayer();
        this.level.spawnEnemies();
        
        // Update UI
        this.domElements.scoreElement.textContent = `Score: ${this.score.getScore()}`;
        this.domElements.livesElement.textContent = `Lives: ${this.score.getLives()}`;
        this.domElements.gameOverElement.style.display = "none";
        
        // Set game state to active
        this.setState(GAME_STATES.PLAYING);
        
        console.log("Game reset complete");
    }
    
    handlePlayerHit() {
        const lives = this.score.decrementLives();
        this.domElements.livesElement.textContent = `Lives: ${lives}`;
        
        if (lives <= 0) {
            this.endGame();
        }
    }
    
    endGame() {
        this.setState(GAME_STATES.GAME_OVER);
        this.domElements.finalScoreElement.textContent = this.score.getScore();
        this.domElements.gameOverElement.style.display = "block";
    }
    
    victory() {
        console.log("Level complete!");
        this.level.increaseLevel();
        this.level.spawnEnemies();
    }
    
    update(deltaTime) {
        if (this.state === GAME_STATES.PLAYING) {
            // Update all game systems
            this.entities.update(deltaTime);
            this.level.updateEnemies(deltaTime);
            this.collisions.update(deltaTime);
            this.powerUps.update(deltaTime);
            
            // Check for victory
            if (this.entities.getEnemyCount() === 0) {
                this.events.publish('game:victory');
            }
        }
    }
    
    animate() {
        requestAnimationFrame(this.animate);
        
        const deltaTime = this.clock.getDelta();
        
        // Update game state
        this.update(deltaTime);
        
        // Render scene
        this.renderer.render();
    }
}