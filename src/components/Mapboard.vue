<template>
  <div class="row collapse"
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
      />
    </map-panel>
  </div>
</template>

<script>
  import TopicPanel from './TopicPanel';
  import MapPanel from './MapPanel';
  import CyclomediaWidget from '../cyclomedia/Widget';
  import PictometryWidget from '../pictometry/Widget';

  export default {
    components: {
      TopicPanel,
      MapPanel,
      CyclomediaWidget,
      PictometryWidget,
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

  /*.mb-root {
    height: 600px;
  }*/

  .mb-panel {
    height: 100%;
  }

  .mb-panel-topics-with-widget {
    height: 50%;
  }
</style>
