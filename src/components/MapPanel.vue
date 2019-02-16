<template>
  <div id="map-panel-container"
       :class="this.mapPanelContainerClass"
  >
    <!-- <full-screen-map-toggle-tab /> -->
    <full-screen-map-toggle-tab v-once />

    <map_ :class="{ 'mb-map-with-widget': this.$store.state.cyclomedia.active || this.$store.state.pictometry.active }"
          id="map-tag"
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

      <esri-tiled-overlay v-for="(tiledLayer, key) in this.$config.map.tiledOverlays"
                          v-if="activeTiledOverlays.includes(key)"
                          :key="key"
                          :url="tiledLayer.url"
                          :zIndex="tiledLayer.zIndex"
                          :opacity="tiledLayer.opacity"
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
                          :style_="featureLayer.style"
                          :minZoom="featureLayer.minZoom"
                          :maxZoom="featureLayer.maxZoom"
                          :zIndex="featureLayer.zIndex"
                          :markerType="featureLayer.markerType"
                          :radius="featureLayer.radius"
                          :interactive="featureLayer.interactive"
      />

      <!-- regmaps -->
      <esri-dynamic-map-layer v-for="(item, key) in this.imageOverlayItems"
                              v-if="shouldShowImageOverlay(item.properties.RECMAP)"
                              :key="key"
                              :url="'//gis.phila.gov/arcgis/rest/services/Atlas/RegMaps/MapServer'"
                              :layers="[0]"
                              :layerDefs="'0:NAME=\'g' + item.properties.RECMAP.toLowerCase() + '.tif\''"
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
      <vector-marker v-for="(marker, index) in markersForAddress"
                     :latlng="marker.latlng"
                     :key="marker.key"
                     :markerColor="marker.color"
                     :icon="marker.icon"
      />

      <!-- vector markers -->
      <vector-marker v-for="(marker, index) in markersForTopic"
                     :latlng="marker.latlng"
                     :key="marker.key"
                     :markerColor="marker.color"
                     :icon="marker.icon"
      />

      <!-- marker using a png and ablility to rotate it -->
      <png-marker v-if="this.cyclomediaActive"
                  :icon="'images/camera.png'"
                  :latlng="cycloLatlng"
                  :rotationAngle="cycloRotationAngle"
      />

      <!-- marker using custom code extending icons - https://github.com/iatkin/leaflet-svgicon -->
      <svg-view-cone-marker v-if="this.cyclomediaActive"
                            :latlng="cycloLatlng"
                            :rotationAngle="cycloRotationAngle"
                            :hFov="cycloHFov"
      />


      <!-- non-reactive geojson parcels -->
      <geojson v-for="geojsonFeature in geojsonParcels"
               v-if="shouldShowGeojson(geojsonFeature.key)"
               :geojson="geojsonFeature.geojson"
               :fillColor="geojsonFeature.fillColor"
               :color="geojsonFeature.color"
               :weight="geojsonFeature.weight"
               :opacity="geojsonFeature.opacity"
               :fillOpacity="geojsonFeature.fillOpacity"
               :key="geojsonFeature.key"
               :data="{
                 featureId: geojsonFeature.featureId,
                 tableId: geojsonFeature.tableId
               }"
       />

      <!-- non-reactive geojson features for topics -->
      <geojson v-for="geojsonFeature in geojsonForTopic"
               v-if="shouldShowGeojson(geojsonFeature.key)"
               :geojson="geojsonFeature.geojson"
               :fillColor="geojsonFeature.fillColor"
               :color="geojsonFeature.color"
               :weight="geojsonFeature.weight"
               :opacity="geojsonFeature.opacity"
               :fillOpacity="geojsonFeature.fillOpacity"
               :key="geojsonFeature.key"
               :data="{
                 featureId: geojsonFeature.featureId,
                 tableId: geojsonFeature.tableId
               }"
       />

       <!-- reactive geojson features -->
       <geojson v-for="geojsonFeature in reactiveGeojsonFeatures"
                v-if="shouldShowGeojson(geojsonFeature.key)"
                @l-mouseover="handleMarkerMouseover"
                @l-click="handleMarkerClick"
                @l-mouseout="handleMarkerMouseout"
                :geojson="geojsonFeature.geojson"
                :fillColor="geojsonFeature.fillColor"
                :color="geojsonFeature.color"
                :weight="geojsonFeature.weight"
                :opacity="geojsonFeature.opacity"
                :fillOpacity="geojsonFeature.fillOpacity"
                :key="geojsonFeature.key"
                :data="{
                  featureId: geojsonFeature.featureId,
                  tableId: geojsonFeature.tableId
                }"
        />

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
      <circle-marker v-for="circleMarker in reactiveCircleMarkers"
                     @l-mouseover="handleMarkerMouseover"
                     @l-click="handleMarkerClick"
                     @l-mouseout="handleMarkerMouseout"
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

      <control-corner :vSide="'top'"
                      :hSide="'almostleft'"
      >
      </control-corner>

      <!-- <basemap-tooltip :position="'topright'"
      /> -->

      <div v-once>
        <basemap-toggle-control v-if="shouldShowImageryToggle"
                                v-once
                                :position="'topright'"
        />
      </div>

      <div v-once>
        <basemap-select-control :position="this.basemapSelectControlPosition" />
      </div>

      <div v-once>
        <pictometry-button v-if="this.shouldShowPictometryButton"
                           v-once
                           :position="'topright'"
                           :link="'pictometry'"
                           :imgSrc="'images/pictometry.png'"
        />
      </div>

      <div v-once>
        <cyclomedia-button v-if="this.shouldShowCyclomediaButton"
                           v-once
                           :position="'topright'"
                           :link="'cyclomedia'"
                           :imgSrc="'images/cyclomedia.png'"
                           @click="handleCyclomediaButtonClick"
        />
      </div>

      <div v-once
           v-if="this.measureControlEnabled"
      >
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

      <div v-once>
        <map-address-input :position="this.addressInputPosition"
                       :placeholder="this.addressInputPlaceholder"
                       :widthFromConfig="this.addressInputWidth"
        >
        </map-address-input>
      </div>
      <map-address-candidate-list v-if="this.addressAutocompleteEnabled"
                              :position="this.addressInputPosition"
                              :widthFromConfig="this.addressInputWidth"
      />


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
  import * as L from 'leaflet';
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
  // const cyclomediaMixin = import(/* webpackChunkName: "mbmb_pvm_cyclomediaMixin" */'@cityofphiladelphia/phila-vue-mapping/src/cyclomedia/map-panel-mixin.js');
  // const pictometryMixin = import(/* webpackChunkName: "mbmb_pvm_pictometryMixin" */'@cityofphiladelphia/phila-vue-mapping/src/pictometry/map-panel-mixin.js');
  import cyclomediaMixin from '@cityofphiladelphia/phila-vue-mapping/src/cyclomedia/map-panel-mixin.js';
  import pictometryMixin from '@cityofphiladelphia/phila-vue-mapping/src/pictometry/map-panel-mixin.js';
  // const CyclomediaRecordingsClient = import(/* webpackChunkName: "mbmb_pvm_CyclomediaRecordingsClient" */'@cityofphiladelphia/phila-vue-mapping/src/cyclomedia/recordings-client.js');

  // components
  import CyclomediaRecordingsClient from '@cityofphiladelphia/phila-vue-mapping/src/cyclomedia/recordings-client.js';
  import ControlCorner from '@cityofphiladelphia/phila-vue-mapping/src/leaflet/ControlCorner.vue';
  import FullScreenMapToggleTab from '@cityofphiladelphia/phila-vue-mapping/src/components/FullScreenMapToggleTab.vue';
  import Map_ from '@cityofphiladelphia/phila-vue-mapping/src/leaflet/Map.vue';
  import LocationControl from '@cityofphiladelphia/phila-vue-mapping/src/components/LocationControl.vue';
  import BasemapToggleControl from '@cityofphiladelphia/phila-vue-mapping/src/components/BasemapToggleControl.vue';
  import BasemapSelectControl from '@cityofphiladelphia/phila-vue-mapping/src/components/BasemapSelectControl.vue';
  import PictometryButton from '@cityofphiladelphia/phila-vue-mapping/src/pictometry/Button.vue';
  import CyclomediaButton from '@cityofphiladelphia/phila-vue-mapping/src/cyclomedia/Button.vue';
  import MeasureControl from '@cityofphiladelphia/phila-vue-mapping/src/components/MeasureControl.vue';
  import LegendControl from '@cityofphiladelphia/phila-vue-mapping/src/components/LegendControl.vue';
  import MapAddressInput from '@cityofphiladelphia/phila-vue-mapping/src/components/MapAddressInput.vue';

  export default {
    name: 'MapPanel',
    mixins: [
      markersMixin,
      cyclomediaMixin,
      pictometryMixin
    ],
    components: {
      Control: () => import(/* webpackChunkName: "mbmp_pvm_Control" */'@cityofphiladelphia/phila-vue-mapping/src/leaflet/Control.vue'),
      MapAddressCandidateList: () => import(/* webpackChunkName: "mbmp_pvm_MapAddressCandidateList" */'@cityofphiladelphia/phila-vue-mapping/src/components/MapAddressCandidateList.vue'),
      EsriTiledMapLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriTiledMapLayer" */'@cityofphiladelphia/phila-vue-mapping/src/esri-leaflet/TiledMapLayer.vue'),
      EsriTiledOverlay: () => import(/* webpackChunkName: "mbmp_pvm_EsriTiledOverlay" */'@cityofphiladelphia/phila-vue-mapping/src/esri-leaflet/TiledOverlay.vue'),
      EsriDynamicMapLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriDynamicMapLayer" */'@cityofphiladelphia/phila-vue-mapping/src/esri-leaflet/DynamicMapLayer.vue'),
      EsriFeatureLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriFeatureLayer" */'@cityofphiladelphia/phila-vue-mapping/src/esri-leaflet/FeatureLayer.vue'),
      Geojson: () => import(/* webpackChunkName: "mbmp_pvm_Geojson" */'@cityofphiladelphia/phila-vue-mapping/src/leaflet/Geojson.vue'),
      CircleMarker: () => import(/* webpackChunkName: "mbmp_pvm_CircleMarker" */'@cityofphiladelphia/phila-vue-mapping/src/leaflet/CircleMarker.vue'),
      VectorMarker: () => import(/* webpackChunkName: "mbmp_pvm_VectorMarker" */'@cityofphiladelphia/phila-vue-mapping/src/components/VectorMarker.vue'),
      PngMarker: () => import(/* webpackChunkName: "mbmp_pvm_PngMarker" */'@cityofphiladelphia/phila-vue-mapping/src/components/PngMarker.vue'),
      CyclomediaRecordingCircle: () => import(/* webpackChunkName: "mbmp_pvm_CyclomediaRecordingCircle" */'@cityofphiladelphia/phila-vue-mapping/src/cyclomedia/RecordingCircle.vue'),
      SvgViewConeMarker: () => import(/* webpackChunkName: "mbmp_pvm_CyclomediaSvgViewConeMarker" */'@cityofphiladelphia/phila-vue-mapping/src/cyclomedia/SvgViewConeMarker.vue'),
      BasemapTooltip: () => import(/* webpackChunkName: "mbmp_pvm_BasemapTooltip" */'@cityofphiladelphia/phila-vue-mapping/src/components/BasemapTooltip.vue'),
      ControlCorner,
      FullScreenMapToggleTab,
      Map_,
      LocationControl,
      BasemapToggleControl,
      BasemapSelectControl,
      PictometryButton,
      CyclomediaButton,
      MeasureControl,
      LegendControl,
      MapAddressInput,
    },
    data() {
      const data = {
        zoomToShape: {
          geojsonParcels: [],
          geojsonForTopic: [],
          markersForAddress: [],
          markersForTopic: [],
        },
      };
      return data;
    },
    beforeCreate() {
      console.log('MapPanel.vue beforeCreate this.$config:', this.$config);
    },
    created() {
      console.log('MapPanel.vue created this.$config:', this.$config);
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
    computed: {
      // shouldShowAddressInput() {
      //   if (this.$config.addressInputLocation == 'map') {
      //     return true;
      //   } else {
      //     return false;
      //   }
      // },
      addressAutocompleteEnabled() {
        // TODO tidy up the code
        if (this.$config.addressInput) {
          if (this.$config.addressInput.autocompleteEnabled === true) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      addressInputPosition() {
        if (this.isMobileOrTablet) {
          return 'topleft'
        } else {
          return 'topalmostleft'
        }
      },
      addressInputWidth() {
        if (this.$config.addressInput) {
          return this.$config.addressInput.mapWidth;
        } else {
          return 415;
        }
      },
      addressInputPlaceholder() {
        if (this.$config.addressInput) {
          return this.$config.addressInput.placeholder;
        } else {
          return null
        }
      },
      basemapSelectControlPosition() {
        if (this.isMobileOrTablet) {
          return 'topright'
        } else {
          return 'topalmostright'
        }
      },
      shouldShowAddressCandidateList() {
        return this.$store.state.shouldShowAddressCandidateList;
      },
      measureControlEnabled() {
        if (this.$config.measureControlEnabled === false) {
          return false;
        } else {
          return true;
        }
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
          return 'medium-24 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map'
        } else if (this.fullScreenMapOnly) {
          return 'medium-1 small-order-1 small-1 medium-order-2 mb-panel mb-panel-map'
        } else if (this.fullScreenTopicsEnabled) {
          return 'medium-1 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map'
        } else {
          return 'medium-12 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map'
        }
      },
      cycloLatlng() {
        if (this.$store.state.cyclomedia.orientation.xyz !== null) {
          const xyz = this.$store.state.cyclomedia.orientation.xyz;
          return [xyz[1], xyz[0]];
        } else {
          const center = this.$config.map.center;
          return center;
        }
      },
      cycloRotationAngle() {
        return this.$store.state.cyclomedia.orientation.yaw * (180/3.14159265359);
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
        } else {
          return false;
        }
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
        } else {
          return [];
        }
      },
      imageOverlayInfo() {
        // console.log('config:', this.$config);
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
      activeTiledOverlays() {
        if (!this.activeTopicConfig || !this.activeTopicConfig.tiledOverlays) {
          return [];
        } else {
          return this.activeTopicConfig.tiledOverlays;
        }
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
        if (this.$config.map.imagery) {
          return this.hasImageryBasemaps && this.$config.map.imagery.enabled;
        } else {
          return this.hasImageryBasemaps;
        }
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
        console.log('computed activeTopicConfig is running, this.$config:', this.$config);
        const key = this.activeTopic;
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
        } else {
          return false;
        }
      },
      mapBounds() {
        // TODO calculate map bounds based on leaflet markers above
      },
      boundsBasedOnShape() {
        return this.$store.state.map.boundsBasedOnShape;
      },
      isGeocoding() {
        return this.$store.state.geocode.status === 'waiting';
      },
    },
    watch: {
      picOrCycloActive(value) {
        this.$nextTick(() => {
          this.$store.state.map.map.invalidateSize();
        })
      },
      geojsonForTopic(nextGeojson) {
        let czts = this.activeTopicConfig.zoomToShape;
        let dzts = this.$data.zoomToShape;
        if (!czts || !czts.includes('geojsonForTopic')) {
          dzts.geojsonForTopic = [];
          return;
        } else {
          dzts.geojsonForTopic = nextGeojson;
          // console.log('exiting geojsonForTopic');
          this.checkBoundsChanges();
        }
      },

      geojsonParcels(nextGeojson) {
        let czts = this.activeTopicConfig.zoomToShape;
        let dzts = this.$data.zoomToShape;
        if (!czts || !czts.includes('geojsonParcels')) {
          dzts.geojsonParcels = [];
          return;
        } else {
          dzts.geojsonParcels = nextGeojson;
          // console.log('exiting geojsonParcels');
          this.checkBoundsChanges();
        }
      },

      markersForAddress(nextMarkers) {
        let czts = this.activeTopicConfig.zoomToShape;
        let dzts = this.$data.zoomToShape;
        if (!czts || !czts.includes('markersForAddress')) {
          dzts.markersForAddress = [];
          return;
        } else {
          dzts.markersForAddress = nextMarkers;
          // console.log('exiting markersForAddress')
          this.checkBoundsChanges();
        }
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
        } else {
          dzts.markersForTopic = nextMarkers;
          // console.log('exiting markersForTopic');
          this.checkBoundsChanges();
        }
      },

      fullScreenTopicsEnabled() {
        this.$nextTick(() => {
          this.$store.state.map.map.invalidateSize();
        })
      },
    },
    methods: {
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
        // console.log('MapPanel.vue checkBoundsChanges, tf:', tf);
        if (tf.includes(false)) {
          return;
        } else {
          this.setMapToBounds();
        }
      },

      setMapToBounds() {
        // console.log('setMapToBounds is running');
        let featureArray = []
        let czts = this.activeTopicConfig.zoomToShape;
        if (czts) {
          if (czts.includes('geojsonParcels')) {
            for (let geojsonFeature of this.geojsonParcels) {
              // featureArray.push(geoJson(geojsonFeature.geojson))
              // featureArray.push(L.geoJSON(geojsonFeature.geojson))
              featureArray.push(GeoJSON(geojsonFeature.geojson))
            }
          }
          if (czts.includes('geojsonForTopic')) {
            for (let geojsonFeature of this.geojsonForTopic) {
              // featureArray.push(geoJson(geojsonFeature.geojson))
              // featureArray.push(L.geoJSON(geojsonFeature.geojson))
              featureArray.push(GeoJSON(geojsonFeature.geojson))
            }
          }
          if (czts.includes('markersForAddress')) {
            for (let marker of this.markersForAddress) {
              featureArray.push(Lmarker(marker.latlng))
              // featureArray.push(L.marker(marker.latlng))
            }
          }
          if (czts.includes('markersForTopic')) {
            for (let marker of this.markersForTopic) {
              featureArray.push(Lmarker(marker.latlng))
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
        } else {
          return key === this.activeDorParcel;
        }
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
        // latLng = L.latLng(e.lat, e.lng)
        this.$controller.handleMapClick(e);
      },

      handleMapMove(e) {
        const map = this.$store.state.map.map;

        const pictometryConfig = this.$config.pictometry || {};

        const center = map.getCenter();
        const { lat, lng } = center;
        const coords = [lng, lat];

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
          this.$store.commit('setCyclomediaLatLngFromMap', [lat, lng]);
        }
      },
      fillColorForOverlayMarker(markerId, tableId) {
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
