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
 * Mobile Menu Toggle with Custom SVG Icon + Overlay
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.header__menu-toggle');
    const nav = document.querySelector('.header__nav');

    if (!menuToggle || !nav) return;

    const icon = menuToggle.querySelector('i');
    menuToggle.setAttribute('aria-expanded', 'false');

    const closeMenu = () => {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
        if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-xmark');
        }
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
        nav.classList.add('active');
        menuToggle.classList.add('active');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        }
        menuToggle.setAttribute('aria-expanded', 'true');
    };

    menuToggle.addEventListener('click', () => {
        const isActive = nav.classList.contains('active');
        if (isActive) closeMenu(); else openMenu();
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Ensure mobile-only links exist if missing
   // const pagesToEnsure = [
    //    { href: 'privacy.html', text: 'Privacy Policy' },
    //    { href: 'terms.html', text: 'Terms of Use' }
  //  ];
    pagesToEnsure.forEach(({ href, text }) => {
        const exists = Array.from(nav.querySelectorAll('a')).some(a => a.getAttribute('href') === href);
        if (!exists) {
            const li = document.createElement('li');
            li.classList.add('mobile-only');
            const a = document.createElement('a');
            a.setAttribute('href', href);
            a.textContent = text;
            li.appendChild(a);
            nav.appendChild(li);
        }
    });
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

    // Cookie Settings: reopen cookie banner on demand
    const cookieSettingsLink = document.getElementById('cookie-settings');
    if (cookieSettingsLink) {
        cookieSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            // If banner already exists, ignore; else create and attach
            const existingBanner = document.getElementById('cookie-banner');
            if (!existingBanner) {
                // If consent previously accepted, clear to force banner display
                try {
                    document.cookie = `${CookieBanner.config.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
                    localStorage.removeItem(CookieBanner.config.STORAGE_KEY);
                } catch (_) {}
                CookieBanner.createBanner();
                CookieBanner.attachEventListeners();
            }
        });
    }
});

/**
 * Smooth Active Navigation Link Indicator
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.header__nav a').forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === currentPage || (currentPage === '' && href === 'index.html');
        if (isActive) {
            link.style.color = 'var(--color-gold)';
            link.setAttribute('aria-current', 'page');
        } else {
            link.style.color = '';
            link.removeAttribute('aria-current');
        }
    });
}

document.addEventListener('DOMContentLoaded', setActiveNavLink);

// Hamburger menu toggle legacy block disabled to avoid conflicts with header.css responsive nav.
(function(){
  // Intentionally left blank: using initMobileMenu() as the single source of truth.
})();
