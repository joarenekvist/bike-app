<template>
  <v-app>
    <div class="mapDiv" ref="mapContainer"></div>
    <div class="bottomRow">
      <div class="generalStatistics">
        <span class="Title">All Time Statistics</span>
        <span>🛣️ Distance travelled: {{ (totalDistanceTravelled / 1000).toFixed(1) }} km</span>
        <v-tooltip text="Estimate based on 12 kcal per 1 km" location="bottom">
          <template #activator="{ props }">
            <span v-bind="props">
              🔥Calories burned*: {{ this.caloriesBurned.toFixed(1) }} kcal
            </span>
          </template>
        </v-tooltip>
        <v-tooltip text="Estimate based on 96 g of CO2 per passenger-kilometer in a gasoline car" location="bottom">
          <template #activator="{ props }">
            <span v-bind="props">
              🍃Emissions prevented*: {{ this.emissionsPrevented }} kg of CO2
            </span>
          </template>
        </v-tooltip>
        <v-tooltip text="Calculated from your last 10 trips, not all time" location="bottom">
          <template #activator="{ props }">
            <span v-bind="props">
              🚲 Average speed*: {{ calculateAverageSpeed(cachedRoutes).toFixed(1) }} km/h
            </span>
          </template>
        </v-tooltip>
        <span class="Title2">Achievements</span>
        <div class="text-center">
          <v-tooltip :text="`Progress to next level by travelling! Currently: ${(progress.soFar/1000).toFixed(0)} / ${(progress.toLevelUp/1000).toFixed(0)} km`" location="bottom">
          <template #activator="{ props }">
            <v-progress-circular :model-value="progress.percent" :rotate="360" :size="100" :width="15" color="green" v-bind="props">
            <template v-slot:default> LVL: {{ level }} </template>
          </v-progress-circular>
          </template>
        </v-tooltip>
        <v-btn prepend-icon="mdi-medal-outline" @click="medalDialog = true" class = "openMedals">
          My Medals
        </v-btn>
        <!-- Map Dialog -->
        <v-dialog v-model="medalDialog" max-width="800px">
          <v-card>
            <v-card-title>
              🏅 My Medals
              <v-spacer></v-spacer>
              <v-btn icon @click="medalDialog = false" class="close-btn">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <MedalsWidget :medals="medals" :totalDistanceTravelled="totalDistanceTravelled"/>
            </v-card-title>

            <v-card-text>
              <div ref="container" style="height: 500px; width: 100%; border-radius: 8px;"></div>
            </v-card-text>
          </v-card>
        </v-dialog>
        </div>
      </div>
      <div class = "routesListContainer">
        <span class="Title">Select Route</span>
        <VuetifyListWidget :items = cachedRoutes @send-coords-for-polylining="onSendCoordsForPolylining"></VuetifyListWidget>
      </div>
      <div class="routeBreakdown">
        <span class="Title">Route Breakdown</span>
        <div v-if="Object.keys(this.selectedRoute).length > 0" class="contentRouteBreakdown"><!-- when a route is selected -->
         <span>🛣️ Distance travelled: {{ (this.selectedRoute.distance / 1000).toFixed(1) }} km</span>
         <v-tooltip text="Estimate based on 12 kcal per 1 km" location="bottom">
          <template #activator="{ props }">
            <span v-bind="props">
              🔥Calories burned*: {{ (this.selectedRoute.distance / 1000).toFixed(1) * 12 || 0 }} kcal
            </span>
          </template>
        </v-tooltip>
        <v-tooltip text="Estimate based on 96 g of CO2 per passenger-kilometer in a gasoline car" location="bottom">
          <template #activator="{ props }">
            <span v-bind="props">
              🍃Emissions prevented*: {{ ((this.selectedRoute.distance / 1000) * 96 / 1000).toFixed(1) || 0 }} kg of CO2
            </span>
          </template>
        </v-tooltip>
        <v-tooltip text="Calculated from your last 10 trips, not all time" location="bottom">
          <template #activator="{ props }">
            <span v-bind="props">
              🚲 Average speed*: {{ calculateAverageSpeed([this.selectedRoute]).toFixed(1) }} km/h
            </span>
          </template>
        </v-tooltip>
        
        </div>

      </div>
    </div>
  </v-app>
  </template>
  
  <script>
  import MedalsWidget from '@/widgets/MedalsWidget.vue';
import VuetifyListWidget from '@/widgets/VuetifyListWidget.vue';

  /* global google */ // This tells ESLint to chill
  
  export default {
    name: 'RoutesPage',
  
    props: {
      cachedRoutes: Array,
      totalDistanceTravelled: Number,
      medals: Array,
    },
    computed: {
      level() {
        return this.findLevel(this.totalDistanceTravelled);
        //cumulative distance to reach level "n" is DistanceForN = 1000 * 1.151^(n-2)
        //so to go from level n to n+1 ->   1000 * 1.151^(n-1) - 1000 * 1.151^(n-2) 
      },
      progress() {
        //figures out how far the user is into their current level, calculate what percentage of that level they've completed, and return that as the progress value
        const a = 1000;
        const r = 1.151;

        const distanceToCurrentLevel = a * Math.pow(r, this.level - 2);
        const distanceToNextLevel = a * Math.pow(r, this.level - 1);
        const levelRange = distanceToNextLevel - distanceToCurrentLevel;
        const currentProgress = this.totalDistanceTravelled - distanceToCurrentLevel;

        return {percent: Math.max(0, Math.min((currentProgress / levelRange) * 100, 100)), soFar: currentProgress, toLevelUp: levelRange};
      }
    },
    components:{
        VuetifyListWidget,
        MedalsWidget
    },
    emits: ['map-init', 'send-coords-for-polylining', 'fetch-new-route'], //
    async mounted() {
      await this.waitForGoogle(); // Wait for the Google Maps script
      await this.initMap();       // Initialize the map
      this.$emit("map-init", this.map); // Optional event
      this.caloriesBurned = (this.totalDistanceTravelled / 1000).toFixed(1) * 12 || 0;
      this.emissionsPrevented = ((this.totalDistanceTravelled / 1000) * 96 / 1000).toFixed(1) || 0; //96 in here is grams per passenger kilometer from
      // https://www.visualcapitalist.com/comparing-the-carbon-footprint-of-transportation-options/
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
      
  caloriesBurned: 0,
  emissionsPrevented: 0,
  selectedRoute: {},
  medalDialog: false,
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
        this.selectedRoute = coords;
        console.log("These are the coords in question: ", coords.coords);
        this.$emit('send-coords-for-polylining', coords.coords);

        //center and zoom map to fit the route
        if (this.map && coords.coords && coords.coords.length > 0) {
          const bounds = new google.maps.LatLngBounds();

          coords.coords.forEach(point => {
            bounds.extend(point);
          });

          this.map.fitBounds(bounds);
        }
      },
      getHourDifference(start, end) {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        let diffMinutes = endMinutes - startMinutes;
        if (diffMinutes < 0) diffMinutes += 24 * 60;

        return diffMinutes / 60;
      },

      calculateAverageSpeed(routes) {
        let totalDistanceKm = 0;
        let totalHours = 0;

        for (const route of routes) {
          const hours = this.getHourDifference(route.startTime, route.endTime);
          const km = route.distance / 1000;

          totalDistanceKm += km;
          totalHours += hours;
        }

        return totalHours > 0 ? (totalDistanceKm / totalHours) : 0;
      },

      fetchNewRoute(){
        this.$emit("fetch-new-route");
      },

      //function to calculate the distance required for a given level
      findLevel(distance) {
        const a = 1000;        // Distance for level 2 (1 km)
        const r = 1.151;       // Growth rate to hit 1 billion meters at level 99
        const maxLevel = 99;

        if (distance < a) return 1; // Level 1 is below 1 km
        let level = 2;

        while (level <= maxLevel && distance >= a * Math.pow(r, level - 2)) {
          level++;
        }
        return level - 1;
      },

    }
  };
  </script>
  
  <style scoped>
  .mapDiv {
    width: 100%;
    height: 500px;
  }
  /* New row container for the 3 equal divs */
.bottomRow {
  display: flex;
  width: 100%;
  /* border: 2px dashed red;*/
}

.Title{
  font-family: 'Segoe UI', sans-serif; /*apply a font*/
  margin-bottom: 15px;
  font-size: 1.5rem;  /*adjusts font size for the text*/
  font-weight: bold;
  color: #000000;  /*color for the text */
}

.close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
  }

.Title2{
  font-family: 'Segoe UI', sans-serif; /*apply a font*/
  margin-top: 15px;
  margin-bottom: 15px;
  font-size: 1.5rem;  /*adjusts font size for the text*/
  font-weight: bold;
  color: #000000;  /*color for the text */
}

/* All 3 boxes share the same width */
.routesListContainer,
.routeBreakdown{
  flex: 1;
  /*border: 1px solid gray; */
  padding: 16px;
  box-sizing: border-box;
  /* border: 2px dashed blue;*/
}

.contentRouteBreakdown{
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 2px; /* optional: adds spacing between elements */
}

.openMedals{
  margin-left: 15px;
}

.generalStatistics{
  flex: 1;
  /*border: 1px solid gray; */
  padding: 16px;
  box-sizing: border-box;
  /* border: 2px dashed blue;*/
  display: flex;
  flex-direction: column;
}

  </style>
  