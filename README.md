# API Keys Setup

## Required API Keys

### OpenWeatherMap (Required)
1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Generate API key
4. Copy key to `src/js/config.js`

### NOAA CO-OPS (No key required)
- Public API for ocean current data
- No registration needed

## Setup Instructions
1. Get your OpenWeatherMap API key
2. Open `src/js/config.js`
3. Replace `YOUR_API_KEY_HERE` with your actual key
4. Save file

## Testing
- Open `index.html` in browser
- Check browser console for API connection status

## API Usage Limits
- **OpenWeatherMap Free Tier**: 1,000 calls/day
- **NOAA CO-OPS**: No limit (public service)

## Example API Key Format
Your OpenWeatherMap API key will look like this:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Security Note
Never commit your actual API keys to version control. The config.js file should be added to .gitignore to keep your keys private.
