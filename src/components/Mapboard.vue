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
  /*don't highlight any form elements*/
  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }

  .mb-root {
    height: 500px;
  }

  .mb-panel {
    height: 100%;
  }
</style>
