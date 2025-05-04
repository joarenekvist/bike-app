<template>
  <div>
    <MaintenancePage
      :bikeComponentsMaintenance="bikeComponentsMaintenance"
      :maintenanceInfo="maintenanceInfo"
      @component-selected="handleComponentSelected"
      @bike-shops-found="handleBikeShopsFound" 
      @check-maintenance="checkMaintenance"
      @record-maintenance="recordMaintenance"
    />
  </div>
</template>

<script>
import MaintenancePage from "@/components/MaintenancePage.vue";
export default {
  name: "MaintenancePagePresenter",
  components: {
    MaintenancePage,
  },
  data() {
    return {
      maintenanceInfo: {},
    };
  },
  computed: {
    // Values from store
    bikeComponentsMaintenance() {
      return this.$store.getters.bikeComponentsMaintenance || [];
    },
    bikes() {
      return this.$store.getters.getBike || [];
    },
    userSettings() {
      return this.$store.getters.getUserSettings || {};
    },
    componentTypes() {
      return this.$store.getters.getComponentTypes || [];
    },
    commonComponentTypes() {
      return this.$store.getters.getCommonComponentTypes || [];
    }
  },
  methods: {
    handleComponentSelected(componentInfo) {
      console.log("Component selected:", componentInfo);
      this.maintenanceInfo = componentInfo;
      // Store selected component in Vuex state
      this.$store.dispatch("setSelectedMaintenanceComponent", componentInfo);
    },
    handleBikeShopsFound(shops) {
      console.log("Bike shops found:", shops);
      this.$store.dispatch("setBikeShops", shops);
    },
    // Method to handle component-specific maintenance view
    viewComponentMaintenance(componentType) {
      // Use the action to find component maintenance info
      const component = this.$store.dispatch("findComponentMaintenanceInfo", componentType);
      if (component) {
        console.log("Found maintenance info for:", componentType);
      } else {
        console.error(`Component type not found in maintenance database: ${componentType}`);
      }
    },
    // Method to trigger maintenance check
    checkMaintenance() {
      this.$store.dispatch("checkForMaintenance");
    },
    // Method to record maintenance for a component
    recordMaintenance({ bikeId, componentIndex, maintenanceRecord, healthPercentage }) {
      // First, get the bike and component
      const bike = this.bikes.find(b => b.id === bikeId);
      if (!bike || !bike.components || !bike.components[componentIndex]) {
        console.error("Could not find component to maintain");
        return;
      }
      
      // Get the current component to update
      const component = bike.components[componentIndex];
      
      // Calculate new mileage based on health restoration
      const currentHealth = this.calculateHealth(component);
      const healthDifference = healthPercentage - currentHealth;
      
      if (healthDifference <= 0) {
        console.log("No health improvement needed");
        return;
      }
      
      // Calculate what percentage of lifespan the restored health represents
      const lifespan = component.health.lifespan;
      const mileageToReduce = (healthDifference / 100) * lifespan;
      
      // Create an updated copy of the component with reduced mileage
      const updatedComponent = JSON.parse(JSON.stringify(component));
      updatedComponent.health.mileage = Math.max(0, component.health.mileage - mileageToReduce);
      
      // Add maintenance history
      if (!updatedComponent.maintenanceHistory) {
        updatedComponent.maintenanceHistory = [];
      }
      updatedComponent.maintenanceHistory.push(maintenanceRecord);
      
      // Update the component in the store
      this.$store.dispatch("componentUpdated", {
        bikeId: bikeId,
        componentIndex: componentIndex,
        updatedComponent: updatedComponent
      });
      
      // Refresh maintenance needs list
      this.checkMaintenance();
    },
    // Helper method to calculate component health
    calculateHealth(component) {
      const mileage = component?.health?.mileage ?? 0;
      const lifespan = component?.health?.lifespan ?? 1000;
      return Math.max(0, Math.round(((lifespan - mileage) / lifespan) * 100));
    }
  },
  created() {
    // Check for components needing maintenance when the page loads
    this.checkMaintenance();
    
    // Check for URL parameters for direct navigation
    const urlParams = new URLSearchParams(window.location.search);
    const componentParam = urlParams.get('component');
    if (componentParam) {
      this.viewComponentMaintenance(componentParam);
    }
  },
};
</script>