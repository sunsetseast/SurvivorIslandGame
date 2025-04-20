/**
 * @module WelcomeScreen
 * Welcome screen for the Survivor Island game
 */

import { getElement, createElement, clearChildren } from '../utils/DOMUtils.js';
import { GameManager } from '../core/index.js';
import eventManager, { GameEvents } from '../core/EventManager.js';

const WelcomeScreen = {
  /**
   * Initialize the screen
   */
  initialize() {
    // Any one-time initialization code
    console.log('WelcomeScreen initialized');
  },
  
  /**
   * Set up the screen when it's shown
   * @param {Object} data - Additional data passed to the screen
   */
  setup(data = {}) {
    const welcomeScreen = getElement('welcome-screen');
    if (!welcomeScreen) {
      console.error('Welcome screen element not found');
      return;
    }
    
    // Clear the screen
    clearChildren(welcomeScreen);
    
    // Create title
    const title = createElement('h1', {
      className: 'game-title',
      style: {
        fontSize: '2.5rem',
        color: '#fff',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        marginBottom: '2rem'
      }
    }, 'Survivor Island');
    
    // Create tagline
    const tagline = createElement('p', {
      className: 'tagline',
      style: {
        fontSize: '1.2rem',
        color: '#eee',
        marginBottom: '3rem'
      }
    }, 'Outwit, Outplay, Outlast');
    
    // Create play button
    const playButton = createElement('button', {
      id: 'play-button',
      className: 'primary-button',
      onclick: () => GameManager.startGame()
    }, 'Play');
    
    // Create tribe selection
    const tribeOptions = createElement('div', {
      className: 'tribe-options',
      style: {
        marginTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }
    });
    
    const tribeSelectionLabel = createElement('p', {
      style: {
        marginBottom: '1rem',
        fontSize: '1.1rem',
        color: '#eee'
      }
    }, 'Select number of starting tribes:');
    
    const tribeButtonsContainer = createElement('div', {
      style: {
        display: 'flex',
        gap: '1rem'
      }
    });
    
    const createTribeButton = (count, isDefault = false) => {
      return createElement('button', {
        className: `tribe-button ${isDefault ? 'selected' : ''}`,
        'data-tribe-count': count,
        onclick: (e) => {
          // Remove selected class from all tribe buttons
          document.querySelectorAll('.tribe-button').forEach(btn => {
            btn.classList.remove('selected');
          });
          
          // Add selected class to clicked button
          e.target.classList.add('selected');
          
          // Update tribe count in GameManager
          GameManager.tribeCount = count;
          console.log(`Tribe count set to ${count}`);
        },
        style: {
          padding: '0.5rem 1rem',
          backgroundColor: isDefault ? '#4a6fa5' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: 'pointer'
        }
      }, count.toString());
    };
    
    // Create buttons for 2 and 3 tribes (2 is default)
    const twoTribeButton = createTribeButton(2, true);
    const threeTribeButton = createTribeButton(3, false);
    
    tribeButtonsContainer.appendChild(twoTribeButton);
    tribeButtonsContainer.appendChild(threeTribeButton);
    
    tribeOptions.appendChild(tribeSelectionLabel);
    tribeOptions.appendChild(tribeButtonsContainer);
    
    // Create credits
    const credits = createElement('p', {
      className: 'credits',
      style: {
        position: 'absolute',
        bottom: '1rem',
        left: '0',
        right: '0',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#aaa'
      }
    }, '© 2025 Survivor Island Game');
    
    // Add elements to the screen
    welcomeScreen.appendChild(title);
    welcomeScreen.appendChild(tagline);
    welcomeScreen.appendChild(playButton);
    welcomeScreen.appendChild(tribeOptions);
    welcomeScreen.appendChild(credits);
    
    // Check for saved game and update play button if needed
    if (window.saveGameExists && window.saveGameExists()) {
      playButton.textContent = 'Continue Game';
      
      // Add New Game button
      const newGameButton = createElement('button', {
        id: 'new-game-button',
        className: 'secondary-button',
        style: {
          marginTop: '1rem'
        },
        onclick: () => {
          if (confirm('Starting a new game will erase your saved game. Continue?')) {
            // Delete save and start new game
            if (window.deleteSaveGame) {
              window.deleteSaveGame();
            }
            GameManager.startGame();
          }
        }
      }, 'New Game');
      
      welcomeScreen.insertBefore(newGameButton, tribeOptions);
    }
    
    // Publish screen setup event
    eventManager.publish(GameEvents.SCREEN_CHANGED, {
      screenId: 'welcome',
      data
    });
  },
  
  /**
   * Clean up the screen when it's hidden
   */
  teardown() {
    // Any cleanup code when leaving the screen
    console.log('WelcomeScreen teardown');
  }
};

export default WelcomeScreen;