// Global error handler to catch and diagnose persistent issues
document.addEventListener('DOMContentLoaded', function() {
    console.log('Error handler loaded');
    
    // Override console.error to record the last error
    const originalConsoleError = console.error;
    console.error = function() {
        // Call the original
        originalConsoleError.apply(console, arguments);
        
        // Convert to string for diagnostics
        const args = Array.from(arguments);
        const errorString = args.map(arg => {
            if (arg instanceof Error) {
                return `${arg.name}: ${arg.message}\n${arg.stack || 'No stack trace'}`;
            } else if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return '[Unstringifiable object]';
                }
            } else {
                return String(arg);
            }
        }).join(' ');
        
        // Record this error for later access
        window.lastError = {
            args: args,
            timestamp: new Date(),
            string: errorString
        };
    };
    
    // Global error handler
    window.addEventListener('error', function(event) {
        console.log('==== GLOBAL ERROR CAUGHT ====');
        console.log('Error:', event.error ? (event.error.stack || event.error.message) : 'Unknown error');
        console.log('Message:', event.message);
        console.log('Source:', event.filename);
        console.log('Line:', event.lineno);
        console.log('Column:', event.colno);
        
        // Add to DOM for easy access
        const errorLog = document.createElement('div');
        errorLog.id = 'error-log';
        errorLog.style.position = 'fixed';
        errorLog.style.bottom = '10px';
        errorLog.style.right = '10px';
        errorLog.style.backgroundColor = 'rgba(255, 200, 200, 0.9)';
        errorLog.style.padding = '10px';
        errorLog.style.borderRadius = '5px';
        errorLog.style.maxWidth = '400px';
        errorLog.style.maxHeight = '200px';
        errorLog.style.overflow = 'auto';
        errorLog.style.zIndex = '9999';
        errorLog.style.fontSize = '12px';
        errorLog.style.fontFamily = 'monospace';
        errorLog.innerHTML = `
            <strong>Error:</strong> ${event.message}<br>
            <strong>Source:</strong> ${event.filename}<br>
            <strong>Line:</strong> ${event.lineno}<br>
            <strong>Column:</strong> ${event.colno}<br>
        `;
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '10px';
        closeButton.onclick = function() {
            document.body.removeChild(errorLog);
        };
        errorLog.appendChild(closeButton);
        
        // Only add if not already added
        if (!document.getElementById('error-log')) {
            document.body.appendChild(errorLog);
        }
    });
    
    // JSON patch: Add a safer version of JSON.stringify to the window
    window.safeStringify = function(obj) {
        try {
            // Handle circular references
            const seen = new WeakSet();
            return JSON.stringify(obj, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return '[Circular]';
                    }
                    seen.add(value);
                }
                return value;
            });
        } catch (e) {
            console.error('Error in safeStringify:', e);
            return '{"error": "Could not stringify"}';
        }
    };
    
    // Patch console.log
    const originalConsoleLog = console.log;
    console.log = function() {
        try {
            // Check if we're trying to log a problematic object
            const args = Array.from(arguments);
            if (args.length > 0) {
                if (typeof args[0] === 'string' && args[0].includes('Idol hidden in:')) {
                    // Handle this specific case differently
                    originalConsoleLog.call(console, 'Idol location detected (safe mode)');
                    if (args.length > 1 && typeof args[1] === 'object') {
                        originalConsoleLog.call(console, 'Location:', args[1].location || 'unknown');
                        originalConsoleLog.call(console, 'Hiding spot:', args[1].hidingSpot || 'unknown');
                        return;
                    }
                }
            }
            
            // Pass through normal calls
            originalConsoleLog.apply(console, arguments);
        } catch (e) {
            originalConsoleLog.call(console, 'Error in console.log:', e);
        }
    };
});