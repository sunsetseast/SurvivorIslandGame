// Character Selection Screen
window.CharacterSelectionScreen = {
    /**
     * Set up character selection screen
     */
    setup() {
        this.createSurvivorGrid();
        this.hideDetails();
        
        // Set up back button
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.hideDetails();
            });
        }
        
        // Set up select button
        const selectButton = document.getElementById('select-survivor-button');
        if (selectButton) {
            selectButton.addEventListener('click', () => {
                this.selectSurvivor();
            });
        }
    },
    
    /**
     * Create survivor grid
     */
    createSurvivorGrid() {
        const survivorGrid = document.getElementById('survivor-grid');
        if (!survivorGrid) return;
        
        // Clear grid
        clearChildren(survivorGrid);
        
        // Create survivor cards
        survivorDatabase.survivors.forEach(survivor => {
            const card = createElement('div', { 
                className: 'survivor-card',
                onClick: () => this.showSurvivorDetails(survivor)
            });
            
            const portrait = createElement('div', { className: 'survivor-portrait' });
            
            const name = createElement('div', { 
                className: 'survivor-name',
                textContent: survivor.name
            });
            
            card.appendChild(portrait);
            card.appendChild(name);
            survivorGrid.appendChild(card);
        });
    },
    
    /**
     * Show survivor details
     * @param {Object} survivor - The survivor to show details for
     */
    showSurvivorDetails(survivor) {
        this.selectedSurvivor = survivor;
        
        const detailsPanel = document.getElementById('survivor-details');
        if (detailsPanel) {
            detailsPanel.classList.remove('hidden');
        }
        
        // Set name
        const nameElement = document.getElementById('survivor-name');
        if (nameElement) {
            nameElement.textContent = survivor.name;
        }
        
        // Set description
        const descriptionElement = document.getElementById('survivor-description');
        if (descriptionElement) {
            descriptionElement.textContent = survivor.description;
        }
        
        // Set stats
        this.updateStatBar('physical', survivor.physicalStat);
        this.updateStatBar('mental', survivor.mentalStat);
        this.updateStatBar('personality', survivor.personalityStat);
    },
    
    /**
     * Update a stat bar
     * @param {string} statName - The name of the stat
     * @param {number} value - The stat value
     */
    updateStatBar(statName, value) {
        const bar = document.getElementById(`${statName}-bar`);
        const valueElement = document.getElementById(`${statName}-value`);
        
        if (bar) {
            bar.style.width = formatProgressWidth(value, 100);
        }
        
        if (valueElement) {
            valueElement.textContent = value;
        }
    },
    
    /**
     * Hide details panel
     */
    hideDetails() {
        const detailsPanel = document.getElementById('survivor-details');
        if (detailsPanel) {
            detailsPanel.classList.add('hidden');
        }
        
        this.selectedSurvivor = null;
    },
    
    /**
     * Select the current survivor
     */
    selectSurvivor() {
        if (!this.selectedSurvivor) return;
        
        // Send selected survivor to game manager
        gameManager.selectCharacter(this.selectedSurvivor);
    }
};