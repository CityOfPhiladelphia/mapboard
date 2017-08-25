import Vue from 'vue';
import Vuex from 'vuex';

// when you load vuex from a script tag this seems to happen automatically
// Vue.use(Vuex);

// this grabs horizontal table ids from an array of topic components,
// recursively
function getTableIdsFromComps(comps = []) {
  // const topics = config.topics;

  let tableIds = [];

  for (let comp of comps) {
    const options = comp.options || {};
    const innerComps = options.components;

    // if this is a "group" component, recurse
    if (innerComps) {
      const innerTableIds = getTableIdsFromComps(innerComps);
      tableIds = tableIds.concat(innerTableIds);
      continue;
    }

    // skip comps that aren't horizontal tables
    if (comp.type !== 'horizontal-table') {
      continue;
    }

    const tableId = comp._id;

    tableIds.push(tableId);
  }

  return tableIds;
}

// this makes the empty filtered data object given a list of topics.
function createFilteredData(config) {
  const topics = config.topics;
  let tableIds = [];

  for (let topic of topics) {
    const comps = topic.components;
    const compTableIds = getTableIdsFromComps(comps);
    tableIds = tableIds.concat(compTableIds);
  }

  const filteredData = tableIds.reduce((acc, tableId) => {
    acc[tableId] = [];
    return acc;
  }, {});

  return filteredData;
}

function createStore(config) {
  const defaultTopic = config.topics[0];

  // create initial state for sources. data key => {}
  const sourceKeys = Object.keys(config.dataSources || {});
  const sources = sourceKeys.reduce((o, key) => {
    let val;
    // if the source has targets, just set it to be an empty object
    if (config.dataSources[key].targets) {
      val = {
        targets: {}
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
      data: null,
      input: null
    },
    lastSearchMethod: null,
    // the leaflet map object
    map: {
      center: config.map.center,
      zoom: config.map.zoom,
      map: null,
      basemap: defaultTopic.basemap,
      imagery: 'imagery2017',
      shouldShowImagery: false,
      // circleMarkers: [],
      // this is the key for the active overlay image (eg regmap)
      imageOverlay: null,
      imageOverlayOpacity: null,
      filters: [],
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
    activeDorParcel: null,
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
      ipa: null,
      active: false,
      shapeIds: [],
      pngMarkerIds: [],
      zoom: null,
      // this is the state of the main leaflet map. when these values change
      // the pictometry widget should react. the reason these are duplicated
      // here is to avoid an infinite loop in the Map component when the
      // viewport changes.
      map: {
        center: config.map.center,
        zoom: config.map.zoom
      }
    },
    tables: {
      // table id => filtered rows
      filteredData: createFilteredData(config),
    },
    activeFeature: {
      featureId: null,
      tableId: null
    }
  };

  // TODO standardize how payloads are passed around/handled
  return new Vuex.Store({
    state: initialState,
    // getters: {
    //   topicTables: (state, getters) => (activeTopicKey) => {
    //     console.log(state.tables);
    //     return state.tables.filter(table => table.key === activeTopicKey);
    //   }
    // },
    getters: {
      visibleTableIds(state) {
        // get active topic
        const activeTopic = state.activeTopic;

        if (!activeTopic) {
          return [];
        }

        // get horizontal table ids for that topic
        const activeTopicConfig = (config.topics.filter(topic => topic.key === activeTopic) || [])[0];
        const comps = activeTopicConfig.components;

        return getTableIdsFromComps(comps);
      }
    },
    mutations: {
      setTables(state, payload) {
        state.tables = payload;
      },
      setTableFilteredData(state, payload) {
        const { tableId, data } = payload;

        // check for not-null table id
        if (!tableId) return;

        state.tables.filteredData[tableId] = data;
      },
      setActiveTopic(state, payload) {
        state.activeTopic = payload;
      },
      setSourceStatus(state, payload) {
        const key = payload.key;
        const status = payload.status;

        // if a target id was passed in, set the status for that target
        const targetId = payload.targetId;

        if (targetId) {
          state.sources[key].targets[targetId].status = status;
        } else {
          state.sources[key].status = status;
        }
      },
      setSourceData(state, payload) {
        const key = payload.key;
        const data = payload.data;

        // if a target id was passed in, set the data object for that target
        const targetId = payload.targetId;

        if (targetId) {
          state.sources[key].targets[targetId].data = data;
        } else {
          state.sources[key].data = data;
        }
      },
      setMapFilters(state, payload) {
        state.map.filters = payload;
      },
      // this sets empty targets for a data source
      createEmptySourceTargets(state, payload) {
        const {key, targetIds} = payload;
        state.sources[key].targets = targetIds.reduce((acc, targetId) => {
          acc[targetId] = {
            status: null,
            data: null
          };
          return acc;
        }, {});
      },
      clearSourceTargets(state, payload) {
        const key = payload.key;
        state.sources[key].targets = {};
      },
      setMap(state, payload) {
        state.map.map = payload.map;
      },
      // this is the map center as an xy coordinate array (not latlng)
      setMapCenter(state, payload) {
        state.map.center = payload;
      },
      setMapZoom(state, payload) {
        state.map.zoom = payload
      },
      setDorParcels(state, payload) {
        state.dorParcels = payload;
      },
      setActiveDorParcel(state, payload) {
        state.activeDorParcel = payload;
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
      setGeocodeInput(state, payload) {
        state.geocode.input = payload;
      },
      setBasemap(state, payload) {
        state.map.basemap = payload;
      },
      setImagery(state, payload) {
        state.map.imagery = payload;
      },
      setShouldShowImagery(state, payload) {
        state.map.shouldShowImagery = payload;
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
        const { featureId, tableId } = payload || {};
        const nextActiveFeature = { featureId, tableId };
        state.activeFeature = nextActiveFeature;
      },
      setLastSearchMethod(state, payload) {
        state.lastSearchMethod = payload;
      },
      setPictometryIpa(state, payload) {
        state.pictometry.ipa = payload;
      },
      setPictometryShapeIds(state, payload) {
        state.pictometry.shapeIds = payload;
      },
      setPictometryPngMarkerIds(state, payload) {
        state.pictometry.pngMarkerIds = payload;
      },
      // this is the leaflet map center updated when the map is moved
      setPictometryMapCenter(state, payload) {
        state.pictometry.map.center = payload;
      },
      setPictometryMapZoom(state, payload) {
        state.pictometry.map.zoom = payload;
      },
      setPictometryZoom(state, payload) {
        state.pictometry.zoom = payload;
      },
      setImageOverlay(state, payload) {
        state.map.imageOverlay = payload;
      },
      setImageOverlayOpacity(state, payload) {
        state.map.imageOverlayOpacity = payload;
      },
      // setCircleMarkers(state, payload) {
      //   state.map.circleMarkers.push(payload);
      // }
    }
  });
}

export default createStore;
