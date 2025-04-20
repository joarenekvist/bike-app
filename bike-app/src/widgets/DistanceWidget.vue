<!--This is a dummy widget made for the mockup page initially. I don't expect we will ever use this code.-->
<!--I have kept it still however in case we will ever need it for reference. It uses a vuetify component and Chat GPT CSS.-->

<template>
    <v-card
      class="mx-auto"
      color="surface-light"
      max-width="600"
    >
      <template v-slot:prepend>
        <v-icon
          :color="checking ? 'red lighten-2' : 'indigo-lighten-2'"
          class="me-8"
          icon="mdi-bike-fast"
          size="64"
          @click="takePulse"
        ></v-icon>
      </template>
  
      <template v-slot:title>
        <div class="text-caption text-grey text-uppercase">
          DISTANCE COVERED
        </div>
  
        <span
          class="text-h3 font-weight-black"
          v-text="avg || '130'"
        ></span>
        <strong>KM</strong>
      </template>
  
      <template v-slot:append>
        <v-btn
          class="align-self-start"
          icon="mdi-arrow-right-thick"
          size="34"
          variant="text"
        ></v-btn>
      </template>
  
      <v-sheet color="transparent">
        <div class="text-caption text-grey text-uppercase">
          EQUIVALENT TO:
        </div>
        <div class="transport-item" v-for="(item, index) in transportData" :key="index">
        <v-row align="center">
          <v-col cols="2">
            <v-icon :icon="item.icon" size="32"></v-icon>
          </v-col>
          <v-col cols="10" class="transport-text">
            <span>{{ item.value || '—' }} of {{ item.label }}!</span>
          </v-col>
        </v-row>
      </div>
      </v-sheet>
    </v-card>
  </template>
  <script setup>
 import { ref } from 'vue';

// Sample data for transport (icons and values are placeholders)
const transportData = ref([
  { icon: 'mdi-car', label: 'Gas', value: '50 L' }, // Car
  { icon: 'mdi-molecule-co2', label: 'CO-2', value: '100 kg' } // Plane
]);

</script>

<style scoped>
/* Style for each transport item (icon + text) */
/* Remove space between transport items */
.transport-item {
  margin-bottom: 0; /* No margin between items */
}

/* Ensure the icons are properly aligned */
.v-row {
  align-items: center;
  margin: 0;  /* Remove default margin */
  padding: 0; /* Remove default padding */
}

/* Remove margin/padding from v-col to eliminate spacing */
.v-col {
  padding: 0; /* Remove padding */
}

/* Adjust icon size */
.v-icon {
  color: indigo;
}

/* Make sure text size matches the expected size and align text left */
.transport-text {
  font-size: 1.2rem; /* Same size as text-h3 */
  font-weight: bold;
  text-align: left;
}

/* Remove unnecessary margin on span */
span {
  margin-left: 0px;
}

</style>