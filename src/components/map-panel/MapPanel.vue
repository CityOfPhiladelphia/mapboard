<template>
  <div id="map-container" class="large-12 columns mb-panel mb-panel-map">
    <map_ :class="{ 'mb-map-with-widget': this.$store.state.cyclomedia.active || this.$store.state.pictometry.active }"
          :center="this.$store.state.map.center"
          :zoom="this.$store.state.map.zoom"
          @l-click="handleMapClick"
          @l-moveend="handleMapMove"
          zoom-control-position="bottomright"
          :min-zoom="this.$config.map.minZoom"
          :max-zoom="this.$config.map.maxZoom"
    >
    <!-- :class="{ 'mb-map-with-widget': this.$store.state.cyclomedia.active || this.$store.state.pictometry.active }" -->
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
                         :attribution="basemap.attribution"
      />

      <!-- basemap labels and parcels outlines -->
      <esri-tiled-map-layer v-for="(tiledLayer, key) in this.$config.map.tiledLayers"
                         v-if="activeTiles.includes(key)"
                         :key="key"
                         :url="tiledLayer.url"
                         :zIndex="tiledLayer.zIndex"
                         :attribution="tiledLayer.attribution"
      />

      <esri-dynamic-map-layer v-for="(dynamicLayer, key) in this.$config.map.dynamicMapLayers"
                          v-if="activeDynamicMaps.includes(key)"
                         :key="key"
                         :url="dynamicLayer.url"
                         :attribution="dynamicLayer.attribution"
                         :opacity="dynamicLayer.opacity"
      />

      <esri-feature-layer v-for="(featureLayer, key) in this.$config.map.featureLayers"
                          v-if="shouldShowFeatureLayer(key, featureLayer.minZoom)"
                          :key="key"
                          :layerName="key"
                          :url="featureLayer.url"
                          :color="featureLayer.color"
                          :fillColor="featureLayer.color"
                          :fillOpacity="featureLayer.fillOpacity"
                          :weight="featureLayer.weight"
      />

      <!-- regmaps -->
      <esri-dynamic-map-layer v-for="(item, key) in this.imageOverlayItems"
                              v-if="shouldShowImageOverlay(item.properties.RECMAP)"
                              :key="key"
                              :url="'http://gis.phila.gov/arcgis/rest/services/DOR_ParcelExplorer/rtt_basemap/MapServer/'"
                              :layers="[29]"
                              :layerDefs="'29:NAME=\'g' + item.properties.RECMAP.toLowerCase() + '.tif\''"
                              :opacity="0.5"
                              :transparent="true"
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
  // mixins
  import dataMixin from './data-mixin';
  import markersMixin from './markers-mixin';
  import geocodeMixin from './geocode-mixin';
  import cyclomediaMixin from '../../cyclomedia/map-panel-mixin';
  import pictometryMixin from '../../pictometry/map-panel-mixin';

  // vue doesn't like it when you import this as Map (reserved-ish word)
  import Map_ from '../../leaflet/Map';
  import Control from '../../leaflet/Control';
  import EsriTiledMapLayer from '../../esri-leaflet/TiledMapLayer';
  import EsriDynamicMapLayer from '../../esri-leaflet/DynamicMapLayer';
  import EsriFeatureLayer from '../../esri-leaflet/FeatureLayer';
  import Geojson from '../../leaflet/Geojson';
  import CircleMarker from '../../leaflet/CircleMarker';
  import OpacitySlider from '../../leaflet/OpacitySlider';
  import VectorMarker from '../VectorMarker';
  import PngMarker from '../PngMarker';
  import SvgMarker from '../SvgMarker';
  import BasemapControl from '../BasemapControl';
  import HistoricmapControl from '../HistoricmapControl';
  import CyclomediaButton from '../../cyclomedia/Button';
  import PictometryButton from '../../pictometry/Button';
  import CyclomediaRecordingCircle from '../../cyclomedia/RecordingCircle';
  import CyclomediaRecordingsClient from '../../cyclomedia/recordings-client';

  export default {
    mixins: [
      dataMixin,
      markersMixin,
      geocodeMixin,
      cyclomediaMixin,
      pictometryMixin,
    ],
    components: {
      Map_,
      Control,
      EsriTiledMapLayer,
      EsriDynamicMapLayer,
      EsriFeatureLayer,
      Geojson,
      CircleMarker,
      OpacitySlider,
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
      imageOverlay() {
        return this.$store.state.map.imageOverlay;
      },
      imageOverlayItems() {
        // console.log('calculating imageOverlayItem');
        if (this.activeTopicConfig.imageOverlayGroup) {
          const overlayGroup = this.activeTopicConfig.imageOverlayGroup
          const state = this.$store.state;
          const overlay = this.$config.imageOverlayGroups[overlayGroup].items(state);
          // console.log('returning imageOverlayItem', overlay);
          return overlay;
        } else {
          return [];
        }
      },
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
      activeFeatureLayers() {
        if (!this.activeTopicConfig || !this.activeTopicConfig.featureLayers) {
          return [];
        } else {
          return this.activeTopicConfig.featureLayers;
        }
      },
      activeFeature() {
        return this.$store.state.activeFeature;
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
      picOrCycloActive() {
        if (this.cyclomediaActive || this.pictometryActive) {
          return true;
        } else {
          return false;
        }
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
    watch: {
      picOrCycloActive(value) {
        this.$nextTick(() => {
          this.$store.state.map.map.invalidateSize();
        })
      }
    },
    methods: {
      shouldShowImageOverlay(key) {
        return key === this.imageOverlay;
      },
      shouldShowFeatureLayer(key, minZoom) {
        if (this.activeFeatureLayers.includes(key) && this.$store.state.map.zoom >= minZoom) {
          return true;
        } else {
          return false;
        }
      },
      handleMapClick(e) {
        // console.log('handle map click');

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
      handleMapMove(e) {
        // update state
        const center = this.$store.state.map.map.getCenter();
        this.$store.commit('setMapCenter', center);
        const zoom = this.$store.state.map.map.getZoom();
        this.$store.commit('setMapZoom', zoom);
        this.updateCyclomediaRecordings();
      },
      handleSearchFormSubmit(e) {
        const input = e.target[0].value;
        this.$store.commit('setLastSearchMethod', 'geocode');
        this.$store.commit('setPwdParcel', null);
        this.$store.commit('setDorParcels', []);

        this.geocode(input);
      }
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
