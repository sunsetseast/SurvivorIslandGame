using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Manages player energy for camp activities
/// </summary>
public class EnergySystem : MonoBehaviour
{
    [SerializeField] private int _maxEnergy = 3;
    [SerializeField] private int _currentEnergy = 3;
    [SerializeField] private float _energyRechargeTime = 10f; // Minutes
    [SerializeField] private System.DateTime _lastRechargeTime;
    
    private const string ENERGY_SAVE_KEY = "SurvivorEnergy";
    private const string RECHARGE_TIME_KEY = "SurvivorRechargeTime";
    
    private void Awake()
    {
        LoadEnergyState();
    }
    
    /// <summary>
    /// Load saved energy state
    /// </summary>
    private void LoadEnergyState()
    {
        _currentEnergy = PlayerPrefs.GetInt(ENERGY_SAVE_KEY, _maxEnergy);
        
        string timeStr = PlayerPrefs.GetString(RECHARGE_TIME_KEY, System.DateTime.Now.ToString());
        if (System.DateTime.TryParse(timeStr, out System.DateTime savedTime))
        {
            _lastRechargeTime = savedTime;
        }
        else
        {
            _lastRechargeTime = System.DateTime.Now;
        }
    }
    
    /// <summary>
    /// Save current energy state
    /// </summary>
    private void SaveEnergyState()
    {
        PlayerPrefs.SetInt(ENERGY_SAVE_KEY, _currentEnergy);
        PlayerPrefs.SetString(RECHARGE_TIME_KEY, _lastRechargeTime.ToString());
        PlayerPrefs.Save();
    }
    
    /// <summary>
    /// Use energy for an activity
    /// </summary>
    public bool UseEnergy(int amount = 1)
    {
        if (_currentEnergy >= amount)
        {
            _currentEnergy -= amount;
            SaveEnergyState();
            
            // Update UI
            GameManager.Instance.UIManager.UpdateEnergyDisplay();
            
            return true;
        }
        
        return false;
    }
    
    /// <summary>
    /// Refill energy to maximum
    /// </summary>
    public void RefillEnergy()
    {
        _currentEnergy = _maxEnergy;
        _lastRechargeTime = System.DateTime.Now;
        SaveEnergyState();
        
        // Update UI
        GameManager.Instance.UIManager.UpdateEnergyDisplay();
    }
    
    /// <summary>
    /// Add energy
    /// </summary>
    public void AddEnergy(int amount = 1)
    {
        _currentEnergy = Mathf.Min(_currentEnergy + amount, _maxEnergy);
        SaveEnergyState();
        
        // Update UI
        GameManager.Instance.UIManager.UpdateEnergyDisplay();
    }
    
    /// <summary>
    /// Get current energy amount
    /// </summary>
    public int GetCurrentEnergy()
    {
        // Check for natural recharge
        CheckEnergyRecharge();
        return _currentEnergy;
    }
    
    /// <summary>
    /// Get maximum energy amount
    /// </summary>
    public int GetMaxEnergy()
    {
        return _maxEnergy;
    }
    
    /// <summary>
    /// Check if energy has recharged naturally over time
    /// </summary>
    private void CheckEnergyRecharge()
    {
        if (_currentEnergy >= _maxEnergy)
            return;
            
        System.DateTime now = System.DateTime.Now;
        double minutesPassed = (now - _lastRechargeTime).TotalMinutes;
        
        int energyToAdd = Mathf.FloorToInt((float)minutesPassed / _energyRechargeTime);
        
        if (energyToAdd > 0)
        {
            _currentEnergy = Mathf.Min(_currentEnergy + energyToAdd, _maxEnergy);
            _lastRechargeTime = now.AddMinutes(-((minutesPassed % _energyRechargeTime)));
            SaveEnergyState();
            
            // Update UI
            GameManager.Instance.UIManager.UpdateEnergyDisplay();
        }
    }
    
    /// <summary>
    /// Get time until next energy point
    /// </summary>
    public string GetTimeUntilNextEnergy()
    {
        if (_currentEnergy >= _maxEnergy)
            return "Full";
            
        System.DateTime now = System.DateTime.Now;
        double minutesPassed = (now - _lastRechargeTime).TotalMinutes;
        double minutesRemaining = _energyRechargeTime - (minutesPassed % _energyRechargeTime);
        
        System.TimeSpan timeSpan = System.TimeSpan.FromMinutes(minutesRemaining);
        return $"{timeSpan.Hours:00}:{timeSpan.Minutes:00}:{timeSpan.Seconds:00}";
    }
}
