// Main JavaScript File

// Create global game manager instance
let gameManager;

/**
 * Initialize the game
 */
function initializeGame() {
    // Create game manager
    gameManager = new GameManager();
    
    // Try to load saved game or start new game
    if (!gameManager.loadGame()) {
        gameManager.initializeGame();
    }
    
    // Set up UI event listeners
    setupEventListeners();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Set up a function to update inventory display every second
    setInterval(updateInventoryDisplay, 1000);
    
    // Hamburger Menu
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const gameMenu = document.getElementById('game-menu');
    const closeMenu = document.getElementById('close-menu');
    
    if (hamburgerIcon) {
        hamburgerIcon.addEventListener('click', () => {
            hamburgerIcon.classList.toggle('change');
            gameMenu.classList.remove('hidden');
            gameMenu.classList.toggle('active');
            updateGameMenu();
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            hamburgerIcon.classList.remove('change');
            gameMenu.classList.remove('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (gameMenu && 
            gameMenu.classList.contains('active') && 
            !gameMenu.contains(event.target) && 
            event.target !== hamburgerIcon &&
            !hamburgerIcon.contains(event.target)) {
            
            hamburgerIcon.classList.remove('change');
            gameMenu.classList.remove('active');
        }
    });
    
    // Save game button
    const saveButton = document.getElementById('save-game-button');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            gameManager.saveGame();
            alert('Game saved successfully!');
        });
    }
    
    // Load game button
    const loadButton = document.getElementById('load-game-button');
    if (loadButton) {
        loadButton.addEventListener('click', () => {
            if (gameManager.loadGame()) {
                alert('Game loaded successfully!');
                hamburgerIcon.classList.remove('change');
                gameMenu.classList.remove('active');
            } else {
                alert('No saved game found!');
            }
        });
    }
    
    // Restart game button
    const restartButton = document.getElementById('restart-game-button');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            // Confirm restart
            gameManager.dialogueSystem.showDialogue(
                "Are you sure you want to restart the game? All progress will be lost.",
                ["Restart", "Cancel"],
                (choice) => {
                    if (choice === 0) { // Restart
                        // Delete saved game
                        deleteSaveGame();
                        
                        // Initialize new game
                        gameManager.initializeGame();
                        
                        // Show welcome screen
                        gameManager.setGameState("welcome");
                        
                        // Close menu
                        const hamburgerIcon = document.getElementById('hamburger-icon');
                        const gameMenu = document.getElementById('game-menu');
                        if (hamburgerIcon) hamburgerIcon.classList.remove('change');
                        if (gameMenu) gameMenu.classList.remove('active');
                        
                        // Hide dialogue
                        gameManager.dialogueSystem.hideDialogue();
                    } else { // Cancel
                        gameManager.dialogueSystem.hideDialogue();
                    }
                }
            );
        });
    }
    
    // Help button
    const helpButton = document.getElementById('help-button');
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            gameManager.dialogueSystem.showDialogue(
                "Welcome to Survivor Island!\n\n" +
                "- Select a survivor with unique skills and attributes\n" +
                "- Compete in challenges to win immunity\n" +
                "- Form alliances with other survivors\n" +
                "- Avoid being voted off at tribal council\n" +
                "- Use your energy wisely at camp\n" +
                "- Search for hidden immunity idols to save yourself\n" +
                "- Be the last survivor to win!",
                ["Got it!"],
                () => {
                    gameManager.dialogueSystem.hideDialogue();
                }
            );
        });
    }
}

/**
 * Update the game menu with current game information
 */
function updateGameMenu() {
    const playerStats = document.getElementById('player-stats');
    const gameInfo = document.getElementById('game-info');
    const tribeInfo = document.getElementById('tribe-info');
    const inventory = document.getElementById('inventory');
    
    // Only update if menu is active
    if (!document.getElementById('game-menu').classList.contains('active')) {
        return;
    }
    
    // Clear sections
    if (playerStats) clearChildren(playerStats);
    if (gameInfo) clearChildren(gameInfo);
    if (tribeInfo) clearChildren(tribeInfo);
    if (inventory) clearChildren(inventory);
    
    const player = gameManager.getPlayerSurvivor();
    const currentTribe = gameManager.getPlayerTribe();
    const gamePhase = gameManager.getGamePhase();
    const currentDay = gameManager.getDay();
    
    // Player Stats
    if (playerStats && player) {
        const statsHTML = `
            <div class="menu-stat">
                <strong>Name:</strong> ${player.name}
            </div>
            <div class="menu-stat">
                <strong>Physical:</strong> ${player.physicalStat}
            </div>
            <div class="menu-stat">
                <strong>Mental:</strong> ${player.mentalStat}
            </div>
            <div class="menu-stat">
                <strong>Personality:</strong> ${player.personalityStat}
            </div>
        `;
        playerStats.innerHTML = statsHTML;
    }
    
    // Game Info
    if (gameInfo) {
        let phaseText = '';
        switch (gamePhase) {
            case 'preMerge':
                phaseText = 'Pre-Merge Phase';
                break;
            case 'postMerge':
                phaseText = 'Post-Merge Phase';
                break;
            case 'final':
                phaseText = 'Final Phase';
                break;
        }
        
        const gameInfoHTML = `
            <div class="menu-info">
                <strong>Day:</strong> ${currentDay}
            </div>
            <div class="menu-info">
                <strong>Phase:</strong> ${phaseText}
            </div>
            <div class="menu-info">
                <strong>Energy:</strong> ${gameManager.energySystem.getCurrentEnergy()}/${gameManager.energySystem.getMaxEnergy()}
            </div>
        `;
        gameInfo.innerHTML = gameInfoHTML;
    }
    
    // Tribe Info - Now showing all tribes
    if (tribeInfo) {
        let tribeHTML = '';
        
        // Get all tribes
        const allTribes = gameManager.getTribes();
        
        if (allTribes && allTribes.length > 0) {
            // Show player's tribe first
            if (currentTribe) {
                // Check if player tribe has immunity (use isImmune flag or fallback to member check)
                const hasTribalImmunity = currentTribe.isImmune === true || 
                                        (currentTribe.members.length > 0 && 
                                         currentTribe.members.some(m => m.hasImmunity) && 
                                         gameManager.getGamePhase() === "preMerge");
                
                tribeHTML += `
                    <div class="menu-tribe">
                        <strong>Your Tribe:</strong> <span style="color:${currentTribe.tribeColor}">${currentTribe.tribeName}</span>
                        ${hasTribalImmunity ? ' <span style="color:gold; font-weight:bold;">(Immune)</span>' : ''}
                    </div>
                    <div class="menu-tribe">
                        <strong>Members:</strong>
                    </div>
                    <ul class="menu-tribe-members">
                `;
                
                currentTribe.members.forEach(member => {
                    const hasIndividualImmunity = member.hasImmunity && gameManager.getGamePhase() === "postMerge";
                    tribeHTML += `<li>${member.name}${member.isPlayer ? ' (You)' : ''}${hasIndividualImmunity ? ' <span style="color:gold;">★</span>' : ''}</li>`;
                });
                
                tribeHTML += `</ul>`;
            }
            
            // Show other tribes
            allTribes.forEach(tribe => {
                if (tribe !== currentTribe) {
                    // Check if this tribe has immunity (use isImmune flag or fallback to member check)
                    const hasTribalImmunity = tribe.isImmune === true || 
                                             (tribe.members.length > 0 && 
                                              tribe.members.some(m => m.hasImmunity) && 
                                              gameManager.getGamePhase() === "preMerge");
                    
                    tribeHTML += `
                        <div class="menu-tribe" style="margin-top: 15px;">
                            <strong>Tribe:</strong> <span style="color:${tribe.tribeColor}">${tribe.tribeName}</span>
                            ${hasTribalImmunity ? ' <span style="color:gold; font-weight:bold;">(Immune)</span>' : ''}
                        </div>
                        <div class="menu-tribe">
                            <strong>Members:</strong>
                        </div>
                        <ul class="menu-tribe-members">
                    `;
                    
                    tribe.members.forEach(member => {
                        const hasIndividualImmunity = member.hasImmunity && gameManager.getGamePhase() === "postMerge";
                        tribeHTML += `<li>${member.name}${hasIndividualImmunity ? ' <span style="color:gold;">★</span>' : ''}</li>`;
                    });
                    
                    tribeHTML += `</ul>`;
                }
            });
        } else {
            tribeHTML = '<div class="menu-empty">No tribe information available</div>';
        }
        
        // Add a legend for immunity indicators if in post-merge phase
        if (gamePhase === "postMerge") {
            tribeHTML += `
                <div style="margin-top: 15px; font-size: 0.9em;">
                    <span style="color:gold;">★</span> = Has individual immunity
                </div>
            `;
        }
        
        tribeInfo.innerHTML = tribeHTML;
    }
    
    // Inventory
    if (inventory && player) {
        let inventoryHTML = '<div class="menu-inventory">';
        
        // Show idol information
        inventoryHTML += `<div class="inventory-item">
            <p id="idol-status">Hidden Immunity Idol: ${player.hasIdol ? 'Yes' : 'No'}</p>
        `;
        
        // Show total idols in play
        let totalIdols = 0;
        if (gameManager.idolSystem) {
            totalIdols = gameManager.idolSystem.getIdolsInPlay();
        }
        inventoryHTML += `<p id="idols-in-play">Idols in Play: ${totalIdols}</p>`;
        
        // Get player tribe
        const playerTribe = gameManager.getPlayerTribe();
        
        // Show immunity status
        const hasIndividualImmunity = player.hasImmunity;
        const tribeHasImmunity = playerTribe && (playerTribe.isImmune === true || 
                             (playerTribe.members.some(member => member.hasImmunity) && 
                              gameManager.getGamePhase() === "preMerge"));
        
        const hasImmunity = hasIndividualImmunity || tribeHasImmunity;
        
        // Set the immunity text with more details
        let immunityText = `Immunity: ${hasImmunity ? 'Yes' : 'No'}`;
        
        if (hasImmunity) {
            if (gameManager.getGamePhase() === "preMerge") {
                immunityText += " (Tribal)";
            } else if (hasIndividualImmunity) {
                immunityText += " (Individual)";
            }
        }
        
        inventoryHTML += `<p id="immunity-status">${immunityText}</p>`;
        
        // Close the inventory item div
        inventoryHTML += '</div>';
        
        inventory.innerHTML = inventoryHTML;
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeGame);

/**
 * Update the inventory display with idol and immunity information
 */
function updateInventoryDisplay() {
    // Get DOM elements
    const idolStatus = document.getElementById('idol-status');
    const idolsInPlay = document.getElementById('idols-in-play');
    const immunityStatus = document.getElementById('immunity-status');
    
    // If elements don't exist, exit early
    if (!idolStatus || !idolsInPlay || !immunityStatus) {
        console.log("Idol status elements not found in DOM");
        return;
    }
    
    // Get player and tribe information
    const player = gameManager.getPlayerSurvivor();
    const playerTribe = gameManager.getPlayerTribe();
    
    if (!player || !playerTribe) {
        console.log("Player or tribe not available yet");
        return;
    }
    
    // Update idol status
    idolStatus.textContent = `Hidden Immunity Idol: ${player.hasIdol ? 'Yes' : 'No'}`;
    
    // Update idols in play
    let totalIdols = 0;
    
    if (gameManager.idolSystem) {
        totalIdols = gameManager.idolSystem.getIdolsInPlay();
    }
    
    idolsInPlay.textContent = `Idols in Play: ${totalIdols}`;
    
    // Add details about who has idols if any are in play
    if (totalIdols > 0 && gameManager.idolSystem) {
        const idolHolders = gameManager.idolSystem.getSurvivorsWithIdols();
        let idolHoldersElement = document.getElementById('idol-holders');
        
        // Create the element if it doesn't exist
        if (!idolHoldersElement) {
            idolHoldersElement = document.createElement('div');
            idolHoldersElement.id = 'idol-holders';
            idolHoldersElement.style.fontSize = '0.9em';
            idolHoldersElement.style.marginTop = '5px';
            idolHoldersElement.style.padding = '5px';
            idolHoldersElement.style.backgroundColor = '#f8f9fa';
            idolHoldersElement.style.borderRadius = '4px';
            idolsInPlay.parentNode.insertBefore(idolHoldersElement, idolsInPlay.nextSibling);
        }
        
        // Update the element with idol holders
        idolHoldersElement.innerHTML = '<strong>Idol Holders:</strong>';
        const holdersList = document.createElement('ul');
        holdersList.style.marginTop = '5px';
        holdersList.style.paddingLeft = '20px';
        
        if (idolHolders.length > 0) {
            idolHolders.forEach(survivor => {
                const holderItem = document.createElement('li');
                holderItem.textContent = `${survivor.name}${survivor.isPlayer ? ' (You)' : ''}`;
                holdersList.appendChild(holderItem);
            });
            idolHoldersElement.appendChild(holdersList);
        } else {
            // This is a fallback in case getIdolsInPlay() and getSurvivorsWithIdols() are inconsistent
            idolHoldersElement.innerHTML += '<p>Unknown players have idols</p>';
        }
    } else {
        // Remove the idol holders element if no idols are in play
        const idolHoldersElement = document.getElementById('idol-holders');
        if (idolHoldersElement) {
            idolHoldersElement.remove();
        }
    }
    
    // Update immunity status - check both individual immunity and tribe immunity
    const hasIndividualImmunity = player.hasImmunity;
    const tribeHasImmunity = playerTribe && (playerTribe.isImmune === true || 
                            (playerTribe.members.some(member => member.hasImmunity) && 
                             gameManager.getGamePhase() === "preMerge"));
    
    const hasImmunity = hasIndividualImmunity || tribeHasImmunity;
    
    // Set the immunity text with more details
    let immunityText = `Immunity: ${hasImmunity ? 'Yes' : 'No'}`;
    
    if (hasImmunity) {
        if (gameManager.getGamePhase() === "preMerge") {
            immunityText += " (Tribal)";
        } else if (hasIndividualImmunity) {
            immunityText += " (Individual)";
        }
    }
    
    immunityStatus.textContent = immunityText;
}

// Handle window errors
window.onerror = function(message, source, lineno, colno, error) {
    console.error('An error occurred:', message, 'at', source, lineno, colno);
    console.error(error);
    return true;
};