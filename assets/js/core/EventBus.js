// EventBus.js - Event system for module communication

export class EventBus {
    constructor() {
        this.subscribers = {};
    }
    
    /**
     * Subscribe to an event
     * @param {string} event - Event name to subscribe to
     * @param {function} callback - Function to call when event is published
     * @return {function} - Unsubscribe function
     */
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        
        this.subscribers[event].push(callback);
        
        // Return an unsubscribe function
        return () => {
            this.subscribers[event] = this.subscribers[event].filter(
                subscriber => subscriber !== callback
            );
        };
    }
    
    /**
     * Publish an event with data
     * @param {string} event - Event name to publish
     * @param {any} data - Data to pass to subscribers
     */
    publish(event, data) {
        if (!this.subscribers[event]) {
            return;
        }
        
        this.subscribers[event].forEach(callback => {
            callback(data);
        });
    }
    
    /**
     * Unsubscribe all callbacks for an event
     * @param {string} event - Event to clear
     */
    clear(event) {
        if (event) {
            delete this.subscribers[event];
        } else {
            this.subscribers = {};
        }
    }
}