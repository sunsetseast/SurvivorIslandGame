/**
 * Main entry point for the Survivor Island game
 * Initializes game systems and starts the game
 */

import { gameManager, screenManager, eventManager, GameEvents } from './modules/core/index.js';
import { WelcomeScreen, CharacterSelectionScreen, TribeDivisionScreen } from './modules/screens/index.js';
import * as systems from './modules/systems/index.js';
import timerManager from './modules/utils/TimerManager.js';

// Game constants
const GAME_TITLE = 'Survivor Island';
const GAME_VERSION = '1.0.0';

/**
 * Initialize the game when the DOM is loaded
 */
function init() {
  console.log(`Initializing ${GAME_TITLE} v${GAME_VERSION}`);
  
  // Register screens with screen manager
  screenManager.registerScreen('welcome', WelcomeScreen);
  screenManager.registerScreen('characterSelection', CharacterSelectionScreen);
  screenManager.registerScreen('tribeDivision', TribeDivisionScreen);
  // Add more screens as they're implemented
  
  // Register systems with game manager
  gameManager.registerSystem('dialogueSystem', new systems.DialogueSystem(gameManager));
  gameManager.registerSystem('energySystem', new systems.EnergySystem(gameManager));
  gameManager.registerSystem('idolSystem', new systems.IdolSystem(gameManager));
  gameManager.registerSystem('relationshipSystem', new systems.RelationshipSystem(gameManager));
  gameManager.registerSystem('allianceSystem', new systems.AllianceSystem(gameManager));
  // Add more systems as they're implemented
  
  // Subscribe to events
  eventManager.subscribe(GameEvents.GAME_INITIALIZED, handleGameInitialized);
  eventManager.subscribe(GameEvents.GAME_STARTED, handleGameStarted);
  
  // Initialize game manager
  gameManager.initialize();
  
  // Check for saved game
  if (gameManager.hasSavedGame()) {
    const continueButton = document.getElementById('continue-game-button');
    if (continueButton) {
      continueButton.style.display = 'block';
    }
  }
  
  // Setup UI event listeners
  setupEventListeners();
  
  console.log('Initialization complete');
}

/**
 * Handle game initialized event
 * @param {Object} data - Event data
 */
function handleGameInitialized(data) {
  console.log('Game initialized');
  
  // Additional setup can be done here
}

/**
 * Handle game started event
 * @param {Object} data - Event data
 */
function handleGameStarted(data) {
  console.log('Game started with settings:', data.settings);
  
  // Additional setup for new game
}

/**
 * Setup event listeners for UI elements
 */
function setupEventListeners() {
  // New Game button
  const newGameButton = document.getElementById('new-game-button');
  if (newGameButton) {
    newGameButton.addEventListener('click', () => {
      // Start new game with default settings
      gameManager.startNewGame();
    });
  }
  
  // Continue Game button
  const continueButton = document.getElementById('continue-game-button');
  if (continueButton) {
    continueButton.addEventListener('click', () => {
      // Load saved game
      gameManager.loadGame();
    });
  }
  
  // Settings button
  const settingsButton = document.getElementById('settings-button');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      // Show settings
      const settingsDialog = document.getElementById('settings-dialog');
      if (settingsDialog) {
        settingsDialog.style.display = 'block';
      }
    });
  }
  
  // Game info button
  const infoButton = document.getElementById('info-button');
  if (infoButton) {
    infoButton.addEventListener('click', () => {
      // Show game info
      const infoDialog = document.getElementById('info-dialog');
      if (infoDialog) {
        infoDialog.style.display = 'block';
      }
    });
  }
  
  // Generic dialog close buttons
  const closeButtons = document.querySelectorAll('.dialog-close');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Find parent dialog
      const dialog = button.closest('.dialog');
      if (dialog) {
        dialog.style.display = 'none';
      }
    });
  });
  
  // Handle escape key for dialogs
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      // Hide all dialogs
      const dialogs = document.querySelectorAll('.dialog');
      dialogs.forEach(dialog => {
        dialog.style.display = 'none';
      });
    }
  });
}

/**
 * Cleanup resources on page unload
 */
function cleanup() {
  // Save game state if needed
  if (gameManager.isInitialized && gameManager.getGameState() !== 'welcome') {
    gameManager.saveGame();
  }
  
  // Clear all timers
  timerManager.clearAll();
  
  console.log('Game cleanup complete');
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup when page is unloaded
window.addEventListener('beforeunload', cleanup);

// Expose game manager to global scope for debugging
window.gameManager = gameManager;

// Export for module usage
export { gameManager, screenManager, eventManager };