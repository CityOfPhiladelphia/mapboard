<template>
  <div class="callout">
    <p>{{ evaluateSlot(slots.text) }}</p>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent';

  export default {
    mixins: [TopicComponent]
  };
</script>

<style scoped>
</style>
