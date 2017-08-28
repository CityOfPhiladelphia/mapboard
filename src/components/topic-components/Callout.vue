<template>
  <div class="callout">
    <p>{{ evaluateSlot(slots.text) }}</p>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent.vue';

  export default {
    mixins: [TopicComponent]
  };
</script>

<style scoped>

.callout {
  position: inherit;
}
</style>
