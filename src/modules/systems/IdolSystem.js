/**
 * @module IdolSystem
 * Manages hidden immunity idols and their discovery mechanics
 */

import { getElement, createElement, clearChildren } from '../utils/DOMUtils.js';
import { getRandomItem } from '../utils/CommonUtils.js';
import eventManager, { GameEvents } from '../core/EventManager.js';

class IdolSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.idolsInPlay = 0;
    this.maxIdols = 2;
    this.idolLocationName = ""; // Beach, Jungle, Camp, Private Area
    this.idolHidingSpot = "";   // The specific hiding spot
    this.searchedSpots = new Set(); // Track searched spots as "locationName:hidingSpot" strings
  }
  
  /**
   * Initialize the idol system
   */
  initialize() {
    console.log('Initializing IdolSystem');
    this.idolsInPlay = 0;
    this.resetIdolLocations();
    
    // Setup event listeners
    eventManager.subscribe(GameEvents.IDOL_PLAYED, this._handleIdolPlayed.bind(this));
    eventManager.subscribe(GameEvents.TRIBES_MERGED, this._handleTribeseMerged.bind(this));
  }
  
  /**
   * Reset idol locations - called at game start and after an idol is played
   */
  resetIdolLocations() {
    // Clear searched spots
    this.searchedSpots.clear();
    
    // Generate a random location for the idol to be hidden
    const locations = ["Beach", "Jungle", "Camp", "Private Area"];
    const selectedLocation = getRandomItem(locations);
    
    // Get hiding spots for that location
    const hidingSpots = this.getLocationHidingSpots(selectedLocation);
    
    // Select one random hiding spot
    const selectedSpot = getRandomItem(hidingSpots);
    
    // Store the location and hiding spot separately as strings
    this.idolLocationName = selectedLocation;
    this.idolHidingSpot = selectedSpot;
    
    // Log information separately to avoid any issues with object stringification
    console.log("New idol hidden at - Location:", this.idolLocationName);
    console.log("New idol hidden at - Hiding spot:", this.idolHidingSpot);
    
    // Publish idol hidden event
    eventManager.publish(GameEvents.IDOL_HIDDEN, {
      location: this.idolLocationName,
      hidingSpot: this.idolHidingSpot
    });
  }
  
  /**
   * Show idol search interface
   */
  showIdolSearch() {
    console.log("showIdolSearch called - idolsInPlay:", this.idolsInPlay, "maxIdols:", this.maxIdols);
    console.log("Current idol is at:", this.idolLocationName, "in", this.idolHidingSpot);
    
    // Check if any idols are available to find
    if (this.idolsInPlay >= this.maxIdols) {
      // No idols left to find
      if (this.gameManager.systems.dialogueSystem) {
        this.gameManager.systems.dialogueSystem.showDialogue(
          "You search around but don't find any hidden immunity idols.",
          ["Continue"],
          () => this.gameManager.systems.dialogueSystem.hideDialogue()
        );
      } else {
        console.error("DialogueSystem not available");
      }
      return;
    }
    
    // Get current location from CampScreen
    const campScreenElement = getElement('camp-screen');
    if (!campScreenElement) {
      console.error("Cannot find camp screen element");
      return;
    }
    
    // Look for the data-location attribute on the selected location button
    const selectedLocationButton = campScreenElement.querySelector('.location-button.selected');
    if (!selectedLocationButton) {
      console.error("No location button selected");
      
      // Show error message to the user
      if (this.gameManager.systems.dialogueSystem) {
        this.gameManager.systems.dialogueSystem.showDialogue(
          "You need to select a location first before searching for an idol.",
          ["OK"],
          () => this.gameManager.systems.dialogueSystem.hideDialogue()
        );
      }
      return;
    }
    
    const locationName = selectedLocationButton.getAttribute('data-location');
    if (!locationName) {
      console.error("Selected location button has no data-location attribute");
      return;
    }
    
    console.log("Player selected location:", locationName);
    
    // Create modal dialog for idol hunting
    this._createIdolSearchModal(locationName);
  }
  
  /**
   * Create modal dialog for idol searching
   * @param {string} locationName - The selected location
   * @private
   */
  _createIdolSearchModal(locationName) {
    // Create modal overlay
    const modalOverlay = createElement('div', {
      className: 'modal-overlay',
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000'
      }
    });
    
    // Create modal content
    const modalContent = createElement('div', {
      className: 'modal-content',
      style: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '5px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80%',
        overflowY: 'auto'
      }
    });
    
    // Create modal header
    const modalHeader = createElement('h2', {
      style: {
        marginBottom: '20px',
        color: '#d9534f'
      }
    }, `Search for Hidden Immunity Idol at ${locationName}`);
    
    // Create modal description
    const modalDescription = createElement('p', {
      style: {
        marginBottom: '20px'
      }
    }, 'Choose a specific spot to search. Each search costs 2 energy, which will be consumed only when you select a spot.');
    
    // Create spot buttons container
    const spotButtonsContainer = createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }
    });
    
    // Get location-specific hiding spots
    const hidingSpots = this.getLocationHidingSpots(locationName);
    console.log("Available hiding spots for", locationName, ":", hidingSpots);
    
    // Create buttons for each hiding spot
    hidingSpots.forEach(spot => {
      const button = createElement('button', {
        className: 'search-spot-button',
        textContent: `Search ${spot}`,
        style: {
          padding: '10px',
          backgroundColor: '#5cb85c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          margin: '5px 0',
          cursor: 'pointer'
        },
        onclick: () => {
          // Remove the modal
          document.body.removeChild(modalOverlay);
          
          // Start the idol search
          this.startIdolSearch(spot);
        }
      });
      
      spotButtonsContainer.appendChild(button);
    });
    
    // Create cancel button
    const cancelButton = createElement('button', {
      textContent: 'Cancel',
      style: {
        backgroundColor: '#d9534f',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '10px',
        marginTop: '20px',
        cursor: 'pointer',
        width: '100%'
      },
      onclick: () => {
        document.body.removeChild(modalOverlay);
      }
    });
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalDescription);
    modalContent.appendChild(spotButtonsContainer);
    modalContent.appendChild(cancelButton);
    modalOverlay.appendChild(modalContent);
    
    // Add to document
    document.body.appendChild(modalOverlay);
  }
  
  /**
   * Start idol search minigame
   * @param {string} hidingSpot - The specific hiding spot being searched
   */
  startIdolSearch(hidingSpot) {
    // Get current location from CampScreen
    const campScreenElement = getElement('camp-screen');
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
    
    console.log("Searching for idol at", locationName, "in", hidingSpot);
    console.log("Idol is actually at:", this.idolLocationName, "in", this.idolHidingSpot);
    
    // Check if this spot has been searched before
    const searchKey = `${locationName}:${hidingSpot}`;
    
    if (this.searchedSpots.has(searchKey)) {
      if (this.gameManager.systems.dialogueSystem) {
        this.gameManager.systems.dialogueSystem.showDialogue(
          `You've already searched ${hidingSpot} at this location. Try looking somewhere else.`,
          ["Continue"],
          () => this.gameManager.systems.dialogueSystem.hideDialogue()
        );
      }
      return;
    }
    
    // Check if player has enough energy first (2 energy cost)
    const energySystem = this.gameManager.systems.energySystem;
    if (energySystem && energySystem.getCurrentEnergy) {
      if (energySystem.getCurrentEnergy() < 2) {
        if (this.gameManager.systems.dialogueSystem) {
          this.gameManager.systems.dialogueSystem.showDialogue(
            "You don't have enough energy to search for an idol.",
            ["Continue"],
            () => this.gameManager.systems.dialogueSystem.hideDialogue()
          );
        }
        return;
      }
      
      // Consume energy only when a specific hiding spot is chosen
      // Cost of searching is 2 energy
      energySystem.useEnergy(2);
    } else {
      console.warn("EnergySystem not available or getCurrentEnergy method missing");
    }
    
    // Add to searched spots
    this.searchedSpots.add(searchKey);
    
    // Show searching animation/message
    if (this.gameManager.systems.dialogueSystem) {
      this.gameManager.systems.dialogueSystem.showDialogue(
        `You carefully search ${hidingSpot}...`,
        ["Continue searching..."],
        () => {
          // Check if this is where the idol is hidden
          const idolFound = this.idolLocationName === locationName && 
                           this.idolHidingSpot === hidingSpot;
          
          console.log("Idol found check - Result:", idolFound);
          console.log("Idol found check - Location match:", this.idolLocationName === locationName);
          console.log("Idol found check - Hiding spot match:", this.idolHidingSpot === hidingSpot);
          
          // Handle search result
          this._handleSearchResult(idolFound, locationName, hidingSpot);
        }
      );
    } else {
      // If dialogue system is not available, just proceed with search
      const idolFound = this.idolLocationName === locationName && 
                       this.idolHidingSpot === hidingSpot;
      this._handleSearchResult(idolFound, locationName, hidingSpot);
    }
  }
  
  /**
   * Handle the result of an idol search
   * @param {boolean} idolFound - Whether the idol was found
   * @param {string} locationName - The location that was searched
   * @param {string} hidingSpot - The hiding spot that was searched
   * @private
   */
  _handleSearchResult(idolFound, locationName, hidingSpot) {
    if (idolFound) {
      console.log("Found an idol! Giving to player.");
      this.givePlayerIdol();
      
      // Reset idol location for next time
      this.resetIdolLocations();
      
      // Publish idol found event
      eventManager.publish(GameEvents.IDOL_FOUND, {
        location: locationName,
        hidingSpot: hidingSpot
      });
    } else {
      // Check if all spots in this location have been searched
      const allSpotsInLocation = this.getLocationHidingSpots(locationName);
      const allSpotSearched = allSpotsInLocation.every(spot => 
        this.searchedSpots.has(`${locationName}:${spot}`)
      );
      
      // Show appropriate message based on search results
      if (allSpotSearched) {
        if (this.gameManager.systems.dialogueSystem) {
          this.gameManager.systems.dialogueSystem.showDialogue(
            `You've searched all possible hiding spots at ${locationName}. There are no idols here. Someone may have already found it or it's hidden elsewhere.`,
            ["Continue"],
            () => this.gameManager.systems.dialogueSystem.hideDialogue()
          );
        }
      } else {
        // Create different messages for different results
        const messages = [
          `You search thoroughly ${hidingSpot} but find nothing unusual.`,
          `After looking carefully ${hidingSpot}, you come up empty-handed.`,
          `You dig and search ${hidingSpot} but don't find any idols.`,
          `Unfortunately, there's no idol hidden ${hidingSpot}.`
        ];
        
        const selectedMessage = getRandomItem(messages);
        console.log("Didn't find idol. Message:", selectedMessage);
        
        if (this.gameManager.systems.dialogueSystem) {
          this.gameManager.systems.dialogueSystem.showDialogue(
            selectedMessage,
            ["Continue"],
            () => this.gameManager.systems.dialogueSystem.hideDialogue()
          );
        }
      }
      
      // Publish idol not found event
      eventManager.publish(GameEvents.IDOL_NOT_FOUND, {
        location: locationName,
        hidingSpot: hidingSpot
      });
    }
    
    // Check if all spots in all locations have been searched
    this._checkAllSpotsSearched();
  }
  
  /**
   * Check if all spots in all locations have been searched
   * @private
   */
  _checkAllSpotsSearched() {
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
    if (searchedSpots >= totalSpots && this.idolLocationName && this.idolHidingSpot) {
      // Reset idol locations as someone else must have found it
      if (this.gameManager.systems.dialogueSystem) {
        this.gameManager.systems.dialogueSystem.showDialogue(
          "You've searched everywhere but haven't found an idol. Someone else must have already found it.",
          ["Continue"],
          () => {
            this.gameManager.systems.dialogueSystem.hideDialogue();
            this.idolsInPlay++;  // Assume an NPC has it
            this.resetIdolLocations();
          }
        );
      } else {
        // If dialogue system is not available
        this.idolsInPlay++;  // Assume an NPC has it
        this.resetIdolLocations();
      }
    }
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
   * Give a hidden immunity idol to the player
   */
  givePlayerIdol() {
    const playerSurvivor = this.gameManager.getPlayerSurvivor();
    
    if (playerSurvivor) {
      playerSurvivor.hasIdol = true;
      this.idolsInPlay++;
      
      // Show message
      if (this.gameManager.systems.dialogueSystem) {
        this.gameManager.systems.dialogueSystem.showDialogue(
          "Congratulations! You've found a hidden immunity idol! You can play this idol at tribal council to protect yourself from being voted out.",
          ["Continue"],
          () => this.gameManager.systems.dialogueSystem.hideDialogue()
        );
      }
      
      // Update inventory display
      const idolStatus = getElement('idol-status');
      if (idolStatus) {
        idolStatus.textContent = 'Hidden Immunity Idol: Yes';
      }
      
      const idolsInPlay = getElement('idols-in-play');
      if (idolsInPlay) {
        idolsInPlay.textContent = `Idols in Play: ${this.idolsInPlay}`;
      }
      
      console.log("Gave idol to player. Total idols in play:", this.idolsInPlay);
      
      // Publish idol acquired event
      eventManager.publish(GameEvents.IDOL_ACQUIRED, {
        playerId: playerSurvivor.id,
        idolsInPlay: this.idolsInPlay
      });
    } else {
      console.error("Player survivor not found, can't give idol");
    }
  }
  
  /**
   * Get number of idols in play
   * @returns {number} Idols in play
   */
  getIdolsInPlay() {
    return this.idolsInPlay;
  }
  
  /**
   * Process NPC idol finds - chance of NPCs finding idols
   */
  processNPCIdolFinds() {
    // Only process if we have room for more idols
    if (this.idolsInPlay >= this.maxIdols) {
      return;
    }
    
    // Calculate higher chances of finding in later phases of the game
    let findChance = 0.05; // Base 5% chance
    
    if (this.gameManager.getGamePhase() === 'postMerge') {
      findChance = 0.10; // 10% chance after merge
    }
    
    // 15% chance in the final phase
    if (this.gameManager.getGamePhase() === 'final') {
      findChance = 0.15;
    }
    
    if (Math.random() < findChance) {
      // An NPC found an idol
      this.idolsInPlay++;
      
      // Reset idol location
      this.resetIdolLocations();
      
      console.log("An NPC found an idol. Total idols in play:", this.idolsInPlay);
      
      // Potentially notify the player, but don't reveal who found it
      if (this.gameManager.systems.dialogueSystem && Math.random() < 0.5) {
        this.gameManager.systems.dialogueSystem.showDialogue(
          "You notice one of the survivors acting suspiciously. They might have found a hidden immunity idol.",
          ["Continue"],
          () => this.gameManager.systems.dialogueSystem.hideDialogue()
        );
      }
      
      // Update idols in play display
      const idolsInPlay = getElement('idols-in-play');
      if (idolsInPlay) {
        idolsInPlay.textContent = `Idols in Play: ${this.idolsInPlay}`;
      }
      
      // Publish NPC idol found event
      eventManager.publish(GameEvents.NPC_IDOL_FOUND, {
        idolsInPlay: this.idolsInPlay
      });
    }
  }
  
  /**
   * Handle idol played event
   * @param {Object} data - Event data
   * @private
   */
  _handleIdolPlayed(data) {
    // Decrease idols in play
    if (this.idolsInPlay > 0) {
      this.idolsInPlay--;
    }
    
    // Hide a new idol
    this.resetIdolLocations();
    
    // Update idols in play display
    const idolsInPlay = getElement('idols-in-play');
    if (idolsInPlay) {
      idolsInPlay.textContent = `Idols in Play: ${this.idolsInPlay}`;
    }
    
    console.log("Idol played. Remaining idols in play:", this.idolsInPlay);
  }
  
  /**
   * Handle tribes merged event
   * @param {Object} data - Event data
   * @private
   */
  _handleTribeseMerged(data) {
    // Add another idol when tribes merge
    if (this.idolsInPlay < this.maxIdols) {
      this.resetIdolLocations();
      console.log("Tribes merged - new idol hidden");
    }
  }
}

export default IdolSystem;