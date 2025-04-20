/**
 * @module DOMUtils
 * DOM manipulation utility functions
 */

/**
 * Get an element by ID, query selector, or return the element if already an element
 * @param {string|HTMLElement} idOrElement - Element ID, query selector, or HTML element
 * @returns {HTMLElement|null} The found element or null
 */
export function getElement(idOrElement) {
  if (idOrElement instanceof HTMLElement) {
    return idOrElement;
  }
  
  if (typeof idOrElement === 'string') {
    // Try to get by ID first
    const elementById = document.getElementById(idOrElement);
    if (elementById) {
      return elementById;
    }
    
    // Then try as a selector
    try {
      return document.querySelector(idOrElement);
    } catch (e) {
      console.error(`Invalid selector: ${idOrElement}`, e);
      return null;
    }
  }
  
  return null;
}

/**
 * Get elements by class name, query selector, or return array if already an array
 * @param {string|Array} classOrSelector - Class name, query selector, or array of elements
 * @returns {Array} Array of matching elements
 */
export function getElements(classOrSelector) {
  if (Array.isArray(classOrSelector)) {
    return classOrSelector;
  }
  
  if (typeof classOrSelector === 'string') {
    // Try class name first
    const elementsByClass = document.getElementsByClassName(classOrSelector);
    if (elementsByClass.length > 0) {
      return Array.from(elementsByClass);
    }
    
    // Then try as a selector
    try {
      return Array.from(document.querySelectorAll(classOrSelector));
    } catch (e) {
      console.error(`Invalid selector: ${classOrSelector}`, e);
      return [];
    }
  }
  
  return [];
}

/**
 * Create an element with attributes and children
 * @param {string} tag - The HTML tag name
 * @param {Object} attributes - The attributes to set
 * @param {Array|string} children - The children to append
 * @returns {HTMLElement} The created element
 */
export function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      // Handle style object
      Object.entries(value).forEach(([prop, val]) => {
        element.style[prop] = val;
      });
    } else if (key === 'className') {
      // Handle className
      element.className = value;
    } else if (key === 'dataset') {
      // Handle dataset
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      // Handle event listeners
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      // Handle normal attributes
      element.setAttribute(key, value);
    }
  });
  
  // Add children
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (child instanceof HTMLElement) {
          element.appendChild(child);
        } else if (child !== null && child !== undefined) {
          element.appendChild(document.createTextNode(child.toString()));
        }
      });
    } else if (children instanceof HTMLElement) {
      element.appendChild(children);
    } else if (children !== null && children !== undefined) {
      element.appendChild(document.createTextNode(children.toString()));
    }
  }
  
  return element;
}

/**
 * Show a screen and hide all others
 * @param {string} screenId - The ID of the screen to show
 */
export function showScreen(screenId) {
  // Get all screens
  const screens = document.querySelectorAll('.game-screen');
  
  // Hide all screens
  screens.forEach(screen => {
    screen.style.display = 'none';
  });
  
  // Show the target screen
  const targetScreen = getElement(screenId);
  if (targetScreen) {
    targetScreen.style.display = 'block';
    console.log(`Showing screen: ${screenId}`);
  } else {
    console.error(`Screen not found: ${screenId}`);
  }
}

/**
 * Create and return a button with specified attributes
 * @param {string} text - Button text
 * @param {Function} onClick - Click handler
 * @param {string} className - Additional CSS class(es)
 * @returns {HTMLButtonElement} The created button
 */
export function createButton(text, onClick, className = '') {
  return createElement('button', {
    className: `game-button ${className}`.trim(),
    onclick: onClick
  }, text);
}

/**
 * Clear all child elements of a parent
 * @param {HTMLElement|string} parent - The parent element or its ID
 */
export function clearChildren(parent) {
  const parentElement = getElement(parent);
  if (!parentElement) {
    console.error(`Parent element not found: ${parent}`);
    return;
  }
  
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.firstChild);
  }
}

/**
 * Append multiple children to a parent element
 * @param {HTMLElement|string} parent - The parent element or its ID
 * @param {Array} children - Array of child elements to append
 */
export function appendChildren(parent, children) {
  const parentElement = getElement(parent);
  if (!parentElement) {
    console.error(`Parent element not found: ${parent}`);
    return;
  }
  
  children.forEach(child => {
    if (child instanceof HTMLElement) {
      parentElement.appendChild(child);
    } else if (child !== null && child !== undefined) {
      parentElement.appendChild(document.createTextNode(child.toString()));
    }
  });
}

/**
 * Set text content of an element
 * @param {HTMLElement|string} element - The element or its ID
 * @param {string} text - The text to set
 */
export function setText(element, text) {
  const targetElement = getElement(element);
  if (!targetElement) {
    console.error(`Element not found: ${element}`);
    return;
  }
  
  targetElement.textContent = text;
}

/**
 * Add an event listener to an element with error handling
 * @param {HTMLElement|string} element - The element or its ID
 * @param {string} event - The event name
 * @param {Function} handler - The event handler
 * @returns {Function} A function to remove the event listener
 */
export function addEvent(element, event, handler) {
  const targetElement = getElement(element);
  if (!targetElement) {
    console.error(`Element not found: ${element}`);
    return () => {};
  }
  
  targetElement.addEventListener(event, handler);
  
  // Return a function to remove the event listener
  return () => {
    targetElement.removeEventListener(event, handler);
  };
}

/**
 * Create a simple progress bar element
 * @param {number} value - Current value
 * @param {number} max - Maximum value
 * @param {string} barColor - Color of the progress bar
 * @param {string} id - ID for the progress container
 * @returns {HTMLElement} The progress bar container
 */
export function createProgressBar(value, max, barColor = '#4caf50', id = '') {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const container = createElement('div', {
    className: 'progress-container',
    id: id || `progress-${Date.now()}`
  });
  
  const bar = createElement('div', {
    className: 'progress-bar',
    style: {
      width: `${percentage}%`,
      backgroundColor: barColor
    }
  });
  
  const label = createElement('div', {
    className: 'progress-label'
  }, `${Math.round(value)}/${max}`);
  
  container.appendChild(bar);
  container.appendChild(label);
  
  return container;
}