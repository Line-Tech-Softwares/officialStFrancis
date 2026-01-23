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

        // ENHANCED: Email validation - Gmail only
        if (type === 'email' && value) {
            if (!this.validateGmailEmail(value)) {
                this.setError(field, 
                    'For the security and privacy of our community correspondence, we currently only accept Gmail addresses. Thank you for your understanding.');
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
     * ENHANCED: Validate email - Gmail only (@gmail.com)
     */
    validateGmailEmail(email) {
        // Check basic email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        // Check if it's a Gmail address
        const gmailRegex = /^[^\s@]+@gmail\.com$/i;
        return gmailRegex.test(email);
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
    
    if (contactForm) {
        new FormValidator('contactForm');
    }
    
    if (donationForm) {
        new FormValidator('donationForm');
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
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
    }

    .success-message i {
        font-size: 1.2rem;
    }

    /* Animations */
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }

    /* Active donation button */
    .amount-btn.active {
        background-color: var(--color-gold) !important;
        color: var(--color-primary) !important;
        border-color: var(--color-gold) !important;
    }
`;
document.head.appendChild(formStyles);
