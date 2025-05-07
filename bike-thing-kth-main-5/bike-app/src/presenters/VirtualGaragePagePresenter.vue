<template>
  <div>
    <VirtualGaragePage 
      :bikeComponents="getBikeComponents" 
      :user="getUser" 
      :bikes="bikes"
      :selectedBikeId="selectedBikeId" 
      @component-added="componentAdded"
      @component-removed="componentRemoved" 
      @component-updated="componentUpdated" 
      @check-maintenance="checkMaintenance"
      @update-bikeTemplate="updateBikeTemplate" 
      @select-bike="selectBike" 
      @update-bike-field="updateBikeField" 
      @delete-bike="deleteBike"
    />
  </div>
</template>

<script>
import VirtualGaragePage from "@/components/VirtualGaragePage.vue";
export default {
  name: "VirtualGaragePagePresenter",
  components: {
    VirtualGaragePage,
  },
  computed: {
    getUser() {
      return this.$store.getters.getUser || null;
    },
    getBikeComponents() {
      return this.$store.getters.bikeComponents || [];
    },
    bikes() {
      return this.$store.getters.getBike || [];
    },
    selectedBikeId() {
      return this.$store.getters.getSelectedBikeID || null;
    },
    // New computed properties for component library access
    componentTypes() {
      return this.$store.getters.getComponentTypes || [];
    },
    componentCategories() {
      return this.$store.getters.getComponentCategories || [];
    },
    commonComponentTypes() {
      return this.$store.getters.getCommonComponentTypes || [];
    }
  },
  methods: {
    componentAdded({ bikeId, component }) {
      this.$store.dispatch("addingComponent", { bikeId, component });
      console.log("added component in presenter", bikeId, component);
    },
    componentRemoved({ bikeId, componentIndex }) {
      this.$store.dispatch("removeComponent", { bikeId, componentIndex });
      console.log("removed component(index) in presenter", componentIndex);
    },
    componentUpdated({ bikeId, componentIndex, updatedComponent }) {
      if (bikeId) {
        const updatedBikes = [...this.bikes];
        const bikeToUpdate = updatedBikes.find(bike => bike.id === bikeId);
        if (bikeToUpdate && bikeToUpdate.components && bikeToUpdate.components[componentIndex]) {
          bikeToUpdate.components[componentIndex] = updatedComponent;
          
          // Update the bikes in the store
          this.$store.commit("SET_BIKE_COMPONENTS", updatedBikes);
          this.$store.dispatch("persistBikeComponents");
          // Check for maintenance needs
          this.$store.dispatch("checkForMaintenance");
        } else {
          console.error("Bike or component not found for update");
        }
      } else {
        const updated = [...this.getBikeComponents];
        updated[componentIndex] = updatedComponent;
        this.$store.commit("SET_BIKE_COMPONENTS", updated);
        this.$store.dispatch("persistBikeComponents");
        // Check if any components need maintenance after update
        this.$store.dispatch("checkForMaintenance");
      }
    },
    
    updateBikeTemplate(bikeInfo) {
      this.$store.dispatch("updateBikeTemplateField", bikeInfo);
    },
    
    selectBike(bikeId) {
      this.$store.dispatch("selectBike", bikeId);
    },
    
    updateBikeField({ bikeId, field, value }) {
      this.$store.dispatch("updateBikeField", {
        bikeId,
        field,
        value
      });
    },
    
    deleteBike(bikeId) {
      this.$store.dispatch("removeBike", bikeId);
    },
    
    checkMaintenance() {
      this.$store.dispatch("checkForMaintenance");
    },
    
    // New methods for component library integration
    
    // Get brand options for a component type
    getBrandOptionsForComponent(componentTypeName) {
      return this.$store.dispatch("getBrandOptionsForComponent", componentTypeName);
    },
    
    // Get default lifespan for a component type
    getDefaultLifespanForComponent(componentTypeName) {
      return this.$store.dispatch("getDefaultLifespanForComponent", componentTypeName);
    },
    
    // Create a generic bike
    createGenericBike(bikeInfo) {
      return this.$store.dispatch("createGenericBike", bikeInfo);
    }
  }
};
</script>