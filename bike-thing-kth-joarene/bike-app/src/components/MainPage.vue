<!--This vue component represents the view for the Dashboard page, or "Main page" that users are navigated to upon logging in.-->
<!--The purpose of the page is to display a navbar and to consolidate information kept in other pages in one neat spot.-->

<!--Emits a logout event if user presses logout button. Presenter then lets the model know.-->

<template>
  <v-app style="height: 100vh;">
    <div class="nav">
      <!--The navbar on the left which expands on hover, with navigation to other pages.-->
      <!--the <v-something> marker denotes that its a vuetify custom component that we are using.-->
      <!--for these <v-something> markers to work, we need to wrap the template in a <v-app> declaration.-->

      <v-card>
        <v-layout>
          <!--Content on the page to the right of the navbar.-->
          <v-main class="mainContent">
            <div class="rightOfNavBar">
              <span class="Title">Dashboard</span>
              <div class="dashboardGrid">
                <!--The maintenance notification widget appears only if something needs attention-->
                <MaintenanceNotificationWidget
                  class="widget left"
                  :bikeComponents="bikeComponents"
                  @go-to-maintenance="goToMaintenance"
                />
                <!--The parking widget is now more central to draw user focus-->
                <ParkingWidget class="widget center" />

                <!--Weather widget is visually balanced on the right-->
                <WeatherWidget class="widget right" />
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
import ParkingWidget from '../widgets/ParkingWidget.vue'; // Path to ParkingWidget
import WeatherWidget from '@/widgets/WeatherWidget.vue';   // Path to WeatherWidget
import MaintenanceNotificationWidget from '@/widgets/MaintenanceNotificationWidget.vue'; 

export default {
  name: 'MainPage',
  components: {
    ParkingWidget,
    WeatherWidget,
    MaintenanceNotificationWidget 
  },
  props: {
    user: Object,
    isLoggedin: Boolean,
    bikeComponents: Array // Accept bike components as a prop
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
    goToGarage() {
      this.$emit("go-to-garage");
    },
    goToRoutes() {
      this.$emit("go-to-routes");
    },
    goToMaintenance() {
      this.$emit("go-to-maintenance");
    }
  },
};
</script>

<style scoped>
/*CSS goes in here or in the global CSS doc. This is not final and many of these css declarations are conflicting.*/
/*I'm not good at CSS myself so this was just added for testing, anyone is free to edit these values or remove them entirely. - Seb */

.Title {
  margin-bottom: 40px;
}

.rightOfNavBar {
  font-family: 'Segoe UI', sans-serif;
  font-weight: 600;
  font-size: 2.9rem;
  text-align: center;
  margin-left: 60px;
  font-weight: bold;
  margin-top: 0px;
  color: #000000;
  padding: 1rem;
}

/* Responsive dashboard layout */
.dashboardGrid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
  align-items: start;
  padding: 20px;
}

.widget {
  border: 1px solid #000;
  padding: 15px;
  height: 100%;
  min-width: 0;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

/* Grid placement hints (optional since grid handles it) */
.left {
  justify-self: start;
}
.center {
  justify-self: center;
}
.right {
  justify-self: end;
}

/* Responsive styles */
@media (max-width: 1024px) {
  .dashboardGrid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .center {
    order: -1; /* Make ParkingWidget appear first */
  }
}

@media (max-width: 600px) {
  .Title {
    font-size: 2rem;
  }

  .widget {
    padding: 10px;
  }

  .rightOfNavBar {
    margin-left: 20px;
    font-size: 2rem;
    padding: 0.5rem;
  }

  .dashboardGrid {
    gap: 15px;
    padding: 10px;
  }
}
</style>