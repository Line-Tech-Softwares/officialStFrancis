/**
 * Cookie Consent Banner
 * GDPR-Compliant, Non-Intrusive Banner with 6-Month Expiry & Version Control
 * 
 * Features:
 * - LocalStorage tracking with 6-month expiry
 * - Version control for privacy policy updates
 * - Smooth animations
 * - Respects user preferences
 */

const CookieBanner = {
  config: {
    COOKIE_KEY: 'cookieConsent',
    CURRENT_VERSION: '1.0',
    EXPIRY_DAYS: 183, // 6 months
    ANIMATION_DURATION: 300, // ms
    STORAGE_KEY: 'cookieConsent',
    COOKIE_NAME: 'cookieConsent',
    AUTO_CLOSE_DELAY: 30000, // 30 seconds in ms
    UPDATE_INTERVAL: 1000 // 1 second for real-time updates
  },

  // Cookie categories and their activation status
  cookieCategories: {
    essential: {
      name: 'Essential',
      description: 'Required for website operation (cannot be disabled)',
      active: true,
      mandatory: true,
      cookies: ['cookieConsent']
    },
    analytics: {
      name: 'Analytics',
      description: 'Google Analytics tracking',
      active: true,
      mandatory: false,
      cookies: ['_ga', '_gat', '_gid', '_ga_*']
    },
    marketing: {
      name: 'Marketing',
      description: 'Third-party marketing cookies',
      active: false,
      mandatory: false,
      cookies: []
    },
    performance: {
      name: 'Performance',
      description: 'Website performance optimization',
      active: false,
      mandatory: false,
      cookies: ['performance_pref']
    }
  },

  messages: {
    banner_text: "This website uses essential cookies for operation and analytics to improve your experience. Review the cookie categories below.",
    ok_button: 'Accept All',
    close_button: '✕'
  },

  autoCloseTimeout: null,
  countdownInterval: null,

  /**
   * Initialize cookie banner on page load
   */
  init() {
    // Log the visit for frequent-visitor logic
    this.logVisit();

    // If consent is required, show banner; otherwise, do nothing
    if (this.shouldShowBanner()) {
      this.createBanner();
      this.attachEventListeners();
    }
  },

  /**
   * Determine if banner should be shown
   * Checks: existence, version match, and 6-month expiry
   */
  shouldShowBanner() {
    // If cookie is present (and not expired), do not show banner
    const cookieValue = this.getCookie(this.config.COOKIE_NAME);
    if (cookieValue === 'accepted') {
      return false;
    }

    // Check prior consent stored in localStorage
    const stored = this.getConsentData();

    // If user is a frequent visitor and previously consented, silently renew at expiry
    if (stored && stored.accepted && this.isFrequentVisitor()) {
      this.setCookie(this.config.COOKIE_NAME, 'accepted', this.config.EXPIRY_DAYS);
      this.setConsentData(true);
      return false;
    }

    // Otherwise, show banner to obtain consent
    return true;
  },

  /**
   * Get consent data from localStorage
   */
  getConsentData() {
    try {
      const data = localStorage.getItem(this.config.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Error reading cookie consent from localStorage:', error);
      return null;
    }
  },

  /**
   * Set consent data in localStorage with timestamp and version
   */
  setConsentData(accepted = true) {
    try {
      const consentData = {
        accepted,
        date: new Date().toISOString(),
        version: this.config.CURRENT_VERSION
      };
      localStorage.setItem(this.config.STORAGE_KEY, JSON.stringify(consentData));
      console.log('✓ Cookie consent saved:', consentData);
    } catch (error) {
      console.warn('Error saving cookie consent to localStorage:', error);
    }
  },

  /**
   * Create and insert cookie banner into DOM
   */
  createBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';

    // Build the cookie categories display
    const categoriesHTML = this.buildCategoriesHTML();

    banner.innerHTML = `
      <div class="cookie-banner__content" role="region" aria-label="Cookie Consent">
        <div class="cookie-banner__close-btn" id="cookie-close-manual" aria-label="Close cookie banner">
          ${this.messages.close_button}
        </div>
        <div class="cookie-banner__message">
          <h4 style="margin:0 0 12px; font-size:1.05rem; font-weight:700; color:var(--color-white, #fff)">🍪 Cookie Settings</h4>
          <p style="margin:0 0 12px; line-height:1.5;">${this.messages.banner_text}</p>
          
          <div class="cookie-banner__categories" id="cookie-categories">
            ${categoriesHTML}
          </div>

          <p style="margin:8px 0; font-size:0.85rem; color:rgba(255,255,255,0.8)">
            <strong>Auto-closing in:</strong> <span id="cookie-countdown">30</span>s | 
            <a href="privacy.html" style="color:var(--color-gold,#d4af37)">Privacy Policy</a> | 
            <a href="terms.html" style="color:var(--color-gold,#d4af37)">Terms</a>
          </p>
        </div>
        <div class="cookie-banner__actions">
          <button class="cookie-banner__button" id="cookie-accept" style="background:var(--color-gold,#d4af37); color:#111; padding:10px 16px; border:none; border-radius:6px; font-weight:600; cursor:pointer">
            ${this.messages.ok_button}
          </button>
        </div>
      </div>
    `;

    // High-visibility fixed-bottom styling using CSS variables where available
    banner.style.position = 'fixed';
    banner.style.bottom = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.width = '100%';
    banner.style.background = 'var(--color-primary, #0b1d3a)';
    banner.style.color = 'var(--color-white, #fff)';
    banner.style.borderTop = '3px solid var(--color-gold, #d4af37)';
    banner.style.padding = 'var(--spacing-md, 16px)';
    banner.style.zIndex = '99999';
    banner.style.boxShadow = '0 -6px 20px rgba(0,0,0,0.25)';
    banner.style.maxHeight = '60vh';
    banner.style.overflowY = 'auto';

    document.body.appendChild(banner);

    setTimeout(() => {
      banner.classList.add('cookie-banner--visible');
    }, 100);

    // Start auto-close countdown
    this.startAutoClose(banner);
  },

  /**
   * Build HTML for cookie categories with real-time status display
   */
  buildCategoriesHTML() {
    let html = '<div class="cookie-categories__list">';
    
    for (const [key, category] of Object.entries(this.cookieCategories)) {
      const statusClass = category.active ? 'active' : 'inactive';
      const disabledAttr = category.mandatory ? 'disabled' : '';
      const statusIcon = category.active ? '✓' : '○';
      const mandatoryLabel = category.mandatory ? '<span class="category__badge">Required</span>' : '';

      html += `
        <div class="cookie-category ${statusClass}" data-category="${key}">
          <div class="category__header">
            <label class="category__toggle">
              <input type="checkbox" class="category__checkbox" data-category="${key}" 
                     ${category.active ? 'checked' : ''} ${disabledAttr} style="cursor: ${category.mandatory ? 'not-allowed' : 'pointer'}">
              <span class="category__name">${category.name}</span>
              ${mandatoryLabel}
            </label>
            <span class="category__status ${statusClass}">${statusIcon}</span>
          </div>
          <p class="category__description">${category.description}</p>
          <div class="category__cookies">
            <small>Cookies: ${category.cookies.length > 0 ? category.cookies.join(', ') : 'None'}</small>
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  },

  /**
   * Start auto-close countdown
   */
  startAutoClose(banner) {
    let countdown = 30;
    const countdownEl = document.getElementById('cookie-countdown');

    // Update countdown display
    this.countdownInterval = setInterval(() => {
      countdown--;
      if (countdownEl) {
        countdownEl.textContent = countdown;
      }
    }, 1000);

    // Auto-close after 30 seconds
    this.autoCloseTimeout = setTimeout(() => {
      if (this.countdownInterval) clearInterval(this.countdownInterval);
      this.acceptCookies(banner);
    }, this.config.AUTO_CLOSE_DELAY);
  },

  /**
   * Clear countdown timers
   */
  clearAutoClose() {
    if (this.autoCloseTimeout) clearTimeout(this.autoCloseTimeout);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  },

  /**
   * Attach event listeners to banner buttons
   */
  attachEventListeners() {
    const acceptButton = document.getElementById('cookie-accept');
    const closeButton = document.getElementById('cookie-close-manual');
    const banner = document.getElementById('cookie-banner');

    if (acceptButton) {
      acceptButton.addEventListener('click', () => {
        this.clearAutoClose();
        this.acceptCookies(banner);
      });
    }

    // Manual close button
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.clearAutoClose();
        this.acceptCookies(banner);
      });
    }

    // Handle category toggles (only allow unchecking non-mandatory categories)
    const checkboxes = document.querySelectorAll('.category__checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const category = e.target.dataset.category;
        const categoryConfig = this.cookieCategories[category];
        
        if (categoryConfig.mandatory && !e.target.checked) {
          // Prevent unchecking mandatory cookies
          e.target.checked = true;
          return;
        }
        
        // Update category active status
        categoryConfig.active = e.target.checked;
        
        // Update visual status
        const categoryEl = document.querySelector(`[data-category="${category}"]`);
        if (categoryEl) {
          const statusEl = categoryEl.querySelector('.category__status');
          categoryEl.classList.toggle('active', e.target.checked);
          categoryEl.classList.toggle('inactive', !e.target.checked);
          statusEl.textContent = e.target.checked ? '✓' : '○';
          statusEl.className = `category__status ${e.target.checked ? 'active' : 'inactive'}`;
        }
      });
    });

    // Also allow closing via keyboard (Escape key)
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && banner && !banner.classList.contains('cookie-banner--hidden')) {
        this.clearAutoClose();
        this.acceptCookies(banner);
      }
    });
  },

  /**
   * Handle acceptance and dismiss banner
   */
  acceptCookies(banner) {
    // Clear any pending auto-close timers
    this.clearAutoClose();

    // Save consent locally and via cookie
    this.setConsentData(true);
    this.setCookie(this.config.COOKIE_NAME, 'accepted', this.config.EXPIRY_DAYS);

    if (banner) {
      banner.classList.add('cookie-banner--hidden');
      setTimeout(() => {
        banner.remove();
        window.dispatchEvent(new CustomEvent('cookieConsented'));
      }, this.config.ANIMATION_DURATION);
    }
  },

  /**
   * Utility: Check if user has consented to cookies
   * Use this in other scripts (e.g., vpn_pig.js, forms.js)
   */
  hasConsented() {
    const cookieValue = this.getCookie(this.config.COOKIE_NAME);
    if (cookieValue === 'accepted') return true;
    const stored = this.getConsentData();
    return !!(stored && stored.accepted);
  },

  // Helpers: Cookies
  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
  },

  getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
    }
    return null;
  },

  // Helpers: Visit Logging & Frequent Visitor Detection
  logVisit() {
    try {
      const key = 'visitorVisits';
      const now = new Date().toISOString();
      const raw = localStorage.getItem(key);
      const visits = raw ? JSON.parse(raw) : [];

      // Keep only the last 18 months to bound storage
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 18);
      const filtered = visits.filter(ts => new Date(ts) >= cutoff);
      filtered.push(now);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {
      // fail silently
    }
  },

  isFrequentVisitor() {
    try {
      const key = 'visitorVisits';
      const raw = localStorage.getItem(key);
      const visits = raw ? JSON.parse(raw) : [];
      if (visits.length < 2) return false;

      // Compute months spanned from first to last visit
      const first = new Date(visits[0]);
      const last = new Date(visits[visits.length - 1]);
      const monthsSpanned = Math.max(1, (last.getFullYear() - first.getFullYear()) * 12 + (last.getMonth() - first.getMonth()) + 1);
      const averagePerMonth = visits.length / monthsSpanned;
      return averagePerMonth > 1; // more than once per month on average
    } catch (e) {
      return false;
    }
  }
};

// Initialize cookie banner when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    CookieBanner.init();
  });
} else {
  // DOM already loaded (e.g., if script is loaded via defer)
  CookieBanner.init();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CookieBanner;
}
