// Input.js - Handles keyboard input
export class InputManager {
    constructor(events) {
        this.events = events;
        
        // Input state
        this.keys = {
            left: false,
            right: false,
            space: false,
            lastShot: 0,
            shotDelay: 500 // ms
        };
        
        // Bind methods
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }
    
    /**
     * Initialize input manager
     */
    init() {
        // Add event listeners
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
        
        console.log("Input manager initialized");
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - Keyboard event
     */
    onKeyDown(event) {
        switch (event.key) {
            case "ArrowLeft":
            case "a":
            case "A":
                this.keys.left = true;
                break;
            case "ArrowRight":
            case "d":
            case "D":
                this.keys.right = true;
                break;
            case " ":
                this.keys.space = true;
                break;
        }
        
        // Publish input state
        this.events.publish('input:state', {...this.keys});
    }
    
    /**
     * Handle keyup events
     * @param {KeyboardEvent} event - Keyboard event
     */
    onKeyUp(event) {
        switch (event.key) {
            case "ArrowLeft":
            case "a":
            case "A":
                this.keys.left = false;
                break;
            case "ArrowRight":
            case "d":
            case "D":
                this.keys.right = false;
                break;
            case " ":
                this.keys.space = false;
                break;
        }
        
        // Publish input state
        this.events.publish('input:state', {...this.keys});
    }
    
    /**
     * Clean up event listeners
     */
    destroy() {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
    }
}