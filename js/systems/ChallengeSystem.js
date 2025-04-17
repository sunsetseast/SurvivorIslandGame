// Challenge System
class ChallengeSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.challenges = challengeDatabase;
        this.currentChallenge = null;
        
        // Challenge gameplay state
        this.playerProgress = 0;
        this.aiProgress = {};
        this.targetProgress = 100;
        this.tapIncrement = 5;
        this.aiIncrementBase = 3;
        this.challengeActive = false;
        this.competingTribes = [];
        this.competingIndividuals = [];
        this.individualWinner = null;
        this.tribeWinner = null;
        this.immunePlayers = [];
    }
    
    /**
     * Initialize the challenge system
     */
    initialize() {
        this.currentChallenge = null;
        this.playerProgress = 0;
        this.aiProgress = {};
        this.challengeActive = false;
        this.competingTribes = [];
        this.competingIndividuals = [];
        this.individualWinner = null;
        this.tribeWinner = null;
        this.immunePlayers = [];
    }
    
    /**
     * Start a new challenge
     */
    startChallenge() {
        // Determine challenge type based on game phase
        const challengeType = this.gameManager.getGamePhase() === "preMerge" ? "tribe" : "individual";
        
        // Filter challenges by type
        const eligibleChallenges = this.challenges.filter(c => c.type === challengeType);
        
        // Select a random challenge
        this.currentChallenge = eligibleChallenges[getRandomInt(0, eligibleChallenges.length - 1)];
        
        // Reset progress values
        this.playerProgress = 0;
        this.aiProgress = {};
        this.challengeActive = true;
        
        // Determine competitors
        if (challengeType === "tribe") {
            this.competingTribes = this.gameManager.getTribes();
            this.competingIndividuals = [];
            
            // Initialize tribe progress
            this.competingTribes.forEach(tribe => {
                this.aiProgress[tribe.tribeName] = 0;
            });
        } else {
            this.competingTribes = [];
            this.competingIndividuals = [];
            
            // Add all remaining survivors
            this.gameManager.getTribes().forEach(tribe => {
                tribe.members.forEach(member => {
                    this.competingIndividuals.push(member);
                    if (!member.isPlayer) {
                        this.aiProgress[member.name] = 0;
                    }
                });
            });
        }
        
        // Set up UI
        this.updateChallengeUI();
        
        // Start AI progress updates
        this.aiUpdateInterval = setInterval(() => this.updateAIProgress(), 500);
    }
    
    /**
     * Update the challenge UI
     */
    updateChallengeUI() {
        const challengeTitle = document.getElementById('challenge-title');
        const challengeDescription = document.getElementById('challenge-description');
        const challengeProgress = document.getElementById('challenge-progress-bar');
        const challengeButton = document.getElementById('challenge-button');
        
        if (challengeTitle && this.currentChallenge) {
            challengeTitle.textContent = this.currentChallenge.title;
        }
        
        if (challengeDescription && this.currentChallenge) {
            challengeDescription.textContent = this.currentChallenge.description;
        }
        
        if (challengeProgress) {
            challengeProgress.style.width = formatProgressWidth(this.playerProgress, this.targetProgress);
        }
        
        if (challengeButton) {
            if (!this.challengeActive) {
                challengeButton.textContent = "Start Challenge";
                challengeButton.disabled = false;
            } else {
                challengeButton.textContent = "Tap!";
                challengeButton.disabled = false;
            }
        }
        
        // Update competitors display
        this.updateCompetitorsDisplay();
    }
    
    /**
     * Update competitors display in the UI
     */
    updateCompetitorsDisplay() {
        const competitorsContainer = document.getElementById('competitors-container');
        if (!competitorsContainer) return;
        
        // Clear container
        clearChildren(competitorsContainer);
        
        if (this.currentChallenge.type === "tribe") {
            // Tribe challenge display
            this.competingTribes.forEach(tribe => {
                const tribeBox = createElement('div', { className: 'competitor-box' });
                
                const tribeName = createElement('div', { 
                    className: 'competitor-name',
                    textContent: tribe.tribeName
                });
                tribeName.style.color = tribe.tribeColor;
                
                const progressBar = createElement('div', { className: 'progress-bar' });
                const progressFill = createElement('div', { className: 'progress-fill' });
                progressFill.style.width = formatProgressWidth(this.aiProgress[tribe.tribeName] || 0, this.targetProgress);
                progressBar.appendChild(progressFill);
                
                tribeBox.appendChild(tribeName);
                tribeBox.appendChild(progressBar);
                
                competitorsContainer.appendChild(tribeBox);
            });
        } else {
            // Individual challenge display
            this.competingIndividuals.forEach(individual => {
                const individualBox = createElement('div', { className: 'competitor-box' });
                
                const individualName = createElement('div', { 
                    className: 'competitor-name',
                    textContent: individual.name
                });
                
                if (individual.isPlayer) {
                    individualName.style.color = '#3182ce'; // Blue for player
                }
                
                const progressBar = createElement('div', { className: 'progress-bar' });
                const progressFill = createElement('div', { className: 'progress-fill' });
                progressFill.style.width = formatProgressWidth(
                    individual.isPlayer ? this.playerProgress : (this.aiProgress[individual.name] || 0),
                    this.targetProgress
                );
                progressBar.appendChild(progressFill);
                
                individualBox.appendChild(individualName);
                individualBox.appendChild(progressBar);
                
                competitorsContainer.appendChild(individualBox);
            });
        }
    }
    
    /**
     * Handle challenge button press
     */
    onChallengeButtonPressed() {
        if (!this.challengeActive) {
            this.startChallenge();
            return;
        }
        
        // Increment player progress
        this.playerProgress += this.tapIncrement;
        
        // Update progress bar
        const challengeProgress = document.getElementById('challenge-progress-bar');
        if (challengeProgress) {
            challengeProgress.style.width = formatProgressWidth(this.playerProgress, this.targetProgress);
        }
        
        // Update player progress in competitors display
        this.updateCompetitorsDisplay();
        
        // Check if challenge is complete
        if (this.playerProgress >= this.targetProgress) {
            this.completeChallenge(true);
        }
    }
    
    /**
     * Update AI competitors during challenge
     */
    updateAIProgress() {
        if (!this.challengeActive) return;
        
        // Calculate AI progress increment based on challenge type
        if (this.currentChallenge.type === "tribe") {
            this.updateTribeChallenge();
        } else {
            this.updateIndividualChallenge();
        }
        
        // Update the UI
        this.updateCompetitorsDisplay();
    }
    
    /**
     * Update tribe challenge progress
     */
    updateTribeChallenge() {
        // Find player's tribe
        const playerTribe = this.gameManager.getPlayerTribe();
        
        // Update progress for other tribes
        this.competingTribes.forEach(tribe => {
            if (tribe === playerTribe) return;
            
            // Calculate progress based on tribe stats
            let statMultiplier = 1.0;
            switch (this.currentChallenge.primaryStat) {
                case "physical":
                    statMultiplier = this.getTribeAverageStat(tribe, "physical") / 100;
                    break;
                case "mental":
                    statMultiplier = this.getTribeAverageStat(tribe, "mental") / 100;
                    break;
                case "personality":
                    statMultiplier = this.getTribeAverageStat(tribe, "personality") / 100;
                    break;
            }
            
            // Apply resource factor
            const resourceFactor = this.getTribeResourceFactor(tribe);
            
            // Calculate increment
            let increment = this.aiIncrementBase * statMultiplier * resourceFactor * this.currentChallenge.difficulty;
            
            // Add some randomness
            increment *= 0.8 + Math.random() * 0.4; // 0.8 to 1.2
            
            // Update tribe progress
            if (!this.aiProgress[tribe.tribeName]) {
                this.aiProgress[tribe.tribeName] = 0;
            }
            this.aiProgress[tribe.tribeName] += increment;
            
            // Check if any tribe completed the challenge
            if (this.aiProgress[tribe.tribeName] >= this.targetProgress) {
                this.tribeWinner = tribe;
                this.completeChallenge(false);
            }
        });
    }
    
    /**
     * Update individual challenge progress
     */
    updateIndividualChallenge() {
        const playerSurvivor = this.gameManager.getPlayerSurvivor();
        
        // Update progress for other survivors
        this.competingIndividuals.forEach(survivor => {
            if (survivor.isPlayer) return;
            
            // Calculate progress based on survivor stats
            let statMultiplier = 1.0;
            switch (this.currentChallenge.primaryStat) {
                case "physical":
                    statMultiplier = survivor.physicalStat / 100;
                    break;
                case "mental":
                    statMultiplier = survivor.mentalStat / 100;
                    break;
                case "personality":
                    statMultiplier = survivor.personalityStat / 100;
                    break;
            }
            
            // Calculate increment
            let increment = this.aiIncrementBase * statMultiplier * this.currentChallenge.difficulty;
            
            // Add some randomness
            increment *= 0.8 + Math.random() * 0.4; // 0.8 to 1.2
            
            // Update survivor progress
            if (!this.aiProgress[survivor.name]) {
                this.aiProgress[survivor.name] = 0;
            }
            this.aiProgress[survivor.name] += increment;
            
            // Check if any survivor completed the challenge
            if (this.aiProgress[survivor.name] >= this.targetProgress) {
                this.individualWinner = survivor;
                this.completeChallenge(false);
            }
        });
    }
    
    /**
     * Complete the challenge and determine winner
     * @param {boolean} playerWon - Whether the player won
     */
    completeChallenge(playerWon) {
        this.challengeActive = false;
        clearInterval(this.aiUpdateInterval);
        
        // Disable challenge button
        const challengeButton = document.getElementById('challenge-button');
        if (challengeButton) {
            challengeButton.disabled = true;
        }
        
        if (this.currentChallenge.type === "tribe") {
            this.completeTribeChallenge(playerWon);
        } else {
            this.completeIndividualChallenge(playerWon);
        }
        
        // Show continue button
        setTimeout(() => this.showContinueButton(), 2000);
    }
    
    /**
     * Complete tribe challenge
     * @param {boolean} playerWon - Whether the player's tribe won
     */
    completeTribeChallenge(playerWon) {
        const playerTribe = this.gameManager.getPlayerTribe();
        
        if (playerWon) {
            this.tribeWinner = playerTribe;
        }
        
        // Apply immunity to winning tribe
        this.immunePlayers = [];
        this.tribeWinner.members.forEach(member => {
            member.hasImmunity = true;
            this.immunePlayers.push(member);
        });
        
        // Apply resource depletion penalty to losing tribe(s)
        this.gameManager.getTribes().forEach(tribe => {
            if (tribe !== this.tribeWinner) {
                // Tribe lost challenge - deplete resources
                this.depleteTribalResources(tribe);
            }
        });
        
        // Show result
        const challengeDescription = document.getElementById('challenge-description');
        if (challengeDescription) {
            let resultText = `${this.tribeWinner.tribeName} Tribe wins immunity!`;
            
            if (this.tribeWinner === playerTribe) {
                resultText += "\nYour tribe is safe from Tribal Council tonight.";
            } else {
                resultText += "\nYour tribe must attend Tribal Council tonight.";
                resultText += "\nLosing the challenge has depleted some of your tribe's resources.";
            }
            
            challengeDescription.textContent = resultText;
        }
    }
    
    /**
     * Deplete resources for a tribe that lost a challenge
     * @param {Object} tribe - The tribe that lost the challenge
     */
    depleteTribalResources(tribe) {
        // Lose 10-20% of resources randomly
        const resourceLoss = 10 + Math.floor(Math.random() * 11);
        
        // Apply depletion to each resource
        tribe.fire = Math.max(0, tribe.fire - Math.floor(tribe.fire * resourceLoss / 100));
        tribe.water = Math.max(0, tribe.water - Math.floor(tribe.water * resourceLoss / 100));
        tribe.food = Math.max(0, tribe.food - Math.floor(tribe.food * resourceLoss / 100));
    }
    
    /**
     * Complete individual challenge
     * @param {boolean} playerWon - Whether the player won
     */
    completeIndividualChallenge(playerWon) {
        const playerSurvivor = this.gameManager.getPlayerSurvivor();
        
        if (playerWon) {
            this.individualWinner = playerSurvivor;
        }
        
        // Apply immunity to winner
        this.immunePlayers = [this.individualWinner];
        this.individualWinner.hasImmunity = true;
        
        // Show result
        const challengeDescription = document.getElementById('challenge-description');
        if (challengeDescription) {
            let resultText = `${this.individualWinner.name} wins individual immunity!`;
            
            if (this.individualWinner === playerSurvivor) {
                resultText += "\nYou are safe from Tribal Council tonight.";
            }
            
            challengeDescription.textContent = resultText;
        }
    }
    
    /**
     * Show continue button after challenge completion
     */
    showContinueButton() {
        const challengeButton = document.getElementById('challenge-button');
        if (challengeButton) {
            challengeButton.textContent = "Continue";
            challengeButton.disabled = false;
            
            // Create a new event listener for the continue button
            challengeButton.onclick = () => {
                // Determine which state to go to next
                let nextState;
                
                // In pre-merge phase with tribe challenges:
                if (this.currentChallenge.type === "tribe" && 
                    this.gameManager.getGamePhase() === "preMerge") {
                    
                    if (this.tribeWinner === this.gameManager.getPlayerTribe()) {
                        // Player's tribe won immunity - skip tribal council
                        nextState = "camp";
                    } else {
                        // Player's tribe lost immunity - go to tribal council
                        nextState = "tribalCouncil";
                    }
                } 
                // In post-merge phase with individual challenges:
                else if (this.currentChallenge.type === "individual") {
                    // Everyone goes to tribal, but some players have immunity
                    nextState = "tribalCouncil";
                } 
                // Default fallback
                else {
                    nextState = "tribalCouncil";
                }
                
                // Proceed to next state
                this.gameManager.advanceDay();
                this.gameManager.setGameState(nextState);
            };
        }
    }
    
    /**
     * Get average stat for a tribe
     * @param {Object} tribe - The tribe
     * @param {string} statType - The stat type ("physical", "mental", "personality")
     * @returns {number} The average stat value
     */
    getTribeAverageStat(tribe, statType) {
        if (!tribe || !tribe.members || tribe.members.length === 0) return 50;
        
        let total = 0;
        tribe.members.forEach(member => {
            if (statType === "physical") total += member.physicalStat;
            else if (statType === "mental") total += member.mentalStat;
            else if (statType === "personality") total += member.personalityStat;
        });
        
        return total / tribe.members.length;
    }
    
    /**
     * Get resource factor for a tribe
     * @param {Object} tribe - The tribe
     * @returns {number} Resource factor (0.8 to 1.2)
     */
    getTribeResourceFactor(tribe) {
        if (!tribe) return 1.0;
        
        // Calculate based on fire, water, food
        const resources = (tribe.fire + tribe.water + tribe.food) / 3;
        
        // Map resources to factor (50 = 1.0, 0 = 0.8, 100 = 1.2)
        return 0.8 + (resources / 250);
    }
    
    /**
     * Get list of players with immunity
     * @returns {Array} Array of immune players
     */
    getImmunePlayers() {
        return this.immunePlayers;
    }
}