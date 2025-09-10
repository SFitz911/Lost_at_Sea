# Lost at Sea - Troubleshooting Guide

This guide documents common issues encountered during setup and their solutions.

## Common Setup Issues

### Issue 1: "SyntaxError: Identifier 'CONFIG' has already been declared"

**Symptoms:**
- Red errors in browser console
- Multiple "CONFIG already declared" messages
- Scripts loading multiple times

**Cause:**
- Scripts loading in wrong order
- Browser caching old files
- Duplicate script tags

**Solution:**
1. Ensure correct script order in `index.html`:
```html
<!-- Load in this exact order -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src=".env.js"></script>
<script src="src/js/config.js"></script>
<script src="src/js/api.js"></script>
<script src="src/js/drift.js"></script>
<script src="src/js/app.js"></script>
```

2. Clear browser cache (Ctrl+Shift+R or Ctrl+F5)
3. Check for duplicate script tags

### Issue 2: CSS Not Loading - MIME Type Error

**Symptoms:**
- Console error: "Refused to apply style because its MIME type ('text/html') is not a supported stylesheet"
- App appears unstyled (white background, basic text)

**Cause:**
- CSS file missing or corrupted
- Incorrect file path
- Server serving CSS as HTML

**Solution:**
1. Verify `src/css/style.css` file exists
2. Check file path in `index.html`: `<link rel="stylesheet" href="src/css/style.css">`
3. Recreate CSS file if corrupted
4. If using Live Server, restart VS Code

### Issue 3: "Loading..." Never Changes to Real Data

**Symptoms:**
- Current, Wind, Weather all show "Loading..."
- No API data displays
- No console errors

**Cause:**
- API key not configured
- API functions not being called
- Old placeholder functions still in use

**Solution:**
1. Check API key is in `.env.js`:
```javascript
const ENV = {
    OPENWEATHER_API_KEY: 'your-actual-key-here'
};
```

2. Verify config.js references ENV:
```javascript
OPENWEATHER_API_KEY: window.ENV?.OPENWEATHER_API_KEY || 'API_KEY_NOT_FOUND'
```

3. Test API key loading in console:
```javascript
console.log('ENV:', window.ENV);
console.log('CONFIG:', CONFIG);
```

4. Update `calculateDrift()` function in `app.js` with working version

### Issue 4: Map Not Displaying

**Symptoms:**
- Empty gray area where map should be
- Console errors about Leaflet

**Cause:**
- Leaflet CSS/JS not loading
- Internet connection issues
- Map container styling problems

**Solution:**
1. Check internet connection
2. Verify Leaflet CDN links in `index.html`
3. Check map container has proper styling:
```css
#map {
    height: 400px;
    width: 100%;
}
```

### Issue 5: OpenWeatherMap API Errors

**Symptoms:**
- 401 Unauthorized errors
- 429 Rate limit errors
- Invalid API key messages

**Common Causes & Solutions:**

**401 Unauthorized:**
- Invalid API key → Check key in `.env.js`
- API key not activated → Wait up to 2 hours after signup

**429 Rate Limit:**
- Too many requests → Wait and try again
- Free tier limit exceeded → Upgrade plan or wait 24 hours

**403 Forbidden:**
- API key restrictions → Check OpenWeatherMap account settings

### Issue 6: Location Not Detected

**Symptoms:**
- "Getting location..." never changes
- Manual coordinates required

**Cause:**
- Browser blocking location access
- HTTP vs HTTPS issues
- Location services disabled

**Solution:**
1. Check browser permissions for location
2. Use HTTPS or localhost (not file://)
3. Allow location when prompted
4. Try different browser

## File Structure Verification

Your project should look like this:
```
Lost_at_Sea/
├── .env.js                  ← API keys here
├── .gitignore              ← Protects API keys
├── index.html              ← Main app file
├── README.md
├── src/
│   ├── css/
│   │   └── style.css       ← Styling
│   ├── js/
│   │   ├── app.js          ← Main logic
│   │   ├── api.js          ← API calls
│   │   ├── config.js       ← Configuration
│   │   └── drift.js        ← Calculations
│   └── assets/             ← Images/icons
├── docs/                   ← Documentation
└── api-keys/              ← Setup instructions
```

## Step-by-Step Debugging

### 1. Check Browser Console
- Press F12 → Console tab
- Look for red error messages
- Note specific error types

### 2. Verify File Loading
In console, check:
```javascript
// Should show your API key
console.log(window.ENV);

// Should show config object
console.log(CONFIG);

// Should show API class
console.log(APIService);

// Should show drift calculator
console.log(DriftCalculator);
```

### 3. Test API Manually
```javascript
// Test weather API directly
APIService.getWeatherData(30.0298, -95.1082).then(console.log);
```

### 4. Check Network Tab
- F12 → Network tab
- Click "Calculate Drift"
- Look for failed requests (red entries)

## Environment-Specific Issues

### Windows/PowerShell Issues
- Use Git Bash for Unix commands
- File paths use backslashes
- MIME type issues with local files

### VS Code Live Server Issues
- Restart Live Server extension
- Check port conflicts (try different port)
- Disable other extensions temporarily

### Browser-Specific Issues
- **Chrome:** Strict CORS policies for file://
- **Firefox:** Better local file support
- **Safari:** May block some APIs

## Getting Help

If issues persist:

1. **Check Console Errors:** Copy exact error messages
2. **Verify File Contents:** Ensure all files have correct code
3. **Test in Different Browser:** Rules out browser-specific issues
4. **Clear Cache:** Hard refresh (Ctrl+Shift+R)
5. **Check Network:** Verify internet connection

## Success Indicators

When working correctly, you should see:
- Map displays with your location
- "Calculate Drift" shows real weather data
- Console shows successful API calls
- No red errors in console
- Timer counts up when emergency activated

## API Key Security Reminder

- Never commit `.env.js` to version control
- Keep API keys private
- Use `.gitignore` to protect sensitive files
- Regenerate keys if accidentally exposed