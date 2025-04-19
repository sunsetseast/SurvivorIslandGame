// This script fixes camp screen functionality
// Add this script to index.html to fix camp screen functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('fixCamp.js loaded - patching camp screen functionality');
    
    // Wait for the game to load
    setTimeout(function() {
        // Fix location buttons
        function fixLocationButtons() {
            console.log('Fixing location buttons');
            const locationButtonsContainer = document.getElementById('location-buttons');
            if (!locationButtonsContainer) {
                console.error('Location buttons container not found');
                return;
            }
            
            // Clear container
            locationButtonsContainer.innerHTML = '';
            
            // Define locations
            const locations = [
                {
                    name: "Beach",
                    description: "The sandy shore around your camp where you can collect water and fish."
                },
                {
                    name: "Jungle",
                    description: "The dense forest surrounding your camp where resources and hidden idols can be found."
                },
                {
                    name: "Camp",
                    description: "Your tribe's main living area with shelter and fire."
                },
                {
                    name: "Private Area",
                    description: "A secluded spot away from camp where you can think or have private conversations."
                }
            ];
            
            // Create buttons for each location
            locations.forEach(location => {
                const button = document.createElement('button');
                button.className = 'location-button';
                button.textContent = location.name;
                button.setAttribute('data-location', location.name);
                
                // Style the button to be more visible
                button.style.margin = '5px';
                button.style.padding = '10px 20px';
                button.style.backgroundColor = '#5cb85c';
                button.style.color = 'white';
                button.style.border = 'none';
                button.style.borderRadius = '5px';
                button.style.cursor = 'pointer';
                button.style.fontWeight = 'bold';
                
                button.onclick = function() {
                    console.log(`Location ${location.name} clicked`);
                    
                    // Mark this button as selected
                    document.querySelectorAll('.location-button').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    // Show location actions
                    const locationActions = document.getElementById('location-actions');
                    if (locationActions) {
                        locationActions.classList.remove('hidden');
                        
                        // Set location name and description
                        const locationNameElement = document.getElementById('location-name');
                        const locationDescriptionElement = document.getElementById('location-description');
                        
                        if (locationNameElement) locationNameElement.textContent = location.name;
                        if (locationDescriptionElement) locationDescriptionElement.textContent = location.description;
                        
                        // Create action buttons based on location
                        const actionButtons = document.getElementById('action-buttons');
                        if (actionButtons) {
                            actionButtons.innerHTML = '';
                            
                            // Define actions for each location
                            let actions = [];
                            
                            switch (location.name) {
                                case "Beach":
                                    actions = [
                                        { name: "Collect Water", type: "collectWater", energyCost: 1 },
                                        { name: "Fish", type: "findFood", energyCost: 1 },
                                        { name: "Social Time", type: "socialize", energyCost: 1 }
                                    ];
                                    break;
                                case "Jungle":
                                    actions = [
                                        { name: "Gather Firewood", type: "gatherFirewood", energyCost: 1 },
                                        { name: "Forage for Food", type: "findFood", energyCost: 1 },
                                        { name: "Look for Idol", type: "searchForIdol", energyCost: 2 }
                                    ];
                                    break;
                                case "Camp":
                                    actions = [
                                        { name: "Rest", type: "rest", energyCost: 0 },
                                        { name: "Maintain Fire", type: "gatherFirewood", energyCost: 1 },
                                        { name: "Strategy Talk", type: "strategic", energyCost: 1 }
                                    ];
                                    break;
                                case "Private Area":
                                    actions = [
                                        { name: "Strategic Planning", type: "strategic", energyCost: 1 },
                                        { name: "Physical Training", type: "trainPhysical", energyCost: 1 },
                                        { name: "Mental Exercises", type: "trainMental", energyCost: 1 }
                                    ];
                                    break;
                            }
                            
                            // Create buttons for each action
                            actions.forEach(action => {
                                const actionButton = document.createElement('button');
                                actionButton.className = 'action-button';
                                actionButton.textContent = `${action.name} (${action.energyCost} Energy)`;
                                actionButton.setAttribute('data-action', action.type);
                                actionButton.setAttribute('data-energy', action.energyCost);
                                
                                // Style the button
                                actionButton.style.margin = '5px';
                                actionButton.style.padding = '10px 20px';
                                actionButton.style.backgroundColor = '#5bc0de';
                                actionButton.style.color = 'white';
                                actionButton.style.border = 'none';
                                actionButton.style.borderRadius = '5px';
                                actionButton.style.cursor = 'pointer';
                                
                                actionButton.onclick = function() {
                                    const actionType = this.getAttribute('data-action');
                                    console.log(`Action ${actionType} clicked`);
                                    
                                    // Check if CampScreen has method for this action
                                    if (window.CampScreen && typeof window.CampScreen[actionType] === 'function') {
                                        window.CampScreen[actionType]();
                                    } else {
                                        console.error(`No handler found for action ${actionType}`);
                                    }
                                };
                                
                                actionButtons.appendChild(actionButton);
                            });
                        }
                    }
                };
                
                locationButtonsContainer.appendChild(button);
            });
            
            // Set up the back button to hide location actions
            const backButton = document.getElementById('back-to-locations-button');
            if (backButton) {
                backButton.onclick = function() {
                    const locationActions = document.getElementById('location-actions');
                    if (locationActions) {
                        locationActions.classList.add('hidden');
                    }
                };
            }
        }
        
        // Fix personal health buttons
        function fixPersonalHealthButtons() {
            console.log('Fixing personal health buttons');
            const eatButton = document.getElementById('eat-button');
            const drinkButton = document.getElementById('drink-button');
            const personalRestButton = document.getElementById('personal-rest-button');
            
            if (eatButton) {
                eatButton.onclick = function() {
                    console.log('Eat button clicked');
                    if (window.CampScreen && typeof window.CampScreen.performPersonalHealthAction === 'function') {
                        window.CampScreen.performPersonalHealthAction('eat');
                    } else {
                        console.error('No handler found for eat action');
                    }
                };
            }
            
            if (drinkButton) {
                drinkButton.onclick = function() {
                    console.log('Drink button clicked');
                    if (window.CampScreen && typeof window.CampScreen.performPersonalHealthAction === 'function') {
                        window.CampScreen.performPersonalHealthAction('drink');
                    } else {
                        console.error('No handler found for drink action');
                    }
                };
            }
            
            if (personalRestButton) {
                personalRestButton.onclick = function() {
                    console.log('Rest button clicked');
                    if (window.CampScreen && typeof window.CampScreen.performPersonalHealthAction === 'function') {
                        window.CampScreen.performPersonalHealthAction('rest');
                    } else {
                        console.error('No handler found for rest action');
                    }
                };
            }
        }
        
        // Fix bottom navigation buttons
        function fixNavigationButtons() {
            console.log('Fixing navigation buttons');
            const viewRelationshipsButton = document.getElementById('view-relationships-button');
            const viewAlliancesButton = document.getElementById('view-alliances-button');
            const proceedToChallengeButton = document.getElementById('proceed-to-challenge-button');
            
            if (viewRelationshipsButton) {
                viewRelationshipsButton.onclick = function() {
                    console.log('View relationships button clicked');
                    if (window.CampScreen && typeof window.CampScreen.viewRelationships === 'function') {
                        window.CampScreen.viewRelationships();
                    } else {
                        console.error('No handler found for view relationships');
                    }
                };
            }
            
            if (viewAlliancesButton) {
                viewAlliancesButton.onclick = function() {
                    console.log('View alliances button clicked');
                    if (window.CampScreen && typeof window.CampScreen.viewAlliances === 'function') {
                        window.CampScreen.viewAlliances();
                    } else {
                        console.error('No handler found for view alliances');
                    }
                };
            }
            
            if (proceedToChallengeButton) {
                proceedToChallengeButton.onclick = function() {
                    console.log('Proceed to challenge button clicked');
                    if (window.CampScreen && typeof window.CampScreen.proceedToNextPhase === 'function') {
                        window.CampScreen.proceedToNextPhase();
                    } else {
                        console.error('No handler found for proceed to challenge');
                    }
                };
            }
        }
        
        // Add hooks to fix camp screen when it becomes visible
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style') {
                    const campScreen = document.getElementById('camp-screen');
                    if (campScreen && campScreen.style.display !== 'none') {
                        console.log('Camp screen is now visible, applying fixes');
                        fixLocationButtons();
                        fixPersonalHealthButtons();
                        fixNavigationButtons();
                    }
                }
            });
        });
        
        const campScreen = document.getElementById('camp-screen');
        if (campScreen) {
            observer.observe(campScreen, { attributes: true });
            
            // Also fix now if camp screen is already visible
            if (campScreen.style.display !== 'none') {
                console.log('Camp screen is already visible, applying fixes');
                fixLocationButtons();
                fixPersonalHealthButtons();
                fixNavigationButtons();
            }
        }
    }, 1000); // Allow game to initialize first
});