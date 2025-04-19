// This script fixes JSON syntax errors in IdolSystem.js
// Add this script right before IdolSystem.js is loaded

document.addEventListener('DOMContentLoaded', function() {
    console.log('fixIdol.js loaded - patching console.log to prevent JSON syntax errors');
    
    // Create a wrapper for console.log that prevents JSON.stringify errors
    const originalConsoleLog = console.log;
    console.log = function() {
        try {
            // Convert arguments to strings to detect problematic calls
            const args = Array.from(arguments);
            
            // Check if this is the problematic message pattern
            if (args.length > 0 && 
                typeof args[0] === 'string' && 
                (args[0].includes('Idol hidden in') || args[0].includes('Current idol location'))) {
                
                // Handle this case specifically and safely
                originalConsoleLog.call(console, args[0]);
                
                // Log each property separately to avoid JSON stringify issues
                if (args.length > 1 && args[1] && typeof args[1] === 'object') {
                    const obj = args[1];
                    originalConsoleLog.call(console, '  Properties:');
                    for (let prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            originalConsoleLog.call(console, `  - ${prop}: ${obj[prop]}`);
                        }
                    }
                }
            } else {
                // Pass through normal calls
                originalConsoleLog.apply(console, arguments);
            }
        } catch (e) {
            // If anything goes wrong, log a safe message instead
            originalConsoleLog.call(console, '[Log failed due to an error]');
            originalConsoleLog.call(console, e);
        }
    };
    
    // Patch IdolSystem class once it's loaded
    function patchIdolSystem() {
        setTimeout(function() {
            if (typeof IdolSystem !== 'undefined') {
                console.log('Patching IdolSystem class');
                
                // Backup original resetIdolLocations method
                const originalResetIdolLocations = IdolSystem.prototype.resetIdolLocations;
                
                // Replace with safe version
                IdolSystem.prototype.resetIdolLocations = function() {
                    try {
                        // Original implementation with safer logging
                        this.searchedSpots.clear();
                        
                        // Generate a random location for the idol to be hidden
                        const locations = ["Beach", "Jungle", "Camp", "Private Area"];
                        const selectedLocation = locations[Math.floor(Math.random() * locations.length)];
                        
                        // Get hiding spots for that location
                        const hidingSpots = this.getLocationHidingSpots(selectedLocation);
                        
                        // Safety check to avoid errors
                        if (!hidingSpots || hidingSpots.length === 0) {
                            console.error("No hiding spots found for location:", selectedLocation);
                            return;
                        }
                        
                        // Select one random hiding spot
                        const randomSpot = hidingSpots[Math.floor(Math.random() * hidingSpots.length)];
                        
                        // Create the idol location object
                        this.idolLocation = {
                            location: selectedLocation,
                            hidingSpot: randomSpot
                        };
                        
                        // Log each property separately
                        console.log("Idol hidden at location: " + selectedLocation);
                        console.log("Idol hidden at spot: " + randomSpot);
                    } catch (e) {
                        console.error("Error in resetIdolLocations:", e);
                    }
                };
                
                console.log('IdolSystem successfully patched');
            } else {
                console.warn('IdolSystem not found, cannot patch');
            }
        }, 500);
    }
    
    // Try to patch when scripts load
    patchIdolSystem();
});