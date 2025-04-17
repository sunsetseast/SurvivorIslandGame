using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Manages tribal council voting and elimination process
/// </summary>
public class TribalCouncilSystem : MonoBehaviour
{
    // UI Elements
    [SerializeField] private Transform _survivorGridContainer;
    [SerializeField] private GameObject _survivorPortraitPrefab;
    [SerializeField] private TMP_Text _tribalCouncilText;
    [SerializeField] private Button _castVoteButton;
    [SerializeField] private GameObject _votingContainer;
    [SerializeField] private GameObject _resultsContainer;
    [SerializeField] private GameObject _idolPlayButton;
    
    // Tribal Council state
    private TribeData _currentTribe;
    private List<SurvivorData> _immunePlayers = new List<SurvivorData>();
    private Dictionary<SurvivorData, SurvivorData> _votes = new Dictionary<SurvivorData, SurvivorData>();
    private SurvivorData _selectedVoteTarget;
    private SurvivorData _eliminatedSurvivor;
    private bool _finalTribalCouncil = false;
    private bool _idolPlayed = false;
    
    /// <summary>
    /// Prepare for tribal council
    /// </summary>
    public void PrepareTribalCouncil()
    {
        _finalTribalCouncil = false;
        _idolPlayed = false;
        _votes.Clear();
        _selectedVoteTarget = null;
        
        // Determine which tribe is going to tribal council
        if (GameManager.Instance.GetCurrentPhase() == GameManager.GamePhase.PreMerge)
        {
            // In pre-merge, the player's tribe always goes to tribal if they didn't win immunity
            _currentTribe = GameManager.Instance.GetPlayerTribe();
            
            // Check if any tribe member has immunity
            _immunePlayers = new List<SurvivorData>();
            foreach (var member in _currentTribe.Members)
            {
                if (member.HasImmunity)
                {
                    _immunePlayers.Add(member);
                }
            }
        }
        else
        {
            // In post-merge, everyone goes to tribal council
            _currentTribe = GameManager.Instance.GetTribes()[0]; // Merged tribe
            
            // Get players with immunity
            _immunePlayers = GameManager.Instance.ChallengeSystem.GetImmunePlayers();
        }
        
        // Set up UI
        SetupTribalCouncilUI();
    }
    
    /// <summary>
    /// Prepare for final tribal council
    /// </summary>
    public void PrepareFinalTribalCouncil()
    {
        _finalTribalCouncil = true;
        _votes.Clear();
        _selectedVoteTarget = null;
        _currentTribe = GameManager.Instance.GetTribes()[0]; // Merged tribe
        _immunePlayers = GameManager.Instance.ChallengeSystem.GetImmunePlayers();
        
        // Set up UI
        SetupTribalCouncilUI();
    }
    
    private void SetupTribalCouncilUI()
    {
        // Set tribal council text
        if (_tribalCouncilText != null)
        {
            if (_finalTribalCouncil)
            {
                _tribalCouncilText.text = "Final Tribal Council: The jury will decide the winner.";
            }
            else if (GameManager.Instance.GetCurrentPhase() == GameManager.GamePhase.PreMerge)
            {
                _tribalCouncilText.text = $"Tribal Council: {_currentTribe.TribeName} Tribe";
            }
            else
            {
                _tribalCouncilText.text = "Tribal Council: Individual Vote";
            }
        }
        
        // Clear survivor grid
        if (_survivorGridContainer != null)
        {
            foreach (Transform child in _survivorGridContainer)
            {
                Destroy(child.gameObject);
            }
        }
        
        // Create survivor portraits for voting
        if (_survivorGridContainer != null && _survivorPortraitPrefab != null)
        {
            foreach (var survivor in _currentTribe.Members)
            {
                GameObject portrait = Instantiate(_survivorPortraitPrefab, _survivorGridContainer);
                
                // Set name
                TMP_Text nameText = portrait.GetComponentInChildren<TMP_Text>();
                if (nameText != null)
                {
                    nameText.text = survivor.Name;
                    
                    // Mark immune players
                    if (_immunePlayers.Contains(survivor))
                    {
                        nameText.text += " (Immune)";
                    }
                }
                
                // Set portrait image
                Image portraitImage = portrait.GetComponentInChildren<Image>();
                if (portraitImage != null)
                {
                    // Set color based on player/immunity
                    if (survivor.IsPlayer)
                    {
                        portraitImage.color = Color.blue;
                    }
                    else if (_immunePlayers.Contains(survivor))
                    {
                        portraitImage.color = Color.yellow;
                    }
                }
                
                // Add click event for voting
                Button portraitButton = portrait.GetComponent<Button>();
                if (portraitButton != null)
                {
                    SurvivorData targetSurvivor = survivor;
                    
                    // Disable button if survivor is immune
                    portraitButton.interactable = !_immunePlayers.Contains(survivor);
                    
                    portraitButton.onClick.AddListener(() => {
                        SelectVoteTarget(targetSurvivor);
                    });
                }
            }
        }
        
        // Set up voting button
        if (_castVoteButton != null)
        {
            _castVoteButton.interactable = false;
            _castVoteButton.onClick.RemoveAllListeners();
            _castVoteButton.onClick.AddListener(CastVote);
        }
        
        // Show voting UI, hide results
        if (_votingContainer != null)
            _votingContainer.SetActive(true);
            
        if (_resultsContainer != null)
            _resultsContainer.SetActive(false);
            
        // Show idol play button if player has an idol
        if (_idolPlayButton != null)
        {
            SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
            _idolPlayButton.SetActive(player.HasIdol);
            
            Button idolButton = _idolPlayButton.GetComponent<Button>();
            if (idolButton != null)
            {
                idolButton.onClick.RemoveAllListeners();
                idolButton.onClick.AddListener(PlayIdol);
            }
        }
    }
    
    private void SelectVoteTarget(SurvivorData target)
    {
        // Cannot vote for immune players
        if (_immunePlayers.Contains(target))
            return;
            
        _selectedVoteTarget = target;
        
        // Update UI to show selection
        if (_survivorGridContainer != null)
        {
            foreach (Transform child in _survivorGridContainer)
            {
                Button button = child.GetComponent<Button>();
                Image image = child.GetComponentInChildren<Image>();
                
                if (image != null && button != null)
                {
                    TMP_Text nameText = child.GetComponentInChildren<TMP_Text>();
                    if (nameText != null && nameText.text.StartsWith(target.Name))
                    {
                        // Highlight selected target
                        image.color = Color.green;
                    }
                    else if (button.interactable)
                    {
                        // Reset color for non-selected
                        SurvivorData survivor = null;
                        foreach (var s in _currentTribe.Members)
                        {
                            if (nameText != null && nameText.text.StartsWith(s.Name))
                            {
                                survivor = s;
                                break;
                            }
                        }
                        
                        if (survivor != null)
                        {
                            if (survivor.IsPlayer)
                            {
                                image.color = Color.blue;
                            }
                            else
                            {
                                image.color = Color.white;
                            }
                        }
                    }
                }
            }
        }
        
        // Enable vote button
        if (_castVoteButton != null)
        {
            _castVoteButton.interactable = true;
        }
    }
    
    private void CastVote()
    {
        if (_selectedVoteTarget == null) return;
        
        SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
        
        // Record player's vote
        _votes[player] = _selectedVoteTarget;
        
        // Generate NPC votes
        GenerateNPCVotes();
        
        // Show voting results
        ShowVotingResults();
    }
    
    private void PlayIdol()
    {
        SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
        
        // Use player's idol
        if (player.UseIdol())
        {
            _idolPlayed = true;
            _immunePlayers.Add(player);
            
            // Update UI
            if (_idolPlayButton != null)
            {
                _idolPlayButton.SetActive(false);
            }
            
            // Show message
            if (_tribalCouncilText != null)
            {
                _tribalCouncilText.text = "You played a Hidden Immunity Idol! Any votes against you will not count.";
            }
        }
    }
    
    private void GenerateNPCVotes()
    {
        // Get alliance votes first
        Dictionary<SurvivorData, SurvivorData> allianceVotes = 
            GameManager.Instance.AllianceSystem.GetAllianceVotes(_currentTribe, _immunePlayers);
            
        // Add alliance votes to the vote collection
        foreach (var vote in allianceVotes)
        {
            _votes[vote.Key] = vote.Value;
        }
        
        // For any NPC without an alliance vote, generate individual votes
        foreach (var survivor in _currentTribe.Members)
        {
            // Skip player and already voted NPCs
            if (survivor.IsPlayer || _votes.ContainsKey(survivor) || _immunePlayers.Contains(survivor))
                continue;
                
            // Find the least liked survivor who isn't immune
            SurvivorData leastLiked = null;
            int lowestRelationship = 101; // Higher than max relationship
            
            foreach (var target in _currentTribe.Members)
            {
                // Can't vote for self or immune players
                if (target == survivor || _immunePlayers.Contains(target))
                    continue;
                    
                int relationship = survivor.GetRelationship(target.Name);
                if (relationship < lowestRelationship)
                {
                    lowestRelationship = relationship;
                    leastLiked = target;
                }
            }
            
            // Add vote
            if (leastLiked != null)
            {
                _votes[survivor] = leastLiked;
            }
            else
            {
                // Fallback - vote for random non-immune player
                List<SurvivorData> eligibleTargets = new List<SurvivorData>();
                foreach (var target in _currentTribe.Members)
                {
                    if (target != survivor && !_immunePlayers.Contains(target))
                    {
                        eligibleTargets.Add(target);
                    }
                }
                
                if (eligibleTargets.Count > 0)
                {
                    _votes[survivor] = eligibleTargets[Random.Range(0, eligibleTargets.Count)];
                }
            }
        }
    }
    
    private void ShowVotingResults()
    {
        // Hide voting UI, show results
        if (_votingContainer != null)
            _votingContainer.SetActive(false);
            
        if (_resultsContainer != null)
            _resultsContainer.SetActive(true);
            
        // Count votes for each survivor
        Dictionary<SurvivorData, int> voteCount = new Dictionary<SurvivorData, int>();
        
        foreach (var vote in _votes)
        {
            SurvivorData target = vote.Value;
            
            // Skip votes against immune players (from idol)
            if (_immunePlayers.Contains(target) && _idolPlayed)
                continue;
                
            if (!voteCount.ContainsKey(target))
            {
                voteCount[target] = 0;
            }
            
            voteCount[target]++;
        }
        
        // Determine eliminated player
        int highestVotes = 0;
        foreach (var count in voteCount)
        {
            if (count.Value > highestVotes)
            {
                highestVotes = count.Value;
                _eliminatedSurvivor = count.Key;
            }
        }
        
        // Show vote count
        if (_tribalCouncilText != null)
        {
            string text = "Votes:\n";
            
            foreach (var count in voteCount)
            {
                text += $"{count.Key.Name}: {count.Value} vote(s)\n";
            }
            
            text += $"\n{_eliminatedSurvivor.Name} has been voted off Survivor Island!";
            
            _tribalCouncilText.text = text;
        }
        
        // Add continue button to proceed
        if (_castVoteButton != null)
        {
            _castVoteButton.interactable = true;
            _castVoteButton.GetComponentInChildren<TMP_Text>().text = "Continue";
            _castVoteButton.onClick.RemoveAllListeners();
            _castVoteButton.onClick.AddListener(() => {
                // Process elimination
                ProcessElimination();
            });
        }
    }
    
    private void ProcessElimination()
    {
        // If player was eliminated, game over
        if (_eliminatedSurvivor.IsPlayer)
        {
            GameManager.Instance.SetGameState(GameManager.GameState.GameOver);
            return;
        }
        
        // Otherwise, remove survivor and continue
        GameManager.Instance.EliminateSurvivor(_eliminatedSurvivor);
    }
}
