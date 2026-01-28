/* ================================================
   MAIN JAVASCRIPT
   Navigation, iOS detection, scroll animations
   ================================================ */

/**
 * iOS 26+ Detection & Gloss Effect Application
 */
function applyiOS26Enhancements() {
    const ua = navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(ua);
    
    if (isiOS) {
        const versionMatch = ua.match(/os (\d+)_/);
        if (versionMatch) {
            const majorVersion = parseInt(versionMatch[1]);
            if (majorVersion >= 26) {
                // Apply gloss effect to buttons and cards
                document.querySelectorAll('.btn, .card').forEach(el => {
                    el.classList.add('ios-gloss');
                });
            }
        }
    }
}

/**
 * Mobile Menu Toggle with Custom SVG Icon
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.header__menu-toggle');
    const nav = document.querySelector('.header__nav');

    if (menuToggle && nav) {
        const icon = menuToggle.querySelector('i');
        menuToggle.setAttribute('aria-expanded', 'false');

        // Toggle menu open/close with icon morph (bars ↔ times)
        menuToggle.addEventListener('click', () => {
            const isActive = nav.classList.toggle('active');
            menuToggle.classList.toggle('active');

            if (icon) {
                icon.classList.toggle('fa-bars', !isActive);
                icon.classList.toggle('fa-times', isActive);
            }
            menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        // Close menu when a link is clicked
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

/**
 * Intersection Observer for Scroll Animations
 */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

/**
 * Smooth Scroll Enhancement
 */
function enhanceScrollBehavior() {
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        document.documentElement.style.webkitOverflowScrolling = 'touch';
    }
}

/**
 * Initialize All Features
 */
document.addEventListener('DOMContentLoaded', () => {
    applyiOS26Enhancements();
    initMobileMenu();
    initScrollAnimations();
    enhanceScrollBehavior();
});

/**
 * Smooth Active Navigation Link Indicator
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.header__nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.style.color = 'var(--color-gold)';
        }
    });
}

document.addEventListener('DOMContentLoaded', setActiveNavLink);
