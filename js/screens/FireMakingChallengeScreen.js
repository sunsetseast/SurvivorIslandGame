// Fire Making Challenge Screen
class FireMakingChallengeScreen {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.selectedOpponent = null;
        this.winnerSelected = false;
        this.immunityWinner = null;
    }
    
    /**
     * Set up fire making challenge screen
     */
    setup() {
        const screenElement = document.getElementById('fire-making-challenge-screen');
        const tribe = this.gameManager.tribes[0]; // At final 4, we're merged to one tribe
        
        // Clear previous content
        screenElement.innerHTML = '';
        
        // Create header section
        const headerSection = document.createElement('div');
        headerSection.className = 'screen-header';
        headerSection.innerHTML = `
            <h2>Final 4 Fire Making Challenge</h2>
            <p>Day ${this.gameManager.day}: Fire Making Challenge</p>
        `;
        screenElement.appendChild(headerSection);
        
        // Find immunity winner
        this.immunityWinner = tribe.members.find(member => member.hasImmunity);
        
        if (!this.immunityWinner) {
            console.error("No immunity winner found for fire making challenge");
            return;
        }
        
        // Create explanation section
        const explanationSection = document.createElement('div');
        explanationSection.className = 'challenge-explanation';
        explanationSection.innerHTML = `
            <p>${this.immunityWinner.name} has won the final immunity challenge and must now make a decision.</p>
            <p>They can choose one person to take to the final 3, forcing the other two to compete in a fire making challenge.</p>
        `;
        screenElement.appendChild(explanationSection);
        
        // If player won immunity
        if (this.immunityWinner.isPlayer) {
            const selectionSection = document.createElement('div');
            selectionSection.className = 'selection-section';
            selectionSection.innerHTML = '<h3>Choose one person to take to the Final 3:</h3>';
            
            const survivorGrid = document.createElement('div');
            survivorGrid.className = 'survivor-grid';
            
            // Add all survivors except the immunity winner
            tribe.members.forEach(survivor => {
                if (survivor !== this.immunityWinner) {
                    const survivorCard = document.createElement('div');
                    survivorCard.className = 'survivor-card';
                    survivorCard.innerHTML = `
                        <div class="survivor-portrait">${survivor.name.charAt(0)}</div>
                        <div class="survivor-name">${survivor.name}</div>
                    `;
                    
                    survivorCard.addEventListener('click', () => {
                        // Remove any previous selection
                        document.querySelectorAll('.survivor-card.selected').forEach(card => {
                            card.classList.remove('selected');
                        });
                        
                        // Select this survivor
                        survivorCard.classList.add('selected');
                        this.selectedOpponent = survivor;
                        
                        // Enable the confirm button
                        confirmButton.disabled = false;
                    });
                    
                    survivorGrid.appendChild(survivorCard);
                }
            });
            
            selectionSection.appendChild(survivorGrid);
            
            // Add confirm button
            const confirmButton = document.createElement('button');
            confirmButton.textContent = 'Confirm Selection';
            confirmButton.className = 'primary-button';
            confirmButton.disabled = true; // Disabled until a survivor is selected
            
            confirmButton.addEventListener('click', () => {
                if (this.selectedOpponent) {
                    this.confirmSelection();
                }
            });
            
            selectionSection.appendChild(confirmButton);
            screenElement.appendChild(selectionSection);
        } else {
            // AI makes the choice
            this.simulateAIDecision();
        }
    }
    
    /**
     * Confirm player's selection
     */
    confirmSelection() {
        if (!this.selectedOpponent) return;
        
        const screenElement = document.getElementById('fire-making-challenge-screen');
        const tribe = this.gameManager.tribes[0];
        
        // Clear screen
        screenElement.innerHTML = '';
        
        // Create result header
        const headerSection = document.createElement('div');
        headerSection.className = 'screen-header';
        headerSection.innerHTML = `
            <h2>Your Decision</h2>
            <p>You have chosen to take ${this.selectedOpponent.name} to the Final 3.</p>
        `;
        screenElement.appendChild(headerSection);
        
        // Find the two survivors who will compete in fire making
        const fireCompetitors = tribe.members.filter(survivor => 
            survivor !== this.immunityWinner && survivor !== this.selectedOpponent
        );
        
        if (fireCompetitors.length !== 2) {
            console.error("Unexpected number of fire making competitors:", fireCompetitors.length);
            return;
        }
        
        // Create the fire making explanation
        const challengeSection = document.createElement('div');
        challengeSection.className = 'challenge-section';
        challengeSection.innerHTML = `
            <p>${fireCompetitors[0].name} and ${fireCompetitors[1].name} will now compete in a fire making challenge.</p>
            <p>The winner will join you and ${this.selectedOpponent.name} in the Final 3.</p>
            <p>The loser will become the final member of the jury.</p>
        `;
        screenElement.appendChild(challengeSection);
        
        // Add the fire making animation/minigame section
        const gameSection = document.createElement('div');
        gameSection.className = 'fire-game-section';
        gameSection.innerHTML = `
            <div class="fire-competitor">
                <div class="competitor-name">${fireCompetitors[0].name}</div>
                <div class="fire-progress">
                    <div class="fire-progress-bar" id="competitor1-progress"></div>
                </div>
            </div>
            <div class="fire-competitor">
                <div class="competitor-name">${fireCompetitors[1].name}</div>
                <div class="fire-progress">
                    <div class="fire-progress-bar" id="competitor2-progress"></div>
                </div>
            </div>
        `;
        screenElement.appendChild(gameSection);
        
        // Add animation for fire making
        this.simulateFireMakingChallenge(fireCompetitors);
    }
    
    /**
     * Simulate AI making a choice
     */
    simulateAIDecision() {
        const screenElement = document.getElementById('fire-making-challenge-screen');
        const tribe = this.gameManager.tribes[0];
        
        // AI chooses the survivor they have the best relationship with
        const relationships = this.gameManager.relationshipSystem.getRelationships();
        
        // Filter out the immunity winner
        const choices = tribe.members.filter(survivor => survivor !== this.immunityWinner);
        
        // Sort by relationship with immunity winner
        choices.sort((a, b) => {
            const relationshipA = relationships[this.immunityWinner.name]?.[a.name] || 0;
            const relationshipB = relationships[this.immunityWinner.name]?.[b.name] || 0;
            return relationshipB - relationshipA;
        });
        
        // AI selects the player with highest relationship
        this.selectedOpponent = choices[0];
        
        // Create decision display
        const decisionSection = document.createElement('div');
        decisionSection.className = 'ai-decision-section';
        decisionSection.innerHTML = `
            <p>${this.immunityWinner.name} has chosen to take ${this.selectedOpponent.name} to the Final 3.</p>
        `;
        screenElement.appendChild(decisionSection);
        
        // Find the two survivors who will compete in fire making
        const fireCompetitors = tribe.members.filter(survivor => 
            survivor !== this.immunityWinner && survivor !== this.selectedOpponent
        );
        
        // Create the fire making explanation
        const challengeSection = document.createElement('div');
        challengeSection.className = 'challenge-section';
        challengeSection.innerHTML = `
            <p>${fireCompetitors[0].name} and ${fireCompetitors[1].name} will now compete in a fire making challenge.</p>
            <p>The winner will join ${this.immunityWinner.name} and ${this.selectedOpponent.name} in the Final 3.</p>
            <p>The loser will become the final member of the jury.</p>
        `;
        screenElement.appendChild(challengeSection);
        
        // Add the fire making animation/minigame section
        const gameSection = document.createElement('div');
        gameSection.className = 'fire-game-section';
        gameSection.innerHTML = `
            <div class="fire-competitor">
                <div class="competitor-name">${fireCompetitors[0].name}</div>
                <div class="fire-progress">
                    <div class="fire-progress-bar" id="competitor1-progress"></div>
                </div>
            </div>
            <div class="fire-competitor">
                <div class="competitor-name">${fireCompetitors[1].name}</div>
                <div class="fire-progress">
                    <div class="fire-progress-bar" id="competitor2-progress"></div>
                </div>
            </div>
        `;
        screenElement.appendChild(gameSection);
        
        // Simulate the fire making challenge
        this.simulateFireMakingChallenge(fireCompetitors);
    }
    
    /**
     * Simulate the fire making challenge between two competitors
     * @param {Array} competitors - The two survivors competing
     */
    simulateFireMakingChallenge(competitors) {
        if (competitors.length !== 2) return;
        
        const progress1 = document.getElementById('competitor1-progress');
        const progress2 = document.getElementById('competitor2-progress');
        
        if (!progress1 || !progress2) {
            console.error("Progress bars not found");
            return;
        }
        
        // Calculate fire making skill based on physical and mental stats
        const skill1 = (competitors[0].physicalStat * 0.6) + (competitors[0].mentalStat * 0.4);
        const skill2 = (competitors[1].physicalStat * 0.6) + (competitors[1].mentalStat * 0.4);
        
        // Normalize skills for animation (add randomness)
        const baseSpeed1 = skill1 / 100;
        const baseSpeed2 = skill2 / 100;
        
        let progress1Value = 0;
        let progress2Value = 0;
        
        // Animate the fire making progress
        const interval = setInterval(() => {
            // Add random progress with weighting based on skill
            progress1Value += (baseSpeed1 * 0.7) + (Math.random() * 0.3);
            progress2Value += (baseSpeed2 * 0.7) + (Math.random() * 0.3);
            
            // Update progress bars
            progress1.style.width = `${Math.min(progress1Value, 100)}%`;
            progress2.style.width = `${Math.min(progress2Value, 100)}%`;
            
            // Check for a winner
            if (progress1Value >= 100 || progress2Value >= 100) {
                clearInterval(interval);
                
                // Determine the winner
                const winner = progress1Value > progress2Value ? competitors[0] : competitors[1];
                const loser = progress1Value > progress2Value ? competitors[1] : competitors[0];
                
                this.announceChallengeWinner(winner, loser);
            }
        }, 100);
    }
    
    /**
     * Announce the challenge winner and proceed
     * @param {Object} winner - The survivor who won the challenge
     * @param {Object} loser - The survivor who lost the challenge
     */
    announceChallengeWinner(winner, loser) {
        const screenElement = document.getElementById('fire-making-challenge-screen');
        
        // Create result announcement
        const resultSection = document.createElement('div');
        resultSection.className = 'result-section';
        resultSection.innerHTML = `
            <h3>${winner.name} has won the fire making challenge!</h3>
            <p>${winner.name} will advance to the Final 3.</p>
            <p>${loser.name} has been eliminated and will join the jury.</p>
        `;
        screenElement.appendChild(resultSection);
        
        // Add continue button
        const continueButton = document.createElement('button');
        continueButton.textContent = 'Continue to Final 3';
        continueButton.className = 'primary-button';
        continueButton.addEventListener('click', () => {
            // Eliminate the loser
            this.gameManager.eliminateSurvivor(loser);
            
            // Set the game phase to final
            this.gameManager.gamePhase = "final";
            
            // Proceed to final tribal council
            this.gameManager.setGameState("finalTribalCouncil");
        });
        
        resultSection.appendChild(continueButton);
    }
}

// Register the screen globally
window.FireMakingChallengeScreen = FireMakingChallengeScreen;