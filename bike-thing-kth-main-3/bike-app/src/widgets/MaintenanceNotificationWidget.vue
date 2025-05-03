<template>
  <v-card class="maintenance-alert" v-if="maintenanceByBike.length > 0" elevation="4">
    <!-- Title -->
    <v-card-title class="alert-title">
      <v-icon color="warning" size="large" class="me-2">mdi-alert-circle</v-icon>
      Maintenance Needed
    </v-card-title>

    <!-- Subtitle -->
    <v-card-subtitle class="alert-subtitle">
      {{ totalMaintenanceItems }} component{{ totalMaintenanceItems > 1 ? 's' : '' }} require your attention
    </v-card-subtitle>

    <v-divider class="my-3"></v-divider>

    <!-- Organized by bike -->
    <v-card-text class="maintenance-list-wrapper">
      <div v-for="(bikeInfo, bikeIndex) in maintenanceByBike" :key="bikeIndex" class="bike-section">
        <!-- Bike header -->
        <div class="bike-header">
          <v-icon color="primary" class="me-2">mdi-bike</v-icon>
          <span class="bike-name">{{ bikeInfo.bikeName }}</span>
          <v-chip small outlined color="warning" class="ml-2">
            {{ bikeInfo.components.length }} component{{ bikeInfo.components.length > 1 ? 's' : '' }}
          </v-chip>
        </div>

        <!-- Components for this bike -->
        <v-list density="comfortable">
          <v-list-item
            v-for="(component, index) in bikeInfo.components"
            :key="index"
            class="maintenance-item"
          >
            <!-- Icon -->
            <template v-slot:prepend>
              <v-avatar color="error" size="32" class="me-2">
                <v-icon size="small">mdi-wrench</v-icon>
              </v-avatar>
            </template>

            <!-- Details -->
            <div class="item-details">
              <div class="component-title">{{ component.type }}</div>
              <div class="component-brand">{{ component.brand || 'Unknown brand' }}</div>
              <div class="component-subtitle">{{ calculateHealth(component) }}% health remaining</div>
            </div>

            <!-- Chip -->
            <template v-slot:append>
              <v-chip color="error" variant="flat" size="small">
                Low Health
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
        
        <!-- Divider between bikes (except for the last one) -->
        <v-divider v-if="bikeIndex < maintenanceByBike.length - 1" class="my-3"></v-divider>
      </div>
    </v-card-text>

    <!-- Button -->
    <v-card-actions class="justify-center">
      <v-btn color="warning" variant="flat" class="maintenance-btn" @click="goToMaintenance">
        Go to Maintenance
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'MaintenanceNotificationWidget',
  props: {
    bikeComponents: {
      type: Array,
      required: true
    },
    bikes: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  computed: {
    // Get all low health components
    lowHealthComponents() {
      // First check bikeComponents (for backward compatibility)
      const fromBikeComponents = this.bikeComponents.filter(component => {
        return this.calculateHealth(component) < 20 && component.inUse;
      }).map(component => ({
        ...component,
        bikeId: null // No specific bike ID for these legacy components
      }));
      
      // Then check components from bikes array
      const fromBikes = [];
      this.bikes.forEach(bike => {
        if (bike.components) {
          bike.components.forEach(component => {
            if (this.calculateHealth(component) < 20 && component.inUse) {
              fromBikes.push({
                ...component,
                bikeId: bike.id, // Attach the bike ID to the component
                bikeName: this.getBikeName(bike.id) // Also attach the bike name
              });
            }
          });
        }
      });
      
      // Combine and return unique components
      return [...fromBikeComponents, ...fromBikes];
    },
    
    // Organize components by bike for better display
    maintenanceByBike() {
      const bikeMap = new Map();
      
      // Process all low health components and group by bike
      this.lowHealthComponents.forEach(component => {
        const bikeId = component.bikeId || 'unknown';
        const bikeName = component.bikeName || this.getBikeName(bikeId);
        
        if (!bikeMap.has(bikeId)) {
          bikeMap.set(bikeId, {
            bikeId,
            bikeName,
            components: []
          });
        }
        
        bikeMap.get(bikeId).components.push(component);
      });
      
      // Convert map to array for template rendering
      return Array.from(bikeMap.values());
    },
    
    // Total number of maintenance items
    totalMaintenanceItems() {
      return this.lowHealthComponents.length;
    }
  },
  methods: {
    calculateHealth(component) {
      const mileage = component?.health?.mileage ?? 0;
      const lifespan = component?.health?.lifespan ?? 1000;
      return Math.max(0, Math.round(((lifespan - mileage) / lifespan) * 100));
    },
    goToMaintenance() {
      this.$emit('go-to-maintenance');
    },
    getBikeName(bikeId) {
      if (!bikeId || bikeId === 'unknown') return 'Unknown Bike';
      
      const bike = this.bikes.find(b => b.id === bikeId);
      return bike ? (bike.nickname || `${bike.brand} ${bike.model}` || 'Unnamed Bike') : 'Unknown Bike';
    }
  }
}
</script>

<style scoped>
.maintenance-alert {
  border-left: 6px solid #fb8c00;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fffaf3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.alert-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.3rem;
  color: #e65100;
}

.alert-subtitle {
  font-size: 0.95rem;
  color: #7a7a7a;
  margin-top: 4px;
}

.maintenance-list-wrapper {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.bike-section {
  margin-bottom: 8px;
}

.bike-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 8px;
}

.bike-name {
  font-weight: 600;
  font-size: 1rem;
  color: #424242;
}

.maintenance-item {
  align-items: flex-start;
  padding: 8px 0;
  margin-left: 24px;
}

.item-details {
  flex: 1;
  overflow: hidden;
}

.component-title {
  font-weight: 600;
  font-size: 0.95rem;
  white-space: normal;
  overflow: visible;
  word-break: break-word;
}

.component-brand {
  font-size: 0.85rem;
  color: #888;
  margin-top: 2px;
}

.component-subtitle {
  font-size: 0.85rem;
  color: #555;
  white-space: normal;
  overflow: visible;
  word-break: break-word;
  margin-top: 2px;
}

.maintenance-btn {
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 10px 24px;
}
</style>