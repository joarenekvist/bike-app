<!--Presenter for the dashboard page that users can reach once authenticated with google.-->
<!--Barebones right now, but it contains the MainPage view and communicates the current user-->
<!--as well as that user's log in status to the view. It also listens for the "logout" event-->
<!--in the view and relays it to the model.-->

<template>
    <div>
      <MainPage :user= "getUser" :isLoggedIn="isLoggedIn" @logout="logout" @go-to-garage="goToGarage" @go-to-routes="goToRoutes" @go-to-maintenance="goToMaintenance"/>
    </div>
</template>
  
  <script>
  import MainPage from "@/components/MainPage.vue";
  //this mapGetters and mapActions is a shorter way of declaring getters and sending an event into an action in the model.
  import { mapGetters, mapActions } from 'vuex';
  export default {
    name: "MainPagePresenter",
    components: {
      MainPage,
    },
    computed: { //this is the same as using this.$store.getters.variableName. Its just a short hand way of writing it. It just requires the import above to work.
      ...mapGetters(["getUser", "isLoggedIn"]),
    },
    methods: { //this is the same as using this.$store.dispatch.actionName. Its just a short hand way of writing it. It just requires the import above to work.
      ...mapActions(["logout", "goToGarage", "goToRoutes","goToMaintenance"]),
    },
    created() {
      /*init auth */
    },
  };
  </script>

  