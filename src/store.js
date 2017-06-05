import Vue from 'vue';
import Vuex from 'vuex';

// when you load vuex from a script tag this seems to happen automatically
// Vue.use(Vuex);

function createStore(config) {
  const defaultTopic = config.topics[0];

  // create initial state for sources. data key => {}
  const sourceKeys = Object.keys(config.dataSources || {});
  const sources = sourceKeys.reduce((o, key) => {
    let val;
    // if the source has targets, just set it to be an empty object
    if (config.dataSources[key].targets) {
      val = {
        children: {}
      };
    } else {
      val = {
       // we have to define these here, because vue can't observe properties that
       // are added later.
       status: null,
       data: null
     };
    }
    
    o[key] = val;

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

  // this is used by data source setters to get the object they should affect in
  // state
  function getOrCreateTargetObj(state, key, targetId) {
    const sourceObj = state.sources[key];
    let targetObj = sourceObj;
    const keyWithId = `${key}-${targetId}`;
    if (targetId) {
      if (!Object.keys(state.sources).includes(keyWithId)) {
        state.sources[keyWithId] = {
          status: null,
          data: null
        };
      }
      targetObj = state.sources[keyWithId]
    }
    return targetObj;
  }

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

        // if a target id was passed in, set the status for that target
        const targetId = payload.targetId;
        const targetObj = getOrCreateTargetObj(state, key, targetId);

        // if this is a related query (aka has targets), set the source status to be
        // the lowest common denominator of all target statuses.

        targetObj.status = status;
      },
      setSourceData(state, payload) {
        const key = payload.key;
        const data = payload.data;

        // if a target id was passed in, set the data object for that target
        const targetId = payload.targetId;
        const targetObj = getOrCreateTargetObj(state, key, targetId);

        targetObj.data = data;
      },
      setMap(state, payload) {
        state.map.map = payload.map;
      },
      setMapBounds(state, payload) {
        state.map.bounds = payload.bounds
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
