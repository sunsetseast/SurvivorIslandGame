// Camp Screen
const CampScreen = {
    /**
     * Set up camp screen
     */
    setup() {
        this.updateHeaderInfo();
        this.updateResourceDisplay();
        this.createLocationButtons();
        this.hideLocationActions();
        
        // Set up relationship button
        const relationshipsButton = document.getElementById('view-relationships-button');
        if (relationshipsButton) {
            relationshipsButton.addEventListener('click', () => {
                this.viewRelationships();
            });
        }
        
        // Set up alliance button
        const alliancesButton = document.getElementById('view-alliances-button');
        if (alliancesButton) {
            alliancesButton.addEventListener('click', () => {
                this.viewAlliances();
            });
        }
        
        // Set up next day button
        const nextDayButton = document.getElementById('proceed-to-challenge-button');
        if (nextDayButton) {
            nextDayButton.addEventListener('click', () => {
                this.proceedToNextDay();
            });
        }
        
        // Set up back button
        const backButton = document.getElementById('back-to-locations-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.hideLocationActions();
            });
        }
        
        // Process random events
        this.processRandomEvents();
    },
    
    /**
     * Update header information
     */
    updateHeaderInfo() {
        const tribeNameElement = document.getElementById('tribe-name');
        const dayNumberElement = document.getElementById('day-number');
        const tribeColorImage = document.getElementById('tribe-color-image');
        const energyValueElement = document.getElementById('energy-value');
        const maxEnergyElement = document.getElementById('max-energy');
        
        const playerTribe = gameManager.getPlayerTribe();
        
        if (tribeNameElement && playerTribe) {
            tribeNameElement.textContent = playerTribe.tribeName + " Tribe";
        }
        
        if (dayNumberElement) {
            dayNumberElement.textContent = gameManager.getDay();
        }
        
        if (tribeColorImage && playerTribe) {
            tribeColorImage.style.backgroundColor = playerTribe.tribeColor;
        }
        
        // Update energy display
        if (energyValueElement) {
            energyValueElement.textContent = gameManager.energySystem.getCurrentEnergy();
        }
        
        if (maxEnergyElement) {
            maxEnergyElement.textContent = gameManager.energySystem.getMaxEnergy();
        }
    },
    
    /**
     * Update resource display
     */
    updateResourceDisplay() {
        const fireBar = document.getElementById('fire-bar');
        const waterBar = document.getElementById('water-bar');
        const foodBar = document.getElementById('food-bar');
        const fireValue = document.getElementById('fire-value');
        const waterValue = document.getElementById('water-value');
        const foodValue = document.getElementById('food-value');
        
        // Get references to health bars
        const tribeHealthBar = document.getElementById('tribe-health-bar');
        const tribeHealthValue = document.getElementById('tribe-health-value');
        const playerHealthBar = document.getElementById('player-health-bar');
        const playerHealthValue = document.getElementById('player-health-value');
        
        const playerTribe = gameManager.getPlayerTribe();
        if (!playerTribe) return;
        
        const player = gameManager.getPlayerSurvivor();
        
        // Update resource bars
        if (fireBar) {
            fireBar.style.width = formatProgressWidth(playerTribe.fire, 100);
        }
        
        if (waterBar) {
            waterBar.style.width = formatProgressWidth(playerTribe.water, 100);
        }
        
        if (foodBar) {
            foodBar.style.width = formatProgressWidth(playerTribe.food, 100);
        }
        
        // Update resource values
        if (fireValue) {
            fireValue.textContent = playerTribe.fire;
        }
        
        if (waterValue) {
            waterValue.textContent = playerTribe.water;
        }
        
        if (foodValue) {
            foodValue.textContent = playerTribe.food;
        }
        
        // Update health bars
        if (tribeHealthBar && playerTribe.health !== undefined) {
            tribeHealthBar.style.width = formatProgressWidth(playerTribe.health, 100);
            
            // Update color based on health level
            if (playerTribe.health < 30) {
                tribeHealthBar.style.backgroundColor = '#dc3545'; // Red (critical)
            } else if (playerTribe.health < 60) {
                tribeHealthBar.style.backgroundColor = '#ffc107'; // Yellow (warning)
            } else {
                tribeHealthBar.style.backgroundColor = '#28a745'; // Green (good)
            }
        }
        
        if (tribeHealthValue && playerTribe.health !== undefined) {
            tribeHealthValue.textContent = playerTribe.health;
        }
        
        // Update player health if available
        if (playerHealthBar && player && player.health !== undefined) {
            playerHealthBar.style.width = formatProgressWidth(player.health, 100);
            
            // Update color based on health level
            if (player.health < 30) {
                playerHealthBar.style.backgroundColor = '#dc3545'; // Red (critical)
            } else if (player.health < 60) {
                playerHealthBar.style.backgroundColor = '#ffc107'; // Yellow (warning)
            } else {
                playerHealthBar.style.backgroundColor = '#28a745'; // Green (good)
            }
        }
        
        if (playerHealthValue && player && player.health !== undefined) {
            playerHealthValue.textContent = player.health;
        }
    },
    
    /**
     * Create location buttons
     */
    createLocationButtons() {
        const locationButtonsContainer = document.getElementById('location-buttons');
        if (!locationButtonsContainer) return;
        
        // Clear container
        clearChildren(locationButtonsContainer);
        
        // Create buttons for each location
        campLocations.forEach(location => {
            const button = createElement('button', {
                className: 'location-button',
                textContent: location.name,
                'data-location': location.name,
                onClick: () => this.selectLocation(location)
            });
            
            locationButtonsContainer.appendChild(button);
        });
    },
    
    /**
     * Select a location
     * @param {Object} location - The selected location
     */
    selectLocation(location) {
        this.selectedLocation = location;
        
        const locationActions = document.getElementById('location-actions');
        const locationName = document.getElementById('location-name');
        const locationDescription = document.getElementById('location-description');
        const actionButtons = document.getElementById('action-buttons');
        
        if (locationActions) {
            locationActions.classList.remove('hidden');
        }
        
        if (locationName) {
            locationName.textContent = location.name;
        }
        
        if (locationDescription) {
            locationDescription.textContent = location.description;
        }
        
        // Add data-location attribute to the selected location button
        const allLocationButtons = document.querySelectorAll('.location-button');
        allLocationButtons.forEach(button => {
            button.classList.remove('selected');
            if (button.textContent === location.name) {
                button.classList.add('selected');
                button.setAttribute('data-location', location.name);
            }
        });
        
        // Create action buttons
        if (actionButtons) {
            clearChildren(actionButtons);
            
            location.actions.forEach(action => {
                const button = createElement('button', {
                    className: 'action-button',
                    textContent: `${action.name} (${action.energyCost} Energy)`,
                    onClick: () => this.performAction(action)
                });
                
                // Disable if not enough energy
                if (gameManager.energySystem.getCurrentEnergy() < action.energyCost) {
                    button.disabled = true;
                }
                
                const description = createElement('p', {
                    className: 'action-description',
                    textContent: action.description
                });
                
                const actionContainer = createElement('div', {
                    className: 'action-container'
                }, [button, description]);
                
                actionButtons.appendChild(actionContainer);
            });
        }
    },
    
    /**
     * Hide location actions panel
     */
    hideLocationActions() {
        const locationActions = document.getElementById('location-actions');
        if (locationActions) {
            locationActions.classList.add('hidden');
        }
        
        this.selectedLocation = null;
    },
    
    /**
     * Perform a camp action
     * @param {Object} action - The action to perform
     */
    performAction(action) {
        // Check if player has enough energy
        if (!gameManager.energySystem.useEnergy(action.energyCost)) {
            // Show not enough energy message
            gameManager.dialogueSystem.showDialogue(
                "Not enough energy to perform this action!",
                ["OK"],
                () => gameManager.dialogueSystem.hideDialogue()
            );
            return;
        }
        
        // Process action based on type
        switch (action.type) {
            case 'gatherFirewood':
                this.gatherFirewood();
                break;
            case 'collectWater':
                this.collectWater();
                break;
            case 'findFood':
                this.findFood();
                break;
            case 'searchForIdol':
                this.searchForIdol();
                break;
            case 'socialize':
                this.socialize();
                break;
            case 'rest':
                this.rest();
                break;
            case 'strategic':
            case 'trainPhysical':
            case 'trainMental':
                this.strategic(action.type);
                break;
        }
        
        // Hide action panel
        this.hideLocationActions();
        
        // Update resource display
        this.updateResourceDisplay();
        
        // Check if all energy is used
        if (gameManager.energySystem.getCurrentEnergy() <= 0) {
            this.proceedToNextDay();
        }
    },
    
    /**
     * Gather firewood action
     */
    gatherFirewood() {
        const playerTribe = gameManager.getPlayerTribe();
        
        // Increase fire resource
        playerTribe.fire = Math.min(playerTribe.fire + 15, 100);
        
        // Show result message
        const message = "You gathered firewood and improved your tribe's fire.";
        this.showActionResult(message);
        
        // Random relationship event
        if (Math.random() < 0.3) {
            const randomTribeMate = this.getRandomTribeMate();
            if (randomTribeMate) {
                const dialogueOptions = [
                    `${randomTribeMate.name} helps you gather firewood.`,
                    `${randomTribeMate.name} compliments your fire-making skills.`,
                    `${randomTribeMate.name} shares fire-making techniques with you.`
                ];
                
                const dialogue = dialogueOptions[Math.floor(Math.random() * dialogueOptions.length)];
                const choices = [
                    "Thank them and work together (+2 Relationship)",
                    "Accept help but stay distant (Neutral)",
                    "Discuss strategy while working (+1 Relationship, Strategic)"
                ];
                
                gameManager.dialogueSystem.showDialogue(dialogue, choices, (choice) => {
                    const player = gameManager.getPlayerSurvivor();
                    
                    if (choice === 0)
                        gameManager.relationshipSystem.changeRelationship(player, randomTribeMate, 2);
                    else if (choice === 2)
                        gameManager.relationshipSystem.changeRelationship(player, randomTribeMate, 1);
                    
                    gameManager.dialogueSystem.hideDialogue();
                });
            }
        }
    },
    
    /**
     * Collect water action
     */
    collectWater() {
        const playerTribe = gameManager.getPlayerTribe();
        
        // Increase water resource
        playerTribe.water = Math.min(playerTribe.water + 15, 100);
        
        // Show result message
        const message = "You collected fresh water for your tribe.";
        this.showActionResult(message);
    },
    
    /**
     * Find food action
     */
    findFood() {
        const playerTribe = gameManager.getPlayerTribe();
        
        // Increase food resource
        playerTribe.food = Math.min(playerTribe.food + 10, 100);
        
        // Show result message
        const message = "You found some food for your tribe.";
        this.showActionResult(message);
    },
    
    /**
     * Search for idol action
     */
    searchForIdol() {
        // Show idol search interface without spending energy
        // Energy will only be spent when a specific hiding spot is searched
        gameManager.idolSystem.showIdolSearch();
    },
    
    /**
     * Socialize action
     */
    socialize() {
        // Get random tribe member
        const tribeMate = this.getRandomTribeMate();
        if (!tribeMate) {
            this.showActionResult("There's nobody around to socialize with.");
            return;
        }
        
        // Generate random dialogue
        const dialogueOptions = [
            `${tribeMate.name} tells you about their life back home.`,
            `${tribeMate.name} asks about your strategy in the game.`,
            `You and ${tribeMate.name} chat about the other tribe members.`
        ];
        
        const dialogue = dialogueOptions[Math.floor(Math.random() * dialogueOptions.length)];
        const choices = [
            "Share personal details (+2 Relationship)",
            "Keep the conversation light (+1 Relationship)",
            "Try to gather information about their strategy (Strategic)"
        ];
        
        gameManager.dialogueSystem.showDialogue(dialogue, choices, (choice) => {
            const player = gameManager.getPlayerSurvivor();
            
            if (choice === 0)
                gameManager.relationshipSystem.changeRelationship(player, tribeMate, 2);
            else if (choice === 1)
                gameManager.relationshipSystem.changeRelationship(player, tribeMate, 1);
            else {
                // Strategic choice - 50% chance of success
                if (Math.random() < 0.5) {
                    gameManager.dialogueSystem.showDialogue(
                        `${tribeMate.name} opens up about their plans in the game.`,
                        ["Interesting..."],
                        () => gameManager.dialogueSystem.hideDialogue()
                    );
                } else {
                    gameManager.dialogueSystem.showDialogue(
                        `${tribeMate.name} seems guarded and changes the subject.`,
                        ["Hmm, they're cautious"],
                        () => gameManager.dialogueSystem.hideDialogue()
                    );
                    
                    // Slight negative relationship effect
                    gameManager.relationshipSystem.changeRelationship(player, tribeMate, -1);
                }
            }
            
            gameManager.dialogueSystem.hideDialogue();
        });
    },
    
    /**
     * Rest action
     */
    rest() {
        // Add 1 energy
        gameManager.energySystem.addEnergy(1);
        
        // Also improve player health through rest
        gameManager.playerRest();
        
        // Show result message
        const message = "You took some time to rest and recovered some energy and health.";
        this.showActionResult(message);
        
        // Update resource display to show health changes
        this.updateResourceDisplay();
    },
    
    /**
     * Personal health actions
     */
    performPersonalHealthAction(actionType) {
        let success = false;
        let message = "";
        
        switch(actionType) {
            case 'eat':
                success = gameManager.playerEat();
                break;
            case 'drink':
                success = gameManager.playerDrink();
                break;
            case 'rest':
                success = gameManager.playerRest();
                break;
        }
        
        if (success) {
            // Update resource display to show health changes
            this.updateResourceDisplay();
        }
    },
    
    /**
     * Strategic action
     * @param {string} type - The type of strategic action
     */
    strategic(type) {
        let message = "";
        
        switch (type) {
            case 'strategic':
                message = "You took some time to think about your game strategy.";
                break;
            case 'trainPhysical':
                message = "You worked on improving your physical abilities.";
                break;
            case 'trainMental':
                message = "You practiced puzzles to sharpen your mental skills.";
                break;
        }
        
        this.showActionResult(message);
    },
    
    /**
     * Show action result message
     * @param {string} message - The result message
     */
    showActionResult(message) {
        gameManager.dialogueSystem.showDialogue(
            message,
            ["Continue"],
            () => gameManager.dialogueSystem.hideDialogue()
        );
    },
    
    /**
     * Get a random tribe mate
     * @returns {Object} A random tribe mate
     */
    getRandomTribeMate() {
        const playerTribe = gameManager.getPlayerTribe();
        if (!playerTribe || playerTribe.members.length <= 1) return null;
        
        const player = gameManager.getPlayerSurvivor();
        const tribemates = playerTribe.members.filter(member => member !== player);
        
        if (tribemates.length === 0) return null;
        
        return tribemates[Math.floor(Math.random() * tribemates.length)];
    },
    
    /**
     * View relationships
     */
    viewRelationships() {
        // This would show a relationships panel
        // For now, just show a dialogue with relationships
        const player = gameManager.getPlayerSurvivor();
        const tribe = gameManager.getPlayerTribe();
        
        let text = "Your relationships:\n\n";
        
        tribe.members.forEach(member => {
            if (member !== player) {
                const relationship = gameManager.relationshipSystem.getRelationship(player, member);
                const description = gameManager.relationshipSystem.getRelationshipDescription(player, member);
                text += `${member.name}: ${relationship} (${description})\n`;
            }
        });
        
        gameManager.dialogueSystem.showDialogue(
            text,
            ["Close"],
            () => gameManager.dialogueSystem.hideDialogue()
        );
    },
    
    /**
     * View alliances
     */
    viewAlliances() {
        // This would show an alliances panel
        // For now, just show a dialogue with alliances
        const player = gameManager.getPlayerSurvivor();
        const alliances = gameManager.allianceSystem.getSurvivorAlliances(player);
        
        let text = "";
        
        if (alliances.length === 0) {
            text = "You are not currently in any alliances.\n\n";
            
            // Suggest potential allies
            const potentialAllies = gameManager.allianceSystem.suggestPotentialAllies(player);
            
            if (potentialAllies.length > 0) {
                text += "Potential allies:\n";
                potentialAllies.forEach(ally => {
                    const relationship = gameManager.relationshipSystem.getRelationship(player, ally);
                    text += `${ally.name}: ${relationship}\n`;
                });
                
                // Since there are potential allies, offer to form an alliance
                gameManager.dialogueSystem.showDialogue(
                    text,
                    ["Form an alliance", "Close"],
                    (choice) => {
                        if (choice === 0) {
                            this.showFormAllianceScreen(potentialAllies);
                        } else {
                            gameManager.dialogueSystem.hideDialogue();
                        }
                    }
                );
                return;
            } else {
                text += "You need to improve your relationships before you can form alliances.";
            }
        } else {
            text = "Your alliances:\n\n";
            
            alliances.forEach(alliance => {
                text += `${alliance.name} (Strength: ${Math.round(alliance.strength)}):\n`;
                alliance.members.forEach(member => {
                    if (member !== player) {
                        text += `- ${member.name}\n`;
                    }
                });
                text += "\n";
            });
            
            // Suggest potential allies that aren't in any alliance with the player
            const existingAllies = new Set();
            alliances.forEach(alliance => {
                alliance.members.forEach(member => {
                    existingAllies.add(member.name);
                });
            });
            
            const potentialAllies = gameManager.allianceSystem.suggestPotentialAllies(player)
                .filter(ally => !existingAllies.has(ally.name));
            
            if (potentialAllies.length > 0) {
                text += "\nPotential new allies:\n";
                potentialAllies.forEach(ally => {
                    const relationship = gameManager.relationshipSystem.getRelationship(player, ally);
                    text += `${ally.name}: ${relationship}\n`;
                });
                
                // Offer to form a new alliance
                gameManager.dialogueSystem.showDialogue(
                    text,
                    ["Form a new alliance", "Close"],
                    (choice) => {
                        if (choice === 0) {
                            this.showFormAllianceScreen(potentialAllies);
                        } else {
                            gameManager.dialogueSystem.hideDialogue();
                        }
                    }
                );
                return;
            }
        }
        
        gameManager.dialogueSystem.showDialogue(
            text,
            ["Close"],
            () => gameManager.dialogueSystem.hideDialogue()
        );
    },
    
    /**
     * Show the alliance formation screen
     * @param {Array} potentialAllies - Array of potential allies
     */
    showFormAllianceScreen(potentialAllies) {
        if (potentialAllies.length === 0) {
            gameManager.dialogueSystem.showDialogue(
                "You don't have any potential allies with a high enough relationship score.",
                ["Close"],
                () => gameManager.dialogueSystem.hideDialogue()
            );
            return;
        }
        
        // Create choices for each potential ally
        const choices = potentialAllies.map(ally => {
            const relationship = gameManager.relationshipSystem.getRelationship(
                gameManager.getPlayerSurvivor(), ally
            );
            return `${ally.name} (Relationship: ${relationship})`;
        });
        
        // Add a cancel option
        choices.push("Cancel");
        
        gameManager.dialogueSystem.showDialogue(
            "Who do you want to form an alliance with?",
            choices,
            (choice) => {
                if (choice === choices.length - 1) {
                    // Cancel was selected
                    this.viewAlliances();
                    return;
                }
                
                const selectedAlly = potentialAllies[choice];
                this.formAllianceWith(selectedAlly);
            }
        );
    },
    
    /**
     * Form an alliance with a selected ally
     * @param {Object} ally - The ally to form an alliance with
     */
    formAllianceWith(ally) {
        const player = gameManager.getPlayerSurvivor();
        
        // Create the alliance
        const alliance = gameManager.allianceSystem.createAllianceBetween(player, ally);
        
        if (alliance) {
            gameManager.dialogueSystem.showDialogue(
                `You've formed an alliance with ${ally.name}! You agree to work together and protect each other in the game.`,
                ["Great!"],
                () => {
                    gameManager.dialogueSystem.hideDialogue();
                    // Refresh alliances display
                    this.viewAlliances();
                }
            );
        } else {
            gameManager.dialogueSystem.showDialogue(
                `${ally.name} is hesitant to form an alliance right now. Try improving your relationship first.`,
                ["OK"],
                () => {
                    gameManager.dialogueSystem.hideDialogue();
                    // Go back to alliances view
                    this.viewAlliances();
                }
            );
        }
    },
    
    /**
     * Process random events
     */
    processRandomEvents() {
        // Relationships change randomly
        gameManager.relationshipSystem.processRandomRelationships();
        
        // NPCs might find idols
        gameManager.idolSystem.processNPCIdolFinds();
    },
    
    /**
     * Proceed to next day (challenge or tribal council)
     */
    proceedToNextDay() {
        // Check if player's tribe must attend tribal council (lost immunity)
        const player = gameManager.getPlayerSurvivor();
        const playerTribe = gameManager.getPlayerTribe();
        const dayAdvanced = gameManager.dayAdvanced;
        
        // Check if the tribe members have immunity after a challenge
        const hasImmunity = playerTribe.members.some(member => member.hasImmunity);
        
        // If there was a recent challenge and player's tribe lost (no immunity)
        if (dayAdvanced && !hasImmunity && gameManager.gamePhase === "preMerge") {
            // Go to tribal council (lost immunity)
            gameManager.dialogueSystem.showDialogue(
                "Your tribe lost immunity in the challenge and must attend Tribal Council tonight.",
                ["Proceed to Tribal Council"],
                () => {
                    gameManager.dialogueSystem.hideDialogue();
                    gameManager.setGameState("tribalCouncil");
                }
            );
        } 
        // If in post-merge phase, everyone goes to tribal council after the challenge
        else if (dayAdvanced && gameManager.gamePhase === "postMerge") {
            gameManager.dialogueSystem.showDialogue(
                "It's time for Tribal Council.",
                ["Proceed to Tribal Council"],
                () => {
                    gameManager.dialogueSystem.hideDialogue();
                    gameManager.setGameState("tribalCouncil");
                }
            );
        }
        // Otherwise, proceed to next immunity challenge
        else {
            gameManager.setGameState("challenge");
        }
        
        // Reset day advanced flag if it was set
        if (dayAdvanced) {
            gameManager.dayAdvanced = false;
        }
    }
};