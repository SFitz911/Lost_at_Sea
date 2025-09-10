// Complete configuration file for Lost at Sea maritime rescue application

const CONFIG = {
    // OpenWeatherMap API key with robust fallback handling
    OPENWEATHER_API_KEY: (function() {
        // Try environment variable first, then fallback to direct key
        if (typeof window !== 'undefined' && window.ENV && window.ENV.OPENWEATHER_API_KEY) {
            return window.ENV.OPENWEATHER_API_KEY;
        }
        // Direct fallback (your actual key)
        return 'cbbacda8729f5e314ea0b983528a83cd';
    })(),
    
    // External API endpoints
    NOAA_CURRENTS_URL: 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter',
    OPENWEATHER_URL: 'https://api.openweathermap.org/data/2.5/weather',
    
    // Maritime rescue calculation parameters
    DEFAULT_SEARCH_TIME: 60, // minutes
    
    // Drift calculation factors based on maritime rescue research
    DRIFT_FACTORS: {
        PERSON_IN_WATER: 0.03,      // 3% of wind speed affects person drift
        PERSON_WITH_PFD: 0.05,      // 5% wind effect with life jacket
        CURRENT_FACTOR: 1.0,        // 100% of current speed
        WIND_FACTOR: 0.8,           // 80% wind effect for objects
        UNCERTAINTY_MULTIPLIER: 2.5  // Search area expansion factor
    },
    
    // Map display settings
    MAP_ZOOM: 12,
    MAP_DEFAULT_CENTER: [29.0000, -94.5000], // Gulf of Mexico offshore
    
    // Visual styling for map elements
    SEARCH_CIRCLE_COLOR: '#ff6b6b',
    SEARCH_CIRCLE_OPACITY: 0.1,
    DRIFT_PATH_COLOR: '#4ecdc4',
    MOB_MARKER_COLOR: '#ff0000',
    
    // Emergency response settings
    EMERGENCY_CONTACTS: {
        US_COAST_GUARD: 'VHF Channel 16',
        EMERGENCY_PHONE: '911',
        MARINE_ASSISTANCE: 'VHF Channel 9'
    },
    
    // API request settings
    API_TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 2,
    
    // Calculation precision
    COORDINATE_PRECISION: 4, // decimal places
    DISTANCE_PRECISION: 2,   // nautical miles
    
    // Safety parameters
    SURVIVAL_TIME_FACTORS: {
        WATER_TEMP_CRITICAL: 40,    // °F - critical hypothermia risk
        WATER_TEMP_MODERATE: 60,    // °F - moderate risk
        VISIBILITY_POOR: 1,         // miles
        WIND_HIGH: 25,              // mph
        CURRENT_STRONG: 1.5         // knots
    },
    
    // Application metadata
    APP_VERSION: '1.0.0',
    BUILD_DATE: '2025-09-10',
    DEVELOPMENT_MODE: true
};

// Validation and logging
if (CONFIG.OPENWEATHER_API_KEY && CONFIG.OPENWEATHER_API_KEY !== 'API_KEY_NOT_FOUND') {
    console.log('✅ CONFIG loaded successfully - API key available');
    console.log('🗺️ Map center:', CONFIG.MAP_DEFAULT_CENTER);
    console.log('🌊 Drift factors configured for maritime rescue operations');
} else {
    console.warn('⚠️ CONFIG loaded but API key missing - will use fallback data');
}

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}