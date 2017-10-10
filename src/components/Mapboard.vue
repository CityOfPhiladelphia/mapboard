<template>
  <div class="mb-root row collapse"
       id="mb-root"
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
                         :apiKey="this.ak"
                         :secretKey="this.sk"
      >
      <!-- :apiKey="this.$config.pictometry.apiKey"
      :secretKey="this.$config.pictometry.secretKey" -->
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
  import TopicPanel from './TopicPanel.vue';
  import MapPanel from './map-panel/MapPanel.vue';
  import CyclomediaWidget from '../cyclomedia/Widget.vue';
  import PictometryWidget from '../pictometry/Widget.vue';
  import Layer from '../pictometry/Layer.vue';
  import ViewCone from '../pictometry/ViewCone.vue';
  import PngMarker from '../pictometry/PngMarker.vue';

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
    // created() {
    //   console.log('MAPBOARD.VUE CREATED', this.$config);
    //   let tables = {};
    //   for (let topic of this.$config.topics) {
    //     for (let component of topic.components) {
    //       if (component.type === 'horizontal-table') {
    //         // console.log('topic:', topic.label, component.type, component.slots.title);
    //         const tableName = topic.key + '_' + component.options.id
    //         tables[tableName] = null
    //       }
    //       else if (component.type === 'tab-group' || component.type === 'table-group') {
    //         for (let innerComponent of component.options.components) {
    //           if (innerComponent.type === 'horizontal-table') {
    //             // console.log('topic:', topic.label, component.type, innerComponent.type, innerComponent.slots.title);
    //             const tableName = topic.key + '_' + innerComponent.options.id
    //             tables[tableName] = null
    //           }
    //         }
    //       }
    //     }
    //   }
    //   this.$store.commit('setTables', tables);
    // },
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
      },
      ak() {
        const host = window.location.hostname;
        if (host === 'atlas.phila.gov') {
          return this.$config.pictometry.apiKey;
        }
        if (host === 'atlas-dev.phila.gov') {
          return this.$config.pictometryDev.apiKey;
        }
        if (host === 'cityatlas.phila.gov') {
          return this.$config.pictometryCity.apiKey;
        }
        if (host === 'cityatlas-dev.phila.gov') {
          return this.$config.pictometryCityDev.apiKey;
        }
        if (host === '10.8.101.67') {
          return this.$config.pictometryLocal.apiKey;
        }
      },
      sk() {
        const host = window.location.hostname;
        if (host === 'atlas.phila.gov') {
          return this.$config.pictometry.secretKey;
        }
        if (host === 'atlas-dev.phila.gov') {
          return this.$config.pictometryDev.secretKey;
        }
        if (host === 'cityatlas.phila.gov') {
          return this.$config.pictometryCity.secretKey;
        }
        if (host === 'cityatlas-dev.phila.gov') {
          return this.$config.pictometryCityDev.secretKey;
        }
        if (host === '10.8.101.67') {
          return this.$config.pictometryLocal.secretKey;
        }
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
    }
  }

  @media (min-width: 1024px) {
    .mb-root {
    }
  }

  .mb-panel {
    height: 100%;
  }

  .mb-panel-topics-with-widget {
    height: 50%;
  }
</style>
