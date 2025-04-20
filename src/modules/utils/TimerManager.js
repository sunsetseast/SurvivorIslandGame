/**
 * @module TimerManager
 * Manages timers and intervals to prevent memory leaks
 */

class TimerManager {
  constructor() {
    this.timers = new Map();
    this.intervals = new Map();
    this.animationFrames = new Map();
  }
  
  /**
   * Creates a timeout that can be tracked and cleared
   * @param {Function} callback - The function to call after the delay
   * @param {number} delay - The delay in milliseconds
   * @param {string} [id] - Optional ID for the timer (auto-generated if not provided)
   * @returns {string} The ID of the timer
   */
  setTimeout(callback, delay, id = null) {
    // Generate ID if not provided
    if (!id) {
      id = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Clear existing timer with same ID if it exists
    this.clearTimeout(id);
    
    // Create new timer
    const timerId = setTimeout(() => {
      // Remove from map when done
      this.timers.delete(id);
      // Call the callback
      callback();
    }, delay);
    
    // Store timer
    this.timers.set(id, timerId);
    
    return id;
  }
  
  /**
   * Clears a timeout
   * @param {string} id - The ID of the timer to clear
   * @returns {boolean} Whether the timer was found and cleared
   */
  clearTimeout(id) {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
      return true;
    }
    return false;
  }
  
  /**
   * Creates an interval that can be tracked and cleared
   * @param {Function} callback - The function to call repeatedly
   * @param {number} delay - The delay between calls in milliseconds
   * @param {string} [id] - Optional ID for the interval (auto-generated if not provided)
   * @returns {string} The ID of the interval
   */
  setInterval(callback, delay, id = null) {
    // Generate ID if not provided
    if (!id) {
      id = `interval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Clear existing interval with same ID if it exists
    this.clearInterval(id);
    
    // Create new interval
    const intervalId = setInterval(callback, delay);
    
    // Store interval
    this.intervals.set(id, intervalId);
    
    return id;
  }
  
  /**
   * Clears an interval
   * @param {string} id - The ID of the interval to clear
   * @returns {boolean} Whether the interval was found and cleared
   */
  clearInterval(id) {
    if (this.intervals.has(id)) {
      clearInterval(this.intervals.get(id));
      this.intervals.delete(id);
      return true;
    }
    return false;
  }
  
  /**
   * Creates a requestAnimationFrame loop
   * @param {Function} callback - The animation frame callback
   * @param {string} [id] - Optional ID for the animation (auto-generated if not provided)
   * @returns {string} The ID of the animation frame
   */
  requestAnimationFrame(callback, id = null) {
    // Generate ID if not provided
    if (!id) {
      id = `animFrame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Clear existing animation frame with same ID if it exists
    this.cancelAnimationFrame(id);
    
    // Create animation frame loop function
    const frameLoop = () => {
      // Store next frame
      const frameId = requestAnimationFrame(() => {
        // Call the callback
        callback();
        // Continue the loop
        this.animationFrames.set(id, frameLoop());
      });
      return frameId;
    };
    
    // Start the loop
    const initialFrameId = frameLoop();
    this.animationFrames.set(id, initialFrameId);
    
    return id;
  }
  
  /**
   * Cancels an animation frame
   * @param {string} id - The ID of the animation frame to cancel
   * @returns {boolean} Whether the animation frame was found and canceled
   */
  cancelAnimationFrame(id) {
    if (this.animationFrames.has(id)) {
      cancelAnimationFrame(this.animationFrames.get(id));
      this.animationFrames.delete(id);
      return true;
    }
    return false;
  }
  
  /**
   * Creates a debounced function
   * @param {Function} callback - The function to debounce
   * @param {number} delay - The debounce delay in milliseconds
   * @param {string} [id] - Optional ID for the debounced function (auto-generated if not provided)
   * @returns {Function} The debounced function
   */
  debounce(callback, delay, id = null) {
    // Generate ID if not provided
    if (!id) {
      id = `debounce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    return (...args) => {
      // Clear existing timer
      this.clearTimeout(id);
      
      // Create new timer
      this.setTimeout(() => {
        callback(...args);
      }, delay, id);
    };
  }
  
  /**
   * Creates a throttled function
   * @param {Function} callback - The function to throttle
   * @param {number} limit - The throttle limit in milliseconds
   * @returns {Function} The throttled function
   */
  throttle(callback, limit) {
    let waiting = false;
    return function(...args) {
      if (!waiting) {
        callback.apply(this, args);
        waiting = true;
        setTimeout(function() {
          waiting = false;
        }, limit);
      }
    };
  }
  
  /**
   * Clears all timers, intervals, and animation frames
   */
  clearAll() {
    // Clear all timers
    this.timers.forEach(timerId => clearTimeout(timerId));
    this.timers.clear();
    
    // Clear all intervals
    this.intervals.forEach(intervalId => clearInterval(intervalId));
    this.intervals.clear();
    
    // Clear all animation frames
    this.animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
    this.animationFrames.clear();
    
    console.log('All timers, intervals, and animation frames cleared');
  }
  
  /**
   * Lists all active timers, intervals, and animation frames (for debugging)
   * @returns {Object} Object containing counts of active timers, intervals, and animation frames
   */
  listActive() {
    const counts = {
      timers: this.timers.size,
      intervals: this.intervals.size,
      animationFrames: this.animationFrames.size
    };
    
    console.log('Active timers:', counts.timers);
    console.log('Active intervals:', counts.intervals);
    console.log('Active animation frames:', counts.animationFrames);
    
    return counts;
  }
}

// Create and export singleton instance
const timerManager = new TimerManager();
export default timerManager;