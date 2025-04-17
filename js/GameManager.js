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
        this.tribeCount = 2; // Default to 2 tribes, can be changed in welcome screen
        
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
        this.tribeCount = 2; // Reset to default
        this.lastEliminatedSurvivor = null; // Track last eliminated player
        this.dayAdvanced = false; // Track if a day was advanced
        
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
        
        // Add health property to player
        this.playerCharacter.health = 100;
        
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
        
        // Determine how many tribes to create (2 or 3)
        const tribeCount = this.tribeCount || 2;
        
        // Create array to hold all tribes
        const createdTribes = [];
        
        // Create tribes based on tribeCount
        for (let i = 0; i < tribeCount; i++) {
            const newTribe = {
                tribeName: tribeNames[i],
                tribeColor: tribeColors[i],
                members: [],
                fire: 50,
                water: 50,
                food: 50,
                health: 100
            };
            createdTribes.push(newTribe);
        }
        
        // Add player to first tribe
        createdTribes[0].members.push(this.playerCharacter);
        
        // Get random NPCs, excluding the player's selected character
        const npcSurvivors = [];
        survivorDatabase.survivors.forEach(survivor => {
            // Skip the character that the player selected
            if (survivor.name !== this.playerCharacter.name) {
                npcSurvivors.push(deepCopy(survivor));
            }
        });
        
        // Shuffle the NPCs
        const shuffledNPCs = shuffleArray(npcSurvivors);
        
        // Determine how to distribute survivors
        // For 2 tribes: 9 players per tribe (including player)
        // For 3 tribes: 6 players per tribe (including player)
        const playersPerTribe = tribeCount === 2 ? 9 : 6;
        
        // First tribe already has 1 player (the user), so add (playersPerTribe-1) NPCs
        const npcsForFirstTribe = playersPerTribe - 1;
        
        // Add NPCs to first tribe
        for (let i = 0; i < npcsForFirstTribe; i++) {
            createdTribes[0].members.push(shuffledNPCs[i]);
        }
        
        // Add remaining NPCs to other tribes
        let npcIndex = npcsForFirstTribe;
        
        for (let tribeIndex = 1; tribeIndex < tribeCount; tribeIndex++) {
            for (let i = 0; i < playersPerTribe; i++) {
                if (npcIndex < shuffledNPCs.length) {
                    createdTribes[tribeIndex].members.push(shuffledNPCs[npcIndex]);
                    npcIndex++;
                }
            }
        }
        
        // Add tribes to game
        this.tribes = createdTribes;
        
        // Initialize relationships
        this.tribes.forEach(tribe => {
            this.relationshipSystem.initializeTribeRelationships(tribe);
        });
        
        console.log(`Created ${tribeCount} tribes with ${playersPerTribe} players each.`);
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
            food: 50,
            health: 100 // New tribe health property
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
        
        // Update tribe health based on resources
        this.updateTribeHealth();
        
        // Update player health based on tribe health and recent actions
        this.updatePlayerHealth();
        
        // Process NPC alliance formations
        this.allianceSystem.processNPCAllianceFormations();
        
        // Process NPCs finding idols
        this.idolSystem.processNPCIdolFinds();
        
        // Check for merge
        this.checkForMerge();
        
        // Track that a day has passed for flow control
        this.dayAdvanced = true;
    }
    
    /**
     * Update player health based on tribe health and personal actions
     */
    updatePlayerHealth() {
        const player = this.getPlayerSurvivor();
        if (!player) return;
        
        const tribe = this.getPlayerTribe();
        if (!tribe) return;
        
        // Player health is influenced by:
        // 1. Tribe health (if tribe is healthy, player has a better baseline)
        // 2. Recent personal actions (eating, drinking, resting)
        
        // If tribe health is critical, player health naturally decreases
        if (tribe.health < 30) {
            player.health -= 10;
            this.dialogueSystem.showDialogue(
                "Your health is declining due to poor tribe conditions. You should focus on food and water.",
                ["Continue"],
                () => this.dialogueSystem.hideDialogue()
            );
        } else if (tribe.health < 50) {
            player.health -= 5;
        } else if (tribe.health > 80) {
            // Good tribe conditions help player health recover slightly
            player.health += 2;
        }
        
        // Cap health between 0-100
        if (player.health > 100) player.health = 100;
        if (player.health < 0) player.health = 0;
        
        // Critical health warning
        if (player.health < 25) {
            this.dialogueSystem.showDialogue(
                "Warning: Your health is critically low! You need to eat, drink, and rest soon or you may be medically evacuated!",
                ["I understand"],
                () => this.dialogueSystem.hideDialogue()
            );
        }
    }
    
    /**
     * Player eats food action
     * @returns {boolean} Whether the action was successful
     */
    playerEat() {
        const player = this.getPlayerSurvivor();
        const tribe = this.getPlayerTribe();
        
        if (!player || !tribe) return false;
        
        // Check if tribe has enough food
        if (tribe.food < 10) {
            this.dialogueSystem.showDialogue(
                "There's not enough food for you to eat. Your tribe needs to gather more food.",
                ["Continue"],
                () => this.dialogueSystem.hideDialogue()
            );
            return false;
        }
        
        // Consume tribe food
        tribe.food -= 10;
        
        // Increase player health
        player.health += 15;
        if (player.health > 100) player.health = 100;
        
        this.dialogueSystem.showDialogue(
            "You eat some of your tribe's food. Your health improves.",
            ["Continue"],
            () => this.dialogueSystem.hideDialogue()
        );
        
        return true;
    }
    
    /**
     * Player drinks water action
     * @returns {boolean} Whether the action was successful
     */
    playerDrink() {
        const player = this.getPlayerSurvivor();
        const tribe = this.getPlayerTribe();
        
        if (!player || !tribe) return false;
        
        // Check if tribe has enough water
        if (tribe.water < 10) {
            this.dialogueSystem.showDialogue(
                "There's not enough water to drink. Your tribe needs to collect more water.",
                ["Continue"],
                () => this.dialogueSystem.hideDialogue()
            );
            return false;
        }
        
        // Consume tribe water
        tribe.water -= 10;
        
        // Increase player health
        player.health += 10;
        if (player.health > 100) player.health = 100;
        
        this.dialogueSystem.showDialogue(
            "You drink some water. Your health improves and you feel more hydrated.",
            ["Continue"],
            () => this.dialogueSystem.hideDialogue()
        );
        
        return true;
    }
    
    /**
     * Player rests action
     * @returns {boolean} Whether the action was successful
     */
    playerRest() {
        const player = this.getPlayerSurvivor();
        const tribe = this.getPlayerTribe();
        
        if (!player || !tribe) return false;
        
        // Check if tribe has enough comfort (fire)
        if (tribe.fire < 20) {
            // Can still rest, but less effective
            player.health += 5;
            
            this.dialogueSystem.showDialogue(
                "You try to rest, but the lack of fire makes it uncomfortable. You get some benefit, but not much.",
                ["Continue"],
                () => this.dialogueSystem.hideDialogue()
            );
        } else {
            // Good rest with proper fire
            player.health += 15;
            
            this.dialogueSystem.showDialogue(
                "You rest by the warm fire. Your health improves significantly.",
                ["Continue"],
                () => this.dialogueSystem.hideDialogue()
            );
        }
        
        // Cap health
        if (player.health > 100) player.health = 100;
        
        return true;
    }
    
    /**
     * Update tribe health based on current resources
     */
    updateTribeHealth() {
        this.tribes.forEach(tribe => {
            // Calculate average resource level
            const avgResources = (tribe.fire + tribe.water + tribe.food) / 3;
            
            // Adjust health based on resources
            if (avgResources < 20) {
                // Critical resource level - health drops significantly
                tribe.health -= 15;
            } else if (avgResources < 40) {
                // Low resource level - health drops moderately
                tribe.health -= 7;
            } else if (avgResources < 60) {
                // Medium resource level - health stable
                // No change
            } else if (avgResources < 80) {
                // Good resource level - health improves slightly
                tribe.health += 3;
                if (tribe.health > 100) tribe.health = 100;
            } else {
                // Excellent resource level - health improves
                tribe.health += 7;
                if (tribe.health > 100) tribe.health = 100;
            }
            
            // Ensure health doesn't go below 0
            if (tribe.health < 0) tribe.health = 0;
            
            // Health affects survivor performance
            // If health is very low, notify player
            if (tribe.health < 30 && this.getPlayerTribe() === tribe) {
                this.dialogueSystem.showDialogue(
                    "Your tribe's health is critically low due to resource shortages. You need to gather more food, water, and firewood.",
                    ["Continue"],
                    () => this.dialogueSystem.hideDialogue()
                );
            }
        });
    }
    
    /**
     * Check if tribes should merge or shuffle
     */
    checkForMerge() {
        // Only check if in preMerge phase
        if (this.gamePhase !== "preMerge") return;
        
        // Count total remaining players
        let totalPlayers = 0;
        this.tribes.forEach(tribe => {
            totalPlayers += tribe.members.length;
        });
        
        // In 3-tribe mode, we shuffle to 2 tribes at 14 players
        if (this.tribes.length === 3 && totalPlayers <= 14 && totalPlayers > 12) {
            // Shuffle from 3 tribes to 2 tribes
            this.shuffleTribes(2);
            return;
        }
        
        // Regular merge to 1 tribe at merge day or when we have 12 or fewer players in pre-merge
        if (this.day >= this.mergeDay || totalPlayers <= 12) {
            this.setGameState("merge");
        }
    }
    
    /**
     * Shuffle players into a new number of tribes
     * @param {number} newTribeCount - The new number of tribes
     */
    shuffleTribes(newTribeCount) {
        // If we already have this number of tribes, no need to shuffle
        if (this.tribes.length === newTribeCount) return;
        
        // Gather all players from existing tribes
        const allPlayers = [];
        this.tribes.forEach(tribe => {
            tribe.members.forEach(member => {
                allPlayers.push(member);
            });
        });
        
        // Create new tribe structures
        const newTribes = [];
        for (let i = 0; i < newTribeCount; i++) {
            const newTribe = {
                tribeName: tribeNames[i],
                tribeColor: tribeColors[i],
                members: [],
                fire: 50,
                water: 50,
                food: 50,
                health: 100
            };
            newTribes.push(newTribe);
        }
        
        // Shuffle players
        const shuffledPlayers = shuffleArray(allPlayers);
        
        // Ensure player is placed first so they're always in tribe 0
        const playerIndex = shuffledPlayers.findIndex(player => player.isPlayer);
        if (playerIndex !== -1) {
            const player = shuffledPlayers.splice(playerIndex, 1)[0];
            shuffledPlayers.unshift(player);
        }
        
        // Calculate players per tribe
        const playersPerTribe = Math.ceil(shuffledPlayers.length / newTribeCount);
        
        // Distribute players to new tribes
        for (let i = 0; i < shuffledPlayers.length; i++) {
            const tribeIndex = Math.floor(i / playersPerTribe);
            // Ensure we don't go past the number of tribes we have
            if (tribeIndex < newTribes.length) {
                newTribes[tribeIndex].members.push(shuffledPlayers[i]);
            }
        }
        
        // Replace old tribes with new ones
        this.tribes = newTribes;
        
        // Initialize relationships for the new tribes
        this.tribes.forEach(tribe => {
            this.relationshipSystem.initializeTribeRelationships(tribe);
        });
        
        // Show a dialogue explaining the tribe shuffle
        this.dialogueSystem.showDialogue(
            "TRIBE SHUFFLE: The tribes have been reorganized! You are now on the " + 
            newTribes[0].tribeName + " tribe.",
            ["Continue"],
            () => {
                this.dialogueSystem.hideDialogue();
                this.setGameState("camp");
            }
        );
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
        
        // Store the eliminated survivor for reference
        this.lastEliminatedSurvivor = {
            name: survivor.name,
            tribeName: tribe.tribeName,
            tribeColor: tribe.tribeColor,
            day: this.day
        };
        
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