import { createStore } from "vuex";
import router from "@/router.js";
import { polyline_store } from "@/js/polylineStore.js";
import {
  addUserToDatabase,
  subscribeToUserInDatabase,
  updateBikePartInformationInDatabase,
  updateUserSettingsInDatabase,
  updateUserDevicesInDatabase,
} from "@/js/firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth"; //used for persisting login

/*this is our actual MODEL, also called a store. it is exported so that the app can import it.*/
export const store = createStore({
  state: {
    //The state holds all of the actual objects and values kept in the model. In order to alter them, an action must be called by the DOM,
    //and that action calls a mutation, which in turn alters the state variables. Any change has three steps in other words.
    user: null, //this will hold the logged-in user data acquired from google.
    loggedIn: false, //boolean to track if the user is logged in.
    userDatabaseSubscription: null, //we use this to store the snapshot subscription in the database. calling this object cancels the subscription.
    userDeviceSubscription: null,
    someValueToIllustratePropsGoingDown: 5,
    map: null,
    bikeComponents: [],
    userLocation: null,
    bikeShops: [],
    bikeComponentsMaintenance: [],
    userSettings: {
      defaultComponentMileage: 1000,
      receiveHumidityNotifications: true,
      receiveTheftNotifications: true,
      receiveTireSwitchNotifications: true,
      userRegisteredDevices: [],
      userActiveDevice: "No active device",
    },
    bikes: [], // all user bikes go here
    selectedBikeId: null, // to track which bike is currently selected
    store: null, // Reference to the store itself
    totalDistanceTravelled: 0,
    cachedRoutes: [], //contains the last 10 routes taken, fetched from DB
  },
  getters: {
    //Getters are what they sound like. This lets presenters call this.$store.getters.variableName to READ (never WRITE) variables in our model.
    //to WRITE to these variables, we call on "actions", which you will see later below.
    //If you want a variable in the model to be "gettable" and readable by a presenter, it needs to be declared in the format you see below.
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.loggedIn,
    userDatabaseSubscription: (state) => state.userDatabaseSubscription,
    someValueToIllustratePropsGoingDown: (state) =>
      state.someValueToIllustratePropsGoingDown, //lets us get it in the presenter
    bikeComponents: (state) => state.bikeComponents,
    bikeComponentsMaintenance: (state) => state.bikeComponentsMaintenance,
    getUserSettings: (state) => state.userSettings,
    getBike: (state) => state.bikes,
    getSelectedBikeID: (state) => state.selectedBikeId,
    totalDistanceTravelled: (state) => state.totalDistanceTravelled,
    cachedRoutes: (state) => state.cachedRoutes,
  },
  mutations: {
    /*"Mutations" change state variables in the style you see below. Every mutation MUST take in "state" as a parameter. Thats just the syntax. */
    /*This is what makes the model reactive. They can, however, also take in other arguments too like any other method.*/
    SET_USER(state, user) {
      state.user = user; //Notice how in the "mutations", we can directly alter variables in the model by calling "state.variableName".
      state.loggedIn = !!user;
      console.log("User is now ", state.user);
      console.log("Logged in status is now ", state.loggedIn);
      console.log("Attempting to add to database...");
      addUserToDatabase(user);
      subscribeToUserInDatabase(state);
    },

    LOG_OUT(state) {
      state.loggedIn = false;
    },
    SWITCH_PAGE_TO_GARAGE() {
      router.push({ name: "VirtualGarage" });
    },
    SWITCH_PAGE_TO_ROUTES() {
      router.push({ name: "Routes" });
    },
    SWITCH_PAGE_TO_MAINTENANCE() {
      router.push({ name: "Maintenance" });
    },
    ESTABLISH_MAP_IN_MODEL(state, map) {
      state.map = map;
      console.log("Map is now set to in the model: ", map);
    },
    CREATE_POLYLINES_FOR_ROUTE(state, coords) {
      //coords need to be in shape [{lat: ...., lng: ...}, ...]
      console.log("Received request to add polyline in mutations ", coords);
      polyline_store.addRouteLine(coords, state);
    },
    THE_MUTATION_THAT_GOES_WITH_THE_ACTION(state) {
      //here we finally change things in the model (state)
      console.log(
        "printing the users name just to show how we interact with the model here",
        state.user.name
      );
    },
    ADD_COMPONENT(state, { component, bikeId }) {
      /*const newComponent = {
        type: component.type || "Unknown Type",
        brand: component.brand || "Unknown",
        description: component.description || "No description",
        inUse: component.inUse !== undefined ? component.inUse : 1,
        health: {
          mileage: component.health?.mileage ?? 0,
          lifespan: component.health?.lifespan ?? 1000,
        },
      }; */

      //state.bikeComponents = [...state.bikeComponents, newComponent];

      const bike = state.bikes.find((b) => b.id === bikeId);
      if (bike) {
        bike.components.push(component);
        console.log("Added: ", component, "for bike: ", bikeId);
      } else {
        console.error("Bike not found for id:", bikeId);
      }
      //console.log("Component added:", newComponent);
      updateBikePartInformationInDatabase(state);
    },
    REMOVE_COMPONENT(state, { bikeId, componentIndex }) {
      updateBikePartInformationInDatabase(state);

      const bike = state.bikes.find((b) => b.id === bikeId);
      if (bike) {
        bike.components.splice(componentIndex, 1);
        console.log("Remove component ", componentIndex, "for ", bikeId);
      } else {
        console.error("Bike not found for id:", bikeId);
      }
    },

    SET_USER_LOCATION(state, location) {
      state.userLocation = location;
    },
    SET_BIKE_SHOPS(state, shops) {
      state.bikeShops = shops;
    },

    ADD_MAINTENANCECOMPONENT(state, component) {
      state.bikeComponentsMaintenance = [
        ...state.bikeComponentsMaintenance,
        component,
      ];
      //borde väll persistas? e osäker och isåfall hur
    },

    UPDATE_COMPONENT_HEALTH(state, { index, addedMileage }) {
      state.bikeComponents[index].health.mileage += addedMileage;
      updateBikePartInformationInDatabase(state);
    },
    SET_BIKE_COMPONENTS(state, updatedBikes) {
      if (Array.isArray(updatedBikes) && updatedBikes.length > 0 && updatedBikes[0].id) {
        state.bikes = updatedBikes;
      } else {
        state.bikeComponents = updatedBikes;
      }
    },
    SET_MAINTENANCE_COMPONENTS(state, components) {
      state.bikeComponentsMaintenance = components;
    },
    SET_BIKE_ID(state, id) {
      state.selectedBikeId = id;
    },
    ADD_BIKE(state, bikeInfo) {
      state.bikes.push(bikeInfo); // add bike to end of array of bikes
      console.log("Bike added to list", state.bikes);
      updateBikePartInformationInDatabase(state);
    },

    SAVE_USER_SETTINGS(state, settings) {
      state.userSettings = settings;
      console.log("Updated user settings properly in the model.");
      console.log("Now attempting to persist settings in firebase...");
      updateUserSettingsInDatabase(state);
    },
    REGISTER_NEW_DEVICE(state, name) {
      console.log("Now attempting to add device to firestore of user...");
      updateUserDevicesInDatabase(state, name);
    },
    REMOVE_BIKE(state, selectedBikeId) {
      state.bikes = state.bikes.filter((bike) => bike.id !== selectedBikeId);
    
      if (state.selectedBikeId === selectedBikeId) {
        state.selectedBikeId = null;
      }
      
      // Persist the change to Firebase
      updateBikePartInformationInDatabase(state);
    },
    UPDATE_BIKE_FIELD(state, { bikeId, field, value }) {
      const bike = state.bikes.find((b) => b.id === bikeId);
      if (bike) {
        bike[field] = value;
      } else {
        console.error("Bike not found for update");
      }
    },
  },
  actions: {
    /*"Actions" are the middle-step of altering the model. They have a very peculiar syntax that we just have to accept looks strange.*/
    /*These actions are called in the presenters (never views/components), and are responsible for requesting "mutations" from the reactive model. */

    /*The syntax is the following:
        actionName({commit}, optionalParameter){
            commit('MUTATION_NAME', optionalParameter);
        } */

    /*With the example above, a presenter in the DOM can call the action and request a mutation by calling this.$store.dispatch("actionName", someDataForTheOptionalParameter); */

    login({ commit }, user) {
      //the strange looking {commit} parameter is mandatory in vuex. it tells the model that we are altering it in a reactive way.
      console.log("reached log in in store");
      router.push({ name: "MainPage" });
      commit("SET_USER", user);
    },
    logout({ commit }) {
      console.log("Reached log out in store");
      router.push({ name: "StartPage" });
      commit("LOG_OUT");
    },

    goToGarage({ commit }) {
      console.log("Request to switch page to garage");

      commit("SWITCH_PAGE_TO_GARAGE");
    },
    goToRoutes({ commit }) {
      commit("SWITCH_PAGE_TO_ROUTES");
    },
    goToMaintenance({ commit }) {
      commit("SWITCH_PAGE_TO_MAINTENANCE");
    },
    someActionInTheModel({ commit }) {
      console.log(
        "This is a dummy action that is present in the virtual garage just to help you make your own."
      );
      commit("THE_MUTATION_THAT_GOES_WITH_THE_ACTION");
      // THE_MUTATION_THAT_GOES_wITH_THE_ACTION is defined above in the "mutations" section. that is where the state
      //is actually altered.
    },
    sendMapToModel({ commit }, map) {
      commit("ESTABLISH_MAP_IN_MODEL", map);
    },
    receiveCoordsForPolylining({ commit }, coords) {
      console.log("Received action to create polylines for route.", coords);
      commit("CREATE_POLYLINES_FOR_ROUTE", coords);
    },
    addingComponent({ commit }, { bikeId, component }) {
      console.log("Component received in model", bikeId, component);
      commit("ADD_COMPONENT", { bikeId, component });
    },
    removeComponent({ commit }, { bikeId, componentIndex }) {
      console.log("Remove component recived");
      commit("REMOVE_COMPONENT", { bikeId, componentIndex });
    },
    removeBike({ commit }, bikeId) {
      console.log("Remove Bike recived");
      commit("REMOVE_BIKE", bikeId);
    },

    checkForMaintenance({ state, commit }) {
      let maintenanceNeeded = [];
    
      state.bikes.forEach((bike) => {
        if (bike.components) {
          bike.components.forEach((component, compIndex) => {
            const { mileage, lifespan } = component.health || { mileage: 0, lifespan: 1000 };
            const hp = (lifespan - mileage) / lifespan;
    
            if (hp < 0.2 && component.inUse) {
              maintenanceNeeded.push({
                bikeId: bike.id, // Include the bike ID
                bikeName: bike.nickname || `${bike.brand} ${bike.model}` || 'Unnamed Bike',
                componentIndex: compIndex,
                type: component.type || "Unknown Component",
                brand: component.brand,
                currentMileage: mileage,
                maxLifespan: lifespan,
                healthPercentage: Math.round(hp * 100),
              });
            }
          });
        }
      });
    
      // Clear existing maintenance components to avoid duplicates
      commit("SET_MAINTENANCE_COMPONENTS", maintenanceNeeded);
    
      return maintenanceNeeded.length > 0; // Return true if maintenance is needed
    },

    updateComponentHealth({ commit }, addedMileage) {
      commit("UPDATE_COMPONENT_HEALTH", addedMileage);
    },

    persistBikeComponents({ state }) {
      updateBikePartInformationInDatabase(state);
    },

    initAuthListener({ commit }) {
      //for auto login
      const auth = getAuth();

      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userData = {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid,
          };
          console.log("User detected on app start:", userData);
          commit("SET_USER", userData);
          //redirect to main page if you're not already there
          router.push({ name: "MainPage" });
        } else {
          //we are not persisting login in this else statement
          console.log("No user session detected on app start.");
          commit("LOG_OUT");
          //redirect to login
          router.push({ name: "StartPage" });
        }
      });
    },
    updateBikeTemplateField({ commit }, bikeInfo) {
      //commit("SET_BIKE_TEMPLATE_FIELD", bikeInfo);

      const newBike = {
        ...bikeInfo,
        id: Date.now().toString(),
      };

      commit("ADD_BIKE", newBike);
      //commit("SET_BIKE_ID", newBike.id);
    },
    selectBike({ commit }, bikeId) {
      commit("SET_BIKE_ID", bikeId);
    },
    updateBikeField({ commit }, { bikeId, field, value }) {
      commit("UPDATE_BIKE_FIELD", { bikeId, field, value });
    },
    saveUserSettings({ commit }, settings) {
      commit("SAVE_USER_SETTINGS", settings);
    },
    registerNewDevice({ commit }, name) {
      commit("REGISTER_NEW_DEVICE", name);
    },
  },
});

// Set store reference in state
store.state.store = store;

export default store;