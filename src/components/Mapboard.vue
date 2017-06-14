<template>
  <div class="mb-root row collapse"
       :style="this.$config.rootStyle"
  >
    <topic-panel>
    </topic-panel>
    <map-panel>
      <cyclomedia-widget v-if="this.$config.cyclomedia.enabled"
                         slot="cycloWidget"
                         v-show="cyclomediaActive"
      />
      <pictometry-widget v-if="this.$config.pictometry.enabled"
                         slot="pictWidget"
                         v-show="pictometryActive"
                         :apiKey="this.$config.pictometry.apiKey"
                         :secretKey="this.$config.pictometry.secretKey"
      >
        <png-marker v-if="this.pictometryShowAddressMarker"
                :latlng="[this.geocodeData.geometry.coordinates[1], this.geocodeData.geometry.coordinates[0]]"
                :icon="'markers.png'"
                :height="60"
                :width="40"
                :offsetX="0"
                :offsetY="0"
        />
        <layer v-if="this.pictometryActive"
        />
        <png-marker v-if="this.cyclomediaActive && this.pictometryActive"
                :latlng="[this.$store.state.cyclomedia.viewer.props.orientation.xyz[1], this.$store.state.cyclomedia.viewer.props.orientation.xyz[0]]"
                :icon="'camera2.png'"
                :height="20"
                :width="30"
                :offsetX="-2"
                :offsetY="-2"
        />
        <!-- :icon="'../assets/camera.png'" -->
        <view-cone v-if="this.cyclomediaActive && this.pictometryActive"
                   :orientation="this.$store.state.cyclomedia.viewer.props.orientation"
        />
      </pictometry-widget>
      <!-- :center="this.$store.state.map.map.center" -->
    </map-panel>
  </div>
</template>

<script>
  import TopicPanel from './TopicPanel';
  import MapPanel from './map-panel/MapPanel';
  import CyclomediaWidget from '../cyclomedia/Widget';
  import PictometryWidget from '../pictometry/Widget';
  import Layer from '../pictometry/Layer';
  import ViewCone from '../pictometry/ViewCone';
  import PngMarker from '../pictometry/PngMarker';

  export default {
    components: {
      TopicPanel,
      MapPanel,
      CyclomediaWidget,
      PictometryWidget,
      Layer,
      ViewCone,
      PngMarker
    },
    computed: {
      cyclomediaActive() {
        return this.$store.state.cyclomedia.active
      },
      pictometryActive() {
        return this.$store.state.pictometry.active
      },
      pictometryZoom() {
        return this.$store.state.pictometry.zoom
      },
      pictometryShowAddressMarker() {
        if (!this.pictometryActive || !this.geocodeData) {
          return false;
        } else if (this.pictometryZoom < 20 && this.cyclomediaActive) {
          return false;
        } else {
          return true;
        }
      },
      geocodeData() {
        return this.$store.state.geocode.data
      }
    },
    watch: {
      pictometryShowAddressMarker(nextValue) {
        console.log('watch pictometryShowAddressMarker', nextValue);
      }
    }
  };
</script>

<style>
  /*don't highlight any form elements*/
  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }

  @media (min-width: 1024px) {
    .mb-root {
      height: 600px;
    }
  }

  @media (min-width: 1024px) {
    .mb-root {
      height: 600px;
    }
  }

  .mb-panel {
    height: 100%;
  }

  .mb-panel-topics-with-widget {
    height: 50%;
  }
</style>
