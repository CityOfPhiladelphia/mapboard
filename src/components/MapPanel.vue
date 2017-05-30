<template>
  <div class="large-12 columns mb-panel mb-panel-map">
    <map_ :class="{ 'mb-map-with-widget': this.$store.state.cyclomedia.active || this.$store.state.pictometry.active }"
          :center="this.$config.map.center"
          :zoom="this.$config.map.zoom"
          @l-click="handleMapClick"
          @l-moveend="handleMapMove"
          zoom-control-position="bottomright"
          :min-zoom="this.$config.map.minZoom"
          :max-zoom="this.$config.map.maxZoom"
    >
      <!-- loading mask -->
      <div v-show="isGeocoding" class="mb-map-loading-mask">
        <div class="mb-map-loading-mask-inner">
          <i class="fa fa-spinner fa-4x spin"></i>
          <h1>Finding address...</h1>
        </div>
      </div>

      <!-- basemaps -->
      <esri-tiled-map-layer v-for="(basemap, key) in this.$config.map.basemaps"
                         v-if="activeBasemap === key"
                         :key="key"
                         :url="basemap.url"
                         :max-zoom="basemap.maxZoom"
      />

      <!-- basemap labels and parcels outlines -->
      <esri-tiled-map-layer v-for="(tiledLayer, key) in this.$config.map.tiledLayers"
                         v-if="activeTiles.includes(key)"
                         :key="key"
                         :url="tiledLayer.url"
                         :zIndex="tiledLayer.zIndex"
      />

      <esri-dynamic-map-layer v-for="(dynamicLayer, key) in this.$config.map.dynamicMapLayers"
                          v-if="activeDynamicMaps.includes(key)"
                         :key="key"
                         :url="dynamicLayer.url"
      />



      <!-- address marker -->
      <!-- REVIEW why does this need a key? it's not a list... -->
      <!-- <vector-marker v-if="identifyFeature === 'address-marker' && geocodeGeom"
                    :latlng="[...geocodeGeom.coordinates].reverse()"
                    :key="streetAddress"
      /> -->

      <!-- NEW METHOD: try rendering markers generically based on marker type -->
      <!-- vector markers -->
      <vector-marker v-for="(marker, index) in markers"
                    :latlng="marker.latlng"
                    :key="marker.key"
      />

      <!-- marker using a png and ablility to rotate it -->
      <png-marker v-if="this.cyclomediaActive"
                    :icon="'../../src/assets/camera.png'"
                    :orientation="this.$store.state.cyclomedia.viewer.props.orientation"
      />

      <!-- marker using custom code extending icons - https://github.com/iatkin/leaflet-svgicon -->
      <svg-marker v-if="this.cyclomediaActive"
                    :orientation="this.$store.state.cyclomedia.viewer.props.orientation"
      />

      <!-- geojson features -->
      <geojson v-for="geojsonFeature in geojsonFeatures"
               :geojson="geojsonFeature.geojson"
               :color="geojsonFeature.color"
               :weight="2"
               :key="geojsonFeature.key"
       />
       <!-- :overlay="geojsonFeature.overlayFeature" -->

       <!-- TODO give these a real key -->
      <circle-marker v-for="circleMarker in circleMarkers"
                     @l-click="handleCircleMarkerClick"
                     @l-mouseover="handleCircleMarkerMouseover"
                     @l-mouseout="handleCircleMarkerMouseout"
                     :latlng="circleMarker.latlng"
                     :radius="circleMarker.radius"
                     :fillColor="circleMarker.fillColor"
                   	 :color="circleMarker.color"
                   	 :weight="circleMarker.weight"
                   	 :opacity="circleMarker.opacity"
                   	 :fillOpacity="circleMarker.fillOpacity"
                     :key="Math.random()"
                     :data="{featureId: circleMarker.featureId}"
      />

       <!-- <vector-marker v-for="marker in threeOneOneMarkers"
                      v-if="activeTopicConfig.key === 'threeOneOne'"
                      :latlng="[marker.geometry.coordinates[1], marker.geometry.coordinates[0]]"
                      :key="marker.id"
                      :markerColor="'#b2ffb2'"
       /> -->

      <!-- CONTROLS: -->
      <!-- basemap control -->
      <div v-once>
        <basemap-control v-if="hasImageryBasemaps"
                         v-once
                         :position="'topright'"
                         :imagery-years="imageryYears"
        />
      </div>

      <div v-once>
        <historicmap-control v-if="hasHistoricBasemaps"
                         v-once
                         :position="'topright'"
                         :historic-years="historicYears"
        />
      </div>

      <div v-once>
        <pictometry-button v-if="this.$config.pictometry.enabled"
                           v-once
                           :position="'topright'"
                           :link="'pictometry'"
                           :imgSrc="'../../src/assets/pictometry.png'"
        />
      </div>

      <div v-once>
        <cyclomedia-button v-if="this.$config.cyclomedia.enabled"
                           v-once
                           :position="'topright'"
                           :link="'cyclomedia'"
                           :imgSrc="'../../src/assets/cyclomedia.png'"
                           @click="handleCyclomediaButtonClick"
        />
      </div>

      <!-- search control -->
      <!-- custom components seem to have to be wrapped like this to work
           with v-once
      -->
      <div v-once>
        <control position="topleft">
          <div class="mb-search-control-container">
            <form @submit.prevent="handleSearchFormSubmit">
                <input class="mb-search-control-input"
                       placeholder="Search the map"
                       :value="this.$config.defaultAddress"
                />
                <button class="mb-search-control-button">
                  <i class="fa fa-search fa-lg"></i>
                </button>
            </form>
          </div>
        </control>
      </div>

      <cyclomedia-recording-circle v-for="recording in cyclomediaRecordings"
                                   v-if="cyclomediaActive"
                                   :key="recording.imageId"
                                   :imageId="recording.imageId"
                                   :latlng="[recording.lat, recording.lng]"
                                   :size="1.2"
                                   :color="'#3388ff'"
                                   :weight="1"
                                   @l-click="handleCyclomediaRecordingClick"
      />
    </map_>
    <slot class='widget-slot' name="cycloWidget" />
    <slot class='widget-slot' name="pictWidget" />
  </div>
</template>

<script>
  // vue doesn't like it when you import this as Map (reserved-ish word)
  import Map_ from '../leaflet/Map';
  import Control from '../leaflet/Control';
  import EsriTiledMapLayer from '../esri-leaflet/TiledMapLayer';
  import EsriDynamicMapLayer from '../esri-leaflet/DynamicMapLayer';
  import Geojson from '../leaflet/Geojson';
  import CircleMarker from '../leaflet/CircleMarker';
  import VectorMarker from './VectorMarker';
  import PngMarker from './PngMarker';
  import SvgMarker from './SvgMarker';
  import BasemapControl from './BasemapControl';
  import HistoricmapControl from './HistoricmapControl';
  import CyclomediaButton from '../cyclomedia/Button';
  import PictometryButton from '../pictometry/Button';
  import CyclomediaRecordingCircle from '../cyclomedia/RecordingCircle';
  import CyclomediaRecordingsClient from '../cyclomedia/recordings-client';

  export default {
    components: {
      Map_,
      Control,
      EsriTiledMapLayer,
      EsriDynamicMapLayer,
      Geojson,
      CircleMarker,
      VectorMarker,
      PngMarker,
      SvgMarker,
      BasemapControl,
      HistoricmapControl,
      PictometryButton,
      CyclomediaButton,
      CyclomediaRecordingCircle
    },
    computed: {
      activeBasemap() {
        return this.$store.state.map.basemap;
      },
      activeTiles() {
        return this.$config.map.basemaps[this.activeBasemap].tiledLayers;
      },
      activeDynamicMaps() {
        if (!this.activeTopicConfig || !this.activeTopicConfig.dynamicMapLayers) {
          return [];
        } else {
          return this.activeTopicConfig.dynamicMapLayers;
        }
      },
      basemaps() {
        return Object.values(this.$config.map.basemaps);
      },
      imageryBasemaps() {
        return this.basemaps.filter(basemap => basemap.type === 'imagery');
      },
      hasImageryBasemaps() {
        return this.imageryBasemaps.length > 0;
      },
      imageryYears() {
        // pluck year from basemap objects
        return this.imageryBasemaps.map(x => x.year);
      },
      historicBasemaps() {
        return this.basemaps.filter(basemap => basemap.type === 'historic');
      },
      hasHistoricBasemaps() {
        return this.historicBasemaps.length > 0;
      },
      historicYears() {
        // pluck year from basemap objects
        return this.historicBasemaps.map(x => x.year);
      },
      identifyFeature() {
        return (this.activeTopicConfig || {}).identifyFeature;
      },
      activeTopicConfig() {
        const key = this.$store.state.activeTopic;

        // if no active topic, return null
        if (!key) {
          return null;
        }

        return this.$config.topics.filter((topic) => {
          return topic.key === key;
        })[0];
      },
      activeParcelLayer() {
        return this.activeTopicConfig.parcels;
      },
      dorParcels() {
        return this.$store.state.dorParcels;
      },
      pwdParcel() {
        return this.$store.state.pwdParcel;
      },
      geocodeResult() {
        return this.$store.state.geocode.data;
      },
      geocodeGeom() {
        return (this.geocodeResult || {}).geometry;;
      },
      streetAddress() {
        return this.geocodeResult.properties.street_address;
      },
      isGeocoding() {
        return this.$store.state.geocode.status === 'waiting';
      },
      cyclomediaActive() {
        return this.$store.state.cyclomedia.active;
      },
      cyclomediaRecordings() {
        return this.$store.state.cyclomedia.recordings;
      },
      // returns map markers as simple object with a geometry property, key,
      // and optional properties for symbology
      markers() {
        const markers = [];

        // geocoded address marker
        const geocodeGeom = this.geocodeGeom;
        if (this.identifyFeature === 'address-marker' && geocodeGeom) {
          const latlng = [...geocodeGeom.coordinates].reverse();
          const key = this.geocodeResult.properties.street_address;
          const addressMarker = {latlng, key};
          markers.push(addressMarker);
        }

        return markers;
      },
      // returns all geojson features to be rendered on the map along with
      // necessary props.
      circleMarkers() {
        const circleMarkers = [];
        const overlayKeys = this.activeTopicConfig.overlays || [];
        const circleOverlayKeys = overlayKeys.filter(overlayKey => {
          const overlay = this.$config.overlays[overlayKey];
          const options = overlay.options;
          return options && options.marker === 'circle';
        });

        // if active topic has no circle overlays, return
        if (circleOverlayKeys.length === 0) {
          return circleMarkers;
        }

        const sources = this.$store.state.sources;

        // loop over circle overlays
        for (let circleOverlayKey of circleOverlayKeys) {
          const circleOverlay = this.$config.overlays[circleOverlayKey];
          const dataSource = circleOverlay.dataSource
          const options = circleOverlay.options;
          const data = sources[dataSource].data;

          const activeFeature = this.$store.state.activeFeature;

          for (let row of data) {
            const [x, y] = row.geometry.coordinates;
            const latlng = [y, x];

            // check for active feature TODO - bind style props to state
            const style = options.style;
            const props = Object.assign({}, style);
            if (row._featureId === activeFeature) {
              props.fillColor = 'yellow';
            }
            props.latlng = latlng;
            props.featureId = row._featureId;
            circleMarkers.push(props);
          }
        }

        return circleMarkers;
      },
      geojsonFeatures() {
        const features = [];

        const identifyFeature = this.identifyFeature;
        const activeParcelLayer = this.activeParcelLayer;
        // pwd parcel
        if (identifyFeature === 'pwd-parcel' && activeParcelLayer === 'pwd' && this.pwdParcel) {
          const geojson = this.pwdParcel;
          const color = 'blue';
          // const overlayFeature = {
          //   type: null,
          //   style: {
          //     color: 'blue'
          //   }
          // };
          const key = geojson.properties.PARCELID;
          features.push({geojson, color, key});
        // dor parcel
        } else if (identifyFeature === 'dor-parcel' && activeParcelLayer === 'dor') {
          // const overlayFeature = {
          //   type: null,
          //   style: {
          //     color: 'green'
          //   }
          // };
          const color = 'green';
          //const type = null;
          const dorParcelFeatures = this.dorParcels.map(dorParcel => {
            const geojson = dorParcel;
            const key = geojson.properties.OBJECTID;
            return {geojson, color, key};
          });
          features.push.apply(features, dorParcelFeatures);
        }

        // GeoJSON overlays
        // const stateSources = this.$store.state.sources;
        // const dataSourcesConfig = this.$config.dataSources;
        //
        // // step through the (possibly multiple) datasources for the active topic
        // for (let dataSource of this.activeTopicConfig.dataSources) {
        //   // filter datasources with format geojson
        //   if (dataSourcesConfig[dataSource].format === 'geojson') {
        //     // step through to add each geojson object to "features"
        //     for (let geojson of stateSources[dataSource].data) {
        //       let overlayFeature = this.activeTopicConfig.overlayFeature;
        //       let key = geojson.id;
        //       features.push({geojson, overlayFeature, key});
        //     }
        //   }
        // }
        // TODO filter by selected 311, police
        return features;
      },
      leafletMarkers() {
        const markers = [];

        markers.push.apply(markers, this.markers);
        markers.push.apply(markers, this.geojsonFeatures);

        return markers;
      },
      mapBounds() {
        // TODO calculate map bounds based on leaflet markers above
      },
    },
    created() {
      // if there's a default address, navigate to it
      const defaultAddress = this.$config.defaultAddress;
      if (defaultAddress) {
        this.geocode(defaultAddress);
      }

      // create cyclomedia recordings client
      this.$cyclomediaRecordingsClient = new CyclomediaRecordingsClient(
        this.$config.cyclomedia.recordingsUrl,
        this.$config.cyclomedia.username,
        this.$config.cyclomedia.password,
        4326
      );
    },
    methods: {
      handleMapClick(e) {
        // TODO figure out why form submits via enter key are generating a map
        // click event and remove this
        if (e.originalEvent.keyCode === 13) {
          return;
        }
        this.$store.commit('setLastSearchMethod', 'reverseGeocode')

        // METHOD 1: intersect map click latlng with parcel layers
        this.getDorParcelsByLatLng(e.latlng);
        this.getPwdParcelByLatLng(e.latlng);

        // METHOD 2: reverse geocode via AIS
        // this.getReverseGeocode(e.latlng);
      },
      handleCyclomediaButtonClick() {
        this.updateCyclomediaRecordings();

      },
      handleCyclomediaRecordingClick(e) {
        const latlng = e.latlng;
        const viewer = this.$store.state.cyclomedia.viewer;
        viewer.openByCoordinate([latlng.lng, latlng.lat]);
      },
      handleMapMove(e) {
        this.updateCyclomediaRecordings();
      },
      updateCyclomediaRecordings() {
        const map = this.$store.state.map.map;
        const zoom = map.getZoom();
        if (!this.$store.state.cyclomedia.active || zoom <= 18) {
          this.$store.commit('setCyclomediaRecordings', [])
          return;
        }
        const bounds = map.getBounds();
        this.$cyclomediaRecordingsClient.getRecordings(
          bounds,
          recordings => {
            this.$store.commit('setCyclomediaRecordings', recordings);
          }
        );
      },
      handleCircleMarkerClick(e) {
        console.log('clicked circle marker');
      },
      handleCircleMarkerMouseover(e) {
        const featureId = e.target.options.data.featureId;
        this.$store.commit('setActiveFeature', featureId);
      },
      handleCircleMarkerMouseout(e) {
        this.$store.commit('setActiveFeature', null);
      },
      handleSearchFormSubmit(e) {
        const input = e.target[0].value;
        this.$store.commit('setLastSearchMethod', 'geocode');
        this.$store.commit('setPwdParcel', null);
        this.$store.commit('setDorParcels', []);

        this.geocode(input);
      },
      getReverseGeocode(latlng) {
        const lnglat = [latlng.lng, latlng.lat];
        const url = this.$config.geocoder.methods.reverseGeocode.url(lnglat);
        this.$http.get(url.replace('ais', 'ais_test')).then(response => {
          const data = response.body;
          this.$store.commit('setGeocodeData', data.features[0])
        }, response => {
          console.log('reverse geocode error')
        });
      },
      getPwdParcelByLatLng(latlng) {
        const url = this.$config.map.featureLayers.pwdParcels.url;
        const parcelQuery = L.esri.query({ url });
        parcelQuery.contains(latlng);
        parcelQuery.run(this.didGetPwdParcel);
      },
      getPwdParcelById(id) {
        const url = this.$config.map.featureLayers.pwdParcels.url;
        const parcelQuery = L.esri.query({ url });
        parcelQuery.where('PARCELID = ' + id);
        parcelQuery.run(this.didGetPwdParcel);
      },
      didGetPwdParcel(error, featureCollection, response) {
        // console.log('did get pwd parcel', featureCollection);

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
          // this shouldn't happen
          if (features.length > 1) {
            console.debug('got more than one pwd parcel', features);
          }
        }
        this.$store.commit('setPwdParcel', feature);

        const shouldGeocode = (
          this.activeParcelLayer === 'pwd' &&
          feature &&
          this.$store.state.lastSearchMethod === 'reverseGeocode'
        );
        if (shouldGeocode) {
          this.geocode(feature.properties.PARCELID);
        } else {
          this.fetchData();
        }
      },
      getDorParcelsByLatLng(latlng) {
        const url = this.$config.map.featureLayers.dorParcels.url;
        const parcelQuery = L.esri.query({ url });
        parcelQuery.contains(latlng);
        parcelQuery.run(this.didGetDorParcels);
      },
      getDorParcelsById(id) {
        const url = this.$config.map.featureLayers.dorParcels.url;
        const parcelQuery = L.esri.query({ url });
        parcelQuery.where("MAPREG = '" + id + "'")
        parcelQuery.run(this.didGetDorParcels);
      },
      didGetDorParcels(error, featureCollection, response) {
        // console.log('did get dor parcels', featureCollection);

        if (error) {
          console.warn('did get dor parcels error', error);
          return;
        }
        if (!featureCollection) {
          console.warn('did get dor parcels, but no features');
          return;
        }
        const features = featureCollection.features;
        this.$store.commit('setDorParcels', featureCollection.features);

        const shouldGeocode = (
          this.activeParcelLayer === 'dor' &&
          features.length < 1 &&
          this.$store.state.lastSearchMethod === 'reverseGeocode'
        );
        if (shouldGeocode) {
          // TODO sort by mapreg, status
          this.geocode(features[0].properties.MAPREG);
        } else {
          this.fetchData();
        }
      },
      geocode(input) {
        // console.log('geocode', input);

        const self = this;
        const searchConfig = this.$config.geocoder.methods.search;
        const url = searchConfig.url(input);
        const params = searchConfig.params;

        // set status of geocode
        this.$store.commit('setGeocodeStatus', 'waiting');

        this.$http.get(url, { params }).then(this.didGeocode, response => {
          console.log('geocode error')
          self.$store.commit('setGeocodeData', null);
          self.$store.commit('setGeocodeStatus', 'error');
        });
      },
      didGeocode(response) {
        const data = response.body;
        // TODO handle multiple results

        if (!data.features || data.features.length < 1) {
          console.log('geocode got no features', data);
          return;
        }

        // TODO do some checking here
        const feature = data.features[0];
        this.$store.commit('setGeocodeData', feature);
        this.$store.commit('setGeocodeStatus', 'success');

        // send geocode result event to host
        this.$eventBus.$emit('geocodeResult', feature);

        // check for parcels
        // const dorParcels = this.$store.state.dorParcels;
        // const pwdParcel = this.$store.state.pwdParcel;
        // if (!(dorParcels.length > 0 || pwdParcel)) {

        // if this is the result of a search (from the search box), get
        // parcels
        const lastSearchMethod = this.$store.state.lastSearchMethod;
        if (lastSearchMethod === 'geocode') {
          const dorParcelId = feature.properties.dor_parcel_id;
          const pwdParcelId = feature.properties.pwd_parcel_id;
          this.getDorParcelsById(dorParcelId);
          this.getPwdParcelById(pwdParcelId);
        }

        // fetch data from ready sources
        console.log('did geocode, going to fetch data', this.$store.state.geocode.data);
        this.fetchData();

        // pan and center map
        // TODO ideally the map should fit its bounds to the combined extent
        // of markers/other content, reactively
        const map = this.$store.state.map.map;
        const [x, y] = feature.geometry.coordinates;
        map.setView([y, x]);
      },
      statePathsExist(paths = [], suffix) {
        const state = this.$store.state;

        return paths.every(path => {
          // deps can be deep keys, e.g. `dor.parcels`. split on periods to get
          // a sequence of keys.
          const pathKeys = path.split('.');
          // traverse state to get the parent of the data object we need to
          // check.
          const stateObj = pathKeys.reduce((acc, pathKey) => {
            return acc[pathKey];
          }, state);

          return !!stateObj[suffix];
        });
      },
      dataSourceIsReady(key, options) {
        const deps = options.deps;
        const depsMet = this.statePathsExist(deps, 'data');
        const alreadyResolved = this.$store.state.sources[key].status;
        return (depsMet && !alreadyResolved);
      },
      fetchData() {
        // console.log('fetch data');

        const geocodeObj = this.$store.state.geocode.data;

        // we always need a good geocode before we can get data, so return
        // if we don't have one yet.
        if (!geocodeObj) {
          // console.log('fetch data but no geocode yet, returning');
          return;
        }

        const dataSources = this.$config.dataSources || {};

        // get "ready" data sources (ones whose deps have been met)
        for (let [dataSourceKey, dataSource] of Object.entries(dataSources)) {
          const state = this.$store.state;
          const type = dataSource.type;
          const featuresFn = dataSource.features;

          // if the data sources specifies a features getter, use that to source
          // features for evaluating params/forming requests. otherwise,
          // default to the geocode result.
          let features;

          if (featuresFn) {
            if (typeof featuresFn !== 'function') {
              throw new Error(`Invalid features for data source '${dataSourceKey}'`);
            }
            features = featuresFn(state);
          } else {
            // TODO
          }

          // TODO null out existing data in state

          // check if it's ready
          const isReady = this.dataSourceIsReady(dataSourceKey, dataSource);
          if (!isReady) {
            continue;
          }

          this.$store.commit('setSourceStatus', {
            key: dataSourceKey,
            status: 'waiting'
          });

          switch(type) {
            case 'http-get':
              this.fetchHttpGet(geocodeObj, dataSource, dataSourceKey);
              break;
            case 'esri':
              this.fetchEsri(geocodeObj, dataSource, dataSourceKey);
              break;
            case 'esri-nearby':
              this.fetchEsriNearby(geocodeObj, dataSource, dataSourceKey);
              break;
            default:
              break;
          }
        }
      },

      assignFeatureIds(features, dataSourceKey) {
        const featuresWithIds = [];

        // REVIEW this was not working with Array.map for some reason
        for (let i = 0; i < features.length; i++) {
          const id = `feat-${dataSourceKey}-${i}`;
          const feature = features[i];
          feature._featureId = id;
          featuresWithIds.push(feature);
        }

        return featuresWithIds;
      },

      didFetchData(key, status, data) {
        // console.log('did fetch data:', key);

        const dataOrNull = status === 'error' ? null : data;
        let stateData = dataOrNull;

        // if this is an array, assign feature ids
        if (Array.isArray(stateData)) {
          stateData = this.assignFeatureIds(stateData, key);
        }

        // put data in state
        this.$store.commit('setSourceData', {
          key,
          data: stateData,
        });

        // update status
        this.$store.commit('setSourceStatus', {
          key,
          status,
        });

        this.fetchData();
      },

      evaluateParams(feature, dataSource) {
        const params = {};
        const paramEntries = Object.entries(dataSource.options.params);
        const state = this.$store.state;

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
      },

      fetchHttpGet(feature, dataSource, dataSourceKey) {
        const params = this.evaluateParams(feature, dataSource);
        const url = dataSource.url;
        const options = dataSource.options;
        const successFn = options.success;

        // if the data is not dependent on other data
        this.$http.get(url, { params }).then(response => {
          let data = response.body;
          if (successFn) {
            data = successFn(data);
          }
          this.didFetchData(dataSourceKey, 'success', data);
        }, response => {
          console.log('fetch json error', response);
          this.didFetchData(dataSourceKey, 'error');
        });
      }, // end of fetchJson

      fetchEsriSpatialQuery(dataSourceKey, url, relationship, targetGeom) {
        // console.log('fetch esri spatial query');

        const query = L.esri.query({url})[relationship](targetGeom);

        query.run((error, featureCollection, response) => {
          // console.log('did get esri spatial query', response, error);

          const data = featureCollection.features;
          const status = error ? 'error' : 'success';
          this.didFetchData(dataSourceKey, status, data);
        });
      },

      fetchEsri(feature, dataSource, dataSourceKey) {
        const options = dataSource.options;
        const url = dataSource.url;
        const relationship = options.relationship;
        const geom = feature.geometry;

        this.fetchEsriSpatialQuery(dataSourceKey, url, relationship, geom);
      },

      fetchEsriNearby(feature, dataSource, dataSourceKey) {
        // console.log('fetch esri nearby', feature);

        //const params = this.evaluateParams(feature, dataSource);
        // const url = dataSource.url;
        const {options} = dataSource;
        const dataSourceUrl = dataSource.url;
        const {geometryServerUrl} = options;

        // params.geometries = `[${feature.geometry.coordinates.join(', ')}]`
        // TODO get some of these values from map, etc.
        const params = {
          // geometries: feature => '[' + feature.geometry.coordinates[0] + ', ' + feature.geometry.coordinates[1] + ']',
          geometries: `[${feature.geometry.coordinates.join(', ')}]`,
          inSR: () => 4326,
          outSR: () => 4326,
          bufferSR: () => 4326,
          distances: () => .0015,
          unionResults: () => true,
          geodesic: () => false,
          f: () => 'json',
        };
        // console.debug('esri nearby params', params);

        // get buffer polygon
        const bufferUrl = geometryServerUrl.replace(/\/$/, '') + '/buffer';
        // console.log('im getting the points', bufferUrl);

        this.$http.get(bufferUrl, {params}).then(response => {
          // console.log('did get esri nearby buffer', response);
          const data = response.body;

          const xyCoords = data['geometries'][0]['rings'][0];
          const latLngCoords = xyCoords.map(xyCoord => [...xyCoord].reverse());

          // get nearby features using buffer
          const buffer = L.polygon(latLngCoords);
          this.fetchEsriSpatialQuery(dataSourceKey,
                                     dataSourceUrl,
                                     'within',
                                     buffer
          );
        }, response => {
          // console.log('did fetch esri nearby error', response);
          this.didFetchData(dataSource, 'error');
        });
      }, // end of fetchEsriNearby
    }, // end of methods
  }; //end of export

</script>

<style scoped>
  .mb-panel-map {
    /*this allows the loading mask to fill the div*/
    position: relative;
  }

  @media (max-width: 1024px) {
    .mb-panel-map {
      height: 600px;
    }
  }

  .mb-search-control-container {
    height: 48px;
    border-radius: 2px;
    box-shadow:0 2px 4px rgba(0,0,0,0.2),0 -1px 0px rgba(0,0,0,0.02);
  }

  .mb-search-control-button {
    width: 50px;
    background: #ccc;
    line-height: 48px;
  }

  .mb-search-control-input {
    border: 0;
    height: 48px !important;
    line-height: 48px;
    padding: 10px;
    padding-left: 15px;
    padding-right: 15px;
    font-family: 'Montserrat', 'Tahoma', sans-serif;
    font-size: 16px;
    width: 400px;
  }

  .mb-map-with-widget {
    height: 50%;
  }

  .widget-slot {
    display: inline-block;
    float: left;
  }

  .mb-map-loading-mask {
    /*display: inline;*/
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    background: rgba(0, 0 ,0 , 0.25);
    z-index: 1000;
    text-align: center;
    vertical-align: middle;
  }

  .mb-map-loading-mask-inner {
    position: absolute;
    top: 40%;
    left: 40%;
  }
</style>
