<template>
  <div>
  <VirtualGaragePage
  :bikeComponents="getBikeComponents"
  :user="getUser"
  @component-added="componentAdded"
  @component-removed="componentRemoved"
  @component-updated="componentUpdated"
  @check-maintenance="checkMaintenance"
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
    },
    methods: {
      componentAdded(component) {
        this.$store.dispatch("addingComponent", component);
        console.log("added component in presenter", component);
      },
      componentRemoved(component) {
        this.$store.dispatch("removeComponent", component);
        console.log("removed component(index) in presenter", component);
      },
      componentUpdated({ index, updatedComponent }) {
        const updated = [...this.getBikeComponents];
        updated[index] = updatedComponent;
        // Update state via mutation
        this.$store.commit("SET_BIKE_COMPONENTS", updated);
        this.$store.dispatch("persistBikeComponents");
        
        // Check if any components need maintenance after update
        this.$store.dispatch("checkForMaintenance");
      }
    },
      checkMaintenance() {
         this.$store.dispatch("checkForMaintenance");
  }
  };
</script>