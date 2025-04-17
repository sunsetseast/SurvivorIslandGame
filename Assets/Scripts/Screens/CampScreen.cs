using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Manages the camp screen where players can perform various activities
/// </summary>
public class CampScreen : MonoBehaviour
{
    [SerializeField] private Transform _locationContainer;
    [SerializeField] private GameObject _locationButtonPrefab;
    [SerializeField] private TMP_Text _tribeNameText;
    [SerializeField] private TMP_Text _dayText;
    [SerializeField] private Image _tribeColorImage;
    
    [Header("Resource UI")]
    [SerializeField] private Slider _fireSlider;
    [SerializeField] private Slider _waterSlider;
    [SerializeField] private Slider _foodSlider;
    [SerializeField] private TMP_Text _fireChangeText;
    [SerializeField] private TMP_Text _waterChangeText;
    [SerializeField] private TMP_Text _foodChangeText;
    
    [Header("Action UI")]
    [SerializeField] private GameObject _actionPanel;
    [SerializeField] private TMP_Text _actionTitleText;
    [SerializeField] private TMP_Text _actionDescriptionText;
    [SerializeField] private Button _performActionButton;
    [SerializeField] private Button _cancelActionButton;
    
    [Header("Relationship UI")]
    [SerializeField] private Button _viewRelationshipsButton;
    [SerializeField] private GameObject _relationshipPanel;
    [SerializeField] private Transform _relationshipContainer;
    [SerializeField] private GameObject _relationshipEntryPrefab;
    
    [Header("Alliance UI")]
    [SerializeField] private Button _viewAlliancesButton;
    [SerializeField] private GameObject _alliancePanel;
    [SerializeField] private Transform _allianceContainer;
    [SerializeField] private GameObject _allianceEntryPrefab;
    [SerializeField] private Button _formAllianceButton;
    
    private List<CampLocation> _campLocations = new List<CampLocation>();
    private CampLocation _selectedLocation;
    private CampAction _selectedAction;
    
    // Camp location class
    [System.Serializable]
    private class CampLocation
    {
        public string Name;
        public string Description;
        public List<CampAction> Actions = new List<CampAction>();
        
        public CampLocation(string name, string description)
        {
            Name = name;
            Description = description;
        }
    }
    
    // Camp action class
    [System.Serializable]
    private class CampAction
    {
        public string Name;
        public string Description;
        public int EnergyCost;
        public ActionType Type;
        
        public CampAction(string name, string description, int energyCost, ActionType type)
        {
            Name = name;
            Description = description;
            EnergyCost = energyCost;
            Type = type;
        }
        
        public enum ActionType
        {
            GatherFirewood,
            CollectWater,
            FindFood,
            SearchForIdol,
            Socialize,
            Rest,
            Strategic
        }
    }
    
    private void OnEnable()
    {
        SetupCampLocations();
        SetupUI();
        UpdateResourceDisplay();
        
        // Hide panels initially
        if (_actionPanel != null)
            _actionPanel.SetActive(false);
        if (_relationshipPanel != null)
            _relationshipPanel.SetActive(false);
        if (_alliancePanel != null)
            _alliancePanel.SetActive(false);
        
        // Process random events when entering camp
        ProcessRandomEvents();
    }
    
    private void SetupCampLocations()
    {
        _campLocations.Clear();
        
        // Create camp locations with actions
        
        // Beach location
        CampLocation beach = new CampLocation("Beach", "Sandy shore where your tribe makes camp");
        beach.Actions.Add(new CampAction("Collect Water", "Fetch water for the tribe (+15 Water)", 1, CampAction.ActionType.CollectWater));
        beach.Actions.Add(new CampAction("Fish", "Try to catch fish for food (+10 Food)", 1, CampAction.ActionType.FindFood));
        beach.Actions.Add(new CampAction("Reflect", "Walk along the shore and reflect on your game (Social)", 1, CampAction.ActionType.Strategic));
        _campLocations.Add(beach);
        
        // Jungle location
        CampLocation jungle = new CampLocation("Jungle", "Dense forest with resources and hidden dangers");
        jungle.Actions.Add(new CampAction("Gather Firewood", "Collect wood for the fire (+15 Fire)", 1, CampAction.ActionType.GatherFirewood));
        jungle.Actions.Add(new CampAction("Forage", "Look for fruits and edible plants (+10 Food)", 1, CampAction.ActionType.FindFood));
        jungle.Actions.Add(new CampAction("Search for Idol", "Hunt for a hidden immunity idol", 1, CampAction.ActionType.SearchForIdol));
        _campLocations.Add(jungle);
        
        // Camp location
        CampLocation camp = new CampLocation("Camp", "Your tribe's shelter and gathering area");
        camp.Actions.Add(new CampAction("Tend Fire", "Maintain the tribe's fire (+15 Fire)", 1, CampAction.ActionType.GatherFirewood));
        camp.Actions.Add(new CampAction("Rest", "Recover your strength (Restore 1 Energy)", 0, CampAction.ActionType.Rest));
        camp.Actions.Add(new CampAction("Socialize", "Talk with your tribe members (Build Relationships)", 1, CampAction.ActionType.Socialize));
        _campLocations.Add(camp);
        
        // Challenge Area
        CampLocation challengeArea = new CampLocation("Challenge Area", "Practice for upcoming challenges");
        challengeArea.Actions.Add(new CampAction("Train Physical", "Work on your physical abilities", 1, CampAction.ActionType.Strategic));
        challengeArea.Actions.Add(new CampAction("Train Mental", "Practice puzzles and mental challenges", 1, CampAction.ActionType.Strategic));
        challengeArea.Actions.Add(new CampAction("Strategize", "Plan your next strategic move", 1, CampAction.ActionType.Strategic));
        _campLocations.Add(challengeArea);
    }
    
    private void SetupUI()
    {
        // Set tribe name
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        if (_tribeNameText != null && playerTribe != null)
        {
            _tribeNameText.text = playerTribe.TribeName + " Tribe";
            
            if (_tribeColorImage != null)
            {
                _tribeColorImage.color = playerTribe.TribeColor;
            }
        }
        
        // Set day
        if (_dayText != null)
        {
            _dayText.text = "Day " + GameManager.Instance.GetCurrentDay();
        }
        
        // Create location buttons
        CreateLocationButtons();
        
        // Set up relationship button
        if (_viewRelationshipsButton != null)
        {
            _viewRelationshipsButton.onClick.RemoveAllListeners();
            _viewRelationshipsButton.onClick.AddListener(ViewRelationships);
        }
        
        // Set up alliance button
        if (_viewAlliancesButton != null)
        {
            _viewAlliancesButton.onClick.RemoveAllListeners();
            _viewAlliancesButton.onClick.AddListener(ViewAlliances);
        }
        
        // Set up form alliance button
        if (_formAllianceButton != null)
        {
            _formAllianceButton.onClick.RemoveAllListeners();
            _formAllianceButton.onClick.AddListener(ShowFormAllianceOptions);
        }
    }
    
    private void CreateLocationButtons()
    {
        if (_locationContainer == null || _locationButtonPrefab == null)
            return;
            
        // Clear existing buttons
        foreach (Transform child in _locationContainer)
        {
            Destroy(child.gameObject);
        }
        
        // Create a button for each location
        foreach (var location in _campLocations)
        {
            GameObject buttonObj = Instantiate(_locationButtonPrefab, _locationContainer);
            
            // Set location name
            TMP_Text buttonText = buttonObj.GetComponentInChildren<TMP_Text>();
            if (buttonText != null)
            {
                buttonText.text = location.Name;
            }
            
            // Add click event
            Button button = buttonObj.GetComponent<Button>();
            if (button != null)
            {
                CampLocation locationRef = location;
                button.onClick.AddListener(() => SelectLocation(locationRef));
            }
        }
    }
    
    private void SelectLocation(CampLocation location)
    {
        _selectedLocation = location;
        
        // Show action panel
        if (_actionPanel != null)
        {
            _actionPanel.SetActive(true);
        }
        
        // Update action panel
        if (_actionTitleText != null)
        {
            _actionTitleText.text = location.Name;
        }
        
        if (_actionDescriptionText != null)
        {
            string desc = location.Description + "\n\nAvailable Actions:";
            foreach (var action in location.Actions)
            {
                desc += $"\n• {action.Name} ({action.EnergyCost} Energy): {action.Description}";
            }
            _actionDescriptionText.text = desc;
        }
        
        // Create action buttons
        if (_actionPanel.transform.Find("ActionButtons") != null)
        {
            Transform actionButtonsContainer = _actionPanel.transform.Find("ActionButtons");
            
            // Clear existing buttons
            foreach (Transform child in actionButtonsContainer)
            {
                Destroy(child.gameObject);
            }
            
            // Create a button for each action
            foreach (var action in location.Actions)
            {
                GameObject buttonObj = new GameObject(action.Name + "Button");
                buttonObj.transform.SetParent(actionButtonsContainer);
                
                // Add button component
                Button button = buttonObj.AddComponent<Button>();
                
                // Add image component for button background
                Image buttonImage = buttonObj.AddComponent<Image>();
                buttonImage.color = new Color(0.2f, 0.2f, 0.2f, 0.8f);
                
                // Add text component
                GameObject textObj = new GameObject("Text");
                textObj.transform.SetParent(buttonObj.transform);
                TMP_Text buttonText = textObj.AddComponent<TextMeshProUGUI>();
                buttonText.text = $"{action.Name} ({action.EnergyCost} Energy)";
                buttonText.color = Color.white;
                buttonText.alignment = TextAlignmentOptions.Center;
                
                // Setup RectTransform for button
                RectTransform buttonRect = buttonObj.GetComponent<RectTransform>();
                buttonRect.sizeDelta = new Vector2(300, 40);
                
                // Setup RectTransform for text
                RectTransform textRect = textObj.GetComponent<RectTransform>();
                textRect.anchorMin = Vector2.zero;
                textRect.anchorMax = Vector2.one;
                textRect.offsetMin = Vector2.zero;
                textRect.offsetMax = Vector2.zero;
                
                // Add click event
                CampAction actionRef = action;
                button.onClick.AddListener(() => SelectAction(actionRef));
                
                // Disable button if not enough energy
                if (GameManager.Instance.EnergySystem.GetCurrentEnergy() < action.EnergyCost)
                {
                    button.interactable = false;
                    buttonText.color = Color.gray;
                }
            }
        }
        
        // Set up cancel button
        if (_cancelActionButton != null)
        {
            _cancelActionButton.onClick.RemoveAllListeners();
            _cancelActionButton.onClick.AddListener(() => {
                if (_actionPanel != null)
                    _actionPanel.SetActive(false);
            });
        }
    }
    
    private void SelectAction(CampAction action)
    {
        _selectedAction = action;
        
        // Check if player has enough energy
        if (GameManager.Instance.EnergySystem.GetCurrentEnergy() < action.EnergyCost)
        {
            // Show not enough energy message
            if (_actionDescriptionText != null)
            {
                _actionDescriptionText.text = "Not enough energy to perform this action!";
            }
            return;
        }
        
        // Perform the action
        PerformAction(action);
    }
    
    private void PerformAction(CampAction action)
    {
        // Use energy
        GameManager.Instance.EnergySystem.UseEnergy(action.EnergyCost);
        
        // Process action based on type
        switch (action.Type)
        {
            case CampAction.ActionType.GatherFirewood:
                GatherFirewood();
                break;
            case CampAction.ActionType.CollectWater:
                CollectWater();
                break;
            case CampAction.ActionType.FindFood:
                FindFood();
                break;
            case CampAction.ActionType.SearchForIdol:
                SearchForIdol();
                break;
            case CampAction.ActionType.Socialize:
                Socialize();
                break;
            case CampAction.ActionType.Rest:
                Rest();
                break;
            case CampAction.ActionType.Strategic:
                Strategic();
                break;
        }
        
        // Hide action panel
        if (_actionPanel != null)
        {
            _actionPanel.SetActive(false);
        }
        
        // Update resource display
        UpdateResourceDisplay();
        
        // Check if all energy is used
        if (GameManager.Instance.EnergySystem.GetCurrentEnergy() <= 0)
        {
            // Proceed to next phase
            StartCoroutine(ProceedToNextPhase());
        }
    }
    
    private void GatherFirewood()
    {
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        
        // Increase fire resource
        playerTribe.ModifyResource(TribeData.ResourceType.Fire, 15);
        
        // Show result message
        string message = "You gathered firewood and improved your tribe's fire.";
        ShowActionResult(message);
        
        // Random relationship event
        if (Random.value < 0.3f)
        {
            SurvivorData randomTribeMate = GetRandomTribeMate();
            if (randomTribeMate != null)
            {
                string[] dialogueOptions = new string[]
                {
                    $"{randomTribeMate.Name} helps you gather firewood.",
                    $"{randomTribeMate.Name} compliments your fire-making skills.",
                    $"{randomTribeMate.Name} shares fire-making techniques with you."
                };
                
                string dialogue = dialogueOptions[Random.Range(0, dialogueOptions.Length)];
                List<string> choices = new List<string>
                {
                    "Thank them and work together (+2 Relationship)",
                    "Accept help but stay distant (Neutral)",
                    "Discuss strategy while working (+1 Relationship, Strategic)"
                };
                
                GameManager.Instance.UIManager.ShowDialogue(dialogue, choices, (choice) => {
                    SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
                    
                    if (choice == 0)
                        GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, 2);
                    else if (choice == 2)
                        GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, 1);
                        
                    GameManager.Instance.UIManager.HideDialogue();
                });
            }
        }
    }
    
    private void CollectWater()
    {
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        
        // Increase water resource
        playerTribe.ModifyResource(TribeData.ResourceType.Water, 15);
        
        // Show result message
        string message = "You collected water for your tribe.";
        ShowActionResult(message);
        
        // Random relationship event
        if (Random.value < 0.3f)
        {
            SurvivorData randomTribeMate = GetRandomTribeMate();
            if (randomTribeMate != null)
            {
                string[] dialogueOptions = new string[]
                {
                    $"{randomTribeMate.Name} joins you at the water source.",
                    $"{randomTribeMate.Name} offers to help carry water back to camp.",
                    $"{randomTribeMate.Name} shares concerns about another tribe member while collecting water."
                };
                
                string dialogue = dialogueOptions[Random.Range(0, dialogueOptions.Length)];
                List<string> choices = new List<string>
                {
                    "Share your own thoughts (+2 Relationship)",
                    "Listen but remain noncommittal (Neutral)",
                    "Change the subject to the game (-1 Relationship)"
                };
                
                GameManager.Instance.UIManager.ShowDialogue(dialogue, choices, (choice) => {
                    SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
                    
                    if (choice == 0)
                        GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, 2);
                    else if (choice == 2)
                        GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, -1);
                        
                    GameManager.Instance.UIManager.HideDialogue();
                });
            }
        }
    }
    
    private void FindFood()
    {
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        
        // Increase food resource
        playerTribe.ModifyResource(TribeData.ResourceType.Food, 10);
        
        // Show result message
        string message = "You gathered food for your tribe.";
        ShowActionResult(message);
        
        // Random relationship event
        if (Random.value < 0.3f)
        {
            SurvivorData randomTribeMate = GetRandomTribeMate();
            if (randomTribeMate != null)
            {
                string[] dialogueOptions = new string[]
                {
                    $"{randomTribeMate.Name} shows you where to find the best fruit.",
                    $"{randomTribeMate.Name} teaches you how to set a fish trap.",
                    $"{randomTribeMate.Name} shares food gathering tips with you."
                };
                
                string dialogue = dialogueOptions[Random.Range(0, dialogueOptions.Length)];
                List<string> choices = new List<string>
                {
                    "Express gratitude and learn from them (+2 Relationship)",
                    "Politely accept their advice (Neutral)",
                    "Suggest a better method (-1 Relationship, +5 Food)"
                };
                
                GameManager.Instance.UIManager.ShowDialogue(dialogue, choices, (choice) => {
                    SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
                    
                    if (choice == 0)
                        GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, 2);
                    else if (choice == 2)
                    {
                        GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, -1);
                        playerTribe.ModifyResource(TribeData.ResourceType.Food, 5);
                    }
                        
                    GameManager.Instance.UIManager.HideDialogue();
                });
            }
        }
    }
    
    private void SearchForIdol()
    {
        // Open idol search UI
        GameManager.Instance.IdolSystem.ShowIdolSearch();
    }
    
    private void Socialize()
    {
        // Choose a random tribe mate to socialize with
        SurvivorData randomTribeMate = GetRandomTribeMate();
        
        if (randomTribeMate != null)
        {
            // Generate random dialogue
            string[] dialogueOptions = new string[]
            {
                $"{randomTribeMate.Name} talks about their life back home.",
                $"{randomTribeMate.Name} shares their thoughts on the game so far.",
                $"{randomTribeMate.Name} asks about your strategy going forward.",
                $"{randomTribeMate.Name} shares concerns about another tribe member."
            };
            
            string dialogue = dialogueOptions[Random.Range(0, dialogueOptions.Length)];
            
            List<string> choices = new List<string>
            {
                "Share personal stories (+3 Relationship)",
                "Talk strategy and form a bond (+2 Relationship, Strategic)",
                "Keep conversation light (+1 Relationship)",
                "Steer toward game talk only (No change)"
            };
            
            GameManager.Instance.UIManager.ShowDialogue(dialogue, choices, (choice) => {
                SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
                
                if (choice == 0)
                    GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, 3);
                else if (choice == 1)
                    GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, 2);
                else if (choice == 2)
                    GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, 1);
                    
                GameManager.Instance.UIManager.HideDialogue();
                
                // Show result message
                string message = $"You socialized with {randomTribeMate.Name}.";
                ShowActionResult(message);
            });
        }
        else
        {
            // No tribe mates left
            string message = "There's no one to socialize with.";
            ShowActionResult(message);
        }
    }
    
    private void Rest()
    {
        // Restore energy
        GameManager.Instance.EnergySystem.AddEnergy(1);
        
        // Show result message
        string message = "You rested and regained 1 energy point.";
        ShowActionResult(message);
    }
    
    private void Strategic()
    {
        // Choose a random tribe mate for strategic discussion
        SurvivorData randomTribeMate = GetRandomTribeMate();
        
        if (randomTribeMate != null)
        {
            // Generate random strategic dialogue
            string[] dialogueOptions = new string[]
            {
                $"{randomTribeMate.Name} wants to discuss who to vote out next.",
                $"{randomTribeMate.Name} shares information about another tribe member.",
                $"{randomTribeMate.Name} suggests forming a voting bloc.",
                $"{randomTribeMate.Name} asks who you're planning to vote for."
            };
            
            string dialogue = dialogueOptions[Random.Range(0, dialogueOptions.Length)];
            
            // Get another random tribe mate as potential target
            SurvivorData targetMate = GetRandomTribeMate(randomTribeMate);
            string targetName = targetMate != null ? targetMate.Name : "someone else";
            
            List<string> choices = new List<string>
            {
                $"Suggest targeting {targetName} (Strategic)",
                "Agree with their plan (Bond +2)",
                "Listen but don't commit (Neutral)",
                "Deflect the conversation (Bond -1)"
            };
            
            GameManager.Instance.UIManager.ShowDialogue(dialogue, choices, (choice) => {
                SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
                
                if (choice == 0 && targetMate != null)
                {
                    GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, 1);
                    GameManager.Instance.RelationshipSystem.ChangeRelationship(randomTribeMate, targetMate, -2);
                }
                else if (choice == 1)
                    GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, 2);
                else if (choice == 3)
                    GameManager.Instance.RelationshipSystem.ChangeRelationship(player, randomTribeMate, -1);
                    
                GameManager.Instance.UIManager.HideDialogue();
                
                // Show result message
                string message = $"You had a strategic conversation with {randomTribeMate.Name}.";
                ShowActionResult(message);
            });
        }
        else
        {
            // No tribe mates left
            string message = "There's no one to strategize with.";
            ShowActionResult(message);
        }
    }
    
    private SurvivorData GetRandomTribeMate()
    {
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
        
        List<SurvivorData> tribemates = new List<SurvivorData>();
        
        foreach (var member in playerTribe.Members)
        {
            if (member != player)
            {
                tribemates.Add(member);
            }
        }
        
        if (tribemates.Count > 0)
        {
            return tribemates[Random.Range(0, tribemates.Count)];
        }
        
        return null;
    }
    
    private SurvivorData GetRandomTribeMate(SurvivorData exclude)
    {
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
        
        List<SurvivorData> tribemates = new List<SurvivorData>();
        
        foreach (var member in playerTribe.Members)
        {
            if (member != player && member != exclude)
            {
                tribemates.Add(member);
            }
        }
        
        if (tribemates.Count > 0)
        {
            return tribemates[Random.Range(0, tribemates.Count)];
        }
        
        return null;
    }
    
    private void ShowActionResult(string message)
    {
        // Use dialogue system to show result
        List<string> choices = new List<string> { "Continue" };
        
        GameManager.Instance.UIManager.ShowDialogue(message, choices, (choice) => {
            GameManager.Instance.UIManager.HideDialogue();
        });
    }
    
    private void UpdateResourceDisplay()
    {
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        
        if (_fireSlider != null)
        {
            _fireSlider.value = playerTribe.Fire;
        }
        
        if (_waterSlider != null)
        {
            _waterSlider.value = playerTribe.Water;
        }
        
        if (_foodSlider != null)
        {
            _foodSlider.value = playerTribe.Food;
        }
        
        // Update change texts
        if (_fireChangeText != null)
        {
            if (playerTribe.FireChange > 0)
                _fireChangeText.text = "+" + playerTribe.FireChange;
            else if (playerTribe.FireChange < 0)
                _fireChangeText.text = playerTribe.FireChange.ToString();
            else
                _fireChangeText.text = "";
        }
        
        if (_waterChangeText != null)
        {
            if (playerTribe.WaterChange > 0)
                _waterChangeText.text = "+" + playerTribe.WaterChange;
            else if (playerTribe.WaterChange < 0)
                _waterChangeText.text = playerTribe.WaterChange.ToString();
            else
                _waterChangeText.text = "";
        }
        
        if (_foodChangeText != null)
        {
            if (playerTribe.FoodChange > 0)
                _foodChangeText.text = "+" + playerTribe.FoodChange;
            else if (playerTribe.FoodChange < 0)
                _foodChangeText.text = playerTribe.FoodChange.ToString();
            else
                _foodChangeText.text = "";
        }
    }
    
    private void ViewRelationships()
    {
        if (_relationshipPanel != null)
        {
            _relationshipPanel.SetActive(true);
        }
        
        // Create relationship entries
        if (_relationshipContainer != null && _relationshipEntryPrefab != null)
        {
            // Clear existing entries
            foreach (Transform child in _relationshipContainer)
            {
                Destroy(child.gameObject);
            }
            
            // Get player and tribe
            SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
            TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
            
            // Create an entry for each tribe member
            foreach (var member in playerTribe.Members)
            {
                if (member == player) continue;
                
                GameObject entryObj = Instantiate(_relationshipEntryPrefab, _relationshipContainer);
                
                // Set name
                TMP_Text nameText = entryObj.transform.Find("NameText")?.GetComponent<TMP_Text>();
                if (nameText != null)
                {
                    nameText.text = member.Name;
                }
                
                // Set relationship value
                Slider relationshipSlider = entryObj.transform.Find("RelationshipSlider")?.GetComponent<Slider>();
                if (relationshipSlider != null)
                {
                    relationshipSlider.value = player.GetRelationship(member.Name);
                }
                
                // Set relationship description
                TMP_Text relationshipText = entryObj.transform.Find("RelationshipText")?.GetComponent<TMP_Text>();
                if (relationshipText != null)
                {
                    string description = GameManager.Instance.RelationshipSystem.GetRelationshipDescription(player, member);
                    relationshipText.text = $"{description} ({player.GetRelationship(member.Name)}/100)";
                }
            }
            
            // Add close button
            Button closeButton = _relationshipPanel.transform.Find("CloseButton")?.GetComponent<Button>();
            if (closeButton != null)
            {
                closeButton.onClick.RemoveAllListeners();
                closeButton.onClick.AddListener(() => {
                    _relationshipPanel.SetActive(false);
                });
            }
        }
    }
    
    private void ViewAlliances()
    {
        if (_alliancePanel != null)
        {
            _alliancePanel.SetActive(true);
        }
        
        // Create alliance entries
        if (_allianceContainer != null && _allianceEntryPrefab != null)
        {
            // Clear existing entries
            foreach (Transform child in _allianceContainer)
            {
                Destroy(child.gameObject);
            }
            
            // Get player
            SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
            
            // Get player's alliances
            List<AllianceSystem.Alliance> alliances = GameManager.Instance.AllianceSystem.GetSurvivorAlliances(player);
            
            if (alliances.Count == 0)
            {
                // No alliances
                GameObject textObj = new GameObject("NoAlliancesText");
                textObj.transform.SetParent(_allianceContainer);
                TMP_Text noAlliancesText = textObj.AddComponent<TextMeshProUGUI>();
                noAlliancesText.text = "You have not formed any alliances yet.";
                noAlliancesText.fontSize = 16;
                noAlliancesText.color = Color.white;
                noAlliancesText.alignment = TextAlignmentOptions.Center;
                
                // Setup RectTransform
                RectTransform rectTransform = textObj.GetComponent<RectTransform>();
                rectTransform.sizeDelta = new Vector2(300, 40);
            }
            else
            {
                // Create an entry for each alliance
                foreach (var alliance in alliances)
                {
                    GameObject entryObj = Instantiate(_allianceEntryPrefab, _allianceContainer);
                    
                    // Set alliance name
                    TMP_Text nameText = entryObj.transform.Find("AllianceNameText")?.GetComponent<TMP_Text>();
                    if (nameText != null)
                    {
                        nameText.text = alliance.AllianceName;
                    }
                    
                    // Set alliance strength
                    Slider strengthSlider = entryObj.transform.Find("StrengthSlider")?.GetComponent<Slider>();
                    if (strengthSlider != null)
                    {
                        strengthSlider.value = alliance.Strength;
                    }
                    
                    // Set alliance members
                    TMP_Text membersText = entryObj.transform.Find("MembersText")?.GetComponent<TMP_Text>();
                    if (membersText != null)
                    {
                        string members = "Members: ";
                        for (int i = 0; i < alliance.Members.Count; i++)
                        {
                            members += alliance.Members[i].Name;
                            if (i < alliance.Members.Count - 1)
                                members += ", ";
                        }
                        membersText.text = members;
                    }
                    
                    // Add leave alliance button
                    Button leaveButton = entryObj.transform.Find("LeaveButton")?.GetComponent<Button>();
                    if (leaveButton != null)
                    {
                        AllianceSystem.Alliance allianceRef = alliance;
                        leaveButton.onClick.RemoveAllListeners();
                        leaveButton.onClick.AddListener(() => LeaveAlliance(allianceRef));
                    }
                }
            }
            
            // Add close button
            Button closeButton = _alliancePanel.transform.Find("CloseButton")?.GetComponent<Button>();
            if (closeButton != null)
            {
                closeButton.onClick.RemoveAllListeners();
                closeButton.onClick.AddListener(() => {
                    _alliancePanel.SetActive(false);
                });
            }
        }
    }
    
    private void LeaveAlliance(AllianceSystem.Alliance alliance)
    {
        SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
        
        // Leave the alliance
        GameManager.Instance.AllianceSystem.RemoveFromAlliance(alliance, player);
        
        // Refresh alliance display
        ViewAlliances();
    }
    
    private void ShowFormAllianceOptions()
    {
        SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
        
        // Get potential allies
        List<SurvivorData> potentialAllies = GameManager.Instance.AllianceSystem.SuggestPotentialAllies(player);
        
        if (potentialAllies.Count == 0)
        {
            // No potential allies
            ShowActionResult("No one in your tribe currently has a strong enough relationship with you to form an alliance. Build stronger relationships first.");
            return;
        }
        
        // Create potential ally list
        string message = "Select a tribe member to form an alliance with:";
        List<string> choices = new List<string>();
        
        foreach (var ally in potentialAllies)
        {
            int relationship = player.GetRelationship(ally.Name);
            choices.Add($"{ally.Name} ({relationship}/100)");
        }
        
        choices.Add("Cancel");
        
        GameManager.Instance.UIManager.ShowDialogue(message, choices, (choice) => {
            if (choice < potentialAllies.Count)
            {
                // Form alliance with selected survivor
                SurvivorData selectedAlly = potentialAllies[choice];
                AllianceSystem.Alliance newAlliance = GameManager.Instance.AllianceSystem.CreateAlliance(player, selectedAlly);
                
                if (newAlliance != null)
                {
                    ShowActionResult($"You formed an alliance with {selectedAlly.Name}!");
                }
                else
                {
                    ShowActionResult("Failed to form alliance. Try building a stronger relationship first.");
                }
            }
            
            GameManager.Instance.UIManager.HideDialogue();
        });
    }
    
    private void ProcessRandomEvents()
    {
        // Process random relationship changes
        GameManager.Instance.RelationshipSystem.ProcessRandomRelationships();
        
        // Process NPC idol finds
        GameManager.Instance.IdolSystem.ProcessNPCIdolFinds();
        
        // Decrease resources slightly
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        playerTribe.ModifyResource(TribeData.ResourceType.Fire, -3);
        playerTribe.ModifyResource(TribeData.ResourceType.Water, -3);
        playerTribe.ModifyResource(TribeData.ResourceType.Food, -3);
        
        // Update UI
        UpdateResourceDisplay();
    }
    
    private IEnumerator ProceedToNextPhase()
    {
        yield return new WaitForSeconds(2f);
        
        // Show day end message
        string message = "You've used all your energy for today. Time to proceed to the Immunity Challenge.";
        List<string> choices = new List<string> { "Continue to Challenge" };
        
        GameManager.Instance.UIManager.ShowDialogue(message, choices, (choice) => {
            GameManager.Instance.UIManager.HideDialogue();
            
            // Go to challenge
            GameManager.Instance.SetGameState(GameManager.GameState.Challenge);
        });
    }
}
