<template>
  <v-app>
    <!-- Persistent Top Navbar -->
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>The Bike Thing
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text @click="$router.push('/main')">Dashboard</v-btn>
      <v-btn text @click="$router.push('/garage')">Garage</v-btn>
      <v-btn text @click="$router.push('/routes')">Routes</v-btn>
      <v-btn text @click="$router.push('/maintenance')">Maintenance</v-btn>
      <v-btn text @click="logout">Logout</v-btn>
      <v-btn text @click="$router.push('/user-settings')"><img :src="getUser.photoURL" alt="User Profile" style="height: 38px; width: 38px;" /></v-btn>
    </v-app-bar>

    <!-- Main content for the active route -->
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'NavbarWrapperPresenter',
  methods: {
    ...mapActions(['logout']),
  },
  computed: { //this is the same as using this.$store.getters.variableName. Its just a short hand way of writing it. It just requires the import above to work.
      ...mapGetters(["getUser"]),
    },
};
</script>
