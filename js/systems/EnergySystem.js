// Energy System
class EnergySystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.currentEnergy = 3;
        this.maxEnergy = 3;
        this.lastRechargeTime = Date.now();
        this.rechargeInterval = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    }
    
    /**
     * Initialize the energy system
     */
    initialize() {
        this.currentEnergy = this.maxEnergy;
        this.lastRechargeTime = Date.now();
        this.loadEnergyState();
        this.updateEnergyDisplay();
    }
    
    /**
     * Use energy for an activity
     * @param {number} amount - The amount of energy to use
     * @returns {boolean} True if energy was successfully used
     */
    useEnergy(amount = 1) {
        // Check for natural recharge
        this.checkEnergyRecharge();
        
        if (this.currentEnergy < amount) {
            return false;
        }
        
        // Show energy deduction animation/notification
        this.showEnergyChangeNotification(-amount);
        
        this.currentEnergy -= amount;
        this.saveEnergyState();
        this.updateEnergyDisplay();
        return true;
    }
    
    /**
     * Show a visual notification of energy change
     * @param {number} changeAmount - Amount of energy changed (positive or negative)
     */
    showEnergyChangeNotification(changeAmount) {
        // Get energy display element
        const energyDisplay = document.querySelector('.energy-display');
        if (!energyDisplay) return;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'energy-notification';
        notification.textContent = changeAmount > 0 ? `+${changeAmount}` : `${changeAmount}`;
        notification.style.color = changeAmount > 0 ? '#4CAF50' : '#F44336';
        notification.style.position = 'absolute';
        notification.style.fontSize = '18px';
        notification.style.fontWeight = 'bold';
        notification.style.left = '50%';
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
        notification.style.transition = 'transform 1s, opacity 1s';
        
        // Add to DOM
        energyDisplay.style.position = 'relative';
        energyDisplay.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.style.transform = 'translateY(-30px)';
            notification.style.opacity = '0';
        }, 50);
        
        // Remove after animation
        setTimeout(() => {
            notification.remove();
        }, 1200);
    }
    
    /**
     * Refill energy to maximum
     */
    refillEnergy() {
        this.currentEnergy = this.maxEnergy;
        this.lastRechargeTime = Date.now();
        this.saveEnergyState();
        this.updateEnergyDisplay();
    }
    
    /**
     * Add energy
     * @param {number} amount - The amount of energy to add
     */
    addEnergy(amount = 1) {
        // Show energy addition notification
        this.showEnergyChangeNotification(+amount);
        
        this.currentEnergy = Math.min(this.currentEnergy + amount, this.maxEnergy);
        this.saveEnergyState();
        this.updateEnergyDisplay();
    }
    
    /**
     * Get current energy amount
     * @returns {number} The current energy
     */
    getCurrentEnergy() {
        this.checkEnergyRecharge();
        return this.currentEnergy;
    }
    
    /**
     * Get maximum energy amount
     * @returns {number} The maximum energy
     */
    getMaxEnergy() {
        return this.maxEnergy;
    }
    
    /**
     * Check if energy has recharged naturally over time
     */
    checkEnergyRecharge() {
        if (this.currentEnergy >= this.maxEnergy) {
            this.lastRechargeTime = Date.now();
            return;
        }
        
        const now = Date.now();
        const timeSinceRecharge = now - this.lastRechargeTime;
        const energyToAdd = Math.floor(timeSinceRecharge / this.rechargeInterval);
        
        if (energyToAdd > 0) {
            this.currentEnergy = Math.min(this.currentEnergy + energyToAdd, this.maxEnergy);
            this.lastRechargeTime = now - (timeSinceRecharge % this.rechargeInterval);
            this.saveEnergyState();
            this.updateEnergyDisplay();
        }
    }
    
    /**
     * Get time until next energy point
     * @returns {string} Time until next energy in HH:MM:SS format
     */
    getTimeUntilNextEnergy() {
        if (this.currentEnergy >= this.maxEnergy) {
            return "Full";
        }
        
        const now = Date.now();
        const timeSinceRecharge = now - this.lastRechargeTime;
        const timeRemaining = this.rechargeInterval - timeSinceRecharge;
        
        if (timeRemaining <= 0) {
            this.checkEnergyRecharge();
            return this.getTimeUntilNextEnergy();
        }
        
        // Convert to hours, minutes, seconds
        const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
        const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Update the energy display in the UI
     */
    updateEnergyDisplay() {
        // Update camp screen displays
        const energyValueDisplay = document.getElementById('energy-value');
        const maxEnergyDisplay = document.getElementById('max-energy');
        
        if (energyValueDisplay) {
            energyValueDisplay.textContent = this.currentEnergy;
        }
        
        if (maxEnergyDisplay) {
            maxEnergyDisplay.textContent = this.maxEnergy;
        }
        
        // Update HUD displays (if any)
        const energyCountDisplay = document.getElementById('energy-count');
        const energyBarFill = document.getElementById('energy-bar-fill');
        const energyTimeDisplay = document.getElementById('energy-time');
        
        if (energyCountDisplay) {
            energyCountDisplay.textContent = `${this.currentEnergy}/${this.maxEnergy}`;
        }
        
        if (energyBarFill) {
            energyBarFill.style.width = formatProgressWidth(this.currentEnergy, this.maxEnergy);
        }
        
        if (energyTimeDisplay) {
            energyTimeDisplay.textContent = this.getTimeUntilNextEnergy();
        }
        
        // Also update enable/disable state of action buttons based on energy
        const actionButtons = document.querySelectorAll('.action-button');
        if (actionButtons.length > 0) {
            actionButtons.forEach(button => {
                // Extract energy cost from button text
                const match = button.textContent.match(/\((\d+) Energy\)/);
                if (match) {
                    const cost = parseInt(match[1]);
                    button.disabled = this.currentEnergy < cost;
                }
            });
        }
    }
    
    /**
     * Save energy state to localStorage
     */
    saveEnergyState() {
        const energyState = {
            currentEnergy: this.currentEnergy,
            lastRechargeTime: this.lastRechargeTime
        };
        
        localStorage.setItem('survivorIslandEnergy', JSON.stringify(energyState));
    }
    
    /**
     * Load energy state from localStorage
     */
    loadEnergyState() {
        const savedState = localStorage.getItem('survivorIslandEnergy');
        
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                this.currentEnergy = parsedState.currentEnergy || this.maxEnergy;
                this.lastRechargeTime = parsedState.lastRechargeTime || Date.now();
                
                // Check for recharge
                this.checkEnergyRecharge();
            } catch (e) {
                console.error('Error loading energy state:', e);
                // Reset to default
                this.currentEnergy = this.maxEnergy;
                this.lastRechargeTime = Date.now();
            }
        }
    }
}