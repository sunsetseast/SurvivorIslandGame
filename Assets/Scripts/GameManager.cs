using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Main game controller that manages the overall game state and progression
/// </summary>
public class GameManager : MonoBehaviour
{
    public enum GameState
    {
        Welcome,
        CharacterSelection,
        TribeDivision,
        Camp,
        Challenge,
        TribalCouncil,
        Merge,
        FinalTribalCouncil,
        GameOver
    }

    public enum GamePhase
    {
        PreMerge,
        PostMerge,
        Final
    }

    // Singleton instance
    public static GameManager Instance { get; private set; }

    // Current game state
    [SerializeField] private GameState _currentState;
    [SerializeField] private GamePhase _currentPhase;
    
    // Game data
    [SerializeField] private int _currentDay = 1;
    [SerializeField] private int _survivorsRemaining = 20;
    [SerializeField] private int _mergeThreshold = 12;
    [SerializeField] private int _finalThreshold = 3;
    [SerializeField] private List<SurvivorData> _allSurvivors = new List<SurvivorData>();
    [SerializeField] private List<TribeData> _tribes = new List<TribeData>();
    [SerializeField] private List<SurvivorData> _jury = new List<SurvivorData>();
    [SerializeField] private SurvivorData _playerSurvivor;
    [SerializeField] private TribeData _playerTribe;
    [SerializeField] private TribeData _mergedTribe;

    // References to systems
    public RelationshipSystem RelationshipSystem { get; private set; }
    public AllianceSystem AllianceSystem { get; private set; }
    public ChallengeSystem ChallengeSystem { get; private set; }
    public TribalCouncilSystem TribalCouncilSystem { get; private set; }
    public EnergySystem EnergySystem { get; private set; }
    public IdolSystem IdolSystem { get; private set; }
    public UIManager UIManager { get; private set; }

    private void Awake()
    {
        // Singleton pattern implementation
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeGame();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void InitializeGame()
    {
        // Initialize all game systems
        RelationshipSystem = GetComponentInChildren<RelationshipSystem>() ?? gameObject.AddComponent<RelationshipSystem>();
        AllianceSystem = GetComponentInChildren<AllianceSystem>() ?? gameObject.AddComponent<AllianceSystem>();
        ChallengeSystem = GetComponentInChildren<ChallengeSystem>() ?? gameObject.AddComponent<ChallengeSystem>();
        TribalCouncilSystem = GetComponentInChildren<TribalCouncilSystem>() ?? gameObject.AddComponent<TribalCouncilSystem>();
        EnergySystem = GetComponentInChildren<EnergySystem>() ?? gameObject.AddComponent<EnergySystem>();
        IdolSystem = GetComponentInChildren<IdolSystem>() ?? gameObject.AddComponent<IdolSystem>();
        UIManager = GetComponentInChildren<UIManager>() ?? gameObject.AddComponent<UIManager>();

        // Load survivor database
        LoadSurvivorDatabase();
        
        // Set initial game state
        SetGameState(GameState.Welcome);
        _currentPhase = GamePhase.PreMerge;
    }

    private void LoadSurvivorDatabase()
    {
        // Load survivor data from JSON file
        TextAsset survivorJson = Resources.Load<TextAsset>("Data/SurvivorDatabase");
        if (survivorJson != null)
        {
            SurvivorDatabase database = JsonUtility.FromJson<SurvivorDatabase>(survivorJson.text);
            _allSurvivors = database.survivors;
        }
        else
        {
            Debug.LogError("Failed to load survivor database!");
        }
    }

    public void SetGameState(GameState newState)
    {
        _currentState = newState;
        UIManager.UpdateUI(newState);
        
        // Handle state specific logic
        switch (newState)
        {
            case GameState.Welcome:
                break;
                
            case GameState.CharacterSelection:
                break;
                
            case GameState.TribeDivision:
                DivideTribes();
                break;
                
            case GameState.Camp:
                EnergySystem.RefillEnergy();
                break;
                
            case GameState.Challenge:
                ChallengeSystem.StartChallenge();
                break;
                
            case GameState.TribalCouncil:
                TribalCouncilSystem.PrepareTribalCouncil();
                break;
                
            case GameState.Merge:
                MergeTribes();
                _currentPhase = GamePhase.PostMerge;
                break;
                
            case GameState.FinalTribalCouncil:
                TribalCouncilSystem.PrepareFinalTribalCouncil();
                _currentPhase = GamePhase.Final;
                break;
                
            case GameState.GameOver:
                break;
        }
    }

    public void SelectCharacter(SurvivorData survivor)
    {
        _playerSurvivor = survivor;
        SetGameState(GameState.TribeDivision);
    }

    private void DivideTribes()
    {
        // Determine number of tribes (2 or 3)
        int numberOfTribes = Random.Range(0, 2) == 0 ? 2 : 3;
        
        // Load tribe names
        TextAsset tribeNamesJson = Resources.Load<TextAsset>("Data/TribeNames");
        List<string> tribeNames = new List<string>();
        if (tribeNamesJson != null)
        {
            TribeNameDatabase database = JsonUtility.FromJson<TribeNameDatabase>(tribeNamesJson.text);
            tribeNames = database.tribeNames;
        }
        else
        {
            // Fallback tribe names
            tribeNames = new List<string> { "Apa", "Moto", "Galang", "Tadhana", "Bayon", "Malolo", "Vokai", "Kama", "Lairo", "Yara" };
        }
        
        // Create tribes
        _tribes.Clear();
        Color[] tribeColors = { Color.red, Color.blue, Color.green };
        
        for (int i = 0; i < numberOfTribes; i++)
        {
            TribeData tribe = new TribeData();
            tribe.TribeName = tribeNames[Random.Range(0, tribeNames.Count)];
            tribeNames.Remove(tribe.TribeName); // Remove used name
            tribe.TribeColor = tribeColors[i];
            _tribes.Add(tribe);
        }
        
        // Shuffle all survivors
        List<SurvivorData> shuffledSurvivors = new List<SurvivorData>(_allSurvivors);
        for (int i = 0; i < shuffledSurvivors.Count; i++)
        {
            int randomIndex = Random.Range(i, shuffledSurvivors.Count);
            SurvivorData temp = shuffledSurvivors[i];
            shuffledSurvivors[i] = shuffledSurvivors[randomIndex];
            shuffledSurvivors[randomIndex] = temp;
        }
        
        // Replace one random survivor with player's selected survivor
        int playerIndex = Random.Range(0, shuffledSurvivors.Count);
        shuffledSurvivors[playerIndex] = _playerSurvivor;
        
        // Divide survivors into tribes evenly
        int survivorsPerTribe = _survivorsRemaining / numberOfTribes;
        int remainingSurvivors = _survivorsRemaining % numberOfTribes;
        
        int currentIndex = 0;
        for (int i = 0; i < numberOfTribes; i++)
        {
            int tribeSize = survivorsPerTribe + (i < remainingSurvivors ? 1 : 0);
            for (int j = 0; j < tribeSize; j++)
            {
                _tribes[i].Members.Add(shuffledSurvivors[currentIndex]);
                
                // Track which tribe the player is in
                if (shuffledSurvivors[currentIndex] == _playerSurvivor)
                {
                    _playerTribe = _tribes[i];
                }
                
                currentIndex++;
            }
        }
    }

    private void MergeTribes()
    {
        // Create merged tribe
        _mergedTribe = new TribeData();
        _mergedTribe.TribeName = "Merged";
        _mergedTribe.TribeColor = Color.yellow;
        
        // Add all remaining survivors to merged tribe
        foreach (var tribe in _tribes)
        {
            foreach (var member in tribe.Members)
            {
                _mergedTribe.Members.Add(member);
            }
        }
        
        // Replace tribe list with just the merged tribe
        _tribes.Clear();
        _tribes.Add(_mergedTribe);
        _playerTribe = _mergedTribe;
    }

    public void EliminateSurvivor(SurvivorData survivor)
    {
        // Remove survivor from their tribe
        foreach (var tribe in _tribes)
        {
            if (tribe.Members.Contains(survivor))
            {
                tribe.Members.Remove(survivor);
                break;
            }
        }
        
        // Add to jury if appropriate
        if (_survivorsRemaining <= 10)
        {
            _jury.Add(survivor);
        }
        
        _survivorsRemaining--;
        
        // Check if merge should happen
        if (_survivorsRemaining <= _mergeThreshold && _currentPhase == GamePhase.PreMerge)
        {
            SetGameState(GameState.Merge);
        }
        // Check if final tribal council should happen
        else if (_survivorsRemaining <= _finalThreshold)
        {
            SetGameState(GameState.FinalTribalCouncil);
        }
        // Otherwise continue with the game loop
        else
        {
            _currentDay++;
            SetGameState(GameState.Camp);
        }
    }

    public GameState GetCurrentState()
    {
        return _currentState;
    }

    public GamePhase GetCurrentPhase()
    {
        return _currentPhase;
    }

    public int GetCurrentDay()
    {
        return _currentDay;
    }

    public SurvivorData GetPlayerSurvivor()
    {
        return _playerSurvivor;
    }

    public TribeData GetPlayerTribe()
    {
        return _playerTribe;
    }

    public List<TribeData> GetTribes()
    {
        return _tribes;
    }

    public List<SurvivorData> GetJury()
    {
        return _jury;
    }

    public int GetSurvivorsRemaining()
    {
        return _survivorsRemaining;
    }
    
    [System.Serializable]
    private class SurvivorDatabase
    {
        public List<SurvivorData> survivors;
    }
    
    [System.Serializable]
    private class TribeNameDatabase
    {
        public List<string> tribeNames;
    }
}
