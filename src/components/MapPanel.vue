<template>
  <div
    id="map-panel-container"
    :class="mapPanelContainerClass"
  >
    <!-- <full-screen-map-toggle-tab /> -->
    <full-screen-map-toggle-tab v-once />

    <!-- :class="{ 'mb-map-with-widget': this.$store.state.cyclomedia.active || this.$store.state.pictometry.active }" -->
    <map_
      v-if="mapType === 'leaflet'"
      id="map-tag"
      :center="this.$store.state.map.center"
      :zoom="this.$store.state.map.zoom"
      attribution-position="bottomright"
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
        v-if="cyclomediaInitializationComplete && cyclomediaActive"
        :icon="sitePath + 'images/camera.png'"
        :latlng="cycloLatlng"
        :rotation-angle="cycloRotationAngle"
      />

      <!-- marker using custom code extending icons - https://github.com/iatkin/leaflet-svgicon -->
      <svg-view-cone-marker
        v-if="cyclomediaInitializationComplete && cyclomediaActive"
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
          @handle-pictometry-button-click="handlePictometryButtonClick"
        />
      </div>

      <div v-once>
        <cyclomedia-button
          v-if="shouldShowCyclomediaButton"
          v-once
          :position="'topright'"
          :link="'cyclomedia'"
          :img-src="sitePath + 'images/cyclomedia.png'"
          @handle-cyclomedia-button-click="handleCyclomediaButtonClick"
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

    <MglMap
      v-if="mapType === 'mapbox'"
      :access-token="accessToken"
      :map-style.sync="$config.mbStyle"
      :bounds="boundsProp"
      :center="$store.state.map.center"
      :zoom="$store.state.map.zoom"
      :active-topic-config="activeTopicConfig"
      @moveend="handleMapMove"
      @click="handleMapClick"
      @load="onMapLoaded"
    >
      <MglRasterLayer
        v-for="(basemapSource, key) in basemapSources"
        v-if="shouldShowRasterLayer(key) && activeBasemap === key"
        :key="key"
        :source-id="activeBasemap"
        :layer-id="activeBasemap"
        :layer="basemapSource.layer"
        :source="basemapSource.source"
        :before="basemapsBefore"
      />
      <!-- :before="firstOverlay" -->

      <MglRasterLayer
        v-for="(basemapLabelSource, key) in basemapLabelSources"
        v-if="shouldShowRasterLayer(key) && tiledLayers.includes(key)"
        :key="key"
        :source-id="key"
        :layer-id="key"
        :layer="basemapLabelSource.layer"
        :source="basemapLabelSource.source"
        :before="basemapsBefore"
      />
      <!-- :before="firstOverlay" -->
      <!-- :initial-opacity="50" -->

      <MglRasterLayer
        v-for="(overlaySource, key) in overlaySources"
        v-if="activeDynamicMaps.includes(key)"
        :key="key"
        :source-id="key"
        :layer-id="key"
        :layer="overlaySource.layer"
        :source="overlaySource.source"
        :initial-opacity="100"
        :before="basemapsBefore"
      />
      <!-- :before="'geojsonParcelFill'" -->

      <MglRasterLayer
        v-for="item in imageOverlayItems"
        v-if="shouldShowImageOverlay(item.data.properties.RECMAP)"
        :key="item.data.properties.RECMAP"
        :source-id="item.data.properties.RECMAP"
        :layer-id="item.data.properties.RECMAP"
        :layer="item.source.layer"
        :source="item.source.source"
        :initial-opacity="50"
        :before="basemapsBefore"
      />
      <!-- :before="'geojsonParcelFill'" -->

      <MglGeojsonLayer
        v-if="activeTopicConfig.parcels === 'dor'"
        key="'dorParcelFill'"
        :source-id="'geojsonParcel'"
        :source="geojsonParcelSource"
        :layer-id="'geojsonParcelFill'"
        :layer="geojsonParcelFillLayer"
        :clear-source="false"
      />

      <MglGeojsonLayer
        v-if="activeTopicConfig.parcels === 'dor'"
        key="'dorParcelLine'"
        :source-id="'geojsonParcel'"
        :source="geojsonParcelSource"
        :layer-id="'geojsonParcelLine'"
        :layer="geojsonParcelLineLayer"
        :clear-source="true"
      />

      <MglGeojsonLayer
        v-if="geojsonForTopicBoolean"
        key="'geojsonForTopicFill'"
        :source-id="'geojsonForTopic'"
        :source="geojsonForTopicSource"
        :layer-id="'geojsonForTopicFill'"
        :layer="geojsonForTopicFillLayer"
        :clear-source="false"
        :replace-source="true"
        :replace="true"
      />

      <MglGeojsonLayer
        v-if="geojsonForTopicBoolean"
        key="'geojsonForTopicLine'"
        :source-id="'geojsonForTopic'"
        :source="geojsonForTopicSource"
        :layer-id="'geojsonForTopicLine'"
        :layer="geojsonForTopicLineLayer"
        :clear-source="true"
        :replace-source="true"
        :replace="true"
      />

      <!-- :source-id="layer.source" -->
      <MglGeojsonLayer
        v-for="labels of draw.labelLayers"
        :key="labels.id"
        :source="labels.source"
        :source-id="labels.id"
        :layer="labels.layer"
        :layer-id="labels.id"
      />
      <!-- :layer-id="layer.id" -->

      <MglGeojsonLayer
        v-if="cyclomediaActive"
        :source-id="'cameraPoint'"
        :source="geojsonCameraSource"
        :layer-id="'cameraPoints'"
        :layer="geojsonCameraLayer"
        :icon="sitePath + 'images/camera.png'"
      />

      <MglGeojsonLayer
        v-if="cyclomediaActive"
        :source-id="'viewcone'"
        :source="geojsonViewconeSource"
        :layer-id="'viewcones'"
        :layer="geojsonViewconeLayer"
      />

      <!-- <MglTriangleMarker
        v-if="cyclomediaActive"
        :coordinates="[cycloLatlng[1], cycloLatlng[0]]"
        :size="14"
        :rotation-angle="cycloRotationAngle"
        :h-fov="cycloHFov"
        :weight="1"
      /> -->

      <MglFontAwesomeMarker
        v-for="(marker) in markersForTopic"
        :key="marker.markerType"
        :coordinates="[marker.latlng[1], marker.latlng[0]]"
        :size="marker.icon.size"
        :icon="marker.icon"
        :marker-id="marker.markerType"
        :color="marker.color"
        :anchor="'bottom'"
        :offset="marker.offset"
      />
      <!-- @click="handleMarkerClick" -->

      <mapbox-address-input
        :placeholder="addressInputPlaceholder"
        :width-from-config="addressInputWidth"
        @handle-search-form-submit="handleSearchFormSubmit"
      />

      <MglCircleMarker
        v-for="recording in cyclomediaRecordings"
        v-if="!fullScreenMapEnabled"
        :key="recording.imageId"
        :coordinates="[recording.lng, recording.lat]"
        :image-id="recording.imageId"
        :size="14"
        :fill-color="'#3388ff'"
        :color="'black'"
        :weight="1"
        :opacity="0.5"
        @click="handleCyclomediaRecordingClick"
      />

      <MglCircleMarker
        v-for="marker in reactiveCircleMarkers"
        :key="marker._featureId"
        :coordinates="[marker.latlng[1], marker.latlng[0]]"
        :data="{
          featureId: marker.featureId,
          tableId: marker.tableId
        }"
        :size="marker.size"
        :fill-color="marker.color"
        :weight="marker.weight"
        :opacity="1"
        :anchor="'bottom'"
        @mouseenter="handleMarkerMouseover"
        @click="handleMarkerClick"
        @mouseleave="handleMarkerMouseout"

      />

      <MglMarker
        v-for="(marker) in markersForAddress"
        :key="marker.key"
        :coordinates="[marker.latlng[1], marker.latlng[0]]"
        :color="marker.color"
        :icon="marker.icon"
        :anchor="'bottom'"
      />

      <MglDistanceMeasureControl
        :position="'bottom-left'"
        :label-layers="draw.labelLayers"
        :current-shape="draw.currentShape"
        :current-area="draw.currentArea"
        @drawCreate="getDrawDistances"
        @drawDelete="deleteDrawDistances"
        @drawUpdate="getDrawDistances"
        @drawSelectionChange="handleDrawSelectionChange"
        @drawModeChange="handleDrawModeChange"
        @drawCancel="handleDrawCancel"
        @drawFinish="handleDrawFinish"
      />
      <!-- @drawUndo="handleDrawUndo" -->

      <MglButtonControl
        :button-id="'buttonId-01'"
        :button-class="'right top-button-1'"
        :image-link="basemapImageLink"
        :image-align="'top'"
        @click="handleBasemapToggleClick"
      />

      <MglButtonControl
        :button-id="'buttonId-02'"
        :button-class="pictometryActive ? 'right top-button-2 active' : 'right top-button-2 inactive'"
        :image-link="sitePath + 'images/pictometry.png'"
        @click="handlePictometryButtonClick"
      />

      <MglButtonControl
        :button-id="'buttonId-03'"
        :button-class="cyclomediaActive ? 'right top-button-3 active' : 'right top-button-3 inactive'"
        :image-link="sitePath + 'images/cyclomedia.png'"
        @click="handleCyclomediaButtonClick"
      />

      <overlay-legend
        v-for="legendControl in Object.keys(legendControls)"
        v-if="legendControls[legendControl].options.topics.includes(activeTopic)"
        :key="legendControl"
        :options="legendControls[legendControl].options"
        :items="legendControls[legendControl].data"
      >
      <!-- :position="'bottomleft'" -->
      </overlay-legend>

      <mapbox-basemap-select-control />

      <MglNavigationControl position="bottom-right" />
      <MglGeolocateControl
        position="bottom-right"
        :position-options="geolocationPositionOptions"
      />

    </MglMap>

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

import destination from '@turf/destination';
import distance from '@turf/distance';
import midpoint from '@turf/midpoint';
import area from '@turf/area';
import { polygon } from '@turf/helpers';

import generateUniqueId from '../util/unique-id';

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
import cyclomediaMixin from '@phila/vue-mapping/src/cyclomedia/map-panel-mixin-update.js';
import pictometryMixin from '@phila/vue-mapping/src/pictometry/map-panel-mixin.js';
// const CyclomediaRecordingsClient = import(/* webpackChunkName: "mbmb_pvm_CyclomediaRecordingsClient" */'@phila/vue-mapping/src/cyclomedia/recordings-client.js');

// components
import CyclomediaRecordingsClient from '@phila/vue-mapping/src/cyclomedia/recordings-client.js';
import ControlCorner from '@phila/vue-mapping/src/leaflet/ControlCorner.vue';
import FullScreenMapToggleTab from '@phila/vue-mapping/src/components/FullScreenMapToggleTab.vue';
import Map_ from '@phila/vue-mapping/src/leaflet/Map.vue';
import LocationControl from '@phila/vue-mapping/src/components/LocationControl.vue';
import BasemapToggleControl from '@phila/vue-mapping/src/components/BasemapToggleControl.vue';
import BasemapSelectControl from '@phila/vue-mapping/src/components/BasemapSelectControl.vue';
import OverlaySelectControl from '@phila/vue-mapping/src/components/OverlaySelectControl.vue';
import PictometryButton from '@phila/vue-mapping/src/pictometry/Button.vue';
import CyclomediaButton from '@phila/vue-mapping/src/cyclomedia/Button.vue';
import MeasureControl from '@phila/vue-mapping/src/components/MeasureControl.vue';
import LegendControl from '@phila/vue-mapping/src/components/LegendControl.vue';
import MapAddressInput from '@phila/vue-mapping/src/components/MapAddressInput.vue';

export default {
  name: 'MapPanel',
  components: {
    MapAddressCandidateList: () => import(/* webpackChunkName: "mbmp_pvm_MapAddressCandidateList" */'@phila/vue-mapping/src/components/MapAddressCandidateList.vue'),
    EsriTiledMapLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriTiledMapLayer" */'@phila/vue-mapping/src/esri-leaflet/TiledMapLayer.vue'),
    EsriTiledOverlay: () => import(/* webpackChunkName: "mbmp_pvm_EsriTiledOverlay" */'@phila/vue-mapping/src/esri-leaflet/TiledOverlay.vue'),
    EsriDynamicMapLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriDynamicMapLayer" */'@phila/vue-mapping/src/esri-leaflet/DynamicMapLayer.vue'),
    EsriFeatureLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriFeatureLayer" */'@phila/vue-mapping/src/esri-leaflet/FeatureLayer.vue'),
    Geojson: () => import(/* webpackChunkName: "mbmp_pvm_Geojson" */'@phila/vue-mapping/src/leaflet/Geojson.vue'),
    CircleMarker: () => import(/* webpackChunkName: "mbmp_pvm_CircleMarker" */'@phila/vue-mapping/src/leaflet/CircleMarker.vue'),
    VectorMarker: () => import(/* webpackChunkName: "mbmp_pvm_VectorMarker" */'@phila/vue-mapping/src/components/VectorMarker.vue'),
    PngMarker: () => import(/* webpackChunkName: "mbmp_pvm_PngMarker" */'@phila/vue-mapping/src/components/PngMarker.vue'),
    CyclomediaRecordingCircle: () => import(/* webpackChunkName: "mbmp_pvm_CyclomediaRecordingCircle" */'@phila/vue-mapping/src/cyclomedia/RecordingCircle.vue'),
    SvgViewConeMarker: () => import(/* webpackChunkName: "mbmp_pvm_CyclomediaSvgViewConeMarker" */'@phila/vue-mapping/src/cyclomedia/SvgViewConeMarker.vue'),
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
    // Control: () => import(/* webpackChunkName: "mbmp_pvm_Control" */'@phila/vue-mapping/src/leaflet/Control.vue'),
    Polyline_: () => import(/* webpackChunkName: "mbmp_pvm_Geojson" */'@phila/vue-mapping/src/leaflet/Polyline.vue'),
    // BasemapTooltip: () => import(/* webpackChunkName: "mbmp_pvm_BasemapTooltip" */'@phila/vue-mapping/src/components/BasemapTooltip.vue'),
    MglMap: () => import(/* webpackChunkName: "pvm_MglMap" */'@phila/vue-mapping/src/mapbox/map/GlMap.vue'),
    MglMarker: () => import(/* webpackChunkName: "pvm_MglMarker" */'@phila/vue-mapping/src/mapbox/UI/Marker.vue'),
    MglIcon: () => import(/* webpackChunkName: "mbmp_pvm_MglIcon" */'@phila/vue-mapping/src/mapbox/UI/Icon.vue'),
    MglCircleMarker: () => import(/* webpackChunkName: "pvm_MglCircleMarker" */'@phila/vue-mapping/src/mapbox/UI/CircleMarker.vue'),
    MglTriangleMarker: () => import(/* webpackChunkName: "pvm_MglTriangleMarker" */'@phila/vue-mapping/src/mapbox/UI/TriangleMarker.vue'),
    MglNavigationControl: () => import(/* webpackChunkName: "pvm_MglNavigationControl" */'@phila/vue-mapping/src/mapbox/UI/controls/NavigationControl'),
    MglGeolocateControl: () => import(/* webpackChunkName: "pvm_MglGeolocateControl" */'@phila/vue-mapping/src/mapbox/UI/controls/GeolocateControl'),
    MglDistanceMeasureControl: () => import(/* webpackChunkName: "pvm_MglDrawDistanceMeasureControl" */'@phila/vue-mapping/src/mapbox/UI/controls/DistanceMeasureControl.vue'),
    MglRasterLayer: () => import(/* webpackChunkName: "pvm_MglRasterLayer" */'@phila/vue-mapping/src/mapbox/layer/RasterLayer.vue'),
    MglButtonControl: () => import(/* webpackChunkName: "pvm_MglButtonControl" */'@phila/vue-mapping/src/mapbox/UI/controls/ButtonControl.vue'),
    MglControlContainer: () => import(/* webpackChunkName: "pvm_MglControlContainer" */'@phila/vue-mapping/src/mapbox/UI/controls/ControlContainer.vue'),
    MglImageLayer: () => import(/* webpackChunkName: "pvm_MglImageLayer" */'@phila/vue-mapping/src/mapbox/layer/ImageLayer'),
    MglVectorLayer: () => import(/* webpackChunkName: "pvm_MglVectorLayer" */'@phila/vue-mapping/src/mapbox/layer/VectorLayer'),
    MbIcon: () => import(/* webpackChunkName: "pvm_MbIcon" */'@phila/vue-mapping/src/mapbox/UI/MbIcon'),
    MbMeasureTool: () => import(/* webpackChunkName: "pvm_MbMeasureTool" */'@phila/vue-mapping/src/mapbox/MbMeasureTool'),
    MglGeojsonLayer: () => import(/* webpackChunkName: "pvm_MglGeojsonLayer" */'@phila/vue-mapping/src/mapbox/layer/GeojsonLayer'),
    MglPopup: () => import(/* webpackChunkName: "pvm_MglPopup" */'@phila/vue-mapping/src/mapbox/UI/Popup'),
    OverlayLegend: () => import(/* webpackChunkName: "pvm_OverlayLegend" */'@phila/vue-mapping/src/mapbox/OverlayLegend'),
    MapboxAddressInput: () => import(/* webpackChunkName: "pvm_MapboxAddressInput" */'@phila/vue-mapping/src/mapbox/MapboxAddressInput'),
    MapboxBasemapSelectControl: () => import(/* webpackChunkName: "pvm_MapboxBasemapSelectControl" */'@phila/vue-mapping/src/mapbox/UI/controls/BasemapSelectControl'),
    MglFontAwesomeMarker: () => import(/* webpackChunkName: "pvm_MglFontAwesomeMarker" */'@phila/vue-mapping/src/mapbox/UI/FontAwesomeMarker.vue'),

  },
  mixins: [
    markersMixin,
    cyclomediaMixin,
    pictometryMixin,
  ],
  data() {
    const data = {
      createdComplete: false,
      geolocationPositionOptions: {
        enableHighAccuracy: true,
        timeout: 6000,
      },
      draw: {
        mode: null,
        selection: null,
        currentShape: null,
        labelLayers: [],
        currentArea: null,
      },
      zoomToShape: {
        geojsonParcels: [],
        geojsonForTopic: [],
        markersForAddress: [],
        markersForTopic: [],
      },
      watchedZoom: null,
      accessToken: process.env.VUE_APP_MAPBOX_ACCESSTOKEN,
      geojsonCameraSource: {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [],
          },
        },
      },
      geojsonCameraLayer: {
        'id': 'cameraPoints',
        'type': 'symbol',
        'source': 'cameraPoint',
        'layout': {
          'icon-image': 'cameraMarker',
          'icon-size': 0.09,
          // 'icon-size': 0.13,
          'icon-rotate': 0,
          'icon-rotation-alignment': 'map',
        },
      },
      geojsonViewconeSource: {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [[]],
          },
        },
      },
      geojsonViewconeLayer: {
        'id': 'viewcones',
        'type': 'fill',
        'source': 'viewcone',
        'layout': {},
        'paint': {
          'fill-color': 'rgb(0,102,255)',
          'fill-opacity': 0.2,
        },
      },
      geojsonParcelSource: {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [],
          },
        },
      },
      geojsonParcelFillLayer: {
        'id': 'geojsonParcelFill',
        'type': 'fill',
        // 'source': 'geojsonParcel',
        'layout': {},
        'paint': {
          'fill-color': 'blue',
          // 'fill-color': 'rgb(0,102,255)',
          'fill-opacity': 0.3,
        },
      },
      geojsonParcelLineLayer: {
        'id': 'geojsonParcelLine',
        'type': 'line',
        // 'source': 'geojsonParcel',
        'layout': {},
        'paint': {
          'line-color': 'blue',
          'line-width': 2,
        },
      },
      geojsonForTopicBoolean: false,
      geojsonForTopicSource: {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [],
          },
        },
      },
      geojsonForTopicFillLayer: {
        'id': 'geojsonForTopicFill',
        'type': 'fill',
        'source': 'geojsonForTopic',
        'layout': {},
        'paint': {
          // 'fill-color': 'rgb(0,102,255)',
          'fill-color': '#9e9ac8',
          'fill-opacity': 0.4,
          'fill-outline-color': 'rgb(0,102,255)',
        },
      },
      geojsonForTopicLineLayer: {
        'id': 'geojsonForTopicLine',
        'type': 'line',
        'source': 'geojsonForTopic',
        'layout': {},
        'paint': {
          'line-color': '#9e9ac8',
          'line-width': 2,
        },
      },
      geojsonReactiveSource: {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [],
          },
        },
      },
      geojsonReactiveLayer: {
        'id': 'geojsonReactives',
        'type': 'circle',
        'source': 'geojsonReactive',
        'layout': {},
        'paint': {
          'circle-radius': 10,
          'circle-color': '#5b94c6',
          'circle-opacity': 0.6,
        },
      },
      geojsonCycloCircleSource: {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
          },
        },
      },
      geojsonCycloCircleLayer: {
        'id': 'circle500',
        'type': 'circle',
        'source': 'source_circle_500',
        'layout': {},
        'paint': {
          'circle-radius': 10,
          'circle-color': '#5b94c6',
          'circle-opacity': 0.6,
        },
      },
    };
    return data;
  },
  computed: {
    basemapsBefore() {
      // let value = 'geojsonParcelFill';
      let value = [ 'gl-draw-polygon-fill-inactive.cold', 'geojsonParcelFill', 'geojsonForTopicFill' ];
      if (this.imageOverlay != null) {
        value.push(this.imageOverlay);
      } else if (this.activeTopicConfig.dynamicMapLayers && this.activeTopicConfig.dynamicMapLayers.length) {
        value.push(this.activeTopicConfig.dynamicMapLayers[this.activeTopicConfig.dynamicMapLayers.length-1]);
      } //else if (this.activeTopicConfig.geojsonForTopic) {
      //   value = 'geojsonForTopicFill';
      // }
      return value;
    },
    boundsProp() {
      let bounds = this.$store.state.map.bounds;
      // console.log('boundsProps, bounds:', bounds);
      let finalBounds;

      if (this.mapType === 'leaflet') {
        finalBounds = bounds;
      } else {
        if (bounds._northEast && bounds._northEast.lat != null) {
          finalBounds = [[ bounds._southWest.lng, bounds._southWest.lat ], [ bounds._northEast.lng, bounds._northEast.lat ]];
        } else if (bounds._northEast && bounds._northEast.lat == null) {
          // finalBounds = [[ -75.0936906502695, 39.999379013777684 ], [ -75.23325134973207, 39.9072659724458 ]];
        } else {
          finalBounds = bounds;
        }
      }
      return finalBounds;
    },

    basemapImageLink() {
      if (this.activeBasemap === 'pwd' || this.activeBasemap === 'dor') {
        return 'images/imagery_small.png';
      } else {
        return 'images/basemap_small.png';
      }
    },
    queriedLayerSources() {
      return this.$config.queriedLayerSources;
    },
    basemapSources() {
      return this.$config.map.basemapSources;
    },
    basemapLabelSources() {
      return this.$config.map.basemapLabelSources;
    },
    overlaySources() {
      return this.$config.map.overlaySources;
    },
    mapType() {
      return this.$store.state.map.type;
    },
    cameraOverlay() {
      if (this.cyclomediaActive) {
        return 'cameraPoints';
      } else {
        return null;
      }
    },
    firstOverlay() {
      // console.log('firstOverlay computed is running');
      let map = this.$store.map;
      let overlay;
      if (this.imageOverlay !== null) {
        let imageOverlay = this.imageOverlay;
        // console.log('firstOverlay computed, if imageOverlay, this.imageOverlay:', this.imageOverlay, 'typeof(this.imageOverlay):', typeof(this.imageOverlay));
        if (map) {
          // console.log('firstOverlay computed, if imageOverlay, if map');
          // let overlays;
          let overlays = map.getStyle().layers.filter(function(layer) {
            // console.log('in filter, layer.id:', layer.id, 'imageOverlay:', imageOverlay);
            // console.log('firstOverlay computed, if imageOverlay, layer.id:', layer.id, 'this.imageOverlay:', this.imageOverlay);
            return layer.id === imageOverlay;//[0].id;
          });
          // console.log('still going, overlays:', overlays);
          if (overlays.length) {
            overlay = overlays[0].id;
            // console.log('firstOverlay computed, overlay:', overlay);
          } else if (this.cyclomediaActive) {
            overlay = 'cameraPoints';
          } else {
            overlay = 'geojsonParcels';
          }
        }
      } else if (this.$config.map.overlaySources) {
        let overlaySources = Object.keys(this.$config.map.overlaySources);
        if (map) {
          // console.log('firstOverlay computed, if overlaySources, map.getStyle().layers:', map.getStyle().layers);
          let overlays = map.getStyle().layers.filter(function(layer) {
            // console.log('firstOverlay computed, layer.id:', layer.id, 'overlaySources:', overlaySources);
            return overlaySources.includes(layer.id);//[0].id;
          });
          if (overlays.length) {
            overlay = overlays[0].id;
            // console.log('firstOverlay computed, overlay:', overlay);
          } else if (this.cyclomediaActive) {
            overlay = 'cameraPoints';
          } else {
            overlay = 'geojsonParcels';
          }
        }
      } else if (this.cyclomediaActive) {
        overlay = 'cameraPoints';
      } else {
        overlay = 'geojsonParcels';
      }
      // console.log('firstOverlay computed at end, overlay:', overlay);
      return overlay;
    },

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
      // } else if (this.fullScreenMapOnly) {
      //   return 'medium-1 small-order-1 small-1 medium-order-2 mb-panel mb-panel-map';
      } else if (this.fullScreenTopicsEnabled) {
        return 'medium-1 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map';
      }
      return 'medium-12 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map';

    },
    cycloLatlng() {
      let value;
      if (this.$store.state.cyclomedia.orientation.xyz !== null) {
        const xyz = this.$store.state.cyclomedia.orientation.xyz;
        value = [ xyz[1], xyz[0] ];
      } else {
        // console.log('this.$config:', this.$config);
        if (this.$config) {
          value = this.$config.map.center;
        }
      }
      return value;
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
      return this.$config.cyclomedia.enabled;// && !this.isMobileOrTablet;
    },
    shouldShowPictometryButton() {
      return this.$config.pictometry.enabled;// && !this.isMobileOrTablet;
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
        console.log('in imageOverlayItems computed, overlayGroup:', overlayGroup);
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
      let basemap;
      if (shouldShowBasemapSelectControl) {
        basemap = this.$store.state.map.imagery;
      } else {
        const defaultBasemap = this.$config.map.defaultBasemap;
        basemap = this.$store.state.map.basemap || defaultBasemap;
      }
      // console.log('computing activeBasemap, basemap:', basemap);
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
      // return this.$store.state.parcels.dor;
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
      return 18;
    },
  },
  watch: {
    activeDorParcel(nextActiveDorParcel) {
      // console.log('watch activeDorParcel is running, nextActiveDorParcel:', nextActiveDorParcel, 'this.$store.state.parcels.dor.data:', this.$store.state.parcels.dor.data);
      let nextGeojson = this.$store.state.parcels.dor.data.filter(function(item) {
        // console.log('in filter, item:', item, 'item.id:', item.id);
        return item.id === nextActiveDorParcel;
      });
      // console.log('watch activeDorParcel is running, nextActiveDorParcel:', nextActiveDorParcel, 'nextGeojson:', nextGeojson);
      if (this.$store.map) {
        // console.log('watch activeDorParcel is running, map.getStyle():', this.$store.map.getStyle(), 'map.getStyle().layers:', this.$store.map.getStyle().layers, 'nextGeojson:', nextGeojson);
      }
      if (nextGeojson[0]) {
        // console.log('watch geojsonParcels is running, nextGeojson:', nextGeojson, 'nextGeojson[0].geojson:', nextGeojson[0].geojson);
        this.$data.geojsonParcelSource.data.geometry.coordinates = nextGeojson[0].geometry.coordinates;
      } else {
        this.$data.geojsonParcelSource.data.geometry.coordinates = [];
      }
    },
    watchedZoom(nextWatchedZoom) {
      if (this.cyclomediaActive) {
        this.handleCycloChanges();
      }
      let map = this.$store.map;
      if (map) {
        this.$store.map.setZoom(nextWatchedZoom);
      }
    },
    cycloLatlng(nextCycloLatlng) {
      console.log('watch cycloLatlng, nextCycloLatlng:', nextCycloLatlng, 'this.$data.geojsonCameraSource:', this.$data.geojsonCameraSource);
      this.$data.geojsonCameraSource.data.geometry.coordinates = [ nextCycloLatlng[1], nextCycloLatlng[0] ];
      this.handleCycloChanges();
      // console.log('watch cycloLatlng end');
    },
    cycloRotationAngle(nextCycloRotationAngle) {
      // console.log('watch cycloRotationAngle is firing, nextCycloRotationAngle:', nextCycloRotationAngle);
      this.$data.geojsonCameraLayer.layout['icon-rotate'] = nextCycloRotationAngle;
      this.handleCycloChanges();
    },
    cycloHFov(nextCycloHFov) {
      // console.log('watch cycloHFov is running, nextCycloHFov:', nextCycloHFov);
      this.handleCycloChanges();
    },
    activeTopicConfig(nextTopicConfig) {
      if (this.$store.map) {
        console.log('watch activeTopicConfig is running, nextTopicConfig:', nextTopicConfig, 'map.getStyle():', this.$store.map.getStyle(), 'map.getStyle().layers:', this.$store.map.getStyle().layers, 'nextTopicConfig:', nextTopicConfig);
        // this.$store.map.resize();
      }
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
      this.$store.commit('setImageOverlay', null);
    },
    geocodeResult(nextGeocodeResult) {
      console.log('watch geocodeResult is firing, nextGeocodeResult:', nextGeocodeResult, 'this.geocodeZoom:', this.geocodeZoom);
      if (nextGeocodeResult._featureId) {
        console.log('watch geocodeResult if is running');
        this.$store.commit('setMapCenter', nextGeocodeResult.geometry.coordinates);
        this.$store.commit('setMapZoom', this.geocodeZoom);
        this.$data.watchedZoom = this.geocodeZoom;
      } //else {
      //   console.log('watch geocodeResult else is running');
      //   this.$store.commit('setBasemap', 'pwd');
      // }
    },
    picOrCycloActive(value) {
      this.$nextTick(() => {
        if (this.mapType === 'leaflet') {
          this.$store.map.invalidateSize();
        } else if (this.mapType === 'mapbox') {
          this.$store.map.resize();
        }
      });
    },
    geojsonForTopic(nextGeojson) {
      if (this.$store.map) {
        console.log('watch geojsonForTopic is running, map.getStyle():', this.$store.map.getStyle(), 'map.getStyle().layers:', this.$store.map.getStyle().layers, 'nextGeojson:', nextGeojson);
      }
      if (nextGeojson[0]) {
        // console.log('watch geojsonParcels is running, nextGeojson:', nextGeojson, 'nextGeojson[0].geojson:', nextGeojson[0].geojson);
        this.$data.geojsonForTopicSource.data.geometry.coordinates = nextGeojson[0].geojson.geometry.coordinates;
        this.$data.geojsonForTopicBoolean = true;
      } else {
        this.$data.geojsonForTopicSource.data.geometry.coordinates = [];
        this.$data.geojsonForTopicBoolean = false;
      }
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
      console.log('watch geojsonParcels is firing');
      if (this.$store.map) {
        // console.log('watch geojsonParcels is running, nextGeojson:', nextGeojson, 'map.getStyle():', this.$store.map.getStyle(), 'map.getStyle().layers:', this.$store.map.getStyle().layers);
      }
      if (nextGeojson[0]) {
        // console.log('watch geojsonParcels is running, nextGeojson:', nextGeojson, 'nextGeojson[0].geojson:', nextGeojson[0].geojson);
        this.$data.geojsonParcelSource.data.geometry.coordinates = nextGeojson[0].geojson.geometry.coordinates;
      } else {
        this.$data.geojsonParcelSource.data.geometry.coordinates = [];
      }
      // console.log('watch geojsonParcels is still running');
      let czts = this.activeTopicConfig.zoomToShape;
      let dzts = this.$data.zoomToShape;
      if (!czts || !czts.includes('geojsonParcels')) {
        dzts.geojsonParcels = [];
        return;
      }
      dzts.geojsonParcels = nextGeojson;
      this.checkBoundsChanges();
    },
    // reactiveGeojsonFeatures(nextReactiveGeojsonFeatures) {
    //   if (nextReactiveGeojsonFeatures[0]) {
    //     console.log('watch reactiveGeojsonFeatures is running, nextReactiveGeojsonFeatures:', nextReactiveGeojsonFeatures, 'nextReactiveGeojsonFeatures[0].geojson:', nextReactiveGeojsonFeatures[0].geojson);
    //     // this.geojsonParcelSource.data = nextGeojson[0].geojson;
    //     this.$data.geojsonReactiveSource.data.geometry.coordinates = nextReactiveGeojsonFeatures[0].geojson.geometry.coordinates;
    //   } else {
    //     this.$data.geojsonReactiveSource.data.geometry.coordinates = [];
    //   }
    // },

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
        if (this.mapType === 'leaflet') {
          this.$store.map.invalidateSize();
        } else if (this.mapType === 'mapbox') {
          this.$store.map.resize();
        }
      });
    },
    fullScreenMapEnabled() {
      this.$nextTick(() => {
        if (this.mapType === 'mapbox') {
          this.$store.map.resize();
        }
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
        4326,
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
    shouldShowRasterLayer(layerId) {
      if (!this.$store.map) {
        return false;
      }
      let value = true;
      if (this.$config.map.tiles === 'hosted') {
        value = false;
      }
      let before;
      if (this.activeTopicConfig.dynamicMapLayers && this.activeTopicConfig.dynamicMapLayers.length) {
        before = this.activeTopicConfig.dynamicMapLayers[this.activeTopicConfig.dynamicMapLayers.length-1];
      }

      let beforeExists = [];
      if (this.$store.map && this.$store.map.getStyle()) {
        beforeExists = this.$store.map.getStyle().layers.filter(function(layer) {
          return layer.id === before;
        });
      }
      if (before && !beforeExists.length) {
        value = false;
      }
      // console.log('shouldShowRasterLayer is running, layerId:', layerId, 'before:', before, 'value:', value);
      return value;
    },
    useGenerateUniqueId() {
      return generateUniqueId();
    },
    handleCycloChanges() {
      const halfAngle = this.cycloHFov / 2.0;
      let angle1 = this.cycloRotationAngle - halfAngle;
      let angle2 = this.cycloRotationAngle + halfAngle;
      // console.log('handleCycloChanges, halfAngle:', halfAngle, 'angle1:', angle1, 'this.cycloRotationAngle:', this.cycloRotationAngle, 'angle2:', angle2);

      let distance;
      if (this.$data.watchedZoom < 9) {
        distance = 2000 * (21 - this.$data.watchedZoom);
      } else if (this.$data.watchedZoom < 10) {
        distance = 1000 * (21 - this.$data.watchedZoom);
      } else if (this.$data.watchedZoom < 11) {
        distance = 670 * (21 - this.$data.watchedZoom);
      } else if (this.$data.watchedZoom < 12) {
        distance = 420 * (21 - this.$data.watchedZoom);
      } else if (this.$data.watchedZoom < 13) {
        distance = 270 * (21 - this.$data.watchedZoom);
      } else if (this.$data.watchedZoom < 14) {
        distance = 150 * (21 - this.$data.watchedZoom);
      } else if (this.$data.watchedZoom < 15) {
        distance = 100 * (21 - this.$data.watchedZoom);
      } else if (this.$data.watchedZoom < 16) {
        distance = 55 * (21 - this.$data.watchedZoom);
      } else if (this.$data.watchedZoom < 17) {
        distance = 30 * (21 - this.$data.watchedZoom);
      } else if (this.$data.watchedZoom < 18) {
        distance = 25 * (21 - this.$data.watchedZoom);
      } else if (this.$data.watchedZoom < 20.4) {
        distance = 15 * (21 - this.$data.watchedZoom);
      } else {
        distance = 10;
      }

      console.log('handleCycloChanges is running, this.$data.watchedZoom:', this.$data.watchedZoom, 'distance:', distance);
      let options = { units: 'feet' };

      if (!this.cycloLatlng) {
        return;
      }

      var destination1 = destination([ this.cycloLatlng[1], this.cycloLatlng[0] ], distance, angle1, options);
      var destination2 = destination([ this.cycloLatlng[1], this.cycloLatlng[0] ], distance, angle2, options);
      // console.log('cyclocenter:', [this.cycloLatlng[1], this.cycloLatlng[0]], 'destination1:', destination1.geometry.coordinates, 'destination2:', destination2.geometry.coordinates);
      // console.log('destination1:', destination1.geometry.coordinates, 'destination2:', destination2.geometry.coordinates);

      this.$data.geojsonViewconeSource.data.geometry.coordinates = [
        [
          [ this.cycloLatlng[1], this.cycloLatlng[0] ],
          [ destination1.geometry.coordinates[0], destination1.geometry.coordinates[1] ],
          [ destination2.geometry.coordinates[0], destination2.geometry.coordinates[1] ],
          [ this.cycloLatlng[1], this.cycloLatlng[0] ],
        ],
      ];
    },
    handleCyclomediaButtonClick(e) {
      // console.log('handleCyclomediaButtonClick is running');
      if (!this.cyclomediaInitializationBegun) {
        this.$store.commit('setCyclomediaInitializationBegun', true);
      }
      const willBeActive = !this.$store.state.cyclomedia.active;

      this.$store.commit('setCyclomediaActive', willBeActive);

      if (this.isMobileOrTablet) {
        // console.log('isMobileOrTablet is true');
        if (this.$store.state.pictometry.active) {
          this.$store.commit('setPictometryActive', false);
        }
      }
    },
    handlePictometryButtonClick(e) {
      // console.log('handlePictometryButtonClick is running');
      this.$store.commit('setPictometryActive', !this.$store.state.pictometry.active);

      if (this.isMobileOrTablet) {
        // console.log('isMobileOrTablet is true');
        if (this.$store.state.cyclomedia.active) {
          this.$store.commit('setCyclomediaActive', false);
        }
      }
    },
    onMapLoaded(event) {
      // this.$store.commit('setMap', map);
      this.$store.map = event.map;
      event.map.resize();
    },
    handleBasemapToggleClick() {
      console.log('handleBasemapToggleClick, this.$store.map.getStyle().layers:', this.$store.map.getStyle().layers);
      const prevShouldShowBasemapSelectControl = this.$store.state.map.shouldShowBasemapSelectControl;
      const nextShouldShowBasemapSelectControl = !prevShouldShowBasemapSelectControl;
      this.$store.commit('setShouldShowBasemapSelectControl', nextShouldShowBasemapSelectControl);
    },

    handleSearchFormSubmit(value) {
      console.log('MapPanel.vue handleSearchFormSubmit is running');
      this.$controller.handleSearchFormSubmit(value);
    },
    checkBoundsChanges() {
      console.log('checkBoundsChanges is running');
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
      console.log('setMapToBounds is running');
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
        console.log('bounds:', bounds);
        if (this.mapType === 'leaflet') {
          this.$store.commit('setMapBounds', bounds);
        } else if (this.mapType === 'mapbox') {
          let bounds2 = [[ bounds._southWest.lng, bounds._southWest.lat ], [ bounds._northEast.lng, bounds._northEast.lat ]];
          this.$store.commit('setMapBounds', bounds2);
        }
      }
    },
    configForBasemap(basemap) {
      return this.$config.map.basemaps[basemap] || {};
    },
    shouldShowGeojson(key) {
      let value;
      if (this.activeTopicConfig.basemap === 'pwd') {
        value = true;
      } else {
        value = key === this.activeDorParcel;
      }
      console.log('shouldShowGeojson is running, key:', key, 'this.activeDorParcel:', this.activeDorParcel, 'value:', value);
      return value;
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
      let drawMode = this.$data.draw.mode;
      let drawLayers = this.$store.map.queryRenderedFeatures(e.mapboxEvent.point).filter(feature => [ 'mapbox-gl-draw-cold', 'mapbox-gl-draw-hot' ].includes(feature.source));
      console.log('MapPanel.vue handleMapClick, drawLayers:', drawLayers, 'drawMode:', drawMode, 'e:', e, 'this.$store.map.getStyle():', this.$store.map.getStyle(), 'this.$store.state.drawStart:', this.$store.state.drawStart);

      if (!drawLayers.length && drawMode !== 'draw_polygon') {
        this.$controller.handleMapClick(e);
      }
      if (drawMode === 'draw_polygon') {
        this.getDrawDistances(e);
      }
    },
    deleteDrawDistances(shapeId) {
      // console.log('deleteDrawDistances is running, shapeId:', shapeId);
      // let shapeId = e.features[0].id;
      let index = this.$data.draw.labelLayers.indexOf(this.$data.draw.labelLayers.filter(set => set.id === shapeId)[0]);
      // console.log('deleteDrawDistances is running, index:', index);
      this.$data.draw.labelLayers.splice(index, 1);
      this.$data.draw.selection = null;
    },
    getDrawDistances(e) {
      // console.log('start of getDrawDistances, e:', e);
      let draw = this.$store.state.draw;
      let data = draw.getAll();
      let coordinates, lastClick, shapeId;
      if (e.mapboxEvent) { // if getDrawDistances was called by handleMapClick
        lastClick = e.mapboxEvent.point;
        shapeId = draw.getFeatureIdsAt(lastClick)[0];
        if (!shapeId) {
          shapeId = data.features[data.features.length-1].id;
        }
        // console.log('in if e.mapboxEvent, shapeId:', shapeId);
      } else if (e.features.length) { // if getDrawDistances was called a draw event firing
        shapeId = e.features[0].id;
        // console.log('in else if, shapeId:', shapeId);
      }

      this.$data.draw.currentShape = shapeId;
      let feature;
      // console.log('shapeId:', shapeId, 'draw.getSelectedIds():', draw.getSelectedIds());
      if (shapeId) {
        feature = data.features.filter(feature => feature.id === shapeId)[0];
        // console.log('if shapeId:', shapeId, 'feature:', feature);
        if (feature.geometry.type === 'LineString') {
          coordinates = feature.geometry.coordinates;
        } else {
          coordinates = feature.geometry.coordinates[0];
        }
      } else {
        feature = data.features[data.features.length-1];
        // console.log('else (no shapeId), feature.id:', feature.id, 'feature:', feature);
        if (feature.geometry.type === 'LineString') {
          coordinates = feature.geometry.coordinates;
        } else {
          coordinates = feature.geometry.coordinates[0];
        }
      }
      // console.log('middle of getDrawDistances, draw:', draw, 'shapeId:', shapeId, 'e:', e, 'mode is draw_polygon, data:', data, 'coordinates:', coordinates);

      // mapbox-gl-draw duplicates the points of a polygon in a way that has to be accounted for;
      if (e.mapboxEvent) {
        // console.log('if e.mapboxEvent is running');
        coordinates.splice(coordinates.length-2, 1);
      }
      if (feature.geometry.type === 'LineString') {
        // coordinates.pop();
        coordinates.splice(0, 1);
      }

      console.log('coordinates:', coordinates);
      if (coordinates.length >=4) {
        const thePolygon = polygon([ coordinates ]);
        const theArea = area(thePolygon);
        this.$data.draw.currentArea = theArea.toFixed(2) + ' Sq Feet';
      }

      let i;
      let distancesArray = [];
      let features = [];
      for (i=0; i<coordinates.length; i++) {
        console.log('loop, i:', i, 'coordinates[i][0]', coordinates[i][0], 'i+1:', i+1, 'coordinates.length:', coordinates.length, 'coordinates:', coordinates);
        let distVal = 0;
        let lastDistVal = null;
        let midPoint = [];
        let allVal = [];

        let coord2;
        if (coordinates[i+1]) {
          coord2 = coordinates[i+1];
        } else {
          coord2 = coordinates[0];
        }

        // console.log('MapPanel.vue in getDrawDistances, coordinates:', coordinates, 'coord2:', coord2);
        distVal = parseFloat((distance(coordinates[i], coord2, { units: 'miles' }) * 5280).toFixed(2));
        // distVal = distance(coordinates[i], coord2, { units: 'miles' }) * 5280;

        if (coordinates[i-1]) {
          lastDistVal = parseFloat((distance(coordinates[i-1], coordinates[i], { units: 'miles' }) * 5280).toFixed(2));
          // lastDistVal = distance(coordinates[i-1], coordinates[i], { units: 'miles' }) * 5280;
        }
        // console.log('distVal:', distVal, 'lastDistVal:', lastDistVal);

        allVal = {
          firstPoint: [ parseFloat(coordinates[i][0].toFixed(5)), parseFloat(coordinates[i][1].toFixed(5)) ],
          midPoint: midPoint,
          distance: lastDistVal,
        };
        distancesArray.push(allVal);
        // console.log('allVal:', allVal, 'distancesArray:', distancesArray);

        if (e.mapboxEvent && coordinates[i][0] !== coord2[0] && i < coordinates.length-2) {
          midPoint = midpoint(coordinates[i], coord2).geometry.coordinates;
          features.push(
            {
              'type': 'Feature',
              'properties': {
                'description': distVal,
              },
              'geometry': {
                'type': 'Point',
                'coordinates': midPoint,
              },
            },
          );
        }
        if (!e.mapboxEvent && coordinates[i][0] !== coord2[0] && i < coordinates.length-1) {
          midPoint = midpoint(coordinates[i], coord2).geometry.coordinates;
          features.push(
            {
              'type': 'Feature',
              'properties': {
                'description': distVal,
              },
              'geometry': {
                'type': 'Point',
                'coordinates': midPoint,
              },
            },
          );
        }

        if (e.mapboxEvent && i === coordinates.length-2) {
          // console.log('quitting loop: triggered by click and', i, " = ", coordinates.length-2);
          break;
        }
      } // end of loop

      console.log('near end of getDrawDistances, distancesArray.length:', distancesArray.length, 'distancesArray:', distancesArray, 'features:', features);

      if (distancesArray.length) {
        let theSet = {};
        if (shapeId) {
          // console.log('if inside if is running, distancesArray[distancesArray.length-1].distance:', distancesArray[distancesArray.length-1].distance, 'distancesArray:', distancesArray);
          theSet = {
            id: shapeId,
            'distances': distancesArray,
            'source': {
              type: 'geojson',
              data: {
                'type': 'FeatureCollection',
                'features': [],
              },
            },
            'layer': {
              'id': shapeId,
              'type': 'symbol',
              'source': shapeId,
              'paint': {
                'text-color': 'red',
              },
              'layout': {
                'text-size': 12,
                'text-font': [ 'Open Sans Regular' ],
                'text-field': [ 'get', 'description' ],
                'text-variable-anchor': [ 'center' ],
                'text-radial-offset': 0.5,
                'text-justify': 'center',
              },
            },
          };

          let location = this.$data.draw.labelLayers.filter(set => set.id === shapeId)[0];
          // console.log('first try on location:', location);

          if (!location) {
            this.$data.draw.labelLayers.push(theSet);
            location = this.$data.draw.labelLayers.filter(set => set.id === shapeId)[0];
            // console.log('second try on location:', location);
          }
          location.distances = distancesArray;
          location.source.data.features = features;
        }
      }
      if (!e.mapboxEvent) {
        this.$data.draw.currentShape = null;
      }
    },
    handleDrawModeChange(e) {
      console.log('handleDrawModeChange is running, e:', e, 'e.mode:', e.mode, 'this.$store.map.getStyle():', this.$store.map.getStyle());
      this.$data.draw.mode = e.mode;
      let currentShape = this.$data.draw.currentShape;

      if (e.mode === 'simple_select' && currentShape) {
        this.handleDrawFinish();
      }
    },
    handleDrawCancel(e) {
      // this.$data.draw.mode = 'simple_select';
      let shapeId = this.$data.draw.currentShape;
      console.log('MapPanel.vue handleDrawCancel is running, shapeId:', shapeId);
      if (shapeId) {
        let index = this.$data.draw.labelLayers.indexOf(this.$data.draw.labelLayers.filter(set => set.id === shapeId)[0]);
        this.$data.draw.labelLayers.splice(index, 1);
        this.$data.draw.selection = null;
        this.$data.draw.currentShape = null;
        this.$store.state.draw.trash();
      }
      this.$store.state.draw.changeMode('simple_select');
    },
    handleDrawFinish(e) {
      let currentShape = this.$data.draw.currentShape;
      // let currentPoints = [];
      let fetchedPoints = this.$data.draw.labelLayers.filter(set => set.id === currentShape)[0].distances;
      console.log('MapPanel.vue handleDrawFinish 1 is running, this.$store.state.draw.getMode():', this.$store.state.draw.getMode(), 'currentShape:', currentShape, 'fetchedPoints:', fetchedPoints);

      let currentPoints = [];
      for (let point of fetchedPoints) {
        console.log('in loop, point:', point, 'point.firstPoint:', point.firstPoint);
        currentPoints.push(point.firstPoint);
      }
      if (currentPoints.length > 1) {
        currentPoints.push(fetchedPoints[0].firstPoint);
      }

      if (fetchedPoints.length > 2) {
        this.$store.state.draw.changeMode('simple_select');
        this.$data.draw.mode = 'simple_select';
      } else if (fetchedPoints.length === 2) {
        this.$store.state.draw.delete(currentShape);
        this.$store.state.draw.changeMode('draw_line_string');

        let geojson = {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': currentPoints,
          },
          'id': currentShape,
          'properties': {},
        };
        this.$store.state.draw.add(geojson);
        this.$store.state.draw.changeMode('simple_select');
        this.$data.draw.mode = 'simple_select';
      } else if (fetchedPoints.length === 1 ) {
        this.$store.state.draw.delete(currentShape);
        this.$store.state.draw.changeMode('draw_point');

        let geojson = {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': currentPoints[0],
          },
          'id': currentShape,
          'properties': {},
        };
        this.$store.state.draw.add(geojson);
        this.$store.state.draw.changeMode('simple_select');
        this.$data.draw.mode = 'simple_select';
      } else {
        this.$store.state.draw.trash();
        this.handleDrawCancel();
      }

      console.log('MapPanel.vue handleDrawFinish 2 is running, this.$store.state.draw.getMode():', this.$store.state.draw.getMode(), 'currentShape:', currentShape, 'fetchedPoints:', fetchedPoints);

    },
    handleDrawSelectionChange(e) {
      let draw = this.$store.state.draw;
      let val = draw.getSelectedIds();
      // console.log('handleDrawSelectionChange, e:', e, 'val:', val);
      this.$data.draw.selection = val;
    },
    handleMapMove(e) {
      const map = this.$store.map;
      console.log('handleMapMove, this.$store.map.getStyle():', this.$store.map.getStyle());
      //       const canvas = map.getCanvas();
      //       const w = canvas.width;
      //       const h = canvas.height;
      //       const cUL = map.unproject ([ 0,0 ]).toArray();
      //       const cUR = map.unproject ([ w,0 ]).toArray();
      //       const cLR = map.unproject ([ w,h ]).toArray();
      //       const cLL = map.unproject ([ 0,h ]).toArray();
      //       const coordinates = [ cUL,cUR,cLR,cLL ];
      //       const url = '\
      // https://gis-svc.databridge.phila.gov/arcgis/rest/services/Atlas/ZoningMap/MapServer/export?dpi=130\
      // &transparent=true\
      // &format=png36\
      // &bbox=' + cLL[0] + ',' + cLL[1] + ',' + cUR[0] + ',' + cUR[1] + '\
      // &bboxSR=4326\
      // &imageSR=3857\
      // &size=' + w + ',' + h + '\
      // &f=image\
      //       ';
      // const boundingbox = [ cLL[0], cLL[1], cUR[0], cUR[1] ];
      // this.$data.overlaySources.zoning.source.coordinates = coordinates;
      // this.$data.overlaySources.zoning.source.url = url;
      // console.log('handleMapMove is running, map:', map, 'w:', w, 'h:', h, 'this.$store.map.getBounds():', this.$store.map.getBounds(), 'coordinates:', coordinates, 'map.getZoom():', map.getZoom());

      const pictometryConfig = this.$config.pictometry || {};

      const center = map.getCenter();
      const { lat, lng } = center;
      const coords = [ lng, lat ];

      const zoom = map.getZoom();
      this.$data.watchedZoom = zoom;

      if (pictometryConfig.enabled) {
        // update state for pictometry
        this.$store.commit('setPictometryMapCenter', coords);
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

<style>
  .mapboxgl-ctrl {
    z-index: 12000;
  }

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

  @media screen and (max-width: 46.875em) {
    .map-panel-true {
      height: 400px;
    }
  }

  .top-button-1 {
    top: 0px;
  }

  .top-button-2 {
    top: 46px;
  }

  .top-button-3 {
    top: 92px;
  }

</style>
