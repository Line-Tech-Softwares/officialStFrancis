/**
 * Ministry Navigation State Tracking
 * Handles mpho_bookmark_this state to remember navigation history
 */

(function() {
    'use strict';

    // Initialize mpho_bookmark_this on page load
    window.mpho_bookmark_this = {
        referrer: document.referrer || sessionStorage.getItem('mpho_referrer_page') || '../ministries.html',
        lastMinistry: sessionStorage.getItem('mpho_last_ministry') || null,
        timestamp: new Date().getTime()
    };

    // Save ministry state when navigating from ministries.html
    window.addEventListener('load', function() {
        // Get saved referrer from sessionStorage if available
        const savedReferrer = sessionStorage.getItem('mpho_referrer_page');
        if (savedReferrer) {
            window.mpho_bookmark_this.referrer = savedReferrer;
        }

        // Save current ministry name if available
        const ministryTitle = document.querySelector('.ministry__title');
        if (ministryTitle) {
            const ministryName = ministryTitle.textContent.trim();
            window.mpho_bookmark_this.lastMinistry = ministryName;
            sessionStorage.setItem('mpho_last_ministry', ministryName);
        }
    });

    // Handle back button navigation
    window.handleMinistryBackButton = function(event) {
        event.preventDefault();
        
        // Clear the bookmark on return
        sessionStorage.removeItem('mpho_referrer_page');
        sessionStorage.removeItem('mpho_last_ministry');
        
        // Navigate back to ministries
        window.location.href = '../ministries.html';
        return false;
    };

    // Update form hidden field if it exists
    window.addEventListener('load', function() {
        const ministryStateField = document.getElementById('mpho_bookmark_this');
        if (ministryStateField) {
            ministryStateField.value = JSON.stringify(window.mpho_bookmark_this);
        }
    });

    // Restore scroll position if available
    window.addEventListener('load', function() {
        const savedScrollPos = sessionStorage.getItem('mpho_scroll_position');
        if (savedScrollPos) {
            setTimeout(function() {
                window.scrollTo(0, parseInt(savedScrollPos));
            }, 100);
        }
    });

    // Save scroll position before leaving
    window.addEventListener('beforeunload', function() {
        sessionStorage.setItem('mpho_scroll_position', window.scrollY);
    });

})();
