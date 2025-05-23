// Duck Hunt Cursor Fix
// This script fixes the issue where the cursor disappears when hovering over birds

document.addEventListener('DOMContentLoaded', function() {
    // Function to apply cursor style to all duck elements
    function applyDuckCursorStyle() {
        const ducks = document.querySelectorAll('.duck');
        ducks.forEach(duck => {
            duck.style.cursor = 'crosshair';
        });
    }
    
    // Apply cursor style periodically to catch newly created ducks
    setInterval(applyDuckCursorStyle, 100);
    
    // Also modify the Duck constructor if it exists in this context
    if (typeof Duck === 'function') {
        const originalDuck = Duck;
        Duck = function(x, y, direction) {
            // Call the original constructor
            originalDuck.call(this, x, y, direction);
            
            // Add crosshair cursor style
            if (this.element) {
                this.element.style.cursor = 'crosshair';
            }
        };
        Duck.prototype = originalDuck.prototype;
    }
    
    // Add a style tag to ensure all ducks have the crosshair cursor
    const styleTag = document.createElement('style');
    styleTag.textContent = '.duck { cursor: crosshair !important; }';
    document.head.appendChild(styleTag);
});