/**
 * Griffin the Guardian Pig - Client-Side Geo-Restriction & VPN Detection
 * 
 * IMPORTANT SECURITY NOTICE:
 * This is a CLIENT-SIDE deterrent layer only. True geo-blocking and VPN detection 
 * MUST be implemented server-side using:
 * - Cloudflare Firewall Rules
 * - Backend IP geolocation databases
 * - Server-side middleware (e.g., MaxMind GeoIP2)
 * - Web Application Firewalls (WAF)
 * 
 * This script provides a user-facing layer that shows good intent but is NOT a 
 * substitute for server-side security. Do NOT rely on this for security decisions as this is still a development phase!.
 * Although it can help deter casual VPN users and provide a better user experience, it can be easily bypassed by tech-savvy users. we should implement robust server-side controls for true security.
 */

const GRIFFIN = {
  config: {
    ALLOWED_COUNTRY_CODE: 'ZA',
    BLOCK_MESSAGE_DELAY: 1500,
    // Example: These ASN numbers would be looked up for known VPN providers
    KNOWN_VPN_PATTERNS: [
      'Private_Internet_Access',
      'ExpressVPN',
      'NordVPN',
      'CyberGhost',
      'Surfshark',
      'IPVanish'
    ]
  },

  messages: {
    griffin_says_hello: "🛡️ Griffin is verifying your connection...",
    griffin_banned_your_IP: "⛔ Access Restriction Notice - Griffin has logged your connection attempt from outside South Africa.",
    griffin_says_remove_vpn: "🔒 Connection Security Check - Our community site is currently accessible only from South Africa. Please disable your VPN if you believe you are connecting from within the country.",
    griffin_triggered_alert: "⚠️ Griffin has flagged an unusual connection pattern.",
    griffin_logged_activity: "📝 Connection attempt logged for administrator review.",
    griffin_connection_allowed: "✓ Griffin verified - Connection allowed"
  },

  // Initialize Griffin on page load
  async init() {
    // Only run on production (not localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🛡️ Griffin: Development mode detected - geo-checks disabled');
      return;
    }
    
    console.log(this.messages.griffin_says_hello);
    try {
      const ipData = await this.fetchIPData();
      if (ipData) {
        this.analyzeConnection(ipData);
      }
    } catch (error) {
      console.warn(this.messages.griffin_triggered_alert, error.message);
      // On error, allow through but log. In production, we will implement stricter behavior.
      console.log('Note: Geolocation service unavailable. Connection allowed.');
    }
  },

  // NOTE: This is a client-side measure. Actual IP geolocation must be server-side.
  async fetchIPData() {
    try {
      // Using ipapi.co - free tier (requires HTTPS in production)
      // IMPORTANT: This endpoint has rate limits. For production, use a backend proxy.
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Geolocation API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        country_code: data.country_code,
        country_name: data.country_name,
        city: data.city,
        org: data.org || 'Unknown',
        ip: data.ip,
        is_vpn: data.is_vpn // Some APIs provide this
      };
    } catch (error) {
      console.warn('Griffin: Could not fetch geolocation data', error);
      return null;
    }
  },

  analyzeConnection(data) {
    const { country_code, org, is_vpn, ip, country_name } = data;
    let isSuspicious = false;
    let reason = '';

    // 1. Check Country
    if (country_code !== this.config.ALLOWED_COUNTRY_CODE) {
      isSuspicious = true;
      reason = `Location outside South Africa detected (${country_name})`;
    }

    // 2. Check for VPN keywords in organization name
    if (org) {
      const orgLower = org.toLowerCase();
      const isVPN = this.config.KNOWN_VPN_PATTERNS.some(pattern => 
        orgLower.includes(pattern.toLowerCase())
      );
      
      if (isVPN) {
        isSuspicious = true;
        reason = `VPN provider detected in connection (${org})`;
      }
    }

    // 3. Check if API flagged as VPN
    if (is_vpn === true) {
      isSuspicious = true;
      reason = 'VPN/Proxy connection detected';
    }

    if (isSuspicious) {
      this.showBlockMessage(reason);
      this.logSuspiciousActivity(data, reason);
    } else {
      console.log(this.messages.griffin_connection_allowed);
      console.log(`✓ Connection verified from ${data.country_name} (${data.city})`);
    }
  },

  // NOTE: This overlay blocks access but can be bypassed by user.
  showBlockMessage(reason) {
    setTimeout(() => {
      const overlay = document.createElement('div');
      overlay.id = 'griffin-block-overlay';
      overlay.style.cssText = `
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%;
        background: rgba(0, 51, 102, 0.98);
        color: #D4AF37; 
        z-index: 99999;
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center;
        font-family: 'Inter', sans-serif; 
        text-align: center; 
        padding: 2rem;
        overflow: hidden;
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        max-width: 500px;
        animation: slideDown 0.5s ease-out;
      `;
      
      content.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">🛡️</div>
        <h1 style="font-family: 'Playfair Display', serif; margin-bottom: 1rem; color: #fcfaf6;">Connection Verification</h1>
        <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem; color: #fcfaf6;">
          ${reason}
        </p>
        <p style="font-size: 0.95rem; color: #D4AF37; margin-bottom: 2rem;">
          Our community site is currently optimized for access from within South Africa. 
        </p>
        <div style="background: rgba(212, 175, 55, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #D4AF37; margin-bottom: 1.5rem;">
          <p style="font-size: 0.9rem; color: #fcfaf6; margin: 0;">
            <strong>If you believe this is an error:</strong><br>
            Please disable your VPN or contact our parish office directly.
          </p>
        </div>
        <p style="font-size: 0.85rem; color: #888; margin-top: 2rem;">
          <strong>Reference ID:</strong> ${Date.now()}<br>
          <strong>Time:</strong> ${new Date().toUTCString()}
        </p>
      `;
      
      overlay.appendChild(content);
      document.body.prepend(overlay);
      document.body.style.overflow = 'hidden';
      
      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }, this.config.BLOCK_MESSAGE_DELAY);
  },

  // NOTE: This is a client-side log. IMPORTANT: Real security logs must be server-side.
  logSuspiciousActivity(data, reason) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      blocked_reason: reason,
      country_code: data.country_code,
      country_name: data.country_name,
      city: data.city,
      organization: data.org,
      ip_address: data.ip, // Logged here but should be server-side
      connection_type: data.is_vpn ? 'VPN' : 'Standard'
    };
    
    console.warn('🛡️ GRIFFIN SECURITY LOG:', logEntry);
    console.log('⚠️ NOTE: This is a client-side log. Real security logging must occur server-side.');
    
    // In a production environment, this would be sent to a backend logging service:
    // Example: fetch('/api/security-logs', { method: 'POST', body: JSON.stringify(logEntry) });
    
    // For now, we store in sessionStorage as a demonstration
    const logs = JSON.parse(sessionStorage.getItem('griffin_logs') || '[]');
    logs.push(logEntry);
    sessionStorage.setItem('griffin_logs', JSON.stringify(logs));
  }
};

// Initialize Griffin when the page loads
document.addEventListener('DOMContentLoaded', () => {
  GRIFFIN.init();
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GRIFFIN;
}
