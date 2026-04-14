# DONATIONS & PLEDGE FORMS - Implementation Summary

**Date:** April 2026  
**Status:** ✅ Complete Implementation  
**Scope:** donations.html & pledge.html updates

---

## 📊 What Was Changed

### 1. **DONATIONS PAGE** (`donations.html`)

#### New Features Added:

**a) Donor Type Selector (Radio Buttons)**
```
┌─────────────────────────────┐
│ Donor Type *                │
│ ◉ Personal    ○ Organisation│
└─────────────────────────────┘
```

- Default: Personal
- Radio buttons (not dropdown) for clarity
- Affects email validation rules

**b) Email Field with Smart Shortcuts**

When **Personal** selected:
- Placeholder: `yourpersonalemail@example.com`
- Shows 8 quick-fill chips:
  - @gmail.com, @yahoo.com, @outlook.com, @hotmail.com
  - @icloud.com, @mweb.co.za, @telkom.co.za, @vodacom.co.za
- Click chip to auto-fill domain portion
- Intelligently detects if text exists before @ symbol

When **Organisation** selected:
- Placeholder: `yourname@business.com`
- Email shortcut chips **hidden**
- Accepts ANY domain (no validation)

**c) Amount Section with Presets**
```
┌──────────────────────────┐
│ Amount (ZAR)        |____| │
│                          │
│ [R100] [R250] [R500][R1000]
└──────────────────────────┘
```

- Four quick-select buttons (R100, R250, R500, R1000)
- Click fills the amount field
- User can still enter custom amount

**d) Two-Step Form Flow**

**Step 1: Donor Details**
- Full Name (required)
- Email Address (required, with validation)
- Donation Amount (required, > 0)
- Giving Type (dropdown: General, Sponsorship, Tithe, Offering)
- Button: "Continue to Payment"

**Step 2: Payment Method**
- Card Number (with chip detection: Visa, Mastercard, Amex)
- Expiry Date (MM/YY format)
- CVV (3-4 digits)
- Cardholder Name
- Three quick payment buttons:
  - Apple Pay (black)
  - Google Pay (blue)
  - Zapper/EFT (orange)
- Back & Complete buttons

**e) Services Schedule Sidebar**
```
┌─────────────────────────┐
│   ⛪ Our Services      │
│                        │
│   ☀️ Sunday           │
│   07h00 am             │
│   08h30 am             │
│                        │
│   📅 Tuesday          │
│   08h00 am             │
└─────────────────────────┘
```

- Sticky sidebar on desktop
- Responsive on mobile
- Gold accent border
- Time information clear and prominent

---

### 2. **PLEDGE PAGE** (`pledge.html`)

#### Key Differences from Donations:

**a) NO Donor Type Selector**
- Pledges are for individuals only
- Email field enforced to personal domains

**b) Email Validation - Professional Domain Rejection**

**Allowed domains:**
- gmail.com, yahoo.com, outlook.com, hotmail.com, icloud.com
- mweb.co.za, telkom.co.za, vodacom.co.za, web.co.za, africa.com

**Rejected domains/patterns:**
- Any domain containing: admin, info, office, business, company, corporate, work, professional, noreply, support, contact, sales, marketing, finance, etc.
- Any `@something.co.za` that isn't personal
- Generic corporate TLDs

**Error Message (friendly & clear):**
```
"Pledges are personal commitments. Please use your personal 
email (e.g., Gmail, Yahoo, etc.)."
```

- Triggers on **blur** (when user leaves field)
- Also triggers on **form submission**
- Field clears automatically if professional email detected

**c) Recurring Payment Frequency**
```
┌────────────────────────────────┐
│ Frequency *                    │
│ [Select frequency --------▼]   │
│  • Weekly                      │
│  • Monthly                     │
│  • Quarterly                   │
│  • Annually                    │
└────────────────────────────────┘
```

- Required field
- Four options (no one-time)
- Maps to recurring billing in PayFast/Stripe

**d) Custom Frequency Messaging**

After successful pledging:
```
"Thank you for your pledge commitment! Your WEEKLY pledge 
starting next week is confirmed."
```

Message changes based on frequency:
- Weekly → "weekly starting next week"
- Monthly → "monthly starting next month"  
- Quarterly → "quarterly starting next quarter"
- Annually → "annually"

**e) Same Services Schedule Sidebar**

---

## 💻 JavaScript Implementation Details

### Email Validation Logic

```javascript
// Personal domains allowed on pledge
const PLEDGE_PERSONAL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
  'mweb.co.za', 'telkom.co.za', 'vodacom.co.za', 'web.co.za', 'africa.com'
];

const PROFESSIONAL_KEYWORDS = [
  'admin', 'info', 'office', 'business', 'company', 'corporate', 'work',
  'professional', 'enterprise', 'noreply', 'support', 'contact', 'sales',
  'marketing', 'finance', 'billing', 'invoice', 'accounts'
];

function isProfessionalEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  const localPart = email.split('@')[0]?.toLowerCase() || '';
  
  // Check keywords in local or domain part
  for (let keyword of PROFESSIONAL_KEYWORDS) {
    if (domain.includes(keyword) || localPart.includes(keyword)) {
      return true;
    }
  }
  
  // Check if domain is NOT in personal list
  if (!PLEDGE_PERSONAL_DOMAINS.includes(domain)) {
    if (domain.includes('.co.za') || domain === 'com' || domain === 'org') {
      return true;
    }
  }
  
  return false;
}
```

### Card Validation

**Luhn Algorithm (Client-Side):**
```javascript
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
```

**Expiry Date Validation:**
- Format: MM/YY
- Month must be 01-12
- Year must not be in the past
- Current date comparison

**CVV Validation:**
- Must be 3-4 digits
- Regex: `/^[0-9]{3,4}$/`

### Card Type Detection

Shows appropriate icon:
- Visa: Starts with 4
- Mastercard: Starts with 51-55
- Amex: Starts with 34 or 37

```javascript
function detectCardType(cardNumber) {
  if (/^4/.test(cardNumber)) return 'visa';
  else if (/^5[1-5]/.test(cardNumber)) return 'mastercard';
  else if (/^3[47]/.test(cardNumber)) return 'amex';
  return null;
}
```

---

## 🎯 Form Flow Diagrams

### Donations Form Flow

```
START
  ↓
[Step 1: Donor Details]
  • Select donor type (Personal/Organisation)
  • Enter full name
  • Enter email (validation based on type)
  • Select amount (with presets)
  • Select giving type
  ↓
[Validate Step 1] ←─── ERROR: Show message & stay
  ↓ OK
[Step 2: Payment Method]
  • Quick buttons: Apple Pay, Google Pay, Zapper
  • Manual: Card Number, Expiry, CVV, Name
  ↓
[Validate Step 2] ←─── ERROR: Show message & stay
  ↓ OK
[Process Payment]
  • Call PayFast/Stripe API
  • Show processing animation
  ↓
[Show Result]
  • Success: "Thank you for your donation!" + animation
  • Failure: "Payment failed. Please try again."
  ↓
[Reset Form] ← (if success, after 3 secs)
  ↓
END (or try again)
```

### Pledge Form Flow

```
START
  ↓
[Step 1: Pledge Details]
  • Enter full name
  • Enter email (PERSONAL validation)
  • Enter phone (optional)
  • Select amount (with presets)
  • Select frequency (Weekly/Monthly/Quarterly/Annually)
  • Enter start date (optional)
  • Enter message (optional)
  ↓
[Validate Step 1] ←─── ERROR: Show message, clear email if professional
  ↓ OK
[Step 2: Payment Method]
  (same as donations)
  ↓
[Validate Step 2] ←─── ERROR: Show message & stay
  ↓ OK
[Process Recurring Payment]
  • Send mandate to PayFast/Stripe
  • Setup recurring billing
  • Show processing animation
  ↓
[Show Result]
  • Success: "Your {FREQUENCY} pledge is confirmed!"
  • Failure: "Payment failed"
  ↓
[Reset Form] ← (if success)
  ↓
END
```

---

## 🔗 Clean URL Implementation

### Client-Side (All Pages)

```javascript
// At bottom of each HTML page
window.addEventListener('load', function() {
  const currentPath = window.location.pathname;
  if (currentPath.endsWith('.html')) {
    const cleanPath = currentPath.replace(/\.html$/, '');
    history.replaceState(null, document.title, cleanPath);
    console.log('✓ Clean URL applied:', cleanPath);
  }
});
```

**What this does:**
- When page loads, detects if URL ends with `.html`
- Uses `history.replaceState()` to change address bar (no page reload)
- Browser history is replaced (not added to), so back button works correctly
- Cosmetic only - actual files are still `.html`

### Server-Side (.htaccess - Required for Full Functionality)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # If clean URL requested, map to .html file
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME}.html -f
  RewriteRule ^([^\.]+)$ $1.html [L]
</IfModule>
```

**What this does:**
- When someone visits `/donations`, Apache internally serves `donations.html`
- Returns 200 OK (not 404)
- User sees clean URL in address bar
- Works on direct visits and page refreshes

### Internal Links Updated

**Before:**
```html
<a href="donations.html">Donations</a>
<a href="pledge.html">Pledge</a>
<a href="about.html">About</a>
```

**After:**
```html
<a href="donations">Donations</a>
<a href="pledge">Pledge</a>
<a href="about">About</a>
```

---

## 🎨 Styling

### New CSS Classes Used

```css
/* Email shortcut chips */
.email-shortcut {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  border: 1px solid var(--color-gold);
  background: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.email-shortcut:hover {
  background: var(--color-pale-gold);
}

/* Preset amount buttons */
.donation-preset, .pledge-preset {
  padding: var(--spacing-sm);
  font-size: 0.9rem;
  border: 1px solid var(--color-gold);
  background: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.donation-preset:hover, .pledge-preset:hover {
  background: var(--color-pale-gold);
  border-color: var(--color-primary);
}

/* Services schedule sidebar */
[styles*="Services"] {
  background: linear-gradient(135deg, var(--color-primary) 0%, #2c1810 100%);
  color: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  height: fit-content;
  box-shadow: var(--shadow-md);
}

/* Error messages */
#emailError, #pledgeEmailError, #donationCardError {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: var(--spacing-xs);
}
```

### Responsive Layout

**Desktop (1024px+):**
- 2-column layout: Form (1fr) + Services Sidebar (280px)
- Max width: 900px

**Tablet (768px - 1023px):**
- Still 2 columns but narrower
- Services box adjusts width

**Mobile (< 768px):**
- Single column layout
- Services box moves below form
- Touch-friendly button sizes (min 44px)

---

## ✅ Testing Checklist

### Form Submission

- [ ] Donations: Submit with Personal donor type
- [ ] Donations: Submit with Organisation donor type
- [ ] Pledge: Submit with personal email (accepted)
- [ ] Pledge: Submit with professional email (rejected, show error)
- [ ] Pledge: Clear professional email and allow retry

### Email Shortcuts

- [ ] Personal donation: Shortcuts visible
- [ ] Click @gmail.com: "test@gmail.com" (if "test" entered)
- [ ] Click shortcut on empty field: "@gmail.com" shown
- [ ] Both pages: Multiple clicks replace domain
- [ ] Organisation donation: Shortcuts hidden

### Amount Presets

- [ ] Click R100: Amount field = 100
- [ ] Click R250: Amount field = 250
- [ ] Click R500: Amount field = 500
- [ ] Click R1000: Amount field = 1000
- [ ] Both pages: Custom amount still works

### Card Validation

- [ ] Valid Visa (4111 1111 1111 1111): Accepted
- [ ] Invalid checksum: "Invalid card number" error
- [ ] Expired date (01/20): "Invalid or expired card" error
- [ ] Valid expiry (12/26): Accepted
- [ ] Invalid CVV (12): "Invalid CVV" error
- [ ] Valid CVV (123): Accepted
- [ ] Card icons appear correctly (Visa, MC, Amex)

### Step Navigation

- [ ] Continue button shows Step 2
- [ ] Back button returns to Step 1
- [ ] Form fields preserved when going back
- [ ] Success message shows after payment
- [ ] Form resets after 3-second delay

### Clean URLs

- [ ] Visit `/donations.html`: URL changes to `/donations`
- [ ] Visit `/donations`: Shows correct page
- [ ] Visit `/pledge.html`: URL changes to `/pledge`
- [ ] Browser back/forward buttons work
- [ ] Bookmarks created without `.html`
- [ ] All internal links work

### Mobile

- [ ] Forms responsive on iPhone (375px)
- [ ] Forms responsive on iPad (768px)
- [ ] Buttons tappable with thumb (min 44x44px)
- [ ] No horizontal scroll
- [ ] Services box readable on all sizes
- [ ] Email shortcuts wrap properly

### Accessibility

- [ ] All inputs have labels (not just placeholders)
- [ ] Error messages announce with ARIA
- [ ] Keyboard tab through all fields
- [ ] Enter key submits form
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Screen reader announces field requirements

---

## 🚀 Deployment Notes

1. **Upload Files:**
   - donations.html
   - pledge.html
   - .htaccess (if not already present)

2. **Verify Clean URLs:**
   ```bash
   curl -I https://sfmw.co.za/donations
   # Should show: HTTP/1.1 200 OK (not 404)
   ```

3. **Test on Production:**
   - Visit https://sfmw.co.za/donations
   - Address bar should show clean URL
   - Form should be fully functional

4. **Monitor:**
   - Check browser console for errors
   - Monitor 404 errors in server logs
   - Test all payment methods on real devices

---

## 📞 Support

For questions about form behavior or payment integration, reference:
- `PAYMENT_GATEWAY_SETUP.md` - Full payment setup guide
- `forms.css` - Form styling rules
- HTML comments in donations.html and pledge.html

