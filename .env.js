// Environment variables - API Keys and sensitive configuration
// Keep this file private and don't commit to version control

const ENV = {
    // OpenWeatherMap API Key
    // Get your free key at: https://openweathermap.org/api
    OPENWEATHER_API_KEY: 'cbbacda8729f5e314ea0b983528a83cd'
};

// Make ENV available globally
window.ENV = ENV;

console.log('Environment variables loaded successfully');