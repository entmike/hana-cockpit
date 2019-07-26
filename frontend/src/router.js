import Vue from 'vue'
import Router from 'vue-router'
import Admin from './views/Admin/Admin.vue'
import Login from './views/Login/Login.vue'
import Overview from './views/Overview/Overview.vue'

Vue.use(Router)

let router =  new Router({
  routes: [
    {
      path : '/login',
      name : 'Login',
      component : Login,
      meta : {
        guest : true
      }
    },{
      path : '/logout',
      name : 'Logout',
      meta : {
        guest : true
      }
    },{
      path: '/',
      name: 'Overview',
      component: Overview,
      meta : {
        requiresAuth : true
      }
    },{
      path: '/Administration',
      name: 'Administration',
      component: Admin,
      meta : {
        requiresAuth : true
      }
    },{
      path: '/Preferences',
      name: 'Preferences',
      component: () => import('./views/Preferences/Preferences.vue'),
      meta : {
        requiresAuth : true
      }
    },{
      path: '/HDI',
      name: 'HDI',
      component: () => import('./views/HDI/HDI.vue'),
      meta : {
        requiresAuth : true
      }
    },{
      path: '/sql',
      name: 'sql',
      // route level code-splitting
      // this generates a separate chunk (sql.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/SQL.vue'),
      meta : {
        requiresAuth : true
      }
    }
  ]
});

// TODO: Switch to JWT
router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
      if (localStorage.getItem('appPassword') == null) {
        next({
            path: '/login',
            params: { nextUrl: to.fullPath }
        })
      } else {
        next();
      }
  } else if(to.matched.some(record => record.path=='/logout')) {
      localStorage.removeItem('appPassword');
      next('/login');
  } else if(to.matched.some(record => record.meta.guest)) {
    if(localStorage.getItem('appPassword') == null){
      next()
    }else{
      next({
        path : '/'
      })
    }
  } else {
      next() 
  }
})

export default router;