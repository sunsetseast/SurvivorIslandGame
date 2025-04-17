// Alliance System
class AllianceSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.alliances = [];
        this.allianceCounter = 1;
    }
    
    /**
     * Initialize the alliance system
     */
    initialize() {
        this.alliances = [];
        this.allianceCounter = 1;
    }
    
    /**
     * Create a new alliance
     * @param {string} name - The name of the alliance
     * @returns {Object} The created alliance
     */
    createAlliance(name) {
        const alliance = {
            id: this.allianceCounter++,
            name: name || `Alliance ${this.allianceCounter}`,
            members: [],
            strength: 0
        };
        
        this.alliances.push(alliance);
        return alliance;
    }
    
    /**
     * Create an alliance between two survivors
     * @param {Object} survivor1 - The first survivor
     * @param {Object} survivor2 - The second survivor
     * @returns {Object} The created alliance or null if they can't form one
     */
    createAllianceBetween(survivor1, survivor2) {
        // Check if they have a good enough relationship
        const relationship = this.gameManager.relationshipSystem.getRelationship(survivor1, survivor2);
        
        if (relationship < 60) {
            return null; // Relationship not strong enough
        }
        
        // Check if they're already in an alliance together
        if (this.alliances.some(alliance => 
            this.containsMember(alliance, survivor1) && 
            this.containsMember(alliance, survivor2)
        )) {
            return null; // Already in an alliance together
        }
        
        // Create a new alliance
        const alliance = this.createAlliance(`${survivor1.name} & ${survivor2.name}`);
        
        // Add both members
        this.addToAlliance(alliance, survivor1);
        this.addToAlliance(alliance, survivor2);
        
        // Calculate initial strength
        this.calculateAllianceStrength(alliance);
        
        return alliance;
    }
    
    /**
     * Get all alliances a survivor is part of
     * @param {Object} survivor - The survivor to check
     * @returns {Array} Array of alliances the survivor is in
     */
    getSurvivorAlliances(survivor) {
        return this.alliances.filter(alliance => 
            this.containsMember(alliance, survivor)
        );
    }
    
    /**
     * Check if an alliance contains a member
     * @param {Object} alliance - The alliance to check
     * @param {Object} survivor - The survivor to check for
     * @returns {boolean} True if the alliance contains the survivor
     */
    containsMember(alliance, survivor) {
        return alliance.members.some(member => member.name === survivor.name);
    }
    
    /**
     * Add a survivor to an alliance
     * @param {Object} alliance - The alliance to add to
     * @param {Object} newMember - The survivor to add
     * @returns {boolean} True if added successfully
     */
    addToAlliance(alliance, newMember) {
        if (this.containsMember(alliance, newMember)) {
            return false; // Already a member
        }
        
        // Check if everyone in the alliance has a good enough relationship with the new member
        let canJoin = true;
        
        for (const member of alliance.members) {
            const relationship = this.gameManager.relationshipSystem.getRelationship(member, newMember);
            if (relationship < 50) {
                canJoin = false;
                break;
            }
        }
        
        if (!canJoin) {
            return false;
        }
        
        // Add to the alliance
        alliance.members.push(newMember);
        
        // Recalculate alliance strength
        this.calculateAllianceStrength(alliance);
        
        return true;
    }
    
    /**
     * Remove a survivor from an alliance
     * @param {Object} alliance - The alliance to remove from
     * @param {Object} member - The survivor to remove
     * @returns {boolean} True if removed successfully
     */
    removeFromAlliance(alliance, member) {
        if (!this.containsMember(alliance, member)) {
            return false; // Not a member
        }
        
        // Remove from the alliance
        alliance.members = alliance.members.filter(m => m.name !== member.name);
        
        // Check if alliance should be dissolved
        if (alliance.members.length < 2) {
            this.dissolveAlliance(alliance);
            return true;
        }
        
        // Recalculate alliance strength
        this.calculateAllianceStrength(alliance);
        
        return true;
    }
    
    /**
     * Dissolve an alliance
     * @param {Object} alliance - The alliance to dissolve
     */
    dissolveAlliance(alliance) {
        this.alliances = this.alliances.filter(a => a.id !== alliance.id);
    }
    
    /**
     * Calculate alliance strength based on relationship average
     * @param {Object} alliance - The alliance to calculate strength for
     */
    calculateAllianceStrength(alliance) {
        if (alliance.members.length <= 1) {
            alliance.strength = 0;
            return;
        }
        
        let totalRelationship = 0;
        let relationshipCount = 0;
        
        // Calculate average of all pairwise relationships
        for (let i = 0; i < alliance.members.length; i++) {
            for (let j = i + 1; j < alliance.members.length; j++) {
                const relationship = this.gameManager.relationshipSystem.getRelationship(
                    alliance.members[i], alliance.members[j]
                );
                
                totalRelationship += relationship;
                relationshipCount++;
            }
        }
        
        // Calculate strength (average relationship)
        alliance.strength = totalRelationship / relationshipCount;
    }
    
    /**
     * Update all alliance strengths
     */
    updateAllianceStrengths() {
        this.alliances.forEach(alliance => {
            this.calculateAllianceStrength(alliance);
        });
    }
    
    /**
     * Process alliance voting decisions for tribal council
     * @param {Object} tribe - The tribe at tribal council
     * @param {Array} immunePlayers - Array of players with immunity
     * @returns {Object} Map of voters to their targets
     */
    getAllianceVotes(tribe, immunePlayers) {
        const votes = {};
        
        // Get all alliances with members in this tribe
        const relevantAlliances = this.alliances.filter(alliance => 
            alliance.members.some(member => 
                tribe.members.some(m => m.name === member.name)
            )
        );
        
        // Sort alliances by strength (strongest first)
        relevantAlliances.sort((a, b) => b.strength - a.strength);
        
        // Process each alliance's voting strategy
        relevantAlliances.forEach(alliance => {
            // Get alliance members in this tribe
            const allianceMembers = alliance.members.filter(member => 
                tribe.members.some(m => m.name === member.name)
            );
            
            // Skip if less than 2 members are voting (not enough to form a voting bloc)
            if (allianceMembers.length < 2) return;
            
            // Find targets (non-alliance members who don't have immunity)
            const potentialTargets = tribe.members.filter(member => 
                !allianceMembers.some(m => m.name === member.name) &&
                !immunePlayers.some(p => p.name === member.name)
            );
            
            if (potentialTargets.length === 0) return;
            
            // Pick a target (lowest average relationship with alliance)
            let target = null;
            let lowestRelationship = 101; // Higher than max relationship
            
            potentialTargets.forEach(potential => {
                let totalRelationship = 0;
                
                allianceMembers.forEach(member => {
                    totalRelationship += this.gameManager.relationshipSystem.getRelationship(member, potential);
                });
                
                const avgRelationship = totalRelationship / allianceMembers.length;
                
                if (avgRelationship < lowestRelationship) {
                    lowestRelationship = avgRelationship;
                    target = potential;
                }
            });
            
            if (!target) return;
            
            // Record votes for alliance members
            allianceMembers.forEach(member => {
                // Skip if player (player votes separately)
                if (member.isPlayer) return;
                
                votes[member.name] = target;
            });
        });
        
        return votes;
    }
    
    /**
     * Suggest potential alliance members for a player
     * @param {Object} player - The player survivor
     * @returns {Array} Array of potential allies
     */
    suggestPotentialAllies(player) {
        const potentialAllies = [];
        const tribe = this.gameManager.getPlayerTribe();
        
        if (!tribe) return [];
        
        tribe.members.forEach(member => {
            if (member !== player) {
                const relationship = this.gameManager.relationshipSystem.getRelationship(player, member);
                
                if (relationship >= 60) {
                    potentialAllies.push(member);
                }
            }
        });
        
        // Sort by relationship (highest first)
        potentialAllies.sort((a, b) => {
            const relA = this.gameManager.relationshipSystem.getRelationship(player, a);
            const relB = this.gameManager.relationshipSystem.getRelationship(player, b);
            return relB - relA;
        });
        
        return potentialAllies;
    }
}