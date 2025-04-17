// Challenge Screen
const ChallengeScreen = {
    /**
     * Set up challenge screen
     */
    setup() {
        // Reset challenge UI
        this.resetUI();
        
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
        // If challenge is not active, start it
        if (!gameManager.challengeSystem.challengeActive) {
            gameManager.challengeSystem.startChallenge();
            
            // Update button text
            const challengeButton = document.getElementById('challenge-button');
            if (challengeButton) {
                challengeButton.textContent = "Tap!";
            }
            
            return;
        }
        
        // If challenge is active, register a tap
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
            
            // Clear old listeners
            const clone = challengeButton.cloneNode(true);
            challengeButton.parentNode.replaceChild(clone, challengeButton);
            
            // Add new listener
            clone.addEventListener('click', () => {
                // Determine next state based on challenge outcome
                if (gameManager.challengeSystem.currentChallenge.type === "tribe" && 
                    gameManager.challengeSystem.tribeWinner === gameManager.getPlayerTribe() &&
                    gameManager.getGamePhase() === "preMerge") {
                    // Skip tribal council, go to next day
                    gameManager.advanceDay();
                    gameManager.setGameState("camp");
                } else {
                    // Proceed to tribal council
                    gameManager.setGameState("tribalCouncil");
                }
            });
        }
    }
};