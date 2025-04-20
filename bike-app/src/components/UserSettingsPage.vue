
<template> <!--The template marker denotes the html content of our .vue component. all the html code that you see on the page goes in this section.-->
    <v-app style="height: 100vh;"> <!--We wrap the div with v-app to be able to use vuetify components. not needed if we're building from scratch. -->
    <div class="wholeSettings">
        <span class="pageTitle">User Settings</span>
        <div>
            <span class="userDataField"><img :src="user.photoURL" alt="Profile Pic" style="height: 38px; width: 38px;" /> {{user.name }}</span>
        </div>
        <div class="formItself">
            <!--the form-->
      <v-expand-transition>
        <v-card outlined>
          <v-card-text>
            <v-form @submit.prevent="saveSettings">
              <v-text-field 
                v-model.number="currentChosenSettings.defaultComponentMileage" 
                label="Default component lifetime (km)"
                type="number" 
                outlined
                dense
                class="mb-4"
                required 
              />
              <v-btn 
                color="primary" 
                type="submit"
                elevation="2"
                class="px-6"
              >
                Save Settings
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-expand-transition>

        </div>
    </div>
    </v-app>
</template> 
  
<script>
  export default {
    name: 'UserSettingsPage', 

    components:{

    },

    created() {
      this.currentChosenSettings = this.userSettings;
      console.log("user settings: ", this.userSettings);
      console.log("chosen settings ", this.currentChosenSettings);
    },

    props:{
        user: Object,
        userSettings: Object,
    },

    data() {
    return {
      currentChosenSettings: {defaultComponentMileage: null, }
    };
  },
    methods: {
    saveSettings() {

      },
    },
  };
  </script>

<style scoped>
  .userDataField{
      margin-bottom: 50px;  /*add some space at the top. also accepts margin-top, margin-left, margin-right, etc.*/
      font-family: 'Segoe UI', sans-serif; /*apply a font*/
      font-weight: 30;  /*slightly bolds the font*/
      font-size: 1.9rem;  /*adjusts font size for the text*/
      text-align: center;  /*center the text*/
      color: #000000;  /*color for the text */
      display: flex;
      flex-direction: column; /* ← stacks children vertically */
      align-items: center; /* optional: aligns text to the left */
  }
  .pageTitle{
      margin-bottom: 20px;  /*add some space at the top. also accepts margin-top, margin-left, margin-right, etc.*/
      font-family: 'Segoe UI', sans-serif; /*apply a font*/
      font-weight: 900;  /*slightly bolds the font*/
      font-size: 2.5rem;  /*adjusts font size for the text*/
      text-align: center;  /*center the text*/
      color: #000000;  /*color for the text */
      display: flex;
      flex-direction: column; /* ← stacks children vertically */
      align-items: center; /* optional: aligns text to the left */
  }
</style>