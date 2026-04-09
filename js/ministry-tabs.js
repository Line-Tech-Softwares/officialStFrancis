/**
 * Ministry Tab Switching Handler
 * Uses class-based styling to avoid inline style persistence issues
 * Fixes button text disappearing on back navigation (bfcache issue)
 */

document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.ministry__tab');
    const contents = document.querySelectorAll('.ministry__tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const dataTab = this.getAttribute('data-tab');
            const tabId = dataTab.startsWith('tab-') ? dataTab : 'tab-' + dataTab;
            
            // Hide all contents and remove active class
            contents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            tabs.forEach(t => {
                t.classList.remove('active');
            });
            
            // Show selected content and mark tab as active
            const selectedContent = document.getElementById(tabId);
            if (selectedContent) {
                selectedContent.classList.add('active');
            }
            
            // Mark clicked tab as active
            this.classList.add('active');
        });
    });

    // Keyboard navigation for tabs
    tabs.forEach((tab, index) => {
        tab.addEventListener('keydown', function(e) {
            let nextTab = null;
            if (e.key === 'ArrowRight') {
                nextTab = tabs[index + 1] || tabs[0];
            } else if (e.key === 'ArrowLeft') {
                nextTab = tabs[index - 1] || tabs[tabs.length - 1];
            }
            
            if (nextTab) {
                nextTab.focus();
                nextTab.click();
            }
        });
    });
});
