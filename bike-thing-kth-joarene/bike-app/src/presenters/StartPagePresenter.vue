<!--Presenter for the start page that users see before they authenticate themselves using google.-->
<!--Contains the start page view, and relays the user login data between model and view.-->
<!--Listens for the login event in the view, and sends the user data up to the model once user has been logged in.-->
<!--This authentication step should then automatically redirect the user to the dashboard page using the "router" in the DOM.-->

<template>
    <div>
      <StartPage :user= "getUser" :isLoggedIn="isLoggedIn" @login="handleLogin" @logout="handleLogout"/>
    </div>
  </template>
  
  <script>
  import StartPage from "@/components/StartPage.vue";

  export default {
    name: "StartPagePresenter",
    components: {
      StartPage,
    },
    computed: { //values from model (store)
        getUser() {
            return this.$store.getters.user || null;
        },
        isLoggedIn() {
            return this.$store.getters.isLoggedIn || null;
        },
    },
    methods: { //methods to alter model
      handleLogin(userData) {
            console.log('User tries to login from start page view');
            this.$store.dispatch("login", userData); 
      },
      handleLogout() { //this is not yet ever called. idea is that if the user navigated back here while logged in the button should now log them out instead.
            console.log('User tries to logout from start page view');
            this.$store.dispatch("logout");
      },
    },
    created() {
      /*init auth */
    },
  };
  </script>

  