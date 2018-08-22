(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue'), require('vuex'), require('@cityofphiladelphia/phila-vue-comps'), require('leaflet'), require('@cityofphiladelphia/phila-vue-mapping'), require('axios'), require('@cityofphiladelphia/phila-vue-datafetch')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue', 'vuex', '@cityofphiladelphia/phila-vue-comps', 'leaflet', '@cityofphiladelphia/phila-vue-mapping', 'axios', '@cityofphiladelphia/phila-vue-datafetch'], factory) :
  (factory((global.mapboard = {}),global.Vue,global.Vuex,global.philaVueComps,global.L,global.philaVueMapping,global.axios,global.philaVueDatafetch));
}(this, (function (exports,Vue,Vuex,philaVueComps,L,philaVueMapping,axios,philaVueDatafetch) { 'use strict';

  Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue;
  Vuex = Vuex && Vuex.hasOwnProperty('default') ? Vuex['default'] : Vuex;
  philaVueComps = philaVueComps && philaVueComps.hasOwnProperty('default') ? philaVueComps['default'] : philaVueComps;
  philaVueMapping = philaVueMapping && philaVueMapping.hasOwnProperty('default') ? philaVueMapping['default'] : philaVueMapping;
  axios = axios && axios.hasOwnProperty('default') ? axios['default'] : axios;
  philaVueDatafetch = philaVueDatafetch && philaVueDatafetch.hasOwnProperty('default') ? philaVueDatafetch['default'] : philaVueDatafetch;

  function isMobileDevice () {
    var mobileOrTabletRegexA = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i;
    var mobileOrTabletRegexB = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;

    // get the user agent and test against both regex patterns
    var userAgent = (navigator.userAgent || navigator.vendor || window.opera || '');
    var isMobileOrTablet = (mobileOrTabletRegexA.test(userAgent) ||
                              mobileOrTabletRegexB.test(userAgent.substr(0,4)));

    return isMobileOrTablet;
  }

  // when you load vuex from a script tag this seems to happen automatically
  Vue.use(Vuex);

  // this grabs horizontal table ids from an array of topic components,
  // recursively
  function getHorizontalTableIdsFromComps(comps) {
    if ( comps === void 0 ) comps = [];

    // console.log('getHorizontalTableIdsFromComps is running, comps:', comps);

    var tableIds = [];

    for (var i = 0, list = comps; i < list.length; i += 1) {
      var comp = list[i];

      var options = comp.options || {};
      var innerComps = options.components || options.tables;

      // if this is a "group" component, recurse
      if (innerComps) {
        var innerTableIds = getHorizontalTableIdsFromComps(innerComps);
        tableIds = tableIds.concat(innerTableIds);
        continue;
      }

      // skip comps that aren't horizontal tables
      if (comp.type !== 'horizontal-table') {
        continue;
      }

      var tableId = comp._id;

      tableIds.push(tableId);
    }

    return tableIds;
  }

  // this makes the empty filtered data object given a list of topics.
  function createFilteredData(config) {
    var topics = config.topics;
    var tableIds = [];

    for (var i = 0, list = topics; i < list.length; i += 1) {
      var topic = list[i];

      var comps = topic.components;
      var compTableIds = getHorizontalTableIdsFromComps(comps);
      tableIds = tableIds.concat(compTableIds);
    }

    // console.log('createFilteredData is running, tableIds:', tableIds);

    // const filteredData = tableIds.reduce((acc, tableId) => {
    //   acc[tableId] = [];
    //   return acc;
    // }, {});

    var filteredData = {};
    for (var index=0; index < tableIds.length; index++) {
      filteredData[tableIds[index]] = [];
    }

    return filteredData;
  }

  // this grabs table group ids from an array of topic components
  function getHorizontalTableGroupIdsFromComps(comps) {
    if ( comps === void 0 ) comps = [];

    // console.log('getHorizontalTableGroupIdsFromComps is running, comps:', comps);
    var tableGroupId;

    for (var i = 0, list = comps; i < list.length; i += 1) {
      var comp = list[i];

      var options = comp.options || {};
      var innerComps = options.components || options.tables;

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
    var topics = config.topics;

    var tableGroupIds = [];

    for (var i = 0, list = topics; i < list.length; i += 1) {
      var topic = list[i];

      var comps = topic.components;
      var compTableGroupId = getHorizontalTableGroupIdsFromComps(comps);
      if (compTableGroupId) { tableGroupIds.push(compTableGroupId); }
    }
    // console.log('createHorizontalTableGroups is running, config:', config, 'tableGroupIds:', tableGroupIds);

    var horizontalTableGroups = {};

    for (var i$1 = 0, list$1 = tableGroupIds; i$1 < list$1.length; i$1 += 1) {
      var tableGroupId = list$1[i$1];

      horizontalTableGroups[tableGroupId] = {
        activeTable: null,
        activeTableId: null
      };
    }
    return horizontalTableGroups;
  }

  function createStore(config) {
    // create initial state for sources. data key => {}
    var sourceKeys = Object.keys(config.dataSources || {});
    var sources = sourceKeys.reduce(function (o, key) {
      var val;
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

    var parcelKeys = Object.keys(config.parcels || {});
    var parcels = parcelKeys.reduce(function (o, key) {
      var val;
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

    var initialState = {
      isMobileOrTablet: isMobileDevice(),
      fullScreen: {
        mapOnly: false,
        topicsOnly: false,
      },
      fullScreenMapEnabled: false,
      fullScreenTopicsEnabled: false,

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
        // this is the key for the active overlay image (eg regmap)
        imageOverlay: null,
        imageOverlayOpacity: null,
        filters: [],
        watchPositionOn: false,
      },
      shouldShowAddressCandidateList: false,
      candidates: [],
      addressEntered: null,
      parcels: parcels,
      sources: sources,
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
      },

      appData: {
        propertyBalance: 0,
      },
    };

    // TODO standardize how payloads are passed around/handled
    return new Vuex.Store({
      state: initialState,
      getters: {
        visibleTableIds: function visibleTableIds(state) {
          // get active topic
          var activeTopic = state.activeTopic;

          if (!activeTopic) {
            return [];
          }

          // get horizontal table ids for that topic
          var activeTopicConfig = (config.topics.filter(function (topic) { return topic.key === activeTopic; }) || [])[0];
          var comps = activeTopicConfig.components;

          var compTableGroup = getHorizontalTableGroupIdsFromComps(comps);
          if (compTableGroup) {
            // even though there is only 1 value, it has to be in array form in the state
            var array = [];
            array.push(state.horizontalTableGroups[compTableGroup].activeTableId);
            return array;
          } else {
            var compTables = getHorizontalTableIdsFromComps(comps);
            return compTables;
          }
        }
      },
      mutations: {
        setCyclomediaInitialized: function setCyclomediaInitialized(state, payload) {
          state.cyclomedia.initialized = payload;
        },
        setIsMobileOrTablet: function setIsMobileOrTablet(state, payload) {
          state.isMobileOrTablet = payload;
        },
        setMapOnly: function setMapOnly(state, payload) {
          state.fullScreen.mapOnly = payload;
        },
        setTopicsOnly: function setTopicsOnly(state, payload) {
          state.fullScreen.topicsOnly = payload;
        },
        setFullScreenMapEnabled: function setFullScreenMapEnabled(state, payload) {
          state.fullScreenMapEnabled = payload;
        },
        setFullScreenTopicsEnabled: function setFullScreenTopicsEnabled(state, payload) {
          state.fullScreenTopicsEnabled = payload;
        },
        setLocation: function setLocation(state, payload) {
          state.map.location.lat = payload.lat;
          state.map.location.lng = payload.lng;
        },
        setWatchPositionOn: function setWatchPositionOn(state, payload) {
          state.map.watchPositionOn = payload;
        },
        setClickCoords: function setClickCoords(state, payload) {
          state.clickCoords = payload;
        },
        setHorizontalTableGroupActiveTable: function setHorizontalTableGroupActiveTable(state, payload) {
          // console.log('setHorizontalTableGroupActiveTable, payload:', payload);
          state.horizontalTableGroups[payload.tableGroupId].activeTableId = payload.activeTableId;
          state.horizontalTableGroups[payload.tableGroupId].activeTable = payload.activeTable;
        },
        setHorizontalTableFilteredData: function setHorizontalTableFilteredData(state, payload) {
          var tableId = payload.tableId;
          var data = payload.data;

          // check for not-null table id
          if (!tableId) { return; }

          state.horizontalTables.filteredData[tableId] = data;
        },
        setActiveTopic: function setActiveTopic(state, payload) {
          state.activeTopic = payload;
        },
        setActiveParcelLayer: function setActiveParcelLayer(state, payload) {
          state.activeParcelLayer = payload;
        },
        setSourceStatus: function setSourceStatus(state, payload) {
          var key = payload.key;
          var status = payload.status;

          // if a target id was passed in, set the status for that target
          var targetId = payload.targetId;

          if (targetId) {
            // console.log('store.js setSourceStatus, key:', key, 'status:', status, 'targetId:', targetId);
            state.sources[key].targets[targetId].status = status;
          } else {
            state.sources[key].status = status;
          }
        },
        setSecondarySourceStatus: function setSecondarySourceStatus(state, payload) {
          var key = payload.key;
          var secondaryStatus = payload.secondaryStatus;

          // if a target id was passed in, set the status for that target
          var targetId = payload.targetId;

          // if (targetId) {
          //   state.sources[key].targets[targetId].status = status;
          // } else {
          state.sources[key].secondaryStatus = secondaryStatus;
          // }
        },
        setSourceData: function setSourceData(state, payload) {
          // console.log('store setSourceData payload:', payload);
          var key = payload.key;
          var data = payload.data;

          // if a target id was passed in, set the data object for that target
          var targetId = payload.targetId;

          if (targetId) {
            if (state.sources[key].targets[targetId]) {
              state.sources[key].targets[targetId].data = data;
            }
          } else {
            state.sources[key].data = data;
          }
        },
        setSourceDataMore: function setSourceDataMore(state, payload) {
          var key = payload.key;
          var data = payload.data;
          var nextPage = payload.page;
          var oldData = state.sources[key].data;
          // console.log('oldData features', oldData.features, 'data features', data.features);
          var allData = oldData.features.concat(data.features);
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
        setMapFilters: function setMapFilters(state, payload) {
          state.map.filters = payload;
        },
        // this sets empty targets for a data source
        createEmptySourceTargets: function createEmptySourceTargets(state, payload) {
          var key = payload.key;
          var targetIds = payload.targetIds;
          state.sources[key].targets = targetIds.reduce(function (acc, targetId) {
            acc[targetId] = {
              status: null,
              data: null
            };
            return acc;
          }, {});
        },
        clearSourceTargets: function clearSourceTargets(state, payload) {
          var key = payload.key;
          state.sources[key].targets = {};
        },
        setMap: function setMap(state, payload) {
          state.map.map = payload.map;
        },
        // this is the map center as an xy coordinate array (not latlng)
        setMapCenter: function setMapCenter(state, payload) {
          state.map.center = payload;
        },
        setMapZoom: function setMapZoom(state, payload) {
          state.map.zoom = payload;
        },
        setMapBounds: function setMapBounds(state, payload) {
          // const { northEast, southWest } = payload || {};
          // state.map.bounds.northEast = northEast;
          // state.map.bounds.southWest = southWest;
          state.map.bounds = payload;
        },
        setMapBoundsBasedOnShape: function setMapBoundsBasedOnShape(state, payload) {
          state.map.boundsBasedOnShape = payload;
        },
        setParcelData: function setParcelData(state, payload) {
          // console.log('store setParcelData payload:', payload);
          var ref = payload || {};
          var parcelLayer = ref.parcelLayer;
          var data = ref.data;
          var multipleAllowed = ref.multipleAllowed;
          var status = ref.status;
          var activeParcel = ref.activeParcel;
          var activeAddress = ref.activeAddress;
          var activeMapreg = ref.activeMapreg;
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
        setActiveParcel: function setActiveParcel(state, payload) {
          // console.log('store setActiveParcel:', payload)
          var ref = payload || {};
          var parcelLayer = ref.parcelLayer;
          var activeParcel = ref.activeParcel;
          var activeAddress = ref.activeAddress;
          var activeMapreg = ref.activeMapreg;
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
        setGeocodeStatus: function setGeocodeStatus(state, payload) {
          state.geocode.status = payload;
        },
        setGeocodeData: function setGeocodeData(state, payload) {
          state.geocode.data = payload;
        },
        setGeocodeRelated: function setGeocodeRelated(state, payload) {
          state.geocode.related = payload;
        },
        setGeocodeInput: function setGeocodeInput(state, payload) {
          state.geocode.input = payload;
        },
        setBasemap: function setBasemap(state, payload) {
          state.map.basemap = payload;
        },
        setImagery: function setImagery(state, payload) {
          state.map.imagery = payload;
        },
        setShouldShowImagery: function setShouldShowImagery(state, payload) {
          state.map.shouldShowImagery = payload;
        },
        setPictometryActive: function setPictometryActive(state, payload) {
          if (!config.pictometry.enabled) {
            return;
          }
          state.pictometry.active = payload;
        },
        setCyclomediaActive: function setCyclomediaActive(state, payload) {
          if (!config.cyclomedia.enabled) {
            return;
          }
          state.cyclomedia.active = payload;
        },
        setCyclomediaYaw: function setCyclomediaYaw(state, payload) {
          state.cyclomedia.orientation.yaw = payload;
        },
        setCyclomediaHFov: function setCyclomediaHFov(state, payload) {
          state.cyclomedia.orientation.hFov = payload;
        },
        setCyclomediaXyz: function setCyclomediaXyz(state, payload) {
          state.cyclomedia.orientation.xyz = payload;
        },
        setCyclomediaRecordings: function setCyclomediaRecordings(state, payload) {
          state.cyclomedia.recordings = payload;
        },
        setCyclomediaLatLngFromMap: function setCyclomediaLatLngFromMap(state, payload) {
          state.cyclomedia.latLngFromMap = payload;
          // const { lat, lng } = payload || {};
          // state.cyclomedia.latLngFromMap[0] = lat;
          // state.cyclomedia.latLngFromMap[1] = lng;
        },
        setCyclomediaNavBarOpen: function setCyclomediaNavBarOpen(state, payload) {
          state.cyclomedia.navBarOpen = payload;
        },
        // setCyclomediaSurfaceCursorOn(state, payload) {
        //   state.cyclomedia.surfaceCursorOn = payload;
        // },
        setActiveFeature: function setActiveFeature(state, payload) {
          // console.log('store setActiveFeature is running');
          var ref = payload || {};
          var featureId = ref.featureId;
          var tableId = ref.tableId;
          var nextActiveFeature = { featureId: featureId, tableId: tableId };
          state.activeFeature = nextActiveFeature;
        },
        setLastSearchMethod: function setLastSearchMethod(state, payload) {
          state.lastSearchMethod = payload;
        },
        setPictometryIpa: function setPictometryIpa(state, payload) {
          state.pictometry.ipa = payload;
        },
        setPictometryShapeIds: function setPictometryShapeIds(state, payload) {
          state.pictometry.shapeIds = payload;
        },
        setPictometryPngMarkerIds: function setPictometryPngMarkerIds(state, payload) {
          state.pictometry.pngMarkerIds = payload;
        },
        // this is the leaflet map center updated when the map is moved
        setPictometryMapCenter: function setPictometryMapCenter(state, payload) {
          state.pictometry.map.center = payload;
        },
        setPictometryMapZoom: function setPictometryMapZoom(state, payload) {
          state.pictometry.map.zoom = payload;
        },
        setPictometryZoom: function setPictometryZoom(state, payload) {
          state.pictometry.zoom = payload;
        },
        setImageOverlay: function setImageOverlay(state, payload) {
          state.map.imageOverlay = payload;
        },
        setImageOverlayOpacity: function setImageOverlayOpacity(state, payload) {
          state.map.imageOverlayOpacity = payload;
        },
        // setCircleMarkers(state, payload) {
        //   state.map.circleMarkers.push(payload);
        // }
        setShouldShowAddressCandidateList: function setShouldShowAddressCandidateList(state, payload) {
          state.shouldShowAddressCandidateList = payload;
        },
        setCandidates: function setCandidates(state, payload) {
          state.candidates = payload;
        },
        setAddressEntered: function setAddressEntered(state, payload) {
          state.addressEntered = payload;
        },

        setPropertyBalance: function setPropertyBalance(state, payload) {
          state.appData.propertyBalance = payload;
        },
      }
    });
  }

  // shout out to airyland
  // https://github.com/airyland/vue-config/blob/master/index.js

  function configMixin (Vue$$1, config) {
    Vue$$1.mixin({
      created: function created() {
        this.$config = config;
      }
    });
  }

  (function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=" /*don't highlight any form elements*/ input[data-v-c37cf8b6]:focus, select[data-v-c37cf8b6]:focus, textarea[data-v-c37cf8b6]:focus, button[data-v-c37cf8b6]:focus { outline: none; } /* standards applies padding to buttons, which causes some weirdness with buttons on the map panel. override here. */ button[data-v-c37cf8b6] { padding: inherit; } .mb-panel-topics[data-v-c37cf8b6] { position: relative; } .address-header[data-v-c37cf8b6] { background: #daedfe; color: #0f4d90; /*this keeps the box shadow over the scrollable part of the panel*/ position: relative; z-index: 1; -webkit-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18); -moz-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18); box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18); margin-bottom: 0px !important; display: inline-block; } .address-header-line-1[data-v-c37cf8b6] { margin-bottom: 0; margin-top: 0; padding: 0px !important; } .address-header-line-2[data-v-c37cf8b6] { padding: 0px; } .address-container[data-v-c37cf8b6] { height: 100%; display: flex; flex-direction: column; justify-content: center; padding-left: 20px; padding-top: 20px; padding-bottom: 20px; } .address-input-container[data-v-c37cf8b6] { height: 100%; display: flex; flex-direction: column; justify-content: center; padding-top: 20px; padding-bottom: 20px; } .topics-container[data-v-c37cf8b6] { padding: 26px; overflow-x: hidden; position: relative; } @media screen and (min-width: 40em) { .topics-container[data-v-c37cf8b6] { /* height: 100%; */ /* height: calc(100vh - 210px); */ } } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();
  var Topic = philaVueComps.Topic;
  var TopicComponentGroup = philaVueComps.TopicComponentGroup;
  var Greeting = philaVueComps.Greeting;
  var AddressInput = philaVueComps.AddressInput;
  var AddressCandidateList = philaVueComps.AddressCandidateList;
  var FullScreenTopicsToggleTab = philaVueComps.FullScreenTopicsToggleTab;


  var TopicPanel = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:'mb-panel-topics cell ' + this.topicPanelContainerClass,attrs:{"id":"topic-panel-container"}},[(!this.fullScreenTopicsOnly)?_vm._m(0):_vm._e(),_vm._v(" "),(this.fullScreenTopicsOnly)?_c('div',{staticClass:"address-header cell small-24 medium-24"},[_c('div',{class:'address-container columns ' + this.addressContainerClass,style:(this.addressContainerStyle)},[_c('h1',{staticClass:"address-header-line-1"},[_vm._v(" "+_vm._s(_vm.address)+" ")]),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(this.geocode),expression:"this.geocode"}],staticClass:"address-header-line-2"},[_vm._v(" PHILADELPHIA, PA "+_vm._s(_vm.zipCode)+" ")])]),_vm._v(" "),(this.fullScreenTopicsEnabled || this.fullScreenTopicsOnly)?_c('div',{staticClass:"address-input-container columns small-24 medium-12 large-12",style:(this.addressInputContainerStyle)},[_c('address-input',{attrs:{"widthFromConfig":this.addressInputWidth,"placeholder":this.addressInputPlaceholder}},[(this.addressAutocompleteEnabled)?_c('address-candidate-list',{attrs:{"slot":"address-candidates-slot","widthFromConfig":this.addressInputWidth},slot:"address-candidates-slot"}):_vm._e(),_vm._v(" /> ")],1)],1):_vm._e()]):_vm._e(),_vm._v(" "),_c('greeting',{directives:[{name:"show",rawName:"v-show",value:(_vm.shouldShowGreeting),expression:"shouldShowGreeting"}]}),_vm._v(" "),(!_vm.shouldShowGreeting)?_c('div',{staticClass:"topic-panel-content"},[(!this.fullScreenTopicsOnly)?_c('div',{staticClass:"address-header cell small-24 medium-24"},[_c('div',{class:'address-container columns ' + this.addressContainerClass,style:(this.addressContainerStyle)},[_c('h1',{staticClass:"address-header-line-1"},[_c('i',{staticClass:"fa fa-map-marker"}),_vm._v(" "+_vm._s(_vm.address)+" ")]),_vm._v(" "),_c('div',{staticClass:"address-header-line-2"},[_vm._v("PHILADELPHIA, PA "+_vm._s(_vm.zipCode))])]),_vm._v(" "),(this.fullScreenTopicsEnabled || this.fullScreenTopicsOnly)?_c('div',{staticClass:"address-input-container columns small-24 medium-12 large-12",style:(this.addressInputContainerStyle)},[_c('address-input',{attrs:{"widthFromConfig":this.addressInputWidth,"placeholder":this.addressInputPlaceholder}},[(this.addressAutocompleteEnabled)?_c('address-candidate-list',{attrs:{"slot":"address-candidates-slot","widthFromConfig":this.addressInputWidth},slot:"address-candidates-slot"}):_vm._e(),_vm._v(" /> ")],1)],1):_vm._e()]):_vm._e(),_vm._v(" "),(!_vm.shouldShowGreeting)?_c('div',{staticClass:"topics-container cell medium-cell-block-y",style:(_vm.topicsContainerStyle)},[_c('topic-component-group',{attrs:{"topic-components":this.$config.components}})],1):_vm._e()]):_vm._e()],1)},staticRenderFns: [function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('full-screen-topics-toggle-tab')}],_scopeId: 'data-v-c37cf8b6',
    components: {
      Greeting: Greeting,
      TopicComponentGroup: TopicComponentGroup,
      Topic: Topic,
      AddressInput: AddressInput,
      AddressCandidateList: AddressCandidateList,
      FullScreenTopicsToggleTab: FullScreenTopicsToggleTab,
    },
    data: function data() {
      var data = {
        topicsContainerStyle: {
          'overflow-y': 'auto',
          'height': '100px',
        },
        addressContainerStyle: {
          'height': '100%',
          'padding-bottom:': '20px',
        },
        addressInputContainerStyle: {
          'align-items': 'flex-start',
          'height': '100%',
          'padding-top': '20px',
        }
      };
      return data;
    },
    mounted: function mounted() {
      window.addEventListener('click', this.closeAddressCandidateList);
      window.addEventListener('resize', this.handleWindowResize);
      this.handleWindowResize();
    },
    computed: {
      inputAlign: function inputAlign() {
        if (this.$config.addressInput.position) {
          var position = this.$config.addressInput.position;
          switch(position) {
            case 'left':
              return 'flex-start';
            case 'right':
              return 'flex-end';
            case 'center':
              return 'center';
          }
        } else {
          return 'flex-start';
        }
      },
      addressInputWidth: function addressInputWidth() {
        return this.$config.addressInput.width;
      },
      addressInputPlaceholder: function addressInputPlaceholder() {
        return this.$config.addressInput.placeholder;
      },
      addressAutocompleteEnabled: function addressAutocompleteEnabled() {
        // TODO tidy up the code
        if (this.$config.addressInput.autocompleteEnabled === true) {
          return true;
        } else {
          return false;
        }
      },
      fullScreenMapEnabled: function fullScreenMapEnabled() {
        return this.$store.state.fullScreenMapEnabled;
      },
      fullScreenTopicsEnabled: function fullScreenTopicsEnabled() {
        return this.$store.state.fullScreenTopicsEnabled;
      },
      fullScreenTopicsOnly: function fullScreenTopicsOnly() {
        return this.$store.state.fullScreen.topicsOnly;
      },
      topicPanelContainerClass: function topicPanelContainerClass() {
        if (this.fullScreenTopicsEnabled || this.fullScreenTopicsOnly) {
          return 'medium-24 small-order-2 medium-order-1';
        } else if (this.fullScreenMapEnabled) {
          return 'medium-1 small-order-2 medium-order-1';
        } else {
          return 'medium-12 small-order-2 medium-order-1';
        }
      },
      addressContainerClass: function addressContainerClass() {
        if (this.fullScreenTopicsEnabled || this.fullScreenTopicsOnly) {
          return 'small-24 medium-12 large-12';
        } else {
          return 'small-24';
        }
      },
      geocode: function geocode() {
        return this.$store.state.geocode.data;
      },
      dorParcels: function dorParcels() {
        return this.$store.state.parcels.dor.data.length > 0;
      },
      shouldShowGreeting: function shouldShowGreeting() {
        return !(this.geocode || this.dorParcels);
      },
      // this returns the address shown in the address header
      address: function address() {
        var geocode = this.geocode;
        var dorParcels = this.$store.state.parcels.dor.data;
        var activeDorAddress = this.$store.state.parcels.dor.activeAddress;
        var address;
        if (this.$config.defaultAddressTextPlaceholder) {
          address = this.$config.defaultAddressTextPlaceholder;
        }

        if (geocode) {
          // TODO make this not ais-specific
          // REVIEW what's the difference between these two?
          var addressA = geocode.properties.street_address;
          var addressB = geocode.street_address;

          address = addressA || addressB;

        // a DOR address might be found even if there is no geocode
        } else if (activeDorAddress) {
          address = activeDorAddress;
        }

        return address;
      },
      zipCode: function zipCode() {
        var geocode = this.geocode;
        if (!geocode) { return null; }
        var zipCode = geocode.properties.zip_code;
        var zip4 = geocode.properties.zip_4;
        var parts = [zipCode];
        if (zip4) { parts.push(zip4); }
        return parts.join('-');
      },
    },
    methods: {
      closeAddressCandidateList: function closeAddressCandidateList() {
        this.$store.state.shouldShowAddressCandidateList = false;
      },
      shouldShowTopic: function shouldShowTopic(topic) {
        var requiredSources = topic.dataSources || [];

        // if there aren't any required topics, show it
        if (requiredSources.length === 0) {
          return true;
        }

        var sources = this.$store.state.sources;
        return requiredSources.every(function (key) { return sources[key].data; })
      },
      handleWindowResize: function handleWindowResize() {
        if ($(window).width() >= 750) {
          // console.log('handleWindowResize if is running, window width is >= 750px');
          this.addressContainerStyle = {
            'height': '100%',
            'align-items': 'flex-start',
            'padding-bottom': '20px',
          };
          this.addressInputContainerStyle = {
            'height': '100%',
            'align-items': this.inputAlign,
            'padding-top': '25px',
          };

          var rootElement = document.getElementById('mb-root');
          var rootStyle = window.getComputedStyle(rootElement);
          var rootHeight = rootStyle.getPropertyValue('height');
          var rootHeightNum = parseInt(rootHeight.replace('px', ''));
          var topicsHeight = rootHeightNum - 103;

          this.topicsContainerStyle.height = topicsHeight.toString() + 'px';
          this.topicsContainerStyle['overflow-y'] = 'auto';


        } else {
          this.addressContainerStyle = {
            'height': 'auto',
            'align-items': 'center',
            'padding-bottom': '20px',
          };
          this.addressInputContainerStyle = {
            'height': 'auto',
            'align-items': 'center',
            'padding-top': '5px',
          };
          // console.log('handleWindowResize lse is running, window width is < 750px');
          this.topicsContainerStyle.height = 'auto';
          this.topicsContainerStyle['overflow-y'] = 'hidden';
        }
      }
    }
  };

  var markersMixin = {
    watch: {
      activeFeature: function activeFeature(nextActiveFeature, prevActiveFeature) {
        // console.log('WATCH active feature', prevActiveFeature, '=>', nextActiveFeature);

        var layerMap = this.$store.state.map.map._layers;
        var layers = Object.values(layerMap);

        var updateFeaturePrev,
            updateFeatureNext,
            tableId,
            featureIdPrev,
            featureIdNext,
            matchingLayerNext,
            matchingLayerPrev;

        if (prevActiveFeature && prevActiveFeature.tableId && prevActiveFeature.featureId) {
          updateFeaturePrev = prevActiveFeature;
          tableId = updateFeaturePrev.tableId;
          featureIdPrev = updateFeaturePrev.featureId;
          matchingLayerPrev = layers.filter(function (layer) {
            var options = layer.options || {};
            var data = options.data;
            if (!data) { return; }
            var layerFeatureId = data.featureId;
            var layerTableId = data.tableId;
            return layerFeatureId === featureIdPrev && layerTableId === tableId;
          })[0];
          this.updateMarkerFillColor(matchingLayerPrev);
        }

        if (nextActiveFeature && nextActiveFeature.tableId && nextActiveFeature.featureId) {
          updateFeatureNext = nextActiveFeature;
          tableId = updateFeatureNext.tableId;
          featureIdNext = updateFeatureNext.featureId;
          matchingLayerNext = layers.filter(function (layer) {
            var options = layer.options || {};
            var data = options.data;
            if (!data) { return; }
            var layerFeatureId = data.featureId;
            var layerTableId = data.tableId;
            return layerFeatureId === featureIdNext && layerTableId === tableId;
          })[0];
          this.updateMarkerFillColor(matchingLayerNext);
          this.bringMarkerToFront(matchingLayerNext);
        }

      },
    },
    computed: {
      locationMarker: function locationMarker() {
        var latlngArray = [this.$store.state.map.location.lat, this.$store.state.map.location.lng];
        var marker = {
          latlng: latlngArray,
          radius: 6,
          fillColor: '#ff3f3f',
          color: '#ff0000',
          weight: 1,
          opacity: 1,
          fillOpacity: 1.0
        };
        return marker;
      },
      // returns map markers as simple object with a geometry property, key,
      // and optional properties for symbology
      markers: function markers() {
        var markers = [];

        // geocoded address marker
        var geocodeGeom = this.geocodeGeom;
        if (this.identifyFeature === 'address-marker' && geocodeGeom) {
          var latlng = [].concat( geocodeGeom.coordinates ).reverse();
          var key = this.geocodeResult.properties.street_address;
          var color = '#2176d2';
          var markerType = 'geocode';
          var addressMarker = {latlng: latlng, key: key, color: color, markerType: markerType};
          markers.push(addressMarker);
        }

        // marker for topic from config
        var topicMarker = this.activeTopicConfig.marker;
        // console.log('topicMarker', topicMarker);
        if (topicMarker) {
          var markerPath = topicMarker['path'];
          var path = this.$store.state.sources;
          for (var i = 0, list = markerPath; i < list.length; i += 1) {
            var level = list[i];

            console.log('level:', level, 'path:', path);
            if (path !== null && path !== undefined) {
              path = path[level];
            }
          }
          if (path !== null && path !== undefined) {
            var latlng$1 = [path[topicMarker.lat], path[topicMarker.lng]];
            var key$1 = path[topicMarker.key];
            var color$1 = topicMarker.color || 'green';
            var markerType$1 = 'overlay';
            var markerObject = {latlng: latlng$1, key: key$1, color: color$1, markerType: markerType$1};
            markers.push(markerObject);
          }
        }

        return markers;
      },
      circleMarkers: function circleMarkers() {
        var this$1 = this;

        var filteredData = this.$store.state.horizontalTables.filteredData;
        // const filteredData = this.filteredData;
        var circleMarkers = [];

        // get visible tables based on active topic
        var tableIds = this.$store.getters.visibleTableIds;

        // console.log('computed circleMarkers is rerunning, filteredData:', filteredData, 'tableIds:', tableIds);

        for (var i$1 = 0, list$1 = tableIds; i$1 < list$1.length; i$1 += 1) {
          var tableId = list$1[i$1];

          var tableConfig = this$1.getConfigForTable(tableId) || {};
          // console.log('tableId:', tableId, 'tableConfig:', tableConfig);
          var mapOverlay = (tableConfig.options || {}).mapOverlay;

          if (!mapOverlay || mapOverlay.marker !== 'circle') {
            continue;
          }

          var items = filteredData[tableId];

          if (items.length < 1) {
            continue;
          }

          var style = mapOverlay.style;

          // go through rows
          for (var i = 0, list = items; i < list.length; i += 1) {
            // console.log('tableId', tableId)
            var item = list[i];

            var latlng = (void 0);

            // TODO - get geometry field name from config
            if (item.geometry) {
              var ref = item.geometry.coordinates;
              var x = ref[0];
              var y = ref[1];
              latlng = [y, x];
            } else if (item.lat) {
              latlng = [item.lat, item.lng];
              // if (item.point_x) {
              //   latlng = [item.point_y, item.point_x];
              // } else if (item.geocode_x) {
              //   latlng = [item.geocode_y, item.geocode_x];
              // }
            }

            // check for active feature TODO - bind style props to state
            var props = Object.assign({}, style);
            props.latlng = latlng;
            props.featureId = item._featureId;
            props.tableId = tableId;
            circleMarkers.push(props);
          }
        }

        return circleMarkers;
      },

      // returns all geojson features to be rendered on the map along with
      // necessary props.
      geojsonFeatures: function geojsonFeatures() {
        var features = [];

        var identifyFeature = this.identifyFeature;
        var activeParcelLayer = this.activeParcelLayer;

        // TODO - get pwd parcel and dor parcel into the config file
        // pwd parcel
        if (identifyFeature === 'pwd-parcel' && activeParcelLayer === 'pwd' && this.pwdParcel) {
          var props = {};
          props.geojson = this.pwdParcel;
          props.color = 'blue';
          props.fillColor = 'blue';
          props.weight = 2;
          props.opacity = 1;
          props.fillOpacity = 0.3;
          props.key = props.geojson.properties.PARCELID;
          features.push(props);

        // dor parcel
        } else if (identifyFeature === 'dor-parcel' && activeParcelLayer === 'dor') {
          var dorParcelFeatures = this.dorParcels.map(function (dorParcel) {
            var props = {};
            props.geojson = dorParcel;
            props.color = 'blue';
            props.fillColor = 'blue';
            props.weight = 2;
            props.opacity = 1;
            props.fillOpacity = 0.3;
            props.key = dorParcel.properties.OBJECTID;
            return props;
          });
          features.push.apply(features, dorParcelFeatures);
        }

        // other geojson from config
        var topicGeojson = this.activeTopicConfig.geojson;
        if (topicGeojson) {
          console.log('topicGeojson exists:', topicGeojson);
          var geojsonPath = topicGeojson['path'];
          var path = this.$store.state.sources;
          for (var i = 0, list = geojsonPath; i < list.length; i += 1) {
            var level = list[i];

            if (path !== null) {
              path = path[level];
            }
          }
          if (path !== null) {
            console.log('path:', path);
            for (var i$1 = 0, list$1 = path; i$1 < list$1.length; i$1 += 1) {
              var geojson = list$1[i$1];

              var props$1 = Object.assign({}, topicGeojson.style);
              props$1.key = geojson[topicGeojson.key];
              props$1.geojson = geojson;
              features.push(props$1);
            }
          }
        }
        return features;
      },

      // these geojson features will have mouseover and mouseout events,
      // for highlighting horizontal table rows
      reactiveGeojsonFeatures: function reactiveGeojsonFeatures() {
        var this$1 = this;

        var features = [];

        var filteredData = this.$store.state.horizontalTables.filteredData;
        // get visible tables based on active topic
        var tableIds = this.$store.getters.visibleTableIds;

        for (var i$1 = 0, list$1 = tableIds; i$1 < list$1.length; i$1 += 1) {
          var tableId = list$1[i$1];

          var tableConfig = this$1.getConfigForTable(tableId) || {};
          var mapOverlay = (tableConfig.options || {}).mapOverlay;

          if (!mapOverlay || mapOverlay.marker !== 'geojson') {
            continue;
          }

          var items = filteredData[tableId];

          if (items.length < 1) {
            continue;
          }

          var style = mapOverlay.style;
          items.push(tableId);

          // go through rows
          for (var i = 0, list = items; i < list.length; i += 1) {
            var item = list[i];

            var props = Object.assign({}, style);

            props.geojson = item.geometry;
            props.key = item.id;
            props.featureId = item._featureId || null;
            props.tableId = items[items.length-1];
            features.push(props);
          }
        }
        return features;
      },

      leafletMarkers: function leafletMarkers() {
        var markers = [];

        markers.push.apply(markers, this.markers);
        markers.push.apply(markers, this.geojsonFeatures);

        return markers;
      },
    },
    methods: {
      getTableFromComps: function getTableFromComps(comps, tableId) {
        var matchingComps = comps.filter(function (comp) {
          return (
            comp.type === 'horizontal-table' &&
            comp._id == tableId
          );
        }) || [];
        return matchingComps[0];
      },
      getConfigForTable: function getConfigForTable(tableId) {
        var this$1 = this;

        var topics = this.$config.topics || [];

        for (var i$1 = 0, list$1 = topics; i$1 < list$1.length; i$1 += 1) {
          var topic = list$1[i$1];

          var comps = topic.components || [];

          // try outer comps
          var table = this$1.getTableFromComps(comps, tableId);

          if (table) { return table; }

          // try inner comps
          for (var i = 0, list = comps; i < list.length; i += 1) {
            var comp = list[i];

            var options = comp.options || {};

            var innerComps = options.components || options.tables || [];

            if (innerComps.length > 0) {
              var innerTable = this$1.getTableFromComps(innerComps, tableId);
              // console.log('table on 2nd try', innerTable, innerComps);

              if (innerTable) { return innerTable; }
            }
          }
        }
      },
      bringMarkerToFront: function bringMarkerToFront(circleMarker) {
        // put marker on top
        var el = circleMarker._path;

        // remove from parent
        var group = circleMarker._renderer._rootGroup;
        group.removeChild(el);

        // append to end (which brings it to the front)
        group.appendChild(el);
      },
      handleMarkerMouseover: function handleMarkerMouseover(e) {
        // console.log('handleMarkerMouseover is starting');
        if (!this.isMobileOrTablet) {
          // console.log('handleMarkerMouseover actions are running');
          var target = e.target;
          var ref = target.options.data;
          var featureId = ref.featureId;
          var tableId = ref.tableId;
          // console.log('target:', target, 'featureId:', featureId, 'tableId:', tableId);
          this.$store.commit('setActiveFeature', { featureId: featureId, tableId: tableId });
        }
      },
      handleMarkerClick: function handleMarkerClick(e) {
        // console.log('handleMarkerClick is starting');
        if (this.isMobileOrTablet) {
          // console.log('handleMarkerClick actions are running');
          var target = e.target;
          var ref = target.options.data;
          var featureId = ref.featureId;
          var tableId = ref.tableId;
          // console.log('target:', target, 'featureId:', featureId, 'tableId:', tableId);
          this.$store.commit('setActiveFeature', { featureId: featureId, tableId: tableId });
        }
      },
      handleMarkerMouseout: function handleMarkerMouseout(e) {
        // console.log('handleMarkerMouseout is starting');
        // if (!this.isMobileOrTablet) {
          // console.log('handleMarkerMouseout actions are running');
          var target = e.target;
          this.$store.commit('setActiveFeature', null);
        // }
      },
      updateMarkerFillColor: function updateMarkerFillColor(marker) {
        // console.log('updateMarkerFillColor, marker:', marker);
        // get next fill color
        var ref = marker.options.data;
        var featureId = ref.featureId;
        var tableId = ref.tableId;
        var nextFillColor = this.fillColorForCircleMarker(featureId, tableId);

        // highlight. we're doing this here (non-reactively) because binding the
        // fill color property was not performing well enough.
        var nextStyle = Object.assign({}, marker.options);
        nextStyle.fillColor = nextFillColor;
        marker.setStyle(nextStyle);
      },
    }
  };

  (function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=" .mb-panel-map[data-v-11a08c18] { /*this allows the loading mask to fill the div*/ position: relative; } .mb-map-with-widget[data-v-11a08c18] { height: 50%; } .widget-slot[data-v-11a08c18] { display: inline-block; float: left; } .mb-map-loading-mask[data-v-11a08c18] { /*display: inline;*/ position: absolute; top: 0; height: 100%; width: 100%; background: rgba(0, 0 ,0 , 0.25); z-index: 1000; text-align: center; vertical-align: middle; } .mb-map-loading-mask-inner[data-v-11a08c18] { position: absolute; top: 40%; left: 40%; } /*small retina*/ /*@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi), (max-width: 39.9375em) { .mb-search-control-input { max-width: 250px; } }*/ "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();
  var cyclomediaMixin = philaVueMapping.CyclomediaMixin;
  var pictometryMixin = philaVueMapping.PictometryMixin;

  // vue doesn't like it when you import this as Map (reserved-ish word)
  var Map_ = philaVueMapping.Map_;
  var Control = philaVueMapping.Control;
  var AddressInput$1 = philaVueMapping.AddressInput;
  var AddressCandidateList$1 = philaVueMapping.AddressCandidateList;
  var EsriTiledMapLayer = philaVueMapping.EsriTiledMapLayer;
  var EsriTiledOverlay = philaVueMapping.EsriTiledOverlay;
  var EsriDynamicMapLayer = philaVueMapping.EsriDynamicMapLayer;
  var EsriFeatureLayer = philaVueMapping.EsriFeatureLayer;
  var Geojson = philaVueMapping.Geojson;
  var CircleMarker = philaVueMapping.CircleMarker;
  var OpacitySlider = philaVueMapping.OpacitySlider;
  var VectorMarker = philaVueMapping.VectorMarker;
  var PngMarker = philaVueMapping.PngMarker;
  var BasemapToggleControl = philaVueMapping.BasemapToggleControl;
  var BasemapSelectControl = philaVueMapping.BasemapSelectControl;
  var FullScreenMapToggleTab = philaVueMapping.FullScreenMapToggleTab;
  var LocationControl = philaVueMapping.LocationControl;
  var CyclomediaButton = philaVueMapping.CyclomediaButton;
  var PictometryButton = philaVueMapping.PictometryButton;
  var CyclomediaRecordingCircle = philaVueMapping.CyclomediaRecordingCircle;
  var CyclomediaRecordingsClient = philaVueMapping.CyclomediaRecordingsClient;
  var SvgViewConeMarker = philaVueMapping.SvgViewConeMarker;
  var MeasureControl = philaVueMapping.MeasureControl;
  var LegendControl = philaVueMapping.LegendControl;
  var BasemapTooltip = philaVueMapping.BasemapTooltip;
  var ControlCorner = philaVueMapping.ControlCorner;

  var MapPanel = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:this.mapPanelContainerClass,attrs:{"id":"map-panel-container"}},[_vm._m(0),_vm._v(" "),_c('map_',{class:{ 'mb-map-with-widget': this.$store.state.cyclomedia.active || this.$store.state.pictometry.active },attrs:{"id":"map-tag","center":this.$store.state.map.center,"zoom":this.$store.state.map.zoom,"zoom-control-position":"bottomright","min-zoom":this.$config.map.minZoom,"max-zoom":this.$config.map.maxZoom},on:{"l-click":_vm.handleMapClick,"l-moveend":_vm.handleMapMove}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.isGeocoding),expression:"isGeocoding"}],staticClass:"mb-map-loading-mask"},[_c('div',{staticClass:"mb-map-loading-mask-inner"},[_c('i',{staticClass:"fa fa-spinner fa-4x spin"}),_vm._v(" "),_c('h1',[_vm._v("Finding address...")])])]),_vm._v(" "),_vm._l((this.$config.map.basemaps),function(basemap,key){return (_vm.activeBasemap === key)?_c('esri-tiled-map-layer',{key:key,attrs:{"url":basemap.url,"max-zoom":basemap.maxZoom,"attribution":basemap.attribution}}):_vm._e()}),_vm._v(" "),_vm._l((this.$config.map.tiledLayers),function(tiledLayer,key){return (_vm.tiledLayers.includes(key))?_c('esri-tiled-map-layer',{key:key,attrs:{"url":tiledLayer.url,"zIndex":tiledLayer.zIndex,"attribution":tiledLayer.attribution}}):_vm._e()}),_vm._v(" "),_vm._l((this.$config.map.tiledOverlays),function(tiledLayer,key){return (_vm.activeTiledOverlays.includes(key))?_c('esri-tiled-overlay',{key:key,attrs:{"url":tiledLayer.url,"zIndex":tiledLayer.zIndex,"opacity":tiledLayer.opacity}}):_vm._e()}),_vm._v(" "),_vm._l((this.$config.map.dynamicMapLayers),function(dynamicLayer,key){return (_vm.activeDynamicMaps.includes(key))?_c('esri-dynamic-map-layer',{key:key,attrs:{"url":dynamicLayer.url,"attribution":dynamicLayer.attribution,"transparent":true,"opacity":dynamicLayer.opacity}}):_vm._e()}),_vm._v(" "),_vm._l((this.$config.map.featureLayers),function(featureLayer,key){return (_vm.shouldShowFeatureLayer(key, featureLayer.minZoom))?_c('esri-feature-layer',{key:key,attrs:{"layerName":key,"url":featureLayer.url,"color":featureLayer.color,"fillColor":featureLayer.color,"fillOpacity":featureLayer.fillOpacity,"weight":featureLayer.weight,"style_":featureLayer.style,"minZoom":featureLayer.minZoom,"maxZoom":featureLayer.maxZoom,"zIndex":featureLayer.zIndex,"markerType":featureLayer.markerType,"radius":featureLayer.radius}}):_vm._e()}),_vm._v(" "),_vm._l((this.imageOverlayItems),function(item,key){return (_vm.shouldShowImageOverlay(item.properties.RECMAP))?_c('esri-dynamic-map-layer',{key:key,attrs:{"url":'//gis.phila.gov/arcgis/rest/services/Atlas/RegMaps/MapServer',"layers":[0],"layerDefs":'0:NAME=\'g' + item.properties.RECMAP.toLowerCase() + '.tif\'',"transparent":true,"opacity":0.5}}):_vm._e()}),_vm._v(" "),_vm._l((_vm.markers),function(marker,index){return _c('vector-marker',{key:marker.key,attrs:{"latlng":marker.latlng,"markerColor":marker.color}})}),_vm._v(" "),(this.cyclomediaActive)?_c('png-marker',{attrs:{"icon":'../../src/assets/camera.png',"latlng":_vm.cycloLatlng,"rotationAngle":_vm.cycloRotationAngle}}):_vm._e(),_vm._v(" "),(this.cyclomediaActive)?_c('svg-view-cone-marker',{attrs:{"latlng":_vm.cycloLatlng,"rotationAngle":_vm.cycloRotationAngle,"hFov":_vm.cycloHFov}}):_vm._e(),_vm._v(" "),_vm._l((_vm.geojsonFeatures),function(geojsonFeature){return (_vm.shouldShowGeojson(geojsonFeature.key))?_c('geojson',{key:geojsonFeature.key,attrs:{"geojson":geojsonFeature.geojson,"fillColor":geojsonFeature.fillColor,"color":geojsonFeature.color,"weight":geojsonFeature.weight,"opacity":geojsonFeature.opacity,"fillOpacity":geojsonFeature.fillOpacity,"data":{
                 featureId: geojsonFeature.featureId,
                 tableId: geojsonFeature.tableId
               }}}):_vm._e()}),_vm._v(" "),_vm._l((_vm.reactiveGeojsonFeatures),function(geojsonFeature){return (_vm.shouldShowGeojson(geojsonFeature.key))?_c('geojson',{key:geojsonFeature.key,attrs:{"geojson":geojsonFeature.geojson,"fillColor":geojsonFeature.fillColor,"color":geojsonFeature.color,"weight":geojsonFeature.weight,"opacity":geojsonFeature.opacity,"fillOpacity":geojsonFeature.fillOpacity,"data":{
                  featureId: geojsonFeature.featureId,
                  tableId: geojsonFeature.tableId
                }},on:{"l-mouseover":_vm.handleMarkerMouseover,"l-click":_vm.handleMarkerClick,"l-mouseout":_vm.handleMarkerMouseout}}):_vm._e()}),_vm._v(" "),(this.$store.state.map.location.lat != null)?_c('circle-marker',{key:Math.random(),attrs:{"latlng":this.locationMarker.latlng,"radius":this.locationMarker.radius,"fillColor":this.locationMarker.fillColor,"color":this.locationMarker.color,"weight":this.locationMarker.weight,"opacity":this.locationMarker.opacity,"fillOpacity":this.locationMarker.fillOpacity}}):_vm._e(),_vm._v(" "),_vm._l((_vm.circleMarkers),function(circleMarker){return _c('circle-marker',{key:Math.random(),attrs:{"latlng":circleMarker.latlng,"radius":circleMarker.radius,"fillColor":circleMarker.fillColor,"color":circleMarker.color,"weight":circleMarker.weight,"opacity":circleMarker.opacity,"fillOpacity":circleMarker.fillOpacity,"data":{
                       featureId: circleMarker.featureId,
                       tableId: circleMarker.tableId
                     }},on:{"l-mouseover":_vm.handleMarkerMouseover,"l-click":_vm.handleMarkerClick,"l-mouseout":_vm.handleMarkerMouseout}})}),_vm._v(" "),_c('control-corner',{attrs:{"vSide":'top',"hSide":'almostright'}}),_vm._v(" "),_c('control-corner',{attrs:{"vSide":'top',"hSide":'almostleft'}}),_vm._v(" "),_vm._m(2),_vm._v(" "),_vm._m(3),_vm._v(" "),_vm._m(5),_vm._v(" "),_vm._m(7),_vm._v(" "),(this.measureControlEnabled)?_vm._m(8):_vm._e(),_vm._v(" "),_vm._m(9),_vm._v(" "),_vm._m(11),_vm._v(" "),_vm._m(12),_vm._v(" "),(this.addressAutocompleteEnabled)?_c('AddressCandidateList',{attrs:{"position":this.addressInputPosition}}):_vm._e(),_vm._v(" "),_vm._l((_vm.cyclomediaRecordings),function(recording){return (_vm.cyclomediaActive)?_c('cyclomedia-recording-circle',{key:recording.imageId,attrs:{"imageId":recording.imageId,"latlng":[recording.lat, recording.lng],"size":1.2,"color":'#3388ff',"weight":1},on:{"l-click":_vm.handleCyclomediaRecordingClick}}):_vm._e()})],2),_vm._v(" "),_vm._t("cycloWidget"),_vm._v(" "),_vm._t("pictWidget")],2)},staticRenderFns: [function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('full-screen-map-toggle-tab')},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('basemap-toggle-control',{attrs:{"position":'topright'}})},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[(_vm.shouldShowImageryToggle)?_vm._m(1):_vm._e()],1)},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('basemap-select-control',{attrs:{"position":this.basemapSelectControlPosition}})],1)},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('pictometry-button',{attrs:{"position":'topright',"link":'pictometry',"imgSrc":'../../src/assets/pictometry.png'}})},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[(this.shouldShowPictometryButton)?_vm._m(4):_vm._e()],1)},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('cyclomedia-button',{attrs:{"position":'topright',"link":'cyclomedia',"imgSrc":'../../src/assets/cyclomedia.png'},on:{"click":_vm.handleCyclomediaButtonClick}})},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[(this.shouldShowCyclomediaButton)?_vm._m(6):_vm._e()],1)},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('measure-control',{attrs:{"position":'bottomleft'}})],1)},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',_vm._l((Object.keys(_vm.legendControls)),function(legendControl){return _c('legend-control',{key:legendControl,attrs:{"position":'bottomleft',"options":_vm.legendControls[legendControl].options,"items":_vm.legendControls[legendControl].data}})}))},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('location-control',{attrs:{"position":'bottomright'}})},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[(this.geolocationEnabled)?_vm._m(10):_vm._e()],1)},function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('AddressInput',{attrs:{"position":this.addressInputPosition}})],1)}],_scopeId: 'data-v-11a08c18',
    mixins: [
      markersMixin,
      cyclomediaMixin,
      pictometryMixin ],
    components: {
      Map_: Map_,
      Control: Control,
      AddressInput: AddressInput$1,
      AddressCandidateList: AddressCandidateList$1,
      EsriTiledMapLayer: EsriTiledMapLayer,
      EsriTiledOverlay: EsriTiledOverlay,
      EsriDynamicMapLayer: EsriDynamicMapLayer,
      EsriFeatureLayer: EsriFeatureLayer,
      Geojson: Geojson,
      CircleMarker: CircleMarker,
      OpacitySlider: OpacitySlider,
      VectorMarker: VectorMarker,
      PngMarker: PngMarker,
      BasemapToggleControl: BasemapToggleControl,
      BasemapSelectControl: BasemapSelectControl,
      FullScreenMapToggleTab: FullScreenMapToggleTab,
      LocationControl: LocationControl,
      PictometryButton: PictometryButton,
      CyclomediaButton: CyclomediaButton,
      CyclomediaRecordingCircle: CyclomediaRecordingCircle,
      SvgViewConeMarker: SvgViewConeMarker,
      MeasureControl: MeasureControl,
      LegendControl: LegendControl,
      BasemapTooltip: BasemapTooltip,
      ControlCorner: ControlCorner,
    },
    created: function created() {
      console.log('MapPanel created, this.$config.map:', this.$config.map);
      // if there's a default address, navigate to it
      var defaultAddress = this.$config.defaultAddress;
      if (defaultAddress) {
        this.$controller.goToDefaultAddress(defaultAddress);
      }

      var cyclomediaConfig = this.$config.cyclomedia || {};
      if (cyclomediaConfig.enabled) {
      // create cyclomedia recordings client
        this.$cyclomediaRecordingsClient = new CyclomediaRecordingsClient(
          this.$config.cyclomedia.recordingsUrl,
          this.$config.cyclomedia.username,
          this.$config.cyclomedia.password,
          4326
        );
      }
    },
    mounted: function mounted() {
      // this.geofind();
      this.$controller.appDidLoad();
    },
    computed: {
      // shouldShowAddressInput() {
      //   if (this.$config.addressInputLocation == 'map') {
      //     return true;
      //   } else {
      //     return false;
      //   }
      // },
      addressAutocompleteEnabled: function addressAutocompleteEnabled() {
        // TODO tidy up the code
        if (this.$config.addressInput.autocompleteEnabled === true) {
          return true;
        } else {
          return false;
        }
      },
      addressInputPosition: function addressInputPosition() {
        if (this.isMobileOrTablet) {
          return 'topleft'
        } else {
          return 'topalmostleft'
        }
      },
      basemapSelectControlPosition: function basemapSelectControlPosition() {
        if (this.isMobileOrTablet) {
          return 'topright'
        } else {
          return 'topalmostright'
        }
      },
      shouldShowAddressCandidateList: function shouldShowAddressCandidateList() {
        return this.$store.state.map.shouldShowAddressCandidateList;
      },
      measureControlEnabled: function measureControlEnabled() {
        if (this.$config.measureControlEnabled === false) {
          return false;
        } else {
          return true;
        }
      },
      fullScreenMapEnabled: function fullScreenMapEnabled() {
        return this.$store.state.fullScreenMapEnabled;
      },
      fullScreenTopicsEnabled: function fullScreenTopicsEnabled() {
        return this.$store.state.fullScreenTopicsEnabled;
      },
      mapPanelContainerClass: function mapPanelContainerClass() {
        // return 'medium-12 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map'
        if (this.fullScreenMapEnabled) {
          return 'medium-24 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map'
        } else if (this.fullScreenMapOnly) {
          return 'medium-1 small-order-1 small-1 medium-order-2 mb-panel mb-panel-map'
        } else if (this.fullScreenTopicsEnabled) {
          return 'medium-1 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map'
        } else {
          return 'medium-12 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map'
        }
      },
      cycloLatlng: function cycloLatlng() {
        if (this.$store.state.cyclomedia.orientation.xyz !== null) {
          var xyz = this.$store.state.cyclomedia.orientation.xyz;
          return [xyz[1], xyz[0]];
        } else {
          var center = this.$config.map.center;
          return center;
        }
      },
      cycloRotationAngle: function cycloRotationAngle() {
        return this.$store.state.cyclomedia.orientation.yaw * (180/3.14159265359);
      },
      cycloHFov: function cycloHFov() {
        return this.$store.state.cyclomedia.orientation.hFov;
      },
      isMobileOrTablet: function isMobileOrTablet() {
        return this.$store.state.isMobileOrTablet;
      },
      shouldShowCyclomediaButton: function shouldShowCyclomediaButton() {
        return this.$config.cyclomedia.enabled && !this.isMobileOrTablet;
      },
      shouldShowPictometryButton: function shouldShowPictometryButton() {
        return this.$config.pictometry.enabled && !this.isMobileOrTablet;
      },
      geolocationEnabled: function geolocationEnabled() {
        return this.$config.geolocation.enabled;
      },
      activeDorParcel: function activeDorParcel() {
        // return this.$store.state.activeDorParcel;
        return this.$store.state.parcels.dor.activeParcel;
      },
      legendControls: function legendControls() {
        return this.$config.legendControls;
      },
      imageOverlay: function imageOverlay() {
        return this.$store.state.map.imageOverlay;
      },
      imageOverlayItems: function imageOverlayItems() {
        // console.log('calculating imageOverlayItem');
        if (this.activeTopicConfig.imageOverlayGroup) {
          var overlayGroup = this.activeTopicConfig.imageOverlayGroup;
          var state = this.$store.state;
          var overlay = this.$config.imageOverlayGroups[overlayGroup].items(state);
          // console.log('returning imageOverlayItem', overlay);
          return overlay;
        } else {
          return [];
        }
      },
      imageOverlayInfo: function imageOverlayInfo() {
        console.log('config:', this.$config);
        return this.$config.map.dynamicMapLayers.regmaps;
      },
      activeBasemap: function activeBasemap() {
        var shouldShowImagery = this.$store.state.map.shouldShowImagery;
        if (shouldShowImagery) {
          return this.$store.state.map.imagery;
        }
        var defaultBasemap = this.$config.map.defaultBasemap;
        var basemap = this.$store.state.map.basemap || defaultBasemap;
        return basemap;
      },
      tiledLayers: function tiledLayers() {
        var activeBasemap = this.activeBasemap;
        var activeBasemapConfig = this.configForBasemap(activeBasemap);

        return activeBasemapConfig.tiledLayers || [];
      },
      activeTiledOverlays: function activeTiledOverlays() {
        if (!this.activeTopicConfig || !this.activeTopicConfig.tiledOverlays) {
          return [];
        } else {
          return this.activeTopicConfig.tiledOverlays;
        }
      },
      activeDynamicMaps: function activeDynamicMaps() {
        if (!this.activeTopicConfig || !this.activeTopicConfig.dynamicMapLayers) {
          return [];
        } else {
          return this.activeTopicConfig.dynamicMapLayers;
        }
      },
      activeFeatureLayers: function activeFeatureLayers() {
        if (!this.activeTopicConfig || !this.activeTopicConfig.featureLayers) {
          return [];
        } else {
          return this.activeTopicConfig.featureLayers;
        }
      },
      activeFeature: function activeFeature() {
        return this.$store.state.activeFeature;
      },
      basemaps: function basemaps() {
        return Object.values(this.$config.map.basemaps);
      },
      imageryBasemaps: function imageryBasemaps() {
        return this.basemaps.filter(function (basemap) { return basemap.type === 'imagery'; });
      },
      hasImageryBasemaps: function hasImageryBasemaps() {
        return this.imageryBasemaps.length > 0;
      },
      shouldShowImageryToggle: function shouldShowImageryToggle() {
        return this.hasImageryBasemaps// && this.$config.map.imagery.enabled;
      },
      identifyFeature: function identifyFeature() {
        var configFeature;
        if (this.geocodeType === 'intersection') {
          configFeature = "address-marker";
        } else if (this.activeTopicConfig.identifyFeature) {
          configFeature = this.activeTopicConfig.identifyFeature;
        } else {
          if (this.$config) {
            configFeature = this.$config.map.defaultIdentifyFeature;
          }
        }
        return configFeature;
      },
      activeTopic: function activeTopic() {
        return this.$store.state.activeTopic;
      },
      activeTopicConfig: function activeTopicConfig() {
        var key = this.activeTopic;
        var config;

        // if no active topic, return null
        if (key) {
          config = this.$config.topics.filter(function (topic) {
            return topic.key === key;
          })[0];
        }

        return config || {};
      },
      activeParcelLayer: function activeParcelLayer() {
        return this.activeTopicConfig.parcels;
      },
      dorParcels: function dorParcels() {
        return this.$store.state.parcels.dor.data;
      },
      pwdParcel: function pwdParcel() {
        return this.$store.state.parcels.pwd;
      },
      geocodeResult: function geocodeResult() {
        return this.$store.state.geocode.data || {};
      },
      geocodeGeom: function geocodeGeom() {
        return this.geocodeResult.geometry;
      },
      geocodeType: function geocodeType() {
        return this.geocodeResult.ais_feature_type;
      },
      streetAddress: function streetAddress() {
        return this.geocodeResult.properties.street_address;
      },
      picOrCycloActive: function picOrCycloActive() {
        if (this.cyclomediaActive || this.pictometryActive) {
          return true;
        } else {
          return false;
        }
      },
      mapBounds: function mapBounds() {
        // TODO calculate map bounds based on leaflet markers above
      },
      boundsBasedOnShape: function boundsBasedOnShape() {
        return this.$store.state.map.boundsBasedOnShape;
      },
      isGeocoding: function isGeocoding() {
        return this.$store.state.geocode.status === 'waiting';
      }
    },
    watch: {
      picOrCycloActive: function picOrCycloActive(value) {
        var this$1 = this;

        this.$nextTick(function () {
          this$1.$store.state.map.map.invalidateSize();
        });
      },
      geojsonFeatures: function geojsonFeatures() {
        this.setMapToBounds();
      },
      markers: function markers() {
        this.setMapToBounds();
      },
      fullScreenTopicsEnabled: function fullScreenTopicsEnabled() {
        var this$1 = this;

        this.$nextTick(function () {
          this$1.$store.state.map.map.invalidateSize();
        });
      }
    },
    methods: {
      setMapToBounds: function setMapToBounds() {
        var this$1 = this;

        // console.log('setMapToBounds is running');
        var featureArray = [];
        if (this.activeTopicConfig.zoomToShape) {
          if (this.activeTopicConfig.zoomToShape.includes('geojson')) {
            for (var i = 0, list = this$1.geojsonFeatures; i < list.length; i += 1) {
              var geojsonFeature = list[i];

              featureArray.push(L.geoJSON(geojsonFeature.geojson));
            }
          }
          if (this.activeTopicConfig.zoomToShape.includes('marker')) {
            for (var i$1 = 0, list$1 = this$1.markers; i$1 < list$1.length; i$1 += 1) {
              var marker = list$1[i$1];

              if (marker.markerType === 'overlay') {
                featureArray.push(L.marker(marker.latlng));
              }
            }
          }
          var group = new L.featureGroup(featureArray);
          var bounds = group.getBounds();
          this.$store.commit('setMapBounds', bounds);
        }
      },
      configForBasemap: function configForBasemap(basemap) {
        return this.$config.map.basemaps[basemap] || {};
      },
      shouldShowGeojson: function shouldShowGeojson(key) {
        if (this.activeTopicConfig.basemap === 'pwd') {
          return true;
        } else {
          return key === this.activeDorParcel;
        }
      },
      shouldShowImageOverlay: function shouldShowImageOverlay(key) {
        return key === this.imageOverlay;
      },
      shouldShowFeatureLayer: function shouldShowFeatureLayer(key, minZoom) {
        if (this.activeFeatureLayers.includes(key)) {
          if (minZoom) {
            return this.$store.state.map.zoom >= minZoom;
          }
          return true;
        }
        return false;
      },
      handleMapClick: function handleMapClick(e) {
        // console.log('MapPanel.vue handleMapClick e:', e);
        // latLng = L.latLng(e.lat, e.lng)
        this.$controller.handleMapClick(e);
      },

      handleMapMove: function handleMapMove(e) {
        var map = this.$store.state.map.map;

        var pictometryConfig = this.$config.pictometry || {};

        var center = map.getCenter();
        var lat = center.lat;
        var lng = center.lng;
        var coords = [lng, lat];

        if (pictometryConfig.enabled) {
          // update state for pictometry
          this.$store.commit('setPictometryMapCenter', coords);

          var zoom = map.getZoom();
          this.$store.commit('setPictometryMapZoom', zoom);
        }

        var cyclomediaConfig = this.$config.cyclomedia || {};

        if (cyclomediaConfig.enabled) {
          // update cyclo recordings
          this.updateCyclomediaRecordings();
          this.$store.commit('setCyclomediaLatLngFromMap', [lat, lng]);
        }
      },
      fillColorForCircleMarker: function fillColorForCircleMarker(markerId, tableId) {
        // get map overlay style and hover style for table
        var tableConfig = this.getConfigForTable(tableId);
        var mapOverlay = tableConfig.options.mapOverlay;
        var style = mapOverlay.style;
        var hoverStyle = mapOverlay.hoverStyle;

        // compare id to active feature id
        var activeFeature = this.activeFeature;
        var useHoverStyle = (
          markerId === activeFeature.featureId &&
          tableId === activeFeature.tableId
        );
        var curStyle = useHoverStyle ? hoverStyle : style;

        return curStyle.fillColor;
      },
    }, // end of methods
  }; //end of export

  (function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=" /*don't highlight any form elements*/ input:focus, select:focus, textarea:focus, button:focus { outline: none; } .mb-panel-topics-with-widget { height: 50%; } /* standards applies padding to buttons, which causes some weirdness with buttons on the map panel. override here. */ button { padding: inherit; } .topic-panel-false { /* display: none; */ } @media screen and (min-width: 46.875em) { .topic-panel-false { display: none; } .map-panel-false { display: none; } } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();

  var CyclomediaWidget = philaVueMapping.CyclomediaWidget;
  var PictometryWidget = philaVueMapping.PictometryWidget;
  var Layer = philaVueMapping.PictometryLayer;
  var ViewCone = philaVueMapping.PictometryViewCone;
  var PngMarker$1 = philaVueMapping.PictometryPngMarker;

  var Mapboard = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.rootClass,style:(_vm.mbRootStyle),attrs:{"id":"mb-root"}},[_c('topic-panel',{class:this.shouldShowTopicPanel}),_vm._v(" "),(this.fullScreenTopicsOnly !== true)?_c('map-panel',{class:this.shouldShowMapPanel},[(this.shouldLoadCyclomediaWidget)?_c('cyclomedia-widget',{directives:[{name:"show",rawName:"v-show",value:(_vm.cyclomediaActive),expression:"cyclomediaActive"}],attrs:{"slot":"cycloWidget","screen-percent":"2"},slot:"cycloWidget"}):_vm._e(),_vm._v(" "),(this.shouldLoadPictometryWidget)?_c('pictometry-widget',{directives:[{name:"show",rawName:"v-show",value:(_vm.pictometryActive),expression:"pictometryActive"}],attrs:{"slot":"pictWidget","apiKey":this.ak,"secretKey":this.sk},slot:"pictWidget"},[(this.pictometryShowAddressMarker)?_c('png-marker',{attrs:{"latlng":[this.geocodeData.geometry.coordinates[1], this.geocodeData.geometry.coordinates[0]],"icon":'markers.png',"height":60,"width":40,"offsetX":0,"offsetY":0}}):_vm._e(),_vm._v(" "),(this.pictometryActive)?_c('layer'):_vm._e(),_vm._v(" "),(this.cyclomediaActive && this.pictometryActive)?_c('png-marker',{attrs:{"latlng":_vm.cycloLatlng,"icon":'camera2.png',"height":20,"width":30,"offsetX":-2,"offsetY":-2}}):_vm._e(),_vm._v(" "),(this.cyclomediaActive && this.pictometryActive)?_c('view-cone',{attrs:{"latlng":_vm.cycloLatlng,"rotationAngle":_vm.cycloRotationAngle,"hFov":_vm.cycloHFov}}):_vm._e()],1):_vm._e()],1):_vm._e()],1)},staticRenderFns: [],
    components: {
      TopicPanel: TopicPanel,
      MapPanel: MapPanel,
      CyclomediaWidget: CyclomediaWidget,
      PictometryWidget: PictometryWidget,
      Layer: Layer,
      PngMarker: PngMarker$1,
      ViewCone: ViewCone
    },
    data: function data() {
      var data = {
        // this will only affect the app size if the app is set to "plugin" mode
        mbRootStyle: {
          'height': '100px'
        }
      };
      return data;
    },
    created: function created() {
      console.log('MapBoard created, this.$config.map:', this.$config.map);
      if (this.$config.panels) {
        if (!this.$config.panels.includes('map')) {
          this.$store.commit('setTopicsOnly', true);
        } else if (!this.$config.panels.includes('topics')) {
          this.$store.commit('setMapOnly', true);
        }
      }
      window.addEventListener('click', this.closeAddressCandidateList);
      window.addEventListener('resize', this.handleWindowResize);
      this.handleWindowResize();
    },
    computed: {
      rootClass: function rootClass() {
        if (this.$config.plugin) {
          return 'grid-x';
        } else {
          return 'cell medium-auto grid-x';
        }
      },
      isMobileOrTablet: function isMobileOrTablet() {
        return this.$store.state.isMobileOrTablet;
      },
      shouldLoadCyclomediaWidget: function shouldLoadCyclomediaWidget() {
        return this.$config.cyclomedia.enabled && !this.isMobileOrTablet;
      },
      shouldLoadPictometryWidget: function shouldLoadPictometryWidget() {
        return this.$config.pictometry.enabled && !this.isMobileOrTablet;
      },
      fullScreenMapOnly: function fullScreenMapOnly() {
        return this.$store.state.fullScreen.mapOnly;
      },
      fullScreenMapEnabled: function fullScreenMapEnabled() {
        return this.$store.state.fullScreenMapEnabled;
      },
      fullScreenTopicsOnly: function fullScreenTopicsOnly() {
        return this.$store.state.fullScreen.topicsOnly;
      },
      fullScreenTopicsEnabled: function fullScreenTopicsEnabled() {
        return this.$store.state.fullScreenTopicsEnabled;
      },
      shouldShowTopicPanel: function shouldShowTopicPanel() {
        var value;
        if (!this.fullScreenMapEnabled && !this.fullScreenMapOnly) {
          value = 'topic-panel-true';
        } else {
          value = 'topic-panel-false';
        }
        return value;
      },
      shouldShowMapPanel: function shouldShowMapPanel() {
        var value;
        if (!this.fullScreenTopicsEnabled && !this.fullScreenTopicsOnly) {
          value = 'map-panel-true';
        } else {
          value = 'map-panel-false';
        }
        return value;
      },
      cyclomediaActive: function cyclomediaActive() {
        return this.$store.state.cyclomedia.active
      },
      cycloLatlng: function cycloLatlng() {
        if (this.$store.state.cyclomedia.orientation.xyz !== null) {
          var xyz = this.$store.state.cyclomedia.orientation.xyz;
          return [xyz[1], xyz[0]];
        } else {
          var center = this.$config.map.center;
          return center;
        }
      },
      cycloRotationAngle: function cycloRotationAngle() {
        return this.$store.state.cyclomedia.orientation.yaw * (180/3.14159265359);
      },
      cycloHFov: function cycloHFov() {
        return this.$store.state.cyclomedia.orientation.hFov;
      },
      pictometryActive: function pictometryActive() {
        return this.$store.state.pictometry.active
      },
      pictometryZoom: function pictometryZoom() {
        return this.$store.state.pictometry.zoom
      },
      pictometryShowAddressMarker: function pictometryShowAddressMarker() {
        if (!this.pictometryActive || !this.geocodeData) {
          return false;
        } else if (this.pictometryZoom < 20 && this.cyclomediaActive) {
          return false;
        } else {
          return true;
        }
      },
      geocodeData: function geocodeData() {
        return this.$store.state.geocode.data
      },
      ak: function ak() {
        var host = window.location.hostname;
        if (host === 'atlas.phila.gov') {
          return this.$config.pictometry.apiKey;
        }
        if (host === 'atlas-dev.phila.gov') {
          return this.$config.pictometryDev.apiKey;
        }
        if (host === 'cityatlas.phila.gov') {
          return this.$config.pictometryCity.apiKey;
        }
        if (host === 'cityatlas-dev.phila.gov') {
          return this.$config.pictometryCityDev.apiKey;
        }
        if (host === '10.8.101.67') {
          return this.$config.pictometryLocal.apiKey;
        }
      },
      sk: function sk() {
        var host = window.location.hostname;
        if (host === 'atlas.phila.gov') {
          return this.$config.pictometry.secretKey;
        }
        if (host === 'atlas-dev.phila.gov') {
          return this.$config.pictometryDev.secretKey;
        }
        if (host === 'cityatlas.phila.gov') {
          return this.$config.pictometryCity.secretKey;
        }
        if (host === 'cityatlas-dev.phila.gov') {
          return this.$config.pictometryCityDev.secretKey;
        }
        if (host === '10.8.101.67') {
          return this.$config.pictometryLocal.secretKey;
        }
      }
    },
    watch: {
      pictometryShowAddressMarker: function pictometryShowAddressMarker(nextValue) {
        console.log('watch pictometryShowAddressMarker', nextValue);
      }
    },
    methods: {
      closeAddressCandidateList: function closeAddressCandidateList() {
        this.$store.state.map.shouldShowAddressCandidateList = false;
      },
      handleWindowResize: function handleWindowResize() {
        // this only actually affects the size if it is set to "plugin mode"
        if ($(window).width() >= 750) {
          this.mbRootStyle.height = '600px';
        } else {
          this.mbRootStyle.height = 'auto';
        }
      }
    },
  };

  // http://stackoverflow.com/a/37164538/676001

  // helper to verify that an item is an object
  function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
  }
  // merges n objects, deeply, immutably
  function mergeDeep(target, source) {
    var output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(function (key) {
        var obj, obj$1;

        if (isObject(source[key])) {
          if (!(key in target))
            { Object.assign(output, ( obj = {}, obj[key] = source[key], obj)); }
          else
            { output[key] = mergeDeep(target[key], source[key]); }
        } else {
          Object.assign(output, ( obj$1 = {}, obj$1[key] = source[key], obj$1));
        }
      });
    }
    return output;
  }

  function generateUniqueId() {
    return Math.random().toString(36).substring(7);
  }

  var controllerMixin = philaVueDatafetch;

  // helper function to auto-assign ids to horizontal tables
  function assignTableIds(comps) {
    for (var i = 0, list = comps; i < list.length; i += 1) {
      var comp = list[i];

      var options = comp.options || {};
      var innerComps = options.components || options.tables;

      // if this is a "group" component, recurse
      if (innerComps) {
        assignTableIds(innerComps);
        // return;
      }

      // skip comps that aren't horizontal tables
      if (comp.type !== 'horizontal-table') {
        continue;
      }

       var id = generateUniqueId();
       comp._id = id;
       // the id also needs to get passed to the horizontal table component, so
       // use the options object.
       comp.options.tableId = id;
    }
  }

  function assignHorizontalTableGroupIds(comps) {
    for (var i = 0, list = comps; i < list.length; i += 1) {
      var comp = list[i];

      var options = comp.options || {};
      var innerComps = options.tables;

      // if this is a "group" component, recurse
      if (!innerComps) {
        continue;
      }

      // skip comps that aren't horizontal table groups
      if (comp.type !== 'horizontal-table-group') {
        continue;
      }

       var id = generateUniqueId();
       comp._id = id;
       // the id also needs to get passed to the horizontal table component, so
       // use the options object.
       comp.options.horizontalTableGroupId = id;
    }
  }

  function initMapboard(clientConfig) {
    var baseConfigUrl = clientConfig.baseConfig;
    // console.log('baseConfigUrl:', baseConfigUrl);

    // get base config
    return axios.get(baseConfigUrl).then(function (response) {
      var data = response.data;
      // const data = baseConfigUrl;

      // parse raw js. yes, it's ok to use eval :)
      // http://stackoverflow.com/a/87260/676001
      var baseConfigFn = eval(data);
      var gatekeeperKey = clientConfig.gatekeeperKey;
      var baseConfig = baseConfigFn({ gatekeeperKey: gatekeeperKey });

      // deep merge base config and client config
      var config = mergeDeep(baseConfig, clientConfig);
      // const config = mergeDeep(baseConfigUrl, clientConfig);

      // assign table ids
      for (var i = 0, list = config.topics; i < list.length; i += 1) {
        var topic = list[i];

        assignTableIds(topic.components);
        assignHorizontalTableGroupIds(topic.components);
      }

      // make config accessible from each component via this.$config
      Vue.use(configMixin, config);

      // create store
      var store = createStore(config);

      // mix in controller
      Vue.use(controllerMixin, { config: config, store: store });
      // Vue.use(controllerMixin, { config, store, eventBus });

      // mount main vue
      var vm = new Vue({
        el: config.el || '#mapboard',
        render: function (h) { return h(Mapboard); },
        store: store
      });

    }).catch(function (err) {
      console.error('Error loading base config:', err);
    });
  }

  exports.default = initMapboard;
  exports.Mapboard = Mapboard;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=mapboard.js.map
