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
  import generateUniqueId from '../util/unique-id';
  import Badge from './topic-components/Badge.vue';
  import Callout from './topic-components/Callout.vue';
  import CollectionSummary from './topic-components/CollectionSummary.vue';
  import HorizontalTable from './topic-components/HorizontalTable.vue';
  import Image_ from './topic-components/Image.vue';
  import VerticalTable from './topic-components/VerticalTable.vue';
  import OverlayToggleGroup from './topic-components/OverlayToggleGroup.vue';
  import List from './topic-components/List.vue';
  import TabGroup from './topic-components/TabGroup.vue';
  import HorizontalTableGroup from './topic-components/HorizontalTableGroup.vue';
  import BadgeCustom from './topic-components/BadgeCustom.vue';
  // console.log('in TopicComponentGroup.vue script, Badge:', Badge, 'TabGroup:', TabGroup, 'Callout:', Callout, 'CollectionSummary:', CollectionSummary, 'HorizontalTable:', HorizontalTable);

  export default {
    name: 'TopicComponentGroup',
    props: ['topicComponents', 'item', 'filterData'],
    components: {
      Badge,
      Callout,
      CollectionSummary,
      HorizontalTable,
      Image_,
      VerticalTable,
      OverlayToggleGroup,
      List,
      TabGroup,
      HorizontalTableGroup,
      BadgeCustom,
    },
    beforeCreate() {
      // console.log('TopicComponentGroup beforeCreate is running');
    },
    created() {
      // console.log('TopicComponentGroup.vue created is running, Badge:', Badge, 'topicComponents:', this.$props.topicComponents);
    },
    data() {
      return {
        // generate a (basically) unique id for the group. the go-to npm packages
        // for uuid generation aren't available as umd builds on unpkg and
        // therefore won't work with the examples. this is good enough :)
        key: generateUniqueId()
      };
    },
    methods: {
      getCompKey(compGroupKey, compIndex) {
        return `topic-comp-${compGroupKey}-${compIndex}`;
      }
    }
  };
</script>

<style scoped>
  .topic-component {
    margin-bottom: 10px !important;
  }
</style>
