using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Welcome screen for the game
/// </summary>
public class WelcomeScreen : MonoBehaviour
{
    [SerializeField] private Button _playButton;
    [SerializeField] private TMP_Text _titleText;
    [SerializeField] private Image _backgroundImage;
    
    private void OnEnable()
    {
        SetupUI();
    }
    
    private void SetupUI()
    {
        // Set up title text
        if (_titleText != null)
        {
            _titleText.text = "Survivor Island";
        }
        
        // Set up play button
        if (_playButton != null)
        {
            _playButton.onClick.RemoveAllListeners();
            _playButton.onClick.AddListener(OnPlayButtonClick);
        }
        
        // Set up background
        if (_backgroundImage != null)
        {
            _backgroundImage.color = new Color(0.2f, 0.6f, 0.8f); // Light blue for tropical water
        }
    }
    
    private void OnPlayButtonClick()
    {
        GameManager.Instance.SetGameState(GameManager.GameState.CharacterSelection);
    }
}
