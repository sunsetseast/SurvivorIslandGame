// Dialogue System
class DialogueSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.dialogueContainer = document.getElementById('dialogue-container');
        this.dialogueText = document.getElementById('dialogue-text');
        this.dialogueChoices = document.getElementById('dialogue-choices');
        this.speakerName = document.getElementById('speaker-name');
        this.speakerPortrait = document.querySelector('.speaker-portrait');
        
        this.onChoiceSelected = null;
        this.typewriterInterval = null;
        this.fullDialogueText = '';
        this.useTypewriterEffect = true;
        this.typewriterSpeed = 50; // ms per character
    }
    
    /**
     * Show dialogue with choices
     * @param {string} text - The dialogue text
     * @param {Array} choices - Array of choice texts
     * @param {Function} onChoiceSelected - Callback when choice is selected
     */
    showDialogue(text, choices, onChoiceSelected) {
        this.fullDialogueText = text;
        this.onChoiceSelected = onChoiceSelected;
        
        // Show the dialogue container
        if (this.dialogueContainer) {
            this.dialogueContainer.classList.remove('hidden');
        }
        
        // Hide choices initially while text is typing
        if (this.dialogueChoices) {
            clearChildren(this.dialogueChoices);
        }
        
        // Set dialogue text
        if (this.dialogueText) {
            if (this.useTypewriterEffect) {
                this.startTypewriterEffect(text, choices);
            } else {
                this.dialogueText.textContent = text;
                this.createChoiceButtons(choices);
            }
        }
    }
    
    /**
     * Show dialogue with a speaker
     * @param {string} text - The dialogue text
     * @param {Array} choices - Array of choice texts
     * @param {Function} onChoiceSelected - Callback when choice is selected
     * @param {string} speakerName - Name of the speaker
     * @param {string} portraitUrl - URL to speaker portrait
     */
    showDialogueWithSpeaker(text, choices, onChoiceSelected, speakerName, portraitUrl) {
        // Set speaker name
        if (this.speakerName) {
            this.speakerName.textContent = speakerName;
        }
        
        // Set portrait if available
        if (this.speakerPortrait) {
            if (portraitUrl) {
                this.speakerPortrait.style.backgroundImage = `url(${portraitUrl})`;
                this.speakerPortrait.style.display = 'block';
            } else {
                this.speakerPortrait.style.display = 'none';
            }
        }
        
        // Show regular dialogue
        this.showDialogue(text, choices, onChoiceSelected);
    }
    
    /**
     * Start typewriter effect for gradual text reveal
     * @param {string} text - The text to type
     * @param {Array} choices - The choices to show after text is typed
     */
    startTypewriterEffect(text, choices) {
        // Clear any existing typewriter interval
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }
        
        let index = 0;
        this.dialogueText.textContent = '';
        
        // Start typing
        this.typewriterInterval = setInterval(() => {
            if (index < text.length) {
                this.dialogueText.textContent += text.charAt(index);
                index++;
            } else {
                // Text is complete, show choices
                clearInterval(this.typewriterInterval);
                this.typewriterInterval = null;
                this.createChoiceButtons(choices);
            }
        }, this.typewriterSpeed);
        
        // Add click listener to skip typing
        this.dialogueContainer.onclick = (e) => {
            // Only if we clicked the dialogue container itself, not a choice
            if (e.target === this.dialogueContainer || e.target === this.dialogueText) {
                if (this.typewriterInterval) {
                    // Complete the text immediately
                    clearInterval(this.typewriterInterval);
                    this.typewriterInterval = null;
                    this.dialogueText.textContent = text;
                    this.createChoiceButtons(choices);
                }
            }
        };
    }
    
    /**
     * Create choice buttons
     * @param {Array} choices - Array of choice texts
     */
    createChoiceButtons(choices) {
        if (!this.dialogueChoices) return;
        
        // Clear existing choices
        clearChildren(this.dialogueChoices);
        
        // Create a button for each choice
        choices.forEach((choice, index) => {
            const button = createElement('div', {
                className: 'dialogue-choice',
                textContent: choice,
                onClick: () => this.onChoiceButtonClicked(index)
            });
            
            this.dialogueChoices.appendChild(button);
        });
    }
    
    /**
     * Handle choice button clicked
     * @param {number} choiceIndex - The index of the choice
     */
    onChoiceButtonClicked(choiceIndex) {
        if (this.onChoiceSelected) {
            this.onChoiceSelected(choiceIndex);
        }
    }
    
    /**
     * Hide the dialogue
     */
    hideDialogue() {
        if (this.dialogueContainer) {
            this.dialogueContainer.classList.add('hidden');
        }
        
        // Clear any typewriter effect
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
    }
    
    /**
     * Complete the text typing immediately
     */
    completeTyping() {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
            
            if (this.dialogueText) {
                this.dialogueText.textContent = this.fullDialogueText;
            }
        }
    }
}