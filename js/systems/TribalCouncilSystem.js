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
            // In pre-merge, the player's tribe always goes to tribal if they didn't win immunity
            this.currentTribe = this.gameManager.getPlayerTribe();
            
            // Check if any tribe member has immunity
            this.immunePlayers = this.currentTribe.members.filter(member => member.hasImmunity);
        } else {
            // In post-merge, everyone goes to tribal council
            this.currentTribe = this.gameManager.getTribes()[0]; // Merged tribe
            
            // Get players with immunity
            this.immunePlayers = this.gameManager.challengeSystem.getImmunePlayers();
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
        
        // Get tied player objects
        const tiedSurvivors = tiedPlayers.map(name => 
            this.currentTribe.members.find(member => member.name === name)
        );
        
        // Determine eligible voters (everyone except tied players)
        const eligibleVoters = this.currentTribe.members.filter(member => 
            !tiedPlayers.includes(member.name)
        );
        
        // Each eligible voter casts a vote for one of the tied players
        eligibleVoters.forEach(voter => {
            // Player makes choice manually in UI
            if (voter.isPlayer) {
                // This will be handled in the UI
                return;
            }
            
            // NPCs vote based on relationships
            let targetVote = null;
            let lowestRelationship = 100;
            
            tiedSurvivors.forEach(target => {
                const relationship = voter.relationships[target.name] || 50;
                if (relationship < lowestRelationship) {
                    lowestRelationship = relationship;
                    targetVote = target;
                }
            });
            
            if (targetVote) {
                this.votes[voter.name] = targetVote;
            }
        });
        
        // Count revote results
        const revoteCount = {};
        
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
        // Tied players are immune from rock draw
        const rockDrawers = this.currentTribe.members.filter(member => 
            // Not a tied player and not already immune
            !tiedPlayers.includes(member.name) && 
            !this.immunePlayers.some(p => p.name === member.name)
        );
        
        // If only one person available (edge case), they're eliminated
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