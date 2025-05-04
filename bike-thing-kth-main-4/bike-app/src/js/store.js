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

// Helper function to check if maintenance was recent
function isMaintenanceRecent(maintenanceHistory) {
  if (!maintenanceHistory || maintenanceHistory.length === 0) return false;
  
  // Get the most recent maintenance record
  const latestMaintenance = maintenanceHistory.sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )[0];
  
  // If maintenance restored at least 50% health and was done in last 24 hours, 
  // consider it "recent" and don't show in maintenance needed
  const maintenanceDate = new Date(latestMaintenance.date);
  const now = new Date();
  const hoursSinceMaintenance = (now - maintenanceDate) / (1000 * 60 * 60);
  
  return hoursSinceMaintenance < 24 && latestMaintenance.healthRestored >= 50;
}

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
    
    // ADDED: Centralized component system
    selectedMaintenanceComponent: null, // Track the currently selected component for maintenance view
    
    // Centralized component library to maintain consistency across the application
    bikeComponentLibrary: {
      // Component types with their properties (categories removed)
      componentTypes: [
        {
          id: 'chain',
          name: 'Chain',
          defaultLifespan: 2500, // Average of 2,000-3,000 km
          maintenanceInterval: 500, // Check/clean every 500 km
          maintenanceText: 'Regular cleaning and lubrication is essential. Clean your chain with a degreaser, rinse thoroughly, and apply a suitable lubricant. Check for wear using a chain checker tool and replace when worn beyond 0.75%.',
          tools: ['Chain cleaner tool', 'Degreaser', 'Chain lubricant', 'Chain wear indicator', 'Chain breaker (for replacement)'],
          videoId: 'aWdE7b_OwAA', //  chain maintenance video
          isCommonComponent: true
        },
        {
          id: 'tires',
          name: 'Tires',
          defaultLifespan: 4500, 
          maintenanceInterval: 300, 
          maintenanceText: 'Check tire pressure before each ride. Inspect regularly for cuts, tears, or embedded objects. Replace when tread is worn or sidewalls show cracking. Rotate front and rear tires to extend lifespan if wear is uneven.',
          tools: ['Tire pressure gauge', 'Tire levers', 'Floor pump', 'Patch kit'],
          videoId: 'eqR6nlz_Ppo', 
          isCommonComponent: true
        },
        {
          id: 'brake-pads-rim',
          name: 'Brake Pads (Rim)',
          defaultLifespan: 2000, // Average of 1,000-3,000 km
          maintenanceInterval: 500, // Check wear every 500 km
          maintenanceText: 'Inspect pad thickness regularly and replace when worn down to the wear indicator line. Check toe-in alignment to prevent squealing. Clean rims regularly to improve braking performance and extend pad life.',
          tools: ['Allen keys', 'Sandpaper (for pad maintenance)', 'Alcohol for cleaning', 'Adjustable wrench'],
          videoId: 'XMa9UqY9obk', // Park Tool rim brake adjustment video
          isCommonComponent: true
        },
        {
          id: 'brake-pads-disc',
          name: 'Brake Pads (Disc)',
          defaultLifespan: 3500, 
          maintenanceInterval: 500, 
          maintenanceText: 'Check pad thickness regularly and replace when less than 1mm of material remains. Clean rotors with isopropyl alcohol to prevent contamination. If pads become contaminated with oil, replace them immediately as cleaning rarely works.',
          tools: ['Torx wrenches', 'Isopropyl alcohol', 'Clean rags', 'Pad spreader tool'],
          videoId: 'Xqw0SaZlTJQ', 
          isCommonComponent: true
        },
        {
          id: 'cassette',
          name: 'Cassette',
          defaultLifespan: 8000, 
          maintenanceInterval: 1000, 
          maintenanceText: 'Clean regularly with your chain. Remove occasionally for deep cleaning. Replace when teeth become shark-finned or worn asymmetrically. Replace together with chain when installing a new chain fails to improve shifting.',
          tools: ['Cassette lockring tool', 'Chain whip', 'Adjustable wrench', 'Degreaser', 'Brush set'],
          videoId: 'UP9ItRW8fd4', 
          isCommonComponent: true
        },
        {
          id: 'chainrings',
          name: 'Chainrings',
          defaultLifespan: 15000, // Average of 10,000-20,000 km
          maintenanceInterval: 2000, // Check for wear every 2000 km
          maintenanceText: 'Clean regularly as part of drivetrain maintenance. Check teeth for wear or bending. Replace when teeth become hooked or sharply profiled. Usually wear out slower than cassettes and chains.',
          tools: ['Allen keys', 'Torx keys', 'Crank puller (for some models)', 'Chainring nut wrench'],
          videoId: 'g_BQ1Gv8Zg8', // Park Tool chainring replacement video
          isCommonComponent: true
        },
        {
          id: 'cables-housing',
          name: 'Cables & Housing',
          defaultLifespan: 4000, 
          maintenanceInterval: 1000, 
          maintenanceText: 'Inspect for fraying, corrosion, and housing damage. Lubricate periodically. Replace when shifting or braking performance degrades. Complete replacement is recommended rather than just replacing cables.',
          tools: ['Cable cutters', 'Housing cutters', 'Cable end crimps', 'Lubricant'],
          videoId: 'tJ-XdZuNGvM',
          isCommonComponent: true
        },
        {
          id: 'bottom-bracket',
          name: 'Bottom Bracket Bearings',
          defaultLifespan: 7500, 
          maintenanceInterval: 2000, 
          maintenanceText: 'Check for play or grinding by rotating the cranks without chain. Listen for unusual noises. Replace when bearings feel rough or there is noticeable play. Different bottom bracket standards require different tools for service.',
          tools: ['Bottom bracket tool (standard-specific)', 'Torque wrench', 'Grease', 'Crank puller'],
          videoId: 'rj7EkI7EoZ4', 
          isCommonComponent: true
        },
        {
          id: 'front-derailleur',
          name: 'Front Derailleur',
          defaultLifespan: 10000, 
          maintenanceInterval: 1000, 
          maintenanceText: 'Clean regularly and check adjustment. Lubricate pivot points with light oil. Adjust height, angle, and limit screws as needed. Replace if cage becomes bent or pivots develop excessive play.',
          tools: ['Allen keys', 'Screwdrivers', 'Light oil', 'Degreaser'],
          videoId: 'ZNG6xLdIEQE', 
          isCommonComponent: true
        },
        {
          id: 'rear-derailleur',
          name: 'Rear Derailleur',
          defaultLifespan: 10000, 
          maintenanceInterval: 1000, 
          maintenanceText: 'Clean regularly, especially the jockey wheels which collect dirt and debris. Lubricate pivot points and check for bent hanger after crashes. Adjust B-screw and limit screws as needed for optimal shifting.',
          tools: ['Allen keys', 'Screwdrivers', 'Light oil', 'Degreaser', 'Hanger alignment tool'],
          videoId: 'UkzvmUiKsKQ', 
          isCommonComponent: true
        },
        {
          id: 'suspension-fork',
          name: 'Suspension Fork',
          defaultLifespan: 10000, 
          maintenanceInterval: 1000, 
          maintenanceText: 'Clean stanchions after every ride, especially muddy ones. Check for oil leaks. Service lower legs every 50 hours of riding. Full service (including damper) every 200-300 hours. Follow manufacturer-specific intervals.',
          tools: ['Suspension-specific tools', 'Appropriate oils/greases', 'Seal drivers', 'Torque wrench'],
          videoId: 'vHHCFsxxoQs', 
          isCommonComponent: true
        },
        {
          id: 'hub-bearings',
          name: 'Hub Bearings',
          defaultLifespan: 10000, 
          maintenanceInterval: 2000,
          maintenanceText: 'Check for play by holding the wheel and trying to move it side to side on the axle. Adjust cup-and-cone bearings as needed. Cartridge bearings need replacement when worn. Clean and regrease regularly.',
          tools: ['Cone wrenches', 'Bearing press', 'Grease', 'Hub-specific tools'],
          videoId: 'w2nw5I12G2Q', 
          isCommonComponent: true
        },
        {
          id: 'headset-bearings',
          name: 'Headset Bearings',
          defaultLifespan: 10000, 
          maintenanceInterval: 2000, 
          maintenanceText: 'Check for play by holding the front brake and rocking the bike. Adjust if loose. Remove, clean and regrease periodically. Replace if bearings feel rough or notchy when steering.',
          tools: ['Headset wrenches', 'Allen keys', 'Grease', 'Star-fangled nut tool'],
          videoId: 'lM4iddLaL8I', 
          isCommonComponent: true
        }
      ]
    }
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
    
    bikeShops: (state) => state.bikeShops,
    selectedMaintenanceComponent: (state) => state.selectedMaintenanceComponent,
    
    // Component library access
    getComponentTypes: (state) => state.bikeComponentLibrary.componentTypes,
    getComponentTypeById: (state) => (id) => {
      return state.bikeComponentLibrary.componentTypes.find(comp => comp.id === id);
    },
    getComponentTypeByName: (state) => (name) => {
      return state.bikeComponentLibrary.componentTypes.find(comp => 
        comp.name.toLowerCase() === name.toLowerCase()
      );
    },
    getCommonComponentTypes: (state) => {
      return state.bikeComponentLibrary.componentTypes.filter(comp => comp.isCommonComponent);
    },
    
    // Maintenance history getter
    getComponentMaintenanceHistory: (state) => (bikeId, componentIndex) => {
      const bike = state.bikes.find(b => b.id === bikeId);
      if (bike && bike.components && bike.components[componentIndex]) {
        return bike.components[componentIndex].maintenanceHistory || [];
      }
      return [];
    }
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
    
    // ADDED: Component library mutations
    SET_SELECTED_MAINTENANCE_COMPONENT(state, component) {
      state.selectedMaintenanceComponent = component;
    },
    
    // New mutation for recording maintenance
    RECORD_COMPONENT_MAINTENANCE(state, { bikeId, componentIndex, maintenanceRecord }) {
      const bike = state.bikes.find(b => b.id === bikeId);
      if (bike && bike.components && bike.components[componentIndex]) {
        const component = bike.components[componentIndex];
        
        // Initialize maintenance history array if it doesn't exist
        if (!component.maintenanceHistory) {
          component.maintenanceHistory = [];
        }
        
        // Add the maintenance record
        component.maintenanceHistory.push(maintenanceRecord);
        
        // Update component mileage based on the health restoration
        if (maintenanceRecord.healthRestored > 0) {
          const mileageReduction = (maintenanceRecord.healthRestored / 100) * component.health.lifespan;
          component.health.mileage = Math.max(0, component.health.mileage - mileageReduction);
        }
        
        // Persist changes to database
        updateBikePartInformationInDatabase(state);
      }
    },
    
    // New mutation for GNSS/Raspberry Pi to update distances
    UPDATE_COMPONENTS_FROM_RIDE(state, { bikeId, distanceTraveled }) {
      const bike = state.bikes.find(b => b.id === bikeId);
      if (!bike || !bike.components) return;
      
      // Update each active component mileage
      bike.components.forEach(component => {
        if (component.inUse) {
          component.health.mileage += distanceTraveled;
        }
      });
      
      // Persist changes
      updateBikePartInformationInDatabase(state);
    }
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

    // Updated checkForMaintenance method to exclude recently maintained components
    checkForMaintenance({ state, commit }) {
      let maintenanceNeeded = [];
    
      state.bikes.forEach((bike) => {
        if (bike.components) {
          bike.components.forEach((component, compIndex) => {
            const { mileage, lifespan } = component.health || { mileage: 0, lifespan: 1000 };
            const hp = (lifespan - mileage) / lifespan;
    
            // Only add to maintenance list if:
            // 1. Health is below 20%
            // 2. Component is in use
            // 3. No recent maintenance (in the last 24 hours)
            const hasRecentMaintenance = isMaintenanceRecent(component.maintenanceHistory);
    
            if (hp < 0.2 && component.inUse && !hasRecentMaintenance) {
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
    
    // ADDED: Component library actions
    setBikeShops({ commit }, shops) {
      commit('SET_BIKE_SHOPS', shops);
    },
    
    setSelectedMaintenanceComponent({ commit }, component) {
      commit('SET_SELECTED_MAINTENANCE_COMPONENT', component);
    },
    
    // Action to find matching maintenance info for a component
    findComponentMaintenanceInfo({ state, dispatch }, componentType) {
      // Try exact match by name first
      let match = state.bikeComponentLibrary.componentTypes.find(comp => 
        comp.name.toLowerCase() === componentType.toLowerCase()
      );
      
      // If no exact match, try partial matches
      if (!match) {
        // Try to find components that contain the search string
        match = state.bikeComponentLibrary.componentTypes.find(comp => 
          comp.name.toLowerCase().includes(componentType.toLowerCase()) ||
          componentType.toLowerCase().includes(comp.name.toLowerCase())
        );
      }
      
      if (match) {
        dispatch('setSelectedMaintenanceComponent', match);
      }
      
      return match;
    },
    
    // Action to create a generic bike with standard components
    createGenericBike({ state, dispatch }, { bikeName, brand, model }) {
      // Create a new bike with basic properties
      const newBike = {
        nickname: bikeName || "Generic Bike",
        brand: brand || "",
        model: model || "Generic Bike",
        components: []
      };
      
      // Add all common components to the bike, but with no brand specificity
      const commonComponents = state.bikeComponentLibrary.componentTypes.filter(comp => comp.isCommonComponent);
      
      commonComponents.forEach(componentType => {
        const component = {
          type: componentType.name,
          brand: "",  // No specific brand
          description: `Standard ${componentType.name}`, // Simple generic description
          inUse: 1,
          health: {
            mileage: 0,
            lifespan: componentType.defaultLifespan
          }
        };
        
        newBike.components.push(component);
      });
      
      // Add the bike to the user's collection
      dispatch("updateBikeTemplateField", newBike);
      
      return newBike;
    },
    
    // Helper action to get default lifespan for a component type
    getDefaultLifespanForComponent({ state }, componentTypeName) {
      const componentType = state.bikeComponentLibrary.componentTypes.find(comp => 
        comp.name.toLowerCase() === componentTypeName.toLowerCase()
      );
      
      if (componentType) {
        return componentType.defaultLifespan;
      }
      
      return 5000; // Default fallback value
    },
    
    // New action for component updates from maintenance
    componentUpdated({ state, commit, dispatch }, { bikeId, componentIndex, updatedComponent }) {
      // First update the component in the bikes array
      const updatedBikes = [...state.bikes];
      const bikeToUpdate = updatedBikes.find(bike => bike.id === bikeId);
      
      if (bikeToUpdate && bikeToUpdate.components && bikeToUpdate.components[componentIndex]) {
        bikeToUpdate.components[componentIndex] = updatedComponent;
        
        // Update all bikes in the store
        commit("SET_BIKE_COMPONENTS", updatedBikes);
        
        // Persist changes to database
        dispatch("persistBikeComponents");
        
        // Check maintenance needs again (should remove this component from needs list)
        dispatch("checkForMaintenance");
        
        return true;
      } else {
        console.error("Bike or component not found for update");
        return false;
      }
    },
    
    // New action for recording maintenance
    recordComponentMaintenance({ commit, dispatch }, { bikeId, componentIndex, maintenanceRecord }) {
      commit('RECORD_COMPONENT_MAINTENANCE', { bikeId, componentIndex, maintenanceRecord });
      
      // After recording maintenance, we should check if any components still need maintenance
      dispatch("checkForMaintenance");
    },
    
    // New action for handling ride data from GNSS/Raspberry Pi
    updateComponentsFromRide({ commit, dispatch }, { bikeId, distanceTraveled }) {
      commit('UPDATE_COMPONENTS_FROM_RIDE', { bikeId, distanceTraveled });
      
      // Check if maintenance is needed after the ride
      dispatch("checkForMaintenance");
      
      // Return success
      return true;
    }
  },
});

// Set store reference in state
store.state.store = store;

export default store;