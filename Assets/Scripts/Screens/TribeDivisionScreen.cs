using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Tribe division screen
/// </summary>
public class TribeDivisionScreen : MonoBehaviour
{
    [SerializeField] private Transform _tribesContainer;
    [SerializeField] private GameObject _tribeDisplayPrefab;
    [SerializeField] private TMP_Text _titleText;
    [SerializeField] private Button _continueButton;
    [SerializeField] private bool _isMergeScreen = false;
    
    private void OnEnable()
    {
        // Check if this is being used for merge
        _isMergeScreen = GameManager.Instance.GetCurrentState() == GameManager.GameState.Merge;
        
        SetupUI();
    }
    
    private void SetupUI()
    {
        // Set up title text
        if (_titleText != null)
        {
            if (_isMergeScreen)
            {
                _titleText.text = "Tribes are merging!";
            }
            else
            {
                _titleText.text = "Tribe Division";
            }
        }
        
        // Create tribe displays
        CreateTribeDisplays();
        
        // Set up continue button
        if (_continueButton != null)
        {
            _continueButton.onClick.RemoveAllListeners();
            _continueButton.onClick.AddListener(OnContinueClick);
        }
    }
    
    private void CreateTribeDisplays()
    {
        if (_tribesContainer == null || _tribeDisplayPrefab == null)
            return;
            
        // Clear existing displays
        foreach (Transform child in _tribesContainer)
        {
            Destroy(child.gameObject);
        }
        
        // Get tribes
        List<TribeData> tribes = GameManager.Instance.GetTribes();
        
        // Create display for each tribe
        foreach (var tribe in tribes)
        {
            GameObject display = Instantiate(_tribeDisplayPrefab, _tribesContainer);
            
            // Set tribe name
            TMP_Text nameText = display.transform.Find("TribeName")?.GetComponent<TMP_Text>();
            if (nameText != null)
            {
                nameText.text = tribe.TribeName;
                nameText.color = tribe.TribeColor;
            }
            
            // Set up member list
            Transform memberList = display.transform.Find("MemberList");
            if (memberList != null)
            {
                foreach (var member in tribe.Members)
                {
                    GameObject memberObj = new GameObject(member.Name);
                    memberObj.transform.SetParent(memberList);
                    
                    TMP_Text memberText = memberObj.AddComponent<TMP_Text>();
                    memberText.text = member.Name;
                    memberText.fontSize = 14;
                    memberText.alignment = TextAlignmentOptions.Left;
                    
                    // Highlight player
                    if (member.IsPlayer)
                    {
                        memberText.fontStyle = FontStyles.Bold;
                        memberText.color = Color.yellow;
                    }
                    
                    // Set up rect transform
                    RectTransform rect = memberText.GetComponent<RectTransform>();
                    rect.sizeDelta = new Vector2(200, 20);
                }
            }
            
            // Color the tribe display
            Image bgImage = display.GetComponent<Image>();
            if (bgImage != null)
            {
                Color bgColor = tribe.TribeColor;
                bgColor.a = 0.2f; // Low alpha for background
                bgImage.color = bgColor;
            }
        }
    }
    
    private void OnContinueClick()
    {
        if (_isMergeScreen)
        {
            // After merge, go to camp
            GameManager.Instance.SetGameState(GameManager.GameState.Camp);
        }
        else
        {
            // After initial division, go to first challenge
            GameManager.Instance.SetGameState(GameManager.GameState.Challenge);
        }
    }
}
