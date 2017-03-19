import Vue from 'vue';
import Vuex from 'vuex';

// when you load vuex from a script tag this seems to happen automatically
// Vue.use(Vuex);

const store = new Vuex.Store({
  // initial state
  state: {
    map: null,
    base: 'basemap',
    topic: 'dor',
    imagery: 'imagery2016',
  },
  getters: {},
  mutations: {
    setTopic(state, payload) {
      state.topic = payload.topic;
    },
    setMap(state, payload) {
      state.map = payload.map;
    },
    setBase(state, payload) {
      state.base = payload;
    }
  },
  actions: {
  }
});

export default store;
