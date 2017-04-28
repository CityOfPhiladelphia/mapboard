import Vue from 'vue';
import Vuex from 'vuex';

// when you load vuex from a script tag this seems to happen automatically
// Vue.use(Vuex);

function createStore(config) {
  const defaultTopic = config.topics[0];

  // create initial state for sources. data key => {}
  const sourceKeys = Object.keys(config.dataSources || {});
  const sources = sourceKeys.reduce((o, key) => {
    o[key] = {
      // we have to define these here, because vue can't observe properties that
      // are added later. 
      status: null,
      data: null
    };
    return o;
  }, {});

  const initialState = {
    activeTopic: defaultTopic.key,
    // the ais feature
    ais: null,
    // the leaflet map object
    map: null,
    dorParcels: [],
    pwdParcel: null,
    sources,
    basemap: defaultTopic.basemap,
    cyclomediaActive: false,
    cyclomediaViewer: null,
    cycloFeatureGroup: null,
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
      setActiveTopic(state, payload) {
        state.activeTopic = payload.topic;
      },
      setSourceStatus(state, payload) {
        const key = payload.key;
        const status = payload.status;
        console.log('set source status', status);
        state.sources[key].status = status;
      },
      setSourceData(state, payload) {
        const key = payload.key;
        const data = payload.data;
        state.sources[key].data = data;
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
      },
      setCycloFeatureGroup(state, payload) {
        state.cycloFeatureGroup = payload;
      }
    }
  });
}

export default createStore;
