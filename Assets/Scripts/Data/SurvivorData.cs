using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Data structure for a Survivor contestant
/// </summary>
[System.Serializable]
public class SurvivorData
{
    public string Name;
    public string Description;
    public bool IsPlayer;
    public bool IsEliminated;
    public bool HasImmunity;
    public bool HasIdol;
    
    // Survivor traits (0-100)
    public int PhysicalStat;
    public int MentalStat;
    public int PersonalityStat;
    
    // Relationship data with other survivors
    public Dictionary<string, int> Relationships = new Dictionary<string, int>();
    
    // Confessional data for player or NPCs
    public List<string> Confessionals = new List<string>();
    
    public SurvivorData()
    {
        // Default values
        Name = "Unnamed Survivor";
        Description = "";
        IsPlayer = false;
        IsEliminated = false;
        HasImmunity = false;
        HasIdol = false;
        PhysicalStat = Random.Range(50, 91);
        MentalStat = Random.Range(50, 91);
        PersonalityStat = Random.Range(50, 91);
    }
    
    public SurvivorData(string name, string description, int physical, int mental, int personality)
    {
        Name = name;
        Description = description;
        IsPlayer = false;
        IsEliminated = false;
        HasImmunity = false;
        HasIdol = false;
        PhysicalStat = Mathf.Clamp(physical, 0, 100);
        MentalStat = Mathf.Clamp(mental, 0, 100);
        PersonalityStat = Mathf.Clamp(personality, 0, 100);
    }
    
    /// <summary>
    /// Initialize relationship with another survivor
    /// </summary>
    public void InitializeRelationship(string otherSurvivorName)
    {
        if (!Relationships.ContainsKey(otherSurvivorName))
        {
            // Start with a random neutral-ish relationship value (40-60)
            Relationships.Add(otherSurvivorName, Random.Range(40, 61));
        }
    }
    
    /// <summary>
    /// Change relationship value with another survivor
    /// </summary>
    public void ChangeRelationship(string otherSurvivorName, int amount)
    {
        if (!Relationships.ContainsKey(otherSurvivorName))
        {
            InitializeRelationship(otherSurvivorName);
        }
        
        Relationships[otherSurvivorName] = Mathf.Clamp(Relationships[otherSurvivorName] + amount, 0, 100);
    }
    
    /// <summary>
    /// Get relationship value with another survivor
    /// </summary>
    public int GetRelationship(string otherSurvivorName)
    {
        if (!Relationships.ContainsKey(otherSurvivorName))
        {
            InitializeRelationship(otherSurvivorName);
        }
        
        return Relationships[otherSurvivorName];
    }
    
    /// <summary>
    /// Add a confessional statement
    /// </summary>
    public void AddConfessional(string confessional)
    {
        Confessionals.Add(confessional);
    }
    
    /// <summary>
    /// Get performance value for a physical challenge
    /// </summary>
    public int GetPhysicalPerformance()
    {
        // Base performance on physical stat with some randomness
        return PhysicalStat + Random.Range(-10, 11);
    }
    
    /// <summary>
    /// Get performance value for a mental challenge
    /// </summary>
    public int GetMentalPerformance()
    {
        // Base performance on mental stat with some randomness
        return MentalStat + Random.Range(-10, 11);
    }
    
    /// <summary>
    /// Get performance value for a social challenge
    /// </summary>
    public int GetSocialPerformance()
    {
        // Base performance on personality stat with some randomness
        return PersonalityStat + Random.Range(-10, 11);
    }
    
    /// <summary>
    /// Give immunity to this survivor
    /// </summary>
    public void GiveImmunity()
    {
        HasImmunity = true;
    }
    
    /// <summary>
    /// Remove immunity from this survivor
    /// </summary>
    public void RemoveImmunity()
    {
        HasImmunity = false;
    }
    
    /// <summary>
    /// Give hidden immunity idol to this survivor
    /// </summary>
    public void GiveIdol()
    {
        HasIdol = true;
    }
    
    /// <summary>
    /// Use hidden immunity idol
    /// </summary>
    public bool UseIdol()
    {
        if (HasIdol)
        {
            HasIdol = false;
            return true;
        }
        return false;
    }
}
