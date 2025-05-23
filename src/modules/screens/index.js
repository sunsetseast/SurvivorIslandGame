/**
 * @module Screens
 * Consolidates and re-exports all game screens
 */

// Export all screen modules
export { default as WelcomeScreen } from './WelcomeScreen.js';
export { default as CharacterSelectionScreen } from './CharacterSelectionScreen.js';
export { default as TribeDivisionScreen } from './TribeDivisionScreen.js';
// Uncomment as these modules get implemented
/*
export { default as CampScreen } from './CampScreen.js';
export { default as ChallengeScreen } from './ChallengeScreen.js';
export { default as TribalCouncilScreen } from './TribalCouncilScreen.js';
export { default as FireMakingChallengeScreen } from './FireMakingChallengeScreen.js';
*/

// Import all screens for convenient usage via the default export
import WelcomeScreen from './WelcomeScreen.js';
import CharacterSelectionScreen from './CharacterSelectionScreen.js';
import TribeDivisionScreen from './TribeDivisionScreen.js';
// Uncomment as these modules get implemented
/*
import CampScreen from './CampScreen.js';
import ChallengeScreen from './ChallengeScreen.js';
import TribalCouncilScreen from './TribalCouncilScreen.js';
import FireMakingChallengeScreen from './FireMakingChallengeScreen.js';
*/

// Default export for convenient importing
export default {
  WelcomeScreen,
  CharacterSelectionScreen,
  TribeDivisionScreen,
  // Uncomment as these modules get implemented
  /*
  CampScreen,
  ChallengeScreen,
  TribalCouncilScreen,
  FireMakingChallengeScreen
  */
};