/**
 * @module WelcomeScreen
 * Welcome screen for the game
 */

import { getElement, createElement, clearChildren } from '../utils/DOMUtils.js';
import { gameManager } from '../core/GameManager.js';
import eventManager, { GameEvents } from '../core/EventManager.js';

const WelcomeScreen = {
  /**
   * Initialize the screen
   */
  initialize() {
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
    
    // Create game title
    const titleContainer = createElement('div', {
      className: 'title-container',
      style: {
        textAlign: 'center',
        marginBottom: '2rem'
      }
    });
    
    const gameTitle = createElement('h1', {
      className: 'game-title',
      style: {
        fontSize: '3rem',
        color: '#fff',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        margin: '0.5rem 0'
      }
    }, 'Survivor Island');
    
    const gameSubtitle = createElement('p', {
      className: 'game-subtitle',
      style: {
        fontSize: '1.2rem',
        color: '#ddd',
        fontStyle: 'italic',
        margin: '0.5rem 0'
      }
    }, 'Outwit, Outplay, Outlast');
    
    titleContainer.appendChild(gameTitle);
    titleContainer.appendChild(gameSubtitle);
    
    // Create menu buttons container
    const menuContainer = createElement('div', {
      className: 'menu-container',
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '2rem'
      }
    });
    
    // New Game button
    const newGameButton = createElement('button', {
      id: 'new-game-button',
      className: 'primary-button',
      style: {
        padding: '0.8rem 2rem',
        fontSize: '1.2rem',
        backgroundColor: '#ff9800',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        width: '200px'
      },
      onmouseover: (e) => { e.target.style.backgroundColor = '#e68a00'; },
      onmouseout: (e) => { e.target.style.backgroundColor = '#ff9800'; },
      onclick: () => {
        gameManager.startNewGame();
      }
    }, 'New Game');
    
    // Continue button (initially hidden)
    const continueButton = createElement('button', {
      id: 'continue-game-button',
      className: 'secondary-button',
      style: {
        padding: '0.8rem 2rem',
        fontSize: '1.2rem',
        backgroundColor: '#4caf50',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        width: '200px',
        display: gameManager.hasSavedGame() ? 'block' : 'none'
      },
      onmouseover: (e) => { e.target.style.backgroundColor = '#43a047'; },
      onmouseout: (e) => { e.target.style.backgroundColor = '#4caf50'; },
      onclick: () => {
        gameManager.loadGame();
      }
    }, 'Continue');
    
    // Settings button
    const settingsButton = createElement('button', {
      id: 'settings-button',
      className: 'tertiary-button',
      style: {
        padding: '0.8rem 2rem',
        fontSize: '1.2rem',
        backgroundColor: '#2196f3',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        width: '200px'
      },
      onmouseover: (e) => { e.target.style.backgroundColor = '#1e88e5'; },
      onmouseout: (e) => { e.target.style.backgroundColor = '#2196f3'; },
      onclick: () => {
        const settingsDialog = getElement('settings-dialog');
        if (settingsDialog) {
          settingsDialog.style.display = 'block';
        } else {
          console.warn('Settings dialog not found');
          this._createSettingsDialog(welcomeScreen);
        }
      }
    }, 'Settings');
    
    // Info button
    const infoButton = createElement('button', {
      id: 'info-button',
      className: 'tertiary-button',
      style: {
        padding: '0.8rem 2rem',
        fontSize: '1.2rem',
        backgroundColor: '#9c27b0',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        width: '200px'
      },
      onmouseover: (e) => { e.target.style.backgroundColor = '#8e24aa'; },
      onmouseout: (e) => { e.target.style.backgroundColor = '#9c27b0'; },
      onclick: () => {
        const infoDialog = getElement('info-dialog');
        if (infoDialog) {
          infoDialog.style.display = 'block';
        } else {
          console.warn('Info dialog not found');
          this._createInfoDialog(welcomeScreen);
        }
      }
    }, 'Game Info');
    
    // Add buttons to menu container
    menuContainer.appendChild(newGameButton);
    menuContainer.appendChild(continueButton);
    menuContainer.appendChild(settingsButton);
    menuContainer.appendChild(infoButton);
    
    // Create version info
    const versionInfo = createElement('div', {
      className: 'version-info',
      style: {
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        fontSize: '0.8rem',
        color: '#aaa'
      }
    }, 'v1.0.0');
    
    // Add elements to welcome screen
    welcomeScreen.appendChild(titleContainer);
    welcomeScreen.appendChild(menuContainer);
    welcomeScreen.appendChild(versionInfo);
    
    // Ensure settings and info dialogs exist
    if (!getElement('settings-dialog')) {
      this._createSettingsDialog(welcomeScreen);
    }
    
    if (!getElement('info-dialog')) {
      this._createInfoDialog(welcomeScreen);
    }
    
    // Publish screen setup event
    eventManager.publish(GameEvents.SCREEN_CHANGED, {
      screenId: 'welcome',
      data
    });
  },
  
  /**
   * Create settings dialog
   * @param {HTMLElement} parentElement - Parent element to append to
   * @private
   */
  _createSettingsDialog(parentElement) {
    const dialog = createElement('div', {
      id: 'settings-dialog',
      className: 'dialog',
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(40, 40, 40, 0.95)',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        zIndex: '1000',
        width: '80%',
        maxWidth: '500px',
        display: 'none'
      }
    });
    
    // Dialog header
    const header = createElement('div', {
      className: 'dialog-header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }
    });
    
    const title = createElement('h2', {
      style: {
        color: '#fff',
        margin: '0'
      }
    }, 'Game Settings');
    
    const closeButton = createElement('button', {
      className: 'dialog-close',
      style: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        color: '#aaa',
        cursor: 'pointer'
      },
      onclick: () => {
        dialog.style.display = 'none';
      }
    }, '×');
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Dialog content
    const content = createElement('div', {
      className: 'dialog-content'
    });
    
    // Tribe count setting
    const tribeCountGroup = createElement('div', {
      className: 'setting-group',
      style: {
        marginBottom: '1.5rem'
      }
    });
    
    const tribeCountLabel = createElement('label', {
      style: {
        display: 'block',
        color: '#ddd',
        marginBottom: '0.5rem'
      }
    }, 'Number of Starting Tribes:');
    
    const tribeCountSelect = createElement('select', {
      id: 'tribe-count-setting',
      style: {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#333',
        color: '#fff',
        border: '1px solid #555',
        borderRadius: '4px'
      }
    });
    
    // Add options
    [2, 3].forEach(count => {
      const option = createElement('option', {
        value: count,
        selected: gameManager.tribeCount === count
      }, count.toString());
      tribeCountSelect.appendChild(option);
    });
    
    tribeCountGroup.appendChild(tribeCountLabel);
    tribeCountGroup.appendChild(tribeCountSelect);
    
    // Difficulty setting
    const difficultyGroup = createElement('div', {
      className: 'setting-group',
      style: {
        marginBottom: '1.5rem'
      }
    });
    
    const difficultyLabel = createElement('label', {
      style: {
        display: 'block',
        color: '#ddd',
        marginBottom: '0.5rem'
      }
    }, 'Difficulty Level:');
    
    const difficultySelect = createElement('select', {
      id: 'difficulty-setting',
      style: {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#333',
        color: '#fff',
        border: '1px solid #555',
        borderRadius: '4px'
      }
    });
    
    // Add options
    ['easy', 'normal', 'hard'].forEach(difficulty => {
      const option = createElement('option', {
        value: difficulty,
        selected: gameManager.gameSettings.difficultyLevel === difficulty
      }, difficulty.charAt(0).toUpperCase() + difficulty.slice(1));
      difficultySelect.appendChild(option);
    });
    
    difficultyGroup.appendChild(difficultyLabel);
    difficultyGroup.appendChild(difficultySelect);
    
    // Idol toggle
    const idolGroup = createElement('div', {
      className: 'setting-group',
      style: {
        marginBottom: '1.5rem'
      }
    });
    
    const idolCheck = createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    });
    
    const idolCheckbox = createElement('input', {
      id: 'idol-setting',
      type: 'checkbox',
      checked: gameManager.gameSettings.enableIdols,
      style: {
        marginRight: '0.5rem'
      }
    });
    
    const idolLabel = createElement('label', {
      htmlFor: 'idol-setting',
      style: {
        color: '#ddd'
      }
    }, 'Enable Hidden Immunity Idols');
    
    idolCheck.appendChild(idolCheckbox);
    idolCheck.appendChild(idolLabel);
    idolGroup.appendChild(idolCheck);
    
    // Advantages toggle
    const advantageGroup = createElement('div', {
      className: 'setting-group',
      style: {
        marginBottom: '1.5rem'
      }
    });
    
    const advantageCheck = createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    });
    
    const advantageCheckbox = createElement('input', {
      id: 'advantage-setting',
      type: 'checkbox',
      checked: gameManager.gameSettings.enableAdvantages,
      style: {
        marginRight: '0.5rem'
      }
    });
    
    const advantageLabel = createElement('label', {
      htmlFor: 'advantage-setting',
      style: {
        color: '#ddd'
      }
    }, 'Enable Game Advantages');
    
    advantageCheck.appendChild(advantageCheckbox);
    advantageCheck.appendChild(advantageLabel);
    advantageGroup.appendChild(advantageCheck);
    
    // Add settings to content
    content.appendChild(tribeCountGroup);
    content.appendChild(difficultyGroup);
    content.appendChild(idolGroup);
    content.appendChild(advantageGroup);
    
    // Dialog footer
    const footer = createElement('div', {
      className: 'dialog-footer',
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '1.5rem'
      }
    });
    
    const saveButton = createElement('button', {
      className: 'primary-button',
      style: {
        padding: '0.5rem 1rem',
        backgroundColor: '#4caf50',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      },
      onclick: () => {
        // Save settings
        const settings = {
          tribeCount: parseInt(tribeCountSelect.value, 10),
          difficultyLevel: difficultySelect.value,
          enableIdols: idolCheckbox.checked,
          enableAdvantages: advantageCheckbox.checked
        };
        
        gameManager.gameSettings = {
          ...gameManager.gameSettings,
          ...settings
        };
        
        // Hide dialog
        dialog.style.display = 'none';
        
        console.log('Settings saved:', settings);
      }
    }, 'Save Settings');
    
    footer.appendChild(saveButton);
    
    // Assemble dialog
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    // Add dialog to parent
    parentElement.appendChild(dialog);
  },
  
  /**
   * Create info dialog
   * @param {HTMLElement} parentElement - Parent element to append to
   * @private
   */
  _createInfoDialog(parentElement) {
    const dialog = createElement('div', {
      id: 'info-dialog',
      className: 'dialog',
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(40, 40, 40, 0.95)',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        zIndex: '1000',
        width: '80%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        display: 'none'
      }
    });
    
    // Dialog header
    const header = createElement('div', {
      className: 'dialog-header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }
    });
    
    const title = createElement('h2', {
      style: {
        color: '#fff',
        margin: '0'
      }
    }, 'About Survivor Island');
    
    const closeButton = createElement('button', {
      className: 'dialog-close',
      style: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        color: '#aaa',
        cursor: 'pointer'
      },
      onclick: () => {
        dialog.style.display = 'none';
      }
    }, '×');
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Dialog content
    const content = createElement('div', {
      className: 'dialog-content',
      style: {
        color: '#ddd',
        lineHeight: '1.5'
      }
    });
    
    // Game description
    const description = createElement('p', {}, 
      'Survivor Island is a strategy game inspired by the popular reality TV show. ' +
      'Players must navigate social dynamics, form alliances, win challenges, and avoid being voted out ' +
      'to become the Sole Survivor and win the game.'
    );
    
    // Game mechanics section
    const mechanicsTitle = createElement('h3', {
      style: {
        color: '#fff',
        marginTop: '1.5rem'
      }
    }, 'Game Mechanics');
    
    const mechanicsList = createElement('ul', {
      style: {
        paddingLeft: '1.5rem'
      }
    });
    
    const mechanics = [
      'Form and manage alliances with other survivors',
      'Compete in immunity and reward challenges',
      'Vote at tribal council to eliminate opponents',
      'Search for hidden immunity idols',
      'Manage your health through rest, food, and water',
      'Progress through merge and endgame phases'
    ];
    
    mechanics.forEach(mechanic => {
      const item = createElement('li', {
        style: {
          marginBottom: '0.5rem'
        }
      }, mechanic);
      mechanicsList.appendChild(item);
    });
    
    // Controls section
    const controlsTitle = createElement('h3', {
      style: {
        color: '#fff',
        marginTop: '1.5rem'
      }
    }, 'Controls');
    
    const controlsList = createElement('ul', {
      style: {
        paddingLeft: '1.5rem'
      }
    });
    
    const controls = [
      'Click on survivors to view their information and interact',
      'Use the camp actions to manage your health and resources',
      'Navigate through game phases using the phase buttons',
      'Form alliances in the social tab',
      'Vote at tribal council by selecting a survivor'
    ];
    
    controls.forEach(control => {
      const item = createElement('li', {
        style: {
          marginBottom: '0.5rem'
        }
      }, control);
      controlsList.appendChild(item);
    });
    
    // Credits section
    const creditsTitle = createElement('h3', {
      style: {
        color: '#fff',
        marginTop: '1.5rem'
      }
    }, 'Credits');
    
    const credits = createElement('p', {}, 
      'Developed as a passion project inspired by the Survivor TV series. ' +
      'All game assets and content are original or properly licensed.'
    );
    
    // Add content elements
    content.appendChild(description);
    content.appendChild(mechanicsTitle);
    content.appendChild(mechanicsList);
    content.appendChild(controlsTitle);
    content.appendChild(controlsList);
    content.appendChild(creditsTitle);
    content.appendChild(credits);
    
    // Dialog footer
    const footer = createElement('div', {
      className: 'dialog-footer',
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '1.5rem'
      }
    });
    
    const closeFooterButton = createElement('button', {
      className: 'secondary-button',
      style: {
        padding: '0.5rem 1rem',
        backgroundColor: '#607d8b',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      },
      onclick: () => {
        dialog.style.display = 'none';
      }
    }, 'Close');
    
    footer.appendChild(closeFooterButton);
    
    // Assemble dialog
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    // Add dialog to parent
    parentElement.appendChild(dialog);
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