/**
 * @module Core
 * Consolidates and re-exports all core modules
 */

// Export all core modules
export { default as eventManager, GameEvents } from './EventManager.js';
export { default as screenManager } from './ScreenManager.js';
export { default as gameManager, GameState, GamePhase } from './GameManager.js';

// Import all core modules for convenient usage via the default export
import eventManager, { GameEvents } from './EventManager.js';
import screenManager from './ScreenManager.js';
import gameManager, { GameState, GamePhase } from './GameManager.js';

// Default export for convenient importing
export default {
  eventManager,
  GameEvents,
  screenManager,
  gameManager,
  GameState,
  GamePhase
};