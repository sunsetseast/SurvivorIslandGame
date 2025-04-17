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
                tribeHTML += `
                    <div class="menu-tribe">
                        <strong>Your Tribe:</strong> <span style="color:${currentTribe.tribeColor}">${currentTribe.tribeName}</span>
                    </div>
                    <div class="menu-tribe">
                        <strong>Members:</strong>
                    </div>
                    <ul class="menu-tribe-members">
                `;
                
                currentTribe.members.forEach(member => {
                    tribeHTML += `<li>${member.name}${member.isPlayer ? ' (You)' : ''}</li>`;
                });
                
                tribeHTML += `</ul>`;
            }
            
            // Show other tribes
            allTribes.forEach(tribe => {
                if (tribe !== currentTribe) {
                    tribeHTML += `
                        <div class="menu-tribe" style="margin-top: 15px;">
                            <strong>Tribe:</strong> <span style="color:${tribe.tribeColor}">${tribe.tribeName}</span>
                        </div>
                        <div class="menu-tribe">
                            <strong>Members:</strong>
                        </div>
                        <ul class="menu-tribe-members">
                    `;
                    
                    tribe.members.forEach(member => {
                        tribeHTML += `<li>${member.name}</li>`;
                    });
                    
                    tribeHTML += `</ul>`;
                }
            });
        } else {
            tribeHTML = '<div class="menu-empty">No tribe information available</div>';
        }
        
        tribeInfo.innerHTML = tribeHTML;
    }
    
    // Inventory
    if (inventory && player) {
        let inventoryHTML = '<div class="menu-inventory">';
        
        if (player.hasIdol) {
            inventoryHTML += '<div class="inventory-item">Hidden Immunity Idol</div>';
        } else {
            inventoryHTML += '<div class="inventory-empty">No items in inventory</div>';
        }
        
        inventoryHTML += '</div>';
        inventory.innerHTML = inventoryHTML;
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeGame);

// Handle window errors
window.onerror = function(message, source, lineno, colno, error) {
    console.error('An error occurred:', message, 'at', source, lineno, colno);
    console.error(error);
    return true;
};