import Vue from 'vue';
import Vuex from 'vuex';
import isMobileDevice from './util/is-mobile-device';
import pvdStore from '@philly/vue-datafetch/src/store.js';
import pvmStore from '@philly/vue-mapping/src/store.js';
import pvcStore from '@philly/vue-comps/src/store.js';
import mergeDeep from './util/merge-deep';

// when you load vuex from a script tag this seems to happen automatically
Vue.use(Vuex);

// this grabs horizontal table ids from an array of topic components,
// recursively
function getHorizontalTableIdsFromComps(comps = []) {
  // console.log('getHorizontalTableIdsFromComps is running, comps:', comps);

  let tableIds = [];

  for (let comp of comps) {
    const options = comp.options || {};
    const innerComps = options.components || options.tables;

    // if this is a "group" component, recurse
    if (innerComps) {
      const innerTableIds = getHorizontalTableIdsFromComps(innerComps);
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
    const compTableIds = getHorizontalTableIdsFromComps(comps);
    tableIds = tableIds.concat(compTableIds);
  }

  // console.log('createFilteredData is running, tableIds:', tableIds);

  // const filteredData = tableIds.reduce((acc, tableId) => {
  //   acc[tableId] = [];
  //   return acc;
  // }, {});

  let filteredData = {}
  for (let index=0; index < tableIds.length; index++) {
    filteredData[tableIds[index]] = [];
  }

  return filteredData;
}

// this grabs table group ids from an array of topic components
function getHorizontalTableGroupIdsFromComps(comps = []) {
  // console.log('getHorizontalTableGroupIdsFromComps is running, comps:', comps);
  let tableGroupId;

  for (let comp of comps) {
    const options = comp.options || {};
    const innerComps = options.components || options.tables;

    // console.log('getHorizontalTableGroupIdsFromComps, comp:', comp);

    // if this is a "group" component, recurse
    if (!innerComps) {
      continue;
    }

    // console.log('getTableGroupIdsFromComps, comp.type:', comp.type);

    // skip comps that aren't horizontal tables
    if (comp.type !== 'horizontal-table-group') {
      continue;
    }

    tableGroupId = comp._id;
    // console.log('getHorizontalTableGroupIdsFromComps, tableGroupId:', tableGroupId);
  }

  return tableGroupId;
}

// this makes the empty horizontalTableGroups object given a list of topics.
function createHorizontalTableGroups(config) {
  const topics = config.topics;

  let tableGroupIds = [];

  for (let topic of topics) {
    const comps = topic.components;
    const compTableGroupId = getHorizontalTableGroupIdsFromComps(comps);
    if (compTableGroupId) tableGroupIds.push(compTableGroupId);
  }
  // console.log('createHorizontalTableGroups is running, config:', config, 'tableGroupIds:', tableGroupIds);

  let horizontalTableGroups = {};

  for (let tableGroupId of tableGroupIds) {
    horizontalTableGroups[tableGroupId] = {
      activeTable: null,
      activeTableId: null
    };
  }
  return horizontalTableGroups;
}

function createStore(config) {
  const sources = pvdStore.createSources(config);
  const parcels = pvdStore.createParcels(config);

  const initialState = {
    isMobileOrTablet: isMobileDevice(),
    fullScreen: {
      mapOnly: false,
      topicsOnly: false,
    },
    fullScreenMapEnabled: false,
    // fullScreenTopicsEnabled: false,
    candidates: [],
    addressEntered: null,
    parcels,
    sources,
    horizontalTables: {
      // table id => filtered rows
      filteredData: createFilteredData(config),
    },
    horizontalTableGroups: createHorizontalTableGroups(config),
    activeFeature: {
      featureId: null,
      tableId: null
    },
    appData: {
      propertyBalance: 0,
    },
    modals: {
      keys: config.modals,
      open: '',
    },
    map: {},
    windowDimensions: {
      height: 0,
      width: 0,
    },
  };

  if (config.map) {
    if (config.map.initialImagery) {
      initialState.map.imagery = config.map.initialImagery;
    }
    if (config.map.overlaySelectControl) {
      if (config.map.overlaySelectControl.initialSelection) {
        initialState.map.selectedOverlay = config.map.overlaySelectControl.initialSelection;
      }
    }
  }

  const mb = {
    state: initialState,
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

        const compTableGroup = getHorizontalTableGroupIdsFromComps(comps);
        if (compTableGroup) {
          // even though there is only 1 value, it has to be in array form in the state
          const array = [];
          array.push(state.horizontalTableGroups[compTableGroup].activeTableId);
          return array;
        } else {
          const compTables = getHorizontalTableIdsFromComps(comps);
          return compTables;
        }
      }
    },
    mutations: {

      setWindowDimensions(state, payload) {
        state.windowDimensions = payload;
      },

      setIsMobileOrTablet(state, payload) {
        state.isMobileOrTablet = payload;
      },
      setMapOnly(state, payload) {
        state.fullScreen.mapOnly = payload;
      },
      setTopicsOnly(state, payload) {
        state.fullScreen.topicsOnly = payload;
      },
      setFullScreenMapEnabled(state, payload) {
        state.fullScreenMapEnabled = payload;
      },
      // setFullScreenTopicsEnabled(state, payload) {
      //   state.fullScreenTopicsEnabled = payload;
      // },
      setLocation(state, payload) {
        state.map.location.lat = payload.lat;
        state.map.location.lng = payload.lng;
      },
      setWatchPositionOn(state, payload) {
        state.map.watchPositionOn = payload;
      },

      setHorizontalTableGroupActiveTable(state, payload) {
        // console.log('setHorizontalTableGroupActiveTable, payload:', payload);
        state.horizontalTableGroups[payload.tableGroupId].activeTableId = payload.activeTableId;
        state.horizontalTableGroups[payload.tableGroupId].activeTable = payload.activeTable;
      },
      setHorizontalTableFilteredData(state, payload) {
        const { tableId, data } = payload;

        // check for not-null table id
        if (!tableId) return;

        state.horizontalTables.filteredData[tableId] = data;
      },

      setMapFilters(state, payload) {
        state.map.filters = payload;
      },

      setMap(state, payload) {
        state.map.map = payload.map;
      },


      setMapBounds(state, payload) {
        // const { northEast, southWest } = payload || {};
        // state.map.bounds.northEast = northEast;
        // state.map.bounds.southWest = southWest;
        state.map.bounds = payload;
      },
      setMapBoundsBasedOnShape(state, payload) {
        state.map.boundsBasedOnShape = payload
      },
      setActiveParcel(state, payload) {
        // console.log('store setActiveParcel:', payload)
        const { parcelLayer, activeParcel, activeAddress, activeMapreg } = payload || {};
        state.parcels[parcelLayer].activeParcel = activeParcel;
        state.parcels[parcelLayer].activeAddress = activeAddress;
        state.parcels[parcelLayer].activeMapreg = activeMapreg;
      },

      setActiveFeature(state, payload) {
        // console.log('store setActiveFeature is running');
        const { featureId, tableId } = payload || {};
        const nextActiveFeature = { featureId, tableId };
        state.activeFeature = nextActiveFeature;
      },

      setImageOverlay(state, payload) {
        state.map.imageOverlay = payload;
      },
      setImageOverlayOpacity(state, payload) {
        state.map.imageOverlayOpacity = payload;
      },
      setCandidates(state, payload) {
        state.candidates = payload;
      },
      setAddressEntered(state, payload) {
        state.addressEntered = payload;
      },

      setPropertyBalance(state, payload) {
        state.appData.propertyBalance = payload;
      },
      setDidToggleModal(state, name) {
        // console.log('setDidToggleModal, name:', name, 'open:', open);
        // console.log('setDidToggleModal, name:', name);
        // state.modals[name].open = open === null ? !state.modals[name].open : open
        state.modals.open = name;
      },
    }
  }

  let mergeStore = mergeDeep(pvdStore.store, pvmStore);
  mergeStore = mergeDeep(mergeStore, pvcStore);
  mergeStore = mergeDeep(mergeStore, mb);
  // let mergeStore = mergeDeep(mb, pvdStore.store);
  // mergeStore = mergeDeep(mergeStore, pvmStore);
  // mergeStore = mergeDeep(mergeStore, pvcStore);

  // reset the map center and zoom based on the config
  if (config.map) {
    mergeStore.state.map.center = config.map.center;
    mergeStore.state.map.zoom = config.map.zoom;
    mergeStore.state.pictometry.map.center = config.map.center;
    mergeStore.state.pictometry.map.zoom = config.map.zoom;
  }

  // TODO standardize how payloads are passed around/handled
  return new Vuex.Store({
    state: mergeStore.state,
    getters: mergeStore.getters,
    mutations: mergeStore.mutations
  });
}

export default createStore;
