<!--This is the parking widget seen on the front page of the dashboard. It is made using a vuetify component.-->
<!--It can be imported and used in any view, and expects a value from the model in the shape of a string to be bound to it.-->
<!--If the model contains a "parked" string, it should be bound to this widget like: <ParkingWidget :value="currentParkingStatus"/>  -->

<template>
      <v-card
        class="mx-auto"
        color="surface-light"
        max-width="600"
      >
        <template v-slot:title>
          <div class="text-caption text-grey text-uppercase">
            PARKING STATUS
          </div>
        </template>
  
        <v-sheet color="transparent">
          <!-- Button Toggle with v-model bound to modelValue -->
          <v-btn-toggle
            v-model="localToggle"
            color="primary"
            mandatory
          >
            <v-btn icon="mdi-lock-open" value="Moving"></v-btn>
            <v-btn icon="mdi-lock-check" value="Parked"></v-btn>
          </v-btn-toggle>
          <pre class="pt-2">{{ localToggle }}</pre>
        </v-sheet>
      </v-card>
  </template>
  
  <script>
  export default {
    name: 'ParkingWidget',
    props: {
      // This prop receives the initial value passed to v-model
      modelValue: {
        type: String,
        default: "Parked" // Default value for v-model
      }
    },
    data() {
      return {
        // Local variable to handle the internal toggle state
        localToggle: this.modelValue
      };
    },
    watch: {
      // Watch for changes in the localToggle to update the parent
      localToggle(newValue) {
        this.$emit('update-toggle', newValue); // Emit the updated value
      }
    }
  }
  </script>
  
  <style scoped>
  /* Scoped styles to maintain card-like appearance */
  .v-card {
    margin: 16px auto;
    padding: 16px;
  }
  
  .v-icon {
    color: indigo;
  }
  </style>
  