import Vue from 'vue';
import Vuex from 'vuex';

// when you load vuex from a script tag this seems to happen automatically
// Vue.use(Vuex);

function createStore(config) {
  const defaultTopic = config.topics[0];

  const initialState = {
    topic: defaultTopic.key,
    // the ais feature
    ais: null,
    // the leaflet map object
    map: null,
    dorParcels: [],
    pwdParcel: null,
    topicData: {
    },
    basemap: defaultTopic.basemap,
    cyclomediaActive: false,
    cyclomediaViewer: null,
    // we need this to know whether or not to force an update on the first show
    pictometryActive: false
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

  // TODO standardize how payloads are passed around/handled
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
      setBasemap(state, payload) {
        state.basemap = payload;
      },
      setCyclomediaActive(state, payload) {
        state.cyclomediaActive = payload;
      },
      setCyclomediaViewer(state, payload) {
        state.cyclomediaViewer = payload;
      },
      setPictometryActive(state, payload) {
        state.pictometryActive = payload;
      }
      setTopicData(state, payload) {
        const key = payload.key;
        const data = payload.data;
        state.topicData[key] = data;
      },
    }
  });
}

export default createStore;
