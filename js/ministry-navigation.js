/**
 * Ministry Navigation State Tracking
 * Handles mpho_bookmark_this state to remember navigation history
 * Dynamically injects back button
 */

(function() {
    'use strict';

    console.log('Ministry navigation loaded');

    // Initialize mpho_bookmark_this on page load
    window.mpho_bookmark_this = {
        referrer: document.referrer || sessionStorage.getItem('mpho_referrer_page') || '../ministries.html',
        lastMinistry: sessionStorage.getItem('mpho_last_ministry') || null,
        timestamp: new Date().getTime()
    };

    // Inject back button dynamically
    function injectBackButton() {
        // Check if button already exists
        if (document.querySelector('.ministry__back-button')) return;
        
        // Find the container - look for .container.ministry__container specifically
        const container = document.querySelector('.container.ministry__container');
        
        if (!container) {
            console.warn('Ministry container not found for back button injection');
            return;
        }
        
        // Create back button
        const backButton = document.createElement('a');
        backButton.href = '#';
        backButton.className = 'ministry__back-button';
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Ministries';
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            const referrer = sessionStorage.getItem('mpho_referrer_page') || '../ministries.html';
            window.location.href = referrer;
        });
        
        // Insert as first child of container
        container.insertBefore(backButton, container.firstChild);
    }

    // Handle back button navigation
    function handleMinistryBackButton(event) {
        event.preventDefault();
        
        // Get the saved referrer or default to ministries.html
        const referrer = sessionStorage.getItem('mpho_referrer_page') || '../ministries.html';
        
        // Clear only the current ministry state, keep referrer for potential use
        sessionStorage.removeItem('mpho_last_ministry');
        
        // Navigate back to the referrer page
        window.location.href = referrer;
        return false;
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            injectBackButton();
            saveMinistryState();
            restoreScrollPosition();
            updateFormField();
        });
    } else {
        injectBackButton();
        saveMinistryState();
        restoreScrollPosition();
        updateFormField();
    }

    // Save ministry state when navigating from ministries.html
    function saveMinistryState() {
        // Save current page as referrer for next navigation
        const currentPage = window.location.pathname.split('/').pop();
        
        // Only set referrer if coming from ministries.html
        if (document.referrer && document.referrer.includes('ministries.html')) {
            sessionStorage.setItem('mpho_referrer_page', document.referrer);
            window.mpho_bookmark_this.referrer = document.referrer;
        }

        // Save current ministry name if available
        const ministryTitle = document.querySelector('.ministry__title');
        if (ministryTitle) {
            const ministryName = ministryTitle.textContent.trim();
            window.mpho_bookmark_this.lastMinistry = ministryName;
            sessionStorage.setItem('mpho_last_ministry', ministryName);
        }
    }

    // Update form hidden field if it exists
    function updateFormField() {
        const ministryStateField = document.getElementById('mpho_bookmark_this');
        if (ministryStateField) {
            ministryStateField.value = JSON.stringify(window.mpho_bookmark_this);
        }
    }

    // Restore scroll position if available
    function restoreScrollPosition() {
        const savedScrollPos = sessionStorage.getItem('mpho_scroll_position');
        if (savedScrollPos) {
            setTimeout(function() {
                window.scrollTo(0, parseInt(savedScrollPos));
            }, 100);
        }
    }

    // Save scroll position before leaving
    window.addEventListener('beforeunload', function() {
        sessionStorage.setItem('mpho_scroll_position', window.scrollY);
    });

})();