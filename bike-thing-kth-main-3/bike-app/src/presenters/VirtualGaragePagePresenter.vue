<template>
  <div>
    <VirtualGaragePage :bikeComponents="getBikeComponents" :user="getUser" :bikes="bikes"
      :selectedBikeId="selectedBikeId" @component-added="componentAdded"
      @component-removed="componentRemoved" @component-updated="componentUpdated" @check-maintenance="checkMaintenance"
      @update-bikeTemplate="updateBikeTemplate" @select-bike="selectBike" @update-nickname="updateBikeNickname" @delete-bike="deleteBike"/>
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

    //
    updateBikeTemplate(bikeInfo) {

      this.$store.dispatch("updateBikeTemplateField", bikeInfo);
    },

    submitNewBike() { //?
      this.$store.dispatch("addBikeFromTemplate");
    },

    selectBike(bikeId) {
      this.$store.dispatch("selectBike", bikeId);

    },
    deleteBike(bikeId) {
      this.$store.dispatch("removeBike", bikeId);
    },
    //
    checkMaintenance() {
      this.$store.dispatch("checkForMaintenance");
    },

    updateBikeNickname(bikeId, newNickname) {
      this.$store.dispatch("updateBikeField", {
        bikeId,
        field: "nickname",
        value: newNickname,
      });
    }


  },


};
</script>