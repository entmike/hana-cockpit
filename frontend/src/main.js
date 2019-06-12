import Vue from 'vue';
import './plugins/vuetify'
import VueSocketio from 'vue-socket.io';
import VueCodemirror from 'vue-codemirror';
import JsonExcel from 'vue-json-excel'

// require styles
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import './plugins/vuetify';

import App from './App.vue';
import router from './router';
import store from './store';
import socketio from 'socket.io-client';

Vue.use(VueCodemirror, { 
  options: { 
    tabSize: 4,
    styleActiveLine: true,
    lineNumbers: true,
    line: true,
    mode: 'text/x-mysql',
    // theme: 'solarized light'
    theme: 'base16-dark'
  },
  events: ['scroll']
})
Vue.component('downloadExcel', JsonExcel);

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
