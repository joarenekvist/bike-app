<!--Every vue object has three parts: the <template>, the <script> and the optional <style scoped> section.-->
<!--We use these components in the folder "components" as our "Views" in the View, Presenter, Model pattern.-->
<!--The template defines the actual HTML parts of this page, the things you see on the website. The script defines -->
<!--how logic is handled inside the component, and declares functions, props from the model, and more. Lastly, -->
<!--the <style scoped> section is for writing formatting CSS inside the component. You can also skip doing this -->
<!--and define all the css in the bigger css document found in the src/css/css.css (bad name i know, im sorry) file.-->

<!--This file will be a nice template you can copy and paste from every time you need to make a new page on the website.-->
<!--The rule is this: these page components communicate with the model by emitting events and data to their respective presenters, -->
<!--and those presenters will in turn be responsible for communication with the model. There is an example presenter in the project-->
<!--for reference on how that works.-->

<!--Try to read through this file to get a pretty general understanding of how our .vue files will look like and how they -->
<!--contact their presenters.-->


<template>
  <v-app style="height: 100vh;">
    <div class="exampleNameUsedForStyling">
      <!-- Button to open popup -->
      <v-btn @click=findNearbyBikeShop color="primary">Find nearby bike shop</v-btn>
    </div>

    <!-- The Vuetify Dialog -->
    <!-- -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>Nearby Bike Shops</v-card-title>

        <v-card-text>
          <div ref="mapContainer" style="height: 400px; width: 100%; border-radius: 8px;"></div>
          <p>Map will go here</p>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
// The script section of a .vue component handles imports, declarations of methods used in the component, declarations of other custom components used
// as well as declaration of props passed down to the component from its presenter, which in turn gets those props from the model.

//w start off by importing what we need for the component to function, like any other programming language.

//import ExampleWidget from '../widgets/ExampleWidget.vue';

//the export default {} declaration defines what goes with the component when others import it. this needs to be here for every .vue component.

/* global google */

export default {
  name: 'MaintenancePage', //every component needs a unique name

  components: {
    //if the component uses other custom components written by us we need to declare them here (and import them above)
    //ExampleWidget,
  },

  props: {
    //the props we use from the model need to be declared here. when we create this component in the presenter we bind the prop using the syntax :propName = ....
    //for each prop declared this way, we also need to declare its type. Object is a general dictionary in javascript.
    someProp: Object,
  },

  data() {
    //any data that is self contained to the component is kept in this data() function, and these are called in the component using "this.variableName".
    return {
      //below is just example data. most components dont even need a data() section.
      dialog: false
    };
  },

  //this is where we declare and write methods used inside the component. the most important section by far.
  //remember that any method we write in a component should try to change the state of the program as little as possible,
  //anytime we need to alter the model the correct course of action is to emit an event to the presenter responsible for this component instead.
  //that presenter will then in turn contact the model and ask for a change to occur.
  methods: {
    async findNearbyBikeShop() {
      try {
        this.dialog = true;

        // user location

        const userLocation = await this.getUserLocation(); // get user location
        console.log("Got user location:", userLocation);
        const { lat, lng } = userLocation;


        // initilize map
        const { Map } = await google.maps.importLibrary("maps");
        const { Marker } = await google.maps.importLibrary("marker");

        this.map = new Map(this.$refs.mapContainer, {
          center: { lat, lng }, // User location
          zoom: 13,
        });

        console.log("this is the map: ", this.map);


        new Marker({
          map: this.map,
          position: userLocation,
          title: "You are here",
        });

        // find shops

        const shops = await this.dataSearchMapWithCurrentQuery("bike shop", userLocation);

        shops.forEach(shop => {
          if (shop.geometry?.location) {
            new Marker({
              map: this.map,
              position: shop.geometry.location,
              title: shop.displayName?.text || "Bike Shop",
            });
          }
        });

        // this.$emit("someEventName"); tells the presenter of this component to listen for some event we have named "someEventName"
        // in that presenter. the presenter is then responsible for doing something with that information, most likely contacting the model.

      } catch (error) {
        console.error('Error doing something:', error.message);
      }
    },
    async getUserLocation() {
      return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser."));
        }

        navigator.geolocation.getCurrentPosition( // browser native api
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log("User location:", lat, lng);
            resolve({ lat, lng }); // return coordinates
          },
          (error) => {
            console.error("Error getting user location:", error);
            reject(error);
          }
        );
      });
    },


    async dataSearchMapWithCurrentQuery(searchQuery, location) {
      if (!searchQuery.trim()) {
        console.log("Not valid search query (empty).");
        return [];
      }

      try {
        const { PlacesService } = await google.maps.importLibrary("places");

        const request = {
          query: searchQuery,
          location: location, // userLocation
          radius: 1000,
          fields: ["name", "geometry", "business_status", "website", "opening_hours"], // fields returned from requests
        };

        const service = new PlacesService(this.map);

        return new Promise((resolve, reject) => {
          service.textSearch(request, (results, status) => {
            console.log('Search results:', results); // response
            console.log('Search status:', status); //http response

            if (status === google.maps.places.PlacesServiceStatus.OK) {
              resolve(results);
            } else {
              reject(new Error(`Search failed: ${status}`));
            }
          });
        });

      } catch (error) {
        console.error("An error occurred during place search:", error);
        return [];
      }
    },

  }
};
</script>
<!--End of script section-->


<style scoped>
/*The style scoped section defines CSS unique to this component. Its up to us if we want to style each component within the component like this */
/*or if we want to style it in the global css document.*/

/*here's an incomplete example of how we can style the div we defined in the template above*/
.exampleNameUsedForStyling {
  margin-bottom: 150px;
  /*add some space at the top. also accepts margin-top, margin-left, margin-right, etc.*/
  font-family: 'Segoe UI', sans-serif;
  /*apply a font*/
  font-weight: 600;
  /*slightly bolds the font*/
  font-size: 2.9rem;
  /*adjusts font size for the text*/
  text-align: center;
  /*center the text*/
  font-weight: bold;
  color: #0ae10d;
  /*color for the text */
}
</style>