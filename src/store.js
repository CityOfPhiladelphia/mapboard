import Vue from 'vue';
import Vuex from 'vuex';

// Vue.use(Vuex);

const store = new Vuex.Store({
  // initial state
  state: {
    activeTopic: '',
  },
  getters: {},
  mutations: {
    activateTopic(state, nextTopic) {
      state.activeTopic = nextTopic;
    }
  },
  actions: {
  }
});

export default store;
