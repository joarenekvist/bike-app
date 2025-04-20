<template>
    <div class="mapDiv" ref="mapContainer"></div>
    <div class = "routesListContainer">
      <VuetifyListWidget :items = this.dummyItems @send-coords-for-polylining="onSendCoordsForPolylining"></VuetifyListWidget>
    </div>
  </template>
  
  <script>
  import VuetifyListWidget from '@/widgets/VuetifyListWidget.vue';

  /* global google */ // This tells ESLint to chill
  
  export default {
    name: 'RoutesPage',
  
    props: {
      someProp: Object,
    },
    components:{
        VuetifyListWidget,
    },
  
    async mounted() {
      await this.waitForGoogle(); // Wait for the Google Maps script
      await this.initMap();       // Initialize the map
      this.$emit("map-init", this.map); // Optional event
    },
  
    data() {
      return {
        map: null,
        dummyItems: [{date: '2025-04-14', startTime: '10:01', endTime: '15:05', icon: 'mdi-flag', coords: [
  { lat: 59.3293, lng: 18.0686 }, // Central Stockholm
  { lat: 59.3326, lng: 18.0649 }, // Near Hötorget
  { lat: 59.3360, lng: 18.0590 }, // Near Stadsbiblioteket
  { lat: 59.3372, lng: 18.0702 }, // Close to Odenplan
  { lat: 59.3340, lng: 18.0801 }  // Near Humlegården
]},
        {date: '2025-04-12', startTime: '14:01', endTime: '14:32', icon: 'mdi-flag', coords: [
  { lat: 59.3293, lng: 18.0686 }, // Central Stockholm
  { lat: 59.3326, lng: 18.0649 }, // Near Hötorget
  { lat: 59.3360, lng: 18.0590 }, // Near Stadsbiblioteket
  { lat: 59.3372, lng: 18.0702 }, // Close to Odenplan
  { lat: 59.3340, lng: 18.0801 }  // Near Humlegården
]},
        {date: '2025-04-11', startTime: '08:10', endTime: '09:15', icon: 'mdi-flag', coords: [
  { lat: 59.3293, lng: 18.0686 }, // Central Stockholm
  { lat: 59.3326, lng: 18.0649 }, // Near Hötorget
  { lat: 59.3360, lng: 18.0590 }, // Near Stadsbiblioteket
  { lat: 59.3372, lng: 18.0702 }, // Close to Odenplan
  { lat: 59.3340, lng: 18.0801 }  // Near Humlegården
]},
        {date: '2025-04-11', startTime: '06:10', endTime: '07:15', icon: 'mdi-flag', coords: [
  { lat: 59.3293, lng: 18.0686 }, // Central Stockholm
  { lat: 59.3326, lng: 18.0649 }, // Near Hötorget
  { lat: 59.3360, lng: 18.0590 }, // Near Stadsbiblioteket
  { lat: 59.3372, lng: 18.0702 }, // Close to Odenplan
  { lat: 59.3340, lng: 18.0801 }  // Near Humlegården
]}],
      };
    },
  
    methods: {
      async waitForGoogle() {
        return new Promise((resolve) => {
          if (window.google && google.maps && google.maps.importLibrary) {
            resolve();
          } else {
            const interval = setInterval(() => {
              if (window.google && google.maps && google.maps.importLibrary) {
                clearInterval(interval);
                resolve();
              }
            }, 50);
          }
        });
      },
  
      async initMap() {
        const { Map } = await google.maps.importLibrary("maps");
  
        this.map = new Map(this.$refs.mapContainer, {
          center: { lat: 59.334591, lng: 18.063240 }, // Stockholm!
          zoom: 12,
        });
        console.log("this is the map: ", this.map);
      },
      onSendCoordsForPolylining(coords){
        this.$emit('send-coords-for-polylining', coords);
      }
    }
  };
  </script>
  
  <style scoped>
  .mapDiv {
    width: 100%;
    height: 500px;
    border: 2px dashed red;
  }
  </style>
  