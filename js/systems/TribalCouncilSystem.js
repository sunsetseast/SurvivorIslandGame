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
        
        // Determine eliminated player
        let highestVotes = 0;
        let eliminatedName = null;
        
        Object.entries(voteCount).forEach(([name, count]) => {
            if (count > highestVotes) {
                highestVotes = count;
                eliminatedName = name;
            }
        });
        
        // Find the survivor object
        if (eliminatedName) {
            this.eliminatedSurvivor = this.currentTribe.members.find(
                member => member.name === eliminatedName
            );
        }
        
        return voteCount;
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