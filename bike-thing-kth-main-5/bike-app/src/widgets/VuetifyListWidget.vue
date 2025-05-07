<!--From: https://vuetifyjs.com/en/components/lists/#shaped-->
<template>
    <v-card class="mx-auto pa-2" max-width="400">
      <v-list>
        <v-list-subheader>My previous routes</v-list-subheader>
  
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :value="item"
          color="primary"
          rounded="shaped"
          @click="sendCoordinatesUpForPolylining(item)"
        >
          <template v-slot:prepend>
            <v-icon :icon="'mdi-flag'"></v-icon>
          </template>
  
          <v-list-item-title v-text="item.date + '; ' + item.startTime + ' ➟ ' + item.endTime"></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </template>
  
  <script>
  export default {
    name: "ReportList",
    props: {
      items: {
        type: Array,
        required: true
      }
    },
    methods: {
        sendCoordinatesUpForPolylining(coords) { //if we passed data with the event in the view, we need to declare the parameter here too.
            console.log('Item in the routes list is clicked on. Sending list of coordinates up. ', coords);
            this.$emit("send-coords-for-polylining", coords); //this is how we call the action in the model as a reaction to the event.
      },
    },
  };
  </script>
  