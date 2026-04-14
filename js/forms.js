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

        // ENHANCED: Email validation - Business email only for org donations
        if (type === 'email' && value) {
            // Determine validation type based on field ID
            let validationType = 'contact'; // default
            
            if (this.formId === 'onlineGivingForm' || this.formId === 'donationForm') {
                // For donations, check if it's org email field
                if (field.id === 'orgEmail') {
                    validationType = 'donation-org';
                } else {
                    validationType = 'donation-personal';
                }
            } else if (this.formId === 'pledgeForm') {
                // Pledges accept any email
                validationType = 'pledge';
            }

            if (!this.validateEmail(value, validationType)) {
                if (validationType === 'donation-org') {
                    this.setError(field, 
                        'Business email required. Please use your company email address (not Gmail, Yahoo, Outlook, etc.)');
                } else if (validationType === 'donation-personal') {
                    this.setError(field, 'Please enter a valid email address');
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
     * ENHANCED: Validate email based on form type and donor type
     * Contact forms: Accept any valid email
     * Donation/Pledge forms: Donations org = business only, personal/pledges = any email
     */
    validateEmail(email, formType = 'contact') {
        // Check basic email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        // For donation organization forms, only allow business emails
        if (formType === 'donation-org') {
            return this.validateBusinessEmail(email);
        }

        // For donation personal, pledges, and contact forms accept all valid emails
        return true;
    }

    /**
     * BUSINESS EMAIL VALIDATION (for organization donations only)
     * Blocks free email domains (Gmail, Yahoo, Outlook, etc.)
     * Only allows corporate/organizational email addresses
     */
    validateBusinessEmail(email) {
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
    const onlineGivingForm = document.getElementById('onlineGivingForm');
    const pledgeForm = document.getElementById('pledgeForm');
    
    if (contactForm) {
        new FormValidator('contactForm');
    }
    
    if (donationForm) {
        new FormValidator('donationForm');
    }

    if (onlineGivingForm) {
        window.formValidator = new FormValidator('onlineGivingForm');
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

    /* Payment Method Buttons - Mobile Responsive */
    @media (max-width: 768px) {
        /* Payment method grid - stack on smaller screens */
        [style*="grid-template-columns: repeat(3, 1fr)"] {
            display: flex !important;
            flex-direction: column !important;
            grid-template-columns: unset !important;
            gap: var(--spacing-md) !important;
        }

        /* Payment buttons */
        .pledge-payment-method,
        [class*="payment-method"] {
            padding: var(--spacing-md) !important;
            min-height: 50px !important;
            font-size: 1rem !important;
            width: 100% !important;
        }

        /* Payment method icons */
        .pledge-payment-method i,
        [class*="payment-method"] i {
            font-size: 1.5rem !important;
            margin-right: 0.75rem !important;
        }

        .pledge-payment-method span,
        [class*="payment-method"] span {
            font-size: 0.95rem !important;
        }
    }

    @media (max-width: 480px) {
        /* Extra small screens */
        .pledge-payment-method,
        [class*="payment-method"] {
            padding: var(--spacing-sm) var(--spacing-md) !important;
            min-height: 45px !important;
            font-size: 0.9rem !important;
        }

        .pledge-payment-method i,
        [class*="payment-method"] i {
            font-size: 1.3rem !important;
            margin-right: 0.5rem !important;
        }
    }
`;
document.head.appendChild(formStyles);

/**
 * HTML Alert System - Display alerts without browser alert()
 */
window.showHTMLAlert = function(title, message, type = 'info') {
    // Remove existing alert if present
    const existingAlert = document.getElementById('html-alert-container');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create alert container
    const alertContainer = document.createElement('div');
    alertContainer.id = 'html-alert-container';
    alertContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        border-left: 4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#0071E3'};
    `;

    // Color scheme based on type
    const colors = {
        success: { bg: '#d4edda', text: '#155724', icon: 'fa-check-circle' },
        error: { bg: '#f8d7da', text: '#721c24', icon: 'fa-exclamation-circle' },
        warning: { bg: '#fff3cd', text: '#856404', icon: 'fa-exclamation-triangle' },
        info: { bg: '#d1ecf1', text: '#0c5460', icon: 'fa-info-circle' }
    };

    const colorScheme = colors[type] || colors.info;

    alertContainer.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <i class="fas ${colorScheme.icon}" style="color: ${colorScheme.text}; margin-top: 2px; font-size: 20px;"></i>
            <div style="flex: 1;">
                <strong style="color: ${colorScheme.text}; display: block; margin-bottom: 4px;">${title}</strong>
                <p style="color: ${colorScheme.text}; margin: 0; font-size: 14px; line-height: 1.5;">${message}</p>
            </div>
            <button onclick="document.getElementById('html-alert-container').remove()" style="background: none; border: none; color: ${colorScheme.text}; cursor: pointer; font-size: 20px; padding: 0; line-height: 1;">×</button>
        </div>
    `;

    document.body.appendChild(alertContainer);

    // Auto-remove after 6 seconds for success/info, 8 seconds for errors
    const timeout = (type === 'error' || type === 'warning') ? 8000 : 6000;
    setTimeout(() => {
        if (alertContainer.parentNode) {
            alertContainer.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => alertContainer.remove(), 300);
        }
    }, timeout);
};

/**
 * Add animation styles for alerts
 */
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(400px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }
`;
document.head.appendChild(alertStyles);

/**
 * Card Validation Utilities
 */
const CardValidator = {
    /**
     * Validate card number using Luhn algorithm
     */
    validateCardNumber: function(cardNumber) {
        // Remove spaces and dashes
        const cleaned = cardNumber.replace(/[\s\-]/g, '');
        
        // Must be numeric and 13-19 digits
        if (!/^\d{13,19}$/.test(cleaned)) {
            return false;
        }
        
        // Luhn algorithm check
        let sum = 0;
        let isEven = false;
        
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i], 10);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    },

    /**
     * Validate expiry date (MM/YY format)
     */
    validateExpiry: function(expiry) {
        const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!pattern.test(expiry)) {
            return false;
        }
        
        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expiryYear = parseInt(year, 10);
        const expiryMonth = parseInt(month, 10);
        
        // Check if card has expired
        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
            return false;
        }
        
        return true;
    },

    /**
     * Validate CVV (3-4 digits)
     */
    validateCVV: function(cvv) {
        return /^\d{3,4}$/.test(cvv);
    },

    /**
     * Validate all card fields for a form
     */
    validateCardFields: function(formType = 'donation') {
        const cardNumberField = formType === 'pledge' ? 'cardNumber' : 'onlineCardNumber';
        const expiryField = formType === 'pledge' ? 'expiry' : 'onlineExpiry';
        const cvvField = formType === 'pledge' ? 'cvv' : 'onlineCvv';
        const cardholderField = formType === 'pledge' ? 'cardholderName' : 'onlineCardholderName';

        const cardNumber = document.getElementById(cardNumberField)?.value || '';
        const expiry = document.getElementById(expiryField)?.value || '';
        const cvv = document.getElementById(cvvField)?.value || '';
        const cardholder = document.getElementById(cardholderField)?.value || '';

        if (!cardNumber) {
            window.showHTMLAlert('Card Number Required', 'Please enter your card number.', 'error');
            return false;
        }

        if (!this.validateCardNumber(cardNumber)) {
            window.showHTMLAlert('Invalid Card Number', 'Please enter a valid card number.', 'error');
            return false;
        }

        if (!expiry) {
            window.showHTMLAlert('Expiry Required', 'Please enter the card expiry date (MM/YY).', 'error');
            return false;
        }

        if (!this.validateExpiry(expiry)) {
            window.showHTMLAlert('Invalid Expiry', 'Please enter a valid expiry date or the card has expired.', 'error');
            return false;
        }

        if (!cvv) {
            window.showHTMLAlert('CVV Required', 'Please enter the card CVV.', 'error');
            return false;
        }

        if (!this.validateCVV(cvv)) {
            window.showHTMLAlert('Invalid CVV', 'Please enter a valid CVV (3-4 digits).', 'error');
            return false;
        }

        if (!cardholder) {
            window.showHTMLAlert('Cardholder Name Required', 'Please enter the cardholder name.', 'error');
            return false;
        }

        return true;
    }
};

/**
 * Payment Processing System
 * Handles Apple Pay, Biometric (Face ID), and Digital Wallet payments
 */
const PaymentProcessor = {
    /**
     * Process Apple Pay payment
     */
    processApplePay: function(amount, formType = 'donation') {
        if (!amount || amount <= 0) {
            window.showHTMLAlert('Invalid Amount', 'Please enter a valid ' + (formType === 'pledge' ? 'pledge' : 'donation') + ' amount.', 'error');
            return;
        }

        // Check if Apple Pay is available on this device/browser
        if (!(window.ApplePaySession instanceof Function)) {
            window.showHTMLAlert('Apple Pay Unavailable', 'Apple Pay is not available on this device or browser. Please use another payment method.', 'warning');
            return;
        }

        // Check if user can make Apple Pay payments
        if (!ApplePaySession.canMakePayments()) {
            window.showHTMLAlert('Apple Pay Not Configured', 'Apple Pay is not configured on this device. Please use another payment method.', 'warning');
            return;
        }

        // Create Apple Pay request
        const request = {
            countryCode: 'ZA',
            currencyCode: 'ZAR',
            supportedNetworks: ['visa', 'masterCard', 'amex'],
            merchantCapabilities: ['supports3DS', 'supportsDebit', 'supportsCredit'],
            requiredBillingContactFields: ['postalAddress', 'name', 'phone', 'email'],
            requiredShippingContactFields: [],
            total: {
                label: 'St. Francis ' + (formType === 'pledge' ? 'Pledge' : 'Donation'),
                amount: parseFloat(amount).toFixed(2)
            },
            lineItems: [
                {
                    label: 'Church ' + (formType === 'pledge' ? 'Pledge' : 'Donation'),
                    amount: parseFloat(amount).toFixed(2),
                    type: 'final'
                }
            ]
        };

        try {
            const session = new ApplePaySession(10, request);

            session.onvalidatemerchant = (event) => {
                // In production, you would validate the merchant with Apple Pay servers
                // For development, we complete validation
                session.completeMerchantValidation({});
            };

            session.onpaymentauthorized = (event) => {
                // Payment authorized - process the payment
                const paymentData = {
                    token: event.payment.token,
                    billingContact: event.payment.billingContact,
                    shippingContact: event.payment.shippingContact
                };
                
                // Simulate server-side payment processing
                setTimeout(() => {
                    // Mark payment as successful
                    session.completePayment(ApplePaySession.STATUS_SUCCESS);
                    PaymentProcessor.completePayment(amount, 'Apple Pay', formType, null);
                }, 1000);
            };

            session.oncancel = () => {
                window.showHTMLAlert('Payment Cancelled', 'Your ' + (formType === 'pledge' ? 'pledge' : 'donation') + ' has been cancelled.', 'warning');
            };

            session.onerror = (error) => {
                window.showHTMLAlert('Payment Error', 'An error occurred: ' + error.errors[0].message, 'error');
                console.error('Apple Pay error:', error);
            };

            // Begin the payment session
            session.begin();
        } catch (error) {
            window.showHTMLAlert('Payment Error', 'Failed to initiate Apple Pay. Please try another payment method.', 'error');
            console.error('Apple Pay initialization error:', error);
        }
    },

    /**
     * Process Biometric (Face ID / Touch ID) payment
     */
    processBiometric: function(amount, formType = 'donation') {
        if (!amount || amount <= 0) {
            window.showHTMLAlert('Invalid Amount', 'Please enter a valid ' + (formType === 'pledge' ? 'pledge' : 'donation') + ' amount.', 'error');
            return;
        }

        // Check if WebAuthn/Biometric is available
        if (!window.PublicKeyCredential || !navigator.credentials) {
            window.showHTMLAlert('Biometric Unavailable', 'Biometric authentication is not available on this device. Please use another payment method.', 'warning');
            return;
        }

        // Show processing message
        window.showHTMLAlert('Processing', 'Please authenticate using Face ID or Touch ID...', 'info');

        // Request biometric authentication
        navigator.credentials.get({
            publicKey: {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                allowCredentials: [],
                userVerification: 'preferred',
                timeout: 60000
            }
        }).then(assertion => {
            // Biometric authentication successful
            PaymentProcessor.completePayment(amount, 'Biometric', formType, null);
        }).catch(err => {
            if (err.name === 'NotAllowedError') {
                window.showHTMLAlert('Authentication Cancelled', 'Biometric authentication was cancelled. Please try again.', 'warning');
            } else if (err.name === 'InvalidStateError') {
                window.showHTMLAlert('No Credentials Registered', 'No biometric credentials found. Please use another payment method.', 'error');
            } else {
                window.showHTMLAlert('Authentication Error', 'An error occurred during biometric authentication: ' + err.message, 'error');
            }
        });
    },

    /**
     * Process Digital Wallet payment
     */
    processWallet: function(amount, formType = 'donation') {
        if (!amount || amount <= 0) {
            window.showHTMLAlert('Invalid Amount', 'Please enter a valid ' + (formType === 'pledge' ? 'pledge' : 'donation') + ' amount.', 'error');
            return;
        }

        // Get message and animation containers based on form type
        const messageElementId = formType === 'pledge' ? 'formMessage' : 'onlineMessage';
        const animationElementId = formType === 'pledge' ? 'animationContainer' : 'onlineAnimationContainer';
        
        const messageDiv = document.getElementById(messageElementId);
        const animationContainer = document.getElementById(animationElementId);

        // Show processing state
        if (messageDiv) {
            messageDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing digital wallet payment...';
            messageDiv.style.color = '#3b82f6';
        }

        window.showHTMLAlert('Processing', 'Connecting to payment gateway...', 'info');

        // Simulate payment processing (3-5 seconds)
        setTimeout(() => {
            // Complete the payment
            PaymentProcessor.completePayment(amount, 'Digital Wallet', formType, null);
        }, 3000);
    },

    /**
     * Complete payment and show success message
     */
    completePayment: function(amount, method, formType = 'donation', applePaySession = null) {
        // Get the appropriate message and animation containers
        const messageElementId = formType === 'pledge' ? 'formMessage' : 'onlineMessage';
        const animationElementId = formType === 'pledge' ? 'animationContainer' : 'onlineAnimationContainer';
        
        const messageDiv = document.getElementById(messageElementId);
        const animationContainer = document.getElementById(animationElementId);

        // Update message
        if (messageDiv) {
            messageDiv.innerHTML = '<i class="fas fa-check-circle"></i> ' + method + ' payment of ZAR ' + amount + ' successful!';
            messageDiv.style.color = '#28a745';
        }

        // Show success animation
        if (animationContainer) {
            animationContainer.style.display = 'block';
            animationContainer.innerHTML = `
                <video width="200" height="150" autoplay muted playsinline>
                    <source src="Assets/Payment_animations/Payment Successful.webm" type="video/webm">
                    <source src="Assets/Payment_animations/Payment Successful.mp4" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        }

        // Show HTML alert
        const successMsg = 'Your ' + (formType === 'pledge' ? 'pledge' : 'donation') + ' of ZAR ' + amount + ' has been processed successfully using ' + method + '. Thank you for your generosity!';
        window.showHTMLAlert('Payment Successful', successMsg, 'success');

        // If Apple Pay session exists, complete it
        if (applePaySession) {
            applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS);
        }

        // Log payment for analytics
        console.log('✓ Payment processed:', {
            method: method,
            amount: amount,
            formType: formType,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Handle payment failure
     */
    handlePaymentFailure: function(formType = 'donation', reason = 'Unknown error') {
        const messageElementId = formType === 'pledge' ? 'formMessage' : 'onlineMessage';
        const animationElementId = formType === 'pledge' ? 'animationContainer' : 'onlineAnimationContainer';
        
        const messageDiv = document.getElementById(messageElementId);
        const animationContainer = document.getElementById(animationElementId);

        // Update message
        if (messageDiv) {
            messageDiv.innerHTML = '<i class="fas fa-times-circle"></i> Payment failed. Please try again.';
            messageDiv.style.color = '#ef4444';
        }

        // Show failure animation
        if (animationContainer) {
            animationContainer.style.display = 'block';
            animationContainer.innerHTML = `
                <video width="200" height="150" autoplay muted playsinline>
                    <source src="Assets/Payment_animations/Payment Failed.webm" type="video/webm">
                    <source src="Assets/Payment_animations/Payment Failed.mp4" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        }

        window.showHTMLAlert('Payment Failed', 'Your payment could not be processed. ' + reason + ' Please try again or use a different payment method.', 'error');
    }
};

/**
 * Apple Pay & Face ID Payment Handler
 */
document.addEventListener('DOMContentLoaded', function() {
    // ============ DONATIONS PAYMENT HANDLERS ============
    
    // Donations Apple Pay Button
    const applePayBtn = document.getElementById('applePayBtn');
    if (applePayBtn) {
        applePayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            PaymentProcessor.processApplePay(document.getElementById('onlineAmount').value, 'donation');
        });
    }

    // Donations Face ID Button (Biometric)
    const faceIdBtn = document.getElementById('faceIdBtn');
    if (faceIdBtn) {
        faceIdBtn.addEventListener('click', function(e) {
            e.preventDefault();
            PaymentProcessor.processBiometric(document.getElementById('onlineAmount').value, 'donation');
        });
    }

    // Donations Wallet Button
    const walletBtn = document.getElementById('walletBtn');
    if (walletBtn) {
        walletBtn.addEventListener('click', function(e) {
            e.preventDefault();
            PaymentProcessor.processWallet(document.getElementById('onlineAmount').value, 'donation');
        });
    }

    // ============ PLEDGES PAYMENT HANDLERS ============
    
    // Pledge Apple Pay Button
    const pledgeApplePayBtn = document.getElementById('pledgeApplePayBtn');
    if (pledgeApplePayBtn) {
        pledgeApplePayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            PaymentProcessor.processApplePay(document.getElementById('amount').value, 'pledge');
        });
    }

    // Pledge Face ID Button (Biometric)
    const pledgeFaceIdBtn = document.getElementById('pledgeFaceIdBtn');
    if (pledgeFaceIdBtn) {
        pledgeFaceIdBtn.addEventListener('click', function(e) {
            e.preventDefault();
            PaymentProcessor.processBiometric(document.getElementById('amount').value, 'pledge');
        });
    }

    // Pledge Wallet Button
    const pledgeWalletBtn = document.getElementById('pledgeWalletBtn');
    if (pledgeWalletBtn) {
        pledgeWalletBtn.addEventListener('click', function(e) {
            e.preventDefault();
            PaymentProcessor.processWallet(document.getElementById('amount').value, 'pledge');
        });
    }

    // ============ DONATION FORM TYPE HANDLER ============
    window.updateDonationForm = function() {
        const donorType = document.getElementById('donorType').value;
        const orgEmailGroup = document.getElementById('orgEmailGroup');
        const personalEmailGroup = document.getElementById('personalEmailGroup');
        const orgEmailInput = document.getElementById('orgEmail');
        const personalEmailInput = document.getElementById('personalEmail');
        
        if (donorType === 'organization') {
            orgEmailGroup.style.display = 'block';
            personalEmailGroup.style.display = 'none';
            orgEmailInput.required = true;
            orgEmailInput.placeholder = 'finance@yourcompany.com';
            personalEmailInput.required = false;
        } else if (donorType === 'personal') {
            orgEmailGroup.style.display = 'none';
            personalEmailGroup.style.display = 'block';
            personalEmailInput.required = true;
            personalEmailInput.placeholder = 'your.email@example.com';
            orgEmailInput.required = false;
        } else {
            orgEmailGroup.style.display = 'none';
            personalEmailGroup.style.display = 'block';
            personalEmailInput.required = false;
            orgEmailInput.required = false;
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
