/**
 * @module CommonUtils
 * Common utility functions used throughout the application
 */

/**
 * Get a random item from an array
 * @param {Array} array - The array to select from
 * @returns {*} A random item from the array
 */
export function getRandomItem(array) {
  if (!array || array.length === 0) {
    return null;
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
export function shuffleArray(array) {
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
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random integer
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Create a deep copy of an object
 * @param {Object} obj - The object to copy
 * @returns {Object} A deep copy of the object
 */
export function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map(item => deepCopy(item));
  }
  
  // Handle Object
  const copy = {};
  Object.keys(obj).forEach(key => {
    copy[key] = deepCopy(obj[key]);
  });
  
  return copy;
}

/**
 * Format a progress bar width
 * @param {number} value - The current value
 * @param {number} max - The maximum value
 * @returns {string} CSS width value as a percentage
 */
export function formatProgressWidth(value, max) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return `${percentage}%`;
}

/**
 * Calculate percentage
 * @param {number} value - The current value
 * @param {number} max - The maximum value
 * @returns {number} The percentage (0-100)
 */
export function calculatePercentage(value, max) {
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Delay execution for a specified time
 * @param {number} ms - The time to delay in milliseconds
 * @returns {Promise} A promise that resolves after the delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an object is empty
 * @param {Object} obj - The object to check
 * @returns {boolean} Whether the object is empty
 */
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Get the plural form of a word based on count
 * @param {string} singular - The singular form of the word
 * @param {string} plural - The plural form of the word
 * @param {number} count - The count to base the form on
 * @returns {string} The appropriate form of the word
 */
export function pluralize(singular, plural, count) {
  return count === 1 ? singular : plural;
}