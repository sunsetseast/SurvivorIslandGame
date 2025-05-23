// Tribal Council System
class TribalCouncilSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.currentTribe = null;
        this.immunePlayers = [];
        this.votes = {};
        this.selectedVoteTarget = null;
        this.eliminatedSurvivor = null;
        this.finalTribalCouncil = false;
        this.idolPlayed = false;
    }
    
    /**
     * Initialize the tribal council system
     */
    initialize() {
        this.currentTribe = null;
        this.immunePlayers = [];
        this.votes = {};
        this.selectedVoteTarget = null;
        this.eliminatedSurvivor = null;
        this.finalTribalCouncil = false;
        this.idolPlayed = false;
        
        // Clear any vote results UI elements when initializing
        const voteResults = document.getElementById('vote-results-container');
        if (voteResults) {
            voteResults.innerHTML = '';
        }
        
        // Also clear any cached voting data
        if (this.gameManager) {
            this.gameManager.lastVoteCount = null;
        }
    }
    
    /**
     * Prepare for tribal council
     */
    prepareTribalCouncil() {
        this.finalTribalCouncil = false;
        this.idolPlayed = false;
        this.votes = {};
        this.selectedVoteTarget = null;
        
        // Determine which tribe is going to tribal council
        if (this.gameManager.getGamePhase() === "preMerge") {
            const playerTribe = this.gameManager.getPlayerTribe();
            
            // Check if player's tribe won immunity - use isImmune flag first, then fallback to checking members
            const playerTribeHasImmunity = playerTribe.isImmune === true ||
                                          (playerTribe.members.length > 0 && 
                                           playerTribe.members.some(member => member.hasImmunity));
            
            if (playerTribeHasImmunity) {
                // Player's tribe won immunity, the other tribe goes to tribal
                const losingTribeName = this.gameManager.challengeSystem.losingTribeName;
                
                console.log("Player tribe has immunity. Losing tribe is: " + losingTribeName);
                
                // Find the losing tribe
                const losingTribe = this.gameManager.getTribes().find(tribe => 
                    tribe.tribeName === losingTribeName
                );
                
                // If we have a valid losing tribe, use it
                if (losingTribe) {
                    this.currentTribe = losingTribe;
                    console.log("Simulating NPC tribal council for tribe: " + losingTribe.tribeName);
                    this.simulateNPCTribalCouncil(); // Automatically handle NPC tribal council
                    return;
                }
                
                // Fallback if tribe not found - find any tribe that's not the player's
                const otherTribe = this.gameManager.getTribes().find(tribe => tribe !== playerTribe);
                if (otherTribe) {
                    this.currentTribe = otherTribe;
                    console.log("Fallback: Simulating NPC tribal council for tribe: " + otherTribe.tribeName);
                    this.simulateNPCTribalCouncil();
                    return;
                }
                
                // If we somehow don't have another tribe, just skip tribal council
                console.log("Error: Could not find a tribe to send to tribal council. Skipping tribal.");
                this.gameManager.setGameState("camp");
                return;
            }
            
            // Player's tribe lost immunity, they go to tribal
            this.currentTribe = playerTribe;
            console.log("Player tribe is going to tribal council: " + playerTribe.tribeName);
            
            // Check if any tribe member has immunity
            this.immunePlayers = this.currentTribe.members.filter(member => member.hasImmunity);
        } else {
            // In post-merge, everyone goes to tribal council
            this.currentTribe = this.gameManager.getTribes()[0]; // Merged tribe
            console.log("Post-merge tribal council for merged tribe");
            
            // Get players with immunity
            this.immunePlayers = this.currentTribe.members.filter(member => member.hasImmunity);
            console.log("Immune players: " + this.immunePlayers.map(p => p.name).join(", "));
        }
    }
    
    /**
     * Simulate tribal council for NPC tribe
     * (Happens when player's tribe wins immunity)
     */
    simulateNPCTribalCouncil() {
        if (!this.currentTribe) {
            console.error("Cannot simulate tribal council - no current tribe");
            return;
        }
        
        console.log(`Starting NPC tribal council for ${this.currentTribe.tribeName}`);
        console.log(`Tribe members: ${this.currentTribe.members.map(m => m.name).join(', ')}`);
        
        // Check if any NPCs have immunity
        this.immunePlayers = this.currentTribe.members.filter(member => member.hasImmunity);
        console.log(`Immune players: ${this.immunePlayers.map(m => m.name).join(', ')}`);
        
        // Have all NPCs vote
        this.generateNPCVotes();
        console.log("NPC votes generated:", this.votes);
        
        // Count votes to determine elimination
        const voteResults = this.countVotes();
        console.log("Vote results:", voteResults);
        
        // If there's a tie, handle it automatically
        if (voteResults.isTied) {
            console.log("Tie detected between: " + voteResults.tiedPlayers.join(", "));
            // Process revote
            const revoteResults = this.handleTieVote(voteResults.tiedPlayers);
            
            // If still tied, go to rock draw
            if (revoteResults.stillTied) {
                console.log("Still tied after revote, going to rock draw");
                this.drawRocks(revoteResults.tiedPlayers);
            }
        }
        
        // Process elimination
        if (this.eliminatedSurvivor) {
            console.log(`Eliminated player from ${this.currentTribe.tribeName}: ${this.eliminatedSurvivor.name}`);
            
            // Store the eliminated player for reference
            const eliminatedPlayer = this.eliminatedSurvivor;
            
            // Show a dialogue revealing who was eliminated from the other tribe
            this.gameManager.dialogueSystem.showDialogue(
                `At tribal council, the ${this.currentTribe.tribeName} tribe has voted out ${eliminatedPlayer.name}.`,
                ["Continue"],
                () => {
                    console.log(`Continuing after showing ${eliminatedPlayer.name} was voted out`);
                    this.gameManager.dialogueSystem.hideDialogue();
                    
                    // Eliminate the survivor
                    this.gameManager.eliminateSurvivor(eliminatedPlayer);
                    console.log(`${eliminatedPlayer.name} has been eliminated from the game`);
                    
                    // Force an update to the menu
                    updateGameMenu();
                }
            );
        } else {
            console.error("No player was eliminated in the NPC tribal council!");
        }
    }
    
    /**
     * Prepare for final tribal council
     */
    prepareFinalTribalCouncil() {
        this.finalTribalCouncil = true;
        this.votes = {};
        this.selectedVoteTarget = null;
        this.currentTribe = this.gameManager.getTribes()[0]; // Merged tribe
        this.immunePlayers = this.gameManager.challengeSystem.getImmunePlayers();
    }
    
    /**
     * Select a vote target
     * @param {Object} target - The survivor to vote for
     */
    selectVoteTarget(target) {
        // Cannot vote for immune players
        if (this.immunePlayers.some(player => player.name === target.name)) {
            return;
        }
            
        this.selectedVoteTarget = target;
        
        // UI updates would be done in the screen component
    }
    
    /**
     * Cast vote
     */
    castVote() {
        if (!this.selectedVoteTarget) return;
        
        const player = this.gameManager.getPlayerSurvivor();
        
        // Record player's vote
        this.votes[player.name] = this.selectedVoteTarget;
        
        // Generate NPC votes
        this.generateNPCVotes();
        
        // Show results
        // UI updates would be done in the screen component
    }
    
    /**
     * Play immunity idol
     */
    playIdol() {
        const player = this.gameManager.getPlayerSurvivor();
        
        // Use player's idol
        if (player.hasIdol) {
            player.hasIdol = false;
            this.idolPlayed = true;
            
            // Add player to immune list if not already there
            if (!this.immunePlayers.some(p => p.name === player.name)) {
                this.immunePlayers.push(player);
            }
            
            // UI updates would be done in the screen component
            return true;
        }
        
        return false;
    }
    
    /**
     * Generate NPC votes
     */
    generateNPCVotes() {
        // Get alliance votes first
        const allianceVotes = this.gameManager.allianceSystem.getAllianceVotes(this.currentTribe, this.immunePlayers);
        
        // Add alliance votes to the vote collection
        Object.entries(allianceVotes).forEach(([voterName, target]) => {
            this.votes[voterName] = target;
        });
        
        // For any NPC without an alliance vote, generate individual votes
        this.currentTribe.members.forEach(survivor => {
            // Skip player and already voted NPCs
            if (survivor.isPlayer || this.votes[survivor.name] || 
                this.immunePlayers.some(p => p.name === survivor.name)) {
                return;
            }
                
            // Find the least liked survivor who isn't immune
            let leastLiked = null;
            let lowestRelationship = 101; // Higher than max relationship
            
            this.currentTribe.members.forEach(target => {
                // Can't vote for self or immune players
                if (target.name === survivor.name || 
                    this.immunePlayers.some(p => p.name === target.name)) {
                    return;
                }
                    
                const relationship = survivor.relationships[target.name] || 50;
                if (relationship < lowestRelationship) {
                    lowestRelationship = relationship;
                    leastLiked = target;
                }
            });
            
            // Add vote
            if (leastLiked) {
                this.votes[survivor.name] = leastLiked;
            } else {
                // Fallback - vote for random non-immune player
                const eligibleTargets = this.currentTribe.members.filter(target => 
                    target.name !== survivor.name && 
                    !this.immunePlayers.some(p => p.name === target.name)
                );
                
                if (eligibleTargets.length > 0) {
                    this.votes[survivor.name] = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
                }
            }
        });
    }
    
    /**
     * Count votes and determine eliminated player
     * @returns {Object} Vote count and tied status information
     */
    countVotes() {
        // Count votes for each survivor
        const voteCount = {};
        
        Object.values(this.votes).forEach(target => {
            // Skip votes against immune players (from idol)
            if (this.immunePlayers.some(p => p.name === target.name) && this.idolPlayed) {
                return;
            }
                
            if (!voteCount[target.name]) {
                voteCount[target.name] = 0;
            }
            
            voteCount[target.name]++;
        });
        
        // Find highest vote count
        let highestVotes = 0;
        Object.values(voteCount).forEach(count => {
            if (count > highestVotes) {
                highestVotes = count;
            }
        });
        
        // Find players with highest vote count
        const tiedPlayers = [];
        Object.entries(voteCount).forEach(([name, count]) => {
            if (count === highestVotes) {
                tiedPlayers.push(name);
            }
        });
        
        // Check if there's a tie
        if (tiedPlayers.length > 1) {
            return {
                voteCount: voteCount,
                isTied: true,
                tiedPlayers: tiedPlayers
            };
        }
        
        // No tie, determine eliminated player
        if (tiedPlayers.length === 1) {
            const eliminatedName = tiedPlayers[0];
            this.eliminatedSurvivor = this.currentTribe.members.find(
                member => member.name === eliminatedName
            );
        }
        
        return {
            voteCount: voteCount,
            isTied: false,
            tiedPlayers: []
        };
    }
    
    /**
     * Handle tie vote by conducting a revote
     * @param {Array} tiedPlayers - Names of players who tied
     * @returns {Object} Results of the revote
     */
    handleTieVote(tiedPlayers) {
        // Clear previous votes
        this.votes = {};
        
        // Store tiedPlayers for reference 
        this.tiedPlayers = tiedPlayers;
        
        // Get tied player objects
        const tiedSurvivors = tiedPlayers.map(name => 
            this.currentTribe.members.find(member => member.name === name)
        ).filter(survivor => survivor !== undefined);
        
        // Determine eligible voters (everyone except tied players)
        const eligibleVoters = this.currentTribe.members.filter(member => 
            !tiedPlayers.includes(member.name)
        );
        
        // Handle player's vote if they're eligible
        const player = this.gameManager.getPlayerSurvivor();
        let playerVotedInRevote = false;
        
        // Each eligible voter casts a vote for one of the tied players
        eligibleVoters.forEach(voter => {
            // Player makes choice manually in UI
            if (voter.isPlayer) {
                // If player has already selected a target in the UI, use it
                if (this.selectedVoteTarget) {
                    this.votes[voter.name] = this.selectedVoteTarget;
                    playerVotedInRevote = true;
                }
                // Otherwise this will be handled in the UI
                return;
            }
            
            // NPCs vote based on relationships
            let targetVote = null;
            let lowestRelationship = 101; // Higher than max relationship
            
            tiedSurvivors.forEach(target => {
                // Skip if target is undefined (shouldn't happen but just in case)
                if (!target) return;
                
                const relationship = voter.relationships[target.name] || 50;
                if (relationship < lowestRelationship) {
                    lowestRelationship = relationship;
                    targetVote = target;
                }
            });
            
            if (targetVote) {
                this.votes[voter.name] = targetVote;
            } else if (tiedSurvivors.length > 0) {
                // Fallback - vote for random tied player if relationships aren't set
                this.votes[voter.name] = tiedSurvivors[Math.floor(Math.random() * tiedSurvivors.length)];
            }
        });
        
        // If player didn't vote yet and is eligible, wait for their vote
        if (player && !tiedPlayers.includes(player.name) && !playerVotedInRevote) {
            return {
                revoteCount: {},
                stillTied: false,
                tiedPlayers: tiedPlayers,
                waitingForPlayerVote: true
            };
        }
        
        // Count revote results
        const revoteCount = {};
        
        // Initialize counts for all tied players to ensure they appear in results
        tiedPlayers.forEach(name => {
            revoteCount[name] = 0;
        });
        
        // Count the actual votes
        Object.values(this.votes).forEach(target => {
            if (!revoteCount[target.name]) {
                revoteCount[target.name] = 0;
            }
            revoteCount[target.name]++;
        });
        
        // Check if revote is still tied
        let highestVotes = 0;
        Object.values(revoteCount).forEach(count => {
            if (count > highestVotes) {
                highestVotes = count;
            }
        });
        
        const stillTiedPlayers = [];
        Object.entries(revoteCount).forEach(([name, count]) => {
            if (count === highestVotes) {
                stillTiedPlayers.push(name);
            }
        });
        
        // If still tied, go to rock draw
        if (stillTiedPlayers.length > 1) {
            return {
                revoteCount: revoteCount,
                stillTied: true,
                tiedPlayers: stillTiedPlayers
            };
        }
        
        // No tie, determine eliminated player
        if (stillTiedPlayers.length === 1) {
            const eliminatedName = stillTiedPlayers[0];
            this.eliminatedSurvivor = this.currentTribe.members.find(
                member => member.name === eliminatedName
            );
        }
        
        return {
            revoteCount: revoteCount,
            stillTied: false,
            tiedPlayers: []
        };
    }
    
    /**
     * Handle drawing rocks when vote is still tied after revote
     * @param {Array} tiedPlayers - Names of players who are still tied
     * @returns {Object} The player who drew the white rock
     */
    drawRocks(tiedPlayers) {
        // According to Survivor rules, these players are safe from the rock draw:
        // 1. Players involved in the tie (tiedPlayers)
        // 2. Players with immunity (individual or idol)
        // 3. Tribal immunity does not protect from rock draw
        
        // Get players who must draw rocks
        const rockDrawers = this.currentTribe.members.filter(member => {
            // Player is safe if:
            const isSafe = 
                // They are one of the tied players
                tiedPlayers.includes(member.name) || 
                // They have individual immunity or played an idol
                (this.immunePlayers.some(p => p.name === member.name) && 
                 (this.gameManager.gamePhase === "postMerge" || this.idolPlayed));
                
            // Draw rocks if not safe
            return !isSafe;
        });
        
        // If no eligible rock drawers (weird edge case)
        if (rockDrawers.length === 0) {
            console.log("No eligible players for rock draw - this is an edge case!");
            // Force elimination of a tied player as a fallback
            const tiedSurvivors = tiedPlayers.map(name => 
                this.currentTribe.members.find(member => member.name === name)
            ).filter(s => s !== undefined);
            
            if (tiedSurvivors.length > 0) {
                this.eliminatedSurvivor = tiedSurvivors[Math.floor(Math.random() * tiedSurvivors.length)];
                return this.eliminatedSurvivor;
            }
            return null;
        }
        
        // If only one person available, they're automatically eliminated
        if (rockDrawers.length === 1) {
            this.eliminatedSurvivor = rockDrawers[0];
            return this.eliminatedSurvivor;
        }
        
        // Randomly select a player to draw the white rock
        const unluckyIndex = Math.floor(Math.random() * rockDrawers.length);
        this.eliminatedSurvivor = rockDrawers[unluckyIndex];
        
        return this.eliminatedSurvivor;
    }
    
    /**
     * Process elimination
     */
    processElimination() {
        // If no one was eliminated (everyone immune?)
        if (!this.eliminatedSurvivor) {
            return false;
        }
        
        // If player was eliminated, game over
        if (this.eliminatedSurvivor.isPlayer) {
            this.gameManager.setGameState("gameOver");
            return true;
        }
        
        // Save this eliminated player name for reference in next game phase
        this.gameManager.lastVotedOut = this.eliminatedSurvivor.name;
        this.gameManager.lastVotedOutShown = false; // Reset flag for next phase
        
        console.log("Setting last voted out player:", this.eliminatedSurvivor.name);
        
        // Otherwise, eliminate survivor and continue
        this.gameManager.eliminateSurvivor(this.eliminatedSurvivor);
        return true;
    }
    
    /**
     * Get votes
     * @returns {Object} The votes (voter name -> target)
     */
    getVotes() {
        return this.votes;
    }
    
    /**
     * Get eliminated survivor
     * @returns {Object} The eliminated survivor
     */
    getEliminatedSurvivor() {
        return this.eliminatedSurvivor;
    }
}