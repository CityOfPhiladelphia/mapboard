import Vue from 'vue';
import Vuex from 'vuex';

// when you load vuex from a script tag this seems to happen automatically
// Vue.use(Vuex);

function createStore(config) {
  const initialState = {
    topic: config.topics[0].key,
    // the ais feature
    ais: null,
    // the leaflet map object
    map: null,
    dorParcels: [],
    pwdParcel: null,
    topicData: {
    },
    imageryOn: false,
    imageryYear: 'imagery2016',
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

  return new Vuex.Store({
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
      },
      toggleBaseAndImagery(state, payload) {
        state.imageryOn = payload;
      },
      toggleImageryYear(state, payload) {
        state.imageryYear = payload;
      }
    }
  });
}

export default createStore;
