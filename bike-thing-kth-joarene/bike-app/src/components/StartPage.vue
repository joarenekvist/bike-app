<!--Start page for the appp that users are redirected to before verifying their identity through google login.-->
<!--Displays a video in the background and a login button on top.-->
<!--Emits a "login" event to its presenter which in turn tells the model to update itself for a new login.-->

<template>
    <div class="background-video-wrapper">
      <video autoplay loop muted class="background-video">
        <source src="../assets/video/bgvideo.mp4" type="video/mp4" />
      </video>
      <div class="content-overlay">
        <!-- Add other components here -->
        <h1>Group 13 Bike Thing</h1>
        <span>An affordable, all-in-one solution to your biking needs.</span>
        <span>Log in to get started!</span>
        <button id="authButton" class="icon-container-start-page" @click="googleLogin">
        Log in
      </button>
      </div>
    </div>
</template>

<script>
import { auth, googleProvider } from '@/js/firebase.js'; // Firebase setup
import { signInWithPopup } from 'firebase/auth';

export default {
  name: 'StartPage',
  props: {
    user: Object,
    isLoggedIn: Boolean,
  },

  computed: {

  },
  methods: {
    async googleLogin() {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        // Store user in Vuex store and hopefully switch view
        const returnVal = {name: result.user.displayName, email: result.user.email, photoURL: result.user.photoURL, uid: result.user.uid};
        console.log(returnVal);
        this.$emit('login', returnVal);
        console.log("Done emitting");
      } catch (error) {
        console.error('Error logging in with Google:', error.message);
      }
    },
  },
};
</script>
<style scoped>
/* CSS on this page pretty much works as it should so try not to edit too much*/
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box; /*prevents any element from overflowing due to padding or borders */
}

html, body {
  height: 100%; /*ensures that the body fills the whole page */
  width: 100%; /*ensures that the body fills the whole page */
  overflow: hidden; /*prevents unwanted scrolling */
}

.background-video-wrapper {
  position: absolute;  /*this places it at 0,0 relative to its nearest positioned ancestor (in this case, the <body>) */
  top: 0;
  left: 0;
  width: 100vw; /*full viewport width */
  height: 100vh; /*full viewport height */
}

.background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /*ensures video covers the entire screen */
  z-index: -1; /*places the video behind the text */
}

.content-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /*centers the text */
  text-align: center;
  color: white; 
  z-index: 1; /*ensure the text appears above the video */
}

h1 {
  font-size: 3rem; /*we can adjust as necessary*/
  margin-bottom: 10px;
}

span {
  display: block;
  font-size: 1.2rem;
  margin-bottom: 8px;
}

button.icon-container-start-page {
  padding: 12px 24px;
  background-color: rgba(255, 255, 255, 0.7); /*light background for visibility but we can change this if we want to*/
  border: none;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 5px;
  margin-top: 15px;
}

button.icon-container-start-page:hover {
  background-color: rgba(255, 255, 255, 1); /*darker on hover */
}
</style>

