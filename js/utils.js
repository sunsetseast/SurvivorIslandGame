// Utility Functions

/**
 * Get a random item from an array
 * @param {Array} array - The array to select from
 * @returns {*} A random item from the array
 */
function getRandomItem(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Clamp a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} The clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random integer
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Show a screen and hide all others
 * @param {string} screenId - The ID of the screen to show
 */
function showScreen(screenId) {
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

/**
 * Create a deep copy of an object
 * @param {Object} obj - The object to copy
 * @returns {Object} A deep copy of the object
 */
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Format a progress bar width
 * @param {number} value - The current value
 * @param {number} max - The maximum value
 * @returns {string} CSS width value as a percentage
 */
function formatProgressWidth(value, max) {
    const percentage = (value / max) * 100;
    return `${Math.min(100, Math.max(0, percentage))}%`;
}

/**
 * Clear all child elements of a parent
 * @param {HTMLElement} parent - The parent element
 */
function clearChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

/**
 * Create an element with attributes and children
 * @param {string} tag - The HTML tag name
 * @param {Object} attributes - The attributes to set
 * @param {Array|string} children - The children to append
 * @returns {HTMLElement} The created element
 */
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes (including event handlers)
    Object.entries(attributes).forEach(([key, value]) => {
        if (key.startsWith('on') && typeof value === 'function') {
            // Event handler
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            // Regular attribute
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        }
    });
    
    // Add children
    if (typeof children === 'string') {
        element.textContent = children;
    } else if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
    }
    
    return element;
}

/**
 * Save game data to localStorage
 * @param {Object} gameData - The game data to save
 */
function saveGame(gameData) {
    try {
        localStorage.setItem('survivorIslandSave', JSON.stringify(gameData));
        return true;
    } catch (e) {
        console.error('Error saving game:', e);
        return false;
    }
}

/**
 * Load game data from localStorage
 * @returns {Object|null} The loaded game data or null if no save exists
 */
function loadGame() {
    try {
        const savedGame = localStorage.getItem('survivorIslandSave');
        return savedGame ? JSON.parse(savedGame) : null;
    } catch (e) {
        console.error('Error loading game:', e);
        return null;
    }
}

/**
 * Check if a save game exists
 * @returns {boolean} True if a save exists, false otherwise
 */
function saveGameExists() {
    return localStorage.getItem('survivorIslandSave') !== null;
}

/**
 * Delete the save game
 */
function deleteSaveGame() {
    localStorage.removeItem('survivorIslandSave');
}