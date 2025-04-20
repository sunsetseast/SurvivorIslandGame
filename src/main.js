/**
 * Main entry point for the Survivor Island game
 * Initializes game systems and starts the game
 */

import {
  GameManager,
  EventManager,
  ScreenManager,
  GameEvents
} from './modules/core/index.js';

import { TimerManager } from './modules/utils/index.js';

// Import game systems
import DialogueSystem from './modules/systems/DialogueSystem.js';
import EnergySystem from './modules/systems/EnergySystem.js';
import RelationshipSystem from './modules/systems/RelationshipSystem.js';
import AllianceSystem from './modules/systems/AllianceSystem.js';
import ChallengeSystem from './modules/systems/ChallengeSystem.js';
import TribalCouncilSystem from './modules/systems/TribalCouncilSystem.js';
import IdolSystem from './modules/systems/IdolSystem.js';

// Import screens
import WelcomeScreen from './modules/screens/WelcomeScreen.js';
import CharacterSelectionScreen from './modules/screens/CharacterSelectionScreen.js';
import TribeDivisionScreen from './modules/screens/TribeDivisionScreen.js';
import CampScreen from './modules/screens/CampScreen.js';
import ChallengeScreen from './modules/screens/ChallengeScreen.js';
import TribalCouncilScreen from './modules/screens/TribalCouncilScreen.js';
import FireMakingChallengeScreen from './modules/screens/FireMakingChallengeScreen.js';

/**
 * Initialize the game when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Survivor Island game...');
  
  // Enable debug mode for development (comment out for production)
  EventManager.setDebugMode(true);
  
  // Register screens with the ScreenManager
  ScreenManager.registerScreen('welcome', WelcomeScreen);
  ScreenManager.registerScreen('characterSelection', CharacterSelectionScreen);
  ScreenManager.registerScreen('tribeDivision', TribeDivisionScreen);
  ScreenManager.registerScreen('camp', CampScreen);
  ScreenManager.registerScreen('challenge', ChallengeScreen);
  ScreenManager.registerScreen('tribalCouncil', TribalCouncilScreen);
  ScreenManager.registerScreen('fireMakingChallenge', FireMakingChallengeScreen);
  
  // Initialize systems
  const dialogueSystem = new DialogueSystem(GameManager);
  const energySystem = new EnergySystem(GameManager);
  const relationshipSystem = new RelationshipSystem(GameManager);
  const allianceSystem = new AllianceSystem(GameManager);
  const challengeSystem = new ChallengeSystem(GameManager);
  const tribalCouncilSystem = new TribalCouncilSystem(GameManager);
  const idolSystem = new IdolSystem(GameManager);
  
  // Initialize the GameManager with all systems
  GameManager.init({
    screenManager: ScreenManager,
    dialogueSystem,
    energySystem,
    relationshipSystem,
    allianceSystem,
    challengeSystem,
    tribalCouncilSystem,
    idolSystem,
    timerManager: TimerManager
  });
  
  // Initialize the game
  GameManager.initializeGame();
  
  // Subscribe to game events for analytics/tracking
  EventManager.subscribe(GameEvents.GAME_INITIALIZED, () => {
    console.log('Game initialized successfully');
  });
  
  EventManager.subscribe(GameEvents.SCREEN_CHANGED, ({ screenId }) => {
    console.log(`Screen changed to: ${screenId}`);
  });
  
  // Log startup time
  console.log(`Game startup completed in ${performance.now().toFixed(2)}ms`);
});

/**
 * Cleanup resources on page unload
 */
window.addEventListener('beforeunload', () => {
  // Clear all timers to prevent memory leaks
  TimerManager.clearAll();
  
  // Save game state if needed
  if (GameManager.getGameState() !== 'welcome') {
    GameManager.saveGame();
  }
});