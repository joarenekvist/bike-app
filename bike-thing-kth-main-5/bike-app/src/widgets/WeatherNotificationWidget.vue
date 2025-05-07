<template>
    <v-card
      class="weather-alert"
      :elevation="2"
      rounded="xl"
      @click="toggleMinimize"
      :class="{ minimized: isMinimized }"
    >
      <!-- Minimized View -->
      <template v-if="isMinimized">
        <v-card-title class="minimized-bar">
        <v-icon class="me-2" size="20" color="info">mdi-weather-lightning-rainy</v-icon>
        <span>Weather Alert — Click to Expand</span>
        </v-card-title>

      </template>
  
      <!-- Full View -->
      <template v-else>
        <!-- Header section (styled like WeatherWidget) -->
        <div class="weather-header">
        <div class="header-content">
            <v-icon color="white" size="28" class="header-icon">mdi-weather-lightning-rainy</v-icon>
            <div>
            <div class="alert-title">Weather Alert</div>
            <div class="alert-subtitle">{{ alertSummary }}</div>
            </div>
        </div>
        </div>

  
        <!-- Body -->
        <v-card-text class="weather-alert-details">
          <div
            v-for="(message, index) in alertMessages"
            :key="index"
            class="alert-item"
          >
            <v-icon size="18" color="blue-grey" class="me-2">mdi-alert</v-icon>
            <span>{{ message }}</span>
          </div>
        </v-card-text>
  
        <v-card-actions class="justify-center">
          <v-btn color="info" variant="flat" class="weather-alert-btn" @click.stop="acknowledgeAlert">
            Acknowledge
          </v-btn>
        </v-card-actions>
      </template>
    </v-card>
  </template>
  
  <script>
  export default {
    name: 'WeatherNotificationWidget',
    props: {
      weather: { type: Object, required: true }
    },
    data() {
      return {
        isMinimized: false
      };
    },
    computed: {
      alertMessages() {
        const alerts = [];
        const temp = this.weather?.temperature;
        const wind = this.weather?.windspeed10m?.[0] || 0;
        const rain = this.weather?.precipitation || 0;
  
        if (temp < 0) alerts.push('Freezing temperatures detected.');
        if (temp > 35) alerts.push('Extreme heat — stay hydrated.');
        if (wind > 40) alerts.push('High winds — cycling not advised.');
        if (rain > 50) alerts.push('Heavy precipitation expected.');
  
        return alerts;
      },
      shouldShowAlert() {
        return this.alertMessages.length > 0;
      },
      alertSummary() {
        const count = this.alertMessages.length;
        return count > 1
          ? `${count} weather conditions require your attention`
          : this.alertMessages[0];
      }
    },
    methods: {
      acknowledgeAlert() {
        this.isMinimized = true;
      },
      toggleMinimize() {
        this.isMinimized = !this.isMinimized;
      }
    }
  };
  </script>
  
  <style scoped>
    .weather-alert {
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    }

  
    .weather-header {
    padding: 20px;
    background: linear-gradient(135deg, #1976d2, #42a5f5);
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    color: white;
    }

    .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
    }

    .header-icon {
    flex-shrink: 0;
    }

    .alert-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 4px;
    }

    .alert-subtitle {
    font-size: 0.95rem;
    opacity: 0.9;
    }

  
  .weather-alert-details {
    padding: 16px;
    background-color: white;
    flex-grow: 1;
  }
  
  .alert-item {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: #37474f;
    margin-bottom: 8px;
  }
  
  .weather-alert-btn {
    font-weight: 600;
    text-transform: uppercase;
    padding: 10px 24px;
    margin: 12px auto;
    background-color: #1976d2;
    color: white;
    border-radius: 8px;
  }
  
  /* Minimized */
  .minimized {
  max-height: 60px;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
}



.minimized-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e3f2fd;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  color: #1976d2;
  width: 100%;
  white-space: nowrap;
  gap: 8px;
}


  </style>
  