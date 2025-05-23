// This script fixes the cursor disappearing when hovering over ducks
// Include this file in your HTML with a script tag

// Function to apply cursor style to all duck elements
function applyDuckCursorStyle() {
    // Get all duck elements
    const duckElements = document.querySelectorAll('.duck');
    
    // Apply crosshair cursor to each duck element
    duckElements.forEach(duck => {
        duck.style.cursor = 'crosshair';
    });
}

// Apply cursor style periodically to catch newly created ducks
setInterval(applyDuckCursorStyle, 100);

// Wait for document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Apply initially
    applyDuckCursorStyle();
    
    // Modify the Duck constructor if it exists
    if (typeof Duck === 'function') {
        const originalDuck = Duck;
        Duck = function(x, y, direction) {
            // Call the original constructor
            originalDuck.call(this, x, y, direction);
            
            // Add crosshair cursor style
            this.element.style.cursor = 'crosshair';
        };
        Duck.prototype = originalDuck.prototype;
    }
});