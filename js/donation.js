// ======== DONATIONS PAGE - FORM VALIDATION & PAYMENT LOGIC ========

// Personal email domains allowed for donations
const PERSONAL_EMAIL_DOMAINS = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
    'mweb.co.za', 'telkom.co.za', 'vodacom.co.za', 'web.co.za', 'africa.com'
];

// Update form based on donor type
function updateDonationForm() {
    const donorType = document.querySelector('input[name="donorType"]:checked').value;
    const emailShortcuts = document.getElementById('emailShortcuts');
    const emailInput = document.getElementById('donationEmail');
    
    if (donorType === 'organization') {
        emailInput.placeholder = 'yourname@business.com';
        emailShortcuts.style.display = 'none';
    } else {
        emailInput.placeholder = 'yourpersonalemail@example.com';
        emailShortcuts.style.display = 'flex';
    }
}

// Handle email shortcut chips
document.querySelectorAll('.email-shortcut').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const domain = this.getAttribute('data-domain');
        const emailInput = document.getElementById('donationEmail');
        const currentValue = emailInput.value;
        
        if (currentValue && !currentValue.includes('@')) {
            emailInput.value = currentValue + '@' + domain;
        } else if (!currentValue) {
            emailInput.value = '@' + domain;
        } else {
            const beforeAt = currentValue.split('@')[0];
            emailInput.value = beforeAt + '@' + domain;
        }
        emailInput.focus();
    });
});

// Handle donation preset amount buttons
document.querySelectorAll('.donation-preset').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const amount = this.getAttribute('data-amount');
        document.getElementById('donationAmount').value = amount;
    });
});

// Format card number with spaces
document.getElementById('donationCardNumber')?.addEventListener('input', function() {
    let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
    }
    this.value = formatted;
    detectCardType(value);
});

// Format expiry date (MM/YY)
document.getElementById('donationExpiry')?.addEventListener('input', function() {
    let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
        this.value = value.slice(0, 2) + '/' + value.slice(2, 4);
    } else {
        this.value = value;
    }
});

// Format CVV (numbers only)
document.getElementById('donationCVV')?.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/gi, '');
});

// Detect card type and show appropriate icon
function detectCardType(cardNumber) {
    const icons = document.querySelectorAll('#donationCardIcons i');
    icons.forEach(icon => icon.style.display = 'none');
    
    if (/^4/.test(cardNumber)) {
        document.querySelectorAll('#donationCardIcons .fa-cc-visa')[0]?.style.setAttribute('display', 'block');
    } else if (/^5[1-5]/.test(cardNumber)) {
        document.querySelectorAll('#donationCardIcons .fa-cc-mastercard')[0]?.style.setAttribute('display', 'block');
    } else if (/^3[47]/.test(cardNumber)) {
        document.querySelectorAll('#donationCardIcons .fa-cc-amex')[0]?.style.setAttribute('display', 'block');
    }
}

// Step navigation
document.getElementById('donationNextBtn')?.addEventListener('click', function() {
    const fullName = document.getElementById('donationFullName').value.trim();
    const email = document.getElementById('donationEmail').value.trim();
    const amount = document.getElementById('donationAmount').value.trim();
    const emailError = document.getElementById('emailError');
    
    // Clear previous errors
    emailError.innerHTML = '';
    
    // Validate required fields
    if (!fullName) {
        alert('Please enter your full name');
        return;
    }
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailError.innerHTML = 'Please enter a valid email address';
        return;
    }
    
    if (!amount || parseInt(amount) < 1) {
        alert('Please enter an amount greater than 0');
        return;
    }
    
    // Show step 2, hide step 1
    document.getElementById('donationStep1').style.display = 'none';
    document.getElementById('donationStep2').style.display = 'block';
    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Back button
document.getElementById('donationBackBtn')?.addEventListener('click', function() {
    document.getElementById('donationStep2').style.display = 'none';
    document.getElementById('donationStep1').style.display = 'block';
    document.getElementById('donationMessage').innerHTML = '';
    document.getElementById('donationAnimationContainer').style.display = 'none';
});

// Pay button - Process donation
document.getElementById('donationPayBtn')?.addEventListener('click', function() {
    const cardNumber = document.getElementById('donationCardNumber').value.replace(/\s/g, '');
    const expiry = document.getElementById('donationExpiry').value;
    const cvv = document.getElementById('donationCVV').value;
    const cardholderName = document.getElementById('donationCardholderName').value.trim();
    const amount = document.getElementById('donationAmount').value;
    
    // Clear previous errors
    document.getElementById('donationCardError').innerHTML = '';
    document.getElementById('donationExpiryError').innerHTML = '';
    document.getElementById('donationCVVError').innerHTML = '';
    
    let hasError = false;
    
    // Card number validation (Luhn algorithm)
    if (!validateCardNumber(cardNumber)) {
        document.getElementById('donationCardError').innerHTML = 'Invalid card number';
        hasError = true;
    }
    
    // Expiry validation
    if (!validateExpiry(expiry)) {
        document.getElementById('donationExpiryError').innerHTML = 'Invalid or expired card';
        hasError = true;
    }
    
    // CVV validation
    if (!/^[0-9]{3,4}$/.test(cvv)) {
        document.getElementById('donationCVVError').innerHTML = 'Invalid CVV';
        hasError = true;
    }
    
    if (hasError) return;
    
    // Disable button and show processing
    this.disabled = true;
    document.getElementById('donationMessage').innerHTML = '';
    document.getElementById('donationAnimationContainer').style.display = 'block';
    
    // Simulate payment processing
    setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate for demo
        
        if (success) {
            // Show success animation
            document.getElementById('donationAnimationContainer').innerHTML = `
                <video width="150" height="112" autoplay loop muted style="border-radius: var(--radius-md);">
                    <source src="Assets/Payment_animations/Payment Successful.webm" type="video/webm">
                </video>
                <p style="margin-top: var(--spacing-sm); color: #10b981; font-weight: 600;">Payment successful!</p>
            `;
            
            document.getElementById('donationMessage').innerHTML = 'Thank you for your generous donation!';
            document.getElementById('donationMessage').style.color = '#10b981';
            
            // Reset form after delay
            setTimeout(() => {
                document.getElementById('onlineGivingForm').reset();
                updateDonationForm();
                document.getElementById('donationStep2').style.display = 'none';
                document.getElementById('donationStep1').style.display = 'block';
                document.getElementById('donationPayBtn').disabled = false;
            }, 3000);
        } else {
            // Show failure
            document.getElementById('donationAnimationContainer').innerHTML = `
                <video width="150" height="112" autoplay loop muted style="border-radius: var(--radius-md);">
                    <source src="Assets/Payment_animations/Payment Failed.webm" type="video/webm">
                </video>
            `;
            
            document.getElementById('donationMessage').innerHTML = 'Payment failed. Please try again.';
            document.getElementById('donationMessage').style.color = '#ef4444';
            document.getElementById('donationPayBtn').disabled = false;
        }
    }, 2000);
});

// Luhn algorithm for card validation
function validateCardNumber(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// Expiry date validation
function validateExpiry(expiry) {
    const parts = expiry.split('/');
    if (parts.length !== 2) return false;
    
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);
    
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
}

// Prevent form submission
document.getElementById('onlineGivingForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    return false;
});

// ======== CLEAN URL SCRIPT ========
window.addEventListener('load', function() {
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('.html')) {
        const cleanPath = currentPath.replace(/\.html$/, '');
        history.replaceState(null, document.title, cleanPath);
        console.log('✓ Clean URL applied:', cleanPath);
    }
});