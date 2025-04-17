using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Manages the final tribal council jury vote
/// </summary>
public class JuryVoteScreen : MonoBehaviour
{
    [SerializeField] private TMP_Text _titleText;
    [SerializeField] private TMP_Text _descriptionText;
    [SerializeField] private Transform _finalistsContainer;
    [SerializeField] private GameObject _finalistPrefab;
    [SerializeField] private Transform _juryContainer;
    [SerializeField] private GameObject _juryMemberPrefab;
    [SerializeField] private Button _continueButton;
    [SerializeField] private TMP_Text _continueButtonText;
    [SerializeField] private GameObject _votingPanel;
    [SerializeField] private GameObject _resultsPanel;
    [SerializeField] private TMP_Text _resultsTitleText;
    [SerializeField] private TMP_Text _resultsText;
    [SerializeField] private GameObject _gameOverPanel;
    [SerializeField] private TMP_Text _gameOverText;
    [SerializeField] private Button _restartButton;
    [SerializeField] private ParticleSystem _confettiParticles;
    
    private List<SurvivorData> _finalists = new List<SurvivorData>();
    private List<SurvivorData> _jury = new List<SurvivorData>();
    private Dictionary<SurvivorData, SurvivorData> _juryVotes = new Dictionary<SurvivorData, SurvivorData>();
    private SurvivorData _winner;
    private bool _isGameOver = false;
    private enum JuryPhase { Introduction, Questions, Voting, Results }
    private JuryPhase _currentPhase = JuryPhase.Introduction;
    
    private void OnEnable()
    {
        // Check if this is for final tribal or game over
        _isGameOver = GameManager.Instance.GetCurrentState() == GameManager.GameState.GameOver;
        
        if (_isGameOver)
        {
            SetupGameOverScreen();
        }
        else
        {
            SetupFinalTribalCouncil();
        }
    }
    
    private void SetupGameOverScreen()
    {
        // Hide main jury panels
        if (_votingPanel != null)
            _votingPanel.SetActive(false);
            
        if (_resultsPanel != null)
            _resultsPanel.SetActive(false);
            
        // Show game over panel
        if (_gameOverPanel != null)
        {
            _gameOverPanel.SetActive(true);
            
            // Set game over text
            if (_gameOverText != null)
            {
                SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
                int currentDay = GameManager.Instance.GetCurrentDay();
                
                _gameOverText.text = $"Game Over\n\n" +
                                    $"You ({player.Name}) have been voted off Survivor Island!\n\n" +
                                    $"You survived for {currentDay} days.";
            }
            
            // Set up restart button
            if (_restartButton != null)
            {
                _restartButton.onClick.RemoveAllListeners();
                _restartButton.onClick.AddListener(() => {
                    // Reload the game
                    UnityEngine.SceneManagement.SceneManager.LoadScene(0);
                });
            }
        }
    }
    
    private void SetupFinalTribalCouncil()
    {
        // Reset state
        _currentPhase = JuryPhase.Introduction;
        _juryVotes.Clear();
        _winner = null;
        
        // Get finalists and jury
        GetFinalistsAndJury();
        
        // Show voting panel, hide results and game over
        if (_votingPanel != null)
            _votingPanel.SetActive(true);
            
        if (_resultsPanel != null)
            _resultsPanel.SetActive(false);
            
        if (_gameOverPanel != null)
            _gameOverPanel.SetActive(false);
            
        // Set up title and description
        if (_titleText != null)
        {
            _titleText.text = "Final Tribal Council";
        }
        
        if (_descriptionText != null)
        {
            _descriptionText.text = "The final survivors face the jury, who will vote for the winner of Survivor Island!";
        }
        
        // Create finalists display
        CreateFinalistsDisplay();
        
        // Create jury display
        CreateJuryDisplay();
        
        // Set up continue button
        if (_continueButton != null)
        {
            _continueButton.onClick.RemoveAllListeners();
            _continueButton.onClick.AddListener(AdvanceJuryPhase);
            
            if (_continueButtonText != null)
                _continueButtonText.text = "Continue";
        }
    }
    
    private void GetFinalistsAndJury()
    {
        _finalists.Clear();
        _jury = new List<SurvivorData>(GameManager.Instance.GetJury());
        
        // Get all remaining survivors as finalists
        foreach (var tribe in GameManager.Instance.GetTribes())
        {
            _finalists.AddRange(tribe.Members);
        }
    }
    
    private void CreateFinalistsDisplay()
    {
        if (_finalistsContainer == null || _finalistPrefab == null)
            return;
            
        // Clear existing finalists
        foreach (Transform child in _finalistsContainer)
        {
            Destroy(child.gameObject);
        }
        
        // Create a display for each finalist
        foreach (var finalist in _finalists)
        {
            GameObject finalistObj = Instantiate(_finalistPrefab, _finalistsContainer);
            
            // Set name
            TMP_Text nameText = finalistObj.transform.Find("NameText")?.GetComponent<TMP_Text>();
            if (nameText != null)
            {
                nameText.text = finalist.Name;
                
                // Highlight player
                if (finalist.IsPlayer)
                {
                    nameText.color = Color.yellow;
                    nameText.fontStyle = FontStyles.Bold;
                }
            }
            
            // Set stats
            TMP_Text statsText = finalistObj.transform.Find("StatsText")?.GetComponent<TMP_Text>();
            if (statsText != null)
            {
                statsText.text = $"Physical: {finalist.PhysicalStat}\n" +
                                $"Mental: {finalist.MentalStat}\n" +
                                $"Social: {finalist.PersonalityStat}";
            }
            
            // Set image
            Image portraitImage = finalistObj.transform.Find("PortraitImage")?.GetComponent<Image>();
            if (portraitImage != null)
            {
                // Use different color for player
                portraitImage.color = finalist.IsPlayer ? Color.blue : Color.white;
            }
        }
    }
    
    private void CreateJuryDisplay()
    {
        if (_juryContainer == null || _juryMemberPrefab == null)
            return;
            
        // Clear existing jury members
        foreach (Transform child in _juryContainer)
        {
            Destroy(child.gameObject);
        }
        
        // Create a display for each jury member
        foreach (var juryMember in _jury)
        {
            GameObject juryObj = Instantiate(_juryMemberPrefab, _juryContainer);
            
            // Set name
            TMP_Text nameText = juryObj.GetComponentInChildren<TMP_Text>();
            if (nameText != null)
            {
                nameText.text = juryMember.Name;
            }
            
            // Set image
            Image portraitImage = juryObj.GetComponent<Image>();
            if (portraitImage != null)
            {
                // Use gray color for jury members
                portraitImage.color = Color.gray;
            }
        }
    }
    
    private void AdvanceJuryPhase()
    {
        switch (_currentPhase)
        {
            case JuryPhase.Introduction:
                StartJuryQuestions();
                break;
            case JuryPhase.Questions:
                StartJuryVoting();
                break;
            case JuryPhase.Voting:
                ShowVoteResults();
                break;
            case JuryPhase.Results:
                EndGame();
                break;
        }
    }
    
    private void StartJuryQuestions()
    {
        _currentPhase = JuryPhase.Questions;
        
        // Update description text
        if (_descriptionText != null)
        {
            _descriptionText.text = "The jury members take turns asking questions...\n";
            
            // Generate some jury questions/statements
            for (int i = 0; i < Mathf.Min(3, _jury.Count); i++)
            {
                SurvivorData juryMember = _jury[i];
                
                string[] questions = {
                    $"{juryMember.Name}: \"Why do you think you deserve to win over the others?\"",
                    $"{juryMember.Name}: \"What was your biggest move in the game?\"",
                    $"{juryMember.Name}: \"How did your strategy evolve throughout the game?\"",
                    $"{juryMember.Name}: \"Who did you betray and why?\"",
                    $"{juryMember.Name}: \"What part of your game are you most proud of?\""
                };
                
                _descriptionText.text += "\n" + questions[Random.Range(0, questions.Length)];
            }
        }
        
        // Update button text
        if (_continueButtonText != null)
        {
            _continueButtonText.text = "Proceed to Voting";
        }
    }
    
    private void StartJuryVoting()
    {
        _currentPhase = JuryPhase.Voting;
        
        // Update description text
        if (_descriptionText != null)
        {
            _descriptionText.text = "The jury has cast their votes for the winner...";
        }
        
        // Generate jury votes
        GenerateJuryVotes();
        
        // Update button text
        if (_continueButtonText != null)
        {
            _continueButtonText.text = "Reveal Results";
        }
    }
    
    private void GenerateJuryVotes()
    {
        _juryVotes.Clear();
        
        foreach (var juryMember in _jury)
        {
            float[] voteChances = new float[_finalists.Count];
            float totalChance = 0;
            
            // Calculate vote chances based on relationships
            for (int i = 0; i < _finalists.Count; i++)
            {
                SurvivorData finalist = _finalists[i];
                
                // Base chance on relationship
                int relationship = juryMember.GetRelationship(finalist.Name);
                float chance = relationship;
                
                // Bonus for player (slightly easier to win)
                if (finalist.IsPlayer)
                {
                    chance *= 1.2f;
                }
                
                voteChances[i] = chance;
                totalChance += chance;
            }
            
            // Normalize chances
            for (int i = 0; i < voteChances.Length; i++)
            {
                voteChances[i] /= totalChance;
            }
            
            // Select finalist based on chances
            float random = Random.value;
            float cumulativeChance = 0;
            
            for (int i = 0; i < voteChances.Length; i++)
            {
                cumulativeChance += voteChances[i];
                if (random <= cumulativeChance)
                {
                    _juryVotes[juryMember] = _finalists[i];
                    break;
                }
            }
            
            // Fallback if somehow we didn't select anyone
            if (!_juryVotes.ContainsKey(juryMember))
            {
                _juryVotes[juryMember] = _finalists[0];
            }
        }
    }
    
    private void ShowVoteResults()
    {
        _currentPhase = JuryPhase.Results;
        
        // Hide voting panel, show results panel
        if (_votingPanel != null)
            _votingPanel.SetActive(false);
            
        if (_resultsPanel != null)
            _resultsPanel.SetActive(true);
            
        // Start vote reveal sequence
        StartCoroutine(RevealVotes());
    }
    
    private IEnumerator RevealVotes()
    {
        // Count votes for each finalist
        Dictionary<SurvivorData, int> voteCount = new Dictionary<SurvivorData, int>();
        
        foreach (var vote in _juryVotes)
        {
            if (!voteCount.ContainsKey(vote.Value))
            {
                voteCount[vote.Value] = 0;
            }
            voteCount[vote.Value]++;
        }
        
        // Determine winner
        int highestVotes = 0;
        foreach (var count in voteCount)
        {
            if (count.Value > highestVotes)
            {
                highestVotes = count.Value;
                _winner = count.Key;
            }
        }
        
        // Set results title
        if (_resultsTitleText != null)
        {
            _resultsTitleText.text = "I'll read the votes...";
        }
        
        yield return new WaitForSeconds(2f);
        
        // Create shuffled list of votes for dramatic reveal
        List<KeyValuePair<SurvivorData, SurvivorData>> shuffledVotes = new List<KeyValuePair<SurvivorData, SurvivorData>>(_juryVotes);
        for (int i = 0; i < shuffledVotes.Count; i++)
        {
            int randomIndex = Random.Range(i, shuffledVotes.Count);
            KeyValuePair<SurvivorData, SurvivorData> temp = shuffledVotes[i];
            shuffledVotes[i] = shuffledVotes[randomIndex];
            shuffledVotes[randomIndex] = temp;
        }
        
        // Track running count for winner calculation on the fly
        Dictionary<SurvivorData, int> runningCount = new Dictionary<SurvivorData, int>();
        int votesNeeded = Mathf.CeilToInt(_jury.Count / 2f);
        
        // Reveal votes one by one
        for (int i = 0; i < shuffledVotes.Count; i++)
        {
            SurvivorData juryMember = shuffledVotes[i].Key;
            SurvivorData finalist = shuffledVotes[i].Value;
            
            // Update running count
            if (!runningCount.ContainsKey(finalist))
            {
                runningCount[finalist] = 0;
            }
            runningCount[finalist]++;
            
            // Update results text
            if (_resultsText != null)
            {
                _resultsText.text += $"{juryMember.Name} votes for {finalist.Name}\n";
            }
            
            // Check if we have a winner
            if (runningCount[finalist] >= votesNeeded)
            {
                // Only break early if more than half of votes are revealed
                if (i >= shuffledVotes.Count / 2)
                {
                    break;
                }
            }
            
            yield return new WaitForSeconds(1.5f);
        }
        
        yield return new WaitForSeconds(2f);
        
        // Announce winner
        if (_resultsTitleText != null)
        {
            _resultsTitleText.text = "The winner of Survivor Island is...";
        }
        
        yield return new WaitForSeconds(2f);
        
        if (_resultsTitleText != null)
        {
            _resultsTitleText.text = $"{_winner.Name}!";
            
            // Special message if player won
            if (_winner.IsPlayer)
            {
                _resultsText.text += "\n\nCongratulations! You have won Survivor Island!";
            }
            else
            {
                _resultsText.text += $"\n\n{_winner.Name} has won Survivor Island!";
            }
        }
        
        // Play confetti if player won
        if (_winner.IsPlayer && _confettiParticles != null)
        {
            _confettiParticles.Play();
        }
        
        // Show continue button
        if (_continueButton != null)
        {
            _continueButton.gameObject.SetActive(true);
            
            if (_continueButtonText != null)
            {
                _continueButtonText.text = "Finish Game";
            }
        }
    }
    
    private void EndGame()
    {
        // Show game stats and allow restart
        if (_resultsPanel != null)
            _resultsPanel.SetActive(false);
            
        if (_gameOverPanel != null)
        {
            _gameOverPanel.SetActive(true);
            
            // Set game over text
            if (_gameOverText != null)
            {
                SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
                int currentDay = GameManager.Instance.GetCurrentDay();
                
                if (_winner.IsPlayer)
                {
                    _gameOverText.text = $"Congratulations!\n\n" +
                                        $"You ({player.Name}) have won Survivor Island after {currentDay} days!\n\n" +
                                        $"You outplayed, outwitted, and outlasted all the other survivors.";
                }
                else
                {
                    _gameOverText.text = $"Game Complete\n\n" +
                                        $"{_winner.Name} has won Survivor Island after {currentDay} days.\n\n" +
                                        $"Better luck next time!";
                }
            }
            
            // Set up restart button
            if (_restartButton != null)
            {
                _restartButton.onClick.RemoveAllListeners();
                _restartButton.onClick.AddListener(() => {
                    // Reload the game
                    UnityEngine.SceneManagement.SceneManager.LoadScene(0);
                });
            }
        }
    }
}
