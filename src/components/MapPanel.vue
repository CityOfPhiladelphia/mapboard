<template>
  <div
    id="map-panel-container"
    :class="mapPanelContainerClass"
  >
    <!-- <full-screen-map-toggle-tab /> -->
    <full-screen-map-toggle-tab v-once />

    <map_
      id="map-tag"
      :class="{ 'mb-map-with-widget': this.$store.state.cyclomedia.active || this.$store.state.pictometry.active }"
      :center="this.$store.state.map.center"
      :zoom="this.$store.state.map.zoom"
      zoom-control-position="bottomright"
      :min-zoom="this.$config.map.minZoom"
      :max-zoom="this.$config.map.maxZoom"
      @l-click="handleMapClick"
      @l-moveend="handleMapMove"
    >
      <!-- :class="{ 'mb-map-with-widget': this.$store.state.cyclomedia.active || this.$store.state.pictometry.active }" -->
      <!-- loading mask -->
      <div
        v-show="isGeocoding"
        class="mb-map-loading-mask"
      >
        <div class="mb-map-loading-mask-inner">
          <i class="fa fa-spinner fa-4x spin" />
          <h1>Finding address...</h1>
        </div>
      </div>

      <!-- basemaps -->
      <esri-tiled-map-layer
        v-for="(basemap, key) in this.$config.map.basemaps"
        v-if="activeBasemap === key"
        :key="key"
        :url="basemap.url"
        :max-zoom="basemap.maxZoom"
        :attribution="basemap.attribution"
      />

      <!-- basemap labels and parcels outlines -->
      <esri-tiled-map-layer
        v-for="(tiledLayer, key) in this.$config.map.tiledLayers"
        v-if="tiledLayers.includes(key)"
        :key="key"
        :url="tiledLayer.url"
        :z-index="tiledLayer.zIndex"
        :attribution="tiledLayer.attribution"
      />

      <!-- tiled overlay based on topic -->
      <esri-tiled-overlay
        v-for="(tiledLayer, key) in this.$config.map.tiledOverlays"
        v-if="activeTiledOverlays.includes(key)"
        :key="key"
        :url="tiledLayer.url"
        :z-index="tiledLayer.zIndex"
        :opacity="tiledLayer.opacity"
        :test="key"
      />

      <esri-dynamic-map-layer
        v-for="(dynamicLayer, key) in this.$config.map.dynamicMapLayers"
        v-if="activeDynamicMaps.includes(key)"
        :key="key"
        :url="dynamicLayer.url"
        :attribution="dynamicLayer.attribution"
        :transparent="true"
        :opacity="dynamicLayer.opacity"
      />

      <!-- dorParcels, pwdParcels, vacantLand, vacantBuilding -->
      <esri-feature-layer
        v-for="(featureLayer, key) in this.$config.map.featureLayers"
        v-if="shouldShowFeatureLayer(key, featureLayer.minZoom)"
        :key="key"
        :layer-name="key"
        :url="featureLayer.url"
        :color="featureLayer.color"
        :fill-color="featureLayer.color"
        :fill-opacity="featureLayer.fillOpacity"
        :weight="featureLayer.weight"
        :style_="featureLayer.style"
        :min-zoom="featureLayer.minZoom"
        :max-zoom="featureLayer.maxZoom"
        :z-index="featureLayer.zIndex"
        :marker-type="featureLayer.markerType"
        :radius="featureLayer.radius"
        :interactive="featureLayer.interactive"
      />

      <!-- regmaps -->
      <esri-dynamic-map-layer
        v-for="(item, key) in imageOverlayItems"
        v-if="shouldShowImageOverlay(item.properties.RECMAP)"
        :key="key"
        :url="'//gis-svc.databridge.phila.gov/arcgis/rest/services/Atlas/RegMaps/MapServer'"
        :layers="[0]"
        :layer-defs="'0:NAME=\'g' + item.properties.RECMAP.toLowerCase() + '.tif\''"
        :transparent="true"
        :opacity="0.5"
      />
      <!-- :url="'//gis.phila.gov/arcgis/rest/services/DOR_ParcelExplorer/rtt_basemap/MapServer/'" -->
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
      <vector-marker
        v-for="marker in markersForAddress"
        :key="marker.key"
        :latlng="marker.latlng"
        :marker-color="marker.color"
        :icon="marker.icon"
      />

      <!-- vector markers -->
      <vector-marker
        v-for="marker in markersForTopic"
        :key="marker.key"
        :latlng="marker.latlng"
        :marker-color="marker.color"
        :icon="marker.icon"
      />

      <!-- marker using a png and ablility to rotate it -->
      <png-marker
        v-if="cyclomediaActive"
        :icon="sitePath + 'images/camera.png'"
        :latlng="cycloLatlng"
        :rotation-angle="cycloRotationAngle"
      />

      <!-- marker using custom code extending icons - https://github.com/iatkin/leaflet-svgicon -->
      <svg-view-cone-marker
        v-if="cyclomediaActive"
        :latlng="cycloLatlng"
        :rotation-angle="cycloRotationAngle"
        :h-fov="cycloHFov"
      />


      <!-- non-reactive geojson parcels -->
      <geojson
        v-for="geojsonFeature in geojsonParcels"
        v-if="shouldShowGeojson(geojsonFeature.key)"
        :key="geojsonFeature.key"
        :geojson="geojsonFeature.geojson"
        :fill-color="geojsonFeature.fillColor"
        :color="geojsonFeature.color"
        :weight="geojsonFeature.weight"
        :opacity="geojsonFeature.opacity"
        :fill-opacity="geojsonFeature.fillOpacity"
        :data="{
          featureId: geojsonFeature.featureId,
          tableId: geojsonFeature.tableId
        }"
      />

      <!-- non-reactive geojson features for topics -->
      <geojson
        v-for="geojsonFeature in geojsonForTopic"
        v-if="shouldShowGeojson(geojsonFeature.key)"
        :key="geojsonFeature.key"
        :geojson="geojsonFeature.geojson"
        :fill-color="geojsonFeature.fillColor"
        :color="geojsonFeature.color"
        :weight="geojsonFeature.weight"
        :opacity="geojsonFeature.opacity"
        :fill-opacity="geojsonFeature.fillOpacity"
        :data="{
          featureId: geojsonFeature.featureId,
          tableId: geojsonFeature.tableId
        }"
      />

      <!-- reactive geojson features -->
      <geojson
        v-for="geojsonFeature in reactiveGeojsonFeatures"
        v-if="shouldShowGeojson(geojsonFeature.key)"
        :key="geojsonFeature.key"
        :geojson="geojsonFeature.geojson"
        :fill-color="geojsonFeature.fillColor"
        :color="geojsonFeature.color"
        :weight="geojsonFeature.weight"
        :opacity="geojsonFeature.opacity"
        :fill-opacity="geojsonFeature.fillOpacity"
        :data="{
          featureId: geojsonFeature.featureId,
          tableId: geojsonFeature.tableId
        }"
        @l-mouseover="handleMarkerMouseover"
        @l-click="handleMarkerClick"
        @l-mouseout="handleMarkerMouseout"
      />

      <!-- reactive polyline features -->
      <!-- v-if="shouldShowPolyline(geojsonFeature.key)" -->
      <!-- :fillOpacity="geojsonFeature.fillOpacity" -->
      <polyline_
        v-for="polyline in reactivePolylineFeatures"
        :key="polyline.key"
        :latlngs="polyline.latlngs"
        :color="polyline.color"
        :fill-color="polyline.fillColor"
        :weight="polyline.weight"
        :opacity="polyline.opacity"
        :data="{
          featureId: polyline.featureId,
          tableId: polyline.tableId,
          type: 'polyline'
        }"
        @l-mouseover="handleMarkerMouseover"
        @l-click="handleMarkerClick"
        @l-mouseout="handleMarkerMouseout"
      />

      <!-- location marker -->
      <circle-marker
        v-if="this.$store.state.map.location.lat != null"
        :key="Math.random()"
        :latlng="locationMarker.latlng"
        :radius="locationMarker.radius"
        :fill-color="locationMarker.fillColor"
        :color="locationMarker.color"
        :weight="locationMarker.weight"
        :opacity="locationMarker.opacity"
        :fill-opacity="locationMarker.fillOpacity"
      />

      <!-- TODO give these a real key -->
      <!-- :key="Math.random()" -->
      <circle-marker
        v-for="circleMarker in reactiveCircleMarkers"
        :key="circleMarker.featureId"
        :latlng="circleMarker.latlng"
        :radius="circleMarker.radius"
        :fill-color="circleMarker.fillColor"
        :color="circleMarker.color"
        :weight="circleMarker.weight"
        :opacity="circleMarker.opacity"
        :fill-opacity="circleMarker.fillOpacity"
        :data="{
          featureId: circleMarker.featureId,
          tableId: circleMarker.tableId
        }"
        @l-mouseover="handleMarkerMouseover"
        @l-click="handleMarkerClick"
        @l-mouseout="handleMarkerMouseout"
      />

      <!-- <vector-marker v-for="marker in threeOneOneMarkers"
                      v-if="activeTopicConfig.key === 'threeOneOne'"
                      :latlng="[marker.geometry.coordinates[1], marker.geometry.coordinates[0]]"
                      :key="marker.id"
                      :markerColor="'#b2ffb2'"
       /> -->

      <!-- CONTROLS: -->
      <!-- basemap control -->
      <control-corner
        :v-side="'top'"
        :h-side="'almostright'"
      />

      <control-corner
        :v-side="'top'"
        :h-side="'almostleft'"
      />

      <!-- <basemap-tooltip :position="'topright'"
      /> -->

      <div v-once>
        <basemap-toggle-control
          v-if="shouldShowBasemapToggleControl"
          v-once
          :position="'topright'"
        />
      </div>

      <div v-once>
        <basemap-select-control :position="basemapSelectControlPosition" />
      </div>

      <div v-once>
        <overlay-select-control
          v-if="shouldShowOverlaySelectControl"
          :position="overlaySelectControlPosition"
        />
      </div>

      <div v-once>
        <pictometry-button
          v-if="shouldShowPictometryButton"
          v-once
          :position="'topright'"
          :link="'pictometry'"
          :img-src="sitePath + 'images/pictometry.png'"
        />
      </div>

      <div v-once>
        <cyclomedia-button
          v-if="shouldShowCyclomediaButton"
          v-once
          :position="'topright'"
          :link="'cyclomedia'"
          :img-src="sitePath + 'images/cyclomedia.png'"
          @click="handleCyclomediaButtonClick"
        />
      </div>

      <div
        v-if="measureControlEnabled"
        v-once
      >
        <measure-control :position="'bottomleft'" />
      </div>

      <div v-once>
        <legend-control
          v-for="legendControl in Object.keys(legendControls)"
          :key="legendControl"
          :position="'bottomleft'"
          :options="legendControls[legendControl].options"
          :items="legendControls[legendControl].data"
        />
      </div>

      <div v-once>
        <location-control
          v-if="geolocationEnabled"
          v-once
          :position="'bottomright'"
        />
      </div>

      <!-- <basemap-tooltip :position="'bottomalmostleft'"
      /> -->

      <!-- <scale-control :vSide="'top'"
                     :hSide="'almostright'"
      >
      </scale-control> -->

      <div v-once>
        <map-address-input
          :position="addressInputPosition"
          :placeholder="addressInputPlaceholder"
          :width-from-config="addressInputWidth"
          @handle-search-form-submit="handleSearchFormSubmit"
        />
      </div>
      <map-address-candidate-list
        v-if="addressAutocompleteEnabled"
        :position="addressInputPosition"
        :width-from-config="addressInputWidth"
      />


      <cyclomedia-recording-circle
        v-for="recording in cyclomediaRecordings"
        v-if="cyclomediaActive"
        :key="recording.imageId"
        :image-id="recording.imageId"
        :latlng="[recording.lat, recording.lng]"
        :size="1.2"
        :color="'#3388ff'"
        :weight="1"
        @l-click="handleCyclomediaRecordingClick"
      />
    </map_>
    <slot
      class="widget-slot"
      name="cycloWidget"
    />
    <slot
      class="widget-slot"
      name="pictWidget"
    />
  </div>
</template>

<script>
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// console.log('L:', L)
const FeatureGroup = L.default.featureGroup;
const GeoJSON = L.default.geoJSON;
const Lmarker = L.default.marker;
// console.log('FeatureGroup:', FeatureGroup, 'GeoJSON:', GeoJSON)
// import { featureGroup, geoJSON } from 'leaflet';
// import { marker as Lmarker } from 'leaflet';
// import { FeatureGroup, GeoJSON } from 'leaflet';
// import { Marker as Lmarker } from 'leaflet';

// mixins
import markersMixin from './markers-mixin';
import cyclomediaMixin from '@philly/vue-mapping/src/cyclomedia/map-panel-mixin.js';
import pictometryMixin from '@philly/vue-mapping/src/pictometry/map-panel-mixin.js';
// const CyclomediaRecordingsClient = import(/* webpackChunkName: "mbmb_pvm_CyclomediaRecordingsClient" */'@philly/vue-mapping/src/cyclomedia/recordings-client.js');

// components
import CyclomediaRecordingsClient from '@philly/vue-mapping/src/cyclomedia/recordings-client.js';
import ControlCorner from '@philly/vue-mapping/src/leaflet/ControlCorner.vue';
import FullScreenMapToggleTab from '@philly/vue-mapping/src/components/FullScreenMapToggleTab.vue';
import Map_ from '@philly/vue-mapping/src/leaflet/Map.vue';
import LocationControl from '@philly/vue-mapping/src/components/LocationControl.vue';
import BasemapToggleControl from '@philly/vue-mapping/src/components/BasemapToggleControl.vue';
import BasemapSelectControl from '@philly/vue-mapping/src/components/BasemapSelectControl.vue';
import OverlaySelectControl from '@philly/vue-mapping/src/components/OverlaySelectControl.vue';
import PictometryButton from '@philly/vue-mapping/src/pictometry/Button.vue';
import CyclomediaButton from '@philly/vue-mapping/src/cyclomedia/Button.vue';
import MeasureControl from '@philly/vue-mapping/src/components/MeasureControl.vue';
import LegendControl from '@philly/vue-mapping/src/components/LegendControl.vue';
import MapAddressInput from '@philly/vue-mapping/src/components/MapAddressInput.vue';

export default {
  name: 'MapPanel',
  components: {
    MapAddressCandidateList: () => import(/* webpackChunkName: "mbmp_pvm_MapAddressCandidateList" */'@philly/vue-mapping/src/components/MapAddressCandidateList.vue'),
    EsriTiledMapLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriTiledMapLayer" */'@philly/vue-mapping/src/esri-leaflet/TiledMapLayer.vue'),
    EsriTiledOverlay: () => import(/* webpackChunkName: "mbmp_pvm_EsriTiledOverlay" */'@philly/vue-mapping/src/esri-leaflet/TiledOverlay.vue'),
    EsriDynamicMapLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriDynamicMapLayer" */'@philly/vue-mapping/src/esri-leaflet/DynamicMapLayer.vue'),
    EsriFeatureLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriFeatureLayer" */'@philly/vue-mapping/src/esri-leaflet/FeatureLayer.vue'),
    Geojson: () => import(/* webpackChunkName: "mbmp_pvm_Geojson" */'@philly/vue-mapping/src/leaflet/Geojson.vue'),
    CircleMarker: () => import(/* webpackChunkName: "mbmp_pvm_CircleMarker" */'@philly/vue-mapping/src/leaflet/CircleMarker.vue'),
    VectorMarker: () => import(/* webpackChunkName: "mbmp_pvm_VectorMarker" */'@philly/vue-mapping/src/components/VectorMarker.vue'),
    PngMarker: () => import(/* webpackChunkName: "mbmp_pvm_PngMarker" */'@philly/vue-mapping/src/components/PngMarker.vue'),
    CyclomediaRecordingCircle: () => import(/* webpackChunkName: "mbmp_pvm_CyclomediaRecordingCircle" */'@philly/vue-mapping/src/cyclomedia/RecordingCircle.vue'),
    SvgViewConeMarker: () => import(/* webpackChunkName: "mbmp_pvm_CyclomediaSvgViewConeMarker" */'@philly/vue-mapping/src/cyclomedia/SvgViewConeMarker.vue'),
    ControlCorner,
    FullScreenMapToggleTab,
    Map_,
    LocationControl,
    BasemapToggleControl,
    BasemapSelectControl,
    OverlaySelectControl,
    PictometryButton,
    CyclomediaButton,
    MeasureControl,
    LegendControl,
    MapAddressInput,
    // Control: () => import(/* webpackChunkName: "mbmp_pvm_Control" */'@philly/vue-mapping/src/leaflet/Control.vue'),
    // Polyline_: () => import(/* webpackChunkName: "mbmp_pvm_Geojson" */'@philly/vue-mapping/src/leaflet/Polyline.vue'),
    // BasemapTooltip: () => import(/* webpackChunkName: "mbmp_pvm_BasemapTooltip" */'@philly/vue-mapping/src/components/BasemapTooltip.vue'),
  },
  mixins: [
    markersMixin,
    cyclomediaMixin,
    pictometryMixin,
  ],
  data() {
    const data = {
      createdComplete: false,
      zoomToShape: {
        geojsonParcels: [],
        geojsonForTopic: [],
        markersForAddress: [],
        markersForTopic: [],
      },
    };
    return data;
  },
  computed: {
    sitePath() {
      if (process.env.VUE_APP_PUBLICPATH) {
        return window.location.origin + process.env.VUE_APP_PUBLICPATH;
      }
      return '';

    },
    shouldShowOverlaySelectControl() {
      let value = false;
      if (this.$config.map) {
        if (this.$config.map.overlaySelectControl) {
          if (this.$config.map.overlaySelectControl.shouldShow === true) {
            value = true;
          }
        }
      }
      return value;
    },
    addressAutocompleteEnabled() {
      // TODO tidy up the code
      if (this.$config.addressInput) {
        if (this.$config.addressInput.autocompleteEnabled === true) {
          return true;
        }
        return false;

      }
      return false;

    },
    addressInputPosition() {
      if (this.isMobileOrTablet) {
        return 'topleft';
      }
      return 'topalmostleft';

    },
    addressInputWidth() {
      if (this.$config.addressInput) {
        return this.$config.addressInput.mapWidth;
      }
      return 415;

    },
    addressInputPlaceholder() {
      if (this.$config.addressInput) {
        return this.$config.addressInput.placeholder;
      }
      return null;

    },
    basemapSelectControlPosition() {
      if (this.isMobileOrTablet) {
        return 'topright';
      }
      return 'topalmostright';

    },
    overlaySelectControlPosition() {
      if (this.$config.map.overlaySelectControl) {
        if (this.$config.map.overlaySelectControl.position) {
          return this.$config.map.overlaySelectControl.position;
        }
        return 'topright';

      }
      return 'topright';

      // if (this.isMobileOrTablet) {
      //   return 'topright'
      // } else {
      //   return 'topalmostright'
      // }
    },
    shouldShowAddressCandidateList() {
      return this.$store.state.shouldShowAddressCandidateList;
    },
    measureControlEnabled() {
      if (this.$config.measureControlEnabled === false) {
        return false;
      }
      return true;

    },
    fullScreenMapEnabled() {
      return this.$store.state.fullScreenMapEnabled;
    },
    fullScreenTopicsEnabled() {
      return this.$store.state.fullScreenTopicsEnabled;
    },
    mapPanelContainerClass() {
      // return 'medium-12 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map'
      if (this.fullScreenMapEnabled) {
        return 'medium-24 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map';
      } else if (this.fullScreenMapOnly) {
        return 'medium-1 small-order-1 small-1 medium-order-2 mb-panel mb-panel-map';
      } else if (this.fullScreenTopicsEnabled) {
        return 'medium-1 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map';
      }
      return 'medium-12 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map';

    },
    cycloLatlng() {
      if (this.$store.state.cyclomedia.orientation.xyz !== null) {
        const xyz = this.$store.state.cyclomedia.orientation.xyz;
        return [ xyz[1], xyz[0] ];
      }
      const center = this.$config.map.center;
      return center;

    },
    cycloRotationAngle() {
      return this.$store.state.cyclomedia.orientation.yaw;// * (180/3.14159265359);
    },
    cycloHFov() {
      return this.$store.state.cyclomedia.orientation.hFov;
    },
    isMobileOrTablet() {
      return this.$store.state.isMobileOrTablet;
    },
    shouldShowCyclomediaButton() {
      return this.$config.cyclomedia.enabled && !this.isMobileOrTablet;
    },
    shouldShowPictometryButton() {
      return this.$config.pictometry.enabled && !this.isMobileOrTablet;
    },
    geolocationEnabled() {
      if (this.$config.geolocation) {
        return this.$config.geolocation.enabled;
      }
      return false;

    },
    activeDorParcel() {
      // return this.$store.state.activeDorParcel;
      return this.$store.state.parcels.dor.activeParcel;
    },
    legendControls() {
      return this.$config.legendControls || {};
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
      }
      return [];

    },
    imageOverlayInfo() {
      // console.log('config:', this.$config);
      return this.$config.map.dynamicMapLayers.regmaps;
    },
    activeBasemap() {
      const shouldShowBasemapSelectControl = this.$store.state.map.shouldShowBasemapSelectControl;
      if (shouldShowBasemapSelectControl) {
        return this.$store.state.map.imagery;
      }
      const defaultBasemap = this.$config.map.defaultBasemap;
      const basemap = this.$store.state.map.basemap || defaultBasemap;
      return basemap;
    },
    tiledLayers() {
      const activeBasemap = this.activeBasemap;
      const activeBasemapConfig = this.configForBasemap(activeBasemap);
      return activeBasemapConfig.tiledLayers || [];
    },
    activeTiledOverlays() {
      if (!this.activeTopicConfig || !this.activeTopicConfig.tiledOverlays) {
        return [];
      }
      if (this.selectedOverlay) {
        return this.selectedOverlay;
      }
      return this.activeTopicConfig.tiledOverlays;


    },
    selectedOverlay() {
      return this.$store.state.map.selectedOverlay;
    },
    activeDynamicMaps() {
      if (!this.activeTopicConfig || !this.activeTopicConfig.dynamicMapLayers) {
        return [];
      }
      return this.activeTopicConfig.dynamicMapLayers;

    },
    activeFeatureLayers() {
      if (!this.activeTopicConfig || !this.activeTopicConfig.featureLayers) {
        return [];
      }
      return this.activeTopicConfig.featureLayers;

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
    shouldShowBasemapToggleControl() {
      if (this.$config.map.imagery) {
        return this.hasImageryBasemaps && this.$config.map.imagery.enabled;
      }
      return this.hasImageryBasemaps;

    },
    identifyFeature() {
      let configFeature;
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
    activeTopic() {
      return this.$store.state.activeTopic;
    },
    activeTopicConfig() {
      const key = this.activeTopic;
      const createdComplete = this.createdComplete;
      // console.log('computed activeTopicConfig is running, this.$config:', this.$config, 'key:', key, 'createdComplete:', createdComplete);
      let config;

      // if no active topic, return null
      if (key && this.$config) {
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
    geocodeType() {
      return this.geocodeResult.ais_feature_type;
    },
    streetAddress() {
      return this.geocodeResult.properties.street_address;
    },
    picOrCycloActive() {
      if (this.cyclomediaActive || this.pictometryActive) {
        return true;
      }
      return false;

    },
    // mapBounds() {
    //   // TODO calculate map bounds based on leaflet markers above
    // },
    boundsBasedOnShape() {
      return this.$store.state.map.boundsBasedOnShape;
    },
    isGeocoding() {
      return this.$store.state.geocode.status === 'waiting';
    },
    geocodeZoom() {
      if (this.$config.map.geocodeZoom) {
        return this.$config.map.geocodeZoom;
      }
      return 19;

    },
  },
  watch: {
    activeTopicConfig(nextTopicConfig) {
      const prevBasemap = this.$store.state.map.basemap || null;
      // const nextTopicConfig = this.config.topics.filter(topic => {
      //   return topic.key === nextTopic;
      // })[0] || {};
      const nextBasemap = nextTopicConfig.parcels;
      const nextImagery = nextTopicConfig.imagery;
      if (prevBasemap !== nextBasemap) {
        this.$store.commit('setBasemap', nextTopicConfig.parcels);
      }
      if (nextImagery) {
        this.$store.commit('setShouldShowImagery', true);
        this.$store.commit('setImagery', nextImagery);
      }
    },
    geocodeResult(nextGeocodeResult) {
      if (nextGeocodeResult._featureId) {
        this.$store.commit('setMapCenter', nextGeocodeResult.geometry.coordinates);
        this.$store.commit('setMapZoom', this.geocodeZoom);
      } else {
        this.$store.commit('setBasemap', 'pwd');
      }
    },
    picOrCycloActive(value) {
      this.$nextTick(() => {
        this.$store.state.map.map.invalidateSize();
      });
    },
    geojsonForTopic(nextGeojson) {
      let czts = this.activeTopicConfig.zoomToShape;
      let dzts = this.$data.zoomToShape;
      if (!czts || !czts.includes('geojsonForTopic')) {
        dzts.geojsonForTopic = [];
        return;
      }
      dzts.geojsonForTopic = nextGeojson;
      // console.log('exiting geojsonForTopic');
      this.checkBoundsChanges();

    },

    geojsonParcels(nextGeojson) {
      let czts = this.activeTopicConfig.zoomToShape;
      let dzts = this.$data.zoomToShape;
      if (!czts || !czts.includes('geojsonParcels')) {
        dzts.geojsonParcels = [];
        return;
      }
      dzts.geojsonParcels = nextGeojson;
      // console.log('exiting geojsonParcels');
      this.checkBoundsChanges();

    },

    markersForAddress(nextMarkers) {
      let czts = this.activeTopicConfig.zoomToShape;
      let dzts = this.$data.zoomToShape;
      if (!czts || !czts.includes('markersForAddress')) {
        dzts.markersForAddress = [];
        return;
      }
      dzts.markersForAddress = nextMarkers;
      // console.log('exiting markersForAddress')
      this.checkBoundsChanges();

    },

    // watches computed markersForTopic, adds info to data zoomToShape.markersForTopic
    // it does not update zoomToShape unless there is a change
    // because the markers computed recalculates extremely often, this is needed
    markersForTopic(nextMarkers) {
      let czts = this.activeTopicConfig.zoomToShape;
      let dzts = this.$data.zoomToShape;
      if (!czts || !czts.includes('markersForTopic')) {
        // if (!czts.includes('markersForTopic')) {
        dzts.markersForTopic = [];
        return;
      }
      dzts.markersForTopic = nextMarkers;
      // console.log('exiting markersForTopic');
      this.checkBoundsChanges();

    },

    fullScreenTopicsEnabled() {
      this.$nextTick(() => {
        this.$store.state.map.map.invalidateSize();
      });
    },
  },
  created() {
    console.log('MapPanel.vue created this.$config:', this.$config, 'process.env.VUE_APP_PUBLICPATH', process.env.VUE_APP_PUBLICPATH);
    this.createdComplete = true;
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

    // adds overlaySelectControl for cleanphls
    if (this.$config.map.overlaySelectControl) {
      if (this.$config.map.overlaySelectControl.shouldShow) {
        this.$store.commit('setShouldShowOverlaySelectControl', true);
      }
    }
  },
  methods: {
    handleSearchFormSubmit(value) {
      console.log('MapPanel.vue handleSearchFormSubmit is running');
      this.$controller.handleSearchFormSubmit(value);
    },
    checkBoundsChanges() {
      let czts = this.activeTopicConfig.zoomToShape;
      if (!czts) {
        return;
      }
      let dzts = this.$data.zoomToShape;
      // console.log('dzts:', dzts, 'czts:', czts);
      let tf = [];
      for (let shape of czts) {
        if (dzts[shape] !== false && dzts[shape].length > 0) {
          tf.push(true);
        } else {
          tf.push(false);
        }
      }
      console.log('MapPanel.vue checkBoundsChanges, dzts:', dzts, 'czts:', czts, 'tf:', tf);
      if (tf.includes(false)) {
        return;
      }
      this.setMapToBounds();

    },

    setMapToBounds() {
      // console.log('setMapToBounds is running');
      let featureArray = [];
      let czts = this.activeTopicConfig.zoomToShape;
      if (czts) {
        if (czts.includes('geojsonParcels')) {
          for (let geojsonFeature of this.geojsonParcels) {
            // featureArray.push(geoJson(geojsonFeature.geojson))
            // featureArray.push(L.geoJSON(geojsonFeature.geojson))
            featureArray.push(GeoJSON(geojsonFeature.geojson));
          }
        }
        if (czts.includes('geojsonForTopic')) {
          for (let geojsonFeature of this.geojsonForTopic) {
            // featureArray.push(geoJson(geojsonFeature.geojson))
            // featureArray.push(L.geoJSON(geojsonFeature.geojson))
            featureArray.push(GeoJSON(geojsonFeature.geojson));
          }
        }
        if (czts.includes('markersForAddress')) {
          for (let marker of this.markersForAddress) {
            featureArray.push(Lmarker(marker.latlng));
            // featureArray.push(L.marker(marker.latlng))
          }
        }
        if (czts.includes('markersForTopic')) {
          for (let marker of this.markersForTopic) {
            featureArray.push(Lmarker(marker.latlng));
            // featureArray.push(L.marker(marker.latlng))
          }
        }
        const group = new FeatureGroup(featureArray);
        // const group = new featureGroup(featureArray);
        // const group = new L.featureGroup(featureArray);
        const bounds = group.getBounds();
        this.$store.commit('setMapBounds', bounds);
      }
    },
    configForBasemap(basemap) {
      return this.$config.map.basemaps[basemap] || {};
    },
    shouldShowGeojson(key) {
      if (this.activeTopicConfig.basemap === 'pwd') {
        return true;
      }
      return key === this.activeDorParcel;

    },
    shouldShowImageOverlay(key) {
      return key === this.imageOverlay;
    },
    shouldShowFeatureLayer(key) {
      if (this.activeFeatureLayers.includes(key)) {
        return true;
      }
      return false;
    },
    handleMapClick(e) {
      // console.log('MapPanel.vue handleMapClick e:', e);
      this.$controller.handleMapClick(e);
    },

    handleMapMove(e) {
      const map = this.$store.state.map.map;

      const pictometryConfig = this.$config.pictometry || {};

      const center = map.getCenter();
      const { lat, lng } = center;
      const coords = [ lng, lat ];

      if (pictometryConfig.enabled) {
        // update state for pictometry
        this.$store.commit('setPictometryMapCenter', coords);

        const zoom = map.getZoom();
        this.$store.commit('setPictometryMapZoom', zoom);
      }

      const cyclomediaConfig = this.$config.cyclomedia || {};

      if (cyclomediaConfig.enabled) {
        // update cyclo recordings
        this.updateCyclomediaRecordings();
        this.$store.commit('setCyclomediaLatLngFromMap', [ lat, lng ]);
      }
    },
    styleForOverlayMarker(markerId, tableId) {
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

      return curStyle;
      // return curStyle.fillColor;
    },
  }, // end of methods
}; //end of export
</script>

<style scoped>
  .mb-panel-map {
    /*this allows the loading mask to fill the div*/
    position: relative;
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
