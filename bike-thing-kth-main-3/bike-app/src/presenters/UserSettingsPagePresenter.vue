<!--This is an example of a presenter written as a vue object for the page "ExamplePage" in the components folder.-->
<!--the goal is for this file to serve as a template and copy-paste base whenever a new presenter needs to be written,-->
<!--so that the development process can be a bit easier to understand. -->

<!--Just like in our components, we have a <template> section responsible for our HTML, <script> to define the logic-->
<!--and optional <style scoped> section for CSS styling.-->

<!--Crucially when we write our presenters, we are writing the overarching component responsible for receiving "events"-->
<!--and sending them to the model layer above. We do this by contacing the "vuex" store using methods such as -->
<!--this.$store.getters.someVariableInTheModel , and then binding them to our components. We bind with the syntax -->
<!-- <SomePageWeMade    :propNameInComponent = "variableNameInPresenter"/>. See code below. To bind a method to an event,-->
<!-- we use the @ symbol:  <SomePageWeMade    @eventNameInComponent = "methodNameInPresenter"-->

<!--The goal is to listen for events in the component, which they call using this.emit, and binding that event to a -->
<!--method here in the presenter. That method will then contact the model if it needs to (which it usually does). -->


<!--First we define the template. The presenter should only contain the views it is the presenter for.-->
<template>
    <div>
      <UserSettingsPage :user= "getUser" :userSettings="getUserSettings" 
      @save-user-settings="saveUserSettings" @add-new-device="addNewDevice"/>
    </div>
</template>
<!--Then we define the logic (imports, name, declared components, computed values from the model, and methods)-->
<script>
  //first the imports. any custom component should be imported here before it is declared after.
  import UserSettingsPage from "@/components/UserSettingsPage.vue";
  
  //the default export (this presenter itself))
  export default {
    name: "UserSettingsPagePresenter",   //needs a unique name
    components: {
      UserSettingsPage,   //needs to declare the custom component (view) contained within.
    },

    //here is where we declare values fetched FROM the model (vuex store, READ ONLY). called by using this.$store.getters.someVariableInModel.
    //by putting them in the "computed" section we make sure that these values are reactive, and reflect changes if they are altered elsewhere.
    computed: { //values from store
        getUser() {
            return this.$store.getters.getUser || {name: "Error", email: "N/A", photoURL: null};  //important to use an OR statement (||) in case its not yet defined. catches edge cases.
        },
        getUserSettings(){
          return this.$store.getters.getUserSettings || {};
        },
    },

    //here is where we define methods that are bound to the events we listen to in the view. in the template above you will see 
    //that we listen for the event someEventName in the view, and call the method "handleThisEvent" defined here below if the event is
    //emitted to us. syntax: <Component @some-event-name="handleThisEvent"/>
    methods: {
      saveUserSettings(settings) { //if we passed data with the event in the view, we need to declare the parameter here too.
            console.log('Settings received in presenter, sending to model for firebase saving: ', settings);
            this.$store.dispatch("saveUserSettings", settings); //this is how we call the action in the model as a reaction to the event.
      },
      addNewDevice(name){
          console.log('Trying to save device: ', name);
          this.$store.dispatch("registerNewDevice", name); //this is how we call the action in the model as a reaction to the event.
      }
    },

    //this is a lifecycle hook and not important, but if your component needs to do something or initialize something upon creation, define it here.
    created() {
      /*init*/
    },
  };
  </script>

  