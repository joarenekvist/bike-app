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
    <MaintenancePage :someProp="getSomeProp" @some-event-name="handleThisEvent" />
  </div>
</template>

<!--Then we define the logic (imports, name, declared components, computed values from the model, and methods)-->
<script>
//first the imports. any custom component should be imported here before it is declared after.
import MaintenancePage from "@/components/MaintenancePage.vue";

//the default export (this presenter itself))
export default {
  name: "MaintenancePagePresenter", //needs a unique name
  components: {
    MaintenancePage, //needs to declare the custom component (view) contained within.
  },

  //here is where we declare values fetched FROM the model (vuex store, READ ONLY). called by using this.$store.getters.someVariableInModel.
  //by putting them in the "computed" section we make sure that these values are reactive, and reflect changes if they are altered elsewhere.
  computed: {
    //values from store
    getSomeProp() {
      return this.$store.getters.somePropName || null; //important to use an OR statement (||) in case its not yet defined. catches edge cases.
    },
  },

  //here is where we define methods that are bound to the events we listen to in the view. in the template above you will see
  //that we listen for the event someEventName in the view, and call the method "handleThisEvent" defined here below if the event is
  //emitted to us. syntax: <Component @some-event-name="handleThisEvent"/>
  methods: {
    handleThisEvent(theDataThatCameWith) {
      //if we passed data with the event in the view, we need to declare the parameter here too.
      console.log(
        "The view sent the presenter this data: ",
        theDataThatCameWith
      );
      this.$store.dispatch("someActionInTheModel", theDataThatCameWith); //this is how we call the action in the model as a reaction to the event.
    },
  },

  //this is a lifecycle hook and not important, but if your component needs to do something or initialize something upon creation, define it here.
  created() {
    /*init*/
  },
};
</script>
