<template>
  <img :src="slots.source" />
  <!-- <div>{{ evaluateSlot(slots.source) }}</div> -->
</template>

<script>
import TopicComponent from './TopicComponent';

  export default {
    mixins: [TopicComponent]
  };
</script>

<style scoped>
</style>
