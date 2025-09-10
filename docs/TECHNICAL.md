# Technical Documentation

## System Requirements
- Modern web browser with JavaScript enabled
- GPS/location services (optional but recommended)
- Internet connection for API data

## APIs Used
- NOAA CO-OPS: Ocean current data
- OpenWeatherMap: Wind and weather data
- HTML5 Geolocation: Position detection

## Drift Calculation Method
- Combines ocean current velocity with wind effects
- Accounts for person-in-water vs floating object drift
- Uses time-based prediction modeling

## Data Sources
- Real-time current measurements from NOAA buoys
- Weather data updated every 10 minutes
- Tidal information where available