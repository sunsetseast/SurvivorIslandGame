using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Manages hidden immunity idols
/// </summary>
public class IdolSystem : MonoBehaviour
{
    // UI elements
    [SerializeField] private GameObject _searchPanel;
    [SerializeField] private TMP_Text _searchResultText;
    [SerializeField] private Button _searchButton;
    [SerializeField] private Transform _searchObjectsContainer;
    [SerializeField] private GameObject _searchObjectPrefab;
    
    // Idol search state
    private List<Vector2Int> _idolLocations = new List<Vector2Int>();
    private List<Vector2Int> _searchedLocations = new List<Vector2Int>();
    private int _searchGridSize = 6; // 6x6 grid
    private float _idolChance = 0.16f; // 1/6 chance
    private int _energyCost = 1;
    
    private void Awake()
    {
        GenerateIdolLocations();
    }
    
    /// <summary>
    /// Generate hidden idol locations
    /// </summary>
    private void GenerateIdolLocations()
    {
        _idolLocations.Clear();
        
        // Create 2 idols in the game (one per tribe initially)
        for (int i = 0; i < 2; i++)
        {
            int x = Random.Range(0, _searchGridSize);
            int y = Random.Range(0, _searchGridSize);
            Vector2Int location = new Vector2Int(x, y);
            
            // Ensure no duplicates
            if (_idolLocations.Contains(location))
            {
                i--; // Try again
                continue;
            }
            
            _idolLocations.Add(location);
        }
    }
    
    /// <summary>
    /// Show idol search interface
    /// </summary>
    public void ShowIdolSearch()
    {
        if (_searchPanel != null)
        {
            _searchPanel.SetActive(true);
        }
        
        // Reset search result text
        if (_searchResultText != null)
        {
            _searchResultText.text = "Tap objects to search for a Hidden Immunity Idol";
        }
        
        // Create search objects grid
        CreateSearchGrid();
    }
    
    /// <summary>
    /// Hide idol search interface
    /// </summary>
    public void HideIdolSearch()
    {
        if (_searchPanel != null)
        {
            _searchPanel.SetActive(false);
        }
    }
    
    /// <summary>
    /// Create grid of searchable objects
    /// </summary>
    private void CreateSearchGrid()
    {
        if (_searchObjectsContainer == null || _searchObjectPrefab == null)
            return;
            
        // Clear existing objects
        foreach (Transform child in _searchObjectsContainer)
        {
            Destroy(child.gameObject);
        }
        
        // Create grid
        for (int y = 0; y < _searchGridSize; y++)
        {
            for (int x = 0; x < _searchGridSize; x++)
            {
                GameObject obj = Instantiate(_searchObjectPrefab, _searchObjectsContainer);
                
                // Set position
                RectTransform rect = obj.GetComponent<RectTransform>();
                if (rect != null)
                {
                    float cellSize = 60f; // Cell size in pixels
                    rect.anchoredPosition = new Vector2(x * cellSize, -y * cellSize);
                }
                
                // Set color based on searched status
                Image image = obj.GetComponent<Image>();
                if (image != null)
                {
                    Vector2Int location = new Vector2Int(x, y);
                    if (_searchedLocations.Contains(location))
                    {
                        image.color = Color.gray; // Already searched
                    }
                }
                
                // Add click event
                Button button = obj.GetComponent<Button>();
                if (button != null)
                {
                    Vector2Int location = new Vector2Int(x, y);
                    
                    // Disable if already searched
                    button.interactable = !_searchedLocations.Contains(location);
                    
                    button.onClick.AddListener(() => {
                        SearchForIdol(location);
                    });
                }
            }
        }
    }
    
    /// <summary>
    /// Search for idol at a specific location
    /// </summary>
    private void SearchForIdol(Vector2Int location)
    {
        // Check if player has enough energy
        if (!GameManager.Instance.EnergySystem.UseEnergy(_energyCost))
        {
            if (_searchResultText != null)
            {
                _searchResultText.text = "Not enough energy to search!";
            }
            return;
        }
        
        // Mark location as searched
        if (!_searchedLocations.Contains(location))
        {
            _searchedLocations.Add(location);
        }
        
        // Update search grid
        CreateSearchGrid();
        
        // Check if idol was found
        bool foundIdol = _idolLocations.Contains(location);
        
        if (foundIdol)
        {
            // Give idol to player
            SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
            player.GiveIdol();
            
            // Remove idol from locations
            _idolLocations.Remove(location);
            
            // Show success message
            if (_searchResultText != null)
            {
                _searchResultText.text = "You found a Hidden Immunity Idol! Save it for when you need it most.";
            }
        }
        else
        {
            // Random chance of finding idol even at wrong location
            bool luckyFind = Random.value < _idolChance;
            
            if (luckyFind)
            {
                // Give idol to player
                SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
                player.GiveIdol();
                
                // Show success message
                if (_searchResultText != null)
                {
                    _searchResultText.text = "Lucky! You found a Hidden Immunity Idol!";
                }
            }
            else
            {
                // Show failure message
                if (_searchResultText != null)
                {
                    _searchResultText.text = "You searched but found nothing. Keep looking!";
                }
            }
        }
        
        // Add close button
        if (_searchButton != null)
        {
            _searchButton.interactable = true;
            _searchButton.GetComponentInChildren<TMP_Text>().text = "Done Searching";
            _searchButton.onClick.RemoveAllListeners();
            _searchButton.onClick.AddListener(HideIdolSearch);
        }
    }
    
    /// <summary>
    /// Get whether player has an idol
    /// </summary>
    public bool HasIdol()
    {
        SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
        return player != null && player.HasIdol;
    }
    
    /// <summary>
    /// Check if any NPC should find an idol
    /// </summary>
    public void ProcessNPCIdolFinds()
    {
        // Only process this occasionally
        if (Random.value > 0.2f) return;
        
        if (_idolLocations.Count == 0) return;
        
        List<TribeData> tribes = GameManager.Instance.GetTribes();
        
        foreach (var tribe in tribes)
        {
            foreach (var member in tribe.Members)
            {
                // Skip player
                if (member.IsPlayer) continue;
                
                // Skip if already has idol
                if (member.HasIdol) continue;
                
                // Chance based on mental stat
                float findChance = member.MentalStat / 1000f; // 5-9% chance
                
                if (Random.value < findChance)
                {
                    // NPC found an idol
                    member.GiveIdol();
                    
                    // Remove an idol location
                    if (_idolLocations.Count > 0)
                    {
                        _idolLocations.RemoveAt(0);
                    }
                    
                    // Only one idol find per cycle
                    return;
                }
            }
        }
    }
}
