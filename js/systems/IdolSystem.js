// Idol System
class IdolSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.idolsInPlay = 0;
        this.maxIdols = 2;
        this.idolLocation = null;  // Will store the hiding spot that contains an idol
        this.searchedSpots = new Set(); // Keep track of searched spots
    }
    
    /**
     * Initialize the idol system
     */
    initialize() {
        this.idolsInPlay = 0;
        this.resetIdolLocations();
    }
    
    /**
     * Reset idol locations - called at game start and after an idol is played
     */
    resetIdolLocations() {
        this.searchedSpots.clear();
        
        // Generate a random location for the idol to be hidden
        const locations = ["Beach", "Jungle", "Camp", "Private Area"];
        const selectedLocation = locations[Math.floor(Math.random() * locations.length)];
        
        // Get hiding spots for that location
        const hidingSpots = this.getLocationHidingSpots(selectedLocation);
        
        // Select one random hiding spot
        this.idolLocation = {
            location: selectedLocation,
            hidingSpot: hidingSpots[Math.floor(Math.random() * hidingSpots.length)]
        };
        
        console.log("Idol hidden in:", this.idolLocation);
    }
    
    /**
     * Show idol search interface
     */
    showIdolSearch() {
        console.log("showIdolSearch called. idolsInPlay:", this.idolsInPlay, "maxIdols:", this.maxIdols);
        console.log("Current idol location is:", this.idolLocation);
        
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
        if (!campScreenElement) {
            console.error("Cannot find camp screen element!");
            return;
        }
        
        // Look for the data-location attribute on the selected location button
        const selectedLocationButton = campScreenElement.querySelector('.location-button.selected');
        if (!selectedLocationButton) {
            console.error("No location button selected!");
            
            // Show error message to the user
            this.gameManager.dialogueSystem.showDialogue(
                "You need to select a location first before searching for an idol.",
                ["OK"],
                () => this.gameManager.dialogueSystem.hideDialogue()
            );
            return;
        }
        
        const locationName = selectedLocationButton.getAttribute('data-location');
        if (!locationName) {
            console.error("Selected location button has no data-location attribute!");
            return;
        }
        
        console.log("Selected location:", locationName);
        
        // Create a modal dialog for idol hunting
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100%';
        modalOverlay.style.height = '100%';
        modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.alignItems = 'center';
        modalOverlay.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.backgroundColor = '#fff';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '5px';
        modalContent.style.maxWidth = '600px';
        modalContent.style.width = '90%';
        modalContent.style.maxHeight = '80%';
        modalContent.style.overflowY = 'auto';
        
        const modalHeader = document.createElement('h2');
        modalHeader.textContent = `Search for Hidden Immunity Idol at ${locationName}`;
        modalHeader.style.marginBottom = '20px';
        modalHeader.style.color = '#d9534f';
        modalContent.appendChild(modalHeader);
        
        const modalDescription = document.createElement('p');
        modalDescription.textContent = 'Choose a specific spot to search. Each search costs 2 energy, which will be consumed only when you select a spot.';
        modalDescription.style.marginBottom = '20px';
        modalContent.appendChild(modalDescription);
        
        const spotButtonsContainer = document.createElement('div');
        spotButtonsContainer.style.display = 'flex';
        spotButtonsContainer.style.flexDirection = 'column';
        spotButtonsContainer.style.gap = '10px';
        
        // Get location-specific hiding spots
        const hidingSpots = this.getLocationHidingSpots(locationName);
        console.log("Available hiding spots:", hidingSpots);
        
        // Create buttons for each hiding spot
        hidingSpots.forEach(spot => {
            const button = document.createElement('button');
            button.textContent = `Search ${spot}`;
            button.className = 'search-spot-button';
            button.style.padding = '10px';
            button.style.backgroundColor = '#5cb85c';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.margin = '5px 0';
            button.style.cursor = 'pointer';
            
            button.addEventListener('click', () => {
                // Remove the modal
                document.body.removeChild(modalOverlay);
                
                // Start the idol search
                this.startIdolSearch(spot);
            });
            
            spotButtonsContainer.appendChild(button);
        });
        
        modalContent.appendChild(spotButtonsContainer);
        
        // Add cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.backgroundColor = '#d9534f';
        cancelButton.style.color = 'white';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.padding = '10px';
        cancelButton.style.marginTop = '20px';
        cancelButton.style.cursor = 'pointer';
        cancelButton.style.width = '100%';
        
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
        
        modalContent.appendChild(cancelButton);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
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
        // Get current location from CampScreen
        const campScreenElement = document.getElementById('camp-screen');
        if (!campScreenElement) {
            console.error("Cannot find camp screen element");
            return;
        }
        
        // Look for the data-location attribute on the selected location button
        const selectedLocationButton = campScreenElement.querySelector('.location-button.selected');
        if (!selectedLocationButton) {
            console.error("No location button selected");
            return;
        }
        
        const locationName = selectedLocationButton.getAttribute('data-location');
        if (!locationName) {
            console.error("Selected location button has no data-location attribute");
            return;
        }
        
        console.log(`Searching for idol at ${locationName}, in ${hidingSpot}`);
        console.log(`Current idol location: ${JSON.stringify(this.idolLocation)}`);
        
        // Check if this spot has been searched before
        const searchKey = `${locationName}:${hidingSpot}`;
        
        if (this.searchedSpots.has(searchKey)) {
            this.gameManager.dialogueSystem.showDialogue(
                `You've already searched ${hidingSpot} at this location. Try looking somewhere else.`,
                ["Continue"],
                () => this.gameManager.dialogueSystem.hideDialogue()
            );
            return;
        }
        
        // Check if player has enough energy first (2 energy cost)
        if (this.gameManager.energySystem.getCurrentEnergy() < 2) {
            this.gameManager.dialogueSystem.showDialogue(
                "You don't have enough energy to search for an idol.",
                ["Continue"],
                () => this.gameManager.dialogueSystem.hideDialogue()
            );
            return;
        }
        
        // Consume energy only when a specific hiding spot is chosen
        // Cost of searching is 2 energy
        this.gameManager.energySystem.useEnergy(2);
        
        // Add to searched spots
        this.searchedSpots.add(searchKey);
        
        // Show searching animation/message
        this.gameManager.dialogueSystem.showDialogue(
            `You carefully search ${hidingSpot}...`,
            ["Continue searching..."],
            () => {
                // Check if this is where the idol is hidden
                const idolFound = this.idolLocation && 
                                 this.idolLocation.location === locationName && 
                                 this.idolLocation.hidingSpot === hidingSpot;
                
                console.log(`Idol found check: ${idolFound}`);
                console.log(`Location match: ${this.idolLocation?.location === locationName}`);
                console.log(`Hiding spot match: ${this.idolLocation?.hidingSpot === hidingSpot}`);
                
                // After a brief pause, show result
                if (idolFound) {
                    console.log("Found an idol! Giving to player.");
                    this.givePlayerIdol();
                    // Reset idol location for next time
                    this.resetIdolLocations();
                } else {
                    // Check if all spots in this location have been searched
                    const allSpotsInLocation = this.getLocationHidingSpots(locationName);
                    const allSpotSearched = allSpotsInLocation.every(spot => 
                        this.searchedSpots.has(`${locationName}:${spot}`)
                    );
                    
                    // If all spots in this location have been searched
                    if (allSpotSearched) {
                        this.gameManager.dialogueSystem.showDialogue(
                            `You've searched all possible hiding spots at ${locationName}. There are no idols here. Someone may have already found it or it's hidden elsewhere.`,
                            ["Continue"],
                            () => this.gameManager.dialogueSystem.hideDialogue()
                        );
                    } else {
                        // Create different messages for different results
                        const messages = [
                            `You search thoroughly ${hidingSpot} but find nothing unusual.`,
                            `After looking carefully ${hidingSpot}, you come up empty-handed.`,
                            `You dig and search ${hidingSpot} but don't find any idols.`,
                            `Unfortunately, there's no idol hidden ${hidingSpot}.`
                        ];
                        
                        const selectedMessage = getRandomItem(messages);
                        console.log(`Didn't find idol. Message: ${selectedMessage}`);
                        
                        this.gameManager.dialogueSystem.showDialogue(
                            selectedMessage,
                            ["Continue"],
                            () => this.gameManager.dialogueSystem.hideDialogue()
                        );
                    }
                }
                
                // Check if all spots in all locations have been searched
                const allLocations = ["Beach", "Jungle", "Camp", "Private Area"];
                let totalSpots = 0;
                let searchedSpots = 0;
                
                allLocations.forEach(loc => {
                    const spots = this.getLocationHidingSpots(loc);
                    totalSpots += spots.length;
                    spots.forEach(spot => {
                        if (this.searchedSpots.has(`${loc}:${spot}`)) {
                            searchedSpots++;
                        }
                    });
                });
                
                // If all possible spots have been searched and idol still exists
                if (searchedSpots >= totalSpots && this.idolLocation) {
                    // Reset idol locations as someone else must have found it
                    this.gameManager.dialogueSystem.showDialogue(
                        "You've searched everywhere but haven't found an idol. Someone else must have already found it.",
                        ["Continue"],
                        () => {
                            this.gameManager.dialogueSystem.hideDialogue();
                            this.idolsInPlay++;  // Assume an NPC has it
                            this.resetIdolLocations();
                        }
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
            
            // Reset idol locations when an idol is played
            this.resetIdolLocations();
            
            console.log("Idol played. New idol location generated.");
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