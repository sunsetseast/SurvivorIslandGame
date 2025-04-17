// Tribe Division Screen
const TribeDivisionScreen = {
    /**
     * Set up tribe division screen
     */
    setup() {
        this.createTribeDisplays();
        
        // Set up continue button
        const continueButton = document.getElementById('continue-to-challenge-button');
        if (continueButton) {
            continueButton.addEventListener('click', this.onContinueClick);
        }
    },
    
    /**
     * Set up merge screen (modified tribe division for merge phase)
     */
    setupMerge() {
        // Update title
        const titleElement = document.querySelector('#tribe-division-screen h2');
        if (titleElement) {
            titleElement.textContent = "Tribes are merging!";
        }
        
        this.createTribeDisplays();
        
        // Set up continue button
        const continueButton = document.getElementById('continue-to-challenge-button');
        if (continueButton) {
            continueButton.addEventListener('click', this.onContinueClick);
        }
    },
    
    /**
     * Create tribe displays
     */
    createTribeDisplays() {
        const tribesContainer = document.getElementById('tribes-container');
        if (!tribesContainer) return;
        
        // Clear container
        clearChildren(tribesContainer);
        
        // Get tribes
        const tribes = gameManager.getTribes();
        
        // Create display for each tribe
        tribes.forEach(tribe => {
            const tribeBox = createElement('div', { className: 'tribe-box' });
            tribeBox.style.borderColor = tribe.tribeColor;
            
            // Set tribe name
            const nameElement = createElement('h3', {
                textContent: tribe.tribeName
            });
            nameElement.style.color = tribe.tribeColor;
            
            // Create member list
            const memberList = createElement('ul', { className: 'tribe-members' });
            
            tribe.members.forEach(member => {
                const memberItem = createElement('li', {
                    textContent: member.name,
                    className: member.isPlayer ? 'player-member' : ''
                });
                
                memberList.appendChild(memberItem);
            });
            
            tribeBox.appendChild(nameElement);
            tribeBox.appendChild(memberList);
            tribesContainer.appendChild(tribeBox);
        });
    },
    
    /**
     * Handle continue button click
     */
    onContinueClick() {
        // Determine next state based on current state
        if (gameManager.getGameState() === "merge") {
            // After merge, go to camp
            gameManager.setGameState("camp");
        } else {
            // After initial division, go to first challenge
            gameManager.setGameState("challenge");
        }
    }
};