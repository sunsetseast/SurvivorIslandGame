/**
 * @module DialogueSystem
 * Manages in-game dialogues, character speech, and player choices
 */

import { getElement, createElement, clearChildren } from '../utils/DOMUtils.js';
import { TimerManager } from '../utils/index.js';
import eventManager, { GameEvents } from '../core/EventManager.js';

class DialogueSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.dialogueElement = null;
    this.dialogueTextElement = null;
    this.dialogueChoicesElement = null;
    this.speakerNameElement = null;
    this.portraitElement = null;
    this.onChoiceSelectedCallback = null;
    this.typingSpeed = 30; // ms per character
    this.typingTimerId = null;
    this.isTyping = false;
    this.fullText = '';
    
    // Initialize once DOM is ready
    this._initializeElements();
  }
  
  /**
   * Initialize dialogue elements
   * @private
   */
  _initializeElements() {
    // Setup dialogue elements or create them if they don't exist
    this.dialogueElement = getElement('dialogue-container');
    
    if (!this.dialogueElement) {
      this._createDialogueElements();
    } else {
      this.dialogueTextElement = getElement('dialogue-text');
      this.dialogueChoicesElement = getElement('dialogue-choices');
      this.speakerNameElement = getElement('dialogue-speaker-name');
      this.portraitElement = getElement('dialogue-portrait');
      
      // Add click handler to dialogue text to complete typing
      if (this.dialogueTextElement) {
        this.dialogueTextElement.addEventListener('click', () => {
          if (this.isTyping) {
            this.completeTyping();
          }
        });
      }
    }
  }
  
  /**
   * Create dialogue UI elements if they don't exist
   * @private
   */
  _createDialogueElements() {
    // Create main dialogue container
    this.dialogueElement = createElement('div', {
      id: 'dialogue-container',
      className: 'dialogue-container hidden',
      style: {
        position: 'fixed',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '800px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: '8px',
        padding: '20px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        zIndex: '1000',
        display: 'flex',
        flexDirection: 'column'
      }
    });
    
    // Create portrait and speaker section
    const speakerSection = createElement('div', {
      id: 'dialogue-speaker-section',
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        gap: '15px'
      }
    });
    
    // Create portrait element
    this.portraitElement = createElement('div', {
      id: 'dialogue-portrait',
      style: {
        width: '60px',
        height: '60px',
        borderRadius: '30px',
        overflow: 'hidden',
        backgroundColor: '#555',
        display: 'none'
      }
    });
    
    // Create speaker name element
    this.speakerNameElement = createElement('div', {
      id: 'dialogue-speaker-name',
      style: {
        fontWeight: 'bold',
        fontSize: '1.2em',
        display: 'none'
      }
    });
    
    speakerSection.appendChild(this.portraitElement);
    speakerSection.appendChild(this.speakerNameElement);
    this.dialogueElement.appendChild(speakerSection);
    
    // Create dialogue text element
    this.dialogueTextElement = createElement('div', {
      id: 'dialogue-text',
      style: {
        marginBottom: '20px',
        lineHeight: '1.5',
        fontSize: '1.1em'
      }
    });
    this.dialogueElement.appendChild(this.dialogueTextElement);
    
    // Create dialogue choices element
    this.dialogueChoicesElement = createElement('div', {
      id: 'dialogue-choices',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }
    });
    this.dialogueElement.appendChild(this.dialogueChoicesElement);
    
    // Add to document
    document.body.appendChild(this.dialogueElement);
    
    // Add click handler to dialogue text to complete typing
    this.dialogueTextElement.addEventListener('click', () => {
      if (this.isTyping) {
        this.completeTyping();
      }
    });
  }
  
  /**
   * Show dialogue with choices
   * @param {string} text - The dialogue text
   * @param {Array} choices - Array of choice texts
   * @param {Function} onChoiceSelected - Callback when choice is selected
   */
  showDialogue(text, choices, onChoiceSelected) {
    // Make sure elements are initialized
    if (!this.dialogueElement) {
      this._initializeElements();
    }
    
    // Reset speaker info
    this.speakerNameElement.style.display = 'none';
    this.portraitElement.style.display = 'none';
    
    // Show the dialogue container
    this.dialogueElement.classList.remove('hidden');
    
    // Store callback
    this.onChoiceSelectedCallback = onChoiceSelected;
    
    // Start typewriter effect
    this.startTypewriterEffect(text, choices);
    
    // Publish dialogue shown event
    eventManager.publish(GameEvents.DIALOG_SHOWN, { text, choices });
  }
  
  /**
   * Show dialogue with a speaker
   * @param {string} text - The dialogue text
   * @param {Array} choices - Array of choice texts
   * @param {Function} onChoiceSelected - Callback when choice is selected
   * @param {string} speakerName - Name of the speaker
   * @param {string} portraitUrl - URL to speaker portrait
   */
  showDialogueWithSpeaker(text, choices, onChoiceSelected, speakerName, portraitUrl) {
    // Make sure elements are initialized
    if (!this.dialogueElement) {
      this._initializeElements();
    }
    
    // Set speaker name
    if (speakerName) {
      this.speakerNameElement.textContent = speakerName;
      this.speakerNameElement.style.display = 'block';
    } else {
      this.speakerNameElement.style.display = 'none';
    }
    
    // Set portrait if provided
    if (portraitUrl) {
      this.portraitElement.style.backgroundImage = `url(${portraitUrl})`;
      this.portraitElement.style.backgroundSize = 'cover';
      this.portraitElement.style.backgroundPosition = 'center';
      this.portraitElement.style.display = 'block';
    } else {
      this.portraitElement.style.display = 'none';
    }
    
    // Show the dialogue
    this.showDialogue(text, choices, onChoiceSelected);
  }
  
  /**
   * Start typewriter effect for gradual text reveal
   * @param {string} text - The text to type
   * @param {Array} choices - The choices to show after text is typed
   */
  startTypewriterEffect(text, choices) {
    // Clear existing text and timer
    if (this.typingTimerId) {
      TimerManager.clearTimeout(this.typingTimerId);
    }
    
    // Store full text for later
    this.fullText = text;
    
    // Clear existing text and choices
    this.dialogueTextElement.textContent = '';
    clearChildren(this.dialogueChoicesElement);
    
    // Set typing status
    this.isTyping = true;
    
    // Start typing character by character
    let charIndex = 0;
    
    const typeNextChar = () => {
      if (charIndex < text.length) {
        this.dialogueTextElement.textContent += text.charAt(charIndex);
        charIndex++;
        this.typingTimerId = TimerManager.setTimeout(typeNextChar, this.typingSpeed);
      } else {
        // When done typing
        this.isTyping = false;
        // Show choices when typing is complete
        this.createChoiceButtons(choices);
      }
    };
    
    // Start the typing effect
    typeNextChar();
  }
  
  /**
   * Create choice buttons
   * @param {Array} choices - Array of choice texts
   */
  createChoiceButtons(choices) {
    // Clear existing choices
    clearChildren(this.dialogueChoicesElement);
    
    // Add each choice as a button
    choices.forEach((choice, index) => {
      const button = createElement('button', {
        className: 'dialogue-choice-button',
        onclick: () => this.onChoiceButtonClicked(index),
        style: {
          padding: '10px 15px',
          backgroundColor: '#4a6fa5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1em',
          cursor: 'pointer',
          textAlign: 'left'
        }
      }, choice);
      
      this.dialogueChoicesElement.appendChild(button);
    });
  }
  
  /**
   * Handle choice button clicked
   * @param {number} choiceIndex - The index of the choice
   */
  onChoiceButtonClicked(choiceIndex) {
    // Call the callback with the choice index
    if (this.onChoiceSelectedCallback) {
      this.onChoiceSelectedCallback(choiceIndex);
    }
    
    // Publish choice selected event
    eventManager.publish(GameEvents.DIALOG_CHOICE_SELECTED, { choiceIndex });
  }
  
  /**
   * Hide the dialogue
   */
  hideDialogue() {
    if (this.dialogueElement) {
      this.dialogueElement.classList.add('hidden');
      
      // Clear text and choices
      this.dialogueTextElement.textContent = '';
      clearChildren(this.dialogueChoicesElement);
      
      // Clear typing timer
      if (this.typingTimerId) {
        TimerManager.clearTimeout(this.typingTimerId);
        this.typingTimerId = null;
      }
      
      // Reset typing status
      this.isTyping = false;
      
      // Publish dialogue closed event
      eventManager.publish(GameEvents.DIALOG_CLOSED, {});
    }
  }
  
  /**
   * Complete the text typing immediately
   */
  completeTyping() {
    if (this.isTyping) {
      // Stop the typewriter timer
      if (this.typingTimerId) {
        TimerManager.clearTimeout(this.typingTimerId);
        this.typingTimerId = null;
      }
      
      // Show the full text immediately
      this.dialogueTextElement.textContent = this.fullText;
      
      // Get the saved choices from the choices element
      const choices = Array.from(this.dialogueChoicesElement.querySelectorAll('.dialogue-choice-button'))
        .map(button => button.textContent);
      
      // Display choices
      this.createChoiceButtons(choices.length > 0 ? choices : ['Continue']);
      
      // Reset typing status
      this.isTyping = false;
    }
  }
}

export default DialogueSystem;