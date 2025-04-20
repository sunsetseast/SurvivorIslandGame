/**
 * @module CommonUtils
 * General utility functions used throughout the application
 */

/**
 * Gets a random item from an array
 * @param {Array} array - The array to select from
 * @returns {*|null} A random item from the array or null if array is empty
 */
export function getRandomItem(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} A new shuffled array (original not modified)
 */
export function shuffleArray(array) {
  if (!array || !Array.isArray(array)) {
    console.warn('Attempted to shuffle non-array:', array);
    return [];
  }
  
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Clamps a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} The clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generates a random integer between min and max (inclusive)
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
 * Creates a deep copy of an object
 * @param {Object} obj - The object to copy
 * @returns {Object|null} A deep copy of the object or null if there's an error
 */
export function deepCopy(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error('Error creating deep copy:', e);
    return null;
  }
}

/**
 * Formats a value as a percentage width string
 * @param {number} value - The current value
 * @param {number} max - The maximum value
 * @returns {string} CSS width value as a percentage
 */
export function formatProgressWidth(value, max) {
  const percentage = (value / max) * 100;
  return `${Math.min(100, Math.max(0, percentage))}%`;
}

/**
 * Debounces a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Generates a unique ID
 * @returns {string} A unique ID
 */
export function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}