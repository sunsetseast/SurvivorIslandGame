using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Character selection screen
/// </summary>
public class CharacterSelectionScreen : MonoBehaviour
{
    [SerializeField] private Transform _survivorGridContainer;
    [SerializeField] private GameObject _survivorCardPrefab;
    [SerializeField] private TMP_Text _titleText;
    [SerializeField] private GameObject _survivorDetailPanel;
    [SerializeField] private TMP_Text _detailNameText;
    [SerializeField] private TMP_Text _detailDescriptionText;
    [SerializeField] private Slider _physicalSlider;
    [SerializeField] private Slider _mentalSlider;
    [SerializeField] private Slider _personalitySlider;
    [SerializeField] private Button _selectButton;
    
    private SurvivorData _selectedSurvivor;
    
    private void OnEnable()
    {
        SetupUI();
    }
    
    private void SetupUI()
    {
        // Set up title text
        if (_titleText != null)
        {
            _titleText.text = "Choose Your Survivor";
        }
        
        // Hide detail panel initially
        if (_survivorDetailPanel != null)
        {
            _survivorDetailPanel.SetActive(false);
        }
        
        // Create survivor grid
        CreateSurvivorGrid();
    }
    
    private void CreateSurvivorGrid()
    {
        if (_survivorGridContainer == null || _survivorCardPrefab == null)
            return;
            
        // Clear existing grid
        foreach (Transform child in _survivorGridContainer)
        {
            Destroy(child.gameObject);
        }
        
        // Get survivor list
        List<SurvivorData> allSurvivors = new List<SurvivorData>();
        TextAsset survivorJson = Resources.Load<TextAsset>("Data/SurvivorDatabase");
        if (survivorJson != null)
        {
            SurvivorDatabase database = JsonUtility.FromJson<SurvivorDatabase>(survivorJson.text);
            allSurvivors = database.survivors;
        }
        else
        {
            // Fallback - create survivors manually
            allSurvivors = CreateFallbackSurvivors();
        }
        
        // Create survivor cards
        foreach (var survivor in allSurvivors)
        {
            GameObject card = Instantiate(_survivorCardPrefab, _survivorGridContainer);
            
            // Set name
            TMP_Text nameText = card.GetComponentInChildren<TMP_Text>();
            if (nameText != null)
            {
                nameText.text = survivor.Name;
            }
            
            // Add click event
            Button cardButton = card.GetComponent<Button>();
            if (cardButton != null)
            {
                SurvivorData cardSurvivor = survivor;
                cardButton.onClick.AddListener(() => {
                    ShowSurvivorDetails(cardSurvivor);
                });
            }
        }
    }
    
    private List<SurvivorData> CreateFallbackSurvivors()
    {
        List<SurvivorData> survivors = new List<SurvivorData>
        {
            new SurvivorData("Russell Hantz", "The villain of Samoa and Heroes vs. Villains known for finding idols without clues", 80, 91, 92),
            new SurvivorData("Sandra Diaz-Twine", "Two-time winner known for her 'anyone but me' strategy", 68, 87, 93),
            new SurvivorData("Parvati Shallow", "Master social player and winner of Fans vs. Favorites", 85, 93, 98),
            new SurvivorData("Amanda Kimmel", "Three-time player known for making it to the end but struggling at Final Tribal", 88, 84, 87),
            new SurvivorData("Ozzy Lusth", "Four-time player known for physical prowess and survival skills", 98, 75, 83),
            new SurvivorData("Michaela Bradshaw", "Athletic and outspoken player from Millennials vs Gen X and Game Changers", 90, 85, 78),
            new SurvivorData("Kelley Wentworth", "Strategic player who used hidden immunity idols masterfully", 87, 92, 88),
            new SurvivorData("Rupert Boneham", "Fan favorite known for his pirate persona and loyalty", 92, 74, 89),
            new SurvivorData("Jeremy Collins", "Winner who played for his family and mastered the meat shield strategy", 91, 90, 94),
            new SurvivorData("Kim Spradlin", "Dominant winner who controlled One World from start to finish", 89, 94, 95),
            new SurvivorData("Michele Fitzgerald", "Social player who won Kaoh Rong and excelled at adapting", 82, 88, 93),
            new SurvivorData("Natalie Anderson", "Winner who avenged her twin's elimination with calculated moves", 93, 91, 87),
            new SurvivorData("Coach Wade", "The 'Dragon Slayer' known for his honor code and stories", 85, 80, 93),
            new SurvivorData("Rob Mariano", "Winner and five-time player known as 'Boston Rob'", 90, 94, 95),
            new SurvivorData("Sarah Lacina", "Winner who played like a cop in Cagayan and a criminal in Game Changers", 88, 90, 89),
            new SurvivorData("Cirie Fields", "Strategic mastermind who went from 'afraid of leaves' to controlling the game", 72, 96, 97),
            new SurvivorData("Tony Vlachos", "Two-time winner known for spy shacks and aggressive gameplay", 86, 95, 92),
            new SurvivorData("Tyson Apostol", "Sarcastic player who won Blood vs. Water with strategic dominance", 92, 89, 91),
            new SurvivorData("Wendell Holland", "Furniture designer who won Ghost Island with social connections and challenge prowess", 89, 87, 91),
            new SurvivorData("Yul Kwon", "Strategic winner of Cook Islands who used the first Super Idol masterfully", 85, 98, 90)
        };
        
        return survivors;
    }
    
    private void ShowSurvivorDetails(SurvivorData survivor)
    {
        _selectedSurvivor = survivor;
        
        if (_survivorDetailPanel != null)
        {
            _survivorDetailPanel.SetActive(true);
        }
        
        // Set name
        if (_detailNameText != null)
        {
            _detailNameText.text = survivor.Name;
        }
        
        // Set description
        if (_detailDescriptionText != null)
        {
            _detailDescriptionText.text = survivor.Description;
        }
        
        // Set stat sliders
        if (_physicalSlider != null)
        {
            _physicalSlider.value = survivor.PhysicalStat;
        }
        
        if (_mentalSlider != null)
        {
            _mentalSlider.value = survivor.MentalStat;
        }
        
        if (_personalitySlider != null)
        {
            _personalitySlider.value = survivor.PersonalityStat;
        }
        
        // Set up select button
        if (_selectButton != null)
        {
            _selectButton.onClick.RemoveAllListeners();
            _selectButton.onClick.AddListener(SelectSurvivor);
        }
    }
    
    private void SelectSurvivor()
    {
        if (_selectedSurvivor == null) return;
        
        // Mark as player character
        _selectedSurvivor.IsPlayer = true;
        
        // Select this survivor
        GameManager.Instance.SelectCharacter(_selectedSurvivor);
    }
    
    [System.Serializable]
    private class SurvivorDatabase
    {
        public List<SurvivorData> survivors;
    }
}
