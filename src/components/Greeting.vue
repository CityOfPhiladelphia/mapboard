<template>
  <div class="mb-panel-topics-greeting">
    <div class="columns medium-18 medium-centered">
      <!-- <div class="callout">
        <p>To start your search, type an address into the search box or click anywhere on the map.</p>
      </div> -->
      <component v-for="(topicComp, topicCompIndex) in this.components"
                 :is="topicComp.type"
                 class="topic-comp"
                 :slots="topicComp.slots"
                 :key="'greeting'"
      />
    </div>
  </div>
</template>

<script>
  // TODO find a less explicit way of importing everything
  import Badge from './topic-components/Badge';
  import HorizontalTable from './topic-components/HorizontalTable';
  import VerticalTable from './topic-components/VerticalTable';
  import Callout from './topic-components/Callout';
  import Image_ from './topic-components/Image';

  export default {
    components: {
      Image_
    },
    computed: {
      components() {
        return this.$config.greeting.components;
      }
    }
  };
</script>

<style scope>
  .mb-panel-topics-greeting {
    padding-top: 20px;
  }
</style>
