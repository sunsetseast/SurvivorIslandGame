// Camp Screen
// Define CampScreen as a global variable
window.CampScreen = {
    /**
     * Set up camp screen
     */
    setup() {
        console.log("CampScreen setup() called");
        this.updateHeaderInfo();
        this.updateResourceDisplay();
        this.createLocationButtons();
        this.hideLocationActions();
        this.setupButtonListeners();
    },
    
    /**
     * Set up button event listeners - using direct onclick property for better reliability
     */
    setupButtonListeners() {
        console.log("Setting up camp screen button listeners");
        
        // Relationship button
        const relationshipsButton = document.getElementById('view-relationships-button');
        if (relationshipsButton) {
            console.log("Setting up relationshipsButton with direct onclick");
            relationshipsButton.onclick = () => {
                console.log("Relationships button clicked");
                this.viewRelationships();
            };
        } else {
            console.error("relationshipsButton not found");
        }
        
        // Alliances button
        const alliancesButton = document.getElementById('view-alliances-button');
        if (alliancesButton) {
            console.log("Setting up alliancesButton with direct onclick");
            alliancesButton.onclick = () => {
                console.log("Alliances button clicked");
                this.viewAlliances();
            };
        } else {
            console.error("alliancesButton not found");
        }
        
        // Next Phase button
        const nextPhaseButton = document.getElementById('proceed-to-challenge-button');
        if (nextPhaseButton) {
            console.log("Setting up nextPhaseButton with direct onclick");
            nextPhaseButton.onclick = () => {
                console.log("Next Phase button clicked");
                this.proceedToNextPhase();
            };
        } else {
            console.error("nextPhaseButton not found");
        }
        
        // Back button
        const backButton = document.getElementById('back-to-locations-button');
        if (backButton) {
            console.log("Setting up backButton with direct onclick");
            backButton.onclick = () => {
                this.hideLocationActions();
            };
        } else {
            console.error("backButton not found");
        }
        
        // Personal health action buttons - recreate them to ensure they work
        this.createPersonalHealthButtons();
        
        // Process random events
        this.processRandomEvents();
    },
    
    /**
     * Create personal health buttons
     */
    createPersonalHealthButtons() {
        console.log("Creating personal health buttons");
        
        // Get buttons
        const eatButton = document.getElementById('eat-button');
        const drinkButton = document.getElementById('drink-button');
        const personalRestButton = document.getElementById('personal-rest-button');
        
        // If buttons don't exist, create them
        const healthActionsContainer = document.querySelector('.health-actions-buttons');
        if (!healthActionsContainer) {
            console.error("Health actions container not found");
            return;
        }
        
        // Clear existing buttons
        clearChildren(healthActionsContainer);
        
        // Create eat button
        const newEatButton = document.createElement('button');
        newEatButton.id = 'eat-button';
        newEatButton.className = 'action-button';
        newEatButton.textContent = 'Eat (-10 Tribe Food)';
        newEatButton.style.backgroundColor = '#ff9800';
        newEatButton.style.color = 'white';
        newEatButton.style.padding = '10px 20px';
        newEatButton.style.margin = '5px';
        newEatButton.style.border = 'none';
        newEatButton.style.borderRadius = '5px';
        newEatButton.style.cursor = 'pointer';
        newEatButton.style.fontWeight = 'bold';
        newEatButton.onclick = () => {
            console.log("Eat button clicked");
            this.performPersonalHealthAction('eat');
        };
        healthActionsContainer.appendChild(newEatButton);
        
        // Create drink button
        const newDrinkButton = document.createElement('button');
        newDrinkButton.id = 'drink-button';
        newDrinkButton.className = 'action-button';
        newDrinkButton.textContent = 'Drink (-10 Tribe Water)';
        newDrinkButton.style.backgroundColor = '#2196f3';
        newDrinkButton.style.color = 'white';
        newDrinkButton.style.padding = '10px 20px';
        newDrinkButton.style.margin = '5px';
        newDrinkButton.style.border = 'none';
        newDrinkButton.style.borderRadius = '5px';
        newDrinkButton.style.cursor = 'pointer';
        newDrinkButton.style.fontWeight = 'bold';
        newDrinkButton.onclick = () => {
            console.log("Drink button clicked");
            this.performPersonalHealthAction('drink');
        };
        healthActionsContainer.appendChild(newDrinkButton);
        
        // Create rest button
        const newRestButton = document.createElement('button');
        newRestButton.id = 'personal-rest-button';
        newRestButton.className = 'action-button';
        newRestButton.textContent = 'Rest (Uses Fire)';
        newRestButton.style.backgroundColor = '#673ab7';
        newRestButton.style.color = 'white';
        newRestButton.style.padding = '10px 20px';
        newRestButton.style.margin = '5px';
        newRestButton.style.border = 'none';
        newRestButton.style.borderRadius = '5px';
        newRestButton.style.cursor = 'pointer';
        newRestButton.style.fontWeight = 'bold';
        newRestButton.onclick = () => {
            console.log("Rest button clicked");
            this.performPersonalHealthAction('rest');
        };
        healthActionsContainer.appendChild(newRestButton);
        
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
            // Check if tribe has immunity and update the display
            const hasImmunity = playerTribe.members.length > 0 && playerTribe.members[0].hasImmunity;
            tribeNameElement.textContent = playerTribe.tribeName + " Tribe" + (hasImmunity ? " (Immune)" : "");
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
        console.log("createLocationButtons called");
        const locationButtonsContainer = document.getElementById('location-buttons');
        console.log("Location buttons container:", locationButtonsContainer);
        
        // Add safety check to verify DOM element exists
        if (!locationButtonsContainer) {
            console.error("Location buttons container not found!");
            
            // Let's try with a delay to ensure DOM is fully loaded
            setTimeout(() => {
                const retryContainer = document.getElementById('location-buttons');
                console.log("Retry finding location-buttons container:", retryContainer);
                if (retryContainer) {
                    console.log("Found container on retry, continuing with location buttons creation");
                    this._createLocationButtonsImpl(retryContainer);
                }
            }, 500);
            return;
        }
        
        // Clear container
        clearChildren(locationButtonsContainer);
        
        // Define locations - always use this hardcoded array to ensure locations are available
        const locations = [
            {
                name: "Beach",
                description: "The sandy shore around your camp where you can collect water and fish.",
                actions: [
                    {
                        name: "Collect Water",
                        description: "Gather water for your tribe.",
                        type: "collectWater",
                        energyCost: 1
                    },
                    {
                        name: "Fish",
                        description: "Try to catch fish for food.",
                        type: "findFood",
                        energyCost: 1
                    },
                    {
                        name: "Social Time",
                        description: "Spend time socializing with your tribe mates.",
                        type: "socialize",
                        energyCost: 1
                    }
                ]
            },
            {
                name: "Jungle",
                description: "The dense forest surrounding your camp where resources and hidden idols can be found.",
                actions: [
                    {
                        name: "Gather Firewood",
                        description: "Collect firewood to keep your camp fire going.",
                        type: "gatherFirewood",
                        energyCost: 1
                    },
                    {
                        name: "Forage for Food",
                        description: "Search for fruits, plants, and small animals to eat.",
                        type: "findFood",
                        energyCost: 1
                    },
                    {
                        name: "Look for Idol",
                        description: "Search for a hidden immunity idol.",
                        type: "searchForIdol",
                        energyCost: 2
                    }
                ]
            },
            {
                name: "Camp",
                description: "Your tribe's main living area with shelter and fire.",
                actions: [
                    {
                        name: "Rest",
                        description: "Recover some energy by resting.",
                        type: "rest",
                        energyCost: 0
                    },
                    {
                        name: "Maintain Fire",
                        description: "Work on keeping the fire strong.",
                        type: "gatherFirewood",
                        energyCost: 1
                    },
                    {
                        name: "Strategy Talk",
                        description: "Discuss game strategy with tribe mates.",
                        type: "strategic",
                        energyCost: 1
                    }
                ]
            },
            {
                name: "Private Area",
                description: "A secluded spot away from camp where you can think or have private conversations.",
                actions: [
                    {
                        name: "Strategic Planning",
                        description: "Plan your moves in the game.",
                        type: "strategic",
                        energyCost: 1
                    },
                    {
                        name: "Physical Training",
                        description: "Work on your physical abilities for challenges.",
                        type: "trainPhysical",
                        energyCost: 1
                    },
                    {
                        name: "Mental Exercises",
                        description: "Practice puzzles and mental challenges.",
                        type: "trainMental",
                        energyCost: 1
                    }
                ]
            }
        ];
        
        // Save locations to window object so they can be accessed by other functions
        window.campLocations = locations;
        
        // Call the implementation helper
        this._createLocationButtonsImpl(locationButtonsContainer);
    },
    
    /**
     * Helper method to create location buttons
     * @param {HTMLElement} container - The container element to append buttons to
     */
    _createLocationButtonsImpl(container) {
        if (!container) {
            console.error("Invalid container provided to _createLocationButtonsImpl");
            return;
        }
        
        // Clear the container first
        clearChildren(container);
        
        // Use the saved locations
        const locations = window.campLocations || [];
        
        console.log("Creating location buttons for locations:", locations);
        console.log("Number of locations:", locations.length);
        
        // Create buttons for each location
        locations.forEach((location, index) => {
            console.log(`Creating button for location ${index}: ${location.name}`);
            const button = document.createElement('button');
            button.className = 'location-button';
            button.textContent = location.name;
            button.setAttribute('data-location', location.name);
            
            // Style the button to be more visible
            button.style.margin = '5px';
            button.style.padding = '10px 20px';
            button.style.backgroundColor = '#5cb85c';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';
            button.style.fontWeight = 'bold';
            
            // Add direct event listener using a more reliable method
            button.onclick = () => {
                console.log(`Location button clicked: ${location.name}`);
                this.selectLocation(location);
            };
            
            container.appendChild(button);
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
                // Create button with direct DOM methods
                const button = document.createElement('button');
                button.className = 'action-button';
                button.textContent = `${action.name} (${action.energyCost} Energy)`;
                
                // Add direct event listener
                button.addEventListener('click', () => {
                    console.log(`Action button clicked: ${action.name}`);
                    this.performAction(action);
                });
                
                // Disable if not enough energy
                if (gameManager.energySystem.getCurrentEnergy() < action.energyCost) {
                    button.disabled = true;
                }
                
                // Create description
                const description = document.createElement('p');
                description.className = 'action-description';
                description.textContent = action.description;
                
                // Create container and append elements
                const actionContainer = document.createElement('div');
                actionContainer.className = 'action-container';
                actionContainer.appendChild(button);
                actionContainer.appendChild(description);
                
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
        // Special case for idol search - we don't consume energy yet
        // Energy will be consumed only when searching a specific hiding spot
        if (action.type === 'searchForIdol') {
            this.searchForIdol();
            
            // Hide action panel
            this.hideLocationActions();
            
            // Update resource display
            this.updateResourceDisplay();
            return;
        }
        
        // Check if player has enough energy for other actions
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
            this.proceedToNextPhase();
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
        
        const player = gameManager.getPlayerSurvivor();
        const relationship = gameManager.relationshipSystem.getRelationship(player, tribeMate);
        const relationshipDesc = gameManager.relationshipSystem.getRelationshipDescription(player, tribeMate);
        
        // Get any existing memories
        const memories = gameManager.relationshipSystem.getMemories(player, tribeMate);
        const hasMemories = memories.length > 0;
        
        // Get personality insight
        const personalityInsight = gameManager.relationshipSystem.getPersonalityInsight(tribeMate);
        
        // Create a custom chat UI
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.id = 'social-chat-container';
        
        // Chat header
        const chatHeader = document.createElement('div');
        chatHeader.className = 'chat-header';
        
        const chatAvatar = document.createElement('div');
        chatAvatar.className = 'chat-avatar';
        chatAvatar.textContent = tribeMate.name.charAt(0);
        
        const chatName = document.createElement('div');
        chatName.className = 'chat-name';
        chatName.textContent = tribeMate.name;
        
        const chatStatus = document.createElement('div');
        chatStatus.className = 'chat-status';
        chatStatus.textContent = relationshipDesc;
        
        chatHeader.appendChild(chatAvatar);
        chatHeader.appendChild(chatName);
        chatHeader.appendChild(chatStatus);
        
        // Chat messages
        const chatMessages = document.createElement('div');
        chatMessages.className = 'chat-messages';
        chatMessages.id = 'social-chat-messages';
        
        // Chat response options
        const chatOptions = document.createElement('div');
        chatOptions.className = 'chat-response-options';
        chatOptions.id = 'social-chat-options';
        
        // Assemble chat container
        chatContainer.appendChild(chatHeader);
        chatContainer.appendChild(chatMessages);
        chatContainer.appendChild(chatOptions);
        
        // Insert before the proceed to challenge button
        const proceedButton = document.getElementById('proceed-to-challenge-button');
        if (proceedButton && proceedButton.parentNode) {
            proceedButton.parentNode.insertBefore(chatContainer, proceedButton);
        } else {
            // Fallback insertion location
            const campScreen = document.getElementById('camp-screen');
            if (campScreen) {
                campScreen.appendChild(chatContainer);
            }
        }
        
        // Add initial messages
        this.addChatMessage(chatMessages, tribeMate.name, this.getGreeting(relationship, tribeMate), 'incoming');
        
        // If there are memories, add a reference to them
        if (hasMemories) {
            const mostImportantMemory = memories[0]; // Already sorted by importance
            setTimeout(() => {
                this.addChatMessage(
                    chatMessages, 
                    tribeMate.name, 
                    `Remember when we talked about ${mostImportantMemory.text}?`, 
                    'incoming'
                );
            }, 1000);
        }
        
        // If relationship is good enough, add the personality insight
        if (relationship >= 40) {
            setTimeout(() => {
                this.addChatMessage(
                    chatMessages, 
                    tribeMate.name, 
                    personalityInsight, 
                    'incoming'
                );
            }, hasMemories ? 2000 : 1000);
        }
        
        // Show typing indicator briefly before displaying options
        this.showTypingIndicator(chatMessages);
        
        // Define chat options
        setTimeout(() => {
            this.showChatOptions(tribeMate, relationship, chatOptions, chatMessages);
        }, 2500);
    },
    
    getGreeting(relationship, tribeMate) {
        if (relationship < 30) {
            return `*${tribeMate.name} seems uncomfortable as you approach*\nHey... what's up?`;
        } else if (relationship < 60) {
            return `*nods*\nHey there. What's going on?`;
        } else {
            return `*smiles warmly*\nHey! Great to see you. How are you doing?`;
        }
    },
    
    showTypingIndicator(chatMessages) {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-typing';
        typingIndicator.innerHTML = 'Typing<div class="chat-typing-dots"><div class="chat-typing-dot"></div><div class="chat-typing-dot"></div><div class="chat-typing-dot"></div></div>';
        chatMessages.appendChild(typingIndicator);
        
        // Remove after 2 seconds
        setTimeout(() => {
            typingIndicator.remove();
        }, 2000);
    },
    
    addChatMessage(chatMessages, speaker, text, type) {
        // Create message element
        const message = document.createElement('div');
        message.className = `message message-${type}`;
        
        // Handle potential formatting (text in asterisks becomes italic)
        let formattedText = text;
        if (text.includes('*')) {
            formattedText = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        }
        
        // Support for newlines
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        message.innerHTML = formattedText;
        
        // Add time element
        const timeElement = document.createElement('div');
        timeElement.className = 'message-time';
        timeElement.textContent = this.getTimeString();
        message.appendChild(timeElement);
        
        // Add to chat messages
        chatMessages.appendChild(message);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    
    getTimeString() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' + 
               now.getMinutes().toString().padStart(2, '0');
    },
    
    showChatOptions(tribeMate, relationship, chatOptions, chatMessages) {
        // Clear current options
        chatOptions.innerHTML = '';
        
        // Basic options for everyone
        this.addChatOption(
            chatOptions, 
            "Talk about camp life", 
            "personal",
            () => this.handleCampLifeChat(tribeMate, chatMessages, chatOptions)
        );
        
        this.addChatOption(
            chatOptions, 
            "Share personal stories", 
            "personal",
            () => this.handlePersonalStories(tribeMate, chatMessages, chatOptions)
        );
        
        // Strategic options unlock at different relationship levels
        if (relationship >= 40) {
            this.addChatOption(
                chatOptions, 
                "Discuss other tribe members", 
                "strategic",
                () => this.handleDiscussOthers(tribeMate, chatMessages, chatOptions)
            );
        }
        
        if (relationship >= 60) {
            this.addChatOption(
                chatOptions, 
                "Talk about alliance strategy", 
                "alliance",
                () => this.handleAllianceStrategy(tribeMate, chatMessages, chatOptions)
            );
        }
        
        if (relationship >= 75) {
            this.addChatOption(
                chatOptions, 
                "Share sensitive information", 
                "alliance",
                () => this.handleSecretInfo(tribeMate, chatMessages, chatOptions)
            );
        }
        
        // Add exit option
        this.addChatOption(
            chatOptions, 
            "End conversation", 
            "personal",
            () => {
                // Remove chat UI
                const chatContainer = document.getElementById('social-chat-container');
                if (chatContainer) {
                    chatContainer.remove();
                }
            }
        );
    },
    
    addChatOption(container, text, type, callback) {
        const option = document.createElement('div');
        option.className = `chat-option chat-option-${type}`;
        option.textContent = text;
        option.addEventListener('click', callback);
        container.appendChild(option);
    },
    
    handleCampLifeChat(tribeMate, chatMessages, chatOptions) {
        const player = gameManager.getPlayerSurvivor();
        
        // Add player message
        this.addChatMessage(
            chatMessages, 
            player.name, 
            "So how are you handling camp life? The shelter's not too bad, right?", 
            'outgoing'
        );
        
        // Clear options temporarily
        chatOptions.innerHTML = '';
        
        // Show typing indicator
        this.showTypingIndicator(chatMessages);
        
        // Add tribe mate's response after delay
        setTimeout(() => {
            // Get a random response with 10% chance of negative response
            const isNegativeResponse = Math.random() < 0.1;
            let response, relationshipChange;
            
            if (isNegativeResponse) {
                response = "*looks annoyed*\nHonestly? I'm tired of talking about the shelter and fire situation. Everyone's always complaining about the same things.";
                relationshipChange = -1;
            } else {
                const responses = [
                    "The shelter's holding up okay. I'm more worried about our fire situation though. We need to gather more wood before it rains.",
                    "I'm just grateful we have any shelter at all. Back at home I'm used to much worse, believe me.",
                    "It's not the Hilton, but it works! I actually slept pretty well last night, all things considered."
                ];
                response = responses[Math.floor(Math.random() * responses.length)];
                relationshipChange = 1;
            }
            
            this.addChatMessage(chatMessages, tribeMate.name, response, 'incoming');
            
            // Update relationship
            gameManager.relationshipSystem.changeRelationship(player, tribeMate, relationshipChange);
            
            // If negative response, show reaction
            if (isNegativeResponse) {
                setTimeout(() => {
                    const reactionElement = document.createElement('div');
                    reactionElement.className = 'message-reaction';
                    reactionElement.textContent = `Relationship decreased by ${Math.abs(relationshipChange)}`;
                    chatMessages.appendChild(reactionElement);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 500);
            } else {
                setTimeout(() => {
                    const reactionElement = document.createElement('div');
                    reactionElement.className = 'message-reaction';
                    reactionElement.textContent = `Relationship increased by ${relationshipChange}`;
                    chatMessages.appendChild(reactionElement);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 500);
            }
            
            // Record the memory
            gameManager.relationshipSystem.addMemory(
                player, 
                tribeMate, 
                "daily camp activities", 
                3
            );
            
            // Show options again after delay
            setTimeout(() => {
                this.showChatOptions(tribeMate, gameManager.relationshipSystem.getRelationship(player, tribeMate), chatOptions, chatMessages);
            }, 1500);
        }, 2000);
    },
    
    handlePersonalStories(tribeMate, chatMessages, chatOptions) {
        const player = gameManager.getPlayerSurvivor();
        
        // Add player message
        this.addChatMessage(
            chatMessages, 
            player.name, 
            "What's your life like back home? I'd love to hear more about you.", 
            'outgoing'
        );
        
        // Clear options temporarily
        chatOptions.innerHTML = '';
        
        // Show typing indicator
        this.showTypingIndicator(chatMessages);
        
        // Add tribe mate's response after delay
        setTimeout(() => {
            const responses = [
                `*opens up*\nI work as a ${this.getRandomProfession()}. It's definitely different from being out here! At home I have ${this.getRandomHobby()} as a hobby. What about you?`,
                `*smiles*\nWell, back home I live with ${this.getRandomFamily()}. I really miss them. This game is tough but I'm playing for them.`,
                `*thinks for a moment*\nI'm actually going through some big changes at home. Just ${this.getRandomLifeEvent()} before coming out here, so this game is a major turning point for me.`
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            
            this.addChatMessage(chatMessages, tribeMate.name, response, 'incoming');
            
            // Add player's follow-up response
            setTimeout(() => {
                this.addChatMessage(
                    chatMessages, 
                    player.name, 
                    "That's really interesting. Thanks for sharing that with me.", 
                    'outgoing'
                );
                
                // Show tribe mate's appreciation
                setTimeout(() => {
                    this.addChatMessage(
                        chatMessages, 
                        tribeMate.name, 
                        "*seems to appreciate the conversation*\nIt's nice to talk about something besides strategy for once. Thanks for listening.", 
                        'incoming'
                    );
                    
                    // Update relationship
                    const relationshipChange = 2;
                    gameManager.relationshipSystem.changeRelationship(player, tribeMate, relationshipChange);
                    
                    // Show relationship change
                    setTimeout(() => {
                        const reactionElement = document.createElement('div');
                        reactionElement.className = 'message-reaction';
                        reactionElement.textContent = `Relationship increased by ${relationshipChange}`;
                        chatMessages.appendChild(reactionElement);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 500);
                    
                    // Record the memory
                    gameManager.relationshipSystem.addMemory(
                        player, 
                        tribeMate, 
                        "personal life stories", 
                        4
                    );
                    
                    // Show options again after delay
                    setTimeout(() => {
                        this.showChatOptions(tribeMate, gameManager.relationshipSystem.getRelationship(player, tribeMate), chatOptions, chatMessages);
                    }, 1500);
                }, 2000);
            }, 2000);
        }, 2000);
    },
    
    handleDiscussOthers(tribeMate, chatMessages, chatOptions) {
        const player = gameManager.getPlayerSurvivor();
        
        // Get a random tribe member to discuss
        const otherMembers = this.getPlayerTribe().members.filter(m => 
            m !== player && m !== tribeMate
        );
        
        if (otherMembers.length === 0) {
            this.addChatMessage(
                chatMessages, 
                player.name, 
                "I wanted to talk about the others, but there's not many of us left to discuss!", 
                'outgoing'
            );
            
            // Show options again after delay
            setTimeout(() => {
                this.showChatOptions(tribeMate, gameManager.relationshipSystem.getRelationship(player, tribeMate), chatOptions, chatMessages);
            }, 1500);
            return;
        }
        
        const discussTarget = otherMembers[Math.floor(Math.random() * otherMembers.length)];
        
        // Add player message
        this.addChatMessage(
            chatMessages, 
            player.name, 
            `What do you think about ${discussTarget.name}? Do you trust them?`, 
            'outgoing'
        );
        
        // Clear options temporarily
        chatOptions.innerHTML = '';
        
        // Show typing indicator
        this.showTypingIndicator(chatMessages);
        
        // Success chance based on relationship
        const relationship = gameManager.relationshipSystem.getRelationship(player, tribeMate);
        const isSuccessful = Math.random() * 100 < relationship;
        
        setTimeout(() => {
            if (isSuccessful) {
                const targetRelationship = gameManager.relationshipSystem.getRelationship(tribeMate, discussTarget);
                let opinion, response;
                
                if (targetRelationship < 30) {
                    opinion = "doesn't trust";
                    response = `*lowers voice*\nBetween you and me, I don't trust ${discussTarget.name} at all. Something feels off about them, and I've noticed them talking to everyone separately.`;
                } else if (targetRelationship < 60) {
                    opinion = "is neutral about";
                    response = `*shrugs*\nI'm still figuring ${discussTarget.name} out. They seem okay, but I'm not ready to put my game in their hands yet.`;
                } else {
                    opinion = "trusts";
                    response = `*nods confidently*\nI actually really like ${discussTarget.name}. We've connected well, and I think they're playing an honest game so far.`;
                }
                
                this.addChatMessage(chatMessages, tribeMate.name, response, 'incoming');
                
                // Player response
                setTimeout(() => {
                    this.addChatMessage(
                        chatMessages, 
                        player.name, 
                        "That's really good to know. Thanks for being honest with me.", 
                        'outgoing'
                    );
                    
                    // Update relationship
                    const relationshipChange = 1;
                    gameManager.relationshipSystem.changeRelationship(player, tribeMate, relationshipChange);
                    
                    // Show relationship change
                    setTimeout(() => {
                        const reactionElement = document.createElement('div');
                        reactionElement.className = 'message-reaction';
                        reactionElement.textContent = `Relationship increased by ${relationshipChange}`;
                        reactionElement.textContent += `\nYou learned that ${tribeMate.name} ${opinion} ${discussTarget.name}`;
                        chatMessages.appendChild(reactionElement);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 500);
                    
                    // Record the memory
                    gameManager.relationshipSystem.addMemory(
                        player, 
                        tribeMate, 
                        `their opinion of ${discussTarget.name}`, 
                        4
                    );
                }, 1500);
            } else {
                // Failed to get information
                this.addChatMessage(
                    chatMessages, 
                    tribeMate.name, 
                    `*suddenly looks guarded*\nI don't think we should be talking about ${discussTarget.name} behind their back. It doesn't feel right.`, 
                    'incoming'
                );
                
                // Player response
                setTimeout(() => {
                    this.addChatMessage(
                        chatMessages, 
                        player.name, 
                        "You're right, I shouldn't have asked. Sorry about that.", 
                        'outgoing'
                    );
                    
                    // Update relationship - negative impact
                    const relationshipChange = -1;
                    gameManager.relationshipSystem.changeRelationship(player, tribeMate, relationshipChange);
                    
                    // Show relationship change
                    setTimeout(() => {
                        const reactionElement = document.createElement('div');
                        reactionElement.className = 'message-reaction';
                        reactionElement.textContent = `Relationship decreased by ${Math.abs(relationshipChange)}`;
                        reactionElement.textContent += `\n${tribeMate.name} didn't want to gossip about others`;
                        chatMessages.appendChild(reactionElement);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 500);
                    
                    // Record the memory
                    gameManager.relationshipSystem.addMemory(
                        player, 
                        tribeMate, 
                        "their unwillingness to gossip", 
                        3
                    );
                }, 1500);
            }
            
            // Show options again after delay
            setTimeout(() => {
                this.showChatOptions(tribeMate, gameManager.relationshipSystem.getRelationship(player, tribeMate), chatOptions, chatMessages);
            }, 3000);
        }, 2000);
    },
    
    handleAllianceStrategy(tribeMate, chatMessages, chatOptions) {
        const player = gameManager.getPlayerSurvivor();
        
        // Check if already in alliance
        const inAlliance = gameManager.allianceSystem.areInSameAlliance(player, tribeMate);
        
        // Add player message
        this.addChatMessage(
            chatMessages, 
            player.name, 
            inAlliance ? 
                "Let's talk about our alliance strategy. Who should we target next?" : 
                "I think we should work together. Would you be interested in forming an alliance?", 
            'outgoing'
        );
        
        // Clear options temporarily
        chatOptions.innerHTML = '';
        
        // Show typing indicator
        this.showTypingIndicator(chatMessages);
        
        setTimeout(() => {
            if (inAlliance) {
                // Already in alliance - discuss strategy
                this.addChatMessage(
                    chatMessages, 
                    tribeMate.name, 
                    "*moves closer and speaks quietly*\nI've been thinking about that too. I think we should target someone who's a physical threat at the next vote. We need to break up any challenge beasts before the merge.", 
                    'incoming'
                );
                
                // Player response
                setTimeout(() => {
                    this.addChatMessage(
                        chatMessages, 
                        player.name, 
                        "That makes a lot of sense. I'm with you on that plan.", 
                        'outgoing'
                    );
                    
                    // Final response
                    setTimeout(() => {
                        this.addChatMessage(
                            chatMessages, 
                            tribeMate.name, 
                            "*nods*\nGreat, glad we're on the same page. Let's keep checking in as things develop.", 
                            'incoming'
                        );
                        
                        // Update relationship
                        const relationshipChange = 2;
                        gameManager.relationshipSystem.changeRelationship(player, tribeMate, relationshipChange);
                        
                        // Show relationship change
                        setTimeout(() => {
                            const reactionElement = document.createElement('div');
                            reactionElement.className = 'message-reaction';
                            reactionElement.textContent = `Relationship increased by ${relationshipChange}`;
                            reactionElement.textContent += '\nYour alliance is strengthened';
                            chatMessages.appendChild(reactionElement);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }, 500);
                        
                        // Record the memory
                        gameManager.relationshipSystem.addMemory(
                            player, 
                            tribeMate, 
                            "alliance planning", 
                            5
                        );
                        
                        // Show options again after delay
                        setTimeout(() => {
                            this.showChatOptions(tribeMate, gameManager.relationshipSystem.getRelationship(player, tribeMate), chatOptions, chatMessages);
                        }, 1500);
                    }, 1500);
                }, 1500);
            } else {
                // Not in alliance - try to form one
                const relationship = gameManager.relationshipSystem.getRelationship(player, tribeMate);
                const receptivity = relationship > 70 ? "very receptive" : "cautiously interested";
                
                this.addChatMessage(
                    chatMessages, 
                    tribeMate.name, 
                    `*looks ${receptivity === "very receptive" ? "excited" : "thoughtful"}*\nAn alliance? I've been thinking about my options... ${receptivity === "very receptive" ? "I think that's a great idea!" : "Tell me more about what you're thinking."}`, 
                    'incoming'
                );
                
                // Player follow up
                setTimeout(() => {
                    this.addChatMessage(
                        chatMessages, 
                        player.name, 
                        "I think we could work well together. We can watch each other's backs and make it far in this game.", 
                        'outgoing'
                    );
                    
                    // Create alliance attempt
                    setTimeout(() => {
                        const alliance = gameManager.allianceSystem.createAllianceBetween(player, tribeMate);
                        
                        if (alliance) {
                            this.addChatMessage(
                                chatMessages, 
                                tribeMate.name, 
                                "*reaches out to shake hands*\nI'm in. Let's do this together.", 
                                'incoming'
                            );
                            
                            // Show alliance formation confirmation
                            setTimeout(() => {
                                const reactionElement = document.createElement('div');
                                reactionElement.className = 'message-reaction';
                                reactionElement.textContent = `You've formed an alliance with ${tribeMate.name}!`;
                                chatMessages.appendChild(reactionElement);
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                                
                                // Record the memory
                                gameManager.relationshipSystem.addMemory(
                                    player, 
                                    tribeMate, 
                                    "forming our alliance", 
                                    5
                                );
                            }, 500);
                        } else {
                            this.addChatMessage(
                                chatMessages, 
                                tribeMate.name, 
                                "*hesitates*\nI appreciate the offer, but I need to think about it more. Let's talk again later, okay?", 
                                'incoming'
                            );
                            
                            // Show alliance rejection
                            setTimeout(() => {
                                const reactionElement = document.createElement('div');
                                reactionElement.className = 'message-reaction';
                                reactionElement.textContent = `${tribeMate.name} isn't ready to form an alliance yet`;
                                chatMessages.appendChild(reactionElement);
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                                
                                // Record the memory
                                gameManager.relationshipSystem.addMemory(
                                    player, 
                                    tribeMate, 
                                    "discussing potential alliance", 
                                    4
                                );
                            }, 500);
                        }
                        
                        // Show options again after delay
                        setTimeout(() => {
                            this.showChatOptions(tribeMate, gameManager.relationshipSystem.getRelationship(player, tribeMate), chatOptions, chatMessages);
                        }, 2000);
                    }, 1500);
                }, 1500);
            }
        }, 2000);
    },
    
    handleSecretInfo(tribeMate, chatMessages, chatOptions) {
        const player = gameManager.getPlayerSurvivor();
        
        // Add player message
        this.addChatMessage(
            chatMessages, 
            player.name, 
            "I wanted to talk to you about something more... sensitive. Do you have any information you've been keeping to yourself?", 
            'outgoing'
        );
        
        // Clear options temporarily
        chatOptions.innerHTML = '';
        
        // Show typing indicator
        this.showTypingIndicator(chatMessages);
        
        setTimeout(() => {
            // Determine if they have an idol
            if (tribeMate.hasIdol) {
                this.addChatMessage(
                    chatMessages, 
                    tribeMate.name, 
                    "*looks around nervously and lowers voice to a whisper*\nOkay, I'm trusting you with this... I found a hidden immunity idol.", 
                    'incoming'
                );
                
                // Player response
                setTimeout(() => {
                    this.addChatMessage(
                        chatMessages, 
                        player.name, 
                        "*eyes widen*\nWow, that's huge! Thank you for trusting me with that.", 
                        'outgoing'
                    );
                    
                    // Update relationship
                    const relationshipChange = 3;
                    gameManager.relationshipSystem.changeRelationship(player, tribeMate, relationshipChange);
                    
                    // Show relationship change
                    setTimeout(() => {
                        const reactionElement = document.createElement('div');
                        reactionElement.className = 'message-reaction';
                        reactionElement.textContent = `Relationship increased by ${relationshipChange}`;
                        reactionElement.textContent += '\nYou learned that they have a hidden immunity idol!';
                        chatMessages.appendChild(reactionElement);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 500);
                    
                    // Record the memory
                    gameManager.relationshipSystem.addMemory(
                        player, 
                        tribeMate, 
                        "their hidden immunity idol", 
                        5
                    );
                }, 1500);
            } else if (player.hasIdol) {
                this.addChatMessage(
                    chatMessages, 
                    tribeMate.name, 
                    "I don't have anything special to share. Do you have something you wanted to tell me?", 
                    'incoming'
                );
                
                // Add player idol sharing options
                setTimeout(() => {
                    // Add special chat options for idol
                    chatOptions.innerHTML = '';
                    
                    this.addChatOption(
                        chatOptions, 
                        "Share that you have an idol", 
                        "alliance",
                        () => {
                            this.addChatMessage(
                                chatMessages, 
                                player.name, 
                                "*whispers*\nI found a hidden immunity idol. I wanted you to know because I trust you.", 
                                'outgoing'
                            );
                            
                            chatOptions.innerHTML = '';
                            this.showTypingIndicator(chatMessages);
                            
                            setTimeout(() => {
                                this.addChatMessage(
                                    chatMessages, 
                                    tribeMate.name, 
                                    "*looks shocked*\nThat's incredible! I promise I'll keep your secret. Thank you for trusting me with this.", 
                                    'incoming'
                                );
                                
                                // Update relationship significantly
                                const relationshipChange = 4;
                                gameManager.relationshipSystem.changeRelationship(player, tribeMate, relationshipChange);
                                
                                // Show relationship change
                                setTimeout(() => {
                                    const reactionElement = document.createElement('div');
                                    reactionElement.className = 'message-reaction';
                                    reactionElement.textContent = `Relationship increased by ${relationshipChange}`;
                                    reactionElement.textContent += '\nYou shared your idol secret with them';
                                    chatMessages.appendChild(reactionElement);
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                }, 500);
                                
                                // Record the memory - this is important!
                                gameManager.relationshipSystem.addMemory(
                                    player, 
                                    tribeMate, 
                                    "your hidden immunity idol", 
                                    5
                                );
                                
                                // Show options again after delay
                                setTimeout(() => {
                                    this.showChatOptions(tribeMate, gameManager.relationshipSystem.getRelationship(player, tribeMate), chatOptions, chatMessages);
                                }, 2000);
                            }, 2000);
                        }
                    );
                    
                    this.addChatOption(
                        chatOptions, 
                        "Keep your idol secret", 
                        "strategic",
                        () => {
                            this.addChatMessage(
                                chatMessages, 
                                player.name, 
                                "No, just checking if you had anything to share. It's always good to talk strategy.", 
                                'outgoing'
                            );
                            
                            chatOptions.innerHTML = '';
                            this.showTypingIndicator(chatMessages);
                            
                            setTimeout(() => {
                                this.addChatMessage(
                                    chatMessages, 
                                    tribeMate.name, 
                                    "Definitely. I'll let you know if I learn anything important.", 
                                    'incoming'
                                );
                                
                                // Still had a good conversation
                                const relationshipChange = 1;
                                gameManager.relationshipSystem.changeRelationship(player, tribeMate, relationshipChange);
                                
                                // Show relationship change
                                setTimeout(() => {
                                    const reactionElement = document.createElement('div');
                                    reactionElement.className = 'message-reaction';
                                    reactionElement.textContent = `Relationship increased by ${relationshipChange}`;
                                    chatMessages.appendChild(reactionElement);
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                }, 500);
                                
                                // Record the memory
                                gameManager.relationshipSystem.addMemory(
                                    player, 
                                    tribeMate, 
                                    "potential game strategies", 
                                    3
                                );
                                
                                // Show options again after delay
                                setTimeout(() => {
                                    this.showChatOptions(tribeMate, gameManager.relationshipSystem.getRelationship(player, tribeMate), chatOptions, chatMessages);
                                }, 1500);
                            }, 1500);
                        }
                    );
                }, 1000);
                return; // Exit early since we've added special options
            } else {
                // Generic strategy talk
                this.addChatMessage(
                    chatMessages, 
                    tribeMate.name, 
                    "*leans in*\nI've been observing everyone closely. I think there might be a hidden alliance forming between some of the others. We should keep an eye on that.", 
                    'incoming'
                );
                
                // Player response
                setTimeout(() => {
                    this.addChatMessage(
                        chatMessages, 
                        player.name, 
                        "That's good intel. We'll need to be careful about who we trust going forward.", 
                        'outgoing'
                    );
                    
                    // Final response
                    setTimeout(() => {
                        this.addChatMessage(
                            chatMessages, 
                            tribeMate.name, 
                            "Exactly. Let's keep sharing information like this. It'll help us both navigate the game.", 
                            'incoming'
                        );
                        
                        // Update relationship
                        const relationshipChange = 2;
                        gameManager.relationshipSystem.changeRelationship(player, tribeMate, relationshipChange);
                        
                        // Show relationship change
                        setTimeout(() => {
                            const reactionElement = document.createElement('div');
                            reactionElement.className = 'message-reaction';
                            reactionElement.textContent = `Relationship increased by ${relationshipChange}`;
                            chatMessages.appendChild(reactionElement);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }, 500);
                        
                        // Record the memory
                        gameManager.relationshipSystem.addMemory(
                            player, 
                            tribeMate, 
                            "strategic game information", 
                            4
                        );
                    }, 1500);
                }, 1500);
            }
            
            // Show options again after delay (except for the player idol case which returns early)
            setTimeout(() => {
                this.showChatOptions(tribeMate, gameManager.relationshipSystem.getRelationship(player, tribeMate), chatOptions, chatMessages);
            }, 5000);
        }, 2000);
    },
    
    // Helper functions for chat variety
    getRandomProfession() {
        const professions = ["teacher", "nurse", "software engineer", "sales manager", "chef", "personal trainer", "accountant", "construction worker"];
        return professions[Math.floor(Math.random() * professions.length)];
    },
    
    getRandomHobby() {
        const hobbies = ["painting", "hiking", "video games", "cooking", "playing guitar", "photography", "yoga", "gardening"];
        return hobbies[Math.floor(Math.random() * hobbies.length)];
    },
    
    getRandomFamily() {
        const family = ["my spouse and two kids", "my parents", "my three roommates", "my brother and his family", "just my dog, but he's family"];
        return family[Math.floor(Math.random() * family.length)];
    },
    
    getRandomLifeEvent() {
        const events = ["got married", "changed careers", "moved to a new city", "finished grad school", "lost a close family member"];
        return events[Math.floor(Math.random() * events.length)];
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
        const player = gameManager.getPlayerSurvivor();
        const playerTribe = gameManager.getPlayerTribe();
        
        switch (type) {
            case 'strategic':
                // Create a chat-like UI for strategic insights
                this.showStrategyInsights();
                break;
                
            case 'trainPhysical':
                // Randomly increase physical stats
                let physicalStat = ['strength', 'endurance', 'agility'][Math.floor(Math.random() * 3)];
                let statIncrease = Math.random() < 0.7 ? 1 : 2; // 70% chance of +1, 30% chance of +2
                
                if (player.stats && player.stats[physicalStat] !== undefined) {
                    player.stats[physicalStat] = Math.min(10, player.stats[physicalStat] + statIncrease);
                    
                    // Show result with stat info
                    let message = `You worked on improving your physical abilities. Your ${physicalStat} increased by ${statIncrease}!`;
                    if (statIncrease > 1) {
                        message += " That was a great training session!";
                    }
                    this.showActionResult(message);
                } else {
                    this.showActionResult("You worked on improving your physical abilities.");
                }
                break;
                
            case 'trainMental':
                // Randomly increase mental stats
                let mentalStat = ['intelligence', 'social', 'perception'][Math.floor(Math.random() * 3)];
                let mentalIncrease = Math.random() < 0.7 ? 1 : 2; // 70% chance of +1, 30% chance of +2
                
                if (player.stats && player.stats[mentalStat] !== undefined) {
                    player.stats[mentalStat] = Math.min(10, player.stats[mentalStat] + mentalIncrease);
                    
                    // Show result with stat info
                    let message = `You practiced puzzles and mental exercises. Your ${mentalStat} increased by ${mentalIncrease}!`;
                    if (mentalIncrease > 1) {
                        message += " You're really getting better at this!";
                    }
                    this.showActionResult(message);
                } else {
                    this.showActionResult("You practiced puzzles to sharpen your mental skills.");
                }
                break;
        }
    },
    
    showStrategyInsights() {
        const player = gameManager.getPlayerSurvivor();
        const playerTribe = gameManager.getPlayerTribe();
        const allTribes = gameManager.getTribes();
        const gamePhase = gameManager.getGamePhase();
        
        // Create chat-like container for strategy insights
        const strategyContainer = document.createElement('div');
        strategyContainer.className = 'chat-container';
        strategyContainer.id = 'strategy-chat-container';
        strategyContainer.style.marginBottom = '20px';
        
        // Strategy header
        const strategyHeader = document.createElement('div');
        strategyHeader.className = 'chat-header';
        strategyHeader.style.backgroundColor = '#2d8a50'; // Jungle green
        
        const headerTitle = document.createElement('div');
        headerTitle.className = 'chat-name';
        headerTitle.textContent = 'Strategic Analysis';
        
        strategyHeader.appendChild(headerTitle);
        
        // Strategy content
        const strategyContent = document.createElement('div');
        strategyContent.className = 'chat-messages';
        strategyContent.style.maxHeight = '350px';
        
        // Strategy options
        const strategyOptions = document.createElement('div');
        strategyOptions.className = 'chat-response-options';
        
        // Assemble strategy container
        strategyContainer.appendChild(strategyHeader);
        strategyContainer.appendChild(strategyContent);
        strategyContainer.appendChild(strategyOptions);
        
        // Insert after the location actions
        const locationActions = document.getElementById('location-actions');
        if (locationActions && locationActions.parentNode) {
            locationActions.parentNode.insertBefore(strategyContainer, locationActions.nextSibling);
        } else {
            // Fallback insertion
            const campScreen = document.getElementById('camp-screen');
            if (campScreen) {
                campScreen.appendChild(strategyContainer);
            }
        }
        
        // Add initial thinking message
        this.addStrategyMessage(strategyContent, "Taking some time to think and analyze the current game situation...");
        
        // Add game state analysis
        setTimeout(() => {
            // Game phase insights
            let phaseInsight = "";
            
            if (gamePhase === "preMerge") {
                phaseInsight = "You're in the pre-merge phase. Focus on keeping your tribe strong for challenges while forming solid relationships.";
                
                // Add tribe strength comparison
                if (allTribes.length > 1) {
                    setTimeout(() => {
                        let tribeStrengthMsg = "Tribe strength analysis:\n";
                        
                        allTribes.forEach(tribe => {
                            const tribeStrength = this.calculateTribeStrength(tribe);
                            let strengthDesc = "";
                            
                            if (tribeStrength > 7) strengthDesc = "very strong";
                            else if (tribeStrength > 5) strengthDesc = "strong";
                            else if (tribeStrength > 3) strengthDesc = "average";
                            else strengthDesc = "weak";
                            
                            tribeStrengthMsg += `- ${tribe.tribeName}: ${strengthDesc} (${tribe.members.length} members)\n`;
                        });
                        
                        this.addStrategyMessage(strategyContent, tribeStrengthMsg);
                    }, 1500);
                }
            } else {
                phaseInsight = "You're in the post-merge phase. Individual immunities and hidden idols are crucial now. Make sure you have strong allies.";
                
                // Add jury information if relevant
                const juryMembers = gameManager.getJury ? gameManager.getJury() : [];
                if (juryMembers && juryMembers.length > 0) {
                    phaseInsight += ` There are currently ${juryMembers.length} jury members who will vote for the winner.`;
                }
            }
            
            this.addStrategyMessage(strategyContent, phaseInsight);
            
            // Add alliance analysis
            setTimeout(() => {
                const playerAlliances = gameManager.allianceSystem.getSurvivorAlliances(player);
                
                if (playerAlliances && playerAlliances.length > 0) {
                    let allianceMsg = `You're currently in ${playerAlliances.length} alliance(s):\n`;
                    
                    playerAlliances.forEach(alliance => {
                        const members = alliance.members.map(m => m.name).join(", ");
                        const strength = alliance.strength || "unknown";
                        let strengthDesc = "";
                        
                        if (strength > 80) strengthDesc = "very strong";
                        else if (strength > 60) strengthDesc = "strong";
                        else if (strength > 40) strengthDesc = "moderate";
                        else strengthDesc = "weak";
                        
                        allianceMsg += `- With ${members} (${strengthDesc})\n`;
                    });
                    
                    this.addStrategyMessage(strategyContent, allianceMsg);
                } else {
                    this.addStrategyMessage(strategyContent, "You're not currently in any formal alliances. This could be risky - consider building stronger connections with tribe mates.");
                }
            }, 3000);
            
            // Add idol information
            setTimeout(() => {
                const playerHasIdol = player.hasIdol;
                const idolsInPlay = gameManager.idolSystem.getIdolsInPlay();
                
                let idolMsg = "";
                if (playerHasIdol) {
                    idolMsg = "You have a hidden immunity idol. Use it wisely - it could save you at a crucial tribal council.";
                } else {
                    idolMsg = "You don't have a hidden immunity idol.";
                    if (idolsInPlay > 0) {
                        idolMsg += ` There ${idolsInPlay === 1 ? 'is' : 'are'} ${idolsInPlay} idol${idolsInPlay > 1 ? 's' : ''} in play. Keep searching!`;
                    }
                }
                
                this.addStrategyMessage(strategyContent, idolMsg);
            }, 4500);
            
            // Add tribe dynamics or potential targets
            setTimeout(() => {
                if (gamePhase === "preMerge") {
                    // In pre-merge, analyze tribe dynamics
                    const tribeMembers = playerTribe.members.filter(m => !m.isPlayer);
                    
                    if (tribeMembers.length > 0) {
                        // Find most and least connected tribe mates
                        let highestRelTotal = 0;
                        let lowestRelTotal = 9999;
                        let mostConnected = null;
                        let leastConnected = null;
                        
                        tribeMembers.forEach(member => {
                            let relTotal = 0;
                            tribeMembers.forEach(other => {
                                if (other !== member) {
                                    const rel = gameManager.relationshipSystem.getRelationship(member, other);
                                    relTotal += rel;
                                }
                            });
                            
                            // Include relationship with player
                            const relWithPlayer = gameManager.relationshipSystem.getRelationship(member, player);
                            relTotal += relWithPlayer;
                            
                            if (relTotal > highestRelTotal) {
                                highestRelTotal = relTotal;
                                mostConnected = member;
                            }
                            
                            if (relTotal < lowestRelTotal) {
                                lowestRelTotal = relTotal;
                                leastConnected = member;
                            }
                        });
                        
                        let dynamicsMsg = "Tribe dynamics:\n";
                        
                        if (mostConnected) {
                            dynamicsMsg += `- ${mostConnected.name} is well-connected and has strong relationships\n`;
                        }
                        
                        if (leastConnected) {
                            dynamicsMsg += `- ${leastConnected.name} seems isolated and could be a potential target\n`;
                        }
                        
                        // Who might be targeting the player
                        const playerRelationships = tribeMembers.map(member => {
                            return {
                                member: member,
                                relationship: gameManager.relationshipSystem.getRelationship(member, player)
                            };
                        }).sort((a, b) => a.relationship - b.relationship);
                        
                        if (playerRelationships.length > 0 && playerRelationships[0].relationship < 40) {
                            dynamicsMsg += `- Be careful of ${playerRelationships[0].member.name}, who might target you due to your low relationship (${playerRelationships[0].relationship}/100)`;
                        }
                        
                        this.addStrategyMessage(strategyContent, dynamicsMsg);
                    }
                } else {
                    // In post-merge, identify potential targets and threats
                    const allPlayers = playerTribe.members.filter(m => !m.isPlayer);
                    
                    if (allPlayers.length > 0) {
                        let threatsMsg = "Current threats and potential targets:\n";
                        
                        // Find physical threats
                        const physicalThreats = allPlayers
                            .filter(p => p.stats && (p.stats.strength > 7 || p.stats.endurance > 7))
                            .map(p => p.name)
                            .slice(0, 2);
                        
                        if (physicalThreats.length > 0) {
                            threatsMsg += `- Physical threats: ${physicalThreats.join(", ")}\n`;
                        }
                        
                        // Find strategic threats
                        const strategicThreats = allPlayers
                            .filter(p => p.stats && (p.stats.intelligence > 7 || p.stats.social > 7))
                            .map(p => p.name)
                            .slice(0, 2);
                        
                        if (strategicThreats.length > 0) {
                            threatsMsg += `- Strategic threats: ${strategicThreats.join(", ")}\n`;
                        }
                        
                        // Find potential easy votes
                        const easyTargets = allPlayers
                            .filter(p => {
                                // Count how many people have low relationships with this person
                                let lowRelCount = 0;
                                allPlayers.forEach(other => {
                                    if (other !== p) {
                                        const rel = gameManager.relationshipSystem.getRelationship(other, p);
                                        if (rel < 40) lowRelCount++;
                                    }
                                });
                                return lowRelCount > allPlayers.length / 3; // More than 1/3 of players have low relationship
                            })
                            .map(p => p.name)
                            .slice(0, 2);
                        
                        if (easyTargets.length > 0) {
                            threatsMsg += `- Potential easy votes: ${easyTargets.join(", ")}`;
                        }
                        
                        this.addStrategyMessage(strategyContent, threatsMsg);
                    }
                }
            }, 6000);
            
            // Add close button after all insights are shown
            setTimeout(() => {
                this.addChatOption(
                    strategyOptions,
                    "Got it - Continue",
                    "strategic",
                    () => {
                        const container = document.getElementById('strategy-chat-container');
                        if (container) {
                            container.remove();
                        }
                        
                        // Show a summary message
                        this.showActionResult("You took some time to analyze your game strategy and gained valuable insights.");
                    }
                );
            }, 7500);
        }, 1000);
    },
    
    addStrategyMessage(container, text) {
        // Create message element
        const message = document.createElement('div');
        message.className = 'message message-incoming';
        message.style.backgroundColor = '#e8f5e9'; // Light green background
        message.style.width = '95%';
        message.style.maxWidth = '95%';
        
        // Format text (support for newlines)
        const formattedText = text.replace(/\n/g, '<br>');
        message.innerHTML = formattedText;
        
        // Add to container
        container.appendChild(message);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },
    
    calculateTribeStrength(tribe) {
        // Calculate an approximate tribe strength based on member stats
        let totalStrength = 0;
        
        tribe.members.forEach(member => {
            if (member.stats) {
                // Physical stats matter more for challenges
                const physicalAvg = (
                    (member.stats.strength || 5) + 
                    (member.stats.endurance || 5) + 
                    (member.stats.agility || 5)
                ) / 3;
                
                // Mental stats matter less but still count
                const mentalAvg = (
                    (member.stats.intelligence || 5) + 
                    (member.stats.social || 5) + 
                    (member.stats.perception || 5)
                ) / 3;
                
                // 70% physical, 30% mental for tribe strength
                const memberStrength = (physicalAvg * 0.7) + (mentalAvg * 0.3);
                totalStrength += memberStrength;
            } else {
                // Default value if no stats
                totalStrength += 5;
            }
        });
        
        // Average strength per tribe member
        return tribe.members.length > 0 ? totalStrength / tribe.members.length : 0;
    },,
    
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
        const player = gameManager.getPlayerSurvivor();
        const tribe = gameManager.getPlayerTribe();
        
        // Create relationship panel container
        const relationshipPanel = document.createElement('div');
        relationshipPanel.className = 'social-panel';
        relationshipPanel.id = 'relationship-panel';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'social-panel-header';
        
        const headerIcon = document.createElement('span');
        headerIcon.className = 'icon';
        headerIcon.textContent = 'R';
        
        const headerText = document.createElement('span');
        headerText.textContent = 'Your Relationships';
        
        const closeIcon = document.createElement('span');
        closeIcon.textContent = '×';
        closeIcon.style.fontSize = '24px';
        closeIcon.style.cursor = 'pointer';
        closeIcon.addEventListener('click', () => {
            console.log("Closing relationship panel");
            const panel = document.getElementById('relationship-panel');
            if (panel) panel.remove();
        });
        
        header.appendChild(headerIcon);
        header.appendChild(headerText);
        header.appendChild(closeIcon);
        
        // Create content
        const content = document.createElement('div');
        content.className = 'social-panel-content';
        
        // Create relationship list
        const relationshipList = document.createElement('ul');
        relationshipList.className = 'relationship-list';
        
        // Sort tribe members by relationship strength (descending)
        const sortedMembers = [...tribe.members]
            .filter(member => member !== player)
            .sort((a, b) => {
                const relA = gameManager.relationshipSystem.getRelationship(player, a);
                const relB = gameManager.relationshipSystem.getRelationship(player, b);
                return relB - relA;
            });
        
        // Add each tribe member to the list
        sortedMembers.forEach(member => {
            const relationshipValue = gameManager.relationshipSystem.getRelationship(player, member);
            const description = gameManager.relationshipSystem.getRelationshipDescription(player, member);
            
            // Create list item
            const item = document.createElement('li');
            item.className = 'relationship-item';
            
            // Create avatar
            const avatar = document.createElement('div');
            avatar.className = 'relationship-avatar';
            avatar.textContent = member.name.charAt(0);
            avatar.style.backgroundColor = this.getRelationshipColor(relationshipValue, 0.2);
            avatar.style.color = this.getRelationshipColor(relationshipValue, 1);
            
            // Create details
            const details = document.createElement('div');
            details.className = 'relationship-details';
            
            const name = document.createElement('div');
            name.className = 'relationship-name';
            name.textContent = member.name;
            
            // Create relationship bar
            const bar = document.createElement('div');
            bar.className = 'relationship-bar';
            
            const fill = document.createElement('div');
            fill.className = 'relationship-fill';
            fill.style.width = `${relationshipValue}%`;
            fill.style.backgroundColor = this.getRelationshipColor(relationshipValue, 1);
            
            bar.appendChild(fill);
            
            // Create relationship level text
            const level = document.createElement('div');
            level.className = `relationship-level ${this.getRelationshipTextClass(relationshipValue)}`;
            level.textContent = `${relationshipValue}/100 - ${description}`;
            
            // Assemble details
            details.appendChild(name);
            details.appendChild(bar);
            details.appendChild(level);
            
            // Assemble item
            item.appendChild(avatar);
            item.appendChild(details);
            
            // Add to list
            relationshipList.appendChild(item);
        });
        
        content.appendChild(relationshipList);
        
        // Create actions
        const actions = document.createElement('div');
        actions.className = 'social-panel-actions';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            console.log("Closing relationship panel via button");
            const panel = document.getElementById('relationship-panel');
            if (panel) panel.remove();
        });
        
        actions.appendChild(closeButton);
        
        // Assemble panel
        relationshipPanel.appendChild(header);
        relationshipPanel.appendChild(content);
        relationshipPanel.appendChild(actions);
        
        // Add to document
        document.body.appendChild(relationshipPanel);
        
        // Position panel in the center
        relationshipPanel.style.position = 'fixed';
        relationshipPanel.style.top = '50%';
        relationshipPanel.style.left = '50%';
        relationshipPanel.style.transform = 'translate(-50%, -50%)';
        relationshipPanel.style.zIndex = '1000';
        relationshipPanel.style.maxHeight = '80vh';
        relationshipPanel.style.width = '90%';
        relationshipPanel.style.maxWidth = '500px';
    },
    
    /**
     * Get color for relationship value
     * @param {number} value - Relationship value (0-100)
     * @param {number} alpha - Color opacity (0-1)
     * @returns {string} - CSS color string
     */
    getRelationshipColor(value, alpha) {
        if (value < 20) return `rgba(239, 68, 68, ${alpha})`; // red
        if (value < 40) return `rgba(245, 158, 11, ${alpha})`; // amber
        if (value < 60) return `rgba(100, 116, 139, ${alpha})`; // slate
        if (value < 80) return `rgba(16, 185, 129, ${alpha})`; // emerald
        return `rgba(59, 130, 246, ${alpha})`; // blue
    },
    
    /**
     * Get text class for relationship value
     * @param {number} value - Relationship value (0-100)
     * @returns {string} - CSS class name
     */
    getRelationshipTextClass(value) {
        if (value < 20) return 'text-danger';
        if (value < 40) return 'text-warning';
        if (value < 60) return 'text-neutral';
        if (value < 80) return 'text-good';
        return 'text-excellent';
    },
    
    /**
     * View alliances
     */
    viewAlliances() {
        const player = gameManager.getPlayerSurvivor();
        const alliances = gameManager.allianceSystem.getSurvivorAlliances(player);
        
        // Create alliance panel container
        const alliancePanel = document.createElement('div');
        alliancePanel.className = 'social-panel';
        alliancePanel.id = 'alliance-panel';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'social-panel-header';
        header.style.backgroundColor = '#2d8a50'; // Green for alliances
        
        const headerIcon = document.createElement('span');
        headerIcon.className = 'icon';
        headerIcon.textContent = 'A';
        
        const headerText = document.createElement('span');
        headerText.textContent = 'Your Alliances';
        
        const closeIcon = document.createElement('span');
        closeIcon.textContent = '×';
        closeIcon.style.fontSize = '24px';
        closeIcon.style.cursor = 'pointer';
        closeIcon.addEventListener('click', () => {
            console.log("Closing alliance panel");
            const panel = document.getElementById('alliance-panel');
            if (panel) panel.remove();
        });
        
        header.appendChild(headerIcon);
        header.appendChild(headerText);
        header.appendChild(closeIcon);
        
        // Create content
        const content = document.createElement('div');
        content.className = 'social-panel-content';
        
        // Get potential allies
        const potentialAllies = gameManager.allianceSystem.suggestPotentialAllies(player);
        const existingAllies = new Set();
        
        if (alliances.length > 0) {
            // Create alliance list
            const allianceList = document.createElement('div');
            allianceList.className = 'alliance-list';
            
            // Add each alliance
            alliances.forEach(alliance => {
                // Track existing allies
                alliance.members.forEach(member => {
                    existingAllies.add(member.name);
                });
                
                // Create alliance item
                const allianceItem = document.createElement('div');
                allianceItem.className = 'alliance-item';
                
                // Alliance header with name and strength
                const allianceHeader = document.createElement('div');
                allianceHeader.className = 'alliance-header';
                
                const allianceName = document.createElement('div');
                allianceName.className = 'alliance-name';
                allianceName.textContent = alliance.name;
                
                const allianceStrength = document.createElement('div');
                allianceStrength.className = 'alliance-strength';
                
                let strengthText = "";
                const strengthValue = Math.round(alliance.strength);
                
                if (strengthValue > 80) strengthText = "Very Strong";
                else if (strengthValue > 60) strengthText = "Strong";
                else if (strengthValue > 40) strengthText = "Moderate";
                else strengthText = "Weak";
                
                allianceStrength.textContent = `${strengthText} (${strengthValue})`;
                
                allianceHeader.appendChild(allianceName);
                allianceHeader.appendChild(allianceStrength);
                
                // Alliance members
                const allianceMembers = document.createElement('div');
                allianceMembers.className = 'alliance-members';
                
                alliance.members.forEach(member => {
                    const memberItem = document.createElement('div');
                    memberItem.className = 'alliance-member';
                    
                    const memberAvatar = document.createElement('div');
                    memberAvatar.className = 'alliance-member-avatar';
                    memberAvatar.textContent = member.name.charAt(0);
                    
                    const memberName = document.createElement('div');
                    memberName.className = 'alliance-member-name';
                    memberName.textContent = member.name + (member === player ? ' (You)' : '');
                    
                    memberItem.appendChild(memberAvatar);
                    memberItem.appendChild(memberName);
                    
                    allianceMembers.appendChild(memberItem);
                });
                
                // Add to alliance item
                allianceItem.appendChild(allianceHeader);
                allianceItem.appendChild(allianceMembers);
                
                // Add to alliance list
                allianceList.appendChild(allianceItem);
            });
            
            content.appendChild(allianceList);
        } else {
            // No alliances message
            const noAlliances = document.createElement('div');
            noAlliances.className = 'no-alliances';
            noAlliances.textContent = "You are not currently in any alliances.";
            content.appendChild(noAlliances);
        }
        
        // Filter potential allies that aren't already in an alliance with the player
        const newPotentialAllies = potentialAllies.filter(ally => 
            !existingAllies.has(ally.name) && ally !== player
        );
        
        // Add potential allies section if there are any
        if (newPotentialAllies.length > 0) {
            const potentialAlliesSection = document.createElement('div');
            potentialAlliesSection.className = 'potential-allies';
            
            const potentialAlliesHeader = document.createElement('div');
            potentialAlliesHeader.className = 'potential-allies-header';
            potentialAlliesHeader.textContent = 'Potential Allies';
            
            potentialAlliesSection.appendChild(potentialAlliesHeader);
            
            // Add each potential ally
            newPotentialAllies.forEach(ally => {
                const relationship = gameManager.relationshipSystem.getRelationship(player, ally);
                
                const potentialAlly = document.createElement('div');
                potentialAlly.className = 'potential-ally';
                
                const allyInfo = document.createElement('div');
                allyInfo.className = 'potential-ally-info';
                
                const allyAvatar = document.createElement('div');
                allyAvatar.className = 'potential-ally-avatar';
                allyAvatar.textContent = ally.name.charAt(0);
                
                const allyName = document.createElement('div');
                allyName.className = 'potential-ally-name';
                allyName.textContent = ally.name;
                
                allyInfo.appendChild(allyAvatar);
                allyInfo.appendChild(allyName);
                
                const allyRelationship = document.createElement('div');
                allyRelationship.className = 'potential-ally-relationship';
                allyRelationship.textContent = `${relationship}/100`;
                
                potentialAlly.appendChild(allyInfo);
                potentialAlly.appendChild(allyRelationship);
                
                // Make the whole potential ally row clickable
                potentialAlly.style.cursor = 'pointer';
                potentialAlly.addEventListener('click', () => {
                    console.log("Potential ally clicked:", ally.name);
                    // Close alliance panel
                    const panel = document.getElementById('alliance-panel');
                    if (panel) panel.remove();
                    
                    // Show form alliance dialogue with this specific ally
                    this.formAllianceWith(ally);
                });
                
                potentialAlliesSection.appendChild(potentialAlly);
            });
            
            content.appendChild(potentialAlliesSection);
        }
        
        // Create actions
        const actions = document.createElement('div');
        actions.className = 'social-panel-actions';
        
        // Add form alliance button if there are potential allies
        if (newPotentialAllies.length > 0) {
            const formAllianceButton = document.createElement('button');
            formAllianceButton.className = 'alliance-button';
            formAllianceButton.textContent = 'Form New Alliance';
            formAllianceButton.addEventListener('click', () => {
                console.log("Form alliance button clicked");
                // Close alliance panel
                const panel = document.getElementById('alliance-panel');
                if (panel) panel.remove();
                
                // Show form alliance screen
                this.showFormAllianceScreen(newPotentialAllies);
            });
            
            actions.appendChild(formAllianceButton);
        }
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            console.log("Closing alliance panel via button");
            const panel = document.getElementById('alliance-panel');
            if (panel) panel.remove();
        });
        
        actions.appendChild(closeButton);
        
        // Assemble panel
        alliancePanel.appendChild(header);
        alliancePanel.appendChild(content);
        alliancePanel.appendChild(actions);
        
        // Add to document
        document.body.appendChild(alliancePanel);
        
        // Position panel in the center
        alliancePanel.style.position = 'fixed';
        alliancePanel.style.top = '50%';
        alliancePanel.style.left = '50%';
        alliancePanel.style.transform = 'translate(-50%, -50%)';
        alliancePanel.style.zIndex = '1000';
        alliancePanel.style.maxHeight = '80vh';
        alliancePanel.style.width = '90%';
        alliancePanel.style.maxWidth = '500px';
    },
    
    /**
     * Show the alliance formation screen
     * @param {Array} potentialAllies - Array of potential allies
     */
    showFormAllianceScreen(potentialAllies) {
        if (potentialAllies.length === 0) {
            // Display message if no potential allies
            const messagePanel = document.createElement('div');
            messagePanel.className = 'social-panel';
            messagePanel.id = 'message-panel';
            messagePanel.style.position = 'fixed';
            messagePanel.style.top = '50%';
            messagePanel.style.left = '50%';
            messagePanel.style.transform = 'translate(-50%, -50%)';
            messagePanel.style.zIndex = '1000';
            messagePanel.style.maxWidth = '400px';
            
            const messageContent = document.createElement('div');
            messageContent.style.padding = '30px 20px';
            messageContent.style.textAlign = 'center';
            messageContent.textContent = "You don't have any potential allies with a high enough relationship score.";
            
            const actionDiv = document.createElement('div');
            actionDiv.className = 'social-panel-actions';
            
            const closeButton = document.createElement('button');
            closeButton.className = 'close-button';
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => {
                console.log("Close button clicked in message panel");
                const panel = document.getElementById('message-panel');
                if (panel) panel.remove();
            });
            
            actionDiv.appendChild(closeButton);
            messagePanel.appendChild(messageContent);
            messagePanel.appendChild(actionDiv);
            
            document.body.appendChild(messagePanel);
            return;
        }
        
        // Create form alliance panel
        const formPanel = document.createElement('div');
        formPanel.className = 'social-panel';
        formPanel.id = 'form-alliance-panel';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'social-panel-header';
        header.style.backgroundColor = '#2d8a50'; // Green for alliances
        
        const headerText = document.createElement('span');
        headerText.textContent = 'Form New Alliance';
        
        const closeIcon = document.createElement('span');
        closeIcon.textContent = '×';
        closeIcon.style.fontSize = '24px';
        closeIcon.style.cursor = 'pointer';
        closeIcon.addEventListener('click', () => {
            console.log("Closing form alliance panel");
            const panel = document.getElementById('form-alliance-panel');
            if (panel) panel.remove();
        });
        
        header.appendChild(headerText);
        header.appendChild(closeIcon);
        
        // Create content
        const content = document.createElement('div');
        content.className = 'social-panel-content';
        
        // Create instruction text
        const instruction = document.createElement('div');
        instruction.style.padding = '15px 20px';
        instruction.style.borderBottom = '1px solid #e2e8f0';
        instruction.textContent = "Select a tribe member to form an alliance with:";
        
        content.appendChild(instruction);
        
        // Create potential allies list
        const alliesList = document.createElement('div');
        alliesList.style.padding = '10px 0';
        
        // Sort allies by relationship (highest first)
        const sortedAllies = [...potentialAllies].sort((a, b) => {
            const player = gameManager.getPlayerSurvivor();
            const relA = gameManager.relationshipSystem.getRelationship(player, a);
            const relB = gameManager.relationshipSystem.getRelationship(player, b);
            return relB - relA;
        });
        
        // Add each potential ally
        sortedAllies.forEach(ally => {
            const player = gameManager.getPlayerSurvivor();
            const relationship = gameManager.relationshipSystem.getRelationship(player, ally);
            
            const allyItem = document.createElement('div');
            allyItem.className = 'potential-ally';
            allyItem.style.padding = '12px 20px';
            allyItem.style.cursor = 'pointer';
            allyItem.style.transition = 'background-color 0.2s';
            
            // Highlight on hover
            allyItem.addEventListener('mouseover', () => {
                allyItem.style.backgroundColor = '#f0f9ff';
            });
            allyItem.addEventListener('mouseout', () => {
                allyItem.style.backgroundColor = '';
            });
            
            const allyInfo = document.createElement('div');
            allyInfo.className = 'potential-ally-info';
            
            const avatar = document.createElement('div');
            avatar.className = 'alliance-member-avatar';
            avatar.textContent = ally.name.charAt(0);
            avatar.style.backgroundColor = this.getRelationshipColor(relationship, 0.2);
            avatar.style.color = this.getRelationshipColor(relationship, 1);
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'alliance-member-name';
            nameDiv.textContent = ally.name;
            
            allyInfo.appendChild(avatar);
            allyInfo.appendChild(nameDiv);
            
            const relationshipDiv = document.createElement('div');
            relationshipDiv.className = `relationship-level ${this.getRelationshipTextClass(relationship)}`;
            relationshipDiv.textContent = `${relationship}/100`;
            
            allyItem.appendChild(allyInfo);
            allyItem.appendChild(relationshipDiv);
            
            // Click handler
            allyItem.addEventListener('click', () => {
                console.log("Ally item clicked:", ally.name);
                const panel = document.getElementById('form-alliance-panel');
                if (panel) panel.remove();
                
                // Attempt to form alliance with the selected ally
                this.formAllianceWith(ally);
            });
            
            alliesList.appendChild(allyItem);
        });
        
        content.appendChild(alliesList);
        
        // Create actions
        const actions = document.createElement('div');
        actions.className = 'social-panel-actions';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'close-button';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            console.log("Cancel button clicked in form alliance panel");
            const panel = document.getElementById('form-alliance-panel');
            if (panel) panel.remove();
            
            // Show alliance panel again
            this.viewAlliances();
        });
        
        actions.appendChild(cancelButton);
        
        // Assemble panel
        formPanel.appendChild(header);
        formPanel.appendChild(content);
        formPanel.appendChild(actions);
        
        // Add to document
        document.body.appendChild(formPanel);
        
        // Position panel in the center
        formPanel.style.position = 'fixed';
        formPanel.style.top = '50%';
        formPanel.style.left = '50%';
        formPanel.style.transform = 'translate(-50%, -50%)';
        formPanel.style.zIndex = '1000';
        formPanel.style.maxHeight = '80vh';
        formPanel.style.width = '90%';
        formPanel.style.maxWidth = '500px';
    },
    
    /**
     * Form an alliance with a selected ally
     * @param {Object} ally - The ally to form an alliance with
     */
    formAllianceWith(ally) {
        const player = gameManager.getPlayerSurvivor();
        
        // Create the alliance
        const alliance = gameManager.allianceSystem.createAllianceBetween(player, ally);
        
        // Create result panel
        const resultPanel = document.createElement('div');
        resultPanel.className = 'social-panel';
        resultPanel.id = 'alliance-result-panel';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'social-panel-header';
        
        const headerText = document.createElement('span');
        headerText.textContent = alliance ? 'Alliance Formed' : 'Alliance Declined';
        
        const closeIcon = document.createElement('span');
        closeIcon.textContent = '×';
        closeIcon.style.fontSize = '24px';
        closeIcon.style.cursor = 'pointer';
        closeIcon.addEventListener('click', () => {
            console.log("Closing alliance result panel");
            const panel = document.getElementById('alliance-result-panel');
            if (panel) panel.remove();
            
            // Return to alliance view if needed
            this.viewAlliances();
        });
        
        header.appendChild(headerText);
        header.appendChild(closeIcon);
        
        // Style header based on result
        if (alliance) {
            header.style.backgroundColor = '#2d8a50'; // Green for success
        } else {
            header.style.backgroundColor = '#e45f56'; // Red for failure
        }
        
        // Create content
        const content = document.createElement('div');
        content.className = 'social-panel-content';
        content.style.padding = '20px';
        
        // Create message
        const message = document.createElement('div');
        message.style.marginBottom = '15px';
        message.style.fontSize = '1.1em';
        
        if (alliance) {
            message.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🤝</div>
                    <div style="font-weight: bold; font-size: 1.2em; margin-bottom: 5px;">Alliance Formed!</div>
                </div>
                <p>You've formed an alliance with ${ally.name}!</p>
                <p>You agree to work together, share information, and protect each other in tribal councils.</p>
                <p>Remember that alliances require trust and maintenance. Continue building your relationship to strengthen this bond.</p>
            `;
        } else {
            message.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🤔</div>
                    <div style="font-weight: bold; font-size: 1.2em; margin-bottom: 5px;">Alliance Declined</div>
                </div>
                <p>${ally.name} is hesitant to form an alliance with you right now.</p>
                <p>Try spending more time together and building your relationship. A stronger relationship will make them more likely to trust you with an alliance.</p>
            `;
        }
        
        content.appendChild(message);
        
        // Create actions
        const actions = document.createElement('div');
        actions.className = 'social-panel-actions';
        
        const viewButton = document.createElement('button');
        viewButton.className = alliance ? 'alliance-button' : 'close-button';
        viewButton.textContent = alliance ? 'View Alliance' : 'Close';
        viewButton.addEventListener('click', () => {
            console.log("View button clicked in alliance result panel");
            const panel = document.getElementById('alliance-result-panel');
            if (panel) panel.remove();
            
            // Go back to alliances view
            this.viewAlliances();
        });
        
        actions.appendChild(viewButton);
        
        // Assemble panel
        resultPanel.appendChild(header);
        resultPanel.appendChild(content);
        resultPanel.appendChild(actions);
        
        // Add to document
        document.body.appendChild(resultPanel);
        
        // Position panel in the center
        resultPanel.style.position = 'fixed';
        resultPanel.style.top = '50%';
        resultPanel.style.left = '50%';
        resultPanel.style.transform = 'translate(-50%, -50%)';
        resultPanel.style.zIndex = '1000';
        resultPanel.style.maxHeight = '80vh';
        resultPanel.style.width = '90%';
        resultPanel.style.maxWidth = '500px';
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
     * Proceed to next phase (challenge or tribal council)
     */
    proceedToNextPhase() {
        // Get important game state information
        const player = gameManager.getPlayerSurvivor();
        const playerTribe = gameManager.getPlayerTribe();
        const dayAdvanced = gameManager.dayAdvanced;
        const gameSequence = gameManager.gameSequence;
        
        // Check if the tribe has immunity (tribe members with immunity)
        const hasImmunity = playerTribe.members.length > 0 && playerTribe.members.some(member => member.hasImmunity);
        const isImmune = playerTribe.isImmune === true;
        const hasTribeImmunity = hasImmunity || isImmune;
        
        // Log important state for debugging
        console.log("Proceed to next phase check - Current state:");
        console.log("- Game sequence:", gameSequence);
        console.log("- Tribe has immunity (member check):", hasImmunity);
        console.log("- Tribe has immunity flag:", isImmune);
        console.log("- Tribe has overall immunity:", hasTribeImmunity);
        console.log("- Day advanced:", dayAdvanced);
        console.log("- Game phase:", gameManager.gamePhase);
        console.log("- Members with immunity:", 
                   playerTribe.members.filter(m => m.hasImmunity).map(m => m.name).join(", "));
        
        // Update the progress button text based on the current game state
        const nextPhaseButton = document.getElementById('proceed-to-challenge-button');
        if (nextPhaseButton) {
            if (gameSequence === "afterChallenge") {
                if (!hasTribeImmunity) {
                    nextPhaseButton.textContent = "Proceed to Tribal Council";
                } else {
                    nextPhaseButton.textContent = "Proceed to Next Day";
                }
            } else {
                nextPhaseButton.textContent = "Proceed to Challenge";
            }
        }
        
        // Display last vote results if available and not yet shown
        if (gameManager.lastVotedOut && gameSequence === "beforeChallenge" && !gameManager.lastVotedOutShown) {
            const votedOutName = gameManager.lastVotedOut;
            gameManager.dialogueSystem.showDialogue(
                `${votedOutName} was voted out at the last Tribal Council.`,
                ["Continue"],
                () => {
                    gameManager.dialogueSystem.hideDialogue();
                    gameManager.lastVotedOutShown = true;
                    this.handleGameProgress();
                }
            );
            return;
        }
        
        this.handleGameProgress();
    },
    
    /**
     * Handle the progression of the game based on current state
     */
    handleGameProgress() {
        const player = gameManager.getPlayerSurvivor();
        const playerTribe = gameManager.getPlayerTribe();
        const gameSequence = gameManager.gameSequence;
        
        // Check immunity status in different ways to ensure consistency
        const memberHasImmunity = playerTribe.members.length > 0 && playerTribe.members.some(member => member.hasImmunity);
        const tribeIsImmune = playerTribe.isImmune === true;
        const hasTribeImmunity = memberHasImmunity || tribeIsImmune;
        
        // BEFORE CHALLENGE: Always go to challenge
        if (gameSequence === "beforeChallenge") {
            gameManager.dialogueSystem.showDialogue(
                "Time for the immunity challenge! Your tribe will compete for safety from tribal council.",
                ["Go to Challenge"],
                () => {
                    gameManager.dialogueSystem.hideDialogue();
                    gameManager.gameSequence = "afterChallenge"; // Update the game sequence
                    gameManager.setGameState("challenge");
                }
            );
        }
        // AFTER CHALLENGE: Either go to tribal council or next day
        else if (gameSequence === "afterChallenge") {
            // CASE 1: No immunity in pre-merge phase - go to tribal council
            if (!hasTribeImmunity && gameManager.gamePhase === "preMerge") {
                gameManager.dialogueSystem.showDialogue(
                    "Your tribe lost immunity in the challenge and must attend Tribal Council tonight.",
                    ["Proceed to Tribal Council"],
                    () => {
                        gameManager.dialogueSystem.hideDialogue();
                        gameManager.setGameState("tribalCouncil");
                    }
                );
            }
            // CASE 2: Has immunity in pre-merge phase - skip tribal, inform player of other tribe going
            else if (hasTribeImmunity && gameManager.gamePhase === "preMerge") {
                gameManager.dialogueSystem.showDialogue(
                    "Your tribe won immunity in the challenge! You can relax tonight while the other tribe goes to Tribal Council.",
                    ["Continue to Next Day"],
                    () => {
                        gameManager.dialogueSystem.hideDialogue();
                        // Skip tribal council for player tribe, but process other tribe's vote
                        // in the background (via TribalCouncilSystem)
                        gameManager.tribalCouncilSystem.simulateNPCTribalCouncil();
                        
                        // Reset back to beforeChallenge for next day's flow
                        gameManager.gameSequence = "beforeChallenge";
                        
                        // Advance to the next day
                        gameManager.advanceDay();
                        
                        // Back to camp
                        gameManager.setGameState("camp");
                    }
                );
            }
            // CASE 3: Post-merge phase - everyone goes to tribal (unless player has individual immunity)
            else if (gameManager.gamePhase === "postMerge") {
                const playerHasIndividualImmunity = player.hasImmunity;
                const immunityText = playerHasIndividualImmunity ? 
                    "You have individual immunity tonight!" : 
                    "You'll need to rely on your social game to avoid being voted out.";
                
                gameManager.dialogueSystem.showDialogue(
                    `It's time for Tribal Council. ${immunityText}`,
                    ["Proceed to Tribal Council"],
                    () => {
                        gameManager.dialogueSystem.hideDialogue();
                        gameManager.setGameState("tribalCouncil");
                    }
                );
            }
        }
    }
};