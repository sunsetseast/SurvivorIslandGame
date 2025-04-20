/**
 * @module CharacterSelectionScreen
 * Screen for selecting a survivor character
 */

import { getElement, createElement, clearChildren } from '../utils/DOMUtils.js';
import { getRandomInt, shuffleArray } from '../utils/CommonUtils.js';
import { GameManager } from '../core/GameManager.js';
import eventManager, { GameEvents } from '../core/EventManager.js';

// Character attributes
const ATTRIBUTES = {
  PHYSICAL: 'physical',
  MENTAL: 'mental',
  SOCIAL: 'social'
};

// Character archetypes and default stats
const ARCHETYPES = {
  ATHLETE: { physical: 8, mental: 5, social: 6 },
  STRATEGIST: { physical: 4, mental: 9, social: 6 },
  SOCIAL_BUTTERFLY: { physical: 5, mental: 6, social: 8 },
  OUTDOORSMAN: { physical: 7, mental: 7, social: 5 },
  UNDERDOG: { physical: 6, mental: 6, social: 7 }
};

const CharacterSelectionScreen = {
  /**
   * Initialize the screen
   */
  initialize() {
    // Any one-time initialization code
    console.log('CharacterSelectionScreen initialized');
  },
  
  /**
   * Set up the screen when it's shown
   * @param {Object} data - Additional data passed to the screen
   */
  setup(data = {}) {
    const characterSelectionScreen = getElement('character-selection-screen');
    if (!characterSelectionScreen) {
      console.error('Character selection screen element not found');
      return;
    }
    
    // Clear the screen
    clearChildren(characterSelectionScreen);
    
    // Create screen title
    const title = createElement('h1', {
      className: 'screen-title',
      style: {
        fontSize: '2rem',
        color: '#fff',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }
    }, 'Select Your Survivor');
    
    // Create subtitle
    const subtitle = createElement('p', {
      className: 'screen-subtitle',
      style: {
        fontSize: '1.1rem',
        color: '#ddd',
        marginBottom: '2rem',
        textAlign: 'center'
      }
    }, 'Choose the survivor you want to play as in this adventure.');
    
    // Create character selection container
    const charactersContainer = createElement('div', {
      className: 'characters-container',
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '2rem'
      }
    });
    
    // Get survivors data from the global variable or create placeholder data
    const survivorsData = window.survivors || this._createPlaceholderSurvivors();
    
    // Create character cards
    survivorsData.forEach(survivor => {
      const card = this._createCharacterCard(survivor);
      charactersContainer.appendChild(card);
    });
    
    // Create randomize button
    const randomizeButton = createElement('button', {
      className: 'secondary-button',
      style: {
        marginBottom: '1.5rem'
      },
      onclick: () => {
        // Randomly select a character
        const randomIndex = getRandomInt(0, survivorsData.length - 1);
        const randomSurvivor = survivorsData[randomIndex];
        GameManager.selectCharacter(randomSurvivor);
      }
    }, 'Randomize Selection');
    
    // Create back button
    const backButton = createElement('button', {
      className: 'secondary-button',
      style: {
        marginRight: '1rem'
      },
      onclick: () => {
        if (window.showScreen) {
          window.showScreen('welcome-screen');
        } else if (GameManager.setGameState) {
          GameManager.setGameState('welcome');
        }
      }
    }, 'Back');
    
    // Create button container
    const buttonContainer = createElement('div', {
      className: 'button-container',
      style: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px'
      }
    });
    
    buttonContainer.appendChild(backButton);
    buttonContainer.appendChild(randomizeButton);
    
    // Add elements to the screen
    characterSelectionScreen.appendChild(title);
    characterSelectionScreen.appendChild(subtitle);
    characterSelectionScreen.appendChild(charactersContainer);
    characterSelectionScreen.appendChild(buttonContainer);
    
    // Publish screen setup event
    eventManager.publish(GameEvents.SCREEN_CHANGED, {
      screenId: 'characterSelection',
      data
    });
  },
  
  /**
   * Create a character card element
   * @param {Object} survivor - Survivor data
   * @returns {HTMLElement} Character card element
   * @private
   */
  _createCharacterCard(survivor) {
    const card = createElement('div', {
      className: 'character-card',
      style: {
        width: '180px',
        backgroundColor: 'rgba(30, 30, 30, 0.7)',
        borderRadius: '8px',
        padding: '15px',
        cursor: 'pointer',
        transition: 'transform 0.2s, background-color 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      },
      onmouseover: (e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.backgroundColor = 'rgba(40, 40, 40, 0.9)';
      },
      onmouseout: (e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
      },
      onclick: () => {
        GameManager.selectCharacter(survivor);
      }
    });
    
    // Create character avatar
    const avatar = createElement('div', {
      className: 'character-avatar',
      style: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#555',
        marginBottom: '15px',
        backgroundImage: survivor.avatarUrl ? `url(${survivor.avatarUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '3px solid #777'
      }
    });
    
    // Create character name
    const name = createElement('h3', {
      className: 'character-name',
      style: {
        margin: '0 0 10px 0',
        color: '#fff',
        fontSize: '1.2rem',
        textAlign: 'center'
      }
    }, survivor.name);
    
    // Create character archetype
    const archetype = createElement('div', {
      className: 'character-archetype',
      style: {
        color: '#ccc',
        fontSize: '0.9rem',
        marginBottom: '15px',
        textAlign: 'center'
      }
    }, survivor.archetype || this._getArchetypeFromStats(survivor));
    
    // Create stats container
    const statsContainer = createElement('div', {
      className: 'character-stats',
      style: {
        width: '100%'
      }
    });
    
    // Create physical stat
    const physicalStat = this._createStatBar('Physical', survivor.physical || 5);
    
    // Create mental stat
    const mentalStat = this._createStatBar('Mental', survivor.mental || 5);
    
    // Create personality stat
    const personalityStat = this._createStatBar('Social', survivor.personality || 5);
    
    // Add stats to container
    statsContainer.appendChild(physicalStat);
    statsContainer.appendChild(mentalStat);
    statsContainer.appendChild(personalityStat);
    
    // Add elements to card
    card.appendChild(avatar);
    card.appendChild(name);
    card.appendChild(archetype);
    card.appendChild(statsContainer);
    
    return card;
  },
  
  /**
   * Create a stat bar element
   * @param {string} label - Stat label
   * @param {number} value - Stat value
   * @returns {HTMLElement} Stat bar element
   * @private
   */
  _createStatBar(label, value) {
    const statContainer = createElement('div', {
      className: 'stat-container',
      style: {
        marginBottom: '8px'
      }
    });
    
    const statLabel = createElement('div', {
      className: 'stat-label',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '3px',
        fontSize: '0.8rem',
        color: '#ccc'
      }
    });
    
    statLabel.appendChild(createElement('span', {}, label));
    statLabel.appendChild(createElement('span', {}, value.toString()));
    
    const statBarContainer = createElement('div', {
      className: 'stat-bar-container',
      style: {
        width: '100%',
        height: '6px',
        backgroundColor: '#444',
        borderRadius: '3px',
        overflow: 'hidden'
      }
    });
    
    // Determine color based on value
    let barColor = '#5c6bc0'; // Default blue
    if (value >= 8) {
      barColor = '#4caf50'; // Green for high values
    } else if (value <= 3) {
      barColor = '#f44336'; // Red for low values
    } else if (value <= 5) {
      barColor = '#ff9800'; // Orange for medium-low values
    }
    
    const statBar = createElement('div', {
      className: 'stat-bar',
      style: {
        width: `${(value / 10) * 100}%`,
        height: '100%',
        backgroundColor: barColor
      }
    });
    
    statBarContainer.appendChild(statBar);
    statContainer.appendChild(statLabel);
    statContainer.appendChild(statBarContainer);
    
    return statContainer;
  },
  
  /**
   * Get character archetype from stats
   * @param {Object} survivor - Survivor data
   * @returns {string} Archetype name
   * @private
   */
  _getArchetypeFromStats(survivor) {
    const physical = survivor.physical || 5;
    const mental = survivor.mental || 5;
    const social = survivor.personality || 5;
    
    if (physical >= 8) return 'Athlete';
    if (mental >= 8) return 'Strategist';
    if (social >= 8) return 'Social Butterfly';
    if (physical >= 7 && mental >= 7) return 'Outdoorsman';
    return 'Versatile';
  },
  
  /**
   * Create placeholder survivors if data is not available
   * @returns {Array} Array of survivor objects
   * @private
   */
  _createPlaceholderSurvivors() {
    console.warn('Using placeholder survivors data');
    
    const maleNames = [
      'Alex', 'Brandon', 'Chris', 'Derek', 'Eric',
      'Frank', 'Greg', 'Henry', 'Isaac', 'Jake',
      'Kevin', 'Luke', 'Mike', 'Nathan', 'Oliver'
    ];
    
    const femaleNames = [
      'Amanda', 'Brooke', 'Carly', 'Diana', 'Emily',
      'Fiona', 'Grace', 'Hannah', 'Isabel', 'Julia',
      'Katie', 'Laura', 'Megan', 'Nicole', 'Olivia'
    ];
    
    const archetypes = [
      'Athlete', 'Strategist', 'Social Butterfly', 
      'Outdoorsman', 'Underdog', 'Leader', 'Wildcard'
    ];
    
    const occupations = [
      'Teacher', 'Lawyer', 'Doctor', 'Engineer', 'Firefighter',
      'Police Officer', 'Chef', 'Bartender', 'Fitness Trainer',
      'Student', 'Artist', 'Musician', 'Writer', 'Entrepreneur'
    ];
    
    const survivors = [];
    const usedNames = new Set();
    
    // Create male survivors
    for (let i = 0; i < 8; i++) {
      let name;
      do {
        name = maleNames[getRandomInt(0, maleNames.length - 1)];
      } while (usedNames.has(name));
      usedNames.add(name);
      
      const archetype = archetypes[getRandomInt(0, archetypes.length - 1)];
      const occupation = occupations[getRandomInt(0, occupations.length - 1)];
      const age = getRandomInt(21, 50);
      
      // Assign stats based on archetype
      let physical, mental, personality;
      
      switch(archetype) {
        case 'Athlete':
          physical = getRandomInt(7, 10);
          mental = getRandomInt(3, 7);
          personality = getRandomInt(4, 8);
          break;
        case 'Strategist':
          physical = getRandomInt(3, 6);
          mental = getRandomInt(8, 10);
          personality = getRandomInt(4, 7);
          break;
        case 'Social Butterfly':
          physical = getRandomInt(3, 6);
          mental = getRandomInt(5, 8);
          personality = getRandomInt(8, 10);
          break;
        case 'Outdoorsman':
          physical = getRandomInt(6, 9);
          mental = getRandomInt(5, 8);
          personality = getRandomInt(3, 6);
          break;
        default:
          physical = getRandomInt(4, 8);
          mental = getRandomInt(4, 8);
          personality = getRandomInt(4, 8);
      }
      
      survivors.push({
        id: i + 1,
        name,
        gender: 'male',
        age,
        occupation,
        archetype,
        physical,
        mental,
        personality,
        health: 100
      });
    }
    
    // Create female survivors
    for (let i = 0; i < 8; i++) {
      let name;
      do {
        name = femaleNames[getRandomInt(0, femaleNames.length - 1)];
      } while (usedNames.has(name));
      usedNames.add(name);
      
      const archetype = archetypes[getRandomInt(0, archetypes.length - 1)];
      const occupation = occupations[getRandomInt(0, occupations.length - 1)];
      const age = getRandomInt(21, 50);
      
      // Assign stats based on archetype
      let physical, mental, personality;
      
      switch(archetype) {
        case 'Athlete':
          physical = getRandomInt(7, 10);
          mental = getRandomInt(3, 7);
          personality = getRandomInt(4, 8);
          break;
        case 'Strategist':
          physical = getRandomInt(3, 6);
          mental = getRandomInt(8, 10);
          personality = getRandomInt(4, 7);
          break;
        case 'Social Butterfly':
          physical = getRandomInt(3, 6);
          mental = getRandomInt(5, 8);
          personality = getRandomInt(8, 10);
          break;
        case 'Outdoorsman':
          physical = getRandomInt(6, 9);
          mental = getRandomInt(5, 8);
          personality = getRandomInt(3, 6);
          break;
        default:
          physical = getRandomInt(4, 8);
          mental = getRandomInt(4, 8);
          personality = getRandomInt(4, 8);
      }
      
      survivors.push({
        id: i + 9,
        name,
        gender: 'female',
        age,
        occupation,
        archetype,
        physical,
        mental,
        personality,
        health: 100
      });
    }
    
    return survivors;
  },
  
  /**
   * Clean up the screen when it's hidden
   */
  teardown() {
    // Any cleanup code when leaving the screen
    console.log('CharacterSelectionScreen teardown');
  }
};

export default CharacterSelectionScreen;