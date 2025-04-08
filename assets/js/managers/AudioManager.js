// AudioManager.js - Handles game audio and music
export class AudioManager {
    constructor(events) {
        this.events = events;
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        this.musicVolume = 0.5;
        this.soundVolume = 0.7;
        
        // Initialize sounds
        this.init();
        
        // Set up event listeners
        this.setupEvents();
    }
    
    /**
     * Initialize audio manager and load sounds
     */
    init() {
        // Load sound effects
        this.loadSound('playerShoot', './assets/audio/player-shoot.mp3');
        this.loadSound('enemyShoot', './assets/audio/enemy-shoot.mp3');
        this.loadSound('explosion', './assets/audio/explosion.mp3');
        this.loadSound('playerHit', './assets/audio/player-hit.mp3');
        this.loadSound('powerUp', './assets/audio/power-up.mp3');
        this.loadSound('gameOver', './assets/audio/game-over.mp3');
        this.loadSound('levelComplete', './assets/audio/level-complete.mp3');
        
        // Load music tracks
        this.loadMusic('./assets/audio/game-music.mp3');
        
        console.log('Audio manager initialized');
    }
    
    /**
     * Set up event listeners
     */
    setupEvents() {
        // Game events
        this.events.subscribe('game:stateChanged', state => this.handleGameStateChange(state));
        
        // Player events
        this.events.subscribe('player:shoot', () => this.playSound('playerShoot'));
        this.events.subscribe('player:hit', () => this.playSound('playerHit'));
        this.events.subscribe('player:shieldActivated', () => this.playSound('powerUp'));
        
        // Enemy events
        this.events.subscribe('enemy:shoot', () => this.playSound('enemyShoot'));
        this.events.subscribe('enemy:destroyed', () => this.playSound('explosion'));
        
        // PowerUp events
        this.events.subscribe('powerUp:collected', () => this.playSound('powerUp'));
        
        // Level events
        this.events.subscribe('game:victory', () => this.playSound('levelComplete'));
    }
    
    /**
     * Load a sound effect
     * @param {string} name - Sound identifier
     * @param {string} path - Path to sound file
     */
    loadSound(name, path) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.sounds[name] = audio;
    }
    
    /**
     * Load background music
     * @param {string} path - Path to music file
     */
    loadMusic(path) {
        this.music = new Audio(path);
        this.music.loop = true;
        this.music.volume = this.musicVolume;
    }
    
    /**
     * Play a sound effect
     * @param {string} name - Sound identifier to play
     */
    playSound(name) {
        if (this.isMuted || !this.sounds[name]) return;
        
        // Clone the audio to allow overlapping sounds
        const sound = this.sounds[name].cloneNode();
        sound.volume = this.soundVolume;
        sound.play().catch(error => {
            console.warn(`Failed to play sound "${name}":`, error);
        });
    }
    
    /**
     * Start playing background music
     */
    playMusic() {
        if (this.isMuted || !this.music) return;
        
        this.music.currentTime = 0;
        this.music.play().catch(error => {
            console.warn('Failed to play background music:', error);
        });
    }
    
    /**
     * Stop background music
     */
    stopMusic() {
        if (!this.music) return;
        
        this.music.pause();
        this.music.currentTime = 0;
    }
    
    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
    }
    
    /**
     * Set sound effects volume
     * @param {number} volume - Volume level (0-1)
     */
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Mute or unmute all audio
     * @param {boolean} muted - Whether audio should be muted
     */
    setMuted(muted) {
        this.isMuted = muted;
        
        if (muted) {
            this.stopMusic();
        } else if (this.music) {
            this.playMusic();
        }
    }
    
    /**
     * Handle game state changes
     * @param {string} state - New game state
     */
    handleGameStateChange(state) {
        switch (state) {
            case 'playing':
                this.playMusic();
                break;
                
            case 'game_over':
                this.playSound('gameOver');
                this.stopMusic();
                break;
                
            case 'paused':
                if (this.music) {
                    this.music.pause();
                }
                break;
                
            case 'start_screen':
                this.stopMusic();
                break;
        }
    }
}