/**
 * @module Core
 * Consolidates and re-exports core game management modules
 */

// Re-export all core modules
export { default as GameManager, GameState, GamePhase, GameSequence } from './GameManager.js';
export { default as EventManager, GameEvents } from './EventManager.js';
export { default as ScreenManager } from './ScreenManager.js';

// Import all for convenient usage via the default export
import GameManager, { GameState, GamePhase, GameSequence } from './GameManager.js';
import EventManager, { GameEvents } from './EventManager.js';
import ScreenManager from './ScreenManager.js';

// Default export for convenient importing
export default {
  GameManager,
  GameState,
  GamePhase,
  GameSequence,
  EventManager,
  GameEvents,
  ScreenManager
};