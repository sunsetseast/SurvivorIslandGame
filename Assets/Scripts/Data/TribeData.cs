using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Data structure for a Survivor tribe
/// </summary>
[System.Serializable]
public class TribeData
{
    public string TribeName;
    public Color TribeColor;
    public List<SurvivorData> Members = new List<SurvivorData>();
    
    // Tribe resources (0-100)
    public int Fire = 50;
    public int Water = 50;
    public int Food = 50;
    
    // Resource change tracking
    public int FireChange = 0;
    public int WaterChange = 0;
    public int FoodChange = 0;
    
    public TribeData()
    {
        TribeName = "Unnamed Tribe";
        TribeColor = Color.white;
    }
    
    /// <summary>
    /// Calculate average physical stat of tribe members
    /// </summary>
    public float GetAveragePhysicalStat()
    {
        if (Members.Count == 0) return 0;
        
        int total = 0;
        foreach (var member in Members)
        {
            total += member.PhysicalStat;
        }
        
        return (float)total / Members.Count;
    }
    
    /// <summary>
    /// Calculate average mental stat of tribe members
    /// </summary>
    public float GetAverageMentalStat()
    {
        if (Members.Count == 0) return 0;
        
        int total = 0;
        foreach (var member in Members)
        {
            total += member.MentalStat;
        }
        
        return (float)total / Members.Count;
    }
    
    /// <summary>
    /// Calculate average personality stat of tribe members
    /// </summary>
    public float GetAveragePersonalityStat()
    {
        if (Members.Count == 0) return 0;
        
        int total = 0;
        foreach (var member in Members)
        {
            total += member.PersonalityStat;
        }
        
        return (float)total / Members.Count;
    }
    
    /// <summary>
    /// Calculate tribe morale based on relationships
    /// </summary>
    public float GetTribeMorale()
    {
        if (Members.Count <= 1) return 50f;
        
        float totalRelationship = 0f;
        int relationshipCount = 0;
        
        // Calculate average of all relationships within tribe
        foreach (var member1 in Members)
        {
            foreach (var member2 in Members)
            {
                if (member1 != member2)
                {
                    totalRelationship += member1.GetRelationship(member2.Name);
                    relationshipCount++;
                }
            }
        }
        
        if (relationshipCount == 0) return 50f;
        return totalRelationship / relationshipCount;
    }
    
    /// <summary>
    /// Calculate tribe performance factor based on resources
    /// </summary>
    public float GetResourceFactor()
    {
        // Average of all resources converted to 0.5-1.5 multiplier
        float average = (Fire + Water + Food) / 3f;
        return 0.5f + (average / 100f);
    }
    
    /// <summary>
    /// Modify a resource value
    /// </summary>
    public void ModifyResource(ResourceType type, int amount)
    {
        switch (type)
        {
            case ResourceType.Fire:
                Fire = Mathf.Clamp(Fire + amount, 0, 100);
                FireChange += amount;
                break;
            case ResourceType.Water:
                Water = Mathf.Clamp(Water + amount, 0, 100);
                WaterChange += amount;
                break;
            case ResourceType.Food:
                Food = Mathf.Clamp(Food + amount, 0, 100);
                FoodChange += amount;
                break;
        }
    }
    
    /// <summary>
    /// Reset resource change tracking
    /// </summary>
    public void ResetResourceChanges()
    {
        FireChange = 0;
        WaterChange = 0;
        FoodChange = 0;
    }
    
    /// <summary>
    /// Get the player in this tribe, if any
    /// </summary>
    public SurvivorData GetPlayerMember()
    {
        foreach (var member in Members)
        {
            if (member.IsPlayer)
            {
                return member;
            }
        }
        return null;
    }
    
    /// <summary>
    /// Check if this tribe contains the player
    /// </summary>
    public bool ContainsPlayer()
    {
        return GetPlayerMember() != null;
    }
    
    public enum ResourceType
    {
        Fire,
        Water,
        Food
    }
}
