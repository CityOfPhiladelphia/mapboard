<template>
  <div class="row collapse mb-root">
    <TopicPanel />
    <MapPanel />
  </div>
</template>

<script>
  import TopicPanel from './TopicPanel';
  import MapPanel from './MapPanel';

  export default {
    components: {
      TopicPanel,
      MapPanel
    }
  };
</script>

<style>
  .mb-root {
    height: 500px;
  }

  .mb-panel {
    height: 100%;
  }
</style>
