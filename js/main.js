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
            } else {
                alert('No saved game found!');
            }
        });
    }
    
    // Settings button
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            // Show settings panel
            const settingsPanel = document.getElementById('settings-panel');
            if (settingsPanel) {
                settingsPanel.classList.toggle('hidden');
            }
        });
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