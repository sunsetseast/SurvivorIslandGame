/**
 * @module Utils
 * Consolidates and re-exports all utility functions
 */

// Re-export all utility modules for easier importing
export * from './CommonUtils.js';
export * from './DOMUtils.js';
export * from './StorageUtils.js';
export { default as TimerManager } from './TimerManager.js';

// For backwards compatibility, also export some common
// functions directly that were previously global
import { getRandomItem, shuffleArray, clamp, getRandomInt, deepCopy, formatProgressWidth } from './CommonUtils.js';
import { clearChildren, createElement, showScreen } from './DOMUtils.js';
import { saveGame, loadGame, saveGameExists, deleteSaveGame } from './StorageUtils.js';
import TimerManager from './TimerManager.js';

// Default export for convenient importing 
export default {
  // Common utils
  getRandomItem,
  shuffleArray,
  clamp,
  getRandomInt,
  deepCopy,
  formatProgressWidth,
  
  // DOM utils
  clearChildren,
  createElement,
  showScreen,
  
  // Storage utils
  saveGame,
  loadGame,
  saveGameExists,
  deleteSaveGame,
  
  // Timer management
  TimerManager
};