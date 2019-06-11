import Vue from 'vue'
import Router from 'vue-router'
import Admin from './views/Admin.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Administration',
      component: Admin
    }
  ]
})