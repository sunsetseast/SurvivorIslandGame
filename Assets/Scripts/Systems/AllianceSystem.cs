using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Manages alliances between survivors
/// </summary>
public class AllianceSystem : MonoBehaviour
{
    [System.Serializable]
    public class Alliance
    {
        public string AllianceName;
        public List<SurvivorData> Members = new List<SurvivorData>();
        public float Strength; // 0-100 based on average relationship
        
        public Alliance(string name)
        {
            AllianceName = name;
        }
        
        /// <summary>
        /// Calculate alliance strength based on relationship average
        /// </summary>
        public void CalculateStrength()
        {
            if (Members.Count <= 1)
            {
                Strength = 0;
                return;
            }
            
            float total = 0;
            int count = 0;
            
            foreach (var member1 in Members)
            {
                foreach (var member2 in Members)
                {
                    if (member1 != member2)
                    {
                        total += member1.GetRelationship(member2.Name);
                        count++;
                    }
                }
            }
            
            Strength = count > 0 ? total / count : 0;
        }
        
        /// <summary>
        /// Check if alliance contains a specific survivor
        /// </summary>
        public bool ContainsMember(SurvivorData survivor)
        {
            return Members.Contains(survivor);
        }
        
        /// <summary>
        /// Add a member to alliance
        /// </summary>
        public bool AddMember(SurvivorData survivor)
        {
            if (!ContainsMember(survivor))
            {
                Members.Add(survivor);
                CalculateStrength();
                return true;
            }
            return false;
        }
        
        /// <summary>
        /// Remove a member from alliance
        /// </summary>
        public bool RemoveMember(SurvivorData survivor)
        {
            if (ContainsMember(survivor))
            {
                Members.Remove(survivor);
                CalculateStrength();
                return true;
            }
            return false;
        }
    }
    
    [SerializeField] private List<Alliance> _alliances = new List<Alliance>();
    private const int ALLIANCE_THRESHOLD = 52;
    
    /// <summary>
    /// Create a new alliance with a specific name
    /// </summary>
    public Alliance CreateAlliance(string name)
    {
        Alliance alliance = new Alliance(name);
        _alliances.Add(alliance);
        return alliance;
    }
    
    /// <summary>
    /// Create alliance between two survivors
    /// </summary>
    public Alliance CreateAlliance(SurvivorData survivor1, SurvivorData survivor2)
    {
        // Check if they can form an alliance
        if (GameManager.Instance.RelationshipSystem.GetRelationship(survivor1, survivor2) < ALLIANCE_THRESHOLD)
        {
            return null;
        }
        
        // Check if they're already in an alliance together
        foreach (var alliance in _alliances)
        {
            if (alliance.ContainsMember(survivor1) && alliance.ContainsMember(survivor2))
            {
                return alliance;
            }
        }
        
        // Create a new alliance
        string allianceName = $"Alliance {_alliances.Count + 1}";
        Alliance newAlliance = new Alliance(allianceName);
        newAlliance.AddMember(survivor1);
        newAlliance.AddMember(survivor2);
        _alliances.Add(newAlliance);
        
        return newAlliance;
    }
    
    /// <summary>
    /// Get all alliances a survivor is part of
    /// </summary>
    public List<Alliance> GetSurvivorAlliances(SurvivorData survivor)
    {
        List<Alliance> result = new List<Alliance>();
        
        foreach (var alliance in _alliances)
        {
            if (alliance.ContainsMember(survivor))
            {
                result.Add(alliance);
            }
        }
        
        return result;
    }
    
    /// <summary>
    /// Try to add survivor to an existing alliance
    /// </summary>
    public bool AddToAlliance(Alliance alliance, SurvivorData newMember)
    {
        if (alliance == null || newMember == null) return false;
        
        // Check relationship with all members
        foreach (var member in alliance.Members)
        {
            if (GameManager.Instance.RelationshipSystem.GetRelationship(member, newMember) < ALLIANCE_THRESHOLD)
            {
                return false;
            }
        }
        
        return alliance.AddMember(newMember);
    }
    
    /// <summary>
    /// Remove survivor from an alliance
    /// </summary>
    public bool RemoveFromAlliance(Alliance alliance, SurvivorData member)
    {
        if (alliance == null || member == null) return false;
        
        bool result = alliance.RemoveMember(member);
        
        // If alliance only has 1 or 0 members, dissolve it
        if (alliance.Members.Count <= 1)
        {
            _alliances.Remove(alliance);
        }
        
        return result;
    }
    
    /// <summary>
    /// Process alliance voting decisions for tribal council
    /// </summary>
    public Dictionary<SurvivorData, SurvivorData> GetAllianceVotes(TribeData tribe, List<SurvivorData> immunePlayers)
    {
        Dictionary<SurvivorData, SurvivorData> votes = new Dictionary<SurvivorData, SurvivorData>();
        
        // First, identify all alliances in this tribe
        List<Alliance> tribeAlliances = new List<Alliance>();
        foreach (var alliance in _alliances)
        {
            bool allianceInTribe = false;
            foreach (var member in alliance.Members)
            {
                if (tribe.Members.Contains(member))
                {
                    allianceInTribe = true;
                    break;
                }
            }
            
            if (allianceInTribe)
            {
                tribeAlliances.Add(alliance);
            }
        }
        
        // Sort alliances by strength, strongest first
        tribeAlliances.Sort((a, b) => b.Strength.CompareTo(a.Strength));
        
        // Process each alliance
        foreach (var alliance in tribeAlliances)
        {
            // Determine target(s) - non-alliance members with lowest relationship
            List<SurvivorData> targets = new List<SurvivorData>();
            
            foreach (var tribeMember in tribe.Members)
            {
                if (!alliance.ContainsMember(tribeMember) && !immunePlayers.Contains(tribeMember))
                {
                    targets.Add(tribeMember);
                }
            }
            
            if (targets.Count == 0) continue;
            
            // Sort targets by average relationship with alliance members (lowest first)
            targets.Sort((a, b) => 
            {
                float avgRelA = 0, avgRelB = 0;
                
                foreach (var member in alliance.Members)
                {
                    avgRelA += member.GetRelationship(a.Name);
                    avgRelB += member.GetRelationship(b.Name);
                }
                
                avgRelA /= alliance.Members.Count;
                avgRelB /= alliance.Members.Count;
                
                return avgRelA.CompareTo(avgRelB);
            });
            
            // Alliance targets the lowest relationship survivor
            SurvivorData target = targets[0];
            
            // All alliance members vote for this target
            foreach (var member in alliance.Members)
            {
                if (tribe.Members.Contains(member) && !votes.ContainsKey(member))
                {
                    votes[member] = target;
                }
            }
        }
        
        return votes;
    }
    
    /// <summary>
    /// Update alliance strengths based on current relationships
    /// </summary>
    public void UpdateAllianceStrengths()
    {
        foreach (var alliance in _alliances)
        {
            alliance.CalculateStrength();
        }
        
        // Remove any alliances with 0 or 1 members
        _alliances.RemoveAll(a => a.Members.Count <= 1);
    }
    
    /// <summary>
    /// Suggest potential alliance members for a player
    /// </summary>
    public List<SurvivorData> SuggestPotentialAllies(SurvivorData player)
    {
        List<SurvivorData> potential = new List<SurvivorData>();
        
        TribeData playerTribe = GameManager.Instance.GetPlayerTribe();
        
        foreach (var member in playerTribe.Members)
        {
            if (member != player && 
                GameManager.Instance.RelationshipSystem.GetRelationship(player, member) >= ALLIANCE_THRESHOLD)
            {
                potential.Add(member);
            }
        }
        
        // Sort by relationship strength
        potential.Sort((a, b) => 
            player.GetRelationship(b.Name).CompareTo(player.GetRelationship(a.Name))
        );
        
        return potential;
    }
}
