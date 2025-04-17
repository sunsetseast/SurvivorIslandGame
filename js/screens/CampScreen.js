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
        
        const playerTribe = gameManager.getPlayerTribe();
        if (!playerTribe) return;
        
        if (fireBar) {
            fireBar.style.width = formatProgressWidth(playerTribe.fire, 100);
        }
        
        if (waterBar) {
            waterBar.style.width = formatProgressWidth(playerTribe.water, 100);
        }
        
        if (foodBar) {
            foodBar.style.width = formatProgressWidth(playerTribe.food, 100);
        }
        
        if (fireValue) {
            fireValue.textContent = playerTribe.fire;
        }
        
        if (waterValue) {
            waterValue.textContent = playerTribe.water;
        }
        
        if (foodValue) {
            foodValue.textContent = playerTribe.food;
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
        // Show idol search interface
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
        
        // Show result message
        const message = "You took some time to rest and recovered some energy.";
        this.showActionResult(message);
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
        }
        
        gameManager.dialogueSystem.showDialogue(
            text,
            ["Close"],
            () => gameManager.dialogueSystem.hideDialogue()
        );
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
     * Proceed to next day (challenge)
     */
    proceedToNextDay() {
        gameManager.setGameState("challenge");
    }
};