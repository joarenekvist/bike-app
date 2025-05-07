<!-- Enhanced Weather Widget with geolocation, seasonal awareness, and cycling recommendations -->

<template>
    <div class="weather-widget-container">
      <v-card 
        class="weather-card" 
        elevation="2" 
        rounded="xl" 
        :class="[timeOfDayClass, seasonClass]"
      >
        <!-- Weather Header -->
        <div class="weather-header">
          <div class="status-indicators">
            <div class="time-indicator">{{ timeOfDayText }}</div>
            <div class="season-indicator">{{ currentSeason }}</div>
          </div>
          <div class="location-row">
            <v-icon size="16" color="white" class="location-icon">mdi-map-marker</v-icon>
            <span class="location-text">{{ locationName || 'Loading location...' }}</span>
          </div>
          <div class="temp-display">
            <span class="temp-value">{{ currentTemp }}</span>
            <span class="temp-unit">°C</span>
          </div>
          <div class="weather-icon-container">
            <v-icon size="48" color="white">{{ weatherIconName }}</v-icon>
          </div>
        </div>
    
        <!-- Weather Details -->
        <div class="weather-details">
          <div class="detail-item">
            <v-icon size="18" color="grey darken-1">mdi-water-percent</v-icon>
            <span>{{ currentRainChance }}% precipitation</span>
          </div>
          <div class="detail-item" v-if="weather && weather.windspeed10m">
            <v-icon size="18" color="grey darken-1">mdi-weather-windy</v-icon>
            <span>{{ weather.windspeed10m[currentIndex] || 0 }} km/h wind</span>
          </div>
          <div class="detail-item">
            <v-icon size="18" color="grey darken-1">mdi-clock-outline</v-icon>
            <span>{{ formattedTime }}</span>
          </div>
        </div>
        
        <!-- Cycling Advice -->
        <div class="advice-container" :class="adviceSeverityClass">
          <div class="advice-content">
            <div class="advice-icon">
              <v-icon :color="adviceIconColor">{{ adviceIconName }}</v-icon>
            </div>
            <div class="advice-text">
              <h3 class="advice-title">{{ adviceTitle }}</h3>
              <p class="advice-description">{{ adviceDescription }}</p>
            </div>
          </div>
        </div>
      </v-card>
    </div>
  </template>
  
  <script>
  import { getWeather } from '@/js/weatherService';
  
  export default {
    name: 'WeatherWidget',
    data() {
      return {
        weather: null,
        currentTemp: null,
        currentRainChance: null,
        currentIndex: 0,
        adviceTitle: '',
        adviceDescription: '',
        adviceIconName: 'mdi-bike',
        adviceIconColor: 'green',
        currentTime: new Date(),
        updateInterval: null,
        weatherIconName: 'mdi-weather-cloudy',
        userLocation: {
          lat: null,
          lng: null
        },
        locationName: '',
        currentSeason: '',
        isLoadingLocation: true
      };
    },
    computed: {
      timeOfDayClass() {
        const hours = this.currentTime.getHours();
        
        if (hours >= 5 && hours < 8) return 'dawn-theme';
        if (hours >= 8 && hours < 12) return 'morning-theme';
        if (hours >= 12 && hours < 17) return 'afternoon-theme';
        if (hours >= 17 && hours < 20) return 'evening-theme';
        return 'night-theme';
      },
      
      seasonClass() {
        // Map season to CSS class for styling
        const seasonMap = {
          'Spring': 'spring-theme',
          'Summer': 'summer-theme',
          'Autumn': 'autumn-theme',
          'Winter': 'winter-theme'
        };
        
        return seasonMap[this.currentSeason] || 'spring-theme';
      },
      
      timeOfDayText() {
        const hours = this.currentTime.getHours();
        
        if (hours >= 5 && hours < 8) return 'Dawn';
        if (hours >= 8 && hours < 12) return 'Morning';
        if (hours >= 12 && hours < 17) return 'Afternoon';
        if (hours >= 17 && hours < 20) return 'Evening';
        return 'Night';
      },
      
      formattedTime() {
        return this.currentTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
      },
      
      adviceSeverityClass() {
        // Maps our advice severity to a CSS class
        const severityMap = {
          'green': 'advice-normal',
          'amber': 'advice-caution',
          'orange': 'advice-warning',
          'red': 'advice-alert',
          'deep-orange': 'advice-alert',
          'blue': 'advice-info',
          'indigo': 'advice-info',
          'deep-purple': 'advice-warning', 
          'blue-grey': 'advice-info'
        };
        
        return severityMap[this.adviceIconColor] || 'advice-normal';
      },
      
      // Calculate if it's getting dark soon
      isDarkSoon() {
        const month = this.currentTime.getMonth();
        const hours = this.currentTime.getHours();
        
        // Rough Stockholm sunset times by month (approximate)
        const sunsetHours = [15, 16, 18, 20, 21, 22, 22, 21, 19, 17, 15, 14][month];
        
        // Return true if within 1 hour of sunset
        return hours === sunsetHours - 1;
      },
      
      // Calculate if it's already dark
      isDarkNow() {
        const month = this.currentTime.getMonth();
        const hours = this.currentTime.getHours();
        
        // Rough sunset times by month (approximate)
        const sunsetHours = [15, 16, 18, 20, 21, 22, 22, 21, 19, 17, 15, 14][month];
        
        // Return true if after sunset
        return hours >= sunsetHours;
      },
      
      // Calculate if it's early morning (before sunrise)
      isEarlyMorning() {
        const month = this.currentTime.getMonth();
        const hours = this.currentTime.getHours();
        
        // Rough sunrise times by month (approximate)
        const sunriseHours = [8, 7, 6, 5, 4, 3, 3, 4, 6, 7, 7, 8][month];
        
        // Return true if before sunrise
        return hours < sunriseHours;
      }
    },
    
    created() {
      // Update time every minute
      this.updateInterval = setInterval(() => {
        this.currentTime = new Date();
        this.setCurrentSeason(); // Update season if needed
        this.setCyclingAdvice(); // Refresh advice based on new time
      }, 60000);
      
      // Set initial season
      this.setCurrentSeason();
    },
    
    beforeUnmount() {
      // Clear interval when component is destroyed
      clearInterval(this.updateInterval);
    },
    
    async mounted() {
      try {
        // Get user's location using browser geolocation API
        await this.getUserLocation();
        
        // Fetch weather data based on location
        if (this.userLocation.lat && this.userLocation.lng) {
          const data = await getWeather(this.userLocation.lat, this.userLocation.lng);

          /* KOMMENTERA BORT FÖR ATT TESTA VÄDER NOT */
          this.weather = data;
          this.weather.temperature = -5;
          this.weather.windspeed10m = [50];
          this.weather.precipitation = 60;
          


          this.$emit('weather-updated', this.weather);
  
          const now = new Date();
          this.currentTime = now;
          
          // Find the current hour's data
          const i = data.time.findIndex(t => {
            const date = new Date(t);
            return (
              date.getHours() === now.getHours() &&
              date.getDate() === now.getDate() &&
              date.getMonth() === now.getMonth() &&
              date.getFullYear() === now.getFullYear()
            );
          });
  
          this.currentIndex = i !== -1 ? i : 0;
          this.currentTemp = Math.round(data.temperature2m[this.currentIndex]);
          this.currentRainChance = data.precipitationProbability[this.currentIndex];
          
          // Set cycling advice based on weather conditions
          this.setCyclingAdvice();
          
          console.log("Fetched weather data:", data);
        } else {
          console.error("Location data unavailable");
          // Fallback to Stockholm if geolocation fails
          this.userLocation = { lat: 59.3294, lng: 18.0687 };
          this.locationName = "Stockholm (default)";
          // Retry fetch with default location
          await this.fetchWeatherData();
        }
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
        this.adviceTitle = "Weather Data Unavailable";
        this.adviceDescription = "Could not retrieve current weather conditions.";
        this.adviceIconName = "mdi-alert";
        this.adviceIconColor = "red";
      }
    },
    methods: {
      async getUserLocation() {
        this.isLoadingLocation = true;
        
        try {
          // Check if geolocation is supported by the browser
          if (navigator.geolocation) {
            return new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  this.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  };
                  
                  // Get location name using Reverse Geocoding
                  await this.getLocationName();
                  
                  this.isLoadingLocation = false;
                  resolve(position);
                },
                (error) => {
                  console.error("Geolocation error:", error);
                  this.isLoadingLocation = false;
                  this.locationName = "Location unavailable";
                  reject(error);
                },
                { timeout: 10000, enableHighAccuracy: true }
              );
            });
          } else {
            console.error("Geolocation is not supported by this browser");
            this.isLoadingLocation = false;
            this.locationName = "Location unavailable";
            return Promise.reject("Geolocation not supported");
          }
        } catch (error) {
          console.error("Error getting location:", error);
          this.isLoadingLocation = false;
          this.locationName = "Location error";
          return Promise.reject(error);
        }
      },
      
      async getLocationName() {
        try {
          // Use Google Maps Geocoding API or similar service
          // Note: You'll need to add your API key for this to work
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.userLocation.lat},${this.userLocation.lng}&key=YOUR_API_KEY_HERE`);
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            // Extract city name from address components
            const addressComponents = data.results[0].address_components;
            let city = '';
            
            for (const component of addressComponents) {
              if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
                city = component.long_name;
                break;
              }
            }
            
            this.locationName = city || data.results[0].formatted_address.split(',')[0];
          } else {
            this.locationName = `${this.userLocation.lat.toFixed(2)}, ${this.userLocation.lng.toFixed(2)}`;
          }
        } catch (error) {
          console.error("Error getting location name:", error);
          this.locationName = `${this.userLocation.lat.toFixed(2)}, ${this.userLocation.lng.toFixed(2)}`;
        }
      },
      
      async fetchWeatherData() {
        try {
          const data = await getWeather(this.userLocation.lat, this.userLocation.lng);

             /* KOMMENTERA BORT FÖR ATT TESTA VÄDER NOT*/
                this.weather = data;
                this.weather.temperature = -5;
                this.weather.windspeed10m = [50];
                this.weather.precipitation = 60;
            

          this.$emit('weather-updated', this.weather);
          
  
          
          const now = new Date();
          
          // Find the current hour's data
          const i = data.time.findIndex(t => {
            const date = new Date(t);
            return (
              date.getHours() === now.getHours() &&
              date.getDate() === now.getDate() &&
              date.getMonth() === now.getMonth() &&
              date.getFullYear() === now.getFullYear()
            );
          });
  
          this.currentIndex = i !== -1 ? i : 0;
          this.currentTemp = Math.round(data.temperature2m[this.currentIndex]);
          this.currentRainChance = data.precipitationProbability[this.currentIndex];
          
          // Set cycling advice based on weather conditions
          this.setCyclingAdvice();
        } catch (error) {
          console.error("Failed to fetch weather data:", error);
        }
      },
      
      setCurrentSeason() {
        const month = this.currentTime.getMonth();
        const day = this.currentTime.getDate();
        
        if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
          this.currentSeason = 'Spring';
        } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 22)) {
          this.currentSeason = 'Summer';
        } else if ((month === 8 && day >= 22) || month === 9 || month === 10 || (month === 11 && day < 21)) {
          this.currentSeason = 'Autumn';
        } else {
          this.currentSeason = 'Winter';
        }
      },
      
      setWeatherIcon() {
        // Set weather icon based on conditions
        if (this.currentRainChance > 80) {
          this.weatherIconName = 'mdi-weather-pouring';
        } else if (this.currentRainChance > 50) {
          this.weatherIconName = 'mdi-weather-rainy';
        } else if (this.currentRainChance > 30) {
          this.weatherIconName = 'mdi-weather-partly-rainy';
        } else if (this.currentTemp > 28) {
          this.weatherIconName = 'mdi-weather-sunny';
        } else if (this.currentTemp < 5) {
          this.weatherIconName = 'mdi-snowflake';
        } else if (this.weather?.windspeed10m && this.weather.windspeed10m[this.currentIndex] > 25) {
          this.weatherIconName = 'mdi-weather-windy';
        } else {
          // Time-based icons
          const hours = this.currentTime.getHours();
          if (hours < 6 || hours >= 20) {
            this.weatherIconName = 'mdi-weather-night';
          } else if (hours >= 17) {
            this.weatherIconName = 'mdi-weather-sunset';
          } else {
            this.weatherIconName = 'mdi-weather-partly-cloudy';
          }
        }
      },
      
      setCyclingAdvice() {
        // Default advice
        let title = 'Good Conditions';
        let description = 'Clear skies and mild wind – perfect weather for a ride!';
        let icon = 'mdi-bike';
        let color = 'green';
        
        const rainChance = this.currentRainChance;
        const temp = this.currentTemp;
        const windSpeed = this.weather?.windspeed10m ? this.weather.windspeed10m[this.currentIndex] : 0;
        
        // Update weather icon based on conditions
        this.setWeatherIcon();
        
        // Check for severe conditions first
        if (rainChance > 80) {
          title = 'Heavy Rain Alert';
          description = 'Heavy rain incoming – consider postponing or planning a shorter route.';
          icon = 'mdi-weather-pouring';
          color = 'red';
        } else if (rainChance > 50) {
          title = 'Rain Expected';
          description = 'Rain expected – bring waterproof gear or delay your ride.';
          icon = 'mdi-weather-rainy';
          color = 'orange';
        } else if (rainChance > 30) {
          title = 'Light Rain Possible';
          description = 'Light rain possible – roads may get slippery.';
          icon = 'mdi-weather-partly-rainy';
          color = 'amber';
        } else if (temp > 30) {
          title = 'Heat Alert';
          description = 'Heat alert – stay hydrated and avoid peak midday hours.';
          icon = 'mdi-thermometer';
          color = 'deep-orange';
        } else if (temp < 5) {
          title = 'Cold Weather';
          description = 'Cold weather ahead – layer up and check tire pressure.';
          icon = 'mdi-snowflake';
          color = 'blue';
        } else if (windSpeed > 25) {
          title = 'Strong Winds';
          description = 'Strong winds above 25 km/h – your ride may be more strenuous.';
          icon = 'mdi-weather-windy';
          color = 'blue-grey';
        }
        
        // Season-specific advice
        if (color === 'green') { // Only add seasonal advice if no severe weather warnings
          if (this.currentSeason === 'Spring') {
            description += ' Watch for puddles and seasonal road debris as winter thaws.';
          } else if (this.currentSeason === 'Summer') {
            if (temp > 25) {
              title = 'Summer Heat';
              description = 'Stay hydrated and consider riding during cooler hours. Apply sunscreen.';
              icon = 'mdi-white-balance-sunny';
              color = 'amber';
            }
          } else if (this.currentSeason === 'Autumn') {
            description += ' Beware of slippery fallen leaves and earlier sunset times.';
          } else if (this.currentSeason === 'Winter') {
            if (temp < 10) {
              title = 'Winter Cycling';
              description = 'Dress in layers, use appropriate tires, and be cautious of ice on roads.';
              icon = 'mdi-snowflake';
              color = 'blue';
            }
          }
        }
        
        // Time-based advice overrides or additions
        // Early morning
        if (this.currentTime.getHours() >= 4 && this.currentTime.getHours() < 8) {
          if (color === 'green') { // Only override if no severe weather warnings
            title = 'Early Morning Ride';
            description = 'Good morning! Roads are less busy but temperatures may be cooler. Dress in layers.';
            icon = 'mdi-weather-sunset-up';
            color = 'indigo';
          }
          
          // Add visibility recommendation for early morning
          if (temp < 10) {
            description += ' Watch for frost on roads in shaded areas.';
          }
        }
        
        // Night riding
        if (this.currentTime.getHours() >= 20 || this.currentTime.getHours() < 4) {
          title = 'Night Riding Caution';
          description = 'Ensure you have bright front and rear lights, and wear reflective clothing. Visibility is reduced.';
          icon = 'mdi-lightbulb-on';
          color = 'deep-purple';
        }
        
        // Midday heat (summer)
        if (this.currentTime.getHours() >= 11 && this.currentTime.getHours() <= 15 && temp > 25) {
          title = 'Midday Heat';
          description = 'Peak heat hours. Consider riding earlier or later, wear sunscreen, and bring extra water.';
          icon = 'mdi-white-balance-sunny';
          color = 'deep-orange';
        }
        
        // Evening rush hour
        if (this.currentTime.getHours() >= 16 && this.currentTime.getHours() <= 18 && !this.isDarkSoon) {
          // Only show rush hour warning if no severe weather or darkness warning
          if (color === 'green') {
            title = 'Rush Hour Alert';
            description = 'Heavy traffic expected. Consider alternative routes and stay visible.';
            icon = 'mdi-car-multiple';
            color = 'amber';
          }
        }
        
        // Sunset warning
        if (this.isDarkSoon) {
          if (title !== 'Night Riding Caution') { // Don't duplicate night riding advice
            description += ' Sunset approaching soon – make sure you have lights.';
          }
        }
        
        // Already dark
        if (this.isDarkNow) {
          if (title !== 'Night Riding Caution') { // Don't override if already showing night riding advice
            title = 'Night Riding Required';
            description = 'It\'s now dark. Lights and reflective gear are essential for safety.';
            icon = 'mdi-lightbulb-on';
            color = 'deep-purple';
          }
        }
        
        this.adviceTitle = title;
        this.adviceDescription = description;
        this.adviceIconName = icon;
        this.adviceIconColor = color;
      }
    }
  };
  </script>
  
  <style scoped>
  .weather-widget-container {
    width: 100%;
    height: 100%;
    padding: 8px;
  }
  
  .weather-card {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 16px !important;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
  }
  
  .weather-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
  }
  
  /* Weather Header Styles */
  .weather-header {
    padding: 20px;
    color: white;
    position: relative;
    min-height: 140px;
  }
  
  /* Time of day themes */
  .dawn-theme .weather-header {
    background: linear-gradient(135deg, #5f4b8b, #E16B5A);
  }
  
  .morning-theme .weather-header {
    background: linear-gradient(135deg, #2c7fb8, #3a89c9);
  }
  
  .afternoon-theme .weather-header {
    background: linear-gradient(135deg, #4b9cc2, #1c638d);
  }
  
  .evening-theme .weather-header {
    background: linear-gradient(135deg, #5c3d7b, #c8553d);
  }
  
  .night-theme .weather-header {
    background: linear-gradient(135deg, #0f2027, #2c5364);
  }
  
  /* Season modifiers for header themes */
  .spring-theme.morning-theme .weather-header {
    background: linear-gradient(135deg, #2c7fb8, #81c995);
  }
  
  .summer-theme.morning-theme .weather-header {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  .autumn-theme.morning-theme .weather-header {
    background: linear-gradient(135deg, #2c7fb8, #ff7e5f);
  }
  
  .winter-theme.morning-theme .weather-header {
    background: linear-gradient(135deg, #83a4d4, #b6fbff);
  }
  
  .status-indicators {
    display: flex;
    position: absolute;
    top: 16px;
    right: 16px;
    gap: 8px;
  }
  
  .time-indicator, .season-indicator {
    font-size: 14px;
    padding: 4px 12px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(4px);
  }
  
  .season-indicator {
    background-color: rgba(255, 255, 255, 0.15);
  }
  
  .location-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .location-icon {
    margin-right: 4px;
    opacity: 0.9;
  }
  
  .location-text {
    font-size: 15px;
    font-weight: 500;
    opacity: 0.9;
  }
  
  .temp-display {
    font-weight: 600;
    margin-top: 8px;
  }
  
  .temp-value {
    font-size: 42px;
  }
  
  .temp-unit {
    font-size: 24px;
    opacity: 0.8;
    margin-left: 2px;
  }
  
  .weather-icon-container {
    position: absolute;
    right: 20px;
    bottom: 10px;
  }
  
  /* Weather Details Styles */
  .weather-details {
    padding: 16px;
    background-color: white;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .detail-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #555;
  }
  
  /* Advice Section Styles */
  .advice-container {
    padding: 4px 0;
    margin-top: auto;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  
  .advice-content {
    padding: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  
  .advice-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .advice-normal .advice-icon {
    background-color: rgba(76, 175, 80, 0.1);
  }
  
  .advice-caution .advice-icon {
    background-color: rgba(255, 193, 7, 0.1);
  }
  
  .advice-warning .advice-icon {
    background-color: rgba(255, 152, 0, 0.1);
  }
  
  .advice-alert .advice-icon {
    background-color: rgba(244, 67, 54, 0.1);
  }
  
  .advice-info .advice-icon {
    background-color: rgba(33, 150, 243, 0.1);
  }
  
  .advice-text {
    flex: 1;
  }
  
  .advice-title {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #333;
    line-height: 1.3;
  }
  
  .advice-description {
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.4;
  }
  
  /* Different advice styling */
  .advice-normal {
    background-color: rgba(76, 175, 80, 0.05);
  }
  
  .advice-caution {
    background-color: rgba(255, 193, 7, 0.05);
  }
  
  .advice-warning {
    background-color: rgba(255, 152, 0, 0.05);
  }
  
  .advice-alert {
    background-color: rgba(244, 67, 54, 0.05);
  }
  
  .advice-info {
    background-color: rgba(33, 150, 243, 0.05);
  }
  
  /* Seasonal advice styling */
  .spring-theme .advice-normal {
    background-color: rgba(129, 199, 132, 0.05);
  }
  
  .summer-theme .advice-normal {
    background-color: rgba(255, 183, 77, 0.05);
  }
  
  .autumn-theme .advice-normal {
    background-color: rgba(255, 112, 67, 0.05);
  }
  
  .winter-theme .advice-normal {
    background-color: rgba(129, 212, 250, 0.05);
  }
  </style>