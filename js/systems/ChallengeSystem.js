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
        console.log("Challenge button pressed. Challenge completed:", this.challengeCompleted);
        
        if (this.challengeCompleted) {
            // Disable button to prevent multiple clicks
            const challengeButton = document.getElementById('challenge-button');
            if (challengeButton) {
                challengeButton.disabled = true;
                challengeButton.textContent = "Please wait...";
            }
            
            // After any challenge, always go back to camp first
            let nextState = "camp";
            console.log("Challenge completed. Going back to camp.");
            
            // Debug tribal immunity status
            const playerTribe = this.gameManager.getPlayerTribe();
            const allTribes = this.gameManager.getTribes();
            
            console.log("Tribe immunity status after challenge:");
            allTribes.forEach(tribe => {
                console.log(`- ${tribe.tribeName} tribe: isImmune=${tribe.isImmune}, immune members=${tribe.members.filter(m => m.hasImmunity).length}`);
            });
            
            // Set game sequence to afterChallenge so camp screen knows what to do next
            this.gameManager.gameSequence = "afterChallenge";
            
            // Use setTimeout to ensure UI has time to update before state change
            setTimeout(() => {
                // Proceed to next state
                console.log("Advancing day and changing state to:", nextState);
                this.gameManager.advanceDay();
                this.gameManager.setGameState(nextState);
            }, 500);
            
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
        
        // For tribe challenges, we need to determine winners differently based on number of tribes
        let winningTribes = [];
        
        if (allTribes.length === 3) {
            // In 3-tribe mode, 2 tribes win immunity (top 2 scores) and 1 tribe loses (lowest score)
            // Sort tribes by score (descending)
            const sortedTribes = allTribes.sort((a, b) => tribeScores.get(b) - tribeScores.get(a));
            
            // Top 2 tribes win immunity
            winningTribes = [sortedTribes[0], sortedTribes[1]];
            
            // Bottom tribe loses
            this.losingTribeName = sortedTribes[2].tribeName;
        } else {
            // In 2-tribe mode, only 1 tribe wins immunity and the other goes to tribal council
            const maxScore = Math.max(...Array.from(tribeScores.values()));
            const winningTribe = allTribes.find(tribe => tribeScores.get(tribe) === maxScore);
            
            winningTribes = [winningTribe];
            
            // Find losing tribe for tribal council
            const losingTribes = allTribes.filter(tribe => tribe !== winningTribe);
            if (losingTribes.length > 0) {
                this.losingTribeName = losingTribes[0].tribeName;
            }
        }
        
        // Update UI to show challenge in progress
        const challengeDescription = document.getElementById('challenge-description');
        if (challengeDescription) {
            challengeDescription.textContent = "Tribes are competing...";
        }
        
        // For visualization, we still use the max score as reference
        const maxScore = Math.max(...Array.from(tribeScores.values()));
        
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
                // Set the winning tribe(s)
                this.tribeWinner = winningTribes[0]; // For backward compatibility
                
                // First, clear any existing immunity
                allTribes.forEach(tribe => {
                    // Clear tribe immunity flag
                    tribe.isImmune = false;
                    
                    // Clear individual member immunity
                    tribe.members.forEach(member => {
                        member.hasImmunity = false;
                    });
                });
                
                // Then grant immunity to all winning tribes
                winningTribes.forEach(tribe => {
                    // Set tribe immunity flag
                    tribe.isImmune = true;
                    
                    // Also set individual member immunity for compatibility
                    tribe.members.forEach(member => {
                        member.hasImmunity = true;
                    });
                });
                
                // Debug logging
                console.log("Winning tribes:", winningTribes.map(t => t.tribeName).join(", "));
                console.log("Tribes with immunity:", allTribes.filter(t => t.isImmune).map(t => t.tribeName).join(", "));
                console.log("Members with immunity:", allTribes.flatMap(t => t.members).filter(m => m.hasImmunity).map(m => m.name).join(", "));
                
                // Challenge complete - determine if player won
                const playerWon = winningTribes.includes(playerTribe);
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
        const allTribes = this.gameManager.getTribes();
        
        // Find all the winning tribes (tribes whose members have immunity)
        const winningTribes = allTribes.filter(tribe => 
            tribe.members.length > 0 && tribe.members[0].hasImmunity
        );
        
        // Set tribeWinner for backward compatibility 
        if (playerWon) {
            this.tribeWinner = playerTribe;
        } else if (winningTribes.length > 0) {
            this.tribeWinner = winningTribes[0];
        }
        
        // Clear and rebuild immunePlayers list
        this.immunePlayers = [];
        allTribes.forEach(tribe => {
            tribe.members.forEach(member => {
                if (member.hasImmunity) {
                    this.immunePlayers.push(member);
                }
            });
        });
        
        // Apply resource depletion penalty to losing tribe(s)
        allTribes.forEach(tribe => {
            if (!winningTribes.includes(tribe)) {
                // Tribe lost challenge - deplete resources
                this.depleteTribalResources(tribe);
            }
        });
        
        // Show result
        const challengeDescription = document.getElementById('challenge-description');
        if (challengeDescription) {
            let resultText = "";
            
            if (winningTribes.length === 1) {
                // Single winning tribe
                resultText = `${winningTribes[0].tribeName} Tribe wins immunity!`;
            } else {
                // Multiple winning tribes (3-tribe mode)
                const tribeNames = winningTribes.map(tribe => tribe.tribeName).join(" and ");
                resultText = `${tribeNames} Tribes win immunity!`;
            }
            
            if (playerWon) {
                resultText += "\nYour tribe is safe from Tribal Council tonight.";
                if (allTribes.length > 2) {
                    // If there are more than 2 tribes, mention that one tribe goes to council
                    resultText += "\nThe " + this.losingTribeName + " tribe must vote someone out.";
                } else {
                    resultText += "\nThe other tribe must vote someone out.";
                }
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
        console.log("Showing continue button");
        const challengeButton = document.getElementById('challenge-button');
        if (challengeButton) {
            // Remove any existing event listeners by cloning the button
            const oldButton = challengeButton;
            const newButton = oldButton.cloneNode(true);
            oldButton.parentNode.replaceChild(newButton, oldButton);
            
            // Update the button
            newButton.textContent = "Continue";
            newButton.disabled = false;
            
            // Add new event listener
            newButton.addEventListener('click', () => {
                console.log("Continue button clicked");
                this.onChallengeButtonPressed();
            });
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