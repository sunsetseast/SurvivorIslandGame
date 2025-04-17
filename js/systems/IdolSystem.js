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
            this.gameManager.dialogueSystem.showDialogue(
                "You search around but don't find any hidden immunity idols.",
                ["Continue"],
                () => this.gameManager.dialogueSystem.hideDialogue()
            );
            return;
        }
        
        // Get current location from CampScreen
        // First check if we can access it
        const campScreenElement = document.getElementById('camp-screen');
        if (!campScreenElement) return;
        
        // Look for the data-location attribute on the selected location button
        const selectedLocationButton = campScreenElement.querySelector('.location-button.selected');
        if (!selectedLocationButton) return;
        
        const locationName = selectedLocationButton.getAttribute('data-location');
        if (!locationName) return;
        
        // Get location-specific hiding spots
        const hidingSpots = this.getLocationHidingSpots(locationName);
        
        // Create idol search options
        const choiceTexts = hidingSpots.map(spot => `Search ${spot}`);
        
        // Show search options dialogue
        this.gameManager.dialogueSystem.showDialogue(
            "Where would you like to search for a hidden immunity idol?",
            choiceTexts,
            (choice) => {
                this.gameManager.dialogueSystem.hideDialogue();
                this.startIdolSearch(hidingSpots[choice]);
            }
        );
    }
    
    /**
     * Get location-specific hiding spots for idols
     * @param {string} locationName - The name of the location
     * @returns {Array} Array of hiding spot names
     */
    getLocationHidingSpots(locationName) {
        switch(locationName) {
            case "Beach":
                return [
                    "under a pile of shells",
                    "inside a small tidal cave",
                    "buried in the sand",
                    "in a coconut shell",
                    "behind a large rock",
                    "in a hollowed tree stump"
                ];
            case "Jungle":
                return [
                    "inside a hollow tree",
                    "under a large boulder",
                    "in a dense thicket",
                    "high up in a tree",
                    "in a small stream",
                    "under a pile of fallen leaves"
                ];
            case "Camp":
                return [
                    "under the shelter",
                    "buried near the tribe flag",
                    "inside the water well",
                    "in the firewood pile",
                    "underneath the tribe bench",
                    "inside a pot or container"
                ];
            case "Private Area":
                return [
                    "inside a small cave",
                    "under a distinctive rock",
                    "buried at the base of a dead tree",
                    "in a bird's nest",
                    "under a pile of stones",
                    "wedged in a tree branch"
                ];
            default:
                return [
                    "under a rock",
                    "in a tree",
                    "buried in the ground",
                    "inside a hollow log",
                    "behind vegetation",
                    "near the water"
                ];
        }
    }
    
    /**
     * Start idol search minigame
     * @param {string} hidingSpot - The specific hiding spot being searched
     */
    startIdolSearch(hidingSpot) {
        // Calculate search success chance based on location and hiding spot
        // Some hiding spots are more likely to contain idols
        let searchChance = 0.05; // Base 5% chance
        
        // Certain hiding spots have higher chances
        if (hidingSpot.includes("tree") || 
            hidingSpot.includes("buried") || 
            hidingSpot.includes("flag") ||
            hidingSpot.includes("distinctive")) {
            searchChance += 0.1; // +10% for classic hiding spots
        }
        
        // Player's mental stat affects chance
        const player = this.gameManager.getPlayerSurvivor();
        if (player) {
            searchChance += (player.mentalStat - 50) / 200; // +/- up to 25% based on mental stat
        }
        
        // Check for success
        const searchSuccess = Math.random() < searchChance;
        
        // Show searching animation/message
        this.gameManager.dialogueSystem.showDialogue(
            `You carefully search ${hidingSpot}...`,
            ["Continue searching..."],
            () => {
                // After a brief pause, show result
                if (searchSuccess) {
                    this.givePlayerIdol();
                } else {
                    // Create different messages for different results
                    const messages = [
                        `You search thoroughly ${hidingSpot} but find nothing unusual.`,
                        `After looking carefully ${hidingSpot}, you come up empty-handed.`,
                        `You dig and search ${hidingSpot} but don't find any idols.`,
                        `Unfortunately, there's no idol hidden ${hidingSpot}.`
                    ];
                    
                    this.gameManager.dialogueSystem.showDialogue(
                        getRandomItem(messages),
                        ["Continue"],
                        () => this.gameManager.dialogueSystem.hideDialogue()
                    );
                }
            }
        );
    }
    
    /**
     * Give a hidden immunity idol to the player
     */
    givePlayerIdol() {
        const playerSurvivor = this.gameManager.getPlayerSurvivor();
        
        if (playerSurvivor) {
            playerSurvivor.hasIdol = true;
            this.idolsInPlay++;
            
            this.gameManager.dialogueSystem.showDialogue(
                "You found a Hidden Immunity Idol! You can play this at Tribal Council to protect yourself from being voted out.",
                ["Awesome!"],
                () => this.gameManager.dialogueSystem.hideDialogue()
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
            this.gameManager.dialogueSystem.showDialogue(
                `You notice ${luckyFinder.name} searching around camp and looking suspicious. They might have found something interesting.`,
                ["Interesting..."],
                () => this.gameManager.dialogueSystem.hideDialogue()
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