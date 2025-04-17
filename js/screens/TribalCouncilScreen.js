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
        
        // Initially hide the idol play button - we'll show it at the correct time
        const playIdolButton = document.getElementById('play-idol-button');
        if (playIdolButton) {
            playIdolButton.classList.add('hidden');
            playIdolButton.addEventListener('click', () => {
                this.playIdol();
            });
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
            
            // Show message with dramatic announcement
            gameManager.dialogueSystem.showDialogue(
                "Jeff Probst: \"This IS a Hidden Immunity Idol! Any votes cast against you will not count, and the person with the next highest number of votes will go home.\"",
                ["Continue"], 
                () => {
                    const titleText = document.getElementById('tribal-instruction');
                    if (titleText) {
                        titleText.textContent = "You played a Hidden Immunity Idol! Any votes against you will not count.";
                    }
                    gameManager.dialogueSystem.hideDialogue();
                }
            );
        }
    },
    
    /**
     * Cast vote
     */
    castVote() {
        // Disable button to prevent multiple clicks
        const castVoteButton = document.getElementById('cast-vote-button');
        if (castVoteButton) {
            castVoteButton.disabled = true;
            castVoteButton.textContent = "Casting Vote...";
        }
        
        // Check if this is a revote
        const isRevote = document.getElementById('tribal-instruction')?.textContent.includes('REVOTE');
        
        // Cast votes
        gameManager.tribalCouncilSystem.castVote();
        
        if (isRevote) {
            // For revote, skip idol play opportunity and go directly to counting
            this.completeRevote();
            return;
        }
        
        // First announce "I'll go tally the votes" for regular votes
        gameManager.dialogueSystem.showDialogue(
            "Jeff Probst: \"I'll go tally the votes.\"",
            ["Continue"],
            () => {
                gameManager.dialogueSystem.hideDialogue();
                
                // After votes are cast but before they're read, offer to play an idol
                gameManager.dialogueSystem.showDialogue(
                    "Jeff Probst: \"If anybody has a Hidden Immunity Idol and wants to play it, now would be the time to do so.\"",
                    ["Continue"],
                    () => {
                        gameManager.dialogueSystem.hideDialogue();
                        
                        // Show idol result display if applicable
                        if (gameManager.tribalCouncilSystem.idolPlayed) {
                            // The idol was already played earlier - this is handled in the playIdol method
                            this.continueWithVoteCounting();
                        } else {
                            // Give the chance to play an idol
                            const player = gameManager.getPlayerSurvivor();
                            if (player.hasIdol) {
                                gameManager.dialogueSystem.showDialogue(
                                    "Would you like to play your Hidden Immunity Idol?",
                                    ["Yes, play my idol", "No, save it for later"],
                                    (choice) => {
                                        gameManager.dialogueSystem.hideDialogue();
                                        
                                        if (choice === 0) {
                                            // Player decides to play idol
                                            this.playIdol();
                                            setTimeout(() => this.continueWithVoteCounting(), 1500);
                                        } else {
                                            // Continue with vote count
                                            this.continueWithVoteCounting();
                                        }
                                    }
                                );
                            } else {
                                // No idol to play, continue with vote count
                                this.continueWithVoteCounting();
                            }
                        }
                    }
                );
            }
        );
    },
    
    /**
     * Continue with vote counting after idol play opportunity
     */
    continueWithVoteCounting() {
        // Run vote counting
        const voteResults = gameManager.tribalCouncilSystem.countVotes();
        
        // Check if there's a tie
        if (voteResults.isTied) {
            // Handle tie vote
            this.handleTieVote(voteResults);
        } else {
            // Show regular vote results
            this.showVotingResults(voteResults.voteCount);
        }
    },
    
    /**
     * Handle a tie vote situation
     * @param {Object} tieResults - The tie vote results
     */
    handleTieVote(tieResults) {
        // Store the tied players in the tribal council system for reference
        gameManager.tribalCouncilSystem.tiedPlayers = tieResults.tiedPlayers;
        
        // Announce the tie
        gameManager.dialogueSystem.showDialogue(
            `Jeff: "We have a tie between ${tieResults.tiedPlayers.join(" and ")}. According to the rules, we'll have a revote. Only these tied players can be voted for, and they cannot vote."`,
            ["Proceed to Revote"],
            () => {
                gameManager.dialogueSystem.hideDialogue();
                
                // Update UI for revote
                const titleText = document.getElementById('tribal-instruction');
                if (titleText) {
                    titleText.textContent = "REVOTE: Select one of the tied players to eliminate";
                }
                
                // Clear previous vote selection
                gameManager.tribalCouncilSystem.selectedVoteTarget = null;
                
                // Reconstruct voting grid with only tied players
                this.createTieVoteGrid(tieResults.tiedPlayers);
                
                // Disable cast vote button until selection is made
                const castVoteButton = document.getElementById('cast-vote-button');
                if (castVoteButton) {
                    castVoteButton.disabled = true;
                }
            }
        );
    },
    
    /**
     * Create a voting grid for a tie vote situation
     * @param {Array} tiedPlayers - Names of players who tied
     */
    createTieVoteGrid(tiedPlayers) {
        const votingGrid = document.getElementById('voting-grid');
        if (!votingGrid) return;
        
        // Clear grid
        clearChildren(votingGrid);
        
        // Get tribe
        const tribe = gameManager.getPlayerTribe();
        
        // Create cards only for tied players
        tribe.members.forEach(survivor => {
            // Skip the player (can't vote for self) and non-tied players
            if (survivor.isPlayer || !tiedPlayers.includes(survivor.name)) return;
            
            const card = createElement('div', { 
                className: 'vote-card',
                onClick: () => this.selectRevoteTarget(survivor)
            });
            
            const portrait = createElement('div', { className: 'vote-portrait' });
            
            const name = createElement('div', { 
                className: 'vote-name',
                textContent: survivor.name + " (Tied)"
            });
            
            card.appendChild(portrait);
            card.appendChild(name);
            votingGrid.appendChild(card);
        });
    },
    
    /**
     * Select a target in a revote
     * @param {Object} survivor - The survivor to vote for
     */
    selectRevoteTarget(survivor) {
        this.selectVoteTarget(survivor); // Reuse the existing selection logic
    },
    
    /**
     * Complete the revote process
     */
    completeRevote() {
        // Handle the revote in the system
        const revoteResults = gameManager.tribalCouncilSystem.handleTieVote(
            gameManager.tribalCouncilSystem.tiedPlayers
        );
        
        // Check if still tied
        if (revoteResults.stillTied) {
            // Go to rock draw
            this.handleRockDraw(revoteResults.tiedPlayers);
        } else {
            // Show revote results
            this.showVotingResults(revoteResults.revoteCount);
        }
    },
    
    /**
     * Handle a rock draw situation when revote is still tied
     * @param {Array} tiedPlayers - Players still tied after revote
     */
    handleRockDraw(tiedPlayers) {
        gameManager.dialogueSystem.showDialogue(
            `We still have a tie after the revote. According to Survivor rules, the tied players (${tiedPlayers.join(" and ")}) are now safe. Everyone else will draw rocks, and whoever gets the white rock will be eliminated.`,
            ["Draw Rocks"],
            () => {
                gameManager.dialogueSystem.hideDialogue();
                
                // Perform rock draw
                const eliminatedByRocks = gameManager.tribalCouncilSystem.drawRocks(tiedPlayers);
                
                // Show rock draw results
                gameManager.dialogueSystem.showDialogue(
                    `${eliminatedByRocks.name} has drawn the white rock and will be eliminated from the game.`,
                    ["Continue"],
                    () => {
                        gameManager.dialogueSystem.hideDialogue();
                        
                        // Show elimination in tribal council results
                        const eliminationText = document.getElementById('elimination-text');
                        if (eliminationText) {
                            eliminationText.textContent = `${eliminatedByRocks.name} has been eliminated by drawing the white rock!`;
                        }
                        
                        // Show continue button
                        const continueButton = document.getElementById('continue-after-vote-button');
                        if (continueButton) {
                            continueButton.style.display = 'block';
                            continueButton.addEventListener('click', () => {
                                this.continueAfterVote();
                            });
                        }
                        
                        // Hide voting panel, show results
                        const votingContainer = document.getElementById('voting-container');
                        const resultsContainer = document.getElementById('vote-results');
                        
                        if (votingContainer) {
                            votingContainer.classList.add('hidden');
                        }
                        
                        if (resultsContainer) {
                            resultsContainer.classList.remove('hidden');
                        }
                    }
                );
            }
        );
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
        
        // Set up for vote reveal
        const votesContainer = document.getElementById('votes-container');
        if (votesContainer) {
            clearChildren(votesContainer);
            
            // Prepare for one-by-one reveal
            this.revealVotes(gameManager.tribalCouncilSystem.getVotes(), votesContainer, voteCount);
        }
    },
    
    /**
     * Reveal votes one by one
     * @param {Object} votes - Map of voters to their targets
     * @param {HTMLElement} container - The container for vote entries
     * @param {Object} voteCount - Final vote counts by name
     */
    revealVotes(votes, container, voteCount) {
        // Idol play opportunities are now handled during the castVote method,
        // so we can immediately proceed with starting the vote reveal here
        gameManager.dialogueSystem.showDialogue(
            "Jeff Probst: \"I'll read the votes.\"",
            ["Continue"],
            () => {
                gameManager.dialogueSystem.hideDialogue();
                this.startVoteReveal(votes, container, voteCount);
            }
        );
    },
    
    /**
     * Start revealing votes one by one
     * @param {Object} votes - Map of voters to their targets
     * @param {HTMLElement} container - The container for vote entries
     * @param {Object} voteCount - Final vote counts by name
     */
    startVoteReveal(votes, container, voteCount) {
        const entries = Object.entries(votes);
        let index = 0;
        
        // Keep track of running vote count
        const runningVoteCount = {};
        
        // Create initial counters
        Object.keys(voteCount).forEach(name => {
            runningVoteCount[name] = 0;
        });
        
        // Reveal votes one by one
        const revealNextVote = () => {
            if (index < entries.length) {
                const [voter, target] = entries[index];
                
                // Skip votes negated by idols
                const targetHasPlayedIdol = gameManager.tribalCouncilSystem.immunePlayers.some(
                    p => p.name === target.name && gameManager.tribalCouncilSystem.idolPlayed
                );
                
                // Create vote entry
                const voteEntry = createElement('div', {
                    className: 'vote-entry',
                    textContent: targetHasPlayedIdol 
                        ? `${voter} voted for ${target.name} (NEGATED BY IDOL)`
                        : `${voter} voted for ${target.name}`
                });
                
                // Add to container with animation
                container.appendChild(voteEntry);
                
                // Update running count
                if (!targetHasPlayedIdol && runningVoteCount.hasOwnProperty(target.name)) {
                    runningVoteCount[target.name]++;
                }
                
                // Reveal next vote after delay
                index++;
                setTimeout(revealNextVote, 1500);
            } else {
                // All votes revealed, show final count
                const tallyHeader = createElement('h3', {
                    textContent: "Final Vote Tally",
                    style: "margin-top: 20px;"
                });
                container.appendChild(tallyHeader);
                
                Object.entries(voteCount).forEach(([name, count]) => {
                    const summaryEntry = createElement('div', {
                        className: 'vote-entry',
                        textContent: `${name}: ${count} vote(s)`
                    });
                    container.appendChild(summaryEntry);
                });
                
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
                
                // Show continue button
                const continueButton = document.getElementById('continue-after-vote-button');
                if (continueButton) {
                    continueButton.style.display = 'block';
                    continueButton.addEventListener('click', () => {
                        this.continueAfterVote();
                    });
                }
            }
        };
        
        // Start reveal
        revealNextVote();
    },
    
    /**
     * Continue after vote
     */
    continueAfterVote() {
        gameManager.tribalCouncilSystem.processElimination();
    }
};