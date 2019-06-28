import Vue from 'vue'
import Router from 'vue-router'
import Admin from './views/Admin/Admin.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Administration',
      component: Admin
    },{
      path: '/Preferences',
      name: 'Preferences',
      component: () => import('./views/Preferences/Preferences.vue')
    },{
      path: '/HDI',
      name: 'HDI',
      component: () => import('./views/HDI/HDI.vue')
    },{
      path: '/sql',
      name: 'sql',
      // route level code-splitting
      // this generates a separate chunk (sql.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/SQL.vue')
    }
  ]
})