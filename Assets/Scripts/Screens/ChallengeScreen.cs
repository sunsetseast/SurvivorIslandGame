using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Manages the challenge screen interface and interactions
/// </summary>
public class ChallengeScreen : MonoBehaviour
{
    [SerializeField] private TMP_Text _challengeTitleText;
    [SerializeField] private TMP_Text _challengeDescriptionText;
    [SerializeField] private Slider _progressBar;
    [SerializeField] private Button _actionButton;
    [SerializeField] private TMP_Text _actionButtonText;
    [SerializeField] private TMP_Text _challengeResultText;
    [SerializeField] private GameObject _challengeResultPanel;
    [SerializeField] private Image _backgroundImage;
    [SerializeField] private GameObject _competitorsPanel;
    [SerializeField] private Transform _competitorsContainer;
    [SerializeField] private GameObject _competitorPrefab;
    
    // Challenge minigame elements
    [SerializeField] private GameObject _tapChallengePanel;
    [SerializeField] private GameObject _memoryMatchPanel;
    [SerializeField] private GameObject _sliderChallengePanel;
    
    private enum ChallengeMinigameType
    {
        TapChallenge,
        MemoryMatch,
        SliderChallenge
    }
    
    private ChallengeMinigameType _currentMinigameType;
    private float _challengeProgress = 0f;
    private float _challengeTarget = 100f;
    private float _tapIncrement = 5f;
    private Coroutine _aiProgressCoroutine;
    private Dictionary<SurvivorData, float> _competitorProgress = new Dictionary<SurvivorData, float>();
    private bool _challengeActive = false;
    
    // Memory match challenge
    private List<int> _memorySequence = new List<int>();
    private List<int> _playerInputSequence = new List<int>();
    private int _memorySequenceLength = 3;
    private bool _isShowingSequence = false;
    private List<Button> _memoryButtons = new List<Button>();
    
    // Slider challenge
    private float _targetValue = 0.5f;
    private float _sliderSpeed = 0.5f;
    private Slider _challengeSlider;
    private bool _isSliderMoving = false;
    
    private void OnEnable()
    {
        SetupChallengeUI();
    }
    
    private void OnDisable()
    {
        if (_aiProgressCoroutine != null)
        {
            StopCoroutine(_aiProgressCoroutine);
            _aiProgressCoroutine = null;
        }
    }
    
    private void SetupChallengeUI()
    {
        // Reset challenge state
        _challengeProgress = 0f;
        _challengeActive = false;
        _competitorProgress.Clear();
        
        // Hide all challenge minigame panels
        if (_tapChallengePanel != null)
            _tapChallengePanel.SetActive(false);
        if (_memoryMatchPanel != null)
            _memoryMatchPanel.SetActive(false);
        if (_sliderChallengePanel != null)
            _sliderChallengePanel.SetActive(false);
        
        // Hide result panel
        if (_challengeResultPanel != null)
            _challengeResultPanel.SetActive(false);
        
        // Select random background color
        if (_backgroundImage != null)
        {
            Color[] backgroundColors = {
                new Color(0.2f, 0.6f, 0.8f), // Blue
                new Color(0.7f, 0.4f, 0.3f), // Brown
                new Color(0.3f, 0.7f, 0.4f)  // Green
            };
            _backgroundImage.color = backgroundColors[Random.Range(0, backgroundColors.Length)];
        }
        
        // Set up action button
        if (_actionButton != null)
        {
            _actionButton.onClick.RemoveAllListeners();
            _actionButton.onClick.AddListener(StartChallenge);
            
            if (_actionButtonText != null)
                _actionButtonText.text = "Start Challenge";
        }
        
        // Initialize progress bar
        if (_progressBar != null)
        {
            _progressBar.value = 0;
            _progressBar.maxValue = _challengeTarget;
        }
        
        // Set challenge info from challenge system
        ChallengeSystem.Challenge currentChallenge = GetComponent<ChallengeSystem>()._currentChallenge;
        if (currentChallenge != null)
        {
            if (_challengeTitleText != null)
                _challengeTitleText.text = currentChallenge.Title;
                
            if (_challengeDescriptionText != null)
                _challengeDescriptionText.text = currentChallenge.Description;
        }
        
        // Determine the minigame type based on the challenge
        DetermineMinigameType();
        
        // Setup competitors display
        SetupCompetitorsDisplay();
    }
    
    private void DetermineMinigameType()
    {
        // Select a random minigame type
        _currentMinigameType = (ChallengeMinigameType)Random.Range(0, 3);
        
        // Update challenge description based on minigame type
        if (_challengeDescriptionText != null)
        {
            string baseDescription = _challengeDescriptionText.text;
            string howToPlay = "\n\nHow to play: ";
            
            switch (_currentMinigameType)
            {
                case ChallengeMinigameType.TapChallenge:
                    howToPlay += "Tap the button repeatedly as fast as you can to fill the progress bar!";
                    break;
                case ChallengeMinigameType.MemoryMatch:
                    howToPlay += "Memorize the sequence of buttons and repeat it back correctly!";
                    break;
                case ChallengeMinigameType.SliderChallenge:
                    howToPlay += "Stop the moving slider as close to the target zone as possible!";
                    break;
            }
            
            _challengeDescriptionText.text = baseDescription + howToPlay;
        }
    }
    
    private void SetupCompetitorsDisplay()
    {
        if (_competitorsPanel == null || _competitorsContainer == null || _competitorPrefab == null)
            return;
            
        // Clear existing competitors
        foreach (Transform child in _competitorsContainer)
        {
            Destroy(child.gameObject);
        }
        
        // Get game phase
        GameManager.GamePhase gamePhase = GameManager.Instance.GetCurrentPhase();
        
        if (gamePhase == GameManager.GamePhase.PreMerge)
        {
            // Set up tribe competition
            List<TribeData> tribes = GameManager.Instance.GetTribes();
            
            foreach (var tribe in tribes)
            {
                GameObject competitor = Instantiate(_competitorPrefab, _competitorsContainer);
                
                // Set name
                TMP_Text nameText = competitor.GetComponentInChildren<TMP_Text>();
                if (nameText != null)
                {
                    nameText.text = tribe.TribeName;
                    nameText.color = tribe.TribeColor;
                }
                
                // Set up progress bar
                Slider progressBar = competitor.GetComponentInChildren<Slider>();
                if (progressBar != null)
                {
                    progressBar.value = 0;
                    progressBar.maxValue = _challengeTarget;
                }
                
                // Highlight player's tribe
                if (tribe == GameManager.Instance.GetPlayerTribe())
                {
                    Image background = competitor.GetComponent<Image>();
                    if (background != null)
                    {
                        background.color = new Color(1f, 1f, 0.5f, 0.3f); // Highlight color
                    }
                }
            }
        }
        else
        {
            // Set up individual competition
            List<SurvivorData> competitors = new List<SurvivorData>();
            
            // Add all remaining survivors
            foreach (var tribe in GameManager.Instance.GetTribes())
            {
                competitors.AddRange(tribe.Members);
            }
            
            foreach (var survivor in competitors)
            {
                GameObject competitor = Instantiate(_competitorPrefab, _competitorsContainer);
                
                // Set name
                TMP_Text nameText = competitor.GetComponentInChildren<TMP_Text>();
                if (nameText != null)
                {
                    nameText.text = survivor.Name;
                }
                
                // Set up progress bar
                Slider progressBar = competitor.GetComponentInChildren<Slider>();
                if (progressBar != null)
                {
                    progressBar.value = 0;
                    progressBar.maxValue = _challengeTarget;
                    
                    // Store reference to competitor's progress
                    _competitorProgress[survivor] = 0f;
                }
                
                // Highlight player
                if (survivor.IsPlayer)
                {
                    Image background = competitor.GetComponent<Image>();
                    if (background != null)
                    {
                        background.color = new Color(1f, 1f, 0.5f, 0.3f); // Highlight color
                    }
                }
            }
        }
    }
    
    private void StartChallenge()
    {
        _challengeActive = true;
        
        // Hide description text
        if (_challengeDescriptionText != null)
            _challengeDescriptionText.gameObject.SetActive(false);
            
        // Change button text
        if (_actionButtonText != null)
            _actionButtonText.text = "Tap!";
            
        // Start AI progress coroutine
        if (_aiProgressCoroutine != null)
            StopCoroutine(_aiProgressCoroutine);
            
        _aiProgressCoroutine = StartCoroutine(UpdateAIProgress());
        
        // Set up specific minigame
        switch (_currentMinigameType)
        {
            case ChallengeMinigameType.TapChallenge:
                SetupTapChallenge();
                break;
            case ChallengeMinigameType.MemoryMatch:
                SetupMemoryMatchChallenge();
                break;
            case ChallengeMinigameType.SliderChallenge:
                SetupSliderChallenge();
                break;
        }
    }
    
    private void SetupTapChallenge()
    {
        // Show tap challenge panel
        if (_tapChallengePanel != null)
            _tapChallengePanel.SetActive(true);
            
        // Update action button
        if (_actionButton != null)
        {
            _actionButton.onClick.RemoveAllListeners();
            _actionButton.onClick.AddListener(OnTapChallengeButtonPressed);
        }
    }
    
    private void OnTapChallengeButtonPressed()
    {
        if (!_challengeActive) return;
        
        // Increment player progress
        _challengeProgress += _tapIncrement;
        
        // Update progress bar
        if (_progressBar != null)
        {
            _progressBar.value = _challengeProgress;
        }
        
        // Check if challenge is complete
        if (_challengeProgress >= _challengeTarget)
        {
            CompleteChallenge(true);
        }
    }
    
    private void SetupMemoryMatchChallenge()
    {
        // Show memory match panel
        if (_memoryMatchPanel != null)
        {
            _memoryMatchPanel.SetActive(true);
            
            // Find memory buttons
            _memoryButtons.Clear();
            for (int i = 0; i < 4; i++)
            {
                Button button = _memoryMatchPanel.transform.Find($"Button{i+1}")?.GetComponent<Button>();
                if (button != null)
                {
                    _memoryButtons.Add(button);
                    int buttonIndex = i;
                    button.onClick.RemoveAllListeners();
                    button.onClick.AddListener(() => MemoryButtonPressed(buttonIndex));
                    button.interactable = false;
                }
            }
            
            // Hide action button
            if (_actionButton != null)
                _actionButton.gameObject.SetActive(false);
                
            // Start showing sequence
            StartCoroutine(ShowMemorySequence());
        }
    }
    
    private IEnumerator ShowMemorySequence()
    {
        _isShowingSequence = true;
        
        // Generate random sequence
        _memorySequence.Clear();
        for (int i = 0; i < _memorySequenceLength; i++)
        {
            _memorySequence.Add(Random.Range(0, 4));
        }
        
        yield return new WaitForSeconds(1f);
        
        // Show sequence to player
        for (int i = 0; i < _memorySequence.Count; i++)
        {
            int buttonIndex = _memorySequence[i];
            
            // Highlight button
            if (buttonIndex < _memoryButtons.Count)
            {
                ColorBlock colors = _memoryButtons[buttonIndex].colors;
                Color normalColor = colors.normalColor;
                colors.normalColor = Color.yellow;
                _memoryButtons[buttonIndex].colors = colors;
                
                yield return new WaitForSeconds(0.5f);
                
                // Reset color
                colors.normalColor = normalColor;
                _memoryButtons[buttonIndex].colors = colors;
                
                yield return new WaitForSeconds(0.3f);
            }
        }
        
        // Enable buttons for player input
        foreach (var button in _memoryButtons)
        {
            button.interactable = true;
        }
        
        _playerInputSequence.Clear();
        _isShowingSequence = false;
    }
    
    private void MemoryButtonPressed(int buttonIndex)
    {
        if (_isShowingSequence) return;
        
        _playerInputSequence.Add(buttonIndex);
        
        // Highlight pressed button
        if (buttonIndex < _memoryButtons.Count)
        {
            StartCoroutine(HighlightButton(_memoryButtons[buttonIndex]));
        }
        
        // Check if sequence is complete
        if (_playerInputSequence.Count == _memorySequence.Count)
        {
            // Check if sequence is correct
            bool correct = true;
            for (int i = 0; i < _memorySequence.Count; i++)
            {
                if (_playerInputSequence[i] != _memorySequence[i])
                {
                    correct = false;
                    break;
                }
            }
            
            if (correct)
            {
                // Increase progress
                _challengeProgress += 20f;
                
                // Update progress bar
                if (_progressBar != null)
                {
                    _progressBar.value = _challengeProgress;
                }
                
                // Increase sequence length
                _memorySequenceLength++;
                
                // Check if challenge is complete
                if (_challengeProgress >= _challengeTarget)
                {
                    CompleteChallenge(true);
                }
                else
                {
                    // Show next sequence
                    StartCoroutine(ShowMemorySequence());
                }
            }
            else
            {
                // Wrong sequence - penalty
                _challengeProgress = Mathf.Max(0, _challengeProgress - 10f);
                
                // Update progress bar
                if (_progressBar != null)
                {
                    _progressBar.value = _challengeProgress;
                }
                
                // Show next sequence
                StartCoroutine(ShowMemorySequence());
            }
            
            // Disable buttons until next sequence
            foreach (var button in _memoryButtons)
            {
                button.interactable = false;
            }
        }
    }
    
    private IEnumerator HighlightButton(Button button)
    {
        ColorBlock colors = button.colors;
        Color normalColor = colors.normalColor;
        colors.normalColor = Color.yellow;
        button.colors = colors;
        
        yield return new WaitForSeconds(0.2f);
        
        // Reset color
        colors.normalColor = normalColor;
        button.colors = colors;
    }
    
    private void SetupSliderChallenge()
    {
        // Show slider challenge panel
        if (_sliderChallengePanel != null)
        {
            _sliderChallengePanel.SetActive(true);
            
            // Get slider component
            _challengeSlider = _sliderChallengePanel.GetComponentInChildren<Slider>();
            if (_challengeSlider != null)
            {
                _challengeSlider.value = 0;
                
                // Set up target zone
                RectTransform targetZone = _sliderChallengePanel.transform.Find("TargetZone")?.GetComponent<RectTransform>();
                if (targetZone != null)
                {
                    // Position target zone randomly
                    _targetValue = Random.Range(0.3f, 0.7f);
                    float width = ((RectTransform)_challengeSlider.transform).rect.width;
                    float xPos = width * _targetValue;
                    targetZone.anchoredPosition = new Vector2(xPos, targetZone.anchoredPosition.y);
                }
            }
            
            // Hide action button
            if (_actionButton != null)
                _actionButton.gameObject.SetActive(false);
                
            // Create stop button
            Button stopButton = _sliderChallengePanel.transform.Find("StopButton")?.GetComponent<Button>();
            if (stopButton != null)
            {
                stopButton.onClick.RemoveAllListeners();
                stopButton.onClick.AddListener(OnSliderStopPressed);
            }
            
            // Start moving slider
            _isSliderMoving = true;
        }
    }
    
    private void OnSliderStopPressed()
    {
        if (!_isSliderMoving) return;
        
        _isSliderMoving = false;
        
        // Calculate how close to target
        float distance = Mathf.Abs(_challengeSlider.value - _targetValue);
        float accuracy = 1f - (distance / 0.5f); // 0.5 is max possible distance
        accuracy = Mathf.Clamp01(accuracy);
        
        // Award progress based on accuracy
        float progressGain = 50f * accuracy;
        _challengeProgress += progressGain;
        
        // Update progress bar
        if (_progressBar != null)
        {
            _progressBar.value = _challengeProgress;
        }
        
        // Show accuracy text
        TMP_Text accuracyText = _sliderChallengePanel.transform.Find("AccuracyText")?.GetComponent<TMP_Text>();
        if (accuracyText != null)
        {
            int percentage = Mathf.RoundToInt(accuracy * 100);
            accuracyText.text = $"Accuracy: {percentage}%\nPoints: +{Mathf.RoundToInt(progressGain)}";
            accuracyText.gameObject.SetActive(true);
        }
        
        // Check if challenge is complete
        if (_challengeProgress >= _challengeTarget)
        {
            CompleteChallenge(true);
        }
        else
        {
            // Start next round after delay
            StartCoroutine(StartNextSliderRound());
        }
    }
    
    private IEnumerator StartNextSliderRound()
    {
        yield return new WaitForSeconds(1.5f);
        
        // Hide accuracy text
        TMP_Text accuracyText = _sliderChallengePanel.transform.Find("AccuracyText")?.GetComponent<TMP_Text>();
        if (accuracyText != null)
        {
            accuracyText.gameObject.SetActive(false);
        }
        
        // Reset slider value
        if (_challengeSlider != null)
        {
            _challengeSlider.value = 0;
        }
        
        // Move target zone
        RectTransform targetZone = _sliderChallengePanel.transform.Find("TargetZone")?.GetComponent<RectTransform>();
        if (targetZone != null)
        {
            // Position target zone randomly
            _targetValue = Random.Range(0.3f, 0.7f);
            float width = ((RectTransform)_challengeSlider.transform).rect.width;
            float xPos = width * _targetValue;
            targetZone.anchoredPosition = new Vector2(xPos, targetZone.anchoredPosition.y);
        }
        
        // Increase speed for additional difficulty
        _sliderSpeed += 0.1f;
        
        // Resume slider movement
        _isSliderMoving = true;
    }
    
    private IEnumerator UpdateAIProgress()
    {
        GameManager.GamePhase gamePhase = GameManager.Instance.GetCurrentPhase();
        SurvivorData playerSurvivor = GameManager.Instance.GetPlayerSurvivor();
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        
        while (_challengeActive)
        {
            yield return new WaitForSeconds(0.5f);
            
            if (gamePhase == GameManager.GamePhase.PreMerge)
            {
                // Update tribe progress
                List<TribeData> tribes = GameManager.Instance.GetTribes();
                int tribeIndex = 0;
                
                foreach (var tribe in tribes)
                {
                    if (tribe == playerTribe) continue;
                    
                    // Calculate progress increment based on tribe stats
                    float statMultiplier = 1.0f;
                    ChallengeSystem.Challenge currentChallenge = GetComponent<ChallengeSystem>()._currentChallenge;
                    
                    if (currentChallenge != null)
                    {
                        switch (currentChallenge.PrimaryStat)
                        {
                            case ChallengeSystem.StatType.Physical:
                                statMultiplier = tribe.GetAveragePhysicalStat() / 100f;
                                break;
                            case ChallengeSystem.StatType.Mental:
                                statMultiplier = tribe.GetAverageMentalStat() / 100f;
                                break;
                            case ChallengeSystem.StatType.Personality:
                                statMultiplier = tribe.GetAveragePersonalityStat() / 100f;
                                break;
                        }
                    }
                    
                    // Apply resource factor
                    float resourceFactor = tribe.GetResourceFactor();
                    
                    // Calculate increment
                    float increment = 5f * statMultiplier * resourceFactor;
                    
                    // Add some randomness
                    increment *= Random.Range(0.8f, 1.2f);
                    
                    // Update tribe progress
                    tribe.FireChange += Mathf.RoundToInt(increment);
                    
                    // Update UI
                    if (_competitorsContainer != null && tribeIndex < _competitorsContainer.childCount)
                    {
                        Slider progressBar = _competitorsContainer.GetChild(tribeIndex).GetComponentInChildren<Slider>();
                        if (progressBar != null)
                        {
                            progressBar.value = tribe.FireChange;
                        }
                    }
                    
                    // Check if any tribe completed the challenge
                    if (tribe.FireChange >= _challengeTarget)
                    {
                        CompleteChallenge(false, tribe);
                        yield break;
                    }
                    
                    tribeIndex++;
                }
            }
            else
            {
                // Update individual progress
                foreach (var pair in _competitorProgress)
                {
                    SurvivorData survivor = pair.Key;
                    
                    if (survivor == playerSurvivor) continue;
                    
                    // Calculate progress based on survivor stats
                    float statMultiplier = 1.0f;
                    ChallengeSystem.Challenge currentChallenge = GetComponent<ChallengeSystem>()._currentChallenge;
                    
                    if (currentChallenge != null)
                    {
                        switch (currentChallenge.PrimaryStat)
                        {
                            case ChallengeSystem.StatType.Physical:
                                statMultiplier = survivor.PhysicalStat / 100f;
                                break;
                            case ChallengeSystem.StatType.Mental:
                                statMultiplier = survivor.MentalStat / 100f;
                                break;
                            case ChallengeSystem.StatType.Personality:
                                statMultiplier = survivor.PersonalityStat / 100f;
                                break;
                        }
                    }
                    
                    // Calculate increment
                    float increment = 5f * statMultiplier;
                    
                    // Add some randomness
                    increment *= Random.Range(0.8f, 1.2f);
                    
                    // Update survivor progress
                    _competitorProgress[survivor] += increment;
                    
                    // Update UI
                    int index = 0;
                    foreach (Transform child in _competitorsContainer)
                    {
                        TMP_Text nameText = child.GetComponentInChildren<TMP_Text>();
                        if (nameText != null && nameText.text == survivor.Name)
                        {
                            Slider progressBar = child.GetComponentInChildren<Slider>();
                            if (progressBar != null)
                            {
                                progressBar.value = _competitorProgress[survivor];
                            }
                            break;
                        }
                        index++;
                    }
                    
                    // Check if any survivor completed the challenge
                    if (_competitorProgress[survivor] >= _challengeTarget)
                    {
                        CompleteChallenge(false, null, survivor);
                        yield break;
                    }
                }
            }
        }
    }
    
    private void Update()
    {
        // Update slider challenge
        if (_isSliderMoving && _challengeSlider != null)
        {
            float newValue = _challengeSlider.value + Time.deltaTime * _sliderSpeed;
            if (newValue > 1f)
            {
                newValue = 0f;
            }
            _challengeSlider.value = newValue;
        }
    }
    
    private void CompleteChallenge(bool playerWon, TribeData winningTribe = null, SurvivorData winningSurvivor = null)
    {
        _challengeActive = false;
        
        if (_aiProgressCoroutine != null)
        {
            StopCoroutine(_aiProgressCoroutine);
            _aiProgressCoroutine = null;
        }
        
        // Hide challenge UI
        if (_tapChallengePanel != null)
            _tapChallengePanel.SetActive(false);
        if (_memoryMatchPanel != null)
            _memoryMatchPanel.SetActive(false);
        if (_sliderChallengePanel != null)
            _sliderChallengePanel.SetActive(false);
        
        // Show result panel
        if (_challengeResultPanel != null)
            _challengeResultPanel.SetActive(true);
            
        // Set result text
        if (_challengeResultText != null)
        {
            GameManager.GamePhase gamePhase = GameManager.Instance.GetCurrentPhase();
            
            if (gamePhase == GameManager.GamePhase.PreMerge)
            {
                // Tribe challenge
                TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
                
                if (playerWon)
                {
                    winningTribe = playerTribe;
                }
                
                if (winningTribe != null)
                {
                    _challengeResultText.text = $"{winningTribe.TribeName} Tribe wins immunity!";
                    
                    if (winningTribe == playerTribe)
                    {
                        _challengeResultText.text += "\n\nYour tribe is safe from Tribal Council tonight.";
                    }
                    else
                    {
                        _challengeResultText.text += "\n\nYour tribe must attend Tribal Council tonight.";
                    }
                    
                    // Apply immunity to winning tribe
                    foreach (var member in winningTribe.Members)
                    {
                        member.GiveImmunity();
                    }
                }
            }
            else
            {
                // Individual challenge
                SurvivorData playerSurvivor = GameManager.Instance.GetPlayerSurvivor();
                
                if (playerWon)
                {
                    winningSurvivor = playerSurvivor;
                }
                
                if (winningSurvivor != null)
                {
                    _challengeResultText.text = $"{winningSurvivor.Name} wins individual immunity!";
                    
                    if (winningSurvivor == playerSurvivor)
                    {
                        _challengeResultText.text += "\n\nYou are safe from Tribal Council tonight.";
                    }
                    else
                    {
                        _challengeResultText.text += "\n\nYou are at risk in tonight's Tribal Council.";
                    }
                    
                    // Apply immunity to winner
                    winningSurvivor.GiveImmunity();
                }
            }
        }
        
        // Show continue button
        if (_actionButton != null)
        {
            _actionButton.gameObject.SetActive(true);
            _actionButton.onClick.RemoveAllListeners();
            _actionButtonText.text = "Continue";
            _actionButton.onClick.AddListener(() => {
                // Determine which state to go to next
                GameManager.GameState nextState = GameManager.GameState.TribalCouncil;
                
                // If player's tribe won immunity in pre-merge phase
                if (GameManager.Instance.GetCurrentPhase() == GameManager.GamePhase.PreMerge)
                {
                    TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
                    bool playerTribesHasImmunity = false;
                    
                    foreach (var member in playerTribe.Members)
                    {
                        if (member.HasImmunity)
                        {
                            playerTribesHasImmunity = true;
                            break;
                        }
                    }
                    
                    if (playerTribesHasImmunity)
                    {
                        // Skip tribal council, go to next day
                        foreach (var member in playerTribe.Members)
                        {
                            member.RemoveImmunity();
                        }
                        GameManager.Instance.SetGameState(GameManager.GameState.Camp);
                        return;
                    }
                }
                
                // Proceed to tribal council
                GameManager.Instance.SetGameState(nextState);
            });
        }
    }
}
