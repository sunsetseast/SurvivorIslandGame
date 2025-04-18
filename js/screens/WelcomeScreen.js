// Welcome Screen
window.WelcomeScreen = {
    /**
     * Set up welcome screen
     */
    setup() {
        // Set up title text
        const titleText = document.getElementById('welcome-screen').querySelector('h1');
        if (titleText) {
            titleText.textContent = "Survivor Island";
        }
        
        // Create settings section
        this.createGameSettingsUI();
        
        // Set up play button
        const playButton = document.getElementById('play-button');
        if (playButton) {
            playButton.addEventListener('click', () => {
                this.onPlayButtonClick();
            });
        }
    },
    
    /**
     * Create game settings UI
     */
    createGameSettingsUI() {
        const welcomeScreen = document.getElementById('welcome-screen');
        if (!welcomeScreen) return;
        
        // Check if settings container already exists
        let settingsContainer = document.getElementById('game-settings-container');
        if (settingsContainer) {
            // Clear existing content
            clearChildren(settingsContainer);
        } else {
            // Create settings container
            settingsContainer = createElement('div', {
                id: 'game-settings-container',
                className: 'settings-container'
            });
            
            // Insert before play button
            const playButton = document.getElementById('play-button');
            if (playButton && playButton.parentNode) {
                playButton.parentNode.insertBefore(settingsContainer, playButton);
            } else {
                welcomeScreen.appendChild(settingsContainer);
            }
        }
        
        // Add game settings heading
        const settingsHeading = createElement('h2', {
            textContent: 'Game Settings'
        });
        settingsContainer.appendChild(settingsHeading);
        
        // Tribe count selection
        const tribeCountContainer = createElement('div', {
            className: 'setting-option'
        });
        
        const tribeCountLabel = createElement('label', {
            htmlFor: 'tribe-count',
            textContent: 'Number of Tribes: '
        });
        tribeCountContainer.appendChild(tribeCountLabel);
        
        const tribeCountSelect = createElement('select', {
            id: 'tribe-count',
            className: 'setting-select'
        });
        
        const option2Tribes = createElement('option', {
            value: '2',
            textContent: '2 Tribes (9 players each)'
        });
        tribeCountSelect.appendChild(option2Tribes);
        
        const option3Tribes = createElement('option', {
            value: '3',
            textContent: '3 Tribes (6 players each)'
        });
        tribeCountSelect.appendChild(option3Tribes);
        
        // Set default selection to 2 tribes
        tribeCountSelect.value = '2';
        
        tribeCountContainer.appendChild(tribeCountSelect);
        settingsContainer.appendChild(tribeCountContainer);
        
        // Add custom styling
        const style = document.createElement('style');
        style.textContent = `
            .settings-container {
                background-color: rgba(0, 0, 0, 0.7);
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
                width: 80%;
                max-width: 500px;
                margin: 0 auto 20px;
            }
            
            .settings-container h2 {
                color: #f1c40f;
                margin-top: 0;
                margin-bottom: 15px;
            }
            
            .setting-option {
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .setting-option label {
                color: #fff;
                margin-right: 10px;
                font-size: 16px;
            }
            
            .setting-select {
                padding: 8px;
                border-radius: 5px;
                background-color: #fff;
                border: none;
                font-size: 14px;
                cursor: pointer;
                min-width: 200px;
            }
        `;
        document.head.appendChild(style);
    },
    
    /**
     * Handle play button click
     */
    onPlayButtonClick() {
        // Get selected tribe count
        const tribeCountSelect = document.getElementById('tribe-count');
        if (tribeCountSelect) {
            gameManager.tribeCount = parseInt(tribeCountSelect.value, 10);
        } else {
            // Default to 2 tribes if selection not found
            gameManager.tribeCount = 2;
        }
        
        // Start the game
        gameManager.startGame();
    }
};