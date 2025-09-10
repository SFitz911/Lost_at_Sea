// Complete API integration with land detection and wind-only drift calculations

class APIService {
    
    static async getWeatherData(lat, lng) {
        try {
            console.log('Fetching weather data for:', lat, lng);
            
            const apiKey = CONFIG.OPENWEATHER_API_KEY;
            
            if (!apiKey || apiKey === 'API_KEY_NOT_FOUND') {
                console.warn('No API key found, using fallback data');
                return this.getFallbackWeatherData(lat, lng);
            }
            
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=imperial`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Weather API error:', response.status, response.statusText);
                return this.getFallbackWeatherData(lat, lng);
            }
            
            const data = await response.json();
            console.log('Live weather data received:', data);
            
            return {
                success: true,
                wind: {
                    speed: data.wind?.speed || 5,
                    deg: data.wind?.deg || 180
                },
                weather: {
                    description: data.weather?.[0]?.description || 'clear skies',
                    main: data.weather?.[0]?.main || 'Clear'
                },
                main: {
                    temp: data.main?.temp || 75,
                    humidity: data.main?.humidity || 65,
                    pressure: data.main?.pressure || 1013
                },
                visibility: data.visibility || 10000,
                location: data.name || 'Unknown location'
            };
            
        } catch (error) {
            console.error('Weather API fetch error:', error);
            return this.getFallbackWeatherData(lat, lng);
        }
    }
    
    static getFallbackWeatherData(lat, lng) {
        console.log('Using fallback weather data for:', lat, lng);
        
        const isInland = this.isInlandLocation(lat, lng);
        const windSpeed = isInland ? 5 + (Math.random() * 10) : 8 + (Math.random() * 12);
        const windDirection = Math.random() * 360;
        const temperature = 70 + (Math.random() * 20);
        
        return {
            success: false,
            fallback: true,
            wind: {
                speed: Math.round(windSpeed * 10) / 10,
                deg: Math.round(windDirection)
            },
            weather: {
                description: isInland ? 'partly cloudy (inland)' : 'partly cloudy (offshore)',
                main: 'Clouds'
            },
            main: {
                temp: Math.round(temperature),
                humidity: isInland ? 60 : 70,
                pressure: 1015
            },
            visibility: isInland ? 6000 : 8000,
            location: isInland ? 'Inland location (estimated)' : 'Offshore location (estimated)'
        };
    }
    
    static async getCurrentData(lat, lng) {
        try {
            console.log('Analyzing location type for current data:', lat, lng);
            
            // Check if location is inland
            const isInland = this.isInlandLocation(lat, lng);
            
            if (isInland) {
                return this.getInlandCurrentData(lat, lng);
            } else {
                return this.getMarineCurrentData(lat, lng);
            }
            
        } catch (error) {
            console.error('Error fetching current data:', error);
            return this.getMarineCurrentData(lat, lng);
        }
    }
    
    static isInlandLocation(lat, lng) {
        // Enhanced land detection for various regions
        console.log('Checking if location is inland:', lat, lng);
        
        // Houston Metro Area
        if (lat > 29.5 && lat < 30.1 && lng > -95.8 && lng < -95.0) {
            console.log('Detected: Houston metro area (inland)');
            return true;
        }
        
        // Dallas-Fort Worth Area
        if (lat > 32.5 && lat < 33.1 && lng > -97.5 && lng < -96.5) {
            console.log('Detected: Dallas-Fort Worth area (inland)');
            return true;
        }
        
        // Austin Area
        if (lat > 30.1 && lat < 30.5 && lng > -97.9 && lng < -97.5) {
            console.log('Detected: Austin area (inland)');
            return true;
        }
        
        // San Antonio Area
        if (lat > 29.2 && lat < 29.7 && lng > -98.8 && lng < -98.2) {
            console.log('Detected: San Antonio area (inland)');
            return true;
        }
        
        // General inland detection (rough approximation)
        // More than 20 miles from major coastlines
        const distanceFromGulfCoast = this.calculateDistanceFromCoast(lat, lng);
        if (distanceFromGulfCoast > 20) {
            console.log('Detected: Inland location (>20 miles from coast)');
            return true;
        }
        
        console.log('Detected: Coastal/offshore location');
        return false;
    }
    
    static calculateDistanceFromCoast(lat, lng) {
        // Simplified distance calculation from Gulf Coast
        // This is a rough approximation - real implementation would use coastline database
        
        // Gulf of Mexico coastline (approximate)
        const gulfCoastLat = 29.3;
        const gulfCoastLng = -94.8;
        
        // Simple distance calculation in miles (rough)
        const latDiff = lat - gulfCoastLat;
        const lngDiff = lng - gulfCoastLng;
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Convert degrees to miles
        
        return distance;
    }
    
    static getInlandCurrentData(lat, lng) {
        console.log('Generating inland current data (wind-only mode)');
        
        const locationInfo = this.getInlandLocationInfo(lat, lng);
        
        return {
            current_speed: 0.0, // No ocean current on inland locations
            current_direction: 0,
            station: `Inland location - ${locationInfo.description}`,
            confidence: "High (wind-only mode)",
            estimated: true,
            region: locationInfo.region,
            windOnlyMode: true,
            driftType: "Wind-driven surface drift only",
            warnings: [
                "INLAND LOCATION DETECTED",
                "Drift calculations based on wind only",
                "No ocean current effects included",
                "Contact local emergency services for land-based search protocols"
            ]
        };
    }
    
    static getInlandLocationInfo(lat, lng) {
        // Determine specific inland location characteristics
        if (lat > 29.5 && lat < 30.1 && lng > -95.8 && lng < -95.0) {
            return {
                region: "Houston Metro Area",
                description: "Urban inland area with waterways",
                waterType: "Rivers, bayous, urban water features"
            };
        }
        
        if (lat > 32.5 && lat < 33.1 && lng > -97.5 && lng < -96.5) {
            return {
                region: "Dallas-Fort Worth Area", 
                description: "Urban inland area with lakes",
                waterType: "Lakes, rivers, reservoirs"
            };
        }
        
        return {
            region: "Inland Waters",
            description: "Non-coastal location",
            waterType: "Rivers, lakes, or other inland waters"
        };
    }
    
    static getMarineCurrentData(lat, lng) {
        console.log('Generating marine current data for offshore location');
        
        const isGulfCoast = lat > 25 && lat < 32 && lng > -100 && lng < -80;
        const isNearShore = this.calculateDistanceFromCoast(lat, lng) < 10;
        
        let currentSpeed, currentDirection, stationName, confidence;
        
        if (isGulfCoast && isNearShore) {
            // Near Gulf Coast - typical Loop Current influence
            currentSpeed = 0.4 + (Math.random() * 0.8); // 0.4-1.2 knots
            currentDirection = 45 + (Math.random() * 90); // Generally NE direction
            stationName = "Estimated Loop Current (Gulf Coast nearshore)";
            confidence = "Medium";
        } else if (isGulfCoast) {
            // General Gulf of Mexico offshore
            currentSpeed = 0.2 + (Math.random() * 0.6); // 0.2-0.8 knots
            currentDirection = Math.random() * 360;
            stationName = "Estimated Gulf Current (offshore)";
            confidence = "Medium";
        } else {
            // Other marine areas
            currentSpeed = 0.1 + (Math.random() * 0.4);
            currentDirection = Math.random() * 360;
            stationName = "Estimated regional marine current";
            confidence = "Low";
        }
        
        return {
            current_speed: Math.round(currentSpeed * 10) / 10,
            current_direction: Math.round(currentDirection),
            station: stationName,
            confidence: confidence,
            estimated: true,
            region: isGulfCoast ? "Gulf of Mexico" : "Other marine waters",
            windOnlyMode: false,
            driftType: "Combined current and wind drift"
        };
    }
    
    static async getMarineConditions(lat, lng) {
        try {
            console.log('Getting comprehensive conditions for:', lat, lng);
            
            const weather = await this.getWeatherData(lat, lng);
            const current = await this.getCurrentData(lat, lng);
            const isInland = this.isInlandLocation(lat, lng);
            
            return {
                weather: weather,
                current: current,
                isInland: isInland,
                locationType: isInland ? "Inland" : "Marine",
                seaState: this.calculateSeaState(weather.wind.speed),
                visibility: this.formatVisibility(weather.visibility),
                waterTemp: this.estimateWaterTemperature(lat, weather.main.temp, isInland),
                survivability: this.estimateSurvivalTime(lat, weather.main.temp, isInland),
                driftFactors: this.calculateDriftFactors(weather.wind, current),
                safetyWarnings: this.generateSafetyWarnings(weather, current, isInland)
            };
            
        } catch (error) {
            console.error('Error getting marine conditions:', error);
            return null;
        }
    }
    
    static calculateSeaState(windSpeed) {
        // Beaufort scale applicable to both marine and large inland waters
        if (windSpeed < 4) return { code: 0, description: "Calm - Mirror-like surface" };
        if (windSpeed < 7) return { code: 1, description: "Light Air - Ripples, no foam" };
        if (windSpeed < 11) return { code: 2, description: "Light Breeze - Small wavelets" };
        if (windSpeed < 17) return { code: 3, description: "Gentle Breeze - Large wavelets, scattered whitecaps" };
        if (windSpeed < 22) return { code: 4, description: "Moderate Breeze - Small waves, frequent whitecaps" };
        if (windSpeed < 28) return { code: 5, description: "Fresh Breeze - Moderate waves, many whitecaps" };
        if (windSpeed < 34) return { code: 6, description: "Strong Breeze - Large waves, foam crests" };
        return { code: 7, description: "High Wind - Dangerous conditions" };
    }
    
    static formatVisibility(visibilityMeters) {
        const miles = visibilityMeters * 0.000621371;
        if (miles > 6) return `Excellent visibility (${miles.toFixed(1)} miles)`;
        if (miles > 3) return `Good visibility (${miles.toFixed(1)} miles)`;
        if (miles > 1) return `Moderate visibility (${miles.toFixed(1)} miles)`;
        return `Poor visibility (${miles.toFixed(1)} miles)`;
    }
    
    static estimateWaterTemperature(lat, airTemp, isInland = false) {
        if (isInland) {
            // Inland water temperatures more variable, closer to air temperature
            const seasonalFactor = 0.95;
            return Math.round(Math.max(32, Math.min(90, airTemp * seasonalFactor)));
        } else {
            // Marine water temperatures more stable
            const latitudeFactor = Math.cos(Math.abs(lat) * Math.PI / 180);
            const seasonalAdjustment = 0.9;
            const waterTemp = (airTemp * seasonalAdjustment * latitudeFactor) + (latitudeFactor * 5);
            return Math.round(Math.max(50, Math.min(90, waterTemp)));
        }
    }
    
    static estimateSurvivalTime(lat, airTemp, isInland = false) {
        const waterTemp = this.estimateWaterTemperature(lat, airTemp, isInland);
        const locationFactor = isInland ? " (inland waters)" : " (marine waters)";
        
        if (waterTemp < 40) return "15-45 minutes - EXTREME hypothermia risk" + locationFactor;
        if (waterTemp < 50) return "30-90 minutes - HIGH hypothermia risk" + locationFactor;
        if (waterTemp < 60) return "1-6 hours - MODERATE hypothermia risk" + locationFactor;
        if (waterTemp < 70) return "2-40 hours - LOW hypothermia risk" + locationFactor;
        if (waterTemp < 80) return "6+ hours - exhaustion/dehydration risk" + locationFactor;
        return "12+ hours - dehydration primary risk" + locationFactor;
    }
    
    static calculateDriftFactors(wind, current) {
        if (current.windOnlyMode) {
            // Wind-only drift calculation for inland locations
            const windDriftRate = wind.speed * 0.05; // Higher wind effect for inland (5%)
            
            return {
                windEffect: Math.round(windDriftRate * 100) / 100,
                currentEffect: 0.0,
                totalDriftRate: Math.round(windDriftRate * 100) / 100,
                dominantFactor: 'Wind (inland mode)',
                mode: 'Wind-only drift calculation',
                accuracy: 'Limited - wind-driven surface movement only'
            };
        } else {
            // Standard marine drift calculation
            const windDriftRate = wind.speed * 0.03; // 3% of wind speed
            const totalDriftRate = current.current_speed + windDriftRate;
            
            return {
                windEffect: Math.round(windDriftRate * 100) / 100,
                currentEffect: current.current_speed,
                totalDriftRate: Math.round(totalDriftRate * 100) / 100,
                dominantFactor: current.current_speed > windDriftRate ? 'Ocean Current' : 'Wind',
                mode: 'Combined current and wind drift',
                accuracy: 'Standard marine calculation'
            };
        }
    }
    
    static generateSafetyWarnings(weather, current, isInland = false) {
        const warnings = [];
        
        // Location-specific warnings
        if (isInland) {
            warnings.push("INLAND LOCATION: Wind-only drift calculations");
            warnings.push("Contact local emergency services (911) immediately");
            warnings.push("Consider land-based search patterns and protocols");
        } else {
            warnings.push("MARINE LOCATION: Combined current and wind drift");
            warnings.push("Contact Coast Guard (VHF Channel 16) immediately");
        }
        
        // Wind warnings
        if (weather.wind.speed > 25) {
            warnings.push("HIGH WIND WARNING: Dangerous conditions, extreme caution required");
        } else if (weather.wind.speed > 18) {
            warnings.push("MODERATE WIND: Challenging search conditions");
        }
        
        // Current warnings (marine only)
        if (!isInland) {
            if (current.current_speed > 1.5) {
                warnings.push("STRONG CURRENT: Rapid drift expected, expand search area quickly");
            } else if (current.current_speed > 1.0) {
                warnings.push("MODERATE CURRENT: Significant drift factor");
            }
        }
        
        // Visibility warnings
        if (weather.visibility < 2000) {
            warnings.push("POOR VISIBILITY: Search operations severely limited");
        } else if (weather.visibility < 5000) {
            warnings.push("REDUCED VISIBILITY: Search conditions challenging");
        }
        
        // Time-critical warning
        warnings.push("TIME CRITICAL: Begin search operations immediately");
        
        return warnings;
    }
}

console.log('APIService loaded with land detection and wind-only drift capabilities');