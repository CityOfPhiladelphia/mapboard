<template>
  <div class="large-12 columns mb-panel mb-panel-map">
    <map_ @l-click="handleMapClick"
          zoom-control-position="bottomright"
          :min-zoom="this.$config.map.minZoom"
          :max-zoom="this.$config.map.maxZoom"
    >
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
        <basemap-control v-if="hasImageryBasemaps"
                         :position="'topright'"
                         :imagery-years="imageryYears"
        />
        <!-- search control -->
        <control position="topleft">
          <div class="mb-search-control-container">
            <form @submit.prevent="handleSearchFormSubmit">
                <input class="mb-search-control-input"
                       placeholder="Search the map"
                />
                <button class="mb-search-control-button">
                  <i class="fa fa-search fa-lg"></i>
                </button>
            </form>
          </div>
        </control>
    </map_>
  </div>
</template>

<script>
  // vue doesn't like it when you import this as Map (reserved-ish word)
  import Map_ from '../leaflet/Map';
  import Control from '../leaflet/Control';
  import SearchControl from './SearchControl';
  import ControlCorner from './ControlCorner';
  import BasemapToggleButton from './BasemapToggleButton';
  import ImageryToggleBar from './ImageryToggleBar';
  import EsriTiledMapLayer from '../esri-leaflet/TiledMapLayer';
  import Geojson from '../leaflet/Geojson';
  import VectorMarker from './VectorMarker';
  import BasemapControl from './BasemapControl';

  export default {
    components: {
      Map_,
      Control,
      SearchControl,
      ControlCorner,
      BasemapToggleButton,
      ImageryToggleBar,
      EsriTiledMapLayer,
      Geojson,
      VectorMarker,
      BasemapControl
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
        const key = this.$store.state.topic;
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
        return (this.$store.state.ais || {}).geometry;;
      },
      streetAddress() {
        return this.$store.state.ais.properties.street_address;
      },
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
      handleSearchFormSubmit(e) {
        const input = e.target[0].value;
        this.fetchAis(input);
      },
      getReverseGeocode(latlng) {
        const lnglat = [latlng.lng, latlng.lat];
        const url = this.$config.geocoder.methods.reverseGeocode.url(lnglat);
        this.$http.get(url.replace('ais', 'ais_test')).then(response => {
          const data = response.body;
          this.$store.commit('setAis', data.features[0])
        }, response => {
          console.log('reverse geocode error')
        });
      },
      getDorParcelsByLatLng(latlng) {
        var url = this.$config.map.featureLayers.dorParcels.url;
        var parcelQuery = L.esri.query({ url });
        parcelQuery.contains(latlng);
        parcelQuery.run((error, featureCollection, response) => {
          const features = featureCollection.features;
          this.$store.commit('setDorParcels', featureCollection.features);

          if (this.activeParcelLayer === 'dor') {
            if (features.length < 1) return;
            // TODO sort by mapreg, status
            this.fetchAis(features[0].properties.MAPREG);
          }
        });
      },
      getPwdParcelByLatLng(latlng) {
        var url = this.$config.map.featureLayers.pwdParcels.url;
        var parcelQuery = L.esri.query({ url });
        parcelQuery.contains(latlng);
        parcelQuery.run((error, featureCollection, response) => {
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

          if (feature && this.activeParcelLayer === 'pwd') {
            this.fetchAis(feature.properties.PARCELID);
          }
        });
      },
      fetchAis(input) {
        const self = this;
        const searchConfig = this.$config.geocoder.methods.search;
        const url = searchConfig.url(input);
        const params = searchConfig.params;

        this.$http.get(url, { params }).then(response => {
          const data = response.body;

          // TODO handle multiple ais results
          if (!data.features || data.features.length < 1) {
            console.log('ais got no features', data);
            return;
          }
          // TODO do some checking here
          const feature = data.features[0];
          self.$store.commit('setAis', feature);

          // get topics
          this.fetchTopics(feature);
        }, response => {
          console.log('ais error')
          self.$store.commit('setAis', null);
        });
      },
      fetchTopics(feature) {
        // get topics
        const dataSources = this.$config.dataSources;
        for (let [dataSourceKey, dataSource] of Object.entries(dataSources)) {
          // evaluate params
          const params = {};
          for (let [paramKey, paramFn] of Object.entries(dataSource.params)) {
            params[paramKey] = paramFn(feature);
          }
          const url = dataSource.url;

          this.$http.get(url, { params }).then(response => {
            const body = response.body;
            // TODO put in state
          }, response => {
            console.log('get topic error', response);
          });
        }
      },
    }
  };
</script>

<style scoped>
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
</style>
