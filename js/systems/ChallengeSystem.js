// Challenge System
class ChallengeSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.challenges = challengeDatabase;
        this.currentChallenge = null;
        
        // Challenge state variables
        this.challengeCompleted = false;
        this.tribeProgress = new Map();
        this.survivorProgress = new Map();
        this.tribeWinner = null;
        this.individualWinner = null;
        this.immunePlayers = [];
        this.losingTribeName = null; // Track the tribe going to tribal
    }
    
    /**
     * Initialize the challenge system
     */
    initialize() {
        this.currentChallenge = null;
        this.challengeCompleted = false;
        this.tribeProgress = new Map();
        this.survivorProgress = new Map();
        this.tribeWinner = null;
        this.individualWinner = null;
        this.immunePlayers = [];
        this.losingTribeName = null;
    }
    
    /**
     * Start a new challenge
     */
    startChallenge() {
        // Reset state
        this.challengeCompleted = false;
        this.tribeProgress = new Map();
        this.survivorProgress = new Map();
        
        // Determine challenge type based on game phase
        const gamePhase = this.gameManager.getGamePhase();
        const challengeType = gamePhase === "preMerge" ? "tribe" : "individual";
        
        // Define a list of challenge types with primary and secondary stats
        const challengeTypes = [
            { 
                title: "Obstacle Course", 
                description: "Navigate through a complex obstacle course as quickly as possible.",
                type: challengeType,
                primaryStat: "physical",
                secondaryStat: "mental"
            },
            { 
                title: "Endurance Challenge", 
                description: "Hold a difficult position for as long as possible.",
                type: challengeType,
                primaryStat: "physical",
                secondaryStat: "personality"
            },
            { 
                title: "Puzzle Challenge", 
                description: "Solve complex puzzles under pressure.",
                type: challengeType,
                primaryStat: "mental",
                secondaryStat: "personality"
            },
            { 
                title: "Balance Challenge", 
                description: "Maintain balance on an unstable platform.",
                type: challengeType,
                primaryStat: "physical",
                secondaryStat: "mental"
            },
            { 
                title: "Memory Challenge", 
                description: "Memorize and recall a sequence of symbols.",
                type: challengeType,
                primaryStat: "mental",
                secondaryStat: "physical"
            }
        ];
        
        // Select a random challenge
        this.currentChallenge = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
        
        // Set up UI
        this.updateChallengeUI();
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
        
        // Update the button state
        if (challengeButton) {
            if (this.challengeCompleted) {
                challengeButton.textContent = "Continue";
                challengeButton.disabled = false;
            } else {
                challengeButton.textContent = "Start Challenge";
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
            const tribes = this.gameManager.getTribes();
            const playerTribe = this.gameManager.getPlayerTribe();
            
            tribes.forEach(tribe => {
                const tribeBox = createElement('div', { className: 'competitor-box' });
                
                const tribeName = createElement('div', { 
                    className: 'competitor-name',
                    textContent: tribe.tribeName
                });
                
                tribeName.style.color = tribe.tribeColor;
                
                if (tribe === playerTribe) {
                    tribeName.innerHTML += " <span style='color: #3182ce'>(Your Tribe)</span>";
                }
                
                const progressBar = createElement('div', { className: 'progress-bar' });
                const progressFill = createElement('div', { className: 'progress-fill' });
                
                // Display progress if challenge is running
                const progress = this.tribeProgress.get(tribe) || 0;
                progressFill.style.width = formatProgressWidth(progress, 100);
                progressBar.appendChild(progressFill);
                
                // Show tribe stats for clarity
                const physicalAvg = this.getTribeAverageStat(tribe, "physical");
                const mentalAvg = this.getTribeAverageStat(tribe, "mental");
                const healthLevel = tribe.health || 100;
                
                const statsText = createElement('div', {
                    className: 'stats-text',
                    textContent: `Average Stats: Physical ${Math.round(physicalAvg)}, Mental ${Math.round(mentalAvg)}, Health ${healthLevel}`
                });
                
                tribeBox.appendChild(tribeName);
                tribeBox.appendChild(progressBar);
                tribeBox.appendChild(statsText);
                
                competitorsContainer.appendChild(tribeBox);
            });
        } else {
            // Individual challenge display
            const survivors = [];
            const currentTribe = this.gameManager.getPlayerTribe();
            const player = this.gameManager.getPlayerSurvivor();
            
            currentTribe.members.forEach(member => {
                survivors.push(member);
            });
            
            survivors.forEach(survivor => {
                const survivorBox = createElement('div', { className: 'competitor-box' });
                
                const survivorName = createElement('div', { 
                    className: 'competitor-name',
                    textContent: survivor.name
                });
                
                if (survivor.isPlayer) {
                    survivorName.innerHTML += " <span style='color: #3182ce'>(You)</span>";
                }
                
                const progressBar = createElement('div', { className: 'progress-bar' });
                const progressFill = createElement('div', { className: 'progress-fill' });
                
                // Display progress if challenge is running
                const progress = this.survivorProgress.get(survivor) || 0;
                progressFill.style.width = formatProgressWidth(progress, 100);
                progressBar.appendChild(progressFill);
                
                // Show individual stats for clarity
                const physical = survivor.physicalStat || 50;
                const mental = survivor.mentalStat || 50;
                const health = survivor.health || 100;
                
                const statsText = createElement('div', {
                    className: 'stats-text',
                    textContent: `Stats: Physical ${physical}, Mental ${mental}` + 
                        (survivor.isPlayer ? `, Health ${health}` : '')
                });
                
                survivorBox.appendChild(survivorName);
                survivorBox.appendChild(progressBar);
                survivorBox.appendChild(statsText);
                
                competitorsContainer.appendChild(survivorBox);
            });
        }
    }
    
    /**
     * Handle challenge button press - now just starts the automated challenge
     */
    onChallengeButtonPressed() {
        if (this.challengeCompleted) {
            const challengeButton = document.getElementById('challenge-button');
            if (challengeButton) {
                challengeButton.disabled = true;
            }
            
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
            return;
        }
        
        const challengeButton = document.getElementById('challenge-button');
        if (challengeButton) {
            challengeButton.disabled = true;
        }
        
        // Show challenge is starting
        this.gameManager.dialogueSystem.showDialogue(
            "The challenge is about to begin! This challenge will test " + 
            (this.currentChallenge.primaryStat === "physical" ? "physical strength and endurance." : 
             this.currentChallenge.primaryStat === "mental" ? "mental ability and puzzle-solving." : 
             "social skills and adaptability."),
            ["Watch Challenge"],
            () => {
                this.gameManager.dialogueSystem.hideDialogue();
                
                // Run the automated challenge based on stats
                if (this.currentChallenge.type === "tribe") {
                    this.runAutomatedTribeChallenge();
                } else {
                    this.runAutomatedIndividualChallenge();
                }
            }
        );
    }
    
    /**
     * Run the automated tribe challenge based on tribe stats
     */
    runAutomatedTribeChallenge() {
        // Get all tribes
        const allTribes = this.gameManager.getTribes();
        const playerTribe = this.gameManager.getPlayerTribe();
        
        // Calculate scores for each tribe
        const tribeScores = new Map();
        
        allTribes.forEach(tribe => {
            // Get average stats for the primary and secondary challenge stats
            const primaryStatAvg = this.getTribeAverageStat(tribe, this.currentChallenge.primaryStat || "physical");
            const secondaryStatAvg = this.getTribeAverageStat(tribe, this.currentChallenge.secondaryStat || "mental");
            
            // Calculate score based on weighted stat averages
            let score = (primaryStatAvg * 0.7) + (secondaryStatAvg * 0.3);
            
            // Apply tribe health factor (0.8 to 1.2)
            const healthFactor = tribe.health / 100 * 0.4 + 0.8; // 0.8 at health=0, 1.2 at health=100
            score *= healthFactor;
            
            // Apply some randomness (±10%)
            const randomFactor = 0.9 + Math.random() * 0.2;
            score *= randomFactor;
            
            // Store the score
            tribeScores.set(tribe, score);
        });
        
        // Animate progression of all tribes
        this.animateTribeChallenge(tribeScores, playerTribe);
    }
    
    /**
     * Animate the tribe challenge progression and show results
     * @param {Map} tribeScores - Map of tribes to their scores
     * @param {Object} playerTribe - The player's tribe
     */
    animateTribeChallenge(tribeScores, playerTribe) {
        const allTribes = Array.from(tribeScores.keys());
        const maxScore = Math.max(...Array.from(tribeScores.values()));
        const winningTribe = allTribes.find(tribe => tribeScores.get(tribe) === maxScore);
        
        // Update UI to show challenge in progress
        const challengeDescription = document.getElementById('challenge-description');
        if (challengeDescription) {
            challengeDescription.textContent = "Tribes are competing...";
        }
        
        // Set progress for visualization
        allTribes.forEach(tribe => {
            const progress = (tribeScores.get(tribe) / maxScore) * 100;
            this.tribeProgress.set(tribe, progress);
        });
        
        // Simulate progress update animation
        let step = 0;
        const totalSteps = 10;
        
        const updateAnimation = () => {
            step++;
            this.updateCompetitorsDisplay();
            
            if (step < totalSteps) {
                setTimeout(updateAnimation, 500);
            } else {
                // Find losing tribe for tribal council
                const losingTribes = allTribes.filter(tribe => tribe !== winningTribe);
                if (losingTribes.length > 0) {
                    this.losingTribeName = losingTribes[0].tribeName;
                }
                
                // Challenge complete - determine winner
                this.tribeWinner = winningTribe;
                const playerWon = (winningTribe === playerTribe);
                this.completeChallenge(playerWon);
            }
        };
        
        updateAnimation();
    }
    
    /**
     * Run the automated individual challenge based on survivor stats
     */
    runAutomatedIndividualChallenge() {
        // Get current tribe members
        const currentTribe = this.gameManager.getPlayerTribe();
        const allSurvivors = currentTribe.members;
        const player = this.gameManager.getPlayerSurvivor();
        
        // Calculate scores for each survivor
        const survivorScores = new Map();
        
        allSurvivors.forEach(survivor => {
            // Get stats relevant to the challenge
            const primaryStat = survivor[this.currentChallenge.primaryStat + "Stat"] || survivor.physicalStat;
            const secondaryStat = survivor[this.currentChallenge.secondaryStat + "Stat"] || survivor.mentalStat;
            
            // Calculate score based on weighted stats
            let score = (primaryStat * 0.7) + (secondaryStat * 0.3);
            
            // Apply health factor for player
            if (survivor.isPlayer && survivor.health !== undefined) {
                const healthFactor = survivor.health / 100 * 0.4 + 0.8; // 0.8 at health=0, 1.2 at health=100
                score *= healthFactor;
            }
            
            // Apply some randomness (±15%)
            const randomFactor = 0.85 + Math.random() * 0.3;
            score *= randomFactor;
            
            // Store the score
            survivorScores.set(survivor, score);
        });
        
        // Run a tournament-style elimination
        this.runIndividualTournament(survivorScores, player);
    }
    
    /**
     * Run a tournament-style elimination for individual challenges
     * @param {Map} survivorScores - Map of survivors to their scores
     * @param {Object} player - The player survivor object
     */
    runIndividualTournament(survivorScores, player) {
        const survivors = Array.from(survivorScores.keys());
        
        // Sort survivors by score from highest to lowest
        survivors.sort((a, b) => survivorScores.get(b) - survivorScores.get(a));
        
        // The highest scorer is the winner
        this.individualWinner = survivors[0];
        const playerWon = (this.individualWinner === player);
        
        // Show tournament progression
        this.gameManager.dialogueSystem.showDialogue(
            `After several rounds of competition, ${this.individualWinner.name} has won individual immunity!`,
            ["Continue"],
            () => {
                this.gameManager.dialogueSystem.hideDialogue();
                this.completeChallenge(playerWon);
            }
        );
    }
    
    /**
     * Complete the challenge and determine winner
     * @param {boolean} playerWon - Whether the player won
     */
    completeChallenge(playerWon) {
        this.challengeCompleted = true;
        
        if (this.currentChallenge.type === "tribe") {
            this.completeTribeChallenge(playerWon);
        } else {
            this.completeIndividualChallenge(playerWon);
        }
        
        // Show continue button
        this.showContinueButton();
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
                resultText += "\nThe other tribe must vote someone out.";
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
    
    /**
     * Get the name of the losing tribe that needs to go to tribal council
     * @returns {string|null} The name of the losing tribe or null if not applicable
     */
    getLosingTribeName() {
        return this.losingTribeName;
    }
}