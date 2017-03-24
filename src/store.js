import Vue from 'vue';
import Vuex from 'vuex';

// when you load vuex from a script tag this seems to happen automatically
// Vue.use(Vuex);

const initialState = {
  topic: 'dor',
  // the ais feature
  ais: {},
  // the leaflet map object
  map: {},
  dorParcel: {},
  pwdParcel: {},
  topicData: {

  },
  // mapFeatures: {
  //   markers: [
  //     {
  //       geometry: '',
  //       // optional - mainly for symbology
  //       options: {}
  //     }
  //   ],
  //   polygons: [
  //
  //   ]
  // },
};

const store = new Vuex.Store({
  state: initialState,
  getters: {},
  mutations: {
    setTopic(state, payload) {
      state.topic = payload.topic;
    },
    setMap(state, payload) {
      state.map = payload.map;
    }
  },
  actions: {
  }
});

export default store;
