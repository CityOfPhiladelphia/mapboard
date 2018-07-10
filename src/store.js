import Vue from 'vue';
import Vuex from 'vuex';
import isMobileDevice from './util/is-mobile-device';

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

  console.log('createFilteredData is running, tableIds:', tableIds);

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
       secondaryStatus: null,
       data: null
     };
    }

    o[key] = val;

    return o;
  }, {});

  const parcelKeys = Object.keys(config.parcels || {});
  const parcels = parcelKeys.reduce((o, key) => {
    let val;
    if (config.parcels[key].multipleAllowed) {
      val = {
        data: [],
        status: null,
        activeParcel: null,
        activeAddress: null,
        activeMapreg: null
      };
    } else {
      val = null;
      // val = {
      //   geometry: null,
      //   id: null,
      //   properties: null,
      //   type: null
      // };
    }

    o[key] = val;

    return o;
  }, {});

  const initialState = {
    isMobileOrTablet: isMobileDevice(),
    fullScreenMapEnabled: false,

    // this gets set to the parcel layer for the default (aka first) topic in
    // DataManager.resetGeocode, which is called by Router.hashChanged on app
    // load.
    activeTopic: '',
    activeParcelLayer: '',

    // the ais feature
    clickCoords: null,
    geocode: {
      status: null,
      data: null,
      input: null,
      related: null,
      // forwardStatus: null,
      // reverseStatus: null,
    },
    lastSearchMethod: 'geocode',
    // the leaflet map object
    map: {
      location: {
        lat: null,
        lng: null
      },
      center: config.map.center,
      bounds: {
        northEast: null,
        southWest: null,
      },
      zoom: config.map.zoom,
      boundsBasedOnShape: null,
      map: null,
      // this gets set to the parcel layer for the default topic by
      // DataManager.resetGeocode; see note above for activeTopic and
      // activeParcelLayer.
      basemap: '',
      imagery: 'imagery2017',
      shouldShowImagery: false,
      // circleMarkers: [],
      // this is the key for the active overlay image (eg regmap)
      imageOverlay: null,
      imageOverlayOpacity: null,
      filters: [],
      watchPositionOn: false,
      shouldShowAddressCandidateList: false,
      candidates: [],
      addressEntered: null,
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
    parcels,
    // dorParcels: {
    //   data: [],
    //   status: null
    // },
    // activeDorParcel: null,
    // activeDorAddress: null,
    // activeDorMapreg: null,
    // pwdParcel: null,
    sources,
    cyclomedia: {
      initialized: false,
      navBarOpen: false,
      // surfaceCursorOn: true,
      latLngFromMap: null,
      orientation: {
        yaw: null,
        hFov: null,
        xyz: null,
      },
      active: false,
      recordings: [],
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
    horizontalTables: {
      // table id => filtered rows
      filteredData: createFilteredData(config),
    },
    horizontalTableGroups: createHorizontalTableGroups(config),
    activeFeature: {
      featureId: null,
      tableId: null
    }
  };

  // TODO standardize how payloads are passed around/handled
  return new Vuex.Store({
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
      setCyclomediaInitialized(state, payload) {
        state.cyclomedia.initialized = payload;
      },
      setIsMobileOrTablet(state, payload) {
        state.isMobileOrTablet = payload;
      },
      setFullScreenMapEnabled(state, payload) {
        state.fullScreenMapEnabled = payload;
      },
      setLocation(state, payload) {
        state.map.location.lat = payload.lat;
        state.map.location.lng = payload.lng;
      },
      setWatchPositionOn(state, payload) {
        state.map.watchPositionOn = payload;
      },
      setClickCoords(state, payload) {
        state.clickCoords = payload;
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
      setActiveTopic(state, payload) {
        state.activeTopic = payload;
      },
      setActiveParcelLayer(state, payload) {
        state.activeParcelLayer = payload;
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
      setSecondarySourceStatus(state, payload) {
        const key = payload.key;
        const secondaryStatus = payload.secondaryStatus;

        // if a target id was passed in, set the status for that target
        const targetId = payload.targetId;

        // if (targetId) {
        //   state.sources[key].targets[targetId].status = status;
        // } else {
        state.sources[key].secondaryStatus = secondaryStatus;
        // }
      },
      setSourceData(state, payload) {
        // console.log('store setSourceData payload:', payload);
        const key = payload.key;
        const data = payload.data;

        // if a target id was passed in, set the data object for that target
        const targetId = payload.targetId;

        if (targetId) {
          if (state.sources[key].targets[targetId]) {
            state.sources[key].targets[targetId].data = data;
          }
        } else {
          state.sources[key].data = data;
        }
      },
      setSourceDataMore(state, payload) {
        const key = payload.key;
        const data = payload.data;
        const nextPage = payload.page;
        const oldData = state.sources[key].data;
        // console.log('oldData features', oldData.features, 'data features', data.features);
        const allData = oldData.features.concat(data.features);
        // console.log('allData', allData);
        // if a target id was passed in, set the data object for that target
        // const targetId = payload.targetId;

        // if (targetId) {
        //   state.sources[key].targets[targetId].data = data;
        // } else {

        state.sources[key].data.features = allData;
        state.sources[key].data.page = nextPage;
        // }
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
        state.map.zoom = payload;
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
      setParcelData(state, payload) {
        // console.log('store setParcelData payload:', payload);
        const { parcelLayer, data, multipleAllowed, status, activeParcel, activeAddress, activeMapreg } = payload || {};
        // console.log('store setParcelData parcelLayer:', parcelLayer, 'data:', data, 'multipleAllowed:', multipleAllowed, 'status:', status, 'activeParcel:', activeParcel);
        if (!multipleAllowed) {
          state.parcels[parcelLayer] = data;
        } else {
          state.parcels[parcelLayer].data = data;
          state.parcels[parcelLayer].status = status;
          state.parcels[parcelLayer].activeParcel = activeParcel;
          state.parcels[parcelLayer].activeAddress = activeAddress;
          state.parcels[parcelLayer].activeMapreg = activeMapreg;
        }
      },
      setActiveParcel(state, payload) {
        console.log('store setActiveParcel:', payload)
        const { parcelLayer, activeParcel, activeAddress, activeMapreg } = payload || {};
        state.parcels[parcelLayer].activeParcel = activeParcel;
        state.parcels[parcelLayer].activeAddress = activeAddress;
        state.parcels[parcelLayer].activeMapreg = activeMapreg;
      },
      // setDorParcelData(state, payload) {
      //   state.dorParcels.data = payload;
      //   // state.parcels.dor.data = payload;
      // },
      // setDorParcelStatus(state, payload) {
      //   state.dorParcels.status = payload;
      //   // state.parcels.dor.status = payload;
      // },
      // setActiveDorParcel(state, payload) {
      //   state.activeDorParcel = payload;
      //   // state.parcels.dor.activeParcel = payload;
      // },
      // setActiveDorAddress(state, payload) {
      //   state.activeDorAddress = payload;
      //   // state.parcels.dor.activeAddress = payload;
      // },
      // setActiveDorMapreg(state, payload) {
      //   state.activeDorMapreg = payload;
      //   // state.parcels.dor.activeMapreg = payload;
      // },
      // setPwdParcel(state, payload) {
      //   state.pwdParcel = payload;
      //   // state.parcels.pwd = payload;
      // },
      setGeocodeStatus(state, payload) {
        state.geocode.status = payload;
      },
      setGeocodeData(state, payload) {
        state.geocode.data = payload;
      },
      setGeocodeRelated(state, payload) {
        state.geocode.related = payload;
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
      setCyclomediaYaw(state, payload) {
        state.cyclomedia.orientation.yaw = payload
      },
      setCyclomediaHFov(state, payload) {
        state.cyclomedia.orientation.hFov = payload
      },
      setCyclomediaXyz(state, payload) {
        state.cyclomedia.orientation.xyz = payload
      },
      setCyclomediaRecordings(state, payload) {
        state.cyclomedia.recordings = payload;
      },
      setCyclomediaLatLngFromMap(state, payload) {
        state.cyclomedia.latLngFromMap = payload;
        // const { lat, lng } = payload || {};
        // state.cyclomedia.latLngFromMap[0] = lat;
        // state.cyclomedia.latLngFromMap[1] = lng;
      },
      setCyclomediaNavBarOpen(state, payload) {
        state.cyclomedia.navBarOpen = payload;
      },
      // setCyclomediaSurfaceCursorOn(state, payload) {
      //   state.cyclomedia.surfaceCursorOn = payload;
      // },
      setActiveFeature(state, payload) {
        // console.log('store setActiveFeature is running');
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
      setShouldShowAddressCandidateList(state, payload) {
        state.map.shouldShowAddressCandidateList = payload;
      },
      setCandidates(state, payload) {
        state.map.candidates = payload;
      },
      setAddressEntered(state, payload) {
        state.map.addressEntered = payload;
      }
    }
  });
}

export default createStore;
