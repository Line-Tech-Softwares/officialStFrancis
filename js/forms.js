/**
 * Forms Handler Script
 * Form validation, submission handling, and error management
 * Integrates with security.js for comprehensive client-side validation
 */

/**
 * FormValidator Class
 * Handles form validation and user feedback with enhanced security
 */
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        this.formId = formId;
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupFieldValidation();
    }

    /**
     * Setup real-time field validation
     */
    setupFieldValidation() {
        const fields = this.form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearError(field));
        });
    }

    /**
     * Validate individual field with enhanced security checks
     */
    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const fieldName = field.name;

        // Clear previous error
        this.clearError(field);
        
        // Check required fields
        if (field.hasAttribute('required') && !value) {
            this.setError(field, 'This field is required');
            return false;
        }

        // Skip validation if field is empty and not required
        if (!value && !field.hasAttribute('required')) {
            return true;
        }

        // ENHANCED: Email validation - Professional email for donations/pledges
        if (type === 'email' && value) {
            // Determine form type
            let formType = 'contact'; // default
            if (this.formId.includes('donation') || this.formId.includes('pledge')) {
                formType = this.formId.includes('pledge') ? 'pledge' : 'donation';
            }

            if (!this.validateEmail(value, formType)) {
                if (formType === 'donation' || formType === 'pledge') {
                    this.setError(field, 
                        'For donation and pledge forms, please use a professional/organizational email address (not Gmail, Yahoo, Outlook, etc.). This helps us verify organizational donations.');
                } else {
                    this.setError(field, 'Please enter a valid email address');
                }
                return false;
            }
        }

        // ENHANCED: Phone validation - South African format only
        if (type === 'tel' && value) {
            if (!this.validateSouthAfricanPhone(value)) {
                this.setError(field, 'Please enter a valid South African phone number (e.g., +27 12 345 6789 or 071 234 5678)');
                return false;
            }
        }

        // Number/Amount validation
        if (type === 'number' && value) {
            if (isNaN(value) || parseFloat(value) <= 0) {
                this.setError(field, 'Please enter a valid amount');
                return false;
            }
        }

        // Min length for textarea (message/comment fields)
        if (field.tagName === 'TEXTAREA' && value && value.length < 5) {
            this.setError(field, 'Please enter at least 5 characters');
            return false;
        }

        // Security check: Detect suspicious patterns
        if (SecurityGuard) {
            const suspiciousPatterns = SecurityGuard.detectSuspiciousPatterns(value);
            if (suspiciousPatterns.length > 0) {
                this.setError(field, 'This field contains suspicious content. Please review your input.');
                return false;
            }
        }

        return true;
    }

    /**
     * ENHANCED: Validate email based on form type
     * Contact forms: Accept any valid email
     * Donation/Pledge forms: Accept only professional emails (not free domains)
     */
    validateEmail(email, formType = 'contact') {
        // Check basic email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        // For donation/pledge forms, only allow professional emails
        if (formType === 'donation' || formType === 'pledge') {
            return this.validateProfessionalEmail(email);
        }

        // Contact forms accept all valid emails
        return true;
    }

    /**
     * PROFESSIONAL EMAIL VALIDATION (for donations/pledges)
     * Blocks free email domains (Gmail, Yahoo, Outlook, etc.)
     * Only allows corporate/organizational email addresses
     */
    validateProfessionalEmail(email) {
        // List of free email providers to block
        const freeEmailDomains = [
            'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
            'aol.com', 'mail.com', 'inbox.com', 'zoho.com',
            'protonmail.com', 'yandex.com', 'mailinator.com',
            'temp-mail.org', '10minutemail.com', 'guerrillamail.com',
            'disposableemailaddresses.com', 'throwaway.email',
            'tempmail.com', 'maildrop.cc', 'mintemail.com'
        ];

        const domain = email.split('@')[1].toLowerCase();
        
        // Block free email providers
        if (freeEmailDomains.includes(domain)) {
            return false;
        }

        // Block common TLDs that are typically personal emails
        if (email.match(/@(gmail|yahoo|outlook|hotmail|aol|protonmail)\./) ||
            email.match(/\.(tk|ml|ga|cf)$/)) {
            return false;
        }

        return true;
    }

    /**
     * LEGACY: Validate email - Gmail only (kept for backward compatibility)
     */
    validateGmailEmail(email) {
        // Check basic email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        // Allow any valid email, not just Gmail
        return true;
    }

    /**
     * ENHANCED: Validate phone - South African format only
     * Accepts: +27 12 345 6789, 071 234 5678, 012-345-6789, (012) 345 6789
     */
    validateSouthAfricanPhone(phone) {
        // Remove common formatting characters
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');

        // Must start with +27, 0, or be purely numeric with 10+ digits
        const saPhoneRegex = /^(\+27|0)[\d]{9,}$/;
        if (!saPhoneRegex.test(cleaned)) {
            return false;
        }

        // Validate length: SA numbers are typically +27 (9 digits) or 0 (10 digits)
        const numericOnly = cleaned.replace(/\D/g, '');
        return numericOnly.length >= 10;
    }

    /**
     * Display error message
     */
    setError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message if any
        const existingError = field.nextElementSibling;
        if (existingError && existingError.classList.contains('error-message')) {
            existingError.remove();
        }
        
        // Create and insert error message
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        field.parentNode.insertBefore(errorEl, field.nextSibling);
    }

    /**
     * Clear error state
     */
    clearError(field) {
        field.classList.remove('error');
        const errorEl = field.nextElementSibling;
        if (errorEl && errorEl.classList.contains('error-message')) {
            errorEl.remove();
        }
    }

    /**
     * Handle form submission with rate limiting and security checks
     */
    handleSubmit(e) {
        e.preventDefault();

        // ENHANCED: Check rate limiting
        if (SecurityGuard) {
            const rateLimitCheck = SecurityGuard.checkRateLimit(this.formId);
            if (!rateLimitCheck.allowed) {
                this.displayLockoutMessage(rateLimitCheck.message);
                return;
            }
        }

        const fields = this.form.querySelectorAll('input, textarea, select');
        let isValid = true;

        // Validate all fields
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (isValid) {
            // Reset rate limit counter on successful submission
            if (SecurityGuard) {
                sessionStorage.removeItem(`form_attempts_${this.formId}`);
            }
            this.submitForm();
        } else {
            // Scroll to first error
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }
    }

    /**
     * Display lockout message when rate limit is exceeded
     */
    displayLockoutMessage(message) {
        const lockoutDiv = document.createElement('div');
        lockoutDiv.className = 'form-lockout-message';
        lockoutDiv.innerHTML = `
            <i class="fas fa-lock"></i>
            <span>${message}</span>
        `;
        
        // Remove existing lockout message if any
        const existing = this.form.parentNode.querySelector('.form-lockout-message');
        if (existing) existing.remove();
        
        this.form.parentNode.insertBefore(lockoutDiv, this.form);
        
        // Disable the form
        const fields = this.form.querySelectorAll('input, textarea, select, button');
        fields.forEach(field => {
            field.disabled = true;
        });
    }

    /**
     * Submit form data with sanitization
     */
    submitForm() {
        const formData = new FormData(this.form);
        const data = {};
        
        // Sanitize form data
        for (const [key, value] of formData.entries()) {
            data[key] = SecurityGuard ? SecurityGuard.sanitizeInput(value) : value;
        }
        
        // Log for debugging (in production, send to server)
        console.log('✓ Form submitted successfully:', this.formId);
        
        // Show success message
        this.showSuccessMessage();
        
        // Reset form
        this.form.reset();
    }

    /**
     * Display success message with animation
     */
    showSuccessMessage() {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully.';
        this.form.parentNode.insertBefore(successMsg, this.form);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            successMsg.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => successMsg.remove(), 500);
        }, 5000);
    }
}

/**
 * Initialize form validators when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all forms on the page
    const contactForm = document.getElementById('contactForm');
    const donationForm = document.getElementById('donationForm');
    const pledgeForm = document.getElementById('pledgeForm');
    
    if (contactForm) {
        new FormValidator('contactForm');
    }
    
    if (donationForm) {
        new FormValidator('donationForm');
    }

    if (pledgeForm) {
        new FormValidator('pledgeForm');
    }
});

/**
 * Donation Amount Selection
 */
function selectDonationAmount(button, amount) {
    // Update button state
    const container = button.parentNode;
    container.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Set the amount in hidden field if it exists
    const amountField = document.getElementById('amount');
    if (amountField) {
        amountField.value = amount;
    }
}

/**
 * Add form styling for errors and success messages
 */
const formStyles = document.createElement('style');
formStyles.textContent = `
    /* Error Styling */
    input.error,
    textarea.error,
    select.error {
        border-color: #dc3545 !important;
        background-color: rgba(220, 53, 69, 0.05) !important;
    }

    input.error:focus,
    textarea.error:focus,
    select.error:focus {
        box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.15) !important;
    }

    .error-message {
        color: #dc3545;
        font-size: 0.85rem;
        margin-top: 0.5rem;
        display: block;
        font-weight: 500;
    }

    /* Success Message */
    .success-message {
        background-color: #28a745;
        color: white;
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-lg);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        animation: slideDown 0.4s ease-out;
    }
`;
document.head.appendChild(formStyles);

/**
 * Apple Pay & Face ID Payment Handler
 */
document.addEventListener('DOMContentLoaded', function() {
    // Donations Apple Pay Button
    const applePayBtn = document.getElementById('applePayBtn');
    if (applePayBtn) {
        applePayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const amount = document.getElementById('onlineAmount').value;
            if (!amount || amount <= 0) {
                alert('Please enter a valid donation amount');
                return;
            }
            
            // Apple Pay Payment Request
            if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
                const request = {
                    countryCode: 'ZA',
                    currencyCode: 'ZAR',
                    supportedNetworks: ['visa', 'masterCard', 'amex'],
                    merchantCapabilities: ['supports3DS'],
                    total: { label: 'St. Francis Donation', amount: amount },
                    lineItems: [
                        { label: 'Church Donation', amount: amount, type: 'final' }
                    ]
                };
                
                const session = new ApplePaySession(11, request);
                session.begin();
            } else {
                alert('Apple Pay is not available on this device. Please use another payment method.');
            }
        });
    }

    // Donations Face ID Button
    const faceIdBtn = document.getElementById('faceIdBtn');
    if (faceIdBtn) {
        faceIdBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const amount = document.getElementById('onlineAmount').value;
            if (!amount || amount <= 0) {
                alert('Please enter a valid donation amount');
                return;
            }

            // Check if WebAuthn is available
            if (window.PublicKeyCredential && navigator.credentials) {
                // Trigger biometric authentication
                navigator.credentials.get({
                    publicKey: {
                        challenge: new Uint8Array(32),
                        allowCredentials: [],
                        userVerification: 'preferred',
                        timeout: 60000
                    }
                }).then(assertion => {
                    alert('Thank you! Your donation of ZAR ' + amount + ' will be processed with Face ID authentication.');
                    document.getElementById('onlineMessage').textContent = 'Donation received! Thank you for your generosity.';
                    document.getElementById('onlineMessage').style.color = '#28a745';
                }).catch(err => {
                    console.log('Biometric authentication cancelled or unavailable');
                });
            } else {
                alert('Biometric authentication is not available on this device. Please use another payment method.');
            }
        });
    }

    // Pledge Apple Pay Button
    const pledgeApplePayBtn = document.getElementById('pledgeApplePayBtn');
    if (pledgeApplePayBtn) {
        pledgeApplePayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const amount = document.getElementById('amount').value;
            if (!amount || amount <= 0) {
                alert('Please enter a valid pledge amount');
                return;
            }

            if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
                const request = {
                    countryCode: 'ZA',
                    currencyCode: 'ZAR',
                    supportedNetworks: ['visa', 'masterCard', 'amex'],
                    merchantCapabilities: ['supports3DS'],
                    total: { label: 'St. Francis Pledge', amount: amount },
                    lineItems: [
                        { label: 'Church Pledge', amount: amount, type: 'final' }
                    ]
                };

                const session = new ApplePaySession(11, request);
                session.begin();
            } else {
                alert('Apple Pay is not available on this device. Please use another payment method.');
            }
        });
    }

    // Pledge Face ID Button
    const pledgeFaceIdBtn = document.getElementById('pledgeFaceIdBtn');
    if (pledgeFaceIdBtn) {
        pledgeFaceIdBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const amount = document.getElementById('amount').value;
            if (!amount || amount <= 0) {
                alert('Please enter a valid pledge amount');
                return;
            }

            if (window.PublicKeyCredential && navigator.credentials) {
                navigator.credentials.get({
                    publicKey: {
                        challenge: new Uint8Array(32),
                        allowCredentials: [],
                        userVerification: 'preferred',
                        timeout: 60000
                    }
                }).then(assertion => {
                    alert('Thank you! Your pledge of ZAR ' + amount + ' will be processed with Face ID authentication.');
                    document.getElementById('pledgeMessage').textContent = 'Pledge received! Thank you for your commitment.';
                    document.getElementById('pledgeMessage').style.color = '#28a745';
                }).catch(err => {
                    console.log('Biometric authentication cancelled or unavailable');
                });
            } else {
                alert('Biometric authentication is not available on this device. Please use another payment method.');
            }
        });
    }

    // ============ WALLET PAYMENT HANDLERS ============
    // Donations Wallet Button
    const walletBtn = document.getElementById('walletBtn');
    if (walletBtn) {
        walletBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const amount = document.getElementById('onlineAmount').value;
            if (!amount || amount <= 0) {
                alert('Please enter a valid donation amount');
                return;
            }

            // Simulate wallet payment
            const messageDiv = document.getElementById('onlineMessage');
            const animationContainer = document.getElementById('onlineAnimationContainer');
            
            messageDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing wallet payment...';
            messageDiv.style.color = '#3b82f6';
            
            setTimeout(() => {
                messageDiv.innerHTML = '<i class="fas fa-check-circle"></i> Wallet payment of ZAR ' + amount + ' successful!';
                messageDiv.style.color = '#10b981';
                
                // Show success animation
                animationContainer.style.display = 'block';
                animationContainer.innerHTML = `
                    <video width="200" height="150" autoplay muted>
                        <source src="Assets/Payment_animations/Payment Successful.webm" type="video/webm">
                        Your browser does not support the video tag.
                    </video>
                `;
            }, 2000);
        });
    }

    // Pledge Wallet Button
    const pledgeWalletBtn = document.getElementById('pledgeWalletBtn');
    if (pledgeWalletBtn) {
        pledgeWalletBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const amount = document.getElementById('amount').value;
            if (!amount || amount <= 0) {
                alert('Please enter a valid pledge amount');
                return;
            }

            // Simulate wallet payment
            const messageDiv = document.getElementById('formMessage');
            const animationContainer = document.getElementById('animationContainer');
            
            messageDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing wallet payment...';
            messageDiv.style.color = '#3b82f6';
            
            setTimeout(() => {
                messageDiv.innerHTML = '<i class="fas fa-check-circle"></i> Wallet payment of ZAR ' + amount + ' successful!';
                messageDiv.style.color = '#10b981';
                
                // Show success animation
                animationContainer.style.display = 'block';
                animationContainer.innerHTML = `
                    <video width="200" height="150" autoplay muted>
                        <source src="Assets/Payment_animations/Payment Successful.webm" type="video/webm">
                        Your browser does not support the video tag.
                    </video>
                `;
            }, 2000);
        });
    }

    // ============ DONATION FORM TYPE HANDLER ============
    window.updateDonationForm = function() {
        const donorType = document.getElementById('donorType').value;
        const orgEmailGroup = document.getElementById('orgEmailGroup');
        const personalEmailGroup = document.getElementById('personalEmailGroup');
        
        if (donorType === 'organization') {
            orgEmailGroup.style.display = 'block';
            personalEmailGroup.style.display = 'none';
            document.getElementById('orgEmail').required = true;
            document.getElementById('personalEmail').required = false;
        } else if (donorType === 'personal') {
            orgEmailGroup.style.display = 'none';
            personalEmailGroup.style.display = 'block';
            document.getElementById('orgEmail').required = false;
            document.getElementById('personalEmail').required = false;
        } else {
            orgEmailGroup.style.display = 'none';
            personalEmailGroup.style.display = 'block';
        }
    };

    // ============ PAYMENT FAILURE/CANCELLATION HANDLING ============
    // Helper function to show payment failed animation
    window.showPaymentFailed = function(containerId, messageId) {
        const animationContainer = document.getElementById(containerId);
        const messageDiv = document.getElementById(messageId);
        
        animationContainer.style.display = 'block';
        animationContainer.innerHTML = `
            <video width="200" height="150" autoplay loop muted>
                <source src="Assets/Payment_animations/Payment Failed.webm" type="video/webm">
                Your browser does not support the video tag.
            </video>
        `;
        
        messageDiv.innerHTML = '<i class="fas fa-times-circle"></i> Payment was cancelled or failed. Please try again.';
        messageDiv.style.color = '#ef4444';
    };
});

// ============ MINISTRY NAVIGATION STATE TRACKING ============
/**
 * Track ministry navigation state using mpho_bookmark_this variable
 * Remembers where user came from and restores focus on ministry tabs
 */
(function() {
    // Save current page before navigating to a ministry
    const ministryLinks = document.querySelectorAll('a[href*="/ministries/"]');
    ministryLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Save the referring page
            window.mpho_bookmark_this = {
                referrer: document.location.pathname,
                timestamp: new Date().getTime()
            };
            sessionStorage.setItem('mpho_bookmark_this', JSON.stringify(window.mpho_bookmark_this));
            
            // Save which ministry link was clicked (if it's a specific ministry)
            const ministryName = this.getAttribute('data-ministry');
            if (ministryName) {
                sessionStorage.setItem('mpho_last_ministry', ministryName);
            }
        });
    });

    // On page load, restore the bookmarked state
    window.addEventListener('load', function() {
        const savedBookmark = sessionStorage.getItem('mpho_bookmark_this');
        if (savedBookmark) {
            window.mpho_bookmark_this = JSON.parse(savedBookmark);
        }
    });

    // Handle back button to ministries
    window.addEventListener('popstate', function(event) {
        const savedBookmark = sessionStorage.getItem('mpho_bookmark_this');
        if (savedBookmark) {
            const bookmark = JSON.parse(savedBookmark);
            // If we're back on the ministries page, remove the bookmark
            if (document.location.pathname.includes('ministries')) {
                sessionStorage.removeItem('mpho_bookmark_this');
            }
        }
    });
})();
