/**
 * @module StorageUtils
 * Functions for saving and loading game data from localStorage
 */

const SAVE_KEY = 'survivorIslandSave';

/**
 * Saves game data to localStorage
 * @param {Object} gameData - The game data to save
 * @returns {boolean} Whether the save was successful
 */
export function saveGame(gameData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
    console.log('Game saved successfully');
    return true;
  } catch (e) {
    console.error('Error saving game:', e);
    
    // Handle quota exceeded errors
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn('Storage quota exceeded. Attempting to clear some space...');
      // Try to free up some space by removing non-essential data
      try {
        // Keep the current save but remove any backup saves
        localStorage.removeItem(`${SAVE_KEY}_backup`);
        // Try saving again
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
        console.log('Game saved successfully after clearing space');
        return true;
      } catch (retryError) {
        console.error('Failed to save game even after clearing space:', retryError);
      }
    }
    
    return false;
  }
}

/**
 * Creates a backup of the current save
 */
export function createBackup() {
  try {
    const currentSave = localStorage.getItem(SAVE_KEY);
    if (currentSave) {
      localStorage.setItem(`${SAVE_KEY}_backup`, currentSave);
    }
  } catch (e) {
    console.error('Error creating backup:', e);
  }
}

/**
 * Loads game data from localStorage
 * @returns {Object|null} The loaded game data or null if no save exists
 */
export function loadGame() {
  try {
    const savedGame = localStorage.getItem(SAVE_KEY);
    if (!savedGame) return null;
    
    // Attempt to parse the saved game
    const parsedSave = JSON.parse(savedGame);
    console.log('Game loaded successfully');
    return parsedSave;
  } catch (e) {
    console.error('Error loading game:', e);
    
    // Try loading from backup
    try {
      const backupSave = localStorage.getItem(`${SAVE_KEY}_backup`);
      if (backupSave) {
        console.log('Attempting to load from backup...');
        const parsedBackup = JSON.parse(backupSave);
        console.log('Game loaded from backup successfully');
        return parsedBackup;
      }
    } catch (backupError) {
      console.error('Error loading backup:', backupError);
    }
    
    return null;
  }
}

/**
 * Checks if a save game exists
 * @returns {boolean} True if a save exists, false otherwise
 */
export function saveGameExists() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Deletes the save game
 * @returns {boolean} Whether the deletion was successful
 */
export function deleteSaveGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(`${SAVE_KEY}_backup`);
    return true;
  } catch (e) {
    console.error('Error deleting save game:', e);
    return false;
  }
}