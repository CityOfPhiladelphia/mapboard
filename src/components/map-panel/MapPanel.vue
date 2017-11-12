<template>
  <div class="medium-12 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map">
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
                            v-if="tiledLayers.includes(key)"
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
                              :transparent="true"
                              :opacity="dynamicLayer.opacity"
      />

      <!-- dorParcels, pwdParcels, vacantLand, vacantBuilding -->
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
                              :url="'//gis.phila.gov/arcgis/rest/services/DOR_ParcelExplorer/rtt_basemap/MapServer/'"
                              :layers="[29]"
                              :layerDefs="'29:NAME=\'g' + item.properties.RECMAP.toLowerCase() + '.tif\''"
                              :transparent="true"
                              :opacity="0.5"
      />
      <!-- :url="this.imageOverlayInfo.url"
      :opacity="this.imageOverlayInfo.opacity" -->

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
      />

      <!-- marker using custom code extending icons - https://github.com/iatkin/leaflet-svgicon -->
      <svg-marker v-if="this.cyclomediaActive" />

      <!-- geojson features -->
      <geojson v-for="geojsonFeature in geojsonFeatures"
               v-if="shouldShowGeojson(geojsonFeature.key)"
               :geojson="geojsonFeature.geojson"
               :color="geojsonFeature.color"
               :weight="2"
               :key="geojsonFeature.key"
       />
       <!-- :overlay="geojsonFeature.overlayFeature" -->

       <!-- location marker -->
       <circle-marker v-if="this.$store.state.map.location.lat != null"
                      :latlng="this.locationMarker.latlng"
                      :radius="this.locationMarker.radius"
                      :fillColor="this.locationMarker.fillColor"
                      :color="this.locationMarker.color"
                      :weight="this.locationMarker.weight"
                      :opacity="this.locationMarker.opacity"
                      :fillOpacity="this.locationMarker.fillOpacity"
                      :key="Math.random()"
       />

       <!-- TODO give these a real key -->
      <circle-marker v-for="circleMarker in circleMarkers"
                     @l-mouseover="handleCircleMarkerMouseover"
                     @l-click="handleCircleMarkerClick"
                     @l-mouseout="handleCircleMarkerMouseout"
                     :latlng="circleMarker.latlng"
                     :radius="circleMarker.radius"
                     :fillColor="circleMarker.fillColor"
                   	 :color="circleMarker.color"
                   	 :weight="circleMarker.weight"
                   	 :opacity="circleMarker.opacity"
                   	 :fillOpacity="circleMarker.fillOpacity"
                     :key="Math.random()"
                     :data="{
                       featureId: circleMarker.featureId,
                       tableId: circleMarker.tableId
                     }"
      />

       <!-- <vector-marker v-for="marker in threeOneOneMarkers"
                      v-if="activeTopicConfig.key === 'threeOneOne'"
                      :latlng="[marker.geometry.coordinates[1], marker.geometry.coordinates[0]]"
                      :key="marker.id"
                      :markerColor="'#b2ffb2'"
       /> -->

      <!-- CONTROLS: -->
      <!-- basemap control -->
      <control-corner :vSide="'top'"
                      :hSide="'almostright'"
      >
      </control-corner>

      <!-- <control-corner :vSide="'bottom'"
                      :hSide="'almostleft'"
      >
      </control-corner> -->

      <!-- <basemap-tooltip :position="'topright'"
      /> -->

      <div v-once>
        <basemap-toggle-control v-if="shouldShowImageryToggle"
                                v-once
                                :position="'topright'"
        />
      </div>

      <div v-once>
        <basemap-select-control :position="'topalmostright'" />
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

      <div v-once>
        <measure-control :position="'bottomleft'" />
      </div>

      <div v-once>
        <legend-control v-for="legendControl in Object.keys(legendControls)"
                        :key="legendControl"
                        :position="'bottomleft'"
                        :options="legendControls[legendControl].options"
                        :items="legendControls[legendControl].data"
        />
      </div>

      <div v-once>
        <location-control v-once
                          v-if="this.geolocationEnabled"
                          :position="'bottomright'"
        />
      </div>



      <!-- <basemap-tooltip :position="'bottomalmostleft'"
      /> -->

      <!-- <scale-control :vSide="'top'"
                     :hSide="'almostright'"
      >
      </scale-control> -->


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
                <!-- :style="{ background: !!this.$store.state.error ? '#ffcece' : '#fff'}" -->
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
  import markersMixin from './markers-mixin';
  import cyclomediaMixin from '../../cyclomedia/map-panel-mixin';
  import pictometryMixin from '../../pictometry/map-panel-mixin';
  // vue doesn't like it when you import this as Map (reserved-ish word)
  import Map_ from '../../leaflet/Map.vue';
  import Control from '../../leaflet/Control.vue';
  import EsriTiledMapLayer from '../../esri-leaflet/TiledMapLayer.vue';
  import EsriDynamicMapLayer from '../../esri-leaflet/DynamicMapLayer.vue';
  import EsriFeatureLayer from '../../esri-leaflet/FeatureLayer.vue';
  import Geojson from '../../leaflet/Geojson.vue';
  import CircleMarker from '../../leaflet/CircleMarker.vue';
  import OpacitySlider from '../OpacitySlider.vue';
  import VectorMarker from '../VectorMarker.vue';
  import PngMarker from '../PngMarker.vue';
  import SvgMarker from '../SvgMarker.vue';
  import BasemapToggleControl from '../BasemapToggleControl.vue';
  import BasemapSelectControl from '../BasemapSelectControl.vue';
  import LocationControl from '../LocationControl.vue';
  import CyclomediaButton from '../../cyclomedia/Button.vue';
  import PictometryButton from '../../pictometry/Button.vue';
  import CyclomediaRecordingCircle from '../../cyclomedia/RecordingCircle.vue';
  import CyclomediaRecordingsClient from '../../cyclomedia/recordings-client';
  import MeasureControl from '../MeasureControl.vue';
  import LegendControl from '../LegendControl.vue';
  import BasemapTooltip from '../BasemapTooltip.vue';
  import ControlCorner from '../../leaflet/ControlCorner.vue';

  export default {
    mixins: [
      markersMixin,
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
      BasemapToggleControl,
      BasemapSelectControl,
      LocationControl,
      PictometryButton,
      CyclomediaButton,
      CyclomediaRecordingCircle,
      MeasureControl,
      LegendControl,
      BasemapTooltip,
      ControlCorner,
    },
    created() {
      // if there's a default address, navigate to it
      const defaultAddress = this.$config.defaultAddress;
      if (defaultAddress) {
        this.$controller.goToDefaultAddress(defaultAddress);
      }

      const cyclomediaConfig = this.$config.cyclomedia || {};
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
    mounted() {
      // this.geofind();
      this.$controller.appDidLoad();
    },
    computed: {
      isMobileOrTablet() {
        return this.$store.state.is_mobile_or_tablet;
      },
      geolocationEnabled() {
        return this.$config.geolocation.enabled;
      },
      activeDorParcel() {
        // return this.$store.state.activeDorParcel;
        return this.$store.state.parcels.dor.activeParcel;
      },
      legendControls() {
        return this.$config.legendControls;
      },
      imageOverlay() {
        return this.$store.state.map.imageOverlay;
      },
      imageOverlayItems() {
        // console.log('calculating imageOverlayItem');
        if (this.activeTopicConfig.imageOverlayGroup) {
          const overlayGroup = this.activeTopicConfig.imageOverlayGroup;
          const state = this.$store.state;
          const overlay = this.$config.imageOverlayGroups[overlayGroup].items(state);
          // console.log('returning imageOverlayItem', overlay);
          return overlay;
        } else {
          return [];
        }
      },
      imageOverlayInfo() {
        console.log('config:', this.$config);
        return this.$config.map.dynamicMapLayers.regmaps;
      },
      activeBasemap() {
        const shouldShowImagery = this.$store.state.map.shouldShowImagery;
        if (shouldShowImagery) {
          return this.$store.state.map.imagery;
        }
        const defaultBasemap = this.$config.map.defaultBasemap;
        const basemap = this.$store.state.map.basemap || defaultBasemap;
        return basemap;
      },
      tiledLayers() {
        const activeBasemap = this.activeBasemap;
        const activeBasemapConfig = this.configForBasemap(activeBasemap)

        return activeBasemapConfig.tiledLayers || [];
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
      shouldShowImageryToggle() {
        return this.hasImageryBasemaps && this.$config.map.imagery.enabled;
      },
      identifyFeature() {
        const configFeature = this.activeTopicConfig.identifyFeature;
        if (configFeature) {
          return configFeature;
        } else {
          return this.$config.map.defaultIdentifyFeature;
        }
      },
      activeTopic() {
        return this.$store.state.activeTopic;
      },
      activeTopicConfig() {
        const key = this.activeTopic;
        let config;

        // if no active topic, return null
        if (key) {
          config = this.$config.topics.filter((topic) => {
            return topic.key === key;
          })[0];
        }

        return config || {};
      },
      activeParcelLayer() {
        return this.activeTopicConfig.parcels;
      },
      dorParcels() {
        return this.$store.state.parcels.dor.data;
      },
      pwdParcel() {
        return this.$store.state.parcels.pwd;
      },
      geocodeResult() {
        return this.$store.state.geocode.data || {};
      },
      geocodeGeom() {
        return this.geocodeResult.geometry;
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
      isGeocoding() {
        return this.$store.state.geocode.status === 'waiting';
      }
    },
    watch: {
      picOrCycloActive(value) {
        this.$nextTick(() => {
          this.$store.state.map.map.invalidateSize();
        })
      }
    },
    methods: {
      configForBasemap(basemap) {
        return this.$config.map.basemaps[basemap] || {};
      },
      shouldShowGeojson(key) {
        if (this.activeTopicConfig.basemap === 'pwd') {
          return true;
        } else {
          return key === this.activeDorParcel;
        }
      },
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
        this.$controller.handleMapClick(e);
      },

      handleMapMove(e) {
        const map = this.$store.state.map.map;

        const pictometryConfig = this.$config.pictometry || {};

        if (pictometryConfig.enabled) {
          // update state for pictometry
          const center = map.getCenter();
          const { lat, lng } = center;
          const coords = [lng, lat];
          this.$store.commit('setPictometryMapCenter', coords);

          const zoom = map.getZoom();
          this.$store.commit('setPictometryMapZoom', zoom);
        }

        const cyclomediaConfig = this.$config.cyclomedia || {};

        if (cyclomediaConfig.enabled) {
          // update cyclo recordings
          this.updateCyclomediaRecordings();
        }
      },
      handleSearchFormSubmit(e) {
        this.$controller.handleSearchFormSubmit(e);
      },
      fillColorForCircleMarker(markerId, tableId) {
        // get map overlay style and hover style for table
        const tableConfig = this.getConfigForTable(tableId);
        const mapOverlay = tableConfig.options.mapOverlay;
        const { style, hoverStyle } = mapOverlay;

        // compare id to active feature id
        const activeFeature = this.activeFeature;
        const useHoverStyle = (
          markerId === activeFeature.featureId &&
          tableId === activeFeature.tableId
        );
        const curStyle = useHoverStyle ? hoverStyle : style;

        return curStyle.fillColor;
      },
    }, // end of methods
  }; //end of export
</script>

<style scoped>
  .mb-panel-map {
    /*this allows the loading mask to fill the div*/
    position: relative;
  }

  /*@media (max-width: 749px) {
    .mb-panel-map {
      height: 600px;
    }
  }*/

  .mb-search-control-container {
    height: 48px;
    border-radius: 2px;
    box-shadow:0 2px 4px rgba(0,0,0,0.2),0 -1px 0px rgba(0,0,0,0.02);
  }

  .mb-search-control-button {
    color: #fff;
    width: 50px;
    background: #2176d2;
    line-height: 48px;
  }

  .mb-search-control-input {
    border: 0;
    /*height: 48px !important;*/
    /*line-height: 48px;*/
    padding: 15px;
    /*padding-left: 15px;
    padding-right: 15px;*/
    font-family: 'Montserrat', 'Tahoma', sans-serif;
    font-size: 16px;
    width: 275px;
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

  /*small*/
  @media screen and (max-width: 39.9375em) {
    .mb-search-control-input {
      width: 200px;
    }
  }

  /*small retina*/
  /*@media
  (-webkit-min-device-pixel-ratio: 2),
  (min-resolution: 192dpi),
  (max-width: 39.9375em) {
    .mb-search-control-input {
      max-width: 250px;
    }
  }*/
</style>
