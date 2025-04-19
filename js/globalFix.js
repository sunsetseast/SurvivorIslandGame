// Global fix script to intercept and correct issues at the root level
// This must be loaded before any other scripts

(function() {
    console.log("Loading global fixes");
    
    // Save original console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Override console.log to intercept problematic calls
    console.log = function() {
        try {
            // Check for known problematic patterns
            if (arguments.length > 0 && typeof arguments[0] === 'string') {
                const msg = arguments[0];
                
                // Specific case for the idol location issue
                if (msg === "Idol hidden in:") {
                    if (arguments.length > 1 && typeof arguments[1] === 'object') {
                        // Safe logging of object properties
                        originalLog.call(console, "Idol location detected (safe format)");
                        
                        try {
                            const location = arguments[1].location || "unknown";
                            const spot = arguments[1].hidingSpot || "unknown";
                            originalLog.call(console, "- Location:", location);
                            originalLog.call(console, "- Hiding spot:", spot);
                        } catch (e) {
                            originalLog.call(console, "- Error accessing object properties:", e.message);
                        }
                        
                        // Stop further processing to prevent error
                        return;
                    }
                }
            }
            
            // For all other cases, proceed with original logging
            originalLog.apply(console, arguments);
        } catch (e) {
            // If anything goes wrong, log a safe message
            originalLog.call(console, "[Log failed - recovered]");
            originalLog.call(console, e);
        }
    };
    
    // Also patch JSON.stringify to handle circular references
    const originalStringify = JSON.stringify;
    JSON.stringify = function(obj, replacer, space) {
        try {
            const seen = new WeakSet();
            
            return originalStringify(obj, function(key, value) {
                // Handle custom replacer if provided
                if (replacer) {
                    value = replacer(key, value);
                }
                
                // Handle circular references
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return '[Circular]';
                    }
                    seen.add(value);
                }
                
                return value;
            }, space);
        } catch (e) {
            console.warn("JSON.stringify error:", e.message);
            return '{"error":"JSON.stringify failed"}';
        }
    };
    
    // Define a safer Object.prototype.toString
    const originalToString = Object.prototype.toString;
    Object.prototype.toString = function() {
        try {
            return originalToString.call(this);
        } catch (e) {
            return '[object Unknown]';
        }
    };
    
    // Hook into Error event to diagnose issues
    window.addEventListener('error', function(event) {
        originalError.call(console, '[GLOBAL ERROR]', event.message);
        if (event.error) {
            originalError.call(console, 'Stack:', event.error.stack);
        }
        originalError.call(console, 'Source:', event.filename, 'Line:', event.lineno, 'Col:', event.colno);
    });
    
    console.log("Global fixes loaded");
})();