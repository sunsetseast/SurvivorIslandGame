/**
 * @module EventManager
 * A pub-sub event system for communication between game components
 */

class EventManager {
  constructor() {
    this.events = {};
    this.middleware = [];
  }
  
  /**
   * Subscribes to an event
   * @param {string} event - The event name
   * @param {Function} callback - The callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback) {
    // Create event array if it doesn't exist
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    // Add callback to event array
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
      
      // Clean up empty event arrays
      if (this.events[event].length === 0) {
        delete this.events[event];
      }
    };
  }
  
  /**
   * Publishes an event with data
   * @param {string} event - The event name
   * @param {*} data - The data to pass to subscribers
   */
  publish(event, data) {
    // Process through middleware first
    const processedData = this.applyMiddleware(event, data);
    
    // Skip if no subscribers
    if (!this.events[event]) {
      return;
    }
    
    // Call each subscriber
    this.events[event].forEach(callback => {
      try {
        callback(processedData);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }
  
  /**
   * Adds middleware to process events before they reach subscribers
   * @param {Function} middlewareFn - Function(event, data) that returns modified data
   */
  addMiddleware(middlewareFn) {
    this.middleware.push(middlewareFn);
  }
  
  /**
   * Applies all middleware to the event data
   * @param {string} event - The event name
   * @param {*} data - The data to process
   * @returns {*} The processed data
   * @private
   */
  applyMiddleware(event, data) {
    return this.middleware.reduce((acc, mw) => {
      try {
        return mw(event, acc);
      } catch (error) {
        console.error(`Error in middleware for "${event}":`, error);
        return acc;
      }
    }, data);
  }
  
  /**
   * Removes all subscribers for an event
   * @param {string} event - The event name
   */
  clearEvent(event) {
    delete this.events[event];
  }
  
  /**
   * Removes all subscribers for all events
   */
  clearAllEvents() {
    this.events = {};
  }
  
  /**
   * Logs all current event subscribers (for debugging)
   */
  logSubscribers() {
    console.log('Current event subscribers:');
    Object.entries(this.events).forEach(([event, callbacks]) => {
      console.log(`${event}: ${callbacks.length} subscribers`);
    });
  }
}

// Create and export a singleton instance
const eventManager = new EventManager();
export default eventManager;

// Also export event names as constants for better type checking and autocomplete
export const GameEvents = {
  // Game state events
  GAME_INITIALIZED: 'game:initialized',
  GAME_STARTED: 'game:started',
  GAME_OVER: 'game:over',
  GAME_SAVED: 'game:saved',
  GAME_LOADED: 'game:loaded',
  
  // Phase/screen change events
  SCREEN_CHANGED: 'screen:changed',
  PHASE_CHANGED: 'phase:changed',
  DAY_ADVANCED: 'day:advanced',
  
  // Player events
  CHARACTER_SELECTED: 'player:characterSelected',
  PLAYER_ACTION: 'player:action',
  PLAYER_HEALTH_CHANGED: 'player:healthChanged',
  
  // Tribe events
  TRIBES_CREATED: 'tribes:created',
  TRIBES_MERGED: 'tribes:merged',
  TRIBE_RESOURCES_CHANGED: 'tribe:resourcesChanged',
  
  // Relationship events
  RELATIONSHIP_CHANGED: 'relationship:changed',
  ALLIANCE_FORMED: 'alliance:formed',
  ALLIANCE_BROKEN: 'alliance:broken',
  
  // Challenge events
  CHALLENGE_STARTED: 'challenge:started',
  CHALLENGE_COMPLETED: 'challenge:completed',
  IMMUNITY_GRANTED: 'immunity:granted',
  
  // Tribal council events
  VOTE_CAST: 'tribalCouncil:voteCast',
  PLAYER_ELIMINATED: 'tribalCouncil:playerEliminated',
  IDOL_PLAYED: 'tribalCouncil:idolPlayed',
  
  // Resource events
  ENERGY_CHANGED: 'resource:energyChanged',
  RESOURCE_COLLECTED: 'resource:collected',
  RESOURCE_USED: 'resource:used',
  
  // UI events
  UI_MODAL_OPENED: 'ui:modalOpened',
  UI_MODAL_CLOSED: 'ui:modalClosed',
  UI_DIALOGUE_SHOWN: 'ui:dialogueShown',
  UI_DIALOGUE_HIDDEN: 'ui:dialogueHidden'
};