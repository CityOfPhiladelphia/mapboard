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
    geocode: {
      status: null,
      data: null
    },
    // the leaflet map object
    map: {
      center: config.map.center,
      zoom: config.map.zoom,
      map: null,
      bounds: null,
      basemap: defaultTopic.basemap,
      // features: {
      //   markers: [
      //     // {
      //     //   geometry: '',
      //     //   // optional - mainly for symbology
      //     //   options: {}
      //     // }
      //   ],
      //   polygons: [
      //
      //   ]
      // }
    },
    dorParcels: [],
    pwdParcel: null,
    sources,
    cyclomedia: {
      active: false,
      viewer: null,
      recordings: [],
      locFromApp: null,
      locFromViewer: null,
    },
    // we need this to know whether or not to force an update on the first show
    pictometry: {
      active: false
    },
    activeFeature: null,
    lastSearchMethod: null
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
        state.sources[key].status = status;
      },
      setSourceData(state, payload) {
        const key = payload.key;
        const data = payload.data;
        state.sources[key].data = data;
      },
      setMap(state, payload) {
        state.map.map = payload.map;
      },
      setMapBounds(state, payload) {
        state.map.bounds = payload.bounds
      },
      setMapCenter(state, payload) {
        state.map.center = payload;
      },
      setMapZoom(state, payload) {
        state.map.zoom = payload
      },
      setDorParcels(state, payload) {
        state.dorParcels = payload;
      },
      setPwdParcel(state, payload) {
        state.pwdParcel = payload;
      },
      setGeocodeStatus(state, payload) {
        state.geocode.status = payload;
      },
      setGeocodeData(state, payload) {
        state.geocode.data = payload;
      },
      setBasemap(state, payload) {
        state.map.basemap = payload;
      },
      setPictometryActive(state, payload) {
        if (!config.pictometry.enabled) {
          return;
        }
        state.pictometry.active = payload;
      },
      setCyclomediaActive(state, payload) {
        if (!config.cyclomedia.enabled) {
          return;
        }
        state.cyclomedia.active = payload;
      },
      setCyclomediaViewer(state, payload) {
        state.cyclomedia.viewer = payload;
      },
      setCyclomediaRecordings(state, payload) {
        state.cyclomedia.recordings = payload;
      },
      setCyclomediaLocFromApp(state, payload) {
        state.cyclomedia.locFromApp = payload;
      },
      setCyclomediaLocFromViewer(state, payload) {
        state.cyclomedia.locFromViewer = payload;
      },
      setActiveFeature(state, payload) {
        state.activeFeature = payload;
      },
      setLastSearchMethod(state, payload) {
        state.lastSearchMethod = payload;
      }
    }
  });
}

export default createStore;
