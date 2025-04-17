// Challenge Screen
const ChallengeScreen = {
    /**
     * Set up challenge screen
     */
    setup() {
        // Reset challenge UI
        this.resetUI();
        
        // Initialize the challenge system (creates a new challenge)
        gameManager.challengeSystem.startChallenge();
        
        // Update the UI with the new challenge
        gameManager.challengeSystem.updateChallengeUI();
        
        // Set up challenge button
        const challengeButton = document.getElementById('challenge-button');
        if (challengeButton) {
            challengeButton.textContent = "Start Challenge";
            challengeButton.disabled = false;
            challengeButton.addEventListener('click', () => {
                this.onChallengeButtonClick();
            });
        }
    },
    
    /**
     * Reset challenge UI
     */
    resetUI() {
        const challengeTitle = document.getElementById('challenge-title');
        const challengeDescription = document.getElementById('challenge-description');
        const challengeProgressBar = document.getElementById('challenge-progress-bar');
        const competitorsContainer = document.getElementById('competitors-container');
        
        if (challengeTitle) {
            challengeTitle.textContent = "Immunity Challenge";
        }
        
        if (challengeDescription) {
            challengeDescription.textContent = "Get ready for the immunity challenge!";
        }
        
        if (challengeProgressBar) {
            challengeProgressBar.style.width = "0%";
        }
        
        if (competitorsContainer) {
            clearChildren(competitorsContainer);
        }
    },
    
    /**
     * Handle challenge button click
     */
    onChallengeButtonClick() {
        // With our reworked system, the button is now always just passing control
        // to the challenge system's button handler, which will handle different states
        gameManager.challengeSystem.onChallengeButtonPressed();
    },
    
    /**
     * Update the challenge UI
     */
    updateUI() {
        // This would normally be called by the challenge system
        gameManager.challengeSystem.updateChallengeUI();
    },
    
    /**
     * Show continue button after challenge
     */
    showContinueButton() {
        const challengeButton = document.getElementById('challenge-button');
        if (challengeButton) {
            challengeButton.textContent = "Continue";
            challengeButton.disabled = false;
        }
    }
};