import Vue from 'vue';
import Vuex from 'vuex';

// when you load vuex from a script tag this seems to happen automatically
// Vue.use(Vuex);

const initialState = {
  topic: 'dor',
  // the ais feature
  ais: null,
  // the leaflet map object
  map: null,
  dorParcels: [],
  pwdParcel: null,
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
    },
    setDorParcels(state, payload) {
      state.dorParcels = payload;
    },
    setPwdParcel(state, payload) {
      state.pwdParcel = payload;
    },
    setAis(state, payload) {
      state.ais = payload;
    }
  },
  actions: {
  }
});

export default store;
