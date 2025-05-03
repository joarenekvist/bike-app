// This file defines the "ROUTER" which lets us use different URL end points to distinguish between our
// different presenters and views. Whenever we add a new page/tab on our website it needs to be added here below.
// I'll be completely honest and say I don't entirely understand how router works, but usually it works to just
// follow the example below and ask Chat GPT for help if we get stuck. The idea is to define "routes" in the routes
// section, and tell the router if that route requires authentication or not (is the user logged in?).
// We determine if the user is logged in from the model value "isLoggedIn".

import { createRouter, createWebHistory } from 'vue-router';
import StartPagePresenter from './presenters/StartPagePresenter.vue';
import MainPagePresenter from './presenters/MainPagePresenter.vue';
import { store } from './js/store.js'; // Import your Vuex store
import VirtualGaragePagePresenter from './presenters/VirtualGaragePagePresenter.vue';
import RoutesPagePresenter from './presenters/RoutesPagePresenter.vue';
import MaintenancePagePresenter from './presenters/MaintenancePagePresenter.vue';
import NavbarWrapperPresenter from './presenters/NavbarWrapperPresenter.vue';
import UserSettingsPagePresenter from './presenters/UserSettingsPagePresenter.vue';

const routes = [
  {
    path: '/',
    name: 'StartPage',
    component: StartPagePresenter,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: NavbarWrapperPresenter,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'main',
        name: 'MainPage',
        component: MainPagePresenter,
      },
      {
        path: 'garage',
        name: 'VirtualGarage',
        component: VirtualGaragePagePresenter,
      },
      {
        path: 'routes',
        name: 'Routes',
        component: RoutesPagePresenter,
      },
      {
        path: 'maintenance',
        name: 'Maintenance',
        component: MaintenancePagePresenter,
      },
      {
        path: 'user-settings',
        name: 'UserSettings',
        component: UserSettingsPagePresenter,
      },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to check authentication before each route change
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isLoggedIn;

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    // If the route requires authentication and the user is not logged in, redirect to StartPage
    next('/');
  } else {
    next(); // Proceed to the route
  }
});

export default router;
