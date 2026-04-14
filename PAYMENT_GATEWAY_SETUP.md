# Payment Gateway Setup & Implementation Guide

**Last Updated:** April 2026  
**Status:** Ready for Implementation  
**Primary Gateway:** PayFast (Recommended for South African Non-Profits)

---

## 📋 Overview

This document provides complete setup instructions for integrating PayFast (or Stripe as alternative) with the St. Francis Church donation and pledge pages.

### Key Differences Between Pages

| Feature | Donations | Pledge |
|---------|-----------|--------|
| **Donor Type** | Personal or Organisation | Personal Only (Enforced) |
| **Email Validation** | Accept both types | Reject professional domains |
| **Payment Type** | One-time only | Recurring (Weekly/Monthly/Quarterly/Annually) |
| **Form Steps** | Step 1: Details → Step 2: Payment | Step 1: Details → Step 2: Payment |
| **Services Info** | Sidebar box | Sidebar box |

---

## 🔧 PAYFAST SETUP (RECOMMENDED)

### Step 1: Create PayFast Account

1. **Sign Up:**
   - Visit: https://www.payfast.co.za
   - Register a Merchant Account (Non-Profit/NPO eligible)
   - Verify your email and business details

2. **Complete Your Profile:**
   - Upload NPO registration documents (if applicable)
   - Add church bank account for payouts
   - Configure notification settings

3. **Generate API Credentials:**
   - Log in to PayFast Dashboard
   - Navigate: Settings → API
   - Copy your **Merchant ID** and **Merchant Key**
   - Generate **API Bearer Token** for server-side requests

4. **Enable Test Mode (Development):**
   - Settings → Test Mode: Enable
   - Use test card: `4111 1111 1111 1111` (Visa)

### Step 2: Configure Payment Methods

1. **Enable on Dashboard:**
   - ✅ Credit/Debit Cards (enabled by default)
   - ✅ Apple Pay
   - ✅ Google Pay
   - ✅ Instant EFT (South African: OZOW, Zapper)
   - ✅ Bank Transfer (Optional)

2. **Instant EFT Configuration:**
   - PayFast automatically routes to Zapper, SnapScan, Ozow
   - Users see "Pay with Zapper/EFT" button
   - Integrates with South African banking ecosystem

3. **Apple Pay & Google Pay:**
   - PayFast handles tokenization securely
   - No additional setup needed
   - Works automatically on compatible devices

### Step 3: Domain Verification (Apple Pay)

1. **Create Verification File:**
   ```
   /.well-known/apple-developer-merchantid-domain-association
   ```

2. **Obtain from PayFast:**
   - PayFast Dashboard → Apple Pay Settings
   - Download verification file
   - Upload to your server root at exact path above

3. **Verify in PayFast:**
   - Dashboard → Apple Pay → Verify Domain
   - Status should show ✅ Verified after 5 minutes

### Step 4: IPN (Instant Payment Notification) Setup

1. **In PayFast Dashboard:**
   - Settings → IPN Settings
   - Enable IPN
   - Add IPN URL: `https://sfmw.co.za/api/payfast-webhook`

2. **Backend Webhook Handler (Node.js Example):**
   ```javascript
   // /api/payfast-webhook
   const crypto = require('crypto');

   app.post('/api/payfast-webhook', (req, res) => {
     // Verify PayFast signature
     const postData = req.body;
     const signature = postData.signature;
     delete postData.signature;
     
     // Build signature string
     let signatureString = '';
     for (let key in postData) {
       signatureString += key + '=' + postData[key] + '&';
     }
     signatureString = signatureString.slice(0, -1);
     
     // Add passphrase (from PayFast settings)
     signatureString += '&passphrase=' + process.env.PAYFAST_PASSPHRASE;
     
     // Generate hash
     const hash = crypto
       .createHash('md5')
       .update(signatureString)
       .digest('hex');
     
     if (hash !== signature) {
       return res.status(400).send('Invalid signature');
     }
     
     // Process payment
     const m_payment_id = postData.m_payment_id;
     const payment_status = postData.payment_status;
     const amount_gross = postData.amount_gross;
     const donor_email = postData.custom_str1;
     
     if (payment_status === 'COMPLETE') {
       // Save donation/pledge to database
       saveDonation({
         amount: amount_gross,
         email: donor_email,
         paymentId: m_payment_id,
         status: 'PAID',
         timestamp: new Date()
       });
       
       // Send confirmation email
       sendConfirmationEmail(donor_email, amount_gross);
     }
     
     // Always respond with 200
     res.send('OK');
   });
   ```

3. **PHP Alternative:**
   ```php
   <?php
   // /api/payfast-webhook
   $postData = $_POST;
   $signature = $postData['signature'];
   unset($postData['signature']);
   
   // Build signature string
   $signatureString = '';
   foreach ($postData as $key => $value) {
       $signatureString .= $key . '=' . $value . '&';
   }
   $signatureString = rtrim($signatureString, '&');
   
   // Add passphrase
   $signatureString .= '&passphrase=' . $_ENV['PAYFAST_PASSPHRASE'];
   
   // Verify
   $hash = md5($signatureString);
   
   if ($hash === $signature) {
       // Process payment
       $status = $_POST['payment_status'];
       $amount = $_POST['amount_gross'];
       $email = $_POST['custom_str1'];
       
       if ($status === 'COMPLETE') {
           // Save to database
           // Send email confirmation
       }
   }
   
   echo 'OK';
   ?>
   ```

### Step 5: Return URLs

1. **In PayFast Dashboard:**
   - Donation Return URL: `https://sfmw.co.za/donations?success=1`
   - Pledge Return URL: `https://sfmw.co.za/pledge?success=1`
   - Cancel URL: `https://sfmw.co.za/`
   - Notify URL (IPN): `https://sfmw.co.za/api/payfast-webhook`

2. **Handle Success on Frontend:**
   ```javascript
   // Check URL parameter after redirect
   const urlParams = new URLSearchParams(window.location.search);
   if (urlParams.get('success') === '1') {
       showSuccessPage();
   }
   ```

---

## 💳 STRIPE ALTERNATIVE SETUP

If you prefer Stripe (global + beautiful Elements UI):

### Step 1: Create Stripe Account

1. **Sign Up:**
   - Visit: https://stripe.com/
   - Create account (use South African bank account)
   - Verify email

2. **Get API Keys:**
   - Dashboard → API Keys
   - Copy **Publishable Key** and **Secret Key**
   - Store Secret Key in `.env` file only

### Step 2: Enable Payment Methods

1. **Stripe Elements (Card):** ✅ Default
2. **Apple Pay:** Settings → Accept Apple Pay
3. **Google Pay:** Settings → Accept Google Pay
4. **Alipay/Ideal/etc:** Optional

### Step 3: Backend Setup (Node.js)

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent for donations (one-time)
app.post('/api/donations/create-payment-intent', async (req, res) => {
  const { amount, email, donor_type } = req.body;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'zar',
      metadata: {
        email: email,
        donor_type: donor_type,
        page: 'donations'
      }
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create Setup Intent for recurring pledges
app.post('/api/pledges/create-setup-intent', async (req, res) => {
  const { email, frequency } = req.body;
  
  try {
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ['card'],
      metadata: {
        email: email,
        frequency: frequency,
        page: 'pledge'
      }
    });
    
    res.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Webhook for recurring subscriptions
app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      handleSuccessfulPayment(event.data.object);
      break;
    case 'customer.subscription.created':
      handleNewSubscription(event.data.object);
      break;
    case 'invoice.paid':
      handleRecurringPayment(event.data.object);
      break;
  }
  
  res.json({ received: true });
});
```

### Step 4: Frontend Integration (Stripe Elements)

```javascript
// Load Stripe library
const stripe = Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Create Payment Intent on submit
async function completeDonation() {
  const response = await fetch('/api/donations/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: document.getElementById('donationAmount').value,
      email: document.getElementById('donationEmail').value,
      donor_type: document.querySelector('input[name="donorType"]:checked').value
    })
  });
  
  const { clientSecret } = await response.json();
  
  // Confirm payment with Stripe
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: {
        email: document.getElementById('donationEmail').value,
        name: document.getElementById('donationFullName').value
      }
    }
  });
  
  if (result.error) {
    showError(result.error.message);
  } else {
    showSuccess('Payment successful!');
  }
}
```

---

## 📧 EMAIL CONFIGURATION

### Email Service Setup (SendGrid Example)

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendConfirmationEmail(email, amount, type = 'donation') {
  const message = {
    to: email,
    from: 'finance@stfrancischmw.org',
    subject: `${type === 'donation' ? 'Donation' : 'Pledge'} Confirmation - St. Francis Church`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Thank You for Your ${type === 'donation' ? 'Donation' : 'Pledge'}!</h2>
        <p>Dear Friend,</p>
        <p>We have received your ${type === 'donation' ? 'donation' : 'pledge commitment'} of <strong>R${amount}</strong>.</p>
        <p>${type === 'pledge' 
          ? 'Your recurring pledge has been set up and will process according to your selected frequency.'
          : 'Your generous donation will help support our ministry.'
        }</p>
        <p style="margin-top: 30px;">
          With gratitude and God's blessings,<br/>
          <strong>St. Francis Anglican Church</strong>
        </p>
      </div>
    `
  };
  
  await sgMail.send(message);
}
```

---

## 🔐 SECURITY CHECKLIST

- [ ] All API keys stored in `.env` file (never commit to git)
- [ ] HTTPS only (no HTTP)
- [ ] Card data never stored locally (PCI compliance)
- [ ] All card inputs validated client-side (Luhn algorithm)
- [ ] Server-side validation of all payment amounts
- [ ] Webhook signature verification implemented
- [ ] IPN URL uses HTTPS
- [ ] Rate limiting on payment endpoints
- [ ] Donation/pledge data encrypted in database
- [ ] No card details logged anywhere

---

## 🌐 CLEAN URL SETUP WITH .htaccess

### Apache Configuration

Create/edit `.htaccess` in root directory:

```apache
# Enable URL rewriting
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Remove .html extension
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME}.html -f
  RewriteRule ^([^\.]+)$ $1.html [L]
  
  # Remove .html from URLs (redirect old URLs)
  RewriteCond %{THE_REQUEST} ^[A-Z]{3,9}\ /([^.]+)\.html [NC]
  RewriteRule ^([^.]+)\.html$ /$1 [R=301,L]
</IfModule>

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault                              "access plus 1 month"
  ExpiresByType text/html                     "access plus 1 week"
  ExpiresByType image/jpeg                    "access plus 10 years"
  ExpiresByType image/png                     "access plus 10 years"
  ExpiresByType application/javascript        "access plus 1 month"
  ExpiresByType text/css                      "access plus 1 month"
</IfModule>
```

### Testing Clean URLs

1. **Client-side:** 
   - JavaScript at bottom of each page handles cosmetic URL rewriting
   - Address bar shows clean URL (e.g., `/donations` instead of `/donations.html`)

2. **Server-side:**
   - `.htaccess` rewrites clean URLs to actual `.html` files
   - Prevents 404 errors on direct visits

3. **Test Steps:**
   ```bash
   # Test Donations page
   curl -I https://sfmw.co.za/donations
   # Should return 200 OK (not 404)
   
   # Test Pledge page
   curl -I https://sfmw.co.za/pledge
   # Should return 200 OK
   ```

---

## 📱 MOBILE TESTING CHECKLIST

- [ ] **Apple Pay** test on iPhone/iPad (requires HTTPS + verified domain)
- [ ] **Google Pay** test on Android device
- [ ] **Email shortcuts** work on mobile
- [ ] **Preset amount buttons** tap correctly
- [ ] **Form validation** messages display properly
- [ ] **Card field** accepts input correctly
- [ ] **Services schedule** sidebar responsive on mobile
- [ ] **Animations** play smoothly without lag
- [ ] **Color contrast** meets WCAG accessibility standards

### Apple Pay Testing Requirements

1. **Device:** iPhone/iPad with Face ID or Touch ID
2. **Browser:** Safari (not Chrome)
3. **Server:** Must be HTTPS with valid SSL certificate
4. **Domain Verification:** `.well-known/apple-developer-merchantid-domain-association` must exist
5. **Merchant ID:** Must be registered with Apple's developer account

---

## 🚨 COMMON ISSUES & TROUBLESHOOTING

### Issue: Apple Pay Not Appearing

**Cause:** Domain not verified or HTTPS not valid

**Solution:**
1. Verify `.well-known` file is accessible: `https://sfmw.co.za/.well-known/apple-developer-merchantid-domain-association`
2. Check PayFast dashboard shows ✅ Verified
3. Clear browser cache and try again
4. Test on real iPhone (not Safari simulator)

### Issue: Card Number Not Formatting

**Cause:** JavaScript validation preventing input

**Solution:**
```javascript
// Ensure input maxlength is set
<input type="text" id="pledgeCardNumber" maxlength="23">

// Check no other scripts interfering
console.log('Card input events:', element.getEventListeners(cardInput));
```

### Issue: IPN/Webhook Not Firing

**Cause:** URL not accessible or signature not matching

**Solution:**
1. Check firewall allows PayFast IPs
2. Verify webhook URL is HTTPS and public
3. Test from PayFast dashboard: Settings → Send Test IPN
4. Check server logs for incoming requests

### Issue: Recurring Pledge Not Processing

**Cause:** Missing mandate creation or incorrect frequency mapping

**Solution:**
- PayFast: Ensure `billing_date` and `email` included in request
- Stripe: Create SCA-confirmed SetupIntent before subscription
- Map frequency: `weekly` → weekly, `monthly` → monthly, etc.

---

## 📝 DATABASE SCHEMA EXAMPLE

```sql
CREATE TABLE donations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  donor_type ENUM('personal', 'organization'),
  giving_type VARCHAR(50),
  payment_method VARCHAR(50),
  payment_id VARCHAR(255) UNIQUE,
  gateway ENUM('payfast', 'stripe'),
  status ENUM('pending', 'completed', 'failed'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX email_idx (email),
  INDEX payment_id_idx (payment_id)
);

CREATE TABLE pledges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  frequency ENUM('weekly', 'monthly', 'quarterly', 'annually'),
  status ENUM('active', 'paused', 'cancelled'),
  next_payment_date DATE,
  mandate_id VARCHAR(255),
  subscription_id VARCHAR(255),
  gateway ENUM('payfast', 'stripe'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX email_idx (email),
  INDEX subscription_id_idx (subscription_id)
);
```

---

## 📞 SUPPORT CONTACTS

- **PayFast Support:** https://www.payfast.co.za/help
- **Stripe Support:** https://support.stripe.com/
- **Church Email:** finance@stfrancischmw.org

---

## ✅ FINAL IMPLEMENTATION CHECKLIST

- [ ] Gateway account created and verified
- [ ] API credentials generated and stored in `.env`
- [ ] Test mode enabled for development
- [ ] IPN/Webhook configured
- [ ] Return/Cancel URLs configured
- [ ] Domain verified (Apple Pay)
- [ ] Email sending configured
- [ ] Database schema created
- [ ] `.htaccess` clean URLs configured
- [ ] All payment methods tested locally
- [ ] Mobile payment tested on real devices
- [ ] 404 errors monitored for dead links
- [ ] Production migration plan ready

---

**Next Step:** Contact PayFast Support for non-profit verification if applicable, or proceed with individual merchant account.

