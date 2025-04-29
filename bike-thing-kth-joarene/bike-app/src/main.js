//This is our main.js file where our external library imports and integrations occur.
//by calling app.use(someLibrary) we integrate that library fully inside the whole DOM and make it accessible everywhere.
//So far this includes vuetify, vuex and router. Vuetify is for using custom components, vuex for a reactive model, and router
//for dynamic webpage hash routing using the slash keyword in the URL.

import { createApp } from 'vue';
import App from './App.vue';
import store from '@/js/store.js'; //imports the Vuex store (reactive model) that we have written ourselves
import '@mdi/font/css/materialdesignicons.css';
import '@/css/css.css'
import { createVuetify } from 'vuetify';
import 'vuetify/styles'; //imports the Vuetify styles
import router from './router'; //imports the router
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
    components, //registers Vuetify components
    directives, //registers Vuetify directives
    theme: { defaultTheme: 'light' },
    icons: {
    defaultSet: 'mdi', //ensures Vuetify uses MDI icons
    },
});
const app = createApp(App);

app.use(vuetify).use(store).use(router); //registers all of our libraries

//initialize Firebase auth state listener for our auto login
store.dispatch('initAuthListener');

app.mount('#app');
