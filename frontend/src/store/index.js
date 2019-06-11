import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    count: 0
  },
  getters: {
    doubleup(state) {
      return state.count * 2;
    },
  },
  mutations: {
    increment(state) {
      state.count++;
    },
    set_counter(state, newCount) {
      state.count = newCount;
    },
  },
  actions: {
    reset_counter(context) {
      context.commit('set_counter', 0)
    }
  }
});