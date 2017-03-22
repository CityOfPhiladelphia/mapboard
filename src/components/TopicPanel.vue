<template>
  <div class="large-12 columns mb-panel mb-panel-topics">
    <h1>1234 Market St</h1>
    <Topic v-for="topic in this.$config.topics"
           :topicKey="topic.key"
           :key="topic.key"
    />
  </div>
</template>

<script>
  import Topic from './Topic';

  export default {
    components: { Topic }
  };
</script>

<style>
  .mb-panel-topics {
    background: #fff;
    padding-left: 12px !important;
    padding-right: 12px !important;
    overflow: auto;
  }
</style>
