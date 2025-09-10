// Complete Lost at Sea app with location selection and enhanced drift calculations

class LostAtSeaApp {
    constructor() {
        this.currentPosition = null;
        this.incidentTime = null;
        this.map = null;
        this.elapsedTimer = null;
        this.locationMode = 'live'; // 'live', 'galveston', 'offshore'
        
        // Predefined locations for Houston area
        this.predefinedLocations = {
            galveston: {
                lat: 29.3013,
                lng: -94.7977,
                name: 'Galveston Bay',
                description: 'Large bay connecting to Gulf of Mexico',
                type: 'coastal_bay'
            },
            offshore: {
                lat: 28.8500,
                lng: -94.2000,
                name: 'Gulf of Mexico Offshore',
                description: 'Deep water offshore location',
                type: 'open_ocean'
            }
        };
        
        this.init();
    }
    
    init() {
        console.log('Lost at Sea app initializing with location selection...');
        this.bindEvents();
        this.getCurrentLocation();
        
        // Initialize map after slight delay
        setTimeout(() => {
            this.initializeMap();
        }, 1000);
    }
    
    bindEvents() {
        const mobBtn = document.getElementById('man-overboard-btn');
        const calcBtn = document.getElementById('calculate-btn');
        
        // Emergency and calculation buttons
        if (mobBtn) {
            mobBtn.addEventListener('click', () => this.handleEmergency());
        }
        
        if (calcBtn) {
            calcBtn.addEventListener('click', () => this.calculateDriftWithProgress());
        }
        
        // Location selection buttons
        const liveLocationBtn = document.getElementById('use-live-location');
        const galvestonBtn = document.getElementById('use-galveston-bay');
        const offshoreBtn = document.getElementById('use-gulf-offshore');
        
        if (liveLocationBtn) {
            liveLocationBtn.addEventListener('click', () => this.setLocationMode('live'));
        }
        
        if (galvestonBtn) {
            galvestonBtn.addEventListener('click', () => this.setLocationMode('galveston'));
        }
        
        if (offshoreBtn) {
            offshoreBtn.addEventListener('click', () => this.setLocationMode('offshore'));
        }
        
        console.log('All event listeners bound');
    }
    
    setLocationMode(mode) {
        console.log('Setting location mode to:', mode);
        this.locationMode = mode;
        
        // Update button states
        document.querySelectorAll('.location-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Update position based on selected mode
        switch (mode) {
            case 'live':
                document.getElementById('use-live-location').classList.add('active');
                this.getCurrentLocation();
                this.updateLocationInfo('Using live GPS location');
                break;
                
            case 'galveston':
                document.getElementById('use-galveston-bay').classList.add('active');
                this.setSimulatedLocation('galveston');
                this.updateLocationInfo('Simulating Galveston Bay location (coastal waters)');
                break;
                
            case 'offshore':
                document.getElementById('use-gulf-offshore').classList.add('active');
                this.setSimulatedLocation('offshore');
                this.updateLocationInfo('Simulating Gulf of Mexico offshore location (deep water)');
                break;
        }
    }
    
    setSimulatedLocation(locationKey) {
        const location = this.predefinedLocations[locationKey];
        if (location) {
            this.currentPosition = {
                lat: location.lat,
                lng: location.lng
            };
            
            document.getElementById('location-status').textContent = 
                `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} (${location.name})`;
            
            // Update map if available
            if (this.map) {
                this.updateMapForLocation(location);
            }
            
            console.log('Simulated location set:', location);
        }
    }
    
    updateLocationInfo(text) {
        const infoElement = document.getElementById('location-mode-text');
        if (infoElement) {
            infoElement.textContent = text;
        }
    }
    
    updateMapForLocation(location) {
        // Clear existing markers
        this.map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });
        
        // Add new position marker
        const markerIcon = location.type === 'open_ocean' ? '📍⛵' : '📍🌊';
        
        L.marker([location.lat, location.lng], {
            icon: L.divIcon({
                className: 'current-position-marker',
                html: markerIcon,
                iconSize: [30, 30]
            })
        })
        .addTo(this.map)
        .bindPopup(`${location.name}<br>${location.description}<br>${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`)
        .openPopup();
        
        // Set appropriate zoom level
        const zoomLevel = location.type === 'open_ocean' ? 9 : 11;
        this.map.setView([location.lat, location.lng], zoomLevel);
    }
    
    getCurrentLocation() {
        // Only use live GPS if in live mode
        if (this.locationMode !== 'live') {
            return;
        }
        
        const fallbackCoordinates = this.predefinedLocations.offshore;
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Determine location type for display
                    const isInland = this.isInlandLocation(this.currentPosition.lat, this.currentPosition.lng);
                    const locationMode = isInland ? '(Inland)' : '(Marine)';
                    
                    document.getElementById('location-status').textContent = 
                        `Location: ${this.currentPosition.lat.toFixed(4)}, ${this.currentPosition.lng.toFixed(4)} ${locationMode}`;
                    
                    console.log('Live GPS location acquired:', this.currentPosition, locationMode);
                    
                    // Update map if available
                    if (this.map) {
                        this.updateMapForCurrentPosition();
                    }
                },
                (error) => {
                    // GPS failed, use offshore fallback only if in live mode
                    if (this.locationMode === 'live') {
                        this.currentPosition = {
                            lat: fallbackCoordinates.lat,
                            lng: fallbackCoordinates.lng
                        };
                        document.getElementById('location-status').textContent = 
                            `Location: ${this.currentPosition.lat.toFixed(4)}, ${this.currentPosition.lng.toFixed(4)} (GPS Failed - Using Offshore)`;
                        console.log('GPS failed, using offshore fallback coordinates');
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        } else {
            // No geolocation support
            if (this.locationMode === 'live') {
                this.currentPosition = {
                    lat: fallbackCoordinates.lat,
                    lng: fallbackCoordinates.lng
                };
                document.getElementById('location-status').textContent = 
                    `Location: ${this.currentPosition.lat.toFixed(4)}, ${this.currentPosition.lng.toFixed(4)} (No GPS - Using Offshore)`;
                console.log('Geolocation not supported, using offshore coordinates');
            }
        }
    }
    
    updateMapForCurrentPosition() {
        if (!this.currentPosition) return;
        
        const isInland = this.isInlandLocation(this.currentPosition.lat, this.currentPosition.lng);
        const markerIcon = isInland ? '📍🏠' : '📍⛵';
        
        L.marker([this.currentPosition.lat, this.currentPosition.lng], {
            icon: L.divIcon({
                className: 'current-position-marker',
                html: markerIcon,
                iconSize: [30, 30]
            })
        })
        .addTo(this.map)
        .bindPopup(`Current Position<br>${isInland ? 'Inland Location' : 'Marine Location'}<br>${this.currentPosition.lat.toFixed(4)}, ${this.currentPosition.lng.toFixed(4)}`)
        .openPopup();
        
        this.map.setView([this.currentPosition.lat, this.currentPosition.lng], isInland ? 12 : 10);
    }
    
    isInlandLocation(lat, lng) {
        // Enhanced land detection
        // Houston Metro Area
        if (lat > 29.5 && lat < 30.1 && lng > -95.8 && lng < -95.0) return true;
        // Dallas-Fort Worth Area
        if (lat > 32.5 && lat < 33.1 && lng > -97.5 && lng < -96.5) return true;
        // Austin Area
        if (lat > 30.1 && lat < 30.5 && lng > -97.9 && lng < -97.5) return true;
        // San Antonio Area
        if (lat > 29.2 && lat < 29.7 && lng > -98.8 && lng < -98.2) return true;
        
        // Distance-based check for other areas
        const distanceFromCoast = this.calculateDistanceFromCoast(lat, lng);
        return distanceFromCoast > 15; // More than 15 miles inland
    }
    
    calculateDistanceFromCoast(lat, lng) {
        // Distance from Gulf Coast (simplified)
        const gulfCoastLat = 29.3;
        const gulfCoastLng = -94.8;
        
        const latDiff = lat - gulfCoastLat;
        const lngDiff = lng - gulfCoastLng;
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Convert to miles
    }
    
    initializeMap() {
        try {
            if (typeof L !== 'undefined') {
                // Initialize map with default center
                const mapCenter = [29.0, -94.5]; // Gulf of Mexico
                this.map = L.map('map').setView(mapCenter, 8);
                
                // Use OpenStreetMap tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 18
                }).addTo(this.map);
                
                console.log('Map initialized');
                
                // Add current position marker if available
                if (this.currentPosition) {
                    this.updateMapForCurrentPosition();
                }
            } else {
                console.error('Leaflet not loaded');
            }
        } catch (error) {
            console.error('Map initialization error:', error);
        }
    }
    
    handleEmergency() {
        this.incidentTime = new Date();
        document.getElementById('incident-info').classList.remove('hidden');
        document.getElementById('incident-time').textContent = this.incidentTime.toLocaleTimeString();
        console.log('EMERGENCY: Man overboard at', this.incidentTime);
        
        this.startTimer();
        
        // Auto-start drift calculation after brief delay
        setTimeout(() => {
            this.calculateDriftWithProgress();
        }, 500);
    }
    
    startTimer() {
        // Clear any existing timer
        if (this.elapsedTimer) {
            clearInterval(this.elapsedTimer);
        }
        
        this.elapsedTimer = setInterval(() => {
            if (this.incidentTime) {
                const elapsed = Math.floor((new Date() - this.incidentTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('elapsed-time').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    // Progress bar control methods
    showProgress(text = 'Loading...') {
        const container = document.getElementById('progress-container');
        const textElement = document.getElementById('progress-text');
        const fillElement = document.getElementById('progress-fill');
        
        if (container && textElement && fillElement) {
            container.classList.remove('hidden');
            textElement.textContent = text;
            fillElement.style.width = '0%';
        }
    }
    
    updateProgress(percentage, text = null) {
        const textElement = document.getElementById('progress-text');
        const fillElement = document.getElementById('progress-fill');
        
        if (fillElement) {
            fillElement.style.width = percentage + '%';
        }
        if (text && textElement) {
            textElement.textContent = text;
        }
    }
    
    hideProgress() {
        const container = document.getElementById('progress-container');
        if (container) {
            container.classList.add('hidden');
        }
    }
    
    // Enhanced drift calculation with location selection support
    async calculateDriftWithProgress() {
        console.log('Starting drift calculation with selected location mode:', this.locationMode);
        
        // Ensure we have coordinates
        if (!this.currentPosition) {
            console.error('No position available for calculation');
            alert('Please select a location mode first or allow GPS access.');
            return;
        }
        
        const lat = this.currentPosition.lat;
        const lng = this.currentPosition.lng;
        
        console.log('Using coordinates:', lat, lng);
        
        // Show progress
        this.showProgress('Analyzing location and initializing...');
        this.updateProgress(10);
        
        try {
            // Get weather data
            this.updateProgress(25, 'Fetching weather data from OpenWeatherMap...');
            const weather = await APIService.getWeatherData(lat, lng);
            
            this.updateProgress(45, 'Analyzing location type and currents...');
            const current = await APIService.getCurrentData(lat, lng);
            
            // Get location info for display
            const locationInfo = this.getLocationDisplayInfo();
            
            this.updateProgress(65, 'Processing environmental conditions...');
            
            // Display weather results
            if (weather) {
                const windSpeed = weather.wind?.speed || 0;
                const windDirection = weather.wind?.deg || 0;
                const weatherDesc = weather.weather?.description || 'Unknown';
                const temp = weather.main?.temp || 'Unknown';
                const dataSource = weather.success ? 'Live API' : 'Estimated';
                
                document.getElementById('wind-data').textContent = 
                    `Wind: ${windSpeed.toFixed(1)} mph from ${windDirection}° (${dataSource})`;
                document.getElementById('weather-data').textContent = 
                    `Weather: ${weatherDesc}, ${temp}°F at ${locationInfo.name}`;
            }
            
            // Display current/location results
            if (current) {
                if (current.windOnlyMode) {
                    document.getElementById('current-data').textContent = 
                        `${current.station} - ${current.driftType}`;
                } else {
                    document.getElementById('current-data').textContent = 
                        `Current: ${current.current_speed} knots from ${current.current_direction}° (${current.station})`;
                }
            }
            
            this.updateProgress(80, 'Calculating drift patterns...');
            
            // Enhanced drift calculation
            const timeElapsed = this.incidentTime ? 
                Math.floor((new Date() - this.incidentTime) / 1000 / 60) : 10;
            
            const currentSpeed = current?.current_speed || 0;
            const windSpeed = weather?.wind?.speed || 0;
            
            let currentDrift, windDrift, totalDrift, searchRadius;
            
            if (current.windOnlyMode) {
                // Wind-only calculation for inland locations
                currentDrift = 0;
                windDrift = windSpeed * 0.05 * timeElapsed * 0.0166667;
                totalDrift = windDrift;
                searchRadius = totalDrift * 3.0;
            } else {
                // Marine calculation
                currentDrift = currentSpeed * timeElapsed * 0.0166667;
                windDrift = windSpeed * 0.03 * timeElapsed * 0.0166667;
                totalDrift = currentDrift + windDrift;
                searchRadius = totalDrift * 2.5;
            }
            
            this.updateProgress(95, 'Generating search area and recommendations...');
            
            // Enhanced results display
            const locationMode = current.windOnlyMode ? 'INLAND MODE' : 'MARINE MODE';
            const driftMethod = current.windOnlyMode ? 'Wind-only drift' : 'Combined current + wind drift';
            
            document.getElementById('drift-results').innerHTML = `
                <strong>${locationMode} - ${locationInfo.name}</strong><br>
                Method: ${driftMethod}<br>
                Time elapsed: ${timeElapsed} minutes<br>
                ${current.windOnlyMode ? '' : `Current drift: ${currentDrift.toFixed(2)} nm<br>`}
                Wind drift: ${windDrift.toFixed(2)} nm<br>
                <strong>Total drift: ${totalDrift.toFixed(2)} nautical miles</strong><br>
                <strong>Search radius: ${searchRadius.toFixed(2)} nautical miles</strong><br>
                <strong>Search area: ${(Math.PI * Math.pow(searchRadius, 2)).toFixed(1)} sq nm</strong><br>
                <em>Location: ${locationInfo.description}</em><br>
                <em>Confidence: ${current?.confidence || 'Medium'} - ${weather?.success ? 'Live' : 'Estimated'} data</em>
                ${current.windOnlyMode ? '<br><strong>⚠️ INLAND LOCATION: Contact local emergency services (911)</strong>' : '<br><strong>📻 MARINE LOCATION: Contact Coast Guard (VHF Ch 16)</strong>'}
            `;
            
            // Add visual elements to map
            this.addSearchVisualization(lat, lng, searchRadius, current.windOnlyMode, locationInfo);
            
            this.updateProgress(100, 'Enhanced drift calculation complete!');
            
            // Update status
            const modeInfo = `${locationInfo.name} (${this.locationMode})`;
            document.getElementById('api-status').textContent = 
                `${modeInfo} - ${weather?.success ? 'Live' : 'Est.'} Weather + ${current.estimated ? 'Est.' : 'Live'} Current`;
            
        } catch (error) {
            console.error('Error in drift calculation:', error);
            document.getElementById('drift-results').textContent = 'Error: ' + error.message;
            this.updateProgress(100, 'Error occurred');
            document.getElementById('api-status').textContent = 'Calculation failed';
        }
        
        // Hide progress bar after completion
        setTimeout(() => {
            this.hideProgress();
        }, 2000);
    }
    
    getLocationDisplayInfo() {
        switch (this.locationMode) {
            case 'galveston':
                return this.predefinedLocations.galveston;
            case 'offshore':
                return this.predefinedLocations.offshore;
            default:
                const isInland = this.isInlandLocation(this.currentPosition.lat, this.currentPosition.lng);
                return {
                    name: isInland ? 'Live GPS (Inland)' : 'Live GPS (Marine)',
                    description: isInland ? 'Current inland location' : 'Current marine location',
                    type: isInland ? 'inland' : 'marine'
                };
        }
    }
    
    addSearchVisualization(lat, lng, searchRadius, isWindOnly, locationInfo) {
        if (!this.map) return;
        
        // Clear existing incident markers and circles
        this.map.eachLayer((layer) => {
            if (layer instanceof L.Marker && layer.options.icon && 
                (layer.options.icon.options.html.includes('🚨'))) {
                this.map.removeLayer(layer);
            }
            if (layer instanceof L.Circle) {
                this.map.removeLayer(layer);
            }
        });
        
        // Add incident marker
        const markerIcon = isWindOnly ? '🚨🏠' : '🚨⛵';
        
        L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'mob-marker',
                html: markerIcon,
                iconSize: [40, 40]
            })
        })
        .addTo(this.map)
        .bindPopup(`
            ${locationInfo.name} Incident<br>
            Time: ${this.incidentTime?.toLocaleTimeString() || 'Test Mode'}<br>
            Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}<br>
            Type: ${locationInfo.description}
        `)
        .openPopup();
        
        // Add search area circle
        const circleColor = isWindOnly ? '#ff9900' : '#ff6b6b';
        
        L.circle([lat, lng], {
            radius: searchRadius * 1852, // Convert to meters
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: isWindOnly ? 0.15 : 0.1,
            weight: 2,
            dashArray: isWindOnly ? '5, 5' : null
        }).addTo(this.map);
        
        // Adjust map view
        const zoomLevel = this.locationMode === 'offshore' ? 10 : 12;
        this.map.setView([lat, lng], zoomLevel);
    }
    
    // Method to clear all timers when app is destroyed
    destroy() {
        if (this.elapsedTimer) {
            clearInterval(this.elapsedTimer);
        }
    }
}

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting enhanced Lost at Sea app with location selection...');
    const app = new LostAtSeaApp();
    
    // Make app globally accessible
    window.lostAtSeaApp = app;
    
    console.log('App ready with location selection features');
});