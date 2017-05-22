<template>
  <div>
    <component v-for="(topicComp, topicCompIndex) in components"
               :is="topicComp.type"
               class="topic-component"
               :slots="topicComp.slots"
               :options="topicComp.options"
               :key="`topic-component-${this.$key}-${topicCompIndex}`"
    />
  </div>
</template>

<script>
  import Badge from './topic-components/Badge';
  import HorizontalTable from './topic-components/HorizontalTable';
  import VerticalTable from './topic-components/VerticalTable';
  import Callout from './topic-components/Callout';
  import Image_ from './topic-components/Image';
  import CollectionSummary from './topic-components/CollectionSummary';
  import TabGroup from './topic-components/TabGroup';

   export default {
     props: ['components'],
     components: {
       Badge,
       HorizontalTable,
       VerticalTable,
       Callout,
       Image_,
       CollectionSummary,
       TabGroup,
     },
     created() {
       // generate a (basically) unique id for the group. the go-to npm packages
       // for uuid generation aren't available as umd builds on unpkg and
       // therefore won't work with the examples. this is good enough :)
       this.$key = Math.random().toString(36).substring(7);
     }
   };
</script>

<style scoped>
  .topic-component {
    margin-bottom: 10px;
  }
</style>
