// Relationship System
class RelationshipSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        // Relationship descriptions by range
        this.relationshipDescriptions = [
            { min: 0, max: 19, description: "Hostile" },
            { min: 20, max: 39, description: "Distrustful" },
            { min: 40, max: 59, description: "Neutral" },
            { min: 60, max: 79, description: "Friendly" },
            { min: 80, max: 100, description: "Close Ally" }
        ];
        
        // Store conversation memories
        this.memories = {};
        
        // Survivor traits for richer interactions
        this.traits = {
            "Loyal": "Values loyalty and keeps their word",
            "Deceptive": "Will say one thing but do another",
            "Strategic": "Always thinking several steps ahead",
            "Emotional": "Makes decisions based on feelings",
            "Physical": "Focuses on challenges and camp life",
            "Social": "Builds relationships with everyone",
            "Unpredictable": "Hard to anticipate their moves",
            "Observant": "Notices details others miss"
        };
    }
    
    /**
     * Initialize the relationship system
     */
    initialize() {
        // Relationships are stored within survivor objects
        // Initialize memory storage
        this.memories = {};
    }
    
    /**
     * Get relationship between two survivors
     * @param {Object} survivor1 - The first survivor
     * @param {Object} survivor2 - The second survivor
     * @returns {number} The relationship value (0-100)
     */
    getRelationship(survivor1, survivor2) {
        if (!survivor1 || !survivor2) return 50; // Default neutral
        
        // Create relationship object if it doesn't exist
        if (!survivor1.relationships) {
            survivor1.relationships = {};
        }
        
        if (!survivor2.relationships) {
            survivor2.relationships = {};
        }
        
        // Check if relationship exists, otherwise create default
        if (survivor1.relationships[survivor2.name] === undefined) {
            // Generate a base relationship based on compatibility
            const baseRelationship = this.calculateBaseRelationship(survivor1, survivor2);
            survivor1.relationships[survivor2.name] = baseRelationship;
        }
        
        return survivor1.relationships[survivor2.name];
    }
    
    /**
     * Change relationship between two survivors
     * @param {Object} survivor1 - The first survivor
     * @param {Object} survivor2 - The second survivor
     * @param {number} amount - The amount to change (positive or negative)
     */
    changeRelationship(survivor1, survivor2, amount) {
        if (!survivor1 || !survivor2) return;
        
        // Get current relationship (this will initialize if needed)
        const currentRelationship = this.getRelationship(survivor1, survivor2);
        
        // Calculate new relationship with bounds
        const newRelationship = clamp(currentRelationship + amount, 0, 100);
        
        // Update relationships (both ways)
        survivor1.relationships[survivor2.name] = newRelationship;
        
        // Update in reverse with a slight random variation
        const variation = Math.round((Math.random() * 2) - 1); // -1, 0, or 1
        const reverseRelationship = this.getRelationship(survivor2, survivor1);
        survivor2.relationships[survivor1.name] = clamp(reverseRelationship + amount + variation, 0, 100);
        
        // Check if this affects alliances
        this.checkRelationshipImpactOnAlliances(survivor1, survivor2);
    }
    
    /**
     * Set relationship between two survivors
     * @param {Object} survivor1 - The first survivor
     * @param {Object} survivor2 - The second survivor
     * @param {number} value - The relationship value to set (0-100)
     */
    setRelationship(survivor1, survivor2, value) {
        if (!survivor1 || !survivor2) return;
        
        // Ensure relationships exist
        if (!survivor1.relationships) {
            survivor1.relationships = {};
        }
        
        // Set the relationship with bounds
        survivor1.relationships[survivor2.name] = clamp(value, 0, 100);
        
        // Check if this affects alliances
        this.checkRelationshipImpactOnAlliances(survivor1, survivor2);
    }
    
    /**
     * Get a description of the relationship
     * @param {Object} survivor1 - The first survivor
     * @param {Object} survivor2 - The second survivor
     * @returns {string} The relationship description
     */
    getRelationshipDescription(survivor1, survivor2) {
        const relationshipValue = this.getRelationship(survivor1, survivor2);
        
        for (const desc of this.relationshipDescriptions) {
            if (relationshipValue >= desc.min && relationshipValue <= desc.max) {
                return desc.description;
            }
        }
        
        return "Unknown";
    }
    
    /**
     * Calculate base relationship based on survivor compatibility
     * @param {Object} survivor1 - The first survivor
     * @param {Object} survivor2 - The second survivor
     * @returns {number} The base relationship value
     */
    calculateBaseRelationship(survivor1, survivor2) {
        // Base relationship is 50 (neutral)
        let baseRelationship = 50;
        
        // Adjust based on personality compatibility
        const personalityDiff = Math.abs(survivor1.personalityStat - survivor2.personalityStat);
        
        // Similar personalities tend to get along better, up to +/- 15 points
        if (personalityDiff < 20) {
            baseRelationship += Math.round(15 - (personalityDiff * 0.75));
        } else if (personalityDiff > 40) {
            baseRelationship -= Math.round((personalityDiff - 40) * 0.5);
        }
        
        // Add some randomness (-5 to +5)
        baseRelationship += Math.floor(Math.random() * 11) - 5;
        
        // Ensure within bounds
        return clamp(baseRelationship, 20, 80);
    }
    
    /**
     * Process random relationship changes (called periodically)
     */
    processRandomRelationships() {
        const tribes = this.gameManager.getTribes();
        
        tribes.forEach(tribe => {
            // Pick a random survivor
            const survivor1Index = Math.floor(Math.random() * tribe.members.length);
            const survivor1 = tribe.members[survivor1Index];
            
            // Pick another random survivor (not the same)
            let survivor2Index;
            do {
                survivor2Index = Math.floor(Math.random() * tribe.members.length);
            } while (survivor2Index === survivor1Index);
            
            const survivor2 = tribe.members[survivor2Index];
            
            // Random change (-2 to +2)
            const change = Math.floor(Math.random() * 5) - 2;
            
            // Apply change
            this.changeRelationship(survivor1, survivor2, change);
        });
    }
    
    /**
     * Initialize relationships for a new tribe
     * @param {Object} tribe - The tribe to initialize relationships for
     */
    initializeTribeRelationships(tribe) {
        // Generate initial relationships between all tribe members
        for (let i = 0; i < tribe.members.length; i++) {
            for (let j = i + 1; j < tribe.members.length; j++) {
                this.getRelationship(tribe.members[i], tribe.members[j]);
                this.getRelationship(tribe.members[j], tribe.members[i]);
            }
        }
    }
    
    /**
     * Check if a relationship change impacts alliances
     * @param {Object} survivor1 - The first survivor
     * @param {Object} survivor2 - The second survivor
     */
    checkRelationshipImpactOnAlliances(survivor1, survivor2) {
        // If alliance system isn't initialized yet, skip
        if (!this.gameManager.allianceSystem) return;
        
        const relationship = this.getRelationship(survivor1, survivor2);
        
        // Check if they should be in an alliance (high relationship)
        if (relationship >= 75) {
            // See if they're already in an alliance together
            const alliancesWithBoth = this.gameManager.allianceSystem.alliances.filter(alliance => 
                this.gameManager.allianceSystem.containsMember(alliance, survivor1) && 
                this.gameManager.allianceSystem.containsMember(alliance, survivor2)
            );
            
            // If not, and both are in the same tribe, possibly create one
            if (alliancesWithBoth.length === 0) {
                const survivor1Tribe = this.gameManager.getTribes().find(tribe => 
                    tribe.members.some(m => m.name === survivor1.name)
                );
                
                const survivor2Tribe = this.gameManager.getTribes().find(tribe => 
                    tribe.members.some(m => m.name === survivor2.name)
                );
                
                if (survivor1Tribe && survivor2Tribe && survivor1Tribe === survivor2Tribe) {
                    // 20% chance of forming an alliance if relationship is high enough
                    if (Math.random() < 0.2) {
                        this.gameManager.allianceSystem.createAllianceBetween(survivor1, survivor2);
                    }
                }
            }
        }
        
        // Check if they should be removed from an alliance (low relationship)
        if (relationship < 30) {
            // Find alliances they're both in
            const alliancesWithBoth = this.gameManager.allianceSystem.alliances.filter(alliance => 
                this.gameManager.allianceSystem.containsMember(alliance, survivor1) && 
                this.gameManager.allianceSystem.containsMember(alliance, survivor2)
            );
            
            alliancesWithBoth.forEach(alliance => {
                // 30% chance of removing one of them from the alliance
                if (Math.random() < 0.3) {
                    // Remove the one with lower average relationships with other members
                    let survivor1Avg = 0;
                    let survivor2Avg = 0;
                    let count = 0;
                    
                    alliance.members.forEach(member => {
                        if (member !== survivor1 && member !== survivor2) {
                            survivor1Avg += this.getRelationship(survivor1, member);
                            survivor2Avg += this.getRelationship(survivor2, member);
                            count++;
                        }
                    });
                    
                    survivor1Avg = count > 0 ? survivor1Avg / count : 0;
                    survivor2Avg = count > 0 ? survivor2Avg / count : 0;
                    
                    // Remove the one with lower average or random if equal
                    if (survivor1Avg < survivor2Avg) {
                        this.gameManager.allianceSystem.removeFromAlliance(alliance, survivor1);
                    } else {
                        this.gameManager.allianceSystem.removeFromAlliance(alliance, survivor2);
                    }
                }
            });
        }
    }
    
    /**
     * Get relationships for a specific survivor
     * @param {Object} survivor - The survivor to get relationships for
     * @returns {Object} Map of relationship values by survivor name
     */
    getSurvivorRelationships(survivor) {
        if (!survivor || !survivor.relationships) {
            return {};
        }
        
        return survivor.relationships;
    }
}