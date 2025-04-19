// Completely rewritten IdolSystem to fix JSON errors
class IdolSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.idolsInPlay = 0;
        this.maxIdols = 2;
        this.idolLocation = {
            location: "None", 
            hidingSpot: "None"
        };
        this.searchedSpots = new Set();
    }
    
    initialize() {
        this.idolsInPlay = 0;
        this.resetIdolLocations();
    }
    
    resetIdolLocations() {
        try {
            this.searchedSpots.clear();
            
            const locations = ["Beach", "Jungle", "Camp", "Private Area"];
            const selectedLocation = locations[Math.floor(Math.random() * locations.length)];
            
            let hidingSpots;
            switch(selectedLocation) {
                case "Beach":
                    hidingSpots = [
                        "under a pile of shells",
                        "inside a small tidal cave",
                        "buried in the sand",
                        "in a coconut shell",
                        "behind a large rock",
                        "in a hollowed tree stump"
                    ];
                    break;
                case "Jungle":
                    hidingSpots = [
                        "inside a hollow tree",
                        "under a large boulder",
                        "in a dense thicket",
                        "high up in a tree",
                        "in a small stream",
                        "under a pile of fallen leaves"
                    ];
                    break;
                case "Camp":
                    hidingSpots = [
                        "under the shelter",
                        "buried near the tribe flag",
                        "inside the water well",
                        "in the firewood pile",
                        "underneath the tribe bench",
                        "inside a pot or container"
                    ];
                    break;
                case "Private Area":
                    hidingSpots = [
                        "inside a small cave",
                        "under a distinctive rock",
                        "buried at the base of a dead tree",
                        "in a bird's nest",
                        "under a pile of stones",
                        "wedged in a tree branch"
                    ];
                    break;
                default:
                    hidingSpots = [
                        "under a rock",
                        "in a tree",
                        "buried in the ground",
                        "inside a hollow log",
                        "behind vegetation",
                        "near the water"
                    ];
            }
            
            if (!hidingSpots || hidingSpots.length === 0) {
                console.log("No hiding spots found for location:", selectedLocation);
                return;
            }
            
            const randomSpot = hidingSpots[Math.floor(Math.random() * hidingSpots.length)];
            
            // Set location properties directly to avoid any JSON stringification issues
            this.idolLocation.location = selectedLocation;
            this.idolLocation.hidingSpot = randomSpot;
            
            // Log separately to avoid JSON issues
            console.log("New idol location set");
            console.log("Location:", selectedLocation);
            console.log("Hiding spot:", randomSpot);
        } catch (error) {
            console.log("Error in resetIdolLocations:", error);
        }
    }
    
    showIdolSearch() {
        try {
            console.log("IdolSystem.showIdolSearch called");
            console.log("idolsInPlay:", this.idolsInPlay);
            console.log("maxIdols:", this.maxIdols);
            
            if (this.idolLocation) {
                console.log("Current idol location:", this.idolLocation.location);
                console.log("Current hiding spot:", this.idolLocation.hidingSpot);
            } else {
                console.log("No idol location set");
            }
            
            if (this.idolsInPlay >= this.maxIdols) {
                this.gameManager.dialogueSystem.showDialogue(
                    "You search around but don't find any hidden immunity idols.",
                    ["Continue"],
                    () => this.gameManager.dialogueSystem.hideDialogue()
                );
                return;
            }
            
            this.gameManager.dialogueSystem.showDialogue(
                "You search for a hidden immunity idol...",
                ["Continue searching"],
                () => {
                    if (Math.random() < 0.1) {  // 10% chance of finding
                        this.givePlayerIdol();
                    } else {
                        this.gameManager.dialogueSystem.showDialogue(
                            "You search but don't find anything this time.",
                            ["Continue"],
                            () => this.gameManager.dialogueSystem.hideDialogue()
                        );
                    }
                }
            );
        } catch (error) {
            console.log("Error in showIdolSearch:", error);
        }
    }
    
    startIdolSearch(hidingSpot) {
        try {
            console.log("Searching for idol at spot:", hidingSpot);
            
            if (Math.random() < 0.1) {  // 10% chance of finding
                this.givePlayerIdol();
            } else {
                this.gameManager.dialogueSystem.showDialogue(
                    "You search but don't find anything this time.",
                    ["Continue"],
                    () => this.gameManager.dialogueSystem.hideDialogue()
                );
            }
        } catch (error) {
            console.log("Error in startIdolSearch:", error);
        }
    }
    
    givePlayerIdol() {
        try {
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
        } catch (error) {
            console.log("Error in givePlayerIdol:", error);
        }
    }
    
    processNPCIdolFinds() {
        try {
            if (this.idolsInPlay >= this.maxIdols) return;
            
            const survivors = [];
            this.gameManager.getTribes().forEach(tribe => {
                tribe.members.forEach(member => {
                    if (!member.isPlayer && !member.hasIdol) {
                        survivors.push(member);
                    }
                });
            });
            
            if (Math.random() < 0.05 && survivors.length > 0) {
                const luckyFinder = survivors[Math.floor(Math.random() * survivors.length)];
                luckyFinder.hasIdol = true;
                this.idolsInPlay++;
                
                this.gameManager.dialogueSystem.showDialogue(
                    `You notice ${luckyFinder.name} searching around camp and looking suspicious. They might have found something interesting.`,
                    ["Interesting..."],
                    () => this.gameManager.dialogueSystem.hideDialogue()
                );
            }
        } catch (error) {
            console.log("Error in processNPCIdolFinds:", error);
        }
    }
    
    resetIdol(survivor) {
        try {
            if (survivor && survivor.hasIdol) {
                survivor.hasIdol = false;
                this.idolsInPlay--;
                this.resetIdolLocations();
                console.log("Idol played. New idol location generated.");
            }
        } catch (error) {
            console.log("Error in resetIdol:", error);
        }
    }
    
    getIdolsInPlay() {
        try {
            let count = 0;
            
            this.gameManager.getTribes().forEach(tribe => {
                tribe.members.forEach(member => {
                    if (member.hasIdol) {
                        count++;
                    }
                });
            });
            
            this.idolsInPlay = count;
            return count;
        } catch (error) {
            console.log("Error in getIdolsInPlay:", error);
            return 0;
        }
    }
    
    getSurvivorsWithIdols() {
        try {
            const survivorsWithIdols = [];
            
            this.gameManager.getTribes().forEach(tribe => {
                tribe.members.forEach(member => {
                    if (member.hasIdol) {
                        survivorsWithIdols.push(member);
                    }
                });
            });
            
            console.log("Found", survivorsWithIdols.length, "survivors with idols");
            return survivorsWithIdols;
        } catch (error) {
            console.log("Error in getSurvivorsWithIdols:", error);
            return [];
        }
    }
}