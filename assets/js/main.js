// main.js
// main.js - Entry point for the game
import { Game } from './core/Game.js';

// Initialize the game when the window is loaded
window.onload = () => {
    console.log("Window loaded, initializing game...");
    const game = new Game();
    game.init();
};