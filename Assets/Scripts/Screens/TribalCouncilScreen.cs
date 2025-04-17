using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Manages the tribal council screen where survivors vote
/// </summary>
public class TribalCouncilScreen : MonoBehaviour
{
    [SerializeField] private TMP_Text _tribalCouncilTitleText;
    [SerializeField] private TMP_Text _tribalCouncilDescriptionText;
    [SerializeField] private Transform _survivorGridContainer;
    [SerializeField] private GameObject _survivorPortraitPrefab;
    [SerializeField] private Button _castVoteButton;
    [SerializeField] private TMP_Text _castVoteButtonText;
    [SerializeField] private GameObject _votingContainer;
    [SerializeField] private GameObject _resultsContainer;
    [SerializeField] private Button _playIdolButton;
    [SerializeField] private TMP_Text _voteResultsText;
    [SerializeField] private Transform _voteRevealContainer;
    [SerializeField] private GameObject _voteRevealPrefab;
    [SerializeField] private TMP_Text _eliminationText;
    [SerializeField] private Button _continueButton;
    [SerializeField] private ParticleSystem _torchParticles;
    [SerializeField] private AudioSource _drumSoundEffect;
    
    private SurvivorData _selectedSurvivor;
    private Dictionary<SurvivorData, SurvivorData> _votes = new Dictionary<SurvivorData, SurvivorData>();
    private SurvivorData _eliminatedSurvivor;
    private TribeData _currentTribe;
    private List<SurvivorData> _immunePlayers = new List<SurvivorData>();
    private bool _idolPlayed = false;
    private bool _revealingVotes = false;
    private List<GameObject> _voteRevealObjects = new List<GameObject>();
    
    private void OnEnable()
    {
        SetupTribalCouncilScreen();
    }
    
    private void SetupTribalCouncilScreen()
    {
        // Reset state
        _selectedSurvivor = null;
        _votes.Clear();
        _eliminatedSurvivor = null;
        _idolPlayed = false;
        _revealingVotes = false;
        
        // Get tribal council data from system
        _currentTribe = GameManager.Instance.GetPlayerTribe();
        _immunePlayers = GameManager.Instance.ChallengeSystem.GetImmunePlayers();
        
        // Set title
        if (_tribalCouncilTitleText != null)
        {
            if (GameManager.Instance.GetCurrentPhase() == GameManager.GamePhase.PreMerge)
            {
                _tribalCouncilTitleText.text = $"Tribal Council: {_currentTribe.TribeName} Tribe";
            }
            else
            {
                _tribalCouncilTitleText.text = "Tribal Council: Individual Vote";
            }
        }
        
        // Set description
        if (_tribalCouncilDescriptionText != null)
        {
            _tribalCouncilDescriptionText.text = "It's time to vote. Select the survivor you wish to vote off the island.";
        }
        
        // Show voting UI, hide results
        if (_votingContainer != null)
            _votingContainer.SetActive(true);
            
        if (_resultsContainer != null)
            _resultsContainer.SetActive(false);
            
        // Create survivor grid
        CreateSurvivorGrid();
        
        // Set up vote button
        if (_castVoteButton != null)
        {
            _castVoteButton.onClick.RemoveAllListeners();
            _castVoteButton.onClick.AddListener(CastVote);
            _castVoteButton.interactable = false;
            
            if (_castVoteButtonText != null)
                _castVoteButtonText.text = "Cast Vote";
        }
        
        // Set up idol button
        if (_playIdolButton != null)
        {
            // Show idol button only if player has an idol
            SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
            _playIdolButton.gameObject.SetActive(player.HasIdol);
            
            _playIdolButton.onClick.RemoveAllListeners();
            _playIdolButton.onClick.AddListener(PlayIdol);
        }
        
        // Play tribal council ambiance
        if (_torchParticles != null)
        {
            _torchParticles.Play();
        }
    }
    
    private void CreateSurvivorGrid()
    {
        if (_survivorGridContainer == null || _survivorPortraitPrefab == null)
            return;
            
        // Clear existing grid
        foreach (Transform child in _survivorGridContainer)
        {
            Destroy(child.gameObject);
        }
        
        // Create a portrait for each tribe member
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
            Image portraitImage = portrait.GetComponent<Image>();
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
            
            // Add click event
            Button portraitButton = portrait.GetComponent<Button>();
            if (portraitButton != null)
            {
                // Disable button if survivor is immune or is the player
                portraitButton.interactable = !_immunePlayers.Contains(survivor) && !survivor.IsPlayer;
                
                // Add click event
                SurvivorData selectedSurvivor = survivor;
                portraitButton.onClick.AddListener(() => SelectSurvivor(selectedSurvivor));
            }
        }
    }
    
    private void SelectSurvivor(SurvivorData survivor)
    {
        _selectedSurvivor = survivor;
        
        // Update portrait highlighting
        int index = 0;
        foreach (Transform child in _survivorGridContainer)
        {
            Button button = child.GetComponent<Button>();
            Image image = child.GetComponent<Image>();
            
            if (image != null && button != null && button.interactable)
            {
                TMP_Text nameText = child.GetComponentInChildren<TMP_Text>();
                if (nameText != null && nameText.text.StartsWith(survivor.Name))
                {
                    // Highlight selected
                    image.color = Color.green;
                }
                else
                {
                    // Reset others
                    image.color = Color.white;
                }
            }
            
            index++;
        }
        
        // Enable vote button
        if (_castVoteButton != null)
        {
            _castVoteButton.interactable = true;
        }
    }
    
    private void PlayIdol()
    {
        SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
        
        // Check if player has an idol
        if (player.HasIdol)
        {
            // Play idol
            player.UseIdol();
            
            // Add player to immune list
            if (!_immunePlayers.Contains(player))
            {
                _immunePlayers.Add(player);
            }
            
            // Mark idol as played
            _idolPlayed = true;
            
            // Hide idol button
            if (_playIdolButton != null)
            {
                _playIdolButton.gameObject.SetActive(false);
            }
            
            // Show confirmation
            if (_tribalCouncilDescriptionText != null)
            {
                _tribalCouncilDescriptionText.text = "You played a Hidden Immunity Idol! Any votes against you will not count.";
            }
        }
    }
    
    private void CastVote()
    {
        if (_selectedSurvivor == null) return;
        
        SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
        
        // Record player's vote
        _votes[player] = _selectedSurvivor;
        
        // Generate NPC votes
        GenerateNPCVotes();
        
        // Start vote reveal sequence
        StartCoroutine(RevealVotes());
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
    
    private IEnumerator RevealVotes()
    {
        _revealingVotes = true;
        
        // Hide voting UI, show results
        if (_votingContainer != null)
            _votingContainer.SetActive(false);
            
        if (_resultsContainer != null)
            _resultsContainer.SetActive(true);
            
        // Clear any existing vote reveal objects
        if (_voteRevealContainer != null)
        {
            foreach (Transform child in _voteRevealContainer)
            {
                Destroy(child.gameObject);
            }
            _voteRevealObjects.Clear();
        }
        
        // Set initial results text
        if (_voteResultsText != null)
        {
            _voteResultsText.text = "I'll read the votes...";
        }
        
        yield return new WaitForSeconds(2f);
        
        // Create shuffled list of votes for dramatic reveal
        List<KeyValuePair<SurvivorData, SurvivorData>> shuffledVotes = new List<KeyValuePair<SurvivorData, SurvivorData>>(_votes);
        for (int i = 0; i < shuffledVotes.Count; i++)
        {
            int randomIndex = Random.Range(i, shuffledVotes.Count);
            KeyValuePair<SurvivorData, SurvivorData> temp = shuffledVotes[i];
            shuffledVotes[i] = shuffledVotes[randomIndex];
            shuffledVotes[randomIndex] = temp;
        }
        
        // Count votes for each survivor as we go
        Dictionary<SurvivorData, int> voteCount = new Dictionary<SurvivorData, int>();
        
        // Reveal votes one by one
        for (int i = 0; i < shuffledVotes.Count; i++)
        {
            SurvivorData voter = shuffledVotes[i].Key;
            SurvivorData target = shuffledVotes[i].Value;
            
            // Skip votes against immune players if they played an idol
            if (_immunePlayers.Contains(target) && _idolPlayed)
            {
                if (_voteResultsText != null)
                {
                    _voteResultsText.text = $"Vote for {target.Name} - DOES NOT COUNT (Immunity Idol)";
                }
                
                yield return new WaitForSeconds(1.5f);
                continue;
            }
            
            // Update vote count
            if (!voteCount.ContainsKey(target))
            {
                voteCount[target] = 0;
            }
            voteCount[target]++;
            
            // Create vote reveal object
            if (_voteRevealContainer != null && _voteRevealPrefab != null)
            {
                GameObject voteObj = Instantiate(_voteRevealPrefab, _voteRevealContainer);
                _voteRevealObjects.Add(voteObj);
                
                // Set voter and target text
                TMP_Text voteText = voteObj.GetComponentInChildren<TMP_Text>();
                if (voteText != null)
                {
                    voteText.text = $"{voter.Name} votes for {target.Name}";
                }
                
                // Set target image
                Image targetImage = voteObj.transform.Find("TargetImage")?.GetComponent<Image>();
                if (targetImage != null)
                {
                    targetImage.color = target.IsPlayer ? Color.blue : Color.white;
                }
            }
            
            // Play drum sound
            if (_drumSoundEffect != null)
            {
                _drumSoundEffect.Play();
            }
            
            // Update results text
            if (_voteResultsText != null)
            {
                _voteResultsText.text = $"Vote: {target.Name}";
            }
            
            // Dramatic pause
            yield return new WaitForSeconds(1.5f);
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
        
        // Check for tie (not implemented, just choose one randomly)
        List<SurvivorData> tiedSurvivors = new List<SurvivorData>();
        foreach (var count in voteCount)
        {
            if (count.Value == highestVotes)
            {
                tiedSurvivors.Add(count.Key);
            }
        }
        
        if (tiedSurvivors.Count > 1)
        {
            // Tie - choose randomly
            _eliminatedSurvivor = tiedSurvivors[Random.Range(0, tiedSurvivors.Count)];
        }
        
        // Final vote count
        if (_voteResultsText != null)
        {
            string text = "Final vote count:\n";
            
            foreach (var count in voteCount)
            {
                text += $"{count.Key.Name}: {count.Value} vote(s)\n";
            }
            
            _voteResultsText.text = text;
        }
        
        yield return new WaitForSeconds(2f);
        
        // Show elimination result
        if (_eliminationText != null)
        {
            _eliminationText.text = $"{_eliminatedSurvivor.Name} has been voted off Survivor Island!";
            _eliminationText.gameObject.SetActive(true);
        }
        
        // Set up continue button
        if (_continueButton != null)
        {
            _continueButton.gameObject.SetActive(true);
            _continueButton.onClick.RemoveAllListeners();
            _continueButton.onClick.AddListener(ContinueAfterVote);
        }
        
        _revealingVotes = false;
    }
    
    private void ContinueAfterVote()
    {
        // Process elimination
        if (_eliminatedSurvivor != null)
        {
            // If player was eliminated, game over
            if (_eliminatedSurvivor.IsPlayer)
            {
                GameManager.Instance.SetGameState(GameManager.GameState.GameOver);
            }
            else
            {
                // Remove survivor and continue
                GameManager.Instance.EliminateSurvivor(_eliminatedSurvivor);
            }
        }
    }
}
