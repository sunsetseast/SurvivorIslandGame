using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Manages relationships between survivors
/// </summary>
public class RelationshipSystem : MonoBehaviour
{
    private const int MIN_RELATIONSHIP = 0;
    private const int MAX_RELATIONSHIP = 100;
    private const int ALLIANCE_THRESHOLD = 52;
    
    /// <summary>
    /// Initialize relationships between all survivors
    /// </summary>
    public void InitializeAllRelationships()
    {
        List<TribeData> tribes = GameManager.Instance.GetTribes();
        
        foreach (var tribe in tribes)
        {
            foreach (var member1 in tribe.Members)
            {
                foreach (var member2 in tribe.Members)
                {
                    if (member1 != member2)
                    {
                        member1.InitializeRelationship(member2.Name);
                    }
                }
            }
        }
    }
    
    /// <summary>
    /// Change relationship between two survivors
    /// </summary>
    public void ChangeRelationship(SurvivorData survivor1, SurvivorData survivor2, int amount)
    {
        if (survivor1 == null || survivor2 == null) return;
        
        survivor1.ChangeRelationship(survivor2.Name, amount);
        
        // NPCs may reciprocate relationship changes differently
        if (!survivor2.IsPlayer)
        {
            float personalityFactor = survivor2.PersonalityStat / 100f;
            int reciprocalAmount = Mathf.RoundToInt(amount * personalityFactor);
            survivor2.ChangeRelationship(survivor1.Name, reciprocalAmount);
        }
    }
    
    /// <summary>
    /// Get relationship value between two survivors
    /// </summary>
    public int GetRelationship(SurvivorData survivor1, SurvivorData survivor2)
    {
        if (survivor1 == null || survivor2 == null) return 0;
        
        return survivor1.GetRelationship(survivor2.Name);
    }
    
    /// <summary>
    /// Check if two survivors can form an alliance
    /// </summary>
    public bool CanFormAlliance(SurvivorData survivor1, SurvivorData survivor2)
    {
        if (survivor1 == null || survivor2 == null) return false;
        
        return survivor1.GetRelationship(survivor2.Name) >= ALLIANCE_THRESHOLD;
    }
    
    /// <summary>
    /// Process a dialogue choice's effect on relationships
    /// </summary>
    public void ProcessDialogueChoice(SurvivorData speaker, List<SurvivorData> listeners, int choiceIndex, int[] relationshipChanges)
    {
        if (speaker == null || listeners == null || listeners.Count == 0) return;
        
        for (int i = 0; i < listeners.Count && i < relationshipChanges.Length; i++)
        {
            ChangeRelationship(listeners[i], speaker, relationshipChanges[i]);
        }
    }
    
    /// <summary>
    /// Get relationship description between two survivors
    /// </summary>
    public string GetRelationshipDescription(SurvivorData survivor1, SurvivorData survivor2)
    {
        int value = GetRelationship(survivor1, survivor2);
        
        if (value >= 90) return "Best Friends";
        if (value >= 75) return "Close Allies";
        if (value >= 60) return "Friends";
        if (value >= 50) return "Allies";
        if (value >= 40) return "Neutral";
        if (value >= 25) return "Suspicious";
        if (value >= 10) return "Enemies";
        return "Arch Enemies";
    }
    
    /// <summary>
    /// Process random relationship changes during camp phase
    /// </summary>
    public void ProcessRandomRelationships()
    {
        List<TribeData> tribes = GameManager.Instance.GetTribes();
        
        foreach (var tribe in tribes)
        {
            // Only 30% chance to have relationship changes
            if (Random.value > 0.3f) continue;
            
            // Pick two random members
            if (tribe.Members.Count < 2) continue;
            
            int index1 = Random.Range(0, tribe.Members.Count);
            int index2;
            do
            {
                index2 = Random.Range(0, tribe.Members.Count);
            } while (index1 == index2);
            
            SurvivorData survivor1 = tribe.Members[index1];
            SurvivorData survivor2 = tribe.Members[index2];
            
            // Generate random event
            int changeAmount = Random.Range(-3, 4); // -3 to +3
            
            // If player is involved, create a dialogue event
            if (survivor1.IsPlayer || survivor2.IsPlayer)
            {
                SurvivorData player = survivor1.IsPlayer ? survivor1 : survivor2;
                SurvivorData other = survivor1.IsPlayer ? survivor2 : survivor1;
                
                // Generate random dialogue event
                if (changeAmount > 0)
                {
                    string text = $"{other.Name} shares some food with you and tells a story about their life back home.";
                    List<string> choices = new List<string>
                    {
                        "Share your own story (Strengthen bond)",
                        "Listen politely (Neutral)",
                        "Change the subject to strategy (Gameplay focused)"
                    };
                    
                    GameManager.Instance.UIManager.ShowDialogue(text, choices, (choice) => {
                        if (choice == 0) ChangeRelationship(player, other, changeAmount + 2);
                        else if (choice == 1) ChangeRelationship(player, other, changeAmount);
                        else ChangeRelationship(player, other, changeAmount - 1);
                        
                        GameManager.Instance.UIManager.HideDialogue();
                    });
                }
                else if (changeAmount < 0)
                {
                    string text = $"{other.Name} accidentally used your personal item without asking, causing some tension.";
                    List<string> choices = new List<string>
                    {
                        "Confront them directly (Aggressive)",
                        "Mention it casually (Assertive)",
                        "Let it go (Passive)"
                    };
                    
                    GameManager.Instance.UIManager.ShowDialogue(text, choices, (choice) => {
                        if (choice == 0) ChangeRelationship(player, other, changeAmount - 2);
                        else if (choice == 1) ChangeRelationship(player, other, changeAmount);
                        else ChangeRelationship(player, other, changeAmount + 2);
                        
                        GameManager.Instance.UIManager.HideDialogue();
                    });
                }
            }
            else
            {
                // Just make the change for NPCs
                ChangeRelationship(survivor1, survivor2, changeAmount);
            }
        }
    }
    
    /// <summary>
    /// Get all survivors with relationship above threshold
    /// </summary>
    public List<SurvivorData> GetSurvivorsWithRelationshipAbove(SurvivorData survivor, int threshold)
    {
        List<SurvivorData> result = new List<SurvivorData>();
        List<TribeData> tribes = GameManager.Instance.GetTribes();
        
        foreach (var tribe in tribes)
        {
            foreach (var member in tribe.Members)
            {
                if (member != survivor && survivor.GetRelationship(member.Name) >= threshold)
                {
                    result.Add(member);
                }
            }
        }
        
        return result;
    }
}
