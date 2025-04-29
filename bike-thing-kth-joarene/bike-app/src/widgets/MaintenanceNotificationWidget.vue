<template>
  <v-card class="maintenance-alert" v-if="lowHealthComponents.length > 0" elevation="4">
    <!-- Title -->
    <v-card-title class="alert-title">
      <v-icon color="warning" size="large" class="me-2">mdi-alert-circle</v-icon>
      Maintenance Needed
    </v-card-title>

    <!-- Subtitle -->
    <v-card-subtitle class="alert-subtitle">
      {{ lowHealthComponents.length }} component{{ lowHealthComponents.length > 1 ? 's' : '' }} require your attention
    </v-card-subtitle>

    <v-divider class="my-3"></v-divider>

    <!-- Component list -->
    <v-card-text class="maintenance-list-wrapper">
      <v-list density="comfortable">
        <v-list-item
          v-for="(component, index) in lowHealthComponents"
          :key="index"
          class="maintenance-item"
        >
          <!-- Icon -->
          <template v-slot:prepend>
            <v-avatar color="error" size="36" class="me-3">
              <v-icon>mdi-wrench</v-icon>
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
    }
  },
  computed: {
    // Filter components with < 20% health
    lowHealthComponents() {
      return this.bikeComponents.filter(component => {
        return this.calculateHealth(component) < 20 && component.inUse;
      });
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

.maintenance-item {
  align-items: flex-start;
  padding: 12px 0;
}

.item-details {
  flex: 1;
  overflow: hidden;
}

.component-title {
  font-weight: 600;
  font-size: 1rem;
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
