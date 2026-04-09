/**
 * MINISTRY DEBUG TOOL
 * Diagnoses problems with ministry pages and provides actionable suggestions
 * Logs to browser console and displays visual debug info when enabled
 * 
 * Usage: Add data-debug="true" attribute to any ministry page to enable
 * Debug suggestions appear in console and as on-page notifications
 */

class MinistryDebugger {
    constructor() {
        this.debugMode = this.isDebugEnabled();
        this.issues = [];
        this.suggestions = [];
        this.init();
    }

    /**
     * Check if debug mode is enabled via URL or data attribute
     */
    isDebugEnabled() {
        return (
            new URLSearchParams(window.location.search).has('debug') ||
            document.body.getAttribute('data-debug') === 'true'
        );
    }

    /**
     * Initialize debugger
     */
    init() {
        if (!this.debugMode) return;

        console.log('%c🔧 MINISTRY DEBUGGER INITIALIZED', 'color: #D4AF37; font-weight: bold; font-size: 14px;');
        console.log('%cRunning diagnostic checks...', 'color: #003366;');

        // Run all diagnostic checks
        this.checkTabStructure();
        this.checkFormElements();
        this.checkEventListeners();
        this.checkEmailValidation();
        this.checkSubscriptionModal();
        this.checkResponsiveness();

        // Display results
        this.displayResults();

        // Add visual debug indicator
        this.addDebugIndicator();
    }

    /**
     * CHECK 1: Tab Structure Validation
     */
    checkTabStructure() {
        console.log('%c📑 CHECKING TAB STRUCTURE...', 'color: #003366; font-weight: bold;');

        const tabs = document.querySelectorAll('.ministry__tab');
        const tabContents = document.querySelectorAll('.ministry__tab-content');

        if (tabs.length === 0) {
            this.reportIssue('NO_TABS', 'No tab buttons found', 
                'Add .ministry__tab buttons with data-tab="<id>" attributes');
            return;
        }

        if (tabs.length !== tabContents.length) {
            this.reportIssue('TAB_MISMATCH', 
                `Tab count mismatch: ${tabs.length} tabs vs ${tabContents.length} content divs`,
                'Ensure each tab button has a corresponding content div with matching ID');
        }

        // Check data-tab values
        const tabMappings = {};
        let tabErrors = 0;

        tabs.forEach(tab => {
            const dataTab = tab.getAttribute('data-tab');
            const expectedId = 'tab-' + dataTab;
            const content = document.getElementById(expectedId);

            if (!dataTab) {
                this.reportIssue('MISSING_DATA_TAB', 
                    `Tab button missing data-tab attribute at index`,
                    'Add data-tab="<id>" to all tab buttons (e.g., data-tab="about")');
                tabErrors++;
                return;
            }

            if (!content) {
                this.reportIssue('MISSING_TAB_CONTENT', 
                    `No content found with ID "tab-${dataTab}"`,
                    `Create a div with id="tab-${dataTab}" for this tab`);
                tabErrors++;
                return;
            }

            tabMappings[dataTab] = {
                button: tab.textContent.trim(),
                contentId: expectedId,
                contentText: content.textContent.substring(0, 50) + '...'
            };

            console.log(`✓ Tab "${dataTab}" mapped correctly`);
        });

        if (tabErrors === 0) {
            this.reportSuccess('TAB_STRUCTURE', 'All tabs properly configured and mapped');
        }

        return tabMappings;
    }

    /**
     * CHECK 2: Form Elements Validation
     */
    checkFormElements() {
        console.log('%c📋 CHECKING FORM ELEMENTS...', 'color: #003366; font-weight: bold;');

        const forms = document.querySelectorAll('form');

        if (forms.length === 0) {
            console.log('ℹ️  No forms found on this page');
            return;
        }

        forms.forEach((form, idx) => {
            const formId = form.id || `form-${idx}`;
            const inputs = form.querySelectorAll('input, textarea, select');

            if (inputs.length === 0) {
                this.reportIssue('EMPTY_FORM', 
                    `Form "${formId}" has no input fields`,
                    'Add input/textarea/select elements to form');
                return;
            }

            // Check for email fields
            const emailInputs = form.querySelectorAll('input[type="email"]');
            emailInputs.forEach(email => {
                if (!email.name) {
                    this.reportIssue('MISSING_EMAIL_NAME', 
                        `Email input in "${formId}" has no name attribute`,
                        'Add name="email" to email input elements');
                }
                console.log(`✓ Email field found in form "${formId}"`);
            });

            console.log(`✓ Form "${formId}" has ${inputs.length} input fields`);
        });
    }

    /**
     * CHECK 3: Event Listeners Validation
     */
    checkEventListeners() {
        console.log('%c🎯 CHECKING EVENT LISTENERS...', 'color: #003366; font-weight: bold;');

        const modalTriggers = document.querySelectorAll('[onclick*="Modal"]');
        console.log(`Found ${modalTriggers.length} modal trigger elements`);

        const modal = document.getElementById('subscriptionModal');
        if (modal) {
            console.log('✓ Subscription modal found and accessible');
        } else {
            this.reportIssue('MISSING_MODAL', 'Subscription modal not found',
                'Ensure subscriptionModal div exists with id="subscriptionModal"');
        }

        // Check for tab click handlers
        const tabs = document.querySelectorAll('.ministry__tab');
        if (tabs.length > 0) {
            console.log(`✓ Found ${tabs.length} tab elements for click binding`);
        }
    }

    /**
     * CHECK 4: Email Validation
     */
    checkEmailValidation() {
        console.log('%c📧 CHECKING EMAIL VALIDATION...', 'color: #003366; font-weight: bold;');

        // Check if FormValidator is loaded
        if (typeof FormValidator === 'undefined') {
            this.reportIssue('MISSING_FORM_VALIDATOR', 
                'FormValidator class not loaded',
                'Ensure forms.js is included in the page');
            return;
        }

        console.log('✓ FormValidator class is available');

        // Test email validation
        const testEmails = {
            'valid@company.com': 'Should be valid (professional)',
            'user@gmail.com': 'Should be invalid for donations (free provider)',
            'info@organization.co.za': 'Should be valid (professional)',
        };

        const validator = new FormValidator('test-form');
        console.log('%cEmail Validation Tests:', 'color: #D4AF37;');
        
        for (const [email, expectation] of Object.entries(testEmails)) {
            const isValid = validator.validateEmail(email, 'donation');
            console.log(`  ${email}: ${isValid ? '✓ Valid' : '✗ Invalid'} - (${expectation})`);
        }
    }

    /**
     * CHECK 5: Subscription Modal
     */
    checkSubscriptionModal() {
        console.log('%c🔔 CHECKING SUBSCRIPTION MODAL...', 'color: #003366; font-weight: bold;');

        const modal = document.getElementById('subscriptionModal');
        if (!modal) {
            this.reportIssue('MISSING_MODAL', 'subscriptionModal div not found',
                'Create a div with id="subscriptionModal" containing the modal content');
            return;
        }

        const subscribeForm = document.getElementById('subscribeForm');
        const unsubscribeForm = document.getElementById('unsubscribeForm');

        if (!subscribeForm || !unsubscribeForm) {
            this.reportIssue('MISSING_FORM_IN_MODAL', 
                'Subscribe or Unsubscribe form missing in modal',
                'Ensure both forms exist with correct IDs');
            return;
        }

        // Check form endpoints
        const endpoint = subscribeForm.getAttribute('action');
        console.log(`✓ Subscription endpoint: ${endpoint}`);

        if (!endpoint.includes('formcarry') && !endpoint.includes('formspree')) {
            this.reportIssue('INVALID_ENDPOINT', 
                `Form endpoint is "${endpoint}", expected formcarry or formspree`,
                'Verify form action URL is correct');
        }
    }

    /**
     * CHECK 6: Responsiveness
     */
    checkResponsiveness() {
        console.log('%c📱 CHECKING RESPONSIVENESS...', 'color: #003366; font-weight: bold;');

        const width = window.innerWidth;
        const height = window.innerHeight;
        console.log(`Current viewport: ${width}x${height}px`);

        const breakpoints = [
            { name: 'Mobile', width: 375 },
            { name: 'Tablet', width: 768 },
            { name: 'Desktop', width: 1024 }
        ];

        breakpoints.forEach(bp => {
            if (width <= bp.width) {
                console.log(`ℹ️  Viewing at ${bp.name} breakpoint`);
            }
        });

        // Check for overlapping elements
        const profile = document.querySelector('.ministry__profile');
        const header = document.querySelector('.ministry__header-info');
        
        if (profile && header) {
            const profileRect = profile.getBoundingClientRect();
            const headerRect = header.getBoundingClientRect();
            
            if (profileRect.bottom > headerRect.top) {
                this.reportIssue('OVERLAPPING_ELEMENTS', 
                    'Profile image overlaps with header info',
                    'Adjust margin-top or position of .ministry__header-info');
            } else {
                console.log('✓ No overlapping elements detected');
            }
        }
    }

    /**
     * Report an issue with suggestion
     */
    reportIssue(code, message, suggestion) {
        const issue = { code, message, suggestion, severity: 'error' };
        this.issues.push(issue);
        
        console.error(`%c❌ ${code}`, 'color: #dc3545; font-weight: bold;');
        console.error(`   ${message}`);
        console.error(`   💡 Fix: ${suggestion}`);
    }

    /**
     * Report successful check
     */
    reportSuccess(code, message) {
        console.log(`%c✓ ${code}`, 'color: #28a745; font-weight: bold;');
        console.log(`   ${message}`);
    }

    /**
     * Display debug results
     */
    displayResults() {
        console.log('%c=====================================', 'color: #D4AF37; font-weight: bold;');
        console.log('%c📊 DIAGNOSTIC SUMMARY', 'color: #D4AF37; font-weight: bold; font-size: 14px;');
        console.log('%c=====================================', 'color: #D4AF37; font-weight: bold;');

        if (this.issues.length === 0) {
            console.log('%c✓ ALL CHECKS PASSED - No issues detected!', 'color: #28a745; font-weight: bold; font-size: 12px;');
        } else {
            console.log(`%c⚠️  ${this.issues.length} ISSUE(S) FOUND:`, 'color: #dc3545; font-weight: bold; font-size: 12px;');
            this.issues.forEach((issue, idx) => {
                console.log(`\n${idx + 1}. ${issue.code}`);
                console.log(`   Problem: ${issue.message}`);
                console.log(`   Solution: ${issue.suggestion}`);
            });
        }

        console.log('%c=====================================', 'color: #D4AF37; font-weight: bold;');
        console.log('%c💡 TIPS FOR DEBUGGING:', 'color: #D4AF37; font-weight: bold;');
        console.log('   1. Check browser DevTools (F12) for console errors');
        console.log('   2. Test tab switching by clicking each tab');
        console.log('   3. Verify all form fields validate correctly');
        console.log('   4. Test subscription modal opens/closes smoothly');
        console.log('   5. Check responsive design at different screen sizes');
        console.log('%c=====================================', 'color: #D4AF37; font-weight: bold;');
    }

    /**
     * Add visual debug indicator to page
     */
    addDebugIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'debug-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #D4AF37;
            color: #003366;
            padding: 12px 16px;
            border-radius: 50%;
            font-weight: bold;
            font-size: 12px;
            z-index: 9999;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const issueCount = this.issues.length;
        indicator.innerHTML = issueCount > 0 ? `⚠️ ${issueCount}` : '✓';
        indicator.title = `Debug Mode Enabled - ${issueCount} issue(s) found. Check console for details.`;

        indicator.addEventListener('click', () => {
            console.clear();
            this.init();
        });

        document.body.appendChild(indicator);
    }
}

/**
 * Auto-initialize debugger on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    new MinistryDebugger();
});

/**
 * Export for manual use
 */
window.MinistryDebugger = MinistryDebugger;
