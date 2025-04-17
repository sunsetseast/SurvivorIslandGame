using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Manages dialogue display and choice selection
/// </summary>
public class DialogueSystem : MonoBehaviour
{
    [SerializeField] private TMP_Text _dialogueText;
    [SerializeField] private Transform _choicesContainer;
    [SerializeField] private GameObject _choiceButtonPrefab;
    [SerializeField] private Image _speakerPortrait;
    [SerializeField] private TMP_Text _speakerNameText;
    [SerializeField] private Image _dialogueBackgroundPanel;
    [SerializeField] private float _typewriterSpeed = 0.05f;
    [SerializeField] private bool _useTypewriterEffect = true;
    
    private System.Action<int> _onChoiceSelected;
    private Coroutine _typewriterCoroutine;
    private string _fullDialogueText;
    
    private void Awake()
    {
        // Make sure the dialogue system is initially hidden
        gameObject.SetActive(false);
    }
    
    /// <summary>
    /// Display dialogue with choices
    /// </summary>
    public void ShowDialogue(string text, List<string> choices, System.Action<int> onChoiceSelected)
    {
        _fullDialogueText = text;
        _onChoiceSelected = onChoiceSelected;
        
        // Show the dialogue panel
        gameObject.SetActive(true);
        
        // Hide choices initially while text is typing
        if (_choicesContainer != null)
            _choicesContainer.gameObject.SetActive(false);
        
        // Set dialogue text
        if (_dialogueText != null)
        {
            if (_useTypewriterEffect)
            {
                if (_typewriterCoroutine != null)
                    StopCoroutine(_typewriterCoroutine);
                    
                _dialogueText.text = "";
                _typewriterCoroutine = StartCoroutine(TypewriterEffect(_fullDialogueText, choices));
            }
            else
            {
                _dialogueText.text = text;
                CreateChoiceButtons(choices);
            }
        }
    }
    
    /// <summary>
    /// Display dialogue with a speaker portrait
    /// </summary>
    public void ShowDialogueWithSpeaker(string text, List<string> choices, System.Action<int> onChoiceSelected, 
                                        string speakerName, Sprite portrait)
    {
        // Setup speaker elements
        if (_speakerNameText != null)
        {
            _speakerNameText.text = speakerName;
            _speakerNameText.gameObject.SetActive(true);
        }
        
        if (_speakerPortrait != null)
        {
            if (portrait != null)
            {
                _speakerPortrait.sprite = portrait;
                _speakerPortrait.gameObject.SetActive(true);
            }
            else
            {
                _speakerPortrait.gameObject.SetActive(false);
            }
        }
        
        // Show regular dialogue
        ShowDialogue(text, choices, onChoiceSelected);
    }
    
    /// <summary>
    /// Create buttons for each dialogue choice
    /// </summary>
    private void CreateChoiceButtons(List<string> choices)
    {
        if (_choicesContainer == null || _choiceButtonPrefab == null)
            return;
            
        // Clear existing choices
        foreach (Transform child in _choicesContainer)
        {
            Destroy(child.gameObject);
        }
        
        // Show choices container
        _choicesContainer.gameObject.SetActive(true);
        
        // Create a button for each choice
        for (int i = 0; i < choices.Count; i++)
        {
            GameObject choiceObj = Instantiate(_choiceButtonPrefab, _choicesContainer);
            
            // Set choice text
            TMP_Text choiceText = choiceObj.GetComponentInChildren<TMP_Text>();
            if (choiceText != null)
            {
                choiceText.text = choices[i];
            }
            
            // Add click event
            Button choiceButton = choiceObj.GetComponent<Button>();
            if (choiceButton != null)
            {
                int choiceIndex = i;
                choiceButton.onClick.AddListener(() => {
                    OnChoiceButtonClicked(choiceIndex);
                });
            }
        }
    }
    
    /// <summary>
    /// Handle choice button click
    /// </summary>
    private void OnChoiceButtonClicked(int choiceIndex)
    {
        if (_onChoiceSelected != null)
        {
            _onChoiceSelected.Invoke(choiceIndex);
        }
    }
    
    /// <summary>
    /// Typewriter effect for gradual text reveal
    /// </summary>
    private IEnumerator TypewriterEffect(string textToType, List<string> choices)
    {
        _dialogueText.text = "";
        
        foreach (char c in textToType)
        {
            _dialogueText.text += c;
            
            // Skip to end if player taps dialogue box
            if (Input.GetMouseButtonDown(0))
            {
                _dialogueText.text = textToType;
                break;
            }
            
            yield return new WaitForSeconds(_typewriterSpeed);
        }
        
        // Show choices after text is fully displayed
        CreateChoiceButtons(choices);
        
        _typewriterCoroutine = null;
    }
    
    /// <summary>
    /// Hide the dialogue system
    /// </summary>
    public void HideDialogue()
    {
        gameObject.SetActive(false);
        
        if (_typewriterCoroutine != null)
        {
            StopCoroutine(_typewriterCoroutine);
            _typewriterCoroutine = null;
        }
    }
    
    /// <summary>
    /// Complete text typing immediately
    /// </summary>
    public void CompleteTyping()
    {
        if (_typewriterCoroutine != null)
        {
            StopCoroutine(_typewriterCoroutine);
            _typewriterCoroutine = null;
            
            if (_dialogueText != null)
            {
                _dialogueText.text = _fullDialogueText;
            }
        }
    }
}
