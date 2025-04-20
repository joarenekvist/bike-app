<!--This is the base app HTML component. It contains ONLY a router and should never contain anything else.-->
<!--That router is responsible for rendering our different presenters (containing views/components/pages).-->
<!--All in all, we probably never need to change this file again.-->

<template>
  <router-view></router-view>  <!-- This will render the active route -->
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>