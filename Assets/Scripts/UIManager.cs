using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Manages all UI screens and transitions between them
/// </summary>
public class UIManager : MonoBehaviour
{
    // Screen references
    [SerializeField] private WelcomeScreen _welcomeScreen;
    [SerializeField] private CharacterSelectionScreen _characterSelectionScreen;
    [SerializeField] private TribeDivisionScreen _tribeDivisionScreen;
    [SerializeField] private CampScreen _campScreen;
    [SerializeField] private ChallengeScreen _challengeScreen;
    [SerializeField] private TribalCouncilScreen _tribalCouncilScreen;
    [SerializeField] private JuryVoteScreen _juryVoteScreen;
    
    // Common UI elements
    [SerializeField] private DialogueSystem _dialogueSystem;
    [SerializeField] private TMP_Text _dayCounter;
    [SerializeField] private GameObject _energyPanel;
    [SerializeField] private Slider _energySlider;
    [SerializeField] private TMP_Text _energyText;
    [SerializeField] private GameObject _loadingScreen;
    [SerializeField] private Image _fadePanel;
    
    // Screens list
    private Dictionary<GameManager.GameState, GameObject> _screens = new Dictionary<GameManager.GameState, GameObject>();
    
    // Animation parameters
    private float _transitionDuration = 0.5f;
    private Coroutine _fadeCoroutine;

    private void Awake()
    {
        InitializeScreens();
    }

    private void InitializeScreens()
    {
        // Find all screen references if not assigned
        if (_welcomeScreen == null) _welcomeScreen = FindObjectOfType<WelcomeScreen>(true);
        if (_characterSelectionScreen == null) _characterSelectionScreen = FindObjectOfType<CharacterSelectionScreen>(true);
        if (_tribeDivisionScreen == null) _tribeDivisionScreen = FindObjectOfType<TribeDivisionScreen>(true);
        if (_campScreen == null) _campScreen = FindObjectOfType<CampScreen>(true);
        if (_challengeScreen == null) _challengeScreen = FindObjectOfType<ChallengeScreen>(true);
        if (_tribalCouncilScreen == null) _tribalCouncilScreen = FindObjectOfType<TribalCouncilScreen>(true);
        if (_juryVoteScreen == null) _juryVoteScreen = FindObjectOfType<JuryVoteScreen>(true);
        if (_dialogueSystem == null) _dialogueSystem = FindObjectOfType<DialogueSystem>(true);
        
        // Set up screens dictionary
        _screens.Add(GameManager.GameState.Welcome, _welcomeScreen.gameObject);
        _screens.Add(GameManager.GameState.CharacterSelection, _characterSelectionScreen.gameObject);
        _screens.Add(GameManager.GameState.TribeDivision, _tribeDivisionScreen.gameObject);
        _screens.Add(GameManager.GameState.Camp, _campScreen.gameObject);
        _screens.Add(GameManager.GameState.Challenge, _challengeScreen.gameObject);
        _screens.Add(GameManager.GameState.TribalCouncil, _tribalCouncilScreen.gameObject);
        _screens.Add(GameManager.GameState.Merge, _tribeDivisionScreen.gameObject); // Reuses tribe division screen
        _screens.Add(GameManager.GameState.FinalTribalCouncil, _juryVoteScreen.gameObject);
        _screens.Add(GameManager.GameState.GameOver, _juryVoteScreen.gameObject); // Reuses jury vote screen
        
        // Disable all screens initially
        foreach (var screen in _screens.Values)
        {
            if (screen != null)
                screen.SetActive(false);
        }
        
        // Configure fade panel
        if (_fadePanel == null)
        {
            _fadePanel = new GameObject("FadePanel").AddComponent<Image>();
            _fadePanel.transform.SetParent(transform);
            _fadePanel.rectTransform.anchorMin = Vector2.zero;
            _fadePanel.rectTransform.anchorMax = Vector2.one;
            _fadePanel.rectTransform.offsetMin = Vector2.zero;
            _fadePanel.rectTransform.offsetMax = Vector2.zero;
            _fadePanel.color = Color.black;
        }
        _fadePanel.color = new Color(0, 0, 0, 0);
    }

    public void UpdateUI(GameManager.GameState newState)
    {
        HideAllScreens();
        
        // Show day counter and energy UI for appropriate states
        bool showGameUI = (newState == GameManager.GameState.Camp || 
                          newState == GameManager.GameState.Challenge || 
                          newState == GameManager.GameState.TribalCouncil);
                          
        if (_dayCounter != null)
            _dayCounter.gameObject.SetActive(showGameUI);
            
        if (_energyPanel != null)
            _energyPanel.gameObject.SetActive(newState == GameManager.GameState.Camp);
            
        // Update day counter
        if (_dayCounter != null && showGameUI)
            _dayCounter.text = $"Day {GameManager.Instance.GetCurrentDay()}";
            
        // Update energy display
        if (_energyPanel != null && newState == GameManager.GameState.Camp)
            UpdateEnergyDisplay();
            
        // Transition to new screen with fade
        if (_screens.TryGetValue(newState, out GameObject newScreen))
        {
            TransitionToScreen(newScreen);
        }
        else
        {
            Debug.LogError($"No screen found for state: {newState}");
        }
    }
    
    private void HideAllScreens()
    {
        foreach (var screen in _screens.Values)
        {
            if (screen != null)
                screen.SetActive(false);
        }
    }
    
    private void TransitionToScreen(GameObject newScreen)
    {
        if (_fadeCoroutine != null)
            StopCoroutine(_fadeCoroutine);
            
        _fadeCoroutine = StartCoroutine(FadeTransition(newScreen));
    }
    
    private IEnumerator FadeTransition(GameObject newScreen)
    {
        // Fade out
        float startTime = Time.time;
        while (Time.time < startTime + _transitionDuration/2)
        {
            float alpha = Mathf.Lerp(0, 1, (Time.time - startTime) / (_transitionDuration/2));
            _fadePanel.color = new Color(0, 0, 0, alpha);
            yield return null;
        }
        _fadePanel.color = new Color(0, 0, 0, 1);
        
        // Switch screens
        HideAllScreens();
        newScreen.SetActive(true);
        
        // Fade in
        startTime = Time.time;
        while (Time.time < startTime + _transitionDuration/2)
        {
            float alpha = Mathf.Lerp(1, 0, (Time.time - startTime) / (_transitionDuration/2));
            _fadePanel.color = new Color(0, 0, 0, alpha);
            yield return null;
        }
        _fadePanel.color = new Color(0, 0, 0, 0);
        
        _fadeCoroutine = null;
    }
    
    public void UpdateEnergyDisplay()
    {
        if (_energySlider != null && GameManager.Instance.EnergySystem != null)
        {
            _energySlider.maxValue = GameManager.Instance.EnergySystem.GetMaxEnergy();
            _energySlider.value = GameManager.Instance.EnergySystem.GetCurrentEnergy();
        }
        
        if (_energyText != null && GameManager.Instance.EnergySystem != null)
        {
            _energyText.text = $"Energy: {GameManager.Instance.EnergySystem.GetCurrentEnergy()}/{GameManager.Instance.EnergySystem.GetMaxEnergy()}";
        }
    }
    
    public void ShowDialogue(string text, List<string> choices, System.Action<int> onChoiceSelected)
    {
        if (_dialogueSystem != null)
        {
            _dialogueSystem.gameObject.SetActive(true);
            _dialogueSystem.ShowDialogue(text, choices, onChoiceSelected);
        }
    }
    
    public void HideDialogue()
    {
        if (_dialogueSystem != null)
        {
            _dialogueSystem.gameObject.SetActive(false);
        }
    }
    
    public void ShowLoadingScreen(bool show)
    {
        if (_loadingScreen != null)
        {
            _loadingScreen.SetActive(show);
        }
    }
}
