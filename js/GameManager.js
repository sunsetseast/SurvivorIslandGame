// Game Manager
class GameManager {
    constructor() {
        // Game state
        this.gameState = "welcome"; // welcome, characterSelection, tribeDivision, camp, challenge, tribalCouncil, merge, finalTribalCouncil, gameOver
        this.gamePhase = "preMerge"; // preMerge, postMerge, final
        this.day = 1;
        this.tribes = [];
        this.playerCharacter = null;
        this.jury = [];
        this.mergeDay = 12;
        
        // Initialize systems
        this.dialogueSystem = new DialogueSystem(this);
        this.energySystem = new EnergySystem(this);
        this.relationshipSystem = new RelationshipSystem(this);
        this.allianceSystem = new AllianceSystem(this);
        this.challengeSystem = new ChallengeSystem(this);
        this.tribalCouncilSystem = new TribalCouncilSystem(this);
        this.idolSystem = new IdolSystem(this);
    }
    
    /**
     * Initialize a new game
     */
    initializeGame() {
        // Reset state
        this.gameState = "welcome";
        this.gamePhase = "preMerge";
        this.day = 1;
        this.tribes = [];
        this.playerCharacter = null;
        this.jury = [];
        
        // Initialize systems
        this.energySystem.initialize();
        this.relationshipSystem.initialize();
        this.allianceSystem.initialize();
        this.challengeSystem.initialize();
        this.tribalCouncilSystem.initialize();
        this.idolSystem.initialize();
        
        // Set up welcome screen
        WelcomeScreen.setup();
    }
    
    /**
     * Start the game
     */
    startGame() {
        this.setGameState("characterSelection");
    }
    
    /**
     * Set the game state and update UI
     * @param {string} newState - The new game state
     */
    setGameState(newState) {
        this.gameState = newState;
        
        // Update UI based on new state
        switch (newState) {
            case "welcome":
                showScreen("welcome-screen");
                WelcomeScreen.setup();
                break;
                
            case "characterSelection":
                showScreen("character-selection-screen");
                CharacterSelectionScreen.setup();
                break;
                
            case "tribeDivision":
                showScreen("tribe-division-screen");
                TribeDivisionScreen.setup();
                break;
                
            case "merge":
                // Process tribe merge when entering this state
                this.mergeTribes();
                showScreen("tribe-division-screen");
                TribeDivisionScreen.setupMerge();
                break;
                
            case "camp":
                this.energySystem.refillEnergy();
                showScreen("camp-screen");
                CampScreen.setup();
                break;
                
            case "challenge":
                showScreen("challenge-screen");
                ChallengeScreen.setup();
                break;
                
            case "tribalCouncil":
                showScreen("tribal-council-screen");
                TribalCouncilScreen.setup();
                break;
                
            case "finalTribalCouncil":
                // Handle final tribal council
                break;
                
            case "gameOver":
                // Handle game over
                this.showGameOverScreen();
                break;
        }
    }
    
    /**
     * Select a character to play as
     * @param {Object} survivor - The selected survivor
     */
    selectCharacter(survivor) {
        // Clone survivor data to avoid reference issues
        this.playerCharacter = deepCopy(survivor);
        this.playerCharacter.isPlayer = true;
        
        // Create tribes
        this.createTribes();
        
        // Proceed to tribe division
        this.setGameState("tribeDivision");
    }
    
    /**
     * Create tribes for the game
     */
    createTribes() {
        // Reset tribes
        this.tribes = [];
        
        // Create two initial tribes
        const tribe1 = {
            tribeName: tribeNames[0],
            tribeColor: tribeColors[0],
            members: [],
            fire: 50,
            water: 50,
            food: 50
        };
        
        const tribe2 = {
            tribeName: tribeNames[1],
            tribeColor: tribeColors[1],
            members: [],
            fire: 50,
            water: 50,
            food: 50
        };
        
        // Add player to tribe 1
        tribe1.members.push(this.playerCharacter);
        
        // Get random NPCs
        const npcSurvivors = [];
        survivorDatabase.survivors.forEach(survivor => {
            npcSurvivors.push(deepCopy(survivor));
        });
        
        // Shuffle the NPCs
        const shuffledNPCs = shuffleArray(npcSurvivors);
        
        // Divide NPCs between tribes
        for (let i = 0; i < 9; i++) {
            if (i < 5) {
                tribe1.members.push(shuffledNPCs[i]);
            } else {
                tribe2.members.push(shuffledNPCs[i]);
            }
        }
        
        // Add tribes to game
        this.tribes.push(tribe1);
        this.tribes.push(tribe2);
        
        // Initialize relationships
        this.tribes.forEach(tribe => {
            this.relationshipSystem.initializeTribeRelationships(tribe);
        });
    }
    
    /**
     * Merge tribes into one
     */
    mergeTribes() {
        if (this.tribes.length <= 1) return;
        
        // Change game phase
        this.gamePhase = "postMerge";
        
        // Create merged tribe
        const mergedTribe = {
            tribeName: tribeNames[2], // Use third tribe name for merged tribe
            tribeColor: tribeColors[2], // Use third color for merged tribe
            members: [],
            fire: 50,
            water: 50,
            food: 50
        };
        
        // Combine members from all tribes
        this.tribes.forEach(tribe => {
            tribe.members.forEach(member => {
                mergedTribe.members.push(member);
            });
        });
        
        // Replace tribes with merged tribe
        this.tribes = [mergedTribe];
        
        // Update relationships for newly merged tribe
        this.relationshipSystem.initializeTribeRelationships(mergedTribe);
    }
    
    /**
     * Get the player's tribe
     * @returns {Object} The player's tribe
     */
    getPlayerTribe() {
        for (const tribe of this.tribes) {
            for (const member of tribe.members) {
                if (member.isPlayer) {
                    return tribe;
                }
            }
        }
        return null;
    }
    
    /**
     * Get the player survivor object
     * @returns {Object} The player survivor
     */
    getPlayerSurvivor() {
        for (const tribe of this.tribes) {
            for (const member of tribe.members) {
                if (member.isPlayer) {
                    return member;
                }
            }
        }
        return null;
    }
    
    /**
     * Get all tribes
     * @returns {Array} All tribes
     */
    getTribes() {
        return this.tribes;
    }
    
    /**
     * Get the current game phase
     * @returns {string} The current game phase
     */
    getGamePhase() {
        return this.gamePhase;
    }
    
    /**
     * Get the current game state
     * @returns {string} The current game state
     */
    getGameState() {
        return this.gameState;
    }
    
    /**
     * Get the current day
     * @returns {number} The current day
     */
    getDay() {
        return this.day;
    }
    
    /**
     * Advance to the next day
     */
    advanceDay() {
        this.day++;
        
        // Clear immunity
        this.clearImmunity();
        
        // Process NPC alliance formations
        this.allianceSystem.processNPCAllianceFormations();
        
        // Process NPCs finding idols
        this.idolSystem.processNPCIdolFinds();
        
        // Check for merge
        this.checkForMerge();
    }
    
    /**
     * Check if tribes should merge
     */
    checkForMerge() {
        if (this.gamePhase === "preMerge" && this.day >= this.mergeDay) {
            this.setGameState("merge");
        }
    }
    
    /**
     * Clear immunity from all survivors
     */
    clearImmunity() {
        this.tribes.forEach(tribe => {
            tribe.members.forEach(member => {
                member.hasImmunity = false;
            });
        });
    }
    
    /**
     * Eliminate a survivor
     * @param {Object} survivor - The survivor to eliminate
     */
    eliminateSurvivor(survivor) {
        if (!survivor) return;
        
        // Find the survivor's tribe
        const tribe = this.tribes.find(t => 
            t.members.some(m => m.name === survivor.name)
        );
        
        if (!tribe) return;
        
        // Remove from tribe
        tribe.members = tribe.members.filter(m => m.name !== survivor.name);
        
        // In post-merge, add to jury
        if (this.gamePhase === "postMerge") {
            this.jury.push(survivor);
        }
        
        // Check if we've reached final 3
        if (this.gamePhase === "postMerge" && tribe.members.length <= 3) {
            this.gamePhase = "final";
        }
        
        // Proceed to camp or final tribal council
        if (this.gamePhase === "final") {
            this.setGameState("finalTribalCouncil");
        } else {
            this.setGameState("camp");
        }
    }
    
    /**
     * Get the jury members
     * @returns {Array} The jury members
     */
    getJury() {
        return this.jury;
    }
    
    /**
     * Save the current game state
     */
    saveGame() {
        const gameData = {
            gameState: this.gameState,
            gamePhase: this.gamePhase,
            day: this.day,
            tribes: this.tribes,
            playerCharacter: this.playerCharacter,
            jury: this.jury
        };
        
        saveGame(gameData);
    }
    
    /**
     * Load a saved game
     */
    loadGame() {
        const savedGame = loadGame();
        
        if (savedGame) {
            this.gameState = savedGame.gameState;
            this.gamePhase = savedGame.gamePhase;
            this.day = savedGame.day;
            this.tribes = savedGame.tribes;
            this.playerCharacter = savedGame.playerCharacter;
            this.jury = savedGame.jury;
            
            // Initialize systems with saved data
            this.energySystem.initialize();
            
            // Update UI based on saved state
            this.setGameState(this.gameState);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Show game over screen
     */
    showGameOverScreen() {
        const gameOverMessage = "You have been voted off Survivor Island!";
        
        // Display game over message
        this.dialogueSystem.showDialogue(
            gameOverMessage,
            ["Play Again"],
            () => {
                this.dialogueSystem.hideDialogue();
                this.initializeGame();
            }
        );
    }
}