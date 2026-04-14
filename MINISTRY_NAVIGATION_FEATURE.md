# Ministry Navigation Feature Documentation

**Feature Name:** Ministry Navigation State Tracking  
**Implementation File:** `js/ministry-navigation.js`  
**Feature Developer:** [Mpho Mabjaia](https://github.com/mphomabjaia)  
**Purpose:** Enhance user experience when navigating between ministry detail pages and the ministry listing page

---

## 🎯 What This Feature Does

The Ministry Navigation feature provides intelligent navigation memory and scroll position preservation when users browse individual ministry pages. It ensures seamless navigation back to the ministries list without losing context or scroll position.

### Key Capabilities

1. **Referrer Tracking** - Remembers which page the user came from
2. **Last Ministry Memory** - Stores the last ministry visited by the user
3. **Scroll Position Saving** - Preserves scroll position when returning to ministries list
4. **Back Button Handler** - Smart back navigation with session cleanup
5. **State Object Management** - Uses `mpho_bookmark_this` object to track navigation state

---

## 📋 How It Works

### Navigation Flow

```
User on ministries.html
    ↓
  Click on specific ministry (e.g., choir.html)
    ↓
ministry-navigation.js captures referrer and ministry name
    ↓
  Session storage saves: mpho_referrer_page, mpho_last_ministry, mpho_scroll_position
    ↓
  User views ministry details
    ↓
  User clicks "Back to Ministries" button
    ↓
Navigation restores ministries.html with previous scroll position
    ↓
Session storage cleared (cleanup)
```

### Data Structures

**Main State Object:**
```javascript
window.mpho_bookmark_this = {
    referrer: String,           // Previous page (usually ../ministries.html)
    lastMinistry: String,       // Name of last viewed ministry
    timestamp: Number           // When navigation occurred (Unix timestamp)
}
```

**Session Storage Keys:**
- `mpho_referrer_page` - Where user came from
- `mpho_last_ministry` - Which ministry was last visited
- `mpho_scroll_position` - Y-axis scroll position (pixels)

---

## 🔧 Technical Implementation

### Initialization

```javascript
window.mpho_bookmark_this = {
    referrer: document.referrer || sessionStorage.getItem('mpho_referrer_page') || '../ministries.html',
    lastMinistry: sessionStorage.getItem('mpho_last_ministry') || null,
    timestamp: new Date().getTime()
};
```

**What this does:**
- Checks browser's `document.referrer` first (most reliable)
- Falls back to saved referrer in session storage
- Falls back to default `../ministries.html` if no context found
- Captures current timestamp for debugging

### Ministry Name Capture

```javascript
const ministryTitle = document.querySelector('.ministry__title');
if (ministryTitle) {
    const ministryName = ministryTitle.textContent.trim();
    window.mpho_bookmark_this.lastMinistry = ministryName;
    sessionStorage.setItem('mpho_last_ministry', ministryName);
}
```

Extracts the ministry name from page DOM and stores in both memory and session.

### Scroll Position Preservation

```javascript
// Save scroll position before page unload
window.addEventListener('beforeunload', function() {
    sessionStorage.setItem('mpho_scroll_position', window.scrollY);
});

// Restore scroll position on load
window.addEventListener('load', function() {
    const savedScrollPos = sessionStorage.getItem('mpho_scroll_position');
    if (savedScrollPos) {
        setTimeout(function() {
            window.scrollTo(0, parseInt(savedScrollPos));
        }, 100);
    }
});
```

**Why `setTimeout`?**
- Allows page to fully render before scrolling
- 100ms delay ensures all layout has calculated
- Prevents jank from immediate scroll attempts

### Back Button Handler

```javascript
window.handleMinistryBackButton = function(event) {
    event.preventDefault();
    
    // Clear the bookmark on return
    sessionStorage.removeItem('mpho_referrer_page');
    sessionStorage.removeItem('mpho_last_ministry');
    
    // Navigate back to ministries
    window.location.href = '../ministries.html';
    return false;
};
```

**Used in HTML:**
```html
<a href="../ministries.html" onclick="return handleMinistryBackButton(event)">
    Back to Ministries
</a>
```

---

## 💾 Form Integration

If a ministry form exists, the navigation state is stored:

```javascript
const ministryStateField = document.getElementById('mpho_bookmark_this');
if (ministryStateField) {
    ministryStateField.value = JSON.stringify(window.mpho_bookmark_this);
}
```

**Expected HTML:**
```html
<input type="hidden" id="mpho_bookmark_this" name="navigationState" />
```

---

## ✅ Usage Requirements

### HTML Structure Needed

Each ministry file requires:

1. **Title Element** (for ministry name capture):
```html
<h1 class="ministry__title">Ministry Name</h1>
```

2. **Back Button** (with onclick handler):
```html
<a href="../ministries.html" onclick="return handleMinistryBackButton(event)">
    <i class="fas fa-arrow-left"></i> Back to Ministries
</a>
```

3. **Script Inclusion** (in footer, before closing `</body>`):
```html
<script src="../js/ministry-navigation.js"></script>
```

### Session Storage Cleanup

The script automatically clears session storage when:
- User clicks "Back to Ministries" button
- Session expires (browser tab closed)
- User manually clears browser storage

**Note:** Session storage is NOT persistent across browser sessions (by design) - it's cleared when the browser closes.

---

## 🐛 Debugging

### Check Navigation State

Open browser console on any ministry page:
```javascript
// View current navigation state
console.log(window.mpho_bookmark_this);

// Check session storage
console.log(sessionStorage.getItem('mpho_referrer_page'));
console.log(sessionStorage.getItem('mpho_last_ministry'));
console.log(sessionStorage.getItem('mpho_scroll_position'));
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Scroll not restoring | Page takes too long to render | Increase setTimeout delay to 200-300ms |
| Referrer not captured | Third-party links or external navigation | Falls back to default `../ministries.html` ✓ |
| Session cleared unexpectedly | Browser privacy mode or cache clearing | Add prompt before navigation |
| Back button doesn't work | Incorrect onclick handler | Verify `handleMinistryBackButton` is defined |

---

## 🔄 Integration with Other Scripts

**Compatible with:**
- `ministry-tabs.js` ✅ (No conflicts - handles tab switching independently)
- `ministry-debug.js` ✅ (Provides debugging info about navigation state)
- Header navigation ✅ (Standard link navigation unaffected)

**Potential conflicts:**
- Scripts that override `window.location` (rare)
- Multiple navigation scripts on same page (not present currently)

---

## 📱 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome/Edge | ✅ Full | All features supported |
| Firefox | ✅ Full | All features supported |
| Safari | ✅ Full | All features supported |
| Opera | ✅ Full | All features supported |
| IE 11 | ⚠️ Partial | Session storage works, may need polyfills |

---

## 🎓 Development Notes

**Why Session Storage (not Local Storage)?**
- Session storage is cleared when browser closes
- Appropriate for temporary navigation state
- Prevents stale data in long-term storage
- Better for privacy (not sent to analytics servers)

**Why not use browser history?**
- History API doesn't support scroll position
- Can't reliably detect which page user came from
- Session storage more explicit and testable

**Why JSON.stringify for form field?**
- Allows easy recovery if form submission fails
- Server can log and analyze navigation patterns
- Useful for debugging user navigation flows

---

## 🙏 Credits

**Original Developer:** Mpho Mabjaia  
**Feature Type:** User Experience Enhancement  
**Status:** Production Ready  
**Last Updated:** April 2026

---

## 📞 Support

For questions or issues with the Ministry Navigation feature:
1. Check the Browser Console (F12) for errors
2. Verify session storage has correct keys
3. Confirm ministry file includes back button onclick handler
4. Review .ministry__title element exists in HTML

---

