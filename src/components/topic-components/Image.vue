<template>
  <img :src="slots.source" />
</template>

<script>
import TopicComponent from './TopicComponent.vue';

  export default {
    mixins: [TopicComponent]
  };
</script>

<style scoped>
  img {
    display: block;
    margin: 0 auto;
  }
</style>
