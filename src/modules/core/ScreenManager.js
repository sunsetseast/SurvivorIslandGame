/**
 * @module ScreenManager
 * Manages screen transitions and screen-specific functionality
 */

import { showScreen, getElement } from '../utils/DOMUtils.js';
import eventManager, { GameEvents } from './EventManager.js';

class ScreenManager {
  constructor() {
    this.currentScreen = null;
    this.screens = {};
    this.transitions = {
      fadeIn: (element) => {
        element.style.opacity = 0;
        element.style.display = 'block';
        setTimeout(() => {
          element.style.opacity = 1;
          element.style.transition = 'opacity 0.3s ease-in-out';
        }, 50);
      },
      fadeOut: (element, callback) => {
        element.style.opacity = 0;
        element.style.transition = 'opacity 0.3s ease-in-out';
        setTimeout(() => {
          element.style.display = 'none';
          if (callback) callback();
        }, 300);
      }
    };
  }
  
  /**
   * Registers a screen with the manager
   * @param {string} screenId - The ID of the screen
   * @param {Object} screenModule - The screen module containing setup and teardown methods
   */
  registerScreen(screenId, screenModule) {
    this.screens[screenId] = screenModule;
    console.log(`Screen registered: ${screenId}`);
  }
  
  /**
   * Loads and displays a screen
   * @param {string} screenId - The ID of the screen to load
   * @param {Object} data - Optional data to pass to the screen setup method
   * @returns {boolean} Whether the screen was successfully loaded
   */
  loadScreen(screenId, data = {}) {
    const screenModule = this.screens[screenId];
    if (!screenModule) {
      console.error(`Screen module not found: ${screenId}`);
      return false;
    }
    
    const screenElement = getElement(`${screenId}-screen`);
    if (!screenElement) {
      console.error(`Screen element not found: ${screenId}-screen`);
      return false;
    }
    
    // Teardown current screen if exists
    if (this.currentScreen && this.screens[this.currentScreen] && 
        typeof this.screens[this.currentScreen].teardown === 'function') {
      this.screens[this.currentScreen].teardown();
    }
    
    // Hide all screens
    const allScreens = document.querySelectorAll('.game-screen');
    allScreens.forEach(screen => {
      screen.style.display = 'none';
      screen.classList.remove('active');
    });
    
    // Setup and show new screen
    if (typeof screenModule.setup === 'function') {
      screenModule.setup(data);
    } else {
      console.warn(`Screen ${screenId} has no setup method`);
    }
    
    // Show the screen with transition
    screenElement.classList.add('active');
    this.transitions.fadeIn(screenElement);
    
    // Update current screen
    this.currentScreen = screenId;
    
    // Publish screen changed event
    eventManager.publish(GameEvents.SCREEN_CHANGED, { 
      screenId,
      previousScreen: this.currentScreen,
      data
    });
    
    console.log(`Screen loaded: ${screenId}`);
    return true;
  }
  
  /**
   * Gets the current screen ID
   * @returns {string|null} The current screen ID
   */
  getCurrentScreen() {
    return this.currentScreen;
  }
  
  /**
   * Transitions to another screen with an animation
   * @param {string} screenId - The ID of the screen to transition to
   * @param {string} transitionType - The type of transition to use (fadeIn, etc.)
   * @param {Object} data - Optional data to pass to the screen setup method
   */
  transitionToScreen(screenId, transitionType = 'fadeIn', data = {}) {
    const currentScreenElement = this.currentScreen ? 
      getElement(`${this.currentScreen}-screen`) : null;
    
    if (currentScreenElement) {
      // Fade out current screen
      this.transitions.fadeOut(currentScreenElement, () => {
        // Then load the new screen
        this.loadScreen(screenId, data);
      });
    } else {
      // Just load the new screen
      this.loadScreen(screenId, data);
    }
  }
  
  /**
   * Creates a function that transitions to a specific screen
   * Useful for creating event handlers
   * @param {string} screenId - The ID of the screen to transition to
   * @param {Object} data - Optional data to pass to the screen setup method
   * @returns {Function} A function that transitions to the specified screen
   */
  createTransitionHandler(screenId, data = {}) {
    return () => this.transitionToScreen(screenId, 'fadeIn', data);
  }
  
  /**
   * Refreshes the current screen
   * @param {Object} data - Optional data to pass to the screen setup method
   */
  refreshCurrentScreen(data = {}) {
    if (this.currentScreen) {
      this.loadScreen(this.currentScreen, data);
    }
  }
  
  /**
   * Shows an element with a transition
   * @param {string|HTMLElement} elementId - The ID or element to show
   * @param {string} transitionType - The type of transition to use (fadeIn, etc.)
   */
  showElement(elementId, transitionType = 'fadeIn') {
    const element = typeof elementId === 'string' ? getElement(elementId) : elementId;
    if (element && this.transitions[transitionType]) {
      this.transitions[transitionType](element);
    }
  }
  
  /**
   * Hides an element with a transition
   * @param {string|HTMLElement} elementId - The ID or element to hide
   * @param {string} transitionType - The type of transition to use (fadeOut, etc.)
   * @param {Function} callback - Optional callback to execute after transition
   */
  hideElement(elementId, transitionType = 'fadeOut', callback) {
    const element = typeof elementId === 'string' ? getElement(elementId) : elementId;
    if (element && this.transitions[transitionType]) {
      this.transitions[transitionType](element, callback);
    }
  }
}

// Create and export singleton instance
const screenManager = new ScreenManager();
export default screenManager;