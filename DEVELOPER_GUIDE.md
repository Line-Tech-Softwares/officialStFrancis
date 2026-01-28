# St. Francis Church Website - Quick Reference Guide

## 🚀 Quick Start for Developers

### **File Structure Overview**
```
st-francis-church/
├── index.html                          # Homepage
├── about.html                          # About Us
├── structure.html                      # Organization
├── ministries.html                     # 12 Ministries
├── services.html                       # Worship & Sacraments
├── donations.html                      # Give / Support
├── contact.html                        # Contact & Forms
│
├── css/
│   ├── variables.css                   # Design tokens & CSS variables
│   ├── style.css                       # Global styles, typography, utilities
│   └── components/
│       ├── header.css                  # Navigation & sticky header
│       ├── hamburger.css               # Mobile menu (NEW)
│       ├── footer.css                  # Footer layout
│       ├── hero.css                    # Full-width hero sections
│       ├── cards.css                   # Ministry & content cards
│       └── forms.css                   # Form styling (UPDATED)
│
├── js/
│   ├── main.js                         # Core functionality
│   ├── forms.js                        # Form validation (ENHANCED)
│   ├── security.js                     # Security helpers (NEW)
│   └── vpn_pig.js                      # Griffin geo-detection (NEW)
│
├── images/
│   ├── pastors/                        # Leadership photos
│   └── [other images]
│
├── assets/
│   ├── fonts/                          # Custom fonts
│   └── icons/                          # Icon files
│
├── REFINEMENTS_SUMMARY.md              # Detailed changes (NEW)
├── IMAGE_MANAGEMENT_GUIDE.md           # Image best practices (NEW)
└── README.md                           # Project overview
```

---

## 🎯 Key Features & Technologies

| Feature | Technology | Status |
|---------|-----------|--------|
| **Responsive Design** | CSS Media Queries | ✅ Production |
| **Mobile Menu** | HTML5 + CSS3 + SVG | ✅ Enhanced |
| **Form Validation** | Vanilla JavaScript ES6+ | ✅ Enhanced |
| **Email Validation** | Gmail-only regex | ✅ Strict |
| **Phone Validation** | South African format | ✅ Strict |
| **Rate Limiting** | SessionStorage | ✅ Client-side |
| **Security** | Input sanitization | ✅ Client-side |
| **Geo-Blocking** | IP geolocation API | ✅ Client-side |
| **iOS Fixes** | Touch events + CSS | ✅ Implemented |
| **iOS Gloss Effect** | CSS @supports + JS | ✅ Implemented |

---

## 🔧 Development Workflow

### **Making Changes to CSS**

1. **Edit component CSS**:
   ```bash
   # For forms
   css/components/forms.css
   
   # For hamburger menu
   css/components/hamburger.css
   
   # For global styles
   css/style.css or css/variables.css
   ```

2. **Use CSS Variables** (defined in `css/variables.css`):
   ```css
   color: var(--color-primary);              /* Navy #003366 */
   background: var(--color-gold);            /* Gold #D4AF37 */
   padding: var(--spacing-md);               /* 1rem */
   border-radius: var(--radius-md);          /* 8px */
   transition: all 0.4s cubic-bezier(...);   /* Smooth easing */
   ```

3. **Test Responsiveness**:
   - Desktop: Full size
   - Tablet: 768px width
   - Mobile: 375px width
   - Test hamburger menu at ≤768px

### **Making Changes to Forms**

1. **Update Validation** (in `js/forms.js`):
   ```javascript
   // Add new validation method to FormValidator class
   validateNewField(field) {
       const value = field.value.trim();
       if (/* validation logic */) {
           this.setError(field, "Error message");
           return false;
       }
       return true;
   }
   ```

2. **Update HTML Form**:
   ```html
   <form id="myForm">
       <input type="email" name="email" required>
       <button type="submit">Submit</button>
   </form>
   ```

3. **Initialize in Script**:
   ```javascript
   document.addEventListener('DOMContentLoaded', () => {
       new FormValidator('myForm');
   });
   ```

### **Making Changes to Security**

**⚠️ CRITICAL**: All security changes MUST be:
1. Documented with "NOTE: Client-side measure" comments
2. Include disclaimer about server-side requirements
3. Log activities to console (not user-facing)
4. Include clear error messages for users

---

## 🛡️ Security Checklist for Deployment

### **Client-Side (Already Implemented)**:
- ✅ Input sanitization via `security.js`
- ✅ Rate limiting via `sessionStorage`
- ✅ Email validation (Gmail-only)
- ✅ Phone validation (SA format)
- ✅ Suspicious pattern detection
- ✅ Geo-blocking simulation (Griffin)

### **Server-Side (TODO)**:
- [ ] HTTPS/SSL certificate
- [ ] Backend email verification
- [ ] Backend phone OTP
- [ ] Server-side rate limiting
- [ ] Cloudflare firewall rules
- [ ] Backend IP geolocation
- [ ] Database encryption
- [ ] Parameterized SQL queries
- [ ] CSRF token validation
- [ ] Web Application Firewall (WAF)

---

## 📱 Mobile-Specific Fixes

### **iOS Form Zoom Prevention**:
```css
@media (max-width: 768px) {
    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="number"],
    textarea,
    select {
        font-size: 16px !important; /* Critical */
    }
    
    input, textarea, select, button {
        touch-action: manipulation;
    }
}
```

### **Viewport Meta Tag** (all pages):
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
    maximum-scale=5.0, user-scalable=yes">
```

---

## 🎨 Color Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Navy | `#003366` | Headings, primary text, button backgrounds |
| Spiritual Gold | `#D4AF37` | Accents, borders, hover states |
| Bright Gold | `#F4C430` | Button hover state |
| Warm Cream | `#fcfaf6` | Section backgrounds |
| Off-White | `#fafafa` | Form containers |
| Charcoal | `#333333` | Body text |
| Light Gray | `#888` | Placeholder text |
| Success Green | `#28a745` | Success messages |
| Error Red | `#dc3545` | Error messages |

---

## 📊 Form Validation Rules

### **Email**:
- Format: `user@gmail.com` (Gmail only)
- Reject: Yahoo, Outlook, business emails
- Reason: Yahoo has history of security breaches

### **Phone** (Optional):
- Format: `+27 12 345 6789` or `071 234 5678`
- Region: South Africa only
- Min length: 10 digits (excluding + and formatting)

### **Rate Limiting**:
- Max 3 attempts per form
- Lockout: 5 minutes (300,000ms)
- Storage: `sessionStorage`
- Counter key: `form_attempts_${formId}`

---

## 🧪 Testing Checklist

### **Before Deployment**:
- [ ] All forms validate correctly
- [ ] Gmail-only email validation works
- [ ] SA phone validation works
- [ ] Rate limiting locks after 3 failures
- [ ] Hamburger menu opens/closes smoothly
- [ ] Mobile responsiveness at 375px, 768px, 1024px
- [ ] iOS form zoom fix prevents zoom
- [ ] iOS 26+ gloss effect applies
- [ ] No console errors in DevTools
- [ ] Security.js initializes (check console)
- [ ] VPN detection works (if outside ZA)
- [ ] All images load and display correctly
- [ ] Alt text present on all images
- [ ] Lazy loading works (Network tab)

### **Cross-Browser Testing**:
- [ ] Chrome (desktop, mobile)
- [ ] Safari (desktop, iOS)
- [ ] Firefox (desktop, mobile)
- [ ] Edge (desktop)
- [ ] Samsung Internet (Android)

---

## 🚨 Common Issues & Solutions

### **Issue**: Form inputs zoom on iOS
**Solution**: Ensure `font-size: 16px !important` in mobile CSS

### **Issue**: Hamburger menu doesn't toggle
**Solution**: Check that `js/main.js` is loaded AFTER `js/security.js`

### **Issue**: Email validation too strict
**Solution**: Modify regex in `forms.js` `validateGmailEmail()` method

### **Issue**: VPN detection blocks legitimate users
**Solution**: Disable Griffin by checking localhost in `vpn_pig.js`

### **Issue**: Form appears bright/harsh
**Solution**: Verify form background is `#fafafa` not `#ffffff`

---

## 📞 Contact & Support

### **For Questions About**:
- **Security Implementation**: See comments in `security.js` and `vpn_pig.js`
- **Form Validation**: See `forms.js` validator methods
- **Styling**: See `css/variables.css` for all design tokens
- **Mobile Issues**: Check `css/components/forms.css` iOS section

### **Important Files to Review**:
1. `REFINEMENTS_SUMMARY.md` - Complete implementation details
2. `IMAGE_MANAGEMENT_GUIDE.md` - Image best practices
3. `js/security.js` - Security implementation notes
4. `js/vpn_pig.js` - Geo-detection implementation notes

---

## 🔄 Update Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-23 | 1.0 | Initial refinements & security enhancements |
| - | - | Softened form backgrounds & improved contrast |
| - | - | Created custom hamburger menu with SVG |
| - | - | Enhanced form validation (Gmail + SA phone) |
| - | - | Implemented rate limiting & security helpers |
| - | - | Fixed iOS form zoom & gloss effect |
| 2026-01-28 | 1.1 | Branding, layout, and UX refinements across pages |
| - | - | Header: dark black (#000000) text for logo, nav links, and menu toggle; gold border-bottom; z-index 1000 for stickiness |
| - | - | Logo: replaced dove icon with scalable Assets/LOGO/st.png site-wide; added `.header__logo-image` with responsive sizing |
| - | - | Mobile menu: top-right scale-in animation; improved interior spacing and dividers; angle-right indicators; icon color tuned; readability improved |
| - | - | Hero: background-size `cover`; centered; no-repeat; removed overlays/filters; fills side-to-side while maintaining quality |
| - | - | Headings: global `h2`/`h3` reset to remove blur and enforce contrast; white `h2` in dark sections |
| - | - | Font Awesome: CDN added to all pages for icon support |
| - | - | Donations: improved verse citation contrast and intro paragraph readability; leveraged forms/cards components |
| - | - | Footer: removed gap above footer (`margin-top: 0`) |
| - | - | Accessibility/JS: maintained `aria-expanded` toggling; active icon rotation; link hover/focus enhancements |

---

## ✨ Production Checklist

- [ ] Review all security.js comments
- [ ] Review all vpn_pig.js comments
- [ ] Set up server-side email verification
- [ ] Set up server-side phone OTP
- [ ] Install SSL/TLS certificate
- [ ] Configure Cloudflare firewall
- [ ] Test all forms end-to-end
- [ ] Review alt text on all images
- [ ] Compress all images
- [ ] Set up error tracking (Sentry)
- [ ] Set up security logging
- [ ] Load test the site
- [ ] Run security audit
- [ ] Get client approval
- [ ] Deploy to production

---

**Last Updated**: 2026-01-28  
**Status**: ✅ Ready for Development  
**Questions?** See REFINEMENTS_SUMMARY.md for detailed documentation
