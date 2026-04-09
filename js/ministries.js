/* ================================================
   MINISTRIES - Tab Navigation & Interactive Features
   Handles tab switching for About, Gallery, Songs
   ================================================ */

(function() {
    'use strict';

    // Initialize ministry tabs
    function initMinistryTabs() {
        const tabs = document.querySelectorAll('.ministry__tab');
        const tabContents = document.querySelectorAll('.ministry__tab-content');

        if (tabs.length === 0 || tabContents.length === 0) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('data-tab');
                if (!targetId) return;

                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                this.classList.add('active');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                // Scroll to tab content
                setTimeout(() => {
                    targetContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            });
        });

        // Set first tab as active by default if none is active
        const activeTab = document.querySelector('.ministry__tab.active');
        if (!activeTab && tabs.length > 0) {
            tabs[0].click();
        }
    }

    // Initialize gallery items with hover effects
    function initGallery() {
        const galleryItems = document.querySelectorAll('.gallery__item');
        
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                // Add click feedback
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }

    // Initialize profile image from data attribute or fallback to icon
    function initProfileImage() {
        const profile = document.querySelector('.ministry__profile');
        if (!profile) return;

        const imageUrl = profile.getAttribute('data-image');
        if (imageUrl) {
            profile.style.backgroundImage = `url('${imageUrl}')`;
            profile.innerHTML = '';
        }
    }

    // Initialize cover image from data attribute
    function initCoverImage() {
        const cover = document.querySelector('.ministry__cover');
        if (!cover) return;

        const imageUrl = cover.getAttribute('data-image');
        if (imageUrl) {
            cover.style.backgroundImage = `url('${imageUrl}')`;
        }
    }

    // Handle action button clicks (Get Involved, Contact, etc.)
    function initActionButtons() {
        const actionButtons = document.querySelectorAll('.ministry__action-button');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // If it's a link, let it navigate naturally
                if (this.tagName === 'A') return;

                // Otherwise, navigate to the href
                const href = this.getAttribute('data-href');
                if (href) {
                    window.location.href = href;
                }
            });
        });
    }

    // Keyboard navigation for tabs
    function initKeyboardNavigation() {
        const tabs = document.querySelectorAll('.ministry__tab');
        
        tabs.forEach((tab, index) => {
            tab.addEventListener('keydown', function(e) {
                let targetIndex;

                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    targetIndex = (index + 1) % tabs.length;
                    tabs[targetIndex].focus();
                    tabs[targetIndex].click();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    targetIndex = (index - 1 + tabs.length) % tabs.length;
                    tabs[targetIndex].focus();
                    tabs[targetIndex].click();
                }
            });
        });
    }

    // Lazy load images
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('[data-image]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const imageUrl = entry.target.getAttribute('data-image');
                        if (imageUrl) {
                            entry.target.style.backgroundImage = `url('${imageUrl}')`;
                            observer.unobserve(entry.target);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // Initialize all ministry features when DOM is ready
    function initMinistry() {
        initMinistryTabs();
        initGallery();
        initProfileImage();
        initCoverImage();
        initActionButtons();
        initKeyboardNavigation();
        initLazyLoading();
    }

    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMinistry);
    } else {
        initMinistry();
    }
})();
