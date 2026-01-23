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
    STORAGE_KEY: 'cookieConsent'
  },

  messages: {
    banner_text: 'St. Francis of Assisi uses necessary cookies for site security and functionality. We do not use tracking cookies for analytics or advertising.',
    ok_button: 'OK',
    view_button: 'View Cookies',
    policy_link: 'privacy.html#cookie-policy'
  },

  /**
   * Initialize cookie banner on page load
   */
  init() {
    console.log('🍪 Cookie Banner initialized');
    
    // Check if consent is required
    if (this.shouldShowBanner()) {
      this.createBanner();
      this.attachEventListeners();
    } else {
      console.log('✓ Cookie consent already given within 6 months');
    }
  },

  /**
   * Determine if banner should be shown
   * Checks: existence, version match, and 6-month expiry
   */
  shouldShowBanner() {
    const stored = this.getConsentData();
    
    // If no stored data, show banner
    if (!stored) {
      console.log('🍪 No cookie consent found - showing banner');
      return true;
    }

    // If version mismatch, show banner
    if (stored.version !== this.config.CURRENT_VERSION) {
      console.log(`🍪 Version mismatch (stored: ${stored.version}, current: ${this.config.CURRENT_VERSION}) - showing banner`);
      return true;
    }

    // If older than 6 months, show banner
    const acceptedDate = new Date(stored.date);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - acceptedDate) / (1000 * 60 * 60 * 24));
    
    if (daysDifference >= this.config.EXPIRY_DAYS) {
      console.log(`🍪 Consent expired (${daysDifference} days old) - showing banner`);
      return true;
    }

    return false;
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
    // Create container
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    
    // Create content
    banner.innerHTML = `
      <div class="cookie-banner__content">
        <div class="cookie-banner__message">
          <p>${this.messages.banner_text}</p>
        </div>
        <div class="cookie-banner__actions">
          <a href="${this.messages.policy_link}" class="cookie-banner__link">
            ${this.messages.view_button}
          </a>
          <button class="cookie-banner__button" id="cookie-accept">
            ${this.messages.ok_button}
          </button>
        </div>
      </div>
    `;

    // Insert at end of body
    document.body.appendChild(banner);

    // Trigger animation
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
    // Save consent
    this.setConsentData(true);

    // Animate out
    if (banner) {
      banner.classList.add('cookie-banner--hidden');
      
      // Remove from DOM after animation
      setTimeout(() => {
        banner.remove();
        console.log('🍪 Cookie banner dismissed');
        
        // Notify other scripts that cookie consent is now accepted
        window.dispatchEvent(new CustomEvent('cookieConsented'));
      }, this.config.ANIMATION_DURATION);
    }
  },

  /**
   * Utility: Check if user has consented to cookies
   * Use this in other scripts (e.g., vpn_pig.js, forms.js)
   */
  hasConsented() {
    const stored = this.getConsentData();
    return stored && stored.accepted && !this.shouldShowBanner();
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
