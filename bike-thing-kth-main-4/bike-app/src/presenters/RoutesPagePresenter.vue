<template>
    <div>
      <RoutesPage @map-init="sendMapToModel" @send-coords-for-polylining="sendCoordsForPolylining"/>
    </div>
</template>
  
<!--Then we define the logic (imports, name, declared components, computed values from the model, and methods)-->
<script>
  //first the imports. any custom component should be imported here before it is declared after.
  import RoutesPage from "@/components/RoutesPage.vue";
  
  //the default export (this presenter itself))
  export default {
    name: "RoutesPagePresenter",   //needs a unique name
    components: {
      RoutesPage,   //needs to declare the custom component (view) contained within.
    },

    //here is where we declare values fetched FROM the model (vuex store, READ ONLY). called by using this.$store.getters.someVariableInModel.
    //by putting them in the "computed" section we make sure that these values are reactive, and reflect changes if they are altered elsewhere.
    computed: { //values from store
        getSomeProp() {
            return this.$store.getters.somePropName || null;  //important to use an OR statement (||) in case its not yet defined. catches edge cases.
        },
    },

    //here is where we define methods that are bound to the events we listen to in the view. in the template above you will see 
    //that we listen for the event someEventName in the view, and call the method "handleThisEvent" defined here below if the event is
    //emitted to us. syntax: <Component @some-event-name="handleThisEvent"/>
    methods: {
        sendMapToModel(map) { //if we passed data with the event in the view, we need to declare the parameter here too.
            console.log('Routes view sends new google map to model: ', map);
            this.$store.dispatch("sendMapToModel", map); //this is how we call the action in the model as a reaction to the event.
      },
      sendCoordsForPolylining(coords){
            console.log("Routes presenter received coords for polylining. Sending them up to model.", coords);
            this.$store.dispatch("receiveCoordsForPolylining", coords);
      }
    },

    //this is a lifecycle hook and not important, but if your component needs to do something or initialize something upon creation, define it here.
    created() {
      /*init*/
    },
  };
  </script>

  