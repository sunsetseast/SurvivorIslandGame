// Idol System
class IdolSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.idolsInPlay = 0;
        this.maxIdols = 2;
    }
    
    /**
     * Initialize the idol system
     */
    initialize() {
        this.idolsInPlay = 0;
    }
    
    /**
     * Show idol search interface
     */
    showIdolSearch() {
        // Check if any idols are available to find
        if (this.idolsInPlay >= this.maxIdols) {
            // No idols left to find
            gameManager.dialogueSystem.showDialogue(
                "You search around but don't find any hidden immunity idols.",
                ["Continue"],
                () => gameManager.dialogueSystem.hideDialogue()
            );
            return;
        }
        
        // Create idol search minigame
        this.startIdolSearch();
    }
    
    /**
     * Start idol search minigame
     */
    startIdolSearch() {
        // For the web prototype, simplify to a random chance
        const searchSuccess = Math.random() < 0.2; // 20% chance of finding an idol
        
        if (searchSuccess) {
            this.givePlayerIdol();
        } else {
            gameManager.dialogueSystem.showDialogue(
                "You search carefully but don't find an immunity idol. Maybe try looking in another location?",
                ["Continue"],
                () => gameManager.dialogueSystem.hideDialogue()
            );
        }
    }
    
    /**
     * Give a hidden immunity idol to the player
     */
    givePlayerIdol() {
        const playerSurvivor = this.gameManager.getPlayerSurvivor();
        
        if (playerSurvivor) {
            playerSurvivor.hasIdol = true;
            this.idolsInPlay++;
            
            gameManager.dialogueSystem.showDialogue(
                "You found a Hidden Immunity Idol! You can play this at Tribal Council to protect yourself from being voted out.",
                ["Awesome!"],
                () => gameManager.dialogueSystem.hideDialogue()
            );
        }
    }
    
    /**
     * Process NPCs finding idols (random chance)
     */
    processNPCIdolFinds() {
        // Only process if we haven't reached max idols
        if (this.idolsInPlay >= this.maxIdols) return;
        
        // Get all survivors
        const survivors = [];
        this.gameManager.getTribes().forEach(tribe => {
            tribe.members.forEach(member => {
                if (!member.isPlayer && !member.hasIdol) {
                    survivors.push(member);
                }
            });
        });
        
        // 5% chance per day that an NPC finds an idol
        if (Math.random() < 0.05 && survivors.length > 0) {
            const luckyFinder = survivors[Math.floor(Math.random() * survivors.length)];
            luckyFinder.hasIdol = true;
            this.idolsInPlay++;
            
            // Notify player with a hint
            gameManager.dialogueSystem.showDialogue(
                `You notice ${luckyFinder.name} searching around camp and looking suspicious. They might have found something interesting.`,
                ["Interesting..."],
                () => gameManager.dialogueSystem.hideDialogue()
            );
        }
    }
    
    /**
     * Reset idol when played
     * @param {Object} survivor - The survivor who played the idol
     */
    resetIdol(survivor) {
        if (survivor && survivor.hasIdol) {
            survivor.hasIdol = false;
            this.idolsInPlay--;
        }
    }
    
    /**
     * Get the number of idols in play
     * @returns {number} The number of idols currently in play
     */
    getIdolsInPlay() {
        return this.idolsInPlay;
    }
    
    /**
     * Get survivors who have idols
     * @returns {Array} Array of survivors who possess idols
     */
    getSurvivorsWithIdols() {
        const survivorsWithIdols = [];
        
        this.gameManager.getTribes().forEach(tribe => {
            tribe.members.forEach(member => {
                if (member.hasIdol) {
                    survivorsWithIdols.push(member);
                }
            });
        });
        
        return survivorsWithIdols;
    }
}