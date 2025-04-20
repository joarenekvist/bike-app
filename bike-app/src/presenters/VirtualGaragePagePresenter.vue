<template>
  <div>
    <VirtualGaragePage
      :bikeComponents="getBikeComponents"
      :user="getUser"
      @component-added="componentAdded"
      @component-removed="componentRemoved"
      @component-updated="componentUpdated"
    />
  </div>
</template>
  
<!--Then we define the logic (imports, name, declared components, computed values from the model, and methods)-->
<script>
  //first the imports
  import VirtualGaragePage from "@/components/VirtualGaragePage.vue";
  export default {
    name: "VirtualGaragePagePresenter",   //needs a unique name
    components: {
      VirtualGaragePage,   //here we declare the view in the presenter
    },

    //here is where we declare values fetched FROM the model (vuex store, READ ONLY). called by using this.$store.getters.someVariableInModel.
    //by putting them in the "computed" section we make sure that these values are reactive, and reflect changes if they are altered elsewhere.
    computed: { //values from store
      getUser() {
            return this.$store.getters.getUser || null;  //important to use an OR statement (||) in case its not yet defined. catches edge cases.
          },

      getValueFromModelJustToIllustrateHow(){
        return this.$store.getters.someValueToIllustratePropsGoingDown || 0;
      },

      getBikeComponents() {
        return this.$store.getters.bikeComponents || [];  //important to use an OR statement (||) in case its not yet defined. catches edge cases.
         },
    },

    methods: {
        handleThisEvent(theDataThatCameWith) { //if we passed data with the event in the view, we need to declare the parameter here too.
            console.log('The view sent the presenter this data: ', theDataThatCameWith);

            this.$store.dispatch("someActionInTheModel", theDataThatCameWith); 
            //this is how we call an action (alteration, etc) in the model as a reaction to the event.
            //the name "someActionInTheModel" is defined in the "actions" section of the store.js code.
            //thats where the model handles this request and sends a "commit".
          },
        componentAdded(component) {
          this.$store.dispatch("addingComponent", component);
          console.log("added component in presenter", component);
        },

        componentRemoved(component) {
          this.$store.dispatch("removeComponent", component);
          console.log("removed component(index) in presenter", component);
        },
        componentUpdated({ index, updatedComponent }) {
         const updated = [...this.getBikeComponents];
         updated[index] = updatedComponent;
         // update state via mutation
         this.$store.commit("SET_BIKE_COMPONENTS", updated);
         this.$store.dispatch("persistBikeComponents");
        }
    },
  

    //this is a lifecycle hook and not important, but if your component needs to do something or initialize something upon creation, define it here.
    created() {
      /*init*/
    },
  };
  </script>

  