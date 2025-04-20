/**
 * @module Systems
 * Consolidates and re-exports all game systems
 */

// Export all system modules
export { default as DialogueSystem } from './DialogueSystem.js';
export { default as EnergySystem } from './EnergySystem.js';
export { default as IdolSystem } from './IdolSystem.js';
// Uncomment as these modules get implemented
/*
export { default as RelationshipSystem } from './RelationshipSystem.js';
export { default as AllianceSystem } from './AllianceSystem.js';
export { default as ChallengeSystem } from './ChallengeSystem.js';
export { default as TribalCouncilSystem } from './TribalCouncilSystem.js';
*/

// Import all systems for convenient usage via the default export
import DialogueSystem from './DialogueSystem.js';
import EnergySystem from './EnergySystem.js';
import IdolSystem from './IdolSystem.js';
// Uncomment as these modules get implemented
/*
import RelationshipSystem from './RelationshipSystem.js';
import AllianceSystem from './AllianceSystem.js';
import ChallengeSystem from './ChallengeSystem.js';
import TribalCouncilSystem from './TribalCouncilSystem.js';
*/

// Default export for convenient importing
export default {
  DialogueSystem,
  EnergySystem,
  IdolSystem,
  // Uncomment as these modules get implemented
  /*
  RelationshipSystem,
  AllianceSystem,
  ChallengeSystem,
  TribalCouncilSystem
  */
};