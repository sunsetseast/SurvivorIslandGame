/**
 * @module EnergySystem
 * Manages player energy for actions in the game
 */

import { getElement } from '../utils/DOMUtils.js';
import { TimerManager } from '../utils/index.js';
import eventManager, { GameEvents } from '../core/EventManager.js';

class EnergySystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.maxEnergy = 5;
    this.currentEnergy = this.maxEnergy;
    this.energyRegenInterval = null;
    this.energyRegenTimeMinutes = 3; // Minutes per energy point
    this.energyElements = {
      container: null,
      points: [],
      timer: null
    };
    this.lastRegenTime = Date.now();
  }
  
  /**
   * Initialize the energy system
   */
  initialize() {
    console.log('Initializing EnergySystem');
    this.resetEnergy();
    this._setupEnergyUI();
    this._startEnergyRegen();
    
    // Setup event listeners
    eventManager.subscribe(GameEvents.DAY_ADVANCED, this._handleDayAdvanced.bind(this));
  }
  
  /**
   * Set up energy UI elements
   * @private
   */
  _setupEnergyUI() {
    // Get energy container element
    this.energyElements.container = getElement('energy-container');
    
    if (!this.energyElements.container) {
      console.error('Energy container element not found');
      return;
    }
    
    // Clear existing energy points
    this.energyElements.container.innerHTML = '';
    this.energyElements.points = [];
    
    // Create energy points
    for (let i = 0; i < this.maxEnergy; i++) {
      const energyPoint = document.createElement('div');
      energyPoint.className = 'energy-point';
      energyPoint.style.backgroundColor = i < this.currentEnergy ? '#f9a825' : '#555';
      
      this.energyElements.container.appendChild(energyPoint);
      this.energyElements.points.push(energyPoint);
    }
    
    // Create energy timer element
    this.energyElements.timer = document.createElement('div');
    this.energyElements.timer.className = 'energy-timer';
    this.energyElements.timer.style.fontSize = '0.8rem';
    this.energyElements.timer.style.marginTop = '5px';
    this.energyElements.timer.style.textAlign = 'center';
    
    this.energyElements.container.appendChild(this.energyElements.timer);
    
    // Update energy display
    this._updateEnergyDisplay();
  }
  
  /**
   * Start energy regeneration timer
   * @private
   */
  _startEnergyRegen() {
    // Clear existing interval
    if (this.energyRegenInterval) {
      TimerManager.clearInterval(this.energyRegenInterval);
    }
    
    // Store regeneration start time
    this.lastRegenTime = Date.now();
    
    // Set interval to update timer display every second
    this.energyRegenInterval = TimerManager.setInterval(() => {
      if (this.currentEnergy < this.maxEnergy) {
        const elapsed = Date.now() - this.lastRegenTime;
        const timePerPoint = this.energyRegenTimeMinutes * 60 * 1000; // Convert minutes to ms
        
        // Check if it's time to regenerate a point
        if (elapsed >= timePerPoint) {
          // Add energy point
          this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + 1);
          
          // Reset timer for next point
          this.lastRegenTime = Date.now();
          
          // Update display
          this._updateEnergyDisplay();
          
          // Publish energy changed event
          eventManager.publish(GameEvents.PLAYER_ENERGY_CHANGED, {
            energy: this.currentEnergy,
            maxEnergy: this.maxEnergy
          });
          
          // If max energy reached, no need to show timer
          if (this.currentEnergy >= this.maxEnergy) {
            this._updateTimerDisplay('');
          }
        } else {
          // Update timer display
          const remainingMs = timePerPoint - elapsed;
          const minutes = Math.floor(remainingMs / (60 * 1000));
          const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
          
          this._updateTimerDisplay(`Next in: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      } else {
        // Full energy, no need to show timer
        this._updateTimerDisplay('');
      }
    }, 1000, 'energyRegen');
  }
  
  /**
   * Update energy display based on current energy
   * @private
   */
  _updateEnergyDisplay() {
    if (!this.energyElements.container) {
      return;
    }
    
    // Update energy points
    for (let i = 0; i < this.energyElements.points.length; i++) {
      this.energyElements.points[i].style.backgroundColor = i < this.currentEnergy ? '#f9a825' : '#555';
    }
    
    // Update tribe info display if present
    const dayInfo = getElement('day-info');
    if (dayInfo) {
      const energyInfo = getElement('energy-info');
      if (energyInfo) {
        energyInfo.textContent = `Energy: ${this.currentEnergy}/${this.maxEnergy}`;
      }
    }
  }
  
  /**
   * Update timer display
   * @param {string} text - Text to display
   * @private
   */
  _updateTimerDisplay(text) {
    if (this.energyElements.timer) {
      this.energyElements.timer.textContent = text;
    }
  }
  
  /**
   * Handle day advanced event
   * @private
   */
  _handleDayAdvanced() {
    // Reset energy when day advances
    this.resetEnergy();
  }
  
  /**
   * Get current energy level
   * @returns {number} Current energy level
   */
  getCurrentEnergy() {
    return this.currentEnergy;
  }
  
  /**
   * Get maximum energy level
   * @returns {number} Maximum energy level
   */
  getMaxEnergy() {
    return this.maxEnergy;
  }
  
  /**
   * Use energy for an action
   * @param {number} amount - Amount of energy to use
   * @returns {boolean} Whether energy was used successfully
   */
  useEnergy(amount) {
    // Check if player has enough energy
    if (this.currentEnergy < amount) {
      console.log(`Not enough energy. Current: ${this.currentEnergy}, Required: ${amount}`);
      return false;
    }
    
    // Use energy
    this.currentEnergy -= amount;
    
    // Reset regeneration timer
    this.lastRegenTime = Date.now();
    
    // Update display
    this._updateEnergyDisplay();
    
    // Publish energy changed event
    eventManager.publish(GameEvents.PLAYER_ENERGY_CHANGED, {
      energy: this.currentEnergy,
      maxEnergy: this.maxEnergy
    });
    
    console.log(`Used ${amount} energy. Remaining: ${this.currentEnergy}`);
    return true;
  }
  
  /**
   * Add energy to the player
   * @param {number} amount - Amount of energy to add
   */
  addEnergy(amount) {
    this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + amount);
    
    // Update display
    this._updateEnergyDisplay();
    
    // Publish energy changed event
    eventManager.publish(GameEvents.PLAYER_ENERGY_CHANGED, {
      energy: this.currentEnergy,
      maxEnergy: this.maxEnergy
    });
    
    console.log(`Added ${amount} energy. Current: ${this.currentEnergy}`);
  }
  
  /**
   * Reset energy to maximum
   */
  resetEnergy() {
    this.currentEnergy = this.maxEnergy;
    
    // Update display
    this._updateEnergyDisplay();
    
    // Reset regeneration timer
    this.lastRegenTime = Date.now();
    
    // Update timer display (hide it since energy is full)
    this._updateTimerDisplay('');
    
    // Publish energy changed event
    eventManager.publish(GameEvents.PLAYER_ENERGY_CHANGED, {
      energy: this.currentEnergy,
      maxEnergy: this.maxEnergy
    });
    
    console.log(`Energy reset to maximum: ${this.maxEnergy}`);
  }
  
  /**
   * Set energy to a specific value
   * @param {number} value - The value to set energy to
   */
  setEnergy(value) {
    this.currentEnergy = Math.min(this.maxEnergy, Math.max(0, value));
    
    // Update display
    this._updateEnergyDisplay();
    
    // Reset regeneration timer
    this.lastRegenTime = Date.now();
    
    // Publish energy changed event
    eventManager.publish(GameEvents.PLAYER_ENERGY_CHANGED, {
      energy: this.currentEnergy,
      maxEnergy: this.maxEnergy
    });
    
    console.log(`Energy set to: ${this.currentEnergy}`);
  }
}

export default EnergySystem;