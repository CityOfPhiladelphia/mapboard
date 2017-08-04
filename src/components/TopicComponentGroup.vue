<template>
  <div>
    <!-- :compFilterData="filterData" -->
    <component v-for="(comp, compIndex) in topicComponents"
               :is="comp.type"
               class="topic-component"
               :slots="comp.slots"
               :options="comp.options"
               :item="item"
               :key="getCompKey(key, compIndex)"
    />
  </div>
</template>

<script>
  import Badge from './topic-components/Badge';
  import Callout from './topic-components/Callout';
  import CollectionSummary from './topic-components/CollectionSummary';
  import HorizontalTable from './topic-components/HorizontalTable';
  import Image_ from './topic-components/Image';
  import VerticalTable from './topic-components/VerticalTable';
  import OverlayToggleGroup from './topic-components/OverlayToggleGroup';

  export default {
    props: ['topicComponents', 'item', 'filterData'],
    components: {
      Badge,
      Callout,
      CollectionSummary,
      HorizontalTable,
      Image_,
      VerticalTable,
      OverlayToggleGroup,
    },
    beforeCreate() {
      // TabGroup imports TopicComponentGroup, which causes a circular
      // reference issue in webpack. so register the component here.
      this.$options.components.TabGroup = require('./topic-components/TabGroup.vue');
      this.$options.components.TableGroup = require('./topic-components/TableGroup.vue');
    },
    data() {
      return {
        // generate a (basically) unique id for the group. the go-to npm packages
        // for uuid generation aren't available as umd builds on unpkg and
        // therefore won't work with the examples. this is good enough :)
        key: Math.random().toString(36).substring(7)
      };
    },
    methods: {
      getCompKey(compGroupKey, compIndex) {
        return `topic-comp-${compGroupKey}-${compIndex}`;;
      }
    }
  };
</script>

<style scoped>
  .topic-component {
    margin-bottom: 20px !important;
  }
</style>
