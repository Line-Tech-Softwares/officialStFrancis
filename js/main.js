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
    
    if (menuToggle) {
        // Create custom SVG hamburger icon
        if (!menuToggle.querySelector('svg')) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            svg.setAttribute('stroke-linecap', 'round');
            svg.setAttribute('stroke-linejoin', 'round');
            
            // Hamburger lines (will transform to X)
            svg.innerHTML = `
                <line x1="3" y1="6" x2="21" y2="6" class="hamburger-line" style="transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);"/>
                <line x1="3" y1="12" x2="21" y2="12" class="hamburger-line" style="transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);"/>
                <line x1="3" y1="18" x2="21" y2="18" class="hamburger-line" style="transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);"/>
            `;
            menuToggle.appendChild(svg);
        }
        
        // Toggle menu open/close
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Close menu when a link is clicked
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
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
