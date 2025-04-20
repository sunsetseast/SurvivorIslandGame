/**
 * @module StorageUtils
 * Local storage utility functions for saving and loading game state
 */

const SAVE_GAME_KEY = 'survivor_island_save';

/**
 * Save game data to localStorage
 * @param {Object} gameData - The game data to save
 * @returns {boolean} True if save was successful, false otherwise
 */
export function saveGame(gameData) {
  try {
    // Create a sanitized version of game data to ensure it's JSON-safe
    const sanitizedData = sanitizeForStorage(gameData);
    
    // Convert to JSON string
    const gameDataString = JSON.stringify(sanitizedData);
    
    // Save to localStorage
    localStorage.setItem(SAVE_GAME_KEY, gameDataString);
    
    console.log('Game saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving game:', error);
    return false;
  }
}

/**
 * Load game data from localStorage
 * @returns {Object|null} The loaded game data or null if no save exists
 */
export function loadGame() {
  try {
    // Get saved data from localStorage
    const gameDataString = localStorage.getItem(SAVE_GAME_KEY);
    
    // Check if data exists
    if (!gameDataString) {
      console.log('No saved game found');
      return null;
    }
    
    // Parse JSON string to object
    const gameData = JSON.parse(gameDataString);
    
    console.log('Game loaded successfully');
    return gameData;
  } catch (error) {
    console.error('Error loading game:', error);
    return null;
  }
}

/**
 * Check if a save game exists
 * @returns {boolean} True if a save exists, false otherwise
 */
export function saveGameExists() {
  return !!localStorage.getItem(SAVE_GAME_KEY);
}

/**
 * Delete the save game
 * @returns {boolean} True if delete was successful, false otherwise
 */
export function deleteSaveGame() {
  try {
    localStorage.removeItem(SAVE_GAME_KEY);
    console.log('Save game deleted');
    return true;
  } catch (error) {
    console.error('Error deleting save game:', error);
    return false;
  }
}

/**
 * Sanitize an object for storage in localStorage
 * Removes circular references and non-serializable values
 * @param {Object} obj - The object to sanitize
 * @returns {Object} A sanitized copy of the object
 * @private
 */
function sanitizeForStorage(obj) {
  const seen = new WeakSet();
  
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    // Handle functions by converting to a special type marker
    if (typeof value === 'function') {
      return '[Function]';
    }
    
    // Handle sets by converting to arrays
    if (value instanceof Set) {
      return {
        _type: 'Set',
        values: Array.from(value)
      };
    }
    
    // Handle maps by converting to objects
    if (value instanceof Map) {
      return {
        _type: 'Map',
        entries: Array.from(value.entries())
      };
    }
    
    // Handle date objects
    if (value instanceof Date) {
      return {
        _type: 'Date',
        value: value.toISOString()
      };
    }
    
    // Handle DOM elements (don't try to serialize them)
    if (value instanceof HTMLElement) {
      return '[HTMLElement]';
    }
    
    // Handle errors
    if (value instanceof Error) {
      return {
        _type: 'Error',
        message: value.message,
        stack: value.stack
      };
    }
    
    // Handle objects with special properties or circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    
    return value;
  }));
}

/**
 * Restore special objects from their serialized forms
 * @param {Object} obj - The object to restore
 * @returns {Object} The restored object
 * @private
 */
function restoreFromStorage(obj) {
  function reviver(key, value) {
    // Skip primitives and non-objects
    if (typeof value !== 'object' || value === null) {
      return value;
    }
    
    // Restore special types based on _type marker
    if (value._type) {
      switch (value._type) {
        case 'Set':
          return new Set(value.values);
        case 'Map':
          return new Map(value.entries);
        case 'Date':
          return new Date(value.value);
        case 'Error':
          const error = new Error(value.message);
          error.stack = value.stack;
          return error;
      }
    }
    
    return value;
  }
  
  // Recursively process all properties
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'object' && value !== null) {
        if (value._type) {
          obj[key] = reviver(key, value);
        } else {
          restoreFromStorage(value);
        }
      }
    }
  }
  
  return obj;
}