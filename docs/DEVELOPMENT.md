# Development Guide

## Setup
1. Clone repository
2. Get OpenWeatherMap API key
3. Update config.js with API credentials
4. Open index.html in browser

## Code Structure
- index.html: Main application interface
- src/js/app.js: Core application logic
- src/js/drift.js: Drift calculation algorithms
- src/js/api.js: External API integrations
- src/css/style.css: UI styling

## Adding Features
- Extend DriftCalculator class for new algorithms
- Add API integrations in APIService class
- Update UI in index.html and style.css

## Testing
- Test location services in different browsers
- Verify API connections
- Validate drift calculations against known data