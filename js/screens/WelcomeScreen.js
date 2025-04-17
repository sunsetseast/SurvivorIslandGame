// Welcome Screen
const WelcomeScreen = {
    /**
     * Set up welcome screen
     */
    setup() {
        // Set up title text
        const titleText = document.getElementById('welcome-screen').querySelector('h1');
        if (titleText) {
            titleText.textContent = "Survivor Island";
        }
        
        // Set up play button
        const playButton = document.getElementById('play-button');
        if (playButton) {
            playButton.addEventListener('click', () => {
                this.onPlayButtonClick();
            });
        }
    },
    
    /**
     * Handle play button click
     */
    onPlayButtonClick() {
        gameManager.startGame();
    }
};