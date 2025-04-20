//This file is a javascript file declaring our "VUEX" store. This is a basically our model in the model, view, presenter pattern,
//and is imported and implemented by our "main.js" so that the store is available everywhere in the DOM.
//Vuex stores follow certain structures that must be respected for the model remain reactive (react and update according to changes dynamically),
//mostly this means that the "state" contains the actual values of our model, we declare getters for those state variables that presenters can use,
//and if a presenter wants to ALTER those values, the presenter must call "actions" declared in the store. These "actions" then in turn call
//"mutations" also declared here below. This might seem like multiple annoying steps, but what it does it that the vuex store will handle
//any asynchronous behaviour for us and make sure that values that are updated are reflected as such when we display them in the app.

//I've added comments in the store below to help you along, but I think you will see a pattern in how things are declared and how
//the different sections  (state, getters, mutations, actions) depend on each other.

import { createStore } from 'vuex';
import router from "@/router.js"
import {polyline_store} from '@/js/polylineStore.js';
import {addUserToDatabase, subscribeToUserInDatabase, updateBikePartInformationInDatabase} from '@/js/firebase.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';  //used for persisting login

/*this is our actual MODEL, also called a store. it is exported so that the app can import it.*/
export const store = createStore({
    state: {
        //The state holds all of the actual objects and values kept in the model. In order to alter them, an action must be called by the DOM,
        //and that action calls a mutation, which in turn alters the state variables. Any change has three steps in other words.
        user: null,  //this will hold the logged-in user data acquired from google.
        loggedIn: false, //boolean to track if the user is logged in.
        userDatabaseSubscription: null, //we use this to store the snapshot subscription in the database. calling this object cancels the subscription.
        someValueToIllustratePropsGoingDown: 5,
        map: null,
        bikeComponents: [],
        userLocation: null,
        bikeShops: [],
        bikeComponentsMaintenance: [],
        userSettings: {defaultComponentMileage: 1000},
      },
    getters: {
        //Getters are what they sound like. This lets presenters call this.$store.getters.variableName to READ (never WRITE) variables in our model.
        //to WRITE to these variables, we call on "actions", which you will see later below.
        //If you want a variable in the model to be "gettable" and readable by a presenter, it needs to be declared in the format you see below.
        getUser: (state) => state.user,
        isLoggedIn: (state) => state.loggedIn,
        userDatabaseSubscription: (state) => state.userDatabaseSubscription,
        someValueToIllustratePropsGoingDown: (state) => state.someValueToIllustratePropsGoingDown, //lets us get it in the presenter
        bikeComponents: (state) => state.bikeComponents,
        bikeComponentsMaintenance:(state) => state.bikeComponentsMaintenance,
        getUserSettings:(state) => state.userSettings,

    },
    mutations: {
        /*"Mutations" change state variables in the style you see below. Every mutation MUST take in "state" as a parameter. Thats just the syntax. */
        /*This is what makes the model reactive. They can, however, also take in other arguments too like any other method.*/
        SET_USER(state, user) {
            state.user = user;    //Notice how in the "mutations", we can directly alter variables in the model by calling "state.variableName".
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
        SWITCH_PAGE_TO_GARAGE(){
          router.push({name: 'VirtualGarage'});
          },
        SWITCH_PAGE_TO_ROUTES(){
          router.push({name: 'Routes'});
          },
        SWITCH_PAGE_TO_MAINTENANCE(){
          router.push({name: 'Maintenance'})
        },  
        ESTABLISH_MAP_IN_MODEL(state, map){
          state.map = map;
          console.log("Map is now set to in the model: ", map);
        },
        CREATE_POLYLINES_FOR_ROUTE(state, coords){
          //coords need to be in shape [{lat: ...., lng: ...}, ...]
          console.log("Received request to add polyline in mutations ", coords);
          polyline_store.addRouteLine(coords, state);
        },
        THE_MUTATION_THAT_GOES_WITH_THE_ACTION(state){
            //here we finally change things in the model (state)
            console.log("printing the users name just to show how we interact with the model here", state.user.name);
        },
        ADD_COMPONENT(state, component) {
          const newComponent = {
            type: component.type || "Unknown Type",
            brand: component.brand || "Unknown",
            description: component.description || "No description",
            inUse: component.inUse !== undefined ? component.inUse : 1, 
            health: {
              mileage: component.health?.mileage ?? 0,
              lifespan: component.health?.lifespan ?? 1000
            }
          };
        
          state.bikeComponents = [...state.bikeComponents, newComponent];
        
          console.log("Component added:", newComponent);
          updateBikePartInformationInDatabase(state); 
        },
        REMOVE_COMPONENT(state, index) {
          state.bikeComponents.splice(index, 1);
          updateBikePartInformationInDatabase(state);
        },

        SET_USER_LOCATION(state, location) {
          state.userLocation = location;
        },
        SET_BIKE_SHOPS(state, shops) {
          state.bikeShops = shops;
        },


        ADD_MAINTENANCECOMPONENT(state, component){
          state.bikeComponentsMaintenance= [... state.bikeComponentsMaintenance, component];
          //borde väll persistas? e osäker och isåfall hur 
        },

        UPDATE_COMPONENT_HEALTH(state, {index, addedMileage}){
          state.bikeComponents[index].health.mileage += addedMileage;
          updateBikePartInformationInDatabase(state);
        },
        SET_BIKE_COMPONENTS(state, updatedComponents) {
          state.bikeComponents = updatedComponents;
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
  
        login({ commit }, user) { //the strange looking {commit} parameter is mandatory in vuex. it tells the model that we are altering it in a reactive way.
            console.log("reached log in in store");
            router.push({ name: 'MainPage' });
            commit('SET_USER', user);
          },
        logout({ commit }) {
            console.log("Reached log out in store");
            router.push({ name: 'StartPage' });
            commit('LOG_OUT');
          },

          goToGarage({commit}){
            console.log("Request to switch page to garage");
           
            commit('SWITCH_PAGE_TO_GARAGE');
          },
          goToRoutes({commit}){
            commit('SWITCH_PAGE_TO_ROUTES');
          },
          goToMaintenance({commit}){
            commit('SWITCH_PAGE_TO_MAINTENANCE');
          },
          someActionInTheModel({commit}){
            console.log("This is a dummy action that is present in the virtual garage just to help you make your own.");
            commit('THE_MUTATION_THAT_GOES_WITH_THE_ACTION'); 
            // THE_MUTATION_THAT_GOES_wITH_THE_ACTION is defined above in the "mutations" section. that is where the state
            //is actually altered.
          },
          sendMapToModel({commit}, map){
            commit('ESTABLISH_MAP_IN_MODEL', map);
          },
          receiveCoordsForPolylining({commit}, coords){
            console.log("Received action to create polylines for route.", coords);
            commit('CREATE_POLYLINES_FOR_ROUTE', coords);
          },
          addingComponent({commit},component)  {
            console.log("Component received in model");
            commit("ADD_COMPONENT", component);
          },
          removeComponent({commit}, index) {
            console.log("component(index) received in model");
            commit("REMOVE_COMPONENT", index);
          },

          checkForMaintenance({state,commit}){ //metod borde anropas när vi har avslutat en rutt/satt cykeln i parkeringsläge
            state.bikeComponents.forEach(component => {
              const{ mileage, lifespan} = component.health;
              const hp = (lifespan - mileage) / lifespan;

              if(hp < 0.2) {
                commit("ADD_MAINTENANCECOMPONENT", {
                  componentName: component.name,
                  currentMileage: mileage,
                  maxLifespan: lifespan,
                  healthPercentage: Math.round(hp*100)
                }); 
              }
            });

          },

          updateComponentHealth({commit}, addedMileage){
            commit("UPDATE_COMPONENT_HEALTH", addedMileage);
          },

          persistBikeComponents({ state }) {
            updateBikePartInformationInDatabase(state);
          },

          initAuthListener({ commit }) { //for auto login
            const auth = getAuth();
        
            onAuthStateChanged(auth, (user) => {
              if (user) {
                const userData = {
                  name: user.displayName,
                  email: user.email,
                  photoURL: user.photoURL,
                  uid: user.uid
                };
                console.log("User detected on app start:", userData);
                commit('SET_USER', userData);
                //redirect to main page if you're not already there
                router.push({ name: 'MainPage' });
              } else { //we are not persisting login in this else statement
                console.log("No user session detected on app start.");
                commit('LOG_OUT');
                //redirect to login
                router.push({ name: 'StartPage' });
              }
            });
          }
        
    }
  });
  
  export default store;