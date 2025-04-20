/**
 * @module EventManager
 * Centralized event system using the Publish-Subscribe pattern
 */

// Define game events to ensure consistency in event naming
export const GameEvents = {
  // Core events
  GAME_INITIALIZED: 'game:initialized',
  GAME_STARTED: 'game:started',
  GAME_SAVED: 'game:saved',
  GAME_LOADED: 'game:loaded',
  GAME_OVER: 'game:over',
  
  // Phase events
  PHASE_CHANGED: 'phase:changed',
  DAY_ADVANCED: 'day:advanced',
  
  // Screen events
  SCREEN_CHANGED: 'screen:changed',
  SCREEN_REFRESHED: 'screen:refreshed',
  DIALOG_SHOWN: 'dialog:shown',
  DIALOG_CLOSED: 'dialog:closed',
  
  // Character events
  CHARACTER_SELECTED: 'character:selected',
  PLAYER_HEALTH_CHANGED: 'player:healthChanged',
  
  // Tribe events
  TRIBES_CREATED: 'tribes:created',
  TRIBES_MERGED: 'tribes:merged',
  TRIBE_RESOURCES_CHANGED: 'tribe:resourcesChanged',
  TRIBE_IMMUNITY_CHANGED: 'tribe:immunityChanged',
  
  // Challenge events
  CHALLENGE_STARTED: 'challenge:started',
  CHALLENGE_COMPLETED: 'challenge:completed',
  IMMUNITY_WON: 'immunity:won',
  
  // Tribal council events
  TRIBAL_COUNCIL_STARTED: 'tribalCouncil:started',
  VOTE_CAST: 'vote:cast',
  IDOL_PLAYED: 'idol:played',
  SURVIVOR_ELIMINATED: 'survivor:eliminated',
  
  // Relationship events
  RELATIONSHIP_CHANGED: 'relationship:changed',
  
  // Alliance events
  ALLIANCE_FORMED: 'alliance:formed',
  ALLIANCE_DISBANDED: 'alliance:disbanded',
  ALLIANCE_MEMBER_ADDED: 'alliance:memberAdded',
  ALLIANCE_MEMBER_REMOVED: 'alliance:memberRemoved'
};

class EventManager {
  constructor() {
    this.events = new Map();
    this.debugMode = false;
  }
  
  /**
   * Enable or disable debug logging
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }
  
  /**
   * Subscribe to an event
   * @param {string} eventName - The name of the event
   * @param {Function} callback - The callback function to execute when the event is published
   * @returns {Function} Unsubscribe function
   */
  subscribe(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    
    const handlers = this.events.get(eventName);
    handlers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventName, callback);
    };
  }
  
  /**
   * Unsubscribe from an event
   * @param {string} eventName - The name of the event
   * @param {Function} callback - The callback function to remove
   * @returns {boolean} Whether the unsubscribe was successful
   */
  unsubscribe(eventName, callback) {
    if (!this.events.has(eventName)) {
      return false;
    }
    
    const handlers = this.events.get(eventName);
    const index = handlers.indexOf(callback);
    
    if (index === -1) {
      return false;
    }
    
    handlers.splice(index, 1);
    
    // If no more handlers, remove the event
    if (handlers.length === 0) {
      this.events.delete(eventName);
    }
    
    return true;
  }
  
  /**
   * Publish an event
   * @param {string} eventName - The name of the event
   * @param {Object} data - The data to pass to the callback functions
   */
  publish(eventName, data = {}) {
    if (this.debugMode) {
      console.log(`Event published: ${eventName}`, data);
    }
    
    if (!this.events.has(eventName)) {
      return;
    }
    
    const handlers = this.events.get(eventName);
    
    // Execute each handler with the event data
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  }
  
  /**
   * Subscribe to an event once (auto-unsubscribe after first trigger)
   * @param {string} eventName - The name of the event
   * @param {Function} callback - The callback function to execute when the event is published
   * @returns {Function} Unsubscribe function
   */
  once(eventName, callback) {
    const wrappedCallback = (data) => {
      // Unsubscribe first
      this.unsubscribe(eventName, wrappedCallback);
      // Then call the original callback
      callback(data);
    };
    
    return this.subscribe(eventName, wrappedCallback);
  }
  
  /**
   * Remove all event listeners
   */
  clear() {
    this.events.clear();
  }
  
  /**
   * Remove all event listeners for a specific event
   * @param {string} eventName - The name of the event
   */
  clearEvent(eventName) {
    this.events.delete(eventName);
  }
  
  /**
   * Get count of subscribers for a specific event
   * @param {string} eventName - The name of the event
   * @returns {number} The number of subscribers
   */
  getSubscriberCount(eventName) {
    if (!this.events.has(eventName)) {
      return 0;
    }
    
    return this.events.get(eventName).length;
  }
  
  /**
   * Get all registered events
   * @returns {Array} Array of event names
   */
  getEvents() {
    return Array.from(this.events.keys());
  }
}

// Create and export singleton instance
const eventManager = new EventManager();
export default eventManager;