<!--This vue component represents the view for the Dashboard page, or "Main page" that users are navigated to upon logging in.-->
<!--The purpose of the page is to display a navbar and to consolidate information kept in other pages in one neat spot.-->

<!--Emits a logout event if user presses logout button. Presenter then lets the model know.-->

<template>
    <v-app style="height: 100vh;">
    <div class="nav">
        <!--The navbar on the left which expands on hover, with navigation to to other pages.-->
        <!--the <v-something> marker denotes that its a vuetify custom component that we are using.-->
        <!--for these <v-something> markers to work, we need to wrap the template in a <v-app> declaration.-->

        <v-card><v-layout><v-navigation-drawer location="left" floating rail expand-on-hover sticky style="transform: translateX(0%); top:-10px;">
        <v-list><v-list-item :prepend-avatar= user.photoURL :subtitle= user.email :title= user.name></v-list-item></v-list>
        <v-divider></v-divider>
        <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-bike" title="Dashboard" value="dash"></v-list-item>
        <v-list-item prepend-icon="mdi-bike" title="My Virtual Garage" value="myfiles" @click="goToGarage"></v-list-item>
        <v-list-item prepend-icon="mdi-routes" title="Routes" value="routes" @click="goToRoutes"></v-list-item>
        <v-list-item prepend-icon="mdi-wrench-clock" title="Maintenance" value="starred" @click="goToMaintenance"></v-list-item>
        <v-list-item prepend-icon="mdi-logout" title="Logout" value="logoutIcon" @click="logout"></v-list-item>
        </v-list>
        </v-navigation-drawer>

        <!--Content on the page to the right of the navbar.-->
        <v-main style="height: 100vh;">
            <div class="rightOfNavBar">
                <span class="Title">Dashboard</span>
                <div class="sideBySide">
                    <ParkingWidget class="child"></ParkingWidget> 
                    <WeatherWidget class="child"></WeatherWidget>
                </div>
            </div>
        </v-main>
        </v-layout>
        </v-card>
    </div>
    </v-app>
  </template>
  
  <script>
  import { auth } from '@/js/firebase.js'; // Firebase setup
  import { signOut } from 'firebase/auth'; // Firebase signOut
  import ParkingWidget from '../widgets/ParkingWidget.vue';
  import WeatherWidget from '@/widgets/WeatherWidget.vue';
  
  export default {
    name: 'MainPage',
    components:{
        ParkingWidget,
        WeatherWidget,
    },
    props:{
        user: Object,
        isLoggedin: Boolean,
    },
    data() {
    return {

    };
  },
    methods: {
      async logout() {
        try {
          await signOut(auth);
          this.$emit("logout");
        } catch (error) {
          console.error('Error logging out:', error.message);
        }
      },
      goToGarage(){
        this.$emit("go-to-garage");
      },
      goToRoutes(){
        this.$emit("go-to-routes");
      },
      goToMaintenance(){
        this.$emit("go-to-maintenance");
      }
    },
  };
  </script>
  <style scoped>
  /*CSS goes in here or in the global CSS doc. This is not final and many of these css declarations are conflicting.*/
  /*I'm not good at CSS myself so this was just added for testing, anyone is free to edit these values or remove them entirely. - Seb */

  .Title{
      margin-bottom: 150px;  
  }
  .rightOfNavBar{
      font-family: 'Segoe UI', sans-serif; 
      font-weight: 600;  
      font-size: 2.9rem;  
      text-align: center;  
      margin-left: 60px;  
      font-weight: bold;
      margin-top: 0px;  
      color: #000000;  
    }
.sideBySide {
  display: flex;           
  flex-direction: column;
  gap: 10px;               
  flex-wrap: wrap;         
  margin-top: 15px;
}

.child {
  border: 1px solid #000;  
  padding: 10px;           
}
</style>