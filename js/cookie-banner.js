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
    COOKIE_NAME: 'cookieConsent'
  },

  messages: {
    banner_text: "This website uses only essential cookies for operation. By clicking 'OK,' you acknowledge this use.",
    ok_button: 'OK'
  },

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

    banner.innerHTML = `
      <div class="cookie-banner__content" role="region" aria-label="Cookie Consent">
        <div class="cookie-banner__message">
          <h4 style="margin:0 0 8px; font-size:1rem; font-weight:700; color:var(--color-white, #fff)">Cookie Notice</h4>
          <p style="margin:0 0 8px;">${this.messages.banner_text}</p>
          <p style="margin:0; font-size:0.9rem;">See our <a href="privacy.html" style="color:var(--color-gold,#d4af37)">Privacy Policy</a> and <a href="terms.html" style="color:var(--color-gold,#d4af37)">Terms of Use</a>.</p>
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

    document.body.appendChild(banner);

    setTimeout(() => {
      banner.classList.add('cookie-banner--visible');
    }, 100);
  },

  /**
   * Attach event listeners to banner buttons
   */
  attachEventListeners() {
    const acceptButton = document.getElementById('cookie-accept');
    const banner = document.getElementById('cookie-banner');

    if (acceptButton) {
      acceptButton.addEventListener('click', () => {
        this.acceptCookies(banner);
      });
    }

    // Also allow closing via keyboard (Escape key)
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && banner && !banner.classList.contains('cookie-banner--hidden')) {
        this.acceptCookies(banner);
      }
    });
  },

  /**
   * Handle acceptance and dismiss banner
   */
  acceptCookies(banner) {
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
