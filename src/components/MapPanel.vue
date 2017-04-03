<template>
  <div class="large-12 columns mb-panel mb-panel-map">
    <Map_ @l-click="handleMapClick"
          zoom-control-position="bottomright"
          :min-zoom="this.$config._map.minZoom"
          :max-zoom="this.$config._map.maxZoom"
    >
      <!-- controls -->
      <ControlCorner :vSide="'top'" :hSide="'almostright'" />
      <ImageryToggleBar />
      <Control position="topleft">
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
      </Control>
      <Control :position="'topright'">
        <BasemapToggleButton />
      </Control>
      <Control :position="'topalmostright'">
        <!-- <ImageryToggleBar /> -->
      </Control>

      <!-- basemaps -->
      <EsriTiledMapLayer v-for="(basemap, key) in this.$config._map.basemaps"
                         v-if="activeBasemap === key"
                         :key="key"
                         :url="basemap.url"
                         :max-zoom="basemap.maxZoom"
      />

      <!-- dor parcels -->
      <GeoJson v-for="dorParcel in dorParcels"
               v-if="identifyFeature === 'dor-parcel' && activeParcelLayer === 'dor'"
               :geojson="dorParcel"
               :color="'green'"
               :weight="2"
               :key="dorParcel.properties.OBJECTID"
       />

       <!-- pwd parcel -->
       <GeoJson v-if="identifyFeature === 'pwd-parcel' && activeParcelLayer === 'pwd' && pwdParcel"
                :geojson="pwdParcel"
                :color="'blue'"
                :weight="2"
                :key="pwdParcel.properties.PARCELID"
        />

        <!-- address marker -->
        <!-- REVIEW why does this need a key? it's not a list... -->
        <VectorMarker v-if="identifyFeature === 'address-marker' && aisGeom"
                      :latlng="[...aisGeom.coordinates].reverse()"
                      :key="streetAddress"
        />
    </Map_>
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
  import GeoJson from '../leaflet/GeoJson';
  import VectorMarker from './VectorMarker';

  export default {
    components: {
      Map_,
      Control,
      SearchControl,
      ControlCorner,
      BasemapToggleButton,
      ImageryToggleBar,
      EsriTiledMapLayer,
      GeoJson,
      VectorMarker
    },
    computed: {
      activeBasemap() {
        if (this.$store.state.imageryOn) {
          return this.$store.state.imageryYear;
        } else {
          return this.activeTopicConfig.basemap;
        }
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
        // console.log('handleMapClick', e);

        // TODO figure out why form submits via enter key are generating a map
        // click event and remove this
        if (e.originalEvent.keyCode === 13) {
          return;
        }

        this.getDorParcelsByLatLng(e.latlng);
        this.getPwdParcelByLatLng(e.latlng);
      },
      toggleBaseAndImage() {
        console.log('clickedEasyButton');
      },
      handleSearchFormSubmit(e) {
        const input = e.target[0].value;
        this.fetchAis(input);
      },
      getDorParcelsByLatLng(latlng) {
        var url = this.$config._map.featureLayers.dorParcels.url;
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
        var url = this.$config._map.featureLayers.pwdParcels.url;
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
        const searchConfig = this.$config._geocoder.methods.search;
        const url = searchConfig.url(input);
        const data = searchConfig.params;
        $.ajax({
          url,
          data,
          success(data) {
            // TODO handle multiple ais results
            if (!data.features || data.features.length < 1) {
              console.log('ais got no features', data);
              return;
            }
            self.$store.commit('setAis', data.features[0])
          },
          error(err) {
            console.log('ais error')
            self.$store.commit('setAis', null);
          }
        });
      },
      zoomed() {
        console.log('zoomed', this.$store.state.map.getZoom());
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
