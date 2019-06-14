import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config : {},
    count: 0
  },
  getters: {
    doubleup(state) {
      return state.count * 2;
    },
    config (state) {
      return state.config;
    }
  },
  mutations: {
    SET_CONFIG : (state, payload) => {
      state.config = JSON.parse(JSON.stringify(payload));
    },
    increment(state) {
      state.count++;
    },
    set_counter(state, newCount) {
      state.count = newCount;
    },
  },
  actions: {
    setConfig (context, cfg) {
      context.commit('SET_CONFIG', cfg)
    },
    reset_counter(context) {
      context.commit('set_counter', 0)
    }
  }
});