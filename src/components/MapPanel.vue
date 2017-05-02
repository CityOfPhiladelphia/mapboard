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
      <div v-show="geocoding" class="mb-map-loading-mask">
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

      <!-- dor parcels -->
      <geojson v-for="dorParcel in dorParcels"
               v-if="identifyFeature === 'dor-parcel' && activeParcelLayer === 'dor'"
               :geojson="dorParcel"
               :color="'green'"
               :weight="2"
               :key="dorParcel.properties.OBJECTID"
       />

       <!-- pwd parcel -->
       <geojson v-if="identifyFeature === 'pwd-parcel' && activeParcelLayer === 'pwd' && pwdParcel"
                :geojson="pwdParcel"
                :color="'blue'"
                :weight="2"
                :key="pwdParcel.properties.PARCELID"
        />

        <!-- address marker -->
        <!-- REVIEW why does this need a key? it's not a list... -->
        <vector-marker v-if="identifyFeature === 'address-marker' && aisGeom"
                      :latlng="[...aisGeom.coordinates].reverse()"
                      :key="streetAddress"
        />

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
  import Geojson from '../leaflet/Geojson';
  import VectorMarker from './VectorMarker';
  import BasemapControl from './BasemapControl';
  import CyclomediaButton from '../cyclomedia/Button';
  import PictometryButton from '../pictometry/Button';
  import CyclomediaRecordingCircle from '../cyclomedia/RecordingCircle';
  import CyclomediaRecordingsClient from '../cyclomedia/recordings-client';

  export default {
    components: {
      Map_,
      Control,
      EsriTiledMapLayer,
      Geojson,
      VectorMarker,
      BasemapControl,
      PictometryButton,
      CyclomediaButton,
      CyclomediaRecordingCircle
    },
    computed: {
      activeBasemap() {
        return this.$store.state.basemap;
        // if (this.$store.state.imageryOn) {
        //   return this.$store.state.imageryYear;
        // } else {
        //   return this.activeTopicConfig.basemap;
        // }
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
      identifyFeature() {
        return this.activeTopicConfig.identifyFeature;
      },
      activeTopicConfig() {
        const key = this.$store.state.activeTopic;
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
      aisGeom() {
        return (this.$store.state.geocode.data || {}).geometry;;
      },
      streetAddress() {
        return this.$store.state.geocode.data.properties.street_address;
      },
      geocoding() {
        return this.$store.state.geocode.status === 'waiting';
      },
      cyclomediaActive() {
        return this.$store.state.cyclomedia.active;
      },
      cyclomediaRecordings() {
        return this.$store.state.cyclomedia.recordings;
      }
    },
    created() {
      // if there's a default address, navigate to it
      const defaultAddress = this.$config.defaultAddress;
      if (defaultAddress) {
        this.fetchAis(defaultAddress);
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

        // TODO call method on cyclo widget
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
      handleSearchFormSubmit(e) {
        const input = e.target[0].value;
        this.$store.commit('setPwdParcel', null);
        this.$store.commit('setDorParcels', []);
        this.fetchAis(input);
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
        console.log('getPwdParcelsByLatLng');
        const url = this.$config.map.featureLayers.pwdParcels.url;
        const parcelQuery = L.esri.query({ url });
        parcelQuery.contains(latlng);
        parcelQuery.run(this.didGetPwdParcel);
      },
      getPwdParcelById(id) {
        console.log('getPwdParcelsById');
        const url = this.$config.map.featureLayers.pwdParcels.url;
        const parcelQuery = L.esri.query({ url });
        parcelQuery.where('PARCELID = ' + id);
        parcelQuery.run(this.didGetPwdParcel);
      },
      didGetPwdParcel(error, featureCollection, response) {
        const features = featureCollection.features;
        console.log('pwd features', features);
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

        if (feature && this.activeParcelLayer === 'pwd') {
          this.fetchAis(feature.properties.PARCELID);
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
        const features = featureCollection.features;
        this.$store.commit('setDorParcels', featureCollection.features);

        if (this.activeParcelLayer === 'dor') {
          if (features.length < 1) return;
          // TODO sort by mapreg, status
          this.fetchAis(features[0].properties.MAPREG);
        }
      },
      fetchAis(input) {
        const self = this;
        const searchConfig = this.$config.geocoder.methods.search;
        const url = searchConfig.url(input);
        const params = searchConfig.params;

        // set status of geocode
        this.$store.commit('setGeocodeStatus', 'waiting');

        this.$http.get(url, { params }).then(response => {
          const data = response.body;

          // TODO handle multiple ais results
          if (!data.features || data.features.length < 1) {
            console.log('ais got no features', data);
            return;
          }

          // TODO do some checking here
          const feature = data.features[0];
          self.$store.commit('setGeocodeData', feature);
          self.$store.commit('setGeocodeStatus', 'success');

          // send geocode result event to host
          self.$eventBus.$emit('geocodeResult', feature);

          // check for parcels
          const dorParcels = this.$store.state.dorParcels;
          const pwdParcel = this.$store.state.pwdParcel;
          if (!(dorParcels.length > 0 || pwdParcel)) {
            const dorParcelId = feature.properties.dor_parcel_id;
            const pwdParcelId = feature.properties.pwd_parcel_id;
            this.getDorParcelsById(dorParcelId);
            this.getPwdParcelById(pwdParcelId);
          }

          // get topics
          this.fetchTopics(feature);

          // create address marker
          // const geom = feature.geometry;
          // console.log('create address marker', geom, VectorMarker);
          // const addressMarker = VectorMarker();
        }, response => {
          console.log('ais error')
          self.$store.commit('setGeocodeData', null);
          self.$store.commit('setGeocodeStatus', 'error');
        });
      },
      fetchTopics(feature) {
        // console.log('fetch topics');

        // get topics
        const dataSources = this.$config.dataSources || {};

        for (let [dataSourceKey, dataSource] of Object.entries(dataSources)) {
          // evaluate params
          const params = {};
          for (let [paramKey, paramFn] of Object.entries(dataSource.params)) {
            params[paramKey] = paramFn(feature);
          }
          const url = dataSource.url;
          const success = dataSource.success;

          // set topic status to `waiting`
          this.$store.commit('setSourceStatus', {
            key: dataSourceKey,
            status: 'waiting'
          });

          this.$http.get(url, { params }).then(response => {
            const data = response.body;

            // put data in state
            this.$store.commit('setSourceData', {
              key: dataSourceKey,
              data: success(data),
            });

            // update status
            this.$store.commit('setSourceStatus', {
              key: dataSourceKey,
              status: 'success'
            });
          }, response => {
            console.log('get topic error', response);

            // null out data in state
            this.$store.commit('setSourceData', {
              key: dataSourceKey,
              data: null,
            });

            // update status
            this.$store.commit('setSourceStatus', {
              key: dataSourceKey,
              status: 'error'
            });
          });
        }
      },
    }
  };
</script>

<style scoped>
  .mb-panel-map {
    /*this allows the loading mask to fill the div*/
    position: relative;
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
