const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  chainWebpack: config => { //to make the api key for google maps available in index.html, in public.
    config.plugin('html').tap(args => {
      args[0].googleMapsApiKey = process.env.VUE_APP_GOOGLEMAPS_API_KEY;
      return args;
    });
  }
})
