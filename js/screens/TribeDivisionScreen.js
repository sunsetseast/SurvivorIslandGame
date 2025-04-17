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
        
        // Add a subtitle
        let subtitleElement = document.querySelector('#tribe-division-subtitle');
        if (!subtitleElement) {
            subtitleElement = document.createElement('p');
            subtitleElement.id = 'tribe-division-subtitle';
            subtitleElement.className = 'tribe-division-subtitle';
            const titleElement = document.querySelector('#tribe-division-screen h2');
            if (titleElement && titleElement.parentNode) {
                titleElement.parentNode.insertBefore(subtitleElement, titleElement.nextSibling);
            }
        }
        subtitleElement.textContent = "You've reached the individual phase of the game!";
        
        this.createTribeDisplays();
        
        // Update continue button text
        const continueButton = document.getElementById('continue-to-challenge-button');
        if (continueButton) {
            continueButton.textContent = "Continue to Camp";
            continueButton.addEventListener('click', this.onContinueClick);
        }
    },
    
    /**
     * Set up shuffle screen (for 3→2 or other tribe shuffles)
     */
    setupShuffle() {
        // Update title
        const titleElement = document.querySelector('#tribe-division-screen h2');
        if (titleElement) {
            titleElement.textContent = "Tribe Shuffle!";
        }
        
        // Add a subtitle
        let subtitleElement = document.querySelector('#tribe-division-subtitle');
        if (!subtitleElement) {
            subtitleElement = document.createElement('p');
            subtitleElement.id = 'tribe-division-subtitle';
            subtitleElement.className = 'tribe-division-subtitle';
            const titleElement = document.querySelector('#tribe-division-screen h2');
            if (titleElement && titleElement.parentNode) {
                titleElement.parentNode.insertBefore(subtitleElement, titleElement.nextSibling);
            }
        }
        subtitleElement.textContent = "The tribes have been reorganized!";
        
        this.createTribeDisplays();
        
        // Update continue button text
        const continueButton = document.getElementById('continue-to-challenge-button');
        if (continueButton) {
            continueButton.textContent = "Continue to Camp";
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
        const currentState = gameManager.getGameState();
        
        if (currentState === "merge" || currentState === "tribeShuffle") {
            // After merge or shuffle, go to camp
            gameManager.setGameState("camp");
        } else {
            // After initial division, go to first challenge
            gameManager.setGameState("challenge");
        }
    }
};