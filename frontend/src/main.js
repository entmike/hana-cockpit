import Vue from 'vue';
import './plugins/vuetify'
import VueSocketio from 'vue-socket.io';

import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';
import socketio from 'socket.io-client';

Vue.use(new VueSocketio({
    debug: true,
    connection: `${process.env.VUE_APP_HANA_APP_BACKEND}`,
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    },
    // options: { path: "/my-app/" } //Optional options
}));


Vue.config.productionTip = false;
new Vue({
  sockets: {
    // TODO: App Config?
  },
  router,
  store,
  render: h => h(App)
}).$mount('#app');
