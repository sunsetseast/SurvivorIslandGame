/**
 * @module DOMUtils
 * Helper functions for DOM manipulation
 */

/**
 * Shows a specific screen and hides all others
 * @param {string} screenId - The ID of the screen to show
 * @returns {HTMLElement|null} - The displayed screen element or null if not found
 */
export function showScreen(screenId) {
  const screens = document.querySelectorAll('.game-screen');
  
  // Safety check
  if (!screens || screens.length === 0) {
    console.warn('No game screens found when attempting to show screen:', screenId);
    return null;
  }
  
  // Hide all screens
  screens.forEach(screen => {
    screen.classList.remove('active');
    screen.style.display = 'none';
  });
  
  // Show the target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    targetScreen.style.display = 'block';
    return targetScreen;
  } else {
    console.warn(`Screen with ID "${screenId}" not found`);
    return null;
  }
}

/**
 * Safely gets an element by ID with error handling
 * @param {string} id - The element ID
 * @param {string} [fallbackMessage] - Optional message to display if element isn't found
 * @returns {HTMLElement|null} - The element or null if not found
 */
export function getElement(id, fallbackMessage = null) {
  const element = document.getElementById(id);
  if (!element && fallbackMessage) {
    console.warn(fallbackMessage || `Element with ID "${id}" not found`);
  }
  return element;
}

/**
 * Creates an element with attributes and children
 * @param {string} tag - The HTML tag name
 * @param {Object} attributes - The attributes to set
 * @param {Array|string} children - The children to append
 * @returns {HTMLElement} The created element
 */
export function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  // Set attributes (including event handlers)
  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      // Event handler (using direct assignment for better reliability)
      const eventName = key.substring(2).toLowerCase();
      element[key.toLowerCase()] = value; // Direct assignment (e.g., element.onclick = func)
      
      // Also add via addEventListener for completeness
      element.addEventListener(eventName, value);
    } else {
      // Regular attribute
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'style' && typeof value === 'object') {
        // Handle style object
        Object.assign(element.style, value);
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
 * Creates a button with standardized styling based on button type
 * @param {string} text - The button text
 * @param {Function} onClick - Click handler function
 * @param {string} type - Button type ('big', 'menu', 'action', or 'small')
 * @param {Object} additionalAttributes - Any additional attributes to set
 * @returns {HTMLElement} The created button
 */
export function createButton(text, onClick, type = 'action', additionalAttributes = {}) {
  const buttonClass = {
    'big': 'big-button',
    'menu': 'menu-button',
    'action': 'action-button',
    'small': 'small-button'
  }[type] || 'action-button';
  
  return createElement('button', {
    className: buttonClass,
    textContent: text,
    onclick: onClick,
    ...additionalAttributes
  });
}

/**
 * Creates a progress bar element
 * @param {string} id - The ID for the progress fill element
 * @param {number} value - Current value
 * @param {number} max - Maximum value
 * @param {string} label - Label text
 * @param {boolean} showValue - Whether to show the numerical value
 * @returns {HTMLElement} The complete progress bar element
 */
export function createProgressBar(id, value, max, label = '', showValue = true) {
  const percentage = (value / max) * 100;
  const width = `${Math.min(100, Math.max(0, percentage))}%`;
  
  // Determine color based on percentage
  let color = '#4caf50'; // Green
  if (percentage < 30) {
    color = '#f44336'; // Red
  } else if (percentage < 70) {
    color = '#ff9800'; // Orange/Yellow
  }
  
  const progressContainer = createElement('div', { className: 'resource' });
  
  // Add label if provided
  if (label) {
    progressContainer.appendChild(
      createElement('label', {}, label)
    );
  }
  
  // Create progress bar shell
  const progressBar = createElement('div', { className: 'progress-bar' });
  
  // Create progress fill
  const progressFill = createElement('div', {
    id,
    className: 'progress-fill',
    style: {
      width,
      backgroundColor: color
    }
  });
  
  progressBar.appendChild(progressFill);
  progressContainer.appendChild(progressBar);
  
  // Add value display if requested
  if (showValue) {
    progressContainer.appendChild(
      createElement('span', { id: `${id}-value` }, value.toString())
    );
  }
  
  return progressContainer;
}

/**
 * Clears all child elements from a parent
 * @param {HTMLElement} parent - The parent element
 */
export function clearChildren(parent) {
  if (!parent) {
    console.warn('Attempted to clear children of null element');
    return;
  }
  
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/**
 * Updates a progress bar's width and color
 * @param {string} id - The ID of the progress fill element
 * @param {number} value - Current value
 * @param {number} max - Maximum value
 */
export function updateProgressBar(id, value, max) {
  const element = document.getElementById(id);
  const valueElement = document.getElementById(`${id}-value`);
  
  if (!element) {
    console.warn(`Progress bar with ID "${id}" not found`);
    return;
  }
  
  const percentage = (value / max) * 100;
  const width = `${Math.min(100, Math.max(0, percentage))}%`;
  
  // Update width
  element.style.width = width;
  
  // Update color based on percentage
  if (percentage < 30) {
    element.style.backgroundColor = '#f44336'; // Red
  } else if (percentage < 70) {
    element.style.backgroundColor = '#ff9800'; // Orange/Yellow
  } else {
    element.style.backgroundColor = '#4caf50'; // Green
  }
  
  // Update value text if it exists
  if (valueElement) {
    valueElement.textContent = Math.round(value).toString();
  }
}