// Drift calculation engine for rescue scenarios

class DriftCalculator {
    
    static calculateDriftVector(currentData, windData, timeMinutes, personType = 'person') {
        try {
            console.log('Calculating drift vector for', timeMinutes, 'minutes');
            console.log('Current data:', currentData);
            console.log('Wind data:', windData);
            
            // Convert inputs to standard units
            const currentSpeed = currentData?.current_speed || 0; // knots
            const currentDirection = currentData?.current_direction || 0; // degrees
            const windSpeed = windData?.speed || 0; // mph
            const windDirection = windData?.deg || 0; // degrees
            
            // Drift factors based on what's in the water
            const driftFactors = this.getDriftFactors(personType);
            
            // Calculate current drift component (primary factor)
            const currentDriftDistance = currentSpeed * (timeMinutes / 60) * driftFactors.current; // nautical miles
            
            // Calculate wind drift component (secondary factor for person in water)
            const windSpeedKnots = windSpeed * 0.868976; // Convert mph to knots
            const windDriftDistance = windSpeedKnots * (timeMinutes / 60) * driftFactors.wind; // nautical miles
            
            // Convert to lat/lng displacement
            const currentDrift = this.distanceToLatLng(currentDriftDistance, currentDirection);
            const windDrift = this.distanceToLatLng(windDriftDistance, windDirection);
            
            // Combine drift vectors
            const totalDrift = {
                lat: currentDrift.lat + windDrift.lat,
                lng: currentDrift.lng + windDrift.lng,
                distance: Math.sqrt(Math.pow(currentDrift.lat + windDrift.lat, 2) + Math.pow(currentDrift.lng + windDrift.lng, 2)) * 60, // Convert back to nautical miles
                components: {
                    current: { distance: currentDriftDistance, direction: currentDirection },
                    wind: { distance: windDriftDistance, direction: windDirection }
                }
            };
            
            console.log('Calculated drift vector:', totalDrift);
            return totalDrift;
            
        } catch (error) {
            console.error('Error calculating drift vector:', error);
            return { lat: 0, lng: 0, distance: 0 };
        }
    }
    
    static getDriftFactors(personType) {
        // Different objects drift differently in water
        const factors = {
            'person': {
                current: 0.85,  // Person mostly follows current
                wind: 0.05,     // Minimal wind effect (mostly submerged)
                description: 'Person in water'
            },
            'person_with_pfd': {
                current: 0.80,  // Slightly less current effect
                wind: 0.15,     // More wind effect due to PFD above water
                description: 'Person with life jacket'
            },
            'debris': {
                current: 0.90,  // Debris follows current closely
                wind: 0.25,     // Significant wind effect
                description: 'Floating debris'
            },
            'life_raft': {
                current: 0.60,  // Less current effect
                wind: 0.40,     // High wind effect
                description: 'Life raft'
            }
        };
        
        return factors[personType] || factors['person'];
    }
    
    static distanceToLatLng(distanceNauticalMiles, bearingDegrees) {
        // Convert distance and bearing to lat/lng displacement
        // 1 nautical mile = 1 minute of latitude = 1/60 degree
        
        const bearingRadians = bearingDegrees * Math.PI / 180;
        
        return {
            lat: distanceNauticalMiles * Math.cos(bearingRadians) / 60,
            lng: distanceNauticalMiles * Math.sin(bearingRadians) / 60
        };
    }
    
    static generateSearchArea(incidentPosition, driftVector, timeMinutes, uncertaintyFactor = 1.5) {
        try {
            console.log('Generating search area around', incidentPosition);
            
            // Calculate probable position
            const probablePosition = {
                lat: incidentPosition.lat + driftVector.lat,
                lng: incidentPosition.lng + driftVector.lng
            };
            
            // Calculate search radius based on uncertainty
            const baseRadius = Math.max(driftVector.distance * uncertaintyFactor, 0.5); // Minimum 0.5 nm radius
            
            // Add time-based uncertainty (search area grows with time)
            const timeUncertainty = Math.sqrt(timeMinutes) * 0.1; // Grows with square root of time
            const totalRadius = baseRadius + timeUncertainty;
            
            // Generate search area polygon (circle approximation)
            const searchPolygon = this.generateCirclePolygon(probablePosition, totalRadius);
            
            // Calculate expanded search patterns
            const searchPatterns = this.generateSearchPatterns(probablePosition, totalRadius);
            
            return {
                center: probablePosition,
                radius: totalRadius, // nautical miles
                polygon: searchPolygon,
                patterns: searchPatterns,
                confidence: this.calculateConfidence(timeMinutes, driftVector.distance),
                area: Math.PI * Math.pow(totalRadius, 2) // square nautical miles
            };
            
        } catch (error) {
            console.error('Error generating search area:', error);
            return null;
        }
    }
    
    static generateCirclePolygon(center, radiusNauticalMiles, points = 20) {
        const polygon = [];
        const radiusDegrees = radiusNauticalMiles / 60; // Convert to degrees
        
        for (let i = 0; i < points; i++) {
            const angle = (i * 2 * Math.PI) / points;
            const lat = center.lat + radiusDegrees * Math.cos(angle);
            const lng = center.lng + radiusDegrees * Math.sin(angle);
            polygon.push([lat, lng]);
        }
        
        // Close the polygon
        polygon.push(polygon[0]);
        return polygon;
    }
    
    static generateSearchPatterns(center, radius) {
        // Generate different search patterns for rescue operations
        
        return {
            expanding_square: this.generateExpandingSquarePattern(center, radius),
            sector_search: this.generateSectorPattern(center, radius),
            parallel_track: this.generateParallelTrackPattern(center, radius)
        };
    }
    
    static generateExpandingSquarePattern(center, radius) {
        // Classic expanding square search pattern
        const pattern = [];
        const legs = 8; // Number of legs in the pattern
        const legLength = radius / 2; // Start with smaller legs
        
        let currentPos = { ...center };
        let direction = 0; // Start heading north
        
        for (let i = 0; i < legs; i++) {
            const distance = legLength * (1 + i * 0.5);
            const endPos = this.calculateDestination(currentPos, direction, distance);
            
            pattern.push({
                start: { ...currentPos },
                end: { ...endPos },
                heading: direction,
                distance: distance
            });
            
            currentPos = endPos;
            direction = (direction + 90) % 360; // Turn 90 degrees
        }
        
        return pattern;
    }
    
    static generateSectorPattern(center, radius) {
        // Sector search pattern - good for known drift direction
        const pattern = [];
        const sectors = 6;
        const sectorAngle = 360 / sectors;
        
        for (let i = 0; i < sectors; i++) {
            const angle = i * sectorAngle;
            const outerPoint = this.calculateDestination(center, angle, radius);
            
            pattern.push({
                center: { ...center },
                outer: outerPoint,
                angle: angle,
                sweep: sectorAngle
            });
        }
        
        return pattern;
    }
    
    static generateParallelTrackPattern(center, radius) {
        // Parallel track search pattern
        const pattern = [];
        const trackSpacing = radius / 4; // Distance between parallel tracks
        const trackLength = radius * 2;
        const numTracks = 5;
        
        for (let i = 0; i < numTracks; i++) {
            const offset = (i - Math.floor(numTracks / 2)) * trackSpacing;
            const startPos = this.calculateDestination(center, 270, offset); // West offset
            const endPos = this.calculateDestination(startPos, 90, trackLength); // East track
            
            pattern.push({
                start: startPos,
                end: endPos,
                trackNumber: i + 1
            });
        }
        
        return pattern;
    }
    
    static calculateDestination(start, bearingDegrees, distanceNauticalMiles) {
        // Calculate destination point given start point, bearing, and distance
        const bearingRadians = bearingDegrees * Math.PI / 180;
        const distanceDegrees = distanceNauticalMiles / 60;
        
        return {
            lat: start.lat + distanceDegrees * Math.cos(bearingRadians),
            lng: start.lng + distanceDegrees * Math.sin(bearingRadians)
        };
    }
    
    static calculateConfidence(timeMinutes, driftDistance) {
        // Calculate confidence level in the search area prediction
        // Confidence decreases with time and distance
        
        let confidence = 100;
        
        // Reduce confidence based on time elapsed
        if (timeMinutes > 60) confidence -= (timeMinutes - 60) * 0.5;
        if (timeMinutes > 180) confidence -= (timeMinutes - 180) * 1.0;
        
        // Reduce confidence based on drift distance
        if (driftDistance > 2) confidence -= (driftDistance - 2) * 10;
        
        return Math.max(confidence, 10); // Minimum 10% confidence
    }
    
    static formatSearchAreaReport(incidentPosition, searchArea, timeMinutes, environmentalData) {
        // Generate a formatted report for rescue coordination
        
        const report = {
            incident: {
                position: incidentPosition,
                time: new Date().toISOString(),
                elapsed_minutes: timeMinutes
            },
            search_area: {
                center: searchArea.center,
                radius_nm: searchArea.radius.toFixed(2),
                area_sqnm: searchArea.area.toFixed(2),
                confidence: searchArea.confidence.toFixed(0) + '%'
            },
            environmental: {
                current: environmentalData.current || 'Unknown',
                wind: environmentalData.wind || 'Unknown',
                visibility: environmentalData.visibility || 'Unknown',
                sea_state: environmentalData.seaState || 'Unknown'
            },
            recommendations: this.generateRecommendations(searchArea, timeMinutes, environmentalData)
        };
        
        return report;
    }
    
    static generateRecommendations(searchArea, timeMinutes, environmentalData) {
        const recommendations = [];
        
        // Time-based recommendations
        if (timeMinutes < 30) {
            recommendations.push('URGENT: Search immediately - person likely within initial search radius');
        } else if (timeMinutes < 120) {
            recommendations.push('HIGH PRIORITY: Expand search area - drift significant');
        } else {
            recommendations.push('EXTENDED SEARCH: Large search area required - consider multiple assets');
        }
        
        // Environmental recommendations
        if (environmentalData.wind && environmentalData.wind.speed > 20) {
            recommendations.push('HIGH WINDS: Consider wind drift effects - expand downwind search area');
        }
        
        if (environmentalData.current && environmentalData.current.speed > 1) {
            recommendations.push('STRONG CURRENT: Focus search along current direction');
        }
        
        // Search pattern recommendations
        if (searchArea.radius < 1) {
            recommendations.push('SEARCH PATTERN: Use expanding square pattern');
        } else if (searchArea.radius < 3) {
            recommendations.push('SEARCH PATTERN: Use sector search with multiple assets');
        } else {
            recommendations.push('SEARCH PATTERN: Coordinate multiple parallel track searches');
        }
        
        return recommendations;
    }
}