using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.IO;

/// <summary>
/// Manages game state saving and loading
/// </summary>
public class SaveSystem : MonoBehaviour
{
    private const string SAVE_FILE_NAME = "survivor_island_save.json";
    private const string GAME_STATE_KEY = "gameState";
    private const string PLAYER_KEY = "player";
    private const string TRIBES_KEY = "tribes";
    private const string JURY_KEY = "jury";
    private const string CURRENT_DAY_KEY = "currentDay";
    private const string PHASE_KEY = "gamePhase";
    
    [System.Serializable]
    private class SaveData
    {
        public int gameState;
        public int gamePhase;
        public int currentDay;
        public SerializableSurvivor player;
        public List<SerializableTribe> tribes = new List<SerializableTribe>();
        public List<SerializableSurvivor> jury = new List<SerializableSurvivor>();
    }
    
    [System.Serializable]
    private class SerializableSurvivor
    {
        public string name;
        public string description;
        public bool isPlayer;
        public bool isEliminated;
        public bool hasImmunity;
        public bool hasIdol;
        public int physicalStat;
        public int mentalStat;
        public int personalityStat;
        public Dictionary<string, int> relationships = new Dictionary<string, int>();
        
        public SerializableSurvivor(SurvivorData survivor)
        {
            name = survivor.Name;
            description = survivor.Description;
            isPlayer = survivor.IsPlayer;
            isEliminated = survivor.IsEliminated;
            hasImmunity = survivor.HasImmunity;
            hasIdol = survivor.HasIdol;
            physicalStat = survivor.PhysicalStat;
            mentalStat = survivor.MentalStat;
            personalityStat = survivor.PersonalityStat;
            relationships = new Dictionary<string, int>(survivor.Relationships);
        }
        
        public SurvivorData ToSurvivorData()
        {
            SurvivorData survivor = new SurvivorData(name, description, physicalStat, mentalStat, personalityStat);
            survivor.IsPlayer = isPlayer;
            survivor.IsEliminated = isEliminated;
            survivor.HasImmunity = hasImmunity;
            survivor.HasIdol = hasIdol;
            
            foreach (var relationship in relationships)
            {
                survivor.Relationships[relationship.Key] = relationship.Value;
            }
            
            return survivor;
        }
    }
    
    [System.Serializable]
    private class SerializableTribe
    {
        public string tribeName;
        public Color tribeColor;
        public List<string> memberNames = new List<string>();
        public int fire;
        public int water;
        public int food;
        
        public SerializableTribe(TribeData tribe, Dictionary<string, SerializableSurvivor> survivorMap)
        {
            tribeName = tribe.TribeName;
            tribeColor = tribe.TribeColor;
            fire = tribe.Fire;
            water = tribe.Water;
            food = tribe.Food;
            
            foreach (var member in tribe.Members)
            {
                memberNames.Add(member.Name);
                
                // Make sure survivor is in the map
                if (!survivorMap.ContainsKey(member.Name))
                {
                    survivorMap[member.Name] = new SerializableSurvivor(member);
                }
            }
        }
    }
    
    /// <summary>
    /// Save the current game state
    /// </summary>
    public void SaveGame()
    {
        SaveData saveData = new SaveData();
        
        // Save game state
        saveData.gameState = (int)GameManager.Instance.GetCurrentState();
        saveData.gamePhase = (int)GameManager.Instance.GetCurrentPhase();
        saveData.currentDay = GameManager.Instance.GetCurrentDay();
        
        // Create a map of all survivors for easy reference
        Dictionary<string, SerializableSurvivor> survivorMap = new Dictionary<string, SerializableSurvivor>();
        
        // Save player
        SurvivorData player = GameManager.Instance.GetPlayerSurvivor();
        saveData.player = new SerializableSurvivor(player);
        survivorMap[player.Name] = saveData.player;
        
        // Save tribes
        foreach (var tribe in GameManager.Instance.GetTribes())
        {
            saveData.tribes.Add(new SerializableTribe(tribe, survivorMap));
        }
        
        // Save jury
        foreach (var juryMember in GameManager.Instance.GetJury())
        {
            if (!survivorMap.ContainsKey(juryMember.Name))
            {
                SerializableSurvivor serializableJuryMember = new SerializableSurvivor(juryMember);
                saveData.jury.Add(serializableJuryMember);
                survivorMap[juryMember.Name] = serializableJuryMember;
            }
            else
            {
                saveData.jury.Add(survivorMap[juryMember.Name]);
            }
        }
        
        // Convert to JSON
        string json = JsonUtility.ToJson(saveData, true);
        
        // Save to file
        string savePath = Path.Combine(Application.persistentDataPath, SAVE_FILE_NAME);
        File.WriteAllText(savePath, json);
        
        Debug.Log($"Game saved to {savePath}");
    }
    
    /// <summary>
    /// Load a saved game
    /// </summary>
    public bool LoadGame()
    {
        string savePath = Path.Combine(Application.persistentDataPath, SAVE_FILE_NAME);
        
        if (!File.Exists(savePath))
        {
            Debug.Log("No save file found.");
            return false;
        }
        
        try
        {
            // Read save file
            string json = File.ReadAllText(savePath);
            SaveData saveData = JsonUtility.FromJson<SaveData>(json);
            
            // Create a map of all survivors
            Dictionary<string, SurvivorData> survivorMap = new Dictionary<string, SurvivorData>();
            
            // Load player
            SurvivorData player = saveData.player.ToSurvivorData();
            survivorMap[player.Name] = player;
            
            // Load jury
            List<SurvivorData> jury = new List<SurvivorData>();
            foreach (var juryMember in saveData.jury)
            {
                SurvivorData survivor = juryMember.ToSurvivorData();
                jury.Add(survivor);
                survivorMap[survivor.Name] = survivor;
            }
            
            // Load tribes
            List<TribeData> tribes = new List<TribeData>();
            foreach (var serializableTribe in saveData.tribes)
            {
                TribeData tribe = new TribeData();
                tribe.TribeName = serializableTribe.tribeName;
                tribe.TribeColor = serializableTribe.tribeColor;
                tribe.Fire = serializableTribe.fire;
                tribe.Water = serializableTribe.water;
                tribe.Food = serializableTribe.food;
                
                foreach (var memberName in serializableTribe.memberNames)
                {
                    if (survivorMap.ContainsKey(memberName))
                    {
                        tribe.Members.Add(survivorMap[memberName]);
                    }
                }
                
                tribes.Add(tribe);
            }
            
            // Apply loaded data to game manager
            // Note: A proper implementation would involve having a LoadGameState method in GameManager
            // The below code is simplified for illustration
            
            GameManager gameManager = GameManager.Instance;
            
            // Set game state
            gameManager.SetGameState((GameManager.GameState)saveData.gameState);
            
            Debug.Log("Game loaded successfully.");
            return true;
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Error loading game: {e.Message}");
            return false;
        }
    }
    
    /// <summary>
    /// Check if save file exists
    /// </summary>
    public bool SaveFileExists()
    {
        string savePath = Path.Combine(Application.persistentDataPath, SAVE_FILE_NAME);
        return File.Exists(savePath);
    }
    
    /// <summary>
    /// Delete save file
    /// </summary>
    public void DeleteSaveFile()
    {
        string savePath = Path.Combine(Application.persistentDataPath, SAVE_FILE_NAME);
        
        if (File.Exists(savePath))
        {
            File.Delete(savePath);
            Debug.Log("Save file deleted.");
        }
    }
    
    /// <summary>
    /// Auto-save game after important events
    /// </summary>
    public void AutoSave()
    {
        SaveGame();
    }
}
