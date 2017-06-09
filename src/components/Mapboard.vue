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
        <layer v-if="this.pictometryActive"
        />
        <camera v-if="this.cyclomediaActive && this.pictometryActive"
                :orientation="this.$store.state.cyclomedia.viewer.props.orientation.xyz"
        />
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
  import Camera from '../pictometry/Camera';

  export default {
    components: {
      TopicPanel,
      MapPanel,
      CyclomediaWidget,
      PictometryWidget,
      Layer,
      ViewCone,
      Camera
    },
    computed: {
      cyclomediaActive() {
        return this.$store.state.cyclomedia.active
      },
      pictometryActive() {
        return this.$store.state.pictometry.active
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
