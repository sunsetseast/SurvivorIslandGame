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
    
    // Tribe Info
    if (tribeInfo && currentTribe) {
        let tribeHTML = `
            <div class="menu-tribe">
                <strong>Tribe:</strong> <span style="color:${currentTribe.tribeColor}">${currentTribe.tribeName}</span>
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