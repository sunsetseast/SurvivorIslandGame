using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Manages immunity challenges and their outcomes
/// </summary>
public class ChallengeSystem : MonoBehaviour
{
    [SerializeField] private List<Challenge> _challenges = new List<Challenge>();
    [SerializeField] private Challenge _currentChallenge;
    
    // UI Elements
    [SerializeField] private Slider _progressBar;
    [SerializeField] private TMP_Text _challengeTitle;
    [SerializeField] private TMP_Text _challengeDescription;
    [SerializeField] private TMP_Text _challengeResult;
    [SerializeField] private Button _challengeButton;
    
    // Challenge gameplay state
    private float _playerProgress = 0f;
    private float _aiProgress = 0f;
    private float _targetProgress = 100f;
    private float _tapIncrement = 5f;
    private float _aiIncrementBase = 3f;
    private bool _challengeActive = false;
    private List<TribeData> _competingTribes = new List<TribeData>();
    private List<SurvivorData> _competingIndividuals = new List<SurvivorData>();
    private SurvivorData _individualWinner;
    private TribeData _tribeWinner;
    
    [System.Serializable]
    public class Challenge
    {
        public string Title;
        public string Description;
        public ChallengeType Type;
        public StatType PrimaryStat;
        public float Difficulty; // 0-1 multiplier for AI performance
        
        public Challenge(string title, string description, ChallengeType type, StatType stat, float difficulty)
        {
            Title = title;
            Description = description;
            Type = type;
            PrimaryStat = stat;
            Difficulty = Mathf.Clamp01(difficulty);
        }
    }
    
    public enum ChallengeType
    {
        Tribe,
        Individual
    }
    
    public enum StatType
    {
        Physical,
        Mental,
        Personality
    }
    
    private void Awake()
    {
        InitializeChallenges();
    }
    
    private void InitializeChallenges()
    {
        // Add physical challenges
        _challenges.Add(new Challenge(
            "Obstacle Course Relay", 
            "Teams must race through a challenging obstacle course, passing a baton between tribe members.",
            ChallengeType.Tribe, 
            StatType.Physical, 
            0.7f
        ));
        
        _challenges.Add(new Challenge(
            "Bucket Brigade", 
            "Fill your tribe's container by passing water buckets down a line. Spill as little as possible!",
            ChallengeType.Tribe, 
            StatType.Physical, 
            0.6f
        ));
        
        _challenges.Add(new Challenge(
            "Blindfolded Maze", 
            "Navigate a complex maze while blindfolded, guided only by your tribe's voice commands.",
            ChallengeType.Tribe, 
            StatType.Physical, 
            0.8f
        ));
        
        // Add mental challenges
        _challenges.Add(new Challenge(
            "Memory Match", 
            "Memorize and match symbols on a board. The tribe with the most matches wins.",
            ChallengeType.Tribe, 
            StatType.Mental, 
            0.7f
        ));
        
        _challenges.Add(new Challenge(
            "Puzzle Assembly", 
            "Race to assemble a complex 3D puzzle that forms your tribe's logo.",
            ChallengeType.Tribe, 
            StatType.Mental, 
            0.6f
        ));
        
        _challenges.Add(new Challenge(
            "Word Scramble", 
            "Unscramble a series of words related to survival, then use the highlighted letters to solve a final phrase.",
            ChallengeType.Tribe, 
            StatType.Mental, 
            0.5f
        ));
        
        // Add physical individual challenges
        _challenges.Add(new Challenge(
            "Endurance Hold", 
            "Hold your position on an increasingly unstable platform. Last person standing wins immunity.",
            ChallengeType.Individual, 
            StatType.Physical, 
            0.7f
        ));
        
        _challenges.Add(new Challenge(
            "Balance Beam", 
            "Cross a series of narrow balance beams while collecting keys. First to finish wins immunity.",
            ChallengeType.Individual, 
            StatType.Physical, 
            0.6f
        ));
        
        // Add mental individual challenges
        _challenges.Add(new Challenge(
            "Memory Sequence", 
            "Memorize and repeat an ever-growing sequence of symbols. Last person standing wins immunity.",
            ChallengeType.Individual, 
            StatType.Mental, 
            0.8f
        ));
        
        _challenges.Add(new Challenge(
            "Survivor Sudoku", 
            "Complete a Survivor-themed number puzzle. First to finish correctly wins immunity.",
            ChallengeType.Individual, 
            StatType.Mental, 
            0.7f
        ));
    }
    
    /// <summary>
    /// Start a new challenge
    /// </summary>
    public void StartChallenge()
    {
        // Determine challenge type based on game phase
        ChallengeType challengeType = GameManager.Instance.GetCurrentPhase() == GameManager.GamePhase.PreMerge 
            ? ChallengeType.Tribe 
            : ChallengeType.Individual;
            
        // Filter challenges by type
        List<Challenge> eligibleChallenges = _challenges.FindAll(c => c.Type == challengeType);
        
        // Select a random challenge
        _currentChallenge = eligibleChallenges[Random.Range(0, eligibleChallenges.Count)];
        
        // Reset progress values
        _playerProgress = 0f;
        _aiProgress = 0f;
        _challengeActive = true;
        
        // Determine competitors
        if (challengeType == ChallengeType.Tribe)
        {
            _competingTribes = GameManager.Instance.GetTribes();
            _competingIndividuals.Clear();
        }
        else
        {
            _competingTribes.Clear();
            _competingIndividuals = new List<SurvivorData>();
            
            // Add all remaining survivors
            foreach (var tribe in GameManager.Instance.GetTribes())
            {
                _competingIndividuals.AddRange(tribe.Members);
            }
        }
        
        // Set up UI
        if (_challengeTitle != null)
            _challengeTitle.text = _currentChallenge.Title;
            
        if (_challengeDescription != null)
            _challengeDescription.text = _currentChallenge.Description;
            
        if (_challengeResult != null)
            _challengeResult.gameObject.SetActive(false);
            
        if (_progressBar != null)
        {
            _progressBar.value = 0;
            _progressBar.maxValue = _targetProgress;
        }
        
        if (_challengeButton != null)
        {
            _challengeButton.interactable = true;
            _challengeButton.onClick.RemoveAllListeners();
            _challengeButton.onClick.AddListener(OnChallengeButtonPressed);
        }
    }
    
    private void OnChallengeButtonPressed()
    {
        if (!_challengeActive) return;
        
        // Increment player progress
        _playerProgress += _tapIncrement;
        
        // Update progress bar
        if (_progressBar != null)
        {
            _progressBar.value = _playerProgress;
        }
        
        // Check if challenge is complete
        if (_playerProgress >= _targetProgress)
        {
            CompleteChallenge(true);
        }
    }
    
    /// <summary>
    /// Update AI competitors during challenge
    /// </summary>
    private void Update()
    {
        if (!_challengeActive) return;
        
        // Only update AI every 0.5 seconds
        if (Time.frameCount % 30 != 0) return;
        
        // Calculate AI progress increment based on challenge type
        if (_currentChallenge.Type == ChallengeType.Tribe)
        {
            UpdateTribeChallenge();
        }
        else
        {
            UpdateIndividualChallenge();
        }
    }
    
    private void UpdateTribeChallenge()
    {
        // Find player's tribe
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        
        // Update progress for other tribes
        foreach (var tribe in _competingTribes)
        {
            if (tribe == playerTribe) continue;
            
            // Calculate progress based on tribe stats
            float statMultiplier = 1.0f;
            switch (_currentChallenge.PrimaryStat)
            {
                case StatType.Physical:
                    statMultiplier = tribe.GetAveragePhysicalStat() / 100f;
                    break;
                case StatType.Mental:
                    statMultiplier = tribe.GetAverageMentalStat() / 100f;
                    break;
                case StatType.Personality:
                    statMultiplier = tribe.GetAveragePersonalityStat() / 100f;
                    break;
            }
            
            // Apply resource factor
            float resourceFactor = tribe.GetResourceFactor();
            
            // Calculate increment
            float increment = _aiIncrementBase * statMultiplier * resourceFactor * _currentChallenge.Difficulty;
            
            // Add some randomness
            increment *= Random.Range(0.8f, 1.2f);
            
            // Update tribe progress
            tribe.FireChange = Mathf.RoundToInt(increment);
            
            // Check if any tribe completed the challenge
            if (tribe.FireChange >= _targetProgress)
            {
                _tribeWinner = tribe;
                CompleteChallenge(false);
                break;
            }
        }
        
        // Check if player's tribe is close to winning/losing for dramatic effect
        if (_challengeActive && playerTribe != null)
        {
            float closestTribeProgress = 0f;
            foreach (var tribe in _competingTribes)
            {
                if (tribe != playerTribe && tribe.FireChange > closestTribeProgress)
                {
                    closestTribeProgress = tribe.FireChange;
                }
            }
            
            // If any tribe is within 80% of completion, show warning
            if (closestTribeProgress >= _targetProgress * 0.8f && _playerProgress < closestTribeProgress)
            {
                if (_challengeDescription != null)
                {
                    _challengeDescription.text = "Another tribe is close to finishing! Tap faster!";
                }
            }
        }
    }
    
    private void UpdateIndividualChallenge()
    {
        SurvivorData playerSurvivor = GameManager.Instance.GetPlayerSurvivor();
        
        // Update progress for other survivors
        foreach (var survivor in _competingIndividuals)
        {
            if (survivor == playerSurvivor) continue;
            
            // Calculate progress based on survivor stats
            float statMultiplier = 1.0f;
            switch (_currentChallenge.PrimaryStat)
            {
                case StatType.Physical:
                    statMultiplier = survivor.PhysicalStat / 100f;
                    break;
                case StatType.Mental:
                    statMultiplier = survivor.MentalStat / 100f;
                    break;
                case StatType.Personality:
                    statMultiplier = survivor.PersonalityStat / 100f;
                    break;
            }
            
            // Calculate increment
            float increment = _aiIncrementBase * statMultiplier * _currentChallenge.Difficulty;
            
            // Add some randomness
            increment *= Random.Range(0.8f, 1.2f);
            
            // Track survivor progress
            survivor.PhysicalStat = Mathf.RoundToInt(survivor.PhysicalStat + increment);
            
            // Check if any survivor completed the challenge
            if (survivor.PhysicalStat >= _targetProgress)
            {
                _individualWinner = survivor;
                CompleteChallenge(false);
                break;
            }
        }
    }
    
    private void CompleteChallenge(bool playerWon)
    {
        _challengeActive = false;
        
        if (_challengeButton != null)
        {
            _challengeButton.interactable = false;
        }
        
        if (_currentChallenge.Type == ChallengeType.Tribe)
        {
            CompleteTribeChallenge(playerWon);
        }
        else
        {
            CompleteIndividualChallenge(playerWon);
        }
        
        // Show continue button after 2 seconds
        StartCoroutine(ShowContinueButton());
    }
    
    private void CompleteTribeChallenge(bool playerWon)
    {
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        
        if (playerWon)
        {
            _tribeWinner = playerTribe;
        }
        
        // Apply immunity to winning tribe
        foreach (var member in _tribeWinner.Members)
        {
            member.GiveImmunity();
        }
        
        // Show result
        if (_challengeResult != null)
        {
            _challengeResult.gameObject.SetActive(true);
            _challengeResult.text = $"{_tribeWinner.TribeName} Tribe wins immunity!";
            
            if (_tribeWinner == playerTribe)
            {
                _challengeResult.text += "\nYour tribe is safe from Tribal Council tonight.";
            }
            else
            {
                _challengeResult.text += "\nYour tribe must attend Tribal Council tonight.";
            }
        }
    }
    
    private void CompleteIndividualChallenge(bool playerWon)
    {
        SurvivorData playerSurvivor = GameManager.Instance.GetPlayerSurvivor();
        
        if (playerWon)
        {
            _individualWinner = playerSurvivor;
        }
        
        // Apply immunity to winner
        _individualWinner.GiveImmunity();
        
        // Show result
        if (_challengeResult != null)
        {
            _challengeResult.gameObject.SetActive(true);
            _challengeResult.text = $"{_individualWinner.Name} wins individual immunity!";
            
            if (_individualWinner == playerSurvivor)
            {
                _challengeResult.text += "\nYou are safe from Tribal Council tonight.";
            }
        }
    }
    
    private IEnumerator ShowContinueButton()
    {
        yield return new WaitForSeconds(2f);
        
        // Add continue button
        if (_challengeButton != null)
        {
            _challengeButton.interactable = true;
            _challengeButton.GetComponentInChildren<TMP_Text>().text = "Continue";
            _challengeButton.onClick.RemoveAllListeners();
            _challengeButton.onClick.AddListener(() => {
                // Determine which state to go to next
                GameManager.GameState nextState = GameManager.GameState.TribalCouncil;
                
                // If player's tribe won immunity in pre-merge phase
                if (_currentChallenge.Type == ChallengeType.Tribe && 
                    _tribeWinner == GameManager.Instance.GetPlayerTribe() &&
                    GameManager.Instance.GetCurrentPhase() == GameManager.GamePhase.PreMerge)
                {
                    // Skip tribal council, go to next day
                    GameManager.Instance.GetPlayerTribe().GetPlayerMember().RemoveImmunity();
                    GameManager.Instance.SetGameState(GameManager.GameState.Camp);
                }
                else
                {
                    // Proceed to tribal council
                    GameManager.Instance.SetGameState(nextState);
                }
            });
        }
    }
    
    /// <summary>
    /// Get list of survivors who have immunity
    /// </summary>
    public List<SurvivorData> GetImmunePlayers()
    {
        List<SurvivorData> immunePlayers = new List<SurvivorData>();
        
        foreach (var tribe in GameManager.Instance.GetTribes())
        {
            foreach (var member in tribe.Members)
            {
                if (member.HasImmunity)
                {
                    immunePlayers.Add(member);
                }
            }
        }
        
        return immunePlayers;
    }
    
    /// <summary>
    /// Reset immunity status for all survivors
    /// </summary>
    public void ResetImmunity()
    {
        foreach (var tribe in GameManager.Instance.GetTribes())
        {
            foreach (var member in tribe.Members)
            {
                member.RemoveImmunity();
            }
        }
    }
}
