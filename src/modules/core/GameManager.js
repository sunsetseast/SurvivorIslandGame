/**
 * @module GameManager
 * Central manager for the Survivor Island game state and systems
 */

import eventManager, { GameEvents } from './EventManager.js';
import { saveGame, loadGame, saveGameExists } from '../utils/StorageUtils.js';
import { showScreen, getElement } from '../utils/DOMUtils.js';

// Game state enum
export const GameState = {
  WELCOME: 'welcome',
  CHARACTER_SELECTION: 'characterSelection',
  TRIBE_DIVISION: 'tribeDivision',
  CAMP: 'camp',
  CHALLENGE: 'challenge',
  TRIBAL_COUNCIL: 'tribalCouncil',
  MERGE: 'merge',
  FINAL_TRIBAL_COUNCIL: 'finalTribalCouncil',
  FIRE_MAKING_CHALLENGE: 'fireMakingChallenge',
  GAME_OVER: 'gameOver'
};

// Game phase enum
export const GamePhase = {
  PRE_MERGE: 'preMerge',
  POST_MERGE: 'postMerge',
  FINAL: 'final'
};

// Game sequence enum
export const GameSequence = {
  PRE_CHALLENGE: 'preChallenge',
  POST_CHALLENGE: 'postChallenge'
};

class GameManager {
  constructor() {
    // Game state
    this.gameState = GameState.WELCOME;
    this.gamePhase = GamePhase.PRE_MERGE;
    this.day = 1;
    this.tribes = [];
    this.playerCharacter = null;
    this.jury = [];
    
    // Merge settings
    this.firstMergeThreshold = 14; // First merge (3→2 tribes) at 14 players left
    this.finalMergeThreshold = 12; // Final merge (to 1 tribe) at 12 players left
    this.tribeCount = 2; // Default to 2 tribes, can be changed in welcome screen
    
    // Game flow tracking
    this.gameSequence = GameSequence.PRE_CHALLENGE;
    this.lastVotedOut = null; // Store the last person voted out to display message
    this.npcTribalResults = []; // Store eliminated players from NPC tribes
    
    // Systems will be initialized and attached via the init method
    this.systems = {};
    
    // Set up event subscriptions
    this._setupEventListeners();
  }
  
  /**
   * Initializes all game systems and UI
   * @param {Object} systemsConfig - Configuration object containing system instances
   */
  init(systemsConfig) {
    // Attach all systems
    this.systems = systemsConfig;
    
    // Initialize all systems
    this._initializeSystems();
    
    // Initialize UI elements
    this._initializeUI();
    
    // Publish initialization event
    eventManager.publish(GameEvents.GAME_INITIALIZED, {
      gameState: this.gameState,
      gamePhase: this.gamePhase,
      day: this.day
    });
  }
  
  /**
   * Initializes all game systems
   * @private
   */
  _initializeSystems() {
    // Initialize each system with this GameManager instance
    Object.values(this.systems).forEach(system => {
      if (system && typeof system.initialize === 'function') {
        system.initialize();
      }
    });
  }
  
  /**
   * Initializes UI elements and event listeners
   * @private
   */
  _initializeUI() {
    // Initialize hamburger menu
    const hamburgerIcon = getElement('hamburger-icon');
    const gameMenu = getElement('game-menu');
    const closeMenu = getElement('close-menu');
    
    if (hamburgerIcon && gameMenu && closeMenu) {
      hamburgerIcon.addEventListener('click', () => {
        gameMenu.classList.toggle('hidden');
        this._updateGameMenu();
      });
      
      closeMenu.addEventListener('click', () => {
        gameMenu.classList.add('hidden');
      });
    }
    
    // Initialize save/load buttons
    const saveGameButton = getElement('save-game-button');
    const loadGameButton = getElement('load-game-button');
    const restartGameButton = getElement('restart-game-button');
    
    if (saveGameButton) {
      saveGameButton.addEventListener('click', () => this.saveGame());
    }
    
    if (loadGameButton) {
      loadGameButton.addEventListener('click', () => this.loadGame());
      // Enable/disable based on save existence
      loadGameButton.disabled = !saveGameExists();
    }
    
    if (restartGameButton) {
      restartGameButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to restart the game? All progress will be lost.')) {
          this.initializeGame();
        }
      });
    }
  }
  
  /**
   * Sets up event listeners for the event manager
   * @private
   */
  _setupEventListeners() {
    // Listen for screen change events
    eventManager.subscribe(GameEvents.SCREEN_CHANGED, ({ screenId }) => {
      showScreen(screenId);
    });
    
    // Listen for player health changes
    eventManager.subscribe(GameEvents.PLAYER_HEALTH_CHANGED, ({ health }) => {
      this._updatePlayerHealthDisplay(health);
    });
    
    // Listen for tribe resource changes
    eventManager.subscribe(GameEvents.TRIBE_RESOURCES_CHANGED, ({ resources }) => {
      this._updateResourcesDisplay(resources);
    });
  }
  
  /**
   * Updates the game menu with current game information
   * @private
   */
  _updateGameMenu() {
    const playerStats = getElement('player-stats');
    const gameInfo = getElement('game-info');
    const tribeInfo = getElement('tribe-info');
    const idolStatus = getElement('idol-status');
    const idolsInPlay = getElement('idols-in-play');
    const immunityStatus = getElement('immunity-status');
    
    if (!playerStats || !gameInfo || !tribeInfo) return;
    
    // Update player stats
    if (this.playerCharacter) {
      playerStats.innerHTML = `
        <p>Name: ${this.playerCharacter.name}</p>
        <p>Health: ${this.playerCharacter.health}%</p>
        <p>Physical: ${this.playerCharacter.physical}</p>
        <p>Mental: ${this.playerCharacter.mental}</p>
        <p>Personality: ${this.playerCharacter.personality}</p>
      `;
    } else {
      playerStats.innerHTML = '<p>No character selected</p>';
    }
    
    // Update game info
    gameInfo.innerHTML = `
      <p>Phase: ${this.gamePhase}</p>
      <p>Day: ${this.day}</p>
      <p>Players remaining: ${this._getTotalPlayerCount()}</p>
    `;
    
    // Update tribe info
    if (this.tribes.length > 0) {
      let tribeHTML = '';
      this.tribes.forEach(tribe => {
        tribeHTML += `<p>${tribe.tribeName}: ${tribe.members.length} members</p>`;
      });
      tribeInfo.innerHTML = tribeHTML;
    } else {
      tribeInfo.innerHTML = '<p>No tribes created yet</p>';
    }
    
    // Update idol and immunity status
    if (this.playerCharacter) {
      if (idolStatus) {
        idolStatus.textContent = `Hidden Immunity Idol: ${this.playerCharacter.hasIdol ? 'Yes' : 'No'}`;
      }
      if (immunityStatus) {
        immunityStatus.textContent = `Immunity: ${this.playerCharacter.hasImmunity ? 'Yes' : 'No'}`;
      }
    }
    
    // Update idols in play
    if (idolsInPlay && this.systems.idolSystem) {
      idolsInPlay.textContent = `Idols in Play: ${this.systems.idolSystem.getIdolsInPlay()}`;
    }
  }
  
  /**
   * Updates player health display
   * @param {number} health - The player's current health
   * @private
   */
  _updatePlayerHealthDisplay(health) {
    const playerHealthBar = getElement('player-health-bar');
    const playerHealthValue = getElement('player-health-value');
    
    if (playerHealthBar && playerHealthValue) {
      const percentage = Math.min(100, Math.max(0, health));
      playerHealthBar.style.width = `${percentage}%`;
      playerHealthValue.textContent = Math.round(health).toString();
      
      // Update color based on health
      if (percentage < 30) {
        playerHealthBar.style.backgroundColor = '#f44336'; // Red
      } else if (percentage < 70) {
        playerHealthBar.style.backgroundColor = '#ff9800'; // Orange
      } else {
        playerHealthBar.style.backgroundColor = '#4caf50'; // Green
      }
    }
  }
  
  /**
   * Updates resources display
   * @param {Object} resources - The resource values
   * @private
   */
  _updateResourcesDisplay(resources) {
    const { fire, water, food, tribeHealth } = resources;
    
    const fireBar = getElement('fire-bar');
    const waterBar = getElement('water-bar');
    const foodBar = getElement('food-bar');
    const tribeHealthBar = getElement('tribe-health-bar');
    
    const fireValue = getElement('fire-value');
    const waterValue = getElement('water-value');
    const foodValue = getElement('food-value');
    const tribeHealthValue = getElement('tribe-health-value');
    
    // Update fire
    if (fireBar && fireValue) {
      const firePercentage = Math.min(100, Math.max(0, fire));
      fireBar.style.width = `${firePercentage}%`;
      fireValue.textContent = Math.round(fire).toString();
      fireBar.style.backgroundColor = firePercentage < 30 ? '#f44336' : 
                                      firePercentage < 70 ? '#ff9800' : '#4caf50';
    }
    
    // Update water
    if (waterBar && waterValue) {
      const waterPercentage = Math.min(100, Math.max(0, water));
      waterBar.style.width = `${waterPercentage}%`;
      waterValue.textContent = Math.round(water).toString();
      waterBar.style.backgroundColor = waterPercentage < 30 ? '#f44336' : 
                                       waterPercentage < 70 ? '#ff9800' : '#4caf50';
    }
    
    // Update food
    if (foodBar && foodValue) {
      const foodPercentage = Math.min(100, Math.max(0, food));
      foodBar.style.width = `${foodPercentage}%`;
      foodValue.textContent = Math.round(food).toString();
      foodBar.style.backgroundColor = foodPercentage < 30 ? '#f44336' : 
                                       foodPercentage < 70 ? '#ff9800' : '#4caf50';
    }
    
    // Update tribe health
    if (tribeHealthBar && tribeHealthValue) {
      const healthPercentage = Math.min(100, Math.max(0, tribeHealth));
      tribeHealthBar.style.width = `${healthPercentage}%`;
      tribeHealthValue.textContent = Math.round(tribeHealth).toString();
      tribeHealthBar.style.backgroundColor = healthPercentage < 30 ? '#f44336' : 
                                            healthPercentage < 70 ? '#ff9800' : '#4caf50';
    }
  }
  
  /**
   * Initializes a new game
   */
  initializeGame() {
    // Reset state
    this.gameState = GameState.WELCOME;
    this.gamePhase = GamePhase.PRE_MERGE;
    this.day = 1;
    this.tribes = [];
    this.playerCharacter = null;
    this.jury = [];
    this.tribeCount = 2; // Reset to default
    this.lastEliminatedSurvivor = null; // Track last eliminated player
    this.dayAdvanced = false; // Track if a day was advanced
    this.gameSequence = GameSequence.PRE_CHALLENGE; // Reset game sequence
    this.lastVotedOut = null; // Reset last voted out
    this.npcTribalResults = []; // Reset NPC tribal council results
    
    // Re-initialize all systems
    this._initializeSystems();
    
    // Show welcome screen
    this.setGameState(GameState.WELCOME);
    
    // Publish game started event
    eventManager.publish(GameEvents.GAME_STARTED, {
      gameState: this.gameState,
      gamePhase: this.gamePhase,
      day: this.day
    });
  }
  
  /**
   * Starts the game
   */
  startGame() {
    // Show character selection screen
    this.setGameState(GameState.CHARACTER_SELECTION);
    
    // Load character selection screen
    if (this.systems.screenManager) {
      this.systems.screenManager.loadScreen('characterSelection');
    } else {
      console.warn('Screen manager not initialized, falling back to direct screen loading');
      const characterSelectionScreen = getElement('character-selection-screen');
      if (characterSelectionScreen) {
        showScreen('character-selection-screen');
      }
    }
  }
  
  /**
   * Sets the game state and updates UI
   * @param {string} newState - The new game state
   */
  setGameState(newState) {
    // Validate state
    if (!Object.values(GameState).includes(newState)) {
      console.error(`Invalid game state: ${newState}`);
      return;
    }
    
    const oldState = this.gameState;
    this.gameState = newState;
    
    // Update UI based on the new state
    this._updateStateUI(newState);
    
    // Log state change
    console.log(`Game state changed: ${oldState} -> ${newState}`);
    
    // Publish state change event
    eventManager.publish(GameEvents.PHASE_CHANGED, {
      oldState,
      newState,
      gamePhase: this.gamePhase,
      day: this.day
    });
  }
  
  /**
   * Updates the UI based on the current game state
   * @param {string} state - The current game state
   * @private
   */
  _updateStateUI(state) {
    // Get appropriate screen ID for the game state
    const screenMap = {
      [GameState.WELCOME]: 'welcome-screen',
      [GameState.CHARACTER_SELECTION]: 'character-selection-screen',
      [GameState.TRIBE_DIVISION]: 'tribe-division-screen',
      [GameState.CAMP]: 'camp-screen',
      [GameState.CHALLENGE]: 'challenge-screen',
      [GameState.TRIBAL_COUNCIL]: 'tribal-council-screen',
      [GameState.FIRE_MAKING_CHALLENGE]: 'fire-making-challenge-screen'
    };
    
    const screenId = screenMap[state];
    if (screenId) {
      showScreen(screenId);
      
      // Publish screen change event
      eventManager.publish(GameEvents.SCREEN_CHANGED, { screenId, state });
    }
  }
  
  /**
   * Selects a character to play as
   * @param {Object} survivor - The selected survivor
   */
  selectCharacter(survivor) {
    this.playerCharacter = { ...survivor, isPlayer: true };
    console.log(`Selected character: ${survivor.name}`);
    
    // Publish character selected event
    eventManager.publish(GameEvents.CHARACTER_SELECTED, { character: this.playerCharacter });
    
    // Proceed to tribe division
    this.setGameState(GameState.TRIBE_DIVISION);
    this.createTribes();
  }
  
  /**
   * Creates tribes for the game
   */
  createTribes() {
    // Implementation details for creating tribes
    console.warn("Not implemented: createTribes method needs implementation details");
    
    // Default implementation:
    // Reset tribes array
    this.tribes = [];
    
    // Get non-player survivors
    const availableSurvivors = Array.from(survivors).filter(s => s.id !== this.playerCharacter.id);
    
    // Create tribe names and colors based on tribe count
    const tribeConfigs = [
      { name: "Tagi", color: "#5c6bc0" },   // Blue
      { name: "Moto", color: "#66bb6a" },   // Green
      { name: "Fang", color: "#ef5350" }    // Red
    ].slice(0, this.tribeCount);
    
    // Create tribes
    for (let i = 0; i < this.tribeCount; i++) {
      this.tribes.push({
        id: i,
        tribeName: tribeConfigs[i].name,
        tribeColor: tribeConfigs[i].color,
        members: [],
        resources: {
          fire: 50,
          water: 50,
          food: 50,
          shelter: 50
        },
        isImmune: false,
        attributes: {
          strength: 0,
          agility: 0,
          endurance: 0,
          intelligence: 0
        }
      });
    }
    
    // Divide survivors into tribes
    const shuffledSurvivors = shuffleArray(availableSurvivors);
    
    // Add player to first tribe
    this.tribes[0].members.push(this.playerCharacter);
    
    // Add remaining survivors
    let tribeIndex = 0;
    for (const survivor of shuffledSurvivors) {
      // Skip the player
      if (survivor.id === this.playerCharacter.id) continue;
      
      // Add to current tribe
      this.tribes[tribeIndex].members.push(survivor);
      
      // Move to next tribe, loop back if needed
      tribeIndex = (tribeIndex + 1) % this.tribeCount;
    }
    
    // Calculate tribe attributes
    this.tribes.forEach(tribe => {
      this._calculateTribeAttributes(tribe);
    });
    
    console.log(`Created ${this.tribeCount} tribes with ${this.tribes.reduce((sum, tribe) => sum + tribe.members.length, 0)} players total.`);
    
    // Publish tribes created event
    eventManager.publish(GameEvents.TRIBES_CREATED, { tribes: this.tribes });
  }
  
  /**
   * Calculates a tribe's collective attributes
   * @param {Object} tribe - The tribe to calculate attributes for
   * @private
   */
  _calculateTribeAttributes(tribe) {
    // Reset attributes
    tribe.attributes = {
      strength: 0,
      agility: 0,
      endurance: 0,
      intelligence: 0
    };
    
    // Sum attributes from all members
    tribe.members.forEach(member => {
      tribe.attributes.strength += member.physical;
      tribe.attributes.agility += member.physical * 0.7 + member.mental * 0.3;
      tribe.attributes.endurance += member.physical * 0.6 + member.mental * 0.4;
      tribe.attributes.intelligence += member.mental;
    });
    
    // Average the attributes
    const memberCount = tribe.members.length;
    if (memberCount > 0) {
      Object.keys(tribe.attributes).forEach(attr => {
        tribe.attributes[attr] = Math.round(tribe.attributes[attr] / memberCount);
      });
    }
  }
  
  /**
   * Merge tribes into one
   */
  mergeTribes() {
    // Implementation for merging tribes
    console.warn("Not implemented: mergeTribes method needs implementation details");
    
    const oldTribes = [...this.tribes];
    
    // Create merged tribe
    const mergedTribe = {
      id: 0,
      tribeName: "Merged Tribe",
      tribeColor: "#9c27b0", // Purple
      members: [],
      resources: {
        fire: 50,
        water: 50,
        food: 50,
        shelter: 50
      },
      isImmune: false,
      attributes: {
        strength: 0,
        agility: 0,
        endurance: 0,
        intelligence: 0
      }
    };
    
    // Combine all survivors from previous tribes
    this.tribes.forEach(tribe => {
      tribe.members.forEach(member => {
        mergedTribe.members.push(member);
      });
      
      // Average resources
      mergedTribe.resources.fire += tribe.resources.fire;
      mergedTribe.resources.water += tribe.resources.water;
      mergedTribe.resources.food += tribe.resources.food;
      mergedTribe.resources.shelter += tribe.resources.shelter;
    });
    
    // Average the resources
    const tribeCount = this.tribes.length;
    if (tribeCount > 0) {
      Object.keys(mergedTribe.resources).forEach(resource => {
        mergedTribe.resources[resource] = Math.round(mergedTribe.resources[resource] / tribeCount);
      });
    }
    
    // Replace tribes with merged tribe
    this.tribes = [mergedTribe];
    
    // Calculate tribe attributes
    this._calculateTribeAttributes(mergedTribe);
    
    // Update game phase
    this.gamePhase = GamePhase.POST_MERGE;
    
    console.log("Tribes merged. Post-merge phase begins.");
    
    // Publish merge event
    eventManager.publish(GameEvents.TRIBES_MERGED, {
      oldTribes,
      mergedTribe,
      gamePhase: this.gamePhase
    });
  }
  
  /**
   * Gets the player's tribe
   * @returns {Object|null} The player's tribe or null if not found
   */
  getPlayerTribe() {
    if (!this.playerCharacter) return null;
    
    return this.tribes.find(tribe => 
      tribe.members.some(member => member.id === this.playerCharacter.id)
    ) || null;
  }
  
  /**
   * Gets the player survivor object
   * @returns {Object|null} The player survivor object or null if not found
   */
  getPlayerSurvivor() {
    const playerTribe = this.getPlayerTribe();
    if (!playerTribe) return null;
    
    return playerTribe.members.find(member => member.isPlayer) || null;
  }
  
  /**
   * Gets all tribes
   * @returns {Array} All tribes
   */
  getTribes() {
    return this.tribes;
  }
  
  /**
   * Gets the current game phase
   * @returns {string} The current game phase
   */
  getGamePhase() {
    return this.gamePhase;
  }
  
  /**
   * Gets the current game state
   * @returns {string} The current game state
   */
  getGameState() {
    return this.gameState;
  }
  
  /**
   * Gets the current day
   * @returns {number} The current day
   */
  getDay() {
    return this.day;
  }
  
  /**
   * Gets the total number of players remaining
   * @returns {number} The total number of players remaining
   * @private
   */
  _getTotalPlayerCount() {
    return this.tribes.reduce((sum, tribe) => sum + tribe.members.length, 0);
  }
  
  /**
   * Advances to the next day
   */
  advanceDay() {
    this.day++;
    this.dayAdvanced = true;
    
    // Reset energy
    if (this.systems.energySystem) {
      this.systems.energySystem.resetEnergy();
    }
    
    // Process NPC idol finds
    if (this.systems.idolSystem) {
      this.systems.idolSystem.processNPCIdolFinds();
    }
    
    console.log(`Advanced to day ${this.day}`);
    
    // Publish day advanced event
    eventManager.publish(GameEvents.DAY_ADVANCED, { day: this.day });
  }
  
  /**
   * Saves the current game state
   * @returns {boolean} Whether the save was successful
   */
  saveGame() {
    // Create the game data object
    const gameData = {
      gameState: this.gameState,
      gamePhase: this.gamePhase,
      day: this.day,
      tribes: this.tribes,
      playerCharacter: this.playerCharacter,
      jury: this.jury,
      tribeCount: this.tribeCount,
      lastEliminatedSurvivor: this.lastEliminatedSurvivor,
      gameSequence: this.gameSequence,
      lastVotedOut: this.lastVotedOut,
      npcTribalResults: this.npcTribalResults,
      
      // System-specific data
      energy: this.systems.energySystem ? this.systems.energySystem.getCurrentEnergy() : 3,
      relationships: this.systems.relationshipSystem ? this.systems.relationshipSystem.getRelationships() : {},
      alliances: this.systems.allianceSystem ? this.systems.allianceSystem.getAlliances() : [],
      idolsInPlay: this.systems.idolSystem ? this.systems.idolSystem.getIdolsInPlay() : 0
    };
    
    // Attempt to save the game
    const success = saveGame(gameData);
    
    // Update load button state
    const loadGameButton = getElement('load-game-button');
    if (loadGameButton) {
      loadGameButton.disabled = !success;
    }
    
    // Notify user
    if (success) {
      alert('Game saved successfully!');
      eventManager.publish(GameEvents.GAME_SAVED, { gameData });
    } else {
      alert('Failed to save game. Please check console for errors.');
    }
    
    return success;
  }
  
  /**
   * Loads a saved game
   * @returns {boolean} Whether the load was successful
   */
  loadGame() {
    const savedGame = loadGame();
    if (!savedGame) {
      alert('No saved game found.');
      return false;
    }
    
    try {
      // Restore game state
      this.gameState = savedGame.gameState;
      this.gamePhase = savedGame.gamePhase;
      this.day = savedGame.day;
      this.tribes = savedGame.tribes;
      this.playerCharacter = savedGame.playerCharacter;
      this.jury = savedGame.jury;
      this.tribeCount = savedGame.tribeCount;
      this.lastEliminatedSurvivor = savedGame.lastEliminatedSurvivor;
      this.gameSequence = savedGame.gameSequence;
      this.lastVotedOut = savedGame.lastVotedOut;
      this.npcTribalResults = savedGame.npcTribalResults;
      
      // Restore system-specific data
      if (this.systems.energySystem && savedGame.energy !== undefined) {
        this.systems.energySystem.setEnergy(savedGame.energy);
      }
      
      if (this.systems.relationshipSystem && savedGame.relationships) {
        this.systems.relationshipSystem.setRelationships(savedGame.relationships);
      }
      
      if (this.systems.allianceSystem && savedGame.alliances) {
        this.systems.allianceSystem.setAlliances(savedGame.alliances);
      }
      
      // Update UI based on loaded state
      this._updateStateUI(this.gameState);
      
      // Update game menu
      this._updateGameMenu();
      
      console.log('Game loaded successfully!');
      
      // Publish game loaded event
      eventManager.publish(GameEvents.GAME_LOADED, { gameData: savedGame });
      
      return true;
    } catch (error) {
      console.error('Error loading game:', error);
      alert('Error loading game. The save file may be corrupted.');
      return false;
    }
  }
}

// Create and export singleton instance
const gameManager = new GameManager();
export default gameManager;