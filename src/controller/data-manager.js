/*
The DataManager is responsible for fetching external data (mainly API responses)
and storing them in state.

The router should own an instance of DataManager and make calls to it based on
navigation events.
*/
import L from 'leaflet';
import {
  GeocodeClient,
  HttpClient,
  EsriClient
} from './clients';

class DataManager {
  constructor(opts) {
    const store = this.store = opts.store;
    const config = this.config = opts.config;
    this.eventBus = opts.eventBus;
    this.controller = opts.controller;

    // create clients
    this.clients = {};

    // REVIEW do these need the store any more? or can they just pass the
    // response back to this?
    const clientOpts = { config, store, dataManager: this };
    this.clients.geocode = new GeocodeClient(clientOpts);
    this.clients.http = new HttpClient(clientOpts);
    this.clients.esri = new EsriClient(clientOpts);
  }

  /* STATE HELPERS */

  // REVIEW maybe the getXXXParcelsById methods should just take an argument
  // activeParcelLayer? that's the only reason these are in here.

  // activeTopicConfig() {
  //   const key = this.store.state.activeTopic;
  //   let config;
  //
  //   // if no active topic, return null
  //   if (key) {
  //     config = this.config.topics.filter((topic) => {
  //       return topic.key === key;
  //     })[0];
  //   }
  //
  //   return config || {};
  // }
  //
  // activeParcelLayer() {
  //   return this.activeTopicConfig().parcels || this.config.map.defaultBasemap;
  // }

  /* ROUTING */

  // makeHash(address, topic) {
  //   let hash = `/${address}`;
  //   if (topic) {
  //     hash += `/${topic}`;
  //   }
  //   return hash;
  // }

  // arguably this would be better off in Router, but that would create a
  // circular ref router => datamanager => router. trying this for now.
  // routeToAddress(input) {
  //   const activeTopic = this.store.state.activeTopic;
  //   const nextHash = this.makeHash(input, activeTopic);
  //
  //   console.log('route to address', nextHash);
  //
  //   window.location.hash = nextHash;
  // }
  //
  // routeToTopic(topic) {
  //   // TODO add an address getter fn to config so this isn't ais-specific
  //   const address = this.store.state.geocode.data.properties.street_address;
  //   const nextHash = this.makeHash(address, topic);
  //
  //   console.log('route to topic:', topic, `(${nextHash})`);
  //
  //   window.location.hash = nextHash;
  // }

  /* DATA FETCHING METHODS */

  fetchMoreData(dataSourceKey, highestPageRetrieved) {
    // console.log('datamanager get 100 More records was clicked, dataSource', dataSourceKey, 'highestPageRetrieved', highestPageRetrieved);
    const feature = this.store.state.geocode.data;
    const dataSource = this.config.dataSources[dataSourceKey];

    const state = this.store.state;
    const type = dataSource.type;

    // update secondary status to `waiting`
    const setSecondarySourceStatusOpts = {
      key: dataSourceKey,
      secondaryStatus: 'waiting'
    };
    this.store.commit('setSecondarySourceStatus', setSecondarySourceStatusOpts);

    switch(type) {
      case 'http-get':
        // console.log('http-get', dataSourceKey, targetIdFn);
        this.clients.http.fetchMore(feature,
                                dataSource,
                                dataSourceKey,
                                highestPageRetrieved);
        break;
    }

  }

  didFetchMoreData(key, secondaryStatus, data) {
    console.log('DID FETCH More DATA:', key, secondaryStatus, data);

    const dataOrNull = status === 'error' ? null : data;
    let stateData = dataOrNull;

    // if this is an array, assign feature ids
    if (Array.isArray(stateData)) {
      stateData = this.assignFeatureIds(stateData, key);
    }

    // console.log('stateData', stateData);

    // put data in state
    const setSourceDataOpts = {
      key,
      data: stateData,
    };
    const setSecondarySourceStatusOpts = {
      key,
      secondaryStatus
    };

    // commit
    this.store.commit('setSourceDataMore', setSourceDataOpts);
    this.store.commit('setSecondarySourceStatus', setSecondarySourceStatusOpts);
  }


  fetchData() {
    // console.log('\nFETCH DATA');
    // console.log('-----------');

    const geocodeObj = this.store.state.geocode.data;

    // we always need a good geocode before we can get data, so return
    // if we don't have one yet.
    if (!geocodeObj) {
      // console.log('fetch data but no geocode yet, returning');
      return;
    }

    const dataSources = this.config.dataSources || {};

    // get "ready" data sources (ones whose deps have been met)
    for (let [dataSourceKey, dataSource] of Object.entries(dataSources)) {
      const state = this.store.state;
      const type = dataSource.type;
      const targetsDef = dataSource.targets;

      // console.log('key:', dataSourceKey, type);

      // if the data sources specifies a features getter, use that to source
      // features for evaluating params/forming requests. otherwise,
      // default to the geocode result.
      let targets;
      let targetIdFn;
      let targetsFn;

      if (targetsDef) {
        targetsFn = targetsDef.get;
        targetIdFn = targetsDef.getTargetId;

        if (typeof targetsFn !== 'function') {
          throw new Error(`Invalid targets getter for data source '${dataSourceKey}'`);
        }
        targets = targetsFn(state);

        // check if target objs exist in state.
        const targetIds = targets.map(targetIdFn);
        const stateTargets = state.sources[dataSourceKey].targets;
        const stateTargetIds = Object.keys(stateTargets);
        // the inclusion check wasn't working because ids were strings in
        // one set and ints in another, so do this.
        const stateTargetIdsStr = stateTargetIds.map(String);
        const shouldCreateTargets = !targetIds.every(targetId => {
          const targetIdStr = String(targetId);
          return stateTargetIdsStr.includes(targetIdStr);
        });

        // if not, create them.
        if (shouldCreateTargets) {
          // console.log('should create targets', targetIds, stateTargetIds);
          this.store.commit('createEmptySourceTargets', {
            key: dataSourceKey,
            targetIds
          });
        }

        if (!Array.isArray(targets)) {
          throw new Error('Data source targets getter should return an array');
        }
      } else {
        targets = [geocodeObj];
      }

      for (let target of targets) {
        // get id of target
        let targetId;
        if (targetIdFn) {
          targetId = targetIdFn(target);
        }

        // targetId && console.log('target:', targetId);

        // check if it's ready
        const isReady = this.checkDataSourceReady(dataSourceKey, dataSource, targetId);
        if (!isReady) {
          // console.log('not ready');
          continue;
        }

        // update status to `waiting`
        const setSourceStatusOpts = {
          key: dataSourceKey,
          status: 'waiting'
        };
        if (targetId) {
          setSourceStatusOpts.targetId = targetId;
        }
        this.store.commit('setSourceStatus', setSourceStatusOpts);

        // TODO do this for all targets
        switch(type) {
          case 'http-get':
            // console.log('http-get', dataSourceKey, targetIdFn);
            this.clients.http.fetch(target,
                                    dataSource,
                                    dataSourceKey,
                                    targetIdFn);
            break;

          case 'http-get-nearby':
          // console.log('http-get-nearby', dataSourceKey, targetIdFn)
            this.clients.http.fetchNearby(target,
                                          dataSource,
                                          dataSourceKey,
                                          targetIdFn);
            break;

          case 'esri':
            // console.log('esri', dataSourceKey)
            // TODO add targets id fn
            this.clients.esri.fetch(target, dataSource, dataSourceKey);
            break;

            break;
          case 'esri-nearby':
            // console.log('esri-nearby', dataSourceKey)
            // TODO add targets id fn
            this.clients.esri.fetchNearby(target, dataSource, dataSourceKey);
            break;

          default:
            throw `Unknown data source type: ${type}`;
            break;
        }  // end of switch
      }  // end of for targets loop
      // console.log('end of targets loop for', dataSourceKey);
    } // end of for dataSource loop
    // console.log('end of outer loop');
  }

  didFetchData(key, status, data, targetId) {
    // console.log('DID FETCH DATA:', key, targetId || '', data);

    const dataOrNull = status === 'error' ? null : data;
    let stateData = dataOrNull;

    // if this is an array, assign feature ids
    if (Array.isArray(stateData)) {
      stateData = this.assignFeatureIds(stateData, key, targetId);
    }

    // does this data source have targets?
    // const targets = this.config.dataSources[key].targets;

    // put data in state
    const setSourceDataOpts = {
      key,
      data: stateData,
    };
    const setSourceStatusOpts = {
      key,
      status
    };
    if (targetId) {
      setSourceDataOpts.targetId = targetId;
      setSourceStatusOpts.targetId = targetId;
    }

    // commit
    this.store.commit('setSourceData', setSourceDataOpts);
    this.store.commit('setSourceStatus', setSourceStatusOpts);

    // try fetching more data
    this.fetchData();
  }

  resetData() {
      const dataSources = this.config.dataSources || {};

      for (let dataSourceKey of Object.keys(dataSources)) {
        const dataSource = dataSources[dataSourceKey];
        const targetsDef = dataSource.targets;

        // null out existing data in state
        if (targetsDef) {
          this.store.commit('clearSourceTargets', {
            key: dataSourceKey
          });
        } else {
          this.store.commit('setSourceData', {
            key: dataSourceKey,
            data: null
          })
          this.store.commit('setSourceStatus', {
            key: dataSourceKey,
            status: null
          })
        }
      }
    }

  checkDataSourcesFetched(paths = []) {
    // console.log('check data sources fetched', paths);

    const state = this.store.state;

    return paths.every(path => {
      // deps can be deep keys, e.g. `dor.parcels`. split on periods to get
      // a sequence of keys.
      const pathKeys = path.split('.');

      // TODO/TEMP restructure state so parcels and geocode live in
      // state.sources? the following targets the dorDocuments data source.
      const isDorParcels = (pathKeys.length === 1
                            && pathKeys[0] === 'dorParcels');

      if (isDorParcels) {
        return state.dorParcels.status === 'success';
      }

      // traverse state to get the parent of the data object we need to
      // check.
      const stateObj = pathKeys.reduce((acc, pathKey) => {
        return acc[pathKey];
      }, state);

      return stateObj.status === 'success';
    });
  }

  checkDataSourceReady(key, options, targetId) {
    // console.log(`check data source ready: ${key} ${targetId || ''}`, options);

    const deps = options.deps;
    // console.log('deps', deps);
    const depsMet = this.checkDataSourcesFetched(deps);
    // console.log('depsMet', depsMet);
    let isReady = false;

    // if data deps have been met
    if (depsMet) {
      // get the target obj
      let targetObj = this.store.state.sources[key];
      if (targetId) {
        targetObj = targetObj.targets[targetId];
      }

      // if the target obj has a status of null, this data source is ready.
      isReady = !targetObj.status;
    }

    // console.log('checkDataSourceReady isReady:', isReady);
    return isReady;
  }

  assignFeatureIds(features, dataSourceKey, topicId) {
    const featuresWithIds = [];

    // REVIEW this was not working with Array.map for some reason
    // it was returning an object when fetchJson was used
    // that is now converted to an array in fetchJson
    for (let i = 0; i < features.length; i++) {
      const suffix = (topicId ? topicId + '-' : '') + i;
      const id = `feat-${dataSourceKey}-${suffix}`;
      const feature = features[i];
      // console.log(dataSourceKey, feature);
      try {
        feature._featureId = id;
      }
      catch (e) {
        console.warn(e);
      }
      featuresWithIds.push(feature);
    }

    // console.log(dataSourceKey, features, featuresWithIds);
    return featuresWithIds;
  }

  evaluateParams(feature, dataSource) {
    const params = {};
    const paramEntries = Object.entries(dataSource.options.params);
    const state = this.store.state;

    for (let [key, valOrGetter] of paramEntries) {
      let val;

      if (typeof valOrGetter === 'function') {
        val = valOrGetter(feature, state);
      } else {
        val = valOrGetter;
      }

      params[key] = val;
    }

    return params;
  }

  /* GEOCODING */
  geocode(address) {
    const didGeocode = this.didGeocode.bind(this);
    // this.clients.geocode.fetch(address, didGeocode);
    return this.clients.geocode.fetch(address).then(didGeocode);
  }

  didGeocode(feature) {
    // console.log('DataManager.didGeocode:', feature);

    // emit event to event bus
    this.eventBus.$emit('geocodeResult', feature);

    // if it is a dor parcel query, and the geocode fails, coordinates can still be used
    // to get dor parcels which are not in ais
    // set coords to the ais coords OR the click if there is no ais result
    let coords;
    if (!feature) {
      console.log('did geocode but no geom', feature);

      if (this.store.state.activeParcelLayer === 'dor') {
        console.log('ran ais on a dor parcel and got no response');
        const pwdParcel = this.store.state.pwdParcel;
        if (pwdParcel) {
          console.log('running ais again on the pwd parcel', pwdParcel.properties.PARCELID);
          this.geocode(pwdParcel.properties.PARCELID);
        }
      }

      const clickCoords = this.store.state.clickCoords;
      coords = [clickCoords.lng, clickCoords.lat];
    } else {
      coords = feature.geometry.coordinates;
    }
    const [lng, lat] = coords;
    const latlng = L.latLng(lat, lng);

    const lastSearchMethod = this.store.state.lastSearchMethod;
    // there is a lastSearchMethod if the map was clicked or the searchbox was used
    if (lastSearchMethod) {
      console.log('datamanager didGeocode lastSearchMethod', lastSearchMethod)
      // if this is the result of a search from the search box, get pwd and dor parcels
      if (lastSearchMethod === 'geocode') {
        /* DOR PARCELS */
        const dorParcelId = feature.properties.dor_parcel_id;

        if (dorParcelId && dorParcelId.length > 0) {
          this.getDorParcelsById(dorParcelId);
        } else {
          // if we don't have a parcel id (aka mapreg), it's probably because
          // the parcel has a data quality issue and isn't in ais. so search by
          // latlng.
          this.getDorParcelsByLatLng(latlng);
        }

        /* PWD PARCELS */
        const pwdParcelId = feature.properties.pwd_parcel_id;
        this.getPwdParcelById(pwdParcelId);

      // if this is the result of a map-click, you may need to get dor parcels
      } else {
        // if this is the result of a map-click in a pwd-parcel topic
        // use the click latlng to get intersecting dor parcels.
        // this is needed because it will not automatically get the dor parcels
        // in case it does not find a pwd parcel
        // if (this.activeParcelLayer() === 'pwd') {
        if (this.store.state.activeParcelLayer === 'pwd') {
          // console.log('reverseGeocode happened and only got pwd parcel, getting dorParcels now with latlng')
          this.getDorParcelsByLatLng(latlng);
        } else {
          console.log('reverseGeocode happened and only got dor parcel, getting pwdParcels now with latlng')
          this.getPwdParcelByLatLng(latlng);
        }
      }
    } else {
      // OLD COMMENT (not sure if it is wrong) - if we're here, then ais did not have a dor parcel id, so we'll use the ais xy to get intersecting dor parcels

      // NEW COMMENT - if we're here, the app routed to an address automatically, so it needs dor parcels and pwd parcel
      this.getDorParcelsByLatLng(latlng);
      this.getPwdParcelByLatLng(latlng);
    }

    // pan and zoom map
    // console.log('coords', coords);
    this.store.commit('setMapCenter', coords);
    this.store.commit('setMapZoom', 19);

    // reset data
    this.resetData();

    // fetch new data
    console.log('didGeocode is calling fetchData()');
    this.fetchData();
  } // end didGeocode

  getPwdParcelByLatLng(latlng) {
    console.log('get pwd parcel by latlng');

    const url = this.config.map.featureLayers.pwdParcels.url;
    const parcelQuery = L.esri.query({ url });
    parcelQuery.contains(latlng);
    parcelQuery.run(this.didGetPwdParcel.bind(this));
  }

  getPwdParcelById(id) {
    console.log('getPwdParcelById');
    const url = this.config.map.featureLayers.pwdParcels.url;
    const parcelQuery = L.esri.query({ url });
    parcelQuery.where('PARCELID = ' + id);
    parcelQuery.run(this.didGetPwdParcel.bind(this));
  }

  didGetPwdParcel(error, featureCollection, response) {
    console.log('did get pwd parcel', featureCollection);

    if (error) {
      console.warn('did get pwd parcel error', error);
      return;
    }

    if (!featureCollection) {
      console.warn('did get pwd parcel, but no features');
      return;
    }

    const features = featureCollection.features;
    let feature;

    if (features.length === 0) {
      feature = null;
    } else {
      feature = features[0]
      console.log('putting pwd parcel in state');
      this.store.commit('setPwdParcel', feature);

      if (this.store.state.activeParcelLayer === 'pwd' && this.store.state.lastSearchMethod === 'reverseGeocode'){
        console.log('didGetPwdParcel is wiping out the dor parcel in the state');
        this.store.commit('setDorParcelData', []);
        this.store.commit('setDorParcelStatus', null);
      }

      // this shouldn't happen
      if (features.length > 1) {
        console.debug('got more than one pwd parcel', features);
      }
    }


    const shouldGeocode = (
      this.store.state.activeParcelLayer === 'pwd' &&
      feature &&
      this.store.state.lastSearchMethod === 'reverseGeocode'
    );

    if (shouldGeocode) {
      const id = feature.properties.PARCELID;
      // const activeTopic = this.store.state.activeTopic;
      // const nextHash = `/${id}/${activeTopic}`;
      // window.location.hash = nextHash;

      // this.geocode(id);
      this.controller.router.routeToAddress(id);
    } else {
      console.log('didGetPwdParcel is calling fetchData()');
      this.fetchData();
    }
  }

  getDorParcelsByLatLng(latlng) {
    console.log('get dor parcels by latlng', latlng);

    const url = this.config.map.featureLayers.dorParcels.url;
    const parcelQuery = L.esri.query({ url });
    parcelQuery.contains(latlng);
    parcelQuery.run(this.didGetDorParcels.bind(this));
  }

  getDorParcelsById(id) {
    console.log('get dor parcels by id');

    const url = this.config.map.featureLayers.dorParcels.url;
    const parcelQuery = L.esri.query({ url });
    parcelQuery.where("MAPREG = '" + id + "'")
    parcelQuery.run(this.didGetDorParcels.bind(this));
  }

  didGetDorParcels(error, featureCollection, response) {
    console.log('did get dor parcels', featureCollection);

    if (error) {
      console.warn('did get dor parcels error', error);

      // update state
      this.store.commit('setDorParcelData', []);
      this.store.commit('setDorParcelStatus', 'error');

      return;
    }
    if (!featureCollection || featureCollection.features.length === 0) {
      console.warn('did get dor parcels, but no features');
      return;
    } else {
      if (this.store.state.activeParcelLayer === 'dor') {
        console.log('didGetDorParcels is wiping out the pwdParcel in state');
        this.store.commit('setPwdParcel', null);
      }
    }

    const features = featureCollection.features;

    // sort
    const featuresSorted = this.sortDorParcelFeatures(features);

    // update state
    this.store.commit('setDorParcelData', featuresSorted);
    this.store.commit('setDorParcelStatus', 'success');
    this.store.commit('setActiveDorParcel', featuresSorted[0].id)

    const shouldGeocode = (
      this.store.state.activeParcelLayer === 'dor' &&
      //features.length < 1 &&
      // features.length < 1 &&
      this.store.state.lastSearchMethod === 'reverseGeocode'
    );

    if (shouldGeocode) {
      console.log('DATAMANAGER if shouldGeocode is running');
      // TODO sort by mapreg, status
      // this.geocode(features[0].properties.MAPREG);
      const feature = features.length > 0 ? features[0] : {};
      const props = feature.properties || {};
      const id = props.MAPREG;
      // if (id) this.controller.router.route(id);
      if (id) this.controller.router.routeToAddress(id);
    } else {
      console.log('didGetDorParcels is calling fetchData()');
      this.fetchData();
    }
  }

  sortDorParcelFeatures(features) {
    // map parcel status to a numeric priority
    // (basically so remainders come before inactives)
    const STATUS_PRIORITY = {
      1: 1,
      2: 3,
      3: 2
    }

    // first sort by mapreg (descending)
    features.sort((a, b) => {
      const mapregA = a.properties.MAPREG;
      const mapregB = b.properties.MAPREG;

      if (mapregA < mapregB) return 1;
      if (mapregA > mapregB) return -1;
      return 0;
    });

    // then sort by status
    features.sort((a, b) => {
      const statusA = STATUS_PRIORITY[a.properties.STATUS];
      const statusB = STATUS_PRIORITY[b.properties.STATUS];

      if (statusA < statusB) return -1;
      if (statusA > statusB) return 1;
      return 0;
    });

    return features;
  }
}

export default DataManager;
