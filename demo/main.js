// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

const vueWpAdminAjax = process.env.NODE_ENV === 'development'
  ? require('../src/vue-wp-admin-ajax.js')
  : require('../dist/vue-wp-admin-ajax.js')

Vue.config.productionTip = false

// Using plugin
Vue.use(vueWpAdminAjax)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
