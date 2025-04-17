// Tribal Council Screen
const TribalCouncilScreen = {
    /**
     * Set up tribal council screen
     */
    setup() {
        // Prepare tribal council
        gameManager.tribalCouncilSystem.prepareTribalCouncil();
        
        this.updateTribalCouncilUI();
        this.createSurvivorGrid();
        
        // Set up cast vote button
        const castVoteButton = document.getElementById('cast-vote-button');
        if (castVoteButton) {
            castVoteButton.disabled = true;
            castVoteButton.addEventListener('click', () => {
                this.castVote();
            });
        }
        
        // Set up idol play button
        const playIdolButton = document.getElementById('play-idol-button');
        if (playIdolButton) {
            // Show idol button only if player has an idol
            const player = gameManager.getPlayerSurvivor();
            if (player.hasIdol) {
                playIdolButton.classList.remove('hidden');
                playIdolButton.addEventListener('click', () => {
                    this.playIdol();
                });
            } else {
                playIdolButton.classList.add('hidden');
            }
        }
        
        // Hide results panel
        const voteResults = document.getElementById('vote-results');
        if (voteResults) {
            voteResults.classList.add('hidden');
        }
    },
    
    /**
     * Update tribal council UI
     */
    updateTribalCouncilUI() {
        const titleText = document.getElementById('tribal-instruction');
        
        if (titleText) {
            if (gameManager.getGamePhase() === "preMerge") {
                const tribe = gameManager.getPlayerTribe();
                titleText.textContent = `Tribal Council: ${tribe.tribeName} Tribe`;
            } else {
                titleText.textContent = "Tribal Council: Individual Vote";
            }
        }
    },
    
    /**
     * Create survivor grid for voting
     */
    createSurvivorGrid() {
        const votingGrid = document.getElementById('voting-grid');
        if (!votingGrid) return;
        
        // Clear grid
        clearChildren(votingGrid);
        
        // Get tribe and immune players
        const tribe = gameManager.getPlayerTribe();
        const immunePlayers = gameManager.tribalCouncilSystem.immunePlayers;
        
        // Create cards for each tribe member
        tribe.members.forEach(survivor => {
            // Skip the player (can't vote for self)
            if (survivor.isPlayer) return;
            
            const isImmune = immunePlayers.some(p => p.name === survivor.name);
            
            const card = createElement('div', { 
                className: `vote-card ${isImmune ? 'immune' : ''}`,
                onClick: isImmune ? null : () => this.selectVoteTarget(survivor)
            });
            
            const portrait = createElement('div', { className: 'vote-portrait' });
            
            const name = createElement('div', { 
                className: 'vote-name',
                textContent: survivor.name + (isImmune ? ' (Immune)' : '')
            });
            
            card.appendChild(portrait);
            card.appendChild(name);
            votingGrid.appendChild(card);
        });
    },
    
    /**
     * Select a vote target
     * @param {Object} survivor - The survivor to vote for
     */
    selectVoteTarget(survivor) {
        gameManager.tribalCouncilSystem.selectVoteTarget(survivor);
        
        // Update UI
        const votingGrid = document.getElementById('voting-grid');
        if (!votingGrid) return;
        
        // Reset all cards
        const cards = votingGrid.querySelectorAll('.vote-card');
        cards.forEach(card => {
            card.classList.remove('selected');
        });
        
        // Find and select the target card
        for (const card of cards) {
            const nameElement = card.querySelector('.vote-name');
            if (nameElement && nameElement.textContent.startsWith(survivor.name)) {
                card.classList.add('selected');
                break;
            }
        }
        
        // Enable cast vote button
        const castVoteButton = document.getElementById('cast-vote-button');
        if (castVoteButton) {
            castVoteButton.disabled = false;
        }
    },
    
    /**
     * Play immunity idol
     */
    playIdol() {
        if (gameManager.tribalCouncilSystem.playIdol()) {
            // Update UI
            const playIdolButton = document.getElementById('play-idol-button');
            if (playIdolButton) {
                playIdolButton.classList.add('hidden');
            }
            
            // Show message
            const titleText = document.getElementById('tribal-instruction');
            if (titleText) {
                titleText.textContent = "You played a Hidden Immunity Idol! Any votes against you will not count.";
            }
        }
    },
    
    /**
     * Cast vote
     */
    castVote() {
        gameManager.tribalCouncilSystem.castVote();
        
        // Run vote counting
        const voteCount = gameManager.tribalCouncilSystem.countVotes();
        
        // Show vote results
        this.showVotingResults(voteCount);
    },
    
    /**
     * Show voting results
     * @param {Object} voteCount - Map of survivor names to vote counts
     */
    showVotingResults(voteCount) {
        // Hide voting panel, show results
        const votingContainer = document.getElementById('voting-container');
        const resultsContainer = document.getElementById('vote-results');
        
        if (votingContainer) {
            votingContainer.classList.add('hidden');
        }
        
        if (resultsContainer) {
            resultsContainer.classList.remove('hidden');
        }
        
        // Show vote count
        const votesContainer = document.getElementById('votes-container');
        if (votesContainer) {
            clearChildren(votesContainer);
            
            Object.entries(voteCount).forEach(([name, count]) => {
                const voteEntry = createElement('div', {
                    className: 'vote-entry',
                    textContent: `${name}: ${count} vote(s)`
                });
                
                votesContainer.appendChild(voteEntry);
            });
        }
        
        // Show elimination text
        const eliminationText = document.getElementById('elimination-text');
        if (eliminationText) {
            const eliminatedSurvivor = gameManager.tribalCouncilSystem.getEliminatedSurvivor();
            
            if (eliminatedSurvivor) {
                eliminationText.textContent = `${eliminatedSurvivor.name} has been voted off Survivor Island!`;
            } else {
                eliminationText.textContent = "No one was eliminated due to a special circumstance.";
            }
        }
        
        // Set up continue button
        const continueButton = document.getElementById('continue-after-vote-button');
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                this.continueAfterVote();
            });
        }
    },
    
    /**
     * Continue after vote
     */
    continueAfterVote() {
        gameManager.tribalCouncilSystem.processElimination();
    }
};